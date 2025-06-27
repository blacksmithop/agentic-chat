import faiss
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain.tools.retriever import create_retriever_tool
from utils import embedding_model


try:
    vector_store = FAISS.load_local("./assets/faiss_index/base" , embeddings=embedding_model, allow_dangerous_deserialization=True)
except:
    ...
    # handle not found
    
retriever = vector_store.as_retriever()

retriever_tool = create_retriever_tool(
    retriever,
    "retreive_from_vector_store",
    "Search and return information from a Vector Store.",
)