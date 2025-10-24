<template>
  <view class="order-detail-container">
    <!-- 顶部导航 -->
    <view class="detail-header">
      <view class="header-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">订单详情</text>
    </view>

    <!-- 订单基本信息 -->
    <view class="order-basic-info">
      <view class="order-status-section">
        <text class="order-status" :style="{ color: getStatusColor(orderDetail.status) }">
          {{ orderDetail.status }}
        </text>
        <text class="order-no">订单号：{{ orderDetail.orderNo }}</text>
      </view>
      
      <view class="time-info">
        <view class="time-item">
          <text class="time-label">下单时间</text>
          <text class="time-value">{{ orderDetail.orderTime }}</text>
        </view>
        <view class="time-item" v-if="orderDetail.payTime">
          <text class="time-label">支付时间</text>
          <text class="time-value">{{ orderDetail.payTime }}</text>
        </view>
        <view class="time-item" v-if="orderDetail.acceptTime">
          <text class="time-label">接单时间</text>
          <text class="time-value">{{ orderDetail.acceptTime }}</text>
        </view>
        <view class="time-item" v-if="orderDetail.completeTime">
          <text class="time-label">完成时间</text>
          <text class="time-value">{{ orderDetail.completeTime }}</text>
        </view>
      </view>
    </view>

    <!-- 客户信息 -->
    <view class="section customer-info">
      <text class="section-title">客户信息</text>
      <view class="customer-details">
        <view class="customer-item">
          <text class="customer-icon">👤</text>
          <text class="customer-text">{{ orderDetail.customerName }}</text>
        </view>
        <view class="customer-item">
          <text class="customer-icon">📱</text>
          <text class="customer-text">{{ orderDetail.phone }}</text>
          <text class="contact-btn" @click="contactCustomer">联系</text>
        </view>
        <view class="customer-item">
          <text class="customer-icon">📍</text>
          <text class="customer-text">{{ orderDetail.address }}</text>
        </view>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="section goods-info">
      <text class="section-title">商品信息</text>
      <view class="goods-list">
        <view class="goods-item" v-for="(item, index) in orderDetail.items" :key="index">
          <view class="goods-left">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-spec" v-if="item.options">{{ item.options }}</text>
          </view>
          <view class="goods-right">
            <text class="goods-quantity">×{{ item.quantity }}</text>
            <text class="goods-price">¥{{ item.price }}</text>
          </view>
        </view>
      </view>
      
      <!-- 价格汇总 -->
      <view class="price-summary">
        <view class="price-item">
          <text class="price-label">商品总价</text>
          <text class="price-value">¥{{ orderDetail.goodsAmount }}</text>
        </view>
        <view class="price-item">
          <text class="price-label">配送费</text>
          <text class="price-value">¥{{ orderDetail.deliveryFee }}</text>
        </view>
        <view class="price-item">
          <text class="price-label">优惠金额</text>
          <text class="price-value">-¥{{ orderDetail.discountAmount }}</text>
        </view>
        <view class="price-item total">
          <text class="price-label">实付金额</text>
          <text class="price-value">¥{{ orderDetail.totalAmount }}</text>
        </view>
      </view>
    </view>

    <!-- 订单操作记录 -->
    <view class="section operation-log" v-if="orderDetail.operationLogs && orderDetail.operationLogs.length > 0">
      <text class="section-title">操作记录</text>
      <view class="log-list">
        <view class="log-item" v-for="(log, index) in orderDetail.operationLogs" :key="index">
          <text class="log-time">{{ log.time }}</text>
          <text class="log-content">{{ log.content }}</text>
        </view>
      </view>
    </view>

    <!-- 评价信息 -->
    <view class="section review-section" v-if="orderDetail.review">
      <text class="section-title">顾客评价</text>
      <view class="review-content">
        <text class="review-rating">⭐ {{ orderDetail.review.rating }}/5</text>
        <text class="review-text">{{ orderDetail.review.content }}</text>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="action-buttons" v-if="showActions">
      <view class="action-btn contact" @click="contactCustomer">
        <text class="btn-text">联系客户</text>
      </view>
      
      <!-- 根据订单状态显示不同按钮 -->
      <template v-if="orderDetail.status === '待接单'">
        <view class="action-btn reject" @click="rejectOrder">
          <text class="btn-text">拒单</text>
        </view>
        <view class="action-btn accept" @click="acceptOrder">
          <text class="btn-text">接单</text>
        </view>
      </template>
      
      <view v-if="orderDetail.status === '待出品'" class="action-btn complete" @click="markProduceComplete">
        <text class="btn-text">出品完成</text>
      </view>
      
      <view v-if="orderDetail.status === '待配送'" class="action-btn notify" @click="notifyRider">
        <text class="btn-text">通知骑手</text>
      </view>
      
      <view v-if="orderDetail.status === '配送中'" class="action-btn contact-rider" @click="contactRider">
        <text class="btn-text">联系骑手</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'OrderDetail',
  data() {
    return {
      orderDetail: {
        id: '',
        orderNo: '',
        status: '',
        customerName: '',
        phone: '',
        address: '',
        orderTime: '',
        payTime: '',
        acceptTime: '',
        completeTime: '',
        goodsAmount: '0.00',
        deliveryFee: '0.00',
        discountAmount: '0.00',
        totalAmount: '0.00',
        items: [],
        operationLogs: [],
        review: null
      }
    }
  },
  computed: {
    showActions() {
      return this.orderDetail.status !== '已完成'
    }
  },
  onLoad(options) {
    if (options.id) {
      this.loadOrderDetail(options.id)
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    loadOrderDetail(orderId) {
      // 完整的模拟数据，包含所有订单的详细信息
      const mockData = {
        '1': {
          id: '1',
          orderNo: '20241022001',
          status: '待接单',
          customerName: '张先生',
          phone: '13800138001',
          address: '科技园A座1201室',
          orderTime: '2024-10-22 10:30:00',
          payTime: '2024-10-22 10:31:00',
          goodsAmount: '125.00',
          deliveryFee: '3.00',
          discountAmount: '0.00',
          totalAmount: '128.00',
          items: [
            { name: '麻辣香锅', price: '48.00', quantity: 1, options: '微辣' },
            { name: '米饭', price: '3.00', quantity: 2 },
            { name: '可乐', price: '8.00', quantity: 1 }
          ],
          operationLogs: [
            { time: '2024-10-22 10:30:00', content: '用户提交订单' },
            { time: '2024-10-22 10:31:00', content: '用户支付成功' }
          ]
        },
        '2': {
          id: '2',
          orderNo: '20241022002',
          status: '待出品',
          customerName: '李女士',
          phone: '13900139002',
          address: '万科广场B栋502室',
          orderTime: '2024-10-22 10:45:00',
          payTime: '2024-10-22 10:46:00',
          acceptTime: '2024-10-22 10:50:00',
          goodsAmount: '82.50',
          deliveryFee: '3.00',
          discountAmount: '0.00',
          totalAmount: '85.50',
          items: [
            { name: '宫保鸡丁', price: '32.50', quantity: 1 },
            { name: '糖醋排骨', price: '45.00', quantity: 1 },
            { name: '米饭', price: '3.00', quantity: 2 }
          ],
          operationLogs: [
            { time: '2024-10-22 10:45:00', content: '用户提交订单' },
            { time: '2024-10-22 10:46:00', content: '用户支付成功' },
            { time: '2024-10-22 10:50:00', content: '商家已接单' }
          ]
        },
        '3': {
          id: '3',
          orderNo: '20241022003',
          status: '待配送',
          customerName: '王先生',
          phone: '13700137003',
          address: '阳光小区3号楼801室',
          orderTime: '2024-10-22 11:00:00',
          payTime: '2024-10-22 11:01:00',
          acceptTime: '2024-10-22 11:05:00',
          goodsAmount: '253.80',
          deliveryFee: '3.00',
          discountAmount: '0.00',
          totalAmount: '256.80',
          items: [
            { name: '烤鱼套餐', price: '168.00', quantity: 1, options: '香辣' },
            { name: '羊肉串', price: '68.80', quantity: 1 },
            { name: '啤酒', price: '12.00', quantity: 2 }
          ],
          operationLogs: [
            { time: '2024-10-22 11:00:00', content: '用户提交订单' },
            { time: '2024-10-22 11:01:00', content: '用户支付成功' },
            { time: '2024-10-22 11:05:00', content: '商家已接单' },
            { time: '2024-10-22 11:30:00', content: '商家出品完成' }
          ]
        },
        '4': {
          id: '4',
          orderNo: '20241022004',
          status: '配送中',
          customerName: '赵女士',
          phone: '13500135004',
          address: 'CBD中心2栋1508室',
          orderTime: '2024-10-22 09:30:00',
          payTime: '2024-10-22 09:31:00',
          acceptTime: '2024-10-22 09:45:00',
          riderName: '刘骑手',
          riderPhone: '13600136004',
          goodsAmount: '195.00',
          deliveryFee: '3.00',
          discountAmount: '0.00',
          totalAmount: '198.00',
          items: [
            { name: '寿司拼盘', price: '128.00', quantity: 1 },
            { name: '味噌汤', price: '28.00', quantity: 2 },
            { name: '沙拉', price: '42.00', quantity: 1 }
          ],
          operationLogs: [
            { time: '2024-10-22 09:30:00', content: '用户提交订单' },
            { time: '2024-10-22 09:31:00', content: '用户支付成功' },
            { time: '2024-10-22 09:45:00', content: '商家已接单' },
            { time: '2024-10-22 10:00:00', content: '商家出品完成' },
            { time: '2024-10-22 10:15:00', content: '骑手已接单' }
          ]
        },
        '5': {
          id: '5',
          orderNo: '20241022005',
          status: '配送中',
          customerName: '刘先生',
          phone: '13600136005',
          address: '锦绣花园12栋302室',
          orderTime: '2024-10-22 09:15:00',
          payTime: '2024-10-22 09:16:00',
          acceptTime: '2024-10-22 09:25:00',
          riderName: '张骑手',
          riderPhone: '13700137005',
          goodsAmount: '153.00',
          deliveryFee: '3.00',
          discountAmount: '0.00',
          totalAmount: '156.00',
          items: [
            { name: '汉堡套餐', price: '45.00', quantity: 2 },
            { name: '薯条', price: '22.00', quantity: 2 },
            { name: '可乐', price: '8.00', quantity: 2 }
          ],
          operationLogs: [
            { time: '2024-10-22 09:15:00', content: '用户提交订单' },
            { time: '2024-10-22 09:16:00', content: '用户支付成功' },
            { time: '2024-10-22 09:25:00', content: '商家已接单' },
            { time: '2024-10-22 09:45:00', content: '商家出品完成' },
            { time: '2024-10-22 09:50:00', content: '骑手已接单' }
          ]
        },
        '6': {
          id: '6',
          orderNo: '20241022006',
          status: '已完成',
          customerName: '陈女士',
          phone: '13400134006',
          address: '阳光小区5栋601室',
          orderTime: '2024-10-22 08:30:00',
          payTime: '2024-10-22 08:31:00',
          acceptTime: '2024-10-22 08:40:00',
          completeTime: '2024-10-22 09:20:00',
          riderName: '王骑手',
          riderPhone: '13500135006',
          goodsAmount: '86.00',
          deliveryFee: '3.00',
          discountAmount: '0.00',
          totalAmount: '89.00',
          items: [
            { name: '早餐套餐', price: '25.00', quantity: 2 },
            { name: '豆浆', price: '8.00', quantity: 1 },
            { name: '油条', price: '6.00', quantity: 2 }
          ],
          operationLogs: [
            { time: '2024-10-22 08:30:00', content: '用户提交订单' },
            { time: '2024-10-22 08:31:00', content: '用户支付成功' },
            { time: '2024-10-22 08:40:00', content: '商家已接单' },
            { time: '2024-10-22 08:55:00', content: '商家出品完成' },
            { time: '2024-10-22 09:00:00', content: '骑手已接单' },
            { time: '2024-10-22 09:20:00', content: '订单已完成' }
          ],
          review: {
            rating: 5,
            content: '味道很好，配送很快！'
          }
        }
      }
      
      this.orderDetail = mockData[orderId] || this.orderDetail
    },
    
    getStatusColor(status) {
      const colors = {
        '待接单': '#ff9800',
        '待出品': '#ff6b00',
        '待配送': '#ff5722',
        '配送中': '#2196f3',
        '已完成': '#52c41a'
      }
      return colors[status] || '#666'
    },
    
    contactCustomer() {
      uni.makePhoneCall({
        phoneNumber: this.orderDetail.phone
      })
    },
    
    contactRider() {
      if (this.orderDetail.riderPhone) {
        uni.makePhoneCall({
          phoneNumber: this.orderDetail.riderPhone
        })
      }
    },
    
    rejectOrder() {
      uni.showModal({
        title: '拒单确认',
        content: '确定要拒绝该订单吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '拒单成功',
              icon: 'success'
            })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        }
      })
    },
    
    acceptOrder() {
      uni.showModal({
        title: '接单确认',
        content: '确定要接受该订单吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '接单成功',
              icon: 'success'
            })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        }
      })
    },
    
    markProduceComplete() {
      uni.showModal({
        title: '出品完成确认',
        content: '确定该订单已出品完成吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '出品完成',
              icon: 'success'
            })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        }
      })
    },
    
    notifyRider() {
      uni.showModal({
        title: '通知骑手',
        content: '确定要通知骑手取餐吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '骑手已通知',
              icon: 'success'
            })
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          }
        }
      })
    }
  }
}
</script>


