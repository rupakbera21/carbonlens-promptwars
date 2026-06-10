-- CarbonLens Supabase Setup Script
-- Paste this entire file into the Supabase SQL Editor and click "Run"

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "region" TEXT NOT NULL DEFAULT 'global',
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "preferences" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_user_active" ON "users"("id");

CREATE TABLE IF NOT EXISTS "activities" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "sub_category" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL,
  "co2e_kg" DOUBLE PRECISION NOT NULL,
  "emission_factor_id" TEXT NOT NULL,
  "activity_date" TIMESTAMP(3) NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "synced" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_activity_user_date" ON "activities"("user_id", "activity_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_activity_user_category" ON "activities"("user_id", "category");

CREATE TABLE IF NOT EXISTS "emission_factors" (
  "id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "sub_category" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "factor_kg_co2e" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "region" TEXT NOT NULL DEFAULT 'global',
  "version" INTEGER NOT NULL DEFAULT 1,
  "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "valid_to" TIMESTAMP(3),
  CONSTRAINT "emission_factors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_ef_category_region" ON "emission_factors"("category", "sub_category", "region");

CREATE TABLE IF NOT EXISTS "carbon_scores" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "total_co2e_kg" DOUBLE PRECISION NOT NULL,
  "breakdown" JSONB NOT NULL,
  "period_type" TEXT NOT NULL,
  "period_start" TIMESTAMP(3) NOT NULL,
  "period_end" TIMESTAMP(3) NOT NULL,
  "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "carbon_scores_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_score_user_period" ON "carbon_scores"("user_id", "period_type", "period_start");

CREATE TABLE IF NOT EXISTS "goals" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "target_co2e_kg" DOUBLE PRECISION NOT NULL,
  "period_type" TEXT NOT NULL,
  "start_date" TIMESTAMP(3) NOT NULL,
  "end_date" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_goal_user_status" ON "goals"("user_id", "status");

CREATE TABLE IF NOT EXISTS "rules" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "conditions" JSONB NOT NULL,
  "actions" JSONB NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "recommendations" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "rule_id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "potential_saving_kg" DOUBLE PRECISION NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'medium',
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dismissed_at" TIMESTAMP(3),
  CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_rec_user_status" ON "recommendations"("user_id", "status");

-- Foreign Keys (using DO blocks to prevent errors if they already exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'activities_user_id_fkey') THEN
        ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'activities_emission_factor_id_fkey') THEN
        ALTER TABLE "activities" ADD CONSTRAINT "activities_emission_factor_id_fkey" FOREIGN KEY ("emission_factor_id") REFERENCES "emission_factors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'carbon_scores_user_id_fkey') THEN
        ALTER TABLE "carbon_scores" ADD CONSTRAINT "carbon_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'goals_user_id_fkey') THEN
        ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recommendations_user_id_fkey') THEN
        ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recommendations_rule_id_fkey') THEN
        ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- 2. Seed Emission Factors
INSERT INTO "emission_factors" ("id", "category", "sub_category", "name", "factor_kg_co2e", "unit", "source") VALUES
('a0000001-0000-0000-0000-000000000001', 'transport', 'car_petrol', 'Petrol Car (average)', 0.17, 'km', 'UK DEFRA 2024'),
('a0000001-0000-0000-0000-000000000002', 'transport', 'car_diesel', 'Diesel Car (average)', 0.168, 'km', 'UK DEFRA 2024'),
('a0000001-0000-0000-0000-000000000003', 'transport', 'car_electric', 'Electric Car', 0.05, 'km', 'UK DEFRA 2024'),
('a0000001-0000-0000-0000-000000000004', 'transport', 'bus', 'Bus (local)', 0.089, 'km', 'UK DEFRA 2024'),
('a0000001-0000-0000-0000-000000000005', 'transport', 'train', 'Train (national rail)', 0.035, 'km', 'UK DEFRA 2024'),
('a0000001-0000-0000-0000-000000000006', 'transport', 'flight_short', 'Flight (short haul <3h)', 0.255, 'km', 'UK DEFRA 2024'),
('a0000001-0000-0000-0000-000000000007', 'transport', 'flight_long', 'Flight (long haul >3h)', 0.195, 'km', 'UK DEFRA 2024'),
('a0000001-0000-0000-0000-000000000008', 'transport', 'bicycle', 'Bicycle', 0.0, 'km', 'Zero emission'),
('a0000001-0000-0000-0000-000000000009', 'transport', 'walking', 'Walking', 0.0, 'km', 'Zero emission'),
('b0000001-0000-0000-0000-000000000001', 'energy', 'electricity', 'Electricity (grid average)', 0.233, 'kWh', 'UK DEFRA 2024'),
('b0000001-0000-0000-0000-000000000002', 'energy', 'natural_gas', 'Natural Gas', 0.184, 'kWh', 'UK DEFRA 2024'),
('b0000001-0000-0000-0000-000000000003', 'energy', 'solar', 'Solar Energy', 0.0, 'kWh', 'Renewable'),
('c0000001-0000-0000-0000-000000000001', 'food', 'beef', 'Beef', 27.0, 'kg', 'Our World in Data 2024'),
('c0000001-0000-0000-0000-000000000002', 'food', 'poultry', 'Poultry', 6.9, 'kg', 'Our World in Data 2024'),
('c0000001-0000-0000-0000-000000000003', 'food', 'fish', 'Fish', 5.4, 'kg', 'Our World in Data 2024'),
('c0000001-0000-0000-0000-000000000004', 'food', 'dairy', 'Dairy Products', 3.2, 'kg', 'Our World in Data 2024'),
('c0000001-0000-0000-0000-000000000005', 'food', 'vegetables', 'Vegetables', 0.4, 'kg', 'Our World in Data 2024'),
('c0000001-0000-0000-0000-000000000006', 'food', 'fruits', 'Fruits', 0.5, 'kg', 'Our World in Data 2024'),
('c0000001-0000-0000-0000-000000000007', 'food', 'grains', 'Grains & Cereals', 1.4, 'kg', 'Our World in Data 2024'),
('d0000001-0000-0000-0000-000000000001', 'shopping', 'clothing', 'Clothing (new)', 22.0, 'item', 'WRAP UK 2024'),
('d0000001-0000-0000-0000-000000000002', 'shopping', 'electronics', 'Electronics', 50.0, 'item', 'EPA estimate'),
('d0000001-0000-0000-0000-000000000003', 'shopping', 'furniture', 'Furniture', 100.0, 'item', 'EPA estimate'),
('d0000001-0000-0000-0000-000000000004', 'shopping', 'secondhand', 'Second-hand items', 2.0, 'item', 'Estimated')
ON CONFLICT ("id") DO NOTHING;

