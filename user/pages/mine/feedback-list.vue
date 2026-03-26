<template>
  <view class="feedback-list-container">
    <!-- 顶部操作栏 -->
    <view class="header-actions">
      <view class="filter-tabs">
        <view 
          class="tab-item" 
          :class="{ active: currentStatus === '' }"
          @click="changeStatus('')"
        >
          全部
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentStatus === 'pending' }"
          @click="changeStatus('pending')"
        >
          待处理
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentStatus === 'processing' }"
          @click="changeStatus('processing')"
        >
          处理中
        </view>
        <view 
          class="tab-item" 
          :class="{ active: currentStatus === 'completed' }"
          @click="changeStatus('completed')"
        >
          已完成
        </view>
      </view>
      <view class="add-btn" @click="goToAddFeedback">
        <text class="add-icon">+</text>
        <text>新增反馈</text>
      </view>
    </view>

    <!-- 反馈列表 -->
    <view class="feedback-list">
      <view 
        v-for="item in feedbackList" 
        :key="item.feedbackId || item.id"
        class="feedback-item"
        @click="goToDetail(item.feedbackId || item.id)"
      >
        <view class="item-header">
          <view class="item-title">{{ item.feedbackTitle || item.title }}</view>
          <view class="item-status" :class="getStatusClass(item.status)">
            {{ getStatusText(item.status) }}
          </view>
        </view>
        <view class="item-content">{{ item.feedbackContent || item.feedbackDetail || item.detail }}</view>
        <view class="item-footer">
          <view class="item-type">{{ getTypeText(item.feedbackType || item.type) }}</view>
          <view class="item-time">{{ formatTime(item.createTime) }}</view>
        </view>
        <view class="item-actions">
          <view class="action-btn edit-btn" @click.stop="editFeedback(item)">
            <text>编辑</text>
          </view>
          <view class="action-btn delete-btn" @click.stop="deleteFeedback(item.feedbackId || item.id)">
            <text>删除</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="feedbackList.length === 0 && !loading" class="empty-state">
        <image class="empty-icon" src="/static/images/empty.png" mode="aspectFit"></image>
        <text class="empty-text">暂无反馈记录</text>
        <view class="empty-btn" @click="goToAddFeedback">
          <text>立即反馈</text>
        </view>
      </view>

      <!-- 加载中 -->
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getFeedbackList, deleteFeedback } from '@/api/feedback.js';

