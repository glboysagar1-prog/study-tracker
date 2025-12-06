"""
Self-Improvement Framework (SEAL-inspired)
Continuous learning system for GTU AI

This module implements:
1. Inner Loop: Content variant generation and testing
2. Outer Loop: Reward calculation and prompt evolution  
3. A/B testing framework
4. Performance tracking and improvement logging
"""

import os
import json
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
import random
import statistics

from dotenv import load_dotenv

# Try to import Bytez for content generation
try:
    from bytez import Bytez
    BYTEZ_AVAILABLE = True
except ImportError:
    BYTEZ_AVAILABLE = False

load_dotenv()

logger = logging.getLogger(__name__)


@dataclass
class ContentVariant:
    """Represents a variant of generated content"""
    variant_id: str
    content: str
    prompt_template: str
    generation_params: Dict[str, any]
    created_at: datetime


@dataclass
class ExperimentResult:
    """Results from an A/B test experiment"""
    experiment_id: int
    winner: str  # 'A', 'B', or 'TIE'
    improvement: float  # Percentage improvement
    confidence: float  # Statistical confidence
    sample_size: int


class ContentVariantGenerator:
    """
    Generates multiple variants of educational content
    Using different prompts, styles, and approaches
    """
    
    def __init__(self, bytez_key: Optional[str] = None):
        self.bytez_key = bytez_key or os.getenv('BYTEZ_API_KEY')
        
        if BYTEZ_AVAILABLE and self.bytez_key:
            self.sdk = Bytez(self.bytez_key)
            self.llm = self.sdk.model("openai/gpt-4o")
        else:
            self.sdk = None
            self.llm = None
            logger.warning("Bytez not available - variant generation disabled")
    
    def generate_study_note_variants(self, 
                                     topic: str,
                                     context: str = "",
                                     num_variants: int = 2) -> List[ContentVariant]:
        """
        Generate multiple versions of study notes
        
        Different approaches:
        - Variant A: Detailed, academic style
        - Variant B: Concise, practical examples
        - Variant C: Visual/diagram-focused (if num_variants > 2)
        """
        if not self.llm:
            return []
        
        # Define different prompt templates
        templates = [
            # Template A: Academic style
            {
                'name': 'detailed_academic',
                'prompt': f"""Generate comprehensive study notes on: {topic}

Context: {context}

Structure:
1. Definition and Overview (detailed)
2. Key Concepts (with theory)
3. Important Properties/Characteristics
4. Real-world Applications
5. Common Pitfalls and Misconceptions

Style: Academic, thorough, suitable for exam preparation.
Length: 400-500 words.
Include: Formal definitions, theoretical foundations."""
            },
            
            # Template B: Practical style
            {
                'name': 'concise_practical',
                'prompt': f"""Create easy-to-understand study notes on: {topic}

Context: {context}

Structure:
1. Quick Definition (one sentence)
2. Core Concepts (bullet points)
3. Step-by-step Examples
4. Memory Tricks/Mnemonics
5. Quick Quiz Questions

Style: Conversational, practical, example-driven.
Length: 300-350 words.
Focus: Real examples, easy recall."""
            },
            
            # Template C: Visual/structured
            {
                'name': 'visual_structured',
                'prompt': f"""Design structured, visual-friendly notes on: {topic}

Context: {context}

Structure:
1. Key Points (numbered list, max 5)
2. Comparison Table (if applicable)
3. Process Flow (if applicable)
4. Important Formulas/Algorithms (highlighted)
5. Practice Problems

Style: Highly structured, easy to scan, diagram-ready.
Length: 350-400 words.
Format: Clear headings, lists, emphasis on visual organization."""
            }
        ]
        
        variants = []
        
        for i, template in enumerate(templates[:num_variants]):
            try:
                # Generate content
                messages = [{"role": "user", "content": template['prompt']}]
                response = self.llm.run(messages)
                
                if not response.error:
                    variant = ContentVariant(
                        variant_id=f"variant_{template['name']}_{datetime.now().timestamp()}",
                        content=response.output,
                        prompt_template=template['prompt'],
                        generation_params={'model': 'gpt-4o', 'temperature': 0.7},
                        created_at=datetime.now()
                    )
                    variants.append(variant)
                    logger.info(f"✅ Generated variant {i+1}/{num_variants}: {template['name']}")
                else:
                    logger.error(f"Error generating variant {i+1}: {response.error}")
                    
            except Exception as e:
                logger.error(f"Exception generating variant: {e}")
        
        return variants
    
    def generate_quiz_variants(self,
                              topic: str,
                              difficulty: str = 'medium',
                              num_questions: int = 5) -> List[ContentVariant]:
        """
        Generate different quiz variants
        - Variant A: MCQ focused
        - Variant B: Short answer focused
        """
        templates = [
            {
                'name': 'mcq_style',
                'prompt': f"""Create a {difficulty} difficulty quiz on: {topic}

Format: Multiple Choice Questions (MCQ)
Number: {num_questions} questions
Each question should have:
- Clear question statement
- 4 options (A, B, C, D)
- One correct answer
- Brief explanation why answer is correct

Difficulty: {difficulty}
Focus on: Conceptual understanding, not just memorization."""
            },
            {
                'name': 'short_answer_style',
                'prompt': f"""Create a {difficulty} difficulty quiz on: {topic}

Format: Short Answer Questions
Number: {num_questions} questions
Each question should:
- Test practical application
- Require 2-3 sentence answers
- Have clear evaluation criteria

Difficulty: {difficulty}
Focus on: Application, problem-solving, explanation skills."""
            }
        ]
        
        return self._generate_variants_from_templates(templates)
    
    def _generate_variants_from_templates(self, templates: List[Dict]) -> List[ContentVariant]:
        """Helper to generate variants from templates"""
        variants = []
        
        for template in templates:
            if not self.llm:
                break
                
            try:
                messages = [{"role": "user", "content": template['prompt']}]
                response = self.llm.run(messages)
                
                if not response.error:
                    variant = ContentVariant(
                        variant_id=f"{template['name']}_{int(datetime.now().timestamp())}",
                        content=response.output,
                        prompt_template=template['prompt'],
                        generation_params={'model': 'gpt-4o'},
                        created_at=datetime.now()
                    )
                    variants.append(variant)
            except Exception as e:
                logger.error(f"Error in variant generation: {e}")
        
        return variants


