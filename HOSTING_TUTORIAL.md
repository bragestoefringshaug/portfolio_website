# 🌐 Complete Tutorial: Host Your Portfolio on Your Own Domain

## Prerequisites
- Your own domain name
- Windows computer with internet connection
- Basic understanding of DNS settings

---

## Step 1: Get Your Public IP Address

### Method 1: Using PowerShell
```powershell
Invoke-WebRequest -Uri "https://ipinfo.io/ip" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Method 2: Using Browser
Visit: https://whatismyipaddress.com/

**Write down your public IP address: `YOUR_PUBLIC_IP`**

---

## Step 2: Configure Your Domain DNS

### In Your Domain Registrar's Control Panel:

1. **Login** to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. **Find DNS Management** or **DNS Settings**
3. **Add/Edit these DNS records:**

```
Type: A
Name: @ (or leave blank for root domain)
Value: YOUR_PUBLIC_IP
TTL: 300 (or 5 minutes)

Type: A  
Name: www
Value: YOUR_PUBLIC_IP
TTL: 300
```

**Example:**
- If your domain is `myportfolio.com`
- Set both `myportfolio.com` and `www.myportfolio.com` to point to your IP

---

## Step 3: Configure Windows Firewall

### Open Windows Defender Firewall:

1. **Press `Win + R`** → type `wf.msc` → Enter
2. **Click "Inbound Rules"** → **"New Rule"**
3. **Select "Port"** → **Next**
4. **Select "TCP"** → **"Specific local ports"** → **"3000"** → **Next**
5. **Select "Allow the connection"** → **Next**
6. **Check all profiles** → **Next**
7. **Name: "Portfolio Website"** → **Finish**

---

## Step 4: Configure Router Port Forwarding

### Access Your Router:
1. **Find your router's IP** (usually `192.168.1.1` or `192.168.0.1`)
2. **Open browser** → go to router IP
3. **Login** with admin credentials

### Port Forwarding Settings:
- **Service Name:** Portfolio Website
- **External Port:** 80 (HTTP) and 443 (HTTPS)
- **Internal Port:** 3000
- **Internal IP:** Your computer's local IP (usually `192.168.x.x`)
- **Protocol:** TCP

**To find your local IP:**
```powershell
ipconfig | findstr "IPv4"
```

---

## Step 5: Set Up SSL Certificate (HTTPS)

### Option A: Using Cloudflare (Recommended - Free)

1. **Sign up** at https://cloudflare.com
2. **Add your domain** to Cloudflare
3. **Change nameservers** in your domain registrar to Cloudflare's
4. **Enable "Full (Strict)" SSL mode**
5. **Set up Page Rules** to redirect HTTP to HTTPS

### Option B: Using Let's Encrypt (Advanced)

```powershell
# Install Certbot
npm install -g certbot

# Generate certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

---

## Step 6: Create Production Build

### Build your Next.js app for production:

```powershell
npm run build
```

### Install PM2 for process management:

```powershell
npm install -g pm2
```

---

## Step 7: Create Production Configuration

### Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'portfolio',
      script: 'npm',
      args: 'start',
      cwd: 'C:\\Users\\brage\\Documents\\GitHub\\experimental_CV',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

---

## Step 8: Set Up Auto-Start (Optional)

### Create Windows Service with PM2:

```powershell
# Install PM2 Windows startup
npm install -g pm2-windows-startup

# Set up startup
pm2-startup install

# Save PM2 configuration
pm2 save
```

---

## Step 9: Start Your Portfolio

### Start the production server:

```powershell
pm2 start ecosystem.config.js
```

### Check status:

```powershell
pm2 status
pm2 logs portfolio
```

---

## Step 10: Test Your Setup

### Local Test:
- Visit: `http://localhost:3000`

### Public Test:
- Visit: `http://yourdomain.com`
- Visit: `https://yourdomain.com` (if SSL is set up)

---

## Troubleshooting

### Common Issues:

1. **"Site can't be reached"**
   - Check firewall settings
   - Verify port forwarding
   - Check if PM2 is running: `pm2 status`

2. **"Connection refused"**
   - Verify your public IP hasn't changed
   - Check DNS propagation: https://dnschecker.org

3. **"Not secure" warning**
   - Set up SSL certificate
   - Use Cloudflare for free SSL

### Useful Commands:

```powershell
# Check PM2 status
pm2 status

# View logs
pm2 logs portfolio

# Restart app
pm2 restart portfolio

# Stop app
pm2 stop portfolio

# Check if port is open
netstat -an | findstr :3000
```

---

## Security Recommendations

1. **Use Cloudflare** for DDoS protection
2. **Enable Cloudflare's security features**
3. **Keep your system updated**
4. **Use strong router passwords**
5. **Consider using a VPN** for additional security

---

## Maintenance

### Regular Tasks:
- **Monitor PM2 status** regularly
- **Check for updates** to your portfolio
- **Monitor server resources** (CPU, RAM)
- **Backup your code** regularly

### Update Your Portfolio:
```powershell
git pull origin main
npm run build
pm2 restart portfolio
```

---

## Cost Breakdown

- **Domain:** $10-15/year
- **Hosting:** FREE (your computer)
- **SSL Certificate:** FREE (Cloudflare)
- **Total:** ~$10-15/year

---

## Alternative: Cloudflare Tunnel (Easier)

If the above seems complex, you can use Cloudflare Tunnel:

```powershell
# Install Cloudflare Tunnel
npm install -g cloudflared

# Start your app
npm run dev

# In another terminal, create tunnel
cloudflared tunnel --url http://localhost:3000
```

This gives you a public URL without port forwarding!

---

**🎉 Congratulations! Your portfolio is now live on your own domain!**
