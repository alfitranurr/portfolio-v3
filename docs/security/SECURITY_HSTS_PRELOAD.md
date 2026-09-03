# HSTS Preload List — Submission Guide

> **Date:** 2026-09-03
> **Skill used:** `performing-ssl-tls-security-assessment`
> **Status:** Ready for submission (after deploy)

---

## Prerequisites

HSTS preload submission requires ALL of the following:

1. ✅ **HTTPS-only site** — No HTTP endpoints (Vercel enforces HTTPS by default)
2. ✅ **Valid certificate** — Vercel provides auto-renewing TLS certificates
3. ✅ **HSTS header on all responses** — Already configured in `next.config.ts`
4. ✅ **HSTS max-age ≥ 1 year** — Configured: `max-age=63072000` (2 years)
5. ✅ **includeSubDomains** — Configured
6. ✅ **preload directive** — Configured

## Current HSTS Header

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

Verified in `next.config.ts` headers() function.

---

## Steps to Submit

### 1. Deploy to Production
```bash
# Deploy to Vercel (HTTPS is automatic)
vercel --prod
```

### 2. Verify HSTS Header
```bash
# Check the header is present
curl -sI https://yourdomain.com | grep -i strict-transport-security
# Expected: strict-transport-security: max-age=63072000; includeSubDomains; preload
```

### 3. Submit to HSTS Preload List
Go to: **https://hstspreload.org/**

Enter your domain and click "Submit".

### 4. Wait for Inclusion
- Review takes 1-12 weeks
- Your domain will be added to browser preload lists (Chrome, Firefox, Safari, Edge)
- Once added, browsers will ALWAYS use HTTPS for your domain — even on first visit

### 5. Verify Inclusion
```bash
# After inclusion (check months later)
curl -s https://raw.githubusercontent.com/chromium/chromium/main/net/http/transport_security_state_static.json | grep yourdomain
```

---

## Important Notes

- **Irreversible:** Once your domain is in the preload list, removing it takes months. Make sure you're committed to HTTPS.
- **Subdomains:** `includeSubDomains` means ALL subdomains must support HTTPS. If you have subdomains that only work on HTTP, don't submit.
- **Rollback:** If you need to remove the HSTS preload, submit a removal request at https://hstspreload.org/removal/
- **Testing:** Test thoroughly before submitting. Once browsers ship your domain in preload lists, users can't access HTTP.

---

## Alternative: Vercel HSTS

Vercel automatically adds HSTS headers for custom domains, but the `max-age` may differ. Our `next.config.ts` header takes precedence and ensures the `preload` directive is present.
