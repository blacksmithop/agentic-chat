import random
from typing import List

def generate_avatar_url(nickname: str) -> str:
    """Generate avatar URL using DiceBear API"""
    return f"https://api.dicebear.com/7.x/avataaars/svg?seed={nickname}&backgroundColor=transparent"

def get_random_chat_color() -> str:
    """Get a random chat color"""
    colors = [
        "#3B82F6",  # Blue
        "#10B981",  # Emerald
        "#8B5CF6",  # Violet
        "#F59E0B",  # Amber
        "#EF4444",  # Red
        "#06B6D4",  # Cyan
        "#84CC16",  # Lime
        "#F97316",  # Orange
        "#EC4899",  # Pink
        "#6366F1",  # Indigo
    ]
    return random.choice(colors)

def extract_youtube_id(url: str) -> str:
    """Extract YouTube video ID from URL"""
    import re
    pattern = r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)'
    match = re.search(pattern, url)
    return match.group(1) if match else None

def is_valid_url(url: str) -> bool:
    """Check if URL is valid"""
    import re
    pattern = r'^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$'
    return bool(re.match(pattern, url))

def sanitize_content(content: str) -> str:
    """Sanitize user content"""
    # Basic HTML escaping
    content = content.replace("<", "&lt;").replace(">", "&gt;")
    return content.strip()
