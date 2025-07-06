from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import LocalFileStore
from utils import settings


def get_ollama_models():
    try:
        from langchain_ollama.embeddings import OllamaEmbeddings
        from langchain_ollama.chat_models import ChatOllama
    except ImportError:
        print("Please install the langchain-ollama package")
        exit(0)

    chat_model = ChatOllama(
        base_url=settings.OLLAMA_BASE_URL,
        model=settings.CHAT_MODEL,
        temperature=0,
        seed=1234,
        num_ctx=500,
    )

    embeddings = OllamaEmbeddings(
        base_url=settings.OLLAMA_BASE_URL, model=settings.EMBEDDING_MODEL
    )
    return chat_model, embeddings



def get_openai_models():
    try:
        from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
    except ImportError:
        print("Please install the langchain-openai package")
        exit(0)
    chat_model = AzureChatOpenAI(azure_deployment=settings.CHAT_MODEL)

    embedding_model = AzureOpenAIEmbeddings(
        azure_deployment=settings.EMBEDDING_MODEL
    )

    return chat_model, embedding_model

match settings.LLM_PROVIDER:
    case "ollama":
        func = get_ollama_models
    case "azure":
        func = get_openai_models

chat_model, _embedding_model = func()

query_store = LocalFileStore("./assets/embedding_cache/query_store/")
docs_store = LocalFileStore("./assets/embedding_cache/docs_store/")

embedding_model = CacheBackedEmbeddings.from_bytes_store(
    _embedding_model,
    query_embedding_cache=query_store,
    document_embedding_cache=docs_store,
    namespace=f"{settings.LLM_PROVIDER}_namespace",
)
