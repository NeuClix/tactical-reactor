# Database Migrations

Instructions for applying database migrations to update your Supabase instance.

## Pending Migrations (December 2024)

The following migrations need to be applied in order:

### 1. `20241230000001_add_tags.sql` - Tags System
Creates the core tagging infrastructure:
- `tags` table with user ownership and colors
- `content_item_tags` junction table for many-to-many relationships
- RLS policies for user data isolation
- Performance indexes

### 2. `20241230000002_add_tag_opacity.sql` - Tag Opacity
Adds opacity columns for light/dark mode:
- `light_opacity` - Transparency level for light mode (1=Subtle, 2=Medium, 3=Bold)
- `dark_opacity` - Transparency level for dark mode (1=Subtle, 2=Medium, 3=Bold)

### 3. `20241230000003_add_tag_text_colors.sql` - Tag Text Colors
Adds optional text color overrides:
- `light_text_override` - Manual text color for light mode (NULL = auto-calculate)
- `dark_text_override` - Manual text color for dark mode (NULL = auto-calculate)

## How to Apply Migrations

### Option A: Supabase CLI (Recommended)
```bash
# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push all pending migrations
supabase db push
```

### Option B: Manual SQL Execution
Run each migration file in order via the Supabase SQL Editor:
1. Go to your Supabase Dashboard → SQL Editor
2. Copy contents of each migration file
3. Execute in order (001 → 002 → 003)

### Option C: Direct psql
```bash
psql YOUR_DATABASE_URL -f supabase/migrations/20241230000001_add_tags.sql
psql YOUR_DATABASE_URL -f supabase/migrations/20241230000002_add_tag_opacity.sql
psql YOUR_DATABASE_URL -f supabase/migrations/20241230000003_add_tag_text_colors.sql
```

## Verification

After applying migrations, verify the tables exist:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tags';
```

Expected columns: `id`, `user_id`, `name`, `color`, `created_at`, `updated_at`, `light_opacity`, `dark_opacity`, `light_text_override`, `dark_text_override`

## Rollback (if needed)

```sql
-- WARNING: This will delete all tag data!
DROP TABLE IF EXISTS content_item_tags;
DROP TABLE IF EXISTS tags;
```
