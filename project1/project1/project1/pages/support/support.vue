<template>
  <view class="page-container">
    <!-- 顶部客服信息 -->
    <view class="header-section">
      <view class="service-icon">
        <text class="icon-text">🎧</text>
      </view>
      <view class="header-info">
        <text class="service-title">在线客服</text>
        <text class="service-desc">为您提供7×24小时服务</text>
      </view>
    </view>

    <!-- 快捷联系方式 -->
    <view class="contact-card">
      <view class="card-title">快捷联系</view>
      <view class="contact-item" @click="callPhone">
        <view class="contact-left">
          <view class="contact-icon phone-icon">
            <text class="contact-icon-text">📞</text>
          </view>
          <view class="contact-info">
            <text class="contact-name">电话客服</text>
            <text class="contact-detail">400-888-8888</text>
          </view>
        </view>
        <text class="contact-arrow">›</text>
      </view>
      <view class="contact-item" @click="openOnlineService">
        <view class="contact-left">
          <view class="contact-icon online-icon">
            <text class="contact-icon-text">💻</text>
          </view>
          <view class="contact-info">
            <text class="contact-name">在线客服</text>
            <text class="contact-detail">即时响应，快速解答</text>
          </view>
        </view>
        <text class="contact-arrow">›</text>
      </view>
    </view>

    <!-- 常见问题 -->
    <view class="faq-card">
      <view class="card-title">常见问题</view>
      <view class="faq-list">
        <view class="faq-item" v-for="(item, index) in faqList" :key="index" @click="viewFaq(item)">
          <view class="faq-icon">
            <text class="faq-icon-text">❓</text>
          </view>
          <text class="faq-text">{{ item.question }}</text>
          <text class="faq-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 意见反馈 -->
    <view class="feedback-card">
      <view class="card-title">意见反馈</view>
      <view class="feedback-form">
        <textarea 
          class="feedback-input" 
          placeholder="请输入您的意见或建议..." 
          :maxlength="500"
          v-model="feedbackText"
          placeholder-style="color: #999;"
        />
        <view class="feedback-count">{{ feedbackText.length }}/500</view>
        <view class="contact-input-group">
          <text class="input-label">联系方式（选填）</text>
          <input 
            class="contact-input" 
            type="text" 
            placeholder="手机号或微信号" 
            v-model="contactInfo"
            placeholder-style="color: #999;"
          />
        </view>
        <view class="submit-btn" @click="submitFeedback">
          <text class="submit-text">提交反馈</text>
        </view>
      </view>
    </view>

    <!-- 工作时间提示 -->
    <view class="tips-card">
      <view class="tips-icon">💡</view>
      <view class="tips-content">
        <text class="tips-title">服务时间</text>
        <text class="tips-text">人工客服：9:00 - 21:00</text>
        <text class="tips-text">自动客服：7×24小时在线</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SupportPage',
  data() {
    return {
      feedbackText: '',
      contactInfo: '',
      faqList: [
        { question: '如何修改店铺营业时间？', answer: '进入"我的"-"门店设置"即可修改' },
        { question: '如何处理退款订单？', answer: '在订单详情页点击退款处理按钮' },
        { question: '配送费如何设置？', answer: '在门店设置中可以自定义配送费和起送价' },
        { question: '如何查看营业数据？', answer: '点击首页"数据分析"查看详细数据' },
        { question: '如何添加新商品？', answer: '进入"商品管理"页面，点击添加商品按钮' }
      ]
    }
  },
  methods: {
    callPhone() {
      uni.showModal({
        title: '拨打电话',
        content: '是否拨打客服电话：400-888-8888',
        success: (res) => {
          if (res.confirm) {
            uni.makePhoneCall({
              phoneNumber: '4008888888',
              success: () => {
                console.log('拨打成功');
              },
              fail: () => {
                uni.showToast({
                  title: '拨打失败',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
    },
    openOnlineService() {
      uni.showToast({
        title: '正在连接客服...',
        icon: 'loading',
        duration: 1500
      });
      setTimeout(() => {
        uni.showToast({
          title: '客服系统开发中',
          icon: 'none'
        });
      }, 1500);
    },
    viewFaq(item) {
      uni.showModal({
        title: item.question,
        content: item.answer,
        showCancel: false,
        confirmText: '知道了'
      });
    },
    submitFeedback() {
      if (!this.feedbackText.trim()) {
        uni.showToast({
          title: '请输入反馈内容',
          icon: 'none'
        });
        return;
      }

      uni.showLoading({
        title: '提交中...'
      });

      // 模拟提交
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '提交成功',
          icon: 'success'
        });
        this.feedbackText = '';
        this.contactInfo = '';
      }, 1500);
    }
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
}

/* 顶部客服信息 */
.header-section {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
}

.service-icon {
  width: 100rpx;
  height: 100rpx;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon-text {
  font-size: 50rpx;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.service-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.service-desc {
  font-size: 24rpx;
  color: #666;
}

/* 通用卡片样式 */
.contact-card,
.faq-card,
.feedback-card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
}

/* 快捷联系方式 */
.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.contact-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.phone-icon {
  background: linear-gradient(135deg, #A8E6CF, #7FD3B3);
}

.online-icon {
  background: linear-gradient(135deg, #FFD3B6, #FFAA85);
}

.contact-icon-text {
  font-size: 36rpx;
}

.contact-info {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.contact-detail {
  font-size: 24rpx;
  color: #999;
}

.contact-arrow {
  font-size: 50rpx;
  color: #ccc;
  font-weight: 300;
}

/* 常见问题 */
.faq-list {
  display: flex;
  flex-direction: column;
}

.faq-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFE5B4, #FFD699);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.faq-icon-text {
  font-size: 28rpx;
}

.faq-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
}

.faq-arrow {
  font-size: 50rpx;
  color: #ccc;
  font-weight: 300;
  margin-left: 10rpx;
}

/* 意见反馈 */
.feedback-form {
  display: flex;
  flex-direction: column;
}

.feedback-input {
  width: 100%;
  height: 300rpx;
  padding: 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  box-sizing: border-box;
}

.feedback-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 10rpx;
  margin-bottom: 30rpx;
}

.contact-input-group {
  margin-bottom: 30rpx;
}

.input-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 15rpx;
}

.contact-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.submit-btn {
  width: 100%;
  padding: 30rpx 0;
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  border-radius: 12rpx;
  text-align: center;
  box-sizing: border-box;
}

.submit-text {
  font-size: 30rpx;
  color: white;
  font-weight: bold;
}

/* 工作时间提示 */
.tips-card {
  background: linear-gradient(135deg, #FFF9E6, #FFF3CC);
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: flex-start;
}

.tips-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.tips-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tips-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.tips-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.8;
}
</style>

