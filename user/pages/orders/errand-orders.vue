<template>
  <view class="errand-orders-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="navbar-title">我发布的跑腿</view>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 状态筛选标签 -->
    <view class="status-tabs">
      <view class="tab-item" :class="{ 'active': currentTab === 0 }" @click="changeTab(0)">全部</view>
      <view class="tab-item" :class="{ 'active': currentTab === 1 }" @click="changeTab(1)">未接单</view>
      <view class="tab-item" :class="{ 'active': currentTab === 2 }" @click="changeTab(2)">进行中</view>
      <view class="tab-item" :class="{ 'active': currentTab === 3 }" @click="changeTab(3)">已完成</view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-item" v-for="(order, index) in getFilteredOrders()" :key="index">
        <!-- 订单标题和状态 -->
    <view class="order-main-info">
      <view class="order-title">{{ order.pickAddress || '跑腿订单' }}</view>
      <view class="status-container">
        <view class="order-status" :class="statusClass(order.orderStatus)">{{ orderStatusText(order.orderStatus) }}</view>
        <view v-if="order.payStatus === 0" class="unpaid-tag">未付费</view>
      </view>
    </view>
        
        <!-- 配送地点 -->
        <view class="delivery-location">
          <text class="location-icon">📍</text>
          <text class="location-text">{{ order.pickAddress }}</text>
        </view>
        
        <!-- 价格和时间 -->
        <view class="price-time-row">
          <view class="order-price">¥{{ order.totalAmount }}</view>
          <view class="order-time">{{ order.createTime }}</view>
        </view>
        
        <!-- 未付费标签已移到订单状态旁边 -->
        
        <!-- 超市代购商品列表 -->
        <view v-if="order.category === 'shopping' && order.products && order.products.length > 0" class="product-list">
          <view class="product-list-title">购买商品：</view>
          <view class="product-item" v-for="(product, pIndex) in order.products" :key="pIndex">
            <view class="product-name">{{ product.name }}</view>
            <view class="product-price">¥{{ product.price.toFixed(2) }}</view>
          </view>
          <view class="product-total">
            <view class="product-total-text">商品总额：</view>
            <view class="product-total-price">¥{{ order.productTotal.toFixed(2) }}</view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="order-actions">
          <button 
            class="action-button" 
            :class="order.actionTypes && order.actionTypes[actionIndex] || 'default'"
            v-for="(action, actionIndex) in order.actions" 
            :key="actionIndex" 
            @click="handleOrderAction(order, action)"
          >
            {{ action }}
          </button>
        </view>
      </view>
      
      <!-- 空订单提示 -->
      <view class="empty-order" v-if="orders.length === 0">
        <view class="empty-icon">🏃</view>
        <view class="empty-text">暂无跑腿订单</view>
        <button class="go-order" @click="goToOrder">去下单</button>
      </view>
    </view>
    
    <!-- 自定义底部导航栏 -->
    <custom-tabbar :current="3"></custom-tabbar>
  </view>
</template>

