<template>
  <view class="errand-orders-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="navbar-title">我发布的跑腿</view>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 状态筛选标签 -->
    <view class="status-tabs">
      <view class="tab-item" :class="{ 'active': currentTab === 0 }" @click="changeTab(0)">全部</view>
      <view class="tab-item" :class="{ 'active': currentTab === 1 }" @click="changeTab(1)">未接单</view>
      <view class="tab-item" :class="{ 'active': currentTab === 2 }" @click="changeTab(2)">进行中</view>
      <view class="tab-item" :class="{ 'active': currentTab === 3 }" @click="changeTab(3)">已完成</view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-item" v-for="(order, index) in getFilteredOrders()" :key="index">
        <!-- 订单信息区域（可点击查看详情） -->
        <view class="order-info-area" @click="viewOrderDetail(order.id)">
          <!-- 订单标题和状态 -->
          <view class="order-main-info">
            <view class="order-title">{{ order.title }}</view>
            <view class="status-container">
              <view class="order-status" :class="statusClass(order.status)">{{ order.status }}</view>
              <view v-if="order.unpaid" class="unpaid-tag">未付费</view>
            </view>
          </view>
          
          <!-- 配送地点 -->
          <view class="delivery-location">
            <text class="location-icon">📍</text>
            <text class="location-text">{{ order.startLocation }}</text>
          </view>
          
          <!-- 价格和时间 -->
          <view class="price-time-row">
            <view class="order-price">¥{{ order.price || order.fee }}</view>
            <view class="order-time">{{ order.time }}</view>
          </view>
        </view>
        
        <!-- 未付费标签已移到订单状态旁边 -->
        
        <!-- 超市代购商品列表 -->
        <view v-if="order.category === 'shopping' && order.products && order.products.length > 0" class="product-list">
          <view class="product-list-title">购买商品：</view>
          <view class="product-item" v-for="(product, pIndex) in order.products" :key="pIndex">
            <view class="product-name">{{ product.name }}</view>
            <view class="product-price">¥{{ product.price.toFixed(2) }}</view>
          </view>
          <view class="product-total">
            <view class="product-total-text">商品总额：</view>
            <view class="product-total-price">¥{{ order.productTotal.toFixed(2) }}</view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="order-actions">
          <button 
            class="action-button" 
            :class="order.actionTypes && order.actionTypes[actionIndex] || 'default'"
            v-for="(action, actionIndex) in order.actions" 
            :key="actionIndex" 
            @click="handleOrderAction(order, action)"
          >
            {{ action }}
          </button>
        </view>
      </view>
      
      <!-- 空订单提示 -->
      <view class="empty-order" v-if="orders.length === 0">
        <view class="empty-icon">🏃</view>
        <view class="empty-text">暂无跑腿订单</view>
        <button class="go-order" @click="goToOrder">去下单</button>
      </view>
    </view>
    
    <!-- 自定义底部导航栏 -->
    <custom-tabbar :current="3"></custom-tabbar>
  </view>
</template>

