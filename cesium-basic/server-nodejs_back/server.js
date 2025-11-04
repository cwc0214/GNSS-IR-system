const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const SftpClient = require('ssh2-sftp-client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 文件上传目录
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// multer 文件存储配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${timestamp}_${safeOriginal}`);
  }
});
const upload = multer({ storage });

// 用户模型
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// 数据文件模型（保存到数据库）
const dataFileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String },
  mimeType: { type: String },
  size: { type: Number },
  storagePath: { type: String, required: true },
  source: { type: String, enum: ['upload', 'sftp'], required: true },
  status: { type: String, enum: ['stored', 'processed', 'failed'], default: 'stored' },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now }
});
const DataFile = mongoose.model('DataFile', dataFileSchema);

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cesium-auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB连接成功');
}).catch(err => {
  console.log('MongoDB连接失败:', err);
});

// 通过表单上传文件 -> 保存磁盘并入库
app.post('/api/data/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '未收到文件，表单字段名应为 file' });
    }

    const record = await DataFile.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storagePath: path.join('uploads', req.file.filename),
      source: 'upload',
      status: 'stored'
    });

    res.json({ success: true, message: '文件上传成功', file: record });
  } catch (error) {
    console.error('上传保存失败:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// GNSS数据服务器配置
const GNSS_SERVER_CONFIG = {
  host: '8.140.235.117',
  port: 22,
  username: 'root',
  password: 'Hao20030801@',
  basePath: '/pub/data/GNSS/CWC_GNSS_OBS_test'
};

// 获取GNSS服务器文件列表
app.get('/api/gnss/files', async (req, res) => {
  const sftp = new SftpClient();
  try {
    await sftp.connect(GNSS_SERVER_CONFIG);
    const files = await sftp.list(GNSS_SERVER_CONFIG.basePath);
    await sftp.end();
    
    // 格式化文件信息
    const formattedFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type === 'd' ? 'directory' : 'file',
      modifyTime: file.modifyTime,
      accessTime: file.accessTime,
      isDirectory: file.type === 'd'
    }));
    
    res.json({ 
      success: true, 
      files: formattedFiles,
      total: formattedFiles.length,
      server: GNSS_SERVER_CONFIG.host,
      path: GNSS_SERVER_CONFIG.basePath
    });
  } catch (error) {
    console.error('获取GNSS文件列表失败:', error);
    try { await sftp.end(); } catch (_) {}
    res.status(500).json({ success: false, message: '获取文件列表失败: ' + error.message });
  }
});

// 从GNSS服务器下载指定文件
app.post('/api/gnss/download', async (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ success: false, message: '缺少文件名参数' });
  }

  const sftp = new SftpClient();
  try {
    await sftp.connect(GNSS_SERVER_CONFIG);
    
    const remotePath = path.posix.join(GNSS_SERVER_CONFIG.basePath, filename);
    const localName = `gnss_${Date.now()}_${filename}`;
    const localFullPath = path.join(uploadsDir, localName);
    
    await sftp.fastGet(remotePath, localFullPath);
    await sftp.end();

    const stats = fs.statSync(localFullPath);
    const record = await DataFile.create({
      filename: localName,
      originalName: filename,
      mimeType: 'application/octet-stream',
      size: stats.size,
      storagePath: path.join('uploads', localName),
      source: 'sftp',
      status: 'stored',
      metadata: {
        gnssServer: GNSS_SERVER_CONFIG.host,
        remotePath: remotePath
      }
    });

    res.json({ 
      success: true, 
      message: 'GNSS文件下载成功', 
      file: record,
      downloadUrl: `/uploads/${localName}`
    });
  } catch (error) {
    console.error('GNSS文件下载失败:', error);
    try { await sftp.end(); } catch (_) {}
    res.status(500).json({ success: false, message: '文件下载失败: ' + error.message });
  }
});

// GZHC测站批量下载API - 获取文件列表供前端下载
app.post('/api/gnss/download-gzhc', async (req, res) => {
  const sftp = new SftpClient();
  
  try {
    console.log('开始获取GZHC测站文件列表...');
    
    // 连接SFTP服务器
    await sftp.connect(GNSS_SERVER_CONFIG);
    console.log('SFTP连接成功');
    
    // 获取文件列表
    const files = await sftp.list(GNSS_SERVER_CONFIG.basePath);
    console.log(`找到 ${files.length} 个文件`);
    
    // 过滤.rnx文件
    const rnxFiles = files.filter(file => 
      file.name.endsWith('.rnx') && 
      file.type !== 'd'
    );
    
    console.log(`找到 ${rnxFiles.length} 个.rnx文件`);
    
    if (rnxFiles.length === 0) {
      await sftp.end();
      return res.json({ 
        success: false, 
        message: '没有找到.rnx文件' 
      });
    }
    
    // 限制文件数量为2个
    const limitedRnxFiles = rnxFiles.slice(0, 2);
    
    console.log(`找到 ${rnxFiles.length} 个.rnx文件，限制前 ${limitedRnxFiles.length} 个文件...`);
    
    // 返回文件列表信息
    const fileList = limitedRnxFiles.map(file => ({
      name: file.name,
      size: file.size,
      modifyTime: file.modifyTime,
      remotePath: path.posix.join(GNSS_SERVER_CONFIG.basePath, file.name)
    }));
    
    await sftp.end();
    
    res.json({
      success: true,
      message: `找到 ${fileList.length} 个.rnx文件`,
      files: fileList,
      totalSize: fileList.reduce((sum, file) => sum + file.size, 0)
    });
    
    console.log(`GZHC测站文件列表获取完成，共 ${fileList.length} 个文件`);
    
  } catch (error) {
    console.error('获取GZHC测站文件列表失败:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: '获取文件列表失败: ' + error.message 
      });
    }
  } finally {
    try { await sftp.end(); } catch (_) {}
  }
});

