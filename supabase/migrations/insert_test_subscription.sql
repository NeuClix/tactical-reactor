-- Insert test subscription for steve+treactortest@neuclix.com with pro plan
INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  status,
  plan,
  current_period_start,
  current_period_end
)
SELECT
  id as user_id,
  'cus_test_' || id::text as stripe_customer_id,
  'sub_test_' || id::text as stripe_subscription_id,
  'active' as status,
  'pro' as plan,
  NOW() as current_period_start,
  NOW() + INTERVAL '30 days' as current_period_end
FROM auth.users
WHERE email = 'steve+treactortest@neuclix.com'
ON CONFLICT (user_id) DO UPDATE SET
  status = 'active',
  plan = 'pro',
  updated_at = NOW();
