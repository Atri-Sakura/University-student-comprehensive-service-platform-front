<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-button" @click="goBack">
		  
      </view>
      <view class="nav-title">申请提现</view>
      <view class="nav-right">
        <view class="help-icon" @click="showHelp">?</view>
      </view>
    </view>
    
    <!-- 余额信息卡片 -->
    <view class="balance-card">
      <view class="balance-label">可提现余额</view>
      <view class="balance-amount">¥{{ financialData.withdrawableBalance }}</view>
      
      <view class="balance-details">
        <view class="detail-item">
          <text class="detail-label">今日收入</text>
          <text class="detail-value">¥{{ financialData.todayIncome }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">待结算</text>
          <text class="detail-value">¥{{ financialData.pendingSettlement }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">提现中</text>
          <text class="detail-value">¥{{ financialData.pendingWithdrawal }}</text>
        </view>
      </view>
    </view>
    
    <!-- 提现申请区域 -->
    <view class="withdraw-section">
      <view class="section-title">提现申请</view>
      
      <!-- 提现金额输入 -->
      <view class="form-group">
        <view class="form-label">提现金额</view>
        <input 
          type="number" 
          class="form-input" 
          v-model.number="withdrawAmount" 
          placeholder="请输入" 
          @input="calculateFee"
        />
        
        <!-- 快捷金额选择 -->
        <view class="quick-amounts">
          <view 
            class="quick-amount" 
            v-for="amount in quickAmounts" 
            :key="amount"
            @click="selectQuickAmount(amount)"
          >
            {{ amount }}元
          </view>
        </view>
      </view>
      
      <!-- 提现账户 -->
      <view class="form-group">
        <view class="form-label">提现账户</view>
        <view class="account-selector">
          <picker @change="changeAccount" :value="selectedAccountIndex" :range="accounts">
            <view class="account-display">
              {{ accounts[selectedAccountIndex] || '请选择提现账户' }}
              <text class="arrow-icon">▼</text>
            </view>
          </picker>
          <!-- 账户操作按钮区域 -->
          <view class="account-actions">
            <!-- 只有当有账户数据且选中的账户不是默认账户时才显示设为默认按钮 -->
            <view v-if="accountsData.length > 0 && selectedAccountIndex >= 0 && selectedAccountIndex < accountsData.length && accountsData[selectedAccountIndex].isDefault !== 1" class="set-default-btn" @click="setAccountAsDefault">
              设为默认
            </view>
            <!-- 只有当有账户数据时才显示删除按钮 -->
            <view v-if="accountsData.length > 0" class="delete-account-btn" @click="deleteSelectedAccount">
              删除账户
            </view>
          </view>
        </view>
        <view class="add-account" @click="navigateToAddAccount">
          <text class="add-icon">+</text> 添加新账户
        </view>
      </view>
      
      <!-- 费用计算 -->
      <view class="fee-calculation">
        <view class="calculation-item">
          <text class="calc-label">提现金额（实际到账）</text>
          <text class="calc-value">¥{{ formatAmount(withdrawAmount) }}</text>
        </view>
        <view class="calculation-item">
          <text class="calc-label">手续费 ({{ feeRate * 100 }}%)</text>
          <text class="calc-value">¥{{ formatAmount(fee) }}</text>
        </view>
        <view class="calculation-divider"></view>
        <view class="calculation-item total">
          <text class="calc-label total">将从余额扣除总计</text>
          <text class="calc-value total">¥{{ formatAmount(totalDeduction) }}</text>
        </view>
      </view>
      
      <!-- 确认提现按钮 -->
      <button 
        class="confirm-button" 
        :disabled="!canWithdraw"
        @click="confirmWithdraw"
      >
        确认提现
      </button>
    </view>
    
    <!-- 最近提现记录 -->
    <view class="withdrawal-history">
      <view class="section-header">
        <text class="section-title">最近提现记录</text>
        <text class="view-all" @click="viewAllHistory">查看全部</text>
      </view>
      
      <view class="history-list">
        <view class="history-item" v-for="(record, index) in recentRecords" :key="index">
          <view class="history-main">
            <text class="history-account">{{ record.account }}</text>
            <text class="history-time">{{ record.time }}</text>
          </view>
          <view class="history-details">
            <text class="history-amount">-¥{{ record.amount }}</text>
            <text class="history-status" :class="record.status === '成功' ? 'status-success' : ''">
              {{ record.status }}
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getWithdrawOverview, previewWithdraw, getWithdrawalAccounts, deleteWithdrawAccount, setDefaultWithdrawAccount, applyWithdraw, getWithdrawRecordList } from '../../utils/merchantFinanceApi.js';

export default {
  name: 'WithdrawPage',
  data() {
      return {
        // 财务数据
        financialData: {
          withdrawableBalance: '8,642.50',
          todayIncome: '1,285.00',
          pendingSettlement: '642.80',
          pendingWithdrawal: '1,200.00'
        },
        
        // 提现表单数据
        withdrawAmount: 0,
        quickAmounts: [100, 500, 1000, 2000],
        accounts: [], // 将在加载时动态填充
        accountsData: [], // 存储完整的账户信息
        selectedAccountIndex: -1,
        feeRate: 0.005, // 0.5%手续费率
        fee: 0,
        totalDeduction: 0,
        
        // 提现记录 - 初始化为空数组，后续由API数据填充
        recentRecords: [],

        
        // 提现申请状态，防止重复提交
        isSubmitting: false
      };
    },
  computed: {
    // 是否可以提现
    canWithdraw() {
      const balance = parseFloat(this.financialData.withdrawableBalance.replace(/,/g, ''));
      // 提现金额必须大于0，且余额必须足够支付提现金额和手续费，且必须有可用的提现账户
      return this.withdrawAmount > 0 && 
             (this.withdrawAmount + this.fee) <= balance && 
             this.accounts.length > 0 && 
             this.selectedAccountIndex >= 0;
    }
  },
  onLoad() {
    // 页面加载时先设置默认支付宝账户
    this.setDefaultAlipayAccount();
    // 页面加载时计算费用
    this.calculateFee();
    // 加载钱包数据
    this.loadWalletData();
  },
  methods: {
    // 返回上一页
    goBack() {
      const pages = getCurrentPages();
      if (pages.length <= 1) {
        // 没有页面栈，检查是否有token
        const token = uni.getStorageSync('token');
        if (token) {
          // 有token，跳转到首页
          uni.switchTab({
            url: '/pages/index/index'
          });
        } else {
          // 没有token，跳转到登录页
          uni.redirectTo({
            url: '/pages/login/login',
            fail: () => {
              uni.reLaunch({
                url: '/pages/login/login'
              });
            }
          });
        }
      } else {
        uni.navigateBack();
      }
    },
    
    // 显示帮助信息
    showHelp() {
      uni.showModal({
        title: '提现帮助',
        content: '1. 提现金额为实际到账金额\n2. 提现手续费为0.5%，将从可提现余额中额外扣除\n3. 请确保可提现余额足够支付提现金额和手续费\n4. 提现申请提交后，资金一般在1-3个工作日内到账',
        showCancel: false
      });
    },
    
    navigateToAddAccount() {
      // 跳转到添加提现账户页面
      uni.navigateTo({
        url: '/pages/finance/add-withdraw-account'
      });
    },
    
    // 选择快捷金额
    selectQuickAmount(amount) {
      this.withdrawAmount = amount;
      this.calculateFee();
    },
    
    // 切换提现账户
    changeAccount(e) {
      const newIndex = parseInt(e.detail.value);
      // 安全检查，确保索引在有效范围内
      if (newIndex >= 0 && newIndex < this.accountsData.length) {
        this.selectedAccountIndex = newIndex;
        console.log('选中的账户信息:', this.accountsData[this.selectedAccountIndex]);
      } else {
        console.error('无效的账户索引:', newIndex);
        this.selectedAccountIndex = 0;
      }
    },
    
    // 添加新账户
    showAddAccount() {
      uni.showToast({
        title: '添加新账户功能开发中',
        icon: 'none'
      });
    },
    
    // 计算手续费和总扣款金额
    calculateFee() {
      const amount = this.withdrawAmount || 0;
      // 如果提现金额为0，重置费用为0
      if (amount <= 0) {
        this.fee = 0;
        this.totalDeduction = 0;
        return;
      }
      
      // 首先进行本地计算作为初始显示（使用精确的小数计算）
      const calculatedFee = parseFloat((amount * this.feeRate).toFixed(2));
      const calculatedTotalDeduction = parseFloat((amount + calculatedFee).toFixed(2));
      
      // 设置初始值
      this.fee = calculatedFee;
      this.totalDeduction = calculatedTotalDeduction;
      
      // 调用后端接口获取预估结果
      previewWithdraw(amount)
        .then(res => {
          // 检查响应格式
          if (res && res.data && (res.data.code === 200 || res.data.code === "200")) {
            const previewVO = res.data.data || res.data;
            // 更新费用和总扣款金额
            this.fee = previewVO.fee !== undefined ? parseFloat(previewVO.fee.toFixed(2)) : calculatedFee;
            this.totalDeduction = parseFloat((amount + this.fee).toFixed(2));
          }
        })
        .catch(error => {
          // 异常时使用本地计算结果
        });
    },
    
    // 格式化金额显示
    formatAmount(amount) {
      if (isNaN(amount) || amount === null || amount === undefined) {
        return '0.00';
      }
      return amount.toFixed(2);
    },
    
    // 确认提现
    confirmWithdraw() {
      if (!this.canWithdraw) {
        uni.showToast({
          title: '请输入有效提现金额',
          icon: 'none'
        });
        return;
      }
      
      // 检查是否有账户数据且选中了有效账户
      if (this.accountsData.length === 0 || this.selectedAccountIndex < 0 || this.selectedAccountIndex >= this.accountsData.length) {
        uni.showToast({
          title: '请先添加并选择提现账户',
          icon: 'none'
        });
        return;
      }
      
      // 获取当前选中的账户信息
      const selectedAccount = this.accountsData[this.selectedAccountIndex];
      if (!selectedAccount || !selectedAccount.accountId) {
        uni.showToast({
          title: '请选择有效的提现账户',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '确认提现',
        content: `确认将¥${this.formatAmount(this.withdrawAmount)}提现至${this.accounts[this.selectedAccountIndex]}吗？\n将从余额中额外扣除手续费¥${this.formatAmount(this.fee)}`,
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '处理中' });
            
            // 防止重复提交
            if (this.isSubmitting) return;
            this.isSubmitting = true;
            
            // 准备提现数据 - 提交实际提现金额（不包含手续费）
            const submitData = {
              amount: this.withdrawAmount,
              accountId: Number(selectedAccount.accountId) // 确保accountId是数字类型
            };
            
            
            // 调用提现API
            applyWithdraw(submitData)
              .then(response => {
                uni.hideLoading();
                this.isSubmitting = false;
                
                if (response && response.data && response.data.code === 200) {
                  uni.showToast({
                    title: '提现申请已提交',
                    icon: 'success'
                  });
                  
                  // 延迟后返回上一页
                  setTimeout(() => {
                    this.goBack();
                  }, 1500);
                } else {
                  uni.showToast({
                    title: response.data?.msg || '提现失败，请重试',
                    icon: 'none'
                  });
                }
              })
              .catch(error => {
                uni.hideLoading();
                this.isSubmitting = false;
                uni.showToast({
                  title: '网络异常，请稍后重试',
                  icon: 'none'
                });
              });
            
          }
        }
      });
    },
    
    // 查看全部提现记录
    viewAllHistory() {
      // 显示加载状态
      uni.showLoading({
        title: '加载中',
        mask: true
      });
      
      // 调用获取提现记录接口
      getWithdrawRecordList()
        .then(response => {
          uni.hideLoading();
          
          if (response && response.data) {
            // 处理不同格式的返回值 - 可能是字符串"200"或数字200
            const isSuccess = response.data.code === 200 || response.data.code === "200";
            
            // 直接使用response.data作为记录数据
            const recordsData = response.data;
            
            if (isSuccess && recordsData.rows && Array.isArray(recordsData.rows) && recordsData.rows.length > 0) {
              // 获取第一条记录
              const firstRecord = recordsData.rows[0];
              // 状态映射
              const statusMap = {
                'SUCCESS': '成功',
                'PENDING': '处理中',
                'FAILED': '失败'
              };
              
              // 弹出详情模态框
              uni.showModal({
                title: '提现记录',
                content: `共${recordsData.total || recordsData.rows.length}条记录\n最近一条: ${firstRecord.amount || 0}元 (${statusMap[firstRecord.status] || firstRecord.status || '未知'})`,
                showCancel: false
              });
            } else {
              uni.showToast({
                title: '暂无提现记录',
                icon: 'none'
              });
            }
          } else {
            uni.showToast({
              title: response?.data?.msg || '获取记录失败',
              icon: 'none'
            });
          }
        })
        .catch(error => {
          uni.hideLoading();
          uni.showToast({
            title: '获取记录失败',
            icon: 'none'
          });
        });
    },
    
    // 删除选中的账户
    deleteSelectedAccount() {
      if (this.accountsData.length > 0 && this.selectedAccountIndex >= 0 && this.selectedAccountIndex < this.accountsData.length) {
        const selectedAccount = this.accountsData[this.selectedAccountIndex];
        this.deleteAccount(selectedAccount.accountId, this.selectedAccountIndex);
      } else {
        uni.showToast({
          title: '请先选择要删除的账户',
          icon: 'none'
        });
      }
    },
    
    // 设置账户为默认账户
    setAccountAsDefault() {
      if (this.accountsData.length > 0 && this.selectedAccountIndex >= 0 && this.selectedAccountIndex < this.accountsData.length) {
        const selectedAccount = this.accountsData[this.selectedAccountIndex];
        
        // 检查是否已经是默认账户
        if (selectedAccount.isDefault === 1) {
          uni.showToast({
            title: '该账户已是默认账户',
            icon: 'none'
          });
          return;
        }
        
        // 显示确认弹窗
        uni.showModal({
          title: '设置默认账户',
          content: `确定要将 ${this.accounts[this.selectedAccountIndex]} 设为默认提现账户吗？`,
          success: (res) => {
            if (res.confirm) {
              uni.showLoading({ title: '处理中' });
              
              setDefaultWithdrawAccount(selectedAccount.accountId)
                .then(response => {
                  uni.hideLoading();
                  
                  if (response && response.data && response.data.code === 200) {
                    uni.showToast({
                      title: '已设为默认账户',
                      icon: 'success'
                    });
                    
                    // 重新加载账户列表
                    this.loadWalletData();
                  } else {
                    uni.showToast({
                      title: response.data?.msg || '设置失败',
                      icon: 'none'
                    });
                  }
                })
                .catch(error => {
                  uni.hideLoading();
                  console.error('设置默认账户失败:', error);
                  uni.showToast({
                    title: '设置失败，请重试',
                    icon: 'none'
                  });
                });
            }
          }
        });
      } else {
        uni.showToast({
          title: '请先选择要设为默认的账户',
          icon: 'none'
        });
      }
    },
    
    // 加载提现页总览数据、账户列表和提现记录
    loadWalletData() {
      uni.showLoading({ title: '加载中' });
      
      Promise.all([
        // 调用查询提现页总览信息接口
        getWithdrawOverview(),
        // 调用查询提现账户列表接口
        getWithdrawalAccounts(),
        // 调用查询提现记录列表接口
        getWithdrawRecordList()
      ])
      .then(([overviewRes, accountsRes, recordsRes]) => {
        uni.hideLoading();
        
        // 处理财务数据
        if (overviewRes && overviewRes.data && overviewRes.data.code === 200) {
          const overviewData = overviewRes.data.data;
          
          if (overviewData) {
            this.financialData = {
              withdrawableBalance: overviewData.withdrawableBalance || '0.00',
              todayIncome: overviewData.todayIncome || '0.00',
              pendingSettlement: overviewData.pendingSettlement || '0.00',
              pendingWithdrawal: overviewData.pendingWithdrawal || '0.00'
            };
            
            // 更新手续费率
            if (overviewData.feeRate !== undefined) {
              this.feeRate = overviewData.feeRate;
            }
          }
        } else {
          this.setDefaultFinancialData();
        }
        
        // 处理账户列表数据
        if (accountsRes && accountsRes.data && accountsRes.data.code === 200) {
          const accountsList = accountsRes.data.data;
          
          // 如果API返回了真实账户，使用真实账户替换默认账户
          if (Array.isArray(accountsList) && accountsList.length > 0) {
            // 转换账户数据为显示格式
            const formattedAccounts = [];
            const accountsData = [];
            
            accountsList.forEach(account => {
              if (account.accountName && account.accountNumber && account.accountType) {
                // 根据账户类型和信息格式化显示文本
                let displayText = '';
                if (account.accountType === 'bank') {
                  displayText = `${account.bankName || '银行'} - ${account.accountName} (${this.maskAccountNumber(account.accountNumber)})`;
                } else if (account.accountType === 'alipay') {
                  displayText = `支付宝 - ${account.accountName} (${this.maskAccountNumber(account.accountNumber)})`;
                } else if (account.accountType === 'wechat') {
                  displayText = `微信 - ${account.accountName} (${this.maskAccountNumber(account.accountNumber)})`;
                } else {
                  displayText = `${account.accountName} (${this.maskAccountNumber(account.accountNumber)})`;
                }
                
                // 如果是默认账户，添加标识
                if (account.isDefault === 1) {
                  displayText += ' [默认]';
                }
                
                formattedAccounts.push(displayText);
                accountsData.push(account);
              }
            });
            
            // 更新账户列表
            this.accounts = formattedAccounts;
            this.accountsData = accountsData;
            
            // 查找默认账户并设置为选中项
            const defaultIndex = accountsData.findIndex(acc => acc.isDefault === 1);
            if (defaultIndex !== -1) {
              this.selectedAccountIndex = defaultIndex;
            } else if (accountsData.length > 0) {
              // 如果没有默认账户，选择第一个账户
              this.selectedAccountIndex = 0;
            } else {
              // 如果没有账户，设置为-1
              this.selectedAccountIndex = -1;
            }
          } else {
            // 如果账户列表为空，保持默认支付宝账户（已在onLoad中设置）
          }
        } else {
          // 保持默认支付宝账户（已在onLoad中设置）
        }
        
        // 处理提现记录数据
        if (recordsRes && recordsRes.data) {
          // 处理不同格式的返回值 - 可能是字符串"200"或数字200
          const isSuccess = recordsRes.data.code === 200 || recordsRes.data.code === "200";
          
          // 直接使用recordsRes.data作为记录数据
          const recordsData = recordsRes.data;
          
          if (isSuccess && recordsData.rows && Array.isArray(recordsData.rows) && recordsData.rows.length > 0) {
            // 将后端返回的数据转换为前端需要的格式
            const formattedRecords = recordsData.rows.map(record => {
              // 状态映射
              const statusMap = {
                'SUCCESS': '成功',
                'PENDING': '处理中',
                'FAILED': '失败'
              };
              
              // 账户类型映射
              let accountType = '提现';
              if (record.bankName) {
                accountType = `提现到${record.bankName}`;
              } else if (record.payType === 'alipay') {
                accountType = '提现到支付宝';
              } else if (record.payType === 'wechat') {
                accountType = '提现到微信支付';
              }
              
              return {
                id: record.withdrawId || Math.random(),
                account: accountType,
                amount: this.formatAmount(record.amount || 0),
                time: record.arriveTime ? new Date(record.arriveTime).toLocaleString('zh-CN') : (record.createTime ? new Date(record.createTime).toLocaleString('zh-CN') : ''),
                status: statusMap[record.status] || record.status || '未知'
              };
            });
            
            this.recentRecords = formattedRecords.slice(0, 3); // 只显示最近3条
          }
        }
      })
      .catch(error => {
        uni.hideLoading();
        this.setDefaultFinancialData();
        // 保持默认支付宝账户（已在onLoad中设置）
        uni.showToast({
          title: '网络异常，请重试',
          icon: 'none'
        });
      });
    },
    
    // 格式化账号，显示部分隐藏
    maskAccountNumber(accountNumber) {
      if (!accountNumber || accountNumber.length <= 8) {
        return accountNumber;
      }
      const start = accountNumber.substring(0, 4);
      const end = accountNumber.substring(accountNumber.length - 4);
      return `${start}****${end}`;
    },
    
    // 删除提现账户
    deleteAccount(accountId, index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个提现账户吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '处理中' });
            
            deleteWithdrawAccount(accountId)
              .then(response => {
                uni.hideLoading();
                
                if (response && response.data && response.data.code === 200) {
                  uni.showToast({
                    title: '账户删除成功',
                    icon: 'success'
                  });
                  
                  // 重新加载账户列表
                  this.loadWalletData();
                } else {
                  uni.showToast({
                    title: response.data?.msg || '删除失败',
                    icon: 'none'
                  });
                }
              })
              .catch(error => {
                uni.hideLoading();
                console.error('删除账户失败:', error);
                uni.showToast({
                  title: '删除失败，请重试',
                  icon: 'none'
                });
              });
          }
        }
      });
    },
    
    // 设置默认账户列表
    setDefaultAccounts() {
      this.accounts = ['请添加提现账户'];
      this.accountsData = [];
      this.selectedAccountIndex = 0;
    },
    
    // 设置默认支付宝账户
    setDefaultAlipayAccount() {
      // 创建默认支付宝账户数据
      const defaultAlipayAccount = {
        accountId: 999999999, // 使用数字类型的ID
        accountType: 'alipay',
        accountName: '商家支付宝',
        accountNumber: '138****8888',
        isDefault: 1,
        bankName: null
      };
      
      // 设置账户显示列表
      this.accounts = ['支付宝 - 商家支付宝 (138****8888) [默认]'];
      this.accountsData = [defaultAlipayAccount];
      this.selectedAccountIndex = 0;
      
    },
    
    // 设置默认财务数据，确保页面正常显示
    setDefaultFinancialData() {
      this.financialData = {
        withdrawableBalance: '0.00',
        todayIncome: '0.00',
        pendingSettlement: '0.00',
        pendingWithdrawal: '0.00'
      };
      this.feeRate = 0.001;
    },
    
    // 格式化数字，添加千分位
    formatNumber(num) {
      if (typeof num !== 'number' || isNaN(num)) {
        return '0.00';
      }
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
};
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 30rpx 30rpx;
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #333;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.nav-right {
  width: 60rpx;
  display: flex;
  justify-content: flex-end;
}

