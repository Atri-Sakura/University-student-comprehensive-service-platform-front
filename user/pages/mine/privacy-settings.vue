<template>
  <div class="privacy-settings-container">
    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 个性化推荐设置 -->
      <view class="setting-section">
        <view class="section-header">
          <view class="header-icon">
            <text class="icon">👤</text>
          </view>
          <view class="header-title">个性化推荐设置</view>
        </view>
        
        <view class="setting-item">
          <view class="setting-info">
            <view class="setting-label">个性化内容推荐</view>
            <view class="setting-desc">根据您的兴趣推荐更相关的内容</view>
          </view>
          <switch 
            class="toggle-switch" 
            :checked="personalizationEnabled"
            @change="togglePersonalization"
            active-color="#4CAF50"
            inactive-color="#CCCCCC"
          ></switch>
        </view>
        
        <view class="setting-description">
          开启后，我们会根据您的浏览记录、搜索习惯和偏好，为您推荐更符合个人兴趣的内容、商品和服务，提升使用体验。您可以在"我的-内容偏好设置"中管理您的兴趣标签。
        </view>
      </view>
      
      <!-- 位置信息权限 -->
      <view class="setting-section">
        <view class="section-header">
          <view class="header-icon">
            <text class="icon">📍</text>
          </view>
          <view class="header-title">位置信息权限</view>
        </view>
        
        <view class="setting-item">
          <view class="setting-info">
            <view class="setting-label">位置信息服务</view>
            <view class="setting-desc">获取您的位置信息提供附近服务</view>
          </view>
          <switch 
            class="toggle-switch" 
            :checked="locationEnabled"
            @change="toggleLocation"
            active-color="#4CAF50"
            inactive-color="#CCCCCC"
          ></switch>
        </view>
        
        <view class="setting-description">
          开启后，我们会获取您的位置信息，用于提供附近的商家、活动推荐，以及校园周边的服务信息。您的位置信息仅用于改善服务体验，我们不会未经授权共享您的位置数据。
        </view>
      </view>
    </view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      personalizationEnabled: true,
      locationEnabled: false
    };
  },
  methods: {
    togglePersonalization(e) {
      this.personalizationEnabled = e.detail.value;
      // 这里可以添加保存设置的逻辑
      console.log('个性化推荐设置:', this.personalizationEnabled);
    },
    toggleLocation(e) {
      this.locationEnabled = e.detail.value;
      // 这里可以添加保存设置的逻辑
      console.log('位置信息服务设置:', this.locationEnabled);
      
      // 如果开启位置服务，可以请求位置权限
      if (this.locationEnabled) {
        this.requestLocationPermission();
      }
    },
    requestLocationPermission() {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log('位置权限已获取', res);
        },
        fail: (err) => {
          console.error('位置权限获取失败', err);
          // 可以在这里提示用户开启位置权限
          this.locationEnabled = false;
          uni.showToast({
            title: '请在系统设置中开启位置权限',
            icon: 'none'
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.privacy-settings-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #F5F5F5;
}



/* 内容区域 */
.content {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}

/* 设置区块 */
.setting-section {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon {
  font-size: 40rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

/* 设置项 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #EEEEEE;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.setting-desc {
  font-size: 26rpx;
  color: #999;
}

.toggle-switch {
  transform: scale(0.8);
}

/* 设置说明 */
.setting-description {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #F9F9F9;
  border-radius: 15rpx;
  font-size: 28rpx;
  line-height: 44rpx;
  color: #666;
}
</style>