<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">历史订单</text>
			<view class="navbar-right"></view>
		</view>

		<!-- 搜索和筛选区域 -->
		<view class="search-section">
			<view class="filter-dropdown" @tap="showTimeFilter">
				<text class="filter-text">全部时间</text>
				<text class="filter-arrow">▼</text>
			</view>
			<view class="search-bar">
				<text class="search-icon">🔍</text>
				<input class="search-input" placeholder="搜索订单号或地址" v-model="searchKeyword" />
			</view>
		</view>

		<!-- 订单列表 -->
		<view class="orders-list">
			<view class="order-card" v-for="(order, index) in filteredOrders" :key="index">
				<view class="order-header">
					<text class="order-id">{{ order.id }}</text>
					<view class="status-tags">
						<text class="status-tag" :class="order.status === '已完成' ? 'completed' : order.status === '已取消' ? 'cancelled' : 'pending'">
							{{ order.status }}
						</text>
						<text class="type-tag">{{ order.type }}</text>
					</view>
				</view>
				
				<view class="order-time">{{ order.dateTime }}</view>
				
				<view class="order-details">
					<view class="detail-item">
						<text class="detail-dot green">●</text>
						<text class="detail-text">{{ order.merchant }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-dot red">●</text>
						<text class="detail-text">{{ order.address }}</text>
					</view>
				</view>
				
				<view class="order-footer">
					<text class="order-price">¥{{ order.price }}</text>
					<button class="detail-btn" @tap="viewOrderDetail(order)">查看详情</button>
				</view>
			</view>
		</view>

		<!-- 时间筛选弹窗 -->
		<view class="filter-modal" v-if="showFilter" @tap="hideTimeFilter">
			<view class="filter-content" @tap.stop>
				<view class="filter-option" @tap="selectTimeFilter('全部时间')">
					<text>全部时间</text>
				</view>
				<view class="filter-option" @tap="selectTimeFilter('今天')">
					<text>今天</text>
				</view>
				<view class="filter-option" @tap="selectTimeFilter('昨天')">
					<text>昨天</text>
				</view>
				<view class="filter-option" @tap="selectTimeFilter('本周')">
					<text>本周</text>
				</view>
				<view class="filter-option" @tap="selectTimeFilter('本月')">
					<text>本月</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchKeyword: '',
				selectedTimeFilter: '全部时间',
				showFilter: false,
				orders: [
					{
						id: 'ORD20240115001',
						status: '已完成',
						type: '外卖',
						dateTime: '2024-01-15 14:30',
						merchant: '星巴克咖啡(人民广场店)',
						address: '上海市黄浦区南京东路123号',
						price: '15.80'
					},
					{
						id: 'ORD20240114002',
						status: '已完成',
						type: '外卖',
						dateTime: '2024-01-14 18:45',
						merchant: '麦当劳(淮海路店)',
						address: '上海市徐汇区淮海中路456号',
						price: '12.50'
					},
					{
						id: 'ORD20240113003',
						status: '已取消',
						type: '外卖',
						dateTime: '2024-01-13 12:20',
						merchant: '肯德基(静安寺店)',
						address: '上海市静安区南京西路789号',
						price: '18.20'
					},
					{
						id: 'ORD20240112004',
						status: '已完成',
						type: '外卖',
						dateTime: '2024-01-12 19:15',
						merchant: '必胜客(陆家嘴店)',
						address: '上海市浦东新区陆家嘴环路1000号',
						price: '25.60'
					},
					{
						id: 'ORD20240111005',
						status: '配送中',
						type: '外卖',
						dateTime: '2024-01-11 16:30',
						merchant: '海底捞(徐家汇店)',
						address: '上海市徐汇区漕溪北路88号',
						price: '68.90'
					}
				]
			}
		},
		computed: {
			filteredOrders() {
				let filtered = this.orders;
				
				// 按搜索关键词筛选
				if (this.searchKeyword) {
					filtered = filtered.filter(order => 
						order.id.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
						order.address.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
						order.merchant.toLowerCase().includes(this.searchKeyword.toLowerCase())
					);
				}
				
				// 按时间筛选
				if (this.selectedTimeFilter !== '全部时间') {
					const today = new Date();
					filtered = filtered.filter(order => {
						const orderDate = new Date(order.dateTime);
						switch (this.selectedTimeFilter) {
							case '今天':
								return orderDate.toDateString() === today.toDateString();
							case '昨天':
								const yesterday = new Date(today);
								yesterday.setDate(yesterday.getDate() - 1);
								return orderDate.toDateString() === yesterday.toDateString();
							case '本周':
								const weekStart = new Date(today);
								weekStart.setDate(today.getDate() - today.getDay());
								return orderDate >= weekStart;
							case '本月':
								return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
							default:
								return true;
						}
					});
				}
				
				return filtered;
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
			showTimeFilter() {
				this.showFilter = true;
			},
			hideTimeFilter() {
				this.showFilter = false;
			},
			selectTimeFilter(time) {
				this.selectedTimeFilter = time;
				this.showFilter = false;
			},
			viewOrderDetail(order) {
				uni.showToast({
					title: '查看订单详情',
					icon: 'none'
				});
			}
		}
	}
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
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

	/* 搜索和筛选区域 */
	.search-section {
		margin-top: calc(160rpx + env(safe-area-inset-top));
		padding: 30rpx;
		background-color: #ffffff;
		display: flex;
		gap: 20rpx;
		align-items: center;
	}

	.filter-dropdown {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 16rpx 20rpx;
		background-color: #f8f8f8;
		border-radius: 8rpx;
		border: 1rpx solid #e0e0e0;
	}

	.filter-text {
		font-size: 28rpx;
		color: #333;
	}

	.filter-arrow {
		font-size: 20rpx;
		color: #666;
	}

	.search-bar {
		flex: 1;
		display: flex;
		align-items: center;
		background-color: #f8f8f8;
		border-radius: 8rpx;
		border: 1rpx solid #e0e0e0;
		padding: 16rpx 20rpx;
		gap: 12rpx;
	}

	.search-icon {
		font-size: 28rpx;
		color: #999;
	}

	.search-input {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		background-color: transparent;
		border: none;
		outline: none;
	}

	.search-input::placeholder {
		color: #999;
	}

	/* 订单列表 */
	.orders-list {
		padding: 20rpx 30rpx;
	}

	.order-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.order-id {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}

	.status-tags {
		display: flex;
		gap: 12rpx;
	}

	.status-tag {
		font-size: 22rpx;
		padding: 6rpx 12rpx;
		border-radius: 20rpx;
		font-weight: 500;
	}

	.status-tag.completed {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.status-tag.cancelled {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	.status-tag.pending {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.type-tag {
		font-size: 22rpx;
		padding: 6rpx 12rpx;
		border-radius: 20rpx;
		background-color: #fff2f0;
		color: #ff4d4f;
		font-weight: 500;
	}

	.order-time {
		font-size: 26rpx;
		color: #999;
		margin-bottom: 20rpx;
	}

	.order-details {
		margin-bottom: 20rpx;
	}

	.detail-item {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.detail-item:last-child {
		margin-bottom: 0;
	}

	.detail-dot {
		font-size: 20rpx;
		margin-right: 12rpx;
	}

	.detail-dot.green {
		color: #52c41a;
	}

	.detail-dot.red {
		color: #ff4d4f;
	}

	.detail-text {
		font-size: 28rpx;
		color: #333;
		flex: 1;
	}

	.order-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.order-price {
		font-size: 36rpx;
		color: #ff9500;
		font-weight: bold;
	}

	.detail-btn {
		background-color: #e6f7ff;
		color: #1890ff;
		font-size: 26rpx;
		padding: 12rpx 24rpx;
		border-radius: 6rpx;
		border: none;
		margin-right: -30rpx;
	}

	.detail-btn:active {
		background-color: #bae7ff;
	}

	/* 筛选弹窗 */
	.filter-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		z-index: 10000;
	}

	.filter-content {
		width: 100%;
		background-color: #ffffff;
		border-radius: 24rpx 24rpx 0 0;
		padding: 40rpx 30rpx;
	}

	.filter-option {
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
		text-align: center;
	}

	.filter-option:last-child {
		border-bottom: none;
	}

	.filter-option:active {
		background-color: #f8f8f8;
	}
</style>
