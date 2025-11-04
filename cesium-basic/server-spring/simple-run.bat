@echo off
echo 启动Cesium认证服务 - 简化版本
echo ================================

REM 设置Java 8环境
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_201
set PATH=%JAVA_HOME%\bin;%PATH%

echo 检查Java环境...
java -version
echo.

REM 检查是否有已编译的jar文件
if exist target\cesium-auth-server-1.0.0.jar (
    echo 找到已编译的jar文件，直接运行...
    java -jar target\cesium-auth-server-1.0.0.jar
    goto :end
)

REM 如果没有jar文件，尝试使用Maven wrapper
if exist mvnw.cmd (
    echo 使用Maven wrapper编译和运行...
    call mvnw.cmd clean package -DskipTests
    if exist target\cesium-auth-server-1.0.0.jar (
        java -jar target\cesium-auth-server-1.0.0.jar
        goto :end
    )
)

REM 如果都没有，显示错误信息
echo 错误：无法找到可运行的文件！
echo 请确保：
echo 1. 项目已正确编译
echo 2. 生成了target\cesium-auth-server-1.0.0.jar文件
echo 3. 或者存在mvnw.cmd文件

:end
pause
