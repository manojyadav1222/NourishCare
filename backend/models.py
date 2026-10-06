from datetime import date, datetime

from database import db


class SerializerMixin:
    def to_dict(self):
        raise NotImplementedError


class User(db.Model, SerializerMixin):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(50))
    phone = db.Column(db.String(30))
    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    diet_preference = db.Column(db.String(50))
    health_goal = db.Column(db.String(80))
    water_goal = db.Column(db.Integer, nullable=False, default=8)
    role = db.Column(db.String(20), nullable=False, default="user")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    bmi_records = db.relationship("BmiRecord", backref="user", cascade="all, delete-orphan")
    assessments = db.relationship("HealthAssessment", backref="user", cascade="all, delete-orphan")
    meal_plans = db.relationship("MealPlan", backref="user", cascade="all, delete-orphan")
    habit_logs = db.relationship("HabitLog", backref="user", cascade="all, delete-orphan")
    water_logs = db.relationship("WaterLog", backref="user", cascade="all, delete-orphan")
    orders = db.relationship("MarketOrder", backref="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "age": self.age,
            "gender": self.gender,
            "phone": self.phone,
            "height": self.height,
            "weight": self.weight,
            "diet_preference": self.diet_preference,
            "health_goal": self.health_goal,
            "water_goal": self.water_goal,
            "role": self.role,
            "created_at": self.created_at.isoformat(),
        }


class BmiRecord(db.Model, SerializerMixin):
    __tablename__ = "bmi_records"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    height = db.Column(db.Float, nullable=False)
    weight = db.Column(db.Float, nullable=False)
    bmi = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(30), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "height": self.height,
            "weight": self.weight,
            "bmi": self.bmi,
            "category": self.category,
            "created_at": self.created_at.isoformat(),
        }


class HealthAssessment(db.Model, SerializerMixin):
    __tablename__ = "health_assessments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    assessment_data = db.Column(db.JSON, nullable=False)
    wellness_summary = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "assessment_data": self.assessment_data,
            "wellness_summary": self.wellness_summary,
            "created_at": self.created_at.isoformat(),
        }


class MealPlan(db.Model, SerializerMixin):
    __tablename__ = "meal_plans"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    diet_preference = db.Column(db.String(50), nullable=False)
    health_goal = db.Column(db.String(80), nullable=False)
    budget = db.Column(db.String(30), nullable=False)
    meal_plan = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "diet_preference": self.diet_preference,
            "health_goal": self.health_goal,
            "budget": self.budget,
            "meal_plan": self.meal_plan,
            "created_at": self.created_at.isoformat(),
        }


class HabitLog(db.Model, SerializerMixin):
    __tablename__ = "habit_logs"
    __table_args__ = (db.UniqueConstraint("user_id", "habit_name", "date", name="unique_user_habit_date"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    habit_name = db.Column(db.String(100), nullable=False)
    completed = db.Column(db.Boolean, nullable=False, default=False)
    date = db.Column(db.Date, nullable=False, default=date.today, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "habit_name": self.habit_name,
            "completed": self.completed,
            "date": self.date.isoformat(),
        }


class WaterLog(db.Model, SerializerMixin):
    __tablename__ = "water_logs"
    __table_args__ = (db.UniqueConstraint("user_id", "date", name="unique_user_water_date"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    amount = db.Column(db.Integer, nullable=False, default=0)
    goal = db.Column(db.Integer, nullable=False, default=8)
    date = db.Column(db.Date, nullable=False, default=date.today, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "amount": self.amount,
            "goal": self.goal,
            "date": self.date.isoformat(),
        }


class NutritionArticle(db.Model, SerializerMixin):
    __tablename__ = "nutrition_articles"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=False, default="")
    content = db.Column(db.Text, nullable=False, default="")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "description": self.description,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
        }


class NutritionTip(db.Model, SerializerMixin):
    __tablename__ = "nutrition_tips"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(160), nullable=False)
    content = db.Column(db.Text, nullable=False, default="")
    category = db.Column(db.String(80), nullable=False, default="General")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "category": self.category,
            "created_at": self.created_at.isoformat(),
        }


class MarketProduct(db.Model, SerializerMixin):
    __tablename__ = "market_products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    category = db.Column(db.String(80), nullable=False, index=True)
    price = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(40), nullable=False, default="pack")
    platform = db.Column(db.String(80), nullable=False, default="Amazon")
    product_url = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=False, default="")
    health_benefit = db.Column(db.Text, nullable=False, default="")
    nutrition_tags = db.Column(db.JSON, nullable=False, default=list)
    related_topics = db.Column(db.JSON, nullable=False, default=list)
    stock_status = db.Column(db.String(30), nullable=False, default="In Stock")
    image_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    order_items = db.relationship("MarketOrderItem", backref="product")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "price": self.price,
            "unit": self.unit,
            "platform": self.platform,
            "product_url": self.product_url,
            "description": self.description,
            "health_benefit": self.health_benefit,
            "nutrition_tags": self.nutrition_tags or [],
            "related_topics": self.related_topics or [],
            "stock_status": self.stock_status,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat(),
        }


class MarketOrder(db.Model, SerializerMixin):
    __tablename__ = "market_orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    customer_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    address = db.Column(db.Text, nullable=False)
    payment_method = db.Column(db.String(40), nullable=False, default="Demo Order")
    status = db.Column(db.String(40), nullable=False, default="Placed")
    total_amount = db.Column(db.Float, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    items = db.relationship("MarketOrderItem", backref="order", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "customer_name": self.customer_name,
            "phone": self.phone,
            "address": self.address,
            "payment_method": self.payment_method,
            "status": self.status,
            "total_amount": self.total_amount,
            "created_at": self.created_at.isoformat(),
            "items": [item.to_dict() for item in self.items],
        }


class MarketOrderItem(db.Model, SerializerMixin):
    __tablename__ = "market_order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("market_orders.id"), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey("market_products.id", ondelete="SET NULL"), nullable=True, index=True)
    product_name = db.Column(db.String(160), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    unit_price = db.Column(db.Float, nullable=False)
    line_total = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "product_name": self.product_name,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "line_total": self.line_total,
        }
