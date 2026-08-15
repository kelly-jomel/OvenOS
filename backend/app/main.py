from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CrumbLedger API",
    description="Backend API for the CrumbLedger Bakery Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from .auth import verify_token
from .routers import inventory, billing, webhooks, users, orders, recipes, profile, parties, purchases, accounting, storefront, subscription, dashboard, ai_import
from fastapi import Depends
from sqlalchemy.orm import Session
from . import database, models

# Ensure database tables are created automatically on startup
models.Base.metadata.create_all(bind=database.engine)

app.include_router(inventory.router)
app.include_router(billing.router)
app.include_router(webhooks.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(recipes.router)
app.include_router(profile.router)
app.include_router(parties.router)
app.include_router(purchases.router)
app.include_router(accounting.router)
app.include_router(storefront.router)
app.include_router(subscription.router)
app.include_router(dashboard.router)
app.include_router(ai_import.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Home-Bakery SaaS API"}

@app.get("/secure-data")
def secure_data(user: dict = Depends(verify_token)):
    return {"message": "You are authenticated!", "user_id": user.get("uid")}

@app.get("/patch-db")
def patch_db(db: Session = Depends(database.get_db)):
    from sqlalchemy import text
    from . import models
    # Create any missing tables (like inventory_items, purchases, etc.)
    models.Base.metadata.create_all(bind=database.engine)
    
    commands = [
        # bakeries
        "ALTER TABLE bakeries ADD COLUMN base_hourly_labor_rate FLOAT DEFAULT 0.0",
        "ALTER TABLE bakeries ADD COLUMN energy_cost_per_hour FLOAT DEFAULT 0.0",
        "ALTER TABLE bakeries ADD COLUMN misc_overhead_percentage FLOAT DEFAULT 5.0",
        # parties
        "ALTER TABLE parties ADD COLUMN gstin_or_tax_id VARCHAR",
        "ALTER TABLE parties ADD COLUMN is_b2b BOOLEAN DEFAULT FALSE",
        # recipes
        "ALTER TABLE recipes ADD COLUMN prep_time_minutes FLOAT DEFAULT 0.0",
        "ALTER TABLE recipes ADD COLUMN bake_time_minutes FLOAT DEFAULT 0.0",
        "ALTER TABLE recipes ADD COLUMN use_custom_overheads BOOLEAN DEFAULT FALSE",
        "ALTER TABLE recipes ADD COLUMN custom_labor_cost FLOAT DEFAULT 0.0",
        "ALTER TABLE recipes ADD COLUMN custom_overhead_cost FLOAT DEFAULT 0.0",
        # orders
        "ALTER TABLE orders ADD COLUMN delivery_date VARCHAR",
        # users
        "ALTER TABLE users ADD COLUMN phone VARCHAR",
        "ALTER TABLE users ADD COLUMN address VARCHAR",
        # inventory_items
        "ALTER TABLE inventory_items ADD COLUMN purchase_price FLOAT DEFAULT 0.0",
        "ALTER TABLE inventory_items ADD COLUMN contains_allergens VARCHAR",
        "ALTER TABLE inventory_items ADD COLUMN barcode VARCHAR",
        "ALTER TABLE inventory_items ADD COLUMN low_stock_threshold FLOAT DEFAULT 0.0",
        # purchases
        "ALTER TABLE purchases ADD COLUMN tax_amount FLOAT DEFAULT 0.0",
        "ALTER TABLE purchases ADD COLUMN notes VARCHAR",
        # purchase_items
        "ALTER TABLE purchase_items ADD COLUMN tax_rate FLOAT DEFAULT 0.0"
    ]
    results = []
    for cmd in commands:
        try:
            db.execute(text(cmd))
            db.commit()
            results.append(f"Success: {cmd}")
        except Exception as e:
            results.append(f"Failed: {cmd} - {str(e)}")
            db.rollback()
    
    return {"results": results}
