<template>
	<view class="container">
		<!-- 顶部标题栏 -->
		<view class="header">
			<text class="header-title">骑手工作台</text>
			<view class="status-btn" :class="isReceiving ? 'receiving' : 'resting'" @tap="toggleStatus">
				<text class="status-icon">{{ isReceiving ? '⚡' : '💤' }}</text>
				<text class="status-text">{{ isReceiving ? '接单中' : '休息中' }}</text>
			</view>
		</view>

		<!-- 标签导航 -->
		<view class="tabs">
			<view 
				class="tab-item" 
				:class="{ active: activeTab === tab.key }"
				v-for="tab in tabs" 
				:key="tab.key"
				@tap="switchTab(tab.key)"
			>
				<text class="tab-text">{{ tab.name }}</text>
			</view>
		</view>

		<!-- 订单列表 -->
		<view class="orders-list">
			<!-- 休息状态提示 -->
			<view class="rest-hint" v-if="!isReceiving && activeTab === 'new' && filteredOrders.length === 0">
				<text class="rest-icon">🌙</text>
				<text class="rest-title">您当前处于休息状态</text>
				<text class="rest-desc">点击下方按钮开始接单</text>
				<button class="start-btn" @tap="startReceiving">开始接单</button>
			</view>
			
			<!-- 订单卡片 -->
			<view class="order-card" v-for="(order, index) in filteredOrders" :key="index">
				<view class="order-header">
					<text class="order-id">{{ order.id }}</text>
					<view class="order-tag" :class="order.type">{{ order.typeText }}</view>
				</view>

				<view class="order-info">
					<view class="info-row">
						<view class="icon-wrapper merchant">
							<text class="icon-dot">●</text>
						</view>
						<text class="info-text">{{ order.merchant }}</text>
					</view>
					<view class="info-row">
						<view class="icon-wrapper address">
							<text class="icon-dot">📍</text>
						</view>
						<text class="info-text">{{ order.address }}</text>
					</view>
					<view class="info-row">
						<view class="icon-wrapper time">
							<text class="icon-dot">⏰</text>
						</view>
						<text class="info-text">预计送达: {{ order.deliveryTime }}</text>
					</view>
				</view>

				<view class="order-footer">
					<button class="detail-btn" @tap="viewDetail(order)">查看详情</button>
					<button class="accept-btn" @tap="acceptOrder(order)">立即接单</button>
				</view>
			</view>
		</view>
		
		<tabbar :current="0"></tabbar>
	</view>
</template>

