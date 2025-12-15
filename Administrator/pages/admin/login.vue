<template>
  <view class="login-container">
    <view class="login-header">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <text class="title">管理员登录</text>
    </view>
    
    <view class="login-form">
      <view class="form-item">
        <text class="label">账号</text>
        <input v-model="form.username" type="text" placeholder="请输入管理员账号" />
      </view>
      
      <view class="form-item">
        <text class="label">密码</text>
        <input v-model="form.password" type="password" placeholder="请输入密码" />
      </view>
      
      <button class="login-btn" @click="handleLogin" :loading="loading">登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false
    }
  },
  methods: {
    handleLogin() {
      if (!this.form.username || !this.form.password) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' })
        return
      }
      this.loading = true
      // TODO: 调用登录接口
      setTimeout(() => {
        this.loading = false
        uni.showToast({ title: '登录成功', icon: 'success' })
        uni.redirectTo({ url: '/pages/admin/index' })
      }, 1000)
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  padding: 60rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}
.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
}
.title {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}
.login-form {
  background: #fff;
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
}
.form-item {
  margin-bottom: 40rpx;
}
.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}
.form-item input {
  width: 100%;
  height: 88rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}
.login-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  border-radius: 48rpx;
  margin-top: 40rpx;
}
</style>
