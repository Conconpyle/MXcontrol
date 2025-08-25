@echo off
echo ========================================
echo    MX Control - Web Server Launcher
echo ========================================
echo.

REM Check for Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting server with Python...
    echo Server will run at: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    start http://localhost:8000
    python -m http.server 8000
    goto end
)

REM Check for Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting server with Node.js...
    echo Installing http-server if needed...
    call npx http-server -p 8000 -o
    goto end
)

REM Check for PHP
php --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting server with PHP...
    echo Server will run at: http://localhost:8000
    echo Press Ctrl+C to stop the server
    echo.
    start http://localhost:8000
    php -S localhost:8000
    goto end
)

REM If no server available, open file directly
echo No web server found (Python, Node.js, or PHP)
echo Opening index.html directly in browser...
echo.
echo Note: Some features may not work without a proper web server!
echo For full functionality, install Python from python.org
echo.
start index.html

:end
pause
