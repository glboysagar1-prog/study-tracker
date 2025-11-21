"""
Quick script to test if the backend API endpoints are working
"""
import requests
import json

API_BASE = "http://localhost:5000/api"

def test_endpoints():
    print("="*60)
    print("Testing Backend API Endpoints")
    print("="*60)
    
    tests = [
        {
            "name": "Health Check",
            "url": f"{API_BASE}/health",
            "method": "GET"
        },
        {
            "name": "Material Sources",
            "url": f"{API_BASE}/material-sources",
            "method": "GET"
        },
        {
            "name": "Subject Metadata",
            "url": f"{API_BASE}/subjects/metadata",
            "method": "GET"
        },
        {
            "name": "Browse Materials (no filters)",
            "url": f"{API_BASE}/materials/browse",
            "method": "GET"
        },
        {
            "name": "Notes API (sample subject)",
            "url": f"{API_BASE}/notes/3140703",
            "method": "GET"
        },
        {
            "name": "Reference Materials API",
            "url": f"{API_BASE}/reference-materials/3140703",
            "method": "GET"
        },
        {
            "name": "Syllabus Content API",
            "url": f"{API_BASE}/syllabus-content/3140703",
            "method": "GET"
        },
        {
            "name": "Material Search",
            "url": f"{API_BASE}/materials/search?q=database",
            "method": "GET"
        },
        {
            "name": "Recent Materials",
            "url": f"{API_BASE}/materials/recent?days=7",
            "method": "GET"
        }
    ]
    
    results = []
    
    for test in tests:
        print(f"\n🧪 Testing: {test['name']}")
        print(f"   URL: {test['url']}")
        
        try:
            response = requests.get(test['url'], timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ PASSED - Status: {response.status_code}")
                
                # Show some data info
                if isinstance(data, dict):
                    if 'success' in data:
                        print(f"   Success: {data.get('success')}")
                    if 'count' in data:
                        print(f"   Count: {data.get('count')}")
                    # Show first few keys
                    keys = list(data.keys())[:5]
                    print(f"   Keys: {keys}")
                
                results.append({"test": test['name'], "status": "PASSED"})
            else:
                print(f"   ❌ FAILED - Status: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                results.append({"test": test['name'], "status": f"FAILED ({response.status_code})"})
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ FAILED - Cannot connect. Is backend running?")
            results.append({"test": test['name'], "status": "CONNECTION ERROR"})
        except Exception as e:
            print(f"   ❌ FAILED - Error: {str(e)}")
            results.append({"test": test['name'], "status": f"ERROR: {str(e)}"})
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    passed = sum(1 for r in results if r['status'] == 'PASSED')
    total = len(results)
    print(f"\n✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed! Backend APIs are working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
        print("\nCommon issues:")
        print("- Backend not running: Run 'python3 run_backend.py'")
        print("- Database schema not applied: Apply schema in Supabase")
        print("- No data yet: Run scrapers or add test data")
    
    return results

if __name__ == "__main__":
    print("Make sure backend is running on http://localhost:5000")
    print("Press Ctrl+C to cancel, or wait 3 seconds to continue...\n")
    
    import time
    time.sleep(3)
    
    test_endpoints()
