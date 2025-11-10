<template>
  <view class="page-container">
    <!-- 标签分类 -->
    <view class="tabs-container">
      <view 
        class="tab-item" 
        v-for="(tab, index) in tabs" 
        :key="index"
        :class="{ active: currentTab === index }"
        @click="switchCategory(index)"
      >
        <text class="tab-text">{{ tab.name }}</text>
        <view v-if="currentTab === index" class="tab-underline"></view>
      </view>
    </view>
    
    <!-- 聊天列表 -->
    <scroll-view class="chat-list" scroll-y>
      <view 
        class="chat-item" 
        v-for="(item, index) in filteredMessages" 
        :key="index"
        @click="openChat(item)"
      >
        <!-- 头像 -->
        <view class="avatar" :style="{ background: item.avatarBg }">
          <text class="avatar-text">{{ item.avatarIcon }}</text>
        </view>
        
        <!-- 消息内容 -->
        <view class="chat-info">
          <view class="chat-header">
            <view class="name-row">
              <text class="chat-name">{{ item.name }}</text>
              <view class="user-tag" :class="item.type">
                <text class="tag-text">{{ item.type === 'group' ? '群聊' : '系统' }}</text>
              </view>
            </view>
            <text class="chat-time">{{ item.time }}</text>
          </view>
          <view class="message-preview">
            <text class="preview-text">{{ item.lastMessage }}</text>
            <text v-if="item.emoji" class="message-emoji">{{ item.emoji }}</text>
          </view>
        </view>
        
        <!-- 未读标记 -->
        <view v-if="item.unread > 0" class="unread-badge">
          <text class="unread-count">{{ item.unread > 99 ? '99+' : item.unread }}</text>
        </view>
      </view>
      
      <view v-if="filteredMessages.length === 0" class="empty">
        <text class="empty-icon">💬</text>
        <text class="empty-text">暂无消息</text>
      </view>
    </scroll-view>
    
    <!-- 自定义底部导航栏 -->
    <view class="custom-tab-bar">
      <view class="tab-bar-item" @click="switchTab('index')">
        <text class="tab-icon">🏠</text>
        <text class="tab-label">首页</text>
      </view>
      <view class="tab-bar-item" @click="switchTab('list')">
        <text class="tab-icon">📋</text>
        <text class="tab-label">订单</text>
      </view>
      <view class="tab-bar-item active">
        <text class="tab-icon active-icon">💬</text>
        <text class="tab-label active-text">消息</text>
      </view>
      <view class="tab-bar-item" @click="switchTab('mine')">
        <text class="tab-icon">👤</text>
        <text class="tab-label">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getChatList, getUnreadCount } from '@/utils/chatApi.js';

