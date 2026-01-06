-- 1. Add user_id column to chat_history
ALTER TABLE chat_history 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Create index for faster user-based lookups
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies

-- Policy: Allow users to view their own chats
CREATE POLICY "Users can view their own chat history" 
ON chat_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Allow users to insert their own chats
CREATE POLICY "Users can insert their own chat messages" 
ON chat_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow anonymous access for guests (based on sessionId)
-- Note: We'll still allow guests to read/write if user_id is null
CREATE POLICY "Guests can manage their own session history" 
ON chat_history 
FOR ALL 
USING (user_id IS NULL)
WITH CHECK (user_id IS NULL);

-- 5. Add a helper function to link guest history to user account
-- This will be used when a guest logs in
CREATE OR REPLACE FUNCTION link_guest_history(p_session_id VARCHAR, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE chat_history 
    SET user_id = p_user_id 
    WHERE session_id = p_session_id AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
