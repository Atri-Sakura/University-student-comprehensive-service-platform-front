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
					
				</view>

				<view class="order-footer" @tap.stop="">
					<!-- 新任务：立即接单 -->
					<template v-if="activeTab === 'new'">
						<button class="accept-btn full-width" @tap="acceptOrder(order)">立即接单</button>
					</template>
					<!-- 待取货：异常报备 + 确认取货 -->
					<template v-else-if="activeTab === 'pickup'">
						<button class="exception-btn" @tap="reportException(order)">异常报备</button>
						<button class="accept-btn" @tap="acceptOrder(order)">确认取货</button>
					</template>
					<!-- 待送达：异常报备 + 确认送达 -->
					<template v-else-if="activeTab === 'delivery'">
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
	import { getAvailableOrders, getMyOrders, riderAcceptOrder, riderPickupOrder, riderDeliverOrder } from '@/utils/api/index.js';
	
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
				orders: [],
				loading: false
			}
		},
		onLoad() {
			// 页面加载时从本地存储获取骑手接单状态
			const cachedStatus = uni.getStorageSync('riderStatus');
			if (cachedStatus !== '') {
				this.isReceiving = cachedStatus;
			}
			// 加载订单列表
			this.loadOrders();
		},
		onShow() {
			// 页面显示时刷新订单列表
			this.loadOrders();
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
				// 切换标签时重新加载订单
				this.loadOrders();
			},
			// 加载订单列表
			async loadOrders() {
				if (this.loading) return;
				
				this.loading = true;
				try {
					let response;
					let isAvailableList = false;
					
					// 根据当前标签页调用不同的接口
					if (this.activeTab === 'new') {
						// 新任务：调用可接单列表接口
						response = await getAvailableOrders({
							pageNum: 1,
							pageSize: 50
						});
						isAvailableList = true;
					} else {
						// 待取货/配送中：调用我的订单列表接口
						let orderStatus;
						if (this.activeTab === 'pickup') {
							orderStatus = 3; // 骑手待取货（数据库状态码3）
						} else if (this.activeTab === 'delivery') {
							orderStatus = 4; // 配送中（数据库状态码4）
						}
						
						response = await getMyOrders({
							orderStatus,
							pageNum: 1,
							pageSize: 50
						});
					}
					
					if (response.code === 200) {
						// 转换后端数据格式为前端格式
						// 后端直接返回 {code, msg, total, rows}，没有 data 包装
						const rows = response.rows || [];
						this.orders = rows.map(item => this.convertOrderData(item, isAvailableList));
					}
				} catch (error) {
					console.error('加载订单失败:', error);
					uni.showToast({
						title: '加载订单失败',
						icon: 'none'
					});
				} finally {
					this.loading = false;
				}
			},
			// 转换后端订单数据为前端格式
			convertOrderData(item, isAvailableList = false) {
				const orderTypeMap = {
					1: { type: 'takeout', typeText: '外卖' },
					2: { type: 'express', typeText: '跑腿' },
					3: { type: 'secondhand', typeText: '二手交易' }
				};
				
				const statusMap = {
					1: 'new',      // 商家待接单
					2: 'new',      // 骑手待接单（新任务）
					3: 'pickup',   // 骑手待取货
					4: 'delivery', // 配送中（待送达）
					5: 'completed', // 已完成
					6: 'cancelled', // 已取消
					7: 'exception' // 骑手异常报备
				};
				
				const typeInfo = orderTypeMap[item.orderType] || { type: 'takeout', typeText: '外卖' };
				
				// 如果是可接单列表，强制状态为 'new'（因为这些订单对骑手来说就是新任务）
				let status;
				if (isAvailableList) {
					status = 'new';
				} else {
					status = statusMap[item.orderStatus] || 'new';
				}
				
				// 确保orderMainId始终存在
				const orderMainId = item.orderMainId || item.id;
				
				return {
					id: item.orderNo || orderMainId,
				merchant: item.pickAddress || '取货地址',
				address: item.deliverAddress || '配送地址',
				merchantName: item.merchantName || item.pickAddress || '商家名称',
				merchantPhone: item.merchantPhone || item.pickPhone || item.shopPhone || '',
				type: typeInfo.type,
				typeText: typeInfo.typeText,
				status: status,
				// 后端已返回字符串格式的 orderMainId，直接使用
				orderMainId: orderMainId
				};
			},
			viewDetail(order) {
				// 跳转到订单详情页面（使用 orderMainId）
				uni.navigateTo({
					url: `/pages/order/order-detail?orderId=${order.orderMainId}`
				});
			},
			contactMerchant(order) {
				// 联系商家
				const merchantName = order.merchantName || '商家';
				const merchantPhone = order.merchantPhone || '暂未提供';
				
				uni.showModal({
					title: '联系商家',
					content: `商家：${merchantName}\n电话：${merchantPhone}`,
					confirmText: '拨打电话',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm && merchantPhone !== '暂未提供') {
							uni.makePhoneCall({
								phoneNumber: merchantPhone
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
			async acceptOrder(order) {
				let title = '';
				let content = '';
				let successMsg = '';
				let apiFunction = null;
				
				// 根据当前标签页确定操作类型
				if (this.activeTab === 'new') {
					title = '确认接单';
					content = `确定要接受订单 ${order.id} 吗？`;
					successMsg = '接单成功';
					apiFunction = riderAcceptOrder;
				} else if (this.activeTab === 'pickup') {
					title = '确认取货';
					content = `确定已取到订单 ${order.id} 的货物吗？`;
					successMsg = '取货成功，请尽快送达';
					apiFunction = riderPickupOrder;
				} else if (this.activeTab === 'delivery') {
					title = '确认送达';
					content = `确定订单 ${order.id} 已送达吗？`;
					successMsg = '订单已完成';
					apiFunction = riderDeliverOrder;
				}
				
				uni.showModal({
					title: title,
					content: content,
					success: async (res) => {
						if (res.confirm) {
						try {
							// 调用后端 API（orderMainId 为字符串格式，避免大数字精度丢失）
							const response = await apiFunction(order.orderMainId);
								
								if (response.code === 200) {
									uni.showToast({
										title: successMsg,
										icon: 'success'
									});
									
									// 刷新订单列表
									setTimeout(() => {
										this.loadOrders();
									}, 1000);
								} else {
									uni.showToast({
										title: response.msg || '操作失败',
										icon: 'none'
									});
								}
							} catch (error) {
								console.error('操作失败:', error);
								uni.showToast({
									title: error.message || '操作失败',
									icon: 'none'
								});
							}
						}
					}
				});
			},
			reportException(order) {
				// 跳转到异常报备页面，使用orderMainId作为订单ID
				let orderMainId = order.orderMainId;
				
				// 如果orderMainId不存在但id是数字格式，使用id作为orderMainId
				if (!orderMainId && /^\d+$/.test(order.id)) {
					orderMainId = order.id;
				}
				
				// 再次检查是否是订单号格式
				if (/^T\d+$/.test(orderMainId)) {
					uni.showToast({
						title: '参数错误，需传递orderMainId',
						icon: 'error'
					});
					return;
				}
				
				const url = `/pages/order/exception-report?orderId=${orderMainId}&status=${this.activeTab}`;
				uni.navigateTo({
					url: url
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

