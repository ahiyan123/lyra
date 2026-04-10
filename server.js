const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();

// PREVENT ERR_CONNECTION_REFUSED: Ensure CORS allows your frontend origin
app.use(cors()); 
app.use(bodyParser.json({ limit: '50mb' }));

// 1. Chat Endpoint
app.post('/chat', (req, res) => {
    const { prompt, mode } = req.body;
    
    // Defaulting to normal if mode is undefined
    const currentMode = mode || 'normal';
    
    const systemPrompt = currentMode === 'special' 
        ? "You are Lyra, a calm and highly patient assistant. Speak clearly and slowly."
        : "You are Lyra, a high-energy, sincere human companion.";

    // Logic Check: Ensure your llama-cli path is correct for your OS
    // If on Windows, this might need to be "llama-cli.exe"
    const cmd = `./llama-cli -m ./models/gemma-4-it.gguf -p "<|system|>${systemPrompt}<|user|>${prompt}<|assistant|>" -n 128`;

    exec(cmd, (error, stdout) => {
        if (error) {
            console.error(`Exec Error: ${error}`);
            return res.status(500).json({ reply: "Core Offline. Check terminal for errors." });
        }
        res.json({ reply: stdout.trim() });
    });
});

// 2. Vision Endpoint
app.post('/vision', (req, res) => {
    const { image, prompt } = req.body;
    if (!image) return res.status(400).json({ reply: "No image received." });

    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    
    try {
        fs.writeFileSync("vision_input.jpg", base64Data, 'base64');
    } catch (e) {
        return res.status(500).json({ reply: "FileSystem Error." });
    }

    const cmd = `./llama-cli -m ./models/gemma-4-vision.gguf --mmproj ./models/mmproj.bin --image vision_input.jpg -p "${prompt}"`;

    exec(cmd, (error, stdout) => {
        if (error) return res.status(500).json({ reply: "Vision Core Offline." });
        res.json({ reply: stdout.trim() });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
    -------------------------------------------
    LYRA SOVEREIGN BACKEND ACTIVE
    Port: ${PORT}
    Status: Waiting for Pioneer...
    -------------------------------------------
    `);
});