export default {
  name: 'MessagePage',
  data() {
    return {
      currentTab: 0,
      tabs: [
        { name: '全部消息' },
        { name: '群聊' },
        { name: '系统通知' }
      ],
      messages: [],
      loading: false,
      unreadTotal: 0
    }
  },
  onLoad() {
    // 加载会话列表
    this.loadChatList();
    // 加载未读消息数
    this.loadUnreadCount();
  },
  onShow() {
    // 每次显示页面时刷新未读消息数
    this.loadUnreadCount();
  },
  computed: {
    filteredMessages() {
      if (this.currentTab === 0) {
        // 全部消息
        return this.messages;
      } else if (this.currentTab === 1) {
        // 群聊消息
        return this.messages.filter(msg => msg.type === 'group');
      } else if (this.currentTab === 2) {
        // 系统通知
        return this.messages.filter(msg => msg.type === 'system');
      }
      return this.messages;
    }
  },
  methods: {
    // 加载会话列表
    async loadChatList() {
      if (this.loading) return;
      
      this.loading = true;
      
      try {
        const res = await getChatList({
          pageNum: 1,
          pageSize: 50
        });
        
        // 后端返回的数据格式可能是 AjaxResult 或 R 类
        const success = res.data.code === 200 || res.data.code === 0;
        
        if (success) {
          // 根据后端ChatSession实体映射字段
          const chatList = res.data.data || res.data.rows || [];
          
          // 转换数据格式，映射后端ChatSession字段
          this.messages = chatList.map(session => {
            // 确定会话名称（根据对方类型和ID获取）
            let chatName = '未知用户';
            let chatType = 'group';
            
            // 判断对方类型
            if (session.toType === 1) {
              chatName = '用户' + session.toId;
              chatType = 'group';
            } else if (session.toType === 2) {
              chatName = '骑手' + session.toId;
              chatType = 'group';
            } else if (session.toType === 4) {
              chatName = '系统消息';
              chatType = 'system';
            }
            
            return {
              id: session.sessionId,
              sessionId: session.sessionId,
              chatId: session.sessionId, // 兼容旧字段
              name: chatName,
              type: chatType,
              avatarIcon: chatType === 'system' ? '🔔' : '👥',
              avatarBg: chatType === 'system' ? 
                'linear-gradient(135deg, #FFB300, #FFA000)' : 
                'linear-gradient(135deg, #64B5F6, #42A5F5)',
              lastMessage: session.lastMsgContent || '',
              time: this.formatChatTime(session.lastMsgTime),
              unread: session.unreadCount || 0,
              emoji: '',
              // 保存原始数据，用于后续操作
              fromType: session.fromType,
              fromId: session.fromId,
              toType: session.toType,
              toId: session.toId
            };
          });
        } else {
          // 加载失败
          console.warn('加载会话列表失败:', res.data.msg || '未知错误');
          this.messages = [];
          uni.showToast({
            title: res.data.msg || '加载失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载会话列表失败:', error);
        this.messages = [];
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 加载未读消息数
    async loadUnreadCount() {
      try {
        const res = await getUnreadCount();
        
        const success = res.data.code === 200 || res.data.code === 0;
        
        if (success) {
          // 后端返回的未读会话列表，计算总未读数
          const unreadList = res.data.data || [];
          this.unreadTotal = 0;
          
          if (Array.isArray(unreadList)) {
            // 累加所有会话的未读数
            unreadList.forEach(session => {
              this.unreadTotal += (session.unreadCount || 0);
            });
          } else if (typeof unreadList === 'number') {
            // 如果直接返回数字
            this.unreadTotal = unreadList;
          }
          
          // 更新底部导航栏的角标（如果需要）
          if (this.unreadTotal > 0) {
            uni.setTabBarBadge({
              index: 2, // 消息tab的索引
              text: this.unreadTotal > 99 ? '99+' : this.unreadTotal.toString()
            });
          } else {
            uni.removeTabBarBadge({
              index: 2
            });
          }
        }
      } catch (error) {
        console.error('加载未读消息数失败:', error);
      }
    },
    
    // 格式化会话时间
    formatChatTime(timestamp) {
      if (!timestamp) return '';
      
      const date = new Date(timestamp);
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
      } else if (diff < 604800000) { // 本周
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return weekdays[date.getDay()];
      } else {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${month}-${day}`;
      }
    },
    
    // 切换分类标签
    switchCategory(index) {
      this.currentTab = index;
    },
    
    // 打开聊天界面
    openChat(item) {
      // 清除未读标记
      const originalUnread = item.unread;
      item.unread = 0;
      
      // 更新未读总数
      if (originalUnread > 0) {
        this.unreadTotal = Math.max(0, this.unreadTotal - originalUnread);
      }
      
      // 跳转到聊天界面，传递会话ID和会话信息
      const params = {
        sessionId: item.sessionId || item.chatId || item.id,
        title: encodeURIComponent(item.name),
        icon: encodeURIComponent(item.avatarIcon),
        iconColor: encodeURIComponent(item.avatarBg)
      };
      
      // 传递会话参与方信息（用于发送消息）
      if (item.fromType && item.fromId && item.toType && item.toId) {
        params.fromType = item.fromType;
        params.fromId = item.fromId;
        params.toType = item.toType;
        params.toId = item.toId;
      }
      
      const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
      
      uni.navigateTo({
        url: `/pages/message/chat?${queryString}`
      });
    },
    
    // 切换底部导航
    switchTab(tab) {
      const urlMap = {
        index: '/pages/index/index',
        list: '/pages/list/list',
        mine: '/pages/mine/mine'
      };
      
      if (urlMap[tab]) {
        uni.switchTab({
          url: urlMap[tab]
        });
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 标签分类 */
.tabs-container {
  background: #ffffff;
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  position: relative;
  padding: 10rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 400;
}

.tab-item.active .tab-text {
  color: #007AFF;
  font-weight: 600;
}

.tab-underline {
  position: absolute;
  bottom: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #007AFF;
  border-radius: 2rpx;
}

/* 聊天列表 */
.chat-list {
  flex: 1;
  background: #ffffff;
  padding-bottom: 120rpx;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  position: relative;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background 0.2s;
}

.chat-item:active {
  background: #f5f5f5;
}

/* 头像 */
.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.avatar-text {
  font-size: 44rpx;
  color: white;
}

/* 聊天信息 */
.chat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.chat-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #000;
}

.user-tag {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
}

.user-tag.group {
  background: #E8F5E9;
  color: #43A047;
}

.user-tag.system {
  background: #FFF3E0;
  color: #F57C00;
}

.tag-text {
  font-size: 20rpx;
  font-weight: 500;
}

.chat-time {
  font-size: 24rpx;
  color: #999;
  flex-shrink: 0;
}

.message-preview {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.preview-text {
  font-size: 26rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.message-emoji {
  font-size: 28rpx;
  flex-shrink: 0;
}

/* 未读标记 */
.unread-badge {
  position: absolute;
  top: 24rpx;
  right: 30rpx;
  background: #FF3B30;
  min-width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.unread-count {
  font-size: 20rpx;
  color: #fff;
  font-weight: 600;
}

/* 空状态 */
.empty {
  padding: 200rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 自定义底部导航栏 */
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  display: flex;
  padding: 12rpx 0 20rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
  z-index: 999;
  border-top: 1rpx solid #e5e5e5;
}

.tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.tab-icon {
  font-size: 48rpx;
}

.tab-label {
  font-size: 20rpx;
  color: #8e8e93;
}

.tab-bar-item.active .tab-label {
  color: #007AFF;
}

.active-icon {
  color: #007AFF;
}

.active-text {
  color: #007AFF;
}
</style>

