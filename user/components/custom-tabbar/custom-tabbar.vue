<template>
  <view class="custom-tabbar">
    <view 
      v-for="(item, index) in tabList" 
      :key="index" 
      class="tab-item"
      :class="{ 'tab-item-active': current === index }"
      @click="switchTab(index)"
      hover-class="tab-item-hover"
    >
      <view class="tab-icon-box">
        <text class="tab-icon" :class="{ active: current === index }">{{ item.icon }}</text>
      </view>
      <text class="tab-text" :class="{ active: current === index }">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomTabbar',
  props: {
    current: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      tabList: [
        {
          icon: '🏠',
          text: '首页',
          pagePath: '/pages/index/index'
        },
        {
          icon: '🛒',
          text: '二手交易',
          pagePath: '/pages/market/market'
        },
        {
          icon: '🔔',
          text: '消息',
          pagePath: '/pages/message/message'
        },
        {
          icon: '👤',
          text: '我的',
          pagePath: '/pages/mine/mine'
        }
      ]
    };
  },
  methods: {
    switchTab(index) {
      if (this.current === index) {
        return;
      }
      
      // 使用 reLaunch 确保页面可以跳转
      uni.reLaunch({
        url: this.tabList[index].pagePath,
        success: () => {
          console.log('跳转成功:', this.tabList[index].text);
        },
        fail: (err) => {
          console.error('跳转失败:', err);
        }
      });
    }
  }
};
</script>

<style scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background-color: #ffffff;
  border-top: 1px solid #eeeeee;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 9999;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
  position: relative;
  transition: all 0.3s;
}

.tab-item-hover {
  background-color: rgba(93, 205, 255, 0.1);
  transform: scale(0.95);
}

.tab-item-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background: linear-gradient(90deg, #5DCDFF 0%, #89CFF0 100%);
  border-radius: 0 0 6rpx 6rpx;
}

.tab-icon-box {
  margin-bottom: 4rpx;
}

.tab-icon {
  font-size: 48rpx;
  opacity: 0.5;
  transition: all 0.3s;
}

.tab-icon.active {
  opacity: 1;
  transform: scale(1.1);
}

.tab-text {
  font-size: 22rpx;
  color: #999999;
  transition: all 0.3s;
}

.tab-text.active {
  color: #5DCDFF;
  font-weight: 500;
}
</style>

