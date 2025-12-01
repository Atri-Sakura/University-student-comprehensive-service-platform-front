<template>
  <view class="feedback-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="navbar-title">意见反馈</text>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 页面内容 -->
    <view class="feedback-content">
      <!-- 反馈标题 -->
      <view class="form-item">
        <text class="form-label">反馈标题</text>
        <input 
          class="form-input" 
          type="text" 
          placeholder="请简要描述您的反馈内容" 
          v-model="feedbackForm.title"
        />
      </view>

      <!-- 反馈详情 -->
      <view class="form-item">
        <text class="form-label">反馈详情</text>
        <textarea 
          class="form-textarea" 
          placeholder="请详细描述您遇到的问题或提出的建议，我们会尽快处理并回复..." 
          v-model="feedbackForm.detail"
          auto-height
        ></textarea>
      </view>

      <!-- 反馈类型 -->
      <view class="form-item">
        <text class="form-label">反馈类型</text>
        <view class="radio-group">
          <view class="radio-label" v-for="(type, index) in feedbackTypes" :key="index">
            <view class="radio-wrapper" @click="selectType(type.value)">
              <view class="radio" :class="{ active: feedbackForm.type === type.value }">
                <view v-if="feedbackForm.type === type.value" class="radio-inner"></view>
              </view>
              <text class="radio-text">{{ type.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="form-item">
        <text class="form-label">联系方式 <text class="optional">(选填)</text></text>
        <input 
          class="form-input" 
          type="text" 
          placeholder="请输入您的手机号或邮箱，方便我们联系您" 
          v-model="feedbackForm.contact"
        />
        <text class="privacy-note">我们会保护您的个人信息，仅用于反馈处理</text>
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" @click="submitFeedback">提交反馈</button>
    </view>
  </view>
</template>

<script>
import api from '../../utils/api/index.js'

export default {
  data() {
    return {
      feedbackForm: {
        title: '',
        detail: '',
        type: 'suggestion',
        contact: ''
      },
      feedbackTypes: [
        { label: '功能建议', value: 'suggestion', typeId: 1 },
        { label: 'bug反馈', value: 'bug', typeId: 2 },
        { label: '投诉建议', value: 'complaint', typeId: 3 },
        { label: '其他', value: 'other', typeId: 4 }
      ]
    };
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 选择反馈类型
    selectType(type) {
      this.feedbackForm.type = type;
    },
    
    // 提交反馈
    async submitFeedback() {
      // 表单验证
      if (!this.feedbackForm.title.trim()) {
        uni.showToast({
          title: '请输入反馈标题',
          icon: 'none'
        });
        return;
      }
      
      if (!this.feedbackForm.detail.trim()) {
        uni.showToast({
          title: '请输入反馈详情',
          icon: 'none'
        });
        return;
      }
      
      try {
        // 显示提交中提示
        uni.showLoading({
          title: '提交中...'
        });
        
        // 转换反馈类型为整数
        const typeItem = this.feedbackTypes.find(item => item.value === this.feedbackForm.type);
        const feedbackType = typeItem ? typeItem.typeId : 4;
        
        // 转换字段名以匹配后端数据库
        const feedbackData = {
          feedbackTitle: this.feedbackForm.title,
          feedbackContent: this.feedbackForm.detail,
          feedbackType: feedbackType,
          contact: this.feedbackForm.contact
        };
        
        // 调用API提交反馈
        const result = await api.addFeedback(feedbackData);
        
        // 隐藏加载提示
        uni.hideLoading();
        
        // 显示提交成功提示
        uni.showToast({
          title: '反馈提交成功',
          icon: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } catch (error) {
        // 隐藏加载提示
        uni.hideLoading();
        
        // 显示错误提示
        uni.showToast({
          title: error?.data?.msg || '反馈提交失败，请稍后重试',
          icon: 'none'
        });
        
        // 打印错误信息
        console.error('提交反馈失败:', error);
      }
    }
  },
  onLoad() {
    // 设置导航栏左侧按钮
    uni.setNavigationBarTitle({
      title: '意见反馈'
    });
  }
};
</script>

<style scoped>
.feedback-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
}

/* 自定义导航栏 */
.custom-navbar {
  width: 100%;
  height: 88rpx;
  background-color: #5DCDFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-sizing: border-box;
  position: relative;
  z-index: 100;
}

.navbar-left {
  width: 60rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: bold;
}

.navbar-title {
  font-size: 36rpx;
  color: #FFFFFF;
  font-weight: 500;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.navbar-right {
  width: 60rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.feedback-content {
  padding: 30rpx;
  padding-top: 50rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.optional {
  font-size: 28rpx;
  color: #999999;
  font-weight: normal;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background-color: white;
  border-radius: 10rpx;
  padding: 0 30rpx;
  box-sizing: border-box;
  font-size: 30rpx;
  color: #333333;
}

.form-textarea {
  width: 100%;
  min-height: 240rpx;
  background-color: white;
  border-radius: 10rpx;
  padding: 30rpx;
  box-sizing: border-box;
  font-size: 30rpx;
  color: #333333;
  line-height: 1.5;
}

.radio-group {
  background-color: white;
  border-radius: 10rpx;
  padding: 10rpx 0;
}

.radio-label {
  display: block;
}

.radio-wrapper {
  display: flex;
  align-items: center;
  padding: 25rpx 30rpx;
}

.radio {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #CCCCCC;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.radio.active {
  border-color: #5DCDFF;
}

.radio-inner {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: #5DCDFF;
}

.radio-text {
  font-size: 30rpx;
  color: #333333;
}

.privacy-note {
  display: block;
  font-size: 26rpx;
  color: #999999;
  margin-top: 15rpx;
  padding: 0 10rpx;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  background-color: #5DCDFF;
  color: white;
  font-size: 32rpx;
  border: none;
  border-radius: 10rpx;
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 去除默认样式 */
input::-webkit-input-placeholder, textarea::-webkit-input-placeholder {
  color: #999999;
  font-size: 30rpx;
}

input:-moz-placeholder, textarea:-moz-placeholder {
  color: #999999;
  font-size: 30rpx;
}

input::-moz-placeholder, textarea::-moz-placeholder {
  color: #999999;
  font-size: 30rpx;
}

input:-ms-input-placeholder, textarea:-ms-input-placeholder {
  color: #999999;
  font-size: 30rpx;
}
</style>