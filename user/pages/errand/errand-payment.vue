<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="nav-title">确认订单</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y :style="{ top: navHeight + 'px' }">
      <!-- 跑腿服务信息 -->
      <view class="goods-card">
        <view class="card-title">
          <text class="title-text">🚀 跑腿服务</text>
        </view>
        <view class="errand-info">
          <view class="errand-detail">
            <view class="errand-item">
              <text class="item-label">服务类型：</text>
              <text class="item-value">{{ orderInfo.serviceType || '其他' }}</text>
            </view>
            <view v-if="orderInfo.remark" class="errand-item">
              <text class="item-label">备注：</text>
              <text class="item-value">{{ orderInfo.remark }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 收货信息 -->
      <view class="address-card">
        <view class="card-title">
          <text class="title-text">📦 收货信息</text>
        </view>
        <view class="address-info">
          <view class="errand-item">
            <text class="item-label">联系人：</text>
            <text class="item-value">{{ orderInfo.contactName }}</text>
          </view>
          <view class="errand-item">
            <text class="item-label">联系电话：</text>
            <text class="item-value">{{ orderInfo.contactPhone }}</text>
          </view>
          <view class="errand-item">
            <text class="item-label">取货地点：</text>
            <text class="item-value">{{ orderInfo.pickupLocation }}</text>
          </view>
          <view class="errand-item">
            <text class="item-label">送达地点：</text>
            <text class="item-value">{{ orderInfo.deliveryLocation }}</text>
          </view>
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="payment-card">
        <view class="card-title">
          <text class="title-text">💳 支付方式</text>
        </view>
        <view 
          v-for="(item, index) in paymentMethods" 
          :key="index"
          class="payment-item"
          @click="selectPayment(index)"
        >
          <view class="payment-left">
            <view class="payment-icon-box" :style="{ backgroundColor: item.color + '20', borderColor: item.color }">
              <text class="payment-icon" :style="{ color: item.color }">{{ item.icon }}</text>
            </view>
            <text class="payment-name">{{ item.name }}</text>
          </view>
          <view class="payment-radio" :class="{ active: selectedPayment === index }">
            <view v-if="selectedPayment === index" class="radio-dot"></view>
          </view>
        </view>
      </view>

      <!-- 价格明细 -->
      <view class="price-card">
        <view class="price-item">
          <text class="price-label">配送费</text>
          <text class="price-value">¥{{ orderInfo.deliveryFee || 0 }}</text>
        </view>
        <!-- 帮我买时显示垫付费用 -->
        <view class="price-item" v-if="orderInfo.serviceType === '帮我买'">
          <text class="price-label">垫付费用</text>
          <text class="price-value">¥{{ orderInfo.advancePayment || 0 }}</text>
        </view>
        <view class="price-divider"></view>
        <view class="price-item total">
          <text class="price-label">合计</text>
          <text class="price-value total">¥{{ orderInfo.price }}</text>
        </view>
      </view>

      <!-- 占位空间 -->
      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <view class="total-box">
        <text class="total-label">实付款：</text>
        <text class="total-price">¥{{ orderInfo.price }}</text>
      </view>
      <view class="submit-btn" @click="submitOrder">
        <text class="submit-text">提交订单</text>
      </view>
    </view>
    
    <!-- 支付密码输入框 -->
    <view v-if="showPasswordModal" class="password-modal-mask" @click="closePasswordModal">
      <view class="password-modal-content" @click.stop>
        <view class="password-modal-header">
          <text class="password-modal-title">请输入支付密码</text>
          <text class="password-modal-close" @click="closePasswordModal">✕</text>
        </view>
        
        <view class="password-tips">
          <text class="tips-text">支付密码为6位数字</text>
        </view>
        
        <view class="password-input-box" @click="focusPasswordInput">
          <view 
            v-for="(item, index) in 6" 
            :key="index"
            class="password-dot-box"
            :class="{ active: index === paymentPassword.length }"
          >
            <view v-if="index < paymentPassword.length" class="password-dot">●</view>
          </view>
        </view>
        
        <!-- 隐藏的输入框 -->
        <input 
          ref="passwordInput"
          class="password-input-hidden"
          type="number"
          maxlength="6"
          :value="paymentPassword"
          @input="onPasswordInput"
          @blur="onPasswordBlur"
          :focus="passwordInputFocus"
        />
        
        <view class="password-actions">
          <view class="password-cancel-btn" @click="closePasswordModal">
            <text class="cancel-btn-text">取消</text>
          </view>
          <view class="password-confirm-btn" @click="confirmPaymentPassword">
            <text class="confirm-btn-text">确认支付</text>
          </view>
        </view>
        
        <view class="password-forget">
          <text class="forget-text">忘记密码？</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { PAY_TYPES } from '@/api/config.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      orderInfo: {
        id: '',
        serviceType: '',
        pickupLocation: '',
        deliveryLocation: '',
        contactName: '',
        contactPhone: '',
        remark: '',
        price: '0',
        deliveryFee: 0,
        advancePayment: 0,
        itemsTotal: 0,
        discountAmount: 0,
        totalAmount: 0,
        createTime: new Date().toISOString()
      },
      selectedPayment: 3, // 默认选择面付（索引3，payType=4）
      paymentMethods: [],
      loading: false,
      showPasswordModal: false, // 显示密码输入框
      paymentPassword: '', // 支付密码
      orderNo: '', // 临时保存订单号
      passwordInputFocus: false // 密码输入框聚焦状态
    };
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
    
    // 初始化支付方式列表
    this.paymentMethods = PAY_TYPES.map((item) => ({
      icon: item.icon,
      name: item.label,
      payType: item.value,
      color: this.getPaymentColor(item.value)
    }));

    console.log('跑腿支付页面接收到的options：', options);
    
    // 从URL参数获取订单信息
    if (options && options.orderInfo) {
      try {
        const parsedOrderInfo = JSON.parse(decodeURIComponent(options.orderInfo));
        // 更新orderInfo，确保所有字段都被正确赋值
        this.orderInfo = {
          ...this.orderInfo,
          ...parsedOrderInfo,
          // 确保价格字段为数字类型
          price: parsedOrderInfo.price || '0',
          deliveryFee: parsedOrderInfo.deliveryFee || 0,
          advancePayment: parsedOrderInfo.advancePayment || 0,
          totalAmount: parsedOrderInfo.price || 0
        };
        console.log('解析成功的订单信息：', this.orderInfo);
      } catch (error) {
        console.error('解析订单信息失败：', error);
        // 如果解析失败，尝试从options中直接获取
        this.orderInfo = {
          ...this.orderInfo,
          serviceType: options.serviceType || '',
          pickupLocation: options.pickupLocation || '',
          deliveryLocation: options.deliveryLocation || '',
          contactName: options.contactName || '',
          contactPhone: options.contactPhone || '',
          remark: options.remark || '',
          price: options.price || '0',
          deliveryFee: options.deliveryFee || 0,
          advancePayment: options.advancePayment || 0,
          totalAmount: options.price || '0'
        };
      }
    }
    // 同时尝试从本地存储获取currentOrder，如果URL参数中没有或解析失败
    else {
      const savedOrder = uni.getStorageSync('currentOrder');
      if (savedOrder) {
        this.orderInfo = {
          ...this.orderInfo,
          ...savedOrder
        };
        console.log('从本地存储获取的订单信息：', this.orderInfo);
      }
    }
    
    console.log('最终订单信息：', this.orderInfo);
  },
  methods: {
    // 获取支付方式颜色
    getPaymentColor(payType) {
      const colors = {
        1: '#FF9800', // 余额
        2: '#07C160', // 微信
        3: '#1677FF', // 支付宝
        4: '#FF6B47'  // 面付
      };
      return colors[payType] || '#999999';
    },
    
    // 返回
    goBack() {
      uni.navigateBack();
    },
    
    // 选择支付方式
    selectPayment(index) {
      this.selectedPayment = index;
    },
    
    // 提交订单
    async submitOrder() {
      if (this.loading) return;
      
      const paymentMethod = this.paymentMethods[this.selectedPayment];
      
      uni.showModal({
        title: '确认订单',
        content: `确认使用${paymentMethod.name}支付${this.orderInfo.price}元吗？`,
        confirmText: '确认',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.createOrderRequest();
          }
        }
      });
    },
    
    // 创建订单请求
    async createOrderRequest() {
      try {
        this.loading = true;
        uni.showLoading({
          title: '提交中...'
        });
        
        const paymentMethod = this.paymentMethods[this.selectedPayment];
        
        // TODO: 调用创建跑腿订单的API
        // 模拟创建订单成功
        setTimeout(() => {
          this.loading = false;
          uni.hideLoading();
          
          if (paymentMethod.payType === 4) {
            // 面付，直接跳转到订单详情
            uni.showToast({
              title: '订单创建成功',
              icon: 'success'
            });
            
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            // 其他支付方式，显示支付密码输入框
            this.showPasswordModal = true;
          }
        }, 1500);
        
      } catch (error) {
        console.error('创建订单失败：', error);
        this.loading = false;
        uni.hideLoading();
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 聚焦密码输入框
    focusPasswordInput() {
      this.passwordInputFocus = true;
      setTimeout(() => {
        this.passwordInputFocus = false;
      }, 500);
    },
    
    // 密码输入
    onPasswordInput(e) {
      this.paymentPassword = e.detail.value;
      
      // 输入6位密码后自动提交
      if (this.paymentPassword.length === 6) {
        setTimeout(() => {
          this.confirmPaymentPassword();
        }, 300);
      }
    },
    
    // 密码输入框失焦
    onPasswordBlur() {
      // 可以在这里添加一些处理逻辑
    },
    
    // 确认支付密码
    confirmPaymentPassword() {
      if (this.paymentPassword.length !== 6) {
        uni.showToast({
          title: '请输入6位支付密码',
          icon: 'none'
        });
        return;
      }
      
      try {
        uni.showLoading({
          title: '支付中...'
        });
        
        // TODO: 调用支付API
        // 模拟支付成功
        setTimeout(() => {
          uni.hideLoading();
          this.closePasswordModal();
          
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }, 1500);
        
      } catch (error) {
        console.error('支付失败：', error);
        uni.hideLoading();
        uni.showToast({
          title: '支付失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 关闭密码输入框
    closePasswordModal() {
      this.showPasswordModal = false;
      this.paymentPassword = '';
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 导航栏样式 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  background-color: #ffffff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 30rpx;
}

.nav-left {
  width: 80rpx;
  display: flex;
  align-items: center;
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
  width: 80rpx;
}

/* 内容区域 */
.content {
  width: 100%;
  min-height: calc(100vh - 88rpx);
  background-color: #f5f5f5;
  padding-bottom: 20rpx;
  padding-top: 50rpx;
}

/* 卡片样式 */
.goods-card,
.buyer-card,
.payment-card,
.remark-card,
.price-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  margin: 50rpx 20rpx 0 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  margin-bottom: 20rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

/* 跑腿服务信息样式 */
.errand-info {
  display: flex;
  align-items: flex-start;
}

.errand-detail {
  flex: 1;
}

.errand-item {
  display: flex;
  margin-bottom: 16rpx;
  align-items: flex-start;
}

.errand-item:last-child {
  margin-bottom: 0;
}

.item-label {
  font-size: 28rpx;
  color: #666;
  min-width: 120rpx;
  flex-shrink: 0;
}

.item-value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  word-break: break-word;
}

/* 支付方式样式 */
.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-left {
  display: flex;
  align-items: center;
}

.payment-icon-box {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  border: 2rpx solid transparent;
}

.payment-icon {
  font-size: 32rpx;
}

.payment-name {
  font-size: 30rpx;
  color: #333;
}

.payment-radio {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.payment-radio.active {
  border-color: #1677FF;
  background-color: #1677FF;
}

.radio-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: #fff;
}

/* 价格明细样式 */
.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.price-item:last-child {
  margin-bottom: 0;
}

.price-label {
  font-size: 28rpx;
  color: #666;
}

.price-value {
  font-size: 28rpx;
  color: #333;
}

.price-value.total {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.price-divider {
  height: 2rpx;
  background-color: #f0f0f0;
  margin: 20rpx 0;
}

.price-item.total {
  margin-top: 10rpx;
}

/* 底部提交栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.total-box {
  display: flex;
  align-items: center;
}

.total-label {
  font-size: 28rpx;
  color: #666;
}

.total-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff4d4f;
  margin-left: 10rpx;
}

.submit-btn {
  width: 200rpx;
  height: 72rpx;
  background-color: #1677FF;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.submit-btn:active {
  background-color: #4096ff;
  transform: scale(0.98);
}

.submit-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
}

/* 支付密码弹窗 */
.password-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-modal-content {
  width: 80%;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-sizing: border-box;
}

.password-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.password-modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.password-modal-close {
  font-size: 40rpx;
  color: #999;
  cursor: pointer;
}

.password-tips {
  text-align: center;
  margin-bottom: 30rpx;
}

.tips-text {
  font-size: 28rpx;
  color: #666;
}

.password-input-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
  margin-top: 20rpx;
}

.password-dot-box {
  width: 80rpx;
  height: 80rpx;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.password-dot-box.active {
  border-color: #1677FF;
}

.password-dot {
  font-size: 40rpx;
  color: #333;
}

.password-input-hidden {
  position: absolute;
  left: -9999rpx;
  top: -9999rpx;
  width: 100rpx;
  height: 100rpx;
  opacity: 0;
}

.password-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.password-cancel-btn,
.password-confirm-btn {
  width: 45%;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.password-cancel-btn {
  border: 2rpx solid #ddd;
  background-color: #fff;
}

.password-confirm-btn {
  background-color: #1677FF;
  border: 2rpx solid #1677FF;
}

.cancel-btn-text {
  font-size: 32rpx;
  color: #666;
  font-weight: bold;
}

.confirm-btn-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: bold;
}

.password-forget {
  text-align: center;
}

.forget-text {
  font-size: 28rpx;
  color: #1677FF;
  text-decoration: underline;
  cursor: pointer;
}
</style>
