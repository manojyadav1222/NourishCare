from flask import Blueprint, request

from auth_utils import login_required
from database import db
from models import MarketOrder, MarketOrderItem, MarketProduct
from routes.helpers import json_error, optional_int

bp = Blueprint("market", __name__)


@bp.get("/products")
def list_products():
    category = request.args.get("category")
    topic = request.args.get("topic")
    query = MarketProduct.query
    if category and category != "All":
        query = query.filter(MarketProduct.category == category)
    products = query.order_by(MarketProduct.category.asc(), MarketProduct.name.asc()).all()
    if topic:
        needle = topic.lower()
        products = [
            product
            for product in products
            if needle in product.category.lower()
            or any(needle in str(tag).lower() for tag in (product.nutrition_tags or []))
            or any(needle in str(item).lower() for item in (product.related_topics or []))
        ]
    return {"records": [product.to_dict() for product in products]}


@bp.get("/orders")
@login_required
def list_orders():
    return list_saved_lists()


@bp.get("/lists")
@login_required
def list_saved_lists():
    orders = (
        MarketOrder.query.filter_by(user_id=request.current_user.id)
        .order_by(MarketOrder.created_at.desc())
        .all()
    )
    return {"records": [order.to_dict() for order in orders]}


@bp.post("/orders")
@login_required
def create_order():
    return create_saved_list()


@bp.post("/lists")
@login_required
def create_saved_list():
    payload = request.get_json(silent=True) or {}
    items = payload.get("items")
    if not isinstance(items, list) or not items:
        return json_error("Add at least one product to your shopping list.")

    customer_name = str(payload.get("customer_name") or request.current_user.full_name or "").strip()
    if len(customer_name) < 2:
        return json_error("Shopping list name is required.")

    order = MarketOrder(
        user_id=request.current_user.id,
        customer_name=customer_name,
        phone=str(payload.get("phone") or request.current_user.phone or "Not required").strip(),
        address=str(payload.get("address") or "Buy directly from partner platforms").strip(),
        payment_method=str(payload.get("payment_method") or "Partner Platform Links"),
        status="Saved Shopping List",
    )
    total = 0.0
    for raw_item in items:
        product_id = optional_int(raw_item.get("product_id"), 1)
        quantity = optional_int(raw_item.get("quantity"), 1, 20) or 1
        product = MarketProduct.query.get(product_id)
        if not product:
            return json_error("One cart item is no longer available.")
        line_total = round(product.price * quantity, 2)
        total += line_total
        order.items.append(
            MarketOrderItem(
                product_id=product.id,
                product_name=product.name,
                quantity=quantity,
                unit_price=product.price,
                line_total=line_total,
            )
        )
    order.total_amount = round(total, 2)
    db.session.add(order)
    db.session.commit()
    return {"record": order.to_dict()}, 201
