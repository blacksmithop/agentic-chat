import faiss
from langchain_community.vectorstores import FAISS
from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain.tools.retriever import create_retriever_tool
from utils import embeddings

index = faiss.IndexFlatL2(len(embeddings.embed_query("Hi")))
vector_store = FAISS(
    embedding_function=embeddings,
    index=index,
    docstore=InMemoryDocstore(),
    index_to_docstore_id={},
)

vector_store.load_local("./assets/faiss_index/base", embeddings=embeddings, allow_dangerous_deserialization=True)
retriever = vector_store.as_retriever()

retriever_tool = create_retriever_tool(
    retriever,
    "retrieve_blog_posts",
    "Search and return information about Lilian Weng blog posts.",
)