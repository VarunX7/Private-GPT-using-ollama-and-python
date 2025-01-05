# 1. Ingest pdf files
# 2. Extract pdffiles and split into small chunks
# 3. Send the chunks to embedding model
# 4. Save the embeddings to a vector database
# 5. Perform similarity search on the vector databaseto find similar docs
# 6. Retrieve the similar docs and present them to the user 
 
# ============================== PDF Ingestion ===================================== #

from langchain_community.document_loaders import UnstructuredPDFLoader
from langchain_community.document_loaders import OnlinePDFLoader

doc_path = "./data/GIT_Level2.pdf"
model = "llama3.2"

# Local PDF file uploads...
if doc_path:
    loader = UnstructuredPDFLoader(file_path=doc_path)
    data = loader.load()
    print("done loading ")

#Preview first page...
content = data[0].page_content
# print(content[:100])

# ========================= Extracting Text and Chunking =========================== #

from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma 

# Split and Chunk...
text_splitter = RecursiveCharacterTextSplitter(chunk_size = 1200, chunk_overlap = 300)
chunks = text_splitter.split_documents(data)
print("done splitting...")

# print(f"Number of chunks: {len(chunks)}")
# print(f"Example chunk: {chunks[0]}")

# =========================== Add to vector database ============================ #

import ollama 

ollama.pull("nomic-embed-text")

vector_db = Chroma.from_documents(
    documents=chunks,
    embedding=OllamaEmbeddings(model="nomic-embed-text"),
    collection_name="simple_rag",
)

print("Done adding to vector db ")

# ========================== Retrieval ========================================== #

from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langchain_ollama import ChatOllama

from langchain_core.runnables import RunnablePassthrough
from langchain.retrievers.multi_query import MultiQueryRetriever

# Set up Model...
llm = ChatOllama(model = model)

QUERY_PROMPT = PromptTemplate(
    input_variables=["question"],
    template="""You are an AI language model assistant. Your task is to generate five different versions of the user's question to retrieve relevant documents from the database. By generating multiple perpectives on the user question, your goal is to help the user overcome some of the limitations of the distance-based similarity search. Provide these alternative questions seperated by new lines. 
    Original Questions: {question}""",
) 
retriever = MultiQueryRetriever.from_llm(
    vector_db.as_retriever(), llm, prompt=QUERY_PROMPT
)

# Rag prompt...
template = """Answer the questions based ONLY on the following context 
{context}
Question: {question}
"""

prompt = ChatPromptTemplate.from_template(template)

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

user_query = input("Enter your question: ")
res = chain.invoke(input = (user_query,))

print(res)