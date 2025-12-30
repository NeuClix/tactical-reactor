-- Add text color override columns to tags table
-- These allow users to manually override the auto-calculated text colors
-- NULL values indicate auto-calculation should be used

ALTER TABLE tags ADD COLUMN IF NOT EXISTS light_text_override TEXT DEFAULT NULL;
ALTER TABLE tags ADD COLUMN IF NOT EXISTS dark_text_override TEXT DEFAULT NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN tags.light_text_override IS 'Optional manual override for light mode text color (hex). NULL = auto-calculate';
COMMENT ON COLUMN tags.dark_text_override IS 'Optional manual override for dark mode text color (hex). NULL = auto-calculate';