-- 3. Seed Rules
INSERT INTO "rules" ("id", "name", "category", "conditions", "actions", "priority") VALUES
('r0000001-0000-0000-0000-000000000001', 'High car usage — suggest public transport', 'transport', '[{"field":"category","operator":"equals","value":"transport"},{"field":"subCategory","operator":"in","value":["car_petrol","car_diesel"]},{"field":"weeklyTotal","operator":"greaterThan","value":100}]', '[{"type":"recommend","params":{"title":"Consider public transport for some trips","description":"You drove over 100 km this week. Switching 2 trips to bus or train could save significant CO₂.","potentialSavingKg":8.5,"priority":"high"}}]', 10),
('r0000001-0000-0000-0000-000000000002', 'High beef consumption — suggest alternatives', 'food', '[{"field":"category","operator":"equals","value":"food"},{"field":"subCategory","operator":"equals","value":"beef"},{"field":"weeklyTotal","operator":"greaterThan","value":1}]', '[{"type":"recommend","params":{"title":"Try poultry or plant-based alternatives","description":"Beef produces 27 kg CO₂e per kg — 4× more than poultry. Replacing one beef meal with chicken or plant-based saves ~5 kg CO₂e.","potentialSavingKg":5.0,"priority":"high"}}]', 10),
('r0000001-0000-0000-0000-000000000003', 'High electricity usage — suggest efficiency', 'energy', '[{"field":"category","operator":"equals","value":"energy"},{"field":"subCategory","operator":"equals","value":"electricity"},{"field":"weeklyTotal","operator":"greaterThan","value":50}]', '[{"type":"recommend","params":{"title":"Reduce standby power consumption","description":"Your electricity usage is above average. Turning off standby devices and using LED bulbs can reduce consumption by 10-15%.","potentialSavingKg":3.0,"priority":"medium"}}]', 5),
('r0000001-0000-0000-0000-000000000004', 'Frequent new clothing — suggest secondhand', 'shopping', '[{"field":"category","operator":"equals","value":"shopping"},{"field":"subCategory","operator":"equals","value":"clothing"},{"field":"monthlyCount","operator":"greaterThan","value":3}]', '[{"type":"recommend","params":{"title":"Explore second-hand or sustainable fashion","description":"Each new clothing item averages 22 kg CO₂e. Buying second-hand reduces this by up to 90%.","potentialSavingKg":20.0,"priority":"medium"}}]', 5),
('r0000001-0000-0000-0000-000000000005', 'Flight taken — offset suggestion', 'transport', '[{"field":"category","operator":"equals","value":"transport"},{"field":"subCategory","operator":"in","value":["flight_short","flight_long"]},{"field":"monthlyCount","operator":"greaterThan","value":0}]', '[{"type":"recommend","params":{"title":"Consider train alternatives for short trips","description":"A short-haul flight emits ~7× more CO₂ per km than a train. For trips under 500 km, trains are often comparable in total travel time.","potentialSavingKg":50.0,"priority":"high"}}]', 15)
ON CONFLICT ("id") DO NOTHING;

-- 4. Create Demo User (Password: Demo1234!)
INSERT INTO "users" ("id", "email", "password_hash", "name", "updated_at") VALUES
('u0000001-0000-0000-0000-000000000001', 'demo@carbonlens.app', '$2b$12$fyyHp7WUhsodqApEAiwvXu2I3pwER59urtC9DJJ5Yv4gdWsy29hFS', 'Demo User', CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;
