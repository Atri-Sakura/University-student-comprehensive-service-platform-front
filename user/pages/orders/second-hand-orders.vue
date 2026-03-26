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
    
    <!-- 分类导航栏 -->
    <view class="category-navbar">
      <view 
        class="category-item" 
        :class="{ 'active': activeCategory === 'buyer' }"
        @click="switchCategory('buyer')"
      >
        <text class="category-text">我买入</text>
      </view>
      <view 
        class="category-item" 
        :class="{ 'active': activeCategory === 'seller' }"
        @click="switchCategory('seller')"
      >
        <text class="category-text">我卖出</text>
      </view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list" v-if="displayOrders.length > 0">
      <view class="order-item" v-for="order in displayOrders" :key="order.orderMainID" @click="viewOrderDetail(order.orderNo, activeCategory)">
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
      <text class="empty-text">{{ activeCategory === 'buyer' ? '暂无买入记录' : '暂无卖出记录' }}</text>
      <button class="go-market" @click="goToMarket" v-if="activeCategory === 'seller'">去转卖</button>
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js';

export default {
  data() {
    return {
      orders: [],
      displayOrders: [], // 根据分类显示的订单
      loading: false,
      activeCategory: 'buyer', // 当前选中的分类：buyer(我买入)或seller(我卖出)
      sellerOrdersFromIndex: [], // 存储从index.vue传递的卖家订单数据
    };
  },
    onLoad() {
      // 接收来自index.vue传递的卖家订单数据
      const eventChannel = this.getOpenerEventChannel();
      if (eventChannel) {
        eventChannel.on('acceptSellerOrders', (data) => {
          console.log('从index.vue接收到的卖家订单数据:', data.sellerOrders);
          if (data.sellerOrders && Array.isArray(data.sellerOrders)) {
            this.sellerOrdersFromIndex = data.sellerOrders;
          }
        });
      }
      
      // 页面加载时获取二手交易订单
      this.getSecondHandOrders();
    },
    mounted() {
      // 组件挂载时的逻辑
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
          
          // 定义临时变量存储订单
          let myGoodsIds = []; // 移到外层作用域，解决未定义错误
        
        // 1. 优先使用从index.vue传递的卖家订单数据
        const directSellerOrders = this.sellerOrdersFromIndex.filter(order => 
          order && (order.orderType === 3 || order.orderType === '3' || order.role === 'seller')
        );
        
        console.log('直接使用的卖家订单数量:', directSellerOrders.length);
        
        // 2. 获取买家订单（作为买家购买的订单）
        const buyerRes = await api.order.getOrderList();
        let buyerOrders = [];
        if (buyerRes && buyerRes.code === 200) {
          const orderList = buyerRes.rows || buyerRes.data || [];
          // 筛选出二手交易订单(orderType=3)
          buyerOrders = orderList.filter(item => item.orderType === 3);
        }
        
        // 3. 创建订单映射表，确保订单唯一性
        const orderMap = new Map();
        
        // 首先添加所有直接卖家订单
        directSellerOrders.forEach(order => {
          // 使用orderNo或orderMainId作为唯一键
          const orderKey = order.orderNo || order.orderMainId || `no-orderNo-${Math.random()}`;
          orderMap.set(orderKey, { ...order, role: 'seller' });
          console.log('添加直接卖家订单到orderMap:', orderKey, order.goodsName || '无商品名称');
        });
        
        // 然后添加买家订单
        buyerOrders.forEach(order => {
          if (order.orderNo) {
            const orderKey = order.orderNo;
            // 只有当订单不存在时才添加，避免覆盖卖家订单
            if (!orderMap.has(orderKey)) {
              orderMap.set(orderKey, { ...order, role: 'buyer' });
            } else {
              // 如果订单已存在（可能是卖家订单），标记为both
              const existingOrder = orderMap.get(orderKey);
              existingOrder.role = 'both';
            }
          }
        });
        
        // 4. 如果没有直接卖家订单，尝试通过商品匹配方式获取卖家订单
        if (directSellerOrders.length === 0) {
          console.log('没有直接卖家订单，尝试通过商品匹配方式获取');
          
          // 获取用户发布的商品列表（包括已售出的商品）
          try {
            const goodsRes = await api.secondhandGoods.getGoodsList({ pageNum: 1, pageSize: 1000 });
            if (goodsRes && goodsRes.code === 200) {
              const goodsList = goodsRes.rows || goodsRes.data || [];
              // 获取所有已售出的商品ID
              myGoodsIds = goodsList
                .filter(item => item.status === 2 || item.status === '2')
                .map(item => item.id || item.goodsId || item.secondhandGoodsId)
                .filter(id => id != null);
            }
          } catch (error) {
            console.warn('获取用户发布的商品失败:', error);
          }
          
          // 对每个买家订单获取详情，检查商品ID是否属于用户发布的
          if (buyerOrders.length > 0 && myGoodsIds.length > 0) {
            const orderDetails = await Promise.all(
              buyerOrders
                .filter(order => order && order.orderNo) // 过滤掉没有orderNo的订单
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
            
            // 检查订单详情中的商品ID，如果属于用户发布的商品，则标记为卖家订单
            orderDetails
              .filter(item => item != null && item.orderNo && item.detail)
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
                    existingOrder.role = existingOrder.role === 'buyer' ? 'both' : 'seller';
                  } else {
                    orderMap.set(orderNo, { ...detail, orderNo, role: 'seller' });
                  }
                }
              }
            });
          } else if (directSellerOrders.length === 0) {
            // 如果没有直接卖家订单，也尝试调用卖家订单接口
            try {
              const sellerRes = await api.order.getSellerOrderList();
              if (sellerRes && sellerRes.code === 200) {
                const sellerOrders = sellerRes.rows || sellerRes.data || [];
                sellerOrders.forEach(order => {
                  const orderKey = order.orderNo || order.orderMainId || `no-orderNo-${Math.random()}`;
                  if (!orderMap.has(orderKey)) {
                    orderMap.set(orderKey, { ...order, role: 'seller' });
                  } else {
                    const existingOrder = orderMap.get(orderKey);
                    existingOrder.role = existingOrder.role === 'buyer' ? 'both' : 'seller';
                  }
                });
              }
            } catch (error) {
              console.log('获取卖家订单接口失败:', error);
            }
          }
        }
        
        // 7. 转换为数组并获取完整详情
        const allOrders = Array.from(orderMap.values());
        console.log('orderMap中的订单数量:', allOrders.length);
        console.log('orderMap中的订单角色分布:', allOrders.reduce((acc, order) => {
          acc[order.role || 'unknown'] = (acc[order.role || 'unknown'] || 0) + 1;
          return acc;
        }, {}));
        
        // 对每个订单获取完整详情（如果还没有详情的话）
        const detailedOrders = await Promise.all(
          allOrders.map(async (order) => {
            try {
              // 如果订单已经有详情数据（goodsName等），直接返回
              if (order.goodsName && order.mainImageUrl) {
                return order;
              }
              
              // 否则根据订单类型选择合适的详情接口获取完整信息
              let detailRes;
              if (order.role === 'seller' && order.orderMainId) {
                // 卖家订单使用orderMainId调用专门的卖家详情接口
                detailRes = await api.order.getSellerSecondHandOrderDetail(order.orderMainId);
              } else {
                // 买家订单使用orderNo调用普通详情接口
                detailRes = await api.order.getSecondHandOrderDetail(order.orderNo);
              }
              
              if (detailRes && detailRes.code === 200) {
                // 将详情数据合并到原订单对象中，保留角色信息
                const mergedOrder = { ...order, ...detailRes.data, role: order.role || 'buyer' };
                return mergedOrder;
              }
              return order;
            } catch (error) {
              console.error('获取订单详情失败:', order.orderNo || order.orderMainId, error);
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
        
        // 更新订单列表
        this.orders = detailedOrders;
        // 根据当前分类筛选显示的订单
        this.filterOrdersByCategory();
        
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
      const numStatus = Number(status)
      if (numStatus === 1 || numStatus === 2) {
        return 'status-selling' // 交易中
      } else if (numStatus === 5) {
        return 'status-completed' // 已完成
      } else if (numStatus === 6) {
        return 'status-canceled' // 已取消
      } 
      return ''
    },
    
    // 订单状态文本
    orderStatusText(status) {
      const numStatus = Number(status)
      if (numStatus === 1) {
        // 卖家订单的状态1显示为"交易中"，买家订单显示为"待支付"
        return this.activeCategory === 'seller' ? '交易中' : '待支付'
      } else if (numStatus === 2) {
        return '交易中'
      } else if (numStatus === 5) {
        return '已完成'
      } else if (numStatus === 6) {
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
      console.log('查看订单详情，订单号:', orderNo, '角色:', role);
      // 跳转到订单详情页面，传递orderNo和role
      uni.navigateTo({
        url: `/pages/orders/second-hand-order-detail?orderNo=${orderNo || ''}&role=${role || ''}`
      });
    },
    
    // 获取订单商品名称
    getOrderGoodsName(order) {
      return order?.goodsName || null
    },
    
    // 切换分类
    switchCategory(category) {
      if (this.activeCategory === category) return;
      this.activeCategory = category;
      this.filterOrdersByCategory();
    },
    
    // 根据分类筛选订单
    filterOrdersByCategory() {
      if (this.activeCategory === 'buyer') {
        // 显示买家订单
        this.displayOrders = this.orders.filter(order => order.role === 'buyer' || order.role === 'both');
      } else {
        // 显示卖家订单
        this.displayOrders = this.orders.filter(order => order.role === 'seller' || order.role === 'both');
      }
      console.log(`切换到${this.activeCategory === 'buyer' ? '买家' : '卖家'}订单，数量：${this.displayOrders.length}`);
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

/*<!-- 分类导航栏样式 -->
.category-navbar {
  display: flex;
  background-color: white;
  margin-top: 90rpx;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.category-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80rpx;
  position: relative;
}

.category-text {
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
}

.category-item.active .category-text {
  color: #5DCDFF;
  font-weight: bold;
}

.category-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background-color: #5DCDFF;
  border-radius: 3rpx;
}

/* 分类导航栏样式 */
.category-navbar {
  display: flex;
  background-color: white;
  margin-top: 90rpx;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.category-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80rpx;
  position: relative;
}

.category-text {
  font-size: 32rpx;
  color: #666;
  font-weight: 500;
}

.category-item.active .category-text {
  color: #5DCDFF;
  font-weight: bold;
}

.category-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background-color: #5DCDFF;
  border-radius: 3rpx;
}

/* 订单列表样式 */
.order-list {
  padding: 200rpx 30rpx 30rpx 30rpx;
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

.status-canceled {
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