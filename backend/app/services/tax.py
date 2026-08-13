from abc import ABC, abstractmethod

class TaxStrategy(ABC):
    @abstractmethod
    def calculate_tax(self, base_amount: float) -> dict:
        """
        Calculate tax based on the strategy.
        Returns a dictionary with tax breakdowns and the total amount.
        """
        pass

class GSTStrategy(TaxStrategy):
    """
    Indian GST Strategy.
    Handles CGST + SGST (intra-state) or IGST (inter-state).
    """
    def __init__(self, is_inter_state: bool, gst_rate: float = 18.0):
        self.is_inter_state = is_inter_state
        self.gst_rate = gst_rate

    def calculate_tax(self, base_amount: float) -> dict:
        tax_amount = base_amount * (self.gst_rate / 100.0)
        
        result = {
            "base_amount": base_amount,
            "total_tax": tax_amount,
            "total_amount": base_amount + tax_amount,
            "breakdown": {}
        }
        
        if self.is_inter_state:
            result["breakdown"]["IGST"] = tax_amount
        else:
            half_tax = tax_amount / 2.0
            result["breakdown"]["CGST"] = half_tax
            result["breakdown"]["SGST"] = half_tax
            
        return result

class VATStrategy(TaxStrategy):
    """
    UK VAT Strategy.
    """
    def __init__(self, vat_rate: float = 20.0):
        self.vat_rate = vat_rate

    def calculate_tax(self, base_amount: float) -> dict:
        tax_amount = base_amount * (self.vat_rate / 100.0)
        return {
            "base_amount": base_amount,
            "total_tax": tax_amount,
            "total_amount": base_amount + tax_amount,
            "breakdown": {
                "VAT": tax_amount
            }
        }

class SalesTaxStrategy(TaxStrategy):
    """
    US Sales Tax Strategy.
    """
    def __init__(self, combined_rate: float):
        # Combined state + local sales tax rate based on zip code
        self.combined_rate = combined_rate

    def calculate_tax(self, base_amount: float) -> dict:
        tax_amount = base_amount * (self.combined_rate / 100.0)
        return {
            "base_amount": base_amount,
            "total_tax": tax_amount,
            "total_amount": base_amount + tax_amount,
            "breakdown": {
                "SalesTax": tax_amount
            }
        }

class TaxContext:
    def __init__(self, strategy: TaxStrategy):
        self._strategy = strategy
        
    def set_strategy(self, strategy: TaxStrategy):
        self._strategy = strategy
        
    def calculate(self, base_amount: float) -> dict:
        return self._strategy.calculate_tax(base_amount)
