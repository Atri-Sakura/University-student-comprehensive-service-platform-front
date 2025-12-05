<template>
  <view class="order-detail-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="navbar-title">订单详情</view>
      <view class="navbar-right"></view>
    </view>

    <!-- 订单状态卡片 -->
    <view class="status-card">
      <view class="status-header">
        <text class="status-label">订单状态</text>
        <text class="status-value status-completed">已完成</text>
      </view>
      <text class="status-desc">您的订单已成功完成</text>
      <text class="complete-time">完成时间：2023-09-15 12:30</text>
    </view>

    <!-- 订单信息卡片 -->
    <view class="info-card">
      <view class="info-header">
        <text class="info-icon">📋</text>
        <text class="info-title">订单信息</text>
      </view>
      <view class="info-item">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ orderInfo.orderNo }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">任务内容</text>
        <text class="info-value">{{ orderInfo.taskContent }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">配送路线</text>
        <text class="info-value">{{ orderInfo.deliveryRoute }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">任务报酬</text>
        <text class="info-value reward">{{ orderInfo.reward }}</text>
      </view>
    </view>

    <!-- 订单进度时间线 -->
    <view class="progress-card">
      <view class="info-header">
        <text class="info-icon">⏱️</text>
        <text class="info-title">订单进度</text>
      </view>
      <view class="timeline">
        <view v-for="(step, index) in orderProgress" :key="index" class="timeline-item active">
          <view :class="['timeline-dot', step.status]">
            <text class="timeline-icon">{{ step.icon }}</text>
          </view>
          <view class="timeline-content">
            <text class="timeline-time">{{ step.time }}</text>
            <text class="timeline-text">{{ step.text }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 配送员信息卡片 -->
    <view class="delivery-card">
      <view class="info-header">
        <text class="info-icon">👤</text>
        <text class="info-title">配送员信息</text>
      </view>
      <view class="delivery-info">
        <view class="delivery-avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="delivery-details">
          <text class="delivery-name">{{ deliveryInfo.name }}</text>
          <view class="delivery-rating">
            <text class="star">★★★★★</text>
            <text class="rating-score">{{ deliveryInfo.rating }}</text>
          </view>
        </view>
        <button class="contact-button" @click="contactDelivery">联系</button>
      </view>
    </view>

    <!-- 底部操作区域已移除，评价功能在订单列表页面 -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: '',
      orderInfo: {
        orderNo: '#20230915123456',
        taskContent: '代取食堂外卖（麻辣香锅）',
        deliveryRoute: '从二食堂到图书馆3楼',
        reward: '¥5.00'
      },
      deliveryInfo: {
        name: '张师傅',
        rating: '4.7',
        phone: '13800138000'
      },
      orderProgress: [
        {
          time: '2023-09-15 12:30',
          text: '订单已完成',
          status: 'completed',
          icon: '✓'
        },
        {
          time: '2023-09-15 12:15',
          text: '配送员已送达',
          status: 'delivered',
          icon: '🚪'
        },
        {
          time: '2023-09-15 12:00',
          text: '配送员已取餐',
          status: 'picked',
          icon: '🍽️'
        },
        {
          time: '2023-09-15 11:45',
          text: '配送员已接单',
          status: 'accepted',
          icon: '👤'
        },
        {
          time: '2023-09-15 11:30',
          text: '订单创建成功',
          status: 'created',
          icon: '+'
        }
      ]
    };
  },
  onLoad(options) {
    // 接收订单ID参数
    if (options.orderId) {
      this.orderId = options.orderId;
      // 这里可以根据订单ID从服务器获取真实数据
      console.log('订单ID:', this.orderId);
      // 模拟根据订单ID加载数据
      this.loadOrderData();
    }
  },
  methods: {
    // 加载订单数据
    loadOrderData() {
      // 实际项目中，这里应该调用API获取订单数据
      console.log('正在加载订单数据...');
      // 模拟API请求延迟
      setTimeout(() => {
        // 这里可以根据实际情况更新订单数据
        this.orderInfo = {
          orderNo: '#20230915123456',
          taskContent: '代取食堂外卖（麻辣香锅）',
          deliveryRoute: '从二食堂到图书馆3楼',
          reward: '¥5.00'
        };
        this.deliveryInfo = {
          name: '张师傅',
          rating: '4.7',
          phone: '13800138000'
        };
      }, 300);
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 联系配送员
    contactDelivery() {
      console.log('联系配送员:', this.deliveryInfo.name);
      uni.makePhoneCall({
        phoneNumber: this.deliveryInfo.phone || '13800138000',
        success() {
          console.log('拨打电话成功');
        },
        fail(err) {
          console.log('拨打电话失败:', err);
          uni.showToast({
            title: '拨打电话失败',
            icon: 'none'
          });
        }
      });
    },
    

  }
};
</script>

<style scoped>
.order-detail-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-top: 20rpx; /* 为固定导航栏留出空间 */
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
}

/* 导航栏样式 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90rpx;
  background-color: #5DCDFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  z-index: 100;
}

.back-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: white;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.navbar-right {
  width: 80rpx;
}

/* 通用卡片样式 */
.status-card,
.info-card,
.progress-card,
.delivery-card {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
}

/* 订单状态卡片 */
.status-card {
  background-color: #f6ffed;
  border: 2rpx solid #b7eb8f;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.status-label {
  font-size: 32rpx;
  color: #666;
}

.status-value {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.status-completed {
  background-color: #52c41a;
  color: white;
}

.status-desc {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 15rpx;
}

.complete-time {
  font-size: 28rpx;
  color: #999;
}

/* 信息卡片头部 */
.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 25rpx;
}

.info-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.info-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

/* 订单信息项 */
.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  text-align: right;
  flex: 1;
  padding-left: 30rpx;
}

.reward {
  color: #ff4d4f;
  font-weight: 500;
}

/* 时间线样式 */
.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 30rpx;
  top: 60rpx;
  bottom: 0;
  width: 4rpx;
  background-color: #e8e8e8;
}

.timeline-item {
  display: flex;
  margin-bottom: 40rpx;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  position: relative;
  z-index: 1;
  font-size: 30rpx;
}

.timeline-item.active .timeline-dot {
  background-color: #5DCDFF;
  color: white;
}

.timeline-dot.completed {
  background-color: #52c41a;
  color: white;
}

.timeline-dot.delivered {
  background-color: #fa8c16;
  color: white;
}

.timeline-dot.picked {
  background-color: #1890ff;
  color: white;
}

.timeline-dot.accepted {
  background-color: #722ed1;
  color: white;
}

.timeline-dot.created {
  background-color: #13c2c2;
  color: white;
}

.timeline-content {
  flex: 1;
  margin-left: 20rpx;
  padding-top: 10rpx;
}

.timeline-time {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 5rpx;
}

.timeline-text {
  font-size: 28rpx;
  color: #333;
}

/* 配送员信息 */
.delivery-info {
  display: flex;
  align-items: center;
}

.delivery-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.avatar-icon {
  font-size: 50rpx;
}

.delivery-details {
  flex: 1;
}

.delivery-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.delivery-rating {
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
  color: #666;
}

.contact-button {
  padding: 0 30rpx;
  height: 70rpx;
  background-color: #5DCDFF;
  color: white;
  border-radius: 35rpx;
  font-size: 28rpx;
  line-height: 70rpx;
  text-align: center;
  border: none;
}

.contact-button::after {
   border: none;
  }
  
  /* 底部操作按钮已移除，评价功能在订单列表页面 */


</style>