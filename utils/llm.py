from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from dotenv import load_dotenv
from os import getenv


load_dotenv()

llm = AzureChatOpenAI(azure_deployment=getenv("AZURE_CHAT_MODEL"))

embeddings = AzureOpenAIEmbeddings(azure_deployment=getenv("AZURE_EMBEDDING_MODEL"))