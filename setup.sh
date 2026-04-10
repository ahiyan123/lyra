#!/bin/bash

echo "--- Initializing Environment ---"

# 1. Install Node dependencies
npm install

# 2. Create models directory
mkdir -p models

# 3. Reminder for models
echo "IMPORTANT: Place your gemma-4-it.gguf and mmproj.bin in the /models folder."
echo "These files are not pushed to GitHub to keep the repo lightweight."

# 4. Check for llama-cli
if [ ! -f "./llama-cli" ]; then
    echo "Warning: llama-cli not found. Ensure you have compiled llama.cpp locally."
fi

echo "--- Setup Complete. Run 'npm start' to wake Lyra. ---"
