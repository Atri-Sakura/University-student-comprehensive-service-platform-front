<template>
  <view class="feedback-edit-container">
    <view v-if="!loading" class="feedback-content">
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
      <button class="submit-btn" @click="submitFeedback">保存修改</button>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import { getFeedbackDetail, updateFeedback } from '@/api/feedback.js';

export default {
  data() {
    return {
      feedbackId: '',
      feedbackForm: {
        title: '',
        detail: '',
        type: 0,
        contact: ''
      },
      feedbackTypes: [
        { label: '功能建议', value: 0 },
        { label: 'Bug反馈', value: 1 },
        { label: '投诉建议', value: 2 },
        { label: '其他', value: 3 }
      ],
      loading: false
    };
  },
  onLoad(options) {
    if (options.id) {
      this.feedbackId = options.id;
      this.loadDetail();
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  methods: {
    // 加载反馈详情
    async loadDetail() {
      try {
        this.loading = true;
        const response = await getFeedbackDetail(this.feedbackId);
        
        if (response.code === 200) {
          const data = response.data;
          this.feedbackForm = {
            title: data.feedbackTitle || data.title || '',
            detail: data.feedbackContent || data.feedbackDetail || data.detail || '',
            type: data.feedbackType !== undefined ? data.feedbackType : (data.type !== undefined ? data.type : 0),
            contact: data.feedbackContact || data.contact || ''
          };
        } else {
          uni.showToast({
            title: response.msg || '加载失败',
            icon: 'none'
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      } catch (error) {
        console.error('加载反馈详情失败:', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } finally {
        this.loading = false;
      }
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
        // 显示加载提示
        uni.showLoading({
          title: '保存中...'
        });
        
        // 调用后端API更新反馈
        const response = await updateFeedback({
          feedbackId: this.feedbackId,
          feedbackTitle: this.feedbackForm.title.trim(),
          feedbackContent: this.feedbackForm.detail.trim(),
          feedbackType: this.feedbackForm.type,
          feedbackContact: this.feedbackForm.contact.trim()
        });
        
        uni.hideLoading();
        
        // 检查响应状态
        if (response.code === 200) {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          });
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: response.msg || '修改失败，请重试',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('修改反馈失败:', error);
        uni.showToast({
          title: '修改失败，请检查网络连接',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.feedback-edit-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
}

.feedback-content {
  padding: 30rpx;
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

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
  font-size: 28rpx;
  color: #999999;
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
