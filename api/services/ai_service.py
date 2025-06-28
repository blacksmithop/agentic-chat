import openai
from typing import List, Optional
import random
from api.config import settings

# Set OpenAI API key if available
if settings.OPENAI_API_KEY:
    openai.api_key = settings.OPENAI_API_KEY


async def get_ai_response(question: str, context: Optional[List[str]] = None) -> str:
    """Get AI response to a question"""

    # If OpenAI API key is not set, return mock responses
    if not settings.OPENAI_API_KEY:
        return get_mock_ai_response(question)

    try:
        # Prepare messages for OpenAI
        messages = [
            {
                "role": "system",
                "content": "You are Genie, a helpful AI assistant in a chat application. Keep responses concise and friendly.",
            }
        ]

        # Add context if provided
        if context:
            context_text = "\n".join(context[-5:])  # Last 5 messages for context
            messages.append(
                {
                    "role": "system",
                    "content": f"Recent conversation context: {context_text}",
                }
            )

        messages.append({"role": "user", "content": question})

        # Call OpenAI API
        response = await openai.ChatCompletion.acreate(
            model=settings.AI_MODEL,
            messages=messages,
            max_tokens=settings.AI_MAX_TOKENS,
            temperature=0.7,
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"OpenAI API error: {e}")
        return get_mock_ai_response(question)


def get_mock_ai_response(question: str) -> str:
    """Generate mock AI responses when OpenAI is not available"""
    responses = [
        f"That's an interesting question about '{question}'. Based on my knowledge, I can tell you that this topic has multiple perspectives worth considering.",
        f"Great question! Regarding '{question}', I'd say that it depends on several factors and context.",
        f"I understand you're asking about '{question}'. From my training data, I can provide some insights on this topic.",
        f"That's a thoughtful inquiry about '{question}'. Let me break this down for you from different angles.",
        f"Interesting! When it comes to '{question}', there are various approaches and considerations to keep in mind.",
        f"Thanks for asking about '{question}'. This is a topic that many people find fascinating, and here's what I can share...",
        f"Your question about '{question}' touches on an important subject. Based on available information, here are some key points...",
        f"I appreciate your curiosity about '{question}'. This is definitely something worth exploring further.",
    ]

    return random.choice(responses)
