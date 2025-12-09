import requests
import time

def test_agent_health():
    """Test the agent health endpoint"""
    try:
        # Test the health endpoint
        response = requests.get("http://localhost:8000/agent/health")
        if response.status_code == 200:
            data = response.json()
            print("Agent Health Check:")
            print(f"  Status: {data['status']}")
            print(f"  Timestamp: {data['timestamp']}")
            print("  AI Status:")
            ai_status = data['ai_status']
            for key, value in ai_status.items():
                print(f"    {key}: {value}")
            
            # Check if Bytez is properly configured
            if ai_status['bytez_key_configured']:
                print("\n✓ BYTEZ_API_KEY is configured")
                if ai_status['bytez_initialized']:
                    print("✓ Bytez client is initialized - AI should work!")
                else:
                    print("✗ Bytez client failed to initialize - check API key validity")
            else:
                print("\n✗ BYTEZ_API_KEY is NOT configured")
                print("  Please set BYTEZ_API_KEY in your environment variables")
        else:
            print(f"Health check failed with status code: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Error testing agent health: {e}")

if __name__ == "__main__":
    test_agent_health()