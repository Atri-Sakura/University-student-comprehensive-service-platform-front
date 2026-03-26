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

    <!-- 信誉分区域 -->
    <view class="security-level-section">
      <view class="level-header">
        <text class="level-title">信誉分</text>
        <text class="level-score">{{ creditScore }}分</text>
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
            <text class="item-desc">{{ userInfo.phone || '未绑定手机号' }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="item-status" :class="{ 'unbind': !userInfo.phone }">
            {{ userInfo.phone ? '已绑定' : '未绑定' }}
          </text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="security-item">
        <view class="item-left">
          <view class="item-icon student-icon">🎓</view>
          <view class="item-content">
            <text class="item-title">学号</text>
            <text class="item-desc">{{ userInfo.studentId || '未设置学号' }}</text>
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
import { getUserInfo } from '@/api/user.js';

export default {
  data() {
    return {
      userInfo: {},
      creditScore: 0
    };
  },
  onLoad() {
    this.loadUserInfo();
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1,
        fail: (err) => {
          console.error('返回失败:', err);
          // 如果返回失败，尝试跳转到我的页面
          uni.reLaunch({
            url: '/pages/mine/mine'
          });
        }
      });
    },
    loadUserInfo() {
      // 从本地存储加载用户信息
      const storedInfo = uni.getStorageSync('userInfo');
      if (storedInfo) {
        this.userInfo = storedInfo;
        this.creditScore = storedInfo.creditScore || 0;
      }
      
      // 调用API获取真实用户信息
      getUserInfo().then(res => {
        if (res.code === 200 && res.data) {
          this.userInfo = res.data;
          this.creditScore = res.data.creditScore || 0;
          
          // 保存到本地存储
          uni.setStorageSync('userInfo', this.userInfo);
        }
      }).catch(err => {
        console.error('获取用户信息失败:', err);
      });
    },
    changePassword() {
      uni.navigateTo({
        url: '/pages/mine/change-password'
      });
    },
    bindPhone() {
      if (this.userInfo.phone) {
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
        title: this.userInfo.phone ? '更换手机号' : '绑定手机号',
        editable: true,
        placeholderText: '请输入手机号',
        content: this.userInfo.phone || '',
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
            this.userInfo.phone = res.content;
            // 更新本地存储
            uni.setStorageSync('userInfo', this.userInfo);
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
            this.userInfo.phone = '';
            // 更新本地存储
            uni.setStorageSync('userInfo', this.userInfo);
            uni.showToast({
              title: '解绑成功',
              icon: 'success'
            });
          }
        }
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

.student-icon {
  background-color: #E8F5E9;
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
