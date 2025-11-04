const axios = require('axios');

async function testZipDownload() {
  try {
    console.log('开始测试ZIP下载功能...');
    
    const response = await axios.post('http://localhost:3000/api/gnss/download-gzhc', {}, {
      responseType: 'stream',
      timeout: 60000 // 60秒超时
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers);
    
    // 保存ZIP文件到本地
    const fs = require('fs');
    const path = require('path');
    const zipPath = path.join(__dirname, 'test-download.zip');
    const writer = fs.createWriteStream(zipPath);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        const stats = fs.statSync(zipPath);
        console.log(`ZIP文件已保存: ${zipPath}`);
        console.log(`文件大小: ${stats.size} bytes`);
        
        if (stats.size === 0) {
          console.error('❌ ZIP文件是空的！');
        } else {
          console.log('✅ ZIP文件下载成功，包含内容');
        }
        
        resolve(zipPath);
      });
      
      writer.on('error', reject);
    });
    
  } catch (error) {
    console.error('测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testZipDownload().then(() => {
  console.log('测试完成');
  process.exit(0);
}).catch(error => {
  console.error('测试失败:', error);
  process.exit(1);
});
