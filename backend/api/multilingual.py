"""
Enhanced API endpoints for multilingual support and self-improvement
Integrates with MLX translation service and SEAL framework
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict
import logging

# Import our services
try:
    from backend.translation_service import get_translation_service
    from backend.self_improvement import ExperimentManager, RewardCalculator
    from backend.supabase_client import get_supabase_client
    SERVICES_AVAILABLE = True
except ImportError:
    SERVICES_AVAILABLE = False
    logging.warning("Translation services not available")

logger = logging.getLogger(__name__)

# Create API router
router = APIRouter(prefix="/api/multilingual", tags=["multilingual"])

# Pydantic models for request/response
class TranslationRequest(BaseModel):
    text: str
    target_language: str = 'gu'
    source_language: str = 'en'
    context: Optional[str] = None

class ContentTranslationRequest(BaseModel):
    content_id: int
    target_language: str
    content_type: str = 'study_material'

class DetailedFeedback(BaseModel):
    user_id: Optional[str] = None
    content_id: int
    content_variant_id: str
    clarity_rating: int
    accuracy_rating: int
    usefulness_rating: int
    overall_rating: int
    time_spent_seconds: int
    completed: bool
    comment: Optional[str] = None
    language_code: str = 'en'

class LanguagePreferences(BaseModel):
    user_id: str
    primary_language: str = 'en'
    secondary_languages: List[str] = []
    auto_translate: bool = False

# ==================== TRANSLATION ENDPOINTS ====================

@router.post("/translate")
async def translate_text(request: TranslationRequest):
    """
    Translate text to target language using MLX local model
    """
    if not SERVICES_AVAILABLE:
        raise HTTPException(status_code=503, detail="Translation service unavailable")
    
    try:
        supabase = get_supabase_client()
        translation_service = get_translation_service(supabase)
        
        result = translation_service.translate_text(
            text=request.text,
            target_lang=request.target_language,
            source_lang=request.source_language,
            context=request.context
        )
        
        return {
            "success": result['success'],
            "original_text": request.text,
            "translated_text": result['translation'],
            "source_language": request.source_language,
            "target_language": request.target_language,
            "method": result.get('method'),
            "inference_time": result.get('inference_time')
        }
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/content/{content_id}/languages")
async def get_available_languages(content_id: int):
    """
    Get list of available language translations for content
    """
    if not SERVICES_AVAILABLE:
        raise HTTPException(status_code=503, detail="Service unavailable")
    
    try:
        supabase = get_supabase_client()
        translation_service = get_translation_service(supabase)
        
        languages = translation_service.get_available_translations(content_id)
        
        return {
            "content_id": content_id,
            "available_languages": languages
        }
    except Exception as e:
        logger.error(f"Error fetching languages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/content/{content_id}/{language}")
async def get_translated_content(content_id: int, language: str):
    """
    Get content in specific language
    """
    if not SERVICES_AVAILABLE:
        raise HTTPException(status_code=503, detail="Service unavailable")
    
    try:
        supabase = get_supabase_client()
        
        # Get original content
        result = supabase.table('study_materials').select('*').eq('id', content_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Content not found")
        
        content = result.data
        
        # If requesting English or same as stored, return original
        if language == 'en' or language == content.get('language', 'en'):
            return {"content": content, "language": language, "translated": False}
        
        # Get translation
        translation_result = supabase.table('multilingual_content')\
            .select('*')\
            .eq('content_id', content_id)\
            .eq('language_code', language)\
            .limit(1)\
            .execute()
        
        if translation_result.data:
            # Translation exists
            translation = translation_result.data[0]
            content_copy = content.copy()
            content_copy['title'] = translation.get('translated_text', content['title'])
            content_copy['language'] = language
            
            return {
                "content": content_copy,
                "language": language,
                "translated": True,
                "translation_method": translation.get('translation_method'),
                "quality_score": translation.get('quality_score')
            }
        else:
            # Generate translation on-the-fly
            translation_service = get_translation_service(supabase)
            translated_content = translation_service.translate_content(content, language)
            
            return {
                "content": translated_content,
                "language": language,
                "translated": True,
                "translation_method": "on_demand"
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting translated content: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/supported-languages")
async def get_supported_languages():
    """
    Get all supported languages
    """
    if not SERVICES_AVAILABLE:
        # Return basic set if services not available
        return {
            "languages": {
                "en": "English",
                "gu": "Gujarati",
                "hi": "Hindi"
            }
        }
    
    try:
        translation_service = get_translation_service()
        languages = translation_service.get_supported_languages()
        
        return {"languages": languages}
    except Exception as e:
        logger.error(f"Error getting languages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== FEEDBACK & SELF-IMPROVEMENT ENDPOINTS ====================

@router.post("/feedback/detailed")
async def submit_detailed_feedback(feedback: DetailedFeedback):
    """
    Submit detailed user feedback for self-improvement loop
    """
    if not SERVICES_AVAILABLE:
        raise HTTPException(status_code=503, detail="Service unavailable")
    
    try:
        supabase = get_supabase_client()
        
        feedback_data = {
            "user_id": feedback.user_id,
            "content_id": feedback.content_id,
            "content_variant_id": feedback.content_variant_id,
            "clarity_rating": feedback.clarity_rating,
            "accuracy_rating": feedback.accuracy_rating,
            "usefulness_rating": feedback.usefulness_rating,
            "overall_rating": feedback.overall_rating,
            "time_spent_seconds": feedback.time_spent_seconds,
            "completed": feedback.completed,
            "comment": feedback.comment,
            "language_code": feedback.language_code
        }
        
        result = supabase.table('user_feedback_detailed').insert(feedback_data).execute()
        
        return {
            "success": True,
            "message": "Feedback recorded",
            "feedback_id": result.data[0]['id'] if result.data else None
        }
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/experiments/active")
async def get_active_experiments():
    """
    Get currently active A/B test experiments
    """
    if not SERVICES_AVAILABLE:
        return {"experiments": []}
    
    try:
        supabase = get_supabase_client()
        experiment_manager = ExperimentManager(supabase)
        
        experiments = experiment_manager.get_active_experiments()
        
        return {"experiments": experiments}
    except Exception as e:
        logger.error(f"Error fetching experiments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experiments/create")
async def create_experiment(
    topic: str,
    content_type: str = 'study_note',
    background_tasks: BackgroundTasks = None
):
    """
    Create a new A/B test experiment
    """
    if not SERVICES_AVAILABLE:
        raise HTTPException(status_code=503, detail="Service unavailable")
    
    try:
        supabase = get_supabase_client()
        experiment_manager = ExperimentManager(supabase)
        
        experiment_id = experiment_manager.create_experiment(topic, content_type)
        
        if experiment_id:
            return {
                "success": True,
                "experiment_id": experiment_id,
                "message": f"Experiment created for {topic}"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create experiment")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating experiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/experiments/{experiment_id}/log-impression")
async def log_content_impression(experiment_id: int, variant: str, user_id: Optional[str] = None):
    """
    Log that a user saw a specific variant
    """
    if not SERVICES_AVAILABLE:
        return {"success": False}
    
    try:
        supabase = get_supabase_client()
        
        # Update impression count
        field = 'variant_a_impressions' if variant == 'A' else 'variant_b_impressions'
        
        # This would increment the counter (simplified version)
        # In production, use proper SQL increment
        result = supabase.table('content_experiments').select(field).eq('id', experiment_id).single().execute()
        
        if result.data:
            current_count = result.data.get(field, 0)
            supabase.table('content_experiments').update({field: current_count + 1}).eq('id', experiment_id).execute()
        
        return {"success": True, "variant": variant}
    except Exception as e:
        logger.error(f"Error logging impression: {e}")
        return {"success": False, "error": str(e)}

# ==================== USER PREFERENCES ====================

@router.get("/user/language-preferences/{user_id}")
async def get_language_preferences(user_id: str):
    """
    Get user's language preferences
    """
    if not SERVICES_AVAILABLE:
        return {"primary_language": "en", "secondary_languages": [], "auto_translate": False}
    
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('user_language_preferences')\
            .select('*')\
            .eq('user_id', user_id)\
            .single()\
            .execute()
        
        if result.data:
            return result.data
        else:
            # Return defaults
            return {
                "user_id": user_id,
                "primary_language": "en",
                "secondary_languages": [],
                "auto_translate": False
            }
    except Exception as e:
        logger.error(f"Error getting preferences: {e}")
        return {"primary_language": "en", "secondary_languages": [], "auto_translate": False}

@router.post("/user/language-preferences")
async def update_language_preferences(preferences: LanguagePreferences):
    """
    Update user's language preferences
    """
    if not SERVICES_AVAILABLE:
        raise HTTPException(status_code=503, detail="Service unavailable")
    
    try:
        supabase = get_supabase_client()
        
        pref_data = {
            "user_id": preferences.user_id,
            "primary_language": preferences.primary_language,
            "secondary_languages": preferences.secondary_languages,
            "auto_translate": preferences.auto_translate
        }
        
        # Upsert (insert or update)
        result = supabase.table('user_language_preferences').upsert(pref_data).execute()
        
        return {
            "success": True,
            "message": "Preferences updated",
            "preferences": pref_data
        }
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== HEALTH & STATS ====================

@router.get("/health")
async def multilingual_health_check():
    """
    Check health of multilingual services
    """
    try:
        from backend.mlx_service import get_mlx_service
        
        mlx_service = get_mlx_service()
        health = mlx_service.health_check()
        
        return {
            "status": "healthy" if SERVICES_AVAILABLE else "degraded",
            "mlx_service": health,
            "services_available": SERVICES_AVAILABLE
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "services_available": False
        }

@router.get("/stats")
async def get_translation_stats():
    """
    Get translation service statistics
    """
    if not SERVICES_AVAILABLE:
        return {"stats": {}}
    
    try:
        translation_service = get_translation_service()
        stats = translation_service.get_stats()
        
        return {"stats": stats}
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return {"stats": {}, "error": str(e)}
