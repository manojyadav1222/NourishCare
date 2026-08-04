
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  age INTEGER,
  gender TEXT,
  phone TEXT,
  height NUMERIC,
  weight NUMERIC,
  diet_preference TEXT,
  health_goal TEXT,
  water_goal INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.bmi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  height NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  bmi NUMERIC NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bmi_records TO authenticated;
GRANT ALL ON public.bmi_records TO service_role;
ALTER TABLE public.bmi_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bmi" ON public.bmi_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.health_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assessment_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  wellness_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_assessments TO authenticated;
GRANT ALL ON public.health_assessments TO service_role;
ALTER TABLE public.health_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assessments" ON public.health_assessments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  diet_preference TEXT NOT NULL,
  health_goal TEXT NOT NULL,
  budget TEXT NOT NULL,
  meal_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_plans TO authenticated;
GRANT ALL ON public.meal_plans TO service_role;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own meal plans" ON public.meal_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  habit_name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, habit_name, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_logs TO authenticated;
GRANT ALL ON public.habit_logs TO service_role;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habits" ON public.habit_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  goal INTEGER NOT NULL DEFAULT 8,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.water_logs TO authenticated;
GRANT ALL ON public.water_logs TO service_role;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own water" ON public.water_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.nutrition_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nutrition_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_articles TO authenticated;
GRANT ALL ON public.nutrition_articles TO service_role;
ALTER TABLE public.nutrition_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read articles" ON public.nutrition_articles FOR SELECT USING (true);
CREATE POLICY "Admins manage articles" ON public.nutrition_articles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.nutrition_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nutrition_tips TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_tips TO authenticated;
GRANT ALL ON public.nutrition_tips TO service_role;
ALTER TABLE public.nutrition_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tips" ON public.nutrition_tips FOR SELECT USING (true);
CREATE POLICY "Admins manage tips" ON public.nutrition_tips FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, age, gender, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'age','')::INTEGER,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.community_stats()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'assessments', (SELECT count(*) FROM public.health_assessments),
    'meal_plans', (SELECT count(*) FROM public.meal_plans),
    'active_trackers', (SELECT count(DISTINCT user_id) FROM public.habit_logs WHERE date > CURRENT_DATE - 7),
    'avg_bmi', (SELECT CASE WHEN count(*) >= 3 THEN round(avg(bmi)::numeric, 1) ELSE NULL END FROM (SELECT DISTINCT ON (user_id) bmi FROM public.bmi_records ORDER BY user_id, created_at DESC) t),
    'bmi_distribution', (SELECT COALESCE(jsonb_object_agg(category, c), '{}'::jsonb) FROM (SELECT category, count(*) c FROM (SELECT DISTINCT ON (user_id) category FROM public.bmi_records ORDER BY user_id, created_at DESC) x GROUP BY category) y),
    'exercise_distribution', (SELECT COALESCE(jsonb_object_agg(k, c), '{}'::jsonb) FROM (SELECT assessment_data->>'exercise' k, count(*) c FROM public.health_assessments WHERE assessment_data->>'exercise' IS NOT NULL GROUP BY 1) z),
    'water_distribution', (SELECT COALESCE(jsonb_object_agg(k, c), '{}'::jsonb) FROM (SELECT assessment_data->>'water' k, count(*) c FROM public.health_assessments WHERE assessment_data->>'water' IS NOT NULL GROUP BY 1) w),
    'fruit_distribution', (SELECT COALESCE(jsonb_object_agg(k, c), '{}'::jsonb) FROM (SELECT assessment_data->>'fruits' k, count(*) c FROM public.health_assessments WHERE assessment_data->>'fruits' IS NOT NULL GROUP BY 1) f),
    'veg_distribution', (SELECT COALESCE(jsonb_object_agg(k, c), '{}'::jsonb) FROM (SELECT assessment_data->>'vegetables' k, count(*) c FROM public.health_assessments WHERE assessment_data->>'vegetables' IS NOT NULL GROUP BY 1) v)
  );
$$;
GRANT EXECUTE ON FUNCTION public.community_stats() TO authenticated, anon;

INSERT INTO public.nutrition_tips (title, content, category) VALUES
('Start with a protein-rich breakfast', 'Adding curd, sprouts, eggs or peanuts to breakfast helps you stay full longer and supports muscle health.', 'Protein'),
('Half your plate, vegetables', 'Fill half your plate with seasonal vegetables to increase fibre, vitamins and minerals at very low cost.', 'Balanced Diet'),
('Choose whole grains', 'Swap refined grains for ragi, jowar or hand-pounded rice a few times a week for steadier energy.', 'Carbohydrates'),
('Drink water before meals', 'A glass of water 20 minutes before a meal supports hydration and helps with mindful portion sizes.', 'Hydration'),
('Cut visible sugar first', 'Reducing sugar in tea, coffee and packaged drinks is the easiest first step to lowering added sugar.', 'Sugar'),
('Pair iron with vitamin C', 'Eat lemon, amla or guava alongside spinach or dal to help your body absorb plant iron better.', 'Micronutrients'),
('Cool food before storing', 'Let cooked food cool, then refrigerate within two hours to keep it safe and reduce waste.', 'Food Hygiene');

