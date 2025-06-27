import streamlit as st
from utils import graph
from utils.streamlit import assets, render, b64_image
from uuid import uuid4
from langgraph.types import Command
from datetime import datetime
from pathlib import Path

# Initialize session state
if "user_id" not in st.session_state:
    st.session_state.user_id = uuid4().hex
if "messages" not in st.session_state:
    st.session_state.messages = []
if "is_processing" not in st.session_state:
    st.session_state.is_processing = False
if "pending_interrupt" not in st.session_state:
    st.session_state.pending_interrupt = False
if "interrupt_query" not in st.session_state:
    st.session_state.interrupt_query = ""


# Function to get detailed timestamp
def get_timestamp():
    now = datetime.now()
    return now.strftime("%I:%M %p • %b %d, %Y")


# Streamlit app configuration
st.set_page_config(
    page_title="LangGraph Chatbot", layout="wide", initial_sidebar_state="collapsed"
)
# Configure LangGraph
config = {"configurable": {"thread_id": st.session_state.user_id}}


# Enhanced CSS for ChatGPT-like interface
CSS_PATH = "./utils/streamlit/style.css"

if Path(CSS_PATH).is_file():
    with open(CSS_PATH, "r") as f:
        css_content = f.read()

        st.markdown(
            f"""
            <style>
            {css_content}
            </style>
            """,
            unsafe_allow_html=True,
        )

