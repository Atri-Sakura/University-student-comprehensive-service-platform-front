<template>
  <view class="container">
    <view class="header">
      <text class="title">订单管理</text>
    </view>
    
    <!-- 订单状态筛选 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === index }" 
        v-for="(tab, index) in tabs" 
        :key="index"
        @click="switchTab(index)"
      >
        <text class="tab-text">{{ tab.name }}</text>
        <view v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</view>
      </view>
    </view>
    
    <view class="content">
      <view class="order-item" v-for="(item, index) in orderList" :key="index" @click="viewOrder(item)">
        <view class="order-header">
          <text class="order-no">订单号：{{ item.orderNo }}</text>
          <text class="order-status" :style="{ color: item.statusColor }">{{ item.status }}</text>
        </view>
        <view class="order-content">
          <view class="order-info">
            <text class="customer-name">👤 {{ item.customerName }}</text>
            <text class="order-time">🕐 {{ item.time }}</text>
            <text class="order-address">📍 {{ item.address }}</text>
          </view>
        </view>
        <view class="order-footer">
          <text class="order-amount">¥{{ item.amount }}</text>
          <view class="order-actions">
            <view class="action-btn" @click.stop="handleOrder(item)">
              <text class="btn-text">{{ item.actionText }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <view v-if="orderList.length === 0" class="empty">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'OrderPage',
  data() {
    return {
      currentTab: 0,
      tabs: [
        { name: '全部', count: 0 },
        { name: '待处理', count: 3 },
        { name: '配送中', count: 2 },
        { name: '已完成', count: 0 }
      ],
      allOrders: [
        {
          orderNo: '20241022001',
          customerName: '张先生',
          status: '待处理',
          statusColor: '#ff9800',
          time: '10:30',
          address: '科技园A座1201',
          amount: '128.00',
          actionText: '接单'
        },
        {
          orderNo: '20241022002',
          customerName: '李女士',
          status: '待处理',
          statusColor: '#ff9800',
          time: '10:45',
          address: '万科广场B栋502',
          amount: '85.50',
          actionText: '接单'
        },
        {
          orderNo: '20241022003',
          customerName: '王先生',
          status: '待处理',
          statusColor: '#ff9800',
          time: '11:00',
          address: '阳光小区3号楼801',
          amount: '256.80',
          actionText: '接单'
        },
        {
          orderNo: '20241022004',
          customerName: '赵女士',
          status: '配送中',
          statusColor: '#2196f3',
          time: '09:30',
          address: 'CBD中心2栋1508',
          amount: '198.00',
          actionText: '查看'
        },
        {
          orderNo: '20241022005',
          customerName: '刘先生',
          status: '配送中',
          statusColor: '#2196f3',
          time: '09:15',
          address: '锦绣花园12栋302',
          amount: '156.00',
          actionText: '查看'
        }
      ],
      orderList: []
    }
  },
  onLoad() {
    this.loadOrders();
  },
  methods: {
    switchTab(index) {
      this.currentTab = index;
      this.loadOrders();
    },
    loadOrders() {
      if (this.currentTab === 0) {
        this.orderList = this.allOrders;
      } else if (this.currentTab === 1) {
        this.orderList = this.allOrders.filter(order => order.status === '待处理');
      } else if (this.currentTab === 2) {
        this.orderList = this.allOrders.filter(order => order.status === '配送中');
      } else {
        this.orderList = [];
      }
    },
    viewOrder(item) {
      uni.showToast({
        title: '查看订单详情',
        icon: 'none'
      });
    },
    handleOrder(item) {
      if (item.status === '待处理') {
        uni.showModal({
          title: '提示',
          content: '确定接单吗？',
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: '接单成功',
                icon: 'success'
              });
            }
          }
        });
      }
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  padding: 40rpx 30rpx;
  color: white;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

/* 标签页 */
.tabs {
  background: white;
  display: flex;
  padding: 0 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  padding: 30rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tab-item.active .tab-text {
  color: #4a90e2;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #4a90e2;
  border-radius: 2rpx;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.tab-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background: #ff4d4f;
  color: white;
  font-size: 20rpx;
  padding: 2rpx 8rpx;
  border-radius: 20rpx;
  min-width: 28rpx;
  text-align: center;
}

.content {
  padding: 20rpx;
}

/* 订单卡片 */
.order-item {
  background: white;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-no {
  font-size: 26rpx;
  color: #999;
}

.order-status {
  font-size: 28rpx;
  font-weight: bold;
}

.order-content {
  margin-bottom: 20rpx;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.customer-name,
.order-time,
.order-address {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.order-amount {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.order-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  padding: 12rpx 40rpx;
  background: linear-gradient(135deg, #4a90e2, #357abd);
  border-radius: 40rpx;
}

.btn-text {
  font-size: 26rpx;
  color: white;
}

/* 空状态 */
.empty {
  padding: 150rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>

