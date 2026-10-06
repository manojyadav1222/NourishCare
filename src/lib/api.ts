const API_BASE_URL = (import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:5000/api").replace(
  /\/$/,
  "",
);
const TOKEN_KEY = "nourishcare_token";

export type ApiUser = {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  height: number | null;
  weight: number | null;
  diet_preference: string | null;
  health_goal: string | null;
  water_goal: number;
  role: "user" | "admin";
  created_at: string;
};

export type BmiRecord = {
  id: number;
  user_id: number;
  height: number;
  weight: number;
  bmi: number;
  category: string;
  created_at: string;
};
export type HealthAssessment = {
  id: number;
  user_id: number;
  assessment_data: Record<string, unknown>;
  wellness_summary: Record<string, unknown>;
  created_at: string;
};
export type MealPlanRecord = {
  id: number;
  user_id: number;
  diet_preference: string;
  health_goal: string;
  budget: string;
  meal_plan: Record<string, unknown>;
  created_at: string;
};
export type HabitLog = {
  id: number;
  user_id: number;
  habit_name: string;
  completed: boolean;
  date: string;
};
export type WaterLog = { id: number; user_id: number; amount: number; goal: number; date: string };
export type NutritionArticle = {
  id: number;
  title: string;
  category: string;
  description: string;
  content: string;
  created_at: string;
};
export type NutritionTip = {
  id: number;
  title: string;
  content: string;
  category: string;
  created_at: string;
};
export type MarketProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  platform: string;
  product_url: string | null;
  description: string;
  health_benefit: string;
  nutrition_tags: string[];
  related_topics: string[];
  stock_status: string;
  image_url: string | null;
  created_at: string;
};
export type MarketOrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};
export type MarketOrder = {
  id: number;
  user_id: number;
  customer_name: string;
  phone: string;
  address: string;
  payment_method: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: MarketOrderItem[];
};
export type MarketShoppingList = MarketOrder;
export type AssistantAction = {
  label: string;
  to: string;
};
export type AssistantResponse = {
  answer: string;
  language: string;
  topic: string;
  actions: AssistantAction[];
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "Could not connect to the NourishCare backend. Is Flask running on port 5000?",
      0,
    );
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok)
    throw new ApiError(data.error || data.message || "Request failed.", response.status);
  return data as T;
}

export const authApi = {
  async register(payload: Record<string, unknown>) {
    const result = await apiRequest<{ token: string; user: ApiUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(result.token);
    return result;
  },
  async login(payload: { email: string; password: string }) {
    const result = await apiRequest<{ token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(result.token);
    return result;
  },
  me: () => apiRequest<{ user: ApiUser }>("/auth/me"),
  forgotPassword: (email: string) =>
    apiRequest<{ message: string; reset_token?: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
};

export const profileApi = {
  get: () => apiRequest<{ profile: ApiUser }>("/profile"),
  update: (payload: Record<string, unknown>) =>
    apiRequest<{ profile: ApiUser }>("/profile", { method: "PUT", body: JSON.stringify(payload) }),
};

export const bmiApi = {
  list: () => apiRequest<{ records: BmiRecord[] }>("/bmi"),
  create: (payload: { height: number; weight: number }) =>
    apiRequest<{ record: BmiRecord; profile: ApiUser }>("/bmi", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const assessmentsApi = {
  list: () => apiRequest<{ records: HealthAssessment[] }>("/assessments"),
  create: (payload: Record<string, unknown>) =>
    apiRequest<{ record: HealthAssessment }>("/assessments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const mealPlansApi = {
  list: () => apiRequest<{ records: MealPlanRecord[] }>("/meal-plans"),
  create: (payload: Record<string, unknown>) =>
    apiRequest<{ record: MealPlanRecord; profile: ApiUser }>("/meal-plans", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const habitsApi = {
  list: (since?: string) =>
    apiRequest<{ records: HabitLog[] }>(`/habits${since ? `?since=${since}` : ""}`),
  save: (payload: { habit_name: string; date: string; completed: boolean }) =>
    apiRequest<{ record: HabitLog }>("/habits", { method: "POST", body: JSON.stringify(payload) }),
};

export const waterApi = {
  list: (since?: string) =>
    apiRequest<{ records: WaterLog[] }>(`/water${since ? `?since=${since}` : ""}`),
  save: (payload: { date: string; amount: number; goal: number }) =>
    apiRequest<{ record: WaterLog; profile: ApiUser }>("/water", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const contentApi = {
  articles: () => apiRequest<{ records: NutritionArticle[] }>("/articles"),
  tips: () => apiRequest<{ records: NutritionTip[] }>("/tips"),
};

export const marketApi = {
  products: (params?: { category?: string; topic?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.topic) query.set("topic", params.topic);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiRequest<{ records: MarketProduct[] }>(`/market/products${suffix}`);
  },
  orders: () => apiRequest<{ records: MarketOrder[] }>("/market/orders"),
  lists: () => apiRequest<{ records: MarketShoppingList[] }>("/market/lists"),
  checkout: (payload: {
    customer_name: string;
    phone: string;
    address: string;
    payment_method: string;
    items: { product_id: number; quantity: number }[];
  }) =>
    apiRequest<{ record: MarketOrder }>("/market/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  saveList: (payload: {
    customer_name: string;
    items: { product_id: number; quantity: number }[];
  }) =>
    apiRequest<{ record: MarketShoppingList }>("/market/lists", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const assistantApi = {
  chat: (payload: { message: string; language: string }) =>
    apiRequest<AssistantResponse>("/assistant/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const adminApi = {
  stats: () => apiRequest<{ stats: Record<string, number | string | null> }>("/admin/stats"),
  articles: () => apiRequest<{ records: NutritionArticle[] }>("/admin/articles"),
  createArticle: (payload: Partial<NutritionArticle>) =>
    apiRequest<{ record: NutritionArticle }>("/admin/articles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateArticle: (id: number, payload: Partial<NutritionArticle>) =>
    apiRequest<{ record: NutritionArticle }>(`/admin/articles/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteArticle: (id: number) =>
    apiRequest<{ message: string }>(`/admin/articles/${id}`, { method: "DELETE" }),
  tips: () => apiRequest<{ records: NutritionTip[] }>("/admin/tips"),
  createTip: (payload: Partial<NutritionTip>) =>
    apiRequest<{ record: NutritionTip }>("/admin/tips", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTip: (id: number, payload: Partial<NutritionTip>) =>
    apiRequest<{ record: NutritionTip }>(`/admin/tips/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteTip: (id: number) =>
    apiRequest<{ message: string }>(`/admin/tips/${id}`, { method: "DELETE" }),
  products: () => apiRequest<{ records: MarketProduct[] }>("/admin/products"),
  createProduct: (payload: Partial<MarketProduct>) =>
    apiRequest<{ record: MarketProduct }>("/admin/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateProduct: (id: number, payload: Partial<MarketProduct>) =>
    apiRequest<{ record: MarketProduct }>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id: number) =>
    apiRequest<{ message: string }>(`/admin/products/${id}`, { method: "DELETE" }),
};
