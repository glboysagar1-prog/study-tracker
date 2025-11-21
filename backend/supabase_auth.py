# Supabase authentication service
import bcrypt
from backend.supabase_client import supabase

def register_user(username, email, password, college="", branch="", semester=""):
    """Register a new user"""
    try:
        # Hash the password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insert user into Supabase
        user_data = {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "college": college,
            "branch": branch,
            "semester": semester
        }
        
        response = supabase.table("users").insert(user_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error registering user: {str(e)}")
        return None

def authenticate_user(email, password):
    """Authenticate a user"""
    try:
        # Get user by email
        response = supabase.table("users").select("*").eq("email", email).execute()
        
        if response.data and len(response.data) > 0:
            user = response.data[0]
            # Check password
            if bcrypt.checkpw(password.encode('utf-8'), user["password_hash"].encode('utf-8')):
                return user
        return None
    except Exception as e:
        print(f"Error authenticating user: {str(e)}")
        return None