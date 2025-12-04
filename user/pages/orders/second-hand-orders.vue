<template>
  <view class="second-hand-orders-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="navbar-title">一键转卖记录</text>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list" v-if="orders.length > 0">
      <view class="order-item" v-for="order in orders" :key="order.orderMainID" @click="viewOrderDetail(order.orderNo)">
        <!-- 状态标签 -->
        <text :class="['order-status', statusClass(order.orderStatus)]">{{ orderStatusText(order.orderStatus) }}</text>
        
        <!-- 商品信息 -->
        <view class="product-info">
          <image class="product-image" :src="order.imageUrl || '/static/default-product.png'" mode="aspectFill"></image>
          <view class="product-details">
            <text class="product-name">{{ getOrderGoodsName(order) || '二手交易订单' }}</text>
            <text class="product-time">转卖时间：{{ order.createTime }}</text>
            <text class="product-price">¥{{ order.totalAmount }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 空订单 -->
    <view class="empty-order" v-else>
      <text class="empty-icon">📦</text>
      <text class="empty-text">暂无转卖记录</text>
      <button class="go-market" @click="goToMarket">去转卖</button>
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js';

export default {
  data() {
    return {
      orders: [],
      loading: false
    }
  },
  mounted() {
    // 页面加载时获取二手交易订单
    this.getSecondHandOrders();
  },
  onPullDownRefresh() {
    // 下拉刷新时重新获取数据
    this.getSecondHandOrders();
  },
  methods: {
    // 获取二手交易订单列表
    async getSecondHandOrders() {
      try {
        this.loading = true;
        // 显示加载提示
        uni.showLoading({ title: '加载中...' });
        
        // 调用API获取所有订单，然后筛选出二手交易订单(order_type=3)
        const res = await api.order.getOrderList();
        
        if (res && res.code === 200) {
          // 获取订单数据数组
          const orderList = res.rows || res.data || [];
          // 筛选出二手交易订单(orderType=3)
          const secondHandOrders = orderList.filter(item => item.orderType === 3);
          
          // 对每个二手交易订单调用详情接口获取完整信息
          const detailedOrders = await Promise.all(
            secondHandOrders.map(async (order) => {
              try {
                // 调用二手交易订单详情接口
                const detailRes = await api.order.getSecondHandOrderDetail(order.orderNo);
                if (detailRes && detailRes.code === 200) {
                  // 将详情数据合并到原订单对象中
                  const mergedOrder = { ...order, ...detailRes.data };
                  return mergedOrder;
                }
                return order;
              } catch (error) {
                console.error('获取二手交易订单详情失败:', error);
                return order;
              }
            })
          );
          
          // 更新订单列表
          this.orders = detailedOrders;
        } else {
          console.warn('API返回状态异常:', res);
          uni.showToast({ 
            title: res?.msg || res?.message || '获取订单失败', 
            icon: 'none' 
          });
        }
      } catch (error) {
        console.error('获取二手交易订单失败:', error);
        uni.showToast({ 
          title: '网络错误，请稍后重试', 
          icon: 'none' 
        });
      } finally {
        this.loading = false;
        uni.hideLoading();
        // 停止下拉刷新动画
        uni.stopPullDownRefresh();
      }
    },
    
    // 订单状态样式
    statusClass(status) {
      const statusMap = {
        0: 'status-removed',  // 已下架
        1: 'status-selling',  // 销售中
        2: 'status-completed' // 已成交
      }
      return statusMap[status] || ''
    },
    
    // 订单状态文本
    orderStatusText(status) {
      const statusMap = {
        0: '已下架',
        1: '销售中',
        2: '已成交'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 去转卖
    goToMarket() {
      uni.navigateTo({
        url: '/pages/market/market'
      })
    },
    
    // 查看订单详情
    viewOrderDetail(orderNo) {
      console.log('查看订单详情:', orderNo);
      // 跳转到订单详情页面
      uni.navigateTo({
        url: `/pages/orders/second-hand-order-detail?orderNo=${orderNo}`
      });
    },
    
    // 获取订单商品名称
    getOrderGoodsName(order) {
      // 尝试从orderSecondhandDetailList获取商品名称
      if (order.orderSecondhandDetailList && order.orderSecondhandDetailList.length > 0) {
        return order.orderSecondhandDetailList[0].goodsName;
      }
      // 如果没有找到，返回null
      return null;
    }
  }
}
</script>

<style scoped>
/* 容器样式 */
.second-hand-orders-container {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
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

/* 订单列表样式 */
.order-list {
  padding: 120rpx 30rpx 30rpx 30rpx;
}

.order-item {
  background-color: white;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
}

/* 产品信息样式 */
.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 15rpx;
  margin-right: 25rpx;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.product-name {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.product-time {
  font-size: 28rpx;
  color: #999;
}

.product-price {
  font-size: 34rpx;
  color: #FF4444;
  font-weight: bold;
}

/* 状态标签样式 */
.order-status {
  position: absolute;
  top: 25rpx;
  right: 25rpx;
  font-size: 28rpx;
  font-weight: 500;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
  background-color: #E3F2FD;
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

/* 空订单样式 */
.empty-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 150rpx;
  margin-bottom: 40rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 50rpx;
}

.go-market {
  background-color: #5DCDFF;
  color: white;
  border: none;
  padding: 0 80rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
}
</style>