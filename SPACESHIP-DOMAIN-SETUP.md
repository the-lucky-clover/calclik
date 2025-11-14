# 🚀 CALCLiK.com Domain Setup - Spaceship.com Guide

## 🌐 Live Deployment Status

✅ **Successfully Deployed**: https://19a76ed5.CALCLiK.pages.dev  
🔄 **Next Step**: Connect CALCLiK.com custom domain

---

## 📋 Quick Setup Checklist

### ✅ Completed
- [x] GitHub repository pushed
- [x] Cloudflare Pages deployed
- [x] Landing page live and functional
- [x] Extension download working

### 🔄 Next Steps (15 minutes)
- [ ] Register CALCLiK.com on Spaceship.com
- [ ] Configure Cloudflare DNS
- [ ] Connect custom domain
- [ ] Verify SSL certificate

---

## 🛒 Step 1: Register CALCLiK.com Domain

### 1.1 Visit Spaceship.com
```
🌐 Website: https://spaceship.com
💰 Expected Cost: ~$12-15/year
⏱️  Time Required: 5 minutes
```

### 1.2 Domain Search & Purchase
1. **Search for Domain**
   ```
   Search: "CALCLiK.com"
   Check availability (likely available)
   ```

2. **Add to Cart & Purchase**
   ```
   Price: ~$12-15 USD/year
   Payment: Credit card or PayPal
   Auto-renewal: Recommended (ON)
   ```

3. **Complete Registration**
   - Fill in contact information
   - Verify email address
   - Complete payment

---

## ⚙️ Step 2: Spaceship.com DNS Configuration

### 2.1 Access Domain Management
```
Login to Spaceship Dashboard → My Domains → CALCLiK.com
```

### 2.2 Change Nameservers
1. **Current Setting**: Spaceship.com nameservers
2. **New Setting**: Cloudflare nameservers (from next step)

**❗ Important**: Don't change nameservers yet - get Cloudflare nameservers first!

---

## 🌩️ Step 3: Cloudflare Setup

### 3.1 Add Domain to Cloudflare
```bash
# Go to Cloudflare Dashboard
https://dash.cloudflare.com → Websites → Add a Site

Domain: CALCLiK.com
Plan: Free ($0/month) ✅
```

### 3.2 Get Cloudflare Nameservers
Cloudflare will provide 2 nameservers (example):
```
NS1: alex.ns.cloudflare.com  
NS2: nina.ns.cloudflare.com
```

**📝 Copy these - you'll need them for Spaceship.com**

---

## 🔗 Step 4: Connect Nameservers

### 4.1 Update Spaceship.com Nameservers
```
Spaceship Dashboard → CALCLiK.com → DNS Management
```

**Change from:**
```
ns1.spaceship.com
ns2.spaceship.com  
```

**Change to:** (your actual Cloudflare nameservers)
```
alex.ns.cloudflare.com
nina.ns.cloudflare.com
```

### 4.2 Save & Wait
- **Save changes** in Spaceship.com
- **Propagation time**: 2-24 hours (usually 2-4 hours)
- **Check status**: Cloudflare dashboard will show "Active"

---

## 📱 Step 5: Connect to Cloudflare Pages

### 5.1 Add Custom Domain
```
Cloudflare Pages → CALCLiK project → Custom domains → Set up a custom domain
```

### 5.2 Domain Configuration
```
Domain: CALCLiK.com
Type: Custom domain (not subdomain)
```

### 5.3 DNS Records (Auto-created)
```
Type: CNAME
Name: CALCLiK.com
Target: 19a76ed5.CALCLiK.pages.dev
Proxy: Enabled (orange cloud) ☁️
```

---

## 🔒 Step 6: SSL & Security (Auto-configured)

### 6.1 SSL Certificate
- **Status**: Auto-provisioned by Cloudflare
- **Time**: 10-15 minutes after DNS activation  
- **Verification**: Green lock icon at https://CALCLiK.com

