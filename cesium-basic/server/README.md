# Cesium 用户认证后端服务

这是一个为Cesium Vue项目提供用户认证功能的Node.js后端服务。

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT token认证
- ✅ 密码加密存储
- ✅ 用户信息管理
- ✅ 输入验证
- ✅ 错误处理
- ✅ MongoDB数据库支持

## 技术栈

- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **MongoDB** - 数据库
- **Mongoose** - ODM
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **express-validator** - 输入验证

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/cesium_auth

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# 密码加密配置
BCRYPT_ROUNDS=12
```

### 3. 启动MongoDB

确保MongoDB服务正在运行：

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## API接口文档

### 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token

### 接口列表

#### 1. 用户注册

```http
POST /api/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com" // 可选
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "注册成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8b1234567890abcdef123",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2023-09-05T10:30:00.000Z"
  }
}
```

#### 2. 用户登录

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8b1234567890abcdef123",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "isActive": true,
    "lastLogin": "2023-09-05T10:30:00.000Z"
  }
}
```

#### 3. 获取当前用户信息

```http
GET /api/me
Authorization: Bearer <token>
```

#### 4. 更新用户信息

```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### 5. 修改密码

```http
PUT /api/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### 6. 用户登出

```http
POST /api/logout
Authorization: Bearer <token>
```

## 数据模型

### User 用户模型

```javascript
{
  username: String,     // 用户名（唯一）
  password: String,     // 密码（加密存储）
  email: String,        // 邮箱（可选，唯一）
  avatar: String,       // 头像URL
  role: String,         // 角色：user/admin
  isActive: Boolean,    // 是否激活
  lastLogin: Date,      // 最后登录时间
  createdAt: Date,      // 创建时间
  updatedAt: Date       // 更新时间
}
```

## 错误处理

所有API都返回统一的错误格式：

```json
{
  "success": false,
  "message": "错误描述",
  "errors": [] // 详细错误信息（可选）
}
```

## 安全特性

- 🔐 密码使用bcrypt加密存储
- 🎫 JWT token认证
- ✅ 输入验证和清理
- 🛡️ CORS跨域保护
- 📝 请求日志记录

## 开发说明

### 项目结构

```
server/
├── config/
│   └── database.js      # 数据库配置
├── middleware/
│   └── auth.js          # 认证中间件
├── models/
│   └── User.js          # 用户模型
├── routes/
│   └── auth.js          # 认证路由
├── server.js            # 服务器入口
├── package.json         # 依赖配置
└── README.md           # 说明文档
```

### 环境要求

- Node.js >= 14.0.0
- MongoDB >= 4.0.0
- npm >= 6.0.0

## 部署说明

### 生产环境配置

1. 修改 `.env` 文件中的配置
2. 设置强密码的 `JWT_SECRET`
3. 配置生产环境的 `MONGODB_URI`
4. 设置 `NODE_ENV=production`

### Docker部署（可选）

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 许可证

MIT License




