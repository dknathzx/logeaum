import openai
import os

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY") or "sk-your-api-key-here"

def get_openai_response(prompt: str, model="gpt-3.5-turbo"):
    """
    Sends a message to OpenAI and returns the response.
    """
    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are LOGEAUM, a compassionate AI mental health companion."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"⚠️ OpenAI Error: {str(e)}"
