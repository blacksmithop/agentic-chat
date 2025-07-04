from langchain_community.document_loaders import WebBaseLoader
from langchain_core.tools import tool
from utils.tools.retriever import vector_store
from typing import Any, Union


@tool
def crawl_and_index_url(url: str) -> str:
    """Crawls the given url and stores results in a vector store

    Args:
        url (str): _description_

    Returns:
        str: _description_
    """
    try:
        loader = WebBaseLoader(url)
        docs = loader.load()

        vector_store.add_documents(documents=docs)
        # Ensure new indices are saved
        return f"{url} indexed successfully"
    except Exception as e:
        return f"Crawling url {url} failed due to {str(e)}"
