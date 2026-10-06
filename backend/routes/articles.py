from flask import Blueprint

from models import NutritionArticle, NutritionTip

bp = Blueprint("articles", __name__)


@bp.get("/articles")
def list_articles():
    articles = NutritionArticle.query.order_by(NutritionArticle.category.asc(), NutritionArticle.title.asc()).all()
    return {"records": [article.to_dict() for article in articles]}


@bp.get("/tips")
def list_tips():
    tips = NutritionTip.query.order_by(NutritionTip.category.asc(), NutritionTip.title.asc()).all()
    return {"records": [tip.to_dict() for tip in tips]}