INSERT INTO public.nutrition_articles (title, category, description, content) VALUES
('Healthy Eating on a Budget', 'Healthy Eating', 'Affordable everyday foods that deliver balanced nutrition for the whole family.', 'A balanced plate does not need expensive ingredients. Build meals around a whole grain (rice, roti, ragi, jowar), a protein (dal, chickpeas, sprouts, curd, eggs), a generous serving of seasonal vegetables and a fruit. Buying vegetables in season, cooking at home and planning a weekly menu reduce both cost and food waste. Use local markets for fresh produce and store staples in airtight containers.'),
('Iron-Rich Foods for Everyday Meals', 'Iron-Rich Foods', 'Simple, low-cost sources of iron and how to help your body absorb them.', 'Iron supports the formation of haemoglobin, which carries oxygen around the body. Good everyday sources include spinach and other dark leafy greens, ragi, jaggery, sesame seeds, dates, beans and lentils. Plant iron is absorbed better when eaten with vitamin C — squeeze lemon over dal, or eat guava or amla with your meal. Tea and coffee right after meals can reduce absorption, so leave a gap of about an hour. This information is educational; if you feel persistently tired, consult a qualified healthcare professional.'),
('Protein-Rich Foods Beyond Meat', 'Protein-Rich Foods', 'Vegetarian and non-vegetarian protein options that fit most household budgets.', 'Protein supports growth, repair and immunity. Affordable sources include dal, rajma, chana, sprouts, peanuts, curd, milk, paneer, eggs and small fish. Combining a cereal with a pulse (rice and dal, roti and chana) gives a more complete amino acid profile. Aim to include a protein source in every main meal rather than only at dinner.'),
('Nutrition for Women', 'Nutrition for Women', 'Key nutrients and practical habits for women across different life stages.', 'Women have higher iron needs during their reproductive years, and calcium plus vitamin D matter throughout life for bone health. Include leafy greens, ragi, milk or curd, sesame seeds and pulses regularly. Adequate protein, hydration and regular movement support energy levels. During pregnancy or breastfeeding, nutrition needs change significantly — please consult a qualified healthcare professional or registered dietitian for personalised guidance.'),
('Nutrition for Children', 'Nutrition for Children', 'Building healthy eating habits early with familiar, affordable foods.', 'Children need nutrient-dense foods in small, frequent meals. Offer a mix of whole grains, pulses, milk or curd, eggs, fruits and vegetables. Home-prepared snacks such as poha, upma, boiled chana, fruit or peanut chikki are better everyday choices than packaged chips and biscuits. Involve children in shopping and cooking, keep mealtimes regular, and avoid using sweets as a reward.'),
('Healthy Eating for Older Adults', 'Older Adults', 'Softer, nutrient-dense meals that support strength and digestion.', 'With age, appetite and digestion often change. Smaller, more frequent meals that are soft and easy to chew work well: khichdi, dalia, idli, well-cooked vegetables, curd and soft fruits. Protein and calcium remain important for muscle and bone health. Hydration is often overlooked — keep water within reach and sip through the day. Any diet change alongside medication should be discussed with a healthcare professional.'),
('Reducing Excess Sugar', 'Sugar', 'Where hidden sugar comes from and easy swaps that actually stick.', 'Most excess sugar comes from sweetened drinks, packaged snacks, biscuits and sauces rather than home cooking. Reduce sugar in tea and coffee gradually, choose whole fruit over juice, and read labels for terms like syrup, dextrose and maltose. Buttermilk, lemon water and plain water are good replacements for sugary drinks.'),
('Reducing Excess Salt', 'Salt', 'Practical ways to lower sodium without losing flavour.', 'High salt intake is linked to raised blood pressure. Much of it comes from pickles, papads, packaged snacks, instant noodles and restaurant food. Use herbs, lemon, garlic, pepper and roasted spices to build flavour, taste food before adding extra salt at the table, and limit processed foods. If you have been advised a specific salt limit, follow your healthcare professional''s guidance.'),
('Food Hygiene at Home', 'Food Hygiene', 'Everyday practices that keep meals safe for the whole family.', 'Wash hands with soap before cooking and eating. Rinse fruits and vegetables under running water. Keep raw and cooked foods separate, and use different boards or wash between uses. Cook food thoroughly, especially eggs, meat and fish. Keep the kitchen surfaces, cloths and water storage containers clean, and cover cooked food.'),
('Safe Food Storage', 'Safe Food Storage', 'How long food keeps and the right way to store it.', 'Cool cooked food and refrigerate it within two hours. Store leftovers in clean, covered containers and use them within a day or two, reheating thoroughly. Keep dry staples such as rice, dal and flour in airtight containers away from moisture. Store raw meat and fish on the lowest refrigerator shelf so it cannot drip onto other food. Discard food that smells off or looks spoiled — when in doubt, throw it out.'),
('Importance of Physical Activity', 'Physical Activity', 'Movement you can fit into a normal day, without a gym.', 'Regular activity supports heart health, weight management, sleep and mood. Adults generally benefit from about 150 minutes of moderate activity a week — brisk walking, cycling, household work, gardening or dancing all count. Break up long sitting periods with short walks. Start gradually and increase over time, and check with a healthcare professional before starting vigorous exercise if you have an existing health condition.'),
('Stress Management', 'Stress Management', 'How stress affects eating, and simple ways to manage it.', 'Ongoing stress can lead to skipped meals or eating for comfort. Simple, regular practices help: slow breathing for a few minutes, a daily walk, time outdoors, talking to family or friends, and keeping a consistent routine. Limit caffeine late in the day. If stress feels overwhelming or persistent, speak with a qualified professional.'),
('Sleep Hygiene', 'Sleep Hygiene', 'Why sleep matters for appetite, energy and overall health.', 'Adults generally need seven to nine hours of sleep. Poor sleep affects appetite hormones and can increase cravings for high-sugar foods. Keep a consistent sleep and wake time, avoid heavy meals and caffeine late in the evening, reduce screen use before bed, and keep the sleeping space dark, quiet and cool.');
