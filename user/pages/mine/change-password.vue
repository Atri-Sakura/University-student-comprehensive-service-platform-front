<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">修改密码</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="form-item">
        <view class="form-label">
          <text class="label-text">原密码</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="password"
            placeholder="请输入原密码"
            v-model="formData.oldPassword"
            :password="true"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-text">新密码</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="password"
            placeholder="请输入新密码（6-20位）"
            v-model="formData.newPassword"
            :password="!showNewPassword"
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
            type="password"
            placeholder="请再次输入新密码"
            v-model="formData.confirmPassword"
            :password="!showConfirmPassword"
          />
          <view class="password-toggle" @click="toggleConfirmPassword">
            <text class="toggle-icon">{{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}</text>
          </view>
        </view>
      </view>

      <view class="password-tips">
        <text class="tips-text">密码要求：6-20位，包含字母和数字</text>
      </view>

      <view class="submit-button" @click="submitChange">
        <text class="submit-text">确认修改</text>
      </view>
    </view>
  </view>
</template>

<script>
import { safeNavigateBackForMine } from '@/utils/navigation.js';

export default {
  data() {
    return {
      formData: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      showNewPassword: false,
      showConfirmPassword: false
    };
  },
  methods: {
    goBack() {
      safeNavigateBackForMine('change-password');
    },
    toggleNewPassword() {
      this.showNewPassword = !this.showNewPassword;
    },
    toggleConfirmPassword() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    validatePassword() {
      // 验证原密码
      if (!this.formData.oldPassword) {
        uni.showToast({
          title: '请输入原密码',
          icon: 'none'
        });
        return false;
      }

      // 验证新密码
      if (!this.formData.newPassword) {
        uni.showToast({
          title: '请输入新密码',
          icon: 'none'
        });
        return false;
      }

      if (this.formData.newPassword.length < 6 || this.formData.newPassword.length > 20) {
        uni.showToast({
          title: '密码长度为6-20位',
          icon: 'none'
        });
        return false;
      }

      // 验证密码复杂度（至少包含字母和数字）
      const passwordReg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;
      if (!passwordReg.test(this.formData.newPassword)) {
        uni.showToast({
          title: '密码需包含字母和数字',
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

      // 验证新密码不能与原密码相同
      if (this.formData.oldPassword === this.formData.newPassword) {
        uni.showToast({
          title: '新密码不能与原密码相同',
          icon: 'none'
        });
        return false;
      }

      return true;
    },
    submitChange() {
      if (!this.validatePassword()) {
        return;
      }

      uni.showLoading({
        title: '修改中...'
      });

      // 这里应该调用API修改密码
      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading();
        
        // 模拟API响应
        // 实际应该根据API返回结果判断
        const success = true; // 假设成功
        
        if (success) {
          uni.showToast({
            title: '密码修改成功',
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
          uni.showToast({
            title: '原密码错误',
            icon: 'none'
          });
        }
      }, 1500);

      // 实际API调用示例：
      /*
      uni.request({
        url: 'https://your-api.com/user/change-password',
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + uni.getStorageSync('token'),
          'Content-Type': 'application/json'
        },
        data: {
          oldPassword: this.formData.oldPassword,
          newPassword: this.formData.newPassword
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data.code === 200) {
            uni.showToast({
              title: '密码修改成功',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || '修改失败',
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
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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
  background-color: #F8F8F8;
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #333333;
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

