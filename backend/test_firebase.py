import firebase_admin
from google.auth.credentials import AnonymousCredentials

try:
    cred = AnonymousCredentials()
    firebase_admin.initialize_app(cred, options={'projectId': 'crumbledger-b8429'})
    print("Successfully initialized Firebase Admin with AnonymousCredentials!")
except Exception as e:
    print(f"Failed: {e}")
