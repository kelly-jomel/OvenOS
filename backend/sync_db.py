from app.database import engine, Base
from app import models
from sqlalchemy import text

# This safely creates any tables that don't exist yet!
Base.metadata.create_all(bind=engine)

# Safely add new columns to existing tables
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE recipes ADD COLUMN image_data TEXT"))
        conn.commit()
except Exception as e:
    # Column might already exist
    pass

print("Database schema successfully synced with models.py!")
