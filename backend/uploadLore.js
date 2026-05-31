require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const { HfInference } = require('@huggingface/inference');

async function uploadLore() {
    try {
        console.log("🌲 Initializing Pinecone Client...");
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
        const pineconeIndex = pinecone.Index("lumina-lore");

        console.log("🧠 Initializing HuggingFace...");
        if (!process.env.HUGGINGFACE_API_KEY || !process.env.HUGGINGFACE_API_KEY.startsWith('hf_')) {
            throw new Error("Invalid or missing HUGGINGFACE_API_KEY in .env");
        }
        const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

        console.log("📚 Preparing Game Lore and Data...");
        const rawData = [
            // --- God of War ---
            { id: 'gow-lore-1', gameId: 'GOW', type: 'lore', text: 'MIDGARD: The realm of humans, forests, mountains and ancient mysteries. It is the center of the Nine Realms.' },
            { id: 'gow-lore-2', gameId: 'GOW', type: 'lore', text: 'ALFHEIM: The realm of Light Elves and Dark Elves, known for its beauty, magic, and hidden secrets.' },
            { id: 'gow-lore-3', gameId: 'GOW', type: 'lore', text: 'JOTUNHEIM: The realm of Giants, characterized by icy lands and ancient bloodlines.' },
            { id: 'gow-lore-4', gameId: 'GOW', type: 'lore', text: 'MUSPELHEIM: The realm of fire, chaos, and eternal flames, ruled by Surtr.' },
            { id: 'gow-lore-5', gameId: 'GOW', type: 'lore', text: 'NIFLHEIM: A misty, cursed realm filled with darkness, cold, and a deadly maze.' },
            { id: 'gow-wpn-1', gameId: 'GOW', type: 'weapon', text: 'LEVIATHAN AXE: A powerful battle axe infused with Frost energy, capable of freezing enemies. Forged by Sindri and Brok. Kratos main weapon.' },
            { id: 'gow-wpn-2', gameId: 'GOW', type: 'weapon', text: 'BLADES OF CHAOS: Twin blades bound by fire and rage, permanently seared into Kratos arms. Capable of relentless combos.' },
            { id: 'gow-wpn-3', gameId: 'GOW', type: 'weapon', text: 'DRAUPNIR SPEAR: A magical spear that can multiply and detonate on command. It pierces through any enemy shield.' },
            
            // --- Assassin's Creed ---
            { id: 'ac-lore-1', gameId: 'AC', type: 'lore', text: 'The Brotherhood: A secret order of Assassins who fight for peace by preserving free will. They operate in the shadows.' },
            { id: 'ac-lore-2', gameId: 'AC', type: 'lore', text: 'The Templars: An ancient and powerful order fighting for peace through control, order, and restricting freedom.' },
            { id: 'ac-lore-3', gameId: 'AC', type: 'lore', text: 'The Animus: A virtual reality machine that allows users to read subjects genetic memory and experience lives of ancestors.' },
            { id: 'ac-wpn-1', gameId: 'AC', type: 'weapon', text: 'Hidden Blade: The signature weapon of the Brotherhood. A retractable blade used for silent and stealthy assassinations.' },

            // --- Hitman ---
            { id: 'hitman-lore-1', gameId: 'HITMAN', type: 'lore', text: 'Agent 47: A genetically engineered, heavily trained clone assassin, known for his barcoded head and ruthless efficiency.' },
            { id: 'hitman-lore-2', gameId: 'HITMAN', type: 'lore', text: 'ICA: The International Contract Agency is a global shadow organization that provides assassination services.' },
            { id: 'hitman-wpn-1', gameId: 'HITMAN', type: 'weapon', text: 'Silverballers: Agent 47s signature custom dual AMT Hardballer pistols, often equipped with suppressors.' },
            { id: 'hitman-wpn-2', gameId: 'HITMAN', type: 'weapon', text: 'Fiber Wire: A highly concealable garrote wire used by Agent 47 for silent takedowns from behind.' }
        ];

        console.log(`🚀 Generating Math Vectors for ${rawData.length} memories...`);
        // Use a guaranteed 384-dimension model
        const embedOutput = await hf.featureExtraction({
            model: 'sentence-transformers/all-MiniLM-L6-v2',
            inputs: rawData.map(item => item.text)
        });

        if (!embedOutput || embedOutput.length === 0) {
            throw new Error("HuggingFace returned empty embeddings. Check your API key or model status.");
        }
        
        console.log(`Debug: embedOutput length = ${embedOutput.length}`);
        console.log(`Debug: is Array? ${Array.isArray(embedOutput)}`);
        console.log(`Debug: embedOutput[0] is array? ${Array.isArray(embedOutput[0])}, length: ${embedOutput[0]?.length}`);

        console.log("📝 Formatting data for Pinecone...");
        const vectorsToUpload = rawData.map((item, index) => {
            return {
                id: item.id,
                values: Array.from(embedOutput[index]), // Force standard array
                metadata: {
                    gameId: item.gameId,
                    type: item.type,
                    text: item.text 
                }
            };
        });

        console.log(`Debug: vectorsToUpload length = ${vectorsToUpload.length}`);
        console.log(`Debug: first vector id = ${vectorsToUpload[0].id}`);
        console.log(`Debug: first vector values length = ${vectorsToUpload[0].values.length}`);
        
        console.log("⬆️ Uploading vectors directly to Pinecone...");
        // We pass it as an object { records: ... } because of a known Pinecone JS SDK quirk.
        await pineconeIndex.upsert({ records: vectorsToUpload });

        console.log("✅ SUCCESS! The game lore has been permanently injected into the Vector Database.");

    } catch (error) {
        console.error("❌ Error uploading lore:", error.message || error);
    }
}

uploadLore();
