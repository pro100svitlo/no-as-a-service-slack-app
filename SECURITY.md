# Security Policy

## Reporting a Vulnerability

We take the security of No-as-a-Service seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please DO NOT create a public GitHub issue for security vulnerabilities.**

Instead, please report security issues through one of the following methods:

1. **GitHub Security Advisories** (Preferred)
   - Go to https://github.com/pro100svitlo/no-as-a-service-slack-app/security/advisories
   - Click "Report a vulnerability"
   - Provide details about the vulnerability

2. **Email**
   - Send details to: [your-security-email@example.com]
   - Use subject line: "Security Vulnerability: No-as-a-Service"

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)
- Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies based on severity (critical issues within 7 days)

### Severity Levels

- **Critical**: Remote code execution, data breach, authentication bypass
- **High**: SQL injection, XSS, unauthorized access
- **Medium**: Information disclosure, denial of service
- **Low**: Minor issues with limited impact

## Supported Versions

We provide security updates for the latest version of the app. Please ensure you're running the most recent version.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices

When using No-as-a-Service:

1. **Keep Secrets Safe**
   - Never commit `SLACK_CLIENT_SECRET` or `SLACK_SIGNING_SECRET` to version control
   - Store secrets in Supabase Edge Function secrets
   - Rotate tokens if compromised

2. **Monitor Access**
   - Review app installations regularly
   - Remove app from workspaces no longer in use
   - Monitor Supabase logs for unusual activity

3. **Update Regularly**
   - Pull latest changes from the repository
   - Redeploy functions after updates
   - Check for security advisories

## Known Security Considerations

- **Bot Token Storage**: Bot tokens are stored in Supabase database. Ensure your Supabase project has proper access controls.
- **Request Verification**: All Slack requests are verified using signature verification to prevent unauthorized access.
- **HTTPS Only**: All communications occur over encrypted HTTPS connections.

## Disclosure Policy

- We will acknowledge receipt of vulnerability reports within 48 hours
- We will provide regular updates on the remediation progress
- We will credit reporters (unless they prefer to remain anonymous)
- We will publicly disclose vulnerabilities after a fix is released

## Security Updates

Security updates will be announced via:
- GitHub Security Advisories
- Release notes in the repository
- README.md updates

## Contact

For security-related questions that are not vulnerabilities:
- GitHub Issues: https://github.com/pro100svitlo/no-as-a-service-slack-app/issues
- Email: [your-email@example.com]

---

Thank you for helping keep No-as-a-Service and its users safe!
