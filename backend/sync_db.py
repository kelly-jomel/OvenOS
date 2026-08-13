from app.database import engine, Base
from app import models

# This safely creates any tables that don't exist yet!
Base.metadata.create_all(bind=engine)
print("Database schema successfully synced with models.py!")
