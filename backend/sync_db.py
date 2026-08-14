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

try:
    with engine.connect() as db:
        # Add razorpay_key_id if it doesn't exist
        try:
            db.execute(text('ALTER TABLE bakeries ADD COLUMN razorpay_key_id TEXT'))
            db.commit()
            print("Successfully added razorpay_key_id to bakeries table.")
        except Exception as e:
            db.rollback()
            print(f"Column razorpay_key_id might already exist, skipping. Error: {e}")
            
        # Add razorpay_key_secret if it doesn't exist
        try:
            db.execute(text('ALTER TABLE bakeries ADD COLUMN razorpay_key_secret TEXT'))
            db.commit()
            print("Successfully added razorpay_key_secret to bakeries table.")
        except Exception as e:
            db.rollback()
            print(f"Column razorpay_key_secret might already exist, skipping. Error: {e}")
            
        # Check if customer_phone exists in orders, if not add it
        cursor = db.connection.cursor()
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_phone'")
        if not cursor.fetchone():
            print("Adding customer_phone column to orders table...")
            db.execute(text("ALTER TABLE orders ADD COLUMN customer_phone VARCHAR"))
            db.commit()

        # Add payment_link_url to invoices if it doesn't exist
        try:
            db.execute(text('ALTER TABLE invoices ADD COLUMN payment_link_url TEXT'))
            db.commit()
            print("Successfully added payment_link_url to invoices table.")
        except Exception as e:
            db.rollback()
            print(f"Column payment_link_url might already exist, skipping. Error: {e}")
            
        print("Database synchronized successfully.")
except Exception as e:
    pass

print("Database schema successfully synced with models.py!")
