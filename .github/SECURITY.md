# Security Policy

## Reporting a Vulnerability

The security of NeuClix Tactical Reactor is important to us. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Do not** open a public GitHub issue for security vulnerabilities.

Instead, please email us at **security@neuclix.com** with:

1. **Description**: A clear description of the vulnerability
2. **Affected Components**: Which parts of the application are affected
3. **Steps to Reproduce**: How to reproduce the vulnerability (if possible)
4. **Potential Impact**: Assessment of the security impact
5. **Your Contact Information**: So we can follow up with you

### What to Expect

- We will acknowledge receipt of your report within 48 hours
- We will investigate and assess the severity
- We will keep you informed of our progress
- We will work to develop and release a patch
- We appreciate if you keep the vulnerability confidential until we've released a fix

### Supported Versions

We provide security updates for:

- **Latest Major Version**: Full support for the current major version
- **Previous Major Version**: Security patches for critical issues only
- **Older Versions**: No support (we recommend upgrading)

### Security Measures

Our application implements:

- **Input Validation**: Comprehensive validation and sanitization of user inputs
- **Rate Limiting**: Per-endpoint rate limits to prevent abuse
- **CSRF Protection**: Double-submit cookie pattern for state-changing operations
- **Webhook Idempotency**: Duplicate webhook event prevention
- **Password Security**: Enforced password complexity requirements (12+ chars, mixed case, numbers, special chars)
- **Authentication**: Supabase SSR with secure session management
- **Error Handling**: Generic error messages to prevent information disclosure
- **Database Security**: Row-level security (RLS) policies
- **Environment Secrets**: Sensitive credentials stored in `.env.local` (never committed)

### Key Security Files

- `.env.local.example`: Template for environment configuration
- `SECURITY_FIXES.md`: Detailed documentation of security implementations
- `src/lib/validation.ts`: Input validation utilities
- `src/lib/rate-limit.ts`: Rate limiting implementation
- `src/lib/csrf.ts`: CSRF protection implementation
- `supabase/migrations/20251228_add_webhook_idempotency.sql`: Webhook event tracking

### Responsible Disclosure Timeline

1. **Day 1**: Vulnerability reported
2. **Days 1-2**: We assess severity and impact
3. **Days 3-7**: We develop a fix
4. **Days 8-14**: We release a patch and security advisory
5. **Post-Release**: We work with the reporter to refine the disclosure

Thank you for helping us keep NeuClix Tactical Reactor secure!

---

*Last Updated: 2025-12-29*
*Maintainer: NeuClix Security Team*
