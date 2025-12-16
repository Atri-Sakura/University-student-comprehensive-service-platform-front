<template>
  <view class="message-container">
    <!-- 顶部搜索栏 -->
    <view class="search-header">
      <view class="header-title">
        <text class="title-text">消息</text>
      </view>
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          type="text" 
          placeholder="搜索聊天记录" 
          v-model="searchKeyword"
          @input="handleSearch"
        />
      </view>
    </view>

    <!-- 消息分类标签 -->
    <view class="message-tabs">
      <view 
        v-for="(tab, index) in messageTabs" 
        :key="index"
        class="tab-item"
        :class="{ 'tab-active': currentTab === index }"
        @click="switchTab(index)"
      >
        <text class="tab-text">{{ tab.name }}</text>
        <view v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view class="message-list" scroll-y="true">
      <!-- 聊天消息 -->
      <view v-if="currentTab === 0" class="chat-messages">
        <view 
          v-for="(chat, index) in filteredChats" 
          :key="index"
          class="chat-item"
          @click="openChat(chat)"
        >
          <view class="chat-avatar">
            <text class="avatar-text">{{ chat.avatar }}</text>
            <view v-if="chat.unread > 0" class="unread-dot"></view>
          </view>
          <view class="chat-content">
            <view class="chat-header">
              <text class="chat-name">{{ chat.name }}</text>
              <text class="chat-time">{{ formatTime(chat.lastTime) }}</text>
            </view>
            <view class="chat-preview">
              <text class="preview-text">{{ chat.lastMessage }}</text>
              <view v-if="chat.unread > 0" class="unread-count">{{ chat.unread }}</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 系统通知 -->
      <view v-if="currentTab === 1" class="system-notifications">
        <view 
          v-for="(notification, index) in filteredNotifications" 
          :key="index"
          class="notification-item"
          @click="handleNotification(notification)"
        >
          <view class="notification-icon">
            <text class="icon-text">{{ notification.icon }}</text>
          </view>
          <view class="notification-content">
            <view class="notification-header">
              <text class="notification-title">{{ notification.title }}</text>
              <text class="notification-time">{{ formatTime(notification.time) }}</text>
            </view>
            <text class="notification-desc">{{ notification.content }}</text>
            <view v-if="!notification.read" class="unread-indicator"></view>
          </view>
        </view>
      </view>

      <!-- 订单消息 -->
      <view v-if="currentTab === 2" class="order-messages">
        <view 
          v-for="(order, index) in filteredOrders" 
          :key="index"
          class="order-item"
          @click="viewOrderDetail(order)"
        >
          <view class="order-icon">
            <text class="icon-text">{{ order.icon }}</text>
          </view>
          <view class="order-content">
            <view class="order-header">
              <text class="order-title">{{ order.title }}</text>
              <text class="order-time">{{ formatTime(order.time) }}</text>
            </view>
            <text class="order-desc">{{ order.content }}</text>
            <view class="order-status" :class="order.statusClass">{{ order.status }}</view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view v-if="isEmptyState" class="empty-state">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无消息</text>
      <text class="empty-desc">您的消息将在这里显示</text>
    </view>

    <!-- 自定义底部导航栏 -->
    <custom-tabbar :current="2"></custom-tabbar>
  </view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
