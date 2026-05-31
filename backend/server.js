require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const { Pinecone } = require('@pinecone-database/pinecone');
const { HfInference } = require('@huggingface/inference');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const pineconeIndex = pinecone.Index("lumina-lore");
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
    res.json({ message: 'Lumina OS Backend is running!' });
});

// Chat endpoint connected to Groq
app.post('/api/chat', async (req, res) => {
    const { message, gameId, history } = req.body;
    
    console.log(`Received message for ${gameId}: ${message}`);
    
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('your_groq_api_key_here')) {
        return res.json({ 
            response: `[ERROR] The Backend needs a valid GROQ_API_KEY to process this. Please add it to your .env file in the backend folder and restart the server!` 
        });
    }

    try {
        // Construct system prompt based on game
        let systemPrompt = "You are a helpful AI assistant.";
        if (gameId === 'GOW') systemPrompt = "You are Mimir from God of War. You are the smartest man alive. Answer the user's questions about Norse Mythology or the Nine Realms in a Scottish accent.";
        if (gameId === 'AC') systemPrompt = "You are the Animus AI from Assassin's Creed. You assist Brotherhood assassins in their historical simulations. Keep it brief and stealthy.";
        if (gameId === 'HL') systemPrompt = "You are a magical guide from Hogwarts Legacy. Talk enthusiastically about spells, potions, and the Wizarding World.";
        if (gameId === 'RDR') systemPrompt = "You are an outlaw informant from Red Dead Redemption 2. Talk like a cowboy from the Wild West, partner.";
        if (gameId === 'HITMAN') systemPrompt = "You are Diana Burnwood, the ICA handler for Agent 47 in Hitman. Speak with a professional, cold, and calculated British tone.";

        // Format history for Groq
        const formattedHistory = history ? history.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
        })) : [];

        // --- RAG RETRIEVAL STEP ---
        try {
            console.log(`[RAG] Embedding query: "${message}"`);
            const queryEmbedding = await hf.featureExtraction({
                model: 'sentence-transformers/all-MiniLM-L6-v2',
                inputs: message
            });

            console.log(`[RAG] Searching Pinecone for ${gameId} lore...`);
            const queryResponse = await pineconeIndex.query({
                topK: 3,
                vector: Array.from(queryEmbedding),
                filter: { gameId: { $eq: gameId } },
                includeMetadata: true
            });

            const retrievedLore = queryResponse.matches.map(m => m.metadata.text).join('\n');
            if (retrievedLore) {
                console.log(`[RAG] Found ${queryResponse.matches.length} matching lore items!`);
                systemPrompt += `\n\n[CRITICAL DATABASE UPLINK: Use the following retrieved game lore to answer the user accurately. DO NOT hallucinate.]\n${retrievedLore}`;
            } else {
                console.log(`[RAG] No specific lore found in database for this query.`);
            }
        } catch (ragError) {
            console.error("RAG Retrieval Failed (Fallback to standard AI):", ragError.message);
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...formattedHistory,
                { role: "user", content: message }
            ],
            model: "llama-3.1-8b-instant", // Updated fast and free Llama 3.1 model on Groq
            temperature: 0.7,
            max_tokens: 1024,
        });

        res.json({ 
            response: chatCompletion.choices[0]?.message?.content || "I am unable to access my database right now." 
        });
    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ response: "An error occurred while connecting to the intelligence engine." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Lumina Backend Server running on http://localhost:${PORT}`);
});
