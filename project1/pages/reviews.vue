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
        <view class="review-actions" v-if="!item.reply">
          <view class="action-btn" @click="replyReview(item, index)">
            <text class="action-text">💬 回复</text>
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
import { getEvaluationList, replyEvaluation } from '@/utils/evaluation.js';

export default {
  name: 'ReviewsPage',
  data() {
    return {
      overallScore: 0,
      totalReviews: 0,
      goodRate: 0,
      currentFilter: 0,
      filters: [
        { name: '全部', count: 0 },
        { name: '好评', count: 0 },
        { name: '中评', count: 0 },
        { name: '差评', count: 0 }
      ],
      showReplyModal: false,
      replyText: '',
      replyingIndex: -1,
      replyingItem: null,
      reviews: [],
      loading: false,
      page: 1,
      pageSize: 20
    }
  },
  onLoad() {
    this.loadEvaluationList();
  },
  onShow() {
    // 每次显示页面时重新加载数据
    this.loadEvaluationList();
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
    // 加载评价列表
    loadEvaluationList() {
      if (this.loading) return;
      
      this.loading = true;
      uni.showLoading({ title: '加载中...' });
      
      getEvaluationList({
        page: this.page,
        pageSize: this.pageSize
      })
        .then(res => {
          if (res.data.code === 200) {
            const data = res.data.data;
            
            // 处理评价列表数据（data 直接是数组）
            const reviewList = Array.isArray(data) ? data : (data.list || data.evaluations || data.records || []);
            this.reviews = this.formatReviewList(reviewList);
            
            // 更新统计数据
            this.updateStatistics(data);
            
            // 更新筛选器计数
            this.updateFilterCounts();
          } else {
            uni.showToast({
              title: res.data.msg || res.data.message || '获取评价列表失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          console.error('获取评价列表失败:', err);
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        })
        .finally(() => {
          this.loading = false;
          uni.hideLoading();
        });
    },
    
    // 格式化评价列表数据
    formatReviewList(list) {
      return list.map(item => {
        // 处理用户名显示（根据是否匿名）
        let displayName = '匿名用户';
        if (item.isAnonymous === 0) {
          // 不匿名时，尝试获取用户名或使用用户ID
          displayName = item.userName || item.userNickname || item.nickname || `用户${String(item.userId).slice(-4)}`;
        }
        
        return {
          id: item.goodsEvaluationId || item.evaluationId || item.id,
          userName: displayName,
          rating: item.rating || item.score || item.star || 5,
          time: item.createTime || item.evaluationTime || item.time || '',
          content: item.content || item.evaluationContent || item.comment || '',
          images: item.images || item.imageList || item.pics || [],
          tags: item.tags || item.tagList || [],
          reply: item.merchantReply || item.reply || item.replyContent || '',
          replyTime: item.replyTime || '',
          usefulCount: item.usefulCount || 0,
          isAnonymous: item.isAnonymous || 0,
          userId: item.userId
        };
      });
    },
    
    // 更新统计数据
    updateStatistics(data) {
      // 如果 data 是数组，需要自己计算统计数据
      if (Array.isArray(data)) {
        // 计算综合评分
        if (this.reviews.length > 0) {
          const totalRating = this.reviews.reduce((sum, item) => sum + item.rating, 0);
          this.overallScore = (totalRating / this.reviews.length).toFixed(1);
        } else {
          this.overallScore = 0;
        }
        
        // 总评价数
        this.totalReviews = this.reviews.length;
        
        // 计算好评率（4星及以上为好评）
        const goodReviews = this.reviews.filter(r => r.rating >= 4).length;
        this.goodRate = this.totalReviews > 0 ? Math.round((goodReviews / this.totalReviews) * 100) : 0;
      } else {
        // 如果后端返回了统计数据，使用后端数据
        this.overallScore = data.overallScore || data.avgScore || data.averageRating || 0;
        if (typeof this.overallScore === 'number') {
          this.overallScore = this.overallScore.toFixed(1);
        }
        
        // 总评价数
        this.totalReviews = data.total || data.totalCount || data.count || this.reviews.length;
        
        // 好评率
        this.goodRate = data.goodRate || data.positiveRate || 0;
        if (typeof this.goodRate === 'number' && this.goodRate <= 1) {
          this.goodRate = Math.round(this.goodRate * 100);
        }
      }
    },
    
    // 更新筛选器计数
    updateFilterCounts() {
      this.filters[0].count = this.reviews.length; // 全部
      this.filters[1].count = this.reviews.filter(r => r.rating >= 4).length; // 好评
      this.filters[2].count = this.reviews.filter(r => r.rating === 3).length; // 中评
      this.filters[3].count = this.reviews.filter(r => r.rating <= 2).length; // 差评
    },
    
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
      this.replyingItem = item;
      this.replyText = '';
      this.showReplyModal = true;
    },
    closeReplyModal() {
      this.showReplyModal = false;
      this.replyText = '';
      this.replyingIndex = -1;
      this.replyingItem = null;
    },
    submitReply() {
      if (!this.replyText.trim()) {
        uni.showToast({
          title: '请输入回复内容',
          icon: 'none'
        });
        return;
      }

      if (this.replyingIndex < 0 || !this.replyingItem) {
        uni.showToast({
          title: '回复失败，请重试',
          icon: 'none'
        });
        return;
      }

      uni.showLoading({ title: '发送中...' });

      // 调用后端接口回复评价（使用 URL 参数方式）
      replyEvaluation(this.replyingItem.id, this.replyText.trim())
        .then(res => {
          if (res.data.code === 200) {
            // 更新本地数据
            this.reviews[this.replyingIndex].reply = this.replyText;
            
            // 更新回复时间为当前时间
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            this.reviews[this.replyingIndex].replyTime = dateStr;
            
            uni.showToast({
              title: '回复成功',
              icon: 'success'
            });
            
            this.closeReplyModal();
          } else {
            uni.showToast({
              title: res.data.msg || res.data.message || '回复失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          console.error('回复评价失败:', err);
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        })
        .finally(() => {
          uni.hideLoading();
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
  justify-content: space-between;
}

.filter-tab {
  flex: 1;
  padding: 15rpx 20rpx;
  background: #f5f7fa;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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

