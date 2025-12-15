<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">账单明细</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'all' }"
          @click="changeFilter('all')"
        >
          <text class="tab-text">全部</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'income' }"
          @click="changeFilter('income')"
        >
          <text class="tab-text">收入</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'expense' }"
          @click="changeFilter('expense')"
        >
          <text class="tab-text">支出</text>
        </view>
      </view>
    </view>

    <!-- 账单列表 -->
    <view class="bill-section">
      <view class="bill-list">
        <view 
          class="bill-group" 
          v-for="(group, groupIndex) in groupedBills" 
          :key="groupIndex"
        >
          <view class="group-header">
            <text class="group-date">{{ group.date }}</text>
            <view class="group-summary">
              <text class="summary-text">收入：+¥{{ group.income.toFixed(2) }}</text>
              <text class="summary-text">支出：-¥{{ group.expense.toFixed(2) }}</text>
            </view>
          </view>
          <view class="bill-items">
            <view 
              class="bill-item" 
              v-for="(item, index) in group.items" 
              :key="index"
              @click="viewBillDetail(item)"
            >
              <view class="bill-icon">
                <text class="icon-text">{{ getBillIcon(item.type) }}</text>
              </view>
              <view class="bill-content">
                <view class="bill-header">
                  <text class="bill-title">{{ item.title }}</text>
                  <text class="bill-amount" :class="{ income: item.type === 'income', expense: item.type === 'expense' }">
                    {{ item.type === 'income' ? '+' : '-' }}¥{{ item.amount.toFixed(2) }}
                  </text>
                </view>
                <view class="bill-info">
                  <text class="bill-time">{{ formatTime(item.time) }}</text>
                  <text class="bill-status" :class="{ success: item.status === 'success', pending: item.status === 'pending', failed: item.status === 'failed' }">
                    {{ getStatusText(item.status) }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view v-if="filteredBills.length === 0" class="empty-bills">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无账单记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getWalletRecords } from '@/api/wallet.js';
import { processApiResponseIds, safeStringifyId } from '@/utils/id-utils.js';
import orderApi from '@/api/order.js';

