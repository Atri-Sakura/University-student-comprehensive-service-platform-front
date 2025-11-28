<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">登录设备</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 当前设备 -->
    <view class="current-device-section">
      <view class="section-header">
        <text class="section-title">当前设备</text>
        <text class="current-badge">当前使用</text>
      </view>
      <view class="device-item current" v-if="currentDevice">
        <view class="device-icon">📱</view>
        <view class="device-info">
          <view class="device-name">{{ currentDevice.deviceName }}</view>
          <view class="device-detail">
            <text class="device-type">{{ currentDevice.deviceType }}</text>
            <text class="device-separator">·</text>
            <text class="device-time">{{ currentDevice.lastLoginTime }}</text>
          </view>
          <view class="device-location">{{ currentDevice.location }}</view>
        </view>
      </view>
    </view>

    <!-- 其他设备列表 -->
    <view class="devices-section">
      <view class="section-header">
        <text class="section-title">其他设备</text>
        <text class="device-count">共{{ otherDevices.length }}台</text>
      </view>
      <view class="device-list">
        <view class="device-item" v-for="(device, index) in otherDevices" :key="index">
          <view class="device-icon">{{ getDeviceIcon(device.deviceType) }}</view>
          <view class="device-info">
            <view class="device-name">{{ device.deviceName }}</view>
            <view class="device-detail">
              <text class="device-type">{{ device.deviceType }}</text>
              <text class="device-separator">·</text>
              <text class="device-time">{{ device.lastLoginTime }}</text>
            </view>
            <view class="device-location">{{ device.location }}</view>
          </view>
          <view class="device-action" @click="logoutDevice(device, index)">
            <text class="logout-text">退出</text>
          </view>
        </view>
        
        <view v-if="otherDevices.length === 0" class="empty-devices">
          <text class="empty-text">暂无其他登录设备</text>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <view class="action-button" @click="logoutAllOtherDevices">
        <text class="action-text">退出所有其他设备</text>
      </view>
    </view>
  </view>
</template>

<script>
import { safeNavigateBackForMine } from '@/utils/navigation.js';

