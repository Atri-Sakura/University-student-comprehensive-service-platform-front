<template>
  <view class="container">
    <!-- 用户信息区域 -->
    <view class="user-info-section">
      <view class="user-avatar">
        <image v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar-image" mode="aspectFill"></image>
        <text v-else class="avatar-text">{{ avatarText }}</text>
      </view>
      <view class="user-details">
        <text class="user-name">{{ userInfo.nickname || '未设置昵称' }}</text>
        <text class="user-desc">{{ userInfo.profile || '这个人很懒，什么都没有留下' }}</text>
      </view>
    </view>

    <!-- 功能列表区域 -->
    <view class="menu-section">
      <view class="menu-item" v-for="(item, index) in menuItems" :key="index" @click="handleMenuClick(item)">
        <view class="menu-left">
          <view class="menu-icon" :class="item.iconClass"></view>
          <text class="menu-text">{{ item.name }}</text>
        </view>
        <view class="menu-right">
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <!-- 自定义底部导航栏 -->
    <custom-tabbar :current="3"></custom-tabbar>
  </view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
import { getUserInfo } from '@/api/user.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      userInfo: {
        avatar: '',
        nickname: '',
        profile: ''
      },
      menuItems: [
        { name: '个人信息', iconClass: 'icon-user', route: '/pages/mine/personal-info' },
        { name: '账号安全', iconClass: 'icon-security', route: '/pages/mine/account-security' },
        { name: '收货地址', iconClass: 'icon-address', route: '/pages/mine/address' },
        { name: '钱包', iconClass: 'icon-wallet', route: '/pages/mine/wallet' },
        { name: '全部订单', iconClass: 'icon-order', route: '/pages/orders/index' },
        { name: '个人隐私', iconClass: 'icon-privacy', route: '/pages/mine/privacy-settings' },
        { name: '客服服务', iconClass: 'icon-service', route: '/pages/mine/customer-service' },
        { name: '意见反馈', iconClass: 'icon-feedback', route: '/pages/mine/feedback' },
        { name: '切换账号', iconClass: 'icon-switch', route: '/pages/login/login' }
      ]
    };
  },
  computed: {
    avatarText() {
      // 如果有昵称，显示昵称的第一个字符，否则显示默认字符
      if (this.userInfo.nickname && this.userInfo.nickname.length > 0) {
        return this.userInfo.nickname.charAt(0).toUpperCase();
      }
      return '用';
    }
  },
  onLoad() {
    this.loadUserInfo();
  },
  onShow() {
    // 页面显示时重新加载用户信息（可能从个人信息页面返回）
    this.loadUserInfo();
  },
  methods: {
    async loadUserInfo() {
      try {
        // 先从本地存储加载
        const storedInfo = uni.getStorageSync('userInfo');
        if (storedInfo && typeof storedInfo === 'object') {
          this.userInfo = {
            avatar: storedInfo.avatar || '',
            nickname: storedInfo.nickname || '',
            profile: storedInfo.profile || ''
          };
        }
        
        // 然后从服务器获取最新数据
        const res = await getUserInfo();
        if (res && res.code === 200 && res.data) {
          const data = res.data;
          this.userInfo = {
            avatar: data.avatar || '',
            nickname: data.nickname || '',
            profile: data.profile || ''
          };
          // 更新本地存储
          uni.setStorageSync('userInfo', this.userInfo);
        }
      } catch (error) {
        // 如果网络请求失败，使用本地存储的数据
        const storedInfo = uni.getStorageSync('userInfo');
        if (storedInfo && typeof storedInfo === 'object') {
          this.userInfo = {
            avatar: storedInfo.avatar || '',
            nickname: storedInfo.nickname || '',
            profile: storedInfo.profile || ''
          };
        }
      }
    },
    handleMenuClick(item) {
      // 根据不同菜单项使用不同的导航方式
      if (item.route) {
        // 对于切换账号，清除用户信息并使用reLaunch清除页面栈
        if (item.name === '切换账号') {
          uni.showModal({
            title: '切换账号',
            content: '确定要切换账号吗？',
            success: (res) => {
              if (res.confirm) {
                // 清除用户信息和token
                uni.removeStorageSync('userInfo');
                uni.removeStorageSync('token');
                // 清空当前用户信息
                this.userInfo = {
                  avatar: '',
                  nickname: '',
                  profile: ''
                };
                // 跳转到登录页面
                uni.reLaunch({ url: item.route });
              }
            }
          });
        } else {
          uni.navigateTo({ url: item.route });
        }
      }
    },
    handleLogout() {
      // 弹出确认框
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 执行退出登录操作
            // 例如清除本地存储的用户信息、token等
            uni.removeStorageSync('userInfo');
            uni.removeStorageSync('token');
            // 清空当前用户信息
            this.userInfo = {
              avatar: '',
              nickname: '',
              profile: ''
            };
            // 跳转到登录页面
            uni.navigateTo({ url: '/pages/login/login' });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  display: flex;
  flex-direction: column;
  padding-bottom: 100rpx; /* 为底部导航栏留出空间 */
}

/* 用户信息区域样式 */
.user-info-section {
  background: linear-gradient(to bottom, #4A90E2, #6AAFE2);
  padding: 40rpx;
  display: flex;
  align-items: center;
  color: white;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #4CAF50;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.user-desc {
  font-size: 28rpx;
  opacity: 0.9;
}

/* 功能列表区域样式 */
.menu-section {
  margin-top: 30rpx;
  background-color: white;
  padding: 0 40rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 24rpx;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

/* 图标样式 - 使用文字图标代替图片 */
.icon-user::before {
  content: '👤';
  font-size: 40rpx;
}

.icon-security::before {
  content: '🛡️';
  font-size: 40rpx;
}

.icon-address::before {
  content: '📍';
  font-size: 40rpx;
}

.icon-wallet::before {
  content: '💳';
  font-size: 40rpx;
}

.icon-service::before {
  content: '📞';
  font-size: 40rpx;
}

.icon-feedback::before {
  content: '💬';
  font-size: 40rpx;
}

.icon-switch::before {
  content: '🔄';
  font-size: 40rpx;
}

.icon-order::before {
  content: '📋';
  font-size: 40rpx;
}

.icon-privacy::before {
  content: '🔒';
  font-size: 40rpx;
}

.icon-debug::before {
  content: '🛠️';
  font-size: 40rpx;
}

.menu-text {
  font-size: 32rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}

/* 退出登录按钮样式 */
.logout-section {
  margin-top: 40rpx;
  padding: 0 40rpx;
}

.logout-btn {
  width: 100%;
  height: 90rpx;
  background-color: white;
  color: #FF4444;
  font-size: 32rpx;
  border: none;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>


