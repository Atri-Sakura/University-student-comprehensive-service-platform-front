<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="nav-title">支付费用</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y :style="{ top: navHeight + 'px' }">
      <!-- 订单信息 -->
      <view class="order-info-card">
        <view class="card-title">
          <text class="title-text">📋 订单信息</text>
        </view>
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ orderInfo.orderNo }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ orderInfo.orderTime }}</text>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="goods-card">
        <view class="card-title">
          <text class="title-text">📦 商品信息</text>
        </view>
        <view class="goods-info">
          <image class="goods-image" :src="orderInfo.image" mode="aspectFill"></image>
          <view class="goods-detail">
            <text class="goods-name">{{ orderInfo.title }}</text>
            <text class="goods-price">¥{{ orderInfo.price }}</text>
          </view>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="price-card">
        <view class="price-item">
          <text class="price-label">商品价格</text>
          <text class="price-value">¥{{ orderInfo.price }}</text>
        </view>
        <view class="price-item">
          <text class="price-label">服务费</text>
          <text class="price-value">¥{{ orderInfo.serviceFee || '0' }}</text>
        </view>
        <view class="price-divider"></view>
        <view class="price-item total">
          <text class="price-label">合计</text>
          <text class="price-value total">¥{{ calculateTotalAmount() }}</text>
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="payment-card">
        <view class="card-title">
          <text class="title-text">💳 支付方式</text>
        </view>
        <view 
          v-for="(item, index) in paymentMethods" 
          :key="index"
          class="payment-item"
          @click="selectPayment(index)"
        >
          <view class="payment-left">
            <view class="payment-icon-box" :style="{ backgroundColor: item.color + '20', borderColor: item.color }">
              <text class="payment-icon" :style="{ color: item.color }">{{ item.icon }}</text>
            </view>
            <text class="payment-name">{{ item.name }}</text>
          </view>
          <view class="payment-radio" :class="{ active: selectedPayment === index }">
            <view v-if="selectedPayment === index" class="radio-dot"></view>
          </view>
        </view>
      </view>

      <!-- 占位空间 -->
      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <view class="total-box">
        <text class="total-label">实付款：</text>
        <text class="total-price">¥{{ calculateTotalAmount() }}</text>
      </view>
      <view class="submit-btn" @click="submitPayment">
        <text class="submit-text">确认支付</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js'
