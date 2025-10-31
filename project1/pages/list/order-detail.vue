<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-button" @click="goBack">
        
      </view>
      <view class="nav-title">订单详情</view>
      <view class="nav-right"></view>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text class="error-text">{{ error }}</text>
      <button class="retry-button" @click="retryLoad">重新加载</button>
    </view>
    
    <!-- 订单内容（加载成功后显示） -->
    <view v-else>
      <!-- 交易概览 -->
      <view class="transaction-overview">
        <view class="status-badge" :class="{ 'success': orderData.status === '交易成功' }">
          {{ orderData.status }}
        </view>
        
        <view class="overview-grid">
          <view class="overview-item">
            <text class="item-label">订单号</text>
            <text class="item-value">{{ orderData.orderId }}</text>
          </view>
          <view class="overview-item">
            <text class="item-label">交易时间</text>
            <text class="item-value">{{ orderData.transactionTime }}</text>
          </view>
          <view class="overview-item">
            <text class="item-label">支付方式</text>
            <text class="item-value">{{ orderData.paymentMethod }}</text>
          </view>
          <view class="overview-item">
            <text class="item-label">交易类型</text>
            <text class="item-value">{{ orderData.transactionType }}</text>
          </view>
        </view>
      </view>
      
      <!-- 商品明细 -->
      <view class="product-details">
        <view class="section-header">
          <text class="section-title">商品明细</text>
          <text class="section-count">{{ orderData.products.length }}件商品</text>
        </view>
        
        <view class="product-list">
          <view class="product-item" v-for="(product, index) in orderData.products" :key="index">
            <view class="product-info">
              <text class="product-name">{{ product.name }}</text>
              <text class="product-spec">{{ product.spec }}</text>
            </view>
            <view class="product-quantity">x{{ product.quantity }}</view>
            <view class="product-price">¥{{ formatPrice(product.price) }}</view>
          </view>
        </view>
        
        <!-- 套餐详情直接展示 -->
        <view class="meal-details" v-if="orderData.mealDetails">
          <view class="section-subtitle">套餐详情</view>
          <view class="meal-content">{{ orderData.mealDetails }}</view>
        </view>
        
        <!-- 备注信息直接展示 -->
        <view class="order-notes" v-if="orderData.notes">
          <view class="section-subtitle">备注</view>
          <view class="notes-content">{{ orderData.notes }}</view>
        </view>
      </view>
      
      <!-- 金额汇总 -->
      <view class="amount-summary">
        <view class="section-header">
          <text class="section-title">金额汇总</text>
        </view>
        
        <view class="summary-list">
          <view class="summary-item">
            <text class="summary-label">商品金额</text>
            <text class="summary-value">¥{{ formatPrice(orderData.productAmount) }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">配送费</text>
            <text class="summary-value">¥{{ formatPrice(orderData.deliveryFee) }}</text>
          </view>
          <view class="summary-item" v-if="orderData.discount > 0">
            <text class="summary-label">优惠抵扣</text>
            <text class="summary-value discount">-¥{{ formatPrice(orderData.discount) }}</text>
          </view>
          <view class="summary-item total">
            <text class="summary-label total">实付金额</text>
            <text class="summary-value total">¥{{ formatPrice(orderData.actualPayment) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 底部区域（已移除操作按钮） -->
    </view>
  </view>
</template>

<script>
import { merchantOrderAPI, request } from '../../utils/order.js'

export default {
  name: 'OrderDetailPage',
  data() {
    return {
      orderData: {}, // 空对象，从后端获取实际数据
      loading: false,
      error: '',
      orderId: null // 保存订单ID用于重新加载
    };
  },
  onLoad(options) {
    // 接受传递的id参数并保存，确保转换为数字类型
    if (options.id) {
      // 保存原始ID，并将数字类型ID用于API调用
      this.orderId = options.id;
      const numOrderId = Number(options.id);
      
      console.log('加载订单ID:', numOrderId);
      console.log('订单号:', options.orderNo);
      
      // 调用加载方法
      this.loadOrderDetail(numOrderId);
    } else {
      this.error = '未找到订单ID';
      this.loading = false;
      // 显示错误提示
      uni.showToast({
        title: this.error,
        icon: 'none'
      });
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    // 重新加载订单详情
    retryLoad() {
      // 确保使用数字类型的订单ID
      if (this.orderId) {
        const numOrderId = Number(this.orderId);
        this.loadOrderDetail(numOrderId);
      }
    },

    async loadOrderDetail(orderId) {
      this.loading = true;
      this.error = '';
      try {
        // 确保orderId是数字类型，正确处理Long类型ID
        const numOrderId = Number(orderId);
        console.log('调用订单详情API:', numOrderId);
        
        // 调用实际的订单详情接口，匹配后端@GetMapping("/{orderMainId}")
        const res = await request(merchantOrderAPI.detail(numOrderId), {
          method: 'GET'
        });
        
        console.log('订单详情API响应:', res);
        
        // 检查响应是否有效
        if (res.statusCode === 200 && res.data) {
          // 适配后端AjaxResult格式 {code, msg, data}，后端返回的是AjaxResult.success(order)
          if (res.data.code === 200 || res.data.code === 0 || res.data.success === true) {
            // 后端返回的是OrderMain对象
            const orderDetail = res.data.data;
            if (orderDetail) {
              console.log('获取到订单详情:', orderDetail);
              
              // 严格按照后端OrderMain对象结构进行数据映射
              this.orderData = {
                status: this.getStatusText(orderDetail.status),
                orderId: orderDetail.orderNo || `#${orderDetail.id}`,
                transactionTime: this.formatDateTime(orderDetail.createTime || orderDetail.transactionTime),
                paymentMethod: this.getPaymentMethod(orderDetail.paymentMethod),
                transactionType: '线上订单',
                productAmount: orderDetail.totalAmount || 0,
                deliveryFee: orderDetail.deliveryFee || 0,
                discount: orderDetail.discountAmount || 0,
                actualPayment: orderDetail.actualAmount || ((orderDetail.totalAmount || 0) + (orderDetail.deliveryFee || 0) - (orderDetail.discountAmount || 0)),
                // 严格匹配后端订单项字段
                products: this.transformProducts(orderDetail.orderItems || []),
                // 获取套餐详情和备注信息
                mealDetails: orderDetail.mealDetails || orderDetail.packageDetails || '',
                notes: orderDetail.notes || orderDetail.remarks || ''
              };
              
              console.log('订单数据处理完成:', this.orderData);
            } else {
              this.error = '订单数据为空';
              uni.showToast({
                title: this.error,
                icon: 'none'
              });
            }
          } else {
            this.error = res.data.msg || res.data.message || '获取订单详情失败';
            uni.showToast({
              title: this.error,
              icon: 'none'
            });
          }
        } else {
          this.error = '网络请求失败';
          uni.showToast({
            title: this.error,
            icon: 'none'
          });
        }
      } catch (error) {
        // 确保重置loading状态
        this.loading = false;
        this.error = '加载订单详情失败';
        console.error('获取订单详情失败:', error);
        uni.showToast({
          title: this.error,
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    // 转换商品数据格式
    transformProducts(items) {
      return items.map(item => ({
        name: item.name || '商品',
        spec: item.options || item.spec || '',
        quantity: item.quantity || 1,
        price: item.price || 0
      }));
    },
    // 转换订单状态文本
    getStatusText(status) {
      const statusMap = {
        '待接单': '待处理',
        '待取货': '待处理',
        '配送中': '配送中',
        '已完成': '交易成功',
        '已取消': '已取消'
      };
      return statusMap[status] || status || '未知状态';
    },
    // 格式化价格
    formatPrice(price) {
      return parseFloat(price || 0).toFixed(2);
    },
    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return new Date().toLocaleString('zh-CN');
      
      // 如果是时间戳，先转换为Date对象
      const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
      
      // 检查日期对象是否有效
      if (isNaN(date.getTime())) {
        return new Date().toLocaleString('zh-CN');
      }
      
      // 格式化为YYYY-MM-DD HH:mm:ss格式
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    
    // 获取支付方式文本
    getPaymentMethod(method) {
      const paymentMap = {
        'WECHAT': '微信支付',
        'ALIPAY': '支付宝',
        'CASH': '现金支付',
        'ONLINE': '在线支付',
        'OTHER': '其他支付'
      };
      return paymentMap[method] || method || '微信支付';
    },
  }
};
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 30rpx;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.nav-right {
  width: 60rpx;
}

/* 交易概览 */
.transaction-overview {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
  position: relative;
}

.status-badge {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  color: #fff;
}

.status-badge.success {
  background-color: #52c41a;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-top: 20rpx;
}

.overview-item {
  display: flex;
  flex-direction: column;
}

.item-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.item-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 商品明细 */
.product-details {
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-count {
  font-size: 26rpx;
  color: #666;
}

.product-list {
  margin-bottom: 24rpx;
}

.product-item {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.product-info {
  flex: 1;
}

.product-name {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.product-spec {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.product-quantity {
  font-size: 26rpx;
  color: #666;
  margin: 0 20rpx;
}

.product-price {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 套餐详情和备注样式 */
.meal-details {
  padding: 20rpx 0;
  margin-top: 10rpx;
  border-top: 1rpx solid #eee;
}

.order-notes {
  padding: 20rpx 0;
  margin-top: 10rpx;
  border-top: 1rpx solid #eee;
  background-color: #fff8f0;
}

.section-subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.meal-content,
.notes-content {
  font-size: 28rpx;
  color: #333;
  line-height: 44rpx;
}

/* 金额汇总 */
.amount-summary {
  background-color: #fff;
  margin-bottom: 100rpx;
  padding: 30rpx;
}

.summary-list {
  margin-top: 10rpx;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.summary-label {
  font-size: 28rpx;
  color: #666;
}

.summary-value {
  font-size: 28rpx;
  color: #333;
}

.summary-value.discount {
  color: #ff4d4f;
}

.summary-item.total {
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f0f0f0;
}

.summary-label.total {
  font-weight: bold;
  color: #333;
}

.summary-value.total {
  font-weight: bold;
  color: #ff4d4f;
  font-size: 32rpx;
}



/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  background-color: #f5f5f5;
  min-height: 60vh;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba(0, 0, 0, 0.1);
  border-top: 4rpx solid #1989fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #888;
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  background-color: #f5f5f5;
  min-height: 60vh;
  text-align: center;
}

.error-text {
  font-size: 28rpx;
  color: #ff4d4f;
  margin-bottom: 30rpx;
  line-height: 44rpx;
}

.retry-button {
  background-color: #1989fa;
  color: #fff;
  font-size: 28rpx;
  padding: 20rpx 60rpx;
  border-radius: 8rpx;
  border: none;
}

.retry-button:active {
  opacity: 0.8;
}
</style>
