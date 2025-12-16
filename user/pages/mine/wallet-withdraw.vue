<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">提现</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 账户余额 -->
    <view class="balance-section">
      <view class="balance-label">可提现金额（元）</view>
      <view class="balance-amount">¥{{ balance.toFixed(2) }}</view>
      <view class="balance-tips">单次最低提现金额：¥10</view>
    </view>

    <!-- 提现金额 -->
    <view class="withdraw-section">
      <view class="section-title">提现金额</view>
      <view class="amount-input-wrapper">
        <text class="currency-symbol">¥</text>
        <input
          class="amount-input"
          type="number"
          placeholder="请输入提现金额"
          v-model="withdrawAmount"
          @input="onAmountInput"
        />
      </view>
      <view class="amount-actions">
        <text class="quick-amount" @click="setQuickAmount(0.5)">50%</text>
        <text class="quick-amount" @click="setQuickAmount(1)">全部</text>
      </view>
    </view>

    <!-- 提现方式 -->
    <view class="withdraw-method-section">
      <view class="section-title">提现到</view>
      <view class="method-list">
        <view 
          class="method-item" 
          v-for="(method, index) in withdrawMethods" 
          :key="index"
          :class="{ active: selectedMethod === method.value }"
          @click="selectMethod(method.value)"
        >
          <view class="method-left">
            <text class="method-icon">{{ method.icon }}</text>
            <view class="method-info">
              <text class="method-name">{{ method.name }}</text>
              <text class="method-desc">{{ method.desc }}</text>
            </view>
          </view>
          <view class="method-right">
            <view class="method-radio" :class="{ checked: selectedMethod === method.value }">
              <text class="radio-icon" v-if="selectedMethod === method.value">✓</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 支付密码 -->
    <view class="password-section">
      <view class="section-title">支付密码</view>
      <view class="password-input-wrapper">
        <input
          class="password-input"
          type="password"
          placeholder="请输入支付密码"
          v-model="payPassword"
          maxlength="6"
        />
      </view>
      <view class="password-tips">注：目前支付密码校验功能暂时停用，可以不填</view>
    </view>

    <!-- 底部确认按钮 -->
    <view class="bottom-actions">
      <view class="confirm-button" @click="confirmWithdraw">
        <text class="confirm-text">确认提现</text>
      </view>
    </view>
  </view>
</template>

<script>
import { withdrawWallet, getWalletBalance, verifyPaymentPassword, checkPaymentPasswordStatus } from '@/api/wallet.js';

