const axios = require('axios');

const BASE_URL = 'http://localhost:8081';

async function testGnssApi() {
  console.log('=== GNSS API 测试 ===');
  
  try {
    // 测试健康检查
    console.log('\n1. 测试健康检查...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ 健康检查成功:', healthResponse.data);
    
    // 测试获取GNSS文件列表
    console.log('\n2. 测试获取GNSS文件列表...');
    const filesResponse = await axios.get(`${BASE_URL}/api/gnss/files`);
    console.log('✅ 文件列表获取成功');
    console.log(`服务器: ${filesResponse.data.server}`);
    console.log(`路径: ${filesResponse.data.path}`);
    console.log(`文件总数: ${filesResponse.data.total}`);
    console.log('前5个文件:');
    filesResponse.data.files.slice(0, 5).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // 测试下载第一个文件
    if (filesResponse.data.files.length > 0) {
      const firstFile = filesResponse.data.files[0];
      console.log(`\n3. 测试下载文件: ${firstFile.name}...`);
      
      const downloadResponse = await axios.post(`${BASE_URL}/api/gnss/download`, {
        filename: firstFile.name
      });
      
      console.log('✅ 文件下载成功');
      console.log(`下载的文件: ${downloadResponse.data.file.filename}`);
      console.log(`文件大小: ${(downloadResponse.data.file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`下载URL: ${downloadResponse.data.downloadUrl}`);
    }
    
    // 测试获取已保存的文件列表
    console.log('\n4. 测试获取已保存的文件列表...');
    const savedFilesResponse = await axios.get(`${BASE_URL}/api/data/files`);
    console.log('✅ 已保存文件列表获取成功');
    console.log(`已保存文件数量: ${savedFilesResponse.data.files.length}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testGnssApi().catch(console.error);
