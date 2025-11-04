@echo off
echo 启动Cesium认证服务器...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到npm，请检查Node.js安装
    pause
    exit /b 1
)

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
    if %errorlevel% neq 0 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
)

REM 检查MongoDB是否运行
echo 检查MongoDB连接...
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/cesium_auth').then(() => { console.log('MongoDB连接成功'); process.exit(0); }).catch(() => { console.log('MongoDB连接失败，请确保MongoDB服务正在运行'); process.exit(1); });" 2>nul
if %errorlevel% neq 0 (
    echo.
    echo 警告: MongoDB连接失败
    echo 请确保MongoDB服务正在运行
    echo Windows: net start MongoDB
    echo.
)

echo.
echo 启动服务器...
echo 服务地址: http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo.

REM 启动服务器
npm start




