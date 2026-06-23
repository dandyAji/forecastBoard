from datetime import date, datetime
from sqlmodel import SQLModel

class DetailCreate(SQLModel):
    method_name: str
    date: date
    qty: int
    headerId: str

class DetailRead(SQLModel):
    id: str
    method_name: str
    date: date
    qty: int
    headerId: str
    createdAt: datetime