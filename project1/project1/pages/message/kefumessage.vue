<template>
  <view class="container">
    <!-- 顶部栏 -->
    <view class="header">
      <text class="header-title">在线客服</text>
      <text class="header-subtitle">工号：1086</text>
      <view class="close-btn">
        <text class="close-icon">×</text>
      </view>
    </view>

    <!-- 客服信息 -->
    <view class="service-info">
      <view class="service-avatar">
        <text class="avatar-icon">📞</text>
      </view>
      <view class="service-details">
        <text class="service-name">客服小王(工号：1086)</text>
        <view class="service-status">
          <view class="status-dot"></view>
          <text class="status-text">在线</text>
        </view>
      </view>
    </view>

    <!-- 聊天内容 -->
    <scroll-view class="chat-content" scroll-y="true" :scroll-top="scrollTop">
      <!-- 客服消息1 -->
      <view class="message-row service-message">
        <view class="message-avatar">
          <text class="avatar-icon">📞</text>
        </view>
        <view class="message-content">
          <view class="message-bubble">
            <text class="message-text">很抱歉给您带来不便。请您提供一下具体的订单号，我帮您查询一下</text>
          </view>
          <view class="message-meta">
            <text class="read-status">已读</text>
            <text class="message-time">10:34</text>
          </view>
        </view>
      </view>

      <!-- 商家消息1 -->
      <view class="message-row merchant-message">
        <view class="message-content">
          <view class="message-bubble">
            <text class="message-text">订单号是#20231115001和#20231115002，这两个订单已经完成配送，但系统还显示"配送中"。</text>
          </view>
          <view class="message-meta">
            <text class="message-time">10:35</text>
          </view>
        </view>
        <view class="message-avatar">
          <text class="avatar-icon">👤</text>
        </view>
      </view>

      <!-- 客服消息2 -->
      <view class="message-row service-message">
        <view class="message-avatar">
          <text class="avatar-icon">📞</text>
        </view>
        <view class="message-content">
          <view class="message-bubble">
            <text class="message-text">好的，我正在查询这两个订单。请稍等片刻...</text>
          </view>
          <view class="message-meta">
            <text class="read-status">已读</text>
            <text class="message-time">10:36</text>
          </view>
        </view>
      </view>

      <!-- 客服消息3 -->
      <view class="message-row service-message">
        <view class="message-avatar">
          <text class="avatar-icon">📞</text>
        </view>
        <view class="message-content">
          <view class="message-bubble">
            <text class="message-text">已经查到了，这是一个系统同步问题。我已经手动更新了订单状态，现在应该显示正确了。您刷新页面看一下。</text>
          </view>
          <view class="message-meta">
            <text class="read-status">已读</text>
            <text class="message-time">10:37</text>
          </view>
        </view>
      </view>

      <!-- 商家消息2 -->
      <view class="message-row merchant-message">
        <view class="message-content">
          <view class="message-bubble">
            <text class="message-text">刷新了，现在显示正常</text>
          </view>
          <view class="message-meta">
            <text class="message-time">10:38</text>
          </view>
        </view>
        <view class="message-avatar">
          <text class="avatar-icon">👤</text>
        </view>
      </view>

      <!-- 客服消息4 -->
      <view class="message-row service-message">
        <view class="message-avatar">
          <text class="avatar-icon">📞</text>
        </view>
        <view class="message-content">
          <view class="message-bubble">
            <text class="message-text">不客气！如果还有其他问题，请随时联系我。祝您生意兴隆！</text>
          </view>
          <view class="message-meta">
            <text class="read-status">已读</text>
            <text class="message-time">10:38</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 常见问题 -->
    <view class="quick-questions">
      <text class="questions-title">常见问题</text>
      <view class="questions-tags">
        <view class="question-tag">
          <text class="tag-text">订单问题</text>
        </view>
        <view class="question-tag">
          <text class="tag-text">支付问题</text>
        </view>
        <view class="question-tag">
          <text class="tag-text">系统故障</text>
        </view>
        <view class="question-tag">
          <text class="tag-text">功能咨询</text>
        </view>
      </view>
    </view>

    <!-- 输入区域 -->
    <view class="input-area">
      <view class="input-left">
        <text class="input-icon">😊</text>
        <text class="input-icon">🖼️</text>
        <text class="input-icon">📎</text>
      </view>
      <input class="message-input" placeholder="输入消息..." />
      <view class="send-button">
        <text class="send-icon">➤</text>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="bottom-nav">
      <view class="nav-item">
        <text class="nav-icon">←</text>
        <text class="nav-text">返回</text>
      </view>
      <view class="nav-item">
        <text class="nav-icon">🔑</text>
        <text class="nav-text">找回密码</text>
      </view>
      <view class="nav-item">
        <text class="nav-icon">💰</text>
        <text class="nav-text">关于退款</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomerServiceChat',
  data() {
    return {
      scrollTop: 0
    }
  },
  methods: {
    scrollToBottom() {
      this.scrollTop = 99999
    }
  },
  onReady() {
    this.$nextTick(() => {
      setTimeout(() => {
        this.scrollToBottom()
      }, 100)
    })
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.header {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  padding: 80rpx 30rpx 30rpx;
  color: white;
  position: relative;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  display: block;
  color: white;
}

.header-subtitle {
  font-size: 24rpx;
  opacity: 0.9;
  display: block;
  margin-top: 8rpx;
  color: white;
}

.close-btn {
  position: absolute;
  right: 30rpx;
  top: 80rpx;
}

.close-icon {
  font-size: 50rpx;
  color: white;
}

/* 客服信息 */
.service-info {
  background: white;
  padding: 30rpx;
  display: flex;
  align-items: center;
  border-bottom: 1rpx solid #eee;
}

.service-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a90e2, #357abd);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-icon {
  font-size: 50rpx;
  color: white;
}