export default {
  data() {
    return {
      feedbackList: [],
      currentStatus: '', // 当前筛选状态
      loading: false,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      // 状态映射：前端显示值 -> 后端数字值
      statusMap: {
        '': null,           // 全部
        'pending': 0,       // 待处理
        'processing': 1,    // 处理中
        'completed': 2,     // 已完成
        'rejected': 3       // 已拒绝
      },
      // 状态映射：后端数字值 -> 前端显示文本
      statusTextMap: {
        0: '待处理',
        1: '处理中',
        2: '已完成',
        3: '已拒绝'
      }
    };
  },
  onLoad() {
    this.loadFeedbackList();
  },
  onShow() {
    // 从添加/编辑页面返回时刷新列表
    this.loadFeedbackList();
  },
  methods: {
    // 加载反馈列表
    async loadFeedbackList() {
      try {
        this.loading = true;
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        };
        
        // 如果有状态筛选，添加到参数中（转换为后端需要的数字类型）
        if (this.currentStatus && this.statusMap[this.currentStatus] !== null) {
          params.status = this.statusMap[this.currentStatus];
        }
        
        const response = await getFeedbackList(params);
        console.log('反馈列表API响应:', response);
        
        if (response.code === 200) {
          // 若依框架直接在response根级别返回rows和total
          if (response.rows) {
            console.log('使用若依框架格式，长度:', response.rows.length);
            this.feedbackList = response.rows || [];
            this.total = response.total || this.feedbackList.length;
          }
          // 标准格式：data对象中包含数据
          else if (response.data) {
            console.log('response.data内容:', response.data);
            
            if (Array.isArray(response.data)) {
              // 如果data直接是数组
              console.log('使用数组格式，长度:', response.data.length);
              this.feedbackList = response.data;
              this.total = response.data.length;
            } else if (response.data.list) {
              // 如果data是对象，包含list属性
              console.log('使用list格式，长度:', response.data.list.length);
              this.feedbackList = response.data.list || [];
              this.total = response.data.total || this.feedbackList.length;
            } else if (response.data.records) {
              // 如果data是对象，包含records属性（MyBatis Plus分页）
              console.log('使用records格式，长度:', response.data.records.length);
              this.feedbackList = response.data.records || [];
              this.total = response.data.total || this.feedbackList.length;
            } else if (response.data.rows) {
              // 如果data是对象，包含rows属性
              console.log('使用data.rows格式，长度:', response.data.rows.length);
              this.feedbackList = response.data.rows || [];
              this.total = response.data.total || this.feedbackList.length;
            } else {
              // 其他情况
              console.log('未识别的数据格式，data的keys:', Object.keys(response.data));
              this.feedbackList = [];
              this.total = 0;
            }
          } else {
            console.log('无数据');
            this.feedbackList = [];
            this.total = 0;
          }
          console.log('最终feedbackList长度:', this.feedbackList.length);
          console.log('feedbackList内容:', this.feedbackList);
        } else {
          uni.showToast({
            title: response.msg || '加载失败',
            icon: 'none'
          });
          this.feedbackList = [];
          this.total = 0;
        }
      } catch (error) {
        console.error('加载反馈列表失败:', error);
        this.feedbackList = [];
        this.total = 0;
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 切换状态筛选
    changeStatus(status) {
      this.currentStatus = status;
      this.pageNum = 1;
      this.loadFeedbackList();
    },
    
    // 跳转到添加反馈页面
    goToAddFeedback() {
      uni.navigateTo({
        url: '/pages/mine/feedback'
      });
    },
    
    // 跳转到详情页面
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/mine/feedback-detail?id=${id}`
      });
    },
    
    // 编辑反馈
    editFeedback(item) {
      const id = item.feedbackId || item.id;
      console.log('编辑反馈ID:', id, 'item:', item);
      uni.navigateTo({
        url: `/pages/mine/feedback-edit?id=${id}`
      });
    },
    
    // 删除反馈
    deleteFeedback(id) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条反馈吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: '删除中...'
              });
              
              const response = await deleteFeedback(id);
              
              uni.hideLoading();
              
              if (response.code === 200) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                
                // 刷新列表
                this.loadFeedbackList();
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
      // 数字状态映射到CSS类名
      const statusClassMap = {
        0: 'status-pending',
        1: 'status-processing',
        2: 'status-completed',
        3: 'status-rejected'
      };
      
      if (typeof status === 'number') {
        return statusClassMap[status] || '';
      }
      // 兼容字符串格式
      return 'status-' + status;
    },
    
    // 获取状态文本
    getStatusText(status) {
      // 如果status是数字，使用statusTextMap
      if (typeof status === 'number') {
        return this.statusTextMap[status] || '未知';
      }
      // 如果status是字符串，兼容旧格式
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
      const now = new Date();
      const diff = now - date;
      
      // 一分钟内
      if (diff < 60000) {
        return '刚刚';
      }
      // 一小时内
      if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
      }
      // 一天内
      if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
      }
      // 显示日期
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
};
</script>

<style scoped>
.feedback-list-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
}

.header-actions {
  background-color: white;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #EEEEEE;
}

.filter-tabs {
  display: flex;
  gap: 20rpx;
}

.tab-item {
  padding: 10rpx 20rpx;
  font-size: 28rpx;
  color: #666666;
  border-radius: 30rpx;
  transition: all 0.3s;
}

.tab-item.active {
  background-color: #5DCDFF;
  color: white;
}

.add-btn {
  display: flex;
  align-items: center;
  padding: 10rpx 20rpx;
  background-color: #5DCDFF;
  color: white;
  border-radius: 30rpx;
  font-size: 28rpx;
}

.add-icon {
  font-size: 32rpx;
  margin-right: 5rpx;
}

.feedback-list {
  padding: 20rpx 30rpx;
}

.feedback-item {
  background-color: white;
  border-radius: 10rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.item-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 20rpx;
}

.item-status {
  padding: 5rpx 15rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  white-space: nowrap;
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

.item-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 20rpx;
}

.item-type {
  padding: 5rpx 10rpx;
  background-color: #F5F5F5;
  border-radius: 5rpx;
}

.item-actions {
  display: flex;
  gap: 20rpx;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1rpx solid #EEEEEE;
}

.action-btn {
  padding: 10rpx 25rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
}

.edit-btn {
  background-color: #E3F2FD;
  color: #2196F3;
}

.delete-btn {
  background-color: #FFEBEE;
  color: #F44336;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 40rpx;
}

.empty-btn {
  padding: 15rpx 40rpx;
  background-color: #5DCDFF;
  color: white;
  border-radius: 30rpx;
  font-size: 28rpx;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50rpx 0;
  font-size: 28rpx;
  color: #999999;
}
</style>
