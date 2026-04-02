"""
SQLAlchemy async models for paper trading persistence.
"""
import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Column, DateTime, Enum, Float, Integer, String, Text, Boolean, Index
)
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = "sqlite+aiosqlite:///data/paper_trading.db"

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class TradeStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    expired = "expired"


class OptionType(str, enum.Enum):
    call = "call"
    put = "put"
    underlying = "underlying"


class Trade(Base):
    __tablename__ = "trades"

    id = Column(Integer, primary_key=True, autoincrement=True)
    strategy = Column(String(50), nullable=False, index=True)
    symbol = Column(String(30), nullable=False)
    option_type = Column(Enum(OptionType), default=OptionType.underlying)
    direction = Column(String(10))          # long / short
    strike = Column(Float, nullable=True)
    expiry_date = Column(String(20), nullable=True)
    dte_entry = Column(Integer, nullable=True)

    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=True)
    volume = Column(Float, nullable=False)
    premium_received = Column(Float, default=0.0)   # for short options

    sl_price = Column(Float, nullable=True)
    tp_price = Column(Float, nullable=True)

    status = Column(Enum(TradeStatus), default=TradeStatus.open)
    opened_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)

    pnl = Column(Float, nullable=True)
    pnl_pct = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    # Leg group (for multi-leg strategies like iron condor)
    trade_group_id = Column(String(36), nullable=True, index=True)

    __table_args__ = (
        Index("ix_trades_strategy_status", "strategy", "status"),
    )


class EquityCurve(Base):
    __tablename__ = "equity_curve"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ts = Column(DateTime, default=datetime.utcnow, index=True)
    equity = Column(Float, nullable=False)
    cash = Column(Float, nullable=False)
    open_pnl = Column(Float, default=0.0)
    drawdown = Column(Float, default=0.0)
    strategy = Column(String(50), nullable=True)   # None = portfolio total


class StrategyStats(Base):
    __tablename__ = "strategy_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    strategy = Column(String(50), nullable=False, unique=True)
    total_trades = Column(Integer, default=0)
    winning_trades = Column(Integer, default=0)
    losing_trades = Column(Integer, default=0)
    total_pnl = Column(Float, default=0.0)
    avg_pnl = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    sharpe = Column(Float, default=0.0)
    win_rate = Column(Float, default=0.0)
    is_live = Column(Boolean, default=False)
    promoted_at = Column(DateTime, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ts = Column(DateTime, default=datetime.utcnow)
    level = Column(String(10))   # info / warning / critical
    message = Column(Text)
    acknowledged = Column(Boolean, default=False)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
