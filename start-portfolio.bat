@echo off
echo Starting Portfolio with Cloudflare Tunnel...
echo.
echo 1. Starting Next.js development server...
start /B npm run dev
timeout /t 5 /nobreak >nul
echo.
echo 2. Creating Cloudflare Tunnel...
echo Your portfolio will be available at: https://your-portfolio.trycloudflare.com
echo.
echo Press Ctrl+C to stop both the server and tunnel
cloudflared tunnel --url http://localhost:3000
