"""
Script untuk seed user dummy ke database.
Jalankan: python -m app.seed_user
(atau sesuaikan cara run dengan struktur project kamu)
"""

from sqlmodel import Session, select

from app.db.session import engine
from app.models.user import User, RoleEnum
from app.core.security import hash_password


def seed_users():
    dummy_users = [
        {
            "name": "dandyaji",
            "email": "dandyaji.it@gmail.com",
            "password": "admin1234",
            "role": RoleEnum.ADMIN,
        },
        {
            "name": "Fadilah Yunisyah",
            "email": "fadilah@forecastboard.com",
            "password": "fadilah123",
            "role": RoleEnum.USER,
        },
    ]

    with Session(engine) as session:
        for data in dummy_users:
            existing = session.exec(
                select(User).where(User.email == data["email"])
            ).first()

            if existing:
                print(f"Skip, sudah ada: {data['email']}")
                continue

            user = User(
                name=data["name"],
                email=data["email"],
                password=hash_password(data["password"]),
                role=data["role"],
            )
            session.add(user)
            print(f"Created: {data['email']} / {data['password']}")

        session.commit()

    print("\nSeed selesai.")


if __name__ == "__main__":
    seed_users()