class RewardCalculator:
    """
    Calculates reward scores for content based on user feedback
    Used in SEAL-style outer loop
    """
    
    def __init__(self, supabase_client=None):
        self.supabase = supabase_client
    
    def calculate_content_score(self, content_variant_id: str) -> Dict[str, float]:
        """
        Calculate comprehensive score for a content variant
        
        Metrics:
        - Average rating (clarity + accuracy + usefulness)
        - Engagement score (time spent, completion rate)
        - User satisfaction (upvotes, low reports)
        
        Returns overall reward score (0.0 to 1.0)
        """
        if not self.supabase:
            return {'overall_score': 0.5, 'confidence': 0.0}
        
        try:
            # Get all feedback for this variant
            result = self.supabase.table('user_feedback_detailed')\
                .select('*')\
                .eq('content_variant_id', content_variant_id)\
                .execute()
            
            if not result.data or len(result.data) == 0:
                return {
                    'overall_score': 0.5,  # Neutral score
                    'sample_size': 0,
                    'confidence': 0.0
                }
            
            feedback_list = result.data
            sample_size = len(feedback_list)
            
            # Calculate rating score (0-1)
            ratings = []
            for fb in feedback_list:
                avg_rating = statistics.mean([
                    fb.get('clarity_rating', 3),
                    fb.get('accuracy_rating', 3),
                    fb.get('usefulness_rating', 3),
                    fb.get('overall_rating', 3)
                ])
                ratings.append(avg_rating / 5.0)  # Normalize to 0-1
            
            avg_rating_score = statistics.mean(ratings) if ratings else 0.5
            
            # Calculate engagement score (0-1)
            completed = sum(1 for fb in feedback_list if fb.get('completed', False))
            completion_rate = completed / sample_size
            
            avg_time_spent = statistics.mean([
                fb.get('time_spent_seconds', 0) for fb in feedback_list
            ])
            # Normalize time (assume 300s is "good" engagement)
            time_score = min(avg_time_spent / 300, 1.0)
            
            engagement_score = (completion_rate + time_score) / 2
            
            # Calculate satisfaction score (0-1)
            upvotes = sum(1 for fb in feedback_list if fb.get('upvoted', False))
            reports = sum(1 for fb in feedback_list if fb.get('reported_issue', False))
            
            upvote_rate = upvotes / sample_size
            report_penalty = reports / sample_size
            
            satisfaction_score = max(upvote_rate - report_penalty, 0.0)
            
            # Weighted overall score
            overall_score = (
                avg_rating_score * 0.5 +  # 50% weight on ratings
                engagement_score * 0.3 +   # 30% weight on engagement
                satisfaction_score * 0.2   # 20% weight on satisfaction
            )
            
            # Confidence based on sample size
            confidence = min(sample_size / 30, 1.0)  # Full confidence at 30+ samples
            
            return {
                'overall_score': overall_score,
                'rating_score': avg_rating_score,
                'engagement_score': engagement_score,
                'satisfaction_score': satisfaction_score,
                'sample_size': sample_size,
                'confidence': confidence,
                'avg_rating': statistics.mean(ratings) * 5 if ratings else 2.5,
                'completion_rate': completion_rate,
                'upvote_rate': upvote_rate
            }
            
        except Exception as e:
            logger.error(f"Error calculating score: {e}")
            return {'overall_score': 0.5, 'confidence': 0.0}
    
    def compare_variants(self, variant_a_id: str, variant_b_id: str) -> Dict[str, any]:
        """
        Compare two content variants
        
        Returns:
        - Which one is better
        - By how much (improvement percentage)
        - Statistical significance
        """
        score_a = self.calculate_content_score(variant_a_id)
        score_b = self.calculate_content_score(variant_b_id)
        
        # Determine winner
        if score_a['overall_score'] > score_b['overall_score'] + 0.05:  # 5% threshold
            winner = 'A'
            improvement = ((score_a['overall_score'] - score_b['overall_score']) / 
                          score_b['overall_score'] * 100)
        elif score_b['overall_score'] > score_a['overall_score'] + 0.05:
            winner = 'B'
            improvement = ((score_b['overall_score'] - score_a['overall_score']) / 
                          score_a['overall_score'] * 100)
        else:
            winner = 'TIE'
            improvement = 0.0
        
        # Statistical confidence (simplified)
        min_confidence = min(score_a['confidence'], score_b['confidence'])
        
        return {
            'winner': winner,
            'variant_a_score': score_a['overall_score'],
            'variant_b_score': score_b['overall_score'],
            'improvement_percentage': improvement,
            'confidence': min_confidence,
            'sample_size_a': score_a['sample_size'],
            'sample_size_b': score_b['sample_size'],
            'statistically_significant': min_confidence >= 0.8 and abs(improvement) >= 10
        }


