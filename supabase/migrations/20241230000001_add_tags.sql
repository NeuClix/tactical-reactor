-- Migration: Add Tags System with Many-to-Many Relationship
-- Date: 2024-12-30
-- Description: Creates tags table with colors and junction table for content_item_tags

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS content_item_tags (
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (content_item_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_content_item_tags_content_item_id ON content_item_tags(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_item_tags_tag_id ON content_item_tags(tag_id);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_item_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for tags
CREATE POLICY "Users can view their own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for content_item_tags (junction table)
-- Users can manage tags for their own content items
CREATE POLICY "Users can view tags for their own content" ON content_item_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_items
      WHERE content_items.id = content_item_tags.content_item_id
      AND content_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tags to their own content" ON content_item_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_items
      WHERE content_items.id = content_item_tags.content_item_id
      AND content_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove tags from their own content" ON content_item_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM content_items
      WHERE content_items.id = content_item_tags.content_item_id
      AND content_items.user_id = auth.uid()
    )
  );
