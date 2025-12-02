<template>
  <view class="orders-container">
    <!-- 订单概览卡片 -->
    <view class="overview-card">
      <view class="overview-title">订单概览</view>
      <view class="overview-stats">
          <view class="stat-item" data-type="total">
            <view class="stat-number">{{ orderStats.total }}</view>
            <view class="stat-label">全部订单</view>
          </view>
          <view class="stat-item" data-type="pending">
            <view class="stat-number pending-number">{{ orderStats.pending }}</view>
            <view class="stat-label">待处理</view>
          </view>
          <view class="stat-item" data-type="completed">
            <view class="stat-number">{{ orderStats.completed }}</view>
            <view class="stat-label">已完成</view>
          </view>
        </view>
    </view>

    <!-- 订单类型列表 -->
    <view class="order-types">
      <view class="type-item" @click="navigateToOrderType('food')">
        <view class="type-icon food-icon">
          <text class="icon">🍽️</text>
        </view>
        <view class="type-name">外卖订单</view>
        <view class="type-arrow">></view>
      </view>
      
      <view class="type-item" @click="navigateToOrderType('runner')">
        <view class="type-icon runner-icon">
          <text class="icon">🏃</text>
        </view>
        <view class="type-name">跑腿订单</view>
        <view class="type-arrow">></view>
      </view>
      
      <view class="type-item" @click="navigateToOrderType('secondhand')">
        <view class="type-icon secondhand-icon">
          <text class="icon">👜</text>
        </view>
        <view class="type-name">二手交易订单</view>
        <view class="type-arrow">></view>
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
      // 订单统计数据
      orderStats: {
        total: 0,
        pending: 0,
        completed: 0
      },
      // 订单列表数据
      orders: []
    };
  },
  mounted() {
    // 组件挂载后获取订单统计数据
    this.getOrderStats();
    // 获取所有订单列表
    this.getOrderList();
  },
  onPullDownRefresh() {
    // 下拉刷新时重新获取数据
    this.getOrderStats();
    this.getOrderList();
    // 停止下拉刷新动画
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 1000);
  },
  // 页面配置
  onReachBottomDistance: 50,
  enablePullDownRefresh: true,
  
  methods: {
    // 获取订单统计数据
    async getOrderStats() {
      try {
        // 显示加载提示
        uni.showLoading({ title: '加载中...' });
        
        // 尝试调用订单统计API，如果没有专门的统计API，则从订单列表中计算
        try {
          const statsRes = await api.order.getOrderStats();
          if (statsRes && statsRes.code === 200 && statsRes.data) {
            this.orderStats = {
              total: statsRes.data.total || 0,
              pending: statsRes.data.pending || 0,
              completed: statsRes.data.completed || 0
            };
          }
        } catch (e) {
          // 如果统计API调用失败，不影响后续操作
          console.warn('订单统计API调用失败，将从订单列表计算');
        }
      } catch (error) {
        console.error('获取订单统计失败:', error);
      } finally {
        // 隐藏加载提示
        uni.hideLoading();
      }
    },
    
    // 获取所有订单列表
    async getOrderList() {
      try {
        console.log('开始调用订单列表API');
        
        // 调用后端API获取所有订单列表
        const res = await api.order.getOrderList();
        
        console.log('订单列表API响应:', res);
        
        if (res && res.code === 200) {
          // 获取订单数据数组
          const orderList = res.rows || res.data || [];
          this.orders = orderList;
          
          // 如果之前没有获取到统计数据，则从订单列表中计算
          if (this.orderStats.total === 0 && orderList.length > 0) {
            this.calculateOrderStats(orderList);
          }
        } else {
          console.warn('API返回状态异常:', res);
          uni.showToast({ 
            title: res?.msg || res?.message || '获取订单失败', 
            icon: 'none' 
          });
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
        uni.showToast({ 
          title: '网络错误，请稍后重试', 
          icon: 'none' 
        });
      }
    },
    
    // 从订单列表计算统计数据
    calculateOrderStats(orderList) {
      const total = orderList.length;
      // 计算待处理订单（状态：1-待接单，2-待取货，3-配送中）
      const pending = orderList.filter(item => {
        const status = Number(item.orderStatus);
        return [1, 2, 3].includes(status);
      }).length;
      // 计算已完成订单（状态：4-已完成，5-已取消）
      const completed = orderList.filter(item => {
        const status = Number(item.orderStatus);
        return [4, 5].includes(status);
      }).length;
      
      this.orderStats = { total, pending, completed };
    },
    
    navigateToOrderType(type) {
      // 根据订单类型导航到不同的子页面
      console.log('跳转到', type, '订单页面');
      // 跳转到对应的子页面
      switch (type) {
        case 'food':
          uni.navigateTo({ url: '/pages/orders/food-orders' });
          break;
        case 'runner':
          uni.navigateTo({ url: '/pages/orders/errand-orders' });
          break;
        case 'secondhand':
          uni.navigateTo({ url: '/pages/orders/second-hand-orders' });
          break;
        default:
          break;
      }
    }
  }
};
</script>

<style scoped>
.orders-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-bottom: 100rpx; /* 为底部导航栏留出空间 */
}

/* 订单概览卡片样式 */
.overview-card {
  background-color: white;
  margin: 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.overview-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.overview-stats {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  flex: 1;
  text-align: center;
  cursor: pointer;
}

.stat-item:active {
  opacity: 0.8;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

/* 待处理订单数量显示为红色 */
.pending-number {
  color: #FF4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.stat-label {
  font-size: 28rpx;
  color: #666;
}

/* 订单类型列表样式 */
.order-types {
  background-color: white;
  margin: 0 30rpx 30rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.type-item {
  display: flex;
  align-items: center;
  padding: 35rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.type-item:last-child {
  border-bottom: none;
}

.type-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 15rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.food-icon {
  background-color: #FFF8F0;
}

.runner-icon {
  background-color: #F0FFF0;
}

.secondhand-icon {
  background-color: #F0F8FF;
}

.icon {
  font-size: 40rpx;
}

.type-name {
  flex: 1;
  font-size: 32rpx;
  color: #333;
}

.type-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}
</style>