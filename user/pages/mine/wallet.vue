<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">我的钱包</text>
        </view>
        <view class="navbar-right">
          <text class="navbar-action" @click="viewBill">账单</text>
        </view>
      </view>
    </view>

    <!-- 余额卡片 -->
    <view class="balance-card">
      <view class="balance-header">
        <text class="balance-label">账户余额（元）</text>
        <view class="balance-eye" @click="toggleBalanceVisible">
          <text class="eye-icon">{{ balanceVisible ? '👁️' : '👁️‍🗨️' }}</text>
        </view>
      </view>
      <view class="balance-amount">
        <text class="amount-text">{{ balanceVisible ? balance.toFixed(2) : '****' }}</text>
      </view>
      <view class="balance-actions">
        <view class="action-btn" @click="recharge">
          <text class="action-icon">💵</text>
          <text class="action-label">充值</text>
        </view>
        <view class="action-btn" @click="withdraw">
          <text class="action-icon">💰</text>
          <text class="action-label">提现</text>
        </view>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-actions">
      <view class="action-item" @click="viewBill">
        <view class="action-icon-box">
          <text class="action-icon-text">📋</text>
        </view>
        <text class="action-item-label">账单明细</text>
      </view>
      <view class="action-item" @click="viewPaymentMethods">
        <view class="action-icon-box">
          <text class="action-icon-text">💳</text>
        </view>
        <text class="action-item-label">支付方式</text>
      </view>
      <view class="action-item" @click="viewSecurity">
        <view class="action-icon-box">
          <text class="action-icon-text">🔒</text>
        </view>
        <text class="action-item-label">安全设置</text>
      </view>
    </view>

    <!-- 最近交易 -->
    <view class="transaction-section">
      <view class="section-header">
        <text class="section-title">最近交易</text>
        <text class="section-more" @click="viewAllTransactions">查看全部 ></text>
      </view>
      <view class="transaction-list">
        <view class="transaction-item" v-for="(item, index) in recentTransactions" :key="index"
          @click="viewTransactionDetail(item)">
          <view class="transaction-icon">
            <text class="icon-text">{{ getTransactionIcon(item.type) }}</text>
          </view>
          <view class="transaction-content">
            <view class="transaction-header">
              <text class="transaction-title">{{ item.title }}</text>
              <text class="transaction-amount"
                :class="{ income: item.type === 'income', expense: item.type === 'expense' }">
                {{ item.type === 'income' ? '+' : '-' }}{{ item.amount.toFixed(2) }}
              </text>
            </view>
            <view class="transaction-info">
              <text class="transaction-time">{{ formatTime(item.time) }}</text>
              <text class="transaction-status"
                :class="{ success: item.status === 'success', pending: item.status === 'pending' }">
                {{ getStatusText(item.status) }}
              </text>
            </view>
          </view>
        </view>

        <view v-if="recentTransactions.length === 0" class="empty-transactions">
          <text class="empty-icon">📝</text>
          <text class="empty-text">暂无交易记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserWallet, getWalletBalance, getWalletRecords } from '@/api/wallet.js';
import { processApiResponseIds, safeStringifyId } from '@/utils/id-utils.js';
import http from '@/api/request.js';
import orderApi from '@/api/order.js';

