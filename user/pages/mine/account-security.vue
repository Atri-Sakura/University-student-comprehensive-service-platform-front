<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">账号安全</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 安全等级区域 -->
    <view class="security-level-section">
      <view class="level-header">
        <text class="level-title">账号安全等级</text>
        <text class="level-score">{{ securityScore }}分</text>
      </view>
      <view class="level-progress">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: securityScore + '%' }"></view>
        </view>
        <view class="level-text">{{ securityLevelText }}</view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="security-section">
      <view class="section-title">安全设置</view>
      
      <view class="security-item" @click="changePassword">
        <view class="item-left">
          <view class="item-icon password-icon">🔐</view>
          <view class="item-content">
            <text class="item-title">登录密码</text>
            <text class="item-desc">定期更换密码可提升账号安全</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-status">已设置</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="security-item" @click="bindPhone">
        <view class="item-left">
          <view class="item-icon phone-icon">📱</view>
          <view class="item-content">
            <text class="item-title">手机号</text>
            <text class="item-desc">{{ accountInfo.phone || '未绑定手机号' }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-status" :class="{ 'unbind': !accountInfo.phone }">
            {{ accountInfo.phone ? '已绑定' : '未绑定' }}
          </text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="security-item" @click="bindEmail">
        <view class="item-left">
          <view class="item-icon email-icon">📧</view>
          <view class="item-content">
            <text class="item-title">邮箱</text>
            <text class="item-desc">{{ accountInfo.email || '未绑定邮箱' }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-status" :class="{ 'unbind': !accountInfo.email }">
            {{ accountInfo.email ? '已绑定' : '未绑定' }}
          </text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <view class="security-section">
      <view class="section-title">登录管理</view>
      
      <view class="security-item" @click="viewLoginDevices">
        <view class="item-left">
          <view class="item-icon device-icon">💻</view>
          <view class="item-content">
            <text class="item-title">登录设备</text>
            <text class="item-desc">查看和管理登录设备</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-badge">{{ loginDeviceCount }}台设备</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="security-item" @click="viewLoginHistory">
        <view class="item-left">
          <view class="item-icon history-icon">📋</view>
          <view class="item-content">
            <text class="item-title">登录记录</text>
            <text class="item-desc">查看最近登录记录</text>
          </view>
        </view>
        <view class="item-right">
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <view class="security-section">
      <view class="section-title">账号操作</view>
      
      <view class="security-item danger-item" @click="logoutAllDevices">
        <view class="item-left">
          <view class="item-icon logout-icon">🚪</view>
          <view class="item-content">
            <text class="item-title">退出所有设备</text>
            <text class="item-desc">退出所有已登录设备，需要重新登录</text>
          </view>
        </view>
        <view class="item-right">
          <text class="arrow">></text>
        </view>
      </view>

      <view class="security-item danger-item" @click="deleteAccount">
        <view class="item-left">
          <view class="item-icon delete-icon">⚠️</view>
          <view class="item-content">
            <text class="item-title">注销账号</text>
            <text class="item-desc">注销后账号将无法恢复，请谨慎操作</text>
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
import { safeNavigateBackForMine } from '@/utils/navigation.js';

export default {
  data() {
    return {
      accountInfo: {
        phone: '138****5678',
        email: 'student@example.com'
      },
      loginDeviceCount: 2
    };
  },
  computed: {
    securityScore() {
      let score = 40; // 基础分（已设置密码）
      if (this.accountInfo.phone) score += 30;
      if (this.accountInfo.email) score += 30;
      return score;
    },
    securityLevelText() {
      if (this.securityScore >= 80) return '安全';
      if (this.securityScore >= 60) return '中等';
      return '较低';
    }
  },
  onLoad() {
    this.loadAccountInfo();
  },
  methods: {
    goBack() {
      safeNavigateBackForMine('account-security');
    },
    loadAccountInfo() {
      // 从本地存储加载账号信息
      const storedInfo = uni.getStorageSync('accountInfo');
      if (storedInfo) {
        this.accountInfo = { ...this.accountInfo, ...storedInfo };
      }
    },
    changePassword() {
      uni.navigateTo({
        url: '/pages/mine/change-password'
      });
    },
    bindPhone() {
      if (this.accountInfo.phone) {
        // 已绑定，可以解绑或更换
        uni.showActionSheet({
          itemList: ['更换手机号', '解绑手机号'],
          success: (res) => {
            if (res.tapIndex === 0) {
              this.updatePhone();
            } else {
              this.unbindPhone();
            }
          }
        });
      } else {
        // 未绑定，进行绑定
        this.updatePhone();
      }
    },
    updatePhone() {
      uni.showModal({
        title: this.accountInfo.phone ? '更换手机号' : '绑定手机号',
        editable: true,
        placeholderText: '请输入手机号',
        content: this.accountInfo.phone || '',
        success: (res) => {
          if (res.confirm && res.content) {
            // 验证手机号格式
            const phoneReg = /^1[3-9]\d{9}$/;
            if (!phoneReg.test(res.content)) {
              uni.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
              });
              return;
            }
            // 这里应该发送验证码验证
            this.accountInfo.phone = res.content;
            this.saveAccountInfo();
            uni.showToast({
              title: '操作成功',
              icon: 'success'
            });
          }
        }
      });
    },
    unbindPhone() {
      uni.showModal({
        title: '解绑手机号',
        content: '确定要解绑手机号吗？解绑后可能影响账号安全',
        success: (res) => {
          if (res.confirm) {
            this.accountInfo.phone = '';
            this.saveAccountInfo();
            uni.showToast({
              title: '解绑成功',
              icon: 'success'
            });
          }
        }
      });
    },
    bindEmail() {
      if (this.accountInfo.email) {
        // 已绑定，可以解绑或更换
        uni.showActionSheet({
          itemList: ['更换邮箱', '解绑邮箱'],
          success: (res) => {
            if (res.tapIndex === 0) {
              this.updateEmail();
            } else {
              this.unbindEmail();
            }
          }
        });
      } else {
        // 未绑定，进行绑定
        this.updateEmail();
      }
    },
    updateEmail() {
      uni.showModal({
        title: this.accountInfo.email ? '更换邮箱' : '绑定邮箱',
        editable: true,
        placeholderText: '请输入邮箱',
        content: this.accountInfo.email || '',
        success: (res) => {
          if (res.confirm && res.content) {
            // 验证邮箱格式
            const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailReg.test(res.content)) {
              uni.showToast({
                title: '请输入正确的邮箱',
                icon: 'none'
              });
              return;
            }
            this.accountInfo.email = res.content;
            this.saveAccountInfo();
            uni.showToast({
              title: '操作成功',
              icon: 'success'
            });
          }
        }
      });
    },
    unbindEmail() {
      uni.showModal({
        title: '解绑邮箱',
        content: '确定要解绑邮箱吗？解绑后可能影响账号安全',
        success: (res) => {
          if (res.confirm) {
            this.accountInfo.email = '';
            this.saveAccountInfo();
            uni.showToast({
              title: '解绑成功',
              icon: 'success'
            });
          }
        }
      });
    },
    viewLoginDevices() {
      uni.navigateTo({
        url: '/pages/mine/login-devices'
      });
    },
    viewLoginHistory() {
      uni.navigateTo({
        url: '/pages/mine/login-history'
      });
    },
    logoutAllDevices() {
      uni.showModal({
        title: '退出所有设备',
        content: '确定要退出所有已登录设备吗？退出后需要重新登录',
        success: (res) => {
          if (res.confirm) {
            // 调用API退出所有设备
            uni.showLoading({
              title: '正在退出...'
            });
            setTimeout(() => {
              uni.hideLoading();
              uni.showToast({
                title: '已退出所有设备',
                icon: 'success'
              });
              // 可以选择是否跳转到登录页
              // uni.reLaunch({ url: '/pages/login/login' });
            }, 1500);
          }
        }
      });
    },
    deleteAccount() {
      uni.showModal({
        title: '注销账号',
        content: '注销后账号将永久删除，所有数据无法恢复，确定要继续吗？',
        confirmText: '确定注销',
        confirmColor: '#FF4444',
        success: (res) => {
          if (res.confirm) {
            // 再次确认
            uni.showModal({
              title: '最后确认',
              content: '注销账号是不可逆操作，请再次确认是否注销',
              confirmText: '确认注销',
              confirmColor: '#FF4444',
              success: (res2) => {
                if (res2.confirm) {
                  uni.showLoading({
                    title: '正在注销...'
                  });
                  // 调用注销API
                  setTimeout(() => {
                    uni.hideLoading();
                    // 清除本地数据
                    uni.removeStorageSync('userInfo');
                    uni.removeStorageSync('token');
                    uni.removeStorageSync('accountInfo');
                    uni.showToast({
                      title: '账号已注销',
                      icon: 'success'
                    });
                    // 跳转到登录页
                    setTimeout(() => {
                      uni.reLaunch({ url: '/pages/login/login' });
                    }, 1500);
                  }, 2000);
                }
              }
            });
          }
        }
      });
    },
    saveAccountInfo() {
      // 保存到本地存储
      uni.setStorageSync('accountInfo', this.accountInfo);
      // 这里可以调用API保存到服务器
      // this.updateAccountInfoAPI(this.accountInfo);
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

.phone-icon {
  background-color: #E8F8F5;
}

.email-icon {
  background-color: #FFF4E6;
}

.device-icon {
  background-color: #F3E5F5;
}

.history-icon {
  background-color: #E3F2FD;
}

.logout-icon {
  background-color: #FFEBEE;
}

.delete-icon {
  background-color: #FFEBEE;
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

.item-badge {
  font-size: 26rpx;
  color: #666666;
  background-color: #F5F5F5;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  margin-right: 20rpx;
}

.arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}
</style>
