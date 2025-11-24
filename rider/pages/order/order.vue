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
			<view class="order-card" v-for="(order, index) in filteredOrders" :key="index" @tap="viewDetail(order)">
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

				<view class="order-footer" @tap.stop="">
					<!-- 新任务：立即接单 -->
					<template v-if="activeTab === 'new'">
						<button class="accept-btn full-width" @tap="acceptOrder(order)">立即接单</button>
					</template>
					<!-- 待取货：联系商家 + 异常报备 + 确认取货 -->
					<template v-else-if="activeTab === 'pickup'">
						<button class="contact-btn" @tap="contactMerchant(order)">联系商家</button>
						<button class="exception-btn" @tap="reportException(order)">异常报备</button>
						<button class="accept-btn" @tap="acceptOrder(order)">确认取货</button>
					</template>
					<!-- 待送达：联系顾客 + 异常报备 + 确认送达 -->
					<template v-else-if="activeTab === 'delivery'">
						<button class="contact-btn" @tap="contactCustomer(order)">联系顾客</button>
						<button class="exception-btn" @tap="reportException(order)">异常报备</button>
						<button class="accept-btn" @tap="acceptOrder(order)">确认送达</button>
					</template>
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
			// 页面加载时从本地存储获取骑手接单状态
			const cachedStatus = uni.getStorageSync('riderStatus');
			if (cachedStatus !== '') {
				this.isReceiving = cachedStatus;
			}
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
			// 更新骑手接单状态（暂时使用本地存储，后端API就绪后再对接）
			updateRiderStatus(status) {
				// 保存到本地缓存
				uni.setStorageSync('riderStatus', status);
				return true;
			},
			toggleStatus() {
				if (this.isReceiving) {
					// 当前是接单中，询问是否休息
					uni.showModal({
						title: '提示',
						content: '是否休息？休息期间将不再接收新订单',
						success: (res) => {
							if (res.confirm) {
								// 更新状态
								this.updateRiderStatus(false);
								this.isReceiving = false;
								uni.showToast({
									title: '已进入休息模式',
									icon: 'success'
								});
							}
						}
					});
				} else {
					// 当前是休息中，切换回接单中
					this.updateRiderStatus(true);
					this.isReceiving = true;
					uni.showToast({
							title: '开始接单',
							icon: 'success'
						});
				}
			},
			startReceiving() {
				// 从休息提示页面点击开始接单
				this.updateRiderStatus(true);
				this.isReceiving = true;
				uni.showToast({
					title: '开始接单',
					icon: 'success'
				});
			},
			switchTab(tabKey) {
				this.activeTab = tabKey;
			},
			viewDetail(order) {
				// 跳转到订单详情页面
				uni.navigateTo({
					url: `/pages/order/order-detail?orderId=${order.id}`
				});
			},
			contactMerchant(order) {
				// 联系商家
				uni.showModal({
					title: '联系商家',
					content: `商家：${order.merchant}\n地址：${order.address}`,
					confirmText: '拨打电话',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							uni.makePhoneCall({
								phoneNumber: '13800138000' // 这里应该从订单数据中获取商家电话
							});
						}
					}
				});
			},
			contactCustomer(order) {
				// 联系顾客
				uni.showModal({
					title: '联系顾客',
					content: `配送地址：${order.address}`,
					confirmText: '拨打电话',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							uni.makePhoneCall({
								phoneNumber: '13900139000' // 这里应该从订单数据中获取顾客电话
							});
						}
					}
				});
			},
			acceptOrder(order) {
				let title = '';
				let content = '';
				let successMsg = '';
				let nextStatus = '';
				
				// 根据当前标签页确定操作类型
				if (this.activeTab === 'new') {
					title = '确认接单';
					content = `确定要接受订单 ${order.id} 吗？`;
					successMsg = '接单成功';
					nextStatus = 'pickup';
				} else if (this.activeTab === 'pickup') {
					title = '确认取货';
					content = `确定已取到订单 ${order.id} 的货物吗？`;
					successMsg = '取货成功，请尽快送达';
					nextStatus = 'delivery';
				} else if (this.activeTab === 'delivery') {
					title = '确认送达';
					content = `确定订单 ${order.id} 已送达吗？`;
					successMsg = '订单已完成';
					nextStatus = 'completed';
				}
				
				uni.showModal({
					title: title,
					content: content,
					success: (res) => {
						if (res.confirm) {
							uni.showToast({
								title: successMsg,
								icon: 'success'
							});
							// 更新订单状态
							const orderIndex = this.orders.findIndex(o => o.id === order.id);
							if (orderIndex !== -1) {
								this.orders[orderIndex].status = nextStatus;
							}
						}
					}
				});
			},
			
			reportException(order) {
				// 跳转到异常报备页面
				uni.navigateTo({
					url: `/pages/order/exception-report?orderId=${order.id}&status=${this.activeTab}`
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
		padding: 70rpx 30rpx 30rpx 30rpx;
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
		transition: all 0.2s ease;
	}

	.order-card:active {
		transform: scale(0.98);
		box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
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
	.contact-btn,
	.exception-btn,
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

	.detail-btn,
	.contact-btn {
		background-color: #f5f5f5;
		color: #666;
	}

	.exception-btn {
		background-color: #fff2f0;
		color: #ff4d4f;
		border: 1rpx solid #ffccc7;
	}

	.detail-btn:active,
	.contact-btn:active {
		background-color: #e8e8e8;
	}

	.exception-btn:active {
		background-color: #ffe7e6;
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

	.accept-btn.full-width {
		flex: none;
		width: 100%;
	}
</style>

