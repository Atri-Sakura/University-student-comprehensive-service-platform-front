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
	import { getMyOrders } from '@/utils/api/index.js';
	
	export default {
		data() {
			return {
				searchKeyword: '',
				selectedTimeFilter: '全部时间',
				showFilter: false,
				orders: [],
				loading: false
			}
		},
		onLoad() {
			this.loadOrders();
		},
		onShow() {
			this.loadOrders();
		},
		computed: {
			filteredOrders() {
				let filtered = this.orders;
				if (this.searchKeyword) {
					filtered = filtered.filter(order => 
						order.id.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
						order.address.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
						order.merchant.toLowerCase().includes(this.searchKeyword.toLowerCase())
					);
				}
				return filtered;
			}
		},
		methods: {
			async loadOrders() {
				if (this.loading) return;
				this.loading = true;
				try {
					const params = { pageNum: 1, pageSize: 100 };
					if (this.selectedTimeFilter !== '全部时间') {
						const timeRangeMap = {
							'今天': 'today',
							'昨天': 'yesterday',
							'本周': 'week',
							'本月': 'month'
						};
						params.timeRange = timeRangeMap[this.selectedTimeFilter];
					}
					const response = await getMyOrders(params);
					if (response.code === 200) {
						const rows = response.rows || [];
						this.orders = rows.map(item => this.convertOrderData(item));
					} else {
						uni.showToast({ title: response.msg || '加载订单失败', icon: 'none' });
					}
				} catch (error) {
					console.error('加载订单失败:', error);
					uni.showToast({ title: '加载订单失败', icon: 'none' });
				} finally {
					this.loading = false;
				}
			},
			convertOrderData(item) {
				const orderTypeMap = { 1: '外卖', 2: '跑腿', 3: '二手交易' };
				const statusMap = { 1: '待接单', 2: '待取货', 3: '配送中', 4: '已完成', 5: '已取消', 6: '已拒单' };
				return {
					id: item.orderNo || item.orderMainId,
					orderMainId: item.orderMainId,
					status: statusMap[item.orderStatus] || '未知',
					type: orderTypeMap[item.orderType] || '未知',
					dateTime: item.createTime || item.updateTime || '',
					merchant: item.pickAddress || '取货地址',
					address: item.deliverAddress || '配送地址',
					price: item.totalAmount || '0.00',
					orderNo: item.orderNo,
					orderStatus: item.orderStatus,
					orderTypeName: orderTypeMap[item.orderType] || '未知',
					pickAddress: item.pickAddress,
					deliverAddress: item.deliverAddress,
					totalAmount: item.totalAmount,
					createTime: item.createTime
				};
			},
			getOrderStatusText(status) {
				const map = { 1: '待接单', 2: '待取货', 3: '配送中', 4: '已完成', 5: '已取消' };
				return map[status] || '未知状态';
			},
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
				this.loadOrders();
			},
			viewOrderDetail(order) {
				uni.navigateTo({
					url: `/pages/order/order-detail?orderId=${order.orderMainId}`
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
