from flask import Blueprint, request

from auth_utils import login_required
from database import db
from routes.helpers import json_error, optional_float, optional_int

bp = Blueprint("profile", __name__)


@bp.get("")
@login_required
def get_profile():
    return {"profile": request.current_user.to_dict()}


@bp.put("")
@login_required
def update_profile():
    payload = request.get_json(silent=True) or {}
    user = request.current_user

    if "full_name" in payload or "fullName" in payload:
        full_name = str(payload.get("full_name") or payload.get("fullName") or "").strip()
        if len(full_name) < 2:
            return json_error("Please enter your full name.")
        user.full_name = full_name

    if "age" in payload:
        user.age = optional_int(payload.get("age"), 1, 120)
    if "gender" in payload:
        user.gender = payload.get("gender") or None
    if "phone" in payload:
        user.phone = payload.get("phone") or None
    if "height" in payload:
        user.height = optional_float(payload.get("height"), 30, 300)
    if "weight" in payload:
        user.weight = optional_float(payload.get("weight"), 1, 500)
    if "diet_preference" in payload:
        user.diet_preference = payload.get("diet_preference") or None
    if "health_goal" in payload:
        user.health_goal = payload.get("health_goal") or None
    if "water_goal" in payload:
        user.water_goal = optional_int(payload.get("water_goal"), 1, 30) or user.water_goal

    db.session.commit()
    return {"profile": user.to_dict()}
