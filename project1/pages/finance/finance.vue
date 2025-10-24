<template>
  <view class="page-container">
    <!-- 顶部店铺信息 -->
    <view class="shop-header">
      <view class="shop-icon">🏪</view>
      <view class="shop-info">
        <view class="shop-name">{{ shopData.name }}</view>
        <view class="shop-status">{{ shopData.businessStatus }} · {{ shopData.businessHours }}</view>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 财务概览卡片 -->
      <view class="financial-overview">
        <view class="overview-card income">
          <text class="card-label">今日收入</text>
          <text class="card-value">¥{{ financialData.todayIncome }}</text>
        </view>
        <view class="overview-card withdrawable">
          <text class="card-label">可提现金额</text>
          <text class="card-value">¥{{ financialData.withdrawableAmount }}</text>
        </view>
      </view>
      
      <!-- 日期筛选 -->
      <view class="date-filter">
        <view class="filter-tabs">
          <view 
            class="filter-tab" 
            :class="{ active: selectedDateRange === 'today' }"
            @click="selectDateRange('today')"
          >
            今日
          </view>
          <view 
            class="filter-tab" 
            :class="{ active: selectedDateRange === 'week' }"
            @click="selectDateRange('week')"
          >
            本周
          </view>
          <view 
            class="filter-tab" 
            :class="{ active: selectedDateRange === 'month' }"
            @click="selectDateRange('month')"
          >
            本月
          </view>
          <view 
            class="filter-tab" 
            :class="{ active: selectedDateRange === 'custom' }"
            @click="showCustomDatePicker"
          >
            自定义
          </view>
        </view>
        <text class="current-date">{{ displayDate }}</text>
      </view>
      
      <!-- 收入列表 -->
      <view class="income-list">
        <view class="section-title">
          <text class="title-text">收入明细</text>
        </view>
        <view class="order-item" v-for="(order, index) in orderList" :key="index">
          <view class="order-header">
            <text class="order-time">{{ order.time }}</text>
            <text class="order-amount positive">+¥{{ order.amount }}</text>
          </view>
          <view class="order-info">
            <text class="order-id">订单号: {{ order.orderId }}</text>
            <text class="customer-name">{{ order.customerName }}</text>
          </view>
          <view class="order-details">
            <text class="detail-text">商品金额: ¥{{ order.productAmount }} | {{ order.platformSubsidy ? '平台补贴: ¥' + order.platformSubsidy + ' | ' : '' }}实际收入: ¥{{ order.actualIncome }}</text>
          </view>
          <view class="order-details">
            <text class="detail-text">分成: 平台服务费 ¥{{ order.platformFee }} | 配送费 ¥{{ order.deliveryFee }}</text>
          </view>
          <button class="view-detail-btn" @click="viewOrderDetail(order.orderId)">查看详情</button>
        </view>
      </view>
      
      <!-- 提现管理 -->
    <view class="withdrawal-section">
      <view class="section-title">
        <text class="title-text">提现管理</text>
      </view>
      <view class="withdrawal-actions">
        <button class="withdraw-btn" @click="applyWithdrawal">申请提现</button>
        <text class="withdrawal-history" @click="viewWithdrawalHistory">提现记录</text>
      </view>
        
        <!-- 提现记录列表 -->
        <view class="withdrawal-list">
          <view class="withdrawal-item" v-for="(record, index) in withdrawalRecords" :key="index">
            <text class="withdrawal-date">{{ record.date }}</text>
            <text class="withdrawal-amount negative">-¥{{ record.amount }}</text>
            <text class="withdrawal-status" :class="record.status === '已到账' ? 'status-success' : ''">{{ record.status }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FinancePage',
  data() {
    return {
      shopData: {
        name: "美味餐厅",
        businessStatus: "营业中",
        businessHours: "08:00-22:00"
      },
      financialData: {
        todayIncome: '3,856.50',
        withdrawableAmount: '8,942.30'
      },
      selectedDateRange: 'today',
      displayDate: '2023-11-15',
      orderList: [
        {
          time: '2023-11-15 12:30',
          amount: '68.50',
          orderId: '#20231115001',
          customerName: '张先生',
          productAmount: '78.50',
          platformSubsidy: '5.00',
          actualIncome: '68.50',
          platformFee: '5.00',
          deliveryFee: '5.00'
        },
        {
          time: '2023-11-15 12:15',
          amount: '112.00',
          orderId: '#20231115002',
          customerName: '李女士',
          productAmount: '125.00',
          activityDiscount: '13.00',
          actualIncome: '112.00',
          platformFee: '6.25',
          deliveryFee: '6.75'
        }
      ],
      withdrawalRecords: [
        {
          date: '2023-11-14',
          amount: '5,000.00',
          status: '已到账'
        },
        {
          date: '2023-11-07',
          amount: '3,800.00',
          status: '已到账'
        }
      ]
    };
  },
  onLoad() {
    this.loadShopInfo();
    this.loadFinancialData();
  },
  methods: {
    loadShopInfo() {
      // 从本地存储加载店铺信息
      const savedInfo = uni.getStorageSync('shopInfo');
      if (savedInfo) {
        this.shopData = {
          ...this.shopData,
          name: savedInfo.name || this.shopData.name,
          businessStatus: savedInfo.openStatus || this.shopData.businessStatus,
          businessHours: savedInfo.hours || this.shopData.businessHours
        };
      }
    },
    loadFinancialData() {
      // 这里可以调用API获取财务数据
      // 现在使用模拟数据
      console.log('加载财务数据');
    },
    selectDateRange(range) {
      this.selectedDateRange = range;
      // 根据选择的日期范围更新显示日期
      switch(range) {
        case 'today':
          this.displayDate = '2023-11-15';
          break;
        case 'week':
          this.displayDate = '2023-11-13 至 2023-11-19';
          break;
        case 'month':
          this.displayDate = '2023-11-01 至 2023-11-30';
          break;
      }
      // 这里可以根据日期范围重新加载数据
    },
    showCustomDatePicker() {
      // 显示自定义日期选择器
      uni.showToast({
        title: '自定义日期选择器开发中',
        icon: 'none'
      });
    },
    viewOrderDetail(orderId) {
      // 跳转到交易详情页面
      uni.navigateTo({
        url: `/pages/finance/order-detail?orderId=${orderId}`
      });
    },
    applyWithdrawal() {
      // 跳转到申请提现页面
      uni.navigateTo({
        url: '/pages/finance/withdraw'
      });
    },
    viewWithdrawalHistory() {
      // 查看提现记录
      uni.showToast({
        title: '查看提现记录',
        icon: 'none'
      });
    }
  }
};
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 30rpx;
}

