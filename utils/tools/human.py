from langgraph.types import interrupt


def ask_human(query: str) -> str:
    """Ask question to a human."""
    return f"Your query: {query} was answer by a human"

