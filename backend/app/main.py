from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="OvenOS API",
    description="Backend API for the OvenOS Bakery Management System",
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
from .routers import inventory, billing, webhooks, users, orders, recipes, profile, parties, purchases, accounting, storefront
from fastapi import Depends

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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Home-Bakery SaaS API"}

@app.get("/secure-data")
def secure_data(user: dict = Depends(verify_token)):
    return {"message": "You are authenticated!", "user_id": user.get("uid")}

