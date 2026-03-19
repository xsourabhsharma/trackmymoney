-- ==========================================
-- TrackMyMoney (LEDGR) RLS Security Audit
-- ==========================================
-- This migration script ensures Row Level Security (RLS) is strictly 
-- enabled on all tables, isolating user data so users can only read, 
-- update, and delete their own financial records.

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_tracker ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing open/public policies if they exist (cleanup)
-- Note: Replace these with specific names if you had custom names
-- DROP POLICY IF EXISTS "Public select" ON transactions; etc...

-- 3. Define strict isolation policies
-- PROFILES
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- CATEGORIES
CREATE POLICY "Users can view default or own categories" 
ON categories FOR SELECT 
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" 
ON categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" 
ON categories FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" 
ON categories FOR DELETE 
USING (auth.uid() = user_id);

-- TRANSACTIONS
CREATE POLICY "Users can view own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
ON transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
ON transactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
ON transactions FOR DELETE 
USING (auth.uid() = user_id);

-- ACCOUNTS
CREATE POLICY "Users can view own accounts" 
ON accounts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" 
ON accounts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" 
ON accounts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" 
ON accounts FOR DELETE 
USING (auth.uid() = user_id);

-- BUDGETS
CREATE POLICY "Users can view own budgets" 
ON budgets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" 
ON budgets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" 
ON budgets FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" 
ON budgets FOR DELETE 
USING (auth.uid() = user_id);

-- RECURRING TRANSACTIONS (Subscriptions)
CREATE POLICY "Users can view own recurring transactions" 
ON recurring_transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring transactions" 
ON recurring_transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions" 
ON recurring_transactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions" 
ON recurring_transactions FOR DELETE 
USING (auth.uid() = user_id);

-- SAVINGS GOALS
CREATE POLICY "Users can view own savings goals" 
ON savings_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals" 
ON savings_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals" 
ON savings_goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals" 
ON savings_goals FOR DELETE 
USING (auth.uid() = user_id);

-- DEBT TRACKER
CREATE POLICY "Users can view own debt records" 
ON debt_tracker FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debt records" 
ON debt_tracker FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debt records" 
ON debt_tracker FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debt records" 
ON debt_tracker FOR DELETE 
USING (auth.uid() = user_id);
