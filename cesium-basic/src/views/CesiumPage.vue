<template>
  <div class="cesium-page">
    <!-- 上半部分：地图 -->
    <div id="cesiumContainer" ref="cesiumContainer"></div>

    <!-- 下半部分：操作区 + 图表 -->
    <div class="data-panel">
      <el-form :inline="true" label-width="80px" class="form-area">
        <el-form-item label="测站">
          <el-select v-model="selectedStation" placeholder="请选择测站" style="width: 160px">
            <el-option
              v-for="s in stations"
              :key="s.name"
              :label="s.name + ' - ' + s.location"
              :value="s.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="时间段">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="fetchData">获取数据</el-button>
          <el-button 
            type="success" 
            @click="downloadData"
            :loading="isDownloading"
            :disabled="isDownloading"
          >
            {{ isDownloading ? '下载中...' : '下载数据' }}
          </el-button>
          <el-button 
            v-if="isDownloading"
            type="danger" 
            @click="cancelDownload"
            :disabled="!isDownloading"
          >
            取消下载
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 图表展示区 -->
      <div ref="chartRef" class="chart-container"></div>
    </div>

    <!-- 测站弹窗 -->
    <div 
      v-if="showPopup" 
      class="popup"
      :style="{ top: popupPosition.y + 'px', left: popupPosition.x + 'px' }"
    >
      <h3>{{ popupInfo.name }}</h3>
      <p>位置：{{ popupInfo.location }}</p>
      <p>纬度：{{ popupInfo.lat }}</p>
      <p>经度：{{ popupInfo.lon }}</p>
      <el-button type="primary" size="small" @click="showPopup = false">关闭</el-button>
    </div>
  </div>
</template>

<script setup>
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { onMounted, ref } from 'vue'
import { ElButton, ElForm, ElFormItem, ElSelect, ElOption, ElDatePicker, ElMessage } from 'element-plus'
import * as echarts from "echarts"

window.CESIUM_BASE_URL = "/"
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZjk2ZDBhNi01YmU2LTRmNDUtYTliZC05OTFiZjM2YmUwNjkiLCJpZCI6MzQyODE1LCJpYXQiOjE3NTgyNzU1MDZ9.blI_D41lWDcCm5c3NkusNY4jRrABOfPbIEhj_1-1wq8"

// 状态变量
const showPopup = ref(false)
const popupPosition = ref({ x: 0, y: 0 })
const popupInfo = ref({ name: '', location: '', lat: '', lon: '' })

// 测站选择 & 时间段
const stations = [
  { name: "GZHC", location: "中国广州", lon: 113.5722, lat: 22.9040, color: Cesium.Color.BLUE },
  { name: "GR01", location: "中国北京", lon: 116.344, lat: 39.996, color: Cesium.Color.RED }
]
const selectedStation = ref(null)
const dateRange = ref([])
const chartRef = ref(null)
const isDownloading = ref(false)
let chartInstance = null
let abortController = null

// 模拟数据获取
function fetchData() {
  if (!selectedStation.value || dateRange.value.length !== 2) {
    alert("请选择测站和时间段")
    return
  }
  const dates = Array.from({ length: 10 }, (_, i) => `Day ${i + 1}`)
  const values = dates.map(() => (Math.random() * 0.5 + 0.8).toFixed(2))

  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(chartRef.value)
  }

  chartInstance.setOption({
    title: { text: `海平面高度时间序列 - ${selectedStation.value}`, left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: dates },
    yAxis: { type: "value", name: "高度(m)" },
    series: [{ data: values, type: "line", smooth: true, areaStyle: {} }]
  })
}

// 检查登录状态
function checkLoginStatus() {
  const token = localStorage.getItem('token')
  return !!token
}

// 取消下载
function cancelDownload() {
  if (abortController) {
    abortController.abort()
    ElMessage({
      type: 'info',
      message: '下载已取消',
      duration: 2000,
      showClose: true
    })
  }
}

