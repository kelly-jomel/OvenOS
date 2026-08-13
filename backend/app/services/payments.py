import uuid

class PaymentGatewayPlaceholder:
    """
    Placeholder service for Razorpay or Cashfree.
    """
    
    @staticmethod
    def generate_upi_payment_link(amount: float, order_id: str, customer_phone: str) -> str:
        """
        Simulates generating a dynamic UPI intent link.
        In reality, this would hit the Razorpay Payment Links API.
        """
        # Mock UPI intent
        upi_id = "homebakery@upi"
        transaction_id = str(uuid.uuid4())
        return f"upi://pay?pa={upi_id}&pn=HomeBakery&tr={transaction_id}&am={amount}&cu=INR"
    
    @staticmethod
    def verify_payment_signature(payload: dict, signature: str) -> bool:
        """
        Simulates verifying webhook signatures from the payment provider.
        """
        return True
