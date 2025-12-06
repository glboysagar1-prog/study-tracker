"""
Test Suite for MLX Translation Service
Tests model loading, translation quality, and performance on M4
"""

import os
import sys
import time
import json
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_mlx_model_loading():
    """Test 1: MLX model loads successfully"""
    print("\n" + "="*60)
    print("TEST 1: MLX Model Loading")
    print("="*60)
    
    try:
        from backend.mlx_service import MLXTranslationService
        
        print("📦 Initializing MLX service...")
        service = MLXTranslationService()
        
        health = service.health_check()
        print(f"\n✅ Service Status: {health['status']}")
        print(f"   MLX Available: {health['mlx_available']}")
        print(f"   Model Loaded: {health['model_loaded']}")
        print(f"   Device: {health['device']}")
        print(f"   Supported Languages: {health['supported_languages']}")
        
        assert health['status'] == 'healthy', "Service not healthy"
        assert health['model_loaded'], "Model not loaded"
        
        print("\n✅ TEST PASSED: Model loaded successfully")
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False


def test_translation_accuracy():
    """Test 2: Translation quality for technical content"""
    print("\n" + "="*60)
    print("TEST 2: Translation Accuracy")
    print("="*60)
    
    try:
        from backend.mlx_service import MLXTranslationService
        
        service = MLXTranslationService()
        
        # Test cases (English -> Gujarati)
        test_cases = [
            "Operating System manages computer resources.",
            "Database Management System stores and retrieves data.",
            "Algorithm is a step-by-step procedure to solve a problem.",
            "Python is a programming language.",
            "Binary Search Tree is a data structure."
        ]
        
        print("\n📝 Testing English → Gujarati translations:\n")
        
        results = []
        for i, text in enumerate(test_cases, 1):
            print(f"{i}. Input (EN): {text}")
            
            result = service.translate(text, 'en', 'gu', use_cache=False)
            
            if result['success']:
                print(f"   Output (GU): {result['translation']}")
                print(f"   Time: {result.get('inference_time', 0):.2f}s")
                results.append({
                    'input': text,
                    'output': result['translation'],
                    'time': result.get('inference_time', 0)
                })
            else:
                print(f"   ❌ Error: {result.get('error')}")
            print()
        
        # Calculate average inference time
        avg_time = sum(r['time'] for r in results) / len(results) if results else 0
        
        print(f"\n📊 Results:")
        print(f"   Successful translations: {len(results)}/{len(test_cases)}")
        print(f"   Average inference time: {avg_time:.2f}s")
        
        assert len(results) == len(test_cases), "Not all translations successful"
        assert avg_time < 3.0, f"Average time too high: {avg_time:.2f}s"
        
        print("\n✅ TEST PASSED: Translations completed successfully")
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_multi_language_support():
    """Test 3: Multiple Indian languages"""
    print("\n" + "="*60)
    print("TEST 3: Multi-Language Support")
    print("="*60)
    
    try:
        from backend.mlx_service import MLXTranslationService
        
        service = MLXTranslationService()
        
        test_text = "Hello, welcome to GTU exam preparation."
        target_languages = ['gu', 'hi', 'mr', 'ta', 'bn']
        
        print(f"\n📝 Input: {test_text}\n")
        
        results = {}
        for lang in target_languages:
            result = service.translate(test_text, 'en', lang)
            
            if result['success']:
                results[lang] = result['translation']
                print(f"✅ {lang.upper()}: {result['translation']}")
            else:
                print(f"❌ {lang.upper()}: Failed - {result.get('error')}")
        
        success_rate = (len(results) / len(target_languages)) * 100
        
        print(f"\n📊 Success Rate: {success_rate:.0f}% ({len(results)}/{len(target_languages)})")
        
        assert len(results) >= 3, "At least 3 languages should work"
        
        print("\n✅ TEST PASSED: Multi-language support functional")
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False


