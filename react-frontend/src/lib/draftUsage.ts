import { supabase } from './supabase';
import { FREE_TRIAL_PICKS } from './stripe';

export interface UsageCheckResult {
  canUsePick: boolean;
  picksUsed: number;
  picksLimit: number;
  needsPayment: boolean;
  subscriptionTier: string;
}

export class DraftUsageService {
  /**
   * Check if user can use another draft pick
   */
  static async checkUsage(userId: string): Promise<UsageCheckResult> {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('draft_picks_used, draft_picks_limit, subscription_tier')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw new Error('Failed to fetch user profile');
    }

    const { draft_picks_used, draft_picks_limit, subscription_tier } = profile;
    const canUsePick = draft_picks_used < draft_picks_limit;
    const needsPayment = subscription_tier === 'free' && draft_picks_used >= FREE_TRIAL_PICKS;

    return {
      canUsePick,
      picksUsed: draft_picks_used,
      picksLimit: draft_picks_limit,
      needsPayment,
      subscriptionTier,
    };
  }

  /**
   * Increment draft pick usage for a user
   */
  static async incrementUsage(userId: string): Promise<void> {
    // First check if user can use a pick
    const usage = await this.checkUsage(userId);
    
    if (!usage.canUsePick) {
      throw new Error('Draft pick limit reached. Payment required to continue.');
    }

    // Increment usage
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        draft_picks_used: usage.picksUsed + 1,
        trial_started_at: usage.picksUsed === 0 ? new Date().toISOString() : undefined
      })
      .eq('id', userId);

    if (error) {
      throw new Error('Failed to update draft pick usage');
    }
  }

  /**
   * Initialize free trial for a new user
   */
  static async initializeFreeTrial(userId: string): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        draft_picks_used: 0,
        draft_picks_limit: FREE_TRIAL_PICKS,
        trial_started_at: new Date().toISOString(),
        subscription_tier: 'free'
      })
      .eq('id', userId);

    if (error) {
      throw new Error('Failed to initialize free trial');
    }
  }

  /**
   * Upgrade user after successful payment
   */
  static async upgradeToPaid(userId: string, newLimit: number = 50): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        draft_picks_limit: newLimit,
        subscription_tier: 'basic'
      })
      .eq('id', userId);

    if (error) {
      throw new Error('Failed to upgrade user subscription');
    }
  }

  /**
   * Get user's current usage status with formatted display data
   */
  static async getUserStatus(userId: string) {
    const usage = await this.checkUsage(userId);
    
    const remaining = Math.max(0, usage.picksLimit - usage.picksUsed);
    const percentage = (usage.picksUsed / usage.picksLimit) * 100;
    
    return {
      ...usage,
      remaining,
      percentage,
      isNearLimit: percentage > 80,
      hasExceeded: usage.picksUsed >= usage.picksLimit
    };
  }
}