<style scoped>
.order-detail-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航 */
.detail-header {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  padding: 80rpx 30rpx 30rpx;
  display: flex;
  align-items: center;
  color: white;
}

.header-back, .header-actions {
  width: 80rpx;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.back-icon, .action-icon {
  font-size: 40rpx;
}

/* 订单基本信息 */
.order-basic-info {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.order-status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.order-status {
  font-size: 32rpx;
  font-weight: bold;
}

.order-no {
  font-size: 26rpx;
  color: #999;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.time-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-label {
  font-size: 26rpx;
  color: #666;
}

.time-value {
  font-size: 26rpx;
  color: #333;
}

/* 通用区块样式 */
.section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

/* 客户信息 */
.customer-details {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.customer-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.customer-icon {
  font-size: 32rpx;
  width: 40rpx;
}

.customer-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.contact-btn {
  background: #4a90e2;
  color: white;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

/* 商品信息 */
.goods-list {
  margin-bottom: 30rpx;
}

.goods-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-left {
  flex: 1;
}

.goods-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.goods-spec {
  font-size: 24rpx;
  color: #999;
}

.goods-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.goods-quantity {
  font-size: 26rpx;
  color: #666;
}

.goods-price {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: 500;
}

/* 价格汇总 */
.price-summary {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.price-item.total {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 16rpx;
  margin-top: 16rpx;
}

.price-label {
  font-size: 26rpx;
  color: #666;
}

.price-value {
  font-size: 26rpx;
  color: #333;
}

.price-item.total .price-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b6b;
}

/* 操作记录 */
.log-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.log-time {
  font-size: 24rpx;
  color: #999;
  min-width: 200rpx;
}

.log-content {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

/* 底部操作按钮 */
.action-buttons {
  background: white;
  padding: 30rpx;
  position: sticky;
  bottom: 0;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 20rpx;
  border-radius: 40rpx;
  margin-bottom: 16rpx;
}

.action-btn-group {
  display: flex;
  gap: 16rpx;
}

.action-btn-group .action-btn {
  flex: 1;
  margin-bottom: 0;
}

.btn-icon {
  font-size: 32rpx;
}

.btn-text {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

.action-btn.contact {
  background: linear-gradient(135deg, #4a90e2, #357abd);
}

.action-btn.reject {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
}

.action-btn.accept {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.action-btn.complete {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.action-btn.notify {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.action-btn.contact-rider {
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
}

.action-btn.track {
  background: linear-gradient(135deg, #607d8b, #455a64);
}
</style>
