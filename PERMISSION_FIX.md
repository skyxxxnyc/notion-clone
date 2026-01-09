# 🛠️ Database Permission Fix (Corrected)

The SolopreneurOS installation failed because the SQL script tried to reference a `databases` table which doesn't exist (databases are stored in the `pages` table).

## ✅ Step 1: Run this Corrected SQL

Please run this updated SQL code in your **Supabase SQL Editor** to fix the permissions.

```sql
-- Grant comprehensive permissions to authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- Enable RLS and add comprehensive policies for all core tables

-- 1. PAGES Table (Includes Databases)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users full access to pages" ON pages;
CREATE POLICY "Allow authenticated users full access to pages"
ON pages FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- 2. WORKSPACES Table
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users full access to workspaces" ON workspaces;
CREATE POLICY "Allow authenticated users full access to workspaces"
ON workspaces FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- 3. BLOCKS Table
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users full access to blocks" ON blocks;
CREATE POLICY "Allow authenticated users full access to blocks"
ON blocks FOR ALL TO authenticated
USING (true) WITH CHECK (true);
```

## 🔍 How to Run

1. Copy the SQL code above.
2. Go to your **Supabase Dashboard**.
3. Navigate to the **SQL Editor**.
4. Paste the code and click **Run**.

## 🚀 After Running the SQL

1. **Try installing SolopreneurOS again**.
2. It should now proceed successfully, as databases are properly handled by permissions on the `pages` table.
