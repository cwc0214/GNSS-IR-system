<template>
  <div class="page-layout">
    <!-- 左侧菜单 -->
    <aside class="sidebar left">
      <el-menu
        router
        default-active="/"
        class="el-menu-vertical"
        background-color="#f5f7fa"
        text-color="#333"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">首页的介绍</el-menu-item>
        <el-menu-item index="/observation">算法的介绍</el-menu-item>
        <el-menu-item index="/cesium">获取数据</el-menu-item>
      </el-menu>

      <!-- 用户认证模块 -->
      <div class="auth-box" v-if="!isLoggedIn">
        <h3 class="auth-title">{{ isLogin ? '用户登录' : '注册账号' }}</h3>

        <el-input
          v-model="form.username"
          :placeholder="isLogin ? '请输入邮箱' : '请输入用户名'"
          size="large"
          clearable
          class="auth-input"
          :disabled="isLoading"
        />
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          size="large"
          show-password
          clearable
          class="auth-input"
          :disabled="isLoading"
        />
        
        <!-- 注册时显示邮箱输入框 -->
        <el-input
          v-if="!isLogin"
          v-model="form.email"
          placeholder="请输入邮箱"
          size="large"
          clearable
          class="auth-input"
          :disabled="isLoading"
        />
        
        <el-button
          type="primary"
          size="large"
          style="width: 100%; margin-top: 10px; font-size: 16px;"
          @click="handleAuth"
          :loading="isLoading"
          :disabled="isLoading"
        >
          {{ isLogin ? '登 录' : '注 册' }}
        </el-button>
        

        <p class="switch">
          <a href="javascript:void(0)" @click="isLogin = !isLogin" :disabled="isLoading">
            {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
          </a>
        </p>
      </div>

      <!-- 用户信息模块 -->
      <div class="user-info-box" v-else>
        <div class="user-avatar">
          <el-avatar :size="60" :src="currentUser?.avatar">
            {{ currentUser?.username?.charAt(0)?.toUpperCase() }}
          </el-avatar>
        </div>
        <div class="user-details">
          <h3 class="user-name">{{ currentUser?.username }}</h3>
          <p class="user-email" v-if="currentUser?.email">{{ currentUser.email }}</p>
          <p class="user-role">角色: {{ currentUser?.role === 'admin' ? '管理员' : '普通用户' }}</p>
          <p class="user-time" v-if="currentUser?.lastLogin">
            最后登录: {{ formatDate(currentUser.lastLogin) }}
          </p>
        </div>
        <el-button 
          type="danger" 
          size="small" 
          @click="handleLogout"
          style="width: 100%; margin-top: 10px;"
        >
          退出登录
        </el-button>
      </div>
    </aside>

    <!-- 中间内容 -->
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMenu, ElMenuItem, ElInput, ElButton, ElAvatar } from 'element-plus'

// 响应式数据
const isLogin = ref(true)
const isLoading = ref(false)
const isLoggedIn = ref(false)
const currentUser = ref(null)

const form = reactive({ 
  username: '', 
  password: '',
  email: '' // 注册时使用
})

