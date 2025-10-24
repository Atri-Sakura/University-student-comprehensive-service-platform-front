<template>
  <view class="container">
    <view class="header">
      <view class="header-title">{{ isEdit ? '编辑活动' : '创建新活动' }}</view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <!-- 基本信息 -->
      <view class="section">
        <view class="section-title">基本信息</view>
        
        <view class="form-item">
          <view class="form-label">活动名称</view>
          <!-- 简化为最基础的输入框实现 -->
          <input 
            v-model="activity.name" 
            placeholder="请输入活动名称" 
            type="text" 
            class="simple-input"
          />
        </view>
        
        <view class="form-item">
          <view class="form-label">活动类型</view>
          <picker class="form-picker" @change="onTypeChange" :value="typeIndex" :range="activityTypes">
            <view class="picker-text">{{ activityTypes[typeIndex] }}</view>
          </picker>
        </view>
        
        <view class="form-item">
          <view class="form-label">活动时间</view>
          <view class="date-container">
            <input 
              class="date-input" 
              v-model="activity.startDate" 
              type="date" 
              placeholder="开始日期"
              @tap="showStartDatePicker"
            />
            <text class="date-separator">至</text>
            <input 
              class="date-input" 
              v-model="activity.endDate" 
              type="date" 
              placeholder="结束日期"
              @tap="showEndDatePicker"
            />
          </view>
        </view>
        
        <view class="form-item">
          <view class="form-label">活动描述</view>
          <textarea 
            class="form-textarea" 
            v-model="activity.description" 
            placeholder="请输入活动描述"
            rows="3"
          ></textarea>
        </view>
      </view>
      
      <!-- 活动规则 -->
      <view class="section">
        <view class="section-title">活动规则</view>
        
        <view class="rules-container">
          <view class="rule-item" v-for="(rule, index) in activity.rules" :key="index">
            <input 
              class="rule-input condition" 
              v-model="rule.condition" 
              placeholder="条件" 
            />
            <input 
              class="rule-input result" 
              v-model="rule.result" 
              placeholder="结果" 
            />
          </view>
          
          <view class="add-rule-btn" @click="addRule">添加规则</view>
        </view>
      </view>
      
      <!-- 适用商品 -->
      <view class="section">
        <view class="section-title">适用商品</view>
        
        <view class="switch-item">
          <view class="switch-label">全店商品参与</view>
<switch class="form-switch" :checked="activity.allProducts" @change="activity.allProducts = $event.detail.value" />
        </view>
        
        <view class="form-item" v-if="!activity.allProducts">
          <view class="form-label">选择商品（可选）</view>
          <view class="products-container">
            <view class="product-item" v-for="(product, index) in products" :key="index">
              <text class="product-name">{{ product.name }}</text>
              <text class="product-price">¥{{ product.price.toFixed(2) }}</text>
            </view>
            <view class="add-product-btn" @click="selectProducts">选择商品</view>
          </view>
        </view>
      </view>
      
      <!-- 高级设置 -->
      <view class="section">
        <view class="section-title">高级设置</view>
        
        <view class="switch-item">
          <view class="switch-label">启用活动</view>
