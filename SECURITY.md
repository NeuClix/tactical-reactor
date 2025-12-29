# Security Policy for NeuClix Tactical Reactor

## Credential Rotation Procedures

### IMMEDIATE ACTION REQUIRED (Post-Review)

All secrets in `.env.local` may have been exposed during development. Follow these steps immediately:

#### Step 1: Rotate Stripe Credentials
1. Go to https://dashboard.stripe.com
2. Navigate to Settings → API Keys
3. Click "Reveal test key" for Secret Key
4. Regenerate new secret key
5. Update `STRIPE_SECRET_KEY` in `.env.local`
6. Regenerate webhook signing secret:
   - Go to Webhooks section
   - Find your endpoint
   - Click to regenerate signing secret
7. Update `STRIPE_WEBHOOK_SECRET` in `.env.local`

#### Step 2: Rotate Anthropic API Key
1. Go to https://console.anthropic.com
2. Navigate to API Keys
3. Revoke the old key
4. Generate new API key
5. Update `ANTHROPIC_API_KEY` in `.env.local`

#### Step 3: Rotate Supabase Keys
1. Go to https://supabase.com/dashboard
2. Project Settings → API
3. Rotate service role key
4. Update `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
5. **Note:** Only rotate if actively used. Prefer using anon key for client operations.

#### Step 4: Verify Git History
```bash
# Check if secrets were ever committed
git log --all --full-history -- .env.local
git log --all -p --all -S 'ANTHROPIC_API_KEY'
git log --all -p --all -S 'STRIPE_SECRET_KEY'

# If found in history, use git-filter-branch or BFG to remove:
# https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
```

### Environment Variable Management (Production)

**DO NOT use .env.local in production.** Instead:

#### For Vercel Deployment
1. Go to Project Settings → Environment Variables
2. Add each variable for production environment:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Variables are automatically encrypted and never exposed in logs

#### For Self-Hosted Deployment
1. Use secrets management service:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Kubernetes Secrets
2. Load secrets at application startup (not from files)
3. Implement secret rotation without redeployment

### Credential Rotation Schedule

- **Every 90 days:** Rotate API keys
- **Immediately:** If suspicious activity detected
- **On employee departure:** Rotate all credentials
- **After security incident:** Rotate all credentials

### Monitoring for Credential Misuse

Enable monitoring to detect unauthorized usage:

#### Stripe
- Monitor for unusual transaction volume
- Set up Stripe alerts for webhook failures
- Review API event logs for unauthorized access

#### Anthropic
- Monitor token usage for unusual spikes
- Set up billing alerts
- Review API usage patterns

#### Supabase
- Enable database activity monitoring
- Monitor RLS policy violations
- Review authentication logs

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please email: **security@neuclix.com**

**Do not:**
- Publicly disclose the vulnerability
- Create a public GitHub issue
- Attempt to access other users' data

**Do:**
- Email details to security@neuclix.com
- Include steps to reproduce
- Include potential impact
- Allow 90 days for a fix before public disclosure

## Security Best Practices

### Development
- Never commit `.env.local` to git
- Use unique test credentials per developer
- Rotate credentials when leaving the project
- Enable 2FA on all external services (Stripe, Supabase, etc.)

### Deployment
- Always use environment variables for secrets
- Never hardcode credentials in code
- Use infrastructure-level secret management
- Enable audit logging on all services

### Monitoring
- Set up error tracking (Sentry, Datadog)
- Enable API access logs
- Monitor for unusual patterns
- Create alerts for security events

## Compliance

This application is designed with the following compliance standards in mind:

- **PCI-DSS:** Compliant (payment processing via Stripe)
- **GDPR:** Partial compliance - requires privacy policy and data deletion features
- **SOC 2:** Working toward compliance

## Last Updated

December 28, 2025

## Security Review Schedule

- Quarterly security audits
- Monthly dependency updates
- Annual penetration testing
- Ongoing vulnerability monitoring
