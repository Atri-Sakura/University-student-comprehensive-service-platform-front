<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">登录记录</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="stats-item">
        <view class="stats-value">{{ loginHistory.length }}</view>
        <view class="stats-label">总登录次数</view>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <view class="stats-value">{{ recentDays }}</view>
        <view class="stats-label">近30天</view>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <view class="stats-value">{{ uniqueDevices }}</view>
        <view class="stats-label">设备数</view>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'all' }"
          @click="changeFilter('all')"
        >
          <text class="tab-text">全部</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'today' }"
          @click="changeFilter('today')"
        >
          <text class="tab-text">今天</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'week' }"
          @click="changeFilter('week')"
        >
          <text class="tab-text">最近一周</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'month' }"
          @click="changeFilter('month')"
        >
          <text class="tab-text">最近一月</text>
        </view>
      </view>
    </view>

    <!-- 登录记录列表 -->
    <view class="history-section">
      <view class="history-list">
        <view 
          class="history-item" 
          v-for="(record, index) in filteredHistory" 
          :key="index"
        >
          <view class="history-icon">{{ getDeviceIcon(record.deviceType) }}</view>
          <view class="history-content">
            <view class="history-header">
              <text class="history-device">{{ record.deviceName }}</text>
              <text class="history-status" :class="{ success: record.status === '成功', fail: record.status === '失败' }">
                {{ record.status }}
              </text>
            </view>
            <view class="history-info">
              <text class="history-type">{{ record.deviceType }}</text>
              <text class="history-separator">·</text>
              <text class="history-location">{{ record.location }}</text>
            </view>
            <view class="history-time">{{ formatTime(record.loginTime) }}</view>
          </view>
        </view>
        
        <view v-if="filteredHistory.length === 0" class="empty-history">
          <text class="empty-text">暂无登录记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { safeNavigateBackForMine } from '@/utils/navigation.js';

