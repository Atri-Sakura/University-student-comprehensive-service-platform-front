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
            <image v-if="item.userAvatar" :src="item.userAvatar" class="avatar-image" mode="aspectFill" />
            <text v-else class="avatar-text">{{ item.userName ? item.userName.charAt(0) : '用' }}</text>
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

        <!-- 评分详情 -->
        <view class="score-details" v-if="item.tasteScore || item.packageScore">
          <view class="score-item" v-if="item.tasteScore">
            <text class="score-label">口味：</text>
            <text class="score-value">{{ item.tasteScore }}分</text>
          </view>
          <view class="score-item" v-if="item.packageScore">
            <text class="score-label">包装：</text>
            <text class="score-value">{{ item.packageScore }}分</text>
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
        <view class="review-actions" v-if="!item.hasReply && !item.reply">
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
            maxlength="500"
          />
          <view class="reply-count">{{ replyText.length }}/500</view>
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
import { getEvaluationList, getEvaluationStatistics, replyEvaluation } from '@/utils/reviews.js';

export default {
  name: 'ReviewsPage',
  data() {
    return {
      overallScore: 0,
      totalReviews: 0,
      goodRate: 0,
      currentFilter: 0,
      filters: [
        { name: '全部', count: 0, rating: null },
        { name: '好评', count: 0, rating: 5 },
        { name: '中评', count: 0, rating: 3 },
        { name: '差评', count: 0, rating: 2 }
      ],
      showReplyModal: false,
      replyText: '',
      replyingIndex: -1,
      replyingItem: null,
      reviews: [],
      loading: false,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      hasMore: true,
      // 筛选参数
      hasContent: null, // 0-全部 1-只看有内容
      hasImages: null, // 0-全部 1-只看有图片
      replyStatus: null, // 0-未回复 1-已回复 null-全部
      sortType: 1 // 1-最新评价 2-评分最高 3-评分最低
    }
  },
  onLoad() {
    this.loadStatistics();
    this.loadEvaluationList();
  },
  onShow() {
    // 每次显示页面时重新加载数据
    this.loadStatistics();
    this.resetAndLoad();
  },
  onReachBottom() {
    // 触底加载更多
    if (this.hasMore && !this.loading) {
      this.loadMore();
    }
  },
  computed: {
    filteredReviews() {
      // 由于使用后端筛选，直接返回 reviews
      return this.reviews;
    }
  },
  methods: {
    // 加载评价统计信息
    loadStatistics() {
      getEvaluationStatistics()
        .then(res => {
          if (res.data && res.data.code === 200) {
            const stats = res.data.data || {};
            // 更新统计数据
            this.overallScore = stats.avgRating ? stats.avgRating.toFixed(1) : '0.0';
            this.totalReviews = stats.totalCount || 0;
            
            // 计算好评率（4星及以上为好评）
            const goodCount = (stats.fourStarCount || 0) + (stats.fiveStarCount || 0);
            this.goodRate = this.totalReviews > 0 ? Math.round((goodCount / this.totalReviews) * 100) : 0;
            
            // 更新筛选器计数
            this.filters[0].count = stats.totalCount || 0; // 全部
            this.filters[1].count = stats.fiveStarCount || 0; // 好评（5星）
            this.filters[2].count = stats.threeStarCount || 0; // 中评（3星）
            this.filters[3].count = (stats.oneStarCount || 0) + (stats.twoStarCount || 0); // 差评（1-2星）
            
            // 更新待回复数量（如果有的话）
            if (stats.pendingReplyCount !== undefined) {
              // 可以在这里添加待回复提示
            }
          }
        })
        .catch(err => {
          console.error('获取评价统计失败:', err);
        });
    },
    
    // 重置并加载评价列表
    resetAndLoad() {
      this.pageNum = 1;
      this.reviews = [];
      this.hasMore = true;
      this.loadEvaluationList();
    },
    
    // 加载评价列表
    loadEvaluationList() {
      if (this.loading) return;
      
      this.loading = true;
      if (this.pageNum === 1) {
        uni.showLoading({ title: '加载中...' });
      }
      
      // 构建查询参数
      const params = {
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        sortType: this.sortType
      };
      
      // 根据当前筛选器添加评分筛选
      const currentFilter = this.filters[this.currentFilter];
      if (currentFilter.rating !== null) {
        params.rating = currentFilter.rating;
      }
      
      // 添加其他筛选参数
      if (this.hasContent !== null) {
        params.hasContent = this.hasContent;
      }
      if (this.hasImages !== null) {
        params.hasImages = this.hasImages;
      }
      if (this.replyStatus !== null) {
        params.replyStatus = this.replyStatus;
      }
      
      getEvaluationList(params)
        .then(res => {
          if (res.data && res.data.code === 200) {
            // 新接口返回格式：{ code, msg, total, rows }
            const rows = res.data.rows || [];
            const total = res.data.total || 0;
            
            // 格式化评价列表数据
            const formattedList = this.formatReviewList(rows);
            
            if (this.pageNum === 1) {
              this.reviews = formattedList;
            } else {
              this.reviews = [...this.reviews, ...formattedList];
            }
            
            this.total = total;
            this.hasMore = this.reviews.length < total;
          } else {
            uni.showToast({
              title: res.data?.msg || res.data?.message || '获取评价列表失败',
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
    
    // 加载更多
    loadMore() {
      if (this.hasMore && !this.loading) {
        this.pageNum++;
        this.loadEvaluationList();
      }
    },
    
    // 格式化评价列表数据
    formatReviewList(list) {
      return list.map(item => {
        // 使用新的字段名：userNickname, userAvatar, imageList, merchantEvaluationId
        const displayName = item.userNickname || item.userName || '匿名用户';
        const avatar = item.userAvatar || '';
        
        return {
          id: item.merchantEvaluationId || item.goodsEvaluationId || item.evaluationId || item.id,
          merchantEvaluationId: item.merchantEvaluationId,
          userName: displayName,
          userAvatar: avatar,
          rating: Number(item.rating) || 5,
          tasteScore: Number(item.tasteScore) || 0,
          packageScore: Number(item.packageScore) || 0,
          time: item.createTime || item.evaluationTime || item.time || '',
          content: item.content || item.evaluationContent || item.comment || '',
          images: item.imageList || item.images || item.pics || [],
          reply: item.merchantReply || item.reply || item.replyContent || '',
          replyTime: item.replyTime || '',
          hasReply: item.hasReply !== undefined ? item.hasReply : !!item.merchantReply,
          orderId: item.orderId
        };
      });
    },
    
    switchFilter(index) {
      if (this.currentFilter === index) return;
      this.currentFilter = index;
      // 切换筛选时重新加载数据
      this.resetAndLoad();
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

      // 验证回复内容长度
      if (this.replyText.trim().length > 500) {
        uni.showToast({
          title: '回复内容不能超过500个字符',
          icon: 'none'
        });
        return;
      }

      uni.showLoading({ title: '发送中...' });

      // 使用新的回复接口，传入 merchantEvaluationId 和 merchantReply
      const evaluationId = this.replyingItem.merchantEvaluationId || this.replyingItem.id;
      replyEvaluation(evaluationId, this.replyText.trim())
        .then(res => {
          if (res.data && res.data.code === 200) {
            // 更新本地数据
            this.reviews[this.replyingIndex].reply = this.replyText.trim();
            this.reviews[this.replyingIndex].hasReply = true;
            
            // 更新回复时间为当前时间
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            this.reviews[this.replyingIndex].replyTime = dateStr;
            
            uni.showToast({
              title: '回复成功',
              icon: 'success'
            });
            
            // 重新加载统计信息（更新待回复数量）
            this.loadStatistics();
            
            this.closeReplyModal();
          } else {
            uni.showToast({
              title: res.data?.msg || res.data?.message || '回复失败',
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
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
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

/* 评分详情 */
.score-details {
  display: flex;
  gap: 30rpx;
  margin-bottom: 20rpx;
  padding: 15rpx 0;
}

.score-item {
  display: flex;
  align-items: center;
}

.score-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 8rpx;
}

.score-value {
  font-size: 24rpx;
  color: #4A90E2;
  font-weight: 500;
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

