<template>
  <view class="page-container">
    <!-- 顶部店铺信息 -->
    <view class="shop-header">
      <view class="shop-icon">
        <image v-if="shopData.logo" class="logo-image" :src="shopData.logo" mode="aspectFill"></image>
        <text v-else class="icon-text">🏪</text>
      </view>
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
            <text class="withdrawal-amount negative">{{ record.amount }}</text>
            <text class="withdrawal-status" :class="record.status === '已到账' ? 'status-success' : ''">{{ record.status }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { merchantFinanceApi } from '../../utils/merchantFinanceApi.js';
export default {
  name: 'FinancePage',
  data() {
    return {
      shopData: {
        name: "美味餐厅",
        businessStatus: "营业中",
        businessHours: "08:00-22:00",
        logo: ""
      },
      financialData: {
        todayIncome: '3,856.50',
        withdrawableAmount: '8,942.30'
      },

      displayDate: new Date().toISOString().split('T')[0],

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
    this.loadWithdrawalRecords();
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
          businessHours: savedInfo.hours || this.shopData.businessHours,
          logo: savedInfo.logo || this.shopData.logo
        };
      }
    },
    loadFinancialData() {
      // 调用API获取今日收入数据
      merchantFinanceApi.getTodayIncome().then(res => {
        console.log('今日收入数据:', res);
        // 检查响应格式并更新数据 - 从调试信息看，正确的路径是res.data.code
        if (res && res.data && res.data.code === 200) {
          const incomeData = res.data.data;
          console.log('解析后的收入数据:', incomeData);
          // 更新财务数据，将金额格式化为字符串并添加千分位
          this.financialData = {
            ...this.financialData,
            todayIncome: this.formatNumber(incomeData.totalIncome),
            // 可提现金额将通过getMerchantWallet接口获取
            withdrawableAmount: this.financialData.withdrawableAmount
          };
        } else {
          console.error('获取收入数据失败:', res);
          uni.showToast({
            title: '获取收入数据失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('获取收入数据异常:', err);
        uni.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        });
      });
      
      // 调用API获取商家钱包信息
      this.loadWalletData();
    },
    
    // 加载商家钱包信息
    loadWalletData() {
      merchantFinanceApi.getMerchantWallet().then(res => {
        console.log('商家钱包数据:', res);
        console.log('钱包查询响应数据:', res.data);
        console.log('钱包查询响应码:', res.data?.code);
        console.log('钱包查询错误信息:', res.data?.msg);
        // 检查响应格式并更新数据
        if (res && res.data && res.data.code === 200) {
          const walletData = res.data.data;
          console.log('解析后的钱包数据:', walletData);
          // 更新可提现金额，将availableBalance格式化为字符串并添加千分位
          this.financialData = {
            ...this.financialData,
            withdrawableAmount: this.formatNumber(walletData.availableBalance)
          };
        } else if (res && res.data) {
          console.error('获取钱包数据失败:', res);
          // 根据错误信息显示不同的提示
          const errorMsg = res.data.msg || res.data || '';
          if (errorMsg.includes('不存在') || errorMsg.includes('未找到') || res.data.code === 500) {
            // 钱包不存在时，自动创建钱包
            this.initWalletAndReload();
          } else {
            uni.showToast({
              title: errorMsg || '获取钱包数据失败',
              icon: 'none'
            });
          }
        } else {
          console.error('获取钱包数据失败:', res);
          uni.showToast({
            title: '获取钱包数据失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('获取钱包数据异常:', err);
        // 异常情况下也设置默认值，避免页面显示错误
        this.financialData = {
          ...this.financialData,
          withdrawableAmount: '0.00'
        };
        uni.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        });
      });
    },
    
    // 初始化钱包并重新加载数据
    initWalletAndReload() {
      uni.showLoading({
        title: '正在初始化钱包...'
      });
      
      merchantFinanceApi.initMerchantWallet().then(res => {
        uni.hideLoading();
        console.log('钱包初始化结果:', res);
        console.log('钱包初始化响应数据:', res.data);
        console.log('钱包初始化响应码:', res.data?.code);
        
        // 检查响应是否成功 - 兼容不同的响应格式
        const isSuccess = (res && res.statusCode === 200) || 
                         (res && res.data && res.data.code === 200) ||
                         (res && res.data && typeof res.data === 'string' && res.data.includes('成功'));
        
        if (isSuccess) {
          uni.showToast({
            title: '钱包初始化成功',
            icon: 'success'
          });
          // 初始化成功后重新加载钱包数据
          setTimeout(() => {
            this.loadWalletData();
          }, 1000);
        } else {
          console.error('钱包初始化失败:', res);
          // 初始化失败时设置默认值
          this.financialData = {
            ...this.financialData,
            withdrawableAmount: '0.00'
          };
          uni.showToast({
            title: res.data?.msg || res.data || '钱包初始化失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        uni.hideLoading();
        console.error('钱包初始化异常:', err);
        // 初始化异常时设置默认值
        this.financialData = {
          ...this.financialData,
          withdrawableAmount: '0.00'
        };
        uni.showToast({
          title: '钱包初始化失败，请重试',
          icon: 'none'
        });
      });
    },
    // 格式化数字为千分位字符串
    formatNumber(num) {
      if (typeof num === 'number') {
        return num.toLocaleString('zh-CN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      } else if (typeof num === 'string') {
        // 如果是字符串，尝试转换为数字再格式化
        const numValue = parseFloat(num);
        if (!isNaN(numValue)) {
          return numValue.toLocaleString('zh-CN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      }
      return '0.00';
    },

    showCustomDatePicker() {
      // 显示自定义日期选择器
      uni.showToast({
        title: '自定义日期选择器开发中',
        icon: 'none'
      });
    },
    applyWithdrawal() {
      // 跳转到申请提现页面
      uni.navigateTo({
        url: '/pages/finance/withdraw'
      });
    },
    viewWithdrawalHistory() {
      // 跳转到提现记录页面
      uni.navigateTo({
        url: '/pages/finance/withdraw'
      });
    },
    
    // 加载提现记录
    loadWithdrawalRecords() {
      console.log('开始加载提现记录...');
      merchantFinanceApi.getWithdrawRecordList().then(res => {
        console.log('提现记录API响应:', res);
        
        // 检查响应格式
        if (res) {
          console.log('响应状态码:', res.data?.code);
          console.log('响应数据结构:', JSON.stringify(Object.keys(res.data || {})));
          
          // 获取记录数据，支持不同的返回结构
          let records = [];
          if (res.data && res.data.code === 200) {
            // 优先从res.data.rows获取
            records = res.data.rows || [];
            console.log('从res.data.rows获取到的记录数:', records.length);
            
            // 如果rows为空，尝试从res.data.data获取
            if (records.length === 0 && res.data.data) {
              records = Array.isArray(res.data.data) ? res.data.data : [];
              console.log('从res.data.data获取到的记录数:', records.length);
            }
          }
          
          console.log('最终获取到的提现记录:', records);
          
          // 转换提现记录格式为页面需要的格式
          const formattedRecords = records.map(record => {
            console.log('处理单条记录:', record);
            // 获取并显示正确的原始日期
            let dateValue = '';
            if (record.arriveTime) {
              // 优先使用到账时间
              dateValue = this.formatDate(record.arriveTime);
            } else if (record.createTime) {
              // 其次使用创建时间
              dateValue = this.formatDate(record.createTime);
            } else if (record.date) {
              // 最后使用日期字段
              dateValue = record.date;
            } else {
              // 仅在所有日期字段都缺失时使用当前日期作为备用
              dateValue = new Date().toISOString().split('T')[0];
              console.log('使用当前日期作为备用');
            }
            console.log('计算的日期值:', dateValue);
            return {
              date: dateValue,
              amount: '-¥' + this.formatNumber(record.amount || 0),
              // 使用实际状态值并格式化显示
              status: this.formatWithdrawStatus(record.status)
            };
          });
          
          console.log('格式化后的记录:', formattedRecords);
          
          // 只取前两条记录显示
          this.withdrawalRecords = formattedRecords.slice(0, 2);
          
          // 如果没有数据，显示提示
          if (this.withdrawalRecords.length === 0) {
            console.log('暂无提现记录');
          }
        } else {
          console.error('获取提现记录失败:', res);
          uni.showToast({
            title: '获取提现记录失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('获取提现记录异常:', err);
        uni.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        });
      });
    },
    

    
    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN').replace(/\//g, '-');
      } catch (error) {
        console.error('日期格式化错误:', error);
        return '';
      }
    },
    
    // 格式化提现状态
    formatWithdrawStatus(status) {
      const statusMap = {
        'SUCCESS': '已到账',
        'PENDING': '处理中',
        'FAILED': '失败',
        'CANCELLED': '已取消'
      };
      return statusMap[status] || status || '未知';
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
  width: 100rpx;
  height: 100rpx;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shop-icon .logo-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
}

.shop-icon .icon-text {
  font-size: 80rpx;
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

/* 收入明细模块已删除 */

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
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  flex: 1;
}

.withdrawal-amount {
  font-size: 30rpx;
  font-weight: bold;
  color: #ff4d4f;
  flex: 1;
  text-align: center;
  padding: 0 10rpx;
}

.withdrawal-status {
  font-size: 24rpx;
  color: #999;
  flex: 1;
  text-align: right;
}

.withdrawal-status.status-success {
  color: #52c41a;
}
</style>
