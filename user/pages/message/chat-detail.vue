<template>
  <view class="chat-detail-container">
    <!-- 聊天消息区域 -->
    <scroll-view 
      class="chat-messages" 
      scroll-y
      :scroll-into-view="scrollIntoView"
      scroll-with-animation
      @scroll="onScroll"
    >
      <view 
        v-for="(message, index) in messages" 
        :key="index"
        :id="'msg-' + index"
        class="message-item"
        :class="{ 'message-sent': message.type === 'sent', 'message-received': message.type === 'received' }"
      >
        <!-- 接收的消息 -->
        <view v-if="message.type === 'received'" class="message-wrapper received-wrapper">
          <view class="message-avatar">
            <text class="avatar-text">{{ chatInfo.avatar }}</text>
          </view>
          <view class="message-content">
            <text class="sender-name">{{ chatInfo.name }}</text>
            <view class="message-bubble received-bubble">
              <text class="message-text">{{ message.content }}</text>
            </view>
          </view>
        </view>
        
        <!-- 发送的消息 -->
        <view v-if="message.type === 'sent'" class="message-wrapper sent-wrapper">
          <view class="message-content sent-content">
            <text class="sender-name sent-name">{{ currentUser.name || '我' }}</text>
            <view class="message-bubble sent-bubble">
              <text class="message-text">{{ message.content }}</text>
            </view>
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
import wsManager from '@/utils/websocket-protobuf-manager.js';

