"""
Translation utilities using Gemini API.
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def translate_with_gemini(text: str, target_language: str) -> Optional[str]:
    """
    Translate text to target language using Gemini API.
    
    Args:
        text: Text to translate (in English)
        target_language: Target language code ('es' or 'cat')
        
    Returns:
        Translated text, or None if translation fails
    """
    if target_language == "en":
        return text  # No translation needed
    
    try:
        from google import genai
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("⚠️ GEMINI_API_KEY not set, skipping translation")
            return None
        
        client = genai.Client(api_key=api_key)
        
        language_names = {
            "es": "Spanish (castellano español)",
            "cat": "Catalan (català)"
        }
        
        target_lang = language_names.get(target_language, "Spanish")
        
        prompt = f"""Translate the following text to {target_lang}. 

IMPORTANT RULES:
1. Preserve ALL line breaks exactly as they appear (\\n)
2. Keep markdown formatting (**, ##, -, etc.)
3. Keep emojis unchanged (🔌, 🏭, 💰, 🌍, ⚗️, 📚, etc.)
4. Keep numbers, percentages, and symbols unchanged (€, %, CO₂)
5. Translate ONLY the text content, not the structure

Original text:
{text}

Translated text:"""
        
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=prompt,
            config={
                'temperature': 0.3,
                'max_output_tokens': 2000
            }
        )
        
        if response and response.text:
            translated = response.text.strip()
            logger.info(f"✅ Text translated to {target_language} via Gemini")
            return translated
        else:
            logger.warning(f"⚠️ Gemini returned empty response")
            return None
            
    except Exception as e:
        logger.warning(f"⚠️ Translation failed: {e}")
        return None
