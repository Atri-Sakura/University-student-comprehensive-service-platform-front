<template>
  <view class="container">
    <view class="header">
      <text class="title">接口调试：/user/info</text>
      <text class="subtitle">点击下方按钮请求后端，并在控制台查看完整返回</text>
    </view>

<br/><view class="card">
      <view class="row">
        <text class="label">最新状态：</text>
        <text class="value" :class="{ error: status === '失败', success: status === '成功' }">{{ status }}</text>
      </view>
      <view class="row">
        <text class="label">提示：</text>
        <text class="value">{{ message || '暂无' }}</text>
      </view>
      <view class="row">
        <text class="label">时间：</text>
        <text class="value">{{ timestamp || '—' }}</text>
      </view>
    </view>

    <view class="button" @click="fetchUserInfo">
      <text class="button-text">发起请求并打印详细信息</text>
    </view>

    <view class="tip">
      <text>提示：打开浏览器控制台（Console）可查看完整的响应/错误对象。</text>
    </view>
  </view>
</template>

<script>
import { getUserInfo } from '@/api/user.js';

export default {
  data() {
    return {
      status: '未请求',
      message: '',
      timestamp: ''
    };
  },
  onLoad() {
    this.fetchUserInfo();
  },
  methods: {
    formatTime(date = new Date()) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    },
    async fetchUserInfo() {
      this.status = '请求中…';
      this.message = '正在请求 /user/info';
      this.timestamp = this.formatTime();

      console.group('[调试] /user/info 调用');
      console.log('请求时间：', this.timestamp);
      try {
        const res = await getUserInfo();
        console.log('后端响应对象：', res);
        if (res && res.code !== undefined && res.code !== 200) {
          this.status = '失败';
          this.message = res.message || '后端返回非200状态';
        } else {
          this.status = '成功';
          this.message = '已收到数据，查看控制台详情';
        }
      } catch (error) {
        this.status = '失败';
        this.message = error?.message || '请求异常，请查看控制台';
        console.error('请求异常：', error);
      } finally {
        this.timestamp = this.formatTime();
        console.log('完成时间：', this.timestamp);
        console.groupEnd();
      }
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 40rpx;
  background-color: #f5f5f5;
  box-sizing: border-box;
}

.header {
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
}

.subtitle {
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #666666;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 40rpx;
}

.row {
  display: flex;
  margin-bottom: 16rpx;
}

.row:last-child {
  margin-bottom: 0;
}

.label {
  width: 160rpx;
  font-size: 28rpx;
  color: #888888;
}

.value {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.value.success {
  color: #4CAF50;
}

.value.error {
  color: #FF5722;
}

.button {
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #4A90E2 0%, #6AAFE2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.button-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 600;
}

.button:active {
  opacity: 0.85;
}

.tip {
  font-size: 26rpx;
  color: #999999;
  line-height: 1.6;
}
</style>
