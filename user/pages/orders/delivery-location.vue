<template>
  <view class="delivery-location-container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="nav-title">配送员位置</view>
      <view class="nav-right"></view>
    </view>

    <!-- 地图区域 -->
    <view class="map-container">
      <view class="map-placeholder">
        <view class="delivery-icon">
          <text class="bike-icon">🚲</text>
        </view>
        <text class="map-loading">地图加载中...</text>
      </view>
    </view>

    <!-- 配送员信息卡片 -->
    <view class="info-card">
      <view class="delivery-person">
        <view class="avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="person-info">
          <view class="name-rating">
            <text class="name">{{ deliveryInfo.name }}</text>
            <view class="rating">
              <text class="star">★★★★★</text>
              <text class="rating-score">{{ deliveryInfo.rating }}</text>
            </view>
          </view>
          <view class="stats">
            <view class="stat-item">
              <text class="stat-value">{{ deliveryInfo.completedOrders }}</text>
              <text class="stat-label">完成单数</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ deliveryInfo.onTimeRate }}</text>
              <text class="stat-label">准时率</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ deliveryInfo.distance }}</text>
              <text class="stat-label">距离您</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单信息卡片 -->
    <view class="order-info-card">
      <view class="order-item">
        <text class="order-label">订单号</text>
        <text class="order-value">{{ orderInfo.orderNo }}</text>
      </view>
      <view class="order-item">
        <text class="order-label">任务内容</text>
        <text class="order-value">{{ orderInfo.taskContent }}</text>
      </view>
      <view class="order-item">
        <text class="order-label">配送路线</text>
        <text class="order-value">{{ orderInfo.deliveryRoute }}</text>
      </view>
      <view class="order-item">
        <text class="order-label">预计送达</text>
        <text class="order-value">{{ orderInfo.estimatedArrival }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <button class="contact-button" @click="contactDelivery">联系配送员</button>
      <button class="refresh-button" @click="refreshLocation">刷新位置</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: '',
      deliveryInfo: {
        name: '张同学',
        rating: 4.7,
        completedOrders: 256,
        onTimeRate: '98%',
        distance: '2.3km'
      },
      orderInfo: {
        orderNo: '#20230915123456',
        taskContent: '代取快递（中通）',
        deliveryRoute: '菜鸟驿站 → 3号宿舍楼502',
        estimatedArrival: '约15:10 (10分钟内)'
      }
    };
  },
  onLoad(options) {
    // 接收订单ID参数
    if (options.orderId) {
      this.orderId = options.orderId;
      // 这里可以根据订单ID从服务器获取真实数据
      console.log('订单ID:', this.orderId);
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    // 联系配送员
    contactDelivery() {
      uni.showToast({
        title: '联系配送员功能开发中',
        icon: 'none'
      });
    },
    // 刷新位置
    refreshLocation() {
      uni.showToast({
        title: '位置已刷新',
        icon: 'success'
      });
    }
  }
};
</script>

<style scoped>
/* 页面容器 */
.delivery-location-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  padding-top: 10px; /* 调整为50px以匹配用户需求 */
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  background-color: #5DCDFF;
  padding: 0 30rpx;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.nav-right {
  width: 60rpx;
}

/* 地图区域 */
.map-container {
  margin-top: 0;
  height: 50vh;
  background-color: #e0e0e0;
  position: relative;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e0e0 25%, #f0f0f0 25%, #f0f0f0 50%, #e0e0e0 50%, #e0e0e0 75%, #f0f0f0 75%, #f0f0f0 100%);
  background-size: 40rpx 40rpx;
}

.delivery-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.bike-icon {
  font-size: 50rpx;
}

.map-loading {
  font-size: 28rpx;
  color: #666666;
}

/* 配送员信息卡片 */
.info-card {
  background-color: #ffffff;
  margin: 10rpx 20rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.delivery-person {
  display: flex;
  align-items: center;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-icon {
  font-size: 50rpx;
}

.person-info {
  flex: 1;
  margin-left: 10rpx;
}

.name-rating {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15rpx;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.rating {
  display: flex;
  align-items: center;
}

.star {
  font-size: 24rpx;
  color: #ffd700;
  margin-right: 8rpx;
}

.rating-score {
  font-size: 28rpx;
  color: #666666;
}

.stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 5rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

/* 订单信息卡片 */
.order-info-card {
  background-color: #ffffff;
  margin: 0 20rpx 10rpx;
  padding: 24rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.order-item {
  display: flex;
  margin-bottom: 15rpx;
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666666;
}

.order-value {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  padding: 15rpx;
  gap: 15rpx;
  margin-top: auto;
}

.contact-button {
  flex: 1;
  height: 92rpx;
  background-color: #5DCDFF;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(93, 205, 255, 0.3);
}

.contact-button::after {
  border: none;
}

.refresh-button {
  flex: 1;
  height: 92rpx;
  background-color: #ffffff;
  color: #5DCDFF;
  font-size: 32rpx;
  border: 2rpx solid #5DCDFF;
  border-radius: 46rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-button::after {
  border: none;
}
</style>