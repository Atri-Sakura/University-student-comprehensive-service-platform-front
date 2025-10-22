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
          <text class="order-status" :style="{ color: item.statusColor }">{{ item.subStatus || item.status }}</text>
        </view>
        <view class="order-content">
          <view class="order-info">
            <text class="customer-name">👤 {{ item.customerName }} · {{ item.phone || '' }}</text>
            
            <!-- 显示商品列表 -->
            <view class="order-items" v-if="item.items && item.items.length > 0">
              <view class="item-row" v-for="(product, idx) in item.items" :key="idx">
                <text class="item-name">{{ product.name }}</text>
                <text class="item-details">
                  {{ product.options ? product.options + ' · ' : '' }}
                  {{ product.quantity }}份
                </text>
                <text class="item-price">¥{{ product.price }}</text>
              </view>
              <view v-if="item.items.length > 3" class="more-items">
                <text>...等{{ item.items.length }}件商品</text>
              </view>
            </view>
          </view>
        </view>
        <view class="order-footer">
          <text class="order-amount">¥{{ item.amount }}</text>
          <view class="order-actions">
            <!-- 待接单状态按钮 -->
            <template v-if="item.status === '待处理' && item.subStatus === '待接单'">
              <view class="action-btn contact" @click.stop="contactCustomer(item)">
                <text class="btn-text">联系客户</text>
              </view>
              <view class="action-btn reject" @click.stop="rejectOrder(item)">
                <text class="btn-text">拒单</text>
              </view>
              <view class="action-btn accept" @click.stop="acceptOrder(item)">
                <text class="btn-text">接单</text>
              </view>
            </template>
            
            <!-- 待出品状态按钮 -->
            <template v-else-if="item.status === '待处理' && item.subStatus === '待出品'">
              <view class="action-btn detail" @click.stop="viewOrderDetail(item)">
                <text class="btn-text">详情</text>
              </view>
              <view class="action-btn contact" @click.stop="contactCustomer(item)">
                <text class="btn-text">联系客户</text>
              </view>
              <view class="action-btn complete" @click.stop="markComplete(item)">
                <text class="btn-text">出品完成</text>
              </view>
            </template>
            
            <!-- 待配送状态按钮 -->
            <template v-else-if="item.status === '待处理' && item.subStatus === '待配送'">
              <view class="action-btn detail" @click.stop="viewOrderDetail(item)">
                <text class="btn-text">详情</text>
              </view>
              <view class="action-btn contact" @click.stop="contactCustomer(item)">
                <text class="btn-text">联系客户</text>
              </view>
              <view class="action-btn notify" @click.stop="notifyRider(item)">
                <text class="btn-text">通知骑手</text>
              </view>
            </template>
            
            <!-- 其他状态（配送中、已完成等） -->
            <template v-else-if="item.status === '配送中'">
              <view class="action-btn contact" @click.stop="contactCustomer(item)">
                <text class="btn-text">联系客户</text>
              </view>
              <view class="action-btn" @click.stop="handleOrder(item)">
                <text class="btn-text">{{ item.actionText }}</text>
              </view>
            </template>
            
            <!-- 其他剩余状态 -->
            <template v-else>
              <view class="action-btn" @click.stop="handleOrder(item)">
                <text class="btn-text">{{ item.actionText }}</text>
              </view>
            </template>
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
          phone: '138****5678',
          status: '待处理',
          subStatus: '待接单',
          statusColor: '#ff9800',
          time: '10:30',
          address: '科技园A座1201',
          amount: '128.00',
          items: [
            { name: '麻辣香锅', price: '48.00', quantity: 1, options: '微辣' },
            { name: '米饭', price: '3.00', quantity: 2 },
            { name: '可乐', price: '8.00', quantity: 1 }
          ]
        },
        {
          orderNo: '20241022002',
          customerName: '李女士',
          phone: '139****1234',
          status: '待处理',
          subStatus: '待出品',
          statusColor: '#ff6b00',
          time: '10:45',
          address: '万科广场B栋502',
          amount: '85.50',
          items: [
            { name: '宫保鸡丁', price: '32.50', quantity: 1 },
            { name: '糖醋排骨', price: '45.00', quantity: 1 },
            { name: '米饭', price: '3.00', quantity: 2 }
          ]
        },
        {
          orderNo: '20241022003',
          customerName: '王先生',
          phone: '137****8765',
          status: '待处理',
          subStatus: '待配送',
          statusColor: '#ff5722',
          time: '11:00',
          address: '阳光小区3号楼801',
          amount: '256.80',
          items: [
            { name: '烤鱼套餐', price: '168.00', quantity: 1, options: '香辣' },
            { name: '羊肉串', price: '68.80', quantity: 1 },
            { name: '啤酒', price: '12.00', quantity: 2 }
          ]
        },
        {
          orderNo: '20241022004',
          customerName: '赵女士',
          phone: '135****2233',
          status: '配送中',
          statusColor: '#2196f3',
          time: '09:30',
          address: 'CBD中心2栋1508',
          amount: '198.00',
          actionText: '查看',
          items: [
            { name: '寿司拼盘', price: '128.00', quantity: 1 },
            { name: '味噌汤', price: '28.00', quantity: 2 },
            { name: '沙拉', price: '42.00', quantity: 1 }
          ]
        },
        {
          orderNo: '20241022005',
          customerName: '刘先生',
          phone: '136****4567',
          status: '配送中',
          statusColor: '#2196f3',
          time: '09:15',
          address: '锦绣花园12栋302',
          amount: '156.00',
          actionText: '查看',
          items: [
            { name: '汉堡套餐', price: '45.00', quantity: 2 },
            { name: '薯条', price: '22.00', quantity: 2 },
            { name: '可乐', price: '8.00', quantity: 2 }
          ]
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
    // 联系客户
    contactCustomer(item) {
      uni.showModal({
        title: '联系客户',
        content: '是否拨打 ' + item.customerName + ' 的电话？',
        confirmText: '拨打',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.makePhoneCall({
              phoneNumber: item.phone.replace(/\*\*/g, '00'),
              success: () => {
                console.log('拨打电话成功');
              },
              fail: () => {
                console.log('拨打电话失败');
              }
            });
          }
        }
      });
    },
    
    // 拒单
    rejectOrder(item) {
      uni.showModal({
        title: '拒单确认',
        content: '确定要拒绝该订单吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '拒单成功',
              icon: 'success'
            });
            // 实际项目中这里应该调用API更新订单状态
          }
        }
      });
    },
    
    // 接单
    acceptOrder(item) {
      uni.showModal({
        title: '接单确认',
        content: '确定要接受该订单吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '接单成功',
              icon: 'success'
            });
            // 实际项目中这里应该调用API更新订单状态
          }
        }
      });
    },
    
    // 查看详情
    viewOrderDetail(item) {
      uni.showToast({
        title: '查看订单详情',
        icon: 'none'
      });
      // 实际项目中这里应该跳转到详情页面
    },
    
    // 标记出品完成
    markComplete(item) {
      uni.showModal({
        title: '确认完成',
        content: '确定要标记该订单出品完成吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '出品完成',
              icon: 'success'
            });
            // 实际项目中这里应该调用API更新订单状态
          }
        }
      });
    },
    
    // 通知骑手
    notifyRider(item) {
      uni.showModal({
        title: '通知骑手',
        content: '确定要通知骑手取餐吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已通知骑手',
              icon: 'success'
            });
            // 实际项目中这里应该调用API通知骑手
          }
        }
      });
    },
    
    // 原有处理逻辑保留
    handleOrder(item) {
      // 这里可以保留原有的处理逻辑
      if (item.actionText) {
        uni.showToast({
          title: item.actionText,
          icon: 'none'
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

.customer-name {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12rpx;
}

/* 订单商品样式 */
.order-items {
  margin-top: 12rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  padding: 20rpx;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  font-size: 26rpx;
}

.item-row:last-child {
  margin-bottom: 0;
}

.item-name {
  flex: 1;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-details {
  margin: 0 16rpx;
  color: #666;
  font-size: 24rpx;
}

.item-price {
  color: #ff6b6b;
  font-weight: 500;
}

.more-items {
  text-align: center;
  color: #999;
  font-size: 22rpx;
  margin-top: 8rpx;
  padding-top: 8rpx;
  border-top: 1rpx solid #eee;
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
  gap: 16rpx;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* 不同按钮样式 */
.action-btn.contact {
  background-color: #4a90e2;
  background: linear-gradient(135deg, #4a90e2, #357abd);
}

.action-btn.reject {
  background-color: #ff6b6b;
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
}

.action-btn.accept {
  background-color: #52c41a;
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.action-btn.detail {
  background-color: #d9d9d9;
  background: linear-gradient(135deg, #d9d9d9, #bfbfbf);
}

.action-btn.detail .btn-text {
  color: #666;
}

.action-btn.complete {
  background-color: #52c41a;
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.action-btn.notify {
  background-color: #52c41a;
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.action-btn {
  padding: 10rpx 30rpx;
  background: linear-gradient(135deg, #4a90e2, #357abd);
  border-radius: 30rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.btn-text {
  font-size: 24rpx;
  color: white;
  font-weight: 500;
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

