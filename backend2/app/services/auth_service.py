from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.user import User
from app.core.security import verify_password, create_access_token


def login_user(db: Session, email: str, password: str) -> dict:
    """
    Validasi email & password, return token + data user kalau berhasil.
    """
    statement = select(User).where(User.email == email)
    user = db.exec(statement).first()

    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah",
        )

    if user.isDisabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun kamu sudah dinonaktifkan",
        )

    access_token = create_access_token(
        data={
            "sub": user.id,
            "email": user.email,
            "role": user.role.value,
        }
    )

    return {
        "token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value,
        },
    }