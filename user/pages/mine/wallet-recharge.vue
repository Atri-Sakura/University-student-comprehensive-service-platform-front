<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">充值</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 充值金额选择 -->
    <view class="recharge-section">
      <view class="section-title">选择充值金额</view>
      <view class="amount-grid">
        <view 
          class="amount-item" 
          v-for="(amount, index) in presetAmounts" 
          :key="index"
          :class="{ active: selectedAmount === amount }"
          @click="selectAmount(amount)"
        >
          <text class="amount-value">¥{{ amount }}</text>
        </view>
        <view 
          class="amount-item custom" 
          :class="{ active: isCustomAmount }"
          @click="showCustomInput"
        >
          <text class="amount-value">自定义</text>
        </view>
      </view>
      
      <!-- 自定义金额输入 -->
      <view v-if="isCustomAmount" class="custom-amount-input">
        <input
          class="amount-input"
          type="number"
          placeholder="请输入充值金额"
          v-model="customAmount"
          @input="onCustomAmountInput"
        />
        <text class="amount-hint">最低充值金额：¥10</text>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="payment-section">
      <view class="section-title">选择支付方式</view>
      <view class="payment-methods">
        <view 
          class="payment-item" 
          v-for="(method, index) in paymentMethods" 
          :key="index"
          :class="{ active: selectedPayment === method.value }"
          @click="selectPayment(method.value)"
        >
          <view class="payment-left">
            <text class="payment-icon">{{ method.icon }}</text>
            <text class="payment-name">{{ method.name }}</text>
          </view>
          <view class="payment-right">
            <view class="payment-radio" :class="{ checked: selectedPayment === method.value }">
              <text class="radio-icon" v-if="selectedPayment === method.value">✓</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部确认按钮 -->
    <view class="bottom-actions">
      <view class="confirm-button" @click="confirmRecharge">
        <text class="confirm-text">确认充值 ¥{{ finalAmount.toFixed(2) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedAmount: 0,
      isCustomAmount: false,
      customAmount: '',
      presetAmounts: [50, 100, 200, 500, 1000],
      selectedPayment: 'alipay',
      paymentMethods: [
        { value: 'alipay', name: '支付宝', icon: '💙' },
        { value: 'wechat', name: '微信支付', icon: '💚' },
        { value: 'bank', name: '银行卡', icon: '💳' }
      ]
    };
  },
  computed: {
    finalAmount() {
      if (this.isCustomAmount) {
        return parseFloat(this.customAmount) || 0;
      }
      return this.selectedAmount;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    selectAmount(amount) {
      this.selectedAmount = amount;
      this.isCustomAmount = false;
      this.customAmount = '';
    },
    showCustomInput() {
      this.isCustomAmount = true;
      this.selectedAmount = 0;
      this.customAmount = '';
    },
    onCustomAmountInput(e) {
      const value = parseFloat(e.detail.value);
      if (value < 10) {
        // 可以在这里提示最小金额
      }
    },
    selectPayment(value) {
      this.selectedPayment = value;
    },
    confirmRecharge() {
      if (this.finalAmount < 10) {
        uni.showToast({
          title: '最低充值金额为¥10',
          icon: 'none'
        });
        return;
      }

      if (this.finalAmount <= 0) {
        uni.showToast({
          title: '请选择充值金额',
          icon: 'none'
        });
        return;
      }

      uni.showModal({
        title: '确认充值',
        content: `充值金额：¥${this.finalAmount.toFixed(2)}\n支付方式：${this.getPaymentName(this.selectedPayment)}`,
        success: (res) => {
          if (res.confirm) {
            this.processRecharge();
          }
        }
      });
    },
    getPaymentName(value) {
      const method = this.paymentMethods.find(m => m.value === value);
      return method ? method.name : '未知';
    },
    processRecharge() {
      uni.showLoading({
        title: '充值中...'
      });

      // 模拟支付流程
      setTimeout(() => {
        uni.hideLoading();
        
        // 模拟支付成功
        uni.showToast({
          title: '充值成功',
          icon: 'success',
          duration: 2000
        });

        setTimeout(() => {
          uni.navigateBack();
        }, 2000);

        // 实际支付流程：
        /*
        // 调用支付API
        uni.request({
          url: 'https://your-api.com/wallet/recharge',
          method: 'POST',
          header: {
            'Authorization': 'Bearer ' + uni.getStorageSync('token'),
            'Content-Type': 'application/json'
          },
          data: {
            amount: this.finalAmount,
            paymentMethod: this.selectedPayment
          },
          success: (res) => {
            uni.hideLoading();
            if (res.data.code === 200) {
              // 调用支付接口
              if (this.selectedPayment === 'alipay') {
                // 调用支付宝支付
                // uni.requestPayment({ provider: 'alipay', ... })
              } else if (this.selectedPayment === 'wechat') {
                // 调用微信支付
                // uni.requestPayment({ provider: 'wxpay', ... })
              }
              
              uni.showToast({
                title: '充值成功',
                icon: 'success'
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 2000);
            } else {
              uni.showToast({
                title: res.data.message || '充值失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            uni.hideLoading();
            uni.showToast({
              title: '网络错误，请重试',
              icon: 'none'
            });
          }
        });
        */
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
  padding-top: 88rpx;
  padding-bottom: 160rpx;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(to bottom, #4A90E2, #6AAFE2);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding-top: var(--status-bar-height, 44rpx);
}

.navbar-content {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.navbar-left {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.navbar-left-hover {
  opacity: 0.7;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.navbar-icon {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
}

.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 36rpx;
  color: white;
  font-weight: bold;
}

.navbar-right {
  width: 60rpx;
}

/* 充值金额选择 */
.recharge-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.amount-item {
  height: 100rpx;
  background-color: #F8F8F8;
  border: 2rpx solid #E0E0E0;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.amount-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.amount-value {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.amount-item.active .amount-value {
  color: white;
}

.custom-amount-input {
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #F0F0F0;
}

.amount-input {
  width: 100%;
  height: 88rpx;
  padding: 0 20rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  font-size: 36rpx;
  color: #333333;
  margin-bottom: 16rpx;
}

.amount-hint {
  font-size: 24rpx;
  color: #999999;
}

/* 支付方式 */
.payment-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
}

.payment-methods {
  margin-top: 20rpx;
}

.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-left {
  display: flex;
  align-items: center;
}

.payment-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.payment-name {
  font-size: 30rpx;
  color: #333333;
}

.payment-right {
  display: flex;
  align-items: center;
}

.payment-radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #CCCCCC;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.payment-radio.checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.radio-icon {
  font-size: 24rpx;
  color: white;
  font-weight: bold;
}

/* 底部确认按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #F0F0F0;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.confirm-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.confirm-button:active {
  opacity: 0.8;
}
</style>

