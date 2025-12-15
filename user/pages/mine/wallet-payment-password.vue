<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">{{ isModify ? '修改支付密码' : '设置支付密码' }}</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="form-item" v-if="isModify">
        <view class="form-label">
          <text class="label-text">原支付密码</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="text"
            placeholder="请输入原支付密码"
            v-model="formData.oldPassword"
            :password="true"
            maxlength="6"
            @input="onOldPasswordInput"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-text">新支付密码</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="text"
            placeholder="请输入6位数字密码"
            v-model="formData.newPassword"
            :password="!showNewPassword"
            maxlength="6"
            @input="onPasswordInput"
          />
          <view class="password-toggle" @click="toggleNewPassword">
            <text class="toggle-icon">{{ showNewPassword ? '👁️' : '👁️‍🗨️' }}</text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-text">确认新密码</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="text"
            placeholder="请再次输入新密码"
            v-model="formData.confirmPassword"
            :password="!showConfirmPassword"
            maxlength="6"
            @input="onConfirmPasswordInput"
          />
          <view class="password-toggle" @click="toggleConfirmPassword">
            <text class="toggle-icon">{{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}</text>
          </view>
        </view>
      </view>

      <view class="password-tips">
        <text class="tips-text">支付密码为6位数字，用于支付验证</text>
      </view>

      <view class="submit-button" @click="submitChange">
        <text class="submit-text">确认{{ isModify ? '修改' : '设置' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { setPaymentPassword, checkPaymentPasswordStatus } from '@/api/wallet.js';

export default {
  data() {
    return {
      isModify: false,
      formData: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      showNewPassword: false,
      showConfirmPassword: false
    };
  },
  onLoad(options) {
    // 根据传入参数判断是设置还是修改
    if (options.action === 'modify') {
      this.isModify = true;
    } else if (options.action === 'set') {
      this.isModify = false;
    } else {
      // 如果没有传参数，检查本地存储判断
      this.checkPasswordStatus();
    }
  },
  methods: {
    goBack() {
      // 检查页面栈，如果只有一个页面（刷新后的情况），则跳转到钱包安全页面
      const pages = getCurrentPages();
      if (pages.length <= 1) {
        // 页面栈只有一个页面，直接跳转到钱包安全页面
        uni.redirectTo({
          url: '/pages/mine/wallet-security'
        });
      } else {
        // 正常返回上一页
        uni.navigateBack();
      }
    },
    toggleNewPassword() {
      this.showNewPassword = !this.showNewPassword;
    },
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    onOldPasswordInput(e) {
      // 只允许输入数字
      this.formData.oldPassword = e.detail.value.replace(/[^\d]/g, '');
    },
    onPasswordInput(e) {
      // 只允许输入数字
      this.formData.newPassword = e.detail.value.replace(/[^\d]/g, '');
    },
    onConfirmPasswordInput(e) {
      // 只允许输入数字
      this.formData.confirmPassword = e.detail.value.replace(/[^\d]/g, '');
    },
    validatePassword() {
      // 验证原密码（修改时）
      if (this.isModify && !this.formData.oldPassword) {
        uni.showToast({
          title: '请输入原支付密码',
          icon: 'none'
        });
        return false;
      }

      // 验证新密码
      if (!this.formData.newPassword) {
        uni.showToast({
          title: '请输入新支付密码',
          icon: 'none'
        });
        return false;
      }

      if (this.formData.newPassword.length !== 6) {
        uni.showToast({
          title: '支付密码必须为6位数字',
          icon: 'none'
        });
        return false;
      }

      // 验证是否为纯数字
      const numberReg = /^\d{6}$/;
      if (!numberReg.test(this.formData.newPassword)) {
        uni.showToast({
          title: '支付密码必须为6位数字',
          icon: 'none'
        });
        return false;
      }

      // 验证两次输入的新密码是否一致
      if (this.formData.newPassword !== this.formData.confirmPassword) {
        uni.showToast({
          title: '两次输入的密码不一致',
          icon: 'none'
        });
        return false;
      }

      // 验证新密码不能与原密码相同（修改时）
      if (this.isModify && this.formData.oldPassword === this.formData.newPassword) {
        uni.showToast({
          title: '新密码不能与原密码相同',
          icon: 'none'
        });
        return false;
      }

      return true;
    },
    async checkPasswordStatus() {
      // 检查用户是否已设置支付密码
      try {
        const result = await checkPaymentPasswordStatus();
        if (result && result.code === 200 && result.data) {
          this.isModify = result.data.hasPaymentPassword || false;
        }
      } catch (error) {
        console.error('检查支付密码状态失败:', error);
        // 默认为设置模式
        this.isModify = false;
      }
    },
    async submitChange() {
      if (!this.validatePassword()) {
        return;
      }

      try {
        uni.showLoading({
          title: '处理中...'
        });

        // 调用真实API
        const result = await setPaymentPassword(
          this.isModify ? this.formData.oldPassword : '',
          this.formData.newPassword
        );

        if (result && result.code === 200) {
          uni.hideLoading();
          
          // 更新安全信息
          const securityInfo = uni.getStorageSync('walletSecurityInfo') || {};
          securityInfo.hasPaymentPassword = true;
          uni.setStorageSync('walletSecurityInfo', securityInfo);
          
          uni.showToast({
            title: this.isModify ? '密码修改成功' : '密码设置成功',
            icon: 'success',
            duration: 2000
          });
          
          // 清空表单
          this.formData = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 2000);
        } else {
          uni.hideLoading();
          uni.showToast({
            title: result?.msg || '操作失败',
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

/* 表单区域 */
.form-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-item:last-of-type {
  margin-bottom: 0;
}

.form-label {
  margin-bottom: 20rpx;
}

.label-text {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.form-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  flex: 1;
  height: 88rpx;
  padding: 0 20rpx;
  padding-right: 80rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  font-size: 36rpx;
  color: #333333;
  letter-spacing: 8rpx;
  text-align: center;
}

.password-toggle {
  position: absolute;
  right: 20rpx;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon {
  font-size: 36rpx;
}

.password-tips {
  margin-top: 20rpx;
  margin-bottom: 40rpx;
}

.tips-text {
  font-size: 24rpx;
  color: #999999;
}

.submit-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
}

.submit-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.submit-button:active {
  opacity: 0.8;
}
</style>

