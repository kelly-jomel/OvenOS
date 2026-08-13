import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

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
        print("Warning: FIREBASE_CREDENTIALS_PATH not set. Auth will fail if not using GCP defaults.")
        firebase_admin.initialize_app()


security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
