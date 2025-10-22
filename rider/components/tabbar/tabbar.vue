<template>
	<view class="tabbar">
		<view 
			v-for="(item, index) in list" 
			:key="index" 
			class="tabbar-item"
			@click="switchTab(index)"
		>
			<view class="tabbar-icon" :class="{'active': current === index}">
				<!-- 订单图标 -->
				<view v-if="index === 0" class="icon icon-order">
					<view class="icon-rect"></view>
					<view class="icon-line1"></view>
					<view class="icon-line2"></view>
					<view class="icon-line3"></view>
				</view>
				<!-- 路线图标 -->
				<view v-else-if="index === 1" class="icon icon-route">
					<view class="route-pin"></view>
					<view class="route-circle"></view>
				</view>
				<!-- 消息图标 -->
				<view v-else-if="index === 2" class="icon icon-message">
					<view class="message-bubble"></view>
					<view class="message-dot1"></view>
					<view class="message-dot2"></view>
					<view class="message-dot3"></view>
				</view>
				<!-- 我的图标 -->
				<view v-else class="icon icon-user">
					<view class="user-head"></view>
					<view class="user-body"></view>
				</view>
			</view>
			<text class="tabbar-text" :class="{'active': current === index}">{{ item.text }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'Tabbar',
		props: {
			current: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				list: [
					{
						text: '订单',
						pagePath: '/pages/order/order'
					},
					{
						text: '路线',
						pagePath: '/pages/route/route'
					},
					{
						text: '消息',
						pagePath: '/pages/message/message'
					},
					{
						text: '我的',
						pagePath: '/pages/index/index'
					}
				]
			}
		},
		methods: {
			switchTab(index) {
				if (this.current === index) return;
				
				const item = this.list[index];
				uni.navigateTo({
					url: item.pagePath
				});
			}
		}
	}
</script>

<style scoped>
	.tabbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #ffffff;
		display: flex;
		border-top: 1rpx solid #e5e5e5;
		padding-bottom: env(safe-area-inset-bottom);
		z-index: 9999;
		box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
	}

	.tabbar-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10rpx 0;
	}

	.tabbar-icon {
		width: 52rpx;
		height: 52rpx;
		margin-bottom: 6rpx;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon {
		width: 44rpx;
		height: 44rpx;
		position: relative;
	}

	/* 订单图标 */
	.icon-order .icon-rect {
		width: 36rpx;
		height: 44rpx;
		border: 4rpx solid #999999;
		border-radius: 4rpx;
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		transition: border-color 0.3s;
	}

	.tabbar-icon.active .icon-order .icon-rect {
		border-color: #007AFF;
	}

	.icon-order .icon-line1,
	.icon-order .icon-line2,
	.icon-order .icon-line3 {
		width: 20rpx;
		height: 3rpx;
		background-color: #999999;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 2rpx;
		transition: background-color 0.3s;
	}

	.icon-order .icon-line1 { top: 12rpx; }
	.icon-order .icon-line2 { top: 21rpx; }
	.icon-order .icon-line3 { top: 30rpx; }

	.tabbar-icon.active .icon-order .icon-line1,
	.tabbar-icon.active .icon-order .icon-line2,
	.tabbar-icon.active .icon-order .icon-line3 {
		background-color: #007AFF;
	}

	/* 路线图标 */
	.icon-route .route-pin {
		width: 28rpx;
		height: 28rpx;
		border: 4rpx solid #999999;
		border-radius: 50% 50% 50% 0;
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%) rotate(-45deg);
		transition: border-color 0.3s;
	}

	.icon-route .route-pin::after {
		content: '';
		width: 12rpx;
		height: 12rpx;
		background-color: #999999;
		border-radius: 50%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		transition: background-color 0.3s;
	}

	.tabbar-icon.active .icon-route .route-pin {
		border-color: #007AFF;
	}

	.tabbar-icon.active .icon-route .route-pin::after {
		background-color: #007AFF;
	}

	.icon-route .route-circle {
		width: 20rpx;
		height: 20rpx;
		border: 4rpx solid #999999;
		border-radius: 50%;
		position: absolute;
		bottom: 4rpx;
		right: 0;
		transition: border-color 0.3s;
	}

	.tabbar-icon.active .icon-route .route-circle {
		border-color: #007AFF;
	}

	/* 消息图标 */
	.icon-message .message-bubble {
		width: 40rpx;
		height: 32rpx;
		border: 4rpx solid #999999;
		border-radius: 8rpx;
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		transition: border-color 0.3s;
	}

	.icon-message .message-bubble::after {
		content: '';
		width: 0;
		height: 0;
		border-left: 8rpx solid transparent;
		border-right: 8rpx solid transparent;
		border-top: 10rpx solid #999999;
		position: absolute;
		bottom: -10rpx;
		left: 8rpx;
		transition: border-top-color 0.3s;
	}

	.tabbar-icon.active .icon-message .message-bubble {
		border-color: #007AFF;
	}

	.tabbar-icon.active .icon-message .message-bubble::after {
		border-top-color: #007AFF;
	}

	.icon-message .message-dot1,
	.icon-message .message-dot2,
	.icon-message .message-dot3 {
		width: 6rpx;
		height: 6rpx;
		background-color: #999999;
		border-radius: 50%;
		position: absolute;
		top: 14rpx;
		transition: background-color 0.3s;
	}

	.icon-message .message-dot1 { left: 10rpx; }
	.icon-message .message-dot2 { left: 19rpx; }
	.icon-message .message-dot3 { left: 28rpx; }

	.tabbar-icon.active .icon-message .message-dot1,
	.tabbar-icon.active .icon-message .message-dot2,
	.tabbar-icon.active .icon-message .message-dot3 {
		background-color: #007AFF;
	}

	/* 我的图标 */
	.icon-user .user-head {
		width: 20rpx;
		height: 20rpx;
		border: 4rpx solid #999999;
		border-radius: 50%;
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		transition: border-color 0.3s;
	}

	.icon-user .user-body {
		width: 36rpx;
		height: 20rpx;
		border: 4rpx solid #999999;
		border-radius: 20rpx 20rpx 0 0;
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		transition: border-color 0.3s;
	}

	.tabbar-icon.active .icon-user .user-head,
	.tabbar-icon.active .icon-user .user-body {
		border-color: #007AFF;
	}

	.tabbar-text {
		font-size: 20rpx;
		color: #999999;
		transition: color 0.3s;
	}

	.tabbar-text.active {
		color: #007AFF;
		font-weight: 500;
	}
</style>

