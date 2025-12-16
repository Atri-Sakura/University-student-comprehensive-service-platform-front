<template>
  <view class="chat-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">客服专线</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>
    
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
            <!-- 如果是订单消息，显示订单卡片 -->
            <view v-if="msg.type === 'order'" class="order-message-card">
              <view class="order-card-header">
                <text class="order-card-title">订单信息</text>
                <text class="order-status-badge" :class="getOrderStatusClass(msg.order.orderStatus)">{{ getOrderStatusText(msg.order.orderStatus) }}</text>
              </view>
              <view class="order-card-content">
                <view class="order-info-row">
                  <text class="order-label">订单号：</text>
                  <text class="order-value">{{ msg.order.orderNo }}</text>
                </view>
                <view class="order-info-row" v-if="msg.order.goodsName">
                  <text class="order-label">商品：</text>
                  <text class="order-value">{{ msg.order.goodsName }}</text>
                </view>
                <view class="order-info-row">
                  <text class="order-label">金额：</text>
                  <text class="order-value price">¥{{ msg.order.totalAmount || msg.order.paymentAmount || '0.00' }}</text>
                </view>
                <view class="order-info-row" v-if="msg.order.createTime">
                  <text class="order-label">时间：</text>
                  <text class="order-value">{{ msg.order.createTime }}</text>
                </view>
              </view>
            </view>
            <!-- 普通文本消息 -->
            <text v-else class="message-text">{{ msg.content }}</text>
          </view>
        </view>
        <view class="message-avatar user-avatar">
            <text class="avatar-emoji">👤</text>
          </view>
      </view>
    </view>

    <!-- 订单选择弹窗 -->
    <view class="order-modal" v-if="showOrderModal" @click="closeOrderModal">
      <view class="order-modal-content" @click.stop>
        <view class="order-modal-header">
          <text class="modal-title">选择订单</text>
          <text class="modal-close" @click="closeOrderModal">✕</text>
        </view>
        <view class="order-modal-body">
          <!-- 加载状态 -->
          <view v-if="loadingOrders" class="loading-orders">
            <text class="loading-text">加载中...</text>
          </view>
          <!-- 订单列表 -->
          <scroll-view v-else class="order-list-scroll" scroll-y>
            <view 
              v-for="(order, index) in orderList" 
              :key="order.orderNo || index" 
              class="order-select-item"
              @click="selectOrder(order)"
            >
              <view class="order-select-content">
                <view class="order-select-info">
                  <text class="order-select-no">订单号：{{ order.orderNo }}</text>
                  <text class="order-select-goods" v-if="getOrderGoodsName(order)">{{ getOrderGoodsName(order) }}</text>
                  <text class="order-select-time" v-if="order.createTime">{{ order.createTime }}</text>
                </view>
                <view class="order-select-right">
                  <text class="order-select-price">¥{{ order.totalAmount || order.paymentAmount || '0.00' }}</text>
                  <text class="order-select-status" :class="getOrderStatusClass(order.orderStatus)">{{ getOrderStatusText(order.orderStatus) }}</text>
                </view>
              </view>
            </view>
            <!-- 空状态 -->
            <view v-if="!loadingOrders && orderList.length === 0" class="empty-orders">
              <text class="empty-text">暂无订单</text>
            </view>
          </scroll-view>
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
            <text class="add-icon" @click="showMoreOptions">➕</text>
          </view>
          <button class="send-btn" @click="sendMessage" :disabled="!inputContent.trim()">发送</button>
        </view>
      </view>

  </view>
</template>

<script>
import api from '@/api/index.js';

