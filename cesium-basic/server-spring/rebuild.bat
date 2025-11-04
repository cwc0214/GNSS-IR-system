@echo off
echo 重新编译Spring Boot项目...
echo ================================

REM 设置JAVA_HOME
set JAVA_HOME=C:\Program Files\Java\jdk1.8.0_201
set PATH=%JAVA_HOME%\bin;%PATH%

REM 设置Maven路径
set MAVEN_HOME=C:\apache-maven-3.9.6
set PATH=%MAVEN_HOME%\bin;%PATH%

echo 检查Java版本...
java -version

echo 检查Maven版本...
mvn -version

echo 清理并重新编译...
mvn clean compile

echo 编译完成！
pause
