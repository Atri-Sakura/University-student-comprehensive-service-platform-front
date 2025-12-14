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
          <image class="product-image" :src="order.mainImageUrl || '/static/default-product.png'" mode="aspectFill"></image>
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
    // 获取二手交易订单列表（同时获取买家和卖家的订单）
    async getSecondHandOrders() {
      try {
        this.loading = true;
        // 显示加载提示
        uni.showLoading({ title: '加载中...' });
        
        // 1. 获取买家订单（作为买家购买的订单）
        const buyerRes = await api.order.getOrderList();
        let buyerOrders = [];
        if (buyerRes && buyerRes.code === 200) {
          const orderList = buyerRes.rows || buyerRes.data || [];
          // 筛选出二手交易订单(orderType=3)
          buyerOrders = orderList.filter(item => item.orderType === 3);
        }
        
        // 2. 获取用户发布的商品列表（包括已售出的商品）
        let myGoodsIds = [];
        try {
          // 获取用户发布的商品，包括已售出的（status=2）
          const goodsRes = await api.secondhandGoods.getGoodsList({ pageNum: 1, pageSize: 1000 });
          if (goodsRes && goodsRes.code === 200) {
            const goodsList = goodsRes.rows || goodsRes.data || [];
            // 获取所有已售出的商品ID（status=2表示已售）
            myGoodsIds = goodsList
              .filter(item => item.status === 2 || item.status === '2')
              .map(item => item.id || item.goodsId || item.secondhandGoodsId)
              .filter(id => id != null);
          }
        } catch (error) {
          console.warn('获取用户发布的商品失败:', error);
        }
        
        // 3. 获取所有买家订单的详情，检查哪些订单的商品属于用户发布的
        const orderMap = new Map();
        
        // 先添加所有买家订单
        buyerOrders.forEach(order => {
          if (order.orderNo) {
            orderMap.set(order.orderNo, { ...order, role: 'buyer' });
          }
        });
        
        // 4. 对每个买家订单获取详情，检查商品ID是否属于用户发布的商品
        const orderDetails = await Promise.all(
          buyerOrders
            .filter(order => order && order.orderNo) // 先过滤掉没有orderNo的订单
            .map(async (order) => {
            try {
              const detailRes = await api.order.getSecondHandOrderDetail(order.orderNo);
              if (detailRes && detailRes.code === 200 && detailRes.data) {
                return { orderNo: order.orderNo, detail: detailRes.data };
              }
              return null;
            } catch (error) {
              console.error('获取订单详情失败:', order?.orderNo, error);
              return null;
            }
          })
        );
        
        // 5. 检查订单详情中的商品ID，如果属于用户发布的商品，则标记为卖家订单
        orderDetails
          .filter(item => item != null && item.orderNo && item.detail) // 过滤掉null值
          .forEach(({ orderNo, detail }) => {
          if (!detail || !orderNo) return;
          
          // 从订单详情中获取商品ID
          const goodsId = detail.goodsId || detail.goods_id;
          
          // 如果商品ID在用户发布的商品列表中，说明这是卖家订单
          if (goodsId) {
            const goodsIdStr = String(goodsId);
            const goodsIdNum = Number(goodsId);
            const isMyGoods = myGoodsIds.some(id => 
              String(id) === goodsIdStr || Number(id) === goodsIdNum
            );
            
            if (isMyGoods) {
              const existingOrder = orderMap.get(orderNo);
              if (existingOrder) {
                // 如果已经是买家订单，标记为both，否则标记为seller
                existingOrder.role = existingOrder.role === 'buyer' ? 'both' : 'seller';
              } else {
                // 如果不在买家订单列表中，添加为卖家订单
                orderMap.set(orderNo, { ...detail, orderNo, role: 'seller' });
              }
            }
          }
        });
        
        // 6. 尝试通过卖家订单接口获取（如果后端有的话）
        try {
          const sellerRes = await api.secondhandGoods.getSellerOrderList();
          if (sellerRes && sellerRes.code === 200) {
            const sellerOrders = sellerRes.rows || sellerRes.data || [];
            sellerOrders.forEach(order => {
              if (order.orderNo) {
                if (!orderMap.has(order.orderNo)) {
                  orderMap.set(order.orderNo, { ...order, role: 'seller' });
                } else {
                  const existingOrder = orderMap.get(order.orderNo);
                  existingOrder.role = existingOrder.role === 'buyer' ? 'both' : 'seller';
                }
              }
            });
          }
        } catch (error) {
          // 如果卖家订单接口不存在，忽略错误
          console.log('卖家订单接口不存在或失败，使用商品匹配方式:', error);
        }
        
        // 7. 转换为数组并获取完整详情
        const allOrders = Array.from(orderMap.values());
        
        // 对每个订单获取完整详情（如果还没有详情的话）
        const detailedOrders = await Promise.all(
          allOrders.map(async (order) => {
            try {
              // 如果订单已经有详情数据（goodsName等），直接返回
              if (order.goodsName && order.mainImageUrl) {
                return order;
              }
              
              // 否则调用详情接口获取完整信息
              const detailRes = await api.order.getSecondHandOrderDetail(order.orderNo);
              if (detailRes && detailRes.code === 200) {
                // 将详情数据合并到原订单对象中，保留角色信息
                const mergedOrder = { ...order, ...detailRes.data, role: order.role || 'buyer' };
                return mergedOrder;
              }
              return order;
            } catch (error) {
              console.error('获取订单详情失败:', order.orderNo, error);
              return order;
            }
          })
        );
        
        // 8. 按创建时间倒序排序
        detailedOrders.sort((a, b) => {
          const timeA = new Date(a.createTime || 0).getTime();
          const timeB = new Date(b.createTime || 0).getTime();
          return timeB - timeA;
        });
        
        // 9. 更新订单列表
        this.orders = detailedOrders;
        
        console.log('获取到的订单数量:', detailedOrders.length);
        console.log('买家订单数量:', buyerOrders.length);
        console.log('用户发布的商品ID列表:', myGoodsIds);
        
        if (detailedOrders.length === 0) {
          console.log('没有找到二手交易订单');
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
      console.log('列表页orderStatus:', status, typeof status)
      const numStatus = Number(status)
      if (numStatus >= 1 && numStatus <= 3) {
        return 'status-selling' // 交易中
      } else if (numStatus === 4) {
        return 'status-completed' // 已完成
      } else if (numStatus === 5) {
        return 'status-removed' // 已取消
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
      return order?.goodsName || null
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