.service-details {
  flex: 1;
}

.service-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.service-status {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  background-color: #07C160;
  border-radius: 50%;
  margin-right: 8rpx;
}

.status-text {
  font-size: 26rpx;
  color: #07C160;
}

/* 聊天内容 */
.chat-content {
  flex: 1;
  padding: 20rpx;
  background-color: #f0f2f5;
}

.message-row {
  display: flex;
  margin-bottom: 30rpx;
  align-items: flex-start;
}

.service-message {
  justify-content: flex-start;
}

.merchant-message {
  justify-content: flex-end;
}

.message-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20rpx;
  flex-shrink: 0;
}

.service-message .message-avatar {
  background: linear-gradient(135deg, #4a90e2, #357abd);
}

.merchant-message .message-avatar {
  background: linear-gradient(135deg, #FFA726, #FFB74D);
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 1.5;
}

.service-message .message-bubble {
  background-color: white;
  color: #333;
  border-top-left-radius: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.merchant-message .message-bubble {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  color: #333;
  border-top-right-radius: 0;
}

.message-meta {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  font-size: 22rpx;
}

.service-message .message-meta {
  justify-content: flex-start;
}

.merchant-message .message-meta {
  justify-content: flex-end;
}

.read-status {
  color: #4a90e2;
  margin-right: 8rpx;
}

.message-time {
  color: #999;
}

/* 常见问题 */
.quick-questions {
  background: white;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
}

.questions-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  font-weight: bold;
}

.questions-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.question-tag {
  background: #f5f5f5;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
}

.tag-text {
  font-size: 26rpx;
  color: #666;
}

/* 输入区域 */
.input-area {
  background: white;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #eee;
  display: flex;
  align-items: center;
}

.input-left {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}

.input-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
  color: #666;
}

.message-input {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.send-button {
  background: #4a90e2;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20rpx;
}

.send-icon {
  font-size: 40rpx;
  color: white;
}

/* 底部导航 */
.bottom-nav {
  background: white;
  border-top: 1rpx solid #eee;
  display: flex;
  padding: 20rpx 0;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.nav-text {
  font-size: 22rpx;
  color: #666;
}
</style>
