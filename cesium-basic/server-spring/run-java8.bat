@echo off
echo 启动Cesium认证服务 - Java 8版本
echo ================================

REM 设置Java 8环境
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_201
set PATH=%JAVA_HOME%\bin;%PATH%

echo 检查Java环境...
java -version
echo.

REM 清理并重新编译
echo 清理项目...
if exist target rmdir /s /q target

echo 使用Maven编译项目（Java 8）...
call mvn clean compile -Dmaven.compiler.source=1.8 -Dmaven.compiler.target=1.8 -Dmaven.compiler.release=8

if %ERRORLEVEL% neq 0 (
    echo Maven编译失败，尝试直接运行...
    goto :run_direct
)

echo 编译成功！启动应用...
call mvn spring-boot:run -Dmaven.compiler.source=1.8 -Dmaven.compiler.target=1.8
goto :end

:run_direct
echo 直接运行已编译的类...
java -cp "target/classes;target/lib/*" com.cesium.auth.CesiumAuthApplication

:end
pause
