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
					<text class="score-number">4.8</text>
					<text class="score-total">/5.0</text>
				</view>
				<view class="score-info">
					<text class="score-label">综合评分</text>
					<view class="stars">
						<text class="star filled">★</text>
						<text class="star filled">★</text>
						<text class="star filled">★</text>
						<text class="star filled">★</text>
						<text class="star half">★</text>
					</view>
					<text class="total-reviews">共328条评价</text>
				</view>
			</view>
			
			<view class="rating-bars">
				<view class="rating-bar-item">
					<text class="rating-label">5星</text>
					<view class="bar-wrapper">
						<view class="bar-fill" style="width: 85%"></view>
					</view>
					<text class="rating-percent">85%</text>
				</view>
				<view class="rating-bar-item">
					<text class="rating-label">4星</text>
					<view class="bar-wrapper">
						<view class="bar-fill" style="width: 10%"></view>
					</view>
					<text class="rating-percent">10%</text>
				</view>
				<view class="rating-bar-item">
					<text class="rating-label">3星</text>
					<view class="bar-wrapper">
						<view class="bar-fill" style="width: 3%"></view>
					</view>
					<text class="rating-percent">3%</text>
				</view>
				<view class="rating-bar-item">
					<text class="rating-label">2星</text>
					<view class="bar-wrapper">
						<view class="bar-fill" style="width: 1%"></view>
					</view>
					<text class="rating-percent">1%</text>
				</view>
				<view class="rating-bar-item">
					<text class="rating-label">1星</text>
					<view class="bar-wrapper">
						<view class="bar-fill" style="width: 1%"></view>
					</view>
					<text class="rating-percent">1%</text>
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
			<view class="review-item" v-for="(review, index) in filteredReviews" :key="index">
				<view class="review-header">
					<image class="customer-avatar" :src="review.avatar" mode="aspectFill"></image>
					<view class="customer-info">
						<text class="customer-name">{{ review.customer }}</text>
						<text class="review-time">{{ review.time }}</text>
					</view>
					<view class="review-stars">
						<text class="star" :class="{ filled: i < review.rating }" v-for="i in 5" :key="i">★</text>
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
		</view>
	</view>
</template>

<script>
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
				reviews: [
					{
						customer: '张先生',
						avatar: '/static/logo.png',
						time: '2024-01-15 14:30',
						rating: 5,
						content: '骑手服务态度非常好，配送速度很快，食物也很完整，非常满意！',
						tags: ['服务好', '速度快', '态度好'],
						orderId: 'ORD20240115001',
						type: 'good'
					},
					{
						customer: '李女士',
						avatar: '/static/logo.png',
						time: '2024-01-14 18:45',
						rating: 5,
						content: '准时送达，骑手很有礼貌，下次还会继续使用。',
						tags: ['准时', '有礼貌'],
						orderId: 'ORD20240114002',
						type: 'good'
					},
					{
						customer: '王先生',
						avatar: '/static/logo.png',
						time: '2024-01-13 12:20',
						rating: 4,
						content: '配送速度可以，但是联系不太及时，希望改进。',
						tags: ['速度可以'],
						orderId: 'ORD20240113003',
						type: 'medium'
					},
					{
						customer: '刘女士',
						avatar: '/static/logo.png',
						time: '2024-01-12 19:15',
						rating: 5,
						content: '骑手很负责任，下雨天还帮忙送到楼上，非常感谢！',
						tags: ['负责任', '服务好'],
						orderId: 'ORD20240112004',
						type: 'good'
					},
					{
						customer: '陈先生',
						avatar: '/static/logo.png',
						time: '2024-01-11 16:30',
						rating: 3,
						content: '配送时间比预计的晚了一些，其他还好。',
						tags: ['有待改进'],
						orderId: 'ORD20240111005',
						type: 'medium'
					},
					{
						customer: '周女士',
						avatar: '/static/logo.png',
						time: '2024-01-10 15:20',
						rating: 5,
						content: '很棒的服务体验，骑手很专业，值得推荐！',
						tags: ['专业', '推荐'],
						orderId: 'ORD20240110006',
						type: 'good'
					},
					{
						customer: '吴先生',
						avatar: '/static/logo.png',
						time: '2024-01-09 13:45',
						rating: 2,
						content: '配送速度太慢了，等了很久才到。',
						tags: ['速度慢'],
						orderId: 'ORD20240109007',
						type: 'bad'
					},
					{
						customer: '赵女士',
						avatar: '/static/logo.png',
						time: '2024-01-08 11:30',
						rating: 5,
						content: '非常满意，骑手态度好，配送快，五星好评！',
						tags: ['满意', '五星'],
						orderId: 'ORD20240108008',
						type: 'good'
					}
				]
			}
		},
		computed: {
			filteredReviews() {
				if (this.activeFilter === 'all') {
					return this.reviews;
				}
				return this.reviews.filter(review => review.type === this.activeFilter);
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
		color: #999;
	}
</style>
