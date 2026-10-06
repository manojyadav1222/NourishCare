from routes.admin import bp as admin_bp
from routes.articles import bp as articles_bp
from routes.assistant import bp as assistant_bp
from routes.assessments import bp as assessments_bp
from routes.auth import bp as auth_bp
from routes.bmi import bp as bmi_bp
from routes.habits import bp as habits_bp
from routes.meal_plans import bp as meal_plans_bp
from routes.market import bp as market_bp
from routes.profile import bp as profile_bp
from routes.water import bp as water_bp


def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(assistant_bp, url_prefix="/api/assistant")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(bmi_bp, url_prefix="/api/bmi")
    app.register_blueprint(assessments_bp, url_prefix="/api/assessments")
    app.register_blueprint(meal_plans_bp, url_prefix="/api/meal-plans")
    app.register_blueprint(market_bp, url_prefix="/api/market")
    app.register_blueprint(habits_bp, url_prefix="/api/habits")
    app.register_blueprint(water_bp, url_prefix="/api/water")
    app.register_blueprint(articles_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
