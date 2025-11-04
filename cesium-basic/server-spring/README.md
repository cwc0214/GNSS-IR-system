# Cesium 用户认证后端服务 - Spring Boot版本

这是一个为Cesium Vue项目提供用户认证功能的Spring Boot后端服务。

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT token认证
- ✅ 密码加密存储
- ✅ 用户信息管理
- ✅ 输入验证
- ✅ 错误处理
- ✅ MongoDB数据库支持
- ✅ Spring Security安全框架
- ✅ 全局异常处理
- ✅ CORS跨域支持

## 技术栈

- **Spring Boot 3.2.0** - 主框架
- **Spring Security** - 安全框架
- **Spring Data MongoDB** - 数据访问
- **MongoDB** - 数据库
- **JWT (jjwt)** - 身份认证
- **BCrypt** - 密码加密
- **Lombok** - 代码简化
- **Maven** - 依赖管理

## 快速开始

### 1. 环境要求

- Java 17+
- Maven 3.6+
- MongoDB 4.0+

### 2. 安装依赖

```bash
cd server-spring
mvn clean install
```

### 3. 配置环境变量

修改 `src/main/resources/application.properties` 文件：

```properties
# 服务器配置
server.port=3000

# MongoDB配置
spring.data.mongodb.uri=mongodb://localhost:27017/cesium_auth

# JWT配置
jwt.secret=your_super_secret_jwt_key_here_change_in_production
jwt.expiration=604800000

# 密码加密配置
spring.security.bcrypt.rounds=12
```

### 4. 启动MongoDB

确保MongoDB服务正在运行：

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 5. 启动服务器

```bash
# 开发模式（自动重启）
mvn spring-boot:run

# 或者编译后运行
mvn clean package
java -jar target/cesium-auth-server-1.0.0.jar
```

## API接口文档

### 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token

### 接口列表

#### 1. 健康检查

```http
GET /api/health
```

**响应示例**:
```json
{
  "success": true,
  "message": "服务正常",
  "data": {
    "message": "Cesium认证服务运行正常",
    "timestamp": "2023-09-05T10:30:00",
    "version": "1.0.0"
  }
}
```

#### 2. 用户注册

```http
POST /api/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f8b1234567890abcdef123",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2023-09-05T10:30:00"
    }
  }
}
```

#### 3. 用户登录

```http
POST /api/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f8b1234567890abcdef123",
      "username": "testuser",
      "email": "test@example.com",
      "role": "user",
      "isActive": true,
      "lastLogin": "2023-09-05T10:30:00"
    }
  }
}
```

#### 4. 获取当前用户信息

```http
GET /api/me
Authorization: Bearer <token>
```

#### 5. 更新用户信息

```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### 6. 修改密码

```http
PUT /api/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### 7. 用户登出

```http
POST /api/logout
Authorization: Bearer <token>
```

## 数据模型

### User 用户模型

```java
{
  id: String,           // 用户ID（MongoDB ObjectId）
  username: String,     // 用户名（唯一）
  password: String,     // 密码（BCrypt加密存储）
  email: String,        // 邮箱（可选，唯一）
  avatar: String,       // 头像URL
  role: String,         // 角色：user/admin
  isActive: Boolean,    // 是否激活
  lastLogin: LocalDateTime, // 最后登录时间
  createdAt: LocalDateTime, // 创建时间
  updatedAt: LocalDateTime  // 更新时间
}
```

## 错误处理

所有API都返回统一的错误格式：

```json
{
  "success": false,
  "message": "错误描述",
  "errors": {} // 详细错误信息（可选）
}
```

### 常见错误码

- `400` - 请求参数错误
- `401` - 未授权（Token无效或过期）
- `403` - 访问被拒绝
- `500` - 服务器内部错误

## 安全特性

- 🔐 密码使用BCrypt加密存储
- 🎫 JWT token认证
- ✅ 输入验证和清理
- 🛡️ CORS跨域保护
- 📝 请求日志记录
- 🔒 Spring Security安全框架

## 开发说明

### 项目结构

```
server-spring/
├── src/main/java/com/cesium/auth/
│   ├── config/
│   │   └── SecurityConfig.java        # Spring Security配置
│   ├── controller/
│   │   └── AuthController.java        # 认证控制器
│   ├── dto/
│   │   ├── ApiResponse.java           # 统一响应格式
│   │   ├── LoginRequest.java          # 登录请求DTO
│   │   ├── RegisterRequest.java       # 注册请求DTO
│   │   ├── UpdateProfileRequest.java  # 更新用户信息DTO
│   │   └── ChangePasswordRequest.java # 修改密码DTO
│   ├── exception/
│   │   └── GlobalExceptionHandler.java # 全局异常处理
│   ├── model/
│   │   └── User.java                  # 用户实体类
│   ├── repository/
│   │   └── UserRepository.java        # 用户数据访问接口
│   ├── security/
│   │   └── JwtAuthenticationFilter.java # JWT认证过滤器
│   ├── service/
│   │   └── AuthService.java           # 认证服务
│   ├── util/
│   │   └── JwtUtil.java               # JWT工具类
│   └── CesiumAuthApplication.java     # 主启动类
├── src/main/resources/
│   └── application.properties         # 配置文件
└── pom.xml                           # Maven配置
```

### 环境要求

- Java 17+
- Maven 3.6+
- MongoDB 4.0+

## 部署说明

### 生产环境配置

1. 修改 `application.properties` 文件中的配置
2. 设置强密码的 `jwt.secret`
3. 配置生产环境的 `spring.data.mongodb.uri`
4. 设置 `spring.profiles.active=production`

### Docker部署（可选）

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/cesium-auth-server-1.0.0.jar app.jar
EXPOSE 3000
CMD ["java", "-jar", "app.jar"]
```

### 构建Docker镜像

```bash
mvn clean package
docker build -t cesium-auth-server .
docker run -p 3000:3000 cesium-auth-server
```

## 与Node.js版本的对比

| 特性 | Node.js版本 | Spring Boot版本 |
|------|-------------|-----------------|
| 框架 | Express.js | Spring Boot |
| 数据库 | Mongoose | Spring Data MongoDB |
| 认证 | 手动JWT处理 | Spring Security + JWT |
| 验证 | express-validator | Spring Validation |
| 密码加密 | bcryptjs | BCrypt |
| 异常处理 | 手动处理 | 全局异常处理器 |
| 配置管理 | dotenv | application.properties |
| 依赖管理 | npm | Maven |

## 许可证

MIT License
