<template>
  <view class="food-orders-container">
    <!-- 移除导航栏 -->
    
    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-item" v-for="(order, index) in orders" :key="order.orderNo" @click="viewOrderDetail(order.orderNo)">
        <view class="order-content">
          <image class="food-image" :src="order.imageUrl || '/static/default-food.png'" mode="aspectFill"></image>
          <view class="order-details">
            <view class="food-name">{{ order.pickAddress || '外卖订单' }}</view>
            <view class="order-info">
              <text class="info-text">下单时间：{{ order.createTime }}</text>
              <text class="info-text">| 订单号：{{ order.orderNo }}</text>
            </view>
            <view class="order-status" :class="statusClass(order.orderStatus)">{{ orderStatusText(order.orderStatus) }}</view>
          </view>
          <view class="order-price">¥{{ order.totalAmount }}</view>
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
import api from '@/api/index.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      orders: [],
      loading: false
    };
  },
  mounted() {
    // 页面加载时获取外卖订单
    this.getFoodOrders();
  },
  onPullDownRefresh() {
    // 下拉刷新时重新获取数据
    this.getFoodOrders();
  },
  methods: {
    // 获取外卖订单列表
    async getFoodOrders() {
      try {
        this.loading = true;
        // 显示加载提示
        uni.showLoading({ title: '加载中...' });
        
        // 调用API获取所有订单，然后筛选出外卖订单(order_type=1)
        const res = await api.order.getOrderList();
        
        if (res && res.code === 200) {
          // 获取订单数据数组
            const orderList = res.rows || res.data || [];
            console.log('后端返回的订单数据:', orderList);
            // 筛选出外卖订单(orderType=1)
            this.orders = orderList.filter(item => item.orderType === 1);
            console.log('筛选后的外卖订单:', this.orders);
        } else {
          console.warn('API返回状态异常:', res);
          uni.showToast({ 
            title: res?.msg || res?.message || '获取订单失败', 
            icon: 'none' 
          });
        }
      } catch (error) {
        console.error('获取外卖订单失败:', error);
        uni.showToast({ 
          title: '网络错误，请稍后重试', 
          icon: 'none' 
        });
      } finally {
        this.loading = false;
        uni.hideLoading();
        // 停止下拉刷新动画
        uni.stopPullDownRefresh();
      }
    },
    
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
    },
    
    // 订单状态样式
    statusClass(status) {
      const statusMap = {
        1: 'status-waiting',   // 待接单
        2: 'status-progress',  // 待取货
        3: 'status-progress',  // 配送中
        4: 'status-completed', // 已完成
        5: 'status-canceled'   // 已取消
      }
      return statusMap[status] || ''
    },
    
    // 订单状态文本
    orderStatusText(status) {
      const statusMap = {
        1: '待接单',
        2: '待取货',
        3: '配送中',
        4: '已完成',
        5: '已取消'
      }
      return statusMap[status] || '未知状态'
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