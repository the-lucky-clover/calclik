# 🚀 CALCLiK Deployment Guide

## Complete Tech Stack Deployment (Free Tier)

### 📋 Prerequisites
- GitHub account (free)
- Cloudflare account (free)
- Spaceship.com account for domain registration
- Node.js installed locally (for development)

---

## 🌐 Step 1: Cloudflare Pages Deployment

### 1.1 Connect GitHub Repository

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Sign up for free account if needed

2. **Create New Pages Project**
   ```
   Dashboard → Pages → Create a project → Connect to Git
   ```

3. **Connect GitHub Repository**
   - Choose "GitHub" as git provider
   - Authorize Cloudflare to access your repositories
   - Select repository: `the-lucky-clover/CALCLiK`
   - Choose branch: `master`

### 1.2 Configure Build Settings

```yaml
Build Configuration:
├── Framework preset: None
├── Build command: (leave empty)
├── Build output directory: landing-page
└── Root directory: /
```

**Environment Variables:** (None needed for static site)

### 1.3 Deploy

- Click **"Save and Deploy"**
- Deployment will take 2-3 minutes
- You'll get a temporary URL: `https://CALCLiK-xyz.pages.dev`

---

## 🔗 Step 2: Custom Domain Setup (CALCLiK.com)

### 2.1 Register Domain on Spaceship.com

1. **Visit Spaceship.com**
   - Go to [spaceship.com](https://spaceship.com)
   - Search for "CALCLiK.com"
   - Add to cart and complete purchase (~$10-15/year)

2. **Access Domain Management**
   - Login to Spaceship dashboard
   - Go to "My Domains" → "CALCLiK.com"

### 2.2 Configure DNS in Cloudflare

1. **Add Domain to Cloudflare**
   ```
   Cloudflare Dashboard → Websites → Add a Site
   Enter: CALCLiK.com
   Choose: Free plan
   ```

2. **Update Nameservers at Spaceship.com**
   
   **In Cloudflare:** Copy the 2 nameservers provided (example):
   ```
   alex.ns.cloudflare.com
   nina.ns.cloudflare.com
   ```

   **In Spaceship.com:**
   - Go to Domain → DNS Management
   - Change nameservers from Spaceship to Cloudflare nameservers
   - Save changes (propagation takes 24-48 hours)

### 2.3 Connect Custom Domain to Pages

1. **In Cloudflare Pages Dashboard**
   ```
   Pages → CALCLiK project → Custom domains → Set up a custom domain
   ```

2. **Add Domain Records**
   ```
   Domain: CALCLiK.com
   Type: CNAME
   Target: CALCLiK-xyz.pages.dev (your actual Pages URL)
   ```

3. **Add WWW Redirect (Optional)**
   ```
   Domain: www.CALCLiK.com  
   Type: CNAME
   Target: CALCLiK.com
   ```

---

## 🔒 Step 3: SSL & Security Configuration

### 3.1 Enable SSL (Auto-configured)
- Cloudflare automatically provisions SSL certificates
- Wait 10-15 minutes for SSL activation
- Verify HTTPS works: `https://CALCLiK.com`

### 3.2 Security Settings (Recommended)
```yaml
SSL/TLS Settings:
├── Encryption mode: Full (strict)
├── Always Use HTTPS: On
├── HSTS: Enabled
└── Minimum TLS Version: 1.2
```

---

## 📊 Step 4: Performance & Analytics Setup

### 4.1 Enable Cloudflare Analytics (Free)
```
Cloudflare Dashboard → CALCLiK.com → Analytics → Web Analytics
Enable: Browser Insights (free tier)
```

### 4.2 Performance Optimizations
```yaml
Speed Settings:
├── Auto Minify: HTML, CSS, JS (all enabled)  
├── Brotli: Enabled
├── Browser Cache TTL: 4 hours
└── Development Mode: Off (for production)
```

---

## 🚀 Step 5: Continuous Deployment Setup

### 5.1 Auto-Deploy Configuration
- **Already Active**: Pushes to `master` branch auto-deploy
- **Preview Builds**: Pull requests create preview deployments
- **Build Notifications**: Configure in Pages settings

### 5.2 Branch Protection (Optional)
```
GitHub Repository Settings → Branches → Add rule
Branch name pattern: master
□ Require pull request reviews
□ Require status checks
```

---

## 📱 Step 6: Extension Distribution

### 6.1 Chrome Web Store (Optional)
```
1. Create Chrome Developer Account ($5 one-time fee)
2. Package extension: ./build-extension.sh
3. Upload CALCLiK-chrome-extension.zip
4. Complete store listing with screenshots
5. Submit for review (7-14 days)
```

### 6.2 Direct Distribution (Current)
- **Download Link**: `https://CALCLiK.com/CALCLiK-chrome-extension.zip`
- **Installation**: Documented on landing page
- **Updates**: Manual download of new versions

---

## 🔧 Step 7: Monitoring & Maintenance

### 7.1 Uptime Monitoring (Free Options)
- **UptimeRobot**: Free monitoring for 5 sites
- **Cloudflare**: Built-in analytics and alerts

### 7.2 Performance Monitoring
```yaml
Tools:
├── Google PageSpeed Insights (free)
├── GTmetrix (free tier)  
├── Cloudflare Analytics (free)
└── GitHub Issues for bug tracking
```

---

## 🎯 Step 8: Post-Deployment Checklist

### ✅ Domain Verification
- [ ] `CALCLiK.com` loads correctly
- [ ] `www.CALCLiK.com` redirects to `CALCLiK.com`
- [ ] HTTPS certificate active (green lock)
- [ ] All page sections load properly

### ✅ Functionality Tests
- [ ] Download button works (`CALCLiK-chrome-extension.zip`)
- [ ] Installation tabs function correctly  
- [ ] Mobile responsive design
- [ ] Page load speed < 3 seconds

### ✅ SEO & Analytics
- [ ] Google Analytics (if added)
- [ ] Meta tags and descriptions
- [ ] Sitemap.xml (optional for single page)
- [ ] robots.txt (optional)

---

## 📞 Support Resources

### Cloudflare Support
- **Documentation**: [developers.cloudflare.com](https://developers.cloudflare.com)
- **Community**: [community.cloudflare.com](https://community.cloudflare.com)
- **Status**: [cloudflarestatus.com](https://cloudflarestatus.com)

### Spaceship.com Support  
- **Help Center**: Available in dashboard
- **Live Chat**: Business hours support
- **Email**: Domain management issues

### GitHub Support
- **Documentation**: [docs.github.com](https://docs.github.com)
- **Community**: [github.community](https://github.community)
- **Status**: [githubstatus.com](https://githubstatus.com)

---

## 💰 Cost Breakdown (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| GitHub | Free | $0 |
| Cloudflare Pages | Free | $0 |
| Cloudflare DNS | Free | $0 |
| CALCLiK.com Domain | Annual | ~$1.25/month |
| **Total** | | **~$1.25/month** |

---

## 🔄 Update Workflow

1. **Code Changes**: Make updates locally
2. **Commit**: `git commit -m "Update description"`
3. **Push**: `git push origin master`
4. **Auto-Deploy**: Cloudflare automatically deploys in ~2 minutes
5. **Verify**: Check `https://CALCLiK.com` for changes

---

*Last Updated: November 10, 2025*
*CALCLiK v2.0 - Privacy-First Event Scanner*