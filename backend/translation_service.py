"""
Translation Service for GTU App
Integrates MLX local models with fallback to cloud APIs

Provides high-level translation interface for the application
"""

import os
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import hashlib

from dotenv import load_dotenv

# Try to import MLX service
try:
    from backend.mlx_service import get_mlx_service, SUPPORTED_LANGUAGES
    MLX_AVAILABLE = True
except ImportError:
    MLX_AVAILABLE = False
    SUPPORTED_LANGUAGES = {'en': 'English'}

load_dotenv()

logger = logging.getLogger(__name__)


class TranslationService:
    """
    High-level translation service with multiple backends
    
    Priority:
    1. MLX local model (free, fast for M4)
    2. Cached translations
    3. Fallback to original text
    """
    
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
        self.mlx_service = None
        
        # Initialize MLX if available
        if MLX_AVAILABLE:
            try:
                self.mlx_service = get_mlx_service()
                logger.info("✅ MLX translation service initialized")
            except Exception as e:
                logger.warning(f"⚠️  MLX service failed to initialize: {e}")
        
        # Stats
        self.stats = {
            'mlx_translations': 0,
            'cached_translations': 0,
            'fallback_count': 0
        }
    
    def translate_text(self, 
                      text: str, 
                      target_lang: str = 'gu',
                      source_lang: str = 'en',
                      context: Optional[str] = None) -> Dict[str, any]:
        """
        Translate text to target language
        
        Args:
            text: Text to translate
            target_lang: Target language code
            source_lang: Source language code  
            context: Optional context (e.g., "technical", "casual")
            
        Returns:
            Translation result with metadata
        """
        # Same language - no translation needed
        if source_lang == target_lang:
            return {
                'success': True,
                'translation': text,
                'source_lang': source_lang,
                'target_lang': target_lang,
                'method': 'no_translation_needed'
            }
        
        # Check database cache first
        if self.supabase:
            cached = self._get_cached_translation(text, source_lang, target_lang)
            if cached:
                self.stats['cached_translations'] += 1
                logger.info(f"📦 Using cached translation from database")
                return {
                    'success': True,
                    'translation': cached['translated_text'],
                    'source_lang': source_lang,
                    'target_lang': target_lang,
                    'method': 'cached',
                    'quality_score': cached.get('quality_score')
                }
        
        # Try MLX local translation
        if self.mlx_service:
            try:
                result = self.mlx_service.translate(text, source_lang, target_lang)
                if result['success']:
                    self.stats['mlx_translations'] += 1
                    
                    # Store in database cache
                    if self.supabase:
                        self._cache_translation(
                            text, 
                            result['translation'],
                            source_lang,
                            target_lang,
                            method='mlx-local'
                        )
                    
                    return {
                        **result,
                        'method': 'mlx-local'
                    }
            except Exception as e:
                logger.error(f"MLX translation failed: {e}")
        
        # Fallback: return original text
        self.stats['fallback_count'] += 1
        logger.warning(f"⚠️  Fallback: returning original text")
        
        return {
            'success': False,
            'translation': text,
            'source_lang': source_lang,
            'target_lang': target_lang,
            'method': 'fallback',
            'warning': 'Translation service unavailable'
        }
    
    def translate_content(self,
                         content: Dict[str, any],
                         target_lang: str = 'gu',
                         fields: Optional[List[str]] = None) -> Dict[str, any]:
        """
        Translate specific fields in a content object
        
        Args:
            content: Dictionary with content fields
            target_lang: Target language
            fields: List of fields to translate (default: common fields)
            
        Returns:
            Content with translated fields
        """
        if fields is None:
            fields = ['title', 'description', 'text', 'explanation', 'content']
        
        translated_content = content.copy()
        
        for field in fields:
            if field in content and content[field]:
                result = self.translate_text(content[field], target_lang)
                translated_content[field] = result['translation']
                translated_content[f'{field}_translation_method'] = result.get('method')
        
        translated_content['language'] = target_lang
        
        return translated_content
    
    def batch_translate_content(self,
                               content_list: List[Dict[str, any]],
                               target_lang: str = 'gu',
                               fields: Optional[List[str]] = None) -> List[Dict[str, any]]:
        """
        Translate multiple content objects
        
        Args:
            content_list: List of content dictionaries
            target_lang: Target language
            fields: Fields to translate
            
        Returns:
            List of translated content
        """
        return [
            self.translate_content(content, target_lang, fields)
            for content in content_list
        ]
    
    def get_available_translations(self, content_id: int) -> List[str]:
        """
        Get list of available language translations for content
        
        Args:
            content_id: Content ID
            
        Returns:
            List of language codes
        """
        if not self.supabase:
            return ['en']
        
        try:
            result = self.supabase.table('multilingual_content')\
                .select('language_code')\
                .eq('content_id', content_id)\
                .execute()
            
            languages = [row['language_code'] for row in result.data]
            
            # Always include English
            if 'en' not in languages:
                languages.insert(0, 'en')
            
            return languages
        except Exception as e:
            logger.error(f"Error fetching available translations: {e}")
            return ['en']
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Get all supported languages"""
        return SUPPORTED_LANGUAGES
    
    def _get_cached_translation(self, 
                               text: str, 
                               source_lang: str, 
                               target_lang: str) -> Optional[Dict[str, any]]:
        """Get translation from database cache"""
        try:
            # Create text hash for lookup
            text_hash = hashlib.md5(text.encode()).hexdigest()
            
            result = self.supabase.table('multilingual_content')\
                .select('*')\
                .eq('content_hash', text_hash)\
                .eq('source_language', source_lang)\
                .eq('language_code', target_lang)\
                .limit(1)\
                .execute()
            
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Cache lookup failed: {e}")
            return None
    
    def _cache_translation(self,
                          original_text: str,
                          translated_text: str,
                          source_lang: str,
                          target_lang: str,
                          method: str,
                          quality_score: float = 0.8):
        """Store translation in database cache"""
        try:
            text_hash = hashlib.md5(original_text.encode()).hexdigest()
            
            self.supabase.table('multilingual_content').insert({
                'content_hash': text_hash,
                'original_text': original_text,
                'translated_text': translated_text,
                'source_language': source_lang,
                'language_code': target_lang,
                'translation_method': method,
                'quality_score': quality_score,
                'created_at': datetime.now().isoformat()
            }).execute()
            
            logger.debug(f"✅ Translation cached in database")
        except Exception as e:
            logger.error(f"Cache storage failed: {e}")
    
    def get_stats(self) -> Dict[str, any]:
        """Get translation statistics"""
        total = sum(self.stats.values())
        return {
            **self.stats,
            'total_translations': total,
            'mlx_percentage': (self.stats['mlx_translations'] / total * 100) if total > 0 else 0
        }


# Singleton instance
_translation_service = None

def get_translation_service(supabase_client=None) -> TranslationService:
    """Get or create translation service singleton"""
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService(supabase_client)
    return _translation_service


# Testing
if __name__ == "__main__":
    print("🧪 Testing Translation Service")
    print("=" * 50)
    
    service = TranslationService()
    
    # Test single translation
    test_text = "Database Management System is software for storing and retrieving data."
    
    print(f"\n📝 Test: English → Gujarati")
    print(f"Input: {test_text}")
    
    result = service.translate_text(test_text, target_lang='gu')
    print(f"\nResult:")
    print(f"  Translation: {result['translation']}")
    print(f"  Method: {result['method']}")
    print(f"  Success: {result['success']}")
    
    # Test content translation
    print(f"\n📦 Test: Content object translation")
    content = {
        'title': 'Data Structures',
        'description': 'Learn about arrays, linked lists, and trees',
        'difficulty': 'medium'
    }
    
    translated = service.translate_content(content, target_lang='hi')
    print(f"Original: {content}")
    print(f"Translated: {translated}")
    
    # Stats
    print(f"\n📊 Statistics:")
    print(service.get_stats())
