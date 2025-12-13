<template>
  <view class="container">
    <view class="title">大整数精度修复测试</view>
    
    <view class="status-bar">
      <text class="status-text">测试状态: {{ testStatus }}</text>
    </view>
    
    <view class="test-section">
      <text class="section-title">📊 大整数ID检测</text>
      <view class="test-item">
        <text>原始ID: {{ testId }}</text>
      </view>
      <view class="test-item">
        <text>是否为大整数: {{ isBigInt ? '是 ✓' : '否 ❌' }}</text>
      </view>
      <view class="test-item">
        <text>安全字符串ID: {{ safeStringId }}</text>
      </view>
      <view class="test-item">
        <text>MAX_SAFE_INTEGER: {{ Number.MAX_SAFE_INTEGER }}</text>
      </view>
    </view>
    
    <view class="test-section">
      <text class="section-title">🔄 API数据处理测试</text>
      <view class="test-item">
        <text>原始数据:</text>
        <text class="code">{{ JSON.stringify(originalData, null, 2) }}</text>
      </view>
      <view class="test-item">
        <text>处理后数据:</text>
        <text class="code">{{ JSON.stringify(processedData, null, 2) }}</text>
      </view>
    </view>
    
    <view class="test-section" v-if="apiTestResult">
      <text class="section-title">📡 实际API响应</text>
      <view class="test-item">
        <text class="code">{{ JSON.stringify(apiTestResult, null, 2) }}</text>
      </view>
      <view class="test-item" v-if="apiTestResult.userBaseId">
        <text class="highlight">userBaseId类型: {{ typeof apiTestResult.userBaseId }}</text>
      </view>
    </view>
    
    <button @click="runTests" class="test-button">运行工具测试</button>
    <button @click="testApiCall" class="test-button secondary">测试实际API</button>
    
    <view class="tips">
      <text class="tips-title">💡 测试说明</text>
      <text class="tips-item">1. 点击"运行工具测试"检查ID处理工具</text>
      <text class="tips-item">2. 点击"测试实际API"验证真实API调用</text>
      <text class="tips-item">3. 查看控制台输出了解详细信息</text>
      <text class="tips-item">4. userBaseId应该是字符串类型</text>
    </view>
  </view>
</template>

<script>
import { 
  isBigInteger, 
  safeStringifyId, 
  processApiResponseIds, 
  logBigIntegerIssue 
} from '@/utils/id-utils.js';

export default {
  data() {
    return {
      testId: 779255766249898000,
      isBigInt: false,
      safeStringId: '',
      originalData: {
        userAddressId: 779255766249898000,
        userBaseId: 123456789012345678,
        name: '测试地址'
      },
      processedData: {},
      apiTestResult: null,
      testStatus: '未开始'
    };
  },
  
  onLoad() {
    this.runTests();
  },
  
  methods: {
    runTests() {
      console.log('=== 开始ID处理工具测试 ===');
      this.testStatus = '测试中...';
      
      // 测试1：大整数检查
      this.isBigInt = isBigInteger(this.testId);
      console.log('✓ 大整数检查结果:', this.isBigInt);
      
      // 测试2：安全字符串转换
      this.safeStringId = safeStringifyId(this.testId);
      console.log('✓ 安全字符串转换结果:', this.safeStringId);
      
      // 测试3：API数据处理
      this.processedData = processApiResponseIds(this.originalData);
      console.log('✓ API数据处理结果:', this.processedData);
      
      // 测试4：验证精度
      const originalId = '1234567890123456789';
      const numberParsed = Number(originalId);
      const stringified = String(numberParsed);
      
      console.group('🔍 精度验证测试');
      console.log('原始ID（字符串）:', originalId);
      console.log('转为Number后:', numberParsed);
      console.log('再转回字符串:', stringified);
      console.log('精度是否丢失:', originalId !== stringified ? '是 ❌' : '否 ✓');
      console.log('MAX_SAFE_INTEGER:', Number.MAX_SAFE_INTEGER);
      console.groupEnd();
      
      // 记录大整数问题
      logBigIntegerIssue('测试场景', this.testId);
      
      this.testStatus = '测试完成 ✓';
      console.log('=== ID处理工具测试完成 ===');
      
      // 显示提示
      uni.showToast({
        title: '工具测试完成',
        icon: 'success',
        duration: 2000
      });
    },
    
    async testApiCall() {
      console.log('=== 开始API调用测试 ===');
      this.testStatus = 'API测试中...';
      
      try {
        // 导入http模块
        const http = require('@/api/request.js').default;
        
        // 测试获取用户信息（如果有的话）
        const result = await http.get('/user/info').catch(err => {
          console.log('API调用失败（可能未登录）:', err);
          return null;
        });
        
        if (result && result.data) {
          console.group('📡 API响应数据检查');
          console.log('完整响应:', result);
          
          if (result.data.userBaseId) {
            console.log('userBaseId值:', result.data.userBaseId);
            console.log('userBaseId类型:', typeof result.data.userBaseId);
            console.log('是否为字符串:', typeof result.data.userBaseId === 'string' ? '是 ✓' : '否 ❌');
          }
          
          console.groupEnd();
          
          this.apiTestResult = result.data;
          this.testStatus = 'API测试完成 ✓';
          
          uni.showToast({
            title: 'API测试成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          this.testStatus = 'API测试失败（未登录或无权限）';
          uni.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('API测试出错:', error);
        this.testStatus = 'API测试出错';
        uni.showToast({
          title: 'API测试失败',
          icon: 'error',
          duration: 2000
        });
      }
      
      console.log('=== API调用测试完成 ===');
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

.test-item {
  margin-bottom: 20rpx;
  padding: 15rpx;
  background-color: #f8f9fa;
  border-radius: 8rpx;
}

.test-item text {
  font-size: 28rpx;
  color: #333;
  display: block;
  word-break: break-all;
}

.code {
  font-family: monospace;
  background-color: #e9ecef;
  padding: 10rpx;
  border-radius: 4rpx;
  font-size: 24rpx !important;
  color: #495057 !important;
  white-space: pre-wrap;
}

.status-bar {
  background-color: white;
  border-radius: 16rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.status-text {
  font-size: 28rpx;
  color: #4A90E2;
  font-weight: bold;
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
  margin-top: 30rpx;
}

.test-button.secondary {
  background: linear-gradient(to right, #28a745, #48c765);
}

.test-button:active {
  opacity: 0.8;
}

.highlight {
  color: #28a745 !important;
  font-weight: bold !important;
}

.tips {
  background-color: #fff3cd;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 40rpx;
  border-left: 6rpx solid #ffc107;
}

.tips-title {
  display: block;
  font-size: 30rpx;
  font-weight: bold;
  color: #856404;
  margin-bottom: 20rpx;
}

.tips-item {
  display: block;
  font-size: 26rpx;
  color: #856404;
  margin-bottom: 10rpx;
  padding-left: 20rpx;
}
</style>
