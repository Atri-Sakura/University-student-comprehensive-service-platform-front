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
        <!-- 商品信息卡片 -->
        <view class="order-card">
          <!-- 商品列表 -->
          <view v-if="order.orderTakeoutDetailList && order.orderTakeoutDetailList.length > 0" class="goods-list">
            <view class="goods-item" v-for="(item, index) in order.orderTakeoutDetailList" :key="index">
              <image 
                class="goods-image" 
                :src="getGoodsImage(item)" 
                mode="aspectFill"
                @error="handleImageError"
              ></image>
              <view class="goods-info">
                <text class="goods-name">{{ item.goodsName || '商品' }}</text>
                <text class="goods-spec" v-if="item.goodsSpec">{{ item.goodsSpec }}</text>
                <view class="goods-price-row">
                  <text class="goods-price">¥{{ item.goodsPrice || 0 }}</text>
                  <text class="goods-quantity">x{{ item.quantity || 1 }}</text>
                </view>
              </view>
              <view class="goods-subtotal">¥{{ (item.subtotal || item.goodsPrice * item.quantity || 0).toFixed(2) }}</view>
            </view>
          </view>
          
          <!-- 订单信息列表 -->
          <view class="order-info-list">
            <view class="info-item">
              <text class="info-label">订单号：</text>
              <text class="info-value">{{ order.orderNo }}</text>
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
              <text class="info-label">商家名称：</text>
              <text class="info-value">{{ order.merchantName }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">商品名称：</text>
              <text class="info-value">{{ order.productName }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">商品数量：</text>
              <text class="info-value">{{ order.quantity }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">商品金额：</text>
              <text class="info-value">¥{{ order.goodsAmount }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">外卖员：</text>
              <text class="info-value">{{ encryptRiderName(order.riderNickname) }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">配送费：</text>
              <text class="info-value">¥{{ order.deliveryFee }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">优惠金额：</text>
              <text class="info-value">¥{{ order.discountAmount }}</text>
            </view>
          </view>
          
          <!-- 总金额 -->
          <view class="total-amount">
            <text class="total-label">实付金额：</text>
            <text class="total-value">¥{{ order.totalAmount }}</text>
          </view>
          
          <!-- 配送骑手信息 -->
          <view v-if="order.riderName" class="rider-info">
            <text class="rider-label">配送骑手：</text>
            <text class="rider-value">{{ order.riderName }} ({{ order.riderPhone }})</text>
          </view>
          
          <!-- 已取消订单的取消原因 -->
          <view v-if="order.orderStatus === 5 && order.cancelReason" class="cancel-reason">
            <text class="cancel-reason-label">取消原因：</text>
            <text class="cancel-reason-value">{{ order.cancelReason }}</text>
          </view>
        </view>
        
        <!-- 操作按钮区域 -->
        <view class="action-buttons">
          <!-- 待接单状态 -->
          <view v-if="order.orderStatus === 1" class="button-row">
            <button class="action-button cancel-btn" @click="cancelOrder">取消订单</button>
          </view>
          
          <!-- 待取货和配送中状态 -->
          <view v-else-if="order.orderStatus === 2 || order.orderStatus === 3" class="button-row">
            <button class="action-button" @click="contactRider">联系骑手</button>
            <button class="action-button" @click="contactMerchant">联系商家</button>
          </view>
          
          <!-- 已完成状态 -->
          <view v-else-if="order.orderStatus === 4">
            <view class="button-row">
              <button class="action-button" @click="evaluateRider">评价骑手</button>
              <button class="action-button" @click="evaluateMerchant">评价商家</button>
            </view>
          </view>
          
          <!-- 已取消状态 -->
          <view v-else-if="order.orderStatus === 5">
            <!-- 已取消状态下不显示任何操作按钮 -->
          </view>
          
          <!-- 其他状态 -->
          <view v-else>
            <!-- 其他未知状态下不显示任何操作按钮 -->
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 导入订单API
import api from '@/api/index.js'
// 导入消息系统辅助函数
import { openChatWithRider, openChatWithMerchant } from '@/utils/chat-helper.js'

export default {
  data() {
    return {
      orderId: '',
      order: {
        orderNo: '',
        orderId: '',
        productName: '',
        productImage: '',
        orderTime: '',
        status: '',
        paymentMethod: '',
        address: '',
        contactInfo: '',
        merchantName: '',
        price: '0.00',
        quantity: 1,
        riderName: '',
        riderPhone: '',
        riderNickname: '',
        riderId: '', // 骑手ID
        merchantId: '', // 商家ID
        merchantBaseId: '', // 商家基础ID
        orderStatus: 0,
        payType: '',
        totalAmount: '0.00',
        goodsAmount: '0.00',
        deliveryFee: '0.00',
        discountAmount: '0.00'
      },
      // 取消订单原因选项
      cancelReasons: [
        { value: 1, label: '不想买了' },
        { value: 2, label: '信息填写错误' },
        { value: 3, label: '重复下单' },
        { value: 4, label: '商家长时间未接单' },
        { value: 5, label: '其他原因' }
      ],
      loading: true,
      error: ''
    }
  },
  onLoad(options) {
    // 从options中获取订单号
    if (options.id) {
      this.orderId = options.id
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
        const res = await api.order.getOrderDetail(this.orderId)
        
        if (res && res.code === 200) {
          // 处理后端返回的数据
          const processedOrder = this.processOrderData(res.data)
          
          // 批量获取商品图片
          if (processedOrder.orderTakeoutDetailList && processedOrder.orderTakeoutDetailList.length > 0) {
            await this.loadGoodsImages(processedOrder.orderTakeoutDetailList)
          }
          
          this.order = processedOrder
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
    
    // 批量获取商品图片
    async loadGoodsImages(orderDetailList) {
      // 提取所有商品ID并去重
      const goodsIds = [...new Set(
        orderDetailList
          .map(item => item.goodsId)
          .filter(id => id != null && id !== '')
      )]
      
      if (goodsIds.length === 0) {
        return
      }
      
      // 批量查询商品图片
      const goodsImagesMap = {}
      const imagePromises = goodsIds.map(async (goodsId) => {
        try {
          const goodsRes = await api.food.getGoodsDetail(goodsId)
          if (goodsRes && goodsRes.code === 200 && goodsRes.data) {
            const images = goodsRes.data.images || []
            // 获取主图（isMain=1的图片）或第一张图片
            const mainImage = images.find(img => img.isMain === 1)?.imageUrl || 
                            (images.length > 0 ? images[0].imageUrl : null)
            goodsImagesMap[goodsId] = {
              mainImage: mainImage,
              images: images
            }
          }
        } catch (error) {
          console.warn(`获取商品${goodsId}的图片失败:`, error)
          goodsImagesMap[goodsId] = {
            mainImage: null,
            images: []
          }
        }
      })
      
      await Promise.all(imagePromises)
      
      // 将图片信息添加到订单明细中
      orderDetailList.forEach(detail => {
        if (detail.goodsId && goodsImagesMap[detail.goodsId]) {
          detail.mainImage = goodsImagesMap[detail.goodsId].mainImage
          detail.images = goodsImagesMap[detail.goodsId].images
        }
      })
    },
    
    // 获取商品图片
    getGoodsImage(item) {
      // 优先使用已加载的图片
      if (item.mainImage) {
        return item.mainImage
      }
      // 如果有图片数组，取第一张
      if (item.images && item.images.length > 0) {
        const mainImg = item.images.find(img => img.isMain === 1)
        return mainImg ? mainImg.imageUrl : item.images[0].imageUrl
      }
      // 默认图片
      return '/static/default-food.png'
    },
    
    // 图片加载错误处理
    handleImageError(e) {
      console.warn('商品图片加载失败:', e)
      // 可以在这里设置默认图片
    },
    
    // 处理订单数据，将后端返回的数据转换为页面需要的格式
    processOrderData(orderData) {
      // 从orderTakeoutDetailList获取商品名称、数量和商家名称
      let productName = orderData.productName || ''
      let quantity = orderData.quantity || 1
      let merchantName = ''
      let merchantId = ''
      let merchantBaseId = ''
      if (orderData.orderTakeoutDetailList && orderData.orderTakeoutDetailList.length > 0) {
        productName = orderData.orderTakeoutDetailList[0].goodsName || ''
        quantity = orderData.orderTakeoutDetailList[0].quantity || 1
        merchantName = orderData.orderTakeoutDetailList[0].merchantName || ''
        merchantId = orderData.orderTakeoutDetailList[0].merchantId || ''
        merchantBaseId = orderData.orderTakeoutDetailList[0].merchantBaseId || orderData.orderTakeoutDetailList[0].merchantId || ''
      }
      
      // 如果没有从明细中获取到商家ID，尝试从订单主表获取
      if (!merchantId && !merchantBaseId) {
        merchantId = orderData.merchantId || orderData.merchantBaseId || ''
        merchantBaseId = orderData.merchantBaseId || orderData.merchantId || ''
      }
      
      // 根据后端返回的实际字段进行映射
      return {
        orderNo: orderData.orderNo || '',
        orderId: orderData.orderId || '',
        orderMainId: orderData.orderMainId || orderData.orderId || orderData.orderNo || '',
        productName: productName,
        productImage: orderData.productImage || '',
        orderTime: orderData.createTime || '',
        status: this.getOrderStatusText(orderData.orderStatus || 0),
        paymentMethod: this.getPaymentMethodText(orderData.payType || ''),
        address: orderData.deliverAddress || orderData.address || '',
        contactInfo: orderData.deliverPhone || orderData.contactInfo || '',
        merchantName: merchantName,
        price: (orderData.paymentAmount || orderData.totalAmount || 0).toFixed(2),
        quantity: quantity,
        riderName: orderData.riderName || '',
        riderPhone: orderData.riderPhone || '',
        riderNickname: orderData.riderNickname || '',
        riderId: orderData.riderId || orderData.riderBaseId || '',
        merchantId: merchantId,
        merchantBaseId: merchantBaseId,
        orderStatus: orderData.orderStatus || 1,
        payType: orderData.payType || '',
        totalAmount: (orderData.totalAmount || 0).toFixed(2),
        goodsAmount: (orderData.goodsAmount || 0).toFixed(2),
        deliveryFee: (orderData.deliveryFee || 0).toFixed(2),
        discountAmount: (orderData.discountAmount || 0).toFixed(2),
        cancelReason: orderData.cancelReason || '',
        orderTakeoutDetailList: orderData.orderTakeoutDetailList || []
      }
    },
    
    // 将订单状态码转换为文本
    getOrderStatusText(status) {
      const statusMap = {
        1: '待接单',
        2: '待取货',
        3: '配送中',
        4: '已完成',
        5: '已取消'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 将支付方式码转换为文本
    getPaymentMethodText(payType) {
      const payTypeMap = {  
        1: '余额支付',
        2: '微信支付',
        3: '支付宝支付',
        4: '面付'
      }
      return payTypeMap[payType] || '未知支付方式'
    },
    
    // 加密外卖员名称，部分显示
    encryptRiderName(name) {
      if (!name || name.length <= 1) {
        return name || ''
      } else if (name.length === 2) {
        // 2个字符：显示第一个字符，最后一个用*代替
        return name.charAt(0) + '*'
      } else if (name.length === 3) {
        // 3个字符：显示第一个和最后一个字符，中间用*代替
        return name.charAt(0) + '*' + name.charAt(name.length - 1)
      } else {
        // 4个或更多字符：显示第一个和最后一个字符，中间用*代替
        return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
      }
    },
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    

    
    // 联系骑手 - 使用消息系统
    async contactRider() {
      if (!this.order.riderId) {
        uni.showToast({
          title: '无法获取骑手信息',
          icon: 'none'
        })
        return
      }
      
      // 使用消息系统打开与骑手的聊天
      await openChatWithRider(
        String(this.order.riderId),
        this.order.riderNickname || this.order.riderName || '骑手',
        this.order.riderPhone || ''
      )
    },
    
    // 联系商家 - 使用消息系统
    async contactMerchant() {
      // 优先使用merchantBaseId，如果没有则使用merchantId
      const merchantId = this.order.merchantBaseId || this.order.merchantId
      
      if (!merchantId) {
        uni.showToast({
          title: '无法获取商家信息',
          icon: 'none'
        })
        return
      }
      
      // 使用消息系统打开与商家的聊天
      await openChatWithMerchant(
        String(merchantId),
        this.order.merchantName || '商家',
        '' // 商家电话，如果需要可以从订单数据中获取
      )
    },
    

    
    // 取消订单
    cancelOrder() {
      // 显示取消原因选择弹窗
      uni.showActionSheet({
        title: '请选择取消原因',
        itemList: this.cancelReasons.map(reason => reason.label),
        success: (res) => {
          // 获取用户选择的取消原因
          const selectedReason = this.cancelReasons[res.tapIndex]
          
          // 二次确认取消订单
          uni.showModal({
            title: '确认取消',
            content: `确定要以"${selectedReason.label}"为由取消该订单吗？`,
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 调用取消订单API
                api.order.cancelOrder(this.order.orderMainId, selectedReason.label)
                  .then(() => {
                    uni.showToast({
                      title: '订单已取消',
                      icon: 'success'
                    })
                    // 刷新订单数据
                    this.getOrderDetail()
                  })
                  .catch(() => {
                    uni.showToast({
                      title: '取消订单失败',
                      icon: 'none'
                    })
                  })
              }
            }
          })
        },
        fail: (res) => {
          // 用户取消选择原因
          console.log('用户取消选择取消原因', res)
        }
      })
    },
    
    // 评价骑手
    evaluateRider() {
      console.log('评价骑手 - 订单号:', this.order.orderNo);
      // 跳转到评价骑手页面，并传递订单号
      uni.navigateTo({
        url: `/pages/orders/rate-delivery?orderNo=${this.order.orderNo}`
      })
    },
    
    // 评价商家
    evaluateMerchant() {
      uni.navigateTo({        
        url: `/pages/orders/food-order-evaluate?orderNo=${this.order.orderNo}&type=merchant`
      })
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

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
  font-size: 32rpx;
  color: #666;
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
  font-size: 32rpx;
  color: #ff4444;
}

.retry-button {
  margin-top: 30rpx;
  padding: 15rpx 40rpx;
  background-color: #5DCDFF;
  color: white;
  border: none;
  border-radius: 20rpx;
  font-size: 28rpx;
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

/* 商品列表样式 */
.goods-list {
  margin-bottom: 30rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
  background-color: #F5F5F5;
}

.goods-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.goods-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-spec {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.goods-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goods-price {
  font-size: 28rpx;
  color: #666;
}

.goods-quantity {
  font-size: 26rpx;
  color: #999;
}

.goods-subtotal {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-left: 20rpx;
  min-width: 100rpx;
  text-align: right;
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

/* 取消原因 */
.cancel-reason {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-top: 20rpx;
  background-color: #FFF3F3;
  border-radius: 15rpx;
  font-size: 30rpx;
}

.cancel-reason-label {
  color: #FF6B6B;
  font-weight: 500;
}

.cancel-reason-value {
  color: #FF4444;
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

.action-button.cancel-btn {
  background-color: #FF4444;
}
</style>