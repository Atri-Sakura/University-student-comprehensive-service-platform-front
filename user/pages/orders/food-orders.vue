<template>
  <view class="food-orders-container">
    <!-- 移除导航栏 -->
    
    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-item" v-for="(order, index) in orders" :key="order.orderNo" @click="viewOrderDetail(order.orderNo)">
        <view class="order-content">
          <image 
            class="food-image" 
            :src="getOrderImage(order)" 
            mode="aspectFill"
            @error="handleImageError"
          ></image>
          <view class="order-details">
            <view class="food-name">{{ getOrderGoodsName(order) }}</view>
            <view class="order-info">
              <text class="info-text">下单时间：{{ order.createTime }}</text>
              <text class="info-text">| 订单号：{{ order.orderNo }}</text>
            </view>
            <view class="order-status" :class="statusClass(order.orderStatus)">{{ orderStatusText(order.orderStatus) }}</view>
          </view>
          <view class="order-price">¥{{ order.totalAmount }}</view>
        </view>
      </view>
      
      <!-- 空订单提示 -->
      <view class="empty-order" v-if="orders.length === 0">
        <view class="empty-icon">🍽️</view>
        <view class="empty-text">暂无外卖订单</view>
        <button class="go-shopping" @click="goToShopping">去下单</button>
      </view>
    </view>
    
    <!-- 自定义底部导航栏 -->
    <custom-tabbar :current="3"></custom-tabbar>
  </view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
