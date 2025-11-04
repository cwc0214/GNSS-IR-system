@echo off
echo 启动Cesium认证服务 - 使用Java直接运行
echo ================================

echo 检查Java环境...
java -version
if %errorlevel% neq 0 (
    echo 错误: 未找到Java环境
    pause
    exit /b 1
)

echo.
echo 编译项目...
javac -cp "target\lib\*" -d target\classes src\main\java\com\cesium\auth\*.java src\main\java\com\cesium\auth\*\*.java

echo.
echo 启动Spring Boot应用...
java -cp "target\classes;target\lib\*" com.cesium.auth.CesiumAuthApplication

pause