export default {
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
      showOrderModal: false,
      orderList: [],
      loadingOrders: false
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
    async handleSelectOrder() {
      this.showOrderModal = true;
      await this.loadOrderList();
    },
    
    // 加载订单列表
    async loadOrderList() {
      try {
        this.loadingOrders = true;
        uni.showLoading({ title: '加载中...' });
        
        const res = await api.order.getOrderList();
        
        if (res && res.code === 200) {
          const orderList = res.rows || res.data || [];
          // 只显示未取消的订单（状态不为5）
          this.orderList = orderList.filter(order => order.orderStatus !== 5);
        } else {
          uni.showToast({
            title: res?.msg || res?.message || '获取订单失败',
            icon: 'none'
          });
          this.orderList = [];
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
        this.orderList = [];
      } finally {
        this.loadingOrders = false;
        uni.hideLoading();
      }
    },
    
    // 选择订单
    selectOrder(order) {
      // 添加订单消息到用户消息列表
      this.userMessages.push({
        id: Date.now(),
        type: 'order',
        order: {
          orderNo: order.orderNo,
          orderStatus: order.orderStatus,
          totalAmount: order.totalAmount || order.paymentAmount || '0.00',
          createTime: order.createTime,
          goodsName: this.getOrderGoodsName(order)
        }
      });
      
      // 关闭弹窗
      this.closeOrderModal();
      
      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // 模拟客服回复
      setTimeout(() => {
        this.systemMessages.push({
          id: Date.now(),
          content: `已收到您的订单信息（订单号：${order.orderNo}），正在为您处理...`
        });
        
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }, 1000);
    },
    
    // 关闭订单选择弹窗
    closeOrderModal() {
      this.showOrderModal = false;
    },
    
    // 获取订单商品名称
    getOrderGoodsName(order) {
      // 尝试从各种可能的路径获取商品名称
      let goodsName = null;
      
      // 路径1: orderTakeoutDetailList
      if (order.orderTakeoutDetailList && order.orderTakeoutDetailList.length > 0) {
        for (const takeoutDetail of order.orderTakeoutDetailList) {
          if (takeoutDetail.goodsName) {
            goodsName = takeoutDetail.goodsName;
            break;
          }
          if (takeoutDetail.createOrderItemList && takeoutDetail.createOrderItemList.length > 0) {
            goodsName = takeoutDetail.createOrderItemList[0].goodsName;
            break;
          }
        }
      }
      
      // 路径2: orderItemList
      if (!goodsName && order.orderItemList && order.orderItemList.length > 0) {
        goodsName = order.orderItemList[0].goodsName;
      }
      
      // 路径3: createOrderItemList（顶层）
      if (!goodsName && order.createOrderItemList && order.createOrderItemList.length > 0) {
        goodsName = order.createOrderItemList[0].goodsName;
      }
      
      // 路径4: 尝试直接从order对象获取
      if (!goodsName && order.goodsName) {
        goodsName = order.goodsName;
      }
      
      // 路径5: 检查其他可能的字段名
      const otherFields = ['orderGoods', 'items', 'products'];
      for (const field of otherFields) {
        if (!goodsName && order[field] && order[field].length > 0) {
          if (order[field][0].goodsName) {
            goodsName = order[field][0].goodsName;
            break;
          }
        }
      }
      
      // 最后回退到默认文本
      if (!goodsName) {
        goodsName = order.pickAddress || '订单商品';
      }
      
      return goodsName;
    },
    
    // 获取订单状态文本
    getOrderStatusText(status) {
      const statusMap = {
        1: '待接单',
        2: '待取货',
        3: '配送中',
        4: '已完成',
        5: '已取消'
      };
      return statusMap[status] || '未知状态';
    },
    
    // 获取订单状态样式类
    getOrderStatusClass(status) {
      const statusMap = {
        1: 'status-waiting',
        2: 'status-progress',
        3: 'status-progress',
        4: 'status-completed',
        5: 'status-canceled'
      };
      return statusMap[status] || '';
    },
    
    // 切换语音输入
    toggleVoiceInput() {
      console.log('切换语音输入');
      this.isVoiceInput = !this.isVoiceInput;
      // 实际项目中可以集成语音识别功能
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
    },
    
    // 返回上一页
    goBack() {
      const pages = getCurrentPages();
      if (pages.length <= 1) {
        uni.redirectTo({
          url: '/pages/mine/mine'
        });
      } else {
        uni.navigateBack();
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
    // 隐藏原生导航栏标题（使用自定义导航栏）
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
  padding-top: 88rpx;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(to bottom, #5DCDFF, #7DD8FF);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding-top: var(--status-bar-height, 0);
}

.navbar-content {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.navbar-left {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.navbar-left-hover {
  opacity: 0.7;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.navbar-icon {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
}

.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 36rpx;
  color: white;
  font-weight: bold;
}

.navbar-right {
  width: 88rpx;
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  padding-bottom: 200rpx; /* 为底部输入区域留出空间 */
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
  bottom: 0; /* 移除导航栏后，固定在底部 */
  left: 0;
  right: 0;
  z-index: 100;
  background-color: white;
  border-top: 1rpx solid #EEEEEE;
}

/* 订单消息卡片样式 */
.order-message-card {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  padding: 20rpx;
  min-width: 400rpx;
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.3);
}

.order-card-title {
  font-size: 30rpx;
  font-weight: bold;
  color: white;
}

.order-status-badge {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.order-card-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.order-info-row {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: white;
}

.order-label {
  color: rgba(255, 255, 255, 0.8);
  margin-right: 10rpx;
}

.order-value {
  color: white;
  flex: 1;
}

.order-value.price {
  color: #FFD700;
  font-weight: bold;
}

/* 订单选择弹窗样式 */
.order-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-modal-content {
  width: 90%;
  max-width: 700rpx;
  max-height: 80vh;
  background-color: white;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.order-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #EEEEEE;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.order-modal-body {
  flex: 1;
  overflow: hidden;
}

.loading-orders {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.order-list-scroll {
  max-height: 60vh;
}

.order-select-item {
  padding: 25rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
  background-color: white;
}

.order-select-item:active {
  background-color: #F5F5F5;
}

.order-select-item:last-child {
  border-bottom: none;
}

.order-select-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-select-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.order-select-no {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.order-select-goods {
  font-size: 26rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-select-time {
  font-size: 24rpx;
  color: #999;
}

.order-select-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
  margin-left: 20rpx;
}

.order-select-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF4444;
}

.order-select-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  color: white;
}

.order-select-status.status-waiting {
  background-color: #FFA500;
}

.order-select-status.status-progress {
  background-color: #5DCDFF;
}

.order-select-status.status-completed {
  background-color: #4CAF50;
}

.order-select-status.status-canceled {
  background-color: #999;
}

.empty-orders {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>