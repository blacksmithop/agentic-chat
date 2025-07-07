from langgraph.graph import StateGraph, START, END
from utils import schema
from utils import nodes

workflow = StateGraph(schema.State)

workflow.add_node(nodes.get_weather)
workflow.add_edge("__start__", "get_weather")
graph = workflow.compile()