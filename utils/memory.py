from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.sqlite import SqliteSaver

def get_checkpointer(provider: str):
    match provider:
        case "memory":
            return MemorySaver()
        case "sqlite":
            import sqlite3
            conn = sqlite3.connect("./assets/database/checkpoints.sqlite", check_same_thread=False)
            return SqliteSaver(conn=conn)
        case None:
            return None
        case _:
            "Edge case"

            