class ExperimentManager:
    """
    Manages A/B testing experiments
    Implements SEAL-style self-improvement loops
    """
    
    def __init__(self, supabase_client=None, bytez_key: Optional[str] = None):
        self.supabase = supabase_client
        self.variant_generator = ContentVariantGenerator(bytez_key)
        self.reward_calculator = RewardCalculator(supabase_client)
        
        self.sample_rate = float(os.getenv('EXPERIMENT_SAMPLE_RATE', '0.2'))
    
    def create_experiment(self,
                         topic: str,
                         content_type: str = 'study_note',
                         num_variants: int = 2) -> Optional[int]:
        """
        Create a new A/B test experiment
        
        Steps:
        1. Generate content variants
        2. Store in database
        3. Return experiment ID
        """
        if not self.supabase:
            logger.error("Supabase client required for experiments")
            return None
        
        try:
            # Generate variants
            logger.info(f"🧪 Creating experiment for: {topic}")
            
            if content_type == 'study_note':
                variants = self.variant_generator.generate_study_note_variants(topic, num_variants=2)
            elif content_type == 'quiz':
                variants = self.variant_generator.generate_quiz_variants(topic)
            else:
                logger.error(f"Unsupported content type: {content_type}")
                return None
            
            if len(variants) < 2:
                logger.error("Failed to generate enough variants")
                return None
            
            # Create experiment record
            experiment_data = {
                'experiment_name': f"{content_type}_{topic}_{datetime.now().strftime('%Y%m%d')}",
                'content_type': content_type,
                'topic': topic,
                'variant_a_id': variants[0].variant_id,
                'variant_b_id': variants[1].variant_id,
                'variant_a_prompt': variants[0].prompt_template,
                'variant_b_prompt': variants[1].prompt_template,
                'status': 'active',
                'start_date': datetime.now().isoformat()
            }
            
            result = self.supabase.table('content_experiments').insert(experiment_data).execute()
            
            if result.data:
                experiment_id = result.data[0]['id']
                logger.info(f"✅ Experiment created: ID {experiment_id}")
                return experiment_id
            
        except Exception as e:
            logger.error(f"Error creating experiment: {e}")
        
        return None
    
    def should_show_variant_b(self) -> bool:
        """Decide if user should see variant B (based on sample rate)"""
        return random.random() < self.sample_rate
    
    def get_active_experiments(self) -> List[Dict[str, any]]:
        """Get all active experiments"""
        if not self.supabase:
            return []
        
        try:
            result = self.supabase.table('content_experiments')\
                .select('*')\
                .eq('status', 'active')\
                .execute()
            
            return result.data if result.data else []
        except Exception as e:
            logger.error(f"Error fetching experiments: {e}")
            return []
    
    def evaluate_experiment(self, experiment_id: int) -> Optional[ExperimentResult]:
        """
        Evaluate an experiment and determine winner
        """
        if not self.supabase:
            return None
        
        try:
            # Get experiment
            result = self.supabase.table('content_experiments')\
                .select('*')\
                .eq('id', experiment_id)\
                .single()\
                .execute()
            
            if not result.data:
                return None
            
            exp = result.data
            
            # Compare variants
            comparison = self.reward_calculator.compare_variants(
                exp['variant_a_id'],
                exp['variant_b_id']
            )
            
            # Update experiment with results
            update_data = {
                'variant_a_score': comparison['variant_a_score'],
                'variant_b_score': comparison['variant_b_score'],
                'winner': comparison['winner'],
                'improvement_percentage': comparison['improvement_percentage'],
                'sample_size': comparison['sample_size_a'] + comparison['sample_size_b'],
                'status': 'completed',
                'end_date': datetime.now().isoformat()
            }
            
            self.supabase.table('content_experiments')\
                .update(update_data)\
                .eq('id', experiment_id)\
                .execute()
            
            logger.info(f"🏆 Experiment {experiment_id} complete. Winner: {comparison['winner']}")
            
            return ExperimentResult(
                experiment_id=experiment_id,
                winner=comparison['winner'],
                improvement=comparison['improvement_percentage'],
                confidence=comparison['confidence'],
                sample_size=update_data['sample_size']
            )
            
        except Exception as e:
            logger.error(f"Error evaluating experiment: {e}")
            return None


# Testing
if __name__ == "__main__":
    print("🧪 Testing Self-Improvement Framework")
    print("=" * 50)
    
    # Test variant generation
    generator = ContentVariantGenerator()
    
    if generator.llm:
        print("\n📝 Generating study note variants...")
        variants = generator.generate_study_note_variants(
            topic="Binary Search Trees",
            context="Data Structures course",
            num_variants=2
        )
        
        for i, variant in enumerate(variants, 1):
            print(f"\n--- Variant {i} ---")
            print(f"ID: {variant.variant_id}")
            print(f"Preview: {variant.content[:200]}...")
    else:
        print("\n⚠️ Bytez not available - skipping variant generation")
    
    print("\n✅ Self-improvement framework ready!")
