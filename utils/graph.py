from langgraph.graph import StateGraph, START, END
from utils import BasicToolNode, chat_model, route_tools, settings, State, tools
from utils.memory import get_checkpointer
from langgraph.checkpoint.memory import MemorySaver

graph_builder = StateGraph(State)
memory = MemorySaver()
llm_with_tools = chat_model.bind_tools(tools)

def chatbot(state: State):
    from langchain.schema import AIMessage
    
    # update system prompt
    return {"messages": [llm_with_tools.invoke(state["messages"])]}
    # return {
    #     "messages": [
    #         AIMessage(content="Hi", role="assistant")
    #     ]
    # }

graph_builder.add_node("chatbot", chatbot)

tool_node = BasicToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)

graph_builder.add_conditional_edges(
    "chatbot",
    route_tools,
    {"tools": "tools", END: END},
)

graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

checkpoint_provider = settings.CHECKPOINTER
checkpointer=get_checkpointer(provider=checkpoint_provider)

graph = graph_builder.compile(checkpointer=checkpointer)