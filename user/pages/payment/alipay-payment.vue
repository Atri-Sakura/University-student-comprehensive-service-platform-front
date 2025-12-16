<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">支付宝支付</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 支付信息 -->
    <view class="payment-info">
      <view class="payment-title">充值支付</view>
      <view class="payment-amount">¥{{ paymentAmount }}</view>
      <view class="payment-desc">正在自动跳转到支付宝支付页面...</view>
    </view>

    <!-- 支付状态 -->
    <view class="payment-status">
      <view class="status-item" :class="{ active: currentStep >= 1 }">
        <view class="status-icon">1</view>
        <text class="status-text">发起支付</text>
      </view>
      <view class="status-line" :class="{ active: currentStep >= 2 }"></view>
      <view class="status-item" :class="{ active: currentStep >= 2 }">
        <view class="status-icon">2</view>
        <text class="status-text">支付中</text>
      </view>
      <view class="status-line" :class="{ active: currentStep >= 3 }"></view>
      <view class="status-item" :class="{ active: currentStep >= 3 }">
        <view class="status-icon">3</view>
        <text class="status-text">支付完成</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view class="btn-secondary" @click="openAlipayPayment">
        <text class="btn-text">重新发起支付</text>
      </view>
      <view class="btn-primary" @click="checkPaymentStatus">
        <text class="btn-text">检查支付状态</text>
      </view>
    </view>

    <!-- 支付说明 -->
    <view class="payment-tips">
      <view class="tips-title">支付说明：</view>
      <text class="tips-text">1. 系统已自动跳转到支付宝支付页面</text>
      <text class="tips-text">2. 如未跳转，请点击"重新发起支付"</text>
      <text class="tips-text">3. 在支付宝页面完成支付操作</text>
      <text class="tips-text">4. 支付完成后点击"检查支付状态"确认</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      payPageHtml: '',
      paymentAmount: 0,
      currentStep: 1
    };
  },
  onLoad(options) {
    if (options.payPageHtml) {
      this.payPageHtml = decodeURIComponent(options.payPageHtml);
      console.log('接收到支付HTML:', this.payPageHtml.substring(0, 200) + '...');
    }
    if (options.amount) {
      this.paymentAmount = parseFloat(options.amount);
    }
    
    // 模仿recharge.html：页面加载后立即处理支付
    if (this.payPageHtml) {
      // 立即处理，不延迟（模仿recharge.html的即时性）
      this.autoProcessPayment();
    }
  },
  
  mounted() {
    // 页面挂载完成后的处理
    console.log('支付页面已挂载');
  },
  
  methods: {
    /**
     * 自动处理支付，模仿recharge.html的自动化流程
     */
    autoProcessPayment() {
      console.log('开始自动处理支付...');
      
      // 检查是否有支付HTML
      if (!this.payPageHtml) {
        uni.showToast({
          title: '支付信息缺失',
          icon: 'none'
        });
        return;
      }
      
      // 更新状态
      this.currentStep = 2;
      
      // 自动触发支付处理
      this.processPayPageHtml();
    },
    goBack() {
      uni.navigateBack();
    },
    
    openAlipayPayment() {
      if (!this.payPageHtml) {
        uni.showToast({
          title: '支付信息不存在',
          icon: 'none'
        });
        return;
      }
      
      // 模仿recharge.html的处理方式：直接处理HTML并自动提交
      this.processPayPageHtml();
    },
    
    /**
     * 处理支付页面HTML，完全模仿recharge.html的document.write()行为
     */
    processPayPageHtml() {
      console.log('处理支付页面HTML:', this.payPageHtml.substring(0, 200) + '...');
      
      if (!this.payPageHtml) {
        uni.showToast({
          title: '支付信息不存在',
          icon: 'none'
        });
        return;
      }
      
      // #ifdef H5
      try {
        // 完全模仿recharge.html的做法：直接替换整个页面内容
        console.log('模仿recharge.html: 使用document.write()替换页面内容');
        
        // 清空当前文档并写入支付宝HTML
        document.open();
        document.write(this.payPageHtml);
        document.close();
        
        console.log('已替换为支付宝页面内容');
        
      } catch (error) {
        console.error('直接替换页面失败:', error);
        // 如果直接替换失败，使用备用方案
        this.fallbackToNewWindow();
      }
      // #endif
      
      // 非H5环境使用备用方案
      // #ifndef H5
      this.fallbackToNewWindow();
      // #endif
    },
    
    /**
     * 备用方案：在新窗口打开或使用其他方式
     */
    fallbackToNewWindow() {
      console.log('使用备用方案处理支付');
      
      // #ifdef H5
      // 尝试在当前窗口直接跳转
      const blob = new Blob([this.payPageHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.location.href = url;
      // #endif
      
      // #ifdef APP-PLUS
      plus.runtime.openURL('data:text/html;charset=utf-8,' + encodeURIComponent(this.payPageHtml));
      // #endif
      
      // #ifdef MP
      uni.showModal({
        title: '提示',
        content: '请在浏览器中打开此页面进行支付',
        showCancel: false
      });
      // #endif
    },
    
    /**
     * 在新窗口打开支付页面（备用方案）
     */
    openPaymentInNewWindow() {
      // #ifdef H5
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(this.payPageHtml);
        newWindow.document.close();
        
        // 监听窗口关闭事件
        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkClosed);
            this.checkPaymentStatus();
          }
        }, 1000);
      }
      // #endif
      
      // #ifdef APP-PLUS
      plus.runtime.openURL('data:text/html;charset=utf-8,' + encodeURIComponent(this.payPageHtml));
      // #endif
      
      // #ifdef MP
      uni.showModal({
        title: '提示',
        content: '请在浏览器中打开此页面进行支付',
        showCancel: false
      });
      // #endif
    },
    
    async checkPaymentStatus() {
      uni.showLoading({
        title: '检查支付状态...'
      });
      
      try {
        // 这里可以调用后端接口检查支付状态
        // 暂时模拟检查结果
        setTimeout(() => {
          uni.hideLoading();
          
          // 模拟支付成功
          this.currentStep = 3;
          uni.showToast({
            title: '支付成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            uni.navigateBack({
              delta: 2 // 返回到充值页面的上一级
            });
          }, 1500);
        }, 2000);
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: '检查失败，请重试',
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