<style scoped>
/* 为底部导航栏留出空间 */
.order-list {
  padding-bottom: 120rpx;
}
</style>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
import { getErrandOrderList, cancelOrder, confirmOrder } from '@/api/errand.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      currentTab: 0, // 0:全部, 1:未接单, 2:进行中, 3:已完成
      orders: [],
      loading: false,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      mockOrders: [
        {
          id: 'P001',
          title: '代取校外外卖（麦当劳）',
          time: '今天18:00前',
          status: '未接单',
          startLocation: '校门口外卖架到计算机学院201',
          fee: 10.00,
          totalPrice: 10.00,
          actions: ['修改订单', '取消订单'],
          actionTypes: ['default', 'default'],
          category: 'food'
        },
        {
          id: 'P002',
          title: '代取快递（中通）',
          time: '今天14:30接单',
          status: '进行中',
          startLocation: '菜鸟驿站到3号宿舍楼502',
          fee: 8.00,
          totalPrice: 8.00,
          actions: ['联系跑腿员', '查看位置', '联系客服'],
          actionTypes: ['primary', 'default', 'default'],
          category: 'express'
        },
        {
          id: 'P003',
          title: '代取食堂外卖（麻辣香锅）',
          time: '昨天12:30完成',
          status: '已完成',
          startLocation: '从二食堂到图书馆3楼',
          fee: 5.00,
          totalPrice: 5.00,
          actions: ['评价跑腿员', '查看详情', '联系客服'],
          actionTypes: ['primary', 'default', 'default'],
          category: 'food'
        },
        {
          id: 'P004',
          title: '超市代购（零食饮料）',
          time: '今天13:45完成',
          status: '已完成',
          startLocation: '从沃尔玛超市到学生公寓7号楼308',
          fee: 15.00,
          totalPrice: 15.00,
          actions: ['评价跑腿员', '查看详情', '支付商品费', '联系客服'],
          actionTypes: ['primary', 'default', 'primary', 'default'],
          category: 'shopping',
          unpaid: true,
          products: [
            { name: '薯片（原味）', price: 12.50 },
            { name: '可乐（500ml）', price: 4.00 },
            { name: '巧克力饼干', price: 8.50 },
            { name: '矿泉水', price: 2.00 }
          ],
          productTotal: 27.00
        }
      ]
    };
  },
  onLoad() {
    this.loadOrders();
  },
  onShow() {
    // 页面显示时刷新订单列表
    this.loadOrders();
  },
  methods: {
    // 加载订单列表
    async loadOrders() {
      if (this.loading) return;
      
      try {
        this.loading = true;
        uni.showLoading({
          title: '加载中...'
        });
        
        // 构建查询参数
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          orderType: 2 // 2-跑腿单
        };
        
        // 根据当前tab添加状态筛选
        if (this.currentTab === 1) {
          params.orderStatus = 1; // 待接单
        } else if (this.currentTab === 2) {
          params.orderStatus = 2; // 配送中
        } else if (this.currentTab === 3) {
          params.orderStatus = 3; // 已完成
        }
        
        const res = await getErrandOrderList(params);
        
        uni.hideLoading();
        this.loading = false;
        
        if (res.code === 200) {
          // 格式化订单数据
          this.orders = this.formatOrders(res.rows || []);
          this.total = res.total || 0;
        } else {
          // 如果后端返回失败，使用模拟数据
          this.orders = this.mockOrders;
        }
      } catch (error) {
        uni.hideLoading();
        this.loading = false;
        // 使用模拟数据
        this.orders = this.mockOrders;
      }
    },
    
    // 格式化订单数据
    formatOrders(orders) {
      return orders.map(order => {
        // 格式化状态文本
        const statusMap = {
          0: '待支付',
          1: '未接单',
          2: '进行中',
          3: '已完成',
          4: '已取消'
        };
        
        // 根据状态生成操作按钮
        let actions = [];
        let actionTypes = [];
        
        if (order.orderStatus === 0) {
          // 待支付
          actions = ['去支付', '取消订单'];
          actionTypes = ['primary', 'default'];
        } else if (order.orderStatus === 1) {
          // 未接单
          actions = ['修改订单', '取消订单'];
          actionTypes = ['default', 'default'];
        } else if (order.orderStatus === 2) {
          // 进行中
          actions = ['联系跑腿员', '确认收货'];
          actionTypes = ['primary', 'primary'];
        } else if (order.orderStatus === 3) {
          // 已完成
          actions = ['评价跑腿员', '查看详情', '再来一单'];
          actionTypes = ['primary', 'default', 'default'];
        } else if (order.orderStatus === 4) {
          // 已取消
          actions = ['查看详情', '再来一单'];
          actionTypes = ['default', 'default'];
        }
        
        return {
          id: order.orderMainId,
          orderNo: order.orderNo,
          title: order.orderErrandDetail?.goodsDesc || order.goodsName || '跑腿订单',
          time: this.formatTime(order.createTime),
          status: statusMap[order.orderStatus] || '未知',
          startLocation: order.deliverAddress || '配送地址',
          fee: order.totalAmount || 0,
          price: order.totalAmount || 0,
          totalPrice: order.totalAmount || 0,
          actions: actions,
          actionTypes: actionTypes,
          category: 'errand',
          unpaid: order.orderStatus === 0,
          rawData: order // 保存原始数据
        };
      });
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '';
      
      const date = new Date(timeStr);
      const now = new Date();
      const diff = now - date;
      
      // 今天
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return '今天 ' + timeStr.substring(11, 16);
      }
      // 昨天
      else if (diff < 48 * 60 * 60 * 1000) {
        return '昨天 ' + timeStr.substring(11, 16);
      }
      // 其他
      else {
        return timeStr.substring(5, 16).replace('-', '月').replace(' ', '日 ');
      }
    },
    changeTab(index) {
      this.currentTab = index;
      this.pageNum = 1; // 重置页码
      this.loadOrders(); // 重新加载订单
    },
    
    // 获取筛选后的订单列表
    getFilteredOrders() {
      if (this.currentTab === 0) {
        return this.orders;
      } else if (this.currentTab === 1) {
        return this.orders.filter(order => order.status === '未接单');
      } else if (this.currentTab === 2) {
        return this.orders.filter(order => order.status === '进行中');
      } else if (this.currentTab === 3) {
        return this.orders.filter(order => order.status === '已完成');
      }
      return this.orders;
    },
    statusClass(status) {
      switch (status) {
        case '未接单':
          return 'status-waiting';
        case '进行中':
          return 'status-progress';
        case '已完成':
          return 'status-completed';
        case '已取消':
          return 'status-canceled';
        default:
          return '';
      }
    },
    handleOrderAction(order, action) {
      switch (action) {
        case '取消订单':
          this.cancelOrder(order.id);
          break;
        case '再来一单':
          this.repeatOrder(order.id);
          break;
        case '联系骑手':
        case '联系跑腿员':
          this.contactRider(order.id);
          break;
        case '确认收货':
          this.confirmDelivery(order.id);
          break;
        case '修改订单':
          this.editOrder(order.id);
          break;
        case '查看位置':
          this.viewLocation(order.id);
          break;
        case '联系客服':
          this.contactCustomerService();
          break;
        case '查看详情':
          this.viewOrderDetail(order.id);
          break;
        case '评价跑腿员':
          this.rateDelivery(order.id);
          break;
        case '支付商品费':
          this.payProductFee(order.id);
          break;
        default:
          break;
      }
    },
    async cancelOrder(orderId) {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '取消中...' });
              const result = await cancelOrder(orderId, '用户主动取消');
              uni.hideLoading();
              
              if (result.code === 200) {
                uni.showToast({
                  title: '取消成功',
                  icon: 'success'
                });
                // 刷新订单列表
                this.loadOrders();
              } else {
                uni.showToast({
                  title: result.msg || '取消失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              uni.hideLoading();
              uni.showToast({
                title: '取消失败，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    repeatOrder(orderId) {
      // 这里可以跳转到下单页面，预填之前的信息
    },
    contactRider(orderId) {
      // 这里可以跳转到聊天页面或拨打电话
    },
    viewLocation(orderId) {
      // 跳转到配送员位置页面，并传递订单ID
      uni.navigateTo({
        url: '/pages/orders/delivery-location?orderId=' + orderId
      });
    },
    async confirmDelivery(orderId) {
      uni.showModal({
        title: '确认收货',
        content: '确认您已收到商品？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '确认中...' });
              const result = await confirmOrder(orderId);
              uni.hideLoading();
              
              if (result.code === 200) {
                uni.showToast({
                  title: '确认成功',
                  icon: 'success'
                });
                // 刷新订单列表
                this.loadOrders();
              } else {
                uni.showToast({
                  title: result.msg || '确认失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              uni.hideLoading();
              uni.showToast({
                title: '确认失败，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    editOrder(orderId) {
      // 跳转到订单编辑页面，并传递订单ID
      uni.navigateTo({
        url: '/pages/orders/errand-order-edit?orderId=' + orderId
      });
    },
    // 联系客服
    contactCustomerService() {
      // 跳转到客服服务页面
      uni.navigateTo({
        url: '/pages/mine/customer-service'
      });
    },
    // 查看订单详情
    viewOrderDetail(orderId) {
      // 跳转到订单详情页面
      uni.navigateTo({
        url: '/pages/orders/errand-order-detail?orderId=' + orderId
      });
    },
    goToOrder() {
      uni.navigateTo({
        url: '/pages/errand/errand'
      });
    },
    goBack() {
      uni.navigateBack();
    },
    // 评价跑腿员
    rateDelivery(orderId) {
      // 跳转到评价跑腿员页面，并传递订单ID
      uni.navigateTo({
        url: '/pages/orders/rate-delivery?orderId=' + orderId
      });
    },
    // 支付商品费
    payProductFee(orderId) {
      // 跳转到支付商品费页面，并传递订单ID
      uni.navigateTo({
        url: '/pages/orders/pay-product-fee?orderId=' + orderId
      });
    }
  }
};
</script>

<style scoped>
.errand-orders-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
  padding-top: 120rpx; /* 顶部内边距，避免与顶部固定元素重叠 */
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
  margin: 0;
  border: none;
  box-shadow: none;
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

/* 订单列表样式 */
.status-tabs {
  display: flex;
  background-color: white;
  padding: 0 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin: 0;
  padding-top: 0;
  box-sizing: border-box;
  width: 100%;
  position: fixed;
  top: 88rpx; /* 略微覆盖导航栏，确保没有间隙 */
  left: 0;
  right: 0;
  z-index: 9;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 5rpx;
  font-size: 30rpx;
  color: #666;
  position: relative;
  box-sizing: border-box;
}

.tab-item.active {
  color: #5DCDFF;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 6rpx;
  background-color: #5DCDFF;
  border-radius: 3rpx;
}

.order-list {
    padding: 0 10px;
    background-color: #f5f5f5;
    padding-bottom: 80px; /* 为底部导航栏留出空间 */
  }

.order-item {
  background-color: #fff;
  border-radius: 12px;
  padding: 15px;
  margin-top: 0;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 订单信息区域（可点击） */
.order-info-area {
  cursor: pointer;
  transition: background-color 0.2s;
}

.order-info-area:active {
  background-color: #f5f5f5;
  border-radius: 8px;
}

/* 订单标题和状态 */
.order-main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 订单状态样式 */
  .order-status {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-waiting {
    background-color: #e6f7ff;
    color: #1890ff;
  }

  .status-progress {
    background-color: #fff7e6;
    color: #fa8c16;
  }

  .status-completed {
    background-color: #f6ffed;
    color: #52c41a;
  }

  .status-canceled {
    color: #FF4444;
  }

/* 配送地点 */
.delivery-location {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.location-icon {
  margin-right: 6px;
  font-size: 14px;
}

.location-text {
  font-size: 14px;
  color: #666;
  flex: 1;
}

/* 价格和时间 */
.price-time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
}

.order-time {
  font-size: 12px;
  color: #999;
}

/* 订单状态容器 */
.status-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 未付费标签 */
.unpaid-tag {
  background-color: #ff4d4f;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
}

/* 操作按钮 */
.order-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.action-button {
  flex: 1;
  min-width: 60px;
  max-width: calc(50% - 6px);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  line-height: 1.3;
  border: none;
  background-color: #f5f5f5;
  color: #666;
  text-align: center;
  white-space: nowrap;
  box-sizing: border-box;
}

.action-button.primary {
  background-color: #5DCDFF;
  color: white;
}

/* 超市代购商品列表 */
.product-list {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.product-list-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.product-name {
  font-size: 13px;
  color: #333;
}

.product-price {
  font-size: 13px;
  color: #666;
}

.product-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
}

.product-total-text {
  font-size: 13px;
  color: #666;
}

.product-total-price {
  font-size: 13px;
  color: #ff4d4f;
  font-weight: 500;
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

.go-order {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0 60rpx;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
}
</style>