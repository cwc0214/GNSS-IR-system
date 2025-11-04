const mongoose = require('mongoose');
const User = require('../models/User');

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cesium_auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
};

// 创建管理员用户
const createAdmin = async () => {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('👤 管理员用户已存在:');
      console.log(`   用户名: ${existingAdmin.username}`);
      console.log(`   邮箱: ${existingAdmin.email || '未设置'}`);
      return;
    }

    // 创建管理员用户
    const admin = new User({
      username: 'admin',
      password: 'admin123',
      email: 'admin@cesium.com',
      role: 'admin'
    });

    await admin.save();
    console.log('✅ 管理员用户创建成功:');
    console.log(`   用户名: ${admin.username}`);
    console.log(`   密码: admin123`);
    console.log(`   邮箱: ${admin.email}`);
    console.log(`   角色: ${admin.role}`);

  } catch (error) {
    console.error('❌ 创建管理员失败:', error.message);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await createAdmin();
  await mongoose.connection.close();
  console.log('\n✅ 数据库连接已关闭');
};

// 运行脚本
main().catch(console.error);




