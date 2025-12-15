<template>
  <view class="admin-container">
    <!-- 左侧菜单 -->
    <view class="sidebar">
      <view class="sidebar-header">
        <view class="logo-box">CS</view>
        <view class="title-box">
          <text class="main-title">校园生活后台</text>
          <text class="sub-title">平台端管理</text>
        </view>
        <text class="env-tag">PROD</text>
      </view>
      
      <scroll-view scroll-y class="menu-list">
        <view class="menu-item" :class="{ active: currentPage === 'rider-audit' }" @click="switchPage('rider-audit')">
          <text class="menu-icon">🏍️</text>
          <text class="menu-text">骑手资质审核</text>
        </view>
        <view class="menu-item" :class="{ active: currentPage === 'license-audit' }" @click="switchPage('license-audit')">
          <text class="menu-icon">📄</text>
          <text class="menu-text">营业执照审核</text>
        </view>
        <view class="menu-item" :class="{ active: currentPage === 'error-report' }" @click="switchPage('error-report')">
          <text class="menu-icon">⚠️</text>
          <text class="menu-text">骑手异常报告</text>
        </view>
        <view class="menu-item" :class="{ active: currentPage === 'student-home' }" @click="switchPage('student-home')">
          <text class="menu-icon">🎓</text>
          <text class="menu-text">学生端首页</text>
        </view>
        <view class="menu-item" :class="{ active: currentPage === 'customer-service' }" @click="switchPage('customer-service')">
          <text class="menu-icon">💬</text>
          <text class="menu-text">在线客服</text>
        </view>
      </scroll-view>
      

    </view>
    
    <!-- 右侧内容区 -->
    <view class="main-content">
      <view class="welcome-box">
        <text class="welcome-title">欢迎使用校园生活后台</text>
        <text class="welcome-desc">请从左侧菜单选择功能模块</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentPage: ''
    }
  },
  methods: {
    switchPage(page) {
      const urls = {
        'rider-audit': '/pages/admin/rider-audit',
        'license-audit': '/pages/admin/license-audit',
        'error-report': '/pages/rider/error-report',
        'student-home': '/pages/student/home',
        'customer-service': '/pages/customer-service/index'
      }
      uni.navigateTo({ url: urls[page] })
    }
  }
}
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  background: #f0f5fa;
}

/* 左侧菜单 */
.sidebar {
  width: 480rpx;
  background: linear-gradient(180deg, #e8f4fc 0%, #d4e8f5 100%);
  display: flex;
  flex-direction: column;
  border-right: 1rpx solid #c5dce8;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 30rpx 24rpx;
  border-bottom: 1rpx solid #c5dce8;
}

.logo-box {
  width: 80rpx;
  height: 80rpx;
  background: #4a90d9;
  border-radius: 16rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-box {
  flex: 1;
  margin-left: 16rpx;
}

.main-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}

.sub-title {
  font-size: 22rpx;
  color: #666;
  display: block;
  margin-top: 4rpx;
}

.env-tag {
  font-size: 20rpx;
  color: #999;
  border: 1rpx solid #ccc;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.menu-list {
  flex: 1;
  padding: 20rpx 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  color: #333;
  font-size: 28rpx;
  position: relative;
}

.menu-item.active {
  color: #4a90d9;
  background: rgba(74, 144, 217, 0.1);
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.menu-text {
  flex: 1;
}

.arrow {
  font-size: 20rpx;
  color: #999;
}

.sub-menu {
  background: rgba(255, 255, 255, 0.5);
  margin: 0 16rpx;
  border-radius: 12rpx;
}

.sub-item {
  padding: 20rpx 32rpx 20rpx 80rpx;
  font-size: 26rpx;
  color: #666;
}

.sub-item.active {
  color: #4a90d9;
  background: rgba(74, 144, 217, 0.15);
  border-radius: 8rpx;
}

.sidebar-footer {
  padding: 24rpx;
  border-top: 1rpx solid #c5dce8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn {
  font-size: 24rpx;
  color: #999;
  margin-right: 8rpx;
}

.footer-text {
  font-size: 24rpx;
  color: #999;
}

/* 右侧内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.welcome-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #fff;
}

.welcome-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.welcome-desc {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}
</style>
