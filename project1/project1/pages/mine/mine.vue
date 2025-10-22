<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-avatar">
        <text class="avatar-text">👤</text>
      </view>
      <view class="user-info">
        <text class="user-name">{{ userInfo.name }}</text>
        <text class="user-phone">{{ userInfo.phone }}</text>
      </view>
      <view class="edit-btn" @click="editProfile">
        <text class="edit-text">编辑</text>
      </view>
    </view>
    
    <!-- 数据统计 -->
    <view class="stats-card">
      <view class="stat-item" @click="goToPage('revenue')">
        <text class="stat-value">¥{{ stats.totalRevenue }}</text>
        <text class="stat-label">总营业额</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="goToPage('orders')">
        <text class="stat-value">{{ stats.totalOrders }}</text>
        <text class="stat-label">总订单数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="goToPage('customers')">
        <text class="stat-value">{{ stats.totalCustomers }}</text>
        <text class="stat-label">客户数</text>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" v-for="item in menuList" :key="item.name" @click="goToPage(item.path)">
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-name">{{ item.name }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 店铺管理 -->
    <view class="menu-section">
      <view class="section-title">
        <text class="title-text">店铺管理</text>
      </view>
      <view class="menu-item" v-for="item in shopMenuList" :key="item.name" @click="goToPage(item.path)">
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-name">{{ item.name }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-btn" @click="logout">
      <text class="logout-text">退出登录</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MinePage',
  data() {
    return {
      userInfo: {
        name: '美味餐厅',
        phone: '138****8888'
      },
      stats: {
        totalRevenue: '52,680',
        totalOrders: 1286,
        totalCustomers: 856
      },
      menuList: [
        { name: '我的收藏', icon: '⭐', path: '/pages/favorites/favorites' },
        { name: '优惠券', icon: '🎫', path: '/pages/coupons/coupons' },
        { name: '账户余额', icon: '💰', path: '/pages/balance/balance' },
        { name: '交易记录', icon: '📝', path: '/pages/transactions/transactions' }
      ],
      shopMenuList: [
        { name: '店铺设置', icon: '⚙️', path: '/pages/settings/settings' },
        { name: '营业时间', icon: '🕐', path: '/pages/hours/hours' },
        { name: '员工管理', icon: '👥', path: '/pages/staff/staff' },
        { name: '关于我们', icon: 'ℹ️', path: '/pages/about/about' }
      ]
    }
  },
  methods: {
    editProfile() {
      uni.showToast({
        title: '编辑资料',
        icon: 'none'
      });
    },
    goToPage(path) {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已退出登录',
              icon: 'success'
            });
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 用户信息卡片 */
.user-card {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 50rpx 30rpx;
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.avatar-text {
  font-size: 60rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.user-phone {
  font-size: 26rpx;
  color: #666;
}

.edit-btn {
  padding: 12rpx 30rpx;
  background: white;
  border-radius: 40rpx;
}

.edit-text {
  font-size: 26rpx;
  color: #4a90e2;
}

/* 数据统计 */
.stats-card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 40rpx 0;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: #e5e5e5;
}

/* 功能菜单 */
.menu-section {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.section-title {
  padding: 30rpx 30rpx 10rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-name {
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 50rpx;
  color: #ccc;
  font-weight: 300;
}

/* 退出登录按钮 */
.logout-btn {
  margin: 20rpx;
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.logout-text {
  font-size: 32rpx;
  color: #ff4d4f;
  font-weight: bold;
}
</style>

