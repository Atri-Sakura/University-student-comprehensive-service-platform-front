<template>
  <view class="chat-container">
    <!-- 聊天消息区域 -->
    <view class="chat-messages" ref="chatScrollView">
      <!-- 系统欢迎消息 -->
      <view class="message-item system-message" v-for="(msg, index) in systemMessages" :key="'system-' + index">
        <view class="message-avatar">
            <text class="avatar-emoji">🏪</text>
          </view>
        <view class="message-content">
          <view class="message-bubble system-bubble">
            <text class="message-text">{{ msg.content }}</text>
          </view>
        </view>
      </view>

      <!-- 用户消息 -->
      <view class="message-item user-message" v-for="(msg, index) in userMessages" :key="'user-' + index">
        <view class="message-content user-content">
          <view class="message-bubble user-bubble">
            <text class="message-text">{{ msg.content }}</text>
          </view>
        </view>
        <view class="message-avatar user-avatar">
            <text class="avatar-emoji">👤</text>
          </view>
      </view>
    </view>

    <!-- 底部操作区域（包含选择订单和聊天输入） -->
      <view class="bottom-action-area">
        <!-- 选择订单按钮 -->
        <view class="action-buttons">
          <button class="select-order-btn" @click="handleSelectOrder">≡ 选择订单</button>
        </view>
        
        <!-- 聊天输入区域 -->
        <view class="chat-input-area">
          <view class="input-wrapper">
            <text class="voice-icon" @click="toggleVoiceInput">🎤</text>
            <input 
              class="chat-input" 
              type="text" 
              placeholder="请输入聊天内容..." 
              v-model="inputContent" 
              @focus="onInputFocus"
            />
            <text class="emoji-icon" @click="toggleEmojiPanel">😊</text>
            <text class="add-icon" @click="showMoreOptions">➕</text>
          </view>
          <button class="send-btn" @click="sendMessage" :disabled="!inputContent.trim()">发送</button>
        </view>
      </view>

    <!-- 自定义底部导航栏 - 固定在底部 -->
    <custom-tabbar :current="3" style="position: fixed; bottom: 0; left: 0; right: 0; z-index: 101;"></custom-tabbar>
  </view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      systemMessages: [
        { id: 1, content: '我是校园服务平台客服，请问有什么能帮助您？' },
        { id: 2, content: '请选择您想退订的订单。' }
      ],
      userMessages: [
        { id: 1, content: '我想退订单' }
      ],
      inputContent: '',
      isVoiceInput: false,
      showEmojiPanel: false
    };
  },
  methods: {
    // 发送消息
    sendMessage() {
      if (!this.inputContent.trim()) return;
      
      // 添加用户消息
      this.userMessages.push({
        id: Date.now(),
        content: this.inputContent.trim()
      });
      
      // 清空输入框
      this.inputContent = '';
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // 模拟客服回复
      setTimeout(() => {
        this.systemMessages.push({
          id: Date.now(),
          content: '正在为您处理，请稍候...' // 这里可以根据不同的用户输入提供不同的回复
        });
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }, 1000);
    },
    
    // 选择订单
    handleSelectOrder() {
      console.log('选择订单');
      // 这里可以跳转到订单选择页面或显示订单列表
      uni.showToast({
        title: '订单选择功能开发中',
        icon: 'none'
      });
    },
    
    // 切换语音输入
    toggleVoiceInput() {
      console.log('切换语音输入');
      this.isVoiceInput = !this.isVoiceInput;
      // 实际项目中可以集成语音识别功能
    },
    
    // 切换表情面板
    toggleEmojiPanel() {
      console.log('切换表情面板');
      this.showEmojiPanel = !this.showEmojiPanel;
    },
    
    // 显示更多选项
    showMoreOptions() {
      console.log('显示更多选项');
      // 可以显示图片发送、位置发送等选项
      uni.showActionSheet({
        itemList: ['发送图片', '发送位置', '发送文件'],
        success: (res) => {
          console.log('选择了:', res.tapIndex);
        }
      });
    },
    
    // 输入框获取焦点
    onInputFocus() {
      // 隐藏表情面板
      this.showEmojiPanel = false;
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    
    // 滚动到底部
    scrollToBottom() {
      const scrollView = this.$refs.chatScrollView;
      if (scrollView) {
        scrollView.scrollTop = scrollView.scrollHeight;
      }
    }
  },
  mounted() {
    // 页面加载完成后滚动到底部
    this.$nextTick(() => {
      this.scrollToBottom();
    });
  },
  onLoad() {
    // 设置导航栏标题
    uni.setNavigationBarTitle({
      title: '客服专线'
    });
  }
};
</script>

