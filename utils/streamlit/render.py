import streamlit as st
from .assets import (
    bot_icon,
    support_icon,
    system_icon,
    user_icon,
)
from .annotate import annotate_urls
from annotated_text.util import get_annotated_html


def b64_image(icon):
    return f'<img src="data:image/png;base64,{icon}">'


# Helper function to render tool usage component
def render_tool_usage_component(tool_call, is_loading=False):
    tool_id = tool_call.get("id", "N/A")
    tool_name = tool_call.get("name", "Unknown Tool")
    tool_args = tool_call.get("args", {})

    # Use expander for collapsible content
    with st.expander(f"🔧 Tool Usage: {tool_name}", expanded=False):
        col1, col2 = st.columns([1, 3])
        with col1:
            st.write("**Tool ID:**")
            st.write("**Name:**")
            st.write("**Arguments:**")
        with col2:
            st.write(tool_id)
            st.write(tool_name)
            st.json(tool_args)

        if is_loading:
            st.markdown(
                """
                <div style="display: flex; align-items: center; justify-content: center; padding: 10px;">
                    <span style="margin-right: 10px;">Processing...</span>
                    <div class="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )


# Helper function to render tool output component
def render_tool_output_component(message):
    tool_call_id = getattr(message, "tool_call_id", "N/A")
    message_id = getattr(message, "id", "N/A")
    tool_name = getattr(message, "name", "Unknown Tool")
    content = getattr(message, "content", "")

    # Use expander for collapsible content
    with st.expander(f"⚡ Tool Output: {tool_name}", expanded=False):
        col1, col2 = st.columns([1, 3])
        with col1:
            st.write("**Call ID:**")
            st.write("**Message ID:**")
            st.write("**Output:**")
        with col2:
            st.write(tool_call_id)
            st.write(message_id)
            # Show content in a code block for better formatting
            if len(content) > 500:
                st.text_area("", content, height=200, disabled=True)
            else:
                st.write(content)


# Function to display messages
def display_messages():
    st.markdown('<div class="main-container">', unsafe_allow_html=True)

    current_bot_section = []
    current_bot_timestamp = None

    for i, message in enumerate(st.session_state.messages):
        role = message["role"]
        content = message["content"]
        msg_type = message.get("type", "text")
        timestamp = message.get("timestamp", "")

        if role == "user":
            # Flush any pending bot section
            if current_bot_section:
                display_bot_section(current_bot_section, current_bot_timestamp)
                current_bot_section = []
                current_bot_timestamp = None

            # Display user message
            avatar_content = b64_image(user_icon)

            is_annotated, annotated_parts = annotate_urls(text=content)

            st.markdown(
                f"""
                <div class="user-message">
                    <div class="user-avatar">
                        {avatar_content}
                    </div>
                    <div class="user-content">
                        {get_annotated_html(*annotated_parts) if is_annotated else content.rstrip()}
                        <div class="message-timestamp">{timestamp}</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        elif role == "support":
            # Display support message
            avatar_content = b64_image(support_icon)

            st.markdown(
                f"""
                <div class="user-message">
                    <div class="user-avatar">
                        {avatar_content}
                    </div>
                    <div class="user-content">
                        {content}
                        <div class="message-timestamp">{timestamp}</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        elif role == "system":
            # Flush any pending bot section
            if current_bot_section:
                display_bot_section(current_bot_section, current_bot_timestamp)
                current_bot_section = []
                current_bot_timestamp = None

            # Display system message
            avatar_content = b64_image(system_icon)

            st.markdown(
                f"""
                <div class="system-message">
                    <div class="system-avatar">
                        {avatar_content}
                    </div>
                    <div class="system-content">
                        {content}
                        <div class="message-timestamp">{timestamp}</div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        elif role in ["assistant", "tool"]:
            # Collect bot messages for grouping
            if not current_bot_timestamp:
                current_bot_timestamp = timestamp
            current_bot_section.append(message)

    # Flush any remaining bot section
    if current_bot_section:
        display_bot_section(current_bot_section, current_bot_timestamp)

    st.markdown("</div>", unsafe_allow_html=True)


def display_bot_section(messages, timestamp):
    """Display a grouped bot section without bubbles"""
    avatar_content = b64_image(bot_icon)

    st.markdown(
        f"""
        <div class="bot-section">
            <div class="bot-header">
                <div class="bot-avatar">
                    {avatar_content}
                </div>
                <div class="bot-name">Assistant</div>
                <div class="bot-timestamp">{timestamp}</div>
            </div>
        """,
        unsafe_allow_html=True,
    )

    # Display all messages in this bot section
    for message in messages:
        role = message["role"]
        content = message["content"]
        msg_type = message.get("type", "text")

        if msg_type == "tool_usage":
            render_tool_usage_component(content, is_loading=False)
        elif msg_type == "tool_output":
            render_tool_output_component(content)
        elif content:  # Regular text content

            st.markdown(
                f"""
                <div class="bot-content">
                {content}
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown("</div>", unsafe_allow_html=True)
