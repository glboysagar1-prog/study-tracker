# Supabase service for database operations
from typing import List, Optional, Dict, Any
from backend.supabase_client import supabase
from backend.models import User, Subject, Syllabus, Question, PreviousPaper, MockTest, TestQuestion, StudyMaterial
import bcrypt
from datetime import datetime
import json

class SupabaseService:
    @staticmethod
    def create_user(username: str, email: str, password: str, college: str = "", branch: str = "", semester: str = "") -> Optional[User]:
        """Create a new user with hashed password"""
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
            
            if response.data:
                # Convert Supabase response to dict
                user_dict = dict(response.data[0])
                return User.from_dict(user_dict)
            return None
        except Exception as e:
            print(f"Error creating user: {str(e)}")
            return None
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email"""
        try:
            response = supabase.table("users").select("*").eq("email", email).execute()
            
            if response.data and len(response.data) > 0:
                # Convert Supabase response to dict
                user_dict = dict(response.data[0])
                return User.from_dict(user_dict)
            return None
        except Exception as e:
            print(f"Error getting user by email: {str(e)}")
            return None
    
    @staticmethod
    def check_user_password(user: User, password: str) -> bool:
        """Check if provided password matches hashed password"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8'))
        except Exception as e:
            print(f"Error checking password: {str(e)}")
            return False
    
    @staticmethod
    def get_all_subjects() -> List[Subject]:
        """Get all subjects"""
        try:
            response = supabase.table("subjects").select("*").execute()
            
            subjects = []
            if response.data:
                for subject_data in response.data:
                    # Convert Supabase response to dict
                    subject_dict = dict(subject_data)
                    subjects.append(Subject.from_dict(subject_dict))
            return subjects
        except Exception as e:
            print(f"Error getting subjects: {str(e)}")
            return []
    
    @staticmethod
    def get_subject_syllabus(subject_id: int) -> List[Syllabus]:
        """Get syllabus for a subject"""
        try:
            response = supabase.table("syllabus").select("*").eq("subject_id", subject_id).order("unit_number").execute()
            
            syllabi = []
            if response.data:
                for syllabus_data in response.data:
                    # Convert Supabase response to dict
                    syllabus_dict = dict(syllabus_data)
                    syllabi.append(Syllabus.from_dict(syllabus_dict))
            return syllabi
        except Exception as e:
            print(f"Error getting subject syllabus: {str(e)}")
            return []
    
    @staticmethod
    def get_subject_questions(subject_id: int) -> List[Question]:
        """Get questions for a subject"""
        try:
            response = supabase.table("questions").select("*").eq("subject_id", subject_id).execute()
            
            questions = []
            if response.data:
                for question_data in response.data:
                    # Convert Supabase response to dict
                    question_dict = dict(question_data)
                    questions.append(Question.from_dict(question_dict))
            return questions
        except Exception as e:
            print(f"Error getting subject questions: {str(e)}")
            return []
    
    @staticmethod
    def get_subject_papers(subject_id: int) -> List[PreviousPaper]:
        """Get previous papers for a subject"""
        try:
            response = supabase.table("previous_papers").select("*").eq("subject_id", subject_id).execute()
            
            papers = []
            if response.data:
                for paper_data in response.data:
                    # Convert Supabase response to dict
                    paper_dict = dict(paper_data)
                    papers.append(PreviousPaper.from_dict(paper_dict))
            return papers
        except Exception as e:
            print(f"Error getting subject papers: {str(e)}")
            return []
    
    @staticmethod
    def get_all_mock_tests() -> List[MockTest]:
        """Get all mock tests"""
        try:
            response = supabase.table("mock_tests").select("*").execute()
            
            tests = []
            if response.data:
                for test_data in response.data:
                    # Convert Supabase response to dict
                    test_dict = dict(test_data)
                    tests.append(MockTest.from_dict(test_dict))
            return tests
        except Exception as e:
            print(f"Error getting mock tests: {str(e)}")
            return []

# Global instance
supabase_service = SupabaseService()