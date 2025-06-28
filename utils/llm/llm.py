from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import LocalFileStore
from utils import settings

query_store = LocalFileStore("./assets/embedding_cache/query_store/")
docs_store = LocalFileStore("./assets/embedding_cache/docs_store/")

# Consider LLM selection through Configurable

chat_model = AzureChatOpenAI(azure_deployment=settings.AZURE_CHAT_MODEL)

underlying_embeddings = AzureOpenAIEmbeddings(
    azure_deployment=settings.AZURE_EMBEDDING_MODEL
)
embedding_model = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings,
    query_embedding_cache=query_store,
    document_embedding_cache=docs_store,
    namespace=underlying_embeddings.model,
)