export default {
  data() {
    return {
      currentFilter: 'all',
      loginHistory: [
        {
          deviceName: 'iPhone 14 Pro',
          deviceType: 'iOS',
          location: '北京市·朝阳区',
          loginTime: new Date().getTime(),
          status: '成功',
          ip: '192.168.1.100'
        },
        {
          deviceName: 'iPhone 14 Pro',
          deviceType: 'iOS',
          location: '北京市·朝阳区',
          loginTime: new Date().getTime() - 2 * 60 * 60 * 1000,
          status: '成功',
          ip: '192.168.1.100'
        },
        {
          deviceName: '华为 P50',
          deviceType: 'Android',
          location: '北京市·海淀区',
          loginTime: new Date().getTime() - 5 * 60 * 60 * 1000,
          status: '成功',
          ip: '192.168.1.101'
        },
        {
          deviceName: 'MacBook Pro',
          deviceType: 'macOS',
          location: '北京市·朝阳区',
          loginTime: new Date().getTime() - 24 * 60 * 60 * 1000,
          status: '成功',
          ip: '192.168.1.102'
        },
        {
          deviceName: 'Windows PC',
          deviceType: 'Windows',
          location: '北京市·丰台区',
          loginTime: new Date().getTime() - 3 * 24 * 60 * 60 * 1000,
          status: '成功',
          ip: '192.168.1.103'
        },
        {
          deviceName: 'iPad Pro',
          deviceType: 'iOS',
          location: '北京市·朝阳区',
          loginTime: new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
          status: '成功',
          ip: '192.168.1.104'
        },
        {
          deviceName: 'Unknown Device',
          deviceType: '其他',
          location: '未知地区',
          loginTime: new Date().getTime() - 10 * 24 * 60 * 60 * 1000,
          status: '失败',
          ip: '192.168.1.105'
        },
        {
          deviceName: 'iPhone 13',
          deviceType: 'iOS',
          location: '北京市·西城区',
          loginTime: new Date().getTime() - 15 * 24 * 60 * 60 * 1000,
          status: '成功',
          ip: '192.168.1.106'
        },
        {
          deviceName: '华为 Mate 50',
          deviceType: 'Android',
          location: '北京市·东城区',
          loginTime: new Date().getTime() - 20 * 24 * 60 * 60 * 1000,
          status: '成功',
          ip: '192.168.1.107'
        },
        {
          deviceName: 'Windows PC',
          deviceType: 'Windows',
          location: '北京市·石景山区',
          loginTime: new Date().getTime() - 25 * 24 * 60 * 60 * 1000,
          status: '成功',
          ip: '192.168.1.108'
        }
      ]
    };
  },
  computed: {
    recentDays() {
      const now = new Date().getTime();
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      return this.loginHistory.filter(record => record.loginTime >= thirtyDaysAgo).length;
    },
    uniqueDevices() {
      const devices = new Set();
      this.loginHistory.forEach(record => {
        if (record.status === '成功') {
          devices.add(record.deviceName);
        }
      });
      return devices.size;
    },
    filteredHistory() {
      const now = new Date().getTime();
      let startTime = 0;
      
      switch (this.currentFilter) {
        case 'today':
          startTime = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
          break;
        case 'week':
          startTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case 'month':
          startTime = now - 30 * 24 * 60 * 60 * 1000;
          break;
        default:
          return this.loginHistory;
      }
      
      return this.loginHistory.filter(record => record.loginTime >= startTime);
    }
  },
  onLoad() {
    this.loadLoginHistory();
  },
  methods: {
    goBack() {
      safeNavigateBackForMine('login-history');
    },
    loadLoginHistory() {
      // 从本地存储加载登录记录
      const storedHistory = uni.getStorageSync('loginHistory');
      if (storedHistory && storedHistory.length > 0) {
        this.loginHistory = storedHistory;
      }
      
      // 这里应该调用API获取登录记录
      // this.fetchLoginHistoryFromAPI();
    },
    changeFilter(filter) {
      this.currentFilter = filter;
    },
    getDeviceIcon(deviceType) {
      const iconMap = {
        'iOS': '📱',
        'Android': '📱',
        'Windows': '💻',
        'macOS': '💻',
        'Linux': '💻',
        'iPad': '📱',
        '其他': '💻'
      };
      return iconMap[deviceType] || '💻';
    },
    formatTime(timestamp) {
      const now = new Date().getTime();
      const diff = now - timestamp;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (seconds < 60) {
        return '刚刚';
      } else if (minutes < 60) {
        return `${minutes}分钟前`;
      } else if (hours < 24) {
        return `${hours}小时前`;
      } else if (days < 7) {
        return `${days}天前`;
      } else {
        const date = new Date(timestamp);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        return `${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-top: 88rpx;
  padding-bottom: 40rpx;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(to bottom, #4A90E2, #6AAFE2);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding-top: var(--status-bar-height, 44rpx);
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
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 60rpx;
}

/* 统计信息区域 */
.stats-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stats-value {
  font-size: 48rpx;
  color: #4A90E2;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.stats-label {
  font-size: 24rpx;
  color: #999999;
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background-color: #F0F0F0;
}

/* 筛选标签区域 */
.filter-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 20rpx 30rpx;
  border-radius: 20rpx;
}

.filter-tabs {
  display: flex;
  align-items: center;
  gap: 20rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.filter-tab {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  background-color: #F5F5F5;
  transition: all 0.3s;
  white-space: nowrap;
}

.filter-tab.active {
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
}

.tab-text {
  font-size: 26rpx;
  color: #666666;
}

.filter-tab.active .tab-text {
  color: white;
  font-weight: 500;
}

/* 登录记录列表区域 */
.history-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
}

.history-list {
  margin-top: 20rpx;
}

.history-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.history-device {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.history-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  background-color: #F5F5F5;
  color: #666666;
}

.history-status.success {
  background-color: #E8F8F5;
  color: #4CAF50;
}

.history-status.fail {
  background-color: #FFEBEE;
  color: #F44336;
}

.history-info {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.history-type {
  font-size: 26rpx;
  color: #666666;
}

.history-separator {
  font-size: 26rpx;
  color: #CCCCCC;
  margin: 0 12rpx;
}

.history-location {
  font-size: 26rpx;
  color: #666666;
}

.history-time {
  font-size: 24rpx;
  color: #999999;
}

.empty-history {
  padding: 80rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>

