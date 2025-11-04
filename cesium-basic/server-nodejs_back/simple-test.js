const axios = require('axios');

async function simpleTest() {
  try {
    console.log('测试健康检查...');
    const response = await axios.get('http://localhost:8081/api/health');
    console.log('✅ 健康检查成功:', response.data.message);
    
    console.log('\n测试GNSS文件列表API...');
    const gnssResponse = await axios.get('http://localhost:8081/api/gnss/files', {
      timeout: 30000 // 30秒超时
    });
    console.log('✅ GNSS文件列表获取成功');
    console.log('文件数量:', gnssResponse.data.total);
    console.log('服务器:', gnssResponse.data.server);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应:', error.response.data);
    }
  }
}

simpleTest();
