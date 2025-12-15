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
          <view class="info-item">
            <text class="info-label">商品名称</text>
            <text class="info-value">{{ displayGoodsName }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">交易金额</text>
            <text class="info-value price">¥{{ order.totalAmount }}</text>
          </view>
        </view>
        
        <!-- 交易对方信息卡片 -->
        <view class="user-card">
          <view class="info-header">
            <text class="info-icon">👤</text>
            <text class="info-title">交易对方信息</text>
          </view>
          <view class="info-item">
            <text class="info-label">对方昵称</text>
            <text class="info-value">{{ order.counterpartUsername || '未知' }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">联系电话</text>
            <text class="info-value">{{ order.counterpartPhone || '未知' }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部操作按钮 -->
    <view class="bottom-actions" v-if="!loading && !error">
      <!-- 交易中状态且是买家订单：显示确认收货按钮 -->
      <button 
        v-if="order.orderStatus >= 1 && order.orderStatus <= 3 && role === 'buyer'" 
        class="action-button confirm-button"
        @click="confirmReceipt">
        确认收货
      </button>
      
      <!-- 已完成状态：不显示按钮 -->
      <!-- 已取消状态：不显示按钮 -->
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js'

export default {
  computed: {
    displayGoodsName() {
      return this.order?.goodsName || '二手交易商品'
    }
  },
  data() {
    return {
      orderNo: '',
      orderMainId: '',
      role: 'buyer', // 当前用户角色：buyer(买家)或seller(卖家)
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
    // 从options中获取订单号、orderMainId和角色信息
    if (options.orderNo) {
      this.orderNo = options.orderNo
      // 如果有orderNo，默认是买家订单
      this.role = options.role || 'buyer'
      // 调用后端API获取订单详情
      this.getOrderDetail()
    } else if (options.orderMainId) {
      this.orderMainId = options.orderMainId
      // 如果有orderMainId，默认是卖家订单
      this.role = 'seller'
      // 调用后端API获取订单详情
      this.getOrderDetail()
    } else {
      console.error('未提供订单号或orderMainId')
      this.error = '未提供订单号或orderMainId'
      this.loading = false
    }
  },
  methods: {
    // 获取订单详情
    async getOrderDetail() {
      try {
        this.loading = true
        let res = null
        
        // 根据可用参数选择调用哪个API
        if (this.orderNo) {
          // 有orderNo，调用买家订单详情接口
          res = await api.order.getSecondHandOrderDetail(this.orderNo)
        } else if (this.orderMainId) {
          // 没有orderNo但有orderMainId，调用卖家订单详情接口
          res = await api.order.getSellerSecondHandOrderDetail(this.orderMainId)
        } else {
          console.error('未提供有效的订单标识')
          this.error = '未提供有效的订单标识'
          this.loading = false
          return
        }
        
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
      console.log('详情页orderStatus:', status, typeof status)
      const numStatus = Number(status)
      if (numStatus >= 1 && numStatus <= 3) {
        return 'status-selling'  // 交易中
      } else if (numStatus === 4) {
        return 'status-completed'  // 已完成
      } else if (numStatus === 5) {
        return 'status-removed'  // 已取消
      }
      return ''
    },
    
    // 订单状态文本
    orderStatusText(status) {
      const numStatus = Number(status)
      if (numStatus >= 1 && numStatus <= 3) {
        return '交易中'
      } else if (numStatus === 4) {
        return '已完成'
      } else if (numStatus === 5) {
        return '已取消'
      }
      return '未知状态'
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 确认收货
    async confirmReceipt() {
      try {
        // 显示确认对话框
        const confirmResult = await new Promise((resolve) => {
          uni.showModal({
            title: '确认收货',
            content: '确认已收到商品吗？',
            success: (res) => {
              resolve(res.confirm)
            }
          })
        })
        
        if (!confirmResult) {
          return
        }
        
        // 显示加载提示
        uni.showLoading({ title: '处理中...' })
        
        // 调用确认收货接口
        const res = await api.secondhandGoods.confirmOrder(this.orderNo)
        
        uni.hideLoading()
        
        if (res && res.code === 200) {
          uni.showToast({
            title: '确认收货成功',
            icon: 'success'
          })
          
          // 刷新订单详情
          setTimeout(() => {
            this.getOrderDetail()
          }, 1500)
        } else {
          uni.showToast({
            title: res.message || '操作失败',
            icon: 'none'
          })
        }
      } catch (err) {
        uni.hideLoading()
        console.error('确认收货失败:', err)
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        })
      }
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
.info-card, .user-card {
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

.status-removed {
  color: #999;
  background-color: #F5F5F5;
}

/* 底部操作按钮样式 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: white;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20rpx;
}

.action-button {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
}

.confirm-button {
  background-color: #5DCDFF;
  color: white;
}

.confirm-button:active {
  opacity: 0.8;
}
</style>