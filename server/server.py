from langchain.text_splitter import CharacterTextSplitter
from flask import Flask, request, jsonify
from groq import Groq
import json
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Read configuration from environment variables
PORT = int(os.getenv("PORT", 3000))
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

class Entry(BaseModel):
    term: str
    definition: str

class Definitions(BaseModel):
    definitions: list[Entry]

# Function to call the Groq API for a single chunk of text
def get_groq_chat_completion(text, memory_definitions=None):
    response = groq_client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an assistant that extracts definitions of objects and symbols from scientific text and outputs them in JSON format. "
                    f'The JSON object must use the schema: {json.dumps(Definitions.model_json_schema(), indent=2)}'
                    "For better understanding you should also consider the following definitions that were previously extracted from earlier chunks of the same text:\n"
                    f"{json.dumps(memory_definitions, indent=2) if memory_definitions else 'None'}"
                ),
            },
            {
                "role": "user",
                "content": f"Extract all definitions from the following text:\n{text}",
            },
        ],
        model="llama-3.1-8b-instant",
        temperature=0.5,
        max_completion_tokens=2048,
        top_p=1,
        stop=None,
        stream=False,
        response_format={"type": "json_object"},
    )
    if response.choices:
        extracted_definitions = json.loads(response.choices[0].message.content)
        return extracted_definitions.get("definitions", [])
    return []

# Function to split text into semantic chunks
def split_text_into_chunks(text):
    # Initialize the text splitter for plain text
    plain_text_splitter = CharacterTextSplitter(
        chunk_size=10000,  # Number of characters per chunk
        chunk_overlap=50   # Overlap to preserve context
    )
    
    # Split the text into chunks
    chunks = plain_text_splitter.split_text(text)
    return chunks

# POST endpoint to handle definition extraction
@app.route("/definitions", methods=["POST"])
def definitions():
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "Text input is required"}), 400

    text = data["text"]

    try:
        # Split text into chunks
        chunks = split_text_into_chunks(text)

        # Send each chunk to the Groq API and collect definitions
        current_definitions = []
        for chunk in chunks:
            new_definitions = get_groq_chat_completion(chunk, memory_definitions=current_definitions)
            current_definitions.extend(new_definitions)
        return jsonify({"definitions": current_definitions})
    except Exception as e:
        app.logger.error(f"Error processing text: {str(e)}")
        return jsonify({"error": "Failed to process text and extract definitions."}), 500

# Start the server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
