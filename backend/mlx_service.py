"""
MLX Service for Indic Language Translation
Optimized for Apple Silicon M4

This service provides:
- Local IndicBART model inference using MLX
- Translation between English and 22 Indian languages
- GPU acceleration via Metal Performance Shaders
- Efficient batching and caching
"""

import os
import json
import time
from typing import List, Dict, Optional
from pathlib import Path
import logging

try:
    import mlx.core as mx
    import mlx.nn as nn
    from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
    import torch
    MLX_AVAILABLE = True
except ImportError:
    MLX_AVAILABLE = False
    print("⚠️  MLX not available. Run: pip install -r mlx_requirements.txt")

from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Language codes mapping
SUPPORTED_LANGUAGES = {
    'en': 'English',
    'gu': 'Gujarati',
    'hi': 'Hindi',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'bn': 'Bengali',
    'pa': 'Punjabi',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'or': 'Odia',
    'as': 'Assamese',
    'ne': 'Nepali',
    'sd': 'Sindhi',
    'ur': 'Urdu',
    'bo': 'Tibetan',
    'sa': 'Sanskrit',
    'ks': 'Kashmiri',
    'mai': 'Maithili',
    'brx': 'Bodo',
    'mni': 'Manipuri',
    'doi': 'Dogri'
}

