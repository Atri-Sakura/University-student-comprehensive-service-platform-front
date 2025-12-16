<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-button" @click="goBack">
        
      </view>
      <view class="nav-title">交易详情</view>
      <view class="nav-right"></view>
    </view>
    
    <!-- 交易概览 -->
    <view class="transaction-overview">
      <view class="status-badge" :class="{ 'success': orderData.status === '交易成功' }">
        {{ orderData.status }}
      </view>
      
      <view class="overview-grid">
        <view class="overview-item">
          <text class="item-label">订单号</text>
          <text class="item-value">{{ orderData.orderId }}</text>
        </view>
        <view class="overview-item">
          <text class="item-label">交易时间</text>
          <text class="item-value">{{ orderData.transactionTime }}</text>
        </view>
        <view class="overview-item">
          <text class="item-label">支付方式</text>
          <text class="item-value">{{ orderData.paymentMethod }}</text>
        </view>
        <view class="overview-item">
          <text class="item-label">交易类型</text>
          <text class="item-value">{{ orderData.transactionType }}</text>
        </view>
      </view>
    </view>
    
    <!-- 商品明细 -->
    <view class="product-details">
      <view class="section-header">
        <text class="section-title">商品明细</text>
        <text class="section-count">{{ orderData.products.length }}件商品</text>
      </view>
      
      <view class="product-list">
        <view class="product-item" v-for="(product, index) in orderData.products" :key="index">
          <view class="product-info">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-spec">{{ product.spec }}</text>
          </view>
          <view class="product-quantity">x{{ product.quantity }}</view>
          <view class="product-price">¥{{ product.price.toFixed(2) }}</view>
        </view>
      </view>
      
      <view class="product-actions">
        <view class="action-btn" @click="viewMeal">查看套餐</view>
        <view class="action-btn note" @click="viewNotes">备注</view>
      </view>
    </view>
    
    <!-- 金额汇总 -->
    <view class="amount-summary">
      <view class="section-header">
        <text class="section-title">金额汇总</text>
      </view>
      
      <view class="summary-list">
        <view class="summary-item">
          <text class="summary-label">商品金额</text>
          <text class="summary-value">¥{{ orderData.productAmount.toFixed(2) }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">配送费</text>
          <text class="summary-value">¥{{ orderData.deliveryFee.toFixed(2) }}</text>
        </view>
        <view class="summary-item" v-if="orderData.discount > 0">
          <text class="summary-label">优惠抵扣</text>
          <text class="summary-value discount">-¥{{ orderData.discount.toFixed(2) }}</text>
        </view>
        <view class="summary-item total">
          <text class="summary-label total">实付金额</text>
          <text class="summary-value total">¥{{ orderData.actualPayment.toFixed(2) }}</text>
        </view>
      </view>
    </view>
    
    <!-- 底部操作按钮 -->
    <view class="bottom-actions">
      <button class="action-button print" @click="printReceipt">打印小票</button>
      <button class="action-button refund" @click="handleRefund">退款处理</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'OrderDetailPage',
  data() {
    return {
      orderData: {
        status: '交易成功',
        orderId: '#20231115001',
        transactionTime: '2023-11-15 11:25',
        paymentMethod: '微信支付',
        transactionType: '线上订单',
        productAmount: 68.50,
        deliveryFee: 5.00,
        discount: 5.00,
        actualPayment: 68.50,
        products: [
          {
            name: '招牌汉堡套餐',
            spec: '加芝士 | 不要洋葱',
            quantity: 1,
            price: 35.00
          },
          {
            name: '炸鸡块',
            spec: '原味',
            quantity: 1,
            price: 20.00
          },
          {
            name: '可乐',
            spec: '中杯',
            quantity: 1,
            price: 15.50
          }
        ]
      }
    };
  },
  onLoad(options) {
    // 如果有订单ID参数，可以根据ID加载订单数据
    if (options.orderId) {
      console.log('加载订单ID:', options.orderId);
      // 这里可以调用API获取订单详情
      // this.loadOrderDetail(options.orderId);
    }
  },
  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length <= 1) {
        // 没有页面栈，检查是否有token
        const token = uni.getStorageSync('token');
        if (token) {
          // 有token，跳转到首页
          uni.switchTab({
            url: '/pages/index/index'
          });
        } else {
          // 没有token，跳转到登录页
          uni.redirectTo({
            url: '/pages/login/login',
            fail: () => {
              uni.reLaunch({
                url: '/pages/login/login'
              });
            }
          });
        }
      } else {
        uni.navigateBack();
      }
    },
    viewMeal() {
      uni.showToast({
        title: '查看套餐详情',
        icon: 'none'
      });
    },
    viewNotes() {
      uni.showToast({
        title: '查看备注信息',
        icon: 'none'
      });
    },
    printReceipt() {
      uni.showModal({
        title: '打印小票',
        content: '是否确认打印该订单小票？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '小票打印中...',
              icon: 'none'
            });
            // 模拟打印操作
            setTimeout(() => {
              uni.showToast({
                title: '打印成功',
                icon: 'success'
              });
            }, 1500);
          }
        }
      });
    },
    handleRefund() {
      uni.showModal({
        title: '退款处理',
        content: '是否确认进行退款处理？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: '/pages/finance/refund-process?orderId=' + this.orderData.orderId
            });
          }
        }
      });
    },
    loadOrderDetail(orderId) {
      // 模拟API调用获取订单详情
      console.log('加载订单详情:', orderId);
      // 实际项目中这里会调用后端API
    }
  }
};
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 30rpx;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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
  color: #333;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.nav-right {
  width: 60rpx;
}

/* 交易概览 */
.transaction-overview {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
  position: relative;
}

.status-badge {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  color: #fff;
}

.status-badge.success {
  background-color: #52c41a;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-top: 20rpx;
}

.overview-item {
  display: flex;
  flex-direction: column;
}

.item-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.item-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 商品明细 */
.product-details {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 26rpx;
  color: #666;
}

.product-list {
  margin-bottom: 24rpx;
}

.product-item {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.product-info {
  flex: 1;
}

.product-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.product-spec {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.product-quantity {
  font-size: 26rpx;
  color: #666;
  margin: 0 20rpx;
}

.product-price {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.product-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  font-size: 24rpx;
  color: #4A90E2;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  background-color: #f0f7ff;
}

.action-btn.note {
  color: #ff6b35;
  background-color: #fff0e6;
}

/* 金额汇总 */
.amount-summary {
  background-color: #fff;
  margin-bottom: 100rpx;
  padding: 30rpx;
}

.summary-list {
  margin-top: 10rpx;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.summary-label {
  font-size: 28rpx;
  color: #666;
}

.summary-value {
  font-size: 28rpx;
  color: #333;
}

.summary-value.discount {
  color: #ff4d4f;
}

.summary-item.total {
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f0f0f0;
}

.summary-label.total {
  font-weight: bold;
  color: #333;
}

.summary-value.total {
  font-weight: bold;
  color: #ff4d4f;
  font-size: 32rpx;
}

/* 底部操作按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  padding: 24rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-button {
  flex: 1;
  margin: 0 10rpx;
  padding: 20rpx 0;
  border-radius: 24rpx;
  font-size: 28rpx;
  height: auto;
  line-height: 1.5;
}

.action-button.print {
  background-color: #fff;
  color: #4A90E2;
  border: 2rpx solid #4A90E2;
}

.action-button.refund {
  background-color: #4A90E2;
  color: #fff;
  border: none;
}
</style>