<switch class="form-switch" :checked="activity.enabled" @change="activity.enabled = $event.detail.value" />
        </view>
        
        <view class="form-item">
          <view class="form-label">每人限参与次数</view>
          <!-- 简化为最基础的输入框实现 -->
          <input 
            v-model.number="activity.maxParticipations" 
            type="number" 
            placeholder="请输入次数" 
            class="simple-input"
          />
        </view>
        
        <view class="form-item">
          <view class="form-label">活动预算（元）</view>
          <!-- 简化为最基础的输入框实现 -->
          <input 
            v-model.number="activity.budget" 
            type="number" 
            placeholder="请输入预算金额" 
            class="simple-input"
          />
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作按钮 -->
    <view class="footer">
      <button class="cancel-btn" @click="cancel">取消</button>
      <button class="save-btn" @click="saveActivity">{{ isEdit ? '保存修改' : '创建活动' }}</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ActivityEdit',
  data() {
    return {
      isEdit: false,
      activity: {
        name: '',
        type: 'new_user',
        startDate: '',
        endDate: '',
        description: '',
        rules: [
          { condition: '', result: '' }
        ],
        allProducts: true,
        selectedProducts: [],
        enabled: true,
        maxParticipations: 1,
        budget: 5000
      },
      activityTypes: ['新客立减', '满减优惠', '折扣商品', '买一送一'],
      typeIndex: 0,
      products: [
        { id: 1, name: '招牌汉堡', price: 35.00 },
        { id: 2, name: '薯条(大份)', price: 15.00 },
        { id: 3, name: '可乐(大杯)', price: 18.50 },
        { id: 4, name: '意式披萨', price: 45.00 }
      ]
    }
  },
  onLoad(options) {
    if (options.id) {
      this.isEdit = true;
      // 这里可以根据ID加载活动数据
      this.loadActivityData(options.id);
    } else {
      // 设置默认日期为今天和一个月后
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);
      
      this.activity.startDate = this.formatDate(today);
      this.activity.endDate = this.formatDate(nextMonth);
    }
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    loadActivityData(id) {
      // 模拟加载活动数据
      // 实际项目中应该从API获取
      this.activity = {
        name: '新客立减活动',
        type: 'new_user',
        startDate: '2023-11-01',
        endDate: '2023-11-30',
        description: '新用户首次下单立减15元',
        rules: [
          { condition: '新用户', result: '立减15元' }
        ],
        allProducts: true,
        selectedProducts: [],
        enabled: true,
        maxParticipations: 1,
        budget: 5000
      };
      
      // 设置类型索引
      const typeMap = {
        'new_user': 0,
        'discount': 1,
        'sale': 2,
        'buy_one_get_one': 3
      };
      this.typeIndex = typeMap[this.activity.type] || 0;
    },
    onTypeChange(e) {
      this.typeIndex = e.target.value;
      const typeMap = ['new_user', 'discount', 'sale', 'buy_one_get_one'];
      this.activity.type = typeMap[this.typeIndex];
    },
    showStartDatePicker() {
      const date = this.activity.startDate ? new Date(this.activity.startDate) : new Date();
      // 这里可以使用uni-app的日期选择器
    },
    showEndDatePicker() {
      const date = this.activity.endDate ? new Date(this.activity.endDate) : new Date();
      // 这里可以使用uni-app的日期选择器
    },
    addRule() {
      this.activity.rules.push({ condition: '', result: '' });
    },
    selectProducts() {
      uni.showToast({
        title: '商品选择功能开发中',
        icon: 'none'
      });
    },
    cancel() {
      uni.navigateBack();
    },
    saveActivity() {
      // 表单验证
      if (!this.activity.name) {
        uni.showToast({
          title: '请输入活动名称',
          icon: 'none'
        });
        return;
      }
      
      if (!this.activity.startDate || !this.activity.endDate) {
        uni.showToast({
          title: '请选择活动时间',
          icon: 'none'
        });
        return;
      }
      
      // 保存活动
      console.log('保存活动数据:', this.activity);
      
      uni.showToast({
        title: this.isEdit ? '修改成功' : '创建成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            uni.navigateBack();
          }, 2000);
        }
      });
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 40rpx 30rpx;
  text-align: center;
  position: relative;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.content {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  width: 100%;
  max-width: 650rpx;
}

/* 调整内容区域的内边距，避免边缘溢出 */


.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.form-input,
.form-textarea {
  width: 100%;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #333333;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #A8D8EA;
}

/* 为问题输入框创建全新的简单样式，避免任何可能的冲突 */
.simple-input {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #333333;
}

/* 直接针对input元素设置样式，不使用深度选择器 */
input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
}

/* 确保所有输入框都可以正常交互 */
input[type="text"],
input[type="number"] {
  pointer-events: auto;
  user-select: text;
  -webkit-user-select: text;
  background-color: #ffffff;
}

.form-textarea {
  min-height: 150rpx;
  resize: none;
}

.form-picker {
  width: 90%;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  position: relative;
}

.form-picker::after {
  content: '▼';
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 20rpx;
}

.picker-text {
  color: #333;
}

.date-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.date-input {
  flex: 1;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.date-separator {
  font-size: 28rpx;
  color: #666;
}

.rules-container {
  margin-top: 16rpx;
}

.rule-item {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.rule-input {
  flex: 1;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.add-rule-btn {
  text-align: center;
  color: #2196F3;
  font-size: 28rpx;
  padding: 20rpx;
  border: 2rpx dashed #2196F3;
  border-radius: 8rpx;
  margin-top: 16rpx;
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.switch-label {
  font-size: 28rpx;
  color: #333;
}

.form-switch {
  transform: scale(0.8);
}

.products-container {
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.product-item:last-child {
  border-bottom: none;
}

.product-name {
  font-size: 28rpx;
  color: #333;
}

.product-price {
  font-size: 28rpx;
  color: #FF5722;
  font-weight: 500;
}

.add-product-btn {
  text-align: center;
  color: #2196F3;
  font-size: 28rpx;
  padding: 16rpx;
  margin-top: 16rpx;
  border: 2rpx dashed #2196F3;
  border-radius: 8rpx;
}

.footer {
  background: white;
  padding: 24rpx 30rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: 500;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
  border: 2rpx solid #e0e0e0;
}

.save-btn {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  color: #333;
  border: none;
}
</style>