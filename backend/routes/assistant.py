import re

from flask import Blueprint, request

from routes.helpers import calculate_bmi, json_error

bp = Blueprint("assistant", __name__)


LANGUAGES = {"en-IN", "hi-IN", "te-IN", "ta-IN"}

LANGUAGE_NAMES = {
    "en-IN": "English",
    "hi-IN": "Hindi",
    "te-IN": "Telugu",
    "ta-IN": "Tamil",
}

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
        "ఆయరన్",
        "ఇనుము",
        "आयरन",
        "இரும்பு",
        "கீரை",
    ],
    "protein": [
        "protein",
        "dal",
        "dhal",
        "chana",
        "paneer",
        "soy",
        "egg",
        "sprouts",
        "పప్పు",
        "ప్రోటీన్",
        "प्रोटीन",
        "புரதம்",
        "பருப்பு",
    ],
    "calcium": [
        "calcium",
        "bone",
        "bones",
        "milk",
        "curd",
        "yogurt",
        "ragi",
        "कैल्शियम",
        "కాల్షియం",
        "கால்சியம்",
        "பால்",
    ],
    "water": [
        "water",
        "paani",
        "hydrate",
        "hydration",
        "thirst",
        "glass",
        "నీరు",
        "पानी",
        "தண்ணீர்",
    ],
    "bmi": [
        "bmi",
        "body mass",
        "weight",
        "height",
        "obese",
        "overweight",
        "వెయిట్",
        "బరువు",
        "वजन",
        "எடை",
        "உயரம்",
    ],
    "meal": [
        "meal",
        "diet",
        "breakfast",
        "lunch",
        "dinner",
        "food plan",
        "veg",
        "vegan",
        "non veg",
        "khana",
        "ఆహారం",
        "భోజనం",
        "खाना",
        "உணவு",
        "சாப்பாடு",
    ],
    "habits": [
        "habit",
        "exercise",
        "walk",
        "sleep",
        "stress",
        "activity",
        "yoga",
        "ఆదత",
        "నడక",
        "नींद",
        "आदत",
        "நடை",
        "தூக்கம்",
    ],
    "market": [
        "buy",
        "shop",
        "market",
        "purchase",
        "amazon",
        "blinkit",
        "jiomart",
        "bigbasket",
        "order",
        "खरीद",
        "కొను",
        "வாங்க",
        "மார்க்கெட்",
    ],
    "assessment": [
        "assessment",
        "questionnaire",
        "wellness",
        "score",
        "risk",
        "survey",
        "అసెస్మెంట్",
        "आकलन",
        "மதிப்பீடு",
    ],
    "profile": [
        "profile",
        "name",
        "age",
        "gender",
        "goal",
        "preference",
        "प्रोफाइल",
        "ప్రొఫైల్",
        "சுயவிவரம்",
    ],
}

ACTION_LABELS = {
    "market": {
        "en-IN": "Open Nourish Market",
        "hi-IN": "Nourish Market खोलें",
        "te-IN": "Nourish Market తెరవండి",
        "ta-IN": "Nourish Market திறக்க",
    },
    "meal": {
        "en-IN": "Create meal plan",
        "hi-IN": "Meal plan बनाएं",
        "te-IN": "Meal plan తయారు చేయండి",
        "ta-IN": "Meal plan உருவாக்க",
    },
    "water": {
        "en-IN": "Track water",
        "hi-IN": "Water track करें",
        "te-IN": "Water track చేయండి",
        "ta-IN": "Water track செய்ய",
    },
    "habits": {
        "en-IN": "Track habits",
        "hi-IN": "Habits track करें",
        "te-IN": "Habits track చేయండి",
        "ta-IN": "Habits track செய்ய",
    },
    "bmi": {
        "en-IN": "Open BMI calculator",
        "hi-IN": "BMI calculator खोलें",
        "te-IN": "BMI calculator తెరవండి",
        "ta-IN": "BMI calculator திறக்க",
    },
    "assessment": {
        "en-IN": "Take assessment",
        "hi-IN": "Assessment करें",
        "te-IN": "Assessment చేయండి",
        "ta-IN": "Assessment செய்ய",
    },
    "nutrition": {
        "en-IN": "Nutrition center",
        "hi-IN": "Nutrition center",
        "te-IN": "Nutrition center",
        "ta-IN": "Nutrition center",
    },
    "awareness": {
        "en-IN": "Health awareness",
        "hi-IN": "Health awareness",
        "te-IN": "Health awareness",
        "ta-IN": "Health awareness",
    },
    "progress": {
        "en-IN": "View progress",
        "hi-IN": "Progress देखें",
        "te-IN": "Progress చూడండి",
        "ta-IN": "Progress பார்க்க",
    },
    "profile": {
        "en-IN": "Open profile",
        "hi-IN": "Profile खोलें",
        "te-IN": "Profile తెరవండి",
        "ta-IN": "Profile திறக்க",
    },
}

