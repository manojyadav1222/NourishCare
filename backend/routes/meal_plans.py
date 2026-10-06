from flask import Blueprint, request

from auth_utils import login_required
from database import db
from models import MealPlan
from routes.helpers import json_error

bp = Blueprint("meal_plans", __name__)


@bp.get("")
@login_required
def list_meal_plans():
    records = (
        MealPlan.query.filter_by(user_id=request.current_user.id)
        .order_by(MealPlan.created_at.desc())
        .all()
    )
    return {"records": [record.to_dict() for record in records]}


@bp.post("")
@login_required
def create_meal_plan():
    payload = request.get_json(silent=True) or {}
    meal_plan = payload.get("meal_plan")
    if not isinstance(meal_plan, dict):
        return json_error("Meal plan content is required.")
    record = MealPlan(
        user_id=request.current_user.id,
        diet_preference=str(payload.get("diet_preference") or "Vegetarian"),
        health_goal=str(payload.get("health_goal") or "General wellness"),
        budget=str(payload.get("budget") or "medium"),
        meal_plan=meal_plan,
    )
    user = request.current_user
    user.diet_preference = record.diet_preference
    user.health_goal = record.health_goal
    db.session.add(record)
    db.session.commit()
    return {"record": record.to_dict(), "profile": user.to_dict()}, 201
