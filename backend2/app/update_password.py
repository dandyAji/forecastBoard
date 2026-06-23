"""
Script untuk update password user tertentu.
Jalankan: python -m app.update_password
"""

from sqlmodel import Session, select

from app.db.session import engine
from app.models.user import User
from app.core.security import hash_password


def update_password(email: str, new_password: str):
    with Session(engine) as session:
        user = session.exec(
            select(User).where(User.email == email)
        ).first()

        if not user:
            print(f"User tidak ditemukan: {email}")
            return

        user.password = hash_password(new_password)
        session.add(user)
        session.commit()

        print(f"Password berhasil diupdate untuk: {email}")


if __name__ == "__main__":
    update_password(
        email="fadilah@forecastboard.com",
        new_password="semangatskripsinya",
    )