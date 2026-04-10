const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// 1. Chat Endpoint
app.post('/chat', (req, res) => {
    const { prompt, mode } = req.body;
    
    // Customize the system prompt based on Mode
    const systemPrompt = mode === 'special' 
        ? "You are Lyra, a calm and highly patient assistant. Speak clearly and slowly."
        : "You are Lyra, a high-energy, sincere human companion.";

    const cmd = `./llama-cli -m ./models/gemma-4-it.gguf -p "<|system|>${systemPrompt}<|user|>${prompt}<|assistant|>" -n 128`;

    exec(cmd, (error, stdout) => {
        if (error) return res.status(500).json({ reply: "Core Offline." });
        res.json({ reply: stdout.trim() });
    });
});

// 2. Vision Endpoint
app.post('/vision', (req, res) => {
    const { image, prompt } = req.body;
    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    
    // Save buffer for vision processing
    fs.writeFileSync("vision_input.jpg", base64Data, 'base64');

    const cmd = `./llama-cli -m ./models/gemma-4-vision.gguf --mmproj ./models/mmproj.bin --image vision_input.jpg -p "${prompt}"`;

    exec(cmd, (error, stdout) => {
        if (error) return res.status(500).json({ reply: "Vision Core Offline." });
        res.json({ reply: stdout.trim() });
    });
});

app.listen(3000, () => console.log('Sovereign Backend running on port 3000'));
