<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-button" @click="goBack">
		  
      </view>
      <view class="nav-title">申请提现</view>
      <view class="nav-right">
        <view class="help-icon" @click="showHelp">?</view>
      </view>
    </view>
    
    <!-- 余额信息卡片 -->
    <view class="balance-card">
      <view class="balance-label">可提现余额</view>
      <view class="balance-amount">¥{{ financialData.withdrawableBalance }}</view>
      
      <view class="balance-details">
        <view class="detail-item">
          <text class="detail-label">今日收入</text>
          <text class="detail-value">¥{{ financialData.todayIncome }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">待结算</text>
          <text class="detail-value">¥{{ financialData.pendingSettlement }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">提现中</text>
          <text class="detail-value">¥{{ financialData.pendingWithdrawal }}</text>
        </view>
      </view>
    </view>
    
    <!-- 提现申请区域 -->
    <view class="withdraw-section">
      <view class="section-title">提现申请</view>
      
      <!-- 提现金额输入 -->
      <view class="form-group">
        <view class="form-label">提现金额</view>
        <input 
          type="number" 
          class="form-input" 
          v-model.number="withdrawAmount" 
          placeholder="请输入" 
          @input="calculateFee"
        />
        
        <!-- 快捷金额选择 -->
        <view class="quick-amounts">
          <view 
            class="quick-amount" 
            v-for="amount in quickAmounts" 
            :key="amount"
            @click="selectQuickAmount(amount)"
          >
            {{ amount }}元
          </view>
        </view>
      </view>
      
      <!-- 提现账户 -->
      <view class="form-group">
        <view class="form-label">提现账户</view>
        <view class="account-selector">
          <picker @change="changeAccount" :value="selectedAccountIndex" :range="accounts">
            <view class="account-display">
              {{ accounts[selectedAccountIndex] }}
              <text class="arrow-icon">▼</text>
            </view>
          </picker>
        </view>
        <view class="add-account" @click="showAddAccount">
          <text class="add-icon">+</text> 添加新账户
        </view>
      </view>
      
      <!-- 费用计算 -->
      <view class="fee-calculation">
        <view class="calculation-item">
          <text class="calc-label">提现金额</text>
          <text class="calc-value">¥{{ formatAmount(withdrawAmount) }}</text>
        </view>
        <view class="calculation-item">
          <text class="calc-label">手续费 ({{ feeRate * 100 }}%)</text>
          <text class="calc-value">¥{{ formatAmount(fee) }}</text>
        </view>
        <view class="calculation-item">
          <text class="calc-label">预计到账</text>
          <text class="calc-value">¥{{ formatAmount(expectedAmount) }}</text>
        </view>
        <view class="calculation-divider"></view>
        <view class="calculation-item total">
          <text class="calc-label total">实际到账</text>
          <text class="calc-value total">¥{{ formatAmount(expectedAmount) }}</text>
        </view>
      </view>
      
      <!-- 确认提现按钮 -->
      <button 
        class="confirm-button" 
        :disabled="!canWithdraw"
        @click="confirmWithdraw"
      >
        确认提现
      </button>
    </view>
    
    <!-- 最近提现记录 -->
    <view class="withdrawal-history">
      <view class="section-header">
        <text class="section-title">最近提现记录</text>
        <text class="view-all" @click="viewAllHistory">查看全部</text>
      </view>
      
      <view class="history-list">
        <view class="history-item" v-for="(record, index) in recentRecords" :key="index">
          <view class="history-main">
            <text class="history-account">{{ record.account }}</text>
            <text class="history-time">{{ record.time }}</text>
          </view>
          <view class="history-details">
            <text class="history-amount">-¥{{ record.amount }}</text>
            <text class="history-status" :class="record.status === '成功' ? 'status-success' : ''">
              {{ record.status }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'WithdrawPage',
  data() {
    return {
      // 财务数据
      financialData: {
        withdrawableBalance: '8,642.50',
        todayIncome: '1,285.00',
        pendingSettlement: '642.80',
        pendingWithdrawal: '1,200.00'
      },
      
      // 提现表单数据
      withdrawAmount: 0,
      quickAmounts: [100, 500, 1000, 2000],
      accounts: ['微信', '支付宝', '工商银行', '建设银行'],
      selectedAccountIndex: 0,
      feeRate: 0.001, // 0.1%手续费率
      fee: 0,
      expectedAmount: 0,
      
      // 提现记录
      recentRecords: [
        {
          id: 1,
          account: '提现到工商银行',
          amount: '1,200.00',
          time: '2023-11-14 15:23',
          status: '成功'
        },
        {
          id: 2,
          account: '提现到支付宝',
          amount: '800.00',
          time: '2023-11-10 09:45',
          status: '成功'
        },
        {
          id: 3,
          account: '提现到微信支付',
          amount: '1,500.00',
          time: '2023-11-05 14:12',
          status: '成功'
        }
      ]
    };
  },
  computed: {
    // 是否可以提现
    canWithdraw() {
      const balance = parseFloat(this.financialData.withdrawableBalance.replace(/,/g, ''));
      return this.withdrawAmount > 0 && this.withdrawAmount <= balance;
    }
  },
  onLoad() {
    // 页面加载时计算费用
    this.calculateFee();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 显示帮助信息
    showHelp() {
      uni.showModal({
        title: '提现帮助',
        content: '1. 提现金额不能超过可提现余额\n2. 提现手续费为0.1%\n3. 提现申请提交后，资金一般在1-3个工作日内到账',
        showCancel: false
      });
    },
    
    // 选择快捷金额
    selectQuickAmount(amount) {
      this.withdrawAmount = amount;
      this.calculateFee();
    },
    
    // 改变提现账户
    changeAccount(e) {
      this.selectedAccountIndex = e.detail.value;
    },
    
    // 添加新账户
    showAddAccount() {
      uni.showToast({
        title: '添加新账户功能开发中',
        icon: 'none'
      });
    },
    
    // 计算手续费和预计到账金额
    calculateFee() {
      const amount = this.withdrawAmount || 0;
      this.fee = amount * this.feeRate;
      this.expectedAmount = amount - this.fee;
    },
    
    // 格式化金额显示
    formatAmount(amount) {
      if (isNaN(amount) || amount === null || amount === undefined) {
        return '0.00';
      }
      return amount.toFixed(2);
    },
    
    // 确认提现
    confirmWithdraw() {
      if (!this.canWithdraw) {
        uni.showToast({
          title: '请输入有效提现金额',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '确认提现',
        content: `确认将¥${this.formatAmount(this.withdrawAmount)}提现至${this.accounts[this.selectedAccountIndex]}吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '处理中' });
            
            // 模拟API调用
            setTimeout(() => {
              uni.hideLoading();
              uni.showToast({
                title: '提现申请已提交',
                icon: 'success'
              });
              
              // 模拟延迟后返回上一页
              setTimeout(() => {
                this.goBack();
              }, 1500);
            }, 2000);
          }
        }
      });
    },
    
    // 查看全部提现记录
    viewAllHistory() {
      uni.showToast({
        title: '查看全部提现记录',
        icon: 'none'
      });
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
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  position: sticky;
  top: 0;
  z-index: 100;
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
  display: flex;
  justify-content: flex-end;
}

.help-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
}

/* 余额信息卡片 */
.balance-card {
  background-color: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.balance-label {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 16rpx;
}

.balance-amount {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff4d4f;
  text-align: center;
  margin-bottom: 24rpx;
}

.balance-details {
  display: flex;
  justify-content: space-around;
  padding-top: 24rpx;
  border-top: 2rpx solid #f0f0f0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 提现申请区域 */
.withdraw-section {
  background-color: #fff;
  margin: 0 20rpx 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

/* 表单组 */
.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

/* 快捷金额选择 */
.quick-amounts {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.quick-amount {
  flex: 1;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #666;
}

.quick-amount:active {
  background-color: #f0f7ff;
  border-color: #4A90E2;
  color: #4A90E2;
}

/* 账户选择 */
.account-selector {
  margin-bottom: 20rpx;
}

.account-display {
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #333;
}

.arrow-icon {
  font-size: 20rpx;
  color: #999;
}

.add-account {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #4A90E2;
}

.add-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30rpx;
  height: 30rpx;
  background-color: #4A90E2;
  color: #fff;
  border-radius: 50%;
  margin-right: 8rpx;
  font-size: 24rpx;
}

/* 费用计算 */
.fee-calculation {
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
}

.calculation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.calc-label {
  font-size: 26rpx;
  color: #666;
}

.calc-value {
  font-size: 26rpx;
  color: #333;
}

.calculation-divider {
  height: 2rpx;
  background-color: #e0e0e0;
  margin: 16rpx 0 20rpx;
}

.calculation-item.total {
  margin-bottom: 0;
}

.calc-label.total {
  font-weight: bold;
  color: #333;
  font-size: 28rpx;
}

.calc-value.total {
  font-weight: bold;
  color: #ff4d4f;
  font-size: 32rpx;
}

/* 确认提现按钮 */
.confirm-button {
  width: 100%;
  height: 90rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  line-height: 90rpx;
  margin: 0;
}

.confirm-button:disabled {
  background-color: #c0c0c0;
}

/* 最近提现记录 */
.withdrawal-history {
  background-color: #fff;
  margin: 0 20rpx 100rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.view-all {
  font-size: 26rpx;
  color: #4A90E2;
}

/* 提现记录列表 */
.history-list {
  
}

.history-item {
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.history-account {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.history-time {
  font-size: 24rpx;
  color: #999;
}

.history-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-amount {
  font-size: 30rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.history-status {
  font-size: 24rpx;
  color: #999;
}

.history-status.status-success {
  color: #52c41a;
}
</style>