<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <text class="title">订单管理</text>
    </view>
    
    <!-- 标签切换 -->
    <view class="tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab"
        :class="{ active: currentTab === index }"
        @click="switchTabIndex(index)"
      >
        <text>{{ tab.name }}</text>
        <text v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</text>
      </view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list">
      <view v-for="item in currentOrders" :key="item.id" class="order-card">
        <view class="order-header">
          <text class="order-no">订单号：{{ item.orderNo }}</text>
          <text :style="{ color: getStatusColor(item.status) }" class="order-status">{{ item.status }}</text>
        </view>
        
        <view class="order-info">
          <view class="customer-info">
            <text class="customer-name">👤 {{ item.customerName }}</text>
            <text class="customer-phone">{{ item.phone }}</text>
          </view>
          <text class="order-time">下单时间：{{ item.orderTime }}</text>
        </view>
        
        <view class="order-content">
          <view v-for="(product, idx) in item.items" :key="idx" class="product-item">
            <view class="product-name">{{ product.name }}</view>
            <view class="product-detail">
              <text v-if="product.options" class="product-options">{{ product.options }}</text>
              <text class="product-quantity">· {{ product.quantity }}份</text>
              <text class="product-price">¥{{ product.price }}</text>
            </view>
          </view>
        </view>
        
        <view class="order-footer">
          <view class="order-amount">
            <text>¥{{ item.amount }}</text>
          </view>
          
          <view class="order-actions">
            <!-- 待接单状态 -->
            <view v-if="item.status === '待接单'" class="action-group">
              <button class="action-btn contact customer" @click="contactCustomer(item)">联系客户</button>
              <button class="action-btn reject" @click="rejectOrder(item)">拒单</button>
              <button class="action-btn accept" @click="acceptOrder(item)">接单</button>
            </view>
            
            <!-- 待出品状态 -->
            <view v-if="item.status === '待出品'" class="action-group">
              <button class="action-btn contact customer" @click="contactCustomer(item)">联系客户</button>
              <button class="action-btn complete" @click="markProduceComplete(item)">出品完成</button>
            </view>
            
            <!-- 待配送状态 -->
            <view v-if="item.status === '待配送'" class="action-group">
              <button class="action-btn contact customer" @click="contactCustomer(item)">联系客户</button>
              <button class="action-btn notify" @click="notifyRider(item)">通知骑手</button>
            </view>
            
            <!-- 配送中状态 -->
            <view v-if="item.status === '配送中'" class="action-group">
              <button class="action-btn contact rider" @click="contactRider(item)">联系骑手</button>
              <button class="action-btn contact customer" @click="contactCustomer(item)">联系客户</button>
              <view class="rider-info" v-if="item.riderName">
                <text>骑手：{{ item.riderName }}</text>
                <text>{{ item.riderAcceptTime }}</text>
              </view>
            </view>
            
            <!-- 已完成状态 -->
            <view v-if="item.status === '已完成'" class="action-group">
              <button class="action-btn contact customer" @click="contactCustomer(item)">联系客户</button>
              <button v-if="item.review" class="action-btn review" @click="viewReview(item)">查看评价</button>
              <view class="complete-info" v-if="item.completeTime">
                <text>完成时间：{{ item.completeTime }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="currentOrders.length === 0" class="empty">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无订单</text>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <view class="custom-tab-bar">
      <view class="tab-item" @click="switchTab('index')">
        <view class="tab-icon">🏠</view>
        <view class="tab-text">首页</view>
      </view>
      <view class="tab-item active" @click="switchTab('list')">
        <view class="tab-icon">📋</view>
        <view class="tab-text">订单</view>
      </view>
      <view class="tab-item" @click="switchTab('message')">
        <view class="tab-icon">💬</view>
        <view class="tab-text">消息</view>
      </view>
      <view class="tab-item" @click="switchTab('mine')">
        <view class="tab-icon">👤</view>
        <view class="tab-text">我的</view>
      </view>
    </view>
  </view>
</template>

<script>
import { merchantOrderAPI, request } from '../../utils/api.js'

export default {
  name: 'OrderPage',
  data() {
    return {
      currentTab: 0,
      tabs: [
        { name: '待处理', count: 0 },
        { name: '配送中', count: 0 },
        { name: '已完成', count: 0 }
      ],
      allOrders: []
    }
  },
  created() {
    // 页面加载时获取订单列表
    this.getOrderList()
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
    // 页面内标签切换方法，避免与底部导航栏方法冲突
    switchTabIndex(index) {
      this.currentTab = index
    },
    
    // 获取订单列表
    async getOrderList() {
      try {
        const res = await request(merchantOrderAPI.list, {
          method: 'GET'
        })
        
        if (res.statusCode === 200 && res.data.code === 200) {
          // 假设后端返回的数据格式为 { rows: [], total: 0 }
          this.allOrders = res.data.rows || []
          this.updateOrderCount()
        } else {
          uni.showToast({
            title: res.data.msg || '获取订单失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取订单列表失败:', error)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      }
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
        success: async (res) => {
          if (res.confirm) {
            try {
              // 调用后端接单接口
              const response = await request(merchantOrderAPI.accept(item.id), {
                method: 'PUT'
              })
              
              if (response.statusCode === 200 && response.data.code === 200) {
                // 更新前端订单状态
                item.status = '待出品'
                this.updateOrderCount()
                uni.showToast({
                  title: '接单成功',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: response.data.msg || '接单失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('接单失败:', error)
              uni.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 出品完成
    markProduceComplete(item) {
      uni.showModal({
        title: '出品完成确认',
        content: '确定该订单已出品完成吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 调用后端出品完成接口
              const response = await request(merchantOrderAPI.produceComplete(item.id), {
                method: 'PUT'
              })
              
              if (response.statusCode === 200 && response.data.code === 200) {
                // 更新前端订单状态
                item.status = '待配送'
                this.updateOrderCount()
                uni.showToast({
                  title: '出品完成',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: response.data.msg || '操作失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('出品完成失败:', error)
              uni.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 通知骑手
    notifyRider(item) {
      uni.showModal({
        title: '通知骑手',
        content: '确定要通知骑手取餐吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 调用后端通知骑手接口
              const response = await request(merchantOrderAPI.notifyRider(item.id), {
                method: 'PUT'
              })
              
              if (response.statusCode === 200 && response.data.code === 200) {
                // 更新订单状态
                item.status = '配送中'
                item.riderAcceptTime = response.data.data.riderAcceptTime || new Date().toLocaleString('zh-CN')
                item.riderName = response.data.data.riderName || '骑手'
                item.riderPhone = response.data.data.riderPhone
                this.updateOrderCount()
                uni.showToast({
                  title: '骑手已接单',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: response.data.msg || '通知骑手失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('通知骑手失败:', error)
              uni.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 更新订单数量统计
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
        success: async (res) => {
          if (res.confirm) {
            try {
              // 调用后端拒单接口
              const response = await request(merchantOrderAPI.reject(item.id), {
                method: 'PUT'
              })
              
              if (response.statusCode === 200 && response.data.code === 200) {
                // 从订单列表中移除
                this.allOrders = this.allOrders.filter(order => order.id !== item.id)
                this.updateOrderCount()
                uni.showToast({
                  title: '拒单成功',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: response.data.msg || '拒单失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('拒单失败:', error)
              uni.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 底部导航栏切换
    switchTab(tab) {
      switch (tab) {
        case 'index':
          uni.switchTab({
            url: '/pages/index/index'
          });
          break;
        case 'list':
          uni.switchTab({
            url: '/pages/list/list'
          });
          break;
        case 'message':
          uni.switchTab({
            url: '/pages/message/message'
          });
          break;
        case 'mine':
          uni.switchTab({
            url: '/pages/mine/mine'
          });
          break;
      }
    }
  }
}
</script>

<style scoped>
.container {
  padding-bottom: 120rpx;
}

.header {
  background-color: #4A90E2;
  color: white;
  padding: 40rpx 0;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
}

.tabs {
  display: flex;
  background-color: white;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab {
  flex: 1;
  text-align: center;
  position: relative;
  padding: 10rpx 0;
}

.tab.active {
  color: #4A90E2;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30%;
  width: 40%;
  height: 4rpx;
  background-color: #4A90E2;
}

.tab-badge {
  position: absolute;
  top: -10rpx;
  right: 25%;
  background-color: #ff4d4f;
  color: white;
  font-size: 20rpx;
  padding: 0 10rpx;
  border-radius: 10rpx;
  min-width: 24rpx;
  height: 24rpx;
  line-height: 24rpx;
  text-align: center;
}

.order-list {
  padding: 20rpx;
  background-color: #f5f5f5;
}

.order-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.order-no {
  font-size: 28rpx;
  color: #666;
}

.order-status {
  font-size: 30rpx;
  font-weight: bold;
}

.order-info {
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.customer-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.customer-name {
  font-size: 28rpx;
  color: #333;
}

.customer-phone {
  font-size: 28rpx;
  color: #666;
}

.order-time {
  font-size: 26rpx;
  color: #999;
}

.order-content {
  margin-bottom: 20rpx;
}

.product-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.product-detail {
  text-align: right;
  font-size: 26rpx;
  color: #666;
}

.product-options {
  margin-right: 10rpx;
}

.product-quantity {
  margin-right: 10rpx;
}

.product-price {
  color: #333;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.order-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.action-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.action-btn {
  font-size: 26rpx;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
  margin-left: 0;
  line-height: 1.5;
  min-width: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.accept {
  background-color: #52c41a;
  color: white;
  border: none;
  min-width: 120rpx;
}

.action-btn.reject {
  background-color: #ff4d4f;
  color: white;
  border: none;
  min-width: 120rpx;
}

.action-btn.complete {
  background-color: #1890ff;
  color: white;
  border: none;
  min-width: 140rpx;
}

.action-btn.notify {
  background-color: #faad14;
  color: white;
  border: none;
  min-width: 140rpx;
}

.action-btn.contact {
  background-color: #1890ff;
  color: white;
  border: none;
  min-width: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
}

.action-btn.contact.customer {
  background-color: #52c41a;
}

.action-btn.contact.rider {
  background-color: #1890ff;
}

.action-btn.review {
  background-color: #faad14;
  color: white;
  border: none;
  min-width: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
}

.rider-info {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  text-align: right;
}

.complete-info {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  text-align: right;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 自定义底部导航栏 - 优化样式确保图标正确显示 */
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: white;
  display: flex;
  border-top: 1rpx solid #f0f0f0;
  z-index: 999;
  transition: all 0.3s ease;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #666;
  transition: all 0.3s ease;
}

.tab-item.active {
  color: #4A90E2;
}

.tab-icon {
  font-size: 50rpx;
  margin-bottom: 8rpx;
  display: block;
  width: auto;
  height: auto;
  text-align: center;
  line-height: 1;
}

.tab-text {
  font-size: 28rpx;
  margin-top: 2rpx;
  text-align: center;
}

.tab-badge {
  position: absolute;
  top: 10rpx;
  right: 30%;
  background-color: #ff4d4f;
  color: white;
  font-size: 20rpx;
  padding: 0 10rpx;
  border-radius: 10rpx;
  min-width: 24rpx;
  height: 24rpx;
  line-height: 24rpx;
  text-align: center;
}

.page-container {
  padding-bottom: 140rpx;
}
</style>
