<template>
  <view class="page-wrapper">
    <sidebar current="customer-service"></sidebar>
    <view class="chat-container">
      <view class="chat-header">
      <text class="title">在线客服</text>
      <text class="status">{{ isOnline ? '在线' : '离线' }}</text>
    </view>
    
    <scroll-view scroll-y class="chat-list" :scroll-into-view="scrollToView">
      <view class="message" v-for="(msg, idx) in messages" :key="idx" :id="'msg-' + idx"
        :class="msg.type === 'user' ? 'user-msg' : 'service-msg'">
        <image class="avatar" :src="msg.type === 'user' ? '/static/logo.png' : '/static/logo.png'"></image>
        <view class="msg-content">
          <text class="msg-text">{{ msg.content }}</text>
          <text class="msg-time">{{ msg.time }}</text>
        </view>
      </view>
    </scroll-view>
    
    <view class="quick-replies">
      <scroll-view scroll-x>
        <view class="quick-item" v-for="item in quickReplies" :key="item" @click="sendQuickReply(item)">
          {{ item }}
        </view>
      </scroll-view>
    </view>
    
      <view class="input-bar">
        <input v-model="inputText" type="text" placeholder="请输入消息..." @confirm="sendMessage" />
        <button class="send-btn" @click="sendMessage">发送</button>
      </view>
    </view>
  </view>
</template>

<script>
import sidebar from '@/components/sidebar/sidebar.vue'
export default {
  components: { sidebar },
  data() {
    return {
      isOnline: true,
      inputText: '',
      scrollToView: '',
      quickReplies: ['订单问题', '配送延迟', '退款申请', '账号问题', '投诉建议'],
      messages: [
        { type: 'service', content: '您好，我是在线客服小助手，请问有什么可以帮您？', time: '10:00' }
      ]
    }
  },
  methods: {
    sendMessage() {
      if (!this.inputText.trim()) return
      this.messages.push({ type: 'user', content: this.inputText, time: this.getCurrentTime() })
      const userMsg = this.inputText
      this.inputText = ''
      this.scrollToBottom()
      setTimeout(() => {
        this.messages.push({ type: 'service', content: this.getAutoReply(userMsg), time: this.getCurrentTime() })
        this.scrollToBottom()
      }, 800)
    },
    sendQuickReply(text) {
      this.inputText = text
      this.sendMessage()
    },
    getAutoReply(msg) {
      if (msg.includes('订单')) return '关于订单问题，请提供您的订单号，我们会尽快为您查询处理。'
      if (msg.includes('配送') || msg.includes('延迟')) return '非常抱歉给您带来不便，配送延迟可能是由于天气或交通原因，我们会尽快为您跟进。'
      if (msg.includes('退款')) return '退款申请请在订单详情页面点击"申请退款"，我们会在1-3个工作日内处理。'
      if (msg.includes('账号')) return '账号问题请提供您的注册手机号，我们会为您核实处理。'
      return '感谢您的反馈，我们已记录您的问题，会尽快为您处理。'
    },
    getCurrentTime() {
      const now = new Date()
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    },
    scrollToBottom() {
      this.$nextTick(() => { this.scrollToView = 'msg-' + (this.messages.length - 1) })
    }
  }
}
</script>

<style scoped>
.page-wrapper { display: flex; min-height: 100vh; }
.chat-container { flex: 1; display: flex; flex-direction: column; height: 100vh; background: #f5f5f5; overflow-y: auto; }
.chat-header { display: flex; justify-content: space-between; align-items: center; padding: 30rpx; background: #4a90d9; color: #fff; }
.chat-header .title { font-size: 36rpx; font-weight: bold; }
.chat-header .status { font-size: 24rpx; padding: 6rpx 16rpx; background: rgba(255,255,255,0.2); border-radius: 20rpx; }
.chat-list { flex: 1; padding: 20rpx; }
.message { display: flex; margin-bottom: 30rpx; }
.user-msg { flex-direction: row-reverse; }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; }
.msg-content { max-width: 70%; margin: 0 20rpx; }
.msg-text { display: block; padding: 20rpx; border-radius: 16rpx; font-size: 28rpx; line-height: 1.5; }
.service-msg .msg-text { background: #fff; color: #333; }
.user-msg .msg-text { background: #4a90d9; color: #fff; }
.msg-time { font-size: 22rpx; color: #999; margin-top: 8rpx; display: block; }
.user-msg .msg-time { text-align: right; }
.quick-replies { padding: 16rpx 20rpx; background: #fff; border-top: 1rpx solid #eee; }
.quick-replies scroll-view { white-space: nowrap; }
.quick-item { display: inline-block; padding: 12rpx 24rpx; margin-right: 16rpx; background: #f0f0f0; border-radius: 30rpx; font-size: 24rpx; color: #666; }
.input-bar { display: flex; padding: 20rpx; background: #fff; border-top: 1rpx solid #eee; }
.input-bar input { flex: 1; height: 72rpx; background: #f5f5f5; border-radius: 36rpx; padding: 0 30rpx; font-size: 28rpx; }
.send-btn { width: 120rpx; height: 72rpx; margin-left: 20rpx; background: #4a90d9; color: #fff; font-size: 28rpx; border-radius: 36rpx; }
</style>
