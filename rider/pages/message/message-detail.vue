<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-back" @tap="goBack">‹</text>
			<text class="nav-title">消息详情</text>
		</view>

		<view class="content">
			<!-- 消息头部 -->
			<view class="message-header">
				<view class="message-avatar">
					<text class="avatar-icon" :class="messageType">{{ getTypeIcon() }}</text>
				</view>
				<view class="message-info">
					<text class="message-title">{{ messageDetail.title }}</text>
					<text class="message-time">{{ formatTime(messageDetail.time) }}</text>
				</view>
			</view>

			<!-- 消息内容 -->
			<view class="message-body">
				<text class="message-content">{{ messageDetail.content }}</text>
				
				<!-- 如果有图片 -->
				<view class="message-images" v-if="messageDetail.images && messageDetail.images.length > 0">
					<image 
						class="message-image" 
						v-for="(image, index) in messageDetail.images" 
						:key="index"
						:src="image"
						mode="aspectFill"
						@tap="previewImage(image)"
					></image>
				</view>

				<!-- 如果有链接 -->
				<view class="message-links" v-if="messageDetail.links && messageDetail.links.length > 0">
					<view 
						class="link-item" 
						v-for="(link, index) in messageDetail.links" 
						:key="index"
						@tap="openLink(link.url)"
					>
						<text class="link-text">{{ link.text }}</text>
						<text class="link-arrow">〉</text>
					</view>
				</view>
			</view>

			<!-- 操作按钮 -->
			<view class="action-section" v-if="messageDetail.actions && messageDetail.actions.length > 0">
				<button 
					class="action-btn" 
					:class="action.type"
					v-for="(action, index) in messageDetail.actions" 
					:key="index"
					@tap="handleAction(action)"
				>
					{{ action.text }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			messageId: '',
			messageType: '',
			messageDetail: {
				title: '',
				content: '',
				time: new Date(),
				images: [],
				links: [],
				actions: []
			}
		}
	},
	
	onLoad(options) {
		this.messageId = options.id || '';
		this.messageType = options.type || '';
		this.loadMessageDetail();
	},
	
	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 });
		},
		
		loadMessageDetail() {
			// 模拟加载消息详情
			const mockDetails = {
				'sys_001': {
					title: '系统通知',
					content: '恭喜您！您的账户已通过实名认证审核。\n\n现在您可以：\n• 正常接收配送订单\n• 享受完整的平台服务\n• 获得更高的信用评级\n\n感谢您对我们平台的信任与支持！',
					time: new Date(Date.now() - 2 * 60 * 60 * 1000),
					actions: [
						{ type: 'primary', text: '立即接单', action: 'goToOrders' }
					]
				},
				'sys_002': {
					title: '安全提醒',
					content: '为了保障您的账户安全，建议您：\n\n1. 定期修改登录密码\n2. 不要在公共场所登录账户\n3. 发现异常及时联系客服\n4. 不要将账户信息透露给他人\n\n您的账户安全是我们共同的责任。',
					time: new Date(Date.now() - 24 * 60 * 60 * 1000),
					links: [
						{ text: '修改密码', url: '/pages/security/change-password' },
						{ text: '联系客服', url: '/pages/message/customer-service' }
					]
				},
				'order_001': {
					title: '订单状态更新',
					content: '订单编号：ORD2024123456\n配送地址：上海市黄浦区南京东路123号\n订单金额：¥45.80\n\n该订单已成功完成配送，感谢您的优质服务！本次配送获得用户5星好评。',
					time: new Date(Date.now() - 30 * 60 * 1000),
					actions: [
						{ type: 'default', text: '查看订单', action: 'viewOrder' },
						{ type: 'primary', text: '继续接单', action: 'goToOrders' }
					]
				},
				'order_002': {
					title: '新订单提醒',
					content: '您有一个新的配送订单等待接收：\n\n取货地址：星巴克咖啡（人民广场店）\n送达地址：上海市黄浦区南京东路456号\n预计距离：2.3公里\n配送费：¥8.00\n\n请及时查看并决定是否接单。',
					time: new Date(Date.now() - 3 * 60 * 60 * 1000),
					actions: [
						{ type: 'default', text: '查看详情', action: 'viewOrder' },
						{ type: 'primary', text: '立即接单', action: 'acceptOrder' }
					]
				},
				'ann_001': {
					title: '春节期间配送费调整通知',
					content: '尊敬的配送员：\n\n为了保障春节期间的配送服务质量，平台将对配送费进行临时调整：\n\n调整时间：2024年2月8日-2月18日\n调整内容：\n• 基础配送费上调20%\n• 夜间配送费额外增加¥5\n• 恶劣天气补贴翻倍\n\n感谢您在节日期间的辛勤工作！',
					time: new Date(Date.now() - 12 * 60 * 60 * 1000),
					images: [
						'/static/images/spring-festival-notice.jpg'
					],
					links: [
						{ text: '查看完整公告', url: '/pages/announcement/detail' }
					]
				}
			};
			
			this.messageDetail = mockDetails[this.messageId] || {
				title: '消息不存在',
				content: '该消息可能已被删除或不存在',
				time: new Date()
			};
		},
		
		getTypeIcon() {
			const icons = {
				'system': '🔔',
				'order': '📦',
				'service': '👥',
				'announcement': '📢'
			};
			return icons[this.messageType] || '💬';
		},
		
		formatTime(time) {
			const date = new Date(time);
			return date.toLocaleString('zh-CN', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit'
			});
		},
		
		previewImage(image) {
			uni.previewImage({
				urls: this.messageDetail.images,
				current: image
			});
		},
		
		openLink(url) {
			if (url.startsWith('http')) {
				// 外部链接
				uni.showModal({
					title: '提示',
					content: '即将跳转到外部链接，是否继续？',
					success: (res) => {
						if (res.confirm) {
							// 在实际应用中，可以使用web-view组件或其他方式打开外部链接
							uni.showToast({
								title: '功能开发中',
								icon: 'none'
							});
						}
					}
				});
			} else {
				// 内部页面
				uni.navigateTo({
					url: url
				});
			}
		},
		
		handleAction(action) {
			switch (action.action) {
				case 'goToOrders':
					uni.switchTab({
						url: '/pages/order/order'
					});
					break;
				case 'viewOrder':
					uni.navigateTo({
						url: '/pages/order/order-detail?id=ORD2024123456'
					});
					break;
				case 'acceptOrder':
					uni.showModal({
						title: '接单确认',
						content: '确定要接收这个订单吗？',
						success: (res) => {
							if (res.confirm) {
								uni.showToast({
									title: '接单成功',
									icon: 'success'
								});
								setTimeout(() => {
									uni.switchTab({
										url: '/pages/order/order'
									});
								}, 1500);
							}
						}
					});
					break;
				default:
					uni.showToast({
						title: '功能开发中',
						icon: 'none'
					});
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
		padding: 30rpx;
	}

	/* 消息头部 */
	.message-header {
		display: flex;
		align-items: center;
		padding: 30rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.message-avatar {
		margin-right: 24rpx;
	}

	.avatar-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
	}

	.avatar-icon.system {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.avatar-icon.order {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.avatar-icon.service {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	.avatar-icon.announcement {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.message-info {
		flex: 1;
	}

	.message-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
		display: block;
		margin-bottom: 8rpx;
	}

	.message-time {
		font-size: 24rpx;
		color: #999999;
	}

	/* 消息内容 */
	.message-body {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.message-content {
		font-size: 30rpx;
		color: #333333;
		line-height: 1.8;
		white-space: pre-line;
	}

	.message-images {
		margin-top: 30rpx;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16rpx;
	}

	.message-image {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 12rpx;
	}

	.message-links {
		margin-top: 30rpx;
		border-top: 1rpx solid #f0f0f0;
		padding-top: 30rpx;
	}

	.link-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #f8f9fa;
	}

	.link-item:last-child {
		border-bottom: none;
	}

	.link-text {
		font-size: 28rpx;
		color: #1890ff;
	}

	.link-arrow {
		font-size: 24rpx;
		color: #d0d0d0;
		transform: rotate(90deg);
	}

	/* 操作按钮 */
	.action-section {
		display: flex;
		gap: 20rpx;
	}

	.action-btn {
		flex: 1;
		height: 88rpx;
		border: none;
		border-radius: 44rpx;
		font-size: 32rpx;
		font-weight: 600;
	}

	.action-btn.default {
		background-color: #f5f5f5;
		color: #666666;
	}

	.action-btn.primary {
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
	}

	.action-btn:active {
		transform: translateY(2rpx);
	}
</style>
