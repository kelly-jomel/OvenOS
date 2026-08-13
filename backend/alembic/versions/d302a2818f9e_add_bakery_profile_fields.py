"""add_bakery_profile_fields

Revision ID: d302a2818f9e
Revises: fa6eac2b2b90
Create Date: 2026-08-13 18:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd302a2818f9e'
down_revision: Union[str, Sequence[str], None] = 'fa6eac2b2b90'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Core Business Identity
    op.add_column('bakeries', sa.Column('trading_name', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('gstin', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('fssai_license_number', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('msme_udyam_number', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('pan_number', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('address', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('pin_code', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('godown_locations', sa.String(), nullable=True))

    # 2. Financial & Fintech
    op.add_column('bakeries', sa.Column('primary_upi_id', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('payment_links', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('bank_account_details', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('fiscal_year_start', sa.String(), server_default='04-01', nullable=True))
    op.add_column('bakeries', sa.Column('primary_tax_scheme', sa.String(), server_default='composition', nullable=True))
    op.add_column('bakeries', sa.Column('inventory_valuation_method', sa.String(), server_default='FIFO', nullable=True))

    # 3. Kitchen Operations
    op.add_column('bakeries', sa.Column('default_kitchen_unit', sa.String(), server_default='g', nullable=True))
    op.add_column('bakeries', sa.Column('kitchen_capacity_orders_per_day', sa.Integer(), nullable=True))
    op.add_column('bakeries', sa.Column('standard_lead_time_hours', sa.Integer(), server_default='24', nullable=True))
    op.add_column('bakeries', sa.Column('low_stock_alert_toggle', sa.Boolean(), server_default='true', nullable=True))
    op.add_column('bakeries', sa.Column('fefo_expiry_window_hours', sa.Integer(), server_default='48', nullable=True))

    # 4. Branding
    op.add_column('bakeries', sa.Column('business_logo_url', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('digital_signature_url', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('invoice_footer_text', sa.String(), nullable=True))
    op.add_column('bakeries', sa.Column('brand_color_palette', sa.String(), nullable=True))


def downgrade() -> None:
    # 4. Branding
    op.drop_column('bakeries', 'brand_color_palette')
    op.drop_column('bakeries', 'invoice_footer_text')
    op.drop_column('bakeries', 'digital_signature_url')
    op.drop_column('bakeries', 'business_logo_url')

    # 3. Kitchen Operations
    op.drop_column('bakeries', 'fefo_expiry_window_hours')
    op.drop_column('bakeries', 'low_stock_alert_toggle')
    op.drop_column('bakeries', 'standard_lead_time_hours')
    op.drop_column('bakeries', 'kitchen_capacity_orders_per_day')
    op.drop_column('bakeries', 'default_kitchen_unit')

    # 2. Financial & Fintech
    op.drop_column('bakeries', 'inventory_valuation_method')
    op.drop_column('bakeries', 'primary_tax_scheme')
    op.drop_column('bakeries', 'fiscal_year_start')
    op.drop_column('bakeries', 'bank_account_details')
    op.drop_column('bakeries', 'payment_links')
    op.drop_column('bakeries', 'primary_upi_id')

    # 1. Core Business Identity
    op.drop_column('bakeries', 'godown_locations')
    op.drop_column('bakeries', 'pin_code')
    op.drop_column('bakeries', 'address')
    op.drop_column('bakeries', 'pan_number')
    op.drop_column('bakeries', 'msme_udyam_number')
    op.drop_column('bakeries', 'fssai_license_number')
    op.drop_column('bakeries', 'gstin')
    op.drop_column('bakeries', 'trading_name')