/* 顶部店铺信息 */
.shop-header {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
}

.shop-icon {
  font-size: 80rpx;
  margin-right: 24rpx;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.shop-status {
  font-size: 28rpx;
  color: #666;
}

/* 内容区域 */
.content {
  padding: 24rpx;
}

/* 财务概览卡片 */
.financial-overview {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.overview-card {
  flex: 1;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.overview-card.income {
  background: #F0F8FF;
}

.overview-card.withdrawable {
  background: #FFF0F5;
}

.card-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.card-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

/* 日期筛选 */
.date-filter {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-tabs {
  display: flex;
  gap: 30rpx;
}

.filter-tab {
  font-size: 28rpx;
  color: #999;
  padding: 8rpx 0;
  position: relative;
}

.filter-tab.active {
  color: #4A90E2;
  font-weight: bold;
}

.filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background-color: #4A90E2;
  border-radius: 2rpx;
}

.current-date {
  font-size: 26rpx;
  color: #999;
}

/* 收入列表 */
.income-list {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
}

.section-title {
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.order-item {
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.order-time {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.order-amount {
  font-size: 32rpx;
  font-weight: bold;
}

.amount.positive {
  color: #52c41a;
}

.amount.negative {
  color: #ff4d4f;
}

.order-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.order-id {
  font-size: 26rpx;
  color: #666;
}

.customer-name {
  font-size: 26rpx;
  color: #666;
}

.order-details {
  margin-bottom: 8rpx;
}

.detail-text {
  font-size: 24rpx;
  color: #999;
}

.view-detail-btn {
  margin-top: 16rpx;
  background: none;
  border: 2rpx solid #4A90E2;
  color: #4A90E2;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  width: auto;
  height: auto;
  line-height: 1.5;
}

/* 提现管理 */
.withdrawal-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
}

.withdrawal-actions {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding-left: 0;
}

.withdraw-btn {
  background: #4A90E2;
  color: white;
  font-size: 28rpx;
  padding: 16rpx 40rpx;
  border-radius: 24rpx;
  width: auto;
  height: auto;
  line-height: 1.5;
  margin-left: 0;
}

.withdrawal-history {
  font-size: 26rpx;
  color: #4A90E2;
  margin-left: auto;
}

/* 提现记录列表 */
.withdrawal-list {
  
}

.withdrawal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.withdrawal-item:last-child {
  border-bottom: none;
}

.withdrawal-date {
  font-size: 26rpx;
  color: #666;
}

.withdrawal-amount {
  font-size: 30rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.withdrawal-status {
  font-size: 24rpx;
  color: #999;
}

.withdrawal-status.status-success {
  color: #52c41a;
}
</style>