// GZHC测站数据下载
async function downloadData() {
  // 检查登录状态
  if (!checkLoginStatus()) {
    ElMessage({
      type: 'warning',
      message: '请先登录后再下载数据',
      duration: 3000,
      showClose: true
    })
    return
  }

  // 检查是否选择了GZHC测站
  if (selectedStation.value !== 'GZHC') {
    ElMessage({
      type: 'warning',
      message: '请选择GZHC测站进行下载',
      duration: 3000,
      showClose: true
    })
    return
  }

  // 设置下载状态
  isDownloading.value = true
  
  // 创建AbortController用于取消下载
  abortController = new AbortController()

  try {
    // 显示下载开始提示
    ElMessage({
      type: 'info',
      message: '正在获取GZHC测站文件列表，请稍候...',
      duration: 2000
    })

    const token = localStorage.getItem('token')
    
    // 调用后端API获取文件列表
    const response = await fetch('http://localhost:8081/api/gnss/download-gzhc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal: abortController.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || '获取文件列表失败')
    }

    if (!data.files || data.files.length === 0) {
      ElMessage({
        type: 'warning',
        message: '没有找到可下载的文件',
        duration: 3000,
        showClose: true
      })
      return
    }

    // 显示文件信息
    ElMessage({
      type: 'info',
      message: `找到 ${data.files.length} 个文件，总大小: ${(data.totalSize / 1024 / 1024).toFixed(2)} MB`,
      duration: 3000,
      showClose: true
    })

    // 提示用户文件将下载到默认下载文件夹
    ElMessage({
      type: 'info',
      message: '文件将下载到您的默认下载文件夹',
      duration: 2000
    })

    // 逐个下载文件
    for (let i = 0; i < data.files.length; i++) {
      const file = data.files[i]
      
      ElMessage({
        type: 'info',
        message: `正在下载文件 ${i + 1}/${data.files.length}: ${file.name}`,
        duration: 2000
      })

      try {
        // 下载单个文件
        const downloadResponse = await fetch('http://localhost:8081/api/gnss/download-single', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            remotePath: file.remotePath,
            fileName: file.name
          }),
          signal: abortController.signal
        })

        if (!downloadResponse.ok) {
          throw new Error(`下载文件失败: ${file.name}`)
        }

        // 获取文件blob
        const blob = await downloadResponse.blob()
        
        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        
        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理URL对象
        window.URL.revokeObjectURL(url)
        
        console.log(`文件下载成功: ${file.name}`)
        
      } catch (fileError) {
        console.error(`下载文件失败: ${file.name}`, fileError)
        ElMessage({
          type: 'error',
          message: `下载文件失败: ${file.name}`,
          duration: 3000,
          showClose: true
        })
      }
    }
    
    // 下载完成提示
    ElMessage({
      type: 'success',
      message: `GZHC测站数据下载完成！共下载 ${data.files.length} 个文件`,
      duration: 3000,
      showClose: true
    })

  } catch (error) {
    // 检查是否是用户主动取消
    if (error.name === 'AbortError') {
      console.log('下载已被用户取消')
      return
    }
    
    console.error('下载失败:', error)
    ElMessage({
      type: 'error',
      message: `下载失败: ${error.message}`,
      duration: 3000,
      showClose: true
    })
  } finally {
    // 重置下载状态
    isDownloading.value = false
    abortController = null
  }
}


// Cesium 初始化
onMounted(() => {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    infoBox: false,
    sceneMode: Cesium.SceneMode.SCENE2D,
    sceneModePicker: false,
  })
  viewer.cesiumWidget.creditContainer.style.display = "none"

  // 相机视角
  viewer.camera.setView({
    destination: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    }
  })

  // 添加测站点
  stations.forEach(station => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(station.lon, station.lat, 100),
      point: { pixelSize: 10, color: station.color, outlineColor: Cesium.Color.WHEAT, outlineWidth: 3 },
      properties: station
    })
  })

  // 点击事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
  handler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.position)
    if (Cesium.defined(pickedObject) && pickedObject.id?.properties) {
      const props = pickedObject.id.properties
      popupInfo.value = {
        name: props.name,
        location: props.location,
        lat: props.lat,
        lon: props.lon
      }
      popupPosition.value = { x: movement.position.x, y: movement.position.y }
      showPopup.value = true
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
})
</script>

<style>
.cesium-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
#cesiumContainer {
  width: 100%;
  height: 50vh; /* 上半部分地图 */
}
.data-panel {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
  overflow-y: auto;
}
.form-area {
  margin-bottom: 20px;
}
.chart-container {
  width: 100%;
  height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.popup {
  position: absolute;
  background: white;
  padding: 10px;
  border: 1px solid #666;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  z-index: 1000;
}
</style>
