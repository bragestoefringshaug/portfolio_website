@echo off
echo ========================================
echo    Docker Portfolio Deployment
echo ========================================
echo.

echo [1/6] Stopping existing containers...
docker compose down
echo ✓ Stopped existing containers
echo.

echo [2/6] Building Docker image...
docker compose build --no-cache
if %errorlevel% neq 0 (
    echo ERROR: Docker build failed!
    pause
    exit /b 1
)
echo ✓ Docker image built successfully!
echo.

echo [3/6] Starting services...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start services!
    pause
    exit /b 1
)
echo ✓ Services started successfully!
echo.

echo [4/6] Waiting for services to be ready...
timeout /t 10 /nobreak >nul
echo ✓ Services should be ready now
echo.

echo [5/6] Checking container status...
docker compose ps
echo.

echo [6/6] Checking logs...
docker compose logs --tail=20
echo.

echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo Your portfolio is now running with Docker + Caddy!
echo.
echo Services:
echo   Portfolio App: http://localhost:3000 (internal)
echo   Caddy Proxy:   http://localhost:80
echo   HTTPS:         https://yourdomain.com (when DNS is configured)
echo.
echo Useful commands:
echo   docker compose ps          - Check status
echo   docker compose logs        - View logs
echo   docker compose restart     - Restart services
echo   docker compose down        - Stop services
echo   docker compose up -d       - Start services
echo.
echo To update your domain:
echo   1. Edit Caddyfile and replace 'yourdomain.com' with your actual domain
echo   2. Run: docker compose restart caddy
echo.
pause