<style scoped>
/* 为底部导航栏留出空间 */
.order-list {
  padding-bottom: 120rpx;
}
</style>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
import api from '@/api/index.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      currentTab: 0, // 0:全部, 1:未接单, 2:进行中, 3:已完成
      orders: [],
      loading: false
    };
  },
  mounted() {
    // 页面加载时获取跑腿订单
    this.getErrandOrders();
  },
  onPullDownRefresh() {
    // 下拉刷新时重新获取数据
    this.getErrandOrders();
  },
  methods: {
    // 获取跑腿订单列表
    async getErrandOrders() {
      try {
        this.loading = true;
        // 显示加载提示
        uni.showLoading({ title: '加载中...' });
        
        // 调用API获取所有订单，然后筛选出跑腿订单(order_type=2)
        const res = await api.order.getOrderList();
        
        if (res && res.code === 200) {
          // 获取订单数据数组
          const orderList = res.rows || res.data || [];
          // 筛选出跑腿订单(orderType=2)
          this.orders = orderList.filter(item => item.orderType === 2);
        } else {
          console.warn('API返回状态异常:', res);
          uni.showToast({ 
            title: res?.msg || res?.message || '获取订单失败', 
            icon: 'none' 
          });
        }
      } catch (error) {
        console.error('获取跑腿订单失败:', error);
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
    
    changeTab(index) {
      this.currentTab = index;
      // 这里可以根据选中的标签筛选订单
    },
    
    // 获取筛选后的订单列表
    getFilteredOrders() {
      if (this.currentTab === 0) {
        return this.orders;
      } else if (this.currentTab === 1) {
        return this.orders.filter(order => order.orderStatus === 1); // 未接单：待接单
      } else if (this.currentTab === 2) {
        return this.orders.filter(order => order.orderStatus === 2 || order.orderStatus === 3); // 进行中：待取货、配送中
      } else if (this.currentTab === 3) {
        return this.orders.filter(order => order.orderStatus === 4 || order.orderStatus === 5); // 已完成：已完成、已取消
      }
      return this.orders;
    },
    statusClass(status) {
      const statusMap = {
        1: 'status-waiting',   // 待接单
        2: 'status-progress',  // 待取货
        3: 'status-progress',  // 配送中
        4: 'status-completed', // 已完成
        5: 'status-canceled'   // 已取消
      };
      return statusMap[status] || '';
    },
    // 订单状态文本
    orderStatusText(status) {
      const statusMap = {
        1: '待接单',
        2: '待取货',
        3: '配送中',
        4: '已完成',
        5: '已取消'
      };
      return statusMap[status] || '未知状态';
    },
    handleOrderAction(order, action) {
      console.log('订单操作:', order.id, action);
      // 这里可以添加订单操作的逻辑
      switch (action) {
        case '取消订单':
          this.cancelOrder(order.id);
          break;
        case '再来一单':
          this.repeatOrder(order.id);
          break;
        case '联系骑手':
        case '联系跑腿员':
          this.contactRider(order.id);
          break;
        case '确认收货':
          this.confirmDelivery(order.id);
          break;
        case '修改订单':
          this.editOrder(order.id);
          break;
        case '查看位置':
          this.viewLocation(order.id);
          break;
        case '联系客服':
          this.contactCustomerService();
          break;
        case '查看详情':
          this.viewOrderDetail(order.id);
          break;
        case '评价跑腿员':
          this.rateDelivery(order.id);
          break;
        case '支付商品费':
          this.payProductFee(order.id);
          break;
        default:
          break;
      }
    },
    cancelOrder(orderId) {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个订单吗？',
        success: (res) => {
          if (res.confirm) {
            console.log('取消订单:', orderId);
            // 这里可以添加取消订单的API调用
          }
        }
      });
    },
    repeatOrder(orderId) {
      console.log('再来一单:', orderId);
      // 这里可以跳转到下单页面，预填之前的信息
    },
    contactRider(orderId) {
      console.log('联系骑手:', orderId);
      // 这里可以跳转到聊天页面或拨打电话
    },
    viewLocation(orderId) {
      console.log('查看位置:', orderId);
      // 跳转到配送员位置页面，并传递订单ID
      uni.navigateTo({
        url: '/pages/orders/delivery-location?orderId=' + orderId
      });
    },
    confirmDelivery(orderId) {
      uni.showModal({
        title: '确认收货',
        content: '确认您已收到商品？',
        success: (res) => {
          if (res.confirm) {
            console.log('确认收货:', orderId);
            // 这里可以添加确认收货的API调用
          }
        }
      });
    },
    editOrder(orderId) {
      console.log('修改订单:', orderId);
      // 跳转到订单编辑页面，并传递订单ID
      uni.navigateTo({
        url: '/pages/orders/errand-order-edit?orderId=' + orderId
      });
    },
    // 联系客服
    contactCustomerService() {
      console.log('联系客服');
      // 跳转到客服服务页面
      uni.navigateTo({
        url: '/pages/mine/customer-service'
      });
    },
    // 查看订单详情
    viewOrderDetail(orderId) {
      console.log('查看订单详情:', orderId);
      // 跳转到订单详情页面
      uni.navigateTo({
        url: '/pages/orders/errand-order-detail?orderId=' + orderId
      });
    },
    goToOrder() {
      console.log('去下单');
      // 这里可以跳转到跑腿下单页面
    },
    goBack() {
      uni.navigateBack();
    },
    // 评价跑腿员
    rateDelivery(orderId) {
      console.log('评价跑腿员:', orderId);
      // 跳转到评价跑腿员页面，并传递订单ID
      uni.navigateTo({
        url: '/pages/orders/rate-delivery?orderId=' + orderId
      });
    },
    // 支付商品费
    payProductFee(orderId) {
      console.log('支付商品费:', orderId);
      // 跳转到支付商品费页面，并传递订单ID
      uni.navigateTo({
        url: '/pages/orders/pay-product-fee?orderId=' + orderId
      });
    }
  }
};
</script>

