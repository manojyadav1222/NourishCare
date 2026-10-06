from flask import Flask
from flask_cors import CORS

from config import Config
from database import db
from models import MarketProduct, NutritionArticle, NutritionTip
from routes import register_routes


DEFAULT_ARTICLES = [
    ("Carbohydrates", "Nutrition Basics", "Carbohydrates provide energy for daily activity.", "Choose whole grains, millets, rice, roti, fruits and vegetables more often than refined sugary foods."),
    ("Protein", "Nutrition Basics", "Protein supports growth, repair and immunity.", "Affordable Indian protein sources include dal, chana, rajma, eggs, curd, paneer, soybeans, peanuts, fish and chicken."),
    ("Healthy Fats", "Nutrition Basics", "Healthy fats support hormones and vitamin absorption.", "Use small amounts of nuts, seeds, groundnut oil, mustard oil or sesame oil. Limit deep-fried and packaged foods."),
    ("Iron", "Micronutrients", "Iron helps carry oxygen in the blood.", "Include leafy greens, beans, jaggery, dates, eggs, meat or fish. Vitamin C foods like lemon or amla help iron absorption."),
    ("Calcium", "Micronutrients", "Calcium keeps bones and teeth strong.", "Milk, curd, ragi, sesame seeds, leafy greens and fortified foods can support calcium intake."),
    ("Vitamins", "Micronutrients", "Vitamins help the body use food well.", "Eat a variety of colourful fruits and vegetables across the week for better vitamin coverage."),
    ("Balanced Diet", "Healthy Eating", "A balanced plate includes grains, protein, vegetables and healthy fats.", "Aim for half the plate vegetables, one quarter grains and one quarter protein when possible."),
    ("Hydration", "Healthy Habits", "Water supports digestion, temperature control and concentration.", "Sip water through the day and increase intake during hot weather or exercise."),
    ("Food Hygiene", "Safety", "Clean food handling prevents illness.", "Wash hands, rinse produce, cook foods properly and store leftovers safely."),
    ("Portion Control", "Healthy Eating", "Portions help balance energy intake.", "Use smaller plates, eat slowly and listen for comfortable fullness."),
    ("Food Labels", "Healthy Eating", "Labels help compare packaged foods.", "Check serving size, added sugar, sodium and saturated fat before buying packaged foods."),
]

DEFAULT_TIPS = [
    ("Add lemon to dal or greens", "Vitamin C can help the body absorb iron from plant foods.", "Iron-rich foods"),
    ("Choose curd with meals", "Curd adds protein, calcium and helpful fermentation to a simple Indian meal.", "Protein-rich foods"),
    ("Reduce sugary drinks", "Water, buttermilk or unsweetened lemon water are better daily choices than sweet drinks.", "Sugar reduction"),
    ("Taste before adding salt", "Many foods already contain salt, so tasting first can reduce extra sodium.", "Salt reduction"),
    ("Walk after meals", "A short comfortable walk after meals supports digestion and daily movement.", "Physical activity"),
    ("Keep a sleep routine", "Regular sleep timing supports appetite, mood and energy.", "Sleep"),
]

DEFAULT_MARKET_PRODUCTS = [
    {
        "name": "Ragi Flour",
        "category": "Iron & Calcium",
        "price": 75,
        "unit": "1 kg pack",
        "description": "Affordable millet flour for rotis, dosa, porridge and laddus.",
        "health_benefit": "Supports calcium and iron intake in everyday meals.",
        "nutrition_tags": ["Iron", "Calcium", "Millet"],
        "related_topics": ["Iron", "Calcium", "Balanced Diet", "Children"],
    },
    {
        "name": "Roasted Chana",
        "category": "Protein Snacks",
        "price": 45,
        "unit": "250 g pouch",
        "description": "Crunchy roasted gram for a simple high-protein snack.",
        "health_benefit": "Helps replace fried packaged snacks with protein and fibre.",
        "nutrition_tags": ["Protein", "Fibre", "Healthy Snacks"],
        "related_topics": ["Protein", "Healthy Eating", "Sugar reduction"],
    },
    {
        "name": "Soy Chunks",
        "category": "Protein Staples",
        "price": 60,
        "unit": "500 g pack",
        "description": "Budget-friendly vegetarian protein for pulao, curry and rolls.",
        "health_benefit": "A low-cost way to improve daily protein intake.",
        "nutrition_tags": ["Protein", "Vegetarian", "Budget"],
        "related_topics": ["Protein", "Meal Planner", "Balanced Diet"],
    },
    {
        "name": "Moong Dal",
        "category": "Protein Staples",
        "price": 95,
        "unit": "1 kg pack",
        "description": "Light, easy-to-cook dal for khichdi, soup and sprouts.",
        "health_benefit": "Adds plant protein to regular Indian meals.",
        "nutrition_tags": ["Protein", "Dal", "Easy to digest"],
        "related_topics": ["Protein", "Older adults", "Balanced Diet"],
    },
    {
        "name": "Dates",
        "category": "Iron Foods",
        "price": 120,
        "unit": "500 g box",
        "description": "Naturally sweet dates for snacks and iron-rich recipes.",
        "health_benefit": "Useful as an iron-supportive snack in moderation.",
        "nutrition_tags": ["Iron", "Natural Sweetness"],
        "related_topics": ["Iron", "Women", "Sugar reduction"],
    },
    {
        "name": "Sesame Seeds",
        "category": "Iron & Calcium",
        "price": 55,
        "unit": "200 g pouch",
        "description": "Til seeds for chutney, laddus, podi and salad toppings.",
        "health_benefit": "Adds minerals and healthy fats in small portions.",
        "nutrition_tags": ["Iron", "Calcium", "Healthy Fats"],
        "related_topics": ["Iron", "Calcium", "Healthy fats"],
    },
    {
        "name": "Makhana",
        "category": "Healthy Snacks",
        "price": 85,
        "unit": "100 g pack",
        "description": "Light fox nuts that can be dry roasted with mild spices.",
        "health_benefit": "A lighter alternative to fried evening snacks.",
        "nutrition_tags": ["Healthy Snacks", "Low Oil"],
        "related_topics": ["Healthy Eating", "Portion Control", "Salt reduction"],
    },
    {
        "name": "Peanut Jaggery Chikki",
        "category": "Energy Snacks",
        "price": 35,
        "unit": "6 piece pack",
        "description": "Traditional peanut and jaggery snack for quick energy.",
        "health_benefit": "Combines peanuts with jaggery as a portion-controlled snack.",
        "nutrition_tags": ["Protein", "Energy", "Traditional"],
        "related_topics": ["Protein", "Children", "Portion Control"],
    },
    {
        "name": "Curd Starter Kit",
        "category": "Calcium Foods",
        "price": 50,
        "unit": "starter pack",
        "description": "Starter culture and guide card for setting curd at home.",
        "health_benefit": "Encourages affordable calcium and protein through homemade curd.",
        "nutrition_tags": ["Calcium", "Protein", "Fermented"],
        "related_topics": ["Calcium", "Protein", "Food Hygiene"],
    },
    {
        "name": "Mixed Nuts Mini Pack",
        "category": "Healthy Fats",
        "price": 99,
        "unit": "150 g pack",
        "description": "Small mix of peanuts, almonds and raisins for portioned snacking.",
        "health_benefit": "Provides healthy fats and minerals when eaten in small portions.",
        "nutrition_tags": ["Healthy Fats", "Minerals"],
        "related_topics": ["Healthy fats", "Portion Control", "Older adults"],
    },
]

