<template>
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
      <view class="menu-item" :class="{ active: current === 'rider-audit' }" @click="goPage('rider-audit')">
        <text class="menu-icon">🏍️</text>
        <text class="menu-text">骑手资质审核</text>
      </view>
      <view class="menu-item" :class="{ active: current === 'license-audit' }" @click="goPage('license-audit')">
        <text class="menu-icon">📄</text>
        <text class="menu-text">营业执照审核</text>
      </view>
      <view class="menu-item" :class="{ active: current === 'error-audit' }" @click="goPage('error-audit')">
        <text class="menu-icon">⚠️</text>
        <text class="menu-text">骑手异常审核</text>
      </view>
      <view class="menu-item" :class="{ active: current === 'banner-manage' }" @click="goPage('banner-manage')">
        <text class="menu-icon">🖼️</text>
        <text class="menu-text">轮播图管理</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    current: { type: String, default: '' }
  },
  methods: {
    goPage(page) {
      if (page === this.current) return
      const urls = {
        'rider-audit': '/pages/admin/rider-audit',
        'license-audit': '/pages/admin/license-audit',
        'error-audit': '/pages/admin/error-audit',
        'banner-manage': '/pages/admin/banner-manage'
      }
      uni.redirectTo({ url: urls[page] })
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 400rpx;
  min-width: 400rpx;
  height: 100vh;
  background: linear-gradient(180deg, #e8f4fc 0%, #d4e8f5 100%);
  display: flex;
  flex-direction: column;
  border-right: 1rpx solid #c5dce8;
  flex-shrink: 0;
}
.sidebar-header {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #c5dce8;
}
.logo-box {
  width: 70rpx;
  height: 70rpx;
  background: #4a90d9;
  border-radius: 14rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}
.title-box {
  flex: 1;
  margin-left: 12rpx;
}
.main-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  display: block;
}
.sub-title {
  font-size: 20rpx;
  color: #666;
  display: block;
  margin-top: 4rpx;
}
.env-tag {
  font-size: 18rpx;
  color: #999;
  border: 1rpx solid #ccc;
  padding: 4rpx 10rpx;
  border-radius: 6rpx;
}
.menu-list {
  flex: 1;
  padding: 20rpx 0;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx;
  color: #333;
  font-size: 26rpx;
}
.menu-item.active {
  color: #4a90d9;
  background: rgba(74, 144, 217, 0.15);
  border-right: 4rpx solid #4a90d9;
}
.menu-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}
.menu-text {
  flex: 1;
}
</style>