### 6.2 Security Headers (Already configured)
```
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff  
✅ Referrer-Policy: strict-origin-when-cross-origin
✅ Force HTTPS redirect
```

---

## 🧪 Step 7: Testing & Verification

### 7.1 DNS Propagation Check
```bash
# Test from terminal
dig CALCLiK.com

# Online tools
https://whatsmydns.net → Enter: CALCLiK.com
```

### 7.2 Website Functionality Test
```
✅ https://CALCLiK.com loads
✅ Download button works  
✅ Installation instructions visible
✅ Mobile responsive
✅ HTTPS certificate active (green lock)
```

---

## 🎯 Step 8: Spaceship.com Specific Settings

### 8.1 Domain Lock (Recommended)
```
Spaceship Dashboard → CALCLiK.com → Domain Settings
Enable: Domain Lock (prevents unauthorized transfers)
```

### 8.2 Privacy Protection (Recommended)
```  
Setting: WHOIS Privacy Protection
Status: Should be enabled by default
Benefit: Hides personal information from public WHOIS
```

### 8.3 Auto-Renewal (Recommended)
```
Setting: Auto-renewal  
Status: ON (prevents accidental expiration)
Renewal: 30 days before expiration
```

---

## 💡 Troubleshooting Common Issues

### Issue 1: "Domain not found" after 24 hours
**Solution**: 
```
1. Check nameservers in Spaceship.com match Cloudflare exactly
2. Wait additional 24 hours (max propagation time)
3. Contact Spaceship.com support if still not working
```

### Issue 2: SSL certificate not working
**Solution**:
```
1. Ensure DNS is fully propagated (green in Cloudflare)
2. Wait 15-30 minutes after DNS activation  
3. Try clearing browser cache
4. Check Cloudflare SSL/TLS settings (should be "Full (strict)")
```

### Issue 3: Website shows Cloudflare error
**Solution**:
```
1. Verify Pages deployment is active: https://19a76ed5.CALCLiK.pages.dev
2. Check custom domain settings in Cloudflare Pages
3. Ensure CNAME record points to correct .pages.dev URL
```

---

## 📞 Support Contacts

### Spaceship.com Support
```
📧 Email: Available in dashboard  
💬 Live Chat: Business hours (9 AM - 5 PM EST)
📚 Help Center: https://spaceship.com/help
```

### Cloudflare Support  
```
📚 Documentation: https://developers.cloudflare.com
💬 Community: https://community.cloudflare.com  
🎫 Support Ticket: Available in dashboard (free tier)
```

---

## 🔄 Final Deployment URLs

### Production URLs (After domain setup)
```
🌐 Main Site: https://CALCLiK.com
📱 Mobile: https://CALCLiK.com (responsive)  
⬇️  Extension: https://CALCLiK.com/CALCLiK-chrome-extension.zip
```

### Development/Backup URLs
```
🧪 Cloudflare: https://19a76ed5.CALCLiK.pages.dev
📦 GitHub: https://github.com/the-lucky-clover/CALCLiK
```

---

## 💰 Total Cost Breakdown

| Service | Cost | Billing |
|---------|------|---------|
| CALCLiK.com domain (Spaceship) | $12-15 | Annual |
| Cloudflare Pages | $0 | Free forever |
| Cloudflare DNS | $0 | Free forever |
| GitHub hosting | $0 | Free forever |
| **Total** | **$12-15/year** | **$1.25/month** |

---

## ⏱️ Timeline Summary

```
✅ Immediate (0 minutes): Deployment live at temporary URL
🔄 Domain purchase (5 minutes): Register on Spaceship.com  
🔄 DNS setup (10 minutes): Configure Cloudflare + Spaceship
⏳ DNS propagation (2-24 hours): Automatic, no action needed
✅ Final result: CALCLiK.com fully operational
```

---

**🎉 Congratulations! CALCLiK will be live at CALCLiK.com within 24 hours!**

*Last Updated: November 10, 2025*  
*Deployment URL: https://19a76ed5.CALCLiK.pages.dev*