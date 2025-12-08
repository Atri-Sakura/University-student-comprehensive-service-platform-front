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
			<text class="filter-text">{{ selectedTimeFilter }}</text>
			<text class="filter-arrow">▼</text>
		</view>
			<view class="search-bar">
				<text class="search-icon">🔍</text>
				<input class="search-input" placeholder="搜索订单号或地址" v-model="searchKeyword" @confirm="onSearch" />
				<text class="search-btn" @tap="onSearch">搜索</text>
			</view>
		</view>

		<!-- 订单列表 -->
		<view class="orders-list">
			<view class="order-card" v-for="(order, index) in filteredOrders" :key="index">
				<view class="order-header">
						<text class="order-id">{{ order.orderNo }}</text>
						<view class="status-tags">
							<text class="status-tag" :class="order.orderStatus === 4 ? 'completed' : order.orderStatus === 5 ? 'cancelled' : order.orderStatus === 3 ? 'delivering' : 'pending'">
				{{ getOrderStatusText(order.orderStatus) }}
			</text>
							<text class="type-tag">{{ order.orderTypeName }}</text>
						</view>
					</view>
				
				<view class="order-time">{{ order.createTime }}</view>
				
				<view class="order-details">
					<view class="detail-item">
						<text class="detail-dot green">●</text>
						<text class="detail-text">{{ order.pickAddress }}</text>
					</view>
					<view class="detail-item">
						<text class="detail-dot red">●</text>
						<text class="detail-text">{{ order.deliverAddress }}</text>
					</view>
				</view>
				
				<view class="order-footer">
					<text class="order-price">¥{{ order.totalAmount }}</text>
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
	import api from '../../utils/api/index.js'
	export default {
	data() {
		return {
			searchKeyword: '',
			selectedTimeFilter: '全部时间',
			showFilter: false,
			orders: [],
			loading: false,
			page: 1,
			pageSize: 10,
			total: 0,
			hasMore: true
		}
	},
	computed: {
		filteredOrders() {
			return this.orders;
		}
	},
	onLoad() {
		// 页面加载时获取订单数据
		this.getOrders();
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
			this.page = 1;
			this.orders = [];
			this.hasMore = true;
			this.getOrders();
		},
		// 根据前端时间筛选转换为后端timeRange参数
		getTimeRange() {
			switch (this.selectedTimeFilter) {
				case '今天':
					return 'today';
				case '昨天':
					return 'yesterday';
				case '本周':
					return 'week';
				case '本月':
					return 'month';
				case '全部时间':
					return null;
				default:
					return null;
			}
		},
		// 获取订单数据
			async getOrders() {
				if (this.loading || !this.hasMore) return;
				
				this.loading = true;
				
				try {
					// 构造查询条件
					const orderMain = {
						// 根据后端OrderMain对象结构添加需要的查询条件
						orderNo: this.searchKeyword, // 搜索订单号
						address: this.searchKeyword    // 搜索地址
					};
					
					// 获取时间范围
					const timeRange = this.getTimeRange();
					
					// 调用API获取订单数据
					const result = await api.getHistoryOrders(orderMain, timeRange, this.page, this.pageSize);
					
					if (result.code === 200) {
						// 处理返回的订单数据
						const newOrders = result.data || [];
						
						
						
						// 如果是第一页，直接替换订单数组
						if (this.page === 1) {
							this.orders = newOrders;
						} else {
							// 否则追加到订单数组
							this.orders = [...this.orders, ...newOrders];
						}
						
						// 更新分页信息
						this.total = result.total || 0;
						this.hasMore = this.orders.length < this.total;
						
						// 页码加1
						this.page++;
					} else {
						uni.showToast({
							title: result.msg || '获取订单失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('获取订单失败:', error);
					uni.showToast({
						title: '网络请求失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},
			
		// 订单状态文本转换
		getOrderStatusText(status) {
			switch (status) {
				case 1:
					return '待接单';
				case 2:
					return '待取货';
				case 3:
					return '配送中';
				case 4:
					return '已完成';
				case 5:
					return '已取消';
				default:
					return '未知状态';
			}
		},
		// 搜索订单
		onSearch() {
			this.page = 1;
			this.orders = [];
			this.hasMore = true;
			this.getOrders();
		},
		// 查看订单详情
		viewOrderDetail(order) {
			uni.navigateTo({
				url: `/pages/order/order-detail?orderId=${order.orderMainId || order.id || order.orderNo}`
			});
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.page = 1;
			this.orders = [];
			this.hasMore = true;
			this.getOrders().then(() => {
				uni.stopPullDownRefresh();
			});
		},
		// 上拉加载更多
		onReachBottom() {
			this.getOrders();
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

	.search-btn {
		font-size: 28rpx;
		color: #2e7d32;
		font-weight: 500;
		padding: 8rpx 16rpx;
		border-radius: 6rpx;
		background-color: rgba(46, 125, 50, 0.1);
	}

	.search-btn:active {
		background-color: rgba(46, 125, 50, 0.2);
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
	
	.status-tag.delivering {
		background-color: #e6f7ff;
		color: #1890ff;
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
