@echo off
echo 启动Cesium认证服务 - Spring Boot版本
echo ================================

echo 检查Java环境...
java -version
if %errorlevel% neq 0 (
    echo 错误: 未找到Java环境
    pause
    exit /b 1
)

echo.
echo 设置JAVA_HOME...
set JAVA_HOME=C:\Program Files (x86)\Common Files\Oracle\Java\javapath

echo.
echo 启动Spring Boot应用...
cd /d "%~dp0"
java -cp "target\classes;target\lib\*" com.cesium.auth.CesiumAuthApplication

pause
