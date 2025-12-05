<template>
  <view class="chat-detail-container">
    <!-- 聊天消息区域 -->
    <scroll-view 
      class="chat-messages" 
      scroll-y="true" 
      :scroll-top="scrollTop"
      scroll-with-animation="true"
      :scroll-into-view="scrollIntoView"
      @scroll="onScroll"
    >
      <view 
        v-for="(message, index) in messages" 
        :key="index"
        :id="`message-${index}`"
        class="message-item"
        :class="{ 'message-sent': message.type === 'sent', 'message-received': message.type === 'received' }"
      >
        <!-- 接收的消息 -->
        <view v-if="message.type === 'received'" class="message-wrapper received-wrapper">
          <view class="message-avatar">
            <text class="avatar-text">{{ chatInfo.avatar }}</text>
          </view>
          <view class="message-content">
            <view class="message-bubble received-bubble">
              <text class="message-text">{{ message.content }}</text>
            </view>
            <text class="message-time">{{ formatTime(message.time) }}</text>
          </view>
        </view>
        
        <!-- 发送的消息 -->
        <view v-if="message.type === 'sent'" class="message-wrapper sent-wrapper">
          <view class="message-content sent-content">
            <view class="message-bubble sent-bubble">
              <text class="message-text">{{ message.content }}</text>
            </view>
            <text class="message-time sent-time">{{ formatTime(message.time) }}</text>
          </view>
          <view class="message-avatar">
            <text class="avatar-text">👤</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 回到底部按钮 -->
    <view 
      v-if="!isAtBottom" 
      class="back-to-bottom-btn" 
      @click="scrollToBottom"
    >
      <text class="back-icon">⬇️</text>
      <text class="back-text">回到底部</text>
    </view>

    <!-- 底部输入区域 -->
    <view class="chat-input-area">
      <view class="input-wrapper">
        <text class="voice-icon" @click="toggleVoiceInput">🎤</text>
        <input 
          class="chat-input" 
          type="text" 
          placeholder="请输入消息..." 
          v-model="inputContent" 
          @focus="onInputFocus"
          @confirm="sendMessage"
        />
        <text class="emoji-icon" @click="toggleEmojiPanel">😊</text>
        <text class="add-icon" @click="showMoreOptions">➕</text>
      </view>
      <button class="send-btn" @click="sendMessage" :disabled="!inputContent.trim()">发送</button>
    </view>

    <!-- 表情面板 -->
    <view v-if="showEmojiPanel" class="emoji-panel">
      <view class="emoji-grid">
        <text 
          v-for="(emoji, index) in emojiList" 
          :key="index"
          class="emoji-item"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
import { getMessageList, addMessage, updateMessage, markMessagesAsRead, MSG_TYPE, MSG_STATUS, USER_TYPE } from '@/api/chat.js';
import { getOrCreateSession, updateSessionLastMessage, increaseUnreadCount } from '@/api/session.js';
import { getUserInfo } from '@/api/user.js';

