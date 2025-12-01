<template>
  <view class="orders-container">
    <!-- 订单概览卡片 -->
    <view class="overview-card">
      <view class="overview-title">订单概览</view>
      <view class="overview-stats">
        <view class="stat-item">
          <view class="stat-number">{{ totalOrders }}</view>
          <view class="stat-label">全部订单</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">{{ pendingOrders }}</view>
          <view class="stat-label">待处理</view>
        </view>
        <view class="stat-item">
          <view class="stat-number">{{ completedOrders }}</view>
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
import orderApi from '@/api/order.js';
import { getErrandOrderList } from '@/api/errand.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0
    };
  },
  onLoad() {
    this.loadOrderStats();
  },
  onShow() {
    // 每次显示页面时刷新统计数据
    this.loadOrderStats();
  },
  methods: {
    // 加载订单统计数据
    async loadOrderStats() {
      try {
        // 同时获取外卖订单和跑腿订单
        const [foodOrderRes, errandOrderRes] = await Promise.all([
          orderApi.getOrderList({}),  // 外卖订单
          getErrandOrderList({})       // 跑腿订单
        ]);
        
        console.log('外卖订单响应:', foodOrderRes);
        console.log('跑腿订单响应:', errandOrderRes);
        
        let allOrders = [];
        
        // 提取外卖订单数据
        if (foodOrderRes && foodOrderRes.code === 200) {
          let foodOrders = [];
          if (Array.isArray(foodOrderRes.rows)) {
            foodOrders = foodOrderRes.rows;
          } else if (Array.isArray(foodOrderRes.data)) {
            foodOrders = foodOrderRes.data;
          } else if (foodOrderRes.data && Array.isArray(foodOrderRes.data.rows)) {
            foodOrders = foodOrderRes.data.rows;
          }
          allOrders = allOrders.concat(foodOrders);
          console.log('外卖订单数量:', foodOrders.length);
        }
        
        // 提取跑腿订单数据
        if (errandOrderRes && errandOrderRes.code === 200) {
          let errandOrders = [];
          if (Array.isArray(errandOrderRes.rows)) {
            errandOrders = errandOrderRes.rows;
          } else if (Array.isArray(errandOrderRes.data)) {
            errandOrders = errandOrderRes.data;
          } else if (errandOrderRes.data && Array.isArray(errandOrderRes.data.rows)) {
            errandOrders = errandOrderRes.data.rows;
          }
          allOrders = allOrders.concat(errandOrders);
          console.log('跑腿订单数量:', errandOrders.length);
        }
        
        console.log('所有订单总数:', allOrders.length);
        
        // 计算统计数据
        this.totalOrders = allOrders.length;
        this.pendingOrders = allOrders.filter(order => {
          const status = order.orderStatus || order.status;
          // 待处理状态：待支付、已支付、准备中、配送中等
          return status === 'PENDING' || status === 'PAID' || status === 'PREPARING' || 
                 status === 'DELIVERING' || status === 1 || status === 2;
        }).length;
        this.completedOrders = allOrders.filter(order => {
          const status = order.orderStatus || order.status;
          return status === 'COMPLETED' || status === 3;
        }).length;
        
        console.log('统计结果 - 总订单:', this.totalOrders, '待处理:', this.pendingOrders, '已完成:', this.completedOrders);
      } catch (error) {
        console.error('加载订单统计失败:', error);
      }
    },
    
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