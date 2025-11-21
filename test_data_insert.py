"""
Test script to insert sample data into Supabase tables
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import bcrypt

# Load environment variables
load_dotenv()

def test_data_insert():
    # Get Supabase credentials from environment
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_KEY must be set in environment variables")
        return
    
    try:
        # Create Supabase client
        supabase: Client = create_client(url, key)
        print("Supabase client created successfully!")
        
        # Hash a sample password
        password = "testpassword123"
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create a sample user
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password_hash": hashed_password,
            "college": "GTU",
            "branch": "Computer Engineering",
            "semester": "3"
        }
        
        # Insert the user
        result = supabase.table("users").insert(user_data).execute()
        print("Sample user inserted successfully!")
        if result.data and len(result.data) > 0:
            print(f"User ID: {result.data[0]['id']}")
        
        # Retrieve the user
        response = supabase.table("users").select("*").eq("email", "test@example.com").execute()
        if response.data and len(response.data) > 0:
            print("User retrieved successfully!")
            print(f"Username: {response.data[0]['username']}")
            print(f"Email: {response.data[0]['email']}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_data_insert()