<template>
  <view class="second-hand-order-detail-container">
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
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 错误状态 -->
      <view v-else-if="error" class="error-container">
        <text class="error-text">{{ error }}</text>
        <button class="retry-button" @click="getOrderDetail">重试</button>
      </view>
      
      <!-- 订单信息 -->
      <view v-else>
        <!-- 订单状态卡片 -->
        <view class="status-card">
          <text :class="['order-status', statusClass(order.orderStatus)]">{{ orderStatusText(order.orderStatus) }}</text>
        </view>
        
        <!-- 订单信息卡片 -->
        <view class="info-card">
          <view class="info-header">
            <text class="info-icon">📋</text>
            <text class="info-title">订单信息</text>
          </view>
          <view class="info-item">
            <text class="info-label">订单编号</text>
            <text class="info-value">{{ order.orderNo }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">创建时间</text>
            <text class="info-value">{{ order.createTime }}</text>
          </view>
          <view class="info-item" v-if="order.payTime">
            <text class="info-label">支付时间</text>
            <text class="info-value">{{ order.payTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">商品名称</text>
            <text class="info-value">{{ order.goodsName || '二手交易商品' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">商品分类</text>
            <text class="info-value">{{ getCategoryText(order.category) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">商品价格</text>
            <text class="info-value price">¥{{ order.goodsPrice }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">实付金额</text>
            <text class="info-value price">¥{{ order.payAmount }}</text>
          </view>
          <view class="info-item" v-if="order.description">
            <text class="info-label">商品描述</text>
            <text class="info-value">{{ order.description }}</text>
          </view>
        </view>
        
        <!-- 商品图片卡片 -->
        <view class="image-card" v-if="order.mainImageUrl">
          <view class="info-header">
            <text class="info-icon">�️</text>
            <text class="info-title">商品图片</text>
          </view>
          <image class="goods-image" :src="order.mainImageUrl" mode="aspectFill" @click="previewImage"></image>
        </view>
        
        <!-- 交易对方信息卡片 -->
        <view class="user-card">
          <view class="info-header">
            <text class="info-icon">👤</text>
            <text class="info-title">交易对方</text>
          </view>
          <view class="info-item">
            <text class="info-label">用户名</text>
            <text class="info-value">{{ order.counterpartUsername || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系电话</text>
            <text class="info-value">{{ order.counterpartPhone || '未知' }}</text>
          </view>
          <view class="info-item" v-if="order.counterpartAvatar">
            <text class="info-label">头像</text>
            <image class="avatar-image" :src="order.counterpartAvatar" mode="aspectFill"></image>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js'

export default {
  data() {
    return {
      orderNo: '',
      order: {
        orderNo: '',
        orderStatus: 0,
        createTime: '',
        pickAddress: '',
        totalAmount: 0,
        buyerName: '',
        buyerPhone: '',
        sellerName: '',
        sellerPhone: ''
      },
      loading: true,
      error: ''
    }
  },
  onLoad(options) {
    // 从options中获取订单号
    if (options.orderNo) {
      this.orderNo = options.orderNo
      // 调用后端API获取订单详情
      this.getOrderDetail()
    } else {
      console.error('未提供订单号')
      this.error = '未提供订单号'
      this.loading = false
    }
  },
  methods: {
    // 获取订单详情
    async getOrderDetail() {
      try {
        this.loading = true
        const res = await api.order.getSecondHandOrderDetail(this.orderNo)
        
        if (res && res.code === 200) {
          // 设置订单数据
          this.order = res.data || {}
          console.log('完整订单数据:', this.order)
          console.log('商品详情列表:', this.order.orderSecondhandDetailList)
          if (this.order.orderSecondhandDetailList && this.order.orderSecondhandDetailList[0]) {
            console.log('商品名称:', this.order.orderSecondhandDetailList[0].goodsName)
          }
        } else {
          console.error('获取订单详情失败:', res.message)
          this.error = res.message || '获取订单详情失败'
        }
      } catch (err) {
        console.error('获取订单详情出错:', err)
        this.error = '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    
    // 订单状态样式
    statusClass(status) {
      const statusMap = {
        1: 'status-pending',   // 待支付
        2: 'status-paid',      // 已支付
        3: 'status-completed', // 已完成
        4: 'status-cancelled'  // 已取消
      }
      return statusMap[status] || ''
    },
    
    // 订单状态文本
    orderStatusText(status) {
      const statusMap = {
        1: '待支付',
        2: '已支付',
        3: '已完成',
        4: '已取消'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 商品分类文本
    getCategoryText(category) {
      const categoryMap = {
        'ELECTRONICS': '电子产品',
        'BOOKS': '图书',
        'CLOTHING': '服装',
        'FURNITURE': '家具',
        'SPORTS': '体育用品',
        'OTHER': '其他'
      }
      return categoryMap[category] || category || '未分类'
    },
    
    // 预览图片
    previewImage() {
      if (this.order.mainImageUrl) {
        uni.previewImage({
          urls: [this.order.mainImageUrl],
          current: this.order.mainImageUrl
        })
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.second-hand-order-detail-container {
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

/* 订单详情内容样式 */
.order-detail-content {
  padding: 120rpx 30rpx 30rpx 30rpx;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 32rpx;
  color: #999;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.error-text {
  font-size: 32rpx;
  color: #FF4444;
  margin-bottom: 30rpx;
}

.retry-button {
  background-color: #5DCDFF;
  color: white;
  border: none;
  padding: 0 60rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: 35rpx;
  font-size: 28rpx;
  font-weight: 500;
}

/* 卡片样式 */
.info-card, .user-card, .image-card {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 卡片头部样式 */
.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 25rpx;
}

.info-icon {
  font-size: 40rpx;
  margin-right: 15rpx;
}

.info-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

/* 信息项样式 */
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
  color: #666;
}

.info-value {
  font-size: 30rpx;
  color: #333;
  text-align: right;
}

/* 价格样式 */
.info-value.price {
  color: #FF4444;
  font-weight: bold;
}

/* 状态卡片样式 */
.status-card {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  text-align: center;
}

.order-status {
  font-size: 36rpx;
  font-weight: bold;
  padding: 10rpx 30rpx;
  border-radius: 25rpx;
  display: inline-block;
}

.status-completed {
  color: #5DCDFF;
  background-color: #E3F2FD;
}

.status-selling {
  color: #4CAF50;
  background-color: #E8F5E9;
}

.status-pending {
  color: #FF9800;
  background-color: #FFF3E0;
}

.status-paid {
  color: #2196F3;
  background-color: #E3F2FD;
}

.status-cancelled {
  color: #999;
  background-color: #F5F5F5;
}

/* 商品图片样式 */
.goods-image {
  width: 100%;
  height: 400rpx;
  border-radius: 10rpx;
  margin-top: 20rpx;
}

/* 头像样式 */
.avatar-image {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
}
</style>