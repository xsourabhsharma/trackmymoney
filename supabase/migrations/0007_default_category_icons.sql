-- Seed professional default categories with icon keys for new and existing workspaces.
-- Existing user-owned categories are not modified.

INSERT INTO public.categories (name, icon, color, type, is_default)
SELECT category_name, icon_key, color_value, category_type::public.transaction_type, true
FROM (
  VALUES
    ('Groceries', 'groceries', '#14824f', 'expense'),
    ('Dining', 'dining', '#ff5a1f', 'expense'),
    ('Housing', 'home', '#1565c0', 'expense'),
    ('Transportation', 'transport', '#0d7377', 'expense'),
    ('Shopping', 'shopping', '#c62828', 'expense'),
    ('Utilities', 'utilities', '#c98200', 'expense'),
    ('Subscriptions', 'subscriptions', '#6b4c9a', 'expense'),
    ('Healthcare', 'health', '#dc2626', 'expense'),
    ('Education', 'education', '#475569', 'expense'),
    ('Travel', 'travel', '#0284c7', 'expense'),
    ('Insurance', 'insurance', '#334155', 'expense'),
    ('Other Expense', 'other', '#64748b', 'expense'),
    ('Salary', 'salary', '#14824f', 'income'),
    ('Business Income', 'business', '#0d7377', 'income'),
    ('Bonus', 'bonus', '#c98200', 'income'),
    ('Investment Income', 'investments', '#6b4c9a', 'income'),
    ('Gift', 'gift', '#db2777', 'income'),
    ('Other Income', 'income', '#64748b', 'income')
) AS defaults(category_name, icon_key, color_value, category_type)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.categories existing
  WHERE existing.user_id IS NULL
    AND lower(existing.name) = lower(defaults.category_name)
    AND existing.type = defaults.category_type::public.transaction_type
);
