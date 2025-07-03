from utils import graph
from uuid import uuid4
from sys import exit
from langgraph.types import Command

user_id = uuid4().hex

config = {"configurable": {"thread_id": user_id}}
# TODO: Other metadata?

while True:
    try:
        user_input = input("[User]: ")

        for event in graph.stream(
            {"messages": [{"role": "user", "content": user_input}]}, config=config
        ):

            # Check for interrupt
            if "__interrupt__" in event:
                interrupt_obj = event["__interrupt__"][0]
                # Usually a list with one Interrupt
                prompt = interrupt_obj.value  # The payload sent to human
                user_query = prompt["query"]
                print(f"[System]: [User] asks {user_query}")

                # Get human input to resume
                human_response = input("[Support]: ")

                # Resume the graph with human input
                resume_events = graph.stream(
                    Command(resume=human_response), config=config
                )
                for resume_event in resume_events:
                    # Process resumed events (messages, tools, etc.)
                    print(resume_event)
                break  # Exit current event loop to wait for next user input

            # Handle chatbot node (tool calls and messages)
            if "chatbot" in event:
                for message in event["chatbot"]["messages"]:
                    # Check for tool calls
                    if hasattr(message, "tool_calls") and message.tool_calls:
                        print("Tool usage:")
                        for tool_call in message.tool_calls:
                            tool_name = tool_call["name"]
                            tool_args = tool_call["args"]
                            tool_id = tool_call["id"]
                            print(f"{tool_id} | {tool_name} | {tool_args}")
                    # Print chatbot message content if no tool calls
                    elif message.content:
                        print("Message output:")
                        print(message.content)

            # Handle tools node (tool execution results)
            if "tools" in event:
                for message in event["tools"]["messages"]:
                    print("Tool output:")
                    tool_call_id = message.tool_call_id
                    message_id = message.id
                    tool_name = message.name
                    content_preview = message.content[
                        :1000
                    ]  # Limit content to 100 characters
                    print(
                        f"{tool_call_id} | {message_id} | {tool_name} | {content_preview}"
                    )
    except KeyboardInterrupt:
        print("Exiting...")
        exit(0)
