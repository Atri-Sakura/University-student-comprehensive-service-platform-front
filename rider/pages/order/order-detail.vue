<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">订单详情</text>
		</view>

		<view class="content">
			<!-- 订单状态卡片 -->
			<view class="status-card">
				<view class="status-header">
					<view class="status-icon" :class="orderStatus">
						<text class="icon">{{ getStatusIcon(orderStatus) }}</text>
					</view>
					<view class="status-info">
						<text class="status-title">{{ getStatusText(orderStatus) }}</text>
						<text class="status-desc">{{ getStatusDesc(orderStatus) }}</text>
					</view>
				</view>
				<view class="progress-bar" v-if="orderStatus !== 'completed'">
					<view class="progress-fill" :style="{width: getProgressWidth()}"></view>
				</view>
			</view>

			<!-- 订单信息 -->
			<view class="info-card">
				<view class="card-header">
					<text class="card-title">订单信息</text>
					<view class="order-tag" :class="orderInfo.type">{{ orderInfo.typeText }}</view>
				</view>
				
				<view class="info-list">
					<view class="info-item">
						<text class="info-label">订单编号</text>
						<text class="info-value">{{ orderInfo.orderNo }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">下单时间</text>
						<text class="info-value">{{ orderInfo.createTime }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">预计送达</text>
						<text class="info-value">{{ orderInfo.deliveryTime }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">配送费</text>
						<text class="info-value price">¥{{ orderInfo.deliveryFee }}</text>
					</view>
				</view>
			</view>

			<!-- 商家信息 -->
			<view class="merchant-card">
				<view class="merchant-header">
					<view class="merchant-title-section">
						<text class="card-title">商家信息</text>
						<view class="merchant-name">{{ orderInfo.merchant }}</view>
					</view>
					<button class="contact-btn" @tap="contactMerchant">
						<text class="contact-icon">📞</text>
						<text class="contact-text">联系</text>
					</button>
				</view>
				
				<view class="merchant-info">
					<view class="merchant-address">
						<text class="address-icon">📍</text>
						<text class="address-text">{{ orderInfo.merchantAddress }}</text>
					</view>
					<view class="merchant-distance">
						<text class="distance-text">距离您约 {{ orderInfo.merchantDistance }}</text>
					</view>
				</view>
			</view>

			<!-- 顾客信息 -->
			<view class="customer-card">
				<view class="customer-header">
					<view class="customer-title-section">
							<text class="card-title">顾客信息</text>
							<view class="customer-name">{{ maskCustomerName(orderInfo.customerName) }}</view>
						</view>
					<button class="contact-btn" @tap="contactCustomer">
						<text class="contact-icon">📞</text>
						<text class="contact-text">联系</text>
					</button>
				</view>
				
				<view class="customer-info">
					<view class="customer-address">
						<text class="address-icon">📍</text>
						<text class="address-text">{{ orderInfo.customerAddress }}</text>
					</view>
					<view class="customer-note" v-if="orderInfo.customerNote">
						<text class="note-label">备注：</text>
						<text class="note-text">{{ orderInfo.customerNote }}</text>
					</view>
				</view>
			</view>

			<!-- 商品信息 -->
			<view class="goods-card" v-if="orderInfo.goods && orderInfo.goods.length > 0">
				<view class="card-header">
					<text class="card-title">商品信息</text>
					<text class="goods-count">共{{ orderInfo.goods.length }}件商品</text>
				</view>
				
				<view class="goods-list">
					<view class="goods-item" v-for="(item, index) in orderInfo.goods" :key="index">
						<image class="goods-image" :src="item.image" mode="aspectFill"></image>
						<view class="goods-info">
							<text class="goods-name">{{ item.name }}</text>
							<text class="goods-spec" v-if="item.spec">{{ item.spec }}</text>
							<view class="goods-price-qty">
								<text class="goods-price">¥{{ item.price }}</text>
								<text class="goods-qty">×{{ item.quantity }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 路线导航 -->
			<view class="route-card" v-if="orderStatus === 'pickup' || orderStatus === 'delivery'">
				<view class="route-header">
					<text class="card-title">路线导航</text>
					<button class="nav-btn" @tap="openNavigation">
						<text class="nav-icon">🗺️</text>
						<text class="nav-text">路线</text>
					</button>
				</view>
				
				<view class="route-info">
					<view class="route-item">
						<view class="route-dot start"></view>
						<view class="route-content">
							<text class="route-label">{{ orderStatus === 'pickup' ? '取货地址' : '起点' }}</text>
							<text class="route-address">{{ orderInfo.merchantAddress }}</text>
						</view>
					</view>
					<view class="route-line"></view>
					<view class="route-item">
						<view class="route-dot end"></view>
						<view class="route-content">
							<text class="route-label">{{ orderStatus === 'pickup' ? '当前位置' : '送达地址' }}</text>
							<text class="route-address">{{ orderStatus === 'pickup' ? '您的位置' : orderInfo.customerAddress }}</text>
						</view>
					</view>
				</view>
				
				
			</view>

			<!-- 操作按钮 -->
			<view class="action-section">
				<!-- 商家待接单状态 -->
				<template v-if="orderStatus === 'merchantPending'">
					<view class="status-info">
						<text class="status-text">⏳ 商家正在处理订单</text>
						<text class="status-desc">请耐心等待商家确认接单</text>
					</view>
				</template>
				
					<!-- 骑手待接单状态 -->
				<template v-else-if="orderStatus === 'riderPending'">
					<button class="action-btn primary full-width" @tap="acceptOrder">立即接单</button>
				</template>
				
				<!-- 待取货状态 -->
				<template v-else-if="orderStatus === 'pickup'">
					<button class="action-btn primary" @tap="confirmPickup">确认取货</button>
				</template>
				
				<!-- 配送中状态 -->
				<template v-else-if="orderStatus === 'delivery'">
					<button class="action-btn primary" @tap="confirmDelivery">确认送达</button>
				</template>
				
				<!-- 已完成状态 -->
				<template v-else-if="orderStatus === 'completed'">
					<view class="completed-info">
						<text class="completed-text">✅ 订单已完成</text>
						<text class="completed-time">完成时间：{{ orderInfo.completedTime }}</text>
					</view>
				</template>
				
				<!-- 已取消状态 -->
				<template v-else-if="orderStatus === 'cancelled'">
					<view class="cancelled-info">
						<text class="cancelled-text">❌ 订单已取消</text>
						<text class="cancelled-reason" v-if="orderInfo.cancelReason">取消原因：{{ orderInfo.cancelReason }}</text>
					</view>
				</template>
				
				<!-- 异常报备状态 -->
				<template v-else-if="orderStatus === 'abnormal'">
					<view class="abnormal-info">
						<text class="abnormal-text">⚠️ 骑手异常报备</text>
						<text class="abnormal-desc">此订单已进行异常报备，请等待处理</text>
					</view>
				</template>
				
				<!-- 未知状态 -->
				<template v-else>
					<view class="unknown-info">
						<text class="unknown-text">❓ 未知状态</text>
						<text class="unknown-desc">订单状态异常，请联系客服</text>
					</view>
				</template>
			</view>
		</view>
	</view>
</template>

<script>
import { getOrderDetail } from '@/utils/api/order.js';
import { acceptOrder, pickupOrder, deliverOrder } from '@/utils/api/orderFlow.js';

export default {
	data() {
		return {
			orderId: '',
			orderStatus: 'new', // new, pickup, delivery, completed
			orderInfo: {
				id: 'ORD2024123456',
				type: 'takeout',
				typeText: '外卖',
				createTime: '2024-01-15 14:30',
				deliveryTime: '15:00-15:30',
				deliveryFee: '8.00',
				merchant: '星巴克咖啡（人民广场店）',
				merchantAddress: '上海市黄浦区南京东路123号星巴克咖啡店',
				merchantDistance: '500米',
				customerName: '张先生',
				customerAddress: '上海市黄浦区南京东路456号办公楼A座1201室',
				customerNote: '请送到前台，谢谢',
				estimatedDistance: '2.3公里',
				estimatedTime: '12分钟',
				completedTime: '2024-01-15 15:25',
				goods: [
					{
						name: '美式咖啡',
						spec: '大杯/热饮',
						price: '28.00',
						quantity: 2,
						image: '/static/coffee1.jpg'
					},
					{
						name: '拿铁咖啡',
						spec: '中杯/热饮',
						price: '32.00',
						quantity: 1,
						image: '/static/coffee2.jpg'
					}
				]
			}
		}
	},
	
	onLoad(options) {
		if (options.orderId) {
			this.orderId = options.orderId;
			this.loadOrderDetail();
		}
	},
	
	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 });
		},
		
		loadOrderDetail() {
			// 根据订单ID加载订单详情
			// 注意：orderMainId 应保持字符串类型，避免大整数精度丢失
			const orderMainId = this.orderId;
			
			// 调试信息
			console.log('📌 order-detail页面接收到的orderId:', orderMainId);
			console.log('📌 orderId类型:', typeof orderMainId);
			
			// 验证订单ID是否存在
			if (!orderMainId) {
				uni.showToast({ title: '无效的订单ID', icon: 'none' });
				return;
			}
			
			console.log('📌 准备调用getOrderDetail，传入:', orderMainId);
			getOrderDetail(orderMainId)
				.then(res => {
					if (res.code === 200) {
						const order = res.data;
						// 添加调试日志，查看后端返回的orderStatus
						console.log('📌 后端返回的orderStatus:', order.orderStatus);
						console.log('📌 orderStatus类型:', typeof order.orderStatus);
						
						this.orderInfo = {
							id: order.orderMainId || order.orderId || order.id,
							orderNo: order.orderNo || order.orderId || order.id,
							type: order.orderType === 1 ? 'takeout' : 'errand',
							typeText: order.orderType === 1 ? '外卖' : '跑腿',
							createTime: order.createTime,
							deliveryTime: this.formatDeliveryTime(order),
							deliveryFee: order.deliveryFeeAmount?.toFixed(2) || order.deliveryFee?.toFixed(2) || '0.00',
							merchant: order.merchantName || order.pickName || order.shopName,
							merchantPhone: order.merchantPhone || order.pickPhone || order.shopPhone,
							merchantAddress: order.merchantAddress || order.pickAddress || order.shopAddress,
							merchantDistance: this.calculateDistance(order),
							customerName: order.deliverContact || order.userNickname || order.customerName || order.deliverName,
							customerPhone: order.deliverPhone || order.customerPhone,
							customerAddress: order.customerAddress || order.deliverAddress,
							customerNote: order.customerNote || order.remark,
							estimatedDistance: order.estimatedDistance,
							estimatedTime: order.estimatedTime,
							completedTime: order.completeTime,
							goods: (order.orderTakeoutDetailList || order.orderGoodsList || order.orderItems || []).map(item => ({
								name: item.goodsName || item.name,
								spec: item.goodsSpec || item.spec,
								price: item.goodsPrice || item.price,
								quantity: item.goodsQuantity || item.quantity,
								image: item.goodsImage || item.image
							}))
						};
						
						// 更新订单状态
						const mappedStatus = this.mapOrderStatus(order.orderStatus);
						console.log('📌 映射后的订单状态:', mappedStatus);
						this.orderStatus = mappedStatus;
					} else {
						uni.showToast({ title: res.msg || '加载失败', icon: 'none' });
					}
				})
				.catch(err => {
					console.error('加载订单详情失败:', err);
					uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
				});
		},
		
		// 映射订单状态
			mapOrderStatus(orderStatus) {
				// 确保orderStatus是数字类型
				const statusCode = Number(orderStatus);
				const statusMap = {
					1: 'merchantPending',  // 商家待接单
					2: 'riderPending',     // 骑手待接单
					3: 'pickup',           // 骑手待取货
					4: 'delivery',         // 配送中
					5: 'completed',        // 已完成
					6: 'cancelled',        // 已取消
					7: 'abnormal'          // 骑手异常报备
				};
				return statusMap[statusCode] || 'unknown';
			},
		
		// 格式化配送时间
		formatDeliveryTime(order) {
			if (order.deliveryTime) {
				return order.deliveryTime;
			}
			// 如果没有直接的配送时间，可以根据下单时间和预计送达时间计算
			if (order.createTime && order.estimatedTime) {
				const createDate = new Date(order.createTime);
				const estimatedMinutes = parseInt(order.estimatedTime);
				const deliveryDate = new Date(createDate.getTime() + estimatedMinutes * 60000);
				return deliveryDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
			}
			return '';
		},
		
		// 计算距离（这里只是示例，实际应该从后端获取）
		calculateDistance(order) {
			if (order.distance) {
				return `${order.distance}米`;
			}
			// 模拟距离
			return '500米';
		},
		
		getStatusIcon(status) {
				// 添加调试日志，查看当前状态
				console.log('📌 当前订单状态:', status);
				const icons = {
					merchantPending: '📋',
					riderPending: '📞',
					pickup: '🏪',
					delivery: '🚴',
					completed: '✅',
					cancelled: '❌',
					abnormal: '⚠️',
					unknown: '❓'
				};
				return icons[status] || '❓';
			},
			
			getStatusText(status) {
				const texts = {
					merchantPending: '商家待接单',
					riderPending: '骑手待接单',
					pickup: '待取货',
					delivery: '配送中',
					completed: '已完成',
					cancelled: '已取消',
					abnormal: '骑手异常报备',
					unknown: '未知状态'
				};
				return texts[status] || '未知状态';
			},
			
			getStatusDesc(status) {
				const descs = {
					merchantPending: '商家正在处理此订单',
					riderPending: '请确认是否接受此订单',
					pickup: '请前往商家取货',
					delivery: '请尽快送达顾客',
					completed: '订单已成功完成',
					cancelled: '订单已取消',
					abnormal: '骑手已发起异常报备',
					unknown: '订单状态未知'
				};
				return descs[status] || '';
			},
		
		getProgressWidth() {
				const widths = {
					merchantPending: '15%',
					riderPending: '25%',
					pickup: '50%',
					delivery: '75%',
					completed: '100%',
					cancelled: '0%',
					abnormal: '75%',
					unknown: '0%'
				};
				return widths[this.orderStatus] || '0%';
			},
		
		// 脱敏顾客姓名：只显示姓氏，名字用星号代替
		maskCustomerName(name) {
			if (!name || name.length <= 1) return name;
			return name.charAt(0) + '*'.repeat(name.length - 1);
		},
		
		// 脱敏电话号码：显示前3位和后4位，中间用星号代替
		maskPhoneNumber(phone) {
			if (!phone || phone.length < 7) return phone;
			return phone.substring(0, 3) + '****' + phone.substring(phone.length - 4);
		},
		
		contactMerchant() {
			uni.showModal({
				title: '联系商家',
				content: `商家：${this.orderInfo.merchant}\n电话：${this.orderInfo.merchantPhone || '暂未提供'}`,
				confirmText: '拨打电话',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm && this.orderInfo.merchantPhone) {
						uni.makePhoneCall({
							phoneNumber: this.orderInfo.merchantPhone
						});
					} else if (!this.orderInfo.merchantPhone) {
						uni.showToast({
							title: '商家电话暂未提供',
							icon: 'none'
						});
					}
				}
			});
		},
		
		contactCustomer() {
			// 对顾客名称和电话进行脱敏处理
			const maskedName = this.maskCustomerName(this.orderInfo.customerName);
			const maskedPhone = this.maskPhoneNumber(this.orderInfo.customerPhone);
			
			uni.showModal({
				title: '联系顾客',
				content: `顾客：${maskedName}\n电话：${maskedPhone || '暂未提供'}`,
				confirmText: '拨打电话',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm && this.orderInfo.customerPhone) {
						// 拨打电话时使用完整号码
						uni.makePhoneCall({
							phoneNumber: this.orderInfo.customerPhone
						});
					} else if (!this.orderInfo.customerPhone) {
						uni.showToast({
							title: '顾客电话暂未提供',
							icon: 'none'
						});
					}
				}
			});
		},
		
		openNavigation() {
			const destination = this.orderStatus === 'pickup' 
				? this.orderInfo.merchantAddress 
				: this.orderInfo.customerAddress;
				
			uni.showModal({
				title: '打开导航',
				content: `导航到：${destination}`,
				confirmText: '确定',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						// 这里可以调用地图导航API
						uni.showToast({
							title: '正在打开导航...',
							icon: 'loading'
						});
					}
				}
			});
		},
		
		rejectOrder() {
			uni.showModal({
				title: '拒绝订单',
				content: '确定要拒绝这个订单吗？',
				confirmText: '确定拒绝',
				confirmColor: '#ff4d4f',
				success: (res) => {
					if (res.confirm) {
						uni.showToast({
							title: '已拒绝订单',
							icon: 'success'
						});
						
						setTimeout(() => {
							uni.navigateBack({ delta: 1 });
						}, 1500);
					}
				}
			});
		},
		
		acceptOrder() {
			uni.showModal({
				title: '确认接单',
				content: `确定要接受订单 ${this.orderInfo.orderNo} 吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							// 调用后端接单接口
							const response = await acceptOrder(this.orderInfo.id);
							
							if (response.code === 200) {
								// 更新订单状态
								this.orderStatus = 'pickup';
								
								uni.showToast({
									title: '接单成功',
									icon: 'success'
								});
								
								// 重新加载订单详情以确保数据最新
								this.loadOrderDetail();
							} else {
								uni.showToast({
									title: response.msg || '接单失败',
									icon: 'none'
								});
							}
						} catch (error) {
							console.error('接单操作失败:', error);
							uni.showToast({
								title: error.message || '网络错误，请稍后重试',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		
		confirmPickup() {
			uni.showModal({
				title: '确认取货',
				content: `确定已取到订单 ${this.orderInfo.orderNo} 的货物吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							// 调用后端确认取货接口
							const response = await pickupOrder(this.orderInfo.id);
							
							if (response.code === 200) {
								// 更新订单状态
								this.orderStatus = 'delivery';
								
								uni.showToast({
									title: '取货成功，请尽快送达',
									icon: 'success'
								});
								
								// 重新加载订单详情以确保数据最新
								this.loadOrderDetail();
							} else {
								uni.showToast({
									title: response.msg || '取货失败',
									icon: 'none'
								});
							}
						} catch (error) {
							console.error('取货操作失败:', error);
							uni.showToast({
								title: error.message || '网络错误，请稍后重试',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		
		confirmDelivery() {
			uni.showModal({
				title: '确认送达',
				content: `确定订单 ${this.orderInfo.orderNo} 已送达吗？`,
				success: async (res) => {
					if (res.confirm) {
						try {
							// 调用后端确认送达接口
							const response = await deliverOrder(this.orderInfo.id);
							
							if (response.code === 200) {
								// 更新订单状态
								this.orderStatus = 'completed';
								this.orderInfo.completedTime = new Date().toLocaleString();
								
								uni.showToast({
									title: '订单已完成',
									icon: 'success'
								});
								
								// 重新加载订单详情以确保数据最新
								this.loadOrderDetail();
							} else {
								uni.showToast({
									title: response.msg || '确认送达失败',
									icon: 'none'
								});
							}
						} catch (error) {
							console.error('确认送达操作失败:', error);
							uni.showToast({
								title: error.message || '网络错误，请稍后重试',
								icon: 'none'
							});
						}
					}
				}
			});
		},
		

	}
}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background-color: #f7f7f7;
		padding-top: calc(112rpx + env(safe-area-inset-top));
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
		padding: 40rpx 30rpx 120rpx;
	}

	/* 卡片通用样式 */
	.status-card,
	.info-card,
	.merchant-card,
	.customer-card,
	.goods-card,
	.route-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
	}

	/* 状态卡片 */
	.status-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.status-icon {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.status-icon.new {
		background-color: #fff7e6;
	}

	.status-icon.pickup {
		background-color: #e6f7ff;
	}

	.status-icon.delivery {
		background-color: #f6ffed;
	}

	.status-icon.completed {
		background-color: #f6ffed;
	}

	.status-icon .icon {
		font-size: 28rpx;
	}

	.status-info {
		flex: 1;
	}

	.status-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
		display: block;
		margin-bottom: 6rpx;
	}

	.status-desc {
		font-size: 26rpx;
		color: #999999;
		display: block;
	}

	.progress-bar {
		height: 8rpx;
		background-color: #f0f0f0;
		border-radius: 4rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
		border-radius: 4rpx;
		transition: width 0.5s ease;
	}

	/* 信息列表 */
	.info-list {
		margin-top: 20rpx;
	}

	.info-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-label {
		font-size: 28rpx;
		color: #666666;
	}

	.info-value {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}

	.info-value.price {
		color: #ff4d4f;
		font-weight: 600;
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

	/* 联系按钮 */
	.contact-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 20rpx;
		background-color: #1890ff;
		color: #ffffff;
		border: none;
		border-radius: 20rpx;
		font-size: 24rpx;
	}

	.contact-icon {
		font-size: 20rpx;
	}

	/* 商家/顾客信息 */
	.merchant-header,
	.customer-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	/* 路线导航header */
	.route-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}
	
	.route-card .route-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}
	
	.route-card .card-title {
		flex: 1;
		margin-right: 20rpx;
	}
	
	.route-card .nav-btn {
		margin-left: auto;
		flex-shrink: 0;
	}

	.merchant-title-section,
	.customer-title-section {
		flex: 1;
	}

	.merchant-info,
	.customer-info {
		margin-top: 0;
	}

	.merchant-name,
	.customer-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333333;
		margin-top: 8rpx;
	}

	.merchant-address,
	.customer-address {
		display: flex;
		align-items: flex-start;
		gap: 8rpx;
		margin-bottom: 12rpx;
	}

	.address-icon {
		font-size: 24rpx;
		color: #52c41a;
		margin-top: 2rpx;
	}

	.address-text {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.5;
		flex: 1;
	}

	.merchant-distance {
		margin-top: 8rpx;
	}

	.distance-text {
		font-size: 24rpx;
		color: #999999;
	}

	.customer-note {
		padding: 16rpx;
		background-color: #fff7e6;
		border-radius: 8rpx;
		margin-top: 12rpx;
	}

	.note-label {
		font-size: 26rpx;
		color: #fa8c16;
		font-weight: 500;
	}

	.note-text {
		font-size: 26rpx;
		color: #666666;
	}

	/* 商品列表 */
	.goods-count {
		font-size: 26rpx;
		color: #999999;
	}

	.goods-list {
		margin-top: 20rpx;
	}

	.goods-item {
		display: flex;
		align-items: center;
		gap: 20rpx;
		padding: 16rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.goods-item:last-child {
		border-bottom: none;
	}

	.goods-image {
		width: 80rpx;
		height: 80rpx;
		border-radius: 8rpx;
		background-color: #f0f0f0;
	}

	.goods-info {
		flex: 1;
	}

	.goods-name {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
		display: block;
		margin-bottom: 6rpx;
	}

	.goods-spec {
		font-size: 24rpx;
		color: #999999;
		display: block;
		margin-bottom: 8rpx;
	}

	.goods-price-qty {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.goods-price {
		font-size: 26rpx;
		color: #ff4d4f;
		font-weight: 600;
	}

	.goods-qty {
		font-size: 24rpx;
		color: #999999;
	}

	/* 路线导航 */
	.nav-btn {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 20rpx;
		background-color: #52c41a;
		color: #ffffff;
		border: none;
		border-radius: 20rpx;
		font-size: 24rpx;
	}

	.nav-icon {
		font-size: 20rpx;
	}

	.route-info {
		position: relative;
		margin: 30rpx 0;
	}

	.route-item {
		display: flex;
		align-items: flex-start;
		gap: 20rpx;
		position: relative;
	}

	.route-dot {
		width: 20rpx;
		height: 20rpx;
		border-radius: 50%;
		margin-top: 8rpx;
		flex-shrink: 0;
	}

	.route-dot.start {
		background-color: #1890ff;
	}

	.route-dot.end {
		background-color: #52c41a;
	}

	.route-line {
		width: 2rpx;
		height: 40rpx;
		background-color: #d9d9d9;
		margin-left: 9rpx;
		margin: 8rpx 0 8rpx 9rpx;
	}

	.route-content {
		flex: 1;
		padding-bottom: 20rpx;
	}

	.route-label {
		font-size: 26rpx;
		color: #999999;
		display: block;
		margin-bottom: 6rpx;
	}

	.route-address {
		font-size: 28rpx;
		color: #333333;
		line-height: 1.5;
	}

	.route-stats {
		display: flex;
		gap: 80rpx;
		padding: 20rpx;
		background-color: #f8f9fa;
		border-radius: 8rpx;
		justify-content: center;
	}

	.stat-item {
		text-align: center;
	}

	.stat-label {
		font-size: 24rpx;
		color: #999999;
		display: block;
		margin-bottom: 6rpx;
	}

	.stat-value {
		font-size: 28rpx;
		color: #333333;
		font-weight: 600;
	}

	/* 操作按钮 */
	.action-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 1rpx solid #f0f0f0;
		display: flex;
		gap: 20rpx;
	}

	.action-btn {
		flex: 1;
		height: 88rpx;
		border: none;
		border-radius: 44rpx;
		font-size: 32rpx;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action-btn.secondary {
		background-color: #f0f0f0;
		color: #666666;
	}

	.action-btn.primary {
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #ffffff;
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);
	}

	.action-btn.full-width {
		flex: none;
		width: 100%;
	}

	.completed-info {
		flex: 1;
		text-align: center;
		padding: 20rpx 0;
	}

	.completed-text {
		font-size: 32rpx;
		color: #52c41a;
		font-weight: 600;
		display: block;
		margin-bottom: 8rpx;
	}

	.completed-time {
		font-size: 26rpx;
		color: #999999;
	}
</style>
