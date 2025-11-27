<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">服务评价</text>
			<view class="navbar-right"></view>
		</view>

		<!-- 评分统计 -->
		<view class="stats-card">
			<view class="stats-header">
				<view class="overall-score">
					<text class="score-number">{{ averageRating || 0 }}</text>
					<text class="score-total">/5.0</text>
				</view>
				<view class="score-info">
					<text class="score-label">综合评分</text>
					<view class="stars">
						<text class="star" :class="{ filled: i < Math.floor(averageRating) || (i === Math.floor(averageRating) && averageRating % 1 >= 0.5) }" v-for="i in 5" :key="i">★</text>
					</view>
					<text class="total-reviews">共{{ totalReviews }}条评价</text>
				</view>
			</view>
			
			<view class="rating-bars">
				<view class="rating-bar-item" v-for="score in [5, 4, 3, 2, 1]" :key="score">
					<text class="rating-label">{{ score }}星</text>
					<view class="bar-wrapper">
						<view class="bar-fill" :style="{ width: calculateBarWidth(score) + '%' }"></view>
					</view>
					<text class="rating-percent">{{ calculateBarWidth(score) }}%</text>
				</view>
			</view>
		</view>

		<!-- 筛选标签 -->
		<view class="filter-section">
			<view class="filter-tabs">
				<view 
					class="filter-tab" 
					:class="{ active: activeFilter === filter.key }"
					v-for="filter in filters" 
					:key="filter.key"
					@tap="selectFilter(filter.key)"
				>
					<text class="tab-text">{{ filter.name }}</text>
				</view>
			</view>
		</view>

		<!-- 评价列表 -->
		<view class="reviews-list">
			<!-- 加载中 -->
			<view v-if="loading && reviews.length === 0" class="loading-container">
				<text class="loading-text">加载中...</text>
			</view>
			
			<!-- 空状态 -->
			<view v-else-if="reviews.length === 0" class="empty-container">
				<text class="empty-text">暂无评价</text>
			</view>
			
			<!-- 评价列表 -->
			<view class="review-item" v-else v-for="(review, index) in filteredReviews" :key="index">
				<view class="review-header">
					<image class="customer-avatar" :src="review.avatar" mode="aspectFill"></image>
					<view class="customer-info">
						<text class="customer-name">{{ review.customer }}</text>
						<text class="review-time">{{ review.time }}</text>
					</view>
					<view class="review-stars">
							<text class="star" :class="{ filled: i <= review.rating }" v-for="i in 5" :key="i">★</text>
						</view>
				</view>
				
				<view class="review-content">
					<text class="review-text">{{ review.content }}</text>
				</view>
				
				<view class="review-tags" v-if="review.tags && review.tags.length > 0">
					<text class="review-tag" v-for="(tag, tIndex) in review.tags" :key="tIndex">{{ tag }}</text>
				</view>
				
				<view class="order-info">
					<text class="order-text">订单：{{ review.orderId }}</text>
				</view>
				

			</view>
			<!-- 加载更多 -->
			<view v-if="loading && reviews.length > 0" class="load-more-container">
				<uni-load-more :status="'loading'" :content-text="{loadingText: '加载中...'}"></uni-load-more>
			</view>
			
			<!-- 没有更多数据 -->
			<view v-else-if="reviews.length >= total && total > 0" class="no-more-container">
				<uni-load-more :status="'noMore'" :content-text="{noMoreText: '没有更多数据了'}"></uni-load-more>
			</view>
		</view>
		

	</view>
</template>

