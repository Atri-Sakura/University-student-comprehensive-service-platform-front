<template>
  <view class="page-container">
    <!-- 顶部统计 -->
    <view class="stats-header">
      <view class="stats-item">
        <text class="stats-value">{{ overallScore }}</text>
        <text class="stats-label">综合评分</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value">{{ totalReviews }}</text>
        <text class="stats-label">总评价数</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value">{{ goodRate }}%</text>
        <text class="stats-label">好评率</text>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-tabs">
      <view 
        class="filter-tab" 
        :class="{ active: currentFilter === index }"
        v-for="(filter, index) in filters" 
        :key="index"
        @click="switchFilter(index)"
      >
        <text class="filter-text">{{ filter.name }}</text>
        <text v-if="filter.count > 0" class="filter-count">({{ filter.count }})</text>
      </view>
    </view>

    <!-- 评价列表 -->
    <view class="content">
      <view class="review-item" v-for="(item, index) in filteredReviews" :key="index">
        <view class="review-header">
          <view class="user-info">
            <view class="user-avatar">
              <text class="avatar-text">{{ item.userName.charAt(0) }}</text>
            </view>
            <view class="user-detail">
              <text class="user-name">{{ item.userName }}</text>
              <text class="review-time">{{ item.time }}</text>
            </view>
          </view>
          <view class="rating-stars">
            <text class="star" v-for="n in 5" :key="n">{{ n <= item.rating ? '⭐' : '☆' }}</text>
          </view>
        </view>

        <view class="review-content">
          <text class="review-text">{{ item.content }}</text>
        </view>

        <!-- 评价图片 -->
        <view class="review-images" v-if="item.images && item.images.length > 0">
          <image 
            v-for="(img, idx) in item.images" 
            :key="idx" 
            :src="img" 
            class="review-image"
            mode="aspectFill"
            @click="previewImage(item.images, idx)"
          />
        </view>

        <!-- 评价标签 -->
        <view class="review-tags" v-if="item.tags && item.tags.length > 0">
          <view class="tag" v-for="(tag, idx) in item.tags" :key="idx">
            <text class="tag-text">{{ tag }}</text>
          </view>
        </view>

        <!-- 商家回复 -->
        <view class="reply-section" v-if="item.reply">
          <view class="reply-header">
            <text class="reply-icon">💬</text>
            <text class="reply-label">商家回复：</text>
          </view>
          <text class="reply-content">{{ item.reply }}</text>
        </view>

        <!-- 操作按钮 -->
        <view class="review-actions">
          <view class="action-btn" @click="replyReview(item, index)" v-if="!item.reply">
            <text class="action-text">💬 回复</text>
          </view>
          <view class="action-btn" @click="deleteReview(item, index)">
            <text class="action-text">🗑️ 删除</text>
          </view>
        </view>
      </view>

      <view v-if="filteredReviews.length === 0" class="empty">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无评价</text>
      </view>
    </view>

    <!-- 回复弹窗 -->
    <view class="reply-modal" v-if="showReplyModal" @click="closeReplyModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">回复评价</text>
          <text class="modal-close" @click="closeReplyModal">✕</text>
        </view>
        
        <view class="modal-body">
          <textarea 
            class="reply-textarea" 
            :value="replyText"
            @input="replyText = $event.detail.value"
            placeholder="请输入回复内容..."
            placeholder-style="color: #999;"
            maxlength="200"
          />
          <view class="reply-count">{{ replyText.length }}/200</view>
        </view>

        <view class="modal-footer">
          <view class="modal-btn cancel-btn" @click="closeReplyModal">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm-btn" @click="submitReply">
            <text class="modal-btn-text">发送</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ReviewsPage',
  data() {
    return {
      overallScore: 4.8,
      totalReviews: 186,
      goodRate: 92,
      currentFilter: 0,
      filters: [
        { name: '全部', count: 0 },
        { name: '好评', count: 156 },
        { name: '中评', count: 25 },
        { name: '差评', count: 5 }
      ],
      showReplyModal: false,
      replyText: '',
      replyingIndex: -1,
      reviews: [
        {
          userName: '张三',
          rating: 5,
          time: '2024-01-15 18:30',
          content: '味道很好，配送速度快，包装也很精美，下次还会再来！',
          images: [],
          tags: ['味道好', '配送快', '包装精美'],
          reply: '感谢您的好评，期待再次为您服务！'
        },
        {
          userName: '李四',
          rating: 5,
          time: '2024-01-15 17:20',
          content: '汉堡很新鲜，薯条也很脆，店家服务态度很好。',
          images: [],
          tags: ['味道好', '服务好'],
          reply: ''
        },
        {
          userName: '王五',
          rating: 4,
          time: '2024-01-15 16:10',
          content: '总体不错，就是送得有点慢，希望能改进。',
          images: [],
          tags: ['味道好'],
          reply: '非常抱歉让您久等了，我们会加强配送速度，感谢您的建议！'
        },
        {
          userName: '赵六',
          rating: 5,
          time: '2024-01-14 19:45',
          content: '经常点这家，从来没有失望过，强烈推荐！',
          images: [],
          tags: ['味道好', '性价比高'],
          reply: ''
        },
        {
          userName: '孙七',
          rating: 3,
          time: '2024-01-14 18:30',
          content: '味道一般般，分量也不是很足。',
          images: [],
          tags: ['分量不足'],
          reply: ''
        },
        {
          userName: '周八',
          rating: 2,
          time: '2024-01-14 17:15',
          content: '配送时间太长了，等了一个多小时，东西都凉了。',
          images: [],
          tags: ['配送慢'],
          reply: ''
        },
        {
          userName: '吴九',
          rating: 5,
          time: '2024-01-13 20:00',
          content: '很满意，食材新鲜，份量足，价格实惠！',
          images: [],
          tags: ['味道好', '性价比高', '分量足'],
          reply: '谢谢您的认可！'
        },
        {
          userName: '郑十',
          rating: 4,
          time: '2024-01-13 19:20',
          content: '不错，就是饮料有点少，其他都挺好的。',
          images: [],
          tags: ['味道好'],
          reply: ''
        }
      ]
    }
  },
  computed: {
    filteredReviews() {
      if (this.currentFilter === 0) {
        return this.reviews;
      } else if (this.currentFilter === 1) {
        // 好评：4-5星
        return this.reviews.filter(r => r.rating >= 4);
      } else if (this.currentFilter === 2) {
        // 中评：3星
        return this.reviews.filter(r => r.rating === 3);
      } else {
        // 差评：1-2星
        return this.reviews.filter(r => r.rating <= 2);
      }
    }
  },
  methods: {
    switchFilter(index) {
      this.currentFilter = index;
    },
    previewImage(images, index) {
      uni.previewImage({
        urls: images,
        current: index
      });
    },
    replyReview(item, index) {
      this.replyingIndex = this.reviews.indexOf(item);
      this.replyText = '';
      this.showReplyModal = true;
    },
    closeReplyModal() {
      this.showReplyModal = false;
      this.replyText = '';
      this.replyingIndex = -1;
    },
    submitReply() {
      if (!this.replyText.trim()) {
        uni.showToast({
          title: '请输入回复内容',
          icon: 'none'
        });
        return;
      }

      if (this.replyingIndex >= 0) {
        this.reviews[this.replyingIndex].reply = this.replyText;
        uni.showToast({
          title: '回复成功',
          icon: 'success'
        });
      }

      this.closeReplyModal();
    },
    deleteReview(item, index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这条评价吗？',
        success: (res) => {
          if (res.confirm) {
            const realIndex = this.reviews.indexOf(item);
            this.reviews.splice(realIndex, 1);
            this.totalReviews--;
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      });
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

/* 顶部统计 */
.stats-header {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stats-label {
  font-size: 24rpx;
  color: #666;
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: rgba(0, 0, 0, 0.1);
}

/* 筛选标签 */
.filter-tabs {
  background: white;
  padding: 20rpx 30rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.filter-tab {
  padding: 15rpx 30rpx;
  background: #f5f7fa;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s;
}

.filter-tab.active {
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
}

.filter-text {
  font-size: 26rpx;
  color: #666;
}

.filter-tab.active .filter-text {
  color: white;
  font-weight: 500;
}

.filter-count {
  font-size: 22rpx;
  color: #999;
}

.filter-tab.active .filter-count {
  color: rgba(255, 255, 255, 0.8);
}

/* 评价列表 */
.content {
  padding: 20rpx;
}

.review-item {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #FFE5B4, #FFD699);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.avatar-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #666;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.review-time {
  font-size: 22rpx;
  color: #999;
}

.rating-stars {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 28rpx;
}

.review-content {
  margin-bottom: 20rpx;
}

.review-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}

/* 评价图片 */
.review-images {
  display: flex;
  gap: 15rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
}

.review-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
}

/* 评价标签 */
.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 20rpx;
}

.tag {
  padding: 8rpx 20rpx;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 30rpx;
}

.tag-text {
  font-size: 22rpx;
  color: #4A90E2;
}

/* 商家回复 */
.reply-section {
  background: #f5f7fa;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.reply-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.reply-icon {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.reply-label {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}

.reply-content {
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

/* 操作按钮 */
.review-actions {
  display: flex;
  gap: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  text-align: center;
}

.action-text {
  font-size: 26rpx;
  color: #666;
}

/* 空状态 */
.empty {
  padding: 200rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 回复弹窗 */
.reply-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 90%;
  background: white;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 0 10rpx;
}

.modal-body {
  padding: 30rpx;
}

.reply-textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  line-height: 1.6;
}

.reply-count {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  margin-top: 10rpx;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  padding: 30rpx;
  border-radius: 12rpx;
  text-align: center;
}

.cancel-btn {
  background: #f5f7fa;
}

.confirm-btn {
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
}

.modal-btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

.cancel-btn .modal-btn-text {
  color: #666;
}

.confirm-btn .modal-btn-text {
  color: white;
}
</style>

