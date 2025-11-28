<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-back" @click="navBack">&lt;</text>
        <text class="nav-title">确认支付</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-section">
      <view class="section-title">订单信息</view>
      <view class="order-info">
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ orderInfo.id || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">餐厅</text>
          <text class="info-value">{{ orderInfo.restaurantName || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">订单时间</text>
          <text class="info-value">{{ formatTime(orderInfo.createTime) }}</text>
        </view>
      </view>
    </view>

    <!-- 收货信息 -->
    <view class="address-section">
      <view class="section-title">收货信息</view>
      <view class="address-info" v-if="orderInfo.address && (orderInfo.address.name || orderInfo.address.phone || orderInfo.address.address)">
        <view class="address-top">
          <text class="address-name">{{ orderInfo.address.name || '-' }}</text>
          <text class="address-phone">{{ orderInfo.address.phone || '-' }}</text>
        </view>
        <text class="address-detail">{{ orderInfo.address.address || '-' }}</text>
      </view>
      <view v-else class="empty-info">暂无收货信息</view>
    </view>

    <!-- 支付方式 -->
    <view class="payment-section">
      <view class="section-title">支付方式</view>
      <view class="payment-options">
        <view class="payment-option" 
              v-for="option in paymentOptions" 
              :key="option.id" 
              @click="selectPayment(option.id)"
              :class="{ 'selected': selectedPayment === option.id }">
          <view class="option-left">
            <text class="option-icon">{{ option.icon }}</text>
            <text class="option-name">{{ option.name }}</text>
          </view>
          <view class="option-right">
            <text class="option-check" v-if="selectedPayment === option.id">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="remark-section" v-if="orderInfo.remark">
      <view class="section-title">订单备注</view>
      <view class="remark-content">{{ orderInfo.remark }}</view>
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="price-item">
        <text class="price-label">商品金额</text>
        <text class="price-value">¥{{ (orderInfo.itemsTotal || 0).toFixed(2) }}</text>
      </view>
      <view class="price-item">
        <text class="price-label">配送费</text>
        <text class="price-value">¥{{ (orderInfo.deliveryFee || 0).toFixed(2) }}</text>
      </view>
      <view class="price-item" v-if="orderInfo.discountAmount > 0">
        <text class="price-label">优惠</text>
        <text class="price-value discount">-¥{{ (orderInfo.discountAmount || 0).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 底部支付栏 -->
    <view class="bottom-bar">
      <view class="total-info">
        <text class="total-label">实付款：</text>
        <text class="total-price">¥{{ (orderInfo.totalAmount || 0).toFixed(2) }}</text>
      </view>
      <view class="pay-btn" @click="handlePayment" :disabled="isProcessing">
        <text>{{ isProcessing ? '处理中...' : '立即支付' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      orderInfo: {
        id: '',
        restaurantName: '',
        restaurant: {},
        items: [],
        address: {
          name: '',
          phone: '',
          address: ''
        },
        deliveryTime: '尽快送达',
        remark: '',
        itemsTotal: 0,
        deliveryFee: 0,
        discountAmount: 0,
        totalAmount: 0,
        status: 'pending',
        createTime: new Date().toISOString()
      },
      selectedPayment: 'wechat', // 默认选择微信支付
      isProcessing: false,
      paymentOptions: [
        { id: 'wechat', name: '微信支付', icon: '💳' },
        { id: 'alipay', name: '支付宝', icon: '💸' },
        { id: 'cash', name: '到店付款', icon: '💰' }
      ]
    };
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    
    // 解析URL参数
    console.log('页面参数:', options);
    
    // 从本地存储获取订单数据
    const savedOrder = uni.getStorageSync('currentOrder');
    if (savedOrder) {
      // 检查savedOrder的id是否与options.orderId匹配，如果没有options.orderId则直接使用
      if (!options.orderId || savedOrder.id === options.orderId) {
        this.orderInfo = {
          ...this.orderInfo,
          ...savedOrder
        };
        console.log('从本地存储加载到订单信息:', this.orderInfo);
      }
    }
    
    // 如果本地存储没有订单信息，或者id不匹配，尝试从URL参数构建订单信息
    if (!this.orderInfo.id || !this.orderInfo.restaurantName) {
      // 从参数构建基本信息
      const basicOrderInfo = {
        id: options.orderId || '',
        totalAmount: parseFloat(options.amount) || 0,
        restaurantName: decodeURIComponent(options.title || ''),
        createTime: new Date().toISOString()
      };
      
      // 更新订单信息
      this.orderInfo = {
        ...this.orderInfo,
        ...basicOrderInfo
      };
      
      console.log('从URL参数构建订单信息:', this.orderInfo);
    }
    
    console.log('最终订单信息:', this.orderInfo);
  },
  methods: {
    // 返回上一页
    navBack() {
      uni.navigateBack();
    },
    
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    // 选择支付方式
    selectPayment(paymentId) {
      this.selectedPayment = paymentId;
      console.log('选择支付方式:', paymentId);
    },
    
    // 处理支付
    handlePayment() {
      if (this.isProcessing) return;
      
      this.isProcessing = true;
      
      // 模拟支付过程
      setTimeout(() => {
        if (this.selectedPayment === 'cash') {
          // 到店付款，直接成功
          this.paymentSuccess();
        } else {
          // 线上支付，模拟密码输入
          this.showPaymentDialog();
        }
        this.isProcessing = false;
      }, 500);
    },
    
    // 显示支付确认弹窗
    showPaymentDialog() {
      // 模拟弹窗，实际应该调用支付SDK或自定义密码输入组件
      uni.showModal({
        title: '支付确认',
        content: `确认使用${this.getSelectedPaymentName()}支付¥${(this.orderInfo.totalAmount || 0).toFixed(2)}吗？`,
        success: (res) => {
          if (res.confirm) {
            // 模拟支付处理
            setTimeout(() => {
              this.paymentSuccess();
            }, 1000);
          }
        }
      });
    },
    
    // 获取选中的支付方式名称
    getSelectedPaymentName() {
      const payment = this.paymentOptions.find(option => option.id === this.selectedPayment);
      return payment ? payment.name : '';
    },
    
    // 支付成功处理
    paymentSuccess() {
      // 模拟更新订单状态
      this.orderInfo.status = 'paid';
      this.orderInfo.paymentTime = new Date().toISOString();
      this.orderInfo.paymentMethod = this.selectedPayment;
      
      // 保存更新后的订单信息
      uni.setStorageSync('currentOrder', this.orderInfo);
      
      // 显示成功提示
      uni.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000
      });
      
      // 延迟跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        });
      }, 2000);
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
}

/* 导航栏 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  z-index: 999;
}

.nav-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.nav-back {
  font-size: 36rpx;
  color: #FFFFFF;
  width: 40rpx;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
  flex: 1;
  text-align: center;
  margin: 0 40rpx;
}

.nav-right {
  width: 40rpx;
}

/* 订单信息 */
.order-section,
.address-section,
.payment-section,
.remark-section,
.price-section {
  margin-top: 20rpx;
  background-color: #FFFFFF;
  padding: 20rpx;
}

.order-section {
  margin-top: calc(var(--status-bar-height, 0px) + 44px);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.order-info,
.address-info,
.payment-options {
  border-top: 1px solid #F0F0F0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid #F0F0F0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666666;
}

.info-value {
  font-size: 28rpx;
  color: #333333;
  max-width: 60%;
  text-align: right;
  word-break: break-all;
}

/* 收货信息 */
.address-info {
  padding: 20rpx 0;
}

.address-top {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.address-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 20rpx;
}

.address-phone {
  font-size: 28rpx;
  color: #666666;
}

.address-detail {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.4;
}

.empty-info {
  text-align: center;
  padding: 40rpx 0;
  color: #999999;
  font-size: 28rpx;
}

/* 支付方式 */
.payment-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #F0F0F0;
}

.payment-option:last-child {
  border-bottom: none;
}

.payment-option.selected {
  background-color: #F9FFF9;
}

.option-left {
  display: flex;
  align-items: center;
}

.option-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.option-name {
  font-size: 32rpx;
  color: #333333;
}

.option-check {
  font-size: 36rpx;
  color: #4CAF50;
  font-weight: bold;
}

/* 订单备注 */
.remark-content {
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.4;
}

/* 价格明细 */
.price-item {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
}

.price-label {
  font-size: 28rpx;
  color: #666666;
}

.price-value {
  font-size: 28rpx;
  color: #333333;
}

.discount {
  color: #FF6B6B;
}

/* 底部支付栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #FFFFFF;
  border-top: 1px solid #E0E0E0;
}

.total-info {
  display: flex;
  align-items: center;
}

.total-label {
  font-size: 28rpx;
  color: #666666;
}

.total-price {
  font-size: 36rpx;
  color: #4CAF50;
  font-weight: bold;
}

.pay-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
}

.pay-btn:disabled {
  background-color: #CCCCCC;
  opacity: 0.7;
}
</style>
