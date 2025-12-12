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
              <text class="item-value">{{ getServiceTypeName(orderInfo.serviceType) }}</text>
            </view>
            <view class="errand-item">
              <text class="item-label">物品描述：</text>
              <text class="item-value">{{ orderInfo.goodsName || '-' }}</text>
            </view>
            <view v-if="orderInfo.remark" class="errand-item remark-item">
              <text class="item-label">备注：</text>
              <view class="remark-content">
                <text class="remark-line">{{ orderInfo.remark }}</text>
              </view>
            </view>
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
        <view class="price-item" v-if="goodsAmount > 0">
          <text class="price-label">商品价格</text>
          <text class="price-value">￥{{ goodsAmount.toFixed(2) }}</text>
        </view>
        <view class="price-item service-fee-item">
          <text class="price-label service-fee-label">服务费</text>
          <text class="price-value service-fee-value">￥{{ serviceFee.toFixed(2) }}</text>
        </view>
        <view class="price-item" v-if="discountAmount > 0">
          <text class="price-label">优惠金额</text>
          <text class="price-value discount">-￥{{ discountAmount.toFixed(2) }}</text>
        </view>
        <view class="price-divider"></view>
        <view class="price-item total">
          <text class="price-label">合计</text>
          <text class="price-value total">￥{{ totalPrice.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 占位空间 -->
      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <view class="total-box">
        <text class="total-label">实付款：</text>
        <text class="total-price">¥{{ totalPrice.toFixed(2) }}</text>
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
          <!-- 隐藏的输入框 -->
          <input 
            ref="passwordInput"
            class="password-input-hidden"
            type="number"
            maxlength="6"
            :value="paymentPassword"
            @input="onPasswordInput"
            :focus="passwordInputFocus"
            :adjust-position="false"
            cursor-spacing="0"
          />
        </view>
        
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
import { payAndCreateOrder } from '@/api/errand.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      preOrderNo: '', // 预订单号
      orderInfo: {},
      backendTotalAmount: 0, // 后端返回的总金额
      selectedPayment: 0, // 默认选择余额支付
      paymentMethods: [],
      loading: false,
      showPasswordModal: false, // 显示密码输入框
      paymentPassword: '', // 支付密码
      passwordInputFocus: false // 密码输入框聚焦状态
    };
  },
  computed: {
    // 商品金额
    goodsAmount() {
      return parseFloat(this.orderInfo.goodsPrice || this.orderInfo.goodsAmount || 0);
    },
    // 服务费
    serviceFee() {
      return parseFloat(this.orderInfo.servicePrice || this.orderInfo.deliveryFee || 0);
    },
    // 优惠金额
    discountAmount() {
      return parseFloat(this.orderInfo.discountAmount || 0);
    },
    // 总价（使用后端返回的准确金额）
    totalPrice() {
      return this.backendTotalAmount || (this.serviceFee - this.discountAmount);
    }
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
    
    // 初始化支付方式列表 - 使用余额支付（后端只支持余额支付）
    this.paymentMethods = PAY_TYPES
      .filter(item => item.value === 1) // 1-余额支付
      .map((item) => ({
        icon: item.icon,
        name: item.label,
        payType: item.value,
        payTypeCode: this.getPayTypeCode(item.value),
        color: this.getPaymentColor(item.value)
      }));

    // 从URL参数获取预订单号
    if (options.preOrderNo) {
      this.preOrderNo = options.preOrderNo;
    }
    
    // 从本地存储获取订单信息
    const savedOrder = uni.getStorageSync('errandPrepayOrder');
    if (savedOrder) {
      this.orderInfo = {
        ...(savedOrder.orderInfo || {}),
        deliveryFee: savedOrder.deliveryFee || 0,
        goodsAmount: savedOrder.goodsAmount || 0
      };
      // 保存后端返回的总金额
      this.backendTotalAmount = savedOrder.totalAmount || 0;
    }
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
    
    // 获取支付方式代码
    getPayTypeCode(payType) {
      const codes = {
        1: 'BALANCE',
        2: 'WECHAT',
        3: 'ALIPAY',
        4: 'CASH'
      };
      return codes[payType] || 'BALANCE';
    },
    
    // 获取服务类型名称
    getServiceTypeName(type) {
      const typeNames = {
        'EXPRESS': '取快递',
        'FOOD': '买食物',
        'SHOPPING': '代买物品',
        'OTHER': '其他'
      };
      return typeNames[type] || type || '其他';
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
        content: `确认使用${paymentMethod.name}支付${this.totalPrice}元吗？`,
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
          title: '支付中...'
        });
        
        const paymentMethod = this.paymentMethods[this.selectedPayment];
        
        // 余额支付需要输入密码
        uni.hideLoading();
        this.showPasswordModal = true;
        this.loading = false;
        // 延迟聚焦输入框
        setTimeout(() => {
          this.focusPasswordInput();
        }, 300);
        
      } catch (error) {
        this.loading = false;
        uni.hideLoading();
        uni.showToast({
          title: '支付失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 执行支付
    async payOrder(payType, payPassword) {
      try {
        // 从本地存储获取地址ID
        const prepayOrder = uni.getStorageSync('errandPrepayOrder');
        
        // 必须使用后端返回的总金额，确保金额一致
        const payAmount = this.backendTotalAmount;
        
        // 按照后端PayOrderDTO结构构建支付数据
        const payData = {
          preOrderNo: this.preOrderNo, // 预订单号
          payPassword: payPassword, // 支付密码
          payType: 1, // 支付方式：1-余额支付
          payAmount: payAmount, // 支付金额（必须使用后端返回的金额）
          userAddressId: prepayOrder?.deliverAddressId // 用户地址ID
        };
        
        const res = await payAndCreateOrder(payData);
        
        uni.hideLoading();
        this.loading = false;
        
        if (res.code === 200) {
          // 清除本地存储的预订单信息
          uni.removeStorageSync('errandPrepayOrder');
          
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          // 根据不同错误显示不同提示
          let errorMsg = res.msg || '支付失败';
          if (errorMsg.includes('余额不足')) {
            errorMsg = '账户余额不足，请充值后重试';
          } else if (errorMsg.includes('密码')) {
            errorMsg = '支付密码错误，请重试';
          }
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          });
        }
      } catch (error) {
        uni.hideLoading();
        this.loading = false;
        
        let errorMsg = '支付失败，请重试';
        if (error.msg) {
          if (error.msg.includes('余额不足')) {
            errorMsg = '账户余额不足，请充值后重试';
          } else if (error.msg.includes('密码')) {
            errorMsg = '支付密码错误，请重试';
          } else {
            errorMsg = error.msg;
          }
        }
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
      }
    },
    
    // 聚焦密码输入框
    focusPasswordInput() {
      this.passwordInputFocus = true;
      // 保持焦点，不要自动失焦
    },
    
    // 密码输入
    onPasswordInput(e) {
      const value = e.detail.value;
      // 只保留数字，最多6位
      this.paymentPassword = value.replace(/\D/g, '').slice(0, 6);
      
      // 输入6位密码后自动提交
      if (this.paymentPassword.length === 6) {
        // 短暂延迟，让用户看到最后一位输入
        setTimeout(() => {
          this.confirmPaymentPassword();
        }, 200);
      }
    },
    
    // 确认支付密码
    async confirmPaymentPassword() {
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
        
        const paymentMethod = this.paymentMethods[this.selectedPayment];
        
        // 执行支付
        await this.payOrder(paymentMethod.payType, this.paymentPassword);
        
        this.closePasswordModal();
        
      } catch (error) {
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
      this.passwordInputFocus = false;
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

.remark-item {
  align-items: flex-start;
}

.remark-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.remark-line {
  font-size: 28rpx;
  color: #333;
  line-height: 40rpx;
  white-space: pre-wrap;
  word-break: break-all;
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

.price-value.discount {
  color: #52c41a;
  font-weight: 500;
}

/* 服务费突出显示 */
.service-fee-item {
  background-color: #fff7e6;
  margin: 0 -30rpx;
  padding: 20rpx 30rpx;
  border-radius: 8rpx;
}

.service-fee-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #fa8c16;
}

.service-fee-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #fa8c16;
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
  position: relative;
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
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  z-index: 10;
  pointer-events: auto;
  font-size: 32rpx;
  text-align: center;
  color: transparent;
  caret-color: transparent;
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
