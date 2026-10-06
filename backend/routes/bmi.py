from flask import Blueprint, request

from auth_utils import login_required
from database import db
from models import BmiRecord
from routes.helpers import calculate_bmi, json_error, optional_float

bp = Blueprint("bmi", __name__)


@bp.get("")
@login_required
def list_bmi():
    records = (
        BmiRecord.query.filter_by(user_id=request.current_user.id)
        .order_by(BmiRecord.created_at.desc())
        .all()
    )
    return {"records": [record.to_dict() for record in records]}


@bp.post("")
@login_required
def create_bmi():
    payload = request.get_json(silent=True) or {}
    height = optional_float(payload.get("height"), 30, 300)
    weight = optional_float(payload.get("weight"), 1, 500)
    if not height or not weight:
        return json_error("Enter valid height and weight.")
    bmi, category = calculate_bmi(height, weight)
    record = BmiRecord(
        user_id=request.current_user.id,
        height=height,
        weight=weight,
        bmi=bmi,
        category=category,
    )
    request.current_user.height = height
    request.current_user.weight = weight
    db.session.add(record)
    db.session.commit()
    return {"record": record.to_dict(), "profile": request.current_user.to_dict()}, 201
