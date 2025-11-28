<template>
  <view class="pay-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="navbar-title">支付商品费用</view>
      <view class="navbar-right"></view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info-card">
      <view class="info-item">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ orderInfo.orderNo }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">下单时间</text>
        <text class="info-value">{{ orderInfo.orderTime }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="product-list-card">
      <view class="product-item" v-for="(product, index) in products" :key="index">
        <text class="product-name">{{ product.name }}</text>
        <text class="product-price">{{ product.price }}</text>
      </view>
    </view>

    <!-- 费用明细 -->
    <view class="fee-details-card">
      <view class="fee-item">
        <text class="fee-label">商品金额</text>
        <text class="fee-value">{{ feeDetails.productTotal }}</text>
      </view>
      <view class="fee-item">
        <text class="fee-label">平台服务费</text>
        <text class="fee-value">{{ feeDetails.serviceFee }}</text>
      </view>
      <view class="fee-item total">
        <text class="fee-label total-label">支付总额</text>
        <text class="fee-value total-value">{{ feeDetails.totalAmount }}</text>
      </view>
    </view>

    <!-- 支付方式选择 -->
    <view class="payment-methods-card">
      <view class="section-title">选择支付方式</view>
      <view 
        class="payment-option" 
        v-for="(method, index) in paymentMethods" 
        :key="index"
        @click="selectPaymentMethod(index)"
      >
        <view class="payment-info">
          <text class="payment-icon">{{ method.icon }}</text>
          <text class="payment-name">{{ method.name }}</text>
        </view>
        <view class="payment-select" :class="{ 'selected': selectedPaymentIndex === index }">
          <text class="check-icon" v-if="selectedPaymentIndex === index">✓</text>
        </view>
      </view>
    </view>

    <!-- 确认支付按钮 -->
    <view class="confirm-payment-container">
      <button class="confirm-payment-btn" @click="confirmPayment">
        确认支付 {{ feeDetails.totalAmount }}
      </button>
    </view>

    <!-- 底部安全提示 -->
    <view class="security-info">
      <text class="security-text">安全支付 | 支付协议 | 隐私政策</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: '',
      orderInfo: {
        orderNo: 'DD20230517001',
        orderTime: '今天 13:30'
      },
      products: [
        { name: '薯片（原味）', price: '¥12.50' },
        { name: '可乐（500ml）', price: '¥4.00' },
        { name: '巧克力饼干', price: '¥8.50' },
        { name: '矿泉水', price: '¥2.00' }
      ],
      feeDetails: {
        productTotal: '¥27.00',
        serviceFee: '¥1.00',
        totalAmount: '¥28.00'
      },
      paymentMethods: [
        { name: '微信支付', icon: '💬' },
        { name: '支付宝', icon: '💰' },
        { name: '银行卡支付', icon: '💳' }
      ],
      selectedPaymentIndex: 0 // 默认选择微信支付
    };
  },
  onLoad(options) {
    // 接收订单ID参数
    if (options.orderId) {
      this.orderId = options.orderId;
      console.log('订单ID:', this.orderId);
      // 这里可以根据订单ID从服务器获取真实数据
      this.loadOrderData();
    }
  },
  methods: {
    // 加载订单数据
    loadOrderData() {
      // 实际项目中，这里应该调用API获取订单数据
      console.log('正在加载订单支付数据...');
      // 模拟API请求延迟
      setTimeout(() => {
        // 这里可以根据实际情况更新订单数据
        // 目前使用默认的模拟数据
      }, 300);
    },

    // 返回上一页
    goBack() {
      uni.navigateBack();
    },

    // 选择支付方式
    selectPaymentMethod(index) {
      this.selectedPaymentIndex = index;
      console.log('选择支付方式:', this.paymentMethods[index].name);
    },

    // 确认支付
    confirmPayment() {
      const selectedMethod = this.paymentMethods[this.selectedPaymentIndex];
      console.log('确认支付:', this.feeDetails.totalAmount, '使用', selectedMethod.name);
      
      // 模拟支付过程
      uni.showLoading({
        title: '支付处理中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        // 模拟支付成功
        uni.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        });
        
        // 支付成功后返回订单列表页
        setTimeout(() => {
          uni.navigateBack({
            delta: 1
          });
        }, 2000);
      }, 1500);
    }
  }
};
</script>

<style scoped>
.pay-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-top: 20rpx; /* 为固定导航栏留出空间 */
  padding-bottom: 180rpx; /* 为底部按钮和提示留出空间 */
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
.order-info-card,
.product-list-card,
.fee-details-card,
.payment-methods-card {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
}

/* 订单信息 */
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
  font-weight: 500;
}

/* 商品列表 */
.product-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.product-item:last-child {
  margin-bottom: 0;
}

.product-name {
  font-size: 28rpx;
  color: #333;
}

.product-price {
  font-size: 28rpx;
  color: #333;
}

/* 费用明细 */
.fee-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.fee-item:last-child {
  margin-bottom: 0;
}

.fee-label {
  font-size: 28rpx;
  color: #666;
}

.fee-value {
  font-size: 28rpx;
  color: #333;
}

.fee-item.total {
  margin-top: 10rpx;
  padding-top: 20rpx;
  border-top: 1px solid #f0f0f0;
}

.total-label {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.total-value {
  font-size: 32rpx;
  color: #ff4d4f;
  font-weight: 600;
}

/* 支付方式 */
.section-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 25rpx;
}

.payment-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.payment-option:last-child {
  border-bottom: none;
}

.payment-info {
  display: flex;
  align-items: center;
}

.payment-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.payment-name {
  font-size: 28rpx;
  color: #333;
}

.payment-select {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.payment-select.selected {
  background-color: #5DCDFF;
  border-color: #5DCDFF;
}

.check-icon {
  color: white;
  font-size: 24rpx;
  font-weight: bold;
}

/* 确认支付按钮 */
.confirm-payment-container {
  position: fixed;
  bottom: 100rpx;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.confirm-payment-btn {
  width: 100%;
  height: 90rpx;
  background-color: #5DCDFF;
  color: white;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 45rpx;
  border: none;
  line-height: 90rpx;
}

.confirm-payment-btn::after {
  border: none;
}

/* 安全提示 */
.security-info {
  position: fixed;
  bottom: 40rpx;
  left: 0;
  right: 0;
  text-align: center;
}

.security-text {
  font-size: 24rpx;
  color: #999;
}
</style>