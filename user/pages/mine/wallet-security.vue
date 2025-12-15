<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">钱包安全</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 安全等级区域 -->
    <view class="security-level-section">
      <view class="level-header">
        <text class="level-title">钱包安全等级</text>
        <text class="level-score">{{ securityScore }}分</text>
      </view>
      <view class="level-progress">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: securityScore + '%' }"></view>
        </view>
        <view class="level-text">{{ securityLevelText }}</view>
      </view>
    </view>

    <!-- 安全设置 -->
    <view class="security-section">
      <view class="section-title">安全设置</view>
      
      <view class="security-item" @click="setPaymentPassword">
        <view class="item-left">
          <view class="item-icon password-icon">🔐</view>
          <view class="item-content">
            <text class="item-title">支付密码</text>
            <text class="item-desc">{{ securityInfo.hasPaymentPassword ? '已设置支付密码' : '未设置，建议立即设置' }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-status" :class="{ 'unbind': !securityInfo.hasPaymentPassword }">
            {{ securityInfo.hasPaymentPassword ? '已设置' : '未设置' }}
          </text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="security-item" @click="setSecurityQuestion">
        <view class="item-left">
          <view class="item-icon question-icon">❓</view>
          <view class="item-content">
            <text class="item-title">安全问题</text>
            <text class="item-desc">{{ securityInfo.hasSecurityQuestion ? '已设置安全问题' : '设置安全问题可提升账户安全' }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-status" :class="{ 'unbind': !securityInfo.hasSecurityQuestion }">
            {{ securityInfo.hasSecurityQuestion ? '已设置' : '未设置' }}
          </text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="security-item" @click="bindSecurityPhone">
        <view class="item-left">
          <view class="item-icon phone-icon">📱</view>
          <view class="item-content">
            <text class="item-title">安全手机</text>
            <text class="item-desc">{{ securityInfo.securityPhone || '未绑定安全手机' }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-status" :class="{ 'unbind': !securityInfo.securityPhone }">
            {{ securityInfo.securityPhone ? '已绑定' : '未绑定' }}
          </text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="security-item" @click="bindSecurityEmail">
        <view class="item-left">
          <view class="item-icon email-icon">📧</view>
          <view class="item-content">
            <text class="item-title">安全邮箱</text>
            <text class="item-desc">{{ securityInfo.securityEmail || '未绑定安全邮箱' }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-status" :class="{ 'unbind': !securityInfo.securityEmail }">
            {{ securityInfo.securityEmail ? '已绑定' : '未绑定' }}
          </text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <!-- 交易设置 -->
    <view class="security-section">
      <view class="section-title">交易设置</view>
      
      <view class="security-item" @click="setTransactionLimit">
        <view class="item-left">
          <view class="item-icon limit-icon">💰</view>
          <view class="item-content">
            <text class="item-title">交易限额</text>
            <text class="item-desc">单笔限额：¥{{ securityInfo.singleLimit || 5000 }}，日限额：¥{{ securityInfo.dailyLimit || 20000 }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="arrow">></text>
        </view>
      </view>

      <view class="security-item" @click="setQuickPay">
        <view class="item-left">
          <view class="item-icon quickpay-icon">⚡</view>
          <view class="item-content">
            <text class="item-title">免密支付</text>
            <text class="item-desc">{{ securityInfo.quickPayEnabled ? '已开启，小额免密支付' : '未开启，每次支付需输入密码' }}</text>
          </view>
        </view>
        <view class="item-right">
          <switch 
            :checked="securityInfo.quickPayEnabled" 
            @change="toggleQuickPay"
            color="#4A90E2"
          />
        </view>
      </view>

      <view class="security-item" v-if="securityInfo.quickPayEnabled" @click="setQuickPayLimit">
        <view class="item-left">
          <view class="item-icon quickpay-limit-icon">💳</view>
          <view class="item-content">
            <text class="item-title">免密额度</text>
            <text class="item-desc">单笔免密限额：¥{{ securityInfo.quickPayLimit || 200 }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <!-- 安全提醒 -->
    <view class="security-section">
      <view class="section-title">安全提醒</view>
      
      <view class="security-item">
        <view class="item-left">
          <view class="item-icon notification-icon">🔔</view>
          <view class="item-content">
            <text class="item-title">交易通知</text>
            <text class="item-desc">接收交易成功、失败等通知</text>
          </view>
        </view>
        <view class="item-right">
          <switch 
            :checked="securityInfo.transactionNotification" 
            @change="toggleTransactionNotification"
            color="#4A90E2"
          />
        </view>
      </view>

      <view class="security-item">
        <view class="item-left">
          <view class="item-icon risk-icon">⚠️</view>
          <view class="item-content">
            <text class="item-title">异常提醒</text>
            <text class="item-desc">账户异常时及时提醒</text>
          </view>
        </view>
        <view class="item-right">
          <switch 
            :checked="securityInfo.riskNotification" 
            @change="toggleRiskNotification"
            color="#4A90E2"
          />
        </view>
      </view>
    </view>

    <!-- 风险控制 -->
    <view class="security-section">
      <view class="section-title">风险控制</view>
      
      <view class="security-item" @click="viewSecurityLog">
        <view class="item-left">
          <view class="item-icon log-icon">📋</view>
          <view class="item-content">
            <text class="item-title">安全日志</text>
            <text class="item-desc">查看钱包安全操作记录</text>
          </view>
        </view>
        <view class="item-right">
          <text class="arrow">></text>
        </view>
      </view>

      <view class="security-item" :class="{ 'danger-item': !securityInfo.isFrozen, 'success-item': securityInfo.isFrozen }" @click="securityInfo.isFrozen ? unfreezeWallet() : freezeWallet()">
        <view class="item-left">
          <view class="item-icon" :class="securityInfo.isFrozen ? 'unfreeze-icon' : 'freeze-icon'">{{ securityInfo.isFrozen ? '🔓' : '🔒' }}</view>
          <view class="item-content">
            <text class="item-title">{{ securityInfo.isFrozen ? '解冻钱包' : '冻结钱包' }}</text>
            <text class="item-desc">{{ securityInfo.isFrozen ? '解冻后可以正常进行交易操作' : '冻结后无法进行任何交易操作' }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getWalletSecurity, updateWalletSecurity, freezeWallet, unfreezeWallet, setPaymentPassword, checkPaymentPasswordStatus } from '@/api/wallet.js';

export default {
  data() {
    return {
      securityInfo: {
        hasPaymentPassword: false, // 默认为false，需要检测
        hasSecurityQuestion: false,
        securityPhone: '138****5678',
        securityEmail: 'student@example.com',
        singleLimit: 5000,
        dailyLimit: 20000,
        quickPayEnabled: false,
        quickPayLimit: 200,
        transactionNotification: true,
        riskNotification: true,
        isFrozen: false
      }
    };
  },
  computed: {
    securityScore() {
      let score = 0;
      if (this.securityInfo.hasPaymentPassword) score += 30;
      if (this.securityInfo.hasSecurityQuestion) score += 20;
      if (this.securityInfo.securityPhone) score += 25;
      if (this.securityInfo.securityEmail) score += 25;
      return score;
    },
    securityLevelText() {
      if (this.securityScore >= 80) return '安全';
      if (this.securityScore >= 60) return '中等';
      return '较低';
    }
  },
  onLoad() {
    this.loadSecurityInfo();
  },
  methods: {
    goBack() {
      // 检查页面栈，如果只有一个页面（刷新后的情况），则跳转到钱包页面
      const pages = getCurrentPages();
      if (pages.length <= 1) {
        // 页面栈只有一个页面，直接跳转到钱包页面
        uni.redirectTo({
          url: '/pages/mine/wallet'
        });
      } else {
        // 正常返回上一页
        uni.navigateBack({
          delta: 1,
          fail: (err) => {
            // 返回失败时跳转到钱包页面
            uni.redirectTo({
              url: '/pages/mine/wallet'
            });
          }
        });
      }
    },
    async loadSecurityInfo() {
      // 从本地存储加载安全信息
      const storedInfo = uni.getStorageSync('walletSecurityInfo');
      if (storedInfo) {
        this.securityInfo = { ...this.securityInfo, ...storedInfo };
      }
      
      // 检查支付密码状态
      try {
        const result = await checkPaymentPasswordStatus();
        if (result && result.code === 200 && result.data) {
          this.securityInfo.hasPaymentPassword = result.data.hasPaymentPassword || false;
          // 更新本地存储
          this.saveSecurityInfo();
        }
      } catch (error) {
        console.error('检查支付密码状态失败:', error);
      }
    },
    saveSecurityInfo() {
      // 保存到本地存储
      uni.setStorageSync('walletSecurityInfo', this.securityInfo);
    },
    setPaymentPassword() {
      if (this.securityInfo.hasPaymentPassword) {
        // 已设置，可以修改
        uni.navigateTo({
          url: '/pages/mine/wallet-payment-password?action=modify'
        });
      } else {
        // 未设置，进行设置
        uni.navigateTo({
          url: '/pages/mine/wallet-payment-password?action=set'
        });
      }
    },
    setSecurityQuestion() {
      uni.navigateTo({
        url: '/pages/mine/wallet-security-question'
      });
    },
    bindSecurityPhone() {
      if (this.securityInfo.securityPhone) {
        // 已绑定，可以解绑或更换
        uni.showActionSheet({
          itemList: ['更换安全手机', '解绑安全手机'],
          success: (res) => {
            if (res.tapIndex === 0) {
              this.updateSecurityPhone();
            } else {
              this.unbindSecurityPhone();
            }
          }
        });
      } else {
        // 未绑定，进行绑定
        this.updateSecurityPhone();
      }
    },
    updateSecurityPhone() {
      uni.showModal({
        title: this.securityInfo.securityPhone ? '更换安全手机' : '绑定安全手机',
        editable: true,
        placeholderText: '请输入手机号',
        content: this.securityInfo.securityPhone || '',
        success: (res) => {
          if (res.confirm && res.content) {
            const phoneReg = /^1[3-9]\d{9}$/;
            if (!phoneReg.test(res.content)) {
              uni.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
              });
              return;
            }
            // 这里应该发送验证码验证
            this.securityInfo.securityPhone = res.content;
            this.saveSecurityInfo();
            uni.showToast({
              title: '操作成功',
              icon: 'success'
            });
          }
        }
      });
    },
    unbindSecurityPhone() {
      uni.showModal({
        title: '解绑安全手机',
        content: '确定要解绑安全手机吗？解绑后可能影响钱包安全',
        success: (res) => {
          if (res.confirm) {
            this.securityInfo.securityPhone = '';
            this.saveSecurityInfo();
            uni.showToast({
              title: '解绑成功',
              icon: 'success'
            });
          }
        }
      });
    },
    bindSecurityEmail() {
      if (this.securityInfo.securityEmail) {
        // 已绑定，可以解绑或更换
        uni.showActionSheet({
          itemList: ['更换安全邮箱', '解绑安全邮箱'],
          success: (res) => {
            if (res.tapIndex === 0) {
              this.updateSecurityEmail();
            } else {
              this.unbindSecurityEmail();
            }
          }
        });
      } else {
        // 未绑定，进行绑定
        this.updateSecurityEmail();
      }
    },
    updateSecurityEmail() {
      uni.showModal({
        title: this.securityInfo.securityEmail ? '更换安全邮箱' : '绑定安全邮箱',
        editable: true,
        placeholderText: '请输入邮箱',
        content: this.securityInfo.securityEmail || '',
        success: (res) => {
          if (res.confirm && res.content) {
            const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailReg.test(res.content)) {
              uni.showToast({
                title: '请输入正确的邮箱',
                icon: 'none'
              });
              return;
            }
            this.securityInfo.securityEmail = res.content;
            this.saveSecurityInfo();
            uni.showToast({
              title: '操作成功',
              icon: 'success'
            });
          }
        }
      });
    },
    unbindSecurityEmail() {
      uni.showModal({
        title: '解绑安全邮箱',
        content: '确定要解绑安全邮箱吗？解绑后可能影响钱包安全',
        success: (res) => {
          if (res.confirm) {
            this.securityInfo.securityEmail = '';
            this.saveSecurityInfo();
            uni.showToast({
              title: '解绑成功',
              icon: 'success'
            });
          }
        }
      });
    },
    setTransactionLimit() {
      uni.showModal({
        title: '设置交易限额',
        editable: true,
        placeholderText: '请输入单笔限额（元）',
        content: this.securityInfo.singleLimit.toString(),
        success: (res) => {
          if (res.confirm && res.content) {
            const limit = parseFloat(res.content);
            if (isNaN(limit) || limit <= 0) {
              uni.showToast({
                title: '请输入有效的限额',
                icon: 'none'
              });
              return;
            }
            this.securityInfo.singleLimit = limit;
            this.saveSecurityInfo();
            uni.showToast({
              title: '设置成功',
              icon: 'success'
            });
          }
        }
      });
    },
    toggleQuickPay(e) {
      this.securityInfo.quickPayEnabled = e.detail.value;
      this.saveSecurityInfo();
      uni.showToast({
        title: this.securityInfo.quickPayEnabled ? '已开启免密支付' : '已关闭免密支付',
        icon: 'none'
      });
    },
    setQuickPayLimit() {
      uni.showModal({
        title: '设置免密额度',
        editable: true,
        placeholderText: '请输入免密额度（元）',
        content: this.securityInfo.quickPayLimit.toString(),
        success: (res) => {
          if (res.confirm && res.content) {
            const limit = parseFloat(res.content);
            if (isNaN(limit) || limit <= 0) {
              uni.showToast({
                title: '请输入有效的额度',
                icon: 'none'
              });
              return;
            }
            this.securityInfo.quickPayLimit = limit;
            this.saveSecurityInfo();
            uni.showToast({
              title: '设置成功',
              icon: 'success'
            });
          }
        }
      });
    },
    toggleTransactionNotification(e) {
      this.securityInfo.transactionNotification = e.detail.value;
      this.saveSecurityInfo();
    },
    toggleRiskNotification(e) {
      this.securityInfo.riskNotification = e.detail.value;
      this.saveSecurityInfo();
    },
    viewSecurityLog() {
      uni.navigateTo({
        url: '/pages/mine/wallet-security-log'
      });
    },
    async freezeWallet() {
      uni.showModal({
        title: '冻结钱包',
        content: '确定要冻结钱包吗？冻结后将无法进行任何交易操作，需要解冻后才能使用',
        confirmText: '确定冻结',
        confirmColor: '#FF4444',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: '冻结中...'
              });
              
              const result = await freezeWallet();
              
              if (result && result.code === 200) {
                uni.hideLoading();
                uni.showToast({
                  title: '钱包已冻结',
                  icon: 'success'
                });
                
                // 更新本地状态
                this.securityInfo.isFrozen = true;
                this.saveSecurityInfo();
              } else {
                uni.hideLoading();
                uni.showToast({
                  title: result?.msg || '冻结失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              uni.hideLoading();
              uni.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    async unfreezeWallet() {
      uni.showModal({
        title: '解冻钱包',
        content: '确定要解冻钱包吗？解冻后可以正常进行交易操作',
        confirmText: '确定解冻',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: '解冻中...'
              });
              
              const result = await unfreezeWallet();
              
              if (result && result.code === 200) {
                uni.hideLoading();
                uni.showToast({
                  title: '钱包已解冻',
                  icon: 'success'
                });
                
                // 更新本地状态
                this.securityInfo.isFrozen = false;
                this.saveSecurityInfo();
              } else {
                uni.hideLoading();
                uni.showToast({
                  title: result?.msg || '解冻失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              uni.hideLoading();
              uni.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    }
  },
  onShow() {
    // 页面显示时重新加载（可能从其他页面返回）
    this.loadSecurityInfo();
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-top: 88rpx;
  padding-bottom: 40rpx;
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

/* 安全等级区域 */
.security-level-section {
  background: linear-gradient(to bottom, #4A90E2, #6AAFE2);
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.level-title {
  font-size: 32rpx;
  color: white;
  opacity: 0.9;
}

.level-score {
  font-size: 48rpx;
  color: white;
  font-weight: bold;
}

.level-progress {
  margin-top: 20rpx;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background-color: white;
  border-radius: 4rpx;
  transition: width 0.3s;
}

.level-text {
  font-size: 28rpx;
  color: white;
  opacity: 0.9;
}

/* 安全设置区域 */
.security-section {
  background-color: white;
  margin-bottom: 20rpx;
  padding: 0 30rpx;
}

.section-title {
  font-size: 28rpx;
  color: #999999;
  padding: 30rpx 0 20rpx 0;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.security-item:last-child {
  border-bottom: none;
}

.danger-item .item-title {
  color: #FF4444;
}

.success-item .item-title {
  color: #4CAF50;
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 24rpx;
}

.password-icon {
  background-color: #E8F4FD;
}

.question-icon {
  background-color: #FFF4E6;
}

.phone-icon {
  background-color: #E8F8F5;
}

.email-icon {
  background-color: #FFF4E6;
}

.limit-icon {
  background-color: #F3E5F5;
}

.quickpay-icon {
  background-color: #E3F2FD;
}

.quickpay-limit-icon {
  background-color: #E3F2FD;
}

.notification-icon {
  background-color: #FFF4E6;
}

.risk-icon {
  background-color: #FFEBEE;
}

.log-icon {
  background-color: #E8F4FD;
}

.freeze-icon {
  background-color: #FFEBEE;
}

.unfreeze-icon {
  background-color: #E8F8F5;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.item-desc {
  font-size: 26rpx;
  color: #999999;
}

.item-right {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
}

.item-status {
  font-size: 28rpx;
  color: #4CAF50;
  margin-right: 20rpx;
}

.item-status.unbind {
  color: #FF9800;
}

.arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}
</style>

