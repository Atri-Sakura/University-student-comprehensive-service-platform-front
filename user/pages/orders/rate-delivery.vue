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
import orderApi from '@/api/order.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      orderId: '',
      numericOrderId: '', // 数字类型的订单ID，用于提交评价
      currentRating: 0,
      commentText: '',
      wordCount: 0,
      deliveryInfo: {
        name: ''
      },
      orderInfo: {
        orderNo: '',
        taskContent: ''
      }
    };
  },
  onLoad(options) {
    // 接收订单ID或订单号参数
    if (options.orderId) {
      this.orderId = options.orderId;
      this.numericOrderId = options.orderId; // 使用页面参数作为备选
      console.log('订单ID:', this.orderId);
      // 调用API获取订单数据
      this.loadOrderData();
    } else if (options.orderNo) {
      this.orderId = options.orderNo;
      // 尝试从订单号中提取数字部分
      const numericPart = options.orderNo.replace(/[^\d]/g, '');
      if (numericPart) {
        this.numericOrderId = numericPart;
      }
      console.log('订单号:', this.orderId);
      console.log('提取的数字部分:', numericPart);
      // 调用API获取订单数据
      this.loadOrderData();
    }
  },
  methods: {
    // 加载订单数据
    async loadOrderData() {
      try {
        // 调用订单详情接口获取订单信息
        const response = await orderApi.getOrderDetail(this.orderId);
        console.log('订单详情接口返回:', response);
        
        let orderData;
        // 兼容API返回的两种格式：含code字段的标准格式和直接返回数据的格式
        if (response && response.code === 200) {
          orderData = response.data;
        } else {
          // API可能直接返回数据而不包含code字段
          orderData = response;
        }
        
        console.log('订单数据:', orderData);
        // 确保orderData存在
        if (orderData) {
          // 从orderTakeoutDetailList获取商品信息作为任务内容
          let taskContent = orderData.taskContent || '';
          if (!taskContent && orderData.orderTakeoutDetailList && orderData.orderTakeoutDetailList.length > 0) {
            const detail = orderData.orderTakeoutDetailList[0];
            taskContent = `${detail.goodsName || '商品'} x ${detail.quantity || 1}`;
          }
          
          // 更新订单信息
          this.orderInfo = {
            orderNo: orderData.orderNo || '',
            taskContent: taskContent
          };
          
          // 保存数字类型的订单ID用于提交评价
          console.log('orderData.orderId:', orderData.orderId);
          this.numericOrderId = orderData.orderId || orderData.orderMainId || orderData.orderNo || '';
          console.log('this.numericOrderId:', this.numericOrderId);
          
          // 更新配送员信息，兼容不同的骑手姓名字段
          this.deliveryInfo = {
            name: orderData.riderName || orderData.riderNickname || orderData.deliveryName || '未知配送员'
          };
        } else {
          console.error('订单数据为空');
          uni.showToast({
            title: '获取订单信息失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('加载订单数据失败:', error);
        // 重置orderInfo、deliveryInfo和numericOrderId以避免页面错误
        this.orderInfo = {
          orderNo: '',
          taskContent: ''
        };
        this.deliveryInfo = {
          name: '未知配送员'
        };
        this.numericOrderId = '';
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    },
    
    // 设置评分
    setRating(rating) {
      this.currentRating = rating;
    },
    
    // 计算字数
    countWords() {
      this.wordCount = this.commentText.length;
    },
    
    // 提交评价
    async submitRating() {
      if (this.currentRating === 0) {
        uni.showToast({
          title: '请选择评分',
          icon: 'none'
        });
        return;
      }
      
      // 构建评价数据（根据后端接口要求的RiderEvaluationDTO格式）
      const evaluationData = {
        orderId: this.numericOrderId,
        rating: this.currentRating,
        content: this.commentText
      };
      
      console.log('提交评价数据:', evaluationData);
      console.log('当前订单信息:', {orderId: this.orderId, numericOrderId: this.numericOrderId});
      
      try {
        // 显示加载提示
        uni.showLoading({
          title: '提交中...'
        });
        
        // 调用API提交评价
        const response = await orderApi.submitRiderEvaluation(evaluationData);
        
        // 隐藏加载提示
        uni.hideLoading();
        
        if (response && response.code === 200) {
          uni.showToast({
            title: '评价成功',
            icon: 'success'
          });
          
          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: response.msg || '评价失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('提交评价失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
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