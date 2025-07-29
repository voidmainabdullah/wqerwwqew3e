-- Fix the shared_links link_type constraint to allow all required values
ALTER TABLE shared_links DROP CONSTRAINT IF EXISTS shared_links_link_type_check;

-- Add the correct constraint that allows all needed link types
ALTER TABLE shared_links ADD CONSTRAINT shared_links_link_type_check 
CHECK (link_type IN ('public', 'email', 'code'));

-- Also ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_links_share_token ON shared_links(share_token);
CREATE INDEX IF NOT EXISTS idx_shared_links_file_id ON shared_links(file_id);