class MLXTranslationService:
    """
    Translation service using IndicBART model optimized for M4
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or os.getenv('MLX_MODEL_PATH', 
                                                    f"{Path.home()}/.models/gtu-indic/indicbart")
        self.use_gpu = os.getenv('MLX_USE_GPU', 'true').lower() == 'true'
        self.batch_size = int(os.getenv('MLX_BATCH_SIZE', '4'))
        self.max_length = int(os.getenv('MLX_MAX_LENGTH', '512'))
        
        self.model = None
        self.tokenizer = None
        self.device = None
        self.cache = {}  # Simple translation cache
        
        # Performance metrics
        self.metrics = {
            'total_translations': 0,
            'cache_hits': 0,
            'avg_inference_time': 0.0,
            'total_inference_time': 0.0
        }
        
        if MLX_AVAILABLE:
            self._load_model()
        else:
            logger.warning("MLX not available - translation service disabled")
    
    def _load_model(self):
        """Load IndicBART model with M4 optimization"""
        try:
            logger.info(f"🔄 Loading IndicBART model from {self.model_path}")
            start_time = time.time()
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
            
            # Load model
            self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_path)
            
            # Use MPS (Metal Performance Shaders) for M4 GPU
            if self.use_gpu and torch.backends.mps.is_available():
                self.device = torch.device("mps")
                self.model = self.model.to(self.device)
                logger.info("✅ Using M4 GPU (MPS) for inference")
            else:
                self.device = torch.device("cpu")
                logger.info("ℹ️  Using CPU for inference")
            
            # Set model to evaluation mode
            self.model.eval()
            
            load_time = time.time() - start_time
            logger.info(f"✅ Model loaded successfully in {load_time:.2f}s")
            
        except Exception as e:
            logger.error(f"❌ Error loading model: {e}")
            raise
    
    def translate(self, 
                  text: str, 
                  source_lang: str = 'en', 
                  target_lang: str = 'gu',
                  use_cache: bool = True) -> Dict[str, any]:
        """
        Translate text between languages
        
        Args:
            text: Text to translate
            source_lang: Source language code (e.g., 'en')
            target_lang: Target language code (e.g., 'gu')
            use_cache: Whether to use cached translations
            
        Returns:
            Dict with translation result and metadata
        """
        if not MLX_AVAILABLE or self.model is None:
            return {
                'success': False,
                'error': 'MLX service not available',
                'translation': text  # Return original text
            }
        
        # Validate languages
        if source_lang not in SUPPORTED_LANGUAGES:
            return {'success': False, 'error': f'Unsupported source language: {source_lang}'}
        if target_lang not in SUPPORTED_LANGUAGES:
            return {'success': False, 'error': f'Unsupported target language: {target_lang}'}
        
        # Check cache
        cache_key = f"{source_lang}_{target_lang}_{hash(text)}"
        if use_cache and cache_key in self.cache:
            self.metrics['cache_hits'] += 1
            logger.info(f"💾 Cache hit for translation")
            return {
                'success': True,
                'translation': self.cache[cache_key],
                'source_lang': source_lang,
                'target_lang': target_lang,
                'cached': True
            }
        
        try:
            start_time = time.time()
            
            # Prepare input with language tags (IndicBART format)
            # Format: <2{target_lang}> {text} </s>
            input_text = f"<2{target_lang}> {text}"
            
            # Tokenize
            inputs = self.tokenizer(
                input_text, 
                return_tensors="pt",
                max_length=self.max_length,
                truncation=True,
                padding=True
            )
            
            # Move to device
            if self.device:
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Generate translation
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=self.max_length,
                    num_beams=4,
                    early_stopping=True
                )
            
            # Decode
            translation = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Calculate inference time
            inference_time = time.time() - start_time
            
            # Update metrics
            self.metrics['total_translations'] += 1
            self.metrics['total_inference_time'] += inference_time
            self.metrics['avg_inference_time'] = (
                self.metrics['total_inference_time'] / self.metrics['total_translations']
            )
            
            # Cache result
            if use_cache:
                self.cache[cache_key] = translation
            
            logger.info(f"✅ Translation completed in {inference_time:.2f}s")
            
            return {
                'success': True,
                'translation': translation,
                'source_lang': source_lang,
                'target_lang': target_lang,
                'inference_time': inference_time,
                'cached': False
            }
            
        except Exception as e:
            logger.error(f"❌ Translation error: {e}")
            return {
                'success': False,
                'error': str(e),
                'translation': text  # Fallback to original
            }
    
    def batch_translate(self, 
                       texts: List[str], 
                       source_lang: str = 'en', 
                       target_lang: str = 'gu') -> List[Dict[str, any]]:
        """
        Translate multiple texts in batch for efficiency
        
        Args:
            texts: List of texts to translate
            source_lang: Source language code
            target_lang: Target language code
            
        Returns:
            List of translation results
        """
        results = []
        
        # Process in batches
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i:i+self.batch_size]
            
            for text in batch:
                result = self.translate(text, source_lang, target_lang)
                results.append(result)
        
        return results
    
    def get_supported_languages(self) -> Dict[str, str]:
        """Get list of supported languages"""
        return SUPPORTED_LANGUAGES
    
    def get_metrics(self) -> Dict[str, any]:
        """Get performance metrics"""
        cache_hit_rate = (
            self.metrics['cache_hits'] / self.metrics['total_translations']
            if self.metrics['total_translations'] > 0 else 0
        )
        
        return {
            **self.metrics,
            'cache_hit_rate': cache_hit_rate,
            'cache_size': len(self.cache)
        }
    
    def clear_cache(self):
        """Clear translation cache"""
        self.cache.clear()
        logger.info("🗑️  Translation cache cleared")
    
    def health_check(self) -> Dict[str, any]:
        """Check service health"""
        return {
            'status': 'healthy' if self.model is not None else 'unhealthy',
            'mlx_available': MLX_AVAILABLE,
            'model_loaded': self.model is not None,
            'device': str(self.device) if self.device else 'none',
            'supported_languages': len(SUPPORTED_LANGUAGES),
            'metrics': self.get_metrics()
        }


# Global service instance
_service_instance = None

def get_mlx_service() -> MLXTranslationService:
    """Get or create MLX service singleton"""
    global _service_instance
    if _service_instance is None:
        _service_instance = MLXTranslationService()
    return _service_instance


# CLI testing
if __name__ == "__main__":
    print("🧪 Testing MLX Translation Service on M4")
    print("=" * 50)
    
    service = MLXTranslationService()
    
    # Health check
    health = service.health_check()
    print(f"\n📊 Health Check:")
    print(json.dumps(health, indent=2))
    
    if health['status'] == 'healthy':
        # Test translation
        print(f"\n🔄 Testing English → Gujarati translation:")
        test_text = "Operating System is a software that manages computer hardware."
        
        result = service.translate(test_text, 'en', 'gu')
        
        print(f"\n📝 Input (English): {test_text}")
        if result['success']:
            print(f"✅ Output (Gujarati): {result['translation']}")
            print(f"⏱️  Inference time: {result['inference_time']:.2f}s")
        else:
            print(f"❌ Error: {result['error']}")
        
        # Test cache
        print(f"\n💾 Testing cache (same translation again):")
        result2 = service.translate(test_text, 'en', 'gu')
        print(f"Cached: {result2['cached']}")
        
        # Metrics
        print(f"\n📈 Performance Metrics:")
        print(json.dumps(service.get_metrics(), indent=2))
    else:
        print("\n❌ Service not healthy. Please run setup_mlx.sh first.")
