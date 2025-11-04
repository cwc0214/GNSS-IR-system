# Cesium 用户认证系统

这是一个完整的用户登录注册系统，包含前端Vue.js界面和后端Node.js服务。

## 🚀 快速开始

### 1. 启动后端服务

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 启动MongoDB（如果未运行）
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl start mongod

# 启动后端服务
npm start
# 或者使用开发模式（自动重启）
npm run dev
```

### 2. 启动前端服务

```bash
# 在项目根目录
npm install
npm run serve
```

### 3. 访问应用

- 前端地址: http://localhost:8080
- 后端API: http://localhost:3000
- 健康检查: http://localhost:3000/health

## 📋 功能特性

### 前端功能
- ✅ 用户登录/注册界面
- ✅ 表单验证和错误提示
- ✅ 登录状态持久化
- ✅ 用户信息显示
- ✅ 响应式设计
- ✅ 加载状态提示

### 后端功能
- ✅ RESTful API设计
- ✅ JWT身份认证
- ✅ 密码加密存储
- ✅ 输入验证和清理
- ✅ 错误处理机制
- ✅ MongoDB数据存储
- ✅ CORS跨域支持

## 🔧 技术栈

### 前端
- Vue 3 (Composition API)
- Element Plus UI组件库
- Vue Router 路由管理
- Axios HTTP客户端

### 后端
- Node.js + Express.js
- MongoDB + Mongoose
- JWT身份认证
- bcryptjs密码加密
- express-validator输入验证

## 📡 API接口

### 用户注册
```http
POST /api/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com" // 可选
}
```

### 用户登录
```http
POST /api/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

### 获取用户信息
```http
GET /api/me
Authorization: Bearer <token>
```

### 更新用户信息
```http
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 修改密码
```http
PUT /api/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

## 🗄️ 数据库模型

### User 用户模型
```javascript
{
  username: String,     // 用户名（唯一，3-20字符）
  password: String,     // 密码（加密存储，最少6字符）
  email: String,        // 邮箱（可选，唯一）
  avatar: String,       // 头像URL
  role: String,         // 角色：user/admin
  isActive: Boolean,    // 是否激活
  lastLogin: Date,      // 最后登录时间
  createdAt: Date,      // 创建时间
  updatedAt: Date       // 更新时间
}
```

## 🔒 安全特性

- 🔐 密码使用bcrypt加密存储
- 🎫 JWT token认证（7天有效期）
- ✅ 输入验证和SQL注入防护
- 🛡️ CORS跨域保护
- 📝 请求日志记录
- 🚫 防止暴力破解

## 🎨 界面预览

### 登录界面
- 用户名/密码输入框
- 登录按钮
- 切换到注册模式链接

### 注册界面
- 用户名/密码/邮箱输入框
- 注册按钮
- 切换到登录模式链接

### 用户信息界面
- 用户头像显示
- 用户名和邮箱
- 角色信息
- 最后登录时间
- 退出登录按钮

## 🛠️ 开发说明

### 项目结构
```
cesium-basic/
├── src/                    # 前端源码
│   ├── App.vue            # 主应用组件
│   ├── components/         # Vue组件
│   ├── views/             # 页面组件
│   └── router/             # 路由配置
├── server/                 # 后端源码
│   ├── config/            # 配置文件
│   ├── middleware/         # 中间件
│   ├── models/            # 数据模型
│   ├── routes/            # 路由处理
│   └── server.js          # 服务器入口
└── public/                 # 静态资源
```

### 环境变量配置
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

## 🐛 常见问题

### 1. MongoDB连接失败
```bash
# 检查MongoDB服务状态
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl status mongod
```

### 2. 端口冲突
- 后端默认端口: 3000
- 前端默认端口: 8080
- 可在配置文件中修改

### 3. CORS跨域问题
- 后端已配置CORS支持
- 允许的源: localhost:8080, localhost:3000

## 📝 更新日志

### v1.0.0 (2023-09-05)
- ✅ 完成用户注册功能
- ✅ 完成用户登录功能
- ✅ 完成JWT认证
- ✅ 完成前端界面
- ✅ 完成数据库设计

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📞 支持

如有问题，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至开发者
- 查看项目文档




