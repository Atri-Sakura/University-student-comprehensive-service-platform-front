<template>
  <view class="rate-delivery-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="navbar-title">评价配送员</view>
      <view class="navbar-right"></view>
    </view>

    <!-- 主要内容区域 -->
    <view class="content">
      <!-- 配送员信息卡片 -->
      <view class="delivery-info-card">
        <view class="delivery-avatar">
          <text class="avatar-icon">👤</text>
        </view>
        <view class="delivery-details">
          <text class="delivery-name">{{ deliveryInfo.name }}</text>
          <text class="order-info">订单号: {{ orderInfo.orderNo }}</text>
          <text class="task-info">任务: {{ orderInfo.taskContent }}</text>
        </view>
      </view>

      <!-- 评分区域 -->
      <view class="rating-section">
        <text class="rating-label">请对本次服务评分</text>
        <view class="stars">
          <text 
            v-for="star in 5" 
            :key="star" 
            class="star"
            :class="{ active: star <= currentRating }"
            @click="setRating(star)"
          >
            ★
          </text>
        </view>
        <text class="rating-hint">点击星星进行评分</text>
      </view>

      <!-- 服务标签区域 -->
      <view class="tags-section">
        <text class="tags-label">服务标签（可选）</text>
        <view class="tags-container">
          <text 
            v-for="(tag, index) in serviceTags" 
            :key="index"
            class="tag"
            :class="{ selected: selectedTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </text>
        </view>
      </view>

      <!-- 详细评价区域 -->
      <view class="comment-section">
        <text class="comment-label">详细评价（可选）</text>
        <textarea 
          class="comment-input" 
          placeholder="请描述您的服务体验..."
          v-model="commentText"
          maxlength="200"
          @input="countWords"
        ></textarea>
        <text class="word-count">{{ wordCount }}/200</text>
      </view>

      <!-- 提交按钮 -->
      <button class="submit-button" @click="submitRating" :disabled="currentRating === 0">
        提交评价
      </button>
    </view>

    <!-- 自定义底部导航栏 -->
    <custom-tabbar :current="3"></custom-tabbar>
  </view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      orderId: '',
      currentRating: 0,
      selectedTags: [],
      commentText: '',
      wordCount: 0,
      deliveryInfo: {
        name: '张同学'
      },
      orderInfo: {
        orderNo: '#20230915123456',
        taskContent: '代取快递（中通）'
      },
      serviceTags: [
        '准时送达',
        '服务热情',
        '包装完好',
        '沟通顺畅',
        '非常专业',
        '态度友好'
      ]
    };
  },
  onLoad(options) {
    // 接收订单ID参数
    if (options.orderId) {
      this.orderId = options.orderId;
      console.log('订单ID:', this.orderId);
      // 这里可以根据订单ID从服务器获取真实数据
      this.loadOrderData();
    }
  },
  methods: {
    // 加载订单数据
    loadOrderData() {
      // 实际项目中，这里应该调用API获取订单数据
      console.log('正在加载订单数据...');
      // 模拟API请求延迟
      setTimeout(() => {
        // 这里可以根据实际情况更新订单数据
        this.deliveryInfo = {
          name: '张同学'
        };
        this.orderInfo = {
          orderNo: '#20230915123456',
          taskContent: '代取快递（中通）'
        };
      }, 300);
    },
    
    // 设置评分
    setRating(rating) {
      this.currentRating = rating;
    },
    
    // 切换标签选择状态
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag);
      if (index > -1) {
        this.selectedTags.splice(index, 1);
      } else {
        this.selectedTags.push(tag);
      }
    },
    
    // 计算字数
    countWords() {
      this.wordCount = this.commentText.length;
    },
    
    // 提交评价
    submitRating() {
      if (this.currentRating === 0) {
        uni.showToast({
          title: '请选择评分',
          icon: 'none'
        });
        return;
      }
      
      // 构建评价数据
      const ratingData = {
        orderId: this.orderId,
        rating: this.currentRating,
        tags: this.selectedTags,
        comment: this.commentText
      };
      
      console.log('提交评价数据:', ratingData);
      
      // 实际项目中，这里应该调用API提交评价
      // 模拟API请求
      uni.showLoading({
        title: '提交中...'
      });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '评价成功',
          icon: 'success'
        });
        
        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }, 1000);
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.rate-delivery-container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-top: 20rpx; /* 为固定导航栏留出空间 */
  padding-bottom: 120rpx; /* 为底部导航栏留出空间 */
}

/* 导航栏样式 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 90rpx;
  background-color: #5DCDFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  z-index: 100;
}

.back-button {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: white;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.navbar-right {
  width: 80rpx;
}

/* 内容区域 */
.content {
  padding: 30rpx;
}

/* 配送员信息卡片 */
.delivery-info-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.delivery-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #e6f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
}

.avatar-icon {
  font-size: 60rpx;
}

.delivery-details {
  flex: 1;
}

.delivery-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.order-info,
.task-info {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

/* 评分区域 */
.rating-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  text-align: center;
}

.rating-label {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.stars {
  display: flex;
  justify-content: center;
  margin-bottom: 20rpx;
}

.star {
  font-size: 60rpx;
  color: #d9d9d9;
  margin: 0 10rpx;
  transition: color 0.2s;
}

.star.active {
  color: #ffd700;
}

.rating-hint {
  font-size: 24rpx;
  color: #999;
}

/* 服务标签区域 */
.tags-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.tags-label {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tag {
  padding: 15rpx 30rpx;
  background-color: #f0f0f0;
  border-radius: 30rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.2s;
}

.tag.selected {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 2rpx solid #1890ff;
}

/* 详细评价区域 */
.comment-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.comment-label {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.comment-input {
  width: 100%;
  height: 200rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  resize: none;
  box-sizing: border-box;
}

.comment-input:focus {
  border-color: #5DCDFF;
  outline: none;
}

.comment-input::placeholder {
  color: #999;
}

.word-count {
  font-size: 24rpx;
  color: #999;
  float: right;
  margin-top: 10rpx;
}

/* 提交按钮 */
.submit-button {
  width: 100%;
  height: 90rpx;
  background-color: #5DCDFF;
  color: white;
  font-size: 32rpx;
  border-radius: 45rpx;
  margin-top: 20rpx;
  border: none;
}

.submit-button::after {
  border: none;
}

.submit-button:disabled {
  background-color: #d9d9d9;
  color: #fff;
}
</style>