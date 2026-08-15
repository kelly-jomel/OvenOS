from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from ..database import get_db
from ..models import Invoice, Purchase, WasteLog, User, Order, Party
from ..auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    bakery_id = current_user.bakery_id
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    
    # Financial Summary
    total_sales = db.query(func.sum(Invoice.total_amount)).filter(Invoice.bakery_id == bakery_id, Invoice.status == "paid").scalar() or 0.0
    total_purchases = db.query(func.sum(Purchase.total_amount)).filter(Purchase.bakery_id == bakery_id, Purchase.status == "paid").scalar() or 0.0
    
    accounts_receivable = db.query(func.sum(Invoice.total_amount)).filter(Invoice.bakery_id == bakery_id, Invoice.status == "unpaid").scalar() or 0.0
    accounts_payable = db.query(func.sum(Purchase.total_amount)).filter(Purchase.bakery_id == bakery_id, Purchase.status == "unpaid").scalar() or 0.0
    
    # Order Metrics
    total_orders = db.query(func.count(Order.id)).filter(Order.bakery_id == bakery_id).scalar() or 0
    
    # Orders by Customer
    orders_by_customer_raw = db.query(Order.customer_name, func.count(Order.id)).filter(Order.bakery_id == bakery_id).group_by(Order.customer_name).all()
    orders_by_customer = [{"name": name, "count": count} for name, count in orders_by_customer_raw]
    
    # Orders by Month
    orders = db.query(Order.created_at).filter(Order.bakery_id == bakery_id).all()
    orders_by_month_dict = {}
    for (created_at,) in orders:
        if created_at:
            month_key = created_at.strftime("%Y-%m")
            orders_by_month_dict[month_key] = orders_by_month_dict.get(month_key, 0) + 1
    
    orders_by_month = [{"month": k, "count": v} for k, v in sorted(orders_by_month_dict.items())]

    # 30-Day Revenue/Expenses Trend (grouped by day)
    invoices_30d = db.query(Invoice.created_at, Invoice.total_amount).filter(
        Invoice.bakery_id == bakery_id, 
        Invoice.created_at >= thirty_days_ago
    ).all()
    
    purchases_30d = db.query(Purchase.created_at, Purchase.total_amount).filter(
        Purchase.bakery_id == bakery_id,
        Purchase.created_at >= thirty_days_ago
    ).all()

    daily_data = {}
    for i in range(30):
        day = (now - timedelta(days=i)).strftime("%b %d")
        daily_data[day] = {"date": day, "revenue": 0.0, "expenses": 0.0}

    for (created_at, amount) in invoices_30d:
        if created_at:
            day = created_at.strftime("%b %d")
            if day in daily_data:
                daily_data[day]["revenue"] += amount
                
    for (created_at, amount) in purchases_30d:
        if created_at:
            day = created_at.strftime("%b %d")
            if day in daily_data:
                daily_data[day]["expenses"] += amount

    # Sort daily data chronologically
    chart_data = [daily_data[(now - timedelta(days=i)).strftime("%b %d")] for i in range(29, -1, -1)]

    return {
        "summary": {
            "total_sales": total_sales,
            "total_purchases": total_purchases,
            "accounts_receivable": accounts_receivable,
            "accounts_payable": accounts_payable,
            "total_orders": total_orders
        },
        "orders_by_customer": orders_by_customer,
        "orders_by_month": orders_by_month,
        "trend_chart_data": chart_data
    }
