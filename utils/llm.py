from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from dotenv import load_dotenv
from os import getenv
from utils import settings

load_dotenv()

# Consider LLM selection through Configurable

chat_model = AzureChatOpenAI(azure_deployment=settings.AZURE_CHAT_MODEL)
embedding_model = AzureOpenAIEmbeddings(azure_deployment=settings.AZURE_EMBEDDING_MODEL)