<template>
  <view class="container">
    <view class="header">
      <view class="header-title">活动详情</view>
    </view>
    
    <!-- 加载中状态 -->
    <view v-if="loading" class="loading">
      <text class="loading-text">加载中...</text>
      <view class="loading-spinner"></view>
    </view>
    
    <!-- 活动详情内容 -->
    <scroll-view v-else class="content" scroll-y>
      <view class="detail-card">
        <!-- 活动名称 -->
        <view class="detail-item">
          <view class="detail-label">活动名称</view>
          <view class="detail-value">{{ activity.name || '暂无' }}</view>
        </view>
        
        <!-- 活动类型 -->
        <view class="detail-item">
          <view class="detail-label">活动类型</view>
          <view class="detail-value">{{ activity.type || '暂无' }}</view>
        </view>
        
        <!-- 活动状态 -->
        <view class="detail-item">
          <view class="detail-label">活动状态</view>
          <view class="detail-value">
            <view class="status-badge" :class="statusClass">{{ statusText }}</view>
          </view>
        </view>
        
        <!-- 活动时间 -->
        <view class="detail-item">
          <view class="detail-label">活动时间</view>
          <view class="detail-value">{{ activity.startDate || '暂无' }} 至 {{ activity.endDate || '暂无' }}</view>
        </view>
        
        <!-- 活动内容 -->
        <view class="detail-item">
          <view class="detail-label">活动内容</view>
          <view class="detail-value description">{{ activity.description || '暂无' }}</view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作按钮 -->
    <view class="footer">
      <button class="edit-btn" @click="goToEdit">编辑活动</button>
    </view>
  </view>
</template>

<script>
import { getActivityDetail } from '../../utils/merchantActivityApi.js';

export default {
  name: 'ActivityDetail',
  data() {
    return {
      activityId: '',
      activity: {
        name: '',
        type: '',
        startDate: '',
        endDate: '',
        description: '',
        enabled: false
      },
      loading: false
    }
  },
  computed: {
    statusText() {
      if (this.activity.enabled) {
        // 根据时间判断状态
        const now = new Date();
        const startDate = new Date(this.activity.startDate);
        const endDate = new Date(this.activity.endDate);
        
        if (now < startDate) {
          return '未开始';
        } else if (now > endDate) {
          return '已结束';
        } else {
          return '进行中';
        }
      }
      return '已禁用';
    },
    statusClass() {
      const status = this.statusText;
      if (status === '进行中') return 'status-ongoing';
      if (status === '未开始') return 'status-upcoming';
      if (status === '已结束') return 'status-ended';
      return 'status-disabled';
    }
  },
  onLoad(options) {
    // 从路由参数获取活动ID
    if (options.activityId) {
      this.activityId = options.activityId;
      this.loadActivityData();
    } else {
      uni.showToast({
        title: '活动ID缺失',
        icon: 'none'
      });
      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length <= 1) {
          uni.reLaunch({
            url: '/pages/index/index'
          });
        } else {
          uni.navigateBack();
        }
      }, 1500);
    }
  },
  methods: {
    /**
     * 加载活动详情数据
     */
    loadActivityData() {
      this.loading = true;
      uni.showLoading({
        title: '加载中...'
      });
      
      getActivityDetail(this.activityId)
        .then(res => {
          uni.hideLoading();
          this.loading = false;
          
          console.log('活动详情响应:', res);
          
          // 解析响应数据
          let activityDetail = null;
          
          if (res.data && (res.data.activityId || res.data.activity_id || res.data.id)) {
            activityDetail = res.data;
          } else if (res.data && res.data.code === 200 && res.data.data) {
            activityDetail = res.data.data;
          } else if (res.code === 200 && res.data && typeof res.data === 'object') {
            activityDetail = res.data;
          } else if (res.data && res.data.code === 0 && res.data.data) {
            activityDetail = res.data.data;
          }
          
          if (activityDetail) {
            // 格式化日期
            const safeFormatDate = (dateValue) => {
              if (!dateValue) return '';
              try {
                if (typeof dateValue === 'string') {
                  // 如果是字符串，提取日期部分
                  const match = dateValue.match(/(\d{4}-\d{2}-\d{2})/);
                  if (match) return match[1];
                }
                const d = new Date(dateValue);
                if (!isNaN(d.getTime())) {
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                }
                return '';
              } catch (error) {
                console.error('日期格式化失败:', error);
                return '';
              }
            };
            
            // 获取活动类型文本
            const getActivityTypeText = (type) => {
              const typeMap = {
                1: '新客立减',
                2: '满减',
                3: '折扣商品',
                4: '买一送一'
              };
              const typeNum = typeof type === 'string' ? parseInt(type) : type;
              return typeMap[typeNum] || `活动类型${type}`;
            };
            
            // 映射数据
            this.activity = {
              name: activityDetail.activityName || activityDetail.activity_name || activityDetail.name || '未命名活动',
              type: getActivityTypeText(activityDetail.activityType || activityDetail.activity_type || activityDetail.type),
              startDate: safeFormatDate(activityDetail.startTime || activityDetail.start_time || activityDetail.startDate),
              endDate: safeFormatDate(activityDetail.endTime || activityDetail.end_time || activityDetail.endDate),
              description: activityDetail.content || activityDetail.description || activityDetail.remark || '暂无描述',
              enabled: activityDetail.status === 1 || activityDetail.status === '进行中'
            };
          } else {
            uni.showToast({
              title: res.data?.msg || '加载活动失败',
              icon: 'none'
            });
          }
        })
        .catch(error => {
          uni.hideLoading();
          this.loading = false;
          console.error('加载活动详情失败:', error);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        });
    },
    
    /**
     * 跳转到编辑页面
     */
    goToEdit() {
      uni.navigateTo({
        url: `/pages/activities/activity-edit-new?activityId=${this.activityId}`
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
}

.header {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.content {
  padding: 24rpx;
  height: calc(100vh - 200rpx);
}

.detail-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.detail-item {
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.detail-value.description {
  white-space: pre-wrap;
  word-break: break-all;
}

.status-badge {
  display: inline-block;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-ongoing {
  background: #E8F5E9;
  color: #4CAF50;
}

.status-upcoming {
  background: #FFF3E0;
  color: #FF9800;
}

.status-ended {
  background: #F5F5F5;
  color: #9E9E9E;
}

.status-disabled {
  background: #FFEBEE;
  color: #F44336;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  color: #999;
}

.loading-text {
  font-size: 30rpx;
  margin-bottom: 20rpx;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #2196F3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  border-top: 1rpx solid #e0e0e0;
}

.edit-btn {
  width: 100%;
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  color: #333;
  font-size: 32rpx;
  font-weight: bold;
  padding: 24rpx;
  border-radius: 12rpx;
  border: none;
}

.edit-btn:active {
  opacity: 0.8;
}
</style>