# Header
st.markdown(
    f"""
    <div class="main-container">
        <div class="chat-header">
            <h1 class="chat-title">Langraph Chatbot</h1>
            <a href="https://github.com/blacksmithop/ai-powered-chatroom"
                target="_blank" class="github-avatar">
                {b64_image(assets.github_icon)}
                </a>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)


# Display all messages
render.display_messages()

# Show processing indicator
if st.session_state.is_processing:
    avatar_content = f'<img src="data:image/png;base64,{assets.bot_icon}" style="width:24px;height:24px;">'

    st.markdown(
        f"""
        <div class="bot-section">
            <div class="bot-header">
                <div class="bot-avatar">
                    {avatar_content}
                </div>
                <div class="bot-name">Assistant</div>
                <div class="bot-timestamp">Processing...</div>
            </div>
            <div class="processing-indicator">
                <span>Thinking</span>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

# Handle interrupt form near the input area
if st.session_state.pending_interrupt:
    st.markdown(
        f"""
        <div class="interrupt-alert">
            <h4>🆘 Human Input Required</h4>
            <p>Query: {st.session_state.interrupt_query}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Create interrupt response form
    with st.form(key="interrupt_form", clear_on_submit=True):
        human_response = st.text_area(
            "Please provide your response:",
            key="interrupt_input",
            height=100,
            placeholder="Type your response here...",
        )

        col1, col2 = st.columns([1, 4])
        with col1:
            submit_interrupt = st.form_submit_button(
                "✅ Submit", use_container_width=True
            )
        with col2:
            cancel_interrupt = st.form_submit_button(
                "❌ Cancel", use_container_width=True
            )

        if submit_interrupt and human_response:
            # Add human response to messages
            st.session_state.messages.append(
                {
                    "role": "user",
                    "content": f"Support Response: {human_response}",
                    "timestamp": get_timestamp(),
                }
            )

            # Resume the graph with human input
            try:
                with st.spinner("Processing your response..."):
                    resume_events = graph.stream(
                        Command(resume=human_response), config=config
                    )
                    for resume_event in resume_events:
                        # Handle resumed chatbot messages
                        if "chatbot" in resume_event:
                            for message in resume_event["chatbot"]["messages"]:
                                if (
                                    hasattr(message, "tool_calls")
                                    and message.tool_calls
                                ):
                                    for tool_call in message.tool_calls:
                                        st.session_state.messages.append(
                                            {
                                                "role": "assistant",
                                                "content": tool_call,
                                                "type": "tool_usage",
                                                "timestamp": get_timestamp(),
                                            }
                                        )
                                elif message.content:
                                    st.session_state.messages.append(
                                        {
                                            "role": "assistant",
                                            "content": message.content,
                                            "timestamp": get_timestamp(),
                                        }
                                    )

                        # Handle resumed tool outputs
                        if "tools" in resume_event:
                            for message in resume_event["tools"]["messages"]:
                                st.session_state.messages.append(
                                    {
                                        "role": "tool",
                                        "content": message,
                                        "type": "tool_output",
                                        "timestamp": get_timestamp(),
                                    }
                                )
            except Exception as e:
                st.error(f"Error processing response: {str(e)}")

            # Clear interrupt state
            st.session_state.pending_interrupt = None
            st.session_state.interrupt_query = ""
            st.rerun()

        elif cancel_interrupt:
            st.session_state.pending_interrupt = None
            st.session_state.interrupt_query = ""
            st.rerun()

# Chat input
user_input = st.chat_input(
    "💬 Type your message here...", disabled=st.session_state.pending_interrupt
)

if user_input and not st.session_state.pending_interrupt:
    # IMMEDIATELY add user message to UI
    st.session_state.messages.append(
        {"role": "user", "content": user_input, "timestamp": get_timestamp()}
    )

    # Set processing state and rerun to show user message immediately
    st.session_state.is_processing = True
    st.rerun()

# Process the graph if we're in processing state
if st.session_state.is_processing and not st.session_state.pending_interrupt:
    # Get the last user message to process
    last_message = None
    for msg in reversed(st.session_state.messages):
        if msg["role"] == "user" and not msg["content"].startswith("Support Response:"):
            last_message = msg["content"]
            break

    if last_message:
        try:
            # Stream events from LangGraph
            for event in graph.stream(
                {"messages": [{"role": "user", "content": last_message}]}, config=config
            ):
                # Handle interrupt
                if "__interrupt__" in event:
                    interrupt_obj = event["__interrupt__"][0]
                    prompt = interrupt_obj.value
                    user_query = prompt.get("query", "No query provided")

                    # Set interrupt state
                    st.session_state.pending_interrupt = interrupt_obj
                    st.session_state.interrupt_query = user_query

                    # Add system message about interrupt
                    st.session_state.messages.append(
                        {
                            "role": "system",
                            "content": f"🔄 Human input required: {user_query}",
                            "timestamp": get_timestamp(),
                        }
                    )

                    # Stop processing and rerun to show interrupt form
                    st.session_state.is_processing = False
                    st.rerun()

                # Handle chatbot node
                if "chatbot" in event:
                    for message in event["chatbot"]["messages"]:
                        if hasattr(message, "tool_calls") and message.tool_calls:
                            for tool_call in message.tool_calls:
                                st.session_state.messages.append(
                                    {
                                        "role": "assistant",
                                        "content": tool_call,
                                        "type": "tool_usage",
                                        "timestamp": get_timestamp(),
                                    }
                                )
                        elif message.content:
                            st.session_state.messages.append(
                                {
                                    "role": "assistant",
                                    "content": message.content,
                                    "timestamp": get_timestamp(),
                                }
                            )

                # Handle tools node
                if "tools" in event:
                    for message in event["tools"]["messages"]:
                        st.session_state.messages.append(
                            {
                                "role": "tool",
                                "content": message,
                                "type": "tool_output",
                                "timestamp": get_timestamp(),
                            }
                        )

        except Exception as e:
            st.error(f"Error processing message: {str(e)}")
            st.session_state.messages.append(
                {
                    "role": "system",
                    "content": f"❌ Error: {str(e)}",
                    "timestamp": get_timestamp(),
                }
            )

        # Reset processing state and rerun to show results
        st.session_state.is_processing = False
        st.rerun()

# Footer
# st.markdown(
#     """
#     <div class="footer">
#         <p>🚀 Powered by LangGraph • Built with Streamlit</p>
#     </div>
#     """,
#     unsafe_allow_html=True,
# )