import { getSessionList, getUnreadSessions, markSessionAsRead, USER_TYPE } from '@/api/session.js';
import { getMessagesFromTo } from '@/api/chat.js';
import { getUserInfo } from '@/api/user.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      currentTab: 0,
      searchKeyword: '',
      messageTabs: [
        { name: '聊天', count: 0 },
        { name: '通知', count: 0 },
        { name: '订单', count: 0 }
      ],
      currentUser: null,
      loading: false,
      chatList: [],
      notifications: [],
      orderMessages: [],
      pollingTimer: null, // 轮询定时器
      pollingInterval: 5000 // 轮询间隔（5秒）
    };
  },
  computed: {
    filteredChats() {
      if (!this.searchKeyword) return this.chatList;
      return this.chatList.filter(chat => 
        chat.name.includes(this.searchKeyword) || 
        chat.lastMessage.includes(this.searchKeyword)
      );
    },
    filteredNotifications() {
      if (!this.searchKeyword) return this.notifications;
      return this.notifications.filter(notification => 
        notification.title.includes(this.searchKeyword) || 
        notification.content.includes(this.searchKeyword)
      );
    },
    filteredOrders() {
      if (!this.searchKeyword) return this.orderMessages;
      return this.orderMessages.filter(order => 
        order.title.includes(this.searchKeyword) || 
        order.content.includes(this.searchKeyword)
      );
    },
    isEmptyState() {
      if (this.currentTab === 0) return this.filteredChats.length === 0;
      if (this.currentTab === 1) return this.filteredNotifications.length === 0;
      if (this.currentTab === 2) return this.filteredOrders.length === 0;
      return false;
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
          // 如果本地没有用户信息，从接口获取
          const response = await getUserInfo();
          if (response.code === 200) {
            this.currentUser = response.data;
            uni.setStorageSync('userInfo', response.data);
          }
        }
        
        // 确保用户对象有id字段
        if (this.currentUser && !this.currentUser.id) {
          const currentUserId = this.currentUser.userId || this.currentUser.userBaseId || userId;
          if (currentUserId) {
            this.currentUser.id = currentUserId;
          }
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
          // 使用默认用户信息
          this.currentUser = {
            id: '1001',
            name: '当前用户'
          };
        }
      }
    },

    // 加载聊天会话列表
    async loadChatSessions() {
      if (!this.currentUser) {
        console.warn('loadChatSessions: 用户信息不存在');
        return;
      }
      
      // 多字段容错获取用户ID
      const userId = uni.getStorageSync('userId');
      let currentUserId = this.currentUser.id || this.currentUser.userId || this.currentUser.userBaseId;
      if (!currentUserId) {
        currentUserId = userId;
      }
      
      this.loading = true;
      try {
        // 查询1: 用户作为发起方的会话（fromType=USER, fromId=用户ID）
        const params1 = {
          fromType: USER_TYPE.USER,
          fromId: currentUserId,
          sessionStatus: 1,
          pageSize: 50
        };
        
        // 查询2: 用户作为接收方的会话（toType=USER, toId=用户ID）
        const params2 = {
          toType: USER_TYPE.USER,
          toId: currentUserId,
          sessionStatus: 1,
          pageSize: 50
        };
        
        // 并发查询两个方向的会话
        const [response1, response2] = await Promise.all([
          getSessionList(params1),
          getSessionList(params2)
        ]);
        
        let allSessions = [];
        
        // 合并两个查询结果
        if (response1.code === 200 && response1.data) {
          allSessions = allSessions.concat(response1.data);
        }
        if (response2.code === 200 && response2.data) {
          allSessions = allSessions.concat(response2.data);
        }
        
        if (allSessions.length > 0) {
          // 去重（按sessionId）
          const sessionMap = new Map();
          allSessions.forEach(session => {
            if (!sessionMap.has(session.sessionId)) {
              sessionMap.set(session.sessionId, session);
            }
          });
          
          const uniqueSessions = Array.from(sessionMap.values());
          
          // 格式化会话列表
          let chatList = uniqueSessions.map(session => this.formatSessionToChat(session, currentUserId));
          
          // 为每个会话获取最新消息（解决双向会话lastMsgContent不同步问题）
          await this.fetchLatestMessagesForChats(chatList, currentUserId);
          
          // 排序（按最后消息时间倒序）
          this.chatList = chatList.sort((a, b) => b.lastTime - a.lastTime);
          
          this.updateTabCount();
        } else {
          console.warn('没有查询到任何会话');
          this.chatList = [];
          this.updateTabCount();
        }
      } catch (error) {
        console.error('加载聊天会话失败:', error);
        uni.showToast({
          title: '加载聊天记录失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    // 为会话列表获取最新消息
    async fetchLatestMessagesForChats(chatList, currentUserId) {
      const promises = chatList.map(async (chat) => {
        // 如果会话已有最新消息内容，跳过
        if (chat.lastMessage && chat.lastMessage !== '暂无消息') {
          return;
        }
        
        try {
          // 使用 getMessagesFromTo 获取与对方的消息
          const response = await getMessagesFromTo({
            fromType: USER_TYPE.USER,
            fromId: currentUserId,
            toType: chat.otherType,
            toId: chat.otherId
          });
          
          if (response.code === 200 && response.data && response.data.length > 0) {
            // 按时间排序，获取最新消息
            const sortedMessages = [...response.data].sort((a, b) => {
              const timeA = new Date(a.createTime || a.sendTime || 0).getTime();
              const timeB = new Date(b.createTime || b.sendTime || 0).getTime();
              return timeB - timeA; // 降序，最新的在前
            });
            
            const latestMsg = sortedMessages[0];
            chat.lastMessage = latestMsg.msgContent || '暂无消息';
            chat.lastTime = new Date(latestMsg.createTime || latestMsg.sendTime || Date.now()).getTime();
            
            // 计算未读数（对方发给我的未读消息）
            const unreadMessages = response.data.filter(msg => 
              String(msg.fromId) !== String(currentUserId) && 
              msg.msgStatus !== 2 // 2 = 已读
            );
            chat.unread = unreadMessages.length;
          }
        } catch (error) {
          console.error('获取会话最新消息失败:', chat.sessionId, error);
        }
      });
      
      await Promise.all(promises);
    },
    
    // 格式化会话数据为聊天列表格式
    formatSessionToChat(session, currentUserId) {
      // 验证sessionId
      if (!session.sessionId) {
        console.warn('会话数据缺少sessionId:', session);
      }
      
      // 判断当前用户在会话中的角色，确定对方信息
      let otherType, otherId;
      const isUserFrom = String(session.fromId) === String(currentUserId);
      
      if (isUserFrom) {
        // 用户是发起方，对方是接收方
        otherType = session.toType;
        otherId = session.toId;
      } else {
        // 用户是接收方，对方是发起方
        otherType = session.fromType;
        otherId = session.fromId;
      }
      
      // 确保otherType是数字类型（后端可能返回字符串）
      const otherTypeNum = Number(otherType) || 0;
      console.log('[formatSessionToChat] session:', session.sessionId, 'otherType:', otherType, 'otherTypeNum:', otherTypeNum, 'otherId:', otherId);
      
      // 根据对方类型确定头像和名称
      let avatar = '👤';
      let name = '未知用户';
      let type = 'user';
      
      if (otherTypeNum === USER_TYPE.RIDER || otherTypeNum === 2) {
        avatar = '🚴';
        name = `配送员 #${otherId}`;
        type = 'delivery';
      } else if (otherTypeNum === USER_TYPE.MERCHANT || otherTypeNum === 3) {
        avatar = '🏪';
        name = `商家 #${otherId}`;
        type = 'merchant';
      } else if (otherTypeNum === USER_TYPE.SYSTEM || otherTypeNum === 4) {
        avatar = '🔔';
        name = '系统消息';
        type = 'system';
      } else if (otherTypeNum === USER_TYPE.USER || otherTypeNum === 1) {
        avatar = '👤';
        name = `用户 #${otherId}`;
        type = 'user';
      } else {
        console.warn('[formatSessionToChat] 未知用户类型:', otherTypeNum, '原始值:', otherType, 'session:', session);
      }
      
      // 调试日志
      console.log('[formatSessionToChat] session详情:', {
        sessionId: session.sessionId,
        lastMsgContent: session.lastMsgContent,
        lastMsgTime: session.lastMsgTime,
        unreadCount: session.unreadCount
      });
      
      const formattedChat = {
        id: session.sessionId,
        sessionId: session.sessionId,
        name: name,
        avatar: avatar,
        lastMessage: session.lastMsgContent || '暂无消息',
        lastTime: session.lastMsgTime ? new Date(session.lastMsgTime).getTime() : Date.now(),
        unread: session.unreadCount || 0,
        type: type,
        fromType: session.fromType,
        fromId: session.fromId,
        toType: session.toType,
        toId: session.toId,
        // 添加对方信息，方便后续使用
        otherType: otherType,
        otherId: otherId
      };
      
      return formattedChat;
    },

    

    switchTab(index) {
      this.currentTab = index;
      this.searchKeyword = '';
      
      // 切换到聊天标签时重新加载数据
      if (index === 0) {
        this.loadChatSessions();
      }
    },
    
    handleSearch() {
      // 搜索功能已通过computed属性实现
    },
    
    async openChat(chat) {
      // 找到chatList中对应的索引
      const chatIndex = this.chatList.findIndex(c => String(c.sessionId) === String(chat.sessionId));
      const sessionIdStr = String(chat.sessionId); // 统一转为字符串
      
      // 先立即更新本地UI（确保红点消失）
      if (chat.unread > 0 && chatIndex !== -1) {
        // 立即更新本地状态
        this.chatList[chatIndex].unread = 0;
        // 强制触发视图更新
        this.chatList = [...this.chatList];
        this.updateTabCount();
        console.log('本地已更新未读数为0, sessionId:', sessionIdStr);
        
        // 记录已读会话到storage（防止onShow刷新后覆盖），统一用字符串
        const readSessionIds = uni.getStorageSync('readSessionIds') || [];
        if (!readSessionIds.includes(sessionIdStr)) {
          readSessionIds.push(sessionIdStr);
          uni.setStorageSync('readSessionIds', readSessionIds);
          console.log('已记录到storage:', readSessionIds);
        }
        
        // 异步调用API标记已读（不阻塞跳转）
        if (chat.sessionId) {
          markSessionAsRead(chat.sessionId)
            .then(() => {
              console.log('标记会话已读成功:', sessionIdStr);
              // 注意：不要在这里清除storage，让onShow中确认后端数据正确后再清除
            })
            .catch(err => console.error('标记会话已读失败:', err));
        }
      }
      
      // 跳转到聊天详情页
      if (chat.type === 'service') {
        uni.navigateTo({
          url: '/pages/mine/customer-service'
        });
      } else {
        const params = {
          sessionId: chat.sessionId,
          chatId: chat.id,
          name: encodeURIComponent(chat.name),
          fromType: chat.fromType,
          fromId: chat.fromId,
          toType: chat.toType,
          toId: chat.toId
        };
        
        const queryString = Object.keys(params)
          .map(key => `${key}=${params[key]}`)
          .join('&');
        
        uni.navigateTo({
          url: `/pages/message/chat-detail?${queryString}`
        });
      }
    },
    
    handleNotification(notification) {
      // 标记为已读
      notification.read = true;
      
      // 保存已读通知ID到storage（持久化）
      const readNotificationIds = uni.getStorageSync('readNotificationIds') || [];
      if (!readNotificationIds.includes(notification.id)) {
        readNotificationIds.push(notification.id);
        uni.setStorageSync('readNotificationIds', readNotificationIds);
      }
      
      this.updateTabCount();
      
      // 根据通知类型跳转到相应页面
      switch (notification.type) {
        case 'order':
          uni.navigateTo({
            url: '/pages/orders/index'
          });
          break;
        case 'promotion':
          uni.navigateTo({
            url: '/pages/mine/wallet'
          });
          break;
        case 'security':
          uni.navigateTo({
            url: '/pages/mine/account-security'
          });
          break;
        case 'review':
          // 评价提醒 - 跳转到订单列表
          uni.navigateTo({
            url: '/pages/orders/index'
          });
          break;
        case 'system':
          // 系统维护通知 - 显示详情弹窗
          uni.showModal({
            title: notification.title,
            content: notification.content,
            showCancel: false,
            confirmText: '知道了'
          });
          break;
        default:
          uni.showToast({
            title: '已查看通知',
            icon: 'success'
          });
      }
    },
    
    viewOrderDetail(order) {
      uni.navigateTo({
        url: '/pages/orders/index'
      });
    },
    
    updateTabCount() {
      // 更新未读消息数量
      const unreadChats = this.chatList.filter(chat => chat.unread > 0).length;
      const unreadNotifications = this.notifications.filter(notification => !notification.read).length;
      const unreadOrders = this.orderMessages.filter(order => order.unread > 0).length;
      
      this.messageTabs[0].count = unreadChats;
      this.messageTabs[1].count = unreadNotifications;
      this.messageTabs[2].count = unreadOrders;
    },
    
    // 恢复已读通知状态
    restoreReadNotifications() {
      const readNotificationIds = uni.getStorageSync('readNotificationIds') || [];
      if (readNotificationIds.length > 0) {
        this.notifications.forEach(notification => {
          if (readNotificationIds.includes(notification.id)) {
            notification.read = true;
          }
        });
      }
    },
    
    formatTime(timestamp) {
      const now = new Date().getTime();
      const diff = now - timestamp;
      
      if (diff < 60000) { // 1分钟内
        return '刚刚';
      } else if (diff < 3600000) { // 1小时内
        return Math.floor(diff / 60000) + '分钟前';
      } else if (diff < 86400000) { // 24小时内
        return Math.floor(diff / 3600000) + '小时前';
      } else if (diff < 604800000) { // 7天内
        return Math.floor(diff / 86400000) + '天前';
      } else {
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
    },
    
    // 开始轮询
    startPolling() {
      this.stopPolling();
      console.log('🔄 消息列表启动轮询，间隔:', this.pollingInterval, 'ms');
      this.pollingTimer = setInterval(async () => {
        if (this.currentUser && this.currentTab === 0) {
          await this.pollChatSessions();
        }
      }, this.pollingInterval);
    },
    
    // 停止轮询
    stopPolling() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer);
        this.pollingTimer = null;
      }
    },
    
    // 轮询获取会话列表更新
    async pollChatSessions() {
      if (!this.currentUser) return;
      
      try {
        const userId = this.currentUser.id || this.currentUser.userId || this.currentUser.userBaseId;
        if (!userId) return;
        
        const params1 = {
          fromType: USER_TYPE.USER,
          fromId: userId,
          sessionStatus: 1,
          pageSize: 50
        };
        
        const params2 = {
          toType: USER_TYPE.USER,
          toId: userId,
          sessionStatus: 1,
          pageSize: 50
        };
        
        const [response1, response2] = await Promise.all([
          getSessionList(params1),
          getSessionList(params2)
        ]);
        
        let allSessions = [];
        if (response1.code === 200 && response1.data) {
          allSessions = allSessions.concat(response1.data);
        }
        if (response2.code === 200 && response2.data) {
          allSessions = allSessions.concat(response2.data);
        }
        
        if (allSessions.length > 0) {
          const sessionMap = new Map();
          allSessions.forEach(session => {
            if (!sessionMap.has(session.sessionId)) {
              sessionMap.set(session.sessionId, session);
            }
          });
          
          const uniqueSessions = Array.from(sessionMap.values());
          let newChatList = uniqueSessions
            .map(session => this.formatSessionToChat(session, userId));
          
          // 获取最新消息
          await this.fetchLatestMessagesForChats(newChatList, userId);
          
          // 排序
          newChatList = newChatList.sort((a, b) => b.lastTime - a.lastTime);
          
          // 检查是否有变化（新消息或未读数变化）
          const hasChanges = this.checkForChanges(newChatList);
          if (hasChanges) {
            console.log('📩 消息列表有更新');
            this.chatList = newChatList;
            this.updateTabCount();
          }
        }
      } catch (error) {
        console.error('轮询会话列表失败:', error);
      }
    },
    
    // 检查会话列表是否有变化
    checkForChanges(newChatList) {
      if (this.chatList.length !== newChatList.length) return true;
      
      for (let i = 0; i < newChatList.length; i++) {
        const newChat = newChatList[i];
        const oldChat = this.chatList.find(c => String(c.sessionId) === String(newChat.sessionId));
        
        if (!oldChat) return true;
        if (oldChat.lastMessage !== newChat.lastMessage) return true;
        if (oldChat.lastTime !== newChat.lastTime) return true;
        if (oldChat.unread !== newChat.unread) return true;
      }
      
      return false;
    },
    
    // 初始化通知数据（移除模拟数据）
    initNotifications() {
      this.notifications = [];
    }
  },
  
  async onLoad() {
    // 初始化用户信息
    await this.initUserInfo();
    // 加载聊天会话列表
    await this.loadChatSessions();
    // 恢复已读通知状态
    this.restoreReadNotifications();
    // 更新未读消息数量
    this.updateTabCount();
    // 启动轮询
    this.startPolling();
  },
  
  onShow() {
    // 恢复已读通知状态
    this.restoreReadNotifications();
    this.updateTabCount();
    
    // 页面显示时延迟刷新数据，给后端时间处理已读状态
    if (this.currentUser) {
      setTimeout(() => {
        this.loadChatSessions().then(() => {
          // 刷新后，强制将已读会话的未读数设为0（防止后端响应慢导致覆盖）
          const readSessionIds = uni.getStorageSync('readSessionIds') || [];
          console.log('onShow - storage中的已读会话:', readSessionIds);
          if (readSessionIds.length > 0) {
            let hasUpdate = false;
            const confirmedIds = []; // 记录后端已确认清零的会话
            
            this.chatList.forEach(chat => {
              const chatSessionIdStr = String(chat.sessionId);
              if (readSessionIds.includes(chatSessionIdStr)) {
                if (chat.unread > 0) {
                  // 后端还没更新，强制本地清零
                  console.log('强制清零未读数:', chatSessionIdStr, '原未读:', chat.unread);
                  chat.unread = 0;
                  hasUpdate = true;
                } else {
                  // 后端已经清零，可以从storage移除
                  confirmedIds.push(chatSessionIdStr);
                }
              }
            });
            
            // 从storage中移除已确认的会话ID
            if (confirmedIds.length > 0) {
              const remainingIds = readSessionIds.filter(id => !confirmedIds.includes(id));
              uni.setStorageSync('readSessionIds', remainingIds);
              console.log('已从storage移除确认的会话:', confirmedIds);
            }
            
            if (hasUpdate) {
              this.chatList = [...this.chatList];
              this.updateTabCount();
              console.log('已强制更新UI');
            }
          }
        });
      }, 300);
    }
    
    // 恢复轮询
    if (!this.pollingTimer) {
      this.startPolling();
    }
  },
  
  onHide() {
    // 页面隐藏时停止轮询
    this.stopPolling();
  },
  
  onUnload() {
    // 页面卸载时停止轮询
    this.stopPolling();
  }
};
</script>

