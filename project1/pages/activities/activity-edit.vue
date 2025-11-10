<template>
  <view class="container">
    <view class="header">
      <view class="header-title">{{ isEdit ? '编辑活动' : '创建新活动' }}</view>
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
      <button class="save-btn" @click="saveActivity">{{ isEdit ? '保存修改' : '创建活动' }}</button>
    </view>
  </view>
</template>

<script>
import { addActivity, updateActivity, getActivityDetail } from '../../utils/merchantActivityApi.js';

export default {
  name: 'ActivityEdit',
  data() {
    return {
      isEdit: false,
      activityId: '',
      activity: {
          name: '',
          type: '满减',
          startDate: '',
          endDate: '',
          description: ''
        },
      activityTypes: ['满减', '折扣', '赠品', '积分'],
      typeIndex: 0,
      merchantBaseId: '',
      loading: false
    };
  },
  onLoad(options) {
    // 页面加载时获取活动数据
    this.merchantBaseId = getApp().globalData.merchantId || '';
    
    if (options.id) {
      this.isEdit = true;
      this.activityId = options.id;
      this.loadActivityData();
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
    loadActivityData() {
      // 加载活动详情数据
      this.loading = true;
      // 显示加载提示
      uni.showLoading({
        title: '加载中...'
      });
      
      // 调用API获取活动详情
      getActivityDetail(this.activityId)
        .then(res => {
          uni.hideLoading();
          if (res.code === 0 && res.data) {
            const detail = res.data;
            // 根据后端返回的结构映射数据
            this.activity = {
              name: detail.activityName || '',
              type: detail.activityType || '满减',
              startDate: this.formatDate(detail.startTime),
              endDate: this.formatDate(detail.endTime),
              description: detail.content || ''
            };
            // 设置活动类型索引
            this.typeIndex = this.activityTypes.indexOf(this.activity.type);
          } else {
            uni.showToast({
              title: '加载活动失败',
              icon: 'none'
            });
          }
          this.loading = false;
        })
        .catch(err => {
          uni.hideLoading();
          console.error('加载活动详情失败:', err);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
          this.loading = false;
        });
    },
    onTypeChange(e) {
      const index = e.detail.value;
      this.typeIndex = index;
      this.activity.type = this.activityTypes[index];
    },
    showStartDatePicker() {
      // 移除模态框，允许直接选择日期
      // 系统会自动弹出日期选择器
    },
    showEndDatePicker() {
      // 移除模态框，允许直接选择日期
      // 系统会自动弹出日期选择器
    },
    cancel() {
      uni.navigateBack();
    },
    saveActivity() {
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
      
      if (!this.activity.description.trim()) {
        uni.showToast({
          title: '请输入活动内容',
          icon: 'none'
        });
        return;
      }
      
      // 构建提交数据，严格按照后端API要求的字段结构
      const activityData = {
        merchantBaseId: this.merchantBaseId,
        activityName: this.activity.name,
        activityType: this.activity.type,
        content: this.activity.description,
        startTime: new Date(this.activity.startDate).getTime(),
        endTime: new Date(this.activity.endDate).getTime(),
        status: 1 // 活动始终启用，不再提供禁用选项
      };
      
      // 显示加载提示
      this.loading = true;
      uni.showLoading({
        title: this.isEdit ? '保存中...' : '创建中...'
      });
      
      // 根据编辑模式调用不同的API
      const savePromise = this.isEdit ? 
        updateActivity(activityData) : 
        addActivity(activityData);
      
      savePromise
        .then(res => {
          uni.hideLoading();
          this.loading = false;
          // 修改条件判断，适应可能的不同返回码
          if (res.code === 200 || res.code === 0 || (res && !res.code)) {
            uni.showToast({
              title: this.isEdit ? '保存成功' : '创建成功',
              icon: 'success'
            });
            // 创建成功跳转到活动页面，编辑则返回上一页
            setTimeout(() => {
              if (this.isEdit) {
                uni.navigateBack();
              } else {
                // 使用正确的路径跳转到活动列表页面
                uni.reLaunch({
                  url: '../activities/activities'
                });
              }
            }, 1000); // 缩短延时以提高响应速度
          } else {
            uni.showToast({
              title: res.data?.msg || '保存失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          console.error('保存活动失败:', err);
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

/* 活动状态默认启用，无需状态开关样式 */

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

/* 加载状态样式 */
.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  z-index: 999;
}
</style>