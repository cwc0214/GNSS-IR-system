<template>
  <div class="observation-page">
    <!-- 顶部横幅 -->
    <section class="hero">
      <h1 class="hero-title">GNSS-IR 海平面高度反演方法</h1>
      <p class="hero-subtitle">
        本节系统介绍多种基于 GNSS-IR 技术的海表高度反演方法，
        包括传统方法与融合方法，并分析其适用性与优势。
      </p>
    </section>

    <!-- 方法展示 -->
    <section class="methods">
      <div class="method" v-for="(item, index) in methods" :key="index">
        <div class="method-index">{{ index + 1 }}</div>
        <div class="method-content">
          <h2>{{ item.title }}</h2>
          <p>{{ item.desc }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const methods = [
  {
    title: "基于 SNR 的方法",
    desc: "通过分析接收机信噪比（SNR）的周期性振荡，提取干涉条纹频率，并反演反射面的几何高度。该方法实现简便、适应性强，是 GNSS-IR 最具代表性的反演手段。"
  },
  {
    title: "基于载波相位的方法",
    desc: "利用载波相位观测值计算反射路径延迟，理论精度高，但对观测环境和数据完整性要求严格，易受到多路径效应和相位模糊度影响。"
  },
  {
    title: "基于伪距的方法",
    desc: "通过伪距数据获取路径差。尽管噪声较大，精度有限，但其绝对值特性可在一定程度上弥补相位方法的不足，具有辅助意义。"
  },
  {
    title: "多频融合方法",
    desc: "结合 L1、L2、L5 等多频信号，利用频率差异对噪声和折射效应的不同敏感性，提升反演的稳定性与鲁棒性。"
  },
  {
    title: "贝叶斯融合方法",
    desc: "在贝叶斯框架下引入不确定度建模，将多种反演结果进行加权融合，有效降低系统误差，得到更稳定、可信的海平面估计。"
  }
]
</script>

<style scoped>
/* 页面整体 */
.observation-page {
  background: #f0f2f5;
  min-height: 100vh;
  padding: 50px 20px;
  font-family: "Helvetica Neue", Arial, sans-serif;
  color: #2c3e50;
}




/* 顶部横幅 */
.hero {
  text-align: center;
  margin-bottom: 60px;
  background: linear-gradient(135deg, #e3f2fd, #f5f7fa);
  padding: 40px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}
.hero-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #0d47a1;
}
.hero-subtitle {
  font-size: 16px;
  color: #444;
  max-width: 900px;
  margin: 0 auto;
  line-height: 1.8;
}

/* 方法展示 */
.methods {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  gap: 30px;
}
.method {
  display: flex;
  background: #ffffff;
  border-radius: 10px;
  padding: 25px 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  transition: transform 0.2s ease;
}
.method:hover {
  transform: translateY(-5px);
}
.method-index {
  font-size: 28px;
  font-weight: bold;
  color: #1565c0;
  margin-right: 20px;
  flex-shrink: 0;
}
.method-content h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}
.method-content p {
  font-size: 15px;
  color: #333;
  text-align: justify;
  line-height: 1.7;
}
</style>
