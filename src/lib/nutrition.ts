export const HEALTH_DISCLAIMER =
  "This information is for general educational purposes. Please consult a qualified healthcare professional or registered dietitian for personalized medical or nutritional advice.";

export const BMI_DISCLAIMER =
  "BMI is a general screening measure, not a medical diagnosis. It does not account for muscle mass, body composition, pregnancy or age.";

/* ---------------------------------- BMI ---------------------------------- */

export type BmiCategory = "Underweight" | "Normal" | "Overweight" | "Obese";

export function calculateBmi(heightCm: number, weightKg: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function bmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

export const BMI_BANDS: { label: BmiCategory; from: number; to: number; token: string }[] = [
  { label: "Underweight", from: 0, to: 18.5, token: "bg-sky" },
  { label: "Normal", from: 18.5, to: 25, token: "bg-leaf" },
  { label: "Overweight", from: 25, to: 30, token: "bg-sun" },
  { label: "Obese", from: 30, to: 45, token: "bg-berry" },
];

export function bmiCategoryNote(category: BmiCategory): string {
  switch (category) {
    case "Underweight":
      return "Your result falls below the typical range. Regular, energy-dense balanced meals with enough protein may help. A healthcare professional can advise further.";
    case "Normal":
      return "Your result falls within the typical range. Keeping up balanced meals, regular activity and good hydration helps maintain it.";
    case "Overweight":
      return "Your result falls above the typical range. Gradual changes such as more vegetables, fewer processed foods and regular walking are commonly suggested.";
    case "Obese":
      return "Your result falls well above the typical range. A qualified healthcare professional or registered dietitian can help build a safe, personalised plan.";
  }
}

/* --------------------------------- Habits --------------------------------- */

export const DEFAULT_HABITS = [
  { name: "Drink enough water", icon: "droplet" },
  { name: "Eat vegetables", icon: "carrot" },
  { name: "Eat fruit", icon: "apple" },
  { name: "Include protein", icon: "egg" },
  { name: "Exercise", icon: "activity" },
  { name: "Avoid excessive processed food", icon: "ban" },
  { name: "Maintain proper sleep", icon: "moon" },
] as const;

/* ------------------------------- Assessment ------------------------------- */

export type AssessmentData = {
  age: number;
  gender: string;
  height: number;
  weight: number;
  meals: string;
  fruits: string;
  vegetables: string;
  protein: string;
  processed: string;
  sugary: string;
  water: string;
  exercise: string;
  sleep: string;
  conditions: string[];
};

export type WellnessSummary = {
  nutritionStatus: string;
  hydrationStatus: string;
  activityStatus: string;
  dietQuality: string;
  score: number;
  suggestions: string[];
  needsProfessionalNote: boolean;
};

const FREQ_SCORE: Record<string, number> = {
  Never: 0,
  Rarely: 1,
  "1-2 times a week": 1,
  "3-4 times a week": 2,
  Daily: 3,
  "Multiple times a day": 3,
};

export const ASSESSMENT_OPTIONS = {
  meals: ["1", "2", "3", "4 or more"],
  frequency: ["Never", "Rarely", "1-2 times a week", "3-4 times a week", "Daily"],
  water: ["Less than 4 glasses", "4-6 glasses", "7-8 glasses", "More than 8 glasses"],
  exercise: ["Never", "1-2 days a week", "3-4 days a week", "5 or more days a week"],
  sleep: ["Less than 5 hours", "5-6 hours", "7-8 hours", "More than 8 hours"],
  conditions: ["Diabetes", "Hypertension", "Anemia", "Pregnancy", "None", "Prefer not to say"],
};

export function buildWellnessSummary(data: AssessmentData): WellnessSummary {
  const bmi = calculateBmi(data.height, data.weight);
  const category = bmiCategory(bmi);

  const hydrationScore =
    data.water === "Less than 4 glasses" ? 0 : data.water === "4-6 glasses" ? 1 : 2;
  const activityScore =
    data.exercise === "Never"
      ? 0
      : data.exercise === "1-2 days a week"
        ? 1
        : data.exercise === "3-4 days a week"
          ? 2
          : 3;

  const dietPositive =
    (FREQ_SCORE[data.fruits] ?? 0) +
    (FREQ_SCORE[data.vegetables] ?? 0) +
    (FREQ_SCORE[data.protein] ?? 0);
  const dietNegative = (FREQ_SCORE[data.processed] ?? 0) + (FREQ_SCORE[data.sugary] ?? 0);
  const dietNet = dietPositive - dietNegative;

  const dietQuality = dietNet >= 5 ? "Strong" : dietNet >= 2 ? "Fair" : "Needs attention";

  const suggestions: string[] = [];
  if ((FREQ_SCORE[data.vegetables] ?? 0) < 3)
    suggestions.push(
      "Aim to include a vegetable in at least two meals a day — seasonal vegetables are the most affordable option.",
    );
  if ((FREQ_SCORE[data.fruits] ?? 0) < 2)
    suggestions.push(
      "A seasonal fruit such as banana, guava or papaya makes an easy, low-cost daily snack.",
    );
  if ((FREQ_SCORE[data.protein] ?? 0) < 3)
    suggestions.push(
      "Add a protein source to each main meal: dal, sprouts, curd, eggs, peanuts or chickpeas.",
    );
  if ((FREQ_SCORE[data.processed] ?? 0) >= 2)
    suggestions.push("Swap packaged snacks for roasted chana, peanuts, or fruit.");
  if ((FREQ_SCORE[data.sugary] ?? 0) >= 2)
    suggestions.push("Replace sugary drinks with buttermilk, lemon water or plain water.");
  if (hydrationScore < 2)
    suggestions.push("Keep a filled water bottle within reach and sip through the day.");
  if (activityScore < 2)
    suggestions.push(
      "Build towards about 150 minutes of moderate activity a week — brisk walking counts.",
    );
  if (data.sleep === "Less than 5 hours" || data.sleep === "5-6 hours")
    suggestions.push("A consistent sleep and wake time supports appetite balance and energy.");
  if (data.meals === "1")
    suggestions.push("Very few meals a day can make it hard to meet nutrient needs.");
  if (suggestions.length === 0)
    suggestions.push("Your habits look well balanced — keep the routine consistent.");

  const score = Math.max(
    5,
    Math.min(
      100,
      Math.round(
        (dietPositive / 9) * 40 +
          (hydrationScore / 2) * 20 +
          (activityScore / 3) * 20 +
          (category === "Normal" ? 20 : category === "Overweight" ? 12 : 8) -
          dietNegative * 3,
      ),
    ),
  );

  const reported = data.conditions.filter(
    (c) => c !== "None" && c !== "Prefer not to say",
  );

  return {
    nutritionStatus: `${category} range (BMI ${bmi})`,
    hydrationStatus:
      hydrationScore === 2 ? "Well hydrated" : hydrationScore === 1 ? "Moderate" : "Low",
    activityStatus:
      activityScore >= 2 ? "Active" : activityScore === 1 ? "Lightly active" : "Mostly inactive",
    dietQuality,
    score,
    suggestions,
    needsProfessionalNote: reported.length > 0,
  };
}

/* ------------------------------- Meal planner ------------------------------ */

export type DietPreference = "Vegetarian" | "Non-Vegetarian" | "Vegan";
export type HealthGoal =
  | "Balanced Nutrition"
  | "Weight Management"
  | "Improve Protein Intake"
  | "General Healthy Eating";
export type Budget = "Low" | "Medium" | "Flexible";

export type Meal = { slot: string; items: string[]; note: string; kcal: number };
export type GeneratedPlan = { meals: Meal[]; totalKcal: number; focus: string };

type Pool = Record<string, string[]>;

const BASE: Record<DietPreference, Pool> = {
  Vegetarian: {
    Breakfast: [
      "2 idli with sambar and coconut chutney",
      "Vegetable upma with a glass of milk",
      "Poha with peanuts and a banana",
      "2 dosa with chutney and a glass of curd",
      "Ragi porridge with jaggery and milk",
    ],
    "Morning Snack": [
      "1 seasonal fruit (guava / banana / papaya)",
      "A handful of roasted peanuts",
      "Buttermilk with a pinch of jeera",
    ],
    Lunch: [
      "Rice, dal, mixed vegetable sabzi and curd",
      "2 roti, chana masala, cucumber salad",
      "Jowar roti, palak dal and a vegetable stir fry",
      "Rice, sambar, beetroot poriyal and curd",
    ],
    "Evening Snack": [
      "Sprouts chaat with onion, tomato and lemon",
      "Roasted chana with tea (light sugar)",
      "Steamed corn or boiled sweet potato",
    ],
    Dinner: [
      "2 roti with lauki sabzi and dal",
      "Vegetable khichdi with curd",
      "Ragi roti with palak and a bowl of dal",
      "Rice, rasam, beans poriyal",
    ],
  },
  "Non-Vegetarian": {
    Breakfast: [
      "2 boiled eggs with 2 slices of whole wheat toast",
      "Egg bhurji with roti and a fruit",
      "Idli with sambar and one boiled egg",
      "Oats porridge with milk and an egg",
    ],
    "Morning Snack": [
      "1 seasonal fruit (guava / banana / papaya)",
      "A handful of peanuts",
      "Buttermilk",
    ],
    Lunch: [
      "Rice, dal, chicken curry (small portion) and salad",
      "2 roti, egg curry and a vegetable sabzi",
      "Rice, fish curry, vegetable poriyal and curd",
      "Rice, dal, mixed vegetables and curd",
    ],
    "Evening Snack": [
      "Sprouts chaat",
      "Roasted chana",
      "Boiled egg with black pepper",
    ],
    Dinner: [
      "2 roti with chicken / soya curry and salad",
      "Vegetable khichdi with curd",
      "Rice, dal, palak sabzi",
      "Grilled fish with vegetables and 1 roti",
    ],
  },
  Vegan: {
    Breakfast: [
      "2 idli with sambar and coconut chutney",
      "Poha with peanuts and a banana",
      "Ragi porridge made with peanut or soya milk",
      "Vegetable upma with roasted groundnuts",
    ],
    "Morning Snack": [
      "1 seasonal fruit (guava / banana / papaya)",
      "A handful of roasted peanuts",
      "Lemon water without added sugar",
    ],
    Lunch: [
      "Rice, dal, mixed vegetable sabzi and salad",
      "2 roti, chana masala and cucumber salad",
      "Jowar roti with palak dal and stir-fried beans",
      "Rice, sambar and cabbage poriyal",
    ],
    "Evening Snack": [
      "Sprouts chaat with lemon",
      "Roasted chana",
      "Boiled sweet potato or steamed corn",
    ],
    Dinner: [
      "2 roti with lauki sabzi and dal",
      "Vegetable and moong dal khichdi",
      "Ragi roti with palak and rajma",
      "Rice, rasam and beans poriyal",
    ],
  },
};

const SLOTS = ["Breakfast", "Morning Snack", "Lunch", "Evening Snack", "Dinner"] as const;

const SLOT_KCAL: Record<string, number> = {
  Breakfast: 400,
  "Morning Snack": 150,
  Lunch: 600,
  "Evening Snack": 180,
  Dinner: 500,
};

export function generateMealPlan(
  diet: DietPreference,
  goal: HealthGoal,
  budget: Budget,
): GeneratedPlan {
  const pool = BASE[diet];
  const seed = Date.now();

  const meals: Meal[] = SLOTS.map((slot, i) => {
    const options = pool[slot]!;
    const items = [options[(seed + i * 7) % options.length]!];

    if (goal === "Improve Protein Intake") {
      const extra =
        diet === "Non-Vegetarian"
          ? "Add 1 boiled egg or an extra portion of dal"
          : diet === "Vegan"
            ? "Add a bowl of sprouts or extra rajma / chana"
            : "Add a bowl of curd or an extra portion of dal";
      if (slot === "Breakfast" || slot === "Lunch" || slot === "Dinner") items.push(extra);
    }
    if (goal === "Weight Management" && (slot === "Lunch" || slot === "Dinner")) {
      items.push("Keep the grain portion moderate and double the vegetables");
    }
    if (budget === "Low") {
      items.push("Budget tip: use seasonal local vegetables and buy pulses in bulk");
    }
    if (budget === "Flexible" && slot === "Morning Snack") {
      items.push("Optional: a handful of almonds or walnuts");
    }

    const kcalBase = SLOT_KCAL[slot]!;
    const kcal =
      goal === "Weight Management"
        ? Math.round(kcalBase * 0.85)
        : goal === "Improve Protein Intake"
          ? Math.round(kcalBase * 1.05)
          : kcalBase;

    return {
      slot,
      items,
      note:
        slot === "Breakfast"
          ? "Do not skip breakfast — it steadies energy through the morning."
          : slot === "Lunch"
            ? "Half the plate vegetables, a quarter grain, a quarter protein."
            : slot === "Dinner"
              ? "Aim to eat at least two hours before sleeping."
              : "Choose whole foods over packaged snacks.",
      kcal,
    };
  });

  return {
    meals,
    totalKcal: meals.reduce((s, m) => s + m.kcal, 0),
    focus:
      goal === "Weight Management"
        ? "Moderate portions, high fibre, plenty of vegetables"
        : goal === "Improve Protein Intake"
          ? "A protein source at every main meal"
          : "Everyday balance across grains, pulses, vegetables and fruit",
  };
}

export const FOOD_SWAPS = [
  { instead: "Packaged chips", tryThis: "Roasted chickpeas or peanuts" },
  { instead: "Sugary soft drinks", tryThis: "Buttermilk or lemon water without excess sugar" },
  { instead: "Biscuits with tea", tryThis: "Roasted chana or a seasonal fruit" },
  { instead: "White bread", tryThis: "Whole wheat roti or ragi roti" },
  { instead: "Deep-fried samosa", tryThis: "Steamed idli, dhokla or boiled corn" },
  { instead: "Instant noodles", tryThis: "Vegetable upma or poha" },
  { instead: "Fruit juice with sugar", tryThis: "Whole seasonal fruit" },
  { instead: "Ice cream", tryThis: "Curd with fruit and a little jaggery" },
];

/* --------------------------- Education content ---------------------------- */

export type Topic = {
  slug: string;
  title: string;
  group: string;
  summary: string;
  body: string[];
  icon: string;
};

export const NUTRITION_TOPICS: Topic[] = [
  {
    slug: "carbohydrates",
    title: "Carbohydrates",
    group: "Macronutrients",
    icon: "wheat",
    summary: "The body's main source of everyday energy.",
    body: [
      "Carbohydrates are the body's primary fuel. Rice, roti, millets, potatoes, fruit and pulses all supply them.",
      "Whole grains such as ragi, jowar, bajra and hand-pounded rice release energy more slowly than refined grains because they keep their fibre.",
      "A practical target is to make about a quarter of your plate a whole grain, rather than letting grains dominate the meal.",
    ],
  },
  {
    slug: "proteins",
    title: "Proteins",
    group: "Macronutrients",
    icon: "egg",
    summary: "Needed for growth, repair and immunity.",
    body: [
      "Protein builds and repairs tissue and supports the immune system.",
      "Affordable sources include dal, rajma, chana, sprouts, peanuts, curd, milk, paneer, eggs and small fish.",
      "Pairing a cereal with a pulse — rice with dal, roti with chana — gives a more complete amino acid profile.",
    ],
  },
  {
    slug: "healthy-fats",
    title: "Healthy Fats",
    group: "Macronutrients",
    icon: "droplets",
    summary: "Small amounts matter for hormones and vitamin absorption.",
    body: [
      "Fats help the body absorb vitamins A, D, E and K and support hormone production.",
      "Groundnut, mustard, sesame and rice bran oils, along with nuts and seeds, are practical everyday sources.",
      "Limit repeatedly reheated frying oil and heavily fried foods; use measured oil for regular cooking.",
    ],
  },
  {
    slug: "iron",
    title: "Iron",
    group: "Micronutrients",
    icon: "flame",
    summary: "Carries oxygen around the body through haemoglobin.",
    body: [
      "Low iron is common, especially among women and growing children.",
      "Sources: dark leafy greens, ragi, jaggery, sesame, dates, beans, lentils and, for non-vegetarians, meat and fish.",
      "Vitamin C from lemon, amla or guava improves absorption of plant iron. Tea and coffee immediately after meals reduce it.",
    ],
  },
  {
    slug: "calcium",
    title: "Calcium",
    group: "Micronutrients",
    icon: "bone",
    summary: "Supports bones and teeth through every life stage.",
    body: [
      "Milk, curd, paneer, ragi, sesame seeds, drumstick leaves and small fish eaten with bones are good sources.",
      "Vitamin D, mostly made through sunlight exposure, helps the body use calcium.",
      "Needs are higher during childhood, adolescence, pregnancy and older age.",
    ],
  },
  {
    slug: "vitamins",
    title: "Vitamins",
    group: "Micronutrients",
    icon: "sun",
    summary: "Small quantities, wide-reaching effects.",
    body: [
      "Vitamin A supports vision and immunity: carrots, pumpkin, papaya, dark leafy greens.",
      "B vitamins support energy metabolism: whole grains, pulses, eggs, milk.",
      "Vitamin C supports immunity and iron absorption: amla, guava, citrus, tomatoes.",
      "Eating a variety of colours across the week is the simplest way to cover most vitamin needs.",
    ],
  },
  {
    slug: "balanced-diet",
    title: "Balanced Diet",
    group: "Everyday Practice",
    icon: "salad",
    summary: "What a genuinely balanced plate looks like.",
    body: [
      "Half the plate vegetables and fruit, a quarter whole grains, a quarter protein — plus a small amount of healthy fat.",
      "Variety across the week matters more than perfection at any single meal.",
      "Balance is achievable at low cost using seasonal vegetables, pulses and locally available grains.",
    ],
  },
  {
    slug: "food-hygiene",
    title: "Food Hygiene",
    group: "Everyday Practice",
    icon: "hand",
    summary: "Simple habits that prevent foodborne illness.",
    body: [
      "Wash hands with soap before cooking and eating, and after handling raw meat or fish.",
      "Rinse fruits and vegetables under running water before use.",
      "Keep raw and cooked foods separate, and cook eggs, meat and fish thoroughly.",
      "Clean kitchen cloths, chopping boards and water storage containers regularly.",
    ],
  },
  {
    slug: "food-storage",
    title: "Safe Food Storage",
    group: "Everyday Practice",
    icon: "refrigerator",
    summary: "Keep food safe and reduce waste.",
    body: [
      "Cool cooked food and refrigerate within two hours; use leftovers within a day or two and reheat thoroughly.",
      "Store dry staples in airtight containers away from moisture.",
      "Keep raw meat and fish on the lowest refrigerator shelf so it cannot drip onto other food.",
      "When food smells off or looks spoiled, discard it.",
    ],
  },
  {
    slug: "portion-control",
    title: "Portion Control",
    group: "Everyday Practice",
    icon: "scale",
    summary: "Practical measures without weighing scales.",
    body: [
      "Use your hand as a guide: a fist of grains, a palm of protein, two cupped hands of vegetables, a thumb of fat.",
      "Serve onto a plate rather than eating from the serving dish, and eat slowly.",
      "Portion needs differ by age, activity and life stage — these are general guides, not rules.",
    ],
  },
  {
    slug: "hydration",
    title: "Hydration",
    group: "Everyday Practice",
    icon: "droplet",
    summary: "Water is the most overlooked nutrient.",
    body: [
      "Most adults do well with roughly 8 glasses a day, more in hot weather or with physical work.",
      "Buttermilk, lemon water, coconut water and plain water are good choices; sugary drinks are not.",
      "Dark yellow urine, dry mouth and tiredness can be early signs of low fluid intake.",
    ],
  },
  {
    slug: "healthy-cooking",
    title: "Healthy Cooking",
    group: "Everyday Practice",
    icon: "chef-hat",
    summary: "Cooking methods change how nutritious a meal is.",
    body: [
      "Steaming, boiling, pressure cooking, roasting and shallow frying preserve more nutrients than deep frying.",
      "Cook vegetables lightly and use the cooking water in dal or gravy where possible.",
      "Use measured oil, avoid reusing frying oil, and add salt towards the end so you use less.",
    ],
  },
  {
    slug: "food-labels",
    title: "Understanding Food Labels",
    group: "Everyday Practice",
    icon: "scan-line",
    summary: "Read past the front-of-pack claims.",
    body: [
      "Check the per-100g column, not just the per-serving figure, since serving sizes vary.",
      "Ingredients are listed by weight — if sugar or refined flour appears first, it dominates the product.",
      "Watch for hidden sugar names: syrup, dextrose, maltose, fruit concentrate.",
      "Claims such as 'natural' or 'made with real fruit' are marketing, not nutrition information.",
    ],
  },
];

export const AWARENESS_TOPICS = [
  { title: "Healthy Eating", icon: "salad", text: "Build every plate around whole grains, pulses, vegetables and fruit. Cooking at home gives you control over oil, salt and sugar." },
  { title: "Iron-Rich Foods", icon: "flame", text: "Leafy greens, ragi, jaggery, sesame and pulses supply iron. Pair them with lemon, guava or amla to improve absorption." },
  { title: "Protein-Rich Foods", icon: "egg", text: "Dal, chana, sprouts, curd, milk, peanuts, eggs and small fish are affordable protein sources for daily meals." },
  { title: "Nutrition for Women", icon: "heart", text: "Iron, calcium and adequate protein matter across life stages. Needs change in pregnancy — seek professional guidance." },
  { title: "Nutrition for Children", icon: "baby", text: "Small frequent meals, home-made snacks and involving children in cooking builds lasting healthy habits." },
  { title: "Older Adults", icon: "users", text: "Soft, nutrient-dense meals, enough protein and calcium, and steady hydration support strength and digestion." },
  { title: "Reducing Excess Sugar", icon: "candy-off", text: "Most added sugar comes from drinks and packaged snacks. Reduce gradually and choose whole fruit over juice." },
  { title: "Reducing Excess Salt", icon: "soup", text: "Limit pickles, papads and packaged snacks. Build flavour with herbs, lemon, garlic and roasted spices instead." },
  { title: "Food Hygiene", icon: "hand", text: "Wash hands, rinse produce, separate raw and cooked food, and cook thoroughly to prevent foodborne illness." },
  { title: "Safe Food Storage", icon: "refrigerator", text: "Cool and refrigerate cooked food within two hours, use airtight containers, and discard anything that smells off." },
  { title: "Physical Activity", icon: "activity", text: "About 150 minutes of moderate activity a week supports heart health, sleep and mood. Walking counts." },
  { title: "Stress Management", icon: "brain", text: "Ongoing stress affects eating patterns. Regular routine, movement, time outdoors and support from others all help." },
  { title: "Sleep Hygiene", icon: "moon", text: "Seven to nine hours supports appetite balance. Keep consistent timings and reduce screens before bed." },
];

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
