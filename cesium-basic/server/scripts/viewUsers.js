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

// 查看所有用户
const viewUsers = async () => {
  try {
    console.log('\n📊 数据库中的注册用户信息:');
    console.log('=' .repeat(60));
    
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    if (users.length === 0) {
      console.log('📝 暂无注册用户');
      return;
    }

    console.log(`👥 总用户数: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`🔹 用户 ${index + 1}:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   用户名: ${user.username}`);
      console.log(`   邮箱: ${user.email || '未设置'}`);
      console.log(`   角色: ${user.role}`);
      console.log(`   状态: ${user.isActive ? '✅ 激活' : '❌ 禁用'}`);
      console.log(`   注册时间: ${user.createdAt.toLocaleString('zh-CN')}`);
      console.log(`   最后登录: ${user.lastLogin ? user.lastLogin.toLocaleString('zh-CN') : '从未登录'}`);
      console.log(`   更新时间: ${user.updatedAt.toLocaleString('zh-CN')}`);
      console.log('-'.repeat(40));
    });

  } catch (error) {
    console.error('❌ 查询用户失败:', error.message);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await viewUsers();
  await mongoose.connection.close();
  console.log('\n✅ 数据库连接已关闭');
};

// 运行脚本
main().catch(console.error);




