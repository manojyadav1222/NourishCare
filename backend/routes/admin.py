from flask import Blueprint, request

from auth_utils import admin_required
from database import db
from models import (
    BmiRecord,
    HabitLog,
    HealthAssessment,
    MealPlan,
    MarketOrder,
    MarketProduct,
    NutritionArticle,
    NutritionTip,
    User,
    WaterLog,
)
from routes.helpers import json_error

bp = Blueprint("admin", __name__)


@bp.get("/stats")
@admin_required
def stats():
    users = User.query.count()
    bmi_records = BmiRecord.query.count()
    assessments = HealthAssessment.query.count()
    meal_plans = MealPlan.query.count()
    habit_logs = HabitLog.query.count()
    water_logs = WaterLog.query.count()
    product_count = MarketProduct.query.count()
    order_count = MarketOrder.query.count()
    market_revenue = db.session.query(db.func.sum(MarketOrder.total_amount)).scalar() or 0
    latest_bmi = BmiRecord.query.order_by(BmiRecord.created_at.desc()).first()
    avg_bmi = db.session.query(db.func.avg(BmiRecord.bmi)).scalar() or 0
    avg_water = db.session.query(db.func.avg(WaterLog.amount)).scalar() or 0
    completed_habits = HabitLog.query.filter_by(completed=True).count()
    habit_completion_rate = round((completed_habits / habit_logs) * 100) if habit_logs else 0
    return {
        "stats": {
            "total_users": users,
            "total_bmi_records": bmi_records,
            "total_assessments": assessments,
            "total_meal_plans": meal_plans,
            "total_habit_logs": habit_logs,
            "total_water_logs": water_logs,
            "average_bmi": round(float(avg_bmi), 1),
            "average_daily_water": round(float(avg_water), 1),
            "habit_completion_rate": habit_completion_rate,
            "latest_bmi_category": latest_bmi.category if latest_bmi else None,
            "nutrition_articles": NutritionArticle.query.count(),
            "nutrition_tips": NutritionTip.query.count(),
            "market_products": product_count,
            "market_orders": order_count,
            "market_revenue": round(float(market_revenue), 2),
        }
    }


def product_payload(payload):
    tags = payload.get("nutrition_tags") or []
    topics = payload.get("related_topics") or []
    if isinstance(tags, str):
        tags = [item.strip() for item in tags.split(",") if item.strip()]
    if isinstance(topics, str):
        topics = [item.strip() for item in topics.split(",") if item.strip()]
    return {
        "name": str(payload.get("name") or "").strip(),
        "category": str(payload.get("category") or "Healthy Foods").strip(),
        "price": float(payload.get("price") or 0),
        "unit": str(payload.get("unit") or "pack").strip(),
        "platform": str(payload.get("platform") or "Amazon").strip(),
        "product_url": payload.get("product_url") or None,
        "description": str(payload.get("description") or "").strip(),
        "health_benefit": str(payload.get("health_benefit") or "").strip(),
        "nutrition_tags": tags,
        "related_topics": topics,
        "stock_status": str(payload.get("stock_status") or "In Stock").strip(),
        "image_url": payload.get("image_url") or None,
    }


@bp.get("/products")
@admin_required
def admin_products():
    products = MarketProduct.query.order_by(MarketProduct.created_at.desc()).all()
    return {"records": [product.to_dict() for product in products]}


@bp.post("/products")
@admin_required
def create_product():
    payload = product_payload(request.get_json(silent=True) or {})
    if not payload["name"] or payload["price"] <= 0:
        return json_error("Product name and a valid price are required.")
    product = MarketProduct(**payload)
    db.session.add(product)
    db.session.commit()
    return {"record": product.to_dict()}, 201


@bp.put("/products/<int:product_id>")
@admin_required
def update_product(product_id):
    product = MarketProduct.query.get_or_404(product_id)
    payload = product_payload(request.get_json(silent=True) or {})
    if not payload["name"] or payload["price"] <= 0:
        return json_error("Product name and a valid price are required.")
    for key, value in payload.items():
        setattr(product, key, value)
    db.session.commit()
    return {"record": product.to_dict()}


@bp.delete("/products/<int:product_id>")
@admin_required
def delete_product(product_id):
    product = MarketProduct.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return {"message": "Product deleted."}


@bp.get("/articles")
@admin_required
def admin_articles():
    articles = NutritionArticle.query.order_by(NutritionArticle.created_at.desc()).all()
    return {"records": [article.to_dict() for article in articles]}


@bp.post("/articles")
@admin_required
def create_article():
    payload = request.get_json(silent=True) or {}
    article = NutritionArticle(
        title=str(payload.get("title") or "").strip(),
        category=str(payload.get("category") or "General").strip(),
        description=str(payload.get("description") or "").strip(),
        content=str(payload.get("content") or "").strip(),
    )
    if not article.title or not article.content:
        return json_error("Article title and content are required.")
    db.session.add(article)
    db.session.commit()
    return {"record": article.to_dict()}, 201


@bp.put("/articles/<int:article_id>")
@admin_required
def update_article(article_id):
    article = NutritionArticle.query.get_or_404(article_id)
    payload = request.get_json(silent=True) or {}
    for key in ("title", "category", "description", "content"):
        if key in payload:
            setattr(article, key, str(payload.get(key) or "").strip())
    if not article.title or not article.content:
        return json_error("Article title and content are required.")
    db.session.commit()
    return {"record": article.to_dict()}


@bp.delete("/articles/<int:article_id>")
@admin_required
def delete_article(article_id):
    article = NutritionArticle.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return {"message": "Article deleted."}


@bp.get("/tips")
@admin_required
def admin_tips():
    tips = NutritionTip.query.order_by(NutritionTip.created_at.desc()).all()
    return {"records": [tip.to_dict() for tip in tips]}


@bp.post("/tips")
@admin_required
def create_tip():
    payload = request.get_json(silent=True) or {}
    tip = NutritionTip(
        title=str(payload.get("title") or "").strip(),
        content=str(payload.get("content") or "").strip(),
        category=str(payload.get("category") or "General").strip(),
    )
    if not tip.title or not tip.content:
        return json_error("Tip title and content are required.")
    db.session.add(tip)
    db.session.commit()
    return {"record": tip.to_dict()}, 201


@bp.put("/tips/<int:tip_id>")
@admin_required
def update_tip(tip_id):
    tip = NutritionTip.query.get_or_404(tip_id)
    payload = request.get_json(silent=True) or {}
    for key in ("title", "content", "category"):
        if key in payload:
            setattr(tip, key, str(payload.get(key) or "").strip())
    if not tip.title or not tip.content:
        return json_error("Tip title and content are required.")
    db.session.commit()
    return {"record": tip.to_dict()}


@bp.delete("/tips/<int:tip_id>")
@admin_required
def delete_tip(tip_id):
    tip = NutritionTip.query.get_or_404(tip_id)
    db.session.delete(tip)
    db.session.commit()
    return {"message": "Tip deleted."}