import api from '@/api/index.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      orders: [],
      loading: false
    };
  },
  mounted() {
    // 页面加载时获取外卖订单
    this.getFoodOrders();
  },
  onPullDownRefresh() {
    // 下拉刷新时重新获取数据
    this.getFoodOrders();
  },
  methods: {
    // 获取外卖订单列表
    async getFoodOrders() {
      try {
        this.loading = true;
        // 显示加载提示
        uni.showLoading({ title: '加载中...' });
        
        // 调用API获取所有订单，然后筛选出外卖订单(order_type=1)
        const res = await api.order.getOrderList();
        
        if (res && res.code === 200) {
          // 获取订单数据数组
            const orderList = res.rows || res.data || [];
            // 筛选出外卖订单(orderType=1)
            const foodOrders = orderList.filter(item => item.orderType === 1);
            
            // 对每个外卖订单调用详情接口获取完整信息
            const detailedOrders = await Promise.all(
              foodOrders.map(async (order) => {
                try {
                  // 调用订单详情接口
                  const detailRes = await api.order.getOrderDetail(order.orderNo);
                  if (detailRes && detailRes.code === 200) {
                    // 将详情数据合并到原订单对象中
                    const mergedOrder = { ...order, ...detailRes.data };
                    return mergedOrder;
                  }
                  return order;
                } catch (error) {
                  console.error('获取订单详情失败:', error);
                  return order;
                }
              })
            );
            
            // 批量获取所有订单的商品图片
            await this.batchLoadGoodsImages(detailedOrders);
            
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
        console.error('获取外卖订单失败:', error);
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
    
    goToShopping() {
      console.log('去下单');
      // 跳转到外卖首页
      uni.navigateTo({ url: '/pages/index/index' });
    },
    
    // 查看订单详情
    viewOrderDetail(orderId) {
      uni.navigateTo({
        url: `/pages/orders/food-order-detail?id=${orderId}`
      })
    },
    
    // 订单状态样式
    statusClass(status) {
      const statusMap = {
        1: 'status-waiting',   // 商家待接单
        2: 'status-progress',  // 骑手待接单
        3: 'status-progress',  // 骑手待取货
        4: 'status-progress',  // 配送中
        5: 'status-completed', // 已完成
        6: 'status-canceled',  // 已取消
        7: 'status-exception'  // 骑手异常报备
      }
      return statusMap[status] || ''
    },
    
    // 订单状态文本
    orderStatusText(status) {
      const statusMap = {
        1: '商家待接单',
        2: '骑手待接单',
        3: '骑手待取货',
        4: '配送中',
        5: '已完成',
        6: '已取消',
        7: '骑手异常报备'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 批量获取所有订单的商品图片
    async batchLoadGoodsImages(orders) {
      // 收集所有需要查询的商品ID（去重）
      const goodsIdsSet = new Set();
      orders.forEach(order => {
        if (order.orderTakeoutDetailList && order.orderTakeoutDetailList.length > 0) {
          order.orderTakeoutDetailList.forEach(detail => {
            if (detail.goodsId && !detail.mainImage) {
              goodsIdsSet.add(detail.goodsId);
            }
          });
        }
      });
      
      if (goodsIdsSet.size === 0) {
        return;
      }
      
      // 批量查询商品图片
      const goodsImagesMap = {};
      const imagePromises = Array.from(goodsIdsSet).map(async (goodsId) => {
        try {
          const goodsRes = await api.food.getGoodsDetail(goodsId);
          if (goodsRes && goodsRes.code === 200 && goodsRes.data) {
            const images = goodsRes.data.images || [];
            // 获取主图（isMain=1的图片）或第一张图片
            const mainImage = images.find(img => img.isMain === 1)?.imageUrl || 
                            (images.length > 0 ? images[0].imageUrl : null);
            goodsImagesMap[goodsId] = {
              mainImage: mainImage,
              images: images
            };
          }
        } catch (error) {
          console.warn(`获取商品${goodsId}的图片失败:`, error);
          goodsImagesMap[goodsId] = {
            mainImage: null,
            images: []
          };
        }
      });
      
      await Promise.all(imagePromises);
      
      // 将图片信息添加到对应的订单明细中
      orders.forEach(order => {
        if (order.orderTakeoutDetailList && order.orderTakeoutDetailList.length > 0) {
          const firstDetail = order.orderTakeoutDetailList[0];
          if (firstDetail.goodsId && goodsImagesMap[firstDetail.goodsId]) {
            const imageInfo = goodsImagesMap[firstDetail.goodsId];
            order.imageUrl = imageInfo.mainImage;
            firstDetail.mainImage = imageInfo.mainImage;
            firstDetail.images = imageInfo.images;
          }
        }
      });
    },
    
    // 获取订单商品名称
    getOrderGoodsName(order) {
      // 尝试从各种可能的路径获取商品名称
      let goodsName = null;
      
      // 路径1: orderTakeoutDetailList
      if (order.orderTakeoutDetailList && order.orderTakeoutDetailList.length > 0) {
        for (const takeoutDetail of order.orderTakeoutDetailList) {
          // 首先检查当前takeoutDetail是否直接包含goodsName
          if (takeoutDetail.goodsName) {
            goodsName = takeoutDetail.goodsName;
            break;
          }
          // 然后再检查是否嵌套在createOrderItemList中
          if (takeoutDetail.createOrderItemList && takeoutDetail.createOrderItemList.length > 0) {
            goodsName = takeoutDetail.createOrderItemList[0].goodsName;
            break;
          }
        }
      }
      
      // 路径2: orderItemList
      if (!goodsName && order.orderItemList && order.orderItemList.length > 0) {
        goodsName = order.orderItemList[0].goodsName;
      }
      
      // 路径3: createOrderItemList（顶层）
      if (!goodsName && order.createOrderItemList && order.createOrderItemList.length > 0) {
        goodsName = order.createOrderItemList[0].goodsName;
      }
      
      // 路径4: 尝试直接从order对象获取
      if (!goodsName && order.goodsName) {
        goodsName = order.goodsName;
      }
      
      // 路径5: 检查其他可能的字段名
      const otherFields = ['orderGoods', 'items', 'products'];
      for (const field of otherFields) {
        if (!goodsName && order[field] && order[field].length > 0) {
          if (order[field][0].goodsName) {
            goodsName = order[field][0].goodsName;
            break;
          }
        }
      }
      
      // 最后回退到取货地址或默认文本
      if (!goodsName) {
        goodsName = order.pickAddress || '外卖订单';
      }
      
      return goodsName;
    },
    
    // 获取订单商品图片
    getOrderImage(order) {
      // 优先使用订单的imageUrl
      if (order.imageUrl) {
        return order.imageUrl;
      }
      
      // 从订单明细中获取图片
      if (order.orderTakeoutDetailList && order.orderTakeoutDetailList.length > 0) {
        const firstDetail = order.orderTakeoutDetailList[0];
        if (firstDetail.mainImage) {
          return firstDetail.mainImage;
        }
        if (firstDetail.images && firstDetail.images.length > 0) {
          const mainImg = firstDetail.images.find(img => img.isMain === 1);
          return mainImg ? mainImg.imageUrl : firstDetail.images[0].imageUrl;
        }
      }
      
      // 默认图片
      return '/static/default-food.png';
    },
    
    // 图片加载错误处理
    handleImageError(e) {
      console.warn('订单商品图片加载失败:', e);
      // 可以在这里设置默认图片
    }
  }
};
</script>

<style scoped>
.food-orders-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
}

/* 订单列表样式 - 移除顶部padding以消除空白间隔 */
.order-list {
  padding: 0 20rpx 20rpx; /* 只保留左右和底部padding */
}

.order-item {
  background-color: white;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.order-item:active {
  background-color: #F5F5F5;
}

.order-content {
  display: flex;
  padding: 25rpx;
  align-items: center;
}

.food-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.order-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.food-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-info {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 10rpx;
  line-height: 1.4;
}

.info-text {
  display: block;
}

.order-status {
  font-size: 28rpx;
  color: #5DCDFF;
}

/* 不同状态的颜色样式 */
.status-waiting {
  color: #5DCDFF;
}

.status-progress {
  color: #52C41A;
}

.status-completed {
  color: #999;
}

.status-canceled {
  color: #FF4D4F;
}

.status-exception {
  color: #FA8C16;
}

.order-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF4444;
  margin-left: 20rpx;
}

/* 空订单样式 */
.empty-order {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.go-shopping {
  background-color: #5DCDFF;
  color: white;
  border: none;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
}


</style>
