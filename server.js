const express = require('express');
const fs = require('fs');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-1.5-pro";

// Read the system instructions from the file with error handling
let systemInstructions;
try {
  systemInstructions = fs.readFileSync('rr.txt', 'utf8');
} catch (err) {
  console.error('Failed to read system instructions:', err);
}

// Function to handle chat interactions
async function runChat(userInput) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  // Start chat session, including system instructions and history
  const chatSession = model.startChat({
    systemInstruction: systemInstructions,
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [
          { 
              text: `This is your data:
              - Black Shorts: 
                  • White graphic tee
                  • Blue V-neck shirt
                  • Black Vans sneakers
                  • Gray baseball cap
                  • Leather bracelet
              - White T-Shirt:
                  • Light blue jeans
                  • Gray zip-up hoodie
                  • Black Converse sneakers
                  • Navy baseball cap
                  • Silver chain necklace
              - Denim Jacket:
                  • Black ripped jeans
                  • White crew neck tee
                  • Brown Chelsea boots
                  • Black sunglasses
                  • Leather belt
              - Khaki Chinos:
                  • Olive green button-down shirt
                  • Brown leather loafers
                  • Black belt
                  • White crew socks
                  • Aviator sunglasses
              - Gray Hoodie:
                  • Black leggings
                  • White high-top sneakers
                  • Burgundy beanie
                  • Silver hoop earrings
                  • Mini backpack
              - Blue Jeans:
                  • Striped long-sleeve shirt
                  • Black ankle boots
                  • Leather crossbody bag
                  • Gold watch
                  • Black belt
              - Black Skirt:
                  • White blouse
                  • Black flats
                  • Pearl necklace
                  • Black clutch
                  • Rose gold bracelet
              - Navy Joggers:
                  • White hoodie
                  • Gray sneakers
                  • Black beanie
                  • Leather strap watch
                  • Silver chain
              - White Denim Shorts:
                  • Light pink crop top
                  • Tan sandals
                  • Straw hat
                  • Gold hoop earrings
                  • Beige crossbody bag
              - Brown Cargo Pants:
                  • Red graphic tee
                  • Beige slip-ons
                  • Black cap
                  • Chain bracelet
                  • Black wristwatch
              - Gray Sweatpants:
                  • Black tank top
                  • White sneakers
                  • Black baseball cap
                  • Silver pendant necklace
                  • Small backpack
              - Green Cargo Shorts:
                  • Beige T-shirt
                  • Brown sandals
                  • Canvas tote bag
                  • Beaded bracelet
                  • Sunglasses
              - Beige Cardigan:
                  • White tank top
                  • Light blue jeans
                  • Tan flats
                  • Gold necklace
                  • Straw tote bag
              - Black Turtleneck:
                  • Camel coat
                  • Black skinny jeans
                  • Ankle boots
                  • Gold hoop earrings
                  • Crossbody satchel
              - White Button-Up Shirt:
                  • Navy chinos
                  • Brown loafers
                  • Leather belt
                  • Silver wristwatch
                  • Black aviators
              - Denim Skirt:
                  • Floral blouse
                  • White sneakers
                  • Pearl earrings
                  • Woven belt
                  • Straw sunhat
              - Black Joggers:
                  • Graphic crewneck sweatshirt
                  • Gray sneakers
                  • Black cap
                  • Leather wristwatch
                  • Crossbody bag
              - Olive Green T-Shirt:
                  • Dark wash jeans
                  • Black Converse sneakers
                  • Black cap
                  • Aviator sunglasses
                  • Leather bracelet
              - Red Flannel Shirt:
                  • White tee
                  • Black jeans
                  • Brown boots
                  • Silver watch
                  • Black belt
              - Camel Overcoat:
                  • Black turtleneck
                  • Gray trousers
                  • Black loafers
                  • Leather gloves
                  • Silver cufflinks
      
              You have one task: when the user asks for combinations with a specific item, provide the relevant options. If no combination is available, respond with "Currently we do not have combinations for that."`
          }
      ]
      
      },
      {
        role: "model",
        parts: [
          { text: "Hello! Do you have any clothing items you would like me to provide combinations for?\n" },
        ],
      },
      {
        role: "user",
        parts: [{ text: "black shorts\n" }],
      },
      {
        role: "model",
        parts: [
          { text: "Black shorts match with:\n* Red Vineyard Vines Shirt\n* White Graphic Tee\n* Blue Polo\n" },
        ],
      },
      {
        role: "user",
        parts: [{ text: "brown hoodie" }],
      },
      {
        role: "model",
        parts: [
          { text: "Currently, we do not have combinations for that.\n" },
        ],
      },
    ],
  });

  // Send user message and retrieve model response
  const result = await chatSession.sendMessage(userInput);
  
  // Get the output response text
  const outputJson = result.response.text();

  // Write the output to Testing.json file
  const jsonData = JSON.stringify(outputJson, null, 4);
  fs.writeFile('Testing.json', jsonData, (err) => {
    if (err) {
        console.error("Error writing to file:", err);
    } else {
        console.log("Data has been written to 'Testing.json'.");
    }
  });

  return outputJson;  // Return the response text
}

// Routes for frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
