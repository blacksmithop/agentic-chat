from langgraph.graph import StateGraph, START, END
from utils import llm, settings, schema, tools
from utils.memory import get_checkpointer
from langgraph.checkpoint.memory import MemorySaver


graph_builder = StateGraph(schema.State)
memory = MemorySaver()


def chatbot(state: schema.State):
    from langchain.schema import AIMessage

    # Handle memory better
    return {"messages": [llm.qa_chain.invoke({"messages": state["messages"]})]}
    # return {
    #     "messages": [
    #         AIMessage(content="Hi", role="assistant")
    #     ]
    # }


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

checkpoint_provider = settings.CHECKPOINTER
checkpointer = get_checkpointer(provider=checkpoint_provider)

graph = graph_builder.compile(checkpointer=checkpointer)
