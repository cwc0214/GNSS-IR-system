const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cesium_auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    console.log('请确保MongoDB服务正在运行');
    console.log('下载MongoDB: https://www.mongodb.com/try/download/community');
    console.log('或者使用Docker: docker run -d -p 27017:27017 mongo');
    process.exit(1);
  }
};

module.exports = connectDB;
