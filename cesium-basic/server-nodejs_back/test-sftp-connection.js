const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');

// 服务器配置
const serverConfig = {
  host: '8.140.235.117',
  port: 22,
  username: 'root',
  password: 'Hao20030801@'
};

// 目标文件夹路径
const targetFolder = '/pub/data/GNSS/862419070920375';

async function testSftpConnection() {
  const sftp = new SftpClient();
  
  try {
    console.log('正在连接到服务器...');
    console.log(`服务器: ${serverConfig.host}:${serverConfig.port}`);
    console.log(`用户名: ${serverConfig.username}`);
    
    // 连接到服务器
    await sftp.connect(serverConfig);
    console.log('✅ 服务器连接成功！');
    
    // 检查目标文件夹是否存在
    console.log(`\n正在检查文件夹: ${targetFolder}`);
    try {
      const stats = await sftp.stat(targetFolder);
      console.log('✅ 文件夹存在！');
      console.log(`文件夹信息:`, {
        isDirectory: stats.isDirectory,
        size: stats.size,
        modifyTime: stats.modifyTime,
        accessTime: stats.accessTime
      });
      
      // 列出文件夹内容
      console.log('\n正在列出文件夹内容...');
      const files = await sftp.list(targetFolder);
      console.log(`✅ 文件夹包含 ${files.length} 个项目:`);
      
      files.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name} (${file.type === 'd' ? '目录' : '文件'}) - 大小: ${file.size} bytes - 修改时间: ${file.modifyTime}`);
      });
      
      // 如果有文件，尝试下载第一个文件作为测试
      const firstFile = files.find(file => file.type === '-');
      if (firstFile) {
        console.log(`\n正在测试下载文件: ${firstFile.name}`);
        const localPath = path.join(__dirname, 'test-download', firstFile.name);
        
        // 确保下载目录存在
        const downloadDir = path.dirname(localPath);
        if (!fs.existsSync(downloadDir)) {
          fs.mkdirSync(downloadDir, { recursive: true });
        }
        
        await sftp.fastGet(
          path.posix.join(targetFolder, firstFile.name),
          localPath
        );
        console.log(`✅ 文件下载成功: ${localPath}`);
      }
      
    } catch (error) {
      if (error.code === 2) {
        console.log('❌ 文件夹不存在');
      } else {
        console.log('❌ 检查文件夹时出错:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 连接失败:', error.message);
    console.error('详细错误信息:', error);
  } finally {
    try {
      await sftp.end();
      console.log('\n连接已关闭');
    } catch (err) {
      console.log('关闭连接时出错:', err.message);
    }
  }
}

// 运行测试
console.log('=== SFTP 连接测试 ===');
testSftpConnection().catch(console.error);
