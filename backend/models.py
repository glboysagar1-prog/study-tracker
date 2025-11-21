# Supabase models
from datetime import datetime
from typing import Optional, Dict, Any

# User model
class User:
    def __init__(self, id: Optional[int] = None, username: str = "", email: str = "", 
                 password_hash: str = "", college: str = "", branch: str = "", 
                 semester: str = "", created_at: Optional[datetime] = None):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.college = college
        self.branch = branch
        self.semester = semester
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "password_hash": self.password_hash,
            "college": self.college,
            "branch": self.branch,
            "semester": self.semester,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        # Handle Supabase response data which might be in a different format
        if not isinstance(data, dict):
            # Try to convert to dict
            try:
                data = dict(data)
            except:
                # If conversion fails, create empty dict
                data = {}
                
        return cls(
            id=data.get("id"),
            username=data.get("username", ""),
            email=data.get("email", ""),
            password_hash=data.get("password_hash", ""),
            college=data.get("college", ""),
            branch=data.get("branch", ""),
            semester=data.get("semester", ""),
            created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else None
        )