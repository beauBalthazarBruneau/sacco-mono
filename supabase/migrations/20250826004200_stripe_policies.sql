-- Enhanced RLS policies for Stripe integration
-- Created: 2025-08-26

-- Update payment_history policies for better security
DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
DROP POLICY IF EXISTS "Users can insert own payment history" ON payment_history;

-- More specific payment history policies
CREATE POLICY "Users can view own payment history" ON payment_history 
  FOR SELECT USING (auth.uid() = user_id);

-- Only allow service role to insert payment records (from webhooks)
CREATE POLICY "Service role can insert payment history" ON payment_history 
  FOR INSERT WITH CHECK (
    -- Allow service role or user themselves
    auth.role() = 'service_role' OR auth.uid() = user_id
  );

-- Update user_profiles policies for new Stripe columns
CREATE POLICY "Users can update own stripe data" ON user_profiles 
  FOR UPDATE USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Create function to check if user has exceeded draft picks
CREATE OR REPLACE FUNCTION check_draft_pick_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT draft_picks_used, draft_picks_limit, subscription_tier
  INTO user_record
  FROM user_profiles
  WHERE id = user_uuid;
  
  -- If no record found, deny access
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Allow if under limit or has paid subscription
  RETURN (user_record.draft_picks_used < user_record.draft_picks_limit) 
         OR (user_record.subscription_tier != 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment draft pick usage (with limit checking)
CREATE OR REPLACE FUNCTION increment_draft_pick_usage(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
  can_pick BOOLEAN;
BEGIN
  -- Check if user can make a pick
  SELECT check_draft_pick_limit(user_uuid) INTO can_pick;
  
  IF NOT can_pick THEN
    RAISE EXCEPTION 'Draft pick limit reached. Payment required to continue.';
  END IF;
  
  -- Increment usage
  UPDATE user_profiles 
  SET 
    draft_picks_used = draft_picks_used + 1,
    trial_started_at = COALESCE(trial_started_at, NOW())
  WHERE id = user_uuid AND auth.uid() = id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely update subscription after payment
CREATE OR REPLACE FUNCTION upgrade_user_subscription(
  user_uuid UUID,
  new_limit INTEGER DEFAULT 50,
  new_tier subscription_tier DEFAULT 'basic'
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only allow service role to call this (from webhooks)
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: This function requires service role';
  END IF;
  
  UPDATE user_profiles 
  SET 
    draft_picks_limit = new_limit,
    subscription_tier = new_tier,
    updated_at = NOW()
  WHERE id = user_uuid;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for faster usage queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_usage_lookup 
  ON user_profiles(id, draft_picks_used, draft_picks_limit, subscription_tier);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_draft_pick_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_draft_pick_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upgrade_user_subscription(UUID, INTEGER, subscription_tier) TO service_role;
