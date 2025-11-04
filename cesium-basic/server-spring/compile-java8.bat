@echo off
echo 使用Java 8重新编译Spring Boot项目
echo ================================

REM 设置JAVA_HOME为Java 8
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_201
set PATH=%JAVA_HOME%\bin;%PATH%

echo 检查Java版本...
java -version

echo 清理并重新编译...
C:\apache-maven-3.9.6\bin\mvn.cmd clean compile

echo 编译完成！
pause