TOPIC_ACTIONS = {
    "iron": [("market", "/market?topic=iron"), ("awareness", "/awareness")],
    "protein": [("market", "/market?topic=protein"), ("meal", "/meal-planner")],
    "calcium": [("market", "/market?topic=calcium"), ("nutrition", "/nutrition")],
    "water": [("water", "/water"), ("market", "/market?topic=hydration")],
    "bmi": [("bmi", "/health-tools"), ("progress", "/progress")],
    "meal": [("meal", "/meal-planner"), ("market", "/market")],
    "habits": [("habits", "/habits"), ("awareness", "/awareness")],
    "market": [("market", "/market"), ("nutrition", "/nutrition")],
    "assessment": [("assessment", "/assessment"), ("meal", "/meal-planner")],
    "profile": [("profile", "/profile"), ("meal", "/meal-planner")],
    "default": [("nutrition", "/nutrition"), ("bmi", "/health-tools")],
}

TOPIC_CONTENT = {
    "iron": {
        "foods": {
            "en-IN": "Good iron-support foods are ragi, dates, chana, beans, sesame seeds, jaggery in small quantity, and green leafy vegetables.",
            "hi-IN": "Iron ke liye ragi, dates, chana, beans, til, thoda jaggery aur green leafy vegetables useful hain.",
            "te-IN": "Iron kosam ragi, dates, chana, beans, nuvvulu, konchem jaggery, leafy greens useful.",
            "ta-IN": "Iron ku ragi, dates, chana, beans, ellu, konjam jaggery, keerai useful.",
        },
        "tip": {
            "en-IN": "Pair plant iron with lemon, amla, orange or tomato. Vitamin C helps absorption.",
            "hi-IN": "Plant iron ke saath nimbu, amla, orange ya tomato lijiye. Vitamin C absorption improve karta hai.",
            "te-IN": "Plant iron tho lemon, amla, orange leda tomato teesukondi. Vitamin C absorption ki help chestundi.",
            "ta-IN": "Plant iron oda lemon, amla, orange illa tomato sapidunga. Vitamin C absorption ku help pannum.",
        },
    },
    "protein": {
        "foods": {
            "en-IN": "Budget protein options include dal, chana, rajma, sprouts, peanuts, curd, paneer, eggs, fish, chicken and soy chunks.",
            "hi-IN": "Budget protein options: dal, chana, rajma, sprouts, peanuts, curd, paneer, eggs, fish, chicken aur soy chunks.",
            "te-IN": "Budget protein options: dal, chana, rajma, sprouts, peanuts, curd, paneer, eggs, fish, chicken, soy chunks.",
            "ta-IN": "Budget protein options: dal, chana, rajma, sprouts, peanuts, curd, paneer, eggs, fish, chicken, soy chunks.",
        },
        "tip": {
            "en-IN": "Try one protein item in every main meal to improve fullness and muscle support.",
            "hi-IN": "Har main meal mein ek protein item add kijiye. Fullness aur muscle support ke liye useful hai.",
            "te-IN": "Prathi main meal lo oka protein item add cheyyandi. Fullness and muscle support ki useful.",
            "ta-IN": "Ovvoru main meal la oru protein item add pannunga. Fullness and muscle support ku useful.",
        },
    },
    "calcium": {
        "foods": {
            "en-IN": "Calcium foods include milk, curd, paneer, ragi, sesame seeds, soy foods and green leafy vegetables.",
            "hi-IN": "Calcium ke liye milk, curd, paneer, ragi, til, soy foods aur leafy greens useful hain.",
            "te-IN": "Calcium kosam milk, curd, paneer, ragi, nuvvulu, soy foods, leafy greens useful.",
            "ta-IN": "Calcium ku milk, curd, paneer, ragi, ellu, soy foods, keerai useful.",
        },
        "tip": {
            "en-IN": "Morning sunlight and regular walking also support bone health.",
            "hi-IN": "Morning sunlight aur regular walking bone health ko support karte hain.",
            "te-IN": "Morning sunlight and regular walking bone health ki help chestayi.",
            "ta-IN": "Morning sunlight and regular walking bone health ku help pannum.",
        },
    },
    "water": {
        "foods": {
            "en-IN": "Hydration means water through the day, plus water-rich foods like cucumber, watermelon, citrus fruits, buttermilk and soups.",
            "hi-IN": "Hydration ke liye din bhar water, cucumber, watermelon, citrus fruits, buttermilk aur soups useful hain.",
            "te-IN": "Hydration kosam day lo water, cucumber, watermelon, citrus fruits, buttermilk, soups useful.",
            "ta-IN": "Hydration ku day la water, cucumber, watermelon, citrus fruits, buttermilk, soups useful.",
        },
        "tip": {
            "en-IN": "Set your water goal in the Water Tracker and add each glass when you drink it.",
            "hi-IN": "Water Tracker mein goal set karke har glass add kijiye.",
            "te-IN": "Water Tracker lo goal set chesi prathi glass add cheyyandi.",
            "ta-IN": "Water Tracker la goal set panni ovvoru glass add pannunga.",
        },
    },
}

