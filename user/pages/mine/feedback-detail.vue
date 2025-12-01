<template>
  <view class="feedback-detail-container">
    <view v-if="!loading && normalizedDetail" class="detail-content">
      <!-- 反馈信息 -->
      <view class="info-section">
        <view class="section-title">反馈信息</view>
        <view class="info-item">
          <text class="info-label">反馈标题</text>
          <text class="info-value">{{ normalizedDetail.title }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">反馈类型</text>
          <text class="info-value">{{ getTypeText(normalizedDetail.type) }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">反馈状态</text>
          <view class="status-badge" :class="getStatusClass(normalizedDetail.status)">
            {{ getStatusText(normalizedDetail.status) }}
          </view>
        </view>
        <view class="info-item">
          <text class="info-label">提交时间</text>
          <text class="info-value">{{ formatTime(normalizedDetail.createTime) }}</text>
        </view>
        <view class="info-item" v-if="normalizedDetail.contact">
          <text class="info-label">联系方式</text>
          <text class="info-value">{{ normalizedDetail.contact }}</text>
        </view>
      </view>

      <!-- 反馈详情 -->
      <view class="detail-section">
        <view class="section-title">反馈详情</view>
        <view class="detail-text">{{ normalizedDetail.detail }}</view>
      </view>

      <!-- 处理回复 -->
      <view class="reply-section" v-if="normalizedDetail.reply">
        <view class="section-title">处理回复</view>
        <view class="reply-content">
          <view class="reply-text">{{ normalizedDetail.reply }}</view>
          <view class="reply-time" v-if="normalizedDetail.replyTime">
            回复时间：{{ formatTime(normalizedDetail.replyTime) }}
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-btn edit-btn" @click="editFeedback">
          <text>编辑反馈</text>
        </view>
        <view class="action-btn delete-btn" @click="deleteFeedback">
          <text>删除反馈</text>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <!-- 加载失败 -->
    <view v-if="!loading && !feedbackDetail" class="error-state">
      <text class="error-text">加载失败</text>
      <view class="retry-btn" @click="loadDetail">
        <text>重新加载</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getFeedbackDetail, deleteFeedback } from '@/api/feedback.js';

export default {
  data() {
    return {
      feedbackId: '',
      feedbackDetail: null,
      loading: false
    };
  },
  computed: {
    // 标准化字段访问，兼容不同的字段命名
    normalizedDetail() {
      if (!this.feedbackDetail) return null;
      return {
        title: this.feedbackDetail.feedbackTitle || this.feedbackDetail.title,
        detail: this.feedbackDetail.feedbackContent || this.feedbackDetail.feedbackDetail || this.feedbackDetail.detail,
        type: this.feedbackDetail.feedbackType || this.feedbackDetail.type,
        status: this.feedbackDetail.status,
        contact: this.feedbackDetail.feedbackContact || this.feedbackDetail.contact,
        reply: this.feedbackDetail.feedbackReply || this.feedbackDetail.reply,
        createTime: this.feedbackDetail.createTime,
        replyTime: this.feedbackDetail.replyTime
      };
    }
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
          this.feedbackDetail = response.data;
        } else {
          uni.showToast({
            title: response.msg || '加载失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载反馈详情失败:', error);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 编辑反馈
    editFeedback() {
      uni.navigateTo({
        url: `/pages/mine/feedback-edit?id=${this.feedbackId}`
      });
    },
    
    // 删除反馈
    deleteFeedback() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条反馈吗？删除后无法恢复。',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: '删除中...'
              });
              
              const response = await deleteFeedback(this.feedbackId);
              
              uni.hideLoading();
              
              if (response.code === 200) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                
                // 返回列表页
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
              } else {
                uni.showToast({
                  title: response.msg || '删除失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              uni.hideLoading();
              console.error('删除反馈失败:', error);
              uni.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    // 获取状态CSS类名
    getStatusClass(status) {
      const statusClassMap = {
        0: 'status-pending',
        1: 'status-processing',
        2: 'status-completed',
        3: 'status-rejected'
      };
      
      if (typeof status === 'number') {
        return statusClassMap[status] || '';
      }
      return 'status-' + status;
    },
    
    // 获取状态文本
    getStatusText(status) {
      // 数字状态映射
      const statusTextMap = {
        0: '待处理',
        1: '处理中',
        2: '已完成',
        3: '已拒绝'
      };
      
      if (typeof status === 'number') {
        return statusTextMap[status] || '未知';
      }
      // 兼容字符串格式
      const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'completed': '已完成',
        'rejected': '已拒绝'
      };
      return statusMap[status] || '未知';
    },
    
    // 获取类型文本
    getTypeText(type) {
      // 数字类型映射
      const typeNumberMap = {
        0: '功能建议',
        1: 'Bug反馈',
        2: '投诉建议',
        3: '其他'
      };
      
      if (typeof type === 'number') {
        return typeNumberMap[type] || '其他';
      }
      
      // 兼容字符串格式
      const typeMap = {
        'suggestion': '功能建议',
        'bug': 'Bug反馈',
        'complaint': '投诉建议',
        'other': '其他'
      };
      return typeMap[type] || '其他';
    },
    
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day} ${hour}:${minute}`;
    }
  }
};
</script>

<style scoped>
.feedback-detail-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
}

.detail-content {
  padding: 30rpx;
}

.info-section,
.detail-section,
.reply-section {
  background-color: white;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #EEEEEE;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 25rpx;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666666;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.status-badge {
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.status-pending {
  background-color: #FFF3E0;
  color: #FF9800;
}

.status-processing {
  background-color: #E3F2FD;
  color: #2196F3;
}

.status-completed {
  background-color: #E8F5E9;
  color: #4CAF50;
}

.status-rejected {
  background-color: #FFEBEE;
  color: #F44336;
}

.detail-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.8;
  white-space: pre-wrap;
}

.reply-content {
  background-color: #F8F9FA;
  border-radius: 10rpx;
  padding: 25rpx;
}

.reply-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.8;
  margin-bottom: 15rpx;
}

.reply-time {
  font-size: 24rpx;
  color: #999999;
  text-align: right;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  font-size: 30rpx;
}

.edit-btn {
  background-color: #5DCDFF;
  color: white;
}

.delete-btn {
  background-color: white;
  color: #F44336;
  border: 1rpx solid #F44336;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-state text,
.error-text {
  font-size: 28rpx;
  color: #999999;
}

.retry-btn {
  margin-top: 40rpx;
  padding: 15rpx 40rpx;
  background-color: #5DCDFF;
  color: white;
  border-radius: 30rpx;
  font-size: 28rpx;
}
</style>
