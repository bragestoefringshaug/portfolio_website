# 🐳 Docker + Caddy Portfolio Hosting Tutorial

## Why Docker + Caddy?

- **🐳 Docker**: Containerized, consistent deployment across any system
- **🔒 Automatic HTTPS**: Caddy automatically gets SSL certificates from Let's Encrypt
- **⚡ Easy Updates**: One command to rebuild and deploy
- **🛡️ Security**: Built-in security headers and DDoS protection
- **📦 Portable**: Works on any server with Docker

---

## Prerequisites

- Docker Desktop installed on Windows
- Your domain name
- Basic understanding of Docker

---

## Step 1: Install Docker Desktop

### Download and Install:
1. Go to https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows
3. Install and restart your computer
4. Verify installation:
   ```powershell
   docker --version
   docker-compose --version
   ```

---

## Step 2: Configure Your Domain

### Update Caddyfile:
1. **Open `Caddyfile`**
2. **Replace `yourdomain.com`** with your actual domain
3. **Save the file**

**Example:**
```
# Change this:
yourdomain.com {

# To this:
myportfolio.com {
```

---

## Step 3: Configure DNS

### Point Your Domain to Your Server:
1. **Get your server's public IP** (where Docker is running)
2. **In your domain registrar's DNS settings:**
   ```
   Type: A
   Name: @
   Value: YOUR_SERVER_IP
   TTL: 300
   
   Type: A
   Name: www
   Value: YOUR_SERVER_IP
   TTL: 300
   ```

---

## Step 4: Deploy Your Portfolio

### Option A: One-Click Deployment
```powershell
# Double-click deploy-docker.bat
# OR run in terminal:
.\deploy-docker.bat
```

### Option B: Manual Deployment
```powershell
# Build and start
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

---

## Step 5: Verify Everything Works

### Check Services:
```powershell
# Check if containers are running
docker compose ps

# Should show:
# - portfolio-app (running)
# - portfolio-caddy (running)
```

### Test Your Site:
- **HTTP**: http://yourdomain.com
- **HTTPS**: https://yourdomain.com (automatic redirect)
- **Local**: http://localhost (if testing locally)

---

## Step 6: Monitor and Maintain

### Useful Commands:

```powershell
# Check status
docker compose ps

# View logs
docker compose logs portfolio
docker compose logs caddy

# Restart services
docker compose restart

# Update and redeploy
docker compose down
docker compose up -d --build

# Stop everything
docker compose down

# View resource usage
docker stats
```

---

## Automatic Updates

### Update Your Portfolio:
```powershell
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose down
docker compose up -d --build
```

---

## Security Features

### What Caddy Provides:
- ✅ **Automatic HTTPS** (Let's Encrypt certificates)
- ✅ **HTTP/2** support
- ✅ **Security headers** (HSTS, XSS protection, etc.)
- ✅ **DDoS protection**
- ✅ **Rate limiting**
- ✅ **Compression** (gzip)

### What Docker Provides:
- ✅ **Isolated environment**
- ✅ **Resource limits**
- ✅ **Easy rollbacks**
- ✅ **Consistent deployment**

---

## Troubleshooting

### Common Issues:

1. **"Port 80/443 already in use"**
   ```powershell
   # Check what's using the ports
   netstat -ano | findstr :80
   netstat -ano | findstr :443
   
   # Stop conflicting services
   ```

2. **"SSL certificate not working"**
   - Check DNS propagation: https://dnschecker.org
   - Verify domain points to your server
   - Check Caddy logs: `docker compose logs caddy`

3. **"Site not loading"**
   - Check if containers are running: `docker compose ps`
   - Check logs: `docker compose logs`
   - Verify firewall allows ports 80 and 443

### Debug Commands:

```powershell
# Check container logs
docker compose logs portfolio
docker compose logs caddy

# Check container status
docker compose ps

# Check resource usage
docker stats

# Access container shell
docker compose exec portfolio sh
docker compose exec caddy sh

# Check network
docker network ls
docker network inspect portfolio_portfolio-network
```

---

## Production Optimizations

### Resource Limits:
Add to `docker-compose.yml`:
```yaml
services:
  portfolio:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Monitoring:
```powershell
# Install monitoring tools
docker run -d --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower
```

---

## Backup and Recovery

### Backup:
```powershell
# Backup Caddy data
docker run --rm -v portfolio_caddy_data:/data -v portfolio_caddy_config:/config \
  -v ${PWD}:/backup alpine tar czf /backup/caddy-backup.tar.gz -C /data . -C /config .
```

### Recovery:
```powershell
# Restore Caddy data
docker run --rm -v portfolio_caddy_data:/data -v portfolio_caddy_config:/config \
  -v ${PWD}:/backup alpine tar xzf /backup/caddy-backup.tar.gz -C /
```

---

## Cost Breakdown

- **Domain**: $10-15/year
- **Server**: $5-20/month (VPS) or FREE (your computer)
- **SSL Certificate**: FREE (Let's Encrypt via Caddy)
- **Total**: $10-15/year + server costs

---

## Alternative: Cloud Hosting

### Deploy to Cloud:
- **DigitalOcean**: $5/month droplet
- **Linode**: $5/month instance
- **AWS EC2**: $3-10/month t2.micro
- **Google Cloud**: $5-15/month e2-micro

### Same Docker setup works on any cloud provider!

---

## 🎉 Benefits Summary

✅ **Zero-config HTTPS** - Caddy handles everything  
✅ **One-command deployment** - `docker-compose up -d`  
✅ **Automatic updates** - Easy to maintain  
✅ **Production-ready** - Security headers, compression, etc.  
✅ **Portable** - Works anywhere Docker runs  
✅ **Scalable** - Easy to add load balancers, databases, etc.  

**Your portfolio is now enterprise-grade! 🚀**
