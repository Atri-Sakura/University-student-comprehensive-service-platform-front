<template>
  <view class="chat-container">
    <!-- 聊天头部 -->
    <view class="chat-header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="chat-title">
        <text class="title-text">{{ chatInfo.title }}</text>
      </view>
      <view class="header-more">
        <text class="more-icon">⋯</text>
      </view>
    </view>

    <!-- 聊天消息列表 -->
    <scroll-view 
      class="message-list" 
      scroll-y 
      :scroll-into-view="scrollToView"
      scroll-with-animation
    >
      <view class="message-item" 
        v-for="(msg, index) in messageList" 
        :key="index"
        :id="'msg-' + index"
      >
        <!-- 时间分隔线 -->
        <view v-if="msg.showTime" class="time-divider">
          <text class="time-text">{{ msg.time }}</text>
        </view>

        <!-- 系统消息 -->
        <view v-if="msg.type === 'system'" class="system-message">
          <text class="system-text">{{ msg.content }}</text>
        </view>

        <!-- 普通消息 -->
        <view v-else :class="['normal-message', msg.isSelf ? 'self' : 'other']">
          <view class="avatar" :style="{ backgroundColor: msg.isSelf ? '#4A90E2' : '#FFB74D' }">
            <text class="avatar-text">{{ msg.avatar }}</text>
          </view>
          <view class="message-content-wrapper">
            <view class="message-bubble">
              <text class="message-text">{{ msg.content }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <view class="input-tools">
        <view class="tool-btn" @click="showMoreActions">
          <text class="tool-icon">➕</text>
        </view>
      </view>
      <view class="input-wrapper">
        <input 
          class="message-input" 
          v-model="inputMessage" 
          placeholder="输入消息..."
          confirm-type="send"
          @confirm="sendMessage"
        />
      </view>
      <view class="send-btn" @click="sendMessage" :class="{ active: inputMessage.trim() }">
        <text class="send-text">发送</text>
      </view>
    </view>

    <!-- 更多操作面板 -->
    <view v-if="showActions" class="action-panel" @click="hideActions">
      <view class="action-content" @click.stop>
        <view class="action-grid">
          <view class="action-item" @click="selectImage">
            <view class="action-icon" style="background: #FFB74D;">📷</view>
            <text class="action-text">图片</text>
          </view>
          <view class="action-item" @click="selectFile">
            <view class="action-icon" style="background: #66BB6A;">📁</view>
            <text class="action-text">文件</text>
          </view>
          <view class="action-item" @click="sendLocation">
            <view class="action-icon" style="background: #EF5350;">📍</view>
            <text class="action-text">位置</text>
          </view>
          <view class="action-item" @click="callPhone">
            <view class="action-icon" style="background: #42A5F5;">📞</view>
            <text class="action-text">语音</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChatPage',
  data() {
    return {
      chatInfo: {
        title: '',
        icon: '',
        iconColor: ''
      },
      messageList: [],
      inputMessage: '',
      scrollToView: '',
      showActions: false
    }
  },
  onLoad(options) {
    // 接收从消息列表传来的参数
    if (options.title) {
      this.chatInfo.title = decodeURIComponent(options.title);
    }
    if (options.icon) {
      this.chatInfo.icon = decodeURIComponent(options.icon);
    }
    if (options.iconColor) {
      this.chatInfo.iconColor = decodeURIComponent(options.iconColor);
    }
    
    // 加载历史消息
    this.loadMessages();
  },
  methods: {
    // 加载历史消息
    loadMessages() {
      // 模拟历史消息数据
      const now = new Date();
      const mockMessages = [
        {
          type: 'system',
          content: '欢迎进入聊天',
          time: this.formatTime(new Date(now - 3600000)),
          showTime: true
        },
        {
          type: 'normal',
          isSelf: false,
          avatar: this.chatInfo.icon || '👤',
          content: '您好，有什么可以帮您的吗？',
          time: this.formatTime(new Date(now - 3500000)),
          showTime: false
        },
        {
          type: 'normal',
          isSelf: true,
          avatar: '🙂',
          content: '我想咨询一下订单相关的问题',
          time: this.formatTime(new Date(now - 3400000)),
          showTime: false
        },
        {
          type: 'normal',
          isSelf: false,
          avatar: this.chatInfo.icon || '👤',
          content: '好的，请问您的订单号是多少？',
          time: this.formatTime(new Date(now - 3300000)),
          showTime: false
        }
      ];
      
      this.messageList = mockMessages;
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    // 发送消息
    sendMessage() {
      if (!this.inputMessage.trim()) {
        return;
      }
      
      const newMessage = {
        type: 'normal',
        isSelf: true,
        avatar: '🙂',
        content: this.inputMessage.trim(),
        time: this.formatTime(new Date()),
        showTime: false
      };
      
      this.messageList.push(newMessage);
      this.inputMessage = '';
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // 模拟对方回复
      setTimeout(() => {
        this.receiveMessage();
      }, 1000);
    },
    
    // 接收消息（模拟）
    receiveMessage() {
      const replies = [
        '收到，我帮您查询一下',
        '好的，请稍等',
        '这个问题我需要进一步确认',
        '明白了，马上为您处理',
        '感谢您的反馈'
      ];
      
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const newMessage = {
        type: 'normal',
        isSelf: false,
        avatar: this.chatInfo.icon || '👤',
        content: randomReply,
        time: this.formatTime(new Date()),
        showTime: false
      };
      
      this.messageList.push(newMessage);
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    // 滚动到底部
    scrollToBottom() {
      if (this.messageList.length > 0) {
        this.scrollToView = 'msg-' + (this.messageList.length - 1);
      }
    },
    
    // 格式化时间
    formatTime(date) {
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) { // 1分钟内
        return '刚刚';
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前';
      } else if (diff < 86400000) { // 今天
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else if (diff < 172800000) { // 昨天
        return '昨天';
      } else {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}-${day}`;
      }
    },
    
    // 显示更多操作
    showMoreActions() {
      this.showActions = true;
    },
    
    // 隐藏操作面板
    hideActions() {
      this.showActions = false;
    },
    
    // 选择图片
    selectImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          uni.showToast({
            title: '图片发送成功',
            icon: 'success'
          });
          this.hideActions();
          
          // 添加图片消息
          const newMessage = {
            type: 'normal',
            isSelf: true,
            avatar: '🙂',
            content: '[图片]',
            time: this.formatTime(new Date()),
            showTime: false
          };
          this.messageList.push(newMessage);
          this.scrollToBottom();
        }
      });
    },
    
    // 选择文件
    selectFile() {
      uni.showToast({
        title: '文件选择功能',
        icon: 'none'
      });
      this.hideActions();
    },
    
    // 发送位置
    sendLocation() {
      uni.showToast({
        title: '位置分享功能',
        icon: 'none'
      });
      this.hideActions();
    },
    
    // 语音通话
    callPhone() {
      uni.showToast({
        title: '语音通话功能',
        icon: 'none'
      });
      this.hideActions();
    },
    
    // 返回
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
.chat-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 聊天头部 */
.chat-header {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  padding: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  color: white;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
}

.chat-title {
  flex: 1;
  text-align: center;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.header-more {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-icon {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
}

/* 消息列表 */
.message-list {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.message-item {
  margin-bottom: 30rpx;
}

/* 时间分隔线 */
.time-divider {
  display: flex;
  justify-content: center;
  margin: 20rpx 0;
}

.time-text {
  font-size: 22rpx;
  color: #999;
  background: #e0e0e0;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* 系统消息 */
.system-message {
  display: flex;
  justify-content: center;
  margin: 20rpx 0;
}

.system-text {
  font-size: 24rpx;
  color: #999;
  background: #ffffff;
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
}

/* 普通消息 */
.normal-message {
  display: flex;
  margin-bottom: 20rpx;
}

.normal-message.self {
  flex-direction: row-reverse;
}

.avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 36rpx;
}

.message-content-wrapper {
  display: flex;
  align-items: center;
  max-width: 60%;
  margin: 0 20rpx;
}

.message-bubble {
  background: white;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.normal-message.self .message-bubble {
  background: #4A90E2;
}

.message-text {
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
  line-height: 1.5;
}

.normal-message.self .message-text {
  color: white;
}

/* 输入区域 */
.input-area {
  background: white;
  padding: 20rpx;
  display: flex;
  align-items: center;
  border-top: 1rpx solid #e0e0e0;
}

.input-tools {
  margin-right: 15rpx;
}

.tool-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
}

.tool-icon {
  font-size: 32rpx;
  color: #666;
}

.input-wrapper {
  flex: 1;
  margin-right: 15rpx;
}

.message-input {
  width: 100%;
  height: 60rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.send-btn {
  padding: 12rpx 30rpx;
  background: #e0e0e0;
  border-radius: 30rpx;
  transition: all 0.3s;
}

.send-btn.active {
  background: #4A90E2;
}

.send-text {
  font-size: 28rpx;
  color: #999;
}

.send-btn.active .send-text {
  color: white;
}

/* 操作面板 */
.action-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.action-content {
  width: 100%;
  background: white;
  border-radius: 30rpx 30rpx 0 0;
  padding: 40rpx 20rpx;
}

.action-grid {
  display: flex;
  flex-wrap: wrap;
}

.action-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.action-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50rpx;
  margin-bottom: 10rpx;
}

.action-text {
  font-size: 24rpx;
  color: #666;
}
</style>

