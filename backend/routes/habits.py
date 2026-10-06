from flask import Blueprint, request

from auth_utils import login_required
from database import db
from models import HabitLog
from routes.helpers import json_error, parse_iso_date

bp = Blueprint("habits", __name__)


@bp.get("")
@login_required
def list_habits():
    query = HabitLog.query.filter_by(user_id=request.current_user.id)
    since = request.args.get("since")
    if since:
        query = query.filter(HabitLog.date >= parse_iso_date(since))
    records = query.order_by(HabitLog.date.desc(), HabitLog.habit_name.asc()).all()
    return {"records": [record.to_dict() for record in records]}


@bp.post("")
@login_required
def save_habit():
    payload = request.get_json(silent=True) or {}
    habit_name = str(payload.get("habit_name") or "").strip()
    if not habit_name:
        return json_error("Habit name is required.")
    habit_date = parse_iso_date(payload.get("date"))
    completed = bool(payload.get("completed"))
    record = HabitLog.query.filter_by(
        user_id=request.current_user.id,
        habit_name=habit_name,
        date=habit_date,
    ).first()
    if record:
        record.completed = completed
    else:
        record = HabitLog(
            user_id=request.current_user.id,
            habit_name=habit_name,
            date=habit_date,
            completed=completed,
        )
        db.session.add(record)
    db.session.commit()
    return {"record": record.to_dict()}