<script>
	import { API, request } from '@/utils/api.js';
	
	export default {
		data() {
			return {
				isReceiving: true, // 是否接单中
				activeTab: 'new',
				tabs: [
					{ key: 'new', name: '新任务' },
					{ key: 'pickup', name: '待取货' },
					{ key: 'delivery', name: '待送达' }
				],
				orders: [
					{
						id: 'ORD2024123456',
						merchant: '星巴克咖啡（人民广场店）',
						address: '上海市黄浦区南京东路123号',
						deliveryTime: '30分钟内',
						type: 'takeout',
						typeText: '外卖',
						status: 'new'
					},
					{
						id: 'ORD2024123459',
						merchant: '必胜客（陆家嘴店）',
						address: '上海市浦东新区陆家嘴环路1000号',
						deliveryTime: '45分钟内',
						type: 'takeout',
						typeText: '外卖',
						status: 'new'
					},
					{
						id: 'RUN2024123001',
						merchant: '文件取送服务',
						address: '上海市浦东新区世纪大道88号金茂大厦',
						deliveryTime: '1小时内',
						type: 'express',
						typeText: '跑腿',
						status: 'new'
					},
					{
						id: 'ORD2024123450',
						merchant: '麦当劳（淮海路店）',
						address: '上海市徐汇区淮海中路456号',
						deliveryTime: '25分钟内',
						type: 'takeout',
						typeText: '外卖',
						status: 'pickup'
					},
					{
						id: 'ORD2024123448',
						merchant: '肯德基（静安寺店）',
						address: '上海市静安区南京西路789号',
						deliveryTime: '20分钟内',
						type: 'takeout',
						typeText: '外卖',
						status: 'delivery'
					}
				]
			}
		},
		onLoad() {
			// 页面加载时获取骑手接单状态
			this.getRiderStatus();
		},
		computed: {
			filteredOrders() {
				// 如果是休息中且在新任务标签，不显示任何订单
				if (!this.isReceiving && this.activeTab === 'new') {
					return [];
				}
				return this.orders.filter(order => order.status === this.activeTab);
			}
		},
		methods: {
			// 获取骑手接单状态
			async getRiderStatus() {
				try {
					const res = await request({
						url: API.RIDER_STATUS,
						method: 'GET'
					});
					
					if (res.success) {
						// 更新接单状态
						this.isReceiving = res.data.isReceiving;
						// 同步到本地缓存
						uni.setStorageSync('riderStatus', res.data.isReceiving);
					}
				} catch (error) {
					console.error('获取骑手状态失败:', error);
					// 获取失败时使用本地缓存的状态
					const cachedStatus = uni.getStorageSync('riderStatus');
					if (cachedStatus !== '') {
						this.isReceiving = cachedStatus;
					}
				}
			},
			
			// 更新骑手接单状态到后端
			async updateRiderStatus(status) {
				try {
					const res = await request({
						url: API.RIDER_STATUS,
						method: 'POST',
						data: {
							isReceiving: status
						}
					});
					
					if (res.success) {
						// 保存到本地缓存
						uni.setStorageSync('riderStatus', status);
						return true;
					} else {
						throw new Error(res.message || '更新状态失败');
					}
				} catch (error) {
					console.error('更新骑手状态失败:', error);
					uni.showToast({
						title: '状态更新失败，请重试',
						icon: 'none'
					});
					return false;
				}
			},
			async toggleStatus() {
				if (this.isReceiving) {
					// 当前是接单中，询问是否休息
					uni.showModal({
						title: '提示',
						content: '是否休息？休息期间将不再接收新订单',
						success: async (res) => {
							if (res.confirm) {
								// 调用后端API更新状态
								const success = await this.updateRiderStatus(false);
								if (success) {
									this.isReceiving = false;
									uni.showToast({
										title: '已进入休息模式',
										icon: 'success'
									});
								}
							}
						}
					});
				} else {
					// 当前是休息中，切换回接单中
					const success = await this.updateRiderStatus(true);
					if (success) {
						this.isReceiving = true;
						uni.showToast({
							title: '开始接单',
							icon: 'success'
						});
					}
				}
			},
			async startReceiving() {
				// 从休息提示页面点击开始接单
				const success = await this.updateRiderStatus(true);
				if (success) {
					this.isReceiving = true;
					uni.showToast({
						title: '开始接单',
						icon: 'success'
					});
				}
			},
			switchTab(tabKey) {
				this.activeTab = tabKey;
			},
			viewDetail(order) {
				uni.showToast({
					title: '查看订单详情',
					icon: 'none'
				});
			},
			acceptOrder(order) {
				uni.showModal({
					title: '确认接单',
					content: `确定要接受订单 ${order.id} 吗？`,
					success: (res) => {
						if (res.confirm) {
							uni.showToast({
								title: '接单成功',
								icon: 'success'
							});
							// 将订单状态改为待取货
							const orderIndex = this.orders.findIndex(o => o.id === order.id);
							if (orderIndex !== -1) {
								this.orders[orderIndex].status = 'pickup';
							}
						}
					}
				});
			}
		}
	}
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx;
	}

	/* 顶部标题栏 */
	.header {
		background-color: #ffffff;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.header-title {
		font-size: 40rpx;
		color: #333;
		font-weight: bold;
	}

	.status-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 24rpx;
		border-radius: 20rpx;
		background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
	}

	.status-btn.receiving {
		background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
	}

	.status-btn.resting {
		background: linear-gradient(135deg, #ff6b9d 0%, #ff5e7a 100%);
	}

	.status-icon {
		font-size: 24rpx;
		color: #ffffff;
	}

	.status-text {
		font-size: 26rpx;
		color: #ffffff;
		font-weight: 500;
	}

	/* 标签导航 */
	.tabs {
		background-color: #ffffff;
		display: flex;
		padding: 0 30rpx;
	}

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 30rpx 0;
		position: relative;
	}

	.tab-text {
		font-size: 30rpx;
		color: #666;
		font-weight: 500;
	}

	.tab-item.active .tab-text {
		color: #1890ff;
		font-weight: bold;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60rpx;
		height: 4rpx;
		background-color: #1890ff;
		border-radius: 2rpx;
	}

	/* 订单列表 */
	.orders-list {
		padding: 20rpx 30rpx;
	}

	/* 休息提示 */
	.rest-hint {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 200rpx 60rpx;
	}

	.rest-icon {
		font-size: 160rpx;
		margin-bottom: 40rpx;
		opacity: 0.5;
	}

	.rest-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
		margin-bottom: 16rpx;
	}

	.rest-desc {
		font-size: 28rpx;
		color: #999;
		margin-bottom: 60rpx;
	}

	.start-btn {
		width: 320rpx;
		height: 88rpx;
		background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 44rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(116, 185, 255, 0.4);
	}

	.start-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 12rpx rgba(116, 185, 255, 0.4);
	}

	.order-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		border-left: 6rpx solid #1890ff;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.order-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.order-id {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
	}

	.order-tag {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-weight: 500;
	}

	.order-tag.takeout {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	.order-tag.express {
		background-color: #e6fffb;
		color: #13c2c2;
	}

	.order-info {
		margin-bottom: 24rpx;
	}

	.info-row {
		display: flex;
		align-items: flex-start;
		margin-bottom: 16rpx;
		gap: 12rpx;
	}

	.info-row:last-child {
		margin-bottom: 0;
	}

	.icon-wrapper {
		flex-shrink: 0;
		margin-top: 4rpx;
	}

	.icon-dot {
		font-size: 24rpx;
	}

	.icon-wrapper.merchant .icon-dot {
		color: #1890ff;
	}

	.icon-wrapper.address .icon-dot {
		color: #52c41a;
	}

	.icon-wrapper.time .icon-dot {
		color: #fa8c16;
	}

	.info-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.5;
		flex: 1;
	}

	.order-footer {
		display: flex;
		gap: 20rpx;
		padding-top: 20rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.detail-btn,
	.accept-btn {
		flex: 1;
		height: 68rpx;
		border-radius: 8rpx;
		font-size: 28rpx;
		font-weight: 500;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.detail-btn {
		background-color: #f5f5f5;
		color: #666;
	}

	.detail-btn:active {
		background-color: #e8e8e8;
	}

	.accept-btn {
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
	}

	.accept-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.3);
	}
</style>

