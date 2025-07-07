from langgraph.graph.message import add_messages
from typing import Annotated, Sequence, TypedDict
from langgraph.graph.ui import AnyUIMessage, ui_message_reducer


class State(TypedDict):
    messages: Annotated[list, add_messages]
    ui: Annotated[Sequence[AnyUIMessage], ui_message_reducer]
