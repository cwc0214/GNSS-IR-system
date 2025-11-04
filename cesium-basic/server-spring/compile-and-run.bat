@echo off
echo 启动Cesium认证服务 - 直接编译运行
echo ================================

REM 设置Java 8环境
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_201
set PATH=%JAVA_HOME%\bin;%PATH%

echo 检查Java环境...
java -version
echo.

REM 清理旧的编译文件
echo 清理旧的编译文件...
if exist target rmdir /s /q target
if exist .mvn rmdir /s /q .mvn

REM 创建目标目录
echo 创建目标目录...
mkdir target\classes 2>nul
mkdir target\lib 2>nul

REM 下载依赖（如果需要）
echo 下载Maven依赖...
where mvn >nul 2>&1
if %ERRORLEVEL% equ 0 (
    call mvn dependency:copy-dependencies -DoutputDirectory=target/lib -q
) else (
    echo Maven未找到，跳过依赖下载...
)

REM 编译Java源码
echo 编译Java源码...
javac -cp "target/lib/*" -d target/classes src/main/java/com/cesium/auth/*.java src/main/java/com/cesium/auth/controller/*.java src/main/java/com/cesium/auth/service/*.java src/main/java/com/cesium/auth/model/*.java src/main/java/com/cesium/auth/repository/*.java src/main/java/com/cesium/auth/exception/*.java src/main/java/com/cesium/auth/util/*.java src/main/java/com/cesium/auth/config/*.java src/main/java/com/cesium/auth/dto/*.java src/main/java/com/cesium/auth/security/*.java

if %ERRORLEVEL% neq 0 (
    echo 编译失败！
    pause
    exit /b 1
)

echo 编译成功！
echo.

REM 启动应用
echo 启动Spring Boot应用...
java -cp "target/classes;target/lib/*" com.cesium.auth.CesiumAuthApplication

pause
