from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel
from app.models import RoleEnum

class UserCreate(SQLModel):
    name: str
    email: str
    password: str
    role: RoleEnum = RoleEnum.USER

class UserRead(SQLModel):
    id: str
    name: str
    email: str
    role: RoleEnum
    isDisabled: bool
    createdAt: datetime

class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    isDisabled: Optional[bool] = None