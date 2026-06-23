from datetime import date, datetime
from typing import Optional
from sqlmodel import SQLModel

class TransactionCreate(SQLModel):
    date: date
    qty: int
    userId: str
    HeaderId: Optional[str] = None

class TransactionRead(SQLModel):
    id: str
    date: date
    qty: int
    userId: str
    HeaderId: Optional[str]
    createdAt: datetime