export default {
  data() {
    return {
      balance: 0,
      withdrawAmount: '',
      payPassword: '',
      selectedMethod: 'alipay',
      withdrawMethods: [
        { value: 'alipay', name: '支付宝', desc: '2小时内到账', icon: '💙' }
        // 暂时只支持支付宝，根据后端接口文档
        // { value: 'bank', name: '银行卡', desc: '1-3个工作日到账', icon: '💳' }
      ]
    };
  },
  onLoad() {
    this.loadBalance();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    async loadBalance() {
      try {
        // 调用API获取钱包余额
        const response = await getWalletBalance();
        if (response.code === 200 && response.data) {
          this.balance = parseFloat(response.data.balance) || 0;
        } else {
          // 如果API调用失败，从本地存储加载余额
          const walletData = uni.getStorageSync('walletData');
          if (walletData && walletData.balance) {
            this.balance = parseFloat(walletData.balance);
          }
        }
      } catch (error) {
        console.error('获取余额失败:', error);
        // 从本地存储加载余额作为备用
        const walletData = uni.getStorageSync('walletData');
        if (walletData && walletData.balance) {
          this.balance = walletData.balance;
        }
      }
    },
    onAmountInput(e) {
      const value = parseFloat(e.detail.value);
      if (value > this.balance) {
        uni.showToast({
          title: '提现金额不能超过余额',
          icon: 'none'
        });
        this.withdrawAmount = this.balance.toString();
      }
    },
    setQuickAmount(percent) {
      if (percent === 1) {
        this.withdrawAmount = this.balance.toFixed(2);
      } else {
        this.withdrawAmount = (this.balance * percent).toFixed(2);
      }
    },
    selectMethod(value) {
      this.selectedMethod = value;
    },
    confirmWithdraw() {
      const amount = parseFloat(this.withdrawAmount);
      
      if (!this.withdrawAmount || amount <= 0) {
        uni.showToast({
          title: '请输入提现金额',
          icon: 'none'
        });
        return;
      }

      if (amount < 10) {
        uni.showToast({
          title: '最低提现金额为¥10',
          icon: 'none'
        });
        return;
      }

      if (amount > this.balance) {
        uni.showToast({
          title: '提现金额不能超过余额',
          icon: 'none'
        });
        return;
      }

      const method = this.withdrawMethods.find(m => m.value === this.selectedMethod);
      
      uni.showModal({
        title: '确认提现',
        content: `提现金额：¥${amount.toFixed(2)}\n提现方式：${method.name}\n到账时间：${method.desc}`,
        success: (res) => {
          if (res.confirm) {
            this.processWithdraw(amount);
          }
        }
      });
    },
    async processWithdraw(amount) {
      // 验证支付密码（如果已输入）
      if (this.payPassword) {
        uni.showLoading({ title: '验证中...' });
        const verifyResult = await verifyPaymentPassword(this.payPassword);
        uni.hideLoading();
        
        if (!verifyResult.valid) {
          uni.showToast({
            title: verifyResult.msg || '支付密码错误',
            icon: 'none'
          });
          return;
        }
      }
      
      uni.showLoading({
        title: '提现中...'
      });

      try {
        // 调用后端提现接口
        const response = await withdrawWallet({
          amount: amount,
          payChannel: this.getPayChannelCode(this.selectedMethod),
          payPassword: this.payPassword
        });

        uni.hideLoading();

        if (response.code === 200) {
          // 提现成功，更新本地余额
          this.balance -= amount;
          const walletData = uni.getStorageSync('walletData') || {};
          walletData.balance = this.balance;
          uni.setStorageSync('walletData', walletData);
          
          uni.showToast({
            title: '提现申请已提交',
            icon: 'success',
            duration: 2000
          });

          setTimeout(() => {
            uni.navigateBack();
          }, 2000);
        } else {
          uni.showToast({
            title: response.msg || '提现失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('提现失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    },
    
    /**
     * 获取支付渠道代码
     */
    getPayChannelCode(method) {
      const channelMap = {
        'alipay': 1,
        'wechat': 2,
        'bank': 3
      };
      return channelMap[method] || 1;
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

/* 账户余额 */
.balance-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 20rpx 30rpx;
  padding: 40rpx;
  border-radius: 20rpx;
  text-align: center;
}

.balance-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20rpx;
}

.balance-amount {
  font-size: 64rpx;
  color: white;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.balance-tips {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 提现金额 */
.withdraw-section {
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

.amount-input-wrapper {
  display: flex;
  align-items: center;
  height: 100rpx;
  background-color: #F8F8F8;
  border-radius: 16rpx;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.currency-symbol {
  font-size: 40rpx;
  color: #333333;
  font-weight: bold;
  margin-right: 12rpx;
}

.amount-input {
  flex: 1;
  height: 100%;
  font-size: 48rpx;
  color: #333333;
  font-weight: bold;
}

.amount-actions {
  display: flex;
  gap: 20rpx;
}

.quick-amount {
  padding: 12rpx 24rpx;
  background-color: #F0F0F0;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666666;
}

.quick-amount:active {
  background-color: #E0E0E0;
}

/* 提现方式 */
.withdraw-method-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
}

.method-list {
  margin-top: 20rpx;
}

.method-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.method-item:last-child {
  border-bottom: none;
}

.method-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.method-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.method-info {
  display: flex;
  flex-direction: column;
}

.method-name {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.method-desc {
  font-size: 24rpx;
  color: #999999;
}

.method-right {
  display: flex;
  align-items: center;
}

.method-radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #CCCCCC;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
}

.method-radio.checked {
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

/* 支付密码 */
.password-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
}

.password-input-wrapper {
  margin-top: 20rpx;
}

.password-input {
  width: 100%;
  height: 88rpx;
  padding: 0 20rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  font-size: 36rpx;
  color: #333333;
  margin-bottom: 16rpx;
}

.password-tips {
  font-size: 24rpx;
  color: #999999;
  margin-top: 16rpx;
}
</style>

