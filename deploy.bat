@echo off
echo ========================================
echo    Portfolio Deployment Script
echo ========================================
echo.

echo [1/4] Building production version...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo ✓ Build completed successfully!
echo.

echo [2/4] Installing PM2 globally...
call npm install -g pm2
echo ✓ PM2 installed!
echo.

echo [3/4] Starting portfolio with PM2...
call pm2 start ecosystem.config.js
if %errorlevel% neq 0 (
    echo ERROR: PM2 start failed!
    pause
    exit /b 1
)
echo ✓ Portfolio started with PM2!
echo.

echo [4/4] Checking status...
call pm2 status
echo.

echo ========================================
echo    Deployment Complete!
echo ========================================
echo.
echo Your portfolio is now running at:
echo   Local:  http://localhost:3000
echo   Public: http://YOUR_DOMAIN.com
echo.
echo Useful commands:
echo   pm2 status     - Check status
echo   pm2 logs       - View logs
echo   pm2 restart    - Restart app
echo   pm2 stop       - Stop app
echo.
pause