PRODUCT_MEDIA = {
    "Ragi Flour": {
        "platform": "Amazon",
        "product_url": "https://www.amazon.in/s?k=ragi+flour",
        "image_url": "https://source.unsplash.com/800x600/?ragi,flour,millet",
    },
    "Roasted Chana": {
        "platform": "Blinkit",
        "product_url": "https://blinkit.com/s/?q=roasted%20chana",
        "image_url": "https://source.unsplash.com/800x600/?roasted,chickpeas",
    },
    "Soy Chunks": {
        "platform": "BigBasket",
        "product_url": "https://www.bigbasket.com/ps/?q=soy%20chunks",
        "image_url": "https://source.unsplash.com/800x600/?soy,chunks,protein",
    },
    "Moong Dal": {
        "platform": "JioMart",
        "product_url": "https://www.jiomart.com/search/moong%20dal",
        "image_url": "https://source.unsplash.com/800x600/?lentils,dal",
    },
    "Dates": {
        "platform": "Amazon",
        "product_url": "https://www.amazon.in/s?k=dates",
        "image_url": "https://source.unsplash.com/800x600/?dates,dryfruit",
    },
    "Sesame Seeds": {
        "platform": "BigBasket",
        "product_url": "https://www.bigbasket.com/ps/?q=sesame%20seeds",
        "image_url": "https://source.unsplash.com/800x600/?sesame,seeds",
    },
    "Makhana": {
        "platform": "Blinkit",
        "product_url": "https://blinkit.com/s/?q=makhana",
        "image_url": "https://source.unsplash.com/800x600/?makhana,foxnuts",
    },
    "Peanut Jaggery Chikki": {
        "platform": "JioMart",
        "product_url": "https://www.jiomart.com/search/chikki",
        "image_url": "https://source.unsplash.com/800x600/?peanut,chikki",
    },
    "Curd Starter Kit": {
        "platform": "Amazon",
        "product_url": "https://www.amazon.in/s?k=curd+starter+culture",
        "image_url": "https://source.unsplash.com/800x600/?curd,yogurt",
    },
    "Mixed Nuts Mini Pack": {
        "platform": "BigBasket",
        "product_url": "https://www.bigbasket.com/ps/?q=mixed%20nuts",
        "image_url": "https://source.unsplash.com/800x600/?mixed,nuts",
    },
}


def seed_content():
    if NutritionArticle.query.count() == 0:
        db.session.add_all(
            NutritionArticle(title=title, category=category, description=description, content=content)
            for title, category, description, content in DEFAULT_ARTICLES
        )
    if NutritionTip.query.count() == 0:
        db.session.add_all(
            NutritionTip(title=title, content=content, category=category)
            for title, content, category in DEFAULT_TIPS
        )
    if MarketProduct.query.count() == 0:
        db.session.add_all(
            MarketProduct(**{**product, **PRODUCT_MEDIA.get(product["name"], {})})
            for product in DEFAULT_MARKET_PRODUCTS
        )
    for product in MarketProduct.query.all():
        media = PRODUCT_MEDIA.get(product.name)
        if media:
            product.platform = product.platform or media["platform"]
            product.product_url = product.product_url or media["product_url"]
            product.image_url = product.image_url or media["image_url"]
    db.session.commit()


def ensure_sqlite_schema():
    if not str(db.engine.url).startswith("sqlite"):
        return
    existing = {
        row[1]
        for row in db.session.execute(db.text("PRAGMA table_info(market_products)")).fetchall()
    }
    if "platform" not in existing:
        db.session.execute(
            db.text("ALTER TABLE market_products ADD COLUMN platform VARCHAR(80) DEFAULT 'Amazon'")
        )
    if "product_url" not in existing:
        db.session.execute(db.text("ALTER TABLE market_products ADD COLUMN product_url TEXT"))
    db.session.commit()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    db.init_app(app)
    register_routes(app)

    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    with app.app_context():
        db.create_all()
        ensure_sqlite_schema()
        seed_content()

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
