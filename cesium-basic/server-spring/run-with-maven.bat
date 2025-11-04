@echo off
echo 启动Cesium认证服务 - Spring Boot版本
echo ================================

echo 设置环境变量...
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_201
set PATH=%JAVA_HOME%\bin;%PATH%

echo.
echo 检查Java环境...
java -version
if %errorlevel% neq 0 (
    echo 错误: 未找到Java环境
    pause
    exit /b 1
)

echo.
echo 使用Maven启动Spring Boot应用...
cd /d "%~dp0"
C:\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run

pause