GENERAL_RESPONSES = {
    "bmi": {
        "en-IN": "BMI is a simple screening number using height and weight. It is useful for awareness, but it is not a medical diagnosis.",
        "hi-IN": "BMI height aur weight se calculate hone wala simple screening number hai. Awareness ke liye useful hai, diagnosis nahi.",
        "te-IN": "BMI height and weight tho calculate chese simple screening number. Awareness kosam useful, diagnosis kaadu.",
        "ta-IN": "BMI height and weight use panni calculate pannra simple screening number. Awareness ku useful, diagnosis illa.",
    },
    "meal": {
        "en-IN": "A balanced Indian meal usually combines grains, protein, vegetables, fruit or curd, and water. The Meal Planner can create a full-day plan by diet, goal and budget.",
        "hi-IN": "Balanced Indian meal mein grains, protein, vegetables, fruit ya curd aur water include hota hai. Meal Planner diet, goal aur budget ke hisaab se plan banata hai.",
        "te-IN": "Balanced Indian meal lo grains, protein, vegetables, fruit/curd, water untayi. Meal Planner diet, goal, budget base chesi plan istundi.",
        "ta-IN": "Balanced Indian meal la grains, protein, vegetables, fruit/curd, water irukkum. Meal Planner diet, goal, budget base panni plan kudukkum.",
    },
    "habits": {
        "en-IN": "Small daily habits matter: water, vegetables, fruit, protein, exercise, less processed food and proper sleep. Track them daily for weekly progress.",
        "hi-IN": "Small daily habits important hain: water, vegetables, fruit, protein, exercise, kam processed food aur proper sleep. Inhe daily track kijiye.",
        "te-IN": "Small daily habits important: water, vegetables, fruit, protein, exercise, less processed food, proper sleep. Daily track cheyyandi.",
        "ta-IN": "Small daily habits important: water, vegetables, fruit, protein, exercise, less processed food, proper sleep. Daily track pannunga.",
    },
    "market": {
        "en-IN": "Nourish Market helps you discover nutrient foods and then buy from partner platforms. Search by need: iron, protein, calcium, hydration or healthy snacks.",
        "hi-IN": "Nourish Market nutritious foods discover karne mein help karta hai. Iron, protein, calcium, hydration ya healthy snacks se search kijiye.",
        "te-IN": "Nourish Market nutritious foods discover cheyyadaniki help chestundi. Iron, protein, calcium, hydration, healthy snacks tho search cheyyandi.",
        "ta-IN": "Nourish Market nutritious foods discover panna help pannum. Iron, protein, calcium, hydration, healthy snacks nu search pannunga.",
    },
    "assessment": {
        "en-IN": "The assessment checks eating habits, hydration, activity, sleep and health notes, then gives a simple educational wellness summary.",
        "hi-IN": "Assessment eating habits, hydration, activity, sleep aur health notes check karta hai, phir wellness summary deta hai.",
        "te-IN": "Assessment eating habits, hydration, activity, sleep, health notes check chesi wellness summary istundi.",
        "ta-IN": "Assessment eating habits, hydration, activity, sleep, health notes check panni wellness summary kudukkum.",
    },
    "profile": {
        "en-IN": "Use Profile to update name, age, gender, height, weight, diet preference, health goal and water goal.",
        "hi-IN": "Profile page mein name, age, gender, height, weight, diet preference, health goal aur water goal update kar sakte ho.",
        "te-IN": "Profile page lo name, age, gender, height, weight, diet preference, health goal, water goal update cheyyachu.",
        "ta-IN": "Profile page la name, age, gender, height, weight, diet preference, health goal, water goal update pannalam.",
    },
    "default": {
        "en-IN": "I can help with BMI, meal plans, water tracking, habits, nutrition foods, Nourish Market and assessments. Ask a specific question like: what should I eat for protein?",
        "hi-IN": "Main BMI, meal plans, water tracking, habits, nutrition foods, Nourish Market aur assessment mein help kar sakta hoon. Specific question poochiye, jaise: protein ke liye kya khau?",
        "te-IN": "Nenu BMI, meal plans, water tracking, habits, nutrition foods, Nourish Market, assessment lo help chestanu. Specific question adagandi: protein kosam emi tināli?",
        "ta-IN": "Naan BMI, meal plans, water tracking, habits, nutrition foods, Nourish Market, assessment la help pannalam. Specific question kelunga: protein ku enna sapidanum?",
    },
}

