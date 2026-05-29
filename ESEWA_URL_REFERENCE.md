# eSewa URL Quick Reference

## 🚨 THE KEY ISSUE: Different URLs for Different Operations

### ❌ WRONG (What you were doing):
```
Payment:      https://rc-epay.esewa.com.np/api/epay/main/v2/form
Verification: https://rc-epay.esewa.com.np/api/epay/transaction/status/  ← 404 ERROR!
```

### ✅ CORRECT (What you should do):
```
Payment:      https://rc-epay.esewa.com.np/api/epay/main/v2/form
Verification: https://rc.esewa.com.np/api/epay/transaction/status/  ← Notice: no "-epay"!
```

---

## 📍 Complete URL Mapping

### Test Environment (Development)

| Operation | URL | Used In |
|-----------|-----|---------|
| **Payment Form** | `https://rc-epay.esewa.com.np/api/epay/main/v2/form` | `esewaCheckoutForm.tsx` |
| **Status Check** | `https://rc.esewa.com.np/api/epay/transaction/status/` | `src/lib/esewa.ts` |

### Production Environment

| Operation | URL | Used In |
|-----------|-----|---------|
| **Payment Form** | `https://epay.esewa.com.np/api/epay/main/v2/form` | `esewaCheckoutForm.tsx` |
| **Status Check** | `https://esewa.com.np/api/epay/transaction/status/` | `src/lib/esewa.ts` |

---

## 🔧 Environment Variables Setup

### Your `.env` file should have:

```env
# Payment Gateway URL (with -epay)
NEXT_PUBLIC_ESEWA_GATEWAY_URL=https://rc-epay.esewa.com.np

# Verification URL (without -epay) ← THIS WAS MISSING!
NEXT_PUBLIC_ESEWA_VERIFICATION_URL=https://rc.esewa.com.np

# Other URLs
NEXT_PUBLIC_ESEWA_SUCCESS_URL=http://localhost:3000/paymentsuccess
NEXT_PUBLIC_ESEWA_FAILURE_URL=http://localhost:3000/paymentfailure

# Product Code
NEXT_PUBLIC_ESEWA_PRODUCT_CODE=EPAYTEST

# Secret Key (server-only, no NEXT_PUBLIC_ prefix!)
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
```

---

## 🔄 Payment Flow with Correct URLs

```
1. Customer clicks "Pay via eSewa"
   ↓
2. Your app calls: POST /api/esewa/initiate
   (Server generates signature securely)
   ↓
3. Form submits to: https://rc-epay.esewa.com.np/api/epay/main/v2/form
   (Customer enters eSewa credentials)
   ↓
4. eSewa redirects back with encoded data
   ↓
5. Your app calls: POST /api/esewa/verify
   ↓
6. Server verifies at: https://rc.esewa.com.np/api/epay/transaction/status/
   (Uses CORRECT URL - no more 404!)
   ↓
7. Payment confirmed ✅
```

---

## 🎯 Quick Checklist

Before testing, verify:

- [ ] `.env` has `NEXT_PUBLIC_ESEWA_VERIFICATION_URL=https://rc.esewa.com.np`
- [ ] `src/lib/esewa.ts` uses `NEXT_PUBLIC_ESEWA_VERIFICATION_URL`
- [ ] No `NEXT_PUBLIC_ESEWA_SECRET_KEY` in your code
- [ ] Server generates signature, not client
- [ ] Test credentials ready (eSewa ID: 9806800001, Password: Nepal@123)

---

## 🐛 Debugging Tips

### If you get 404 error:
```bash
# Check the verification URL in server logs
# Should see: https://rc.esewa.com.np/api/epay/transaction/status/...
# NOT: https://rc-epay.esewa.com.np/api/epay/transaction/status/...
```

### If signature mismatch:
```bash
# Make sure signature is generated on server
# Check /api/esewa/initiate is being called
# Verify ESEWA_SECRET_KEY is set (without NEXT_PUBLIC_)
```

---

## 📞 eSewa Support

If you need help from eSewa:
- **Developer Portal**: https://developer.esewa.com.np
- **Test Credentials**: https://developer.esewa.com.np/pages/Test-credentials
- **Contact**: https://developer.esewa.com.np/pages/Contact

---

**Remember**: The `-epay` in the domain is ONLY for payment submission, NOT for verification! 🎯