.help-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
}

/* 余额信息卡片 */
.balance-card {
  background-color: #fff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.balance-label {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 16rpx;
}

.balance-amount {
  font-size: 48rpx;
  font-weight: bold;
  color: #ff4d4f;
  text-align: center;
  margin-bottom: 24rpx;
}

.balance-details {
  display: flex;
  justify-content: space-around;
  padding-top: 24rpx;
  border-top: 2rpx solid #f0f0f0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

/* 提现申请区域 */
.withdraw-section {
  background-color: #fff;
  margin: 0 20rpx 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

/* 表单组 */
.form-group {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

/* 快捷金额选择 */
.quick-amounts {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.quick-amount {
  flex: 1;
  height: 70rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #666;
}

.quick-amount:active {
  background-color: #f0f7ff;
  border-color: #4A90E2;
  color: #4A90E2;
}

/* 账户选择 */
.account-selector {
  margin-bottom: 20rpx;
}

.account-display {
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #333;
}

.account-display.disabled {
  background-color: #f5f5f5;
  border-color: #d0d0d0;
  cursor: not-allowed;
}

.no-account-text {
  color: #999;
  font-style: italic;
}

.arrow-icon {
  font-size: 20rpx;
  color: #999;
}

.account-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.set-default-btn {
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
}

.set-default-btn:active {
  background-color: #f0f0f0;
}

.delete-account-btn {
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #f44336;
  color: #f44336;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
}

.add-account {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #4A90E2;
}

.add-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30rpx;
  height: 30rpx;
  background-color: #4A90E2;
  color: #fff;
  border-radius: 50%;
  margin-right: 8rpx;
  font-size: 24rpx;
}

/* 费用计算 */
.fee-calculation {
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
}

.calculation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.calc-label {
  font-size: 26rpx;
  color: #666;
}

.calc-value {
  font-size: 26rpx;
  color: #333;
}

.calculation-divider {
  height: 2rpx;
  background-color: #e0e0e0;
  margin: 16rpx 0 20rpx;
}

.calculation-item.total {
  margin-bottom: 0;
}

.calc-label.total {
  font-weight: bold;
  color: #333;
  font-size: 28rpx;
}

.calc-value.total {
  font-weight: bold;
  color: #ff4d4f;
  font-size: 32rpx;
}

/* 确认提现按钮 */
.confirm-button {
  width: 100%;
  height: 90rpx;
  background-color: #4A90E2;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  line-height: 90rpx;
  margin: 0;
}

.confirm-button:disabled {
  background-color: #c0c0c0;
}

/* 最近提现记录 */
.withdrawal-history {
  background-color: #fff;
  margin: 0 20rpx 100rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.view-all {
  font-size: 26rpx;
  color: #4A90E2;
}

/* 提现记录列表 */
.history-list {
  
}

.history-item {
  padding: 20rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-main {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.history-account {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.history-time {
  font-size: 24rpx;
  color: #999;
}

.history-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-amount {
  font-size: 30rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.history-status {
  font-size: 24rpx;
  color: #999;
}

.history-status.status-success {
  color: #52c41a;
}
</style>