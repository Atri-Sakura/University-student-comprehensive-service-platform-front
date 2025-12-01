<template>
  <view class="food-orders-container">
    <!-- 移除导航栏 -->
    
    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-item" v-for="(order, index) in orders" :key="index" @click="viewOrderDetail(order.id)">
        <view class="order-content">
          <image class="food-image" :src="order.imageUrl" mode="aspectFill"></image>
          <view class="order-details">
            <view class="food-name">{{ order.foodName }}</view>
            <view class="order-info">
              <text class="info-text">下单时间：{{ order.orderTime }}</text>
              <text class="info-text">| 订单号：{{ order.orderId }}</text>
            </view>
            <view class="order-status">{{ order.status }}</view>
          </view>
          <view class="order-price">¥{{ order.price }}</view>
        </view>
      </view>
      
      <!-- 空订单提示 -->
      <view class="empty-order" v-if="orders.length === 0">
        <view class="empty-icon">🍽️</view>
        <view class="empty-text">暂无外卖订单</view>
        <button class="go-shopping" @click="goToShopping">去下单</button>
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
      orders: [
        {
          id: '1',
          foodName: '香酥鸡排饭',
          orderTime: '2025-09-05 18:32',
          orderId: '20250905183201',
          status: '已完成',
          price: '18.80',
          imageUrl: '/static/food1.jpg'
        },
        {
          id: '2',
          foodName: '珍珠奶茶',
          orderTime: '2025-09-06 09:15',
          orderId: '20250906091502',
          status: '已完成',
          price: '12.00',
          imageUrl: '/static/food2.jpg'
        },
        {
          id: '3',
          foodName: '水果冰淇淋',
          orderTime: '2025-09-07 13:42',
          orderId: '20250907134203',
          status: '已完成',
          price: '10.50',
          imageUrl: '/static/food3.jpg'
        }
      ]
    };
  },
  methods: {
    goToShopping() {
      console.log('去下单');
      // 跳转到外卖首页
      uni.navigateTo({ url: '/pages/index/index' });
    },
    
    // 查看订单详情
    viewOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/orders/food-order-detail?id=${orderId}`
      })
    }
  }
};
</script>

<style scoped>
.food-orders-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
}

/* 订单列表样式 - 移除顶部padding以消除空白间隔 */
.order-list {
  padding: 0 20rpx 20rpx; /* 只保留左右和底部padding */
}

.order-item {
  background-color: white;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.order-item:active {
  background-color: #F5F5F5;
}

.order-content {
  display: flex;
  padding: 25rpx;
  align-items: center;
}

.food-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.order-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.food-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-info {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

.info-text {
  display: block;
}

.order-status {
  font-size: 28rpx;
  color: #5DCDFF;
}

.order-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF4444;
  margin-left: 20rpx;
}

/* 空订单样式 */
.empty-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.go-shopping {
  background-color: #5DCDFF;
  color: white;
  border: none;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
}


</style>