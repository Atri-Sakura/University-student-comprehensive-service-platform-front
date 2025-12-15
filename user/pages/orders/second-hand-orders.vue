<template>
  <view class="second-hand-orders-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="navbar-title">二手交易记录</text>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list" v-if="orders.length > 0">
      <view class="order-item" v-for="order in orders" :key="order.orderMainID || order.orderNo" @click="viewOrderDetail(order.orderNo, order.role)">
        <!-- 角色标签 -->
        <view class="order-tags">
          <text :class="['role-tag', getRoleClass(order.role)]">{{ getRoleText(order.role) }}</text>
          <text :class="['order-status', statusClass(order.orderStatus)]">{{ orderStatusText(order.orderStatus) }}</text>
        </view>
        
        <!-- 商品信息 -->
        <view class="product-info">
          <image class="product-image" :src="order.mainImageUrl || '/static/default-product.png'" mode="aspectFill"></image>
          <view class="product-details">
            <text class="product-name">{{ getOrderGoodsName(order) || '二手交易订单' }}</text>
            <text class="product-time">{{ order.role === 'seller' ? '出售' : '购买' }}时间：{{ order.createTime }}</text>
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
        
        // 2. 获取用户发布的商品列表（包括所有状态的商品）
        let myGoodsMap = new Map(); // 使用Map存储商品ID和商品信息的映射
        try {
          // 获取用户发布的所有商品
          const goodsRes = await api.secondhandGoods.getGoodsList({ pageNum: 1, pageSize: 1000 });
          if (goodsRes && goodsRes.code === 200) {
            const goodsList = goodsRes.rows || goodsRes.data || [];
            // 存储所有商品（不仅仅是已售出的）
            goodsList.forEach(item => {
              const goodsId = item.id || item.goodsId || item.secondhandGoodsId;
              if (goodsId != null) {
                myGoodsMap.set(String(goodsId), item);
              }
            });
          }
        } catch (error) {
          console.warn('获取用户发布的商品失败:', error);
        }
        
        console.log('用户发布的商品数量:', myGoodsMap.size);
        console.log('用户发布的商品ID列表:', Array.from(myGoodsMap.keys()));
        
        // 3. 创建订单Map，用于去重
        const orderMap = new Map();
        
        // 先添加所有买家订单
        buyerOrders.forEach(order => {
          if (order.orderNo) {
            orderMap.set(order.orderNo, { ...order, role: 'buyer' });
          }
        });
        
        // 4. 尝试通过卖家订单接口获取（如果后端有的话）
        let sellerOrdersFromApi = [];
        try {
          const sellerRes = await api.secondhandGoods.getSellerOrderList();
          console.log('卖家订单接口响应:', sellerRes);
          
          if (sellerRes && sellerRes.code === 200) {
            // 后端返回格式可能是 { code: 200, data: [...] } 或 { code: 200, msg: "...", data: [...] }
            sellerOrdersFromApi = sellerRes.rows || sellerRes.data || [];
            
            // 如果data不是数组，可能是嵌套的
            if (!Array.isArray(sellerOrdersFromApi) && sellerOrdersFromApi) {
              sellerOrdersFromApi = sellerOrdersFromApi.rows || sellerOrdersFromApi.list || [];
            }
            
            console.log('从卖家订单接口获取到订单数量:', sellerOrdersFromApi.length);
            console.log('卖家订单数据:', sellerOrdersFromApi);
            
            sellerOrdersFromApi.forEach(order => {
              if (order.orderNo) {
                if (!orderMap.has(order.orderNo)) {
                  // 这是纯卖家订单（不在买家订单列表中）
                  orderMap.set(order.orderNo, { ...order, role: 'seller' });
                } else {
                  // 这个订单同时在买家和卖家列表中（自购）
                  const existingOrder = orderMap.get(order.orderNo);
                  existingOrder.role = 'both';
                }
              }
            });
          } else {
            console.log('卖家订单接口返回非200:', sellerRes);
          }
        } catch (error) {
          // 如果卖家订单接口不存在，忽略错误
          console.log('卖家订单接口调用失败:', error);
        }
        
        // 5. 获取所有订单的详情，并检查商品ID是否属于用户发布的商品
        const allOrderNos = Array.from(orderMap.keys());
        
        const orderDetailsPromises = allOrderNos.map(async (orderNo) => {
          try {
            const detailRes = await api.order.getSecondHandOrderDetail(orderNo);
            if (detailRes && detailRes.code === 200 && detailRes.data) {
              return { orderNo, detail: detailRes.data };
            }
            return null;
          } catch (error) {
            console.error('获取订单详情失败:', orderNo, error);
            return null;
          }
        });
        
        const orderDetails = await Promise.all(orderDetailsPromises);
        
        // 6. 处理订单详情，检查是否为卖家订单
        orderDetails
          .filter(item => item != null && item.orderNo && item.detail)
          .forEach(({ orderNo, detail }) => {
            // 从订单详情中获取商品ID
            let goodsId = detail.goodsId || detail.goods_id;
            
            // 如果详情中没有直接的goodsId，尝试从orderSecondhandDetailList中获取
            if (!goodsId && detail.orderSecondhandDetailList && detail.orderSecondhandDetailList.length > 0) {
              goodsId = detail.orderSecondhandDetailList[0].goodsId || detail.orderSecondhandDetailList[0].secondhandGoodsId;
            }
            
            const existingOrder = orderMap.get(orderNo);
            if (existingOrder) {
              // 合并详情数据
              Object.assign(existingOrder, detail);
              
              // 检查商品ID是否属于用户发布的商品
              if (goodsId) {
                const goodsIdStr = String(goodsId);
                if (myGoodsMap.has(goodsIdStr)) {
                  // 当前用户是这个商品的发布者
                  if (existingOrder.role === 'buyer') {
                    // 如果同时是买家，说明是自购
                    existingOrder.role = 'both';
                  } else {
                    // 否则是纯卖家订单
                    existingOrder.role = 'seller';
                  }
                  console.log('识别到卖家订单:', orderNo, '商品ID:', goodsId, '角色:', existingOrder.role);
                }
              }
            }
          });
        
        // 7. 转换为数组
        const allOrders = Array.from(orderMap.values());
        
        // 8. 获取商品名称和图片（如果订单中没有的话）
        const detailedOrders = allOrders.map(order => {
          // 尝试从orderSecondhandDetailList获取商品信息
          if (!order.goodsName && order.orderSecondhandDetailList && order.orderSecondhandDetailList.length > 0) {
            const detail = order.orderSecondhandDetailList[0];
            order.goodsName = detail.goodsName;
            order.mainImageUrl = detail.mainImageUrl || detail.imageUrl;
          }
          return order;
        });
        
        // 9. 按创建时间倒序排序
        detailedOrders.sort((a, b) => {
          const timeA = new Date(a.createTime || 0).getTime();
          const timeB = new Date(b.createTime || 0).getTime();
          return timeB - timeA;
        });
        
        // 10. 更新订单列表
        this.orders = detailedOrders;
        
        console.log('获取到的订单数量:', detailedOrders.length);
        console.log('买家订单数量:', buyerOrders.length);
        console.log('卖家订单数量(API):', sellerOrdersFromApi.length);
        console.log('订单角色分布:', detailedOrders.map(o => ({ orderNo: o.orderNo, role: o.role })));
        
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
    viewOrderDetail(orderNo, role) {
      console.log('查看订单详情:', orderNo, '角色:', role);
      // 跳转到订单详情页面，传递角色信息
      uni.navigateTo({
        url: `/pages/orders/second-hand-order-detail?orderNo=${orderNo}&role=${role || 'buyer'}`
      });
    },
    
    // 获取角色文本
    getRoleText(role) {
      if (role === 'seller') return '我卖出';
      if (role === 'both') return '自购';
      return '我买入';
    },
    
    // 获取角色样式类
    getRoleClass(role) {
      if (role === 'seller') return 'role-seller';
      if (role === 'both') return 'role-both';
      return 'role-buyer';
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

/* 订单标签容器 */
.order-tags {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

/* 角色标签样式 */
.role-tag {
  font-size: 24rpx;
  font-weight: 500;
  padding: 5rpx 15rpx;
  border-radius: 15rpx;
}

.role-buyer {
  color: #1976D2;
  background-color: #E3F2FD;
}

.role-seller {
  color: #388E3C;
  background-color: #E8F5E9;
}

.role-both {
  color: #F57C00;
  background-color: #FFF3E0;
}

/* 状态标签样式 */
.order-status {
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