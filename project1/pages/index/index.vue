<template>
  <view class="page-container">
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
          <view class="data-card" @click="goToAnalytics">
            <text class="card-label">订单量</text>
            <text class="card-value">{{ todayData.orderCount }}</text>
            <text class="card-trend positive">
              {{ todayData.orderTrend > 0 ? '+' : '' }}{{ todayData.orderTrend }}% 昨日
            </text>
          </view>
          <view class="data-card" @click="goToAnalytics">
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
    
    <!-- 自定义底部导航栏 -->
    <view class="custom-tab-bar">
      <view class="tab-item active">
        <view class="tab-icon">🏠</view>
        <view class="tab-text">首页</view>
      </view>
      <view class="tab-item" @click="switchTab('list')">
        <view class="tab-icon">📋</view>
        <view class="tab-text">订单</view>
      </view>
      <view class="tab-item" @click="switchTab('message')">
        <view class="tab-icon">💬</view>
        <view class="tab-text">消息</view>
      </view>
      <view class="tab-item" @click="switchTab('mine')">
        <view class="tab-icon">👤</view>
        <view class="tab-text">我的</view>
      </view>
    </view>
  </view>
</template>

<script>
import { merchantAPI, 请求 } from '@/utils/api.js';

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
        orderCount: 0,
        orderTrend: 0,
        revenue: '0',
        revenueTrend: 0
      },
      orderStatus: {
        pending: 0,
        toDeliver: 0,
        delivering: 0
      },
      functions: [
        { name: '商品管理', icon: '🍴', color: '#B3D9FF', path: '/pages/products/products' },
        { name: '订单管理', icon: '📋', color: '#B3D9FF', path: '/pages/list/list' },
        { name: '活动管理', icon: '📈', color: '#B3D9FF', path: '/pages/activities/activities' },
        { name: '门店设置', icon: '🏪', color: '#B3D9FF', path: '/pages/mine/mine' },
        { name: '评价查看', icon: '📝', color: '#B3D9FF', path: '/pages/reviews/reviews' },
        { name: '财务管理', icon: '💰', color: '#B3D9FF', path: '/pages/finance/finance' },
        { name: '数据分析', icon: '📊', color: '#B3D9FF', path: '/pages/analytics/analytics' },
        { name: '联系客服', icon: '🎧', color: '#B3D9FF', path: '/pages/support/support' }
      ]
    }
  },
  onLoad() {
    this.getTodayDate();
    this.loadAllData();
  },
  onShow() {
    // 每次显示页面时重新加载数据
    this.loadAllData();
  },
  methods: {
    // 统一加载所有数据（从后端的 /merchant/orders/status 接口获取）
    loadAllData() {
      // 先从本地缓存加载店铺信息（快速显示）
      const savedInfo = uni.getStorageSync('shopInfo');
      if (savedInfo) {
        this.shopData = {
          ...this.shopData,
          name: savedInfo.name || this.shopData.name,
          businessStatus: savedInfo.openStatus || this.shopData.businessStatus,
          businessHours: savedInfo.hours || this.shopData.businessHours
        };
      }
      
      // 从后端统一接口获取所有数据
      请求(merchantAPI.getOrderStatus, {
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            const data = res.data.data;
            
            // 1. 更新店铺信息
            if (data.shopName || data.name || data.merchantName || data.shopInfo) {
              const shopInfo = data.shopInfo || data;
              this.shopData = {
                name: shopInfo.shopName || shopInfo.name || shopInfo.merchantName || this.shopData.name,
                businessStatus: shopInfo.businessStatus || shopInfo.status || this.shopData.businessStatus,
                businessHours: shopInfo.businessHours || shopInfo.hours || this.shopData.businessHours
              };
              // 保存到本地缓存
              uni.setStorageSync('shopInfo', {
                name: this.shopData.name,
                openStatus: this.shopData.businessStatus,
                hours: this.shopData.businessHours
              });
            }
            
            // 2. 更新今日数据统计
            this.todayData = {
              orderCount: data.orderCount || data.ordersCount || 0,
              orderTrend: data.orderTrend || 0,
              revenue: data.revenue || '0',
              revenueTrend: data.revenueTrend || 0
            };
            
            // 3. 更新订单状态统计
            this.orderStatus = {
              pending: data.pending || data.pendingCount || 0,
              toDeliver: data.toDeliver || data.toDeliverCount || data.waitingDeliveryCount || 0,
              delivering: data.delivering || data.deliveringCount || 0
            };
          } else {
            uni.showToast({
              title: res.data.message || '获取数据失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          uni.showToast({
            title: '网络请求失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    },
    
    getTodayDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      this.todayDate = `${year}-${month}-${day}`;
    },
    goToAnalytics() {
      // 跳转到数据分析页面
      uni.navigateTo({
        url: '/pages/analytics/analytics'
      });
    },
    goToOrders(status) {
      uni.navigateTo({
        url: `/pages/orders/orders?status=${status}`
      });
    },
    goToFunction(path) {
      if (path === '/pages/analytics/analytics') {
        this.goToAnalytics();
      } else if (path === '/pages/mine/mine') {
        // 跳转到门店设置页面（原"我的"页面）
        uni.switchTab({
          url: '/pages/mine/mine'
        });
      } else if (path === '/pages/list/list') {
        // 跳转到订单管理页面
        uni.switchTab({
          url: '/pages/list/list'
        });
      } else if (path === '/pages/support/support') {
        // 跳转到联系客服页面
        uni.navigateTo({
          url: '/pages/support/support'
        });
      } else if (path === '/pages/products/products') {
        // 跳转到商品管理页面
        uni.navigateTo({
          url: '/pages/products/products'
        });
      } else if (path === '/pages/reviews/reviews') {
        // 跳转到评价管理页面
        uni.navigateTo({
          url: '/pages/reviews/reviews'
        });
      } else if (path === '/pages/activities/activities') {
        // 跳转到活动管理页面
        uni.navigateTo({
          url: '/pages/activities/activities'
        });
      } else if (path === '/pages/finance/finance') {
        // 跳转到财务管理页面
        uni.navigateTo({
          url: '/pages/finance/finance'
        });
      }
      else {
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
    },
    switchTab(tab) {
      const urlMap = {
        list: '/pages/list/list',
        message: '/pages/message/message',
        mine: '/pages/mine/mine'
      };
      
      if (urlMap[tab]) {
        uni.switchTab({
          url: urlMap[tab]
        });
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 100rpx;
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
  /* 添加按钮效果 */
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.data-card:active {
  background: #E1F0FF;
  transform: scale(0.98);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
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
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-card:active {
  background: #E1F0FF;
  transform: scale(0.98);
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
  cursor: pointer;
}

.function-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  transition: all 0.2s ease;
}

.function-item:active .function-icon {
  transform: scale(0.95);
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
  cursor: pointer;
  transition: all 0.2s ease;
}

.notice-banner:active {
  background: linear-gradient(135deg, #D1E8FF, #A8D0FF);
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

/* 自定义底部导航栏 */
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  display: flex;
  padding: 10rpx 0;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
  z-index: 999;
  border-top: 1rpx solid #e0e0e0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
  color: #999999;
}

.tab-item.active {
  color: #4A90E2;
}

.tab-icon {
  font-size: 44rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 20rpx;
}
</style>
