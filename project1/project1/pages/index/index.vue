<template>
  <view class="container">
    <!-- 顶部店铺信息 -->
    <view class="shop-header">
      <view class="shop-icon">🏪</view>
      <view class="shop-info">
        <view class="shop-name">{{ shopData.name }}</view>
        <view class="shop-status">{{ shopData.businessStatus }} · {{ shopData.businessHours }}</view>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 今日数据 -->
      <view class="section">
        <view class="section-title">
          <text class="title-text">今日数据</text>
          <text class="date-text">{{ todayDate }}</text>
        </view>
        <view class="data-cards">
          <view class="data-card">
            <text class="card-label">订单量</text>
            <text class="card-value">{{ todayData.orderCount }}</text>
            <text class="card-trend positive">
              {{ todayData.orderTrend > 0 ? '+' : '' }}{{ todayData.orderTrend }}% 昨日
            </text>
          </view>
          <view class="data-card">
            <text class="card-label">营业额</text>
            <text class="card-value">¥{{ todayData.revenue }}</text>
            <text class="card-trend positive">
              {{ todayData.revenueTrend > 0 ? '+' : '' }}{{ todayData.revenueTrend }}% 昨日
            </text>
          </view>
        </view>
      </view>
      
      <!-- 订单状态 -->
      <view class="section">
        <view class="section-title">
          <text class="title-text">订单状态</text>
        </view>
        <view class="order-status-cards">
          <view class="status-card" @click="goToOrders('pending')">
            <text class="status-label">待处理</text>
            <text class="status-count">{{ orderStatus.pending }}</text>
          </view>
          <view class="status-card" @click="goToOrders('toDeliver')">
            <text class="status-label">待配送</text>
            <text class="status-count">{{ orderStatus.toDeliver }}</text>
          </view>
          <view class="status-card" @click="goToOrders('delivering')">
            <text class="status-label">配送中</text>
            <text class="status-count">{{ orderStatus.delivering }}</text>
          </view>
        </view>
      </view>
      
      <!-- 常用功能 -->
      <view class="section">
        <view class="section-title">
          <text class="title-text">常用功能</text>
        </view>
        <view class="function-grid">
          <view class="function-item" v-for="item in functions" :key="item.name" @click="goToFunction(item.path)">
            <view class="function-icon" :style="{ backgroundColor: item.color }">
              <text class="icon-text">{{ item.icon }}</text>
            </view>
            <text class="function-name">{{ item.name }}</text>
          </view>
        </view>
      </view>
      
      <!-- 活动通知 -->
      <view class="notice-banner" @click="goToActivity">
        <text class="notice-text">新客立减活动进行中，点击查看</text>
        <view class="notice-btn">查看</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RestaurantHome',
  data() {
    return {
      shopData: {
        name: "美味餐厅",
        businessStatus: "营业中",
        businessHours: "08:00-22:00"
      },
      todayDate: '',
      todayData: {
        orderCount: 86,
        orderTrend: 12,
        revenue: '5,268',
        revenueTrend: 8
      },
      orderStatus: {
        pending: 12,
        toDeliver: 8,
        delivering: 5
      },
      functions: [
        { name: '商品管理', icon: '🍴', color: '#B3D9FF', path: '/pages/products/products' },
        { name: '订单管理', icon: '📋', color: '#B3D9FF', path: '/pages/orders/orders' },
        { name: '活动管理', icon: '📈', color: '#B3D9FF', path: '/pages/activities/activities' },
        { name: '门店设置', icon: '🏪', color: '#B3D9FF', path: '/pages/settings/settings' },
        { name: '评价查看', icon: '📝', color: '#B3D9FF', path: '/pages/reviews/reviews' },
        { name: '财务管理', icon: '💰', color: '#B3D9FF', path: '/pages/finance/finance' },
        { name: '数据分析', icon: '📊', color: '#B3D9FF', path: '/pages/analytics/analytics' },
        { name: '联系客服', icon: '🎧', color: '#B3D9FF', path: '/pages/support/support' }
      ]
    }
  },
  onLoad() {
    this.getTodayDate();
    this.loadTodayData();
  },
  methods: {
    getTodayDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.todayDate = `${year}-${month}-${day}`;
    },
    loadTodayData() {
      // 这里可以调用API获取今日数据
      // 现在使用模拟数据
      console.log('加载今日数据');
    },
    goToOrders(status) {
      uni.navigateTo({
        url: `/pages/orders/orders?status=${status}`
      });
    },
    goToFunction(path) {
      // 商品管理页面已开发，可以跳转
      if (path === '/pages/products/products') {
        uni.navigateTo({
          url: path
        });
      } else {
        uni.showToast({
          title: '功能开发中',
          icon: 'none'
        });
      }
    },
    goToActivity() {
      uni.showToast({
        title: '查看活动详情',
        icon: 'none'
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
}

/* 顶部店铺信息 */
.shop-header {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
}

.shop-icon {
  font-size: 80rpx;
  margin-right: 24rpx;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.shop-status {
  font-size: 28rpx;
  color: #666;
}

/* 内容区域 */
.content {
  padding: 24rpx;
}

.section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.date-text {
  font-size: 26rpx;
  color: #999;
}

/* 今日数据卡片 */
.data-cards {
  display: flex;
  gap: 20rpx;
}

.data-card {
  flex: 1;
  background: #F0F8FF;
  border-radius: 12rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.card-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.card-trend {
  font-size: 24rpx;
}

.card-trend.positive {
  color: #52c41a;
}

.card-trend.negative {
  color: #ff4d4f;
}

/* 订单状态卡片 */
.order-status-cards {
  display: flex;
  gap: 16rpx;
}

.status-card {
  flex: 1;
  background: #F0F8FF;
  border-radius: 12rpx;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.status-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.status-count {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
}

/* 功能网格 */
.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30rpx 20rpx;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.function-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.icon-text {
  font-size: 48rpx;
}

.function-name {
  font-size: 24rpx;
  color: #333;
  text-align: center;
}

/* 活动通知横幅 */
.notice-banner {
  background: linear-gradient(135deg, #E3F2FD, #BBDEFB);
  border-radius: 12rpx;
  padding: 24rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.notice-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.notice-btn {
  background: #2196F3;
  color: white;
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
}
</style>
