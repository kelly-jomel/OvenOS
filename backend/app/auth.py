import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from sqlalchemy.orm import Session
from .database import get_db
from . import models

# Initialize Firebase Admin
# It expects the GOOGLE_APPLICATION_CREDENTIALS environment variable
# to point to a service account JSON file, or we can use the default app if running on GCP.
try:
    firebase_admin.get_app()
except ValueError:
    # App is not initialized yet
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Warning: For local testing only if credentials are not set.
        # In production, ensure credentials are provided.
        print("Warning: FIREBASE_CREDENTIALS_PATH not set. Initializing with Project ID for token verification only.")
        from google.auth.credentials import AnonymousCredentials
        firebase_admin.initialize_app(AnonymousCredentials(), options={'projectId': os.getenv("FIREBASE_PROJECT_ID", "crumbledger-b8429")})


security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(decoded_token: dict = Depends(verify_token), db: Session = Depends(get_db)):
    firebase_uid = decoded_token.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in database")
    
    return user

def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user
