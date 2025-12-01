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
import orderApi from '@/api/order.js';

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
  onLoad() {
    this.loadOrders();
  },
  onShow() {
    // 每次显示页面时刷新订单列表
    this.loadOrders();
  },
  methods: {
    // 加载订单列表
    async loadOrders() {
      this.loading = true;
      try {
        // 调用订单API，不传orderType参数或传数字类型
        // 根据后端错误信息，orderType应该是Long类型，不是字符串
        const res = await orderApi.getOrderList({
          // 暂时不传orderType，获取所有订单，或者后端需要确认外卖订单的类型编码
        });
        
        console.log('=== 外卖订单列表API响应 ===');
        console.log('完整响应:', res);
        console.log('res.rows:', res.rows);
        console.log('res.data:', res.data);
        
        if (res && res.code === 200) {
          // 处理订单数据，兼容不同的数据结构
          let orderData = [];
          
          // 优先检查 res.rows（根据图片显示的数据结构）
          if (Array.isArray(res.rows)) {
            orderData = res.rows;
            console.log('从 res.rows 获取订单数据');
          } else if (Array.isArray(res.data)) {
            orderData = res.data;
            console.log('从 res.data 获取订单数据');
          } else if (res.data && Array.isArray(res.data.rows)) {
            orderData = res.data.rows;
            console.log('从 res.data.rows 获取订单数据');
          } else if (res.data && Array.isArray(res.data.list)) {
            orderData = res.data.list;
            console.log('从 res.data.list 获取订单数据');
          } else if (res.data && Array.isArray(res.data.records)) {
            orderData = res.data.records;
            console.log('从 res.data.records 获取订单数据');
          }
          
          console.log('提取的订单数据:', orderData);
          console.log('订单数量:', orderData.length);
          
          // 格式化订单数据以适配页面显示
          this.orders = orderData.map(order => {
            console.log('处理订单:', order);
            return {
              id: order.orderId || order.id || order.orderBaseId,
              foodName: order.orderName || order.goodsName || order.merchantName || '外卖订单',
              orderTime: this.formatTime(order.createTime || order.orderTime),
              orderId: order.orderNo || order.orderId || order.id,
              status: this.formatStatus(order.orderStatus || order.status),
              price: order.totalAmount || order.payAmount || order.amount || '0.00',
              imageUrl: order.imageUrl || order.goodsImage || order.merchantImage || '/static/food-default.jpg'
            };
          });
          
          console.log('格式化后的订单列表:', this.orders);
        } else {
          console.error('获取订单失败，响应码:', res?.code, '消息:', res?.message);
          uni.showToast({
            title: res?.message || '获取订单失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('=== 加载订单异常 ===');
        console.error('错误详情:', error);
        console.error('错误堆栈:', error.stack);
        uni.showToast({
          title: '加载订单失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    // 格式化订单状态
    formatStatus(status) {
      const statusMap = {
        'PENDING': '待支付',
        'PAID': '已支付',
        'PREPARING': '商家准备中',
        'DELIVERING': '配送中',
        'COMPLETED': '已完成',
        'CANCELLED': '已取消',
        'REFUNDED': '已退款'
      };
      return statusMap[status] || status || '未知状态';
    },
    
    goToShopping() {
      console.log('去下单');
      // 跳转到外卖页面
      uni.navigateTo({ url: '/pages/food/food' });
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