<template>
  <view class="container">
    <view class="header">
      <view class="header-title">创建活动</view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <!-- 活动基本信息 -->
      <view class="section">
        <view class="section-title">活动信息</view>
        
        <view class="form-item">
          <view class="form-label">活动名称 <text class="required">*</text></view>
          <input 
            v-model="activity.name" 
            placeholder="请输入活动名称" 
            type="text" 
            class="simple-input"
          />
        </view>
        
        <view class="form-item">
          <view class="form-label">活动类型 <text class="required">*</text></view>
          <picker class="form-picker" @change="onTypeChange" :value="typeIndex" :range="activityTypes">
            <view class="picker-text">{{ activityTypes[typeIndex] }}</view>
          </picker>
        </view>
        
        <view class="form-item">
          <view class="form-label">活动时间 <text class="required">*</text></view>
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
          <view class="form-label">活动内容 <text class="required">*</text></view>
          <textarea 
            class="form-textarea" 
            v-model="activity.description" 
            placeholder="请输入活动内容描述"
            rows="4"
          ></textarea>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作按钮 -->
    <view class="footer">
      <button class="cancel-btn" @click="cancel">取消</button>
      <button class="save-btn" @click="createActivity">创建活动</button>
    </view>
  </view>
</template>

<script>
import { addMerchantActivity } from '../../utils/merchantActivityApi.js';

export default {
  name: 'ActivityEdit',
  data() {
    return {
      activity: {
        name: '',
        type: '满减',
        startDate: '',
        endDate: '',
        description: '',
        enabled: true
      },
      activityTypes: ['满减', '折扣', '赠品', '积分'],
      typeIndex: 0,
      merchantBaseId: '',
      loading: false
    };
  },
  onLoad() {
    // 初始化商家基础ID（实际应该从登录信息或全局状态中获取）
    this.merchantBaseId = getApp().globalData.merchantId || '3';
    
    // 设置默认日期（今天到7天后）
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    this.activity.startDate = this.formatDate(today);
    this.activity.endDate = this.formatDate(nextWeek);
  },
  methods: {
    /**
     * 格式化日期为YYYY-MM-DD格式
     */
    formatDate(date) {
      if (!date) return '';
      
      try {
        let d;
        if (typeof date === 'number') {
          d = new Date(date);
        } else if (typeof date === 'string') {
          if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }
          d = new Date(date);
        } else if (date instanceof Date) {
          d = date;
        } else {
          return '';
        }
        
        if (isNaN(d.getTime())) {
          console.warn('无效的日期:', date);
          return '';
        }
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('日期格式化错误:', error);
        return '';
      }
    },
    
    /**
     * 处理活动类型选择变更
     */
    onTypeChange(e) {
      const index = e.detail.value;
      this.typeIndex = index;
      this.activity.type = this.activityTypes[index];
    },
    
    /**
     * 显示开始日期选择器
     */
    showStartDatePicker() {
      // 系统会自动弹出日期选择器
    },
    
    /**
     * 显示结束日期选择器
     */
    showEndDatePicker() {
      // 系统会自动弹出日期选择器
    },
    
    /**
     * 取消创建，返回上一页
     */
    cancel() {
      uni.navigateBack();
    },
    
    /**
     * 创建活动
     */
    createActivity() {
      // 表单验证
      if (!this.activity.name.trim()) {
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
      
      // 验证日期有效性
      const startDate = new Date(this.activity.startDate);
      const endDate = new Date(this.activity.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        uni.showToast({
          title: '请选择有效的活动时间',
          icon: 'none'
        });
        return;
      }
      
      // 验证结束日期不早于开始日期
      if (endDate < startDate) {
        uni.showToast({
          title: '结束日期不能早于开始日期',
          icon: 'none'
        });
        return;
      }
      
      if (!this.activity.description.trim()) {
        uni.showToast({
          title: '请输入活动内容',
          icon: 'none'
        });
        return;
      }
      
      // 构建提交数据
      const activityData = {
        merchantBaseId: this.merchantBaseId,
        activityName: this.activity.name,
        activityType: this.activity.type,
        content: this.activity.description,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        status: this.activity.enabled ? 1 : 0
      };
      
      console.log('创建活动数据:', activityData);
      
      // 显示加载提示
      this.loading = true;
      uni.showLoading({
        title: '创建中...'
      });
      
      // 调用创建活动API
      addMerchantActivity(activityData)
        .then(res => {
          uni.hideLoading();
          this.loading = false;
          
          console.log('创建活动接口返回结果:', JSON.stringify(res));
          
          // 检查多种可能的成功响应格式
          let isSuccess = false;
          let errorMsg = '创建失败';
          
          if (res && (res.code === 200 || res.code === 0)) {
            isSuccess = true;
          } else if (res && res.data && (res.data.code === 200 || res.data.code === 0)) {
            isSuccess = true;
          } else if (res && !res.code && !res.data?.code) {
            isSuccess = true;
          } else {
            errorMsg = res.data?.msg || res.msg || '创建失败';
          }
          
          if (isSuccess) {
            uni.showToast({
              title: '创建成功',
              icon: 'success'
            });
            // 创建成功后返回活动列表页
            setTimeout(() => {
              uni.navigateBack();
            }, 1000);
          } else {
            console.error('创建活动失败:', errorMsg);
            uni.showToast({
              title: errorMsg,
              icon: 'none'
            });
          }
        })
        .catch(err => {
          console.error('创建活动失败:', err);
          uni.hideLoading();
          this.loading = false;
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
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
  background-color: #f8f8f8;
}

.content {
  width: 100%;
  max-width: 700rpx;
  padding-bottom: 120rpx;
}

.section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  width: 100%;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  border-left: 6rpx solid #07c160;
  padding-left: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-label .required {
  color: #ff4757;
  margin-left: 5rpx;
}

/* 输入框样式 */
.simple-input,
.form-input,
.date-input {
  width: 90%;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #333333;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
}

.simple-input:focus,
.form-input:focus,
.date-input:focus {
  border-color: #07c160;
}

/* 文本域样式 */
.form-textarea {
  width: 90%;
  min-height: 200rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #333333;
  resize: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
  line-height: 1.6;
}

.form-textarea:focus {
  border-color: #07c160;
}

/* 选择器样式 */
.form-picker {
  width: 90%;
  height: 88rpx;
  line-height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #ffffff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-picker::after {
  content: '▼';
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 20rpx;
}

.picker-text {
  color: #333;
}

/* 日期选择区域样式 */
.date-container {
  display: flex;
  align-items: center;
  width: 90%;
}

.date-input {
  flex: 1;
  margin: 0;
}

.date-separator {
  font-size: 28rpx;
  color: #666;
  white-space: nowrap;
  padding: 0 16rpx;
}

/* 底部按钮样式 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 24rpx 30rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  flex: 1;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #666;
  font-size: 34rpx;
  border-radius: 10rpx;
  border: none;
}

.save-btn {
  flex: 1;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #07c160;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 10rpx;
  border: none;
}

.save-btn:active {
  background-color: #06ad56;
}
</style>
