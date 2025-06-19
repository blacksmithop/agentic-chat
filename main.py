from utils import graph

user_input = "Adverserial attacks on LLMS"

for event in graph.stream({"messages": [{"role": "user", "content": user_input}]}):
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
            content_preview = message.content[:100]  # Limit content to 100 characters
            print(f"{tool_call_id} | {message_id} | {tool_name} | {content_preview}")
