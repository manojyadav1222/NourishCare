from flask import Blueprint, current_app, request

from auth_utils import create_token, hash_password, verify_password
from database import db
from models import User
from routes.helpers import json_error, optional_int

bp = Blueprint("auth", __name__)


@bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    full_name = str(payload.get("full_name") or payload.get("fullName") or "").strip()
    email = str(payload.get("email") or "").strip().lower()
    password = str(payload.get("password") or "")

    if len(full_name) < 2:
        return json_error("Please enter your full name.")
    if "@" not in email:
        return json_error("Enter a valid email address.")
    if len(password) < 8:
        return json_error("Password must be at least 8 characters.")
    if User.query.filter_by(email=email).first():
        return json_error("That email is already registered.", 409)

    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        age=optional_int(payload.get("age"), 1, 120),
        gender=(payload.get("gender") or None),
        phone=(payload.get("phone") or None),
    )
    db.session.add(user)
    db.session.commit()

    return {"token": create_token(user.id), "user": user.to_dict()}, 201


@bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email") or "").strip().lower()
    password = str(payload.get("password") or "")
    user = User.query.filter_by(email=email).first()

    if not user or not verify_password(password, user.password_hash):
        return json_error("Invalid email or password.", 401)

    return {"token": create_token(user.id), "user": user.to_dict()}


@bp.get("/me")
def me():
    from auth_utils import login_required

    @login_required
    def _me():
        return {"user": request.current_user.to_dict()}

    return _me()


@bp.post("/forgot-password")
def forgot_password():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get("email") or "").strip().lower()
    user = User.query.filter_by(email=email).first()
    response = {"message": "If that email is registered, a reset token has been generated."}
    if user and current_app.config.get("ENV") != "production":
        response["reset_token"] = create_token(user.id, minutes=30, purpose="password_reset")
    return response


@bp.post("/reset-password")
def reset_password():
    from auth_utils import decode_token

    payload = request.get_json(silent=True) or {}
    token = str(payload.get("token") or "")
    password = str(payload.get("password") or "")
    if len(password) < 8:
        return json_error("Password must be at least 8 characters.")
    data = decode_token(token, expected_purpose="password_reset")
    if not data:
        return json_error("Invalid or expired reset token.", 401)
    user = User.query.get(data["sub"])
    if not user:
        return json_error("Invalid or expired reset token.", 401)
    user.password_hash = hash_password(password)
    db.session.commit()
    return {"message": "Password updated successfully."}
