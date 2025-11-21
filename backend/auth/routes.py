from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.auth import auth_bp
from backend.supabase_client import supabase
import bcrypt

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    try:
        existing_user = supabase.table("users").select("*").eq("email", data['email']).execute()
        if existing_user.data and len(existing_user.data) > 0:
            return jsonify({'message': 'User already exists'}), 400
    except Exception as e:
        pass  # Continue if check fails
    
    # Hash the password
    password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create new user
    user_data = {
        "username": data['username'],
        "email": data['email'],
        "password_hash": password_hash,
        "college": data.get('college', ''),
        "branch": data.get('branch', ''),
        "semester": data.get('semester', '')
    }
    
    try:
        result = supabase.table("users").insert(user_data).execute()
        if result.data:
            return jsonify({'message': 'User created successfully'}), 201
        else:
            return jsonify({'message': 'Failed to create user'}), 500
    except Exception as e:
        return jsonify({'message': f'Error creating user: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    try:
        # Get user by email
        response = supabase.table("users").select("*").eq("email", data['email']).execute()
        
        if response.data and len(response.data) > 0:
            user = response.data[0]
            # Check password
            if bcrypt.checkpw(data['password'].encode('utf-8'), user["password_hash"].encode('utf-8')):
                access_token = create_access_token(identity=user["id"])
                return jsonify({
                    'access_token': access_token,
                    'user': {
                        'id': user["id"],
                        'username': user["username"],
                        'email': user["email"],
                        'college': user["college"],
                        'branch': user["branch"],
                        'semester': user["semester"]
                    }
                }), 200
    except Exception as e:
        pass
    
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    current_user_id = get_jwt_identity()
    
    try:
        # Get user by id
        response = supabase.table("users").select("*").eq("id", current_user_id).execute()
        
        if response.data and len(response.data) > 0:
            user = response.data[0]
            return jsonify({
                'id': user["id"],
                'username': user["username"],
                'email': user["email"],
                'college': user["college"],
                'branch': user["branch"],
                'semester': user["semester"]
            }), 200
        else:
            return jsonify({'message': 'User not found'}), 404
    except Exception as e:
        return jsonify({'message': f'Error fetching user: {str(e)}'}), 500