/* 支付信息 */
.payment-info {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 60rpx 40rpx;
  border-radius: 20rpx;
  text-align: center;
}

.payment-title {
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 20rpx;
}

.payment-amount {
  font-size: 72rpx;
  color: #FF6B35;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.payment-desc {
  font-size: 28rpx;
  color: #666666;
}

/* 支付状态 */
.payment-status {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 40rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.status-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background-color: #E0E0E0;
  color: #999999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.status-item.active .status-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.status-text {
  font-size: 24rpx;
  color: #999999;
}

.status-item.active .status-text {
  color: #333333;
  font-weight: 500;
}

.status-line {
  height: 2rpx;
  background-color: #E0E0E0;
  flex: 1;
  margin: 0 20rpx;
  margin-bottom: 40rpx;
}

.status-line.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 操作按钮 */
.action-buttons {
  margin: 20rpx 30rpx;
  display: flex;
  gap: 20rpx;
}

.btn-secondary, .btn-primary {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary {
  background-color: white;
  border: 2rpx solid #667eea;
}

.btn-secondary .btn-text {
  color: #667eea;
  font-size: 30rpx;
  font-weight: 500;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.btn-primary .btn-text {
  color: white;
  font-size: 30rpx;
  font-weight: bold;
}

.btn-secondary:active, .btn-primary:active {
  opacity: 0.8;
}

/* 支付说明 */
.payment-tips {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 40rpx;
  border-radius: 20rpx;
}

.tips-title {
  font-size: 30rpx;
  color: #333333;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.tips-text {
  display: block;
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 12rpx;
}
</style>
