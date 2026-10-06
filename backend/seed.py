import os

from app import create_app, seed_content
from auth_utils import hash_password
from database import db
from models import User


def seed_admin():
    name = os.getenv("ADMIN_FULL_NAME", "NourishCare Admin")
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    if not email or not password:
        print("Skipped admin seed. Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.")
        return
    user = User.query.filter_by(email=email.lower()).first()
    if user:
        user.full_name = name
        user.role = "admin"
    else:
        user = User(
            full_name=name,
            email=email.lower(),
            password_hash=hash_password(password),
            role="admin",
            water_goal=8,
        )
        db.session.add(user)
    db.session.commit()
    print(f"Admin account ready: {email.lower()}")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_content()
        seed_admin()
        print("Seed complete.")
