<template>
  <view class="chat-container">
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
        <view v-if="msg.showTime" class="time-divider">
          <text class="time-text">{{ msg.time }}</text>
        </view>

        <view v-if="msg.type === 'system'" class="system-message">
          <text class="system-text">{{ msg.content }}</text>
        </view>

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
import { getMessageList, sendMessage as sendMessageAPI, uploadChatImage, sendLocation as sendLocationAPI, markChatRead } from '@/utils/chatApi.js';
import wsManager from '@/utils/websocket-protobuf-manager.js';
import { USER_TYPE, MSG_TYPE } from '@/utils/protobuf-schema.js';

export default {
  name: 'ChatPage',
  data() {
    return {
      sessionId: '',
      chatId: null,
      chatInfo: {
        title: '',
        icon: '',
        iconColor: '',
        unread: 0
      },
      sessionInfo: {
        fromType: null,
        fromId: null,
        toType: null,
        toId: null
      },
      messageList: [],
      inputMessage: '',
      scrollToView: '',
      showActions: false,
      pageNum: 1,
      pageSize: 50,
      hasMore: true,
      loading: false,
      handlePopState: null,
      pollingTimer: null,
      pollingInterval: 3000 // 轮询间隔3秒
    }
  },
  onLoad(options) {
    // #ifdef H5
    this.handlePopState = () => {
      const pages = getCurrentPages();
      if (pages.length <= 1) {
        history.pushState(null, '', location.href);
        uni.reLaunch({
          url: '/pages/message/message'
        });
      }
    };
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', this.handlePopState);
    // #endif

    console.log('chat.vue onLoad options:', options);
    if (options.sessionId) {
      this.sessionId = options.sessionId;
      console.log('设置sessionId:', this.sessionId);
    }
    if (options.chatId) {
      this.chatId = options.chatId;
      this.sessionId = this.sessionId || options.chatId;
    }
    if (options.title) {
      this.chatInfo.title = decodeURIComponent(options.title);
    }
    if (options.icon) {
      this.chatInfo.icon = decodeURIComponent(options.icon);
    }

    if (options.fromType) {
      this.sessionInfo.fromType = parseInt(options.fromType);
    }
    if (options.fromId) {
      this.sessionInfo.fromId = String(options.fromId);
    }
    if (options.toType) {
      this.sessionInfo.toType = parseInt(options.toType);
    }
    if (options.toId) {
      this.sessionInfo.toId = String(options.toId);
    }

    this.loadMessages();
    if (this.sessionId) {
      this.markAsRead();
    }
    this.connectWebSocket();
    this.startPolling();
  },
  onUnload() {
    this.stopPolling();
    try {
      const index = wsManager.messageHandlers.indexOf(this.handleWebSocketMessage);
      if (index > -1) {
        wsManager.messageHandlers.splice(index, 1);
      }
    } catch (error) {
      console.error('移除handler失败:', error);
    }
    // #ifdef H5
    if (this.handlePopState) {
      window.removeEventListener('popstate', this.handlePopState);
    }
    // #endif
  },
  onHide() {
    this.stopPolling();
  },
  onShow() {
    this.startPolling();
  },
  onBackPress() {
    const pages = getCurrentPages();
    if (pages.length <= 1) {
      uni.reLaunch({
        url: '/pages/message/message'
      });
      return true;
    }
    return false;
  },
  methods: {
    async loadMessages() {
      if (this.loading || !this.hasMore || !this.sessionId) {
        return;
      }
      this.loading = true;
      try {
        const res = await getMessageList({
          sessionId: this.sessionId,
          chatId: this.sessionId,
          pageNum: this.pageNum,
          pageSize: this.pageSize
        });
        const success = res.data.code === 200 || res.data.code === 0;
        if (success) {
          const messages = res.data.data || res.data.rows || [];
          const formattedMessages = messages.map(msg => this.formatMessage(msg));
          this.messageList = [...formattedMessages, ...this.messageList];
          this.hasMore = messages.length >= this.pageSize;
          this.pageNum++;
          if (this.pageNum === 2) {
            this.$nextTick(() => {
              this.scrollToBottom();
            });
          }
        } else {
          uni.showToast({
            title: res.data.msg || '加载消息失败',
            icon: 'none'
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

    formatMessage(msg) {
      const merchantInfo = uni.getStorageSync('merchantInfo') || {};
      const merchantId = String(merchantInfo.merchantBaseId || merchantInfo.id || '');
      const isSelf = msg.fromType === 3 && String(msg.fromId) === merchantId;

      let messageType = 'text';
      let displayType = 'normal';
      if (msg.msgType === 2) {
        messageType = 'image';
      } else if (msg.msgType === 3) {
        messageType = 'voice';
      } else if (msg.msgType === 4) {
        messageType = 'system';
        displayType = 'system';
      }

      return {
        id: msg.messageId,
        type: displayType,
        isSelf: isSelf,
        avatar: isSelf ? '🙂' : (this.chatInfo.icon || '👤'),
        content: msg.msgContent || '',
        time: this.formatTime(new Date(msg.sendTime || msg.createTime)),
        showTime: msg.showTime || false,
        messageType: messageType,
        msgStatus: msg.msgStatus,
        sessionId: msg.sessionId,
        fromType: msg.fromType,
        fromId: msg.fromId,
        toType: msg.toType,
        toId: msg.toId
      };
    },

    async sendMessage() {
      if (!this.inputMessage.trim()) {
        return;
      }
      if (!this.sessionId) {
        uni.showToast({
          title: '会话ID不存在',
          icon: 'none'
        });
        return;
      }
      if (!this.sessionInfo.toType || !this.sessionInfo.toId) {
        uni.showToast({
          title: '会话信息不完整',
          icon: 'none'
        });
        return;
      }

      const content = this.inputMessage.trim();
      this.inputMessage = '';

      const tempMessage = {
        type: 'normal',
        isSelf: true,
        avatar: '🙂',
        content: content,
        time: this.formatTime(new Date()),
        showTime: false,
        sending: true
      };

      this.messageList.push(tempMessage);
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        const res = await sendMessageAPI({
          sessionId: this.sessionId,
          chatId: this.sessionId,
          toType: this.sessionInfo.toType,
          toId: this.sessionInfo.toId,
          msgContent: content,
          content,
          msgType: 1,
          messageType: 'text'
        });

        const success = res.data.code === 200 || res.data.code === 0;
        if (success) {
          tempMessage.sending = false;
          tempMessage.id = res.data.data?.messageId || res.data.data;

          const status = wsManager.getStatus();
          if (status.isConnected && status.isRegistered) {
            try {
              const merchantInfo = uni.getStorageSync('merchantInfo');
              await wsManager.sendTextMessage({
                sessionId: this.sessionId,
                fromType: 3,
                fromId: String(merchantInfo.id),
                toType: this.sessionInfo.fromType,
                toId: this.sessionInfo.fromId,
                content: content
              });
            } catch (err) {
              console.warn('⚠️ WebSocket发送失败，消息已通过HTTP保存:', err);
            }
          }
        } else {
          tempMessage.sendFailed = true;
          uni.showToast({
            title: res.data.msg || '发送失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('发送消息失败:', error);
        tempMessage.sendFailed = true;
        uni.showToast({
          title: '发送失败',
          icon: 'none'
        });
      }
    },

    handleWebSocketMessage(message) {
      const msgType = message.msg_type || message.msgType;
      const sessionId = String(message.session_id || message.sessionId || '');
      const msgContent = message.msg_content || message.msgContent;
      const fromId = String(message.from_id || message.fromId || '');

      const merchantInfo = uni.getStorageSync('merchantInfo');
      if (merchantInfo && merchantInfo.id && fromId) {
        const currentMerchantId = String(merchantInfo.id);
        const isSelf = fromId.substring(0, 10) === currentMerchantId.substring(0, 10);
        if (isSelf) {
          return;
        }
      }

      const currentSessionId = String(this.sessionId || '');
      const sessionMatches = sessionId.includes(currentSessionId.substring(0, 10)) ||
        currentSessionId.includes(sessionId.substring(0, 10));

      if (msgType === MSG_TYPE.TEXT && sessionMatches) {
        const newMessage = {
          type: 'normal',
          isSelf: false,
          avatar: '👤',
          content: msgContent,
          time: this.formatTime(new Date()),
          showTime: false
        };
        this.messageList.push(newMessage);
        this.$nextTick(() => {
          this.scrollToBottom();
        });
        this.markAsRead();
      }
    },

    async connectWebSocket() {
      const status = wsManager.getStatus();
      if (status.isConnected && status.isRegistered) {
        wsManager.addMessageHandler(this.handleWebSocketMessage);
        return;
      }

      const merchantInfo = uni.getStorageSync('merchantInfo');
      if (!merchantInfo || !merchantInfo.id) {
        console.warn('⚠️ 商家信息不完整，无法连接WebSocket');
        return;
      }

      try {
        await wsManager.init();
        await wsManager.connect(USER_TYPE.MERCHANT, merchantInfo.id);
        wsManager.addMessageHandler(this.handleWebSocketMessage);
      } catch (error) {
        console.error('❌ WebSocket连接失败:', error);
      }
    },

    disconnectWebSocket() {
      wsManager.disconnect();
    },

    async markAsRead() {
      console.log('markAsRead调用，sessionId:', this.sessionId);
      if (!this.sessionId) {
        console.warn('sessionId为空，跳过标记已读');
        return;
      }
      try {
        await markChatRead(this.sessionId);
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    },

    // 开始轮询
    startPolling() {
      if (this.pollingTimer) return;
      console.log('开始消息轮询');
      this.pollingTimer = setInterval(() => {
        this.pollMessages();
      }, this.pollingInterval);
    },

    // 停止轮询
    stopPolling() {
      if (this.pollingTimer) {
        console.log('停止消息轮询');
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    },

    // 轮询获取新消息
    async pollMessages() {
      if (!this.sessionId) return;
      try {
        const res = await getMessageList({
          sessionId: this.sessionId,
          pageNum: 1,
          pageSize: 20
        });
        if (res.data && (res.data.code === 200 || res.data.code === 0)) {
          const messages = res.data.data || res.data.rows || [];
          const merchantInfo = uni.getStorageSync('merchantInfo') || {};
          const merchantId = String(merchantInfo.merchantBaseId || merchantInfo.id || '');
          
          // 过滤新消息：排除已存在的消息（通过ID或内容匹配）
          const newMessages = messages.filter(msg => {
            const msgId = msg.messageId || msg.id;
            const msgContent = msg.msgContent || msg.content;
            // 检查ID是否已存在
            const idExists = this.messageList.some(m => m.id && m.id === msgId);
            // 检查内容是否已存在（用于匹配发送中的消息）
            const contentExists = this.messageList.some(m => 
              m.content === msgContent && m.isSelf && !m.id
            );
            return !idExists && !contentExists;
          });
          
          if (newMessages.length > 0) {
            // 只添加对方发送的新消息
            const otherMessages = newMessages.filter(msg => {
              const isSelf = String(msg.fromId) === merchantId && msg.fromType === 3;
              return !isSelf;
            });
            
            if (otherMessages.length > 0) {
              console.log('轮询发现对方新消息:', otherMessages.length);
              otherMessages.forEach(msg => {
                this.messageList.push({
                  id: msg.messageId || msg.id,
                  type: 'normal',
                  isSelf: false,
                  avatar: '👤',
                  content: msg.msgContent || msg.content,
                  time: this.formatTime(new Date(msg.sendTime || msg.createTime)),
                  showTime: false
                });
              });
              
              this.$nextTick(() => {
                this.scrollToBottom();
              });
              this.markAsRead();
            }
          }
        }
      } catch (error) {
        console.error('轮询消息失败:', error);
      }
    },

    scrollToBottom() {
      if (this.messageList.length > 0) {
        this.scrollToView = 'msg-' + (this.messageList.length - 1);
      }
    },

    formatTime(date) {
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) {
        return '刚刚';
      } else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
      } else if (diff < 86400000) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      } else if (diff < 172800000) {
        return '昨天';
      } else {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}-${day}`;
      }
    },

    showMoreActions() {
      this.showActions = true;
    },

    hideActions() {
      this.showActions = false;
    },

    selectImage() {
      if (!this.sessionId) {
        uni.showToast({
          title: '会话ID不存在',
          icon: 'none'
        });
        return;
      }
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const filePath = res.tempFilePaths[0];
          uni.showLoading({
            title: '上传中...'
          });
          try {
            const uploadRes = await uploadChatImage(filePath, this.sessionId);
            const success = uploadRes.code === 200 || uploadRes.code === 0;
            if (success) {
              const newMessage = {
                type: 'normal',
                isSelf: true,
                avatar: '🙂',
                content: '[图片]',
                time: this.formatTime(new Date()),
                showTime: false,
                imageUrl: uploadRes.data?.imageUrl || uploadRes.data
              };
              this.messageList.push(newMessage);
              this.$nextTick(() => {
                this.scrollToBottom();
              });
              uni.showToast({
                title: '发送成功',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: uploadRes.msg || '上传失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('上传图片失败:', error);
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            });
          } finally {
            uni.hideLoading();
            this.hideActions();
          }
        },
        fail: () => {
          this.hideActions();
        }
      });
    },

    selectFile() {
      uni.showToast({
        title: '文件功能开发中',
        icon: 'none'
      });
      this.hideActions();
    },

    sendLocation() {
      if (!this.sessionId) {
        uni.showToast({
          title: '会话ID不存在',
          icon: 'none'
        });
        return;
      }
      if (!this.sessionInfo.toType || !this.sessionInfo.toId) {
        uni.showToast({
          title: '会话信息不完整',
          icon: 'none'
        });
        return;
      }
      uni.chooseLocation({
        success: async (res) => {
          uni.showLoading({
            title: '发送中...'
          });
          try {
            const locationRes = await sendLocationAPI({
              sessionId: this.sessionId,
              fromType: this.sessionInfo.fromType,
              fromId: this.sessionInfo.fromId,
              toType: this.sessionInfo.toType,
              toId: this.sessionInfo.toId,
              latitude: res.latitude.toString(),
              longitude: res.longitude.toString(),
              address: res.address,
              name: res.name
            });
            const success = locationRes.data?.code === 200 || locationRes.data?.code === 0;
            if (success) {
              const newMessage = {
                type: 'normal',
                isSelf: true,
                avatar: '🙂',
                content: `[位置] ${res.name || res.address}`,
                time: this.formatTime(new Date()),
                showTime: false,
                location: {
                  latitude: res.latitude,
                  longitude: res.longitude,
                  address: res.address,
                  name: res.name
                }
              };
              this.messageList.push(newMessage);
              this.$nextTick(() => {
                this.scrollToBottom();
              });
              uni.showToast({
                title: '发送成功',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: locationRes.data?.msg || '发送失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('发送位置失败:', error);
            uni.showToast({
              title: '发送失败',
              icon: 'none'
            });
          } finally {
            uni.hideLoading();
            this.hideActions();
          }
        },
        fail: () => {
          this.hideActions();
        }
      });
    },

    callPhone() {
      uni.showToast({
        title: '语音通话功能',
        icon: 'none'
      });
      this.hideActions();
    },

    goBack() {
      const pages = getCurrentPages();
      if (pages.length <= 1) {
        const token = uni.getStorageSync('token');
        if (token) {
          uni.switchTab({
            url: '/pages/index/index'
          });
        } else {
          uni.redirectTo({
            url: '/pages/login/login',
            fail: () => {
              uni.reLaunch({
                url: '/pages/login/login'
              });
            }
          });
        }
      } else {
        uni.navigateBack();
      }
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

.message-list {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.message-item {
  margin-bottom: 30rpx;
}

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