<style scoped>
.message-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 搜索栏样式 */
.search-header {
  background-color: #5DCDFF;
  padding: 20rpx;
  padding-top: 40rpx;
}

.header-title {
  text-align: center;
  padding: 20rpx 0;
}

.title-text {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.search-box {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50rpx;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  color: #999;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

/* 消息分类标签样式 */
.message-tabs {
  background-color: #fff;
  display: flex;
  padding: 0 20rpx;
  border-bottom: 1px solid #eee;
}

.tab-item {
  flex: 1;
  padding: 30rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tab-item.tab-active {
  border-bottom: 4rpx solid #5DCDFF;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
  margin-right: 10rpx;
}

.tab-item.tab-active .tab-text {
  color: #5DCDFF;
  font-weight: bold;
}

.tab-badge {
  background-color: #ff4757;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
  line-height: 1;
}

/* 消息列表样式 */
.message-list {
  flex: 1;
  background-color: #fff;
}

/* 聊天消息样式 */
.chat-messages {
  padding: 0;
}

.chat-item {
  display: flex;
  padding: 30rpx 20rpx;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}

.chat-item:active {
  background-color: #f8f8f8;
}

.chat-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  position: relative;
}

.avatar-text {
  font-size: 40rpx;
}

.unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 20rpx;
  height: 20rpx;
  background-color: #ff4757;
  border-radius: 50%;
  border: 2rpx solid #fff;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.chat-name {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.chat-time {
  font-size: 24rpx;
  color: #999;
}

.chat-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-text {
  font-size: 28rpx;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.unread-count {
  background-color: #ff4757;
  color: white;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 20rpx;
  min-width: 32rpx;
  text-align: center;
  margin-left: 20rpx;
}

/* 系统通知样式 */
.system-notifications {
  padding: 0;
}

.notification-item {
  display: flex;
  padding: 30rpx 20rpx;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
  position: relative;
}

.notification-item:active {
  background-color: #f8f8f8;
}

.notification-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon-text {
  font-size: 36rpx;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.notification-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.notification-time {
  font-size: 24rpx;
  color: #999;
}

.notification-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
}

.unread-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 16rpx;
  height: 16rpx;
  background-color: #ff4757;
  border-radius: 50%;
}

/* 订单消息样式 */
.order-messages {
  padding: 0;
}

.order-item {
  display: flex;
  padding: 30rpx 20rpx;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fff;
}

.order-item:active {
  background-color: #f8f8f8;
}

.order-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.order-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.order-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  margin-bottom: 10rpx;
}

.order-status {
  font-size: 24rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  align-self: flex-start;
}

.status-delivering {
  background-color: #fff3cd;
  color: #856404;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

/* 空状态样式 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  line-height: 1.4;
}
</style>
