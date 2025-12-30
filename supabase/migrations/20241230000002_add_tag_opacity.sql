-- Add opacity columns to tags table for separate light/dark mode transparency control
-- Values: 1 (Subtle), 2 (Medium/default), 3 (Bold)

ALTER TABLE tags
ADD COLUMN IF NOT EXISTS light_opacity SMALLINT NOT NULL DEFAULT 2 CHECK (light_opacity BETWEEN 1 AND 3),
ADD COLUMN IF NOT EXISTS dark_opacity SMALLINT NOT NULL DEFAULT 2 CHECK (dark_opacity BETWEEN 1 AND 3);

-- Add comment for documentation
COMMENT ON COLUMN tags.light_opacity IS 'Transparency level for light mode: 1=Subtle, 2=Medium, 3=Bold';
COMMENT ON COLUMN tags.dark_opacity IS 'Transparency level for dark mode: 1=Subtle, 2=Medium, 3=Bold';