<script>
	// 导入API
	import { getMyEvaluationList } from '../../utils/api/index.js';
	export default {
		data() {
			return {
				activeFilter: 'all',
				filters: [
					{ key: 'all', name: '全部' },
					{ key: 'good', name: '好评' },
					{ key: 'medium', name: '中评' },
					{ key: 'bad', name: '差评' }
				],
				// 评价列表数据
				reviews: [],
				// 加载状态
				loading: false,
				// 分页数据
				page: 1,
				pageSize: 10,
				total: 0,
				// 评分统计
				averageRating: 0,
				totalReviews: 0,
				ratingDistribution: {
					5: 0,
					4: 0,
					3: 0,
					2: 0,
					1: 0
				}
			}
		},
		computed: {
			filteredReviews() {
				if (this.activeFilter === 'all') {
					return this.reviews;
				}
				return this.reviews.filter(review => {
					// 根据评分判断评价类型
					if (review.rating === 4 || review.rating === 5) {
						return this.activeFilter === 'good';
					} else if (review.rating === 2 || review.rating === 3) {
						return this.activeFilter === 'medium';
					} else {
						return this.activeFilter === 'bad';
					}
				});
			}
		},
		// 页面加载时获取评价列表
		onLoad() {
			this.getEvaluationList();
		},
		
		// 下拉刷新
		onPullDownRefresh() {
			this.page = 1;
			this.getEvaluationList(true);
		},
		
		// 上拉加载更多
		onReachBottom() {
			if (this.reviews.length < this.total) {
				this.page++;
				this.getEvaluationList(false, true);
			}
		},
		
		methods: {
			goBack() {
				const pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack({ delta: 1 });
				} else {
					uni.reLaunch({ url: '/pages/index/index' });
				}
			},
			selectFilter(filterKey) {
				this.activeFilter = filterKey;
			},
			
			// 获取评价列表
		async getEvaluationList(refresh = false, loadMore = false) {
			if (this.loading && !loadMore) return;
			
			this.loading = true;
			
			try {
				// 构建请求参数
				const params = {
					page: this.page,
					pageSize: this.pageSize
				};
				
				// 根据筛选条件添加评分参数
				if (this.activeFilter === 'good') {
					params.rating = 5;
				} else if (this.activeFilter === 'medium') {
					params.rating = 3;
				} else if (this.activeFilter === 'bad') {
					params.rating = 1;
				}
				
				// 调用API获取评价列表
				const res = await getMyEvaluationList(params);
				console.log('API返回原始数据:', res);
				
				if (res.code === 200) {
					// 处理返回数据
					let list = [];
					let total = 0;
					
					// 检查res是否包含rows和total字段
					if (res.rows && Array.isArray(res.rows)) {
						list = res.rows;
						total = res.total || res.rows.length;
					} 
					// 或者检查res.data是否存在
					else if (res.data) {
						// 如果res.data是数组，直接使用
						if (Array.isArray(res.data)) {
							list = res.data;
							total = res.data.length;
						} 
						// 否则检查是否有rows和total字段
						else {
							list = res.data.rows || [];
							total = res.data.total || 0;
						}
					}
					console.log('处理后的list:', list);
					console.log('处理后的total:', total);
					
					this.total = total;
					
					// 格式化数据
					const formattedReviews = list.map(item => ({
						id: item.riderevaluateid || item.id || Math.random().toString(36).substr(2, 9),
						customer: item.userNickname || item.username || item.customerName || '匿名用户',
						avatar: '/static/logo.png', // 后端没有返回头像字段，使用默认头像
						time: item.createtime || item.createTime || '',
						rating: Number(item.rating) || 0, // 确保评分是数字类型
						content: item.content || item.evaluationContent || '',
						tags: [], // 后端没有返回标签字段
						orderId: item.orderid || item.orderNo || item.orderSn || '',
						reply: item.riderreply || item.replyContent || '',
						replyTime: item.replytime || item.replyTime || ''
					}));
					
					// 更新评价列表
					if (refresh || this.page === 1) {
						this.reviews = formattedReviews;
					} else if (loadMore) {
						this.reviews = [...this.reviews, ...formattedReviews];
					}
					console.log('格式化后的reviews:', formattedReviews);
					console.log('更新后的reviews数组:', this.reviews);
					
					// 计算评分统计
					this.calculateRatingStats();
					
					// 停止下拉刷新
					if (refresh) {
						uni.stopPullDownRefresh();
					}
				} else {
					uni.showToast({
						title: res.message || '获取评价列表失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('获取评价列表失败:', error);
				uni.showToast({
					title: '网络错误，请稍后重试',
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},
			
			// 计算评分统计
			calculateRatingStats() {
				if (this.reviews.length === 0) {
					this.averageRating = 0;
					this.totalReviews = 0;
					this.ratingDistribution = {
						5: 0,
						4: 0,
						3: 0,
						2: 0,
						1: 0
					};
					return;
				}
				
				this.totalReviews = this.total;
				
				// 计算各评分数量
				this.ratingDistribution = {
					5: this.reviews.filter(r => r.rating === 5).length,
					4: this.reviews.filter(r => r.rating === 4).length,
					3: this.reviews.filter(r => r.rating === 3).length,
					2: this.reviews.filter(r => r.rating === 2).length,
					1: this.reviews.filter(r => r.rating === 1).length
				};
				
				// 计算平均评分
				const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
				this.averageRating = parseFloat((sum / this.reviews.length).toFixed(1));
			},
			

			
			// 计算评分条宽度
			calculateBarWidth(score) {
				if (this.totalReviews === 0) return 0;
				const count = this.ratingDistribution[score] || 0;
				return Math.round((count / this.totalReviews) * 100) || 0;
			}
		}
	}
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 40rpx;
	}

	/* 自定义导航栏 */
	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 160rpx;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30rpx;
		padding-top: env(safe-area-inset-top);
		z-index: 9999;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.navbar-left {
		width: 100rpx;
		height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		position: relative;
		margin-left: -20rpx;
		padding-top: 60rpx;
	}

	.back-icon {
		font-size: 64rpx;
		color: #000000;
		font-weight: 600;
		line-height: 1;
	}

	.navbar-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		flex: 1;
		text-align: center;
		margin: 0 -80rpx 0 -80rpx;
		padding-top: 60rpx;
	}

	.navbar-right {
		width: 80rpx;
		padding-top: 60rpx;
	}

	/* 评分统计 */
	.stats-card {
		margin: calc(160rpx + env(safe-area-inset-top) + 20rpx) 30rpx 20rpx 30rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 16rpx;
		padding: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
	}

	.stats-header {
		display: flex;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.overall-score {
		display: flex;
		align-items: baseline;
		margin-right: 30rpx;
	}

	.score-number {
		font-size: 96rpx;
		color: #ffffff;
		font-weight: bold;
		line-height: 1;
	}

	.score-total {
		font-size: 40rpx;
		color: rgba(255, 255, 255, 0.8);
		margin-left: 8rpx;
	}

	.score-info {
		flex: 1;
	}

	.score-label {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		display: block;
		margin-bottom: 8rpx;
	}

	.stars {
		display: flex;
		gap: 4rpx;
		margin-bottom: 8rpx;
	}

	.star {
		font-size: 32rpx;
		color: rgba(255, 255, 255, 0.3);
	}

	.star.filled {
		color: #ffd700;
	}

	.star.half {
		color: #ffd700;
		opacity: 0.5;
	}

	.total-reviews {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.rating-bars {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.rating-bar-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.rating-label {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.9);
		width: 60rpx;
	}

	.bar-wrapper {
		flex: 1;
		height: 12rpx;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 6rpx;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%);
		border-radius: 6rpx;
		transition: width 0.5s ease;
	}

	.rating-percent {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.9);
		width: 60rpx;
		text-align: right;
	}

	/* 筛选标签 */
	.filter-section {
		padding: 0 30rpx 20rpx 30rpx;
		background-color: #ffffff;
		margin: 0 30rpx 20rpx 30rpx;
		border-radius: 16rpx;
	}

	.filter-tabs {
		display: flex;
		gap: 20rpx;
		padding: 20rpx 0;
	}

	.filter-tab {
		flex: 1;
		padding: 16rpx 0;
		text-align: center;
		border-radius: 12rpx;
		background-color: #f8f8f8;
		border: 2rpx solid transparent;
	}

	.filter-tab.active {
		background-color: #e6f7ff;
		border-color: #1890ff;
	}

	.tab-text {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
	}

	.filter-tab.active .tab-text {
		color: #1890ff;
	}

	/* 评价列表 */
	.reviews-list {
		padding: 0 30rpx;
	}

	.review-item {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.review-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.customer-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		margin-right: 16rpx;
	}

	.customer-info {
		flex: 1;
	}

	.customer-name {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		display: block;
		margin-bottom: 6rpx;
	}

	.review-time {
		font-size: 24rpx;
		color: #999;
	}

	.review-stars {
		display: flex;
		gap: 4rpx;
	}

	.review-stars .star {
		font-size: 28rpx;
		color: #e0e0e0;
	}

	.review-stars .star.filled {
		color: #ffd700;
	}

	.review-content {
		margin-bottom: 16rpx;
	}

	.review-text {
		font-size: 28rpx;
		color: #333;
		line-height: 1.6;
	}

	.review-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}

	.review-tag {
		font-size: 24rpx;
		color: #1890ff;
		background-color: #e6f7ff;
		padding: 6rpx 12rpx;
		border-radius: 20rpx;
	}

	.order-info {
		padding-top: 16rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.order-text {
		font-size: 24rpx;
		color: #999999;
	}


	
	/* 加载状态样式 */
	.loading-container,
	.load-more-container,
	.no-more-container {
		padding: 20rpx 0;
		text-align: center;
	}
	
	/* 空状态样式 */
	.empty-container {
		padding: 100rpx 0;
		text-align: center;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
	
</style>
