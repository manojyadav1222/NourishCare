from flask import Blueprint, request

from auth_utils import login_required
from database import db
from models import HealthAssessment
from routes.helpers import json_error

bp = Blueprint("assessments", __name__)


@bp.get("")
@login_required
def list_assessments():
    records = (
        HealthAssessment.query.filter_by(user_id=request.current_user.id)
        .order_by(HealthAssessment.created_at.desc())
        .all()
    )
    return {"records": [record.to_dict() for record in records]}


@bp.post("")
@login_required
def create_assessment():
    payload = request.get_json(silent=True) or {}
    assessment_data = payload.get("assessment_data")
    wellness_summary = payload.get("wellness_summary")
    if not isinstance(assessment_data, dict) or not isinstance(wellness_summary, dict):
        return json_error("Assessment data and wellness summary are required.")
    record = HealthAssessment(
        user_id=request.current_user.id,
        assessment_data=assessment_data,
        wellness_summary=wellness_summary,
    )
    db.session.add(record)
    db.session.commit()
    return {"record": record.to_dict()}, 201