<style scoped>
.errand-orders-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
  padding-top: 120rpx; /* 顶部内边距，避免与顶部固定元素重叠 */
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
  margin: 0;
  border: none;
  box-shadow: none;
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

/* 订单列表样式 */
.status-tabs {
  display: flex;
  background-color: white;
  padding: 0 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin: 0;
  padding-top: 0;
  box-sizing: border-box;
  width: 100%;
  position: fixed;
  top: 88rpx; /* 略微覆盖导航栏，确保没有间隙 */
  left: 0;
  right: 0;
  z-index: 9;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 5rpx;
  font-size: 30rpx;
  color: #666;
  position: relative;
  box-sizing: border-box;
}

.tab-item.active {
  color: #5DCDFF;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background-color: #5DCDFF;
  border-radius: 3rpx;
}

.order-list {
    padding: 0 10px;
    background-color: #f5f5f5;
    padding-bottom: 80px; /* 为底部导航栏留出空间 */
  }

.order-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-top: 0;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 订单标题和状态 */
.order-main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 订单状态样式 */
  .order-status {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-waiting {
    background-color: #e6f7ff;
    color: #1890ff;
  }

  .status-progress {
    background-color: #fff7e6;
    color: #fa8c16;
  }

  .status-completed {
    background-color: #f6ffed;
    color: #52c41a;
  }

  .status-canceled {
    color: #FF4444;
  }

/* 配送地点 */
.delivery-location {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.location-icon {
  margin-right: 6px;
  font-size: 14px;
}

.location-text {
  font-size: 14px;
  color: #666;
  flex: 1;
}

/* 价格和时间 */
.price-time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
}

.order-time {
  font-size: 12px;
  color: #999;
}

/* 订单状态容器 */
.status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 未付费标签 */
.unpaid-tag {
  background-color: #ff4d4f;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
}

/* 操作按钮 */
.order-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.action-button {
  flex: 1;
  min-width: 60px;
  max-width: calc(50% - 6px);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  line-height: 1.3;
  border: none;
  background-color: #f5f5f5;
  color: #666;
  text-align: center;
  white-space: nowrap;
  box-sizing: border-box;
}

.action-button.primary {
  background-color: #5DCDFF;
  color: white;
}

/* 超市代购商品列表 */
.product-list {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.product-list-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.product-name {
  font-size: 13px;
  color: #333;
}

.product-price {
  font-size: 13px;
  color: #666;
}

.product-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
}

.product-total-text {
  font-size: 13px;
  color: #666;
}

.product-total-price {
  font-size: 13px;
  color: #ff4d4f;
  font-weight: 500;
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

.go-order {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
}
</style>