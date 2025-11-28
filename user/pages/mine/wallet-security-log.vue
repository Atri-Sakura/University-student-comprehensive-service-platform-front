<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">安全日志</text>
        </view>
        <view class="navbar-right"></view>
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
          :class="{ active: currentFilter === 'password' }"
          @click="changeFilter('password')"
        >
          <text class="tab-text">密码</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'payment' }"
          @click="changeFilter('payment')"
        >
          <text class="tab-text">支付</text>
        </view>
        <view 
          class="filter-tab" 
          :class="{ active: currentFilter === 'security' }"
          @click="changeFilter('security')"
        >
          <text class="tab-text">安全</text>
        </view>
      </view>
    </view>

    <!-- 安全日志列表 -->
    <view class="log-section">
      <view class="log-list">
        <view 
          class="log-group" 
          v-for="(group, groupIndex) in groupedLogs" 
          :key="groupIndex"
        >
          <view class="group-header">
            <text class="group-date">{{ group.date }}</text>
            <text class="group-count">共{{ group.items.length }}条</text>
          </view>
          <view class="log-items">
            <view 
              class="log-item" 
              v-for="(item, index) in group.items" 
              :key="index"
              @click="viewLogDetail(item)"
            >
              <view class="log-icon">
                <text class="icon-text">{{ getLogIcon(item.type) }}</text>
              </view>
              <view class="log-content">
                <view class="log-header">
                  <text class="log-title">{{ item.title }}</text>
                  <text class="log-status" :class="{ 
                    success: item.status === 'success', 
                    failed: item.status === 'failed',
                    warning: item.status === 'warning'
                  }">
                    {{ getStatusText(item.status) }}
                  </text>
                </view>
                <view class="log-info">
                  <text class="log-desc">{{ item.desc }}</text>
                </view>
                <view class="log-footer">
                  <text class="log-time">{{ formatTime(item.time) }}</text>
                  <text class="log-location">{{ item.location || '未知位置' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <view v-if="filteredLogs.length === 0" class="empty-logs">
          <text class="empty-icon">📋</text>
          <text class="empty-text">暂无安全日志</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentFilter: 'all',
      allLogs: [
        {
          id: 1,
          type: 'password',
          title: '修改支付密码',
          desc: '支付密码已成功修改',
          status: 'success',
          time: new Date().getTime() - 2 * 60 * 60 * 1000,
          location: '北京市·朝阳区',
          ip: '192.168.1.100'
        },
        {
          id: 2,
          type: 'payment',
          title: '大额交易',
          desc: '交易金额：¥500.00',
          status: 'success',
          time: new Date().getTime() - 5 * 60 * 60 * 1000,
          location: '北京市·海淀区',
          ip: '192.168.1.101'
        },
        {
          id: 3,
          type: 'security',
          title: '设置安全问题',
          desc: '已设置3个安全问题',
          status: 'success',
          time: new Date().getTime() - 24 * 60 * 60 * 1000,
          location: '北京市·朝阳区',
          ip: '192.168.1.102'
        },
        {
          id: 4,
          type: 'payment',
          title: '异常登录尝试',
          desc: '检测到异常登录行为',
          status: 'warning',
          time: new Date().getTime() - 2 * 24 * 60 * 60 * 1000,
          location: '未知地区',
          ip: '192.168.1.103'
        },
        {
          id: 5,
          type: 'password',
          title: '修改支付密码失败',
          desc: '原密码错误',
          status: 'failed',
          time: new Date().getTime() - 3 * 24 * 60 * 60 * 1000,
          location: '北京市·丰台区',
          ip: '192.168.1.104'
        },
        {
          id: 6,
          type: 'security',
          title: '绑定安全手机',
          desc: '已成功绑定安全手机',
          status: 'success',
          time: new Date().getTime() - 5 * 24 * 60 * 60 * 1000,
          location: '北京市·朝阳区',
          ip: '192.168.1.105'
        },
        {
          id: 7,
          type: 'payment',
          title: '设置交易限额',
          desc: '单笔限额设置为：¥5000',
          status: 'success',
          time: new Date().getTime() - 7 * 24 * 60 * 60 * 1000,
          location: '北京市·西城区',
          ip: '192.168.1.106'
        },
        {
          id: 8,
          type: 'security',
          title: '开启免密支付',
          desc: '免密额度：¥200',
          status: 'success',
          time: new Date().getTime() - 10 * 24 * 60 * 60 * 1000,
          location: '北京市·东城区',
          ip: '192.168.1.107'
        },
        {
          id: 9,
          type: 'password',
          title: '找回支付密码',
          desc: '通过安全问题找回',
          status: 'success',
          time: new Date().getTime() - 15 * 24 * 60 * 60 * 1000,
          location: '北京市·石景山区',
          ip: '192.168.1.108'
        },
        {
          id: 10,
          type: 'payment',
          title: '提现申请',
          desc: '提现金额：¥100.00',
          status: 'success',
          time: new Date().getTime() - 20 * 24 * 60 * 60 * 1000,
          location: '北京市·朝阳区',
          ip: '192.168.1.109'
        }
      ]
    };
  },
  computed: {
    filteredLogs() {
      if (this.currentFilter === 'all') {
        return this.allLogs;
      }
      return this.allLogs.filter(log => log.type === this.currentFilter);
    },
    groupedLogs() {
      const groups = {};
      this.filteredLogs.forEach(log => {
        const date = this.formatDate(log.time);
        if (!groups[date]) {
          groups[date] = {
            date: date,
            items: []
          };
        }
        groups[date].items.push(log);
      });
      return Object.values(groups).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
    }
  },
  onLoad() {
    this.loadSecurityLogs();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    loadSecurityLogs() {
      // 从本地存储加载安全日志
      const storedLogs = uni.getStorageSync('walletSecurityLogs');
      if (storedLogs && storedLogs.length > 0) {
        this.allLogs = storedLogs;
      }
      
      // 这里应该调用API获取安全日志
      // this.fetchSecurityLogsFromAPI();
    },
    changeFilter(filter) {
      this.currentFilter = filter;
    },
    getLogIcon(type) {
      const iconMap = {
        'password': '🔐',
        'payment': '💰',
        'security': '🛡️'
      };
      return iconMap[type] || '📋';
    },
    getStatusText(status) {
      const statusMap = {
        'success': '成功',
        'failed': '失败',
        'warning': '警告'
      };
      return statusMap[status] || '未知';
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      const hour = date.getHours().toString().padStart(2, '0');
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `${hour}:${minute}`;
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
      const weekday = weekdays[date.getDay()];
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return '今天';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天';
      } else {
        return `${month}月${day}日 星期${weekday}`;
      }
    },
    viewLogDetail(item) {
      uni.showModal({
        title: item.title,
        content: `类型：${this.getLogTypeText(item.type)}\n描述：${item.desc}\n状态：${this.getStatusText(item.status)}\n时间：${this.formatDate(item.time)} ${this.formatTime(item.time)}\n位置：${item.location}\nIP地址：${item.ip}`,
        showCancel: false
      });
    },
    getLogTypeText(type) {
      const typeMap = {
        'password': '密码操作',
        'payment': '支付操作',
        'security': '安全设置'
      };
      return typeMap[type] || '其他';
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
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
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
  width: 60rpx;
}

