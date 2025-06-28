from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import SystemMessage
from .llm import chat_model
from utils import tools


SYSTEM_PROMPT = """
You are an assistant for question-answering tasks. Use the retrieved context to answer the question. If you don't know the answer, just say that you don't know. 

> Ensure response has proper markdown formatting. Ensure ``` are use for code and ` for smaller text
> Only rely on human assistance if the LLM does not what to do. If assistance is given follow it to the best of your ability
"""

qa_prompt_template = ChatPromptTemplate(
    [
        SystemMessage(
            role="system",
            content=SYSTEM_PROMPT,
        ),
        MessagesPlaceholder("messages"),
    ]
)

llm_with_tools = chat_model.bind_tools(tools.tool_list)

qa_chain = qa_prompt_template | llm_with_tools