DISCLAIMERS = {
    "en-IN": "This is educational guidance only. For illness, pregnancy, medicines, allergies or urgent symptoms, please consult a qualified health professional.",
    "hi-IN": "Yeh sirf educational guidance hai. Illness, pregnancy, medicines, allergies ya urgent symptoms ke liye qualified health professional se consult kijiye.",
    "te-IN": "Idi educational guidance matrame. Illness, pregnancy, medicines, allergies leda urgent symptoms unte qualified health professional ni consult cheyyandi.",
    "ta-IN": "Idhu educational guidance mattum. Illness, pregnancy, medicines, allergies illa urgent symptoms irundha qualified health professional ah consult pannunga.",
}


def normalize_language(language):
    return language if language in LANGUAGES else "en-IN"


def detect_topic(message):
    normalized = message.lower()
    scores = {}
    for topic, keywords in TOPIC_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword.lower() in normalized)
        if score:
            scores[topic] = score
    if not scores:
        return "default"
    return max(scores, key=scores.get)


def localized_actions(topic, language):
    return [
        {"label": ACTION_LABELS[key][language], "to": url}
        for key, url in TOPIC_ACTIONS.get(topic, TOPIC_ACTIONS["default"])
    ]


def extract_bmi(message):
    normalized = message.lower().replace(",", " ")
    height = None
    weight = None

    height_match = re.search(r"(?:height|ht|உயரம்|ఎత్తు|लंबाई)\s*(?:is|=|:)?\s*(\d{2,3})", normalized)
    weight_match = re.search(r"(?:weight|wt|எடை|బరువు|वजन)\s*(?:is|=|:)?\s*(\d{2,3})", normalized)
    if height_match:
        height = float(height_match.group(1))
    if weight_match:
        weight = float(weight_match.group(1))

    if height is None or weight is None:
        numbers = [float(item) for item in re.findall(r"\b\d{2,3}\b", normalized)]
        plausible_heights = [value for value in numbers if 100 <= value <= 230]
        plausible_weights = [value for value in numbers if 25 <= value <= 200]
        if height is None and plausible_heights:
            height = plausible_heights[0]
        if weight is None:
            for value in plausible_weights:
                if value != height:
                    weight = value
                    break

    if height and weight and 100 <= height <= 230 and 25 <= weight <= 200:
        bmi, category = calculate_bmi(height, weight)
        return bmi, category, height, weight
    return None


