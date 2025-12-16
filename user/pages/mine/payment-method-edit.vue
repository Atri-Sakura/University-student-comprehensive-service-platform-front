<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">{{ isEdit ? '编辑支付方式' : '添加支付方式' }}</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 支付方式类型选择 -->
    <view class="type-section">
      <view class="section-title">选择支付方式类型</view>
      <view class="type-grid">
        <view 
          class="type-item" 
          v-for="(type, index) in paymentTypes" 
          :key="index"
          :class="{ active: formData.type === type.value }"
          @click="selectType(type.value)"
        >
          <text class="type-icon">{{ type.icon }}</text>
          <text class="type-name">{{ type.name }}</text>
        </view>
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="form-section" v-if="formData.type">
      <view class="form-item" v-if="formData.type === 'alipay'">
        <view class="form-label">
          <text class="label-text">支付宝账号</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="text"
            placeholder="请输入支付宝账号（手机号或邮箱）"
            v-model="formData.account"
            maxlength="50"
          />
        </view>
      </view>

      <view class="form-item" v-if="formData.type === 'wechat'">
        <view class="form-label">
          <text class="label-text">微信账号</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="text"
            placeholder="请输入微信账号"
            v-model="formData.account"
            maxlength="50"
          />
        </view>
      </view>

      <view class="form-item" v-if="formData.type === 'bank'">
        <view class="form-label">
          <text class="label-text">银行卡号</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="number"
            placeholder="请输入银行卡号"
            v-model="formData.account"
            maxlength="19"
          />
        </view>
      </view>

      <view class="form-item" v-if="formData.type === 'bank'">
        <view class="form-label">
          <text class="label-text">开户银行</text>
        </view>
        <view class="form-input-wrapper" @click="showBankPicker">
          <input
            class="form-input"
            type="text"
            placeholder="请选择开户银行"
            v-model="formData.bankName"
            disabled
          />
          <text class="arrow-icon">></text>
        </view>
      </view>

      <view class="form-item" v-if="formData.type === 'bank'">
        <view class="form-label">
          <text class="label-text">卡类型</text>
        </view>
        <view class="form-input-wrapper" @click="showCardTypePicker">
          <input
            class="form-input"
            type="text"
            placeholder="请选择卡类型"
            v-model="formData.cardType"
            disabled
          />
          <text class="arrow-icon">></text>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-text">姓名</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="text"
            placeholder="请输入真实姓名"
            v-model="formData.realName"
            maxlength="20"
          />
        </view>
      </view>

      <view class="form-item checkbox-item">
        <view class="checkbox-wrapper" @click="toggleDefault">
          <view class="checkbox" :class="{ checked: formData.isDefault }">
            <text class="checkbox-icon" v-if="formData.isDefault">✓</text>
          </view>
          <text class="checkbox-label">设为默认支付方式</text>
        </view>
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="bottom-actions">
      <view class="save-button" @click="saveMethod">
        <text class="save-text">保存</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isEdit: false,
      editIndex: -1,
      formData: {
        type: '',
        account: '',
        bankName: '',
        cardType: '',
        realName: '',
        isDefault: false
      },
      paymentTypes: [
        { value: 'alipay', name: '支付宝', icon: '💙' },
        { value: 'wechat', name: '微信支付', icon: '💚' },
        { value: 'bank', name: '银行卡', icon: '💳' }
      ],
      banks: [
        '中国工商银行', '中国建设银行', '中国银行', '中国农业银行',
        '交通银行', '招商银行', '浦发银行', '中信银行',
        '光大银行', '华夏银行', '民生银行', '广发银行',
        '平安银行', '兴业银行', '其他银行'
      ],
      cardTypes: ['储蓄卡', '信用卡']
    };
  },
  onLoad(options) {
    if (options.id && options.index !== undefined) {
      // 编辑模式
      this.isEdit = true;
      this.editIndex = parseInt(options.index);
      this.loadMethodData();
    } else {
      // 新增模式
      this.isEdit = false;
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    loadMethodData() {
      // 从本地存储加载支付方式数据
      const methods = uni.getStorageSync('paymentMethods') || [];
      if (methods[this.editIndex]) {
        this.formData = { ...methods[this.editIndex] };
      }
    },
    selectType(type) {
      this.formData.type = type;
      // 切换类型时清空相关字段
      if (type !== 'bank') {
        this.formData.bankName = '';
        this.formData.cardType = '';
      }
    },
    showBankPicker() {
      uni.showActionSheet({
        itemList: this.banks,
        success: (res) => {
          this.formData.bankName = this.banks[res.tapIndex];
        }
      });
    },
    showCardTypePicker() {
      uni.showActionSheet({
        itemList: this.cardTypes,
        success: (res) => {
          this.formData.cardType = this.cardTypes[res.tapIndex];
        }
      });
    },
    toggleDefault() {
      this.formData.isDefault = !this.formData.isDefault;
    },
    validateForm() {
      if (!this.formData.type) {
        uni.showToast({
          title: '请选择支付方式类型',
          icon: 'none'
        });
        return false;
      }

      if (!this.formData.account || this.formData.account.trim() === '') {
        const accountName = this.formData.type === 'alipay' ? '支付宝账号' : 
                          this.formData.type === 'wechat' ? '微信账号' : '银行卡号';
        uni.showToast({
          title: `请输入${accountName}`,
          icon: 'none'
        });
        return false;
      }

      // 银行卡号验证
      if (this.formData.type === 'bank') {
        if (this.formData.account.length < 16 || this.formData.account.length > 19) {
          uni.showToast({
            title: '请输入正确的银行卡号',
            icon: 'none'
          });
          return false;
        }

        if (!this.formData.bankName) {
          uni.showToast({
            title: '请选择开户银行',
            icon: 'none'
          });
          return false;
        }

        if (!this.formData.cardType) {
          uni.showToast({
            title: '请选择卡类型',
            icon: 'none'
          });
          return false;
        }
      }

      // 支付宝账号验证（手机号或邮箱）
      if (this.formData.type === 'alipay') {
        const phoneReg = /^1[3-9]\d{9}$/;
        const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!phoneReg.test(this.formData.account) && !emailReg.test(this.formData.account)) {
          uni.showToast({
            title: '请输入正确的支付宝账号',
            icon: 'none'
          });
          return false;
        }
      }

      if (!this.formData.realName || this.formData.realName.trim() === '') {
        uni.showToast({
          title: '请输入真实姓名',
          icon: 'none'
        });
        return false;
      }

      return true;
    },
    saveMethod() {
      if (!this.validateForm()) {
        return;
      }

      uni.showLoading({
        title: '保存中...'
      });

      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading();
        
        // 获取支付方式列表
        let methods = uni.getStorageSync('paymentMethods') || [];
        
        // 生成支付方式名称
        let methodName = '';
        if (this.formData.type === 'alipay') {
          methodName = '支付宝';
        } else if (this.formData.type === 'wechat') {
          methodName = '微信支付';
        } else if (this.formData.type === 'bank') {
          methodName = this.formData.bankName;
        }
        
        if (this.isEdit) {
          // 编辑模式：更新支付方式
          methods[this.editIndex] = {
            ...this.formData,
            id: methods[this.editIndex].id || Date.now(),
            name: methodName
          };
        } else {
          // 新增模式：添加支付方式
          const newMethod = {
            ...this.formData,
            id: Date.now(),
            name: methodName
          };
          
          // 如果设置为默认，取消其他默认
          if (newMethod.isDefault) {
            methods.forEach(item => {
              item.isDefault = false;
            });
          }
          
          methods.push(newMethod);
        }
        
        // 保存到本地存储
        uni.setStorageSync('paymentMethods', methods);
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        });
        
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }, 1000);

      // 实际API调用示例：
      /*
      uni.request({
        url: this.isEdit 
          ? 'https://your-api.com/payment-methods/update' 
          : 'https://your-api.com/payment-methods/add',
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + uni.getStorageSync('token'),
          'Content-Type': 'application/json'
        },
        data: this.formData,
        success: (res) => {
          uni.hideLoading();
          if (res.data.code === 200) {
            uni.showToast({
              title: '保存成功',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || '保存失败',
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

/* 支付方式类型选择 */
.type-section {
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

.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.type-item {
  height: 140rpx;
  background-color: #F8F8F8;
  border: 2rpx solid #E0E0E0;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.type-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
}

.type-icon {
  font-size: 48rpx;
}

.type-name {
  font-size: 26rpx;
  color: #333333;
}

.type-item.active .type-name {
  color: white;
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

.checkbox-item {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #F0F0F0;
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

.form-input[disabled] {
  color: #999999;
  background-color: #F5F5F5;
}

.arrow-icon {
  position: absolute;
  right: 20rpx;
  font-size: 32rpx;
  color: #CCCCCC;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #CCCCCC;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  background-color: white;
}

.checkbox.checked {
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  border-color: #4A90E2;
}

.checkbox-icon {
  font-size: 24rpx;
  color: white;
  font-weight: bold;
}

.checkbox-label {
  font-size: 28rpx;
  color: #333333;
}

/* 底部保存按钮 */
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

.save-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.save-button:active {
  opacity: 0.8;
}
</style>

