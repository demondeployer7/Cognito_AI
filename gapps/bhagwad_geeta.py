from transformers import TextStreamer
import gc
# Helper function for inference
def do_gemma_3n_inference(model, messages, max_new_tokens = 128):
    inputs = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt = True, # Must add for generation
        tokenize = True,
        return_dict = True,
        return_tensors = "pt",
    ).to("cuda")
    _ = model.generate(
        **inputs,
        max_new_tokens = max_new_tokens,
        temperature = 1.0, top_p = 0.95, top_k = 64,
        streamer = TextStreamer(tokenizer, skip_prompt = True),
    )
    # Cleanup to reduce VRAM usage
    del inputs
    torch.cuda.empty_cache()
    gc.collect()

import torch 
torch._dynamo.config.cache_size_limit = 1024

user_input = "I feel lost and anxious about my career. What should I do?"

messages = [{
    "role": "user",
    "content": [{
        "type": "text",
        "text": f"""You are a wise and compassionate guide who answers life questions using the teachings of the Bhagavad Gita.

The user will share a personal or emotional concern. Respond with empathy, clarity, and quotes or summaries from the Gita that can help the user reflect and find peace.

User's message:
\"\"\"{user_input}\"\"\"

Your response (include relevant verses, chapter numbers if possible, and practical reflection):
"""
    }]
}]

do_gemma_3n_inference(model, messages, max_new_tokens=256)