/* 筛选标签 */
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
}

.filter-tab {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  background-color: #F5F5F5;
  transition: all 0.3s;
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

/* 安全日志列表 */
.log-section {
  margin: 20rpx 30rpx;
}

.log-group {
  background-color: white;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background-color: #F8F8F8;
  border-bottom: 1rpx solid #F0F0F0;
}

.group-date {
  font-size: 28rpx;
  color: #333333;
  font-weight: bold;
}

.group-count {
  font-size: 24rpx;
  color: #999999;
}

.log-items {
  padding: 0 30rpx;
}

.log-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.log-item:last-child {
  border-bottom: none;
}

.log-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.icon-text {
  font-size: 40rpx;
}

.log-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.log-title {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.log-status {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.log-status.success {
  background-color: #E8F8F5;
  color: #4CAF50;
}

.log-status.failed {
  background-color: #FFEBEE;
  color: #F44336;
}

.log-status.warning {
  background-color: #FFF4E6;
  color: #FF9800;
}

.log-info {
  margin-bottom: 12rpx;
}

.log-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
}

.log-footer {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.log-time {
  font-size: 24rpx;
  color: #999999;
}

.log-location {
  font-size: 24rpx;
  color: #999999;
}

.empty-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  background-color: white;
  border-radius: 20rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>

