const express = require("express");
const bodyParser = require("body-parser");
const Groq = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config()

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Initialize Groq
const groq = new Groq({apiKey: process.env.GROQ_API_KEY});

// Function to call the Groq API
const getGroqChatCompletion = async (text) => {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are an assistant that extracts definitions of objects and symbols from scientific text and outputs them in JSON format. \n The JSON object must use the schema: {\"definitions\": [{\"term\": \"term1\",\"definition\": \"definition1\",},{\"term\": \"term2\",\"definition\": \"definition2\",}]}"
                                                        
      },
      {
        role: "user",
        content: `Extract all definitions  from the following text:\n${text}`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1,
    stop: null,
    stream: false,
    response_format: {"type": "json_object"},
  });
};

module.exports = { getGroqChatCompletion };


// POST endpoint to handle definition extraction
app.post("/definitions", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text input is required" });
  }

  try {
    // Call the Groq API
    const groqResponse = await getGroqChatCompletion(text);
    const groqDefinitions = groqResponse.choices[0]?.message?.content || "No definitions found.";
    return res.json({ definitions: groqDefinitions });
  } catch (error) {
    console.error("Error in Groq API call:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch definitions from Groq API." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`LLM API server is running at http://localhost:${port}`);
});


