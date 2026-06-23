from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel

class HeaderCreate(SQLModel):
    title: str
    description: Optional[str] = None
    userId: str

class HeaderRead(SQLModel):
    id: str
    title: str
    description: Optional[str]
    still_process: bool
    userId: str
    createdAt: datetime

class HeaderUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    still_process: Optional[bool] = None