export default {
  data() {
    return {
      balanceVisible: true,
      balance: 0.00,
      freezeAmount: 0.00,
      walletInfo: null,
      loading: false,
      isNavigating: false, // 防止递归调用的标志位
      recentTransactions: []
    };
  },
  onLoad() {
    this.loadWalletData();
  },
  onShow() {
    // 页面显示时重新加载数据（可能从充值/提现页面返回）
    this.loadWalletData();
  },
  onPullDownRefresh() {
    // 下拉刷新
    this.fetchWalletDataFromAPI().finally(() => {
      uni.stopPullDownRefresh();
    });
  },
  onBackPress() {
    // 防止递归调用
    if (this.isNavigating) {
      return false; // 允许默认返回行为
    }
    
    // 处理物理返回键和手势返回
    this.goBack();
    return true; // 阻止默认返回行为，使用自定义逻辑
  },
  methods: {
    goBack() {
      // 设置导航标志，防止递归
      this.isNavigating = true;
      
      // 检查页面栈，如果只有一个页面（刷新后的情况），则跳转到我的页面
      const pages = getCurrentPages();
      if (pages.length <= 1) {
        // 页面栈只有一个页面，直接跳转到我的页面
        uni.redirectTo({
          url: '/pages/mine/mine',
          complete: () => {
            this.isNavigating = false;
          }
        });
      } else {
        // 正常返回上一页
        uni.navigateBack({
          delta: 1,
          success: () => {
            this.isNavigating = false;
          },
          fail: () => {
            // 返回失败时跳转到我的页面
            uni.redirectTo({
              url: '/pages/mine/mine',
              complete: () => {
                this.isNavigating = false;
              }
            });
          }
        });
      }
    },
    async loadWalletData() {
      // 先从本地存储加载钱包数据（快速显示）
      const walletData = uni.getStorageSync('walletData');
      if (walletData) {
        this.balance = walletData.balance || 0;
        this.freezeAmount = walletData.freezeAmount || 0;
        if (walletData.recentTransactions) {
          this.recentTransactions = walletData.recentTransactions;
        }
      }

      // 然后从API获取最新数据
      await this.fetchWalletDataFromAPI();
    },

    async fetchWalletDataFromAPI() {
      if (this.loading) return;

      this.loading = true;
      try {
        // 检查用户登录状态
        const token = uni.getStorageSync('token');
        const userId = uni.getStorageSync('userId');
        const userInfo = uni.getStorageSync('userInfo');

        if (!token) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          return;
        }

        // 获取钱包余额
        const balanceRes = await getWalletBalance();

        if (balanceRes && balanceRes.code === 200) {
          // 后端getUserWalletBalance返回单个对象，不是数组
          const walletData = balanceRes.data;

          // 判断用户是否有钱包（data不为null/undefined）
          if (walletData && walletData !== null) {
            // 处理大整数ID
            const processedWallet = processApiResponseIds(walletData, ['userWalletId', 'userBaseId']);

            this.balance = parseFloat(processedWallet.balance || 0);
            this.freezeAmount = parseFloat(processedWallet.freezeAmount || 0);
            this.walletInfo = processedWallet;

            // 检查是否为模拟数据
            if (processedWallet.isSimulated) {
              uni.showModal({
                title: '提示',
                content: '无法获取用户钱包信息，当前显示模拟数据。建议重新登录以获取真实数据。',
                showCancel: true,
                cancelText: '稍后',
                confirmText: '重新登录',
                success: (res) => {
                  if (res.confirm) {
                    // 清除登录信息并跳转到登录页
                    uni.removeStorageSync('token');
                    uni.removeStorageSync('userInfo');
                    uni.removeStorageSync('userId');
                    uni.reLaunch({
                      url: '/pages/login/login'
                    });
                  }
                }
              });
            }
          } else {
            // 用户没有钱包，显示创建钱包提示
            this.balance = 0;
            this.freezeAmount = 0;
            this.walletInfo = null;

            // 提示用户初始化钱包
            uni.showModal({
              title: '钱包初始化',
              content: '检测到您还没有钱包账户，是否立即创建钱包？创建后即可使用充值、提现等功能。',
              showCancel: true,
              cancelText: '稍后',
              confirmText: '创建钱包',
              success: (res) => {
                if (res.confirm) {
                  this.initializeWallet();
                }
              }
            });
          }
        } else {
          // 接口调用失败，也尝试显示创建钱包提示
          console.log('获取钱包余额失败，可能用户没有钱包');
          this.balance = 0;
          this.freezeAmount = 0;
          this.walletInfo = null;

          // 提示用户初始化钱包
          uni.showModal({
            title: '钱包初始化',
            content: '检测到您还没有钱包账户，是否立即创建钱包？创建后即可使用充值、提现等功能。',
            showCancel: true,
            cancelText: '稍后',
            confirmText: '创建钱包',
            success: (res) => {
              if (res.confirm) {
                this.initializeWallet();
              }
            }
          });
        }

        // 获取最近交易记录
        await this.loadRecentTransactions();

        // 保存到本地存储
        const dataToSave = {
          balance: this.balance,
          freezeAmount: this.freezeAmount,
          walletInfo: this.walletInfo,
          recentTransactions: this.recentTransactions,
          lastUpdate: Date.now()
        };
        uni.setStorageSync('walletData', dataToSave);

      } catch (error) {
        console.error('获取钱包数据失败:', error);
        uni.showToast({
          title: '获取钱包数据失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    async loadRecentTransactions() {
      try {
        // 并行获取钱包流水和二手交易订单
        const [recordsRes, buyerOrdersRes, sellerOrdersRes] = await Promise.all([
          getWalletRecords({ pageNum: 1, pageSize: 10 }),
          orderApi.getOrderList({ orderType: 3, pageNum: 1, pageSize: 10 }), // 买家二手订单
          orderApi.getSellerOrderList({ pageNum: 1, pageSize: 10 }) // 卖家二手订单
        ]);

        let allTransactions = [];

        // 处理钱包流水记录
        if (recordsRes && recordsRes.code === 200) {
          const records = recordsRes.data || [];

          const walletTransactions = records.map(record => {
            const timeValue = record.createTime || record.transactionTime || record.tradeTime || record.trade_time;
            
            let timeStamp;
            if (timeValue) {
              timeStamp = new Date(timeValue).getTime();
              if (isNaN(timeStamp)) {
                timeStamp = Date.now();
              }
            } else {
              timeStamp = Date.now();
            }
            
            const amount = Math.abs(parseFloat(record.amount || 0));
            // 处理 remark：列表只显示前半段，后半段仅在详情展示
            const rawRemark = record.remark || record.description || '';
            let title = this.getTransactionTitle(record.flowType || record.type);
            let remarkDetail = '';
            if (rawRemark) {
              const parts = rawRemark.split(/[，,]/);
              title = (parts[0] && parts[0].trim()) ? parts[0].trim() : title;
              if (parts.length > 1) {
                remarkDetail = parts.slice(1).join(',').trim();
              }
            }
            
            let type = this.mapTransactionType(record.flowType || record.type);
            if (rawRemark && (rawRemark.includes('退款') || rawRemark.toLowerCase().includes('refund'))) {
              type = 'income';
            }
            if (rawRemark && (rawRemark.includes('充值') || rawRemark.toLowerCase().includes('recharge'))) {
              type = 'income';
            }
            
            return {
              id: safeStringifyId(record.id || record.recordId),
              type: type,
              title: title,
              amount: amount,
              time: timeStamp,
              status: this.mapTransactionStatus(record.status),
              source: 'wallet',
              remarkDetail: remarkDetail
            };
          });
          
          allTransactions = [...allTransactions, ...walletTransactions];
        }

        // 处理买家二手交易订单（支出）
        if (buyerOrdersRes && buyerOrdersRes.code === 200) {
          const buyerOrders = buyerOrdersRes.rows || buyerOrdersRes.data || [];
          const buyerTransactions = buyerOrders
            .filter(order => order.payStatus === 1)
            .map(order => {
              const goodsName = order.orderSecondhandDetailList?.[0]?.goodsName || '二手商品';
              return {
                id: `buyer_${order.orderMainId || order.orderNo}`,
                type: 'expense',
                title: `购买二手商品-${goodsName}`,
                amount: Math.abs(parseFloat(order.payAmount || order.totalAmount || 0)),
                time: new Date(order.payTime || order.createTime).getTime(),
                status: this.mapOrderStatusToTransaction(order.orderStatus),
                source: 'secondhand_buyer'
              };
            });
          
          allTransactions = [...allTransactions, ...buyerTransactions];
        }

        // 处理卖家二手交易订单（收入）
        if (sellerOrdersRes && sellerOrdersRes.code === 200) {
          const sellerOrders = sellerOrdersRes.rows || sellerOrdersRes.data || [];
          const sellerTransactions = sellerOrders
            .filter(order => order.confirmTime)
            .map(order => {
              const goodsName = order.goodsName || '二手商品';
              return {
                id: `seller_${order.orderSecondhandDetailId || order.orderMainId}`,
                type: 'income',
                title: `出售二手商品-${goodsName}`,
                amount: Math.abs(parseFloat(order.depositAmount || 0)),
                time: new Date(order.confirmTime).getTime(),
                status: 'success',
                source: 'secondhand_seller'
              };
            });
          
          allTransactions = [...allTransactions, ...sellerTransactions];
        }

        // 按时间倒序排序
        allTransactions.sort((a, b) => b.time - a.time);

        // 展示全部流水，不限数量，不做去重（避免后端ID缺失导致仅显示一条）
        this.recentTransactions = allTransactions;

      } catch (error) {
        console.error('获取交易记录失败:', error);
        // 保持现有数据，不清空
      }
    },

    // 映射订单状态到交易状态
    mapOrderStatusToTransaction(orderStatus) {
      const statusMap = {
        1: 'pending',
        2: 'pending',
        3: 'pending',
        4: 'success',
        5: 'failed'
      };
      return statusMap[orderStatus] || 'success';
    },

    // 初始化用户钱包
    async initializeWallet() {
      try {
        uni.showLoading({
          title: '创建钱包中...'
        });

        // 检查token
        const token = uni.getStorageSync('token');
        if (!token) {
          uni.hideLoading();
          uni.showModal({
            title: '未登录',
            content: '请先登录后再创建钱包',
            showCancel: true,
            cancelText: '取消',
            confirmText: '去登录',
            success: (res) => {
              if (res.confirm) {
                uni.reLaunch({
                  url: '/pages/login/login'
                });
              }
            }
          });
          return;
        }

        console.log('开始创建钱包，token:', token ? '已存在' : '不存在');

        // 生成8位钱包ID（10000000 到 99999999）
        const userWalletId = Math.floor(10000000 + Math.random() * 90000000);
        console.log('生成的钱包ID:', userWalletId);

        // 调用后端创建钱包接口，传递生成的userWalletId
        const response = await http.post(`/user/walletRecord/addWallet?userWalletId=${userWalletId}`, {});

        console.log('创建钱包响应:', response);

        if (response && response.code === 200) {
          uni.hideLoading();
          uni.showToast({
            title: '钱包创建成功！',
            icon: 'success',
            duration: 2000
          });

          // 重新加载钱包数据
          setTimeout(() => {
            this.fetchWalletDataFromAPI();
          }, 1500);

        } else {
          // 处理业务错误
          const errorMsg = response?.msg || response?.message || '创建钱包失败';
          throw new Error(errorMsg);
        }

      } catch (error) {
        uni.hideLoading();
        console.error('初始化钱包失败:', error);

        // 根据错误类型提供不同的处理建议
        let errorContent = '';
        let showRelogin = false;

        // 检查是否是HTTP状态码错误
        if (error.statusCode === 401) {
          errorContent = '登录状态已过期，请重新登录后创建钱包';
          showRelogin = true;
        } else if (error.statusCode === 500) {
          errorContent = '服务器处理失败，可能原因：\n1. 用户信息获取失败\n2. 数据库连接异常\n\n请稍后重试或联系客服';
        } else if (error.message && error.message.includes('未登录')) {
          errorContent = '登录状态已过期，请重新登录后创建钱包';
          showRelogin = true;
        } else if (error.message && error.message.includes('认证失败')) {
          errorContent = '身份验证失败，请重新登录';
          showRelogin = true;
        } else if (error.message && error.message.includes('网络')) {
          errorContent = '网络连接失败，请检查网络后重试';
        } else {
          // 显示后端返回的具体错误信息
          const backendMsg = error.message || error.data?.msg || error.msg || '';
          errorContent = `钱包创建失败${backendMsg ? '：' + backendMsg : ''}。\n\n可能原因：\n1. 登录状态已过期\n2. 网络连接异常\n3. 服务器错误\n\n建议您稍后重试或联系客服处理。`;
        }

        uni.showModal({
          title: '创建失败',
          content: errorContent,
          showCancel: showRelogin,
          cancelText: showRelogin ? '取消' : '',
          confirmText: showRelogin ? '重新登录' : '知道了',
          success: (res) => {
            if (res.confirm && showRelogin) {
              // 清除登录信息并跳转到登录页
              uni.removeStorageSync('token');
              uni.removeStorageSync('userInfo');
              uni.removeStorageSync('userId');
              uni.reLaunch({
                url: '/pages/login/login'
              });
            }
          }
        });
      }
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
    toggleBalanceVisible() {
      this.balanceVisible = !this.balanceVisible;
    },
    recharge() {
      uni.navigateTo({
        url: '/pages/mine/wallet-recharge'
      });
    },
    withdraw() {
      uni.navigateTo({
        url: '/pages/mine/wallet-withdraw'
      });
    },
    viewBill() {
      uni.navigateTo({
        url: '/pages/mine/wallet-bill'
      });
    },
    viewPaymentMethods() {
      uni.navigateTo({
        url: '/pages/mine/payment-methods'
      });
    },
    viewSecurity() {
      uni.navigateTo({
        url: '/pages/mine/wallet-security'
      });
    },
    viewAllTransactions() {
      this.viewBill();
    },
    viewTransactionDetail(item) {
      let content = `金额：${item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}元\n时间：${this.formatTime(item.time)}\n状态：${this.getStatusText(item.status)}`;
      if (item.remarkDetail) {
        content += `\n备注：${item.remarkDetail}`;
      }
      uni.showModal({
        title: item.title,
        content,
        showCancel: false
      });
    },
    getTransactionIcon(type) {
      const iconMap = {
        'income': '💰',
        'expense': '💸',
        'refund': '↩️',
        'recharge': '💵',
        'withdraw': '💳'
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
      const now = new Date().getTime();
      const diff = now - timestamp;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) {
        return '刚刚';
      } else if (minutes < 60) {
        return `${minutes}分钟前`;
      } else if (hours < 24) {
        return `${hours}小时前`;
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        const date = new Date(timestamp);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
      }
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
  width: 88rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.navbar-action {
  font-size: 28rpx;
  color: white;
}

/* 余额卡片 */
.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 20rpx 30rpx;
  padding: 50rpx 40rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.balance-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.balance-eye {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye-icon {
  font-size: 36rpx;
}

.balance-amount {
  margin-bottom: 40rpx;
}

.amount-text {
  font-size: 72rpx;
  color: white;
  font-weight: bold;
  letter-spacing: 2rpx;
}

.balance-actions {
  display: flex;
  align-items: center;
  gap: 30rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  backdrop-filter: blur(10rpx);
}

.action-btn:active {
  background-color: rgba(255, 255, 255, 0.3);
}

.action-icon {
  font-size: 36rpx;
}

.action-label {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

/* 快捷功能 */
.quick-actions {
  display: flex;
  align-items: center;
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  justify-content: space-around;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.action-icon-box {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.action-icon-text {
  font-size: 40rpx;
}

.action-item-label {
  font-size: 24rpx;
  color: #666666;
}

/* 交易记录区域 */
.transaction-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: bold;
}

.section-more {
  font-size: 26rpx;
  color: #4A90E2;
}

.transaction-list {
  margin-top: 20rpx;
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-icon {
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

.transaction-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.transaction-title {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.transaction-amount {
  font-size: 32rpx;
  font-weight: bold;
}

.transaction-amount.income {
  color: #4CAF50;
}

.transaction-amount.expense {
  color: #333333;
}

.transaction-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-time {
  font-size: 24rpx;
  color: #999999;
}

.transaction-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.transaction-status.success {
  background-color: #E8F8F5;
  color: #4CAF50;
}

.transaction-status.pending {
  background-color: #FFF4E6;
  color: #FF9800;
}

.empty-transactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
