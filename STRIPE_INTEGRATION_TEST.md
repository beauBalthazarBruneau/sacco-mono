# Stripe Integration Testing Checklist

## 🧪 Pre-Testing Setup

### ✅ Environment Configuration
- [ ] `.env` file created with Stripe publishable key
- [ ] Supabase environment variables set for Edge Functions
- [ ] Database migrations applied
- [ ] Edge Functions deployed

### ✅ Stripe Dashboard Setup
- [ ] Webhook endpoint configured
- [ ] Customer portal activated
- [ ] Test mode enabled

## 🎯 Testing Scenarios

### 1. User Registration & Trial Initialization
**Test Steps:**
1. Go to `/signup`
2. Enter email and sign up
3. Check database for user profile creation
4. Verify initial draft pick limits (should be 3)

**Expected Results:**
- User profile created with `draft_picks_limit: 3`
- `draft_picks_used: 0`
- `subscription_tier: 'free'`
- `trial_started_at: null` (set on first usage)

### 2. Draft Pick Usage Tracking
**Test Steps:**
1. Navigate to `/players`
2. Simulate draft pick actions (3 times)
3. Check usage increments correctly
4. Verify limit enforcement

**Expected Results:**
- Usage increments: 0 → 1 → 2 → 3
- After 3 picks, payment prompt appears
- `trial_started_at` set on first pick

### 3. Payment Flow
**Test Steps:**
1. Exhaust free trial picks
2. Click "Continue for $10" button
3. Complete payment with test card `4242 4242 4242 4242`
4. Verify successful payment

**Expected Results:**
- Payment intent created
- Stripe Elements form displays
- Payment processes successfully
- User redirected with success message

### 4. Webhook Processing
**Test Steps:**
1. Monitor webhook endpoint during payment
2. Check payment_history table
3. Verify user profile updates

**Expected Results:**
- Webhook `payment_intent.succeeded` received
- Payment record in `payment_history`
- User `draft_picks_limit` increased to 50
- `subscription_tier` updated to 'basic'

### 5. Billing Dashboard
**Test Steps:**
1. Navigate to `/billing`
2. Check all sections display correctly
3. Verify payment history shows

**Expected Results:**
- Account information accurate
- Trial status reflects current usage
- Payment history table populated
- Manage payment methods button works

### 6. Customer Portal Integration
**Test Steps:**
1. Click "Manage Payment Methods"
2. Verify redirect to Stripe customer portal
3. Test portal navigation

**Expected Results:**
- Portal session created successfully
- Portal displays customer information
- Can navigate back to app

## 🔍 Error Testing

### Payment Failures
**Test Cards:**
- `4000 0000 0000 0002` (Declined)
- `4000 0000 0000 9995` (Insufficient funds)

**Expected Results:**
- Error messages display correctly
- User can retry payment
- No duplicate payment intents created

### Edge Cases
1. **Network Issues**: Test offline behavior
2. **Session Expiry**: Test with expired JWT
3. **Concurrent Usage**: Multiple picks simultaneously
4. **Invalid Webhooks**: Malformed webhook data

## 📊 Database Validation Queries

### Check User Profile State
```sql
SELECT 
  id, email, 
  draft_picks_used, 
  draft_picks_limit, 
  subscription_tier,
  trial_started_at,
  stripe_customer_id
FROM user_profiles 
WHERE email = 'your-test-email@example.com';
```

### Check Payment History
```sql
SELECT 
  amount, 
  currency, 
  status, 
  subscription_tier,
  stripe_payment_intent_id,
  created_at
FROM payment_history 
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

### Verify Stripe Customer Creation
```sql
SELECT 
  COUNT(*) as users_with_customers,
  COUNT(CASE WHEN stripe_customer_id IS NULL THEN 1 END) as without_customers
FROM user_profiles;
```

## 🚨 Security Tests

### Authentication
- [ ] Unauthenticated users can't access billing
- [ ] JWT validation in Edge Functions
- [ ] Users can only access own data

### Payment Security
- [ ] Webhook signature verification
- [ ] Amount validation server-side
- [ ] No client-side amount manipulation

### Data Protection
- [ ] RLS policies prevent cross-user access
- [ ] Sensitive data not in client logs
- [ ] Stripe keys properly secured

## 🎯 Performance Tests

### Load Testing
1. **Concurrent Payments**: 10 simultaneous payment flows
2. **Webhook Processing**: High-volume webhook handling
3. **Database Performance**: Usage tracking under load

### Response Times
- Payment intent creation: < 2s
- Webhook processing: < 5s
- Customer portal creation: < 3s

## ✅ Final Validation

### User Journey Completion
1. [ ] Sign up → Trial → Payment → Continued usage
2. [ ] Complete billing dashboard functionality
3. [ ] Customer portal round-trip
4. [ ] Payment method updates
5. [ ] Subscription management

### Business Logic Validation
1. [ ] Free trial limits enforced
2. [ ] Payment increases limits
3. [ ] Subscription tiers work correctly
4. [ ] Usage tracking accurate

### Integration Health
1. [ ] All webhooks functioning
2. [ ] Edge Functions deployed
3. [ ] Database constraints working
4. [ ] Frontend/backend communication

## 🚀 Production Readiness

### Before Going Live
- [ ] Switch Stripe to live mode
- [ ] Update webhook URLs to production
- [ ] Environment variables updated
- [ ] Database backup completed
- [ ] Monitoring setup complete

### Launch Checklist
- [ ] Test with real payment method
- [ ] Verify production webhook delivery
- [ ] Monitor error rates
- [ ] Check payment reconciliation

---

**Testing Notes:**
- Use Stripe test mode for all testing
- Keep detailed logs of any issues
- Test on multiple devices/browsers
- Validate mobile responsiveness
