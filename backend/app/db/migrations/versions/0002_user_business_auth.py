"""0002_user_business_auth: Create users, businesses, and business_memberships tables.

Revision ID: 0002_user_business_auth
Revises: 0001_baseline
Create Date: 2026-09-14 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0002_user_business_auth"
down_revision: str | None = "0001_baseline"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    # 2. Create businesses table
    op.create_table(
        "businesses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "owner_user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="RESTRICT"),
            nullable=False,
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "business_type",
            sa.String(length=50),
            server_default="restaurant_cafe",
            nullable=False,
        ),
        sa.Column(
            "currency", sa.String(length=10), server_default="INR", nullable=False
        ),
        sa.Column(
            "timezone",
            sa.String(length=50),
            server_default="Asia/Kolkata",
            nullable=False,
        ),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        op.f("ix_businesses_owner_user_id"),
        "businesses",
        ["owner_user_id"],
        unique=False,
    )

    # 3. Create business_memberships table
    op.create_table(
        "business_memberships",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "business_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("businesses.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role", sa.String(length=50), server_default="owner", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("user_id", "business_id", name="uq_user_business"),
    )
    op.create_index(
        op.f("ix_business_memberships_user_id"),
        "business_memberships",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_business_memberships_business_id"),
        "business_memberships",
        ["business_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_business_memberships_business_id"), table_name="business_memberships"
    )
    op.drop_index(
        op.f("ix_business_memberships_user_id"), table_name="business_memberships"
    )
    op.drop_table("business_memberships")

    op.drop_index(op.f("ix_businesses_owner_user_id"), table_name="businesses")
    op.drop_table("businesses")

    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