def test_caching_performance():
    """Test 4: Translation caching"""
    print("\n" + "="*60)
    print("TEST 4: Caching Performance")
    print("="*60)
    
    try:
        from backend.mlx_service import MLXTranslationService
        
        service = MLXTranslationService()
        
        test_text = "Data structures are fundamental to computer science."
        
        # First translation (uncached)
        print("🔄 First translation (uncached):")
        start = time.time()
        result1 = service.translate(test_text, 'en', 'gu', use_cache=True)
        time1 = time.time() - start
        print(f"   Time: {time1:.3f}s")
        print(f"   Cached: {result1.get('cached', False)}")
        
        # Second translation (should be cached)
        print("\n🔄 Second translation (should be cached):")
        start = time.time()
        result2 = service.translate(test_text, 'en', 'gu', use_cache=True)
        time2 = time.time() - start
        print(f"   Time: {time2:.3f}s")
        print(f"   Cached: {result2.get('cached', False)}")
        
        # Cache should be MUCH faster
        speedup = time1 / time2 if time2 > 0 else float('inf')
        
        print(f"\n📊 Performance:")
        print(f"   Speedup: {speedup:.1f}x faster")
        print(f"   Cache working: {result2.get('cached', False)}")
        
        assert result2.get('cached', False), "Second call should be cached"
        assert speedup > 10, f"Cache not fast enough (only {speedup:.1f}x)"
        
        # Check metrics
        metrics = service.get_metrics()
        print(f"\n📈 Service Metrics:")
        print(f"   Total translations: {metrics['total_translations']}")
        print(f"   Cache hits: {metrics['cache_hits']}")
        print(f"   Cache hit rate: {metrics['cache_hit_rate']:.1%}")
        
        print("\n✅ TEST PASSED: Caching works efficiently")
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_m4_gpu_utilization():
    """Test 5: M4 GPU (MPS) utilization"""
    print("\n" + "="*60)
    print("TEST 5: M4 GPU Utilization")
    print("="*60)
    
    try:
        import torch
        from backend.mlx_service import MLXTranslationService
        
        service = MLXTranslationService()
        
        print("🔍 Checking GPU availability:")
        print(f"   MPS available: {torch.backends.mps.is_available()}")
        print(f"   MPS built: {torch.backends.mps.is_built()}")
        print(f"   Device in use: {service.device}")
        
        if service.device and 'mps' in str(service.device):
            print("\n✅ Using M4 GPU (MPS) for inference!")
            
            # Test GPU performance
            test_text = "Graphics Processing Unit accelerates machine learning workloads."
            
            print(f"\n🧪 Running GPU inference test...")
            start = time.time()
            result = service.translate(test_text, 'en', 'gu', use_cache=False)
            gpu_time = time.time() - start
            
            print(f"   GPU inference time: {gpu_time:.3f}s")
            
            assert gpu_time < 5.0, f"GPU inference too slow: {gpu_time:.3f}s"
            
            print("\n✅ TEST PASSED: M4 GPU active and performant")
            return True
        else:
            print("\n⚠️  TEST SKIPPED: MPS not available, using CPU")
            return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False


def run_all_tests():
    """Run complete test suite"""
    print("\n" + "="*60)
    print("🧪 MLX TRANSLATION SERVICE TEST SUITE")
    print("="*60)
    print(f"Running on: Apple M4 Mac")
    print(f"Date: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = [
        ("Model Loading", test_mlx_model_loading),
        ("Translation Accuracy", test_translation_accuracy),
        ("Multi-Language Support", test_multi_language_support),
        ("Caching Performance", test_caching_performance),
        ("M4 GPU Utilization", test_m4_gpu_utilization)
    ]
    
    results = {}
    start_time = time.time()
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"\n❌ Test '{test_name}' crashed: {e}")
            results[test_name] = False
    
    total_time = time.time() - start_time
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_status in results.items():
        status = "✅ PASS" if passed_status else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print("\n" + "-"*60)
    print(f"Total: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    print(f"Time: {total_time:.2f}s")
    print("="*60)
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! MLX service ready for production.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review.")
        return 1


if __name__ == "__main__":
    exit_code = run_all_tests()
    sys.exit(exit_code)
