<template>
  <div class="home-page">
    <!-- 顶部横幅 -->
    <el-card class="banner-card" shadow="never">
      <img src="https://element-plus.org/images/element-plus-logo.svg" class="banner-img" alt="banner"/>
      <h1 class="banner-title">欢迎来到 GRseRG</h1>
      <p class="banner-subtitle">基于GNSS数据的智能可视化与算法平台</p>
    </el-card>

    <!-- 功能介绍区 -->
    <div class="features">
      <el-row :gutter="30">
        <!-- 网站介绍 -->
        <el-col :span="12">
          <el-card shadow="hover" class="feature-card">
            <h2>📡 网站介绍</h2>
            <p>
              GrseRG 旨在提供从潮汐仪（相对海平面）和现代大地测量技术（垂直位移和绝对海平面）获得的高质量计量海平面数据，
              可用于研究长期海平面趋势。
            </p>
          </el-card>
        </el-col>

        <!-- 团队介绍 -->
        <el-col :span="12">
          <el-card shadow="hover" class="feature-card">
            <h2>👥 团队介绍</h2>
            <p>
              我们是<strong>中国矿业大学（北京）杨飞团队</strong>，致力于地表形变监测、
              海平面变化研究与多源数据智能融合的前沿探索。
            </p>
          </el-card>
        </el-col>
      </el-row>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
</script>

<style scoped>
.home-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.banner-card {
  text-align: center;
  padding: 40px 20px;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #e0f7fa, #ffffff);
  border-radius: 16px;
}

.banner-img {
  width: 120px;
  margin-bottom: 15px;
}

.banner-title {
  font-size: 32px;
  font-weight: bold;
  margin: 10px 0;
  color: #333;
}

.banner-subtitle {
  font-size: 18px;
  color: #666;
}

.features {
  margin-top: 20px;
}

.feature-card {
  border-radius: 16px;
  min-height: 220px;
  padding: 20px;
  font-size: 16px;
  line-height: 1.6;
}
.feature-card h2 {
  margin-bottom: 15px;
  font-size: 22px;
  color: #409eff;
}
</style>
