import sys
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# Load model from your local HF cache or folder
model_id = "./models/gemma-4-hf" 
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.bfloat16, device_map="auto")

def ask_lyra(prompt):
    input_ids = tokenizer(prompt, return_tensors="pt").to("cuda")
    outputs = model.generate(**input_ids, max_new_tokens=128)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

if __name__ == "__main__":
    # Get prompt from Node.js
    user_input = sys.argv[1]
    print(ask_lyra(user_input))