// 检查登录状态
const checkAuthStatus = () => {
  const token = localStorage.getItem('token')
  if (token) {
    // 验证token有效性
    fetchUserInfo()
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const res = await fetch('http://localhost:8081/api/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (res.ok) {
      const data = await res.json()
      if (data.success) {
        isLoggedIn.value = true
        currentUser.value = data.user
      } else {
        // token无效，清除本地存储
        localStorage.removeItem('token')
        isLoggedIn.value = false
        currentUser.value = null
      }
    } else {
      localStorage.removeItem('token')
      isLoggedIn.value = false
      currentUser.value = null
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    localStorage.removeItem('token')
    isLoggedIn.value = false
    currentUser.value = null
  }
}

// 处理登录/注册
const handleAuth = async () => {
  if (!form.username || !form.password) {
    ElMessage({
      type: 'warning',
      message: '请输入用户名和密码',
      duration: 2000
    })
    return
  }

  // 登录时验证邮箱格式，注册时验证用户名格式
  if (isLogin.value) {
    // 登录时验证邮箱格式
    if (!isValidEmail(form.username)) {
      ElMessage({
        type: 'warning',
        message: '请输入有效的邮箱地址',
        duration: 2000
      })
      return
    }
  } else {
    // 注册时验证用户名格式
    if (form.username.length < 3 || form.username.length > 20) {
      ElMessage({
        type: 'warning',
        message: '用户名长度必须在3-20个字符之间',
        duration: 2000
      })
      return
    }

    // 验证用户名只能包含字母、数字和下划线
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      ElMessage({
        type: 'warning',
        message: '用户名只能包含字母、数字和下划线',
        duration: 2000
      })
      return
    }
  }

  // 验证密码长度
  if (form.password.length < 6) {
    ElMessage({
      type: 'warning',
      message: '密码至少6个字符',
      duration: 2000
    })
    return
  }

  // 注册时检查邮箱
  if (!isLogin.value && form.email && !isValidEmail(form.email)) {
    ElMessage({
      type: 'warning',
      message: '请输入有效的邮箱地址',
      duration: 2000
    })
    return
  }

  isLoading.value = true

  try {
    const url = isLogin.value
      ? 'http://localhost:8081/api/auth/login'
      : 'http://localhost:8081/api/auth/register'

    const requestData = isLogin.value 
      ? { email: form.username, password: form.password }
      : { username: form.username, password: form.password, email: form.email }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    })

    const data = await res.json()

    if (data.success) {
      // 显示成功消息
      ElMessage({
        type: 'success',
        message: data.message || (isLogin.value ? '登录成功' : '注册成功'),
        duration: 3000,
        showClose: true
      })
      
      if (isLogin.value) {
        // 登录成功
        localStorage.setItem('token', data.token)
        isLoggedIn.value = true
        currentUser.value = data.user
        // 清空表单
        resetForm()
      } else {
        // 注册成功，切换到登录模式
        isLogin.value = true
        resetForm()
        // 额外提示
        setTimeout(() => {
          ElMessage({
            type: 'info',
            message: '注册成功，请登录',
            duration: 2000
          })
        }, 1000)
      }
    } else {
      // 显示详细的错误信息
      let errorMessage = data.message || '操作失败'
      
      // 如果有验证错误，显示具体的错误信息
      if (data.errors && data.errors.length > 0) {
        errorMessage = data.errors.map(err => err.msg || err.message).join(', ')
      }
      
      ElMessage({
        type: 'error',
        message: errorMessage,
        duration: 3000,
        showClose: true
      })
    }
  } catch (error) {
    console.error('请求失败:', error)
    ElMessage({
      type: 'error',
      message: '连接服务器失败，请检查服务器是否启动',
      duration: 3000,
      showClose: true
    })
  } finally {
    isLoading.value = false
  }
}

// 用户登出
const handleLogout = () => {
  localStorage.removeItem('token')
  isLoggedIn.value = false
  currentUser.value = null
  resetForm()
  ElMessage({
    type: 'success',
    message: '已退出登录',
    duration: 2000
  })
}

// 重置表单
const resetForm = () => {
  form.username = ''
  form.password = ''
  form.email = ''
}

// 邮箱验证
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}


// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 组件挂载时检查登录状态
onMounted(() => {
  checkAuthStatus()
})
</script>

<style>
.page-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.sidebar {
  background: #f9f9f9;
  padding: 15px;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.auth-box {
  margin-top: 40px;
  padding: 20px;
  border: 2px solid #409EFF;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.1);
}

.auth-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.auth-input {
  margin-bottom: 12px;
  font-size: 16px;
}

.switch {
  text-align: center;
  margin-top: 15px;
}

.switch a {
  font-size: 14px;
  color: #409EFF;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.3s;
}

.switch a:hover {
  color: #66b1ff;
}

/* 用户信息模块样式 */
.user-info-box {
  margin-top: 40px;
  padding: 20px;
  border: 2px solid #67C23A;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(103, 194, 58, 0.1);
  text-align: center;
}

.user-avatar {
  margin-bottom: 15px;
}

.user-details {
  margin-bottom: 15px;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.user-email, .user-role, .user-time {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.user-role {
  color: #67C23A;
  font-weight: 500;
}

.content {
  padding: 20px;
}
</style>
