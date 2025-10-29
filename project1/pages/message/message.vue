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
      mockMessages: [
        {
          id: 0,
          name: '在线客服',
          type: 'system',
          avatarIcon: '🎧',
          avatarBg: 'linear-gradient(135deg, #FFB300, #FFA000)',
          lastMessage: '您好，有什么可以帮您的吗？',
          time: '11:00',
          unread: 0,
          emoji: ''
        },
        {
          id: 1,
          name: '订单#20231115089',
          type: 'group',
          avatarIcon: '👥',
          avatarBg: 'linear-gradient(135deg, #64B5F6, #42A5F5)',
          lastMessage: '张先生：骑手还有多久到？',
          time: '10:30',
          unread: 2,
          emoji: '',
          orderInfo: '张先生 & 骑手李明'
        },
        {
          id: 2,
          name: '系统消息',
          type: 'system',
          avatarIcon: '🔔',
          avatarBg: 'linear-gradient(135deg, #FFB300, #FFA000)',
          lastMessage: '您有3个新订单待接单，请及时处理',
          time: '10:25',
          unread: 3,
          emoji: ''
        },
        {
          id: 3,
          name: '订单#20231115078',
          type: 'group',
          avatarIcon: '👥',
          avatarBg: 'linear-gradient(135deg, #EF5350, #E53935)',
          lastMessage: '骑手王伟：已取餐，正在路上',
          time: '10:15',
          unread: 0,
          emoji: '',
          orderInfo: '李女士 & 骑手王伟'
        },
        {
          id: 4,
          name: '订单通知',
          type: 'system',
          avatarIcon: '📦',
          avatarBg: 'linear-gradient(135deg, #66BB6A, #4CAF50)',
          lastMessage: '订单 #20231115089 已完成配送',
          time: '09:45',
          unread: 0,
          emoji: ''
        },
        {
          id: 5,
          name: '订单#20231115056',
          type: 'group',
          avatarIcon: '👥',
          avatarBg: 'linear-gradient(135deg, #AB47BC, #9C27B0)',
          lastMessage: '王女士：能帮忙带双筷子吗？',
          time: '09:30',
          unread: 0,
          emoji: '🙏',
          orderInfo: '王女士 & 骑手刘强'
        },
        {
          id: 6,
          name: '评价提醒',
          type: 'system',
          avatarIcon: '⭐',
          avatarBg: 'linear-gradient(135deg, #E53935, #D32F2F)',
          lastMessage: '您收到一条新的5星好评',
          time: '昨天',
          unread: 1,
          emoji: ''
        },
        {
          id: 7,
          name: '订单#20231114123',
          type: 'group',
          avatarIcon: '👥',
          avatarBg: 'linear-gradient(135deg, #5C6BC0, #3F51B5)',
          lastMessage: '骑手陈浩：已到楼下，请下来取餐',
          time: '昨天',
          unread: 0,
          emoji: '',
          orderInfo: '赵先生 & 骑手陈浩'
        },
        {
          id: 8,
          name: '财务通知',
          type: 'system',
          avatarIcon: '💰',
          avatarBg: 'linear-gradient(135deg, #00ACC1, #00838F)',
          lastMessage: '本周收入已结算，共计 ¥2,580.00',
          time: '周一',
          unread: 0,
          emoji: ''
        },
        {
          id: 9,
          name: '订单#20231113098',
          type: 'group',
          avatarIcon: '👥',
          avatarBg: 'linear-gradient(135deg, #8E24AA, #6A1B9A)',
          lastMessage: '孙女士：餐品收到了，谢谢！',
          time: '周一',
          unread: 0,
          emoji: '😊',
          orderInfo: '孙女士 & 骑手张勇'
        },
        {
          id: 10,
          name: '活动通知',
          type: 'system',
          avatarIcon: '🎉',
          avatarBg: 'linear-gradient(135deg, #F57C00, #EF6C00)',
          lastMessage: '本周冲单活动：完成50单奖励200元',
          time: '周二',
          unread: 0,
          emoji: ''
        },
        {
          id: 11,
          name: '订单#20231112067',
          type: 'group',
          avatarIcon: '👥',
          avatarBg: 'linear-gradient(135deg, #43A047, #388E3C)',
          lastMessage: '周先生：配送很快，服务态度好',
          time: '周二',
          unread: 0,
          emoji: '👍',
          orderInfo: '周先生 & 骑手杨磊'
        },
        {
          id: 12,
          name: '系统更新',
          type: 'system',
          avatarIcon: '🔧',
          avatarBg: 'linear-gradient(135deg, #1E88E5, #1565C0)',
          lastMessage: 'APP将于今晚23:00进行系统维护',
          time: '周三',
          unread: 0,
          emoji: ''
        }
      ],
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
        
        if (res.data.code === 200) {
          const chatList = res.data.data.list || [];
          
          // 转换数据格式
          this.messages = chatList.map(chat => ({
            id: chat.chatId,
            chatId: chat.chatId,
            name: chat.chatName || chat.userName,
            type: chat.chatType || 'group', // group:群聊, system:系统
            avatarIcon: chat.avatarIcon || '👥',
            avatarBg: chat.avatarBg || 'linear-gradient(135deg, #64B5F6, #42A5F5)',
            lastMessage: chat.lastMessage || '',
            time: this.formatChatTime(chat.lastMessageTime),
            unread: chat.unreadCount || 0,
            emoji: chat.emoji || ''
          }));
          
          // 如果没有真实数据，使用模拟数据
          if (this.messages.length === 0) {
            this.messages = this.mockMessages;
          }
        } else {
          // 加载失败，使用模拟数据
          console.warn('加载会话列表失败，使用模拟数据');
          this.messages = this.mockMessages;
        }
      } catch (error) {
        console.error('加载会话列表失败:', error);
        // 加载失败，使用模拟数据
        this.messages = this.mockMessages;
      } finally {
        this.loading = false;
      }
    },
    
    // 加载未读消息数
    async loadUnreadCount() {
      try {
        const res = await getUnreadCount();
        
        if (res.data.code === 200) {
          this.unreadTotal = res.data.data.unreadCount || 0;
          
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
      
      // 跳转到聊天界面（需要传递chatId）
      uni.navigateTo({
        url: `/pages/message/chat?chatId=${item.chatId || item.id}&title=${encodeURIComponent(item.name)}&icon=${encodeURIComponent(item.avatarIcon)}&iconColor=${encodeURIComponent(item.avatarBg)}`
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