<style scoped>
.chat-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  display: flex;
  flex-direction: column;
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  max-height: calc(100vh - 300rpx); /* 限制聊天内容区域的最大高度 */
}

.message-item {
  display: flex;
  margin-bottom: 30rpx;
  align-items: flex-start;
}

/* 系统消息样式 */
.system-message {
  justify-content: flex-start;
}

/* 用户消息样式 - 头像在右 */
.user-message {
  justify-content: flex-end;
}

/* 消息头像基础样式 */
.message-avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #E5E5E5;
}

/* 系统消息头像 - 在左侧，右侧有间距 */
.system-message .message-avatar {
  margin-right: 20rpx;
}

/* 用户消息头像 - 在右侧，左侧有间距 */
.user-message .message-avatar {
  margin-left: 20rpx;
}

.avatar-emoji {
  font-size: 40rpx;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

/* 用户消息内容 - 文字靠右 */
.user-content {
  align-items: flex-end;
  margin-right: 0;
}

.message-bubble {
  padding: 20rpx 28rpx;
  border-radius: 16rpx;
  word-wrap: break-word;
  word-break: break-all;
}

.system-bubble {
  background-color: white;
  border-top-left-radius: 4rpx;
}

.user-bubble {
  background-color: #5DCDFF;
  color: white;
  border-top-right-radius: 4rpx;
}

.message-text {
  font-size: 32rpx;
  line-height: 1.5;
}

.user-bubble .message-text {
  color: white;
}

/* 选择订单按钮 */
.action-buttons {
  padding: 20rpx 30rpx 0;
  background-color: white;
  border-top: 1rpx solid #EEEEEE;
}

.select-order-btn {
  width: 220rpx;
  height: 70rpx;
  background-color: #5DCDFF;
  color: white;
  font-size: 28rpx;
  border: none;
  border-radius: 35rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 聊天输入区域 */
.chat-input-area {
  padding: 15rpx 25rpx;
  background-color: white;
  display: flex;
  align-items: center;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #F5F5F5;
  border-radius: 35rpx;
  padding: 0 15rpx;
  margin-right: 15rpx;
}

.voice-icon,
.emoji-icon,
.add-icon {
  font-size: 40rpx;
  margin: 0 10rpx;
  width: 50rpx;
  text-align: center;
}

.chat-input {
  flex: 1;
  height: 60rpx; /* 缩短输入框高度 */
  background-color: transparent;
  font-size: 28rpx;
  padding: 0 10rpx;
}

.send-btn {
  width: 110rpx;
  height: 60rpx; /* 缩短发送按钮高度 */
  background-color: #5DCDFF;
  color: white;
  font-size: 28rpx;
  border: none;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn[disabled] {
  background-color: #CCCCCC;
}

/* 去除默认样式 */
input::-webkit-input-placeholder {
  color: #999999;
  font-size: 30rpx;
}

input:-moz-placeholder {
  color: #999999;
  font-size: 30rpx;
}

input::-moz-placeholder {
  color: #999999;
  font-size: 30rpx;
}

input:-ms-input-placeholder {
  color: #999999;
  font-size: 30rpx;
}

.bottom-action-area {
  position: fixed;
  bottom: 100rpx; /* 确保在导航栏上方 */
  left: 0;
  right: 0;
  z-index: 100;
  background-color: white;
  border-top: 1rpx solid #EEEEEE;
}
</style>