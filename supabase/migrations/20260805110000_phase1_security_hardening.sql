-- Phase 1 hardening: admin analytics authorization, signup robustness,
-- integrity constraints, foreign keys, and common query indexes.

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller UUID := auth.uid();
BEGIN
  IF caller IS NULL THEN
    RETURN false;
  END IF;

  IF _user_id IS DISTINCT FROM caller AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = caller AND role = 'admin'
  ) THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.community_stats()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required' USING ERRCODE = '42501';
  END IF;

  RETURN (
    SELECT jsonb_build_object(
      'total_users', (SELECT count(*) FROM public.profiles),
      'total_assessments', (SELECT count(*) FROM public.health_assessments),
      'total_meal_plans', (SELECT count(*) FROM public.meal_plans),
      'active_trackers', (
        SELECT count(DISTINCT user_id)
        FROM public.habit_logs
        WHERE date > CURRENT_DATE - 7
      ),
      'avg_bmi', (
        SELECT CASE
          WHEN count(*) >= 3 THEN round(avg(bmi)::numeric, 1)
          ELSE NULL
        END
        FROM (
          SELECT DISTINCT ON (user_id) user_id, bmi
          FROM public.bmi_records
          ORDER BY user_id, created_at DESC
        ) latest_bmi
      ),
      'avg_water', (
        SELECT round(avg(amount)::numeric, 1)
        FROM public.water_logs
        WHERE date > CURRENT_DATE - 30
      ),
      'bmi_distribution', (
        SELECT COALESCE(jsonb_object_agg(category, c), '{}'::jsonb)
        FROM (
          SELECT category, count(*) c
          FROM (
            SELECT DISTINCT ON (user_id) user_id, category
            FROM public.bmi_records
            ORDER BY user_id, created_at DESC
          ) latest_categories
          GROUP BY category
        ) grouped_categories
      ),
      'exercise_distribution', (
        SELECT COALESCE(jsonb_object_agg(k, c), '{}'::jsonb)
        FROM (
          SELECT assessment_data->>'exercise' k, count(*) c
          FROM public.health_assessments
          WHERE assessment_data->>'exercise' IS NOT NULL
          GROUP BY 1
        ) exercise_groups
      ),
      'water_distribution', (
        SELECT COALESCE(jsonb_object_agg(k, c), '{}'::jsonb)
        FROM (
          SELECT assessment_data->>'water' k, count(*) c
          FROM public.health_assessments
          WHERE assessment_data->>'water' IS NOT NULL
          GROUP BY 1
        ) water_groups
      ),
      'fruit_distribution', (
        SELECT COALESCE(jsonb_object_agg(k, c), '{}'::jsonb)
        FROM (
          SELECT assessment_data->>'fruits' k, count(*) c
          FROM public.health_assessments
          WHERE assessment_data->>'fruits' IS NOT NULL
          GROUP BY 1
        ) fruit_groups
      ),
      'veg_distribution', (
        SELECT COALESCE(jsonb_object_agg(k, c), '{}'::jsonb)
        FROM (
          SELECT assessment_data->>'vegetables' k, count(*) c
          FROM public.health_assessments
          WHERE assessment_data->>'vegetables' IS NOT NULL
          GROUP BY 1
        ) vegetable_groups
      )
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.community_stats() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.community_stats() TO authenticated;

CREATE OR REPLACE FUNCTION public.safe_int_from_metadata(value TEXT, min_value INTEGER, max_value INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  parsed INTEGER;
BEGIN
  IF value IS NULL OR btrim(value) = '' OR value !~ '^\d+$' THEN
    RETURN NULL;
  END IF;

  parsed := value::INTEGER;
  IF parsed < min_value OR parsed > max_value THEN
    RETURN NULL;
  END IF;

  RETURN parsed;
EXCEPTION
  WHEN others THEN
    RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.safe_int_from_metadata(text, integer, integer) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, age, gender, phone)
  VALUES (
    NEW.id,
    LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 100),
    public.safe_int_from_metadata(NEW.raw_user_meta_data->>'age', 1, 120),
    NULLIF(LEFT(COALESCE(NEW.raw_user_meta_data->>'gender', ''), 50), ''),
    NULLIF(LEFT(COALESCE(NEW.raw_user_meta_data->>'phone', ''), 20), '')
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID,
  ADD CONSTRAINT profiles_age_check CHECK (age IS NULL OR (age BETWEEN 1 AND 120)) NOT VALID,
  ADD CONSTRAINT profiles_height_check CHECK (height IS NULL OR (height BETWEEN 50 AND 250)) NOT VALID,
  ADD CONSTRAINT profiles_weight_check CHECK (weight IS NULL OR (weight BETWEEN 10 AND 400)) NOT VALID,
  ADD CONSTRAINT profiles_water_goal_check CHECK (water_goal BETWEEN 1 AND 20) NOT VALID;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE public.bmi_records
  ADD CONSTRAINT bmi_records_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID,
  ADD CONSTRAINT bmi_records_height_check CHECK (height BETWEEN 50 AND 250) NOT VALID,
  ADD CONSTRAINT bmi_records_weight_check CHECK (weight BETWEEN 10 AND 400) NOT VALID,
  ADD CONSTRAINT bmi_records_bmi_check CHECK (bmi BETWEEN 5 AND 100) NOT VALID,
  ADD CONSTRAINT bmi_records_category_check CHECK (category IN ('Underweight', 'Normal', 'Overweight', 'Obese')) NOT VALID;

ALTER TABLE public.health_assessments
  ADD CONSTRAINT health_assessments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE public.meal_plans
  ADD CONSTRAINT meal_plans_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID,
  ADD CONSTRAINT meal_plans_diet_preference_check CHECK (diet_preference IN ('Vegetarian', 'Non-Vegetarian', 'Vegan')) NOT VALID,
  ADD CONSTRAINT meal_plans_health_goal_check CHECK (health_goal IN ('Balanced Nutrition', 'Weight Management', 'Improve Protein Intake', 'General Healthy Eating')) NOT VALID,
  ADD CONSTRAINT meal_plans_budget_check CHECK (budget IN ('Low', 'Medium', 'Flexible')) NOT VALID;

ALTER TABLE public.habit_logs
  ADD CONSTRAINT habit_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;

ALTER TABLE public.water_logs
  ADD CONSTRAINT water_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID,
  ADD CONSTRAINT water_logs_amount_check CHECK (amount BETWEEN 0 AND 30) NOT VALID,
  ADD CONSTRAINT water_logs_goal_check CHECK (goal BETWEEN 1 AND 20) NOT VALID;

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS user_roles_user_id_role_idx ON public.user_roles (user_id, role);
CREATE INDEX IF NOT EXISTS bmi_records_user_id_created_at_idx ON public.bmi_records (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS health_assessments_user_id_created_at_idx ON public.health_assessments (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS meal_plans_user_id_created_at_idx ON public.meal_plans (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS habit_logs_user_id_date_idx ON public.habit_logs (user_id, date DESC);
CREATE INDEX IF NOT EXISTS water_logs_user_id_date_idx ON public.water_logs (user_id, date DESC);
CREATE INDEX IF NOT EXISTS nutrition_articles_created_at_idx ON public.nutrition_articles (created_at);
CREATE INDEX IF NOT EXISTS nutrition_tips_created_at_idx ON public.nutrition_tips (created_at);
