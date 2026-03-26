<template>
  <view class="order-detail-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="navbar-title">订单详情</view>
      <view class="navbar-right"></view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载订单信息...</text>
    </view>

    <!-- 错误信息 -->
    <view v-else-if="error" class="error-container">
      <text class="error-icon">❌</text>
      <text class="error-text">{{ error }}</text>
      <button class="retry-button" @click="loadOrderData">重试</button>
    </view>

    <!-- 空状态 -->
    <view v-else-if="!Object.keys(orderInfo).length" class="empty-container">
      <text class="empty-icon">📭</text>
      <text class="empty-text">订单不存在或已被删除</text>
    </view>

    <!-- 订单内容 -->
    <view v-else>
      <!-- 订单状态卡片 -->
      <view class="status-card">
        <view class="status-header">
          <text class="status-label">订单状态</text>
          <text class="status-value" :class="getOrderStatusClass()">{{ getOrderStatusText() }}</text>
        </view>
        <text class="status-desc">{{ getOrderStatusDesc() }}</text>
        <text class="complete-time" v-if="orderProgress.length > 0">完成时间：{{ orderProgress[0].time }}</text>
      </view>

    <!-- 订单信息卡片 -->
    <view class="info-card">
      <view class="info-header">
        <text class="info-icon">📋</text>
        <text class="info-title">订单信息</text>
      </view>
      <view class="info-item">
        <text class="info-label">订单编号</text>
        <text class="info-value">{{ orderInfo.orderNo }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">任务内容</text>
        <text class="info-value">{{ orderData && orderData.orderErrandDetailList && orderData.orderErrandDetailList.length > 0 ? orderData.orderErrandDetailList[0].goodsDesc : '暂无任务内容' }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">任务报酬</text>
        <text class="info-value reward">{{ orderInfo.reward }}</text>
      </view>
    </view>

    <!-- 地址信息卡片 -->
    <view class="info-card">
      <view class="info-header">
        <text class="info-icon">📍</text>
        <text class="info-title">地址信息</text>
      </view>
      <view class="info-item">
        <text class="info-label">出发地</text>
        <text class="info-value">{{ orderData.pickAddress || '未设置' }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">收货地址</text>
        <text class="info-value">{{ orderData.deliverAddress || '未设置' }}</text>
      </view>
    </view>



    <!-- 配送员信息卡片 -->
    <view class="delivery-card">
      <view class="info-header">
        <text class="info-icon">👤</text>
        <text class="info-title">配送员信息</text>
      </view>
      <view class="delivery-info">
        <view class="delivery-avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="delivery-details">
          <text class="delivery-name">
            {{ deliveryInfo.name }}
            <text v-if="deliveryInfo.phone" class="delivery-phone">({{ deliveryInfo.phone }})</text>
          </text>
          <view class="delivery-rating">
            <text v-for="i in 5" :key="i" class="star" :class="{ filled: i <= Math.round(deliveryInfo.rating || 0) }">★</text>
            <text class="rating-score">{{ deliveryInfo.rating || 0 }}</text>
          </view>
        </view>
        <button class="contact-button" @click="contactDelivery">联系</button>
      </view>
    </view>

      <!-- 底部操作区域已移除，评价功能在订单列表页面 -->
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js'

export default {
  data() {
    return {
      orderNo: '',
      loading: false,
      error: '',
      orderData: null, // 直接保存API返回的订单数据
      orderInfo: {},
      deliveryInfo: {},
      orderProgress: [] // 订单进度数组
    };
  },
  onLoad(options) {
    // 接收订单号参数，兼容orderId和orderNo
    if (options.orderId) {
      this.orderNo = options.orderId;
    } else if (options.orderNo) {
      this.orderNo = options.orderNo;
    }
    
    console.log('订单号:', this.orderNo);
    
    // 如果未提供订单号，使用测试订单号作为备选
    if (!this.orderNo) {
      this.orderNo = 'TEST123456789';
      console.warn('未提供订单号，使用测试订单号:', this.orderNo);
    }
    
    // 加载订单数据
    this.loadOrderData();
  },
  methods: {
    // 加载订单数据
    async loadOrderData() {
      try {
        this.loading = true
        this.error = ''
        
        // 检查订单号是否为空
        if (!this.orderNo) {
          throw new Error('订单号不能为空')
        }
        
        // 调用API获取订单详情
          const res = await api.order.getErrandOrderDetail(this.orderNo)
        
        console.log('API响应结果:', res)
        
        if (res && res.code === 200) {
          // 检查响应中是否包含数据
          if (res.data) {
            // 设置订单数据
            this.orderData = res.data || {};
            const orderData = this.orderData;
            
            // 调试：检查orderErrandDetailList数组
            console.log('orderErrandDetailList:', orderData.orderErrandDetailList);
            
            // 注意：API返回的是orderErrandDetailList（复数形式带List后缀），这是一个数组
            const errandDetail = orderData.orderErrandDetailList && orderData.orderErrandDetailList.length > 0 ? orderData.orderErrandDetailList[0] : {};
            console.log('errandDetail:', errandDetail);
            console.log('goodsDesc:', errandDetail.goodsDesc || '不存在');
            
            // 直接从errandDetail中提取goodsDesc字段作为任务内容
            let taskContent = errandDetail.goodsDesc || '';
            
            // 提取订单信息
            this.orderInfo = {
              orderNo: orderData.orderNo || this.orderNo,
              // 使用解析后的goodsDesc字段作为任务内容
              taskContent: taskContent || orderData.taskContent || orderData.taskDesc || '',
              reward: this.formatOrderAmount(orderData)
            }
            
            // 调试：检查最终的orderInfo
            console.log('最终的orderInfo:', this.orderInfo)
            
            // 提取配送员信息
            this.deliveryInfo = {
              name: orderData.deliveryName || orderData.riderName || orderData.riderNickname || '',
              rating: 0, // 默认评分为0，后续通过接口获取
              phone: orderData.deliveryPhone || orderData.riderPhone || '',
              riderId: orderData.riderId || null
            }
            
            // 如果有骑手ID，获取骑手的平均评分
            if (this.deliveryInfo.riderId) {
              this.loadRiderRating(this.deliveryInfo.riderId)
            }
            

          } else {
            // API返回成功但没有数据，使用默认数据并显示提示
            console.warn('API返回成功但没有数据')
            this.orderInfo = {
              orderNo: this.orderNo,
              taskContent: '暂无任务内容',
              deliveryRoute: '暂无配送路线',
              reward: '¥0.00'
            }
            this.deliveryInfo = {
              name: '暂无配送员信息',
              rating: '',
              phone: ''
            }
            this.orderProgress = [
              {
                time: new Date().toLocaleString(),
                text: '订单数据获取成功',
                status: 'completed',
                icon: '✓'
              }
            ]
          }
        } else {
          throw new Error(res.message || res.msg || '获取订单详情失败')
        }
      } catch (err) {
        console.error('获取订单详情出错:', err)
        this.error = err.message || '网络错误，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    

    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 联系配送员
    contactDelivery() {
      console.log('联系配送员:', this.deliveryInfo.name);
      uni.makePhoneCall({
        phoneNumber: this.deliveryInfo.phone || '13800138000',
        success() {
          console.log('拨打电话成功');
        },
        fail(err) {
          console.log('拨打电话失败:', err);
          uni.showToast({
            title: '拨打电话失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 获取订单状态类名
    getOrderStatusClass() {
      if (!this.orderData) return '';
      const status = this.orderData.orderStatus;
      const statusMap = {
        1: 'status-waiting',   // 待接单
        2: 'status-progress',  // 待取货
        3: 'status-progress',  // 配送中
        4: 'status-completed', // 已完成
        5: 'status-canceled'   // 已取消
      };
      return statusMap[status] || '';
    },
    
    // 获取订单状态文本
    getOrderStatusText() {
      if (!this.orderData) return '未知状态';
      const status = this.orderData.orderStatus;
      const statusMap = {
        1: '未接单',
        2: '待取货',
        3: '配送中',
        4: '已完成',
        5: '已取消'
      };
      return statusMap[status] || '未知状态';
    },
    
    // 获取订单状态描述
    getOrderStatusDesc() {
      if (!this.orderData) return '';
      const status = this.orderData.orderStatus;
      const descMap = {
        1: '您的订单正在等待跑腿员接单',
        2: '跑腿员已接单，正在前往取货地点',
        3: '跑腿员已取货，正在配送中',
        4: '您的订单已成功完成',
        5: '您的订单已取消'
      };
      return descMap[status] || '';
    },
    
    // 格式化订单金额
    formatOrderAmount(orderData) {
      const amount = orderData.totalAmount || orderData.payAmount || 0;
      return amount > 0 ? `¥${Number(amount).toFixed(2)}` : '¥0.00';
    },
    
    // 获取骑手平均评分
    async loadRiderRating(riderId) {
      try {
        const res = await api.order.getRiderEvaluationStatistics(riderId)
        if (res && res.code === 200 && res.data) {
          // 更新骑手评分
          this.deliveryInfo.rating = res.data.avgRating || 0
          console.log('骑手平均评分:', this.deliveryInfo.rating)
        }
      } catch (err) {
        console.error('获取骑手评分失败:', err)
        // 获取失败时保持默认值0
      }
    }

  }
};
</script>

<style scoped>
.order-detail-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-top: 20rpx; /* 为固定导航栏留出空间 */
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
}

/* 导航栏样式 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90rpx;
  background-color: #5DCDFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  z-index: 100;
}

.back-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: white;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.navbar-right {
  width: 80rpx;
}

/* 通用卡片样式 */
.status-card,
.info-card,
.progress-card,
.delivery-card {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
}

/* 订单状态卡片 */
.status-card {
  background-color: #f6ffed;
  border: 2rpx solid #b7eb8f;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.status-label {
  font-size: 32rpx;
  color: #666;
}

.status-value {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.status-completed {
  background-color: #52c41a;
  color: white;
}

.status-desc {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 15rpx;
}

.complete-time {
  font-size: 28rpx;
  color: #999;
}

/* 信息卡片头部 */
.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 25rpx;
}

.info-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.info-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

/* 订单信息项 */
.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  text-align: right;
  flex: 1;
  padding-left: 30rpx;
}

.reward {
  color: #ff4d4f;
  font-weight: 500;
}

/* 时间线样式 */
.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 30rpx;
  top: 60rpx;
  bottom: 0;
  width: 4rpx;
  background-color: #e8e8e8;
}

.timeline-item {
  display: flex;
  margin-bottom: 40rpx;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  position: relative;
  z-index: 1;
  font-size: 30rpx;
}

.timeline-item.active .timeline-dot {
  background-color: #5DCDFF;
  color: white;
}

.timeline-dot.completed {
  background-color: #52c41a;
  color: white;
}

.timeline-dot.delivered {
  background-color: #fa8c16;
  color: white;
}

.timeline-dot.picked {
  background-color: #1890ff;
  color: white;
}

.timeline-dot.accepted {
  background-color: #722ed1;
  color: white;
}

.timeline-dot.created {
  background-color: #13c2c2;
  color: white;
}

.timeline-content {
  flex: 1;
  margin-left: 20rpx;
  padding-top: 10rpx;
}

.timeline-time {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 5rpx;
}

.timeline-text {
  font-size: 28rpx;
  color: #333;
}

/* 配送员信息 */
.delivery-info {
  display: flex;
  align-items: center;
}

.delivery-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.avatar-icon {
  font-size: 50rpx;
}

.delivery-details {
  flex: 1;
}

.delivery-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.delivery-rating {
  display: flex;
  align-items: center;
}

.star {
  font-size: 24rpx;
  color: #e0e0e0;
  margin-right: 2rpx;
}

.star.filled {
  color: #ffd700;
}

.rating-score {
  font-size: 28rpx;
  color: #666;
}

.delivery-phone {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
}

.contact-button {
  padding: 0 30rpx;
  height: 70rpx;
  background-color: #5DCDFF;
  color: white;
  border-radius: 35rpx;
  font-size: 28rpx;
  line-height: 70rpx;
  text-align: center;
  border: none;
}

.contact-button::after {
   border: none;
  }
  
  /* 底部操作按钮已移除，评价功能在订单列表页面 */

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #5DCDFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 错误信息样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 50rpx;
  text-align: center;
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.error-text {
  font-size: 28rpx;
  color: #ff4d4f;
  margin-bottom: 30rpx;
  line-height: 40rpx;
}

.retry-button {
  padding: 0 40rpx;
  height: 70rpx;
  background-color: #5DCDFF;
  color: white;
  border-radius: 35rpx;
  font-size: 28rpx;
  line-height: 70rpx;
  text-align: center;
  border: none;
}

.retry-button::after {
  border: none;
}

/* 空状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  color: #ccc;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

</style>