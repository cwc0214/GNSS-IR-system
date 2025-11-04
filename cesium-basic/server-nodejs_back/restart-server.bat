@echo off
echo 正在重启服务器...
echo.

echo 停止现有服务器进程...
taskkill /f /im node.exe 2>nul

echo.
echo 等待2秒...
timeout /t 2 /nobreak >nul

echo.
echo 启动服务器...
node server.js

pause
