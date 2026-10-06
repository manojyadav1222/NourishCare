from flask import Blueprint, request

from routes.helpers import json_error

bp = Blueprint("assistant", __name__)


LANGUAGES = {"en-IN", "hi-IN", "te-IN"}

TOPIC_KEYWORDS = {
    "iron": [
        "iron",
        "anaemia",
        "anemia",
        "haemoglobin",
        "hemoglobin",
        "ragi",
        "dates",
        "leafy",
        "palak",
        "spinach",
        "ఇనుము",
        "आयरन",
    ],
    "protein": [
        "protein",
        "dal",
        "chana",
        "paneer",
        "soy",
        "egg",
        "పప్పు",
        "प्रोटीन",
    ],
    "calcium": [
        "calcium",
        "bone",
        "bones",
        "milk",
        "curd",
        "yogurt",
        "कैल्शियम",
        "కాల్షియం",
    ],
    "water": ["water", "hydrate", "hydration", "thirst", "నీరు", "पानी"],
    "bmi": ["bmi", "weight", "height", "obese", "overweight", "वजन", "బరువు"],
    "meal": ["meal", "diet", "breakfast", "lunch", "dinner", "food plan", "खाना", "ఆహారం"],
    "habits": ["habit", "exercise", "walk", "sleep", "stress", "activity", "आदत", "నడక"],
    "market": ["buy", "shop", "market", "purchase", "amazon", "blinkit", "order", "खरीद", "కొను"],
}

RESPONSES = {
    "iron": {
        "en-IN": "Iron helps carry oxygen in the blood. For an affordable Indian diet, include ragi, dates, chana, til, beans and green leafy vegetables. Pair plant iron with lemon or amla for better absorption. This is education only, not medical advice.",
        "hi-IN": "Iron khoon mein oxygen le jaane mein madad karta hai. Ragi, dates, chana, til, beans aur leafy greens add kijiye. Plant iron ke saath nimbu ya amla lene se absorption better hota hai. Yeh general education hai, medical advice nahi.",
        "te-IN": "Iron rakthamlo oxygen carry cheyyadaniki help chestundi. Ragi, dates, chana, nuvvulu, beans, leafy greens include cheyyandi. Lemon/amla tho teesukunte absorption better avuthundi. Idi education matrame, medical advice kaadu.",
    },
    "protein": {
        "en-IN": "Protein supports muscles, recovery and fullness. Budget-friendly choices include dal, chana, rajma, sprouts, peanuts, curd, paneer, eggs, fish or chicken depending on diet preference. Try adding one protein item to every main meal.",
        "hi-IN": "Protein muscles, recovery aur fullness ke liye useful hai. Budget options: dal, chana, rajma, sprouts, peanuts, curd, paneer, eggs ya chicken. Har main meal mein ek protein item add karne ki koshish kijiye.",
        "te-IN": "Protein muscles, recovery, fullness ki useful. Budget options: dal, chana, rajma, sprouts, peanuts, curd, paneer, eggs leda chicken. Prathi main meal lo oka protein item add cheyyandi.",
    },
    "calcium": {
        "en-IN": "Calcium supports bones and teeth. Common Indian options include milk, curd, paneer, ragi, sesame seeds, soy foods and leafy greens. Morning sunlight and regular activity also support bone health.",
        "hi-IN": "Calcium bones aur teeth ke liye important hai. Milk, curd, paneer, ragi, til, soy foods aur leafy greens useful options hain. Morning sunlight aur regular activity bhi bone health support karte hain.",
        "te-IN": "Calcium bones and teeth ki important. Milk, curd, paneer, ragi, sesame, soy foods, leafy greens useful. Morning sunlight and regular activity kuda bone health ki help chestayi.",
    },
    "water": {
        "en-IN": "Hydration supports energy, digestion and focus. Use the Water Tracker to set a daily goal and add each glass through the day. If urine is very dark or you feel dizzy, speak to a health professional.",
        "hi-IN": "Hydration energy, digestion aur focus ko support karta hai. Water Tracker mein daily goal set karke din bhar glasses add kijiye. Agar urine bahut dark ho ya dizziness ho, health professional se baat karein.",
        "te-IN": "Hydration energy, digestion, focus ki help chestundi. Water Tracker lo daily goal set chesi day lo glasses add cheyyandi. Urine dark ga unte leda dizziness unte health professional ni contact cheyyandi.",
    },
    "bmi": {
        "en-IN": "BMI is a simple screening number using height and weight. It is useful for awareness, but it does not diagnose health. Open the BMI Calculator to calculate and save your history.",
        "hi-IN": "BMI height aur weight se nikala gaya simple screening number hai. Awareness ke liye useful hai, par diagnosis nahi. BMI Calculator open karke result save kar sakte ho.",
        "te-IN": "BMI height and weight tho calculate chese simple screening number. Awareness kosam useful, diagnosis kaadu. BMI Calculator open chesi result save cheyyachu.",
    },
    "meal": {
        "en-IN": "For a balanced Indian meal, combine grains, protein, vegetables, fruit or curd, and enough water. The Meal Planner can generate vegetarian, non-vegetarian or vegan plans based on goal and budget.",
        "hi-IN": "Balanced Indian meal ke liye grains, protein, vegetables, fruit ya curd, aur water include kijiye. Meal Planner diet, goal aur budget ke hisaab se plan bana sakta hai.",
        "te-IN": "Balanced Indian meal kosam grains, protein, vegetables, fruit/curd, water include cheyyandi. Meal Planner diet, goal, budget base chesi plan generate chestundi.",
    },
    "habits": {
        "en-IN": "Small daily habits matter: drink water, walk, eat a protein-rich meal, choose fruits or vegetables, and sleep on time. Use the Habit Tracker to mark daily progress and see your weekly completion.",
        "hi-IN": "Chhoti daily habits important hain: water, walk, protein-rich meal, fruits/vegetables aur timely sleep. Habit Tracker mein daily progress mark karke weekly completion dekh sakte ho.",
        "te-IN": "Small daily habits important: water, walking, protein meal, fruits/vegetables, timely sleep. Habit Tracker lo daily progress mark chesi weekly completion chudachu.",
    },
    "market": {
        "en-IN": "Nourish Market helps you discover nutritious foods and then buy from trusted partner platforms like Amazon or Blinkit. Search by nutrition need such as protein, iron, calcium or hydration.",
        "hi-IN": "Nourish Market nutritious foods discover karne mein help karta hai, phir Amazon/Blinkit jaise partner platforms par buy kar sakte ho. Protein, iron, calcium ya hydration se search kijiye.",
        "te-IN": "Nourish Market nutritious foods discover cheyyadaniki help chestundi, taruvatha Amazon/Blinkit lanti partner platforms lo buy cheyyachu. Protein, iron, calcium, hydration tho search cheyyandi.",
    },
    "default": {
        "en-IN": "I can help with nutrition basics, BMI, water tracking, healthy habits, meal plans and Nourish Market products. Ask things like 'What should I eat for protein?' or 'Show iron-rich foods'.",
        "hi-IN": "Main nutrition basics, BMI, water tracking, healthy habits, meal plans aur Nourish Market products mein help kar sakta hoon. Aap pooch sakte ho: 'protein ke liye kya khau?' ya 'iron foods dikhao'.",
        "te-IN": "Nenu nutrition basics, BMI, water tracking, healthy habits, meal plans, Nourish Market products lo help chestanu. 'Protein kosam emi tināli?' leda 'iron foods chupinchu' ani adagandi.",
    },
}

