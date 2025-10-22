<template>
  <view class="container">
    <view class="header">
      <text class="title">消息中心</text>
    </view>
    
    <view class="content">
      <view class="message-item" v-for="(item, index) in messages" :key="index" @click="viewMessage(item)">
        <view class="message-icon" :style="{ backgroundColor: item.iconColor }">
          <text class="icon-text">{{ item.icon }}</text>
        </view>
        <view class="message-info">
          <view class="message-header">
            <text class="message-title">{{ item.title }}</text>
            <text class="message-time">{{ item.time }}</text>
          </view>
          <text class="message-content">{{ item.content }}</text>
        </view>
        <view v-if="item.unread > 0" class="unread-badge">
          <text class="badge-text">{{ item.unread }}</text>
        </view>
      </view>
      
      <view v-if="messages.length === 0" class="empty">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MessagePage',
  data() {
    return {
      messages: [
        {
          icon: '📋',
          iconColor: '#FFE5B4',
          title: '订单通知',
          content: '您有3个新订单待处理',
          time: '10:30',
          unread: 3
        },
        {
          icon: '💬',
          iconColor: '#B3E5FC',
          title: '系统消息',
          content: '您的店铺认证已通过',
          time: '昨天',
          unread: 1
        },
        {
          icon: '🎉',
          iconColor: '#F8BBD0',
          title: '活动通知',
          content: '新客立减活动即将开始',
          time: '2天前',
          unread: 0
        },
        {
          icon: '💰',
          iconColor: '#C8E6C9',
          title: '财务通知',
          content: '您有一笔提现到账',
          time: '3天前',
          unread: 0
        }
      ]
    }
  },
  methods: {
    viewMessage(item) {
      uni.showToast({
        title: '查看消息详情',
        icon: 'none'
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
  background: linear-gradient(135deg, #4a90e2, #357abd);
  padding: 40rpx 30rpx;
  color: white;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.content {
  padding: 20rpx;
}

.message-item {
  background: white;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  position: relative;
}

.message-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.icon-text {
  font-size: 40rpx;
}

.message-info {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.message-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.message-time {
  font-size: 24rpx;
  color: #999;
  margin-left: 10rpx;
}

.message-content {
  font-size: 26rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background: #ff4d4f;
  color: white;
  border-radius: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.badge-text {
  font-size: 20rpx;
  color: white;
}

.empty {
  padding: 150rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>