export default {
  data() {
    return {
      currentFilter: 'all',
      loading: false,
      pageNum: 1,
      pageSize: 20,
      hasMore: true,
      allBills: [
        {
          id: 1,
          type: 'income',
          title: '充值',
          amount: 200.00,
          time: new Date().getTime() - 2 * 60 * 60 * 1000,
          status: 'success'
        },
        {
          id: 2,
          type: 'expense',
          title: '购买商品',
          amount: 58.50,
          time: new Date().getTime() - 5 * 60 * 60 * 1000,
          status: 'success'
        },
        {
          id: 3,
          type: 'income',
          title: '退款',
          amount: 30.00,
          time: new Date().getTime() - 24 * 60 * 60 * 1000,
          status: 'success'
        },
        {
          id: 4,
          type: 'expense',
          title: '提现',
          amount: 100.00,
          time: new Date().getTime() - 2 * 24 * 60 * 60 * 1000,
          status: 'pending'
        },
        {
          id: 5,
          type: 'expense',
          title: '购买商品',
          amount: 25.80,
          time: new Date().getTime() - 3 * 24 * 60 * 60 * 1000,
          status: 'success'
        },
        {
          id: 6,
          type: 'income',
          title: '充值',
          amount: 500.00,
          time: new Date().getTime() - 5 * 24 * 60 * 60 * 1000,
          status: 'success'
        },
        {
          id: 7,
          type: 'expense',
          title: '购买商品',
          amount: 120.00,
          time: new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
          status: 'success'
        },
        {
          id: 8,
          type: 'income',
          title: '退款',
          amount: 50.00,
          time: new Date().getTime() - 10 * 24 * 60 * 60 * 1000,
          status: 'success'
        }
      ]
    };
  },
  computed: {
    filteredBills() {
      if (this.currentFilter === 'all') {
        return this.allBills;
      }
      return this.allBills.filter(bill => bill.type === this.currentFilter);
    },
    groupedBills() {
      const groups = {};
      this.filteredBills.forEach(bill => {
        const date = this.formatDate(bill.time);
        if (!groups[date]) {
          groups[date] = {
            date: date,
            items: [],
            income: 0,
            expense: 0
          };
        }
        groups[date].items.push(bill);
        if (bill.type === 'income') {
          groups[date].income += bill.amount;
        } else {
          groups[date].expense += bill.amount;
        }
      });
      return Object.values(groups).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    }
  },
  onLoad() {
    this.loadBills();
  },
  onPullDownRefresh() {
    // 下拉刷新
    this.refreshBills();
  },
  onReachBottom() {
    // 上拉加载更多
    this.loadMoreBills();
  },
  methods: {
    goBack() {
      // 检查页面栈，如果只有一个页面（刷新后的情况），则跳转到钱包页面
      const pages = getCurrentPages();
      if (pages.length <= 1) {
        // 页面栈只有一个页面，直接跳转到钱包页面
        uni.redirectTo({
          url: '/pages/mine/wallet'
        });
      } else {
        // 正常返回上一页
        uni.navigateBack();
      }
    },
    
    async loadBills() {
      // 先从本地存储加载账单（快速显示）
      const storedBills = uni.getStorageSync('walletBills');
      if (storedBills && storedBills.length > 0) {
        this.allBills = storedBills;
      }
      
      // 然后从API获取最新数据
      await this.fetchBillsFromAPI();
    },
    
    async refreshBills() {
      this.pageNum = 1;
      this.hasMore = true;
      this.allBills = [];
      
      await this.fetchBillsFromAPI();
      uni.stopPullDownRefresh();
    },
    
    async loadMoreBills() {
      if (!this.hasMore || this.loading) return;
      
      this.pageNum++;
      await this.fetchBillsFromAPI(false);
    },
    
    async fetchBillsFromAPI(showLoading = true) {
      if (this.loading) return;
      
      this.loading = true;
      
      if (showLoading) {
        uni.showLoading({
          title: '加载中...'
        });
      }
      
      try {
        
        // 检查用户登录状态
        const token = uni.getStorageSync('token');
        if (!token) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }
        
        // 构建查询参数
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        };
        
        // 根据筛选条件添加类型参数
        if (this.currentFilter !== 'all') {
          params.type = this.currentFilter === 'income' ? '1,4' : '2,3'; // 1充值,4退款为收入；2消费,3提现为支出
        }
        
        // 并行获取钱包流水和二手交易订单
        const [walletResponse, buyerOrdersRes, sellerOrdersRes] = await Promise.all([
          getWalletRecords(params),
          orderApi.getOrderList({ orderType: 3, pageNum: 1, pageSize: 100 }), // 买家二手订单
          orderApi.getSellerSecondHandOrders({ pageNum: 1, pageSize: 100 }) // 卖家二手订单
        ]);
        
        let newBills = [];
        
        // 处理钱包流水记录
        if (walletResponse && walletResponse.code === 200) {
          const records = walletResponse.data || [];
          
          // 转换后端数据格式为前端格式
          const walletBills = records.map(record => {
            // 尝试多个可能的时间字段
            const timeValue = record.createTime || record.transactionTime || record.tradeTime || record.trade_time;
            
            // 金额使用绝对值，正负号由前端根据type决定显示
            const amount = Math.abs(parseFloat(record.amount || 0));
            
            // 获取标题
            const title = record.remark || record.description || this.getTransactionTitle(record.flowType || record.type);
            
            // 根据flowType和remark综合判断交易类型
            let type = this.mapTransactionType(record.flowType || record.type);
            // 如果remark包含"退款"，强制设为income（收入）
            if (title && (title.includes('退款') || title.includes('refund'))) {
              type = 'income';
            }
            // 如果remark包含"充值"，强制设为income（收入）
            if (title && (title.includes('充值') || title.includes('recharge'))) {
              type = 'income';
            }
            
            return {
              id: safeStringifyId(record.id || record.recordId),
              type: type,
              title: title,
              amount: amount,
              time: new Date(timeValue).getTime(),
              status: this.mapTransactionStatus(record.status),
              orderId: record.orderId,
              balance: Math.abs(parseFloat(record.balance || 0)),
              source: 'wallet'
            };
          });
          
          newBills = [...newBills, ...walletBills];
        }
        
        // 处理买家二手交易订单（支出）
        if (buyerOrdersRes && buyerOrdersRes.code === 200) {
          const buyerOrders = buyerOrdersRes.rows || buyerOrdersRes.data || [];
          const buyerBills = buyerOrders
            .filter(order => order.payStatus === 1) // 只显示已支付的订单
            .map(order => {
              const goodsName = order.orderSecondhandDetailList?.[0]?.goodsName || '二手商品';
              return {
                id: `buyer_${order.orderMainId || order.orderNo}`,
                type: 'expense',
                title: `购买二手商品-${goodsName}`,
                amount: Math.abs(parseFloat(order.payAmount || order.totalAmount || 0)),
                time: new Date(order.payTime || order.createTime).getTime(),
                status: this.mapOrderStatus(order.orderStatus),
                orderId: order.orderNo,
                orderMainId: order.orderMainId,
                source: 'secondhand_buyer'
              };
            });
          
          newBills = [...newBills, ...buyerBills];
        }
        
        // 处理卖家二手交易订单（收入）
        if (sellerOrdersRes && sellerOrdersRes.code === 200) {
          const sellerOrders = sellerOrdersRes.rows || sellerOrdersRes.data || [];
          const sellerBills = sellerOrders
            .filter(order => order.confirmTime) // 只显示已确认收货的订单（卖家才能收到钱）
            .map(order => {
              const goodsName = order.goodsName || '二手商品';
              return {
                id: `seller_${order.orderSecondhandDetailId || order.orderMainId}`,
                type: 'income',
                title: `出售二手商品-${goodsName}`,
                amount: Math.abs(parseFloat(order.depositAmount || 0)),
                time: new Date(order.confirmTime).getTime(),
                status: 'success',
                orderId: order.orderMainId,
                source: 'secondhand_seller'
              };
            });
          
          newBills = [...newBills, ...sellerBills];
        }
        
        // 根据筛选条件过滤
        if (this.currentFilter !== 'all') {
          newBills = newBills.filter(bill => bill.type === this.currentFilter);
        }
        
        // 按时间倒序排序
        newBills.sort((a, b) => b.time - a.time);
        
        // 去重（根据id）
        const uniqueBills = [];
        const seenIds = new Set();
        for (const bill of newBills) {
          if (!seenIds.has(bill.id)) {
            seenIds.add(bill.id);
            uniqueBills.push(bill);
          }
        }
        
        if (this.pageNum === 1) {
          this.allBills = uniqueBills;
        } else {
          this.allBills = [...this.allBills, ...uniqueBills];
        }
        
        // 判断是否还有更多数据
        this.hasMore = newBills.length >= this.pageSize;
        
        // 保存到本地存储
        uni.setStorageSync('walletBills', this.allBills);
        
      } catch (error) {
        console.error('获取账单数据失败:', error);
        if (this.pageNum === 1) {
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        }
      } finally {
        this.loading = false;
        if (showLoading) {
          uni.hideLoading();
        }
      }
    },
    
    // 映射订单状态到账单状态
    mapOrderStatus(orderStatus) {
      // 订单状态：1-待接单 2-待取货 3-配送中 4-已完成 5-已取消
      const statusMap = {
        1: 'pending',
        2: 'pending',
        3: 'pending',
        4: 'success',
        5: 'failed'
      };
      return statusMap[orderStatus] || 'success';
    },
    
    // 映射后端交易类型到前端类型
    mapTransactionType(backendType) {
      const typeMap = {
        '1': 'income',    // 充值
        '2': 'expense',   // 消费
        '3': 'expense',   // 提现
        '4': 'income',    // 退款
        'RECHARGE': 'income',
        'CONSUME': 'expense', 
        'WITHDRAW': 'expense',
        'REFUND': 'income'
      };
      return typeMap[backendType] || 'expense';
    },
    
    // 映射后端状态到前端状态
    mapTransactionStatus(backendStatus) {
      const statusMap = {
        '0': 'pending',   // 处理中
        '1': 'success',   // 成功
        '2': 'failed',    // 失败
        'PENDING': 'pending',
        'SUCCESS': 'success',
        'FAILED': 'failed'
      };
      return statusMap[backendStatus] || 'success';
    },
    
    // 根据交易类型获取标题
    getTransactionTitle(flowType) {
      const titleMap = {
        '1': '充值',
        '2': '消费',
        '3': '提现', 
        '4': '退款',
        'RECHARGE': '充值',
        'CONSUME': '消费',
        'WITHDRAW': '提现',
        'REFUND': '退款'
      };
      return titleMap[flowType] || '交易';
    },
    async changeFilter(filter) {
      if (this.currentFilter === filter) return;
      
      this.currentFilter = filter;
      
      // 重新加载数据
      this.pageNum = 1;
      this.hasMore = true;
      this.allBills = [];
      
      await this.fetchBillsFromAPI();
    },
    getBillIcon(type) {
      const iconMap = {
        'income': '💰',
        'expense': '💸',
        'recharge': '💵',
        'withdraw': '💳',
        'refund': '↩️'
      };
      return iconMap[type] || '💳';
    },
    getStatusText(status) {
      const statusMap = {
        'success': '成功',
        'pending': '处理中',
        'failed': '失败'
      };
      return statusMap[status] || '未知';
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      const second = date.getSeconds().toString().padStart(2, '0');
      return `${hour}:${minute}:${second}`;
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      const weekday = weekdays[date.getDay()];
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return '今天';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天';
      } else {
        return `${month}月${day}日 星期${weekday}`;
      }
    },
    viewBillDetail(item) {
      const fullDateTime = this.formatFullDateTime(item.time);
      uni.showModal({
        title: item.title,
        content: `类型：${item.type === 'income' ? '收入' : '支出'}\n金额：${item.type === 'income' ? '+' : '-'}¥${item.amount.toFixed(2)}\n时间：${fullDateTime}\n状态：${this.getStatusText(item.status)}`,
        showCancel: false
      });
    },
    
    formatFullDateTime(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      const second = date.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-top: 88rpx;
  padding-bottom: 40rpx;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(to bottom, #4A90E2, #6AAFE2);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding-top: var(--status-bar-height, 44rpx);
}

.navbar-content {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.navbar-left {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.navbar-left-hover {
  opacity: 0.7;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.navbar-icon {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
}

.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 36rpx;
  color: white;
  font-weight: bold;
}

.navbar-right {
  width: 60rpx;
}

/* 筛选标签 */
.filter-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 20rpx 30rpx;
  border-radius: 20rpx;
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.filter-tab {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  background-color: #F5F5F5;
  transition: all 0.3s;
}

.filter-tab.active {
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
}

.tab-text {
  font-size: 26rpx;
  color: #666666;
}

.filter-tab.active .tab-text {
  color: white;
  font-weight: 500;
}

/* 账单列表 */
.bill-section {
  margin: 20rpx 30rpx;
}

.bill-group {
  background-color: white;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background-color: #F8F8F8;
  border-bottom: 1rpx solid #F0F0F0;
}

.group-date {
  font-size: 28rpx;
  color: #333333;
  font-weight: bold;
}

.group-summary {
  display: flex;
  gap: 20rpx;
}

.summary-text {
  font-size: 24rpx;
  color: #666666;
}

.bill-items {
  padding: 0 30rpx;
}

.bill-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.bill-item:last-child {
  border-bottom: none;
}

.bill-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.icon-text {
  font-size: 40rpx;
}

.bill-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.bill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.bill-title {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.bill-amount {
  font-size: 32rpx;
  font-weight: bold;
}

.bill-amount.income {
  color: #4CAF50;
}

.bill-amount.expense {
  color: #333333;
}

.bill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bill-time {
  font-size: 24rpx;
  color: #999999;
}

.bill-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.bill-status.success {
  background-color: #E8F8F5;
  color: #4CAF50;
}

.bill-status.pending {
  background-color: #FFF4E6;
  color: #FF9800;
}

.bill-status.failed {
  background-color: #FFEBEE;
  color: #F44336;
}

.empty-bills {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  background-color: white;
  border-radius: 20rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>