import { PAY_TYPES } from '@/api/config.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      orderNo: '',
      orderInfo: {
        orderNo: '',
        orderTime: '',
        title: '二手交易商品',
        price: '0',
        image: 'https://picsum.photos/200/200?random=31',
        serviceFee: '0'
      },
      selectedPayment: 3, // 默认选择支付宝支付（payType=3）
      paymentMethods: [],
      loading: false
    };
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
    
    // 初始化支付方式列表（排除面付选项，value=4）
    this.paymentMethods = PAY_TYPES.filter(item => item.value !== 4).map((item) => ({
      icon: item.icon,
      name: item.label,
      payType: item.value,
      color: this.getPaymentColor(item.value)
    }));

    // 获取订单号并加载详情
    if (options.orderNo) {
      this.orderNo = options.orderNo;
      console.log('支付页面接收到的订单号：', this.orderNo);
      this.loadOrderDetail();
    } else {
      console.error('未提供订单号');
      uni.showToast({
        title: '订单信息无效',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 2000);
    }
  },
  methods: {
    // 获取支付方式颜色
    getPaymentColor(payType) {
      const colors = {
        1: '#FF9800', // 余额
        2: '#07C160', // 微信
        3: '#1677FF', // 支付宝
        4: '#FF6B47'  // 面付
      };
      return colors[payType] || '#999999';
    },
    
    // 加载订单详情
    async loadOrderDetail() {
      try {
        uni.showLoading({
          title: '加载中...'
        });
        
        // 调用订单详情接口获取订单信息
        const result = await api.order.getSecondHandOrderDetail(this.orderNo);
        
        if (result && result.code === 200) {
          const data = result.data || {};
          this.orderInfo = {
            orderNo: data.orderNo || '',
            orderTime: data.createTime || '',
            title: data.goodsName || '二手交易商品',
            price: data.totalAmount || '0',
            image: data.mainImageUrl || 'https://picsum.photos/200/200?random=31',
            serviceFee: '0' // 服务费默认0
          };
        }
        
        uni.hideLoading();
      } catch (error) {
        console.error('加载订单详情失败：', error);
        uni.hideLoading();
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    },
    
    // 返回
    goBack() {
      uni.navigateBack();
    },
    
    // 选择支付方式
    selectPayment(index) {
      this.selectedPayment = index;
    },
    
    // 计算总金额
    calculateTotalAmount() {
      const price = parseFloat(this.orderInfo.price) || 0;
      const serviceFee = parseFloat(this.orderInfo.serviceFee) || 0;
      return (price + serviceFee).toFixed(2);
    },
    
    // 提交支付
    async submitPayment() {
      if (this.loading) return;
      
      const paymentMethod = this.paymentMethods[this.selectedPayment];
      
      uni.showModal({
        title: '确认支付',
        content: `确认使用${paymentMethod.name}支付¥${this.calculateTotalAmount()}吗？`,
        confirmText: '确认',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.processPayment();
          }
        }
      });
    },
    
    // 处理支付
    async processPayment() {
      try {
        this.loading = true;
        uni.showLoading({
          title: '支付处理中...'
        });
        
        console.log('支付订单号：', this.orderNo);
        
        // 调用二手商品模块的支付接口
        const result = await api.secondhandGoods.payOrder(this.orderNo);
        console.log('支付结果：', result);
        
        uni.hideLoading();
        
        if (result && result.code === 200) {
          // 支付成功
          uni.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 2000
          });
          
          // 支付成功后返回订单详情页
          setTimeout(() => {
            uni.navigateBack({
              delta: 1
            });
          }, 2000);
        } else {
          // 支付失败
          uni.showToast({
            title: result.message || '支付失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('支付失败：', error);
        uni.hideLoading();
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.loading = false;
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
}

/* 导航栏 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #89CFF0 0%, #5DCDFF 100%);
  z-index: 999;
}

.nav-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.nav-left,
.nav-right {
  width: 80rpx;
}

.back-icon {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 300;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

/* 内容区域 */
.content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 卡片通用样式 */
.order-info-card,
.goods-card,
.price-card,
.payment-card {
  background-color: #FFFFFF;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.card-title {
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

/* 订单信息 */
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 30rpx;
  color: #666666;
}

.info-value {
  font-size: 30rpx;
  color: #333333;
  text-align: right;
}

/* 商品信息 */
.goods-info {
  display: flex;
  align-items: center;
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  background-color: #F5F5F5;
}

.goods-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price {
  font-size: 36rpx;
  color: #FF6B47;
  font-weight: bold;
}

/* 价格明细 */
.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.price-label {
  font-size: 28rpx;
  color: #666666;
}

.price-value {
  font-size: 28rpx;
  color: #333333;
}

.price-item.total .price-label {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.price-item.total .price-value {
  font-size: 40rpx;
  color: #FF6B47;
  font-weight: bold;
}

.price-divider {
  height: 1rpx;
  background-color: #F0F0F0;
  margin: 16rpx 0;
}

/* 支付方式 */
.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-left {
  display: flex;
  align-items: center;
}

.payment-icon-box {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  border: 2rpx solid;
}

.payment-icon {
  font-size: 44rpx;
}

.payment-name {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.payment-radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #DDDDDD;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.payment-radio.active {
  border-color: #5DCDFF;
  background-color: #5DCDFF;
}

.radio-dot {
  width: 24rpx;
  height: 24rpx;
  background-color: #FFFFFF;
  border-radius: 50%;
}

/* 底部提交栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 999;
}

.total-box {
  flex: 1;
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 28rpx;
  color: #666666;
  margin-right: 8rpx;
}

.total-price {
  font-size: 40rpx;
  color: #FF6B47;
  font-weight: bold;
}

.submit-btn {
  width: 280rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #FF8A65 0%, #FF6B47 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 71, 0.4);
}

.submit-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 500;
}
</style>