export default {
  data() {
    return {
      currentDevice: {
        deviceName: 'iPhone 14 Pro',
        deviceType: 'iOS',
        lastLoginTime: '刚刚',
        location: '北京市·朝阳区',
        deviceId: 'current'
      },
      otherDevices: [
        {
          deviceName: '华为 P50',
          deviceType: 'Android',
          lastLoginTime: '2小时前',
          location: '北京市·海淀区',
          deviceId: 'device001'
        },
        {
          deviceName: 'MacBook Pro',
          deviceType: 'macOS',
          lastLoginTime: '1天前',
          location: '北京市·朝阳区',
          deviceId: 'device002'
        },
        {
          deviceName: 'Windows PC',
          deviceType: 'Windows',
          lastLoginTime: '3天前',
          location: '北京市·丰台区',
          deviceId: 'device003'
        }
      ]
    };
  },
  onLoad() {
    this.loadDevices();
  },
  methods: {
    goBack() {
      safeNavigateBackForMine('login-devices');
    },
    loadDevices() {
      // 从本地存储加载设备信息
      const storedDevices = uni.getStorageSync('loginDevices');
      if (storedDevices) {
        if (storedDevices.currentDevice) {
          this.currentDevice = storedDevices.currentDevice;
        }
        if (storedDevices.otherDevices) {
          this.otherDevices = storedDevices.otherDevices;
        }
      }
      
      // 这里应该调用API获取设备列表
      // this.fetchDevicesFromAPI();
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
    logoutDevice(device, index) {
      uni.showModal({
        title: '退出设备',
        content: `确定要退出设备"${device.deviceName}"吗？`,
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '正在退出...'
            });
            
            // 模拟API调用
            setTimeout(() => {
              uni.hideLoading();
              this.otherDevices.splice(index, 1);
              this.saveDevices();
              
              uni.showToast({
                title: '已退出该设备',
                icon: 'success'
              });
            }, 1000);
            
            // 实际API调用示例：
            /*
            uni.request({
              url: 'https://your-api.com/user/logout-device',
              method: 'POST',
              header: {
                'Authorization': 'Bearer ' + uni.getStorageSync('token'),
                'Content-Type': 'application/json'
              },
              data: {
                deviceId: device.deviceId
              },
              success: (res) => {
                uni.hideLoading();
                if (res.data.code === 200) {
                  this.otherDevices.splice(index, 1);
                  this.saveDevices();
                  uni.showToast({
                    title: '已退出该设备',
                    icon: 'success'
                  });
                } else {
                  uni.showToast({
                    title: res.data.message || '退出失败',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                uni.hideLoading();
                uni.showToast({
                  title: '网络错误，请重试',
                  icon: 'none'
                });
              }
            });
            */
          }
        }
      });
    },
    logoutAllOtherDevices() {
      if (this.otherDevices.length === 0) {
        uni.showToast({
          title: '没有其他设备',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '退出所有其他设备',
        content: `确定要退出所有其他设备（共${this.otherDevices.length}台）吗？退出后需要重新登录`,
        confirmText: '确定退出',
        confirmColor: '#FF4444',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '正在退出...'
            });
            
            // 模拟API调用
            setTimeout(() => {
              uni.hideLoading();
              this.otherDevices = [];
              this.saveDevices();
              
              uni.showToast({
                title: '已退出所有其他设备',
                icon: 'success'
              });
            }, 1500);
            
            // 实际API调用示例：
            /*
            uni.request({
              url: 'https://your-api.com/user/logout-all-devices',
              method: 'POST',
              header: {
                'Authorization': 'Bearer ' + uni.getStorageSync('token'),
                'Content-Type': 'application/json'
              },
              success: (res) => {
                uni.hideLoading();
                if (res.data.code === 200) {
                  this.otherDevices = [];
                  this.saveDevices();
                  uni.showToast({
                    title: '已退出所有其他设备',
                    icon: 'success'
                  });
                } else {
                  uni.showToast({
                    title: res.data.message || '退出失败',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                uni.hideLoading();
                uni.showToast({
                  title: '网络错误，请重试',
                  icon: 'none'
                });
              }
            });
            */
          }
        }
      });
    },
    saveDevices() {
      // 保存到本地存储
      uni.setStorageSync('loginDevices', {
        currentDevice: this.currentDevice,
        otherDevices: this.otherDevices
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
  padding-top: 88rpx;
  padding-bottom: 200rpx;
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

/* 当前设备区域 */
.current-device-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: bold;
}

.current-badge {
  font-size: 24rpx;
  color: #4A90E2;
  background-color: #E8F4FD;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.device-count {
  font-size: 26rpx;
  color: #999999;
}

/* 设备列表区域 */
.devices-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
}

.device-list {
  margin-top: 20rpx;
}

.device-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.device-item:last-child {
  border-bottom: none;
}

.device-item.current {
  background-color: #F8FBFF;
  padding: 30rpx;
  border-radius: 16rpx;
  margin: -30rpx;
  margin-bottom: 20rpx;
  border: 1rpx solid #E8F4FD;
}

.device-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 24rpx;
}

.device-item.current .device-icon {
  background-color: #E8F4FD;
}

.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.device-name {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.device-detail {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.device-type {
  font-size: 26rpx;
  color: #666666;
}

.device-separator {
  font-size: 26rpx;
  color: #CCCCCC;
  margin: 0 12rpx;
}

.device-time {
  font-size: 26rpx;
  color: #666666;
}

.device-location {
  font-size: 24rpx;
  color: #999999;
}

.device-action {
  padding: 12rpx 24rpx;
  border: 1rpx solid #E0E0E0;
  border-radius: 8rpx;
  margin-left: 20rpx;
}

.logout-text {
  font-size: 26rpx;
  color: #666666;
}

.device-action:active {
  background-color: #F5F5F5;
}

.empty-devices {
  padding: 80rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}

/* 底部操作 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #F0F0F0;
}

.action-button {
  width: 100%;
  height: 88rpx;
  background-color: #FF4444;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.action-button:active {
  opacity: 0.8;
}
</style>