export default {
  data() {
    return {
      isRefreshed: false,  // 标记是否是刷新后进入
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
      emojiList: ['😊', '😂', '🥰', '😍', '🤔', '😅', '😭', '😡', '👍', '👎', '❤️', '💔', '🎉', '🎊', '🔥', '💯', '😎', '🤗', '😴', '🤤'],
      wsConnected: false
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
        const userId = uni.getStorageSync('userId');
        
        if (userInfo) {
          this.currentUser = userInfo;
        } else {
          const response = await getUserInfo();
          if (response.code === 200) {
            this.currentUser = response.data;
            uni.setStorageSync('userInfo', response.data);
          }
        }
        
        // 多字段容错获取用户ID
        let currentUserId = null;
        if (this.currentUser) {
          currentUserId = this.currentUser.id || this.currentUser.userId || this.currentUser.userBaseId;
        }
        if (!currentUserId) {
          currentUserId = userId;
        }
        
        // 确保用户ID存在
        if (!currentUserId) {
          throw new Error('用户信息不完整');
        }
        
        // 确保currentUser对象有id字段
        if (!this.currentUser.id) {
          this.currentUser.id = currentUserId;
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 尝试使用userId作为fallback
        const userId = uni.getStorageSync('userId');
        if (userId) {
          this.currentUser = {
            id: userId,
            name: '当前用户'
          };
        } else {
          // 最后的fallback
          this.currentUser = {
            id: '1001',
            name: '当前用户'
          };
        }
      }
    },

    // 连接WebSocket（Protobuf版本）
    async connectWebSocket() {
      if (!this.currentUser || !this.currentUser.id) {
        console.warn('⚠️ 用户信息不完整，无法连接WebSocket');
        console.warn('currentUser:', this.currentUser);
        return;
      }
      
      // 检查是否已连接，避免重复连接
      const status = wsManager.getStatus();
      if (status.isConnected && status.isRegistered) {
        // 只添加handler（如果还没添加）
        wsManager.addMessageHandler(this.handleWebSocketMessage);
        this.wsConnected = true;
        return;
      }
      
      try {
        // 初始化Protobuf（必须先调用）
        await wsManager.init();
        
        // 建立WebSocket连接
        await wsManager.connect(USER_TYPE.USER, this.currentUser.id);
        
        // 添加消息处理器
        wsManager.addMessageHandler(this.handleWebSocketMessage);
        
        // 延迟检查连接状态（给WebSocket时间建立连接）
        setTimeout(() => {
          const status = wsManager.getStatus();
          this.wsConnected = status.isConnected && status.isRegistered;
        }, 500);
      } catch (error) {
        console.error('❌ WebSocket连接失败:', error);
        uni.showToast({
          title: 'WebSocket连接失败',
          icon: 'none'
        });
      }
    },
    
    // 处理WebSocket接收的消息（Protobuf解码后）
    handleWebSocketMessage(message) {
      // 兼容两种命名方式（下划线和驼峰）
      const msgType = message.msg_type || message.msgType;
      const sessionId = message.session_id || message.sessionId;
      const messageId = message.message_id || message.messageId;
      const msgContent = message.msg_content || message.msgContent || message.content;
      const sendTime = message.send_time || message.sendTime;
      const fromId = String(message.from_id || message.fromId || '');
      const toId = String(message.to_id || message.toId || '');
      const toType = message.to_type || message.toType;
      
      // 过滤掉自己发送的消息（避免回声）
      if (this.currentUser && fromId) {
        const currentUserId = String(this.currentUser.id || '');
        const isSelf = fromId.substring(0, 10) === currentUserId.substring(0, 10);
        if (isSelf) {
          return;
        }
      }
      
      // 只处理文本消息和图片消息（msgType: 1=文本, 2=图片）
      if (msgType !== 1 && msgType !== 2) {
        return;
      }
      
      // 检查是否是当前对话的对方发来的消息（不严格匹配sessionId）
      // 只要fromId是当前聊天对象，且toId是当前用户，就接收
      const chatPartnerId = this.chatInfo.toId; // 对方ID（骑手）
      const myUserId = this.currentUser.id;
      
      const isFromChatPartner = String(fromId).substring(0, 10) === String(chatPartnerId).substring(0, 10);
      const isToMe = String(toId).substring(0, 10) === String(myUserId).substring(0, 10);
      
      if (!isFromChatPartner || !isToMe) {
        return;
      }
      
      // 添加到消息列表
      const newMessage = {
        id: messageId || Date.now(),
        type: 'received',
        content: msgContent,
        time: sendTime || Date.now(),
        msgStatus: message.msgStatus || MSG_STATUS.DELIVERED
      };
      
      this.messages.push(newMessage);
      
      // 标记消息为已读（传递消息ID数组）
      if (messageId) {
        markMessagesAsRead([messageId]).catch(err => {
          console.error('标记消息已读失败:', err);
        });
      }
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    // 断开WebSocket连接
    disconnectWebSocket() {
      try {
        const index = wsManager.messageHandlers.indexOf(this.handleWebSocketMessage);
        if (index > -1) {
          wsManager.messageHandlers.splice(index, 1);
        }
      } catch (error) {
        console.error('移除handler失败:', error);
      }
      this.wsConnected = false;
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
          // 先按时间排序
          const sortedMessages = [...response.data].sort((a, b) => {
            const timeA = new Date(a.createTime || a.sendTime || 0).getTime();
            const timeB = new Date(b.createTime || b.sendTime || 0).getTime();
            return timeA - timeB;
          });
          
          // 基于内容+发送者+时间窗口去重（5秒内相同内容视为重复）
          const uniqueMessages = [];
          const seenKeys = new Set();
          for (const msg of sortedMessages) {
            const msgTime = new Date(msg.createTime || msg.sendTime || 0).getTime();
            // 将时间精确到5秒窗口
            const timeWindow = Math.floor(msgTime / 5000);
            const key = `${msg.fromId}_${msg.msgContent}_${timeWindow}`;
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              uniqueMessages.push(msg);
            }
          }
          
          this.messages = uniqueMessages.map(msg => this.formatMessage(msg));
          
          // 标记消息为已读
          const unreadMessages = response.data.filter(msg => 
            msg.msgStatus !== MSG_STATUS.READ && 
            msg.toId === this.currentUser.id
          );
          
          if (unreadMessages.length > 0) {
            await this.markMessagesAsRead(unreadMessages.map(msg => msg.messageId));
          }
          
          // 等待DOM渲染后滚动
          this.$nextTick(() => {
            setTimeout(() => {
              this.scrollToBottom();
            }, 300);
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
      // 将两边都转为字符串进行比较，避免类型不一致导致比较失败
      const fromId = String(msg.fromId || '');
      const currentUserId = String(this.currentUser.id || '');
      const isSent = fromId === currentUserId;
      
      // 处理时间，确保正确解析
      let messageTime = Date.now();
      if (msg.sendTime) {
        // 如果是字符串格式的时间
        if (typeof msg.sendTime === 'string') {
          // 尝试直接解析
          const parsed = new Date(msg.sendTime);
          if (!isNaN(parsed.getTime())) {
            messageTime = parsed.getTime();
          }
        } else if (typeof msg.sendTime === 'number') {
          // 如果是时间戳
          messageTime = msg.sendTime;
        }
      }
      
      return {
        id: msg.messageId,
        messageId: msg.messageId,
        type: isSent ? 'sent' : 'received',
        content: msg.msgContent,
        time: messageTime,
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
        
        // 1. 先通过HTTP API保存到数据库
        const response = await addMessage(messageData);
        
        // 2. 保存成功后，通过WebSocket实时推送给对方（不重复保存）
        if (response.code === 200 && this.wsConnected && wsManager.getStatus().isConnected) {
          try {
            // WebSocket只用于实时通知，消息已通过HTTP保存
            wsManager.sendTextMessage({
              ...messageData,
              messageId: response.data.messageId // 带上消息ID
            });
          } catch (error) {
            console.error('WebSocket推送失败:', error);
          }
        }
        
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
      if (this.messages.length > 0) {
        this.scrollIntoView = 'msg-' + (this.messages.length - 1);
        this.isAtBottom = true;
      }
    },
    
    onScroll(e) {
      // 监听滚动事件，判断是否在底部
      const { scrollTop, scrollHeight, clientHeight } = e.detail;
      const threshold = 50; // 50rpx的阈值
      this.isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    },
    
    formatTime(timestamp) {
      // 确保timestamp是有效的数字
      if (!timestamp || isNaN(timestamp)) {
        return '';
      }
      
      const date = new Date(timestamp);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return '';
      }
      
      const now = new Date();
      const diff = now.getTime() - timestamp;
      
      // 如果时间差为负数或非常大，说明时间可能有问题
      if (diff < 0 || diff > 365 * 24 * 60 * 60 * 1000) {
        // 直接显示时间
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }
      
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
    // 检查是否是刷新后进入（页面栈只有1个）
    const pages = getCurrentPages();
    this.isRefreshed = (pages.length <= 1);
    
    // 如果是刷新状态，保存标记（防止返回到登录页）
    if (this.isRefreshed) {
      sessionStorage.setItem('chatRefreshed', 'true');
    }
    
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
    
    // 建立WebSocket连接（确保连接在onLoad时就建立）
    if (this.currentUser && this.currentUser.id) {
      await this.connectWebSocket();
    } else {
      console.warn('⚠️ 用户信息不完整，无法连接WebSocket');
    }
    
    // 滚动到底部（等待所有异步操作完成）
    this.$nextTick(() => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 500);
    });
  },
  
  onShow() {
    const status = wsManager.getStatus();
    
    // 只在真正断开时才重连（避免重复连接）
    if (!status.isConnected && !status.isInitialized && this.currentUser && this.currentUser.id) {
      this.connectWebSocket();
    } else if (status.isConnected) {
      this.wsConnected = true;
    }
    
    // 页面显示时滚动到底部
    this.$nextTick(() => {
      setTimeout(() => {
        this.scrollToBottom();
      }, 300);
    });
  },
  
  onHide() {
    // 页面隐藏时预留，暂无逻辑
  },
  
  onUnload() {
    // 页面卸载时断开WebSocket连接
    this.disconnectWebSocket();
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

/* 发送者名称样式 */
.sender-name {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
  margin-left: 10rpx;
}

.sent-name {
  margin-right: 10rpx;
  margin-left: 0;
  text-align: right;
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
