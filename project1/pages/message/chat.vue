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
import { getMessageList, sendMessage as sendMessageAPI, uploadChatImage, sendLocation as sendLocationAPI, chatWebSocket, markChatRead } from '@/utils/chatApi.js';

export default {
  name: 'ChatPage',
  data() {
    return {
      sessionId: null, // 会话ID
      chatId: null, // 兼容旧字段
      chatInfo: {
        title: '',
        icon: '',
        iconColor: ''
      },
      // 会话参与方信息
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
      loading: false
    }
  },
  onLoad(options) {
    // 接收从消息列表传来的参数
    if (options.sessionId || options.chatId) {
      this.sessionId = parseInt(options.sessionId || options.chatId);
      this.chatId = this.sessionId; // 兼容
    }
    if (options.title) {
      this.chatInfo.title = decodeURIComponent(options.title);
    }
    if (options.icon) {
      this.chatInfo.icon = decodeURIComponent(options.icon);
    }
    if (options.iconColor) {
      this.chatInfo.iconColor = decodeURIComponent(options.iconColor);
    }
    
    // 接收会话参与方信息
    if (options.fromType) {
      this.sessionInfo.fromType = parseInt(options.fromType);
    }
    if (options.fromId) {
      this.sessionInfo.fromId = parseInt(options.fromId);
    }
    if (options.toType) {
      this.sessionInfo.toType = parseInt(options.toType);
    }
    if (options.toId) {
      this.sessionInfo.toId = parseInt(options.toId);
    }
    
    // 加载历史消息
    this.loadMessages();
    
    // 标记会话为已读
    if (this.sessionId) {
      this.markAsRead();
    }
    
    // 连接WebSocket
    this.connectWebSocket();
  },
  onUnload() {
    // 页面卸载时断开WebSocket
    this.disconnectWebSocket();
  },
  methods: {
    // 加载历史消息
    async loadMessages() {
      if (this.loading || !this.hasMore || !this.sessionId) {
        return;
      }
      
      this.loading = true;
      
      try {
        const res = await getMessageList({
          sessionId: this.sessionId,
          chatId: this.sessionId, // 兼容
          pageNum: this.pageNum,
          pageSize: this.pageSize
        });
        
        const success = res.data.code === 200 || res.data.code === 0;
        
        if (success) {
          const messages = res.data.data || res.data.rows || [];
          
          // 转换消息格式，适配后端ChatMessage实体
          const formattedMessages = messages.map(msg => this.formatMessage(msg));
          
          // 插入到消息列表前面（历史消息）
          this.messageList = [...formattedMessages, ...this.messageList];
          
          // 判断是否还有更多消息
          this.hasMore = messages.length >= this.pageSize;
          this.pageNum++;
          
          // 第一次加载滚动到底部
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
    
    // 格式化消息数据，适配后端ChatMessage实体
    formatMessage(msg) {
      // 获取商户信息，判断是否是自己发送的
      const merchantInfo = uni.getStorageSync('merchantInfo') || {};
      const merchantId = merchantInfo.merchantBaseId || merchantInfo.id;
      const isSelf = msg.fromType === 3 && msg.fromId === merchantId;
      
      // 消息类型转换：1-文本 2-图片 3-语音 4-系统通知
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
        msgStatus: msg.msgStatus, // 0-发送中 1-已送达 2-已读 3-已撤回 4-发送失败
        // 保存原始数据
        sessionId: msg.sessionId,
        fromType: msg.fromType,
        fromId: msg.fromId,
        toType: msg.toType,
        toId: msg.toId
      };
    },
    
    // 发送消息
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
      
      // 检查会话参与方信息
      if (!this.sessionInfo.toType || !this.sessionInfo.toId) {
        uni.showToast({
          title: '会话信息不完整',
          icon: 'none'
        });
        return;
      }
      
      const content = this.inputMessage.trim();
      this.inputMessage = '';
      
      // 先在界面上显示消息（乐观更新）
      const tempMessage = {
        type: 'normal',
        isSelf: true,
        avatar: '🙂',
        content: content,
        time: this.formatTime(new Date()),
        showTime: false,
        sending: true // 发送中标记
      };
      
      this.messageList.push(tempMessage);
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      try {
        // 发送消息到后端
        const res = await sendMessageAPI({
          sessionId: this.sessionId,
          chatId: this.sessionId, // 兼容
          toType: this.sessionInfo.toType,
          toId: this.sessionInfo.toId,
          msgContent: content,
          content: content, // 兼容
          msgType: 1, // 1-文本
          messageType: 'text' // 兼容
        });
        
        const success = res.data.code === 200 || res.data.code === 0;
        
        if (success) {
          // 发送成功，更新消息状态
          tempMessage.sending = false;
          tempMessage.id = res.data.data?.messageId || res.data.data;
          
          // 通过WebSocket通知对方（如果WebSocket已连接）
          if (chatWebSocket.isConnected) {
            chatWebSocket.send({
              type: 'message',
              sessionId: this.sessionId,
              messageId: tempMessage.id,
              content: content
            });
          }
        } else {
          // 发送失败，标记失败
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
    
    // 接收WebSocket消息
    handleWebSocketMessage(data) {
      console.log('收到WebSocket消息:', data);
      
      // 处理不同类型的消息
      if (data.type === 'message' && data.sessionId === this.sessionId) {
        // 收到新消息
        const newMessage = this.formatMessage(data.message || data);
        this.messageList.push(newMessage);
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
        
        // 标记为已读
        this.markAsRead();
      } else if (data.type === 'auth' && data.success) {
        // 认证成功
        console.log('WebSocket认证成功');
      } else if (data.type === 'heartbeat') {
        // 心跳响应
        console.log('收到心跳响应');
      }
    },
    
    // 连接WebSocket
    connectWebSocket() {
      chatWebSocket.connect({
        onMessage: this.handleWebSocketMessage.bind(this),
        onError: (err) => {
          console.error('WebSocket错误:', err);
        },
        onClose: () => {
          console.log('WebSocket连接关闭');
        }
      });
    },
    
    // 断开WebSocket
    disconnectWebSocket() {
      chatWebSocket.close();
    },
    
    // 标记为已读
    async markAsRead() {
      if (!this.sessionId) return;
      
      try {
        await markChatRead(this.sessionId);
      } catch (error) {
        console.error('标记已读失败:', error);
      }
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
          
          // 显示上传中
          uni.showLoading({
            title: '上传中...'
          });
          
          try {
            const uploadRes = await uploadChatImage(filePath, this.sessionId);
            
            const success = uploadRes.code === 200 || uploadRes.code === 0;
            
            if (success) {
              // 添加图片消息
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
    
    // 选择文件
    selectFile() {
      uni.showToast({
        title: '文件功能开发中',
        icon: 'none'
      });
      this.hideActions();
    },
    
    // 发送位置
    sendLocation() {
      if (!this.sessionId) {
        uni.showToast({
          title: '会话ID不存在',
          icon: 'none'
        });
        return;
      }
      
      // 检查会话参与方信息
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
              // 添加位置消息
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
      // 获取当前页面栈
      const pages = getCurrentPages();
      
      // 如果页面栈只有一个页面（说明是刷新后直接进入的），则跳转到首页
      if (pages.length <= 1) {
        uni.reLaunch({
          url: '/pages/index/index'
        });
      } else {
        // 否则正常返回上一页
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

