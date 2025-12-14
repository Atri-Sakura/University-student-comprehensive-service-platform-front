<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">异常报备</text>
		</view>

		<view class="content">
			<!-- 订单信息 -->
			<view class="order-info-card">
				<view class="card-title">订单信息</view>
				<view class="order-basic">
					<text class="order-id">{{ orderInfo.id }}</text>
					<view class="order-tag" :class="orderInfo.type">{{ orderInfo.typeText }}</view>
				</view>
				<text class="order-merchant">{{ orderInfo.merchant }}</text>
				<text class="order-customer">{{ orderInfo.customer }}</text>
				<text class="order-address">{{ orderInfo.address }}</text>
				<text class="order-status">当前状态：{{ statusText }}</text>
			</view>

			<!-- 异常类型选择 -->
			<view class="exception-card">
				<view class="card-title">异常类型</view>
				<view class="select-wrapper" @tap="showTypePicker">
					<text class="select-text" :class="{ placeholder: !selectedTypeText }">
						{{ selectedTypeText || '请选择异常类型' }}
					</text>
					<text class="select-arrow">〉</text>
				</view>
			</view>

	

		</view>

		<!-- 提交按钮 -->
		<view class="submit-section">
			<button 
				class="submit-btn" 
				:disabled="!canSubmit || submitting"
				@tap="submitReport"
			>
				{{ submitting ? '提交中...' : '提交报备' }}
			</button>
		</view>
	</view>
</template>

<script>
import { getOrderDetail, reportException } from '../../utils/api/order.js';
import { getRiderBaseInfo } from '../../utils/api/rider.js';

