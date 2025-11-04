@echo off
echo 启动Cesium认证服务 - Spring Boot版本
echo ================================

echo 检查Java环境...
java -version
if %errorlevel% neq 0 (
    echo 错误: 未找到Java环境，请确保已安装Java 17+
    pause
    exit /b 1
)

echo.
echo 检查Maven环境...
mvn -version
if %errorlevel% neq 0 (
    echo 错误: 未找到Maven环境，请确保已安装Maven 3.6+
    pause
    exit /b 1
)

echo.
echo 启动Spring Boot应用...
mvn spring-boot:run

pause