// 下载单个文件API
app.post('/api/gnss/download-single', async (req, res) => {
  const { remotePath, fileName } = req.body;
  const sftp = new SftpClient();
  
  if (!remotePath || !fileName) {
    return res.status(400).json({ 
      success: false, 
      message: '缺少必要参数' 
    });
  }
  
  try {
    console.log(`开始下载文件: ${fileName}`);
    
    // 连接SFTP服务器
    await sftp.connect(GNSS_SERVER_CONFIG);
    console.log('SFTP连接成功');
    
    // 创建临时文件路径
    const tempFilePath = path.join(uploadsDir, `temp_${Date.now()}_${fileName}`);
    
    // 下载文件
    await new Promise((resolve, reject) => {
      sftp.fastGet(remotePath, tempFilePath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    // 检查文件大小
    const stats = await fs.promises.stat(tempFilePath);
    if (stats.size === 0) {
      fs.unlinkSync(tempFilePath);
      await sftp.end();
      return res.status(404).json({ 
        success: false, 
        message: '文件为空' 
      });
    }
    
    await sftp.end();
    
    // 设置响应头
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', stats.size);
    
    // 发送文件
    res.sendFile(tempFilePath, (err) => {
      if (err) {
        console.error('发送文件失败:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: '发送文件失败' });
        }
      } else {
        console.log(`文件发送成功: ${fileName} (${stats.size} bytes)`);
        // 发送成功后删除临时文件
        fs.unlink(tempFilePath, (unlinkErr) => {
          if (unlinkErr) console.error('删除临时文件失败:', unlinkErr);
        });
      }
    });
    
  } catch (error) {
    console.error('文件下载失败:', error);
    try { await sftp.end(); } catch (_) {}
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: '文件下载失败: ' + error.message 
      });
    }
  }
});

// 从 SFTP 拉取文件 -> 保存磁盘并入库
// 请求体示例：{ host, port, username, password, remotePath, saveAs } 或使用 privateKey/base64
app.post('/api/data/sftp/import', async (req, res) => {
  const { host, port = 22, username, password, privateKey, remotePath, saveAs } = req.body || {};
  if (!host || !username || (!password && !privateKey) || !remotePath) {
    return res.status(400).json({ success: false, message: '缺少必需参数 host/username/password|privateKey/remotePath' });
  }

  const sftp = new SftpClient();
  try {
    const connectConfig = { host, port, username };
    if (password) connectConfig.password = password;
    if (privateKey) connectConfig.privateKey = privateKey;

    await sftp.connect(connectConfig);
    const localName = saveAs || `${Date.now()}_${path.basename(remotePath).replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
    const localFullPath = path.join(uploadsDir, localName);
    await sftp.fastGet(remotePath, localFullPath);
    await sftp.end();

    const stats = fs.statSync(localFullPath);
    const record = await DataFile.create({
      filename: localName,
      originalName: path.basename(remotePath),
      mimeType: 'application/octet-stream',
      size: stats.size,
      storagePath: path.join('uploads', localName),
      source: 'sftp',
      status: 'stored'
    });

    res.json({ success: true, message: 'SFTP导入成功', file: record });
  } catch (error) {
    console.error('SFTP导入失败:', error);
    try { await sftp.end(); } catch (_) {}
    res.status(500).json({ success: false, message: 'SFTP导入失败' });
  }
});

// 列出已保存的文件
app.get('/api/data/files', async (req, res) => {
  try {
    const items = await DataFile.find().sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, files: items });
  } catch (error) {
    res.status(500).json({ success: false, message: '获取文件列表失败' });
  }
});

// 注册接口
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名或邮箱已存在' 
      });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    res.json({ 
      success: true, 
      message: '注册成功',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '邮箱或密码错误' 
      });
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: '邮箱或密码错误' 
      });
    }
    
    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 验证token接口
app.get('/api/auth/validate', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '未提供token' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      message: 'Token有效',
      user: {
        id: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token无效或已过期' 
    });
  }
});

// 获取用户信息接口
app.get('/api/auth/profile', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '未提供token' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token无效或已过期' 
    });
  }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Cesium认证服务运行正常',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Cesium认证服务已启动`);
  console.log(`服务地址: http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
  console.log(`注册接口: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`登录接口: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`验证接口: GET http://localhost:${PORT}/api/auth/validate`);
  console.log(`上传文件: POST http://localhost:${PORT}/api/data/upload (form-data: file)`);
  console.log(`SFTP导入: POST http://localhost:${PORT}/api/data/sftp/import`);
  console.log(`文件列表: GET  http://localhost:${PORT}/api/data/files`);
  console.log(`GNSS文件列表: GET http://localhost:${PORT}/api/gnss/files`);
  console.log(`GNSS文件下载: POST http://localhost:${PORT}/api/gnss/download`);
  console.log(`GNSS服务器: ${GNSS_SERVER_CONFIG.host}:${GNSS_SERVER_CONFIG.port}`);
  console.log(`GNSS路径: ${GNSS_SERVER_CONFIG.basePath}`);
});
