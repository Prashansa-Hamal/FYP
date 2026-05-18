# Security Policy

## 🔒 Security Best Practices

### Environment Variables

**CRITICAL:** Never commit `.env` files to the repository!

1. Copy `.env.example` to `.env`
2. Fill in your actual credentials
3. Never share your `.env` file
4. Rotate credentials immediately if exposed

### Credential Rotation

If you accidentally commit credentials:

1. **Immediately rotate ALL exposed credentials:**
   - Database passwords
   - API keys (Khalti, eSewa, EdgeStore)
   - OAuth secrets
   - JWT secrets
   - Email passwords

2. **Remove from Git history:**
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (if safe):**
   ```bash
   git push origin --force --all
   ```

### Required Security Measures

- [ ] Use strong passwords (min 12 characters)
- [ ] Enable 2FA on all services
- [ ] Use environment-specific credentials (dev/staging/prod)
- [ ] Regularly rotate API keys
- [ ] Monitor for unauthorized access
- [ ] Use HTTPS in production
- [ ] Enable rate limiting
- [ ] Implement proper authentication
- [ ] Validate all user inputs
- [ ] Use parameterized queries (already done with Prisma)

### Reporting Security Issues

If you discover a security vulnerability, please email:
**security@yourcompany.com**

Do NOT create public GitHub issues for security vulnerabilities.

## 🛡️ Current Security Status

### ✅ Implemented
- Bcrypt password hashing
- JWT token authentication
- Redis session management
- Prisma ORM (SQL injection prevention)
- HTTPS-only cookies
- Payment gateway signature verification

### ⚠️ Needs Improvement
- Rate limiting on authentication endpoints
- Account lockout after failed attempts
- 2FA support
- CSRF protection
- Content Security Policy headers
- Webhook signature verification

### ❌ Critical Issues (TO FIX)
- Role-based access control enforcement
- Authorization checks on sensitive endpoints
- Input sanitization for user-generated content
- Session rotation on privilege escalation

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
