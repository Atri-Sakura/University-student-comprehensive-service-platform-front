<template>
  <view class="container">
    <view class="title">钱包API测试</view>
    
    <view class="test-section">
      <text class="section-title">钱包余额测试</text>
      <button @click="testGetBalance" class="test-button">获取钱包余额</button>
      <view class="result-box" v-if="balanceResult">
        <text class="result-text">{{ balanceResult }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <text class="section-title">钱包流水测试</text>
      <button @click="testGetRecords" class="test-button">获取钱包流水</button>
      <view class="result-box" v-if="recordsResult">
        <text class="result-text">{{ recordsResult }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <text class="section-title">用户登录状态</text>
      <view class="info-item">
        <text>Token: {{ token || '未登录' }}</text>
      </view>
      <view class="info-item">
        <text>用户ID: {{ userId || '未获取' }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <text class="section-title">测试日志</text>
      <view class="log-box">
        <text 
          class="log-item" 
          v-for="(log, index) in logs" 
          :key="index"
        >
          {{ log }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserWallet, getWalletBalance, getWalletRecords } from '@/api/wallet.js';

export default {
  data() {
    return {
      balanceResult: '',
      recordsResult: '',
      token: '',
      userId: '',
      logs: []
    };
  },
  
  onLoad() {
    this.checkLoginStatus();
  },
  
  methods: {
    checkLoginStatus() {
      this.token = uni.getStorageSync('token');
      this.userId = uni.getStorageSync('userId');
      
      this.addLog(`登录状态检查: Token=${this.token ? '已设置' : '未设置'}, UserId=${this.userId || '未设置'}`);
    },
    
    addLog(message) {
      const timestamp = new Date().toLocaleTimeString();
      this.logs.unshift(`[${timestamp}] ${message}`);
      
      // 只保留最近20条日志
      if (this.logs.length > 20) {
        this.logs = this.logs.slice(0, 20);
      }
    },
    
    async testGetBalance() {
      this.addLog('开始测试获取钱包余额...');
      this.balanceResult = '测试中...';
      
      try {
        const response = await getWalletBalance();
        this.addLog(`钱包余额API响应: ${JSON.stringify(response)}`);
        
        if (response && response.code === 200) {
          this.balanceResult = `成功！余额: ${response.data?.balance || 0} 元`;
          this.addLog('钱包余额获取成功');
        } else {
          this.balanceResult = `失败: ${response?.msg || '未知错误'}`;
          this.addLog(`钱包余额获取失败: ${response?.msg}`);
        }
      } catch (error) {
        this.balanceResult = `错误: ${error.message || error}`;
        this.addLog(`钱包余额API异常: ${error.message || error}`);
        console.error('钱包余额测试失败:', error);
      }
    },
    
    async testGetRecords() {
      this.addLog('开始测试获取钱包流水...');
      this.recordsResult = '测试中...';
      
      try {
        const response = await getWalletRecords({
          pageNum: 1,
          pageSize: 5
        });
        this.addLog(`钱包流水API响应: ${JSON.stringify(response)}`);
        
        if (response && response.code === 200) {
          const records = response.data || [];
          this.recordsResult = `成功！获取到 ${records.length} 条记录`;
          this.addLog(`钱包流水获取成功，共${records.length}条记录`);
          
          // 显示前3条记录的详情
          if (records.length > 0) {
            records.slice(0, 3).forEach((record, index) => {
              this.addLog(`记录${index + 1}: 金额=${record.amount}, 类型=${record.flowType}, 时间=${record.createTime}`);
            });
          }
        } else {
          this.recordsResult = `失败: ${response?.msg || '未知错误'}`;
          this.addLog(`钱包流水获取失败: ${response?.msg}`);
        }
      } catch (error) {
        this.recordsResult = `错误: ${error.message || error}`;
        this.addLog(`钱包流水API异常: ${error.message || error}`);
        console.error('钱包流水测试失败:', error);
      }
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
  color: #333;
}

.test-section {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #4A90E2;
  margin-bottom: 20rpx;
  display: block;
}

.test-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  color: white;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.test-button:active {
  opacity: 0.8;
}

.result-box {
  background-color: #f8f9fa;
  padding: 20rpx;
  border-radius: 8rpx;
  border-left: 4rpx solid #4A90E2;
}

.result-text {
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
}

.info-item {
  margin-bottom: 15rpx;
  padding: 15rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
}

.info-item text {
  font-size: 28rpx;
  color: #666;
}

.log-box {
  max-height: 400rpx;
  overflow-y: auto;
  background-color: #f8f9fa;
  padding: 20rpx;
  border-radius: 8rpx;
}

.log-item {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 10rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #eee;
  font-family: monospace;
  word-break: break-all;
}

.log-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
</style>
