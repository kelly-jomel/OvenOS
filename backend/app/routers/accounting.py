from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Invoice, Purchase, WasteLog, User
from ..auth import require_admin
from sqlalchemy import func

router = APIRouter(prefix="/accounting", tags=["Accounting"])

@router.get("/dashboard")
def get_accounting_dashboard(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    bakery_id = current_user.bakery_id
    
    total_sales = db.query(func.sum(Invoice.total_amount)).filter(Invoice.bakery_id == bakery_id, Invoice.status == "paid").scalar() or 0.0
    total_purchases = db.query(func.sum(Purchase.total_amount)).filter(Purchase.bakery_id == bakery_id, Purchase.status == "paid").scalar() or 0.0
    total_waste = db.query(func.sum(WasteLog.cost_value)).scalar() or 0.0 # WasteLog doesn't have bakery_id in model yet, simple sum for now
    
    accounts_receivable = db.query(func.sum(Invoice.total_amount)).filter(Invoice.bakery_id == bakery_id, Invoice.status == "unpaid").scalar() or 0.0
    accounts_payable = db.query(func.sum(Purchase.total_amount)).filter(Purchase.bakery_id == bakery_id, Purchase.status == "unpaid").scalar() or 0.0
    
    net_profit = total_sales - total_purchases - total_waste
    
    return {
        "profit_and_loss": {
            "total_sales": total_sales,
            "total_expenses": total_purchases,
            "total_waste": total_waste,
            "net_profit": net_profit
        },
        "balance_sheet": {
            "accounts_receivable": accounts_receivable,
            "accounts_payable": accounts_payable
        }
    }
