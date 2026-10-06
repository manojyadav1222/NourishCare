from flask import Blueprint, request

from auth_utils import login_required
from database import db
from models import WaterLog
from routes.helpers import json_error, optional_int, parse_iso_date

bp = Blueprint("water", __name__)


@bp.get("")
@login_required
def list_water():
    query = WaterLog.query.filter_by(user_id=request.current_user.id)
    since = request.args.get("since")
    if since:
        query = query.filter(WaterLog.date >= parse_iso_date(since))
    records = query.order_by(WaterLog.date.desc()).all()
    return {"records": [record.to_dict() for record in records]}


@bp.post("")
@login_required
def save_water():
    payload = request.get_json(silent=True) or {}
    log_date = parse_iso_date(payload.get("date"))
    amount = optional_int(payload.get("amount"), 0, 50)
    goal = optional_int(payload.get("goal"), 1, 50) or request.current_user.water_goal
    if amount is None:
        return json_error("Enter a valid water amount.")
    record = WaterLog.query.filter_by(user_id=request.current_user.id, date=log_date).first()
    if record:
        record.amount = amount
        record.goal = goal
    else:
        record = WaterLog(user_id=request.current_user.id, date=log_date, amount=amount, goal=goal)
        db.session.add(record)
    request.current_user.water_goal = goal
    db.session.commit()
    return {"record": record.to_dict(), "profile": request.current_user.to_dict()}
