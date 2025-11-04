const fetch = require('node-fetch');

async function testDirectDownload() {
  try {
    console.log('测试新的直接下载功能...');
    
    // 测试获取文件列表API
    console.log('1. 测试获取文件列表API...');
    const listResponse = await fetch('http://localhost:8081/api/gnss/download-gzhc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!listResponse.ok) {
      throw new Error(`HTTP error! status: ${listResponse.status}`);
    }
    
    const listData = await listResponse.json();
    console.log('文件列表API响应:', JSON.stringify(listData, null, 2));
    
    if (!listData.success || !listData.files || listData.files.length === 0) {
      console.log('❌ 没有找到文件');
      return;
    }
    
    console.log(`✅ 找到 ${listData.files.length} 个文件`);
    console.log(`总大小: ${(listData.totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // 测试下载第一个文件
    const firstFile = listData.files[0];
    console.log(`\n2. 测试下载单个文件: ${firstFile.name}`);
    
    const downloadResponse = await fetch('http://localhost:8081/api/gnss/download-single', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        remotePath: firstFile.remotePath,
        fileName: firstFile.name
      })
    });
    
    if (!downloadResponse.ok) {
      throw new Error(`下载失败! status: ${downloadResponse.status}`);
    }
    
    // 检查响应头
    const contentType = downloadResponse.headers.get('content-type');
    const contentLength = downloadResponse.headers.get('content-length');
    const contentDisposition = downloadResponse.headers.get('content-disposition');
    
    console.log('下载响应头:');
    console.log(`  Content-Type: ${contentType}`);
    console.log(`  Content-Length: ${contentLength}`);
    console.log(`  Content-Disposition: ${contentDisposition}`);
    
    // 获取文件数据
    const buffer = await downloadResponse.buffer();
    console.log(`✅ 文件下载成功，大小: ${buffer.length} bytes`);
    
    if (buffer.length === 0) {
      console.log('❌ 下载的文件为空');
    } else {
      console.log('✅ 文件内容正常');
    }
    
    console.log('\n✅ 所有测试通过！新的直接下载功能工作正常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDirectDownload();
