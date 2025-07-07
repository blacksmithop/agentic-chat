from langgraph.graph import StateGraph, START, END
from utils import llm, settings, schema, tools
from utils.memory import get_checkpointer


graph_builder = StateGraph(schema.State)


def chatbot(state: schema.State):
    return {"messages": [llm.qa_chain.invoke({"messages": state["messages"]})]}


graph_builder.add_node("chatbot", chatbot)

tool_node = tools.BasicToolNode(tools=tools.tool_list)
graph_builder.add_node("tools", tool_node)

graph_builder.add_conditional_edges(
    "chatbot",
    tools.route_tools,
    {"tools": "tools", END: END},
)

graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

print(settings.LANGGRAPH_SERVER)
print(not settings.LANGGRAPH_SERVER)
if not settings.LANGGRAPH_SERVER:
    checkpoint_provider = settings.CHECKPOINTER
    checkpointer = get_checkpointer(provider=checkpoint_provider)
else:
    checkpointer = None

graph = graph_builder.compile(
    checkpointer=checkpointer
)  # .with_config({"run_name": "chat-graph"})
