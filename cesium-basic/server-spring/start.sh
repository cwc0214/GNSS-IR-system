#!/bin/bash

echo "启动Cesium认证服务 - Spring Boot版本"
echo "================================"

echo "检查Java环境..."
if ! command -v java &> /dev/null; then
    echo "错误: 未找到Java环境，请确保已安装Java 17+"
    exit 1
fi

java -version

echo ""
echo "检查Maven环境..."
if ! command -v mvn &> /dev/null; then
    echo "错误: 未找到Maven环境，请确保已安装Maven 3.6+"
    exit 1
fi

mvn -version

echo ""
echo "启动Spring Boot应用..."
mvn spring-boot:run
