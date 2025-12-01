<template>
  <view class="food-order-detail-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="navbar-title">订单详情</text>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 订单详情内容 -->
    <view class="order-detail-content">
      <!-- 商品信息卡片 -->
      <view class="order-card">
        <!-- 商品基本信息 -->
        <view class="product-header">
          <image class="product-image" :src="order.productImage" mode="aspectFill"></image>
          <text class="product-name">{{ order.productName }}</text>
        </view>
        
        <!-- 状态标签 -->
        <view class="status-badge">{{ order.status }}</view>
        
        <!-- 订单信息列表 -->
        <view class="order-info-list">
          <view class="info-item">
            <text class="info-label">订单号：</text>
            <text class="info-value">{{ order.orderId }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">下单时间：</text>
            <text class="info-value">{{ order.orderTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">支付方式：</text>
            <text class="info-value">{{ order.paymentMethod }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">收货地址：</text>
            <text class="info-value">{{ order.address }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系方式：</text>
            <text class="info-value">{{ order.contactInfo }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">{{ order.productName }}</text>
            <text class="info-value">x{{ order.quantity }}</text>
            <text class="info-value price">¥{{ order.price }}</text>
          </view>
        </view>
        
        <!-- 总金额 -->
        <view class="total-amount">
          <text class="total-label">总金额：</text>
          <text class="total-value">¥{{ order.price }}</text>
        </view>
        
        <!-- 配送骑手信息 -->
        <view class="rider-info">
          <text class="rider-label">配送骑手：</text>
          <text class="rider-value">{{ order.riderName }} ({{ order.riderPhone }})</text>
        </view>
      </view>
      
      <!-- 操作按钮区域 -->
      <view class="action-buttons">
        <view class="button-row">
          <button class="action-button" @click="applyAfterSale">申请售后</button>
          <button class="action-button" @click="contactRider">联系骑手</button>
        </view>
        <view class="button-row">
          <button class="action-button" @click="contactMerchant">联系商家</button>
          <button class="action-button" @click="buyAgain">再来一单</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      order: {
        orderId: '20250905183201',
        productName: '香酥鸡排饭',
        productImage: '/static/food1.jpg',
        orderTime: '2025-09-05 18:32',
        status: '已完成',
        paymentMethod: '微信支付',
        address: '北京市海淀区XX路88号',
        contactInfo: '138****8888',
        price: '18.80',
        quantity: 1,
        riderName: '王小明',
        riderPhone: '188****9999'
      }
    }
  },
  onLoad(options) {
    // 实际项目中，这里应该通过options.id获取订单ID，然后从服务器获取订单详情
    // 现在使用模拟数据
    console.log('订单ID:', options.id)
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 申请售后
    applyAfterSale() {
      // 跳转到售后申请页面
      uni.navigateTo({
        url: '/pages/orders/food-order-aftersale?orderId=' + this.order.orderId
      })
    },
    
    // 联系骑手
    contactRider() {
      uni.makePhoneCall({
        phoneNumber: this.order.riderPhone.replace(/\*/g, '1'),
        success: () => {
          console.log('联系骑手成功')
        },
        fail: () => {
          console.log('联系骑手失败')
        }
      })
    },
    
    // 联系商家
    contactMerchant() {
      uni.makePhoneCall({
        phoneNumber: '400-123-4567',
        success: () => {
          console.log('联系商家成功')
        },
        fail: () => {
          console.log('联系商家失败')
        }
      })
    },
    
    // 再来一单
    buyAgain() {
      uni.showToast({
        title: '已添加到购物车',
        icon: 'success'
      })
      // 实际项目中应该跳转到商品详情页或购物车页面
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/index/index'
        })
      }, 1500)
    }
  }
}
</script>

<style scoped>
/* 容器样式 */
.food-order-detail-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
}

/* 顶部导航栏样式 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 90rpx;
  background-color: #5DCDFF;
  padding: 0 30rpx;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  color: white;
  font-size: 40rpx;
  font-weight: bold;
}

.navbar-title {
  color: white;
  font-size: 36rpx;
  font-weight: bold;
}

.navbar-right {
  width: 60rpx;
}

/* 内容区域样式 */
.order-detail-content {
  padding: 120rpx 30rpx 30rpx 30rpx;
}

/* 订单卡片样式 */
.order-card {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
}

/* 商品基本信息 */
.product-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.product-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

/* 状态标签 */
.status-badge {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  font-size: 28rpx;
  color: #5DCDFF;
  background-color: #E3F2FD;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* 订单信息列表 */
.order-info-list {
  margin-top: 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  font-size: 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
  width: 200rpx;
}

.info-value {
  color: #333;
  flex: 1;
  text-align: right;
}

.info-value.price {
  color: #FF4444;
  font-weight: bold;
}

/* 总金额 */
.total-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  margin-top: 20rpx;
  font-size: 32rpx;
  border-top: 2rpx dashed #E0E0E0;
}

.total-label {
  color: #333;
}

.total-value {
  color: #FF4444;
  font-weight: bold;
  font-size: 34rpx;
}

/* 骑手信息 */
.rider-info {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-top: 20rpx;
  background-color: #F5F5F5;
  border-radius: 15rpx;
  font-size: 30rpx;
}

.rider-label {
  color: #666;
}

.rider-value {
  color: #333;
  flex: 1;
  margin-left: 10rpx;
}

/* 操作按钮区域 */
.action-buttons {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.button-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.button-row:last-child {
  margin-bottom: 0;
}

.action-button {
  flex: 1;
  background-color: #5DCDFF;
  color: white;
  border: none;
  padding: 0;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
  margin: 0 10rpx;
}
</style>