TOPIC_ACTIONS = {
    "iron": [
        {"label": "Open iron foods", "to": "/market?topic=iron"},
        {"label": "Read awareness", "to": "/awareness"},
    ],
    "protein": [
        {"label": "Open protein foods", "to": "/market?topic=protein"},
        {"label": "Create meal plan", "to": "/meal-planner"},
    ],
    "calcium": [
        {"label": "Open calcium foods", "to": "/market?topic=calcium"},
        {"label": "Read nutrition", "to": "/nutrition"},
    ],
    "water": [
        {"label": "Track water", "to": "/water"},
        {"label": "Hydration foods", "to": "/market?topic=hydration"},
    ],
    "bmi": [
        {"label": "Open BMI calculator", "to": "/bmi"},
        {"label": "View progress", "to": "/progress"},
    ],
    "meal": [
        {"label": "Create meal plan", "to": "/meal-planner"},
        {"label": "Open market", "to": "/market"},
    ],
    "habits": [
        {"label": "Track habits", "to": "/habits"},
        {"label": "Health awareness", "to": "/awareness"},
    ],
    "market": [
        {"label": "Open Nourish Market", "to": "/market"},
        {"label": "Saved shopping lists", "to": "/orders"},
    ],
    "default": [
        {"label": "Nutrition center", "to": "/nutrition"},
        {"label": "Health tools", "to": "/health-tools"},
    ],
}


def detect_topic(message):
    normalized = message.lower()
    for topic, keywords in TOPIC_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return topic
    return "default"


@bp.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    message = str(payload.get("message") or "").strip()
    language = str(payload.get("language") or "en-IN")

    if not message:
        return json_error("Please ask a nutrition or health awareness question.")
    if len(message) > 500:
        return json_error("Please keep your question under 500 characters.")
    if language not in LANGUAGES:
        language = "en-IN"

    topic = detect_topic(message)

    return {
        "answer": RESPONSES[topic][language],
        "language": language,
        "topic": topic,
        "actions": TOPIC_ACTIONS[topic],
    }
