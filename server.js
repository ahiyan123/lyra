const express = require('express');
const { exec } = require('child_process');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// 1. Chat Endpoint - Connects to brain.py
app.post('/chat', (req, res) => {
    const { prompt, mode } = req.body;
    
    // Formatting the command to call Python with the user's prompt
    // We escape double quotes to prevent terminal injection
    const sanitizedPrompt = prompt.replace(/"/g, '\\"');
    const cmd = `python brain.py "${sanitizedPrompt}" "${mode || 'normal'}"`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Python Exec Error: ${stderr}`);
            return res.status(500).json({ reply: "Python Brain Offline. Check dependencies." });
        }
        // Return the stdout (the printed output from your Python script)
        res.json({ reply: stdout.trim() });
    });
});

// 2. Vision Endpoint - Shared File Method
app.post('/vision', (req, res) => {
    const { image, prompt } = req.body;
    if (!image) return res.status(400).json({ reply: "No image received." });

    const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
    
    try {
        // Write image to disk so the Python Brain can see it
        fs.writeFileSync("vision_input.jpg", base64Data, 'base64');
        
        const cmd = `python brain_vision.py "vision_input.jpg" "${prompt}"`;
        
        exec(cmd, (error, stdout) => {
            if (error) return res.status(500).json({ reply: "Vision Core Offline." });
            res.json({ reply: stdout.trim() });
        });
    } catch (e) {
        return res.status(500).json({ reply: "FileSystem Error." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
    -------------------------------------------
    LYRA SOVEREIGN: PYTHON BRIDGE ACTIVE
    Port: ${PORT}
    Logic: Node.js (Face) -> Python (Brain)
    -------------------------------------------
    `);
});
