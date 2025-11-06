<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-button" @click="goBack">
      </view>
      <view class="nav-title">添加提现账户</view>
      <view class="nav-right"></view>
    </view>
    
    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 账户类型选择 -->
      <view class="form-group">
        <view class="form-label">账户类型</view>
        <view class="account-types">
          <view 
            class="account-type-item" 
            :class="{ active: formData.accountType === 'bank' }"
            @click="formData.accountType = 'bank'"
          >
            <text class="type-icon">🏦</text>
            <text>银行卡</text>
          </view>
          <view 
            class="account-type-item" 
            :class="{ active: formData.accountType === 'alipay' }"
            @click="formData.accountType = 'alipay'"
          >
            <text class="type-icon">💰</text>
            <text>支付宝</text>
          </view>
          <view 
            class="account-type-item" 
            :class="{ active: formData.accountType === 'wechat' }"
            @click="formData.accountType = 'wechat'"
          >
            <text class="type-icon">💚</text>
            <text>微信</text>
          </view>
        </view>
      </view>
      
      <!-- 账户名称 -->
      <view class="form-group">
        <view class="form-label">账户名称</view>
        <input 
          type="text" 
          class="form-input" 
          v-model="formData.accountName" 
          placeholder="请输入账户名称" 
        />
      </view>
      
      <!-- 账号 -->
      <view class="form-group">
        <view class="form-label">账号</view>
        <input 
          type="text" 
          class="form-input" 
          v-model="formData.accountNumber" 
          placeholder="请输入账号" 
        />
      </view>
      
      <!-- 银行名称（仅银行卡类型显示） -->
      <view class="form-group" v-if="formData.accountType === 'bank'">
        <view class="form-label">银行名称</view>
        <input 
          type="text" 
          class="form-input" 
          v-model="formData.bankName" 
          placeholder="请输入银行名称" 
        />
      </view>
      
      <!-- 是否设为默认账户 -->
      <view class="form-group">
        <view class="form-label">默认账户</view>
        <view class="switch-group">
          <switch 
            v-model="formData.isDefault" 
            active-color="#07C160" 
            :checked="formData.isDefault"
          />
          <text class="switch-label">{{ formData.isDefault ? '是' : '否' }}</text>
        </view>
      </view>
      
      <!-- 备注 -->
      <view class="form-group">
        <view class="form-label">备注（选填）</view>
        <textarea 
          class="form-textarea" 
          v-model="formData.remark" 
          placeholder="请输入备注信息" 
          maxlength="200"
        ></textarea>
      </view>
    </view>
    
    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="submit-button" @click="submitForm" :disabled="submitting">
        {{ submitting ? '提交中...' : '添加账户' }}
      </button>
      <view class="notice">
        请确保账户信息准确无误，避免提现失败
      </view>
    </view>
  </view>
</template>

<script>
import { addWithdrawalAccount } from '../../utils/merchantFinanceApi.js';

export default {
  data() {
    return {
      formData: {
        accountType: 'bank',
        accountName: '',
        accountNumber: '',
        bankName: '',
        isDefault: 1, // 1表示是默认账户，0表示不是
        remark: ''
      },
      submitting: false
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    // 表单验证
    validateForm() {
      const { accountType, accountName, accountNumber, bankName } = this.formData;
      
      if (!accountName.trim()) {
        uni.showToast({ title: '请输入账户名称', icon: 'none' });
        return false;
      }
      
      if (!accountNumber.trim()) {
        uni.showToast({ title: '请输入账号', icon: 'none' });
        return false;
      }
      
      if (accountType === 'bank' && !bankName.trim()) {
        uni.showToast({ title: '银行卡账户必须填写银行名称', icon: 'none' });
        return false;
      }
      
      return true;
    },
    
    // 提交表单
    async submitForm() {
      if (!this.validateForm()) {
        return;
      }
      
      this.submitting = true;
      
      try {
        // 处理isDefault的值，将布尔值转换为数字
        const submitData = {
          ...this.formData,
          isDefault: this.formData.isDefault ? 1 : 0
        };
        
        const res = await addWithdrawalAccount(submitData);
        
        if (res.data.code === 200 || res.statusCode === 200) {
          uni.showToast({
            title: '账户添加成功',
            icon: 'success',
            success: () => {
              // 延迟返回上一页，让用户看到成功提示
              setTimeout(() => {
                uni.navigateBack();
              }, 1500);
            }
          });
        } else {
          uni.showToast({ title: res.data.msg || '添加失败', icon: 'none' });
        }
      } catch (error) {
        console.error('添加账户失败:', error);
        uni.showToast({ title: error.message || '网络异常，请重试', icon: 'none' });
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.page-container {
  padding-bottom: 100rpx;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44rpx 30rpx 20rpx;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
}

.nav-right {
  width: 60rpx;
}

.form-section {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 0 30rpx;
}

.form-group {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-group:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.form-input {
  width: 100%;
  font-size: 32rpx;
  padding: 0;
}

.form-textarea {
  width: 100%;
  font-size: 32rpx;
  min-height: 160rpx;
  padding: 0;
  border: none;
  resize: none;
}

.account-types {
  display: flex;
  gap: 30rpx;
}

.account-type-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
}

.account-type-item.active {
  border-color: #07C160;
  background-color: #f8fff9;
}

.type-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.switch-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.switch-label {
  margin-left: 20rpx;
  font-size: 32rpx;
  color: #666;
}

.submit-section {
  padding: 30rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
}

.submit-button {
  width: 100%;
  height: 96rpx;
  background-color: #07C160;
  color: #fff;
  font-size: 36rpx;
  border-radius: 48rpx;
  margin: 0;
  line-height: 96rpx;
}

.submit-button:disabled {
  background-color: #999;
}

.notice {
  text-align: center;
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}
</style>