def bmi_answer(message, language):
    result = extract_bmi(message)
    base = GENERAL_RESPONSES["bmi"][language]
    if not result:
        return f"{base} {DISCLAIMERS[language]}"

    bmi, category, height, weight = result
    category_text = {
        "en-IN": f"Based on height {height:.0f} cm and weight {weight:.0f} kg, your BMI is {bmi} ({category}).",
        "hi-IN": f"Height {height:.0f} cm aur weight {weight:.0f} kg ke hisaab se BMI {bmi} hai ({category}).",
        "te-IN": f"Height {height:.0f} cm and weight {weight:.0f} kg base chesi BMI {bmi} ({category}).",
        "ta-IN": f"Height {height:.0f} cm and weight {weight:.0f} kg base pannina BMI {bmi} ({category}).",
    }
    next_step = {
        "en-IN": "Open the BMI calculator to save this result and track history.",
        "hi-IN": "Is result ko save karne ke liye BMI calculator open kijiye.",
        "te-IN": "Ee result save cheyyadaniki BMI calculator open cheyyandi.",
        "ta-IN": "Indha result save panna BMI calculator open pannunga.",
    }
    return f"{category_text[language]} {next_step[language]} {DISCLAIMERS[language]}"


def build_answer(topic, message, language):
    if topic == "bmi":
        return bmi_answer(message, language)
    if topic in TOPIC_CONTENT:
        content = TOPIC_CONTENT[topic]
        return f"{content['foods'][language]} {content['tip'][language]} {DISCLAIMERS[language]}"
    return f"{GENERAL_RESPONSES.get(topic, GENERAL_RESPONSES['default'])[language]} {DISCLAIMERS[language]}"


def starter_suggestions(language):
    suggestions = {
        "en-IN": [
            "What should I eat for protein?",
            "Calculate BMI for height 170 and weight 70",
            "Show iron-rich foods",
        ],
        "hi-IN": [
            "Protein ke liye kya khau?",
            "Height 170 weight 70 ka BMI batao",
            "Iron rich foods dikhao",
        ],
        "te-IN": [
            "Protein kosam emi tināli?",
            "Height 170 weight 70 BMI cheppu",
            "Iron foods chupinchu",
        ],
        "ta-IN": [
            "Protein ku enna sapidanum?",
            "Height 170 weight 70 BMI sollu",
            "Iron foods kaatu",
        ],
    }
    return suggestions[language]


@bp.post("/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    message = str(payload.get("message") or "").strip()
    language = normalize_language(str(payload.get("language") or "en-IN"))

    if not message:
        return json_error("Please ask a nutrition or health awareness question.")
    if len(message) > 700:
        return json_error("Please keep your question under 700 characters.")

    topic = detect_topic(message)
    answer = build_answer(topic, message, language)

    return {
        "answer": answer,
        "language": language,
        "language_name": LANGUAGE_NAMES[language],
        "topic": topic,
        "actions": localized_actions(topic, language),
        "suggestions": starter_suggestions(language),
    }