export default {
  data() {
    return {
      chatInfo: {
        id: '',
        sessionId: '',
        name: '',
        avatar: '🚴',
        fromType: USER_TYPE.USER,
        fromId: '',
        toType: USER_TYPE.RIDER,
        toId: ''
      },
      currentUser: null,
      loading: false,
      messages: [],
      inputContent: '',
      scrollTop: 0,
      scrollIntoView: '',
      isAtBottom: true,
      showEmojiPanel: false,
      emojiList: ['😊', '😂', '🥰', '😍', '🤔', '😅', '😭', '😡', '👍', '👎', '❤️', '💔', '🎉', '🎊', '🔥', '💯', '😎', '🤗', '😴', '🤤']
    };
  },
  
  watch: {
    messages: {
      handler(newMessages, oldMessages) {
        // 当有新消息时，如果用户在底部，自动滚动到底部
        if (newMessages.length > oldMessages.length && this.isAtBottom) {
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      },
      deep: true
    }
  },
  
  methods: {
    // 初始化用户信息
    async initUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo) {
          this.currentUser = userInfo;
          console.log('从本地存储获取用户信息:', this.currentUser);
        } else {
          const response = await getUserInfo();
          if (response.code === 200) {
            this.currentUser = response.data;
            uni.setStorageSync('userInfo', response.data);
            console.log('从API获取用户信息:', this.currentUser);
          }
        }
        
        // 确保用户ID存在
        if (!this.currentUser || !this.currentUser.id) {
          throw new Error('用户信息不完整');
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 使用默认用户信息作为fallback
        this.currentUser = {
          id: 1001,
          name: '当前用户'
        };
        console.log('使用默认用户信息:', this.currentUser);
      }
    },

    // 加载聊天消息
    async loadMessages() {
      if (!this.chatInfo.sessionId) return;
      
      this.loading = true;
      try {
        const response = await getMessageList({
          sessionId: this.chatInfo.sessionId,
          pageSize: 100
        });
        
        if (response.code === 200 && response.data) {
          this.messages = response.data.map(msg => this.formatMessage(msg));
          
          // 标记消息为已读
          const unreadMessages = response.data.filter(msg => 
            msg.msgStatus !== MSG_STATUS.READ && 
            msg.toId === this.currentUser.id
          );
          
          if (unreadMessages.length > 0) {
            await this.markMessagesAsRead(unreadMessages.map(msg => msg.messageId));
          }
          
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      } catch (error) {
        console.error('加载消息失败:', error);
        uni.showToast({
          title: '加载消息失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 格式化消息数据
    formatMessage(msg) {
      const isSent = msg.fromId === this.currentUser.id;
      return {
        id: msg.messageId,
        messageId: msg.messageId,
        type: isSent ? 'sent' : 'received',
        content: msg.msgContent,
        time: new Date(msg.sendTime).getTime(),
        msgType: msg.msgType,
        msgStatus: msg.msgStatus,
        version: msg.version
      };
    },

    // 标记消息为已读
    async markMessagesAsRead(messageIds) {
      try {
        await markMessagesAsRead(messageIds);
      } catch (error) {
        console.error('标记消息已读失败:', error);
      }
    },

    async sendMessage() {
      if (!this.inputContent.trim() || !this.currentUser) return;
      
      // 验证必要参数
      if (!this.currentUser.id) {
        uni.showToast({
          title: '用户信息异常，请重新登录',
          icon: 'error'
        });
        return;
      }
      
      if (!this.chatInfo.sessionId) {
        uni.showToast({
          title: '会话信息异常，请重新进入',
          icon: 'error'
        });
        return;
      }
      
      const messageContent = this.inputContent.trim();
      this.inputContent = '';
      this.showEmojiPanel = false;
      
      // 先添加到本地显示（显示发送中状态）
      const tempMessage = {
        id: Date.now(),
        type: 'sent',
        content: messageContent,
        time: new Date().getTime(),
        sending: true
      };
      
      this.messages.push(tempMessage);
      
      // 发送消息后强制滚动到底部
      this.isAtBottom = true;
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      try {
        // 准备发送的消息数据
        const messageData = {
          sessionId: this.chatInfo.sessionId,
          fromType: this.chatInfo.fromType || USER_TYPE.USER,
          fromId: String(this.currentUser.id), // 确保转换为字符串
          toType: this.chatInfo.toType || USER_TYPE.RIDER,
          toId: String(this.chatInfo.toId), // 确保转换为字符串
          msgType: MSG_TYPE.TEXT,
          msgContent: messageContent
        };
        
        // 添加调试信息
        console.log('发送消息数据:', messageData);
        
        // 调用API发送消息
        const response = await addMessage(messageData);
        
        if (response.code === 200) {
          // 发送成功，更新本地消息
          const messageIndex = this.messages.findIndex(msg => msg.id === tempMessage.id);
          if (messageIndex !== -1) {
            this.messages[messageIndex] = {
              ...this.messages[messageIndex],
              messageId: response.data.messageId,
              sending: false,
              msgStatus: MSG_STATUS.DELIVERED
            };
          }
          
          // 更新会话最后消息
          await updateSessionLastMessage(this.chatInfo.sessionId, {
            messageId: response.data.messageId,
            msgContent: messageContent,
            msgType: MSG_TYPE.TEXT,
            sendTime: response.data.sendTime
          });
          
          uni.showToast({
            title: '发送成功',
            icon: 'success',
            duration: 1000
          });
        } else {
          throw new Error(response.msg || '发送失败');
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        
        // 发送失败，更新消息状态
        const messageIndex = this.messages.findIndex(msg => msg.id === tempMessage.id);
        if (messageIndex !== -1) {
          this.messages[messageIndex] = {
            ...this.messages[messageIndex],
            sending: false,
            failed: true
          };
        }
        
        uni.showToast({
          title: '发送失败',
          icon: 'error'
        });
      }
    },
    
    toggleVoiceInput() {
      console.log('切换语音输入');
      uni.showToast({
        title: '语音功能开发中',
        icon: 'none'
      });
    },
    
    toggleEmojiPanel() {
      this.showEmojiPanel = !this.showEmojiPanel;
    },
    
    showMoreOptions() {
      uni.showActionSheet({
        itemList: ['发送图片', '发送位置', '发送文件'],
        success: (res) => {
          const options = ['图片', '位置', '文件'];
          uni.showToast({
            title: `${options[res.tapIndex]}功能开发中`,
            icon: 'none'
          });
        }
      });
    },
    
    insertEmoji(emoji) {
      this.inputContent += emoji;
    },
    
    onInputFocus() {
      this.showEmojiPanel = false;
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    scrollToBottom() {
      // 使用scroll-into-view滚动到最后一条消息
      if (this.messages.length > 0) {
        // 先清空scrollIntoView，然后设置新值，确保滚动生效
        this.scrollIntoView = '';
        this.$nextTick(() => {
          this.scrollIntoView = `message-${this.messages.length - 1}`;
          this.isAtBottom = true;
        });
      }
    },
    
    onScroll(e) {
      // 监听滚动事件，判断是否在底部
      const { scrollTop, scrollHeight, clientHeight } = e.detail;
      const threshold = 50; // 50rpx的阈值
      this.isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    },
    
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - timestamp;
      
      if (diff < 60000) { // 1分钟内
        return '刚刚';
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前';
      } else if (date.toDateString() === now.toDateString()) { // 今天
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
    }
  },
  
  async onLoad(options) {
    // 初始化用户信息
    await this.initUserInfo();
    
    // 获取传递的参数
    if (options.sessionId) {
      this.chatInfo.sessionId = options.sessionId;
    }
    if (options.chatId) {
      this.chatInfo.id = options.chatId;
    }
    if (options.name) {
      this.chatInfo.name = decodeURIComponent(options.name);
    }
    if (options.fromType) {
      this.chatInfo.fromType = parseInt(options.fromType);
    }
    if (options.fromId) {
      this.chatInfo.fromId = options.fromId;
    }
    if (options.toType) {
      this.chatInfo.toType = parseInt(options.toType);
    }
    if (options.toId) {
      this.chatInfo.toId = options.toId;
    }
    
    // 如果没有sessionId，尝试创建或获取会话
    if (!this.chatInfo.sessionId && this.currentUser) {
      try {
        const session = await getOrCreateSession({
          fromType: this.chatInfo.fromType || USER_TYPE.USER,
          fromId: this.currentUser.id,
          toType: this.chatInfo.toType || USER_TYPE.RIDER,
          toId: this.chatInfo.toId || '1002'
        });
        
        this.chatInfo.sessionId = session.sessionId;
      } catch (error) {
        console.error('创建会话失败:', error);
        uni.showToast({
          title: '初始化聊天失败',
          icon: 'error'
        });
        return;
      }
    }
    
    // 设置导航栏标题
    uni.setNavigationBarTitle({
      title: this.chatInfo.name || '聊天详情'
    });
    
    // 加载聊天消息
    if (this.chatInfo.sessionId) {
      await this.loadMessages();
    }
    
    // 滚动到底部
    this.$nextTick(() => {
      this.scrollToBottom();
    });
  }
};
</script>

<style scoped>
.chat-detail-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  padding: 20rpx;
  padding-bottom: 120rpx; /* 为底部输入框留出空间 */
  background-color: #f5f5f5;
}

.message-item {
  margin-bottom: 30rpx;
}

.message-wrapper {
  display: flex;
  align-items: flex-end;
}

.received-wrapper {
  justify-content: flex-start;
}

.sent-wrapper {
  justify-content: flex-end;
}

.message-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20rpx;
}

.avatar-text {
  font-size: 32rpx;
}

.message-content {
  max-width: 60%;
  display: flex;
  flex-direction: column;
}

.sent-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 20rpx 30rpx;
  border-radius: 30rpx;
  margin-bottom: 10rpx;
}

.received-bubble {
  background-color: #fff;
  border-bottom-left-radius: 10rpx;
}

.sent-bubble {
  background-color: #5DCDFF;
  border-bottom-right-radius: 10rpx;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.4;
  color: #333;
}

.sent-bubble .message-text {
  color: #fff;
}

.message-time {
  font-size: 22rpx;
  color: #999;
  margin: 0 20rpx;
}

.sent-time {
  text-align: right;
}

/* 回到底部按钮 */
.back-to-bottom-btn {
  position: fixed;
  bottom: 180rpx; /* 输入框高度 + 额外间距 */
  right: 30rpx;
  background-color: rgba(93, 205, 255, 0.9);
  color: #fff;
  border-radius: 50rpx;
  padding: 15rpx 25rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  z-index: 100;
  animation: fadeIn 0.3s ease-in-out;
}

.back-to-bottom-btn:active {
  background-color: rgba(93, 205, 255, 1);
  transform: scale(0.95);
}

.back-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.back-text {
  font-size: 24rpx;
  white-space: nowrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 底部输入区域 */
.chat-input-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom)); /* 适配安全区域 */
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.input-wrapper {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 50rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}

.voice-icon,
.emoji-icon,
.add-icon {
  font-size: 32rpx;
  margin: 0 10rpx;
  color: #666;
}

.chat-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  margin: 0 20rpx;
}

.send-btn {
  background-color: #5DCDFF;
  color: #fff;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

.send-btn[disabled] {
  background-color: #ccc;
}

/* 表情面板 */
.emoji-panel {
  position: fixed;
  bottom: 100rpx; /* 输入框高度 + 一些间距 */
  left: 0;
  right: 0;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  padding: 30rpx;
  height: 400rpx;
  z-index: 999;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.emoji-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.emoji-item {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
}

.emoji-item:active {
  background-color: #f0f0f0;
}
</style>