export default {
	data() {
			return {
				orderId: '',
				orderStatus: '',
				rawOrderStatus: null, // 原始数字状态码
				orderInfo: {
			id: '',
			type: '',
			typeText: '',
			merchant: '',
			customer: '',
			address: '',
			totalPrice: 0
		},
		loading: false, // 加载状态
		selectedType: '', // 存储英文键值（用于兼容现有逻辑）
		selectedTypeName: '', // 新增：存储中文名称
		submitting: false,
			exceptionTypes: [
				{ key: 'merchant_not_ready', name: '商家未准备好', icon: '⏰' },
				{ key: 'merchant_closed', name: '商家已关门', icon: '🚪' },
				{ key: 'merchant_not_found', name: '找不到商家', icon: '🔍' },
				{ key: 'customer_unreachable', name: '顾客联系不上', icon: '📞' },
				{ key: 'wrong_address', name: '地址有误', icon: '📍' },
				{ key: 'goods_issue', name: '商品问题', icon: '📦' },
				{ key: 'weather_issue', name: '天气原因', icon: '🌧️' },
				{ key: 'traffic_issue', name: '交通问题', icon: '🚧' }
			]
		}
	},
	
	computed: {
		statusText() {
			const statusMap = {
				'new': '待接单',
				'pickup': '待取货',
				'delivery': '配送中',
				'completed': '已完成',
				'cancelled': '已取消',
				'rejected': '已拒单'
			};
			return statusMap[this.orderStatus] || '未知状态';
		},
		
		selectedTypeText() {
			return this.selectedTypeName || '';
		},
		
		canSubmit() {
			// 只有选择了异常类型且订单状态为配送中时才能提交（后端要求order_status=3）
			return this.selectedType && this.orderStatus === 'delivery';
		}
	},
	
	onLoad(options) {
			if (options.orderId) {
				this.orderId = options.orderId;
				this.loadOrderDetail(options.orderId);
			}
			if (options.status) {
				this.orderStatus = options.status;
			}
		},
	
	methods: {
		// 映射后端数字状态码到前端字符串状态
		mapOrderStatus(statusCode) {
			const statusMap = {
				1: 'new',      // 待接单
				2: 'pickup',   // 待取货
				3: 'delivery', // 配送中
				4: 'completed', // 已完成
				5: 'cancelled', // 已取消
				6: 'rejected'  // 已拒单
			};
			return statusMap[statusCode] || 'new';
		},
			
			goBack() {
				uni.navigateBack({ delta: 1 });
			},
			
			// 加载订单详情
			async loadOrderDetail(orderId) {
				console.log('📥 loadOrderDetail 被调用，orderId:', orderId);
				console.log('📥 loadOrderDetail orderId类型:', typeof orderId);
				
				// 验证orderId是否是订单号格式（以T开头）
				if (/^T\d+$/.test(orderId)) {
					console.error('❌ 错误：传递的是订单号而不是orderMainId:', orderId);
					uni.showToast({
						title: '参数错误，需传递orderMainId',
						icon: 'error'
					});
					return;
				}
				
				if (!orderId) {
					uni.showToast({
						title: '缺少订单ID',
						icon: 'error'
					});
					return;
				}
				
				try {
					this.loading = true;
					uni.showLoading({ title: '加载中...' });
					
					// 调用订单详情接口
					console.log('📤 调用getOrderDetail接口，orderId:', orderId);
					const res = await getOrderDetail(orderId);
					console.log('📥 getOrderDetail接口返回:', res);
					
					// 处理后端返回的数据格式（后端可能直接返回rows而不是data）
					const orderData = res.data || res.rows || {};
					
					if (res.code === 200 && orderData) {
						// 保存原始数字状态码
						this.rawOrderStatus = orderData.orderStatus;
						
						// 更新订单信息
						this.orderInfo = {
							id: orderData.orderNo || orderData.orderMainId || orderData.id || orderId,
							type: orderData.orderType === 1 ? 'takeout' : 'express',
							typeText: orderData.orderType === 1 ? '外卖' : '跑腿',
							merchant: orderData.pickAddress || orderData.merchantName || orderData.merchant || '未知商家',
							customer: orderData.customerName || orderData.customer || '',
							address: orderData.deliverAddress || orderData.deliveryAddress || '',
							totalPrice: orderData.totalPrice || 0
						};
						console.log('📥 更新后的orderInfo:', this.orderInfo);
						console.log('📋 原始订单状态码:', this.rawOrderStatus);
						
						// 如果页面没有传入status，使用接口返回的状态（需要进行映射）
						if (!this.orderStatus && orderData.orderStatus) {
							this.orderStatus = this.mapOrderStatus(orderData.orderStatus);
						}
					} else {
						uni.showToast({
							title: res.message || '订单详情获取失败',
							icon: 'error'
						});
					}
				} catch (error) {
					console.error('获取订单详情失败:', error);
					uni.showToast({
						title: '网络异常，请稍后重试',
						icon: 'error'
					});
				} finally {
					this.loading = false;
					uni.hideLoading();
				}
			},
		
		showTypePicker() {
			const typeNames = this.exceptionTypes.map(type => type.name);
			
			uni.showActionSheet({
				itemList: typeNames,
				success: (res) => {
					const selectedTypeObj = this.exceptionTypes[res.tapIndex];
					this.selectedType = selectedTypeObj.key; // 保留英文键值（兼容现有逻辑）
					this.selectedTypeName = selectedTypeObj.name; // 新增：存储中文名称
				}
			});
		},
		

		
		async submitReport() {
				if (!this.canSubmit) {
					// 检查是否因为订单状态不符合条件
					if (this.selectedType && this.orderStatus !== 'delivery') {
						uni.showToast({
							title: '只有配送中的订单才能提交异常报备',
							icon: 'error'
						});
					}
					return;
				}
				
				this.submitting = true;
				// 最后确认原始数字状态码
				console.log('📋 提交前的原始数字状态码:', this.rawOrderStatus);
				
				try {
					// 提交报备数据
					uni.showLoading({ title: '提交中...' });
					
					// 获取骑手信息
					let riderId = '';
					// 先尝试从本地缓存获取
					const cachedRiderInfo = uni.getStorageSync('riderInfo');
					if (cachedRiderInfo && cachedRiderInfo.riderId) {
						riderId = cachedRiderInfo.riderId;
					} else {
						// 缓存中没有，从后端获取
						const riderInfoRes = await getRiderBaseInfo();
						if (riderInfoRes.code === 200 && riderInfoRes.data) {
							riderId = riderInfoRes.data.riderBaseId;
							// 保存到缓存
							uni.setStorageSync('riderInfo', {
								...riderInfoRes.data,
								riderId: riderInfoRes.data.riderBaseId
							});
						} else {
							uni.hideLoading();
							throw new Error('获取骑手信息失败');
						}
					}
					
					// 检查当前订单状态
						console.log('📋 当前订单状态:', this.orderStatus);
						console.log('📋 原始数字状态码:', this.rawOrderStatus);
						console.log('📋 订单ID类型:', typeof this.orderId);
						console.log('📋 订单ID值:', this.orderId);
				
				// 构造后端期望的参数格式
					// 直接使用存储的中文名称
					console.log('📋 当前selectedType:', this.selectedType);
					console.log('📋 当前selectedTypeName:', this.selectedTypeName);
					const cancelReason = this.selectedTypeName;
					console.log('📋 准备传递的异常类型:', cancelReason);
					console.log('📋 cancelReason类型:', typeof cancelReason);
					console.log('📋 cancelReason编码:', encodeURIComponent(cancelReason));
					
					const reportData = {
						riderId: Number(riderId),  // 骑手ID
						orderMainId: String(this.orderId),  // 订单主ID，确保是字符串类型
						cancelReason: cancelReason  // 异常类型（报备原因），使用中文名称
					};
					
					console.log('📤 提交异常报备数据:', reportData);
					
					// 调用真实API接口
					const res = await reportException(reportData);
					console.log('📥 异常报备接口返回:', res);
					
					uni.hideLoading();
					
					// 提交成功
					if (res.code === 200 || res.success) {
						uni.showModal({
							title: '提交成功',
							content: res.message || '异常报备已提交，客服将在15分钟内联系您处理。',
							showCancel: false,
							success: () => {
								// 返回上一页或订单列表
								uni.navigateBack({ delta: 1 });
							}
						});
					} else {
						// 提交失败
						uni.showModal({
							title: '提交失败',
							content: res.message || '异常报备提交失败，请稍后重试。',
							showCancel: false
						});
					}
					
				} catch (error) {
					uni.hideLoading();
					console.error('❌ 异常报备API调用失败:', error);
					uni.showModal({
						title: '提交失败',
						content: error.message || '网络异常，请稍后重试',
						showCancel: false
					});
				} finally {
					this.submitting = false;
				}
			}
	}
}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background-color: #f7f7f7;
		padding-top: calc(112rpx + env(safe-area-inset-top));
		padding-bottom: 120rpx;
	}

	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: calc(112rpx + env(safe-area-inset-top));
		padding: env(safe-area-inset-top) 30rpx 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		background-color: #ffffff;
		border-bottom: 1rpx solid #f0f0f0;
		z-index: 10;
	}

	.nav-back {
		position: absolute;
		left: 30rpx;
		bottom: 22rpx;
		font-size: 48rpx;
		color: #333333;
	}

	.nav-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 22rpx;
	}

	.content {
		padding: 40rpx 30rpx;
	}

	/* 卡片通用样式 */
	.order-info-card,
	.exception-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.card-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	/* 订单信息 */
	.order-basic {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.order-id {
		font-size: 30rpx;
		font-weight: 600;
		color: #333333;
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

	.order-merchant {
		font-size: 28rpx;
		color: #666666;
		margin-bottom: 12rpx;
		display: block;
	}

	.order-customer {
		font-size: 28rpx;
		color: #666666;
		margin-bottom: 12rpx;
		display: block;
	}

	.order-address {
		font-size: 26rpx;
		color: #888888;
		margin-bottom: 12rpx;
		display: block;
		line-height: 1.4;
		word-break: break-all;
	}

	.order-status {
		font-size: 26rpx;
		color: #1890ff;
		font-weight: 500;
	}

	/* 异常类型选择器 */
	.select-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 20rpx;
		border: 2rpx solid #f0f0f0;
		border-radius: 12rpx;
		background-color: #fafafa;
		transition: all 0.3s;
	}

	.select-wrapper:active {
		border-color: #ff4d4f;
		background-color: #fff2f0;
	}

	.select-text {
		font-size: 30rpx;
		color: #333333;
		flex: 1;
	}

	.select-text.placeholder {
		color: #999999;
	}

	.select-arrow {
		font-size: 28rpx;
		color: #d0d0d0;
		transform: rotate(90deg);
		margin-left: 20rpx;
	}



	/* 提交按钮 */
	.submit-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 1rpx solid #f0f0f0;
	}

	.submit-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 44rpx;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(255, 77, 79, 0.3);
	}

	.submit-btn[disabled] {
		background: #d9d9d9;
		color: #999999;
		box-shadow: none;
	}
</style>
