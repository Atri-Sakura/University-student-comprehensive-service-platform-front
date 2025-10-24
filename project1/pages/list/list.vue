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
      <!-- 待处理订单 -->
      <view v-if="currentTab === 0">
        <view class="order-item" v-for="(item, index) in pendingOrders" :key="index">
          <view class="order-header">
            <text class="order-no">订单号：{{ item.orderNo }}</text>
            <text class="order-status" :style="{ color: getStatusColor(item.status) }">
              {{ item.status }}
            </text>
          </view>
          
          <view class="order-content">
            <view class="order-info">
              <text class="customer-name">👤 {{ item.customerName }} · {{ item.phone }}</text>
              <text class="order-time">下单时间：{{ item.orderTime }}</text>
              
              <!-- 商品列表 -->
              <view class="order-items">
                <view class="item-row" v-for="(product, idx) in item.items" :key="idx">
                  <text class="item-name">{{ product.name }}</text>
                  <text class="item-details">
                    {{ product.options ? product.options + ' · ' : '' }}
                    {{ product.quantity }}份
                  </text>
                  <text class="item-price">¥{{ product.price }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="order-footer">
            <text class="order-amount">¥{{ item.amount }}</text>
            <view class="order-actions">
              <!-- 待接单状态 -->
              <template v-if="item.status === '待接单'">
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
              
              <!-- 待出品状态 -->
              <template v-else-if="item.status === '待出品'">
                <view class="action-btn detail" @click.stop="viewOrderDetail(item)">
                  <text class="btn-text">详情</text>
                </view>
                <view class="action-btn contact" @click.stop="contactCustomer(item)">
                  <text class="btn-text">联系客户</text>
                </view>
                <view class="action-btn complete" @click.stop="markProduceComplete(item)">
                  <text class="btn-text">出品完成</text>
                </view>
              </template>
              
              <!-- 待配送状态 -->
              <template v-else-if="item.status === '待配送'">
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
            </view>
          </view>
        </view>
      </view>
      
      <!-- 配送中订单 -->
      <view v-else-if="currentTab === 1">
        <view class="order-item" v-for="(item, index) in deliveringOrders" :key="index">
          <view class="order-header">
            <text class="order-no">订单号：{{ item.orderNo }}</text>
            <text class="order-status" style="color: #2196f3;">{{ item.status }}</text>
          </view>
          
          <view class="order-content">
            <view class="order-info">
              <text class="customer-name">👤 {{ item.customerName }} · {{ item.phone }}</text>
              <text class="order-time">骑手接单时间：{{ item.riderAcceptTime }}</text>
              <text class="rider-info">骑手：{{ item.riderName }} {{ item.riderPhone }}</text>
              
              <view class="order-items">
                <view class="item-row" v-for="(product, idx) in item.items" :key="idx">
                  <text class="item-name">{{ product.name }}</text>
                  <text class="item-details">
                    {{ product.options ? product.options + ' · ' : '' }}
                    {{ product.quantity }}份
                  </text>
                  <text class="item-price">¥{{ product.price }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="order-footer">
            <text class="order-amount">¥{{ item.amount }}</text>
            <view class="order-actions">
              <view class="action-btn contact" @click.stop="contactCustomer(item)">
                <text class="btn-text">联系客户</text>
              </view>
              <view class="action-btn contact-rider" @click.stop="contactRider(item)">
                <text class="btn-text">联系骑手</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 已完成订单 -->
      <view v-else-if="currentTab === 2">
        <view class="order-item" v-for="(item, index) in completedOrders" :key="index">
          <view class="order-header">
            <text class="order-no">订单号：{{ item.orderNo }}</text>
            <text class="order-status" style="color: #52c41a;">{{ item.status }}</text>
          </view>
          
          <view class="order-content">
            <view class="order-info">
              <text class="customer-name">👤 {{ item.customerName }} · {{ item.phone }}</text>
              <text class="order-time">完成时间：{{ item.completeTime }}</text>
              
              <view class="order-items">
                <view class="item-row" v-for="(product, idx) in item.items" :key="idx">
                  <text class="item-name">{{ product.name }}</text>
                  <text class="item-details">
                    {{ product.options ? product.options + ' · ' : '' }}
                    {{ product.quantity }}份
                  </text>
                  <text class="item-price">¥{{ product.price }}</text>
                </view>
              </view>
              
              <!-- 评价信息 -->
              <view class="review-section" v-if="item.review">
                <text class="review-title">顾客评价：</text>
                <view class="review-content">
                  <text class="review-rating">⭐ {{ item.review.rating }}/5</text>
                  <text class="review-text">{{ item.review.content }}</text>
                </view>
              </view>
            </view>
          </view>
          
          <view class="order-footer">
            <text class="order-amount">¥{{ item.amount }}</text>
            <view class="order-actions">
              <view class="action-btn detail" @click.stop="viewOrderDetail(item)">
                <text class="btn-text">订单详情</text>
              </view>
              <view class="action-btn review" @click.stop="viewReview(item)">
                <text class="btn-text">查看评价</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <view v-if="currentOrders.length === 0" class="empty">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单</text>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <view class="tabbar">
      <view class="tabbar-item">
        <text class="tabbar-icon">🏠</text>
        <text class="tabbar-text">首页</text>
      </view>
      <view class="tabbar-item active">
        <text class="tabbar-icon">📋</text>
        <text class="tabbar-text">订单</text>
      </view>
      <view class="tabbar-item">
        <text class="tabbar-icon">💬</text>
        <text class="tabbar-text">消息</text>
      </view>
      <view class="tabbar-item">
        <text class="tabbar-icon">👤</text>
        <text class="tabbar-text">我的</text>
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
        { name: '待处理', count: 3 },
        { name: '配送中', count: 2 },
        { name: '已完成', count: 1 }
      ],
      allOrders: [
        {
          id: '1',
          orderNo: '20241022001',
          customerName: '张先生',
          phone: '13800138001',
          status: '待接单',
          orderTime: '2024-10-22 10:30',
          amount: '128.00',
          items: [
            { name: '麻辣香锅', price: '48.00', quantity: 1, options: '微辣' },
            { name: '米饭', price: '3.00', quantity: 2 },
            { name: '可乐', price: '8.00', quantity: 1 }
          ]
        },
        {
          id: '2',
          orderNo: '20241022002',
          customerName: '李女士',
          phone: '13900139002',
          status: '待出品',
          orderTime: '2024-10-22 10:45',
          amount: '85.50',
          items: [
            { name: '宫保鸡丁', price: '32.50', quantity: 1 },
            { name: '糖醋排骨', price: '45.00', quantity: 1 },
            { name: '米饭', price: '3.00', quantity: 2 }
          ]
        },
        {
          id: '3',
          orderNo: '20241022003',
          customerName: '王先生',
          phone: '13700137003',
          status: '待配送',
          orderTime: '2024-10-22 11:00',
          amount: '256.80',
          items: [
            { name: '烤鱼套餐', price: '168.00', quantity: 1, options: '香辣' },
            { name: '羊肉串', price: '68.80', quantity: 1 },
            { name: '啤酒', price: '12.00', quantity: 2 }
          ]
        },
        {
          id: '4',
          orderNo: '20241022004',
          customerName: '赵女士',
          phone: '13500135004',
          status: '配送中',
          orderTime: '2024-10-22 09:30',
          riderAcceptTime: '2024-10-22 09:45',
          riderName: '刘骑手',
          riderPhone: '13600136004',
          amount: '198.00',
          items: [
            { name: '寿司拼盘', price: '128.00', quantity: 1 },
            { name: '味噌汤', price: '28.00', quantity: 2 },
            { name: '沙拉', price: '42.00', quantity: 1 }
          ]
        },
        {
          id: '5',
          orderNo: '20241022005',
          customerName: '刘先生',
          phone: '13600136005',
          status: '配送中',
          orderTime: '2024-10-22 09:15',
          riderAcceptTime: '2024-10-22 09:25',
          riderName: '张骑手',
          riderPhone: '13700137005',
          amount: '156.00',
          items: [
            { name: '汉堡套餐', price: '45.00', quantity: 2 },
            { name: '薯条', price: '22.00', quantity: 2 },
            { name: '可乐', price: '8.00', quantity: 2 }
          ]
        },
        {
          id: '6',
          orderNo: '20241022006',
          customerName: '陈女士',
          phone: '13400134006',
          status: '已完成',
          orderTime: '2024-10-22 08:30',
          completeTime: '2024-10-22 09:20',
          amount: '89.00',
          review: {
            rating: 5,
            content: '味道很好，配送很快！'
          },
          items: [
            { name: '早餐套餐', price: '25.00', quantity: 2 },
            { name: '豆浆', price: '8.00', quantity: 1 },
            { name: '油条', price: '6.00', quantity: 2 }
          ]
        }
      ]
    }
  },
  computed: {
    pendingOrders() {
      return this.allOrders.filter(order => 
        order.status === '待接单' || 
        order.status === '待出品' || 
        order.status === '待配送'
      )
    },
    deliveringOrders() {
      return this.allOrders.filter(order => order.status === '配送中')
    },
    completedOrders() {
      return this.allOrders.filter(order => order.status === '已完成')
    },
    currentOrders() {
      switch (this.currentTab) {
        case 0: return this.pendingOrders
        case 1: return this.deliveringOrders
        case 2: return this.completedOrders
        default: return []
      }
    }
  },
  methods: {
    switchTab(index) {
      this.currentTab = index
    },
    
    getStatusColor(status) {
      const colors = {
        '待接单': '#ff9800',
        '待出品': '#ff6b00',
        '待配送': '#ff5722',
        '配送中': '#2196f3',
        '已完成': '#52c41a'
      }
      return colors[status] || '#666'
    },
    
    // 接单操作
    acceptOrder(item) {
      uni.showModal({
        title: '接单确认',
        content: '确定要接受该订单吗？',
        success: (res) => {
          if (res.confirm) {
            // 更新订单状态为待出品
            item.status = '待出品'
            this.updateOrderCount()
            uni.showToast({
              title: '接单成功',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 出品完成
    markProduceComplete(item) {
      uni.showModal({
        title: '出品完成确认',
        content: '确定该订单已出品完成吗？',
        success: (res) => {
          if (res.confirm) {
            // 更新订单状态为待配送
            item.status = '待配送'
            this.updateOrderCount()
            uni.showToast({
              title: '出品完成',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 通知骑手
    notifyRider(item) {
      uni.showModal({
        title: '通知骑手',
        content: '确定要通知骑手取餐吗？',
        success: (res) => {
          if (res.confirm) {
            // 模拟骑手接单
            setTimeout(() => {
              item.status = '配送中'
              item.riderAcceptTime = new Date().toLocaleString('zh-CN')
              item.riderName = '李骑手'
              item.riderPhone = '13800138000'
              this.updateOrderCount()
              uni.showToast({
                title: '骑手已接单',
                icon: 'success'
              })
            }, 1000)
          }
        }
      })
    },
    
    // 更新标签计数
    updateOrderCount() {
      this.tabs[0].count = this.pendingOrders.length
      this.tabs[1].count = this.deliveringOrders.length
      this.tabs[2].count = this.completedOrders.length
    },
    
    // 联系客户
    contactCustomer(item) {
      uni.showActionSheet({
        itemList: ['电话联系', '消息联系'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 电话联系
            uni.makePhoneCall({
              phoneNumber: item.phone
            })
          } else if (res.tapIndex === 1) {
            // 消息联系，跳转到消息中心（tabbar页面）
            // 保存参数到全局，因为switchTab不能传递参数
            getApp().globalData.contactParams = {
              contactType: 'customer',
              name: item.customerName,
              id: item.id
            }
            uni.switchTab({
              url: '/pages/message/message'
            })
          }
        }
      })
    },
    
    // 联系骑手
    contactRider(item) {
      if (item.riderPhone) {
        uni.showActionSheet({
          itemList: ['电话联系', '消息联系'],
          success: (res) => {
            if (res.tapIndex === 0) {
              // 电话联系
              uni.makePhoneCall({
                phoneNumber: item.riderPhone
              })
            } else if (res.tapIndex === 1) {
              // 消息联系，跳转到消息中心（tabbar页面）
              // 保存参数到全局，因为switchTab不能传递参数
              getApp().globalData.contactParams = {
                contactType: 'rider',
                name: item.riderName,
                id: item.id
              }
              uni.switchTab({
                url: '/pages/message/message'
              })
            }
          }
        })
      }
    },
    
    // 查看订单详情
    viewOrderDetail(item) {
      uni.navigateTo({
        url: `/pages/orders/detail?id=${item.id}`
      })
    },
    
    // 查看评价
    viewReview(item) {
      if (item.review) {
        uni.showModal({
          title: '顾客评价',
          content: `评分：${item.review.rating}星\n评价：${item.review.content}`,
          showCancel: false
        })
      }
    },
    
    // 拒单
    rejectOrder(item) {
      uni.showModal({
        title: '拒单确认',
        content: '确定要拒绝该订单吗？',
        success: (res) => {
          if (res.confirm) {
            // 从订单列表中移除
            this.allOrders = this.allOrders.filter(order => order.id !== item.id)
            this.updateOrderCount()
            uni.showToast({
              title: '拒单成功',
              icon: 'success'
            })
          }
        }
      })
    }
  },
  
  onLoad() {
    this.updateOrderCount()
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.header {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  padding: 80rpx 30rpx 30rpx;
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
  font-weight: 500;
}

.order-time {
  font-size: 24rpx;
  color: #666;
}

.rider-info {
  font-size: 24rpx;
  color: #4a90e2;
}

/* 商品列表 */
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

/* 评价区域 */
.review-section {
  margin-top: 16rpx;
  padding: 16rpx;
  background-color: #f0f8ff;
  border-radius: 8rpx;
}

.review-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.review-rating {
  font-size: 24rpx;
  color: #ff9800;
}

.review-text {
  font-size: 26rpx;
  color: #333;
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

/* 按钮样式 */
.action-btn {
  padding: 10rpx 30rpx;
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

.action-btn.detail {
  background: linear-gradient(135deg, #d9d9d9, #bfbfbf);
}

.action-btn.contact {
  background: linear-gradient(135deg, #4a90e2, #357abd);
}

.action-btn.reject {
  background: linear-gradient(135deg, #ff6b6b, #ff5252);
}

.action-btn.accept {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.action-btn.complete {
  background: linear-gradient(135deg, #52c41a, #389e0d);
}

.action-btn.notify {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.action-btn.contact-rider {
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
}

.action-btn.review {
  background: linear-gradient(135deg, #ff9800, #f57c00);
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

/* 底部导航栏 */
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  padding: 20rpx 0;
  border-top: 1rpx solid #f0f0f0;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tabbar-item.active .tabbar-icon {
  color: #4a90e2;
}

.tabbar-item.active .tabbar-text {
  color: #4a90e2;
}

.tabbar-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
  color: #999;
}

.tabbar-text {
  font-size: 22rpx;
  color: #999;
}
</style>
