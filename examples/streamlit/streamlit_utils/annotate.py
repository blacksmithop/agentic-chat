import streamlit as st
import re


# Function to detect and annotate URLs
def annotate_urls(text):
    # Regular expression to match URLs
    url_pattern = r"https?://[^\s]+"
    annotated_parts = []

    is_annotated = False
    # Split text into parts based on URL matches
    last_end = 0
    for match in re.finditer(url_pattern, text):
        is_annotated = True
        start, end = match.span()
        # Add non-URL text before the match
        if start > last_end:
            annotated_parts.append(text[last_end:start])
        # Add the URL with annotation
        annotated_parts.append((text[start:end], "url"))
        last_end = end

    # Add any remaining text after the last URL
    if last_end < len(text):
        annotated_parts.append(text[last_end:])

    return is_annotated, annotated_parts
