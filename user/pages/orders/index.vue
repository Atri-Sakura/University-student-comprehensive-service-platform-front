<template>
  <view class="orders-container">
    <!-- 订单概览卡片 -->
    <view class="overview-card">
      <view class="overview-title">订单概览</view>
      <view class="overview-stats">
        <view class="stat-item">
          <view class="stat-number">8</view>
          <view class="stat-label">全部订单</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">2</view>
          <view class="stat-label">待处理</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">6</view>
          <view class="stat-label">已完成</view>
        </view>
      </view>
    </view>

    <!-- 订单类型列表 -->
    <view class="order-types">
      <view class="type-item" @click="navigateToOrderType('food')">
        <view class="type-icon food-icon">
          <text class="icon">🍽️</text>
        </view>
        <view class="type-name">外卖订单</view>
        <view class="type-arrow">></view>
      </view>
      
      <view class="type-item" @click="navigateToOrderType('runner')">
        <view class="type-icon runner-icon">
          <text class="icon">🏃</text>
        </view>
        <view class="type-name">跑腿订单</view>
        <view class="type-arrow">></view>
      </view>
      
      <view class="type-item" @click="navigateToOrderType('secondhand')">
        <view class="type-icon secondhand-icon">
          <text class="icon">👜</text>
        </view>
        <view class="type-name">二手交易订单</view>
        <view class="type-arrow">></view>
      </view>
    </view>

    <!-- 自定义底部导航栏 -->
    <custom-tabbar :current="3"></custom-tabbar>
  </view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      // 可以在这里添加订单数据
    };
  },
  methods: {
    navigateToOrderType(type) {
      // 根据订单类型导航到不同的子页面
      console.log('跳转到', type, '订单页面');
      // 跳转到对应的子页面
      switch (type) {
        case 'food':
          uni.navigateTo({ url: '/pages/orders/food-orders' });
          break;
        case 'runner':
          uni.navigateTo({ url: '/pages/orders/errand-orders' });
          break;
        case 'secondhand':
          uni.navigateTo({ url: '/pages/orders/second-hand-orders' });
          break;
        default:
          break;
      }
    }
  }
};
</script>

<style scoped>
.orders-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 100rpx; /* 为底部导航栏留出空间 */
}

/* 订单概览卡片样式 */
.overview-card {
  background-color: white;
  margin: 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.overview-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.overview-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 28rpx;
  color: #666;
}

/* 订单类型列表样式 */
.order-types {
  background-color: white;
  margin: 0 30rpx 30rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.type-item {
  display: flex;
  align-items: center;
  padding: 35rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.type-item:last-child {
  border-bottom: none;
}

.type-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.food-icon {
  background-color: #FFF8F0;
}

.runner-icon {
  background-color: #F0FFF0;
}

.secondhand-icon {
  background-color: #F0F8FF;
}

.icon {
  font-size: 40rpx;
}

.type-name {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}

.type-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}
</style>