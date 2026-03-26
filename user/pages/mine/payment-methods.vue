<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">支付方式</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 支付方式列表 -->
    <view class="methods-section">
      <view class="section-header">
        <text class="section-title">我的支付方式</text>
        <text class="methods-count">共{{ paymentMethods.length }}个</text>
      </view>
      
      <view class="methods-list">
        <view 
          class="method-item" 
          v-for="(method, index) in paymentMethods" 
          :key="index"
          @click="selectMethod(method, index)"
        >
          <view class="method-left">
            <view class="method-icon-box" :style="{ backgroundColor: getMethodColor(method.type) + '20', borderColor: getMethodColor(method.type) }">
              <text class="method-icon" :style="{ color: getMethodColor(method.type) }">{{ getMethodIcon(method.type) }}</text>
            </view>
            <view class="method-info">
              <view class="method-header">
                <text class="method-name">{{ method.name }}</text>
                <view class="method-tags">
                  <text v-if="method.isDefault" class="tag default-tag">默认</text>
                </view>
              </view>
              <text class="method-detail">{{ getMethodDetail(method) }}</text>
            </view>
          </view>
          <view class="method-actions" @click.stop>
            <view class="action-btn" @click="editMethod(method, index)">
              <text class="action-icon">✎</text>
            </view>
            <view class="action-btn" @click="deleteMethod(method, index)">
              <text class="action-icon">🗑️</text>
            </view>
          </view>
        </view>

        <view v-if="paymentMethods.length === 0" class="empty-methods">
          <text class="empty-icon">💳</text>
          <text class="empty-text">暂无支付方式</text>
          <text class="empty-desc">点击下方按钮添加支付方式</text>
        </view>
      </view>
    </view>

    <!-- 底部添加按钮 -->
    <view class="bottom-actions">
      <view class="add-button" @click="addMethod">
        <text class="add-icon">+</text>
        <text class="add-text">添加支付方式</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      paymentMethods: [
        {
          id: 1,
          type: 'alipay',
          name: '支付宝',
          account: '138****5678',
          realName: '李同学',
          isDefault: true
        },
        {
          id: 2,
          type: 'wechat',
          name: '微信支付',
          account: 'wx_****5678',
          realName: '李同学',
          isDefault: false
        },
        {
          id: 3,
          type: 'bank',
          name: '中国工商银行',
          account: '6222 **** **** 5678',
          bankName: '中国工商银行',
          cardType: '储蓄卡',
          realName: '李同学',
          isDefault: false
        }
      ]
    };
  },
  onLoad() {
    this.loadPaymentMethods();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    loadPaymentMethods() {
      // 从本地存储加载支付方式
      const storedMethods = uni.getStorageSync('paymentMethods');
      if (storedMethods && storedMethods.length > 0) {
        this.paymentMethods = storedMethods;
      }
      
      // 这里应该调用API获取支付方式
      // this.fetchPaymentMethodsFromAPI();
    },
    getMethodIcon(type) {
      const iconMap = {
        'alipay': '💙',
        'wechat': '💚',
        'bank': '💳',
        'other': '💳'
      };
      return iconMap[type] || '💳';
    },
    getMethodColor(type) {
      const colorMap = {
        'alipay': '#1677FF',
        'wechat': '#07C160',
        'bank': '#FF9800',
        'other': '#666666'
      };
      return colorMap[type] || '#666666';
    },
    getMethodDetail(method) {
      if (method.type === 'bank') {
        return `${method.bankName} · ${method.cardType}`;
      }
      return method.account || '未设置';
    },
    selectMethod(method, index) {
      // 设置默认支付方式
      if (!method.isDefault) {
        this.setDefaultMethod(method, index);
      }
    },
    setDefaultMethod(method, index) {
      uni.showLoading({
        title: '设置中...'
      });
      
      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading();
        // 取消其他默认支付方式
        this.paymentMethods.forEach(item => {
          item.isDefault = false;
        });
        // 设置当前为默认
        this.paymentMethods[index].isDefault = true;
        this.savePaymentMethods();
        
        uni.showToast({
          title: '已设置为默认支付方式',
          icon: 'success'
        });
      }, 500);
      
      // 实际API调用示例：
      /*
      uni.request({
        url: 'https://your-api.com/payment-methods/set-default',
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + uni.getStorageSync('token'),
          'Content-Type': 'application/json'
        },
        data: {
          id: method.id
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data.code === 200) {
            this.paymentMethods.forEach(item => {
              item.isDefault = false;
            });
            this.paymentMethods[index].isDefault = true;
            this.savePaymentMethods();
            uni.showToast({
              title: '已设置为默认支付方式',
              icon: 'success'
            });
          } else {
            uni.showToast({
              title: res.data.message || '设置失败',
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
    },
    addMethod() {
      uni.navigateTo({
        url: '/pages/mine/payment-method-edit'
      });
    },
    editMethod(method, index) {
      uni.navigateTo({
        url: `/pages/mine/payment-method-edit?id=${method.id}&index=${index}`
      });
    },
    deleteMethod(method, index) {
      uni.showModal({
        title: '删除支付方式',
        content: `确定要删除"${method.name}"吗？`,
        confirmText: '删除',
        confirmColor: '#FF4444',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中...'
            });
            
            // 模拟API调用
            setTimeout(() => {
              uni.hideLoading();
              this.paymentMethods.splice(index, 1);
              this.savePaymentMethods();
              
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              });
            }, 500);
            
            // 实际API调用示例：
            /*
            uni.request({
              url: 'https://your-api.com/payment-methods/delete',
              method: 'POST',
              header: {
                'Authorization': 'Bearer ' + uni.getStorageSync('token'),
                'Content-Type': 'application/json'
              },
              data: {
                id: method.id
              },
              success: (res) => {
                uni.hideLoading();
                if (res.data.code === 200) {
                  this.paymentMethods.splice(index, 1);
                  this.savePaymentMethods();
                  uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                  });
                } else {
                  uni.showToast({
                    title: res.data.message || '删除失败',
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
      });
    },
    savePaymentMethods() {
      // 保存到本地存储
      uni.setStorageSync('paymentMethods', this.paymentMethods);
    }
  },
  onShow() {
    // 页面显示时重新加载（可能从编辑页面返回）
    this.loadPaymentMethods();
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

/* 支付方式列表 */
.methods-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: bold;
}

.methods-count {
  font-size: 26rpx;
  color: #999999;
}

.methods-list {
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

.method-icon-box {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  border: 2rpx solid;
}

.method-icon {
  font-size: 44rpx;
}

.method-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.method-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.method-name {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  margin-right: 16rpx;
}

.method-tags {
  display: flex;
  align-items: center;
}

.tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.default-tag {
  background-color: #E8F4FD;
  color: #4A90E2;
}

.method-detail {
  font-size: 26rpx;
  color: #666666;
}

.method-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8rpx;
}

.action-btn:active {
  background-color: #F5F5F5;
}

.action-icon {
  font-size: 32rpx;
  color: #666666;
}

/* 空状态 */
.empty-methods {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 32rpx;
  color: #999999;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #CCCCCC;
}

/* 底部添加按钮 */
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

.add-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 40rpx;
  color: white;
  margin-right: 12rpx;
  font-weight: bold;
}

.add-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.add-button:active {
  opacity: 0.8;
}
</style>

