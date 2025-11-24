<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">账号安全</text>
			<view class="navbar-right"></view>
		</view>

		<!-- 安全等级卡片 -->
		<view class="security-level-card">
			<view class="level-header">
				<view class="shield-icon">🛡️</view>
				<view class="level-info">
					<text class="level-title">安全等级</text>
					<text class="level-status">良好</text>
				</view>
				<view class="level-score">
					<text class="score-number">85</text>
					<text class="score-total">/100</text>
				</view>
			</view>
			<view class="progress-bar">
				<view class="progress-fill" :style="{width: '85%'}"></view>
			</view>
			<text class="level-tip">建议完善更多安全设置以提高账号安全性</text>
		</view>

		<!-- 账号信息 -->
		<view class="info-section">
			<text class="section-title">账号信息</text>
			<view class="info-list">
				<view class="info-item" @tap="handleItem('password')">
					<view class="info-icon password-icon"></view>
					<view class="info-content">
						<text class="info-label">登录密码</text>
						<text class="info-value">已设置</text>
					</view>
					<text class="info-arrow">〉</text>
				</view>
				
				<view class="info-item" @tap="handleItem('payment')">
					<view class="info-icon payment-icon"></view>
					<view class="info-content">
						<text class="info-label">支付密码</text>
						<text class="info-value">已设置</text>
					</view>
					<text class="info-arrow">〉</text>
				</view>
			</view>
		</view>

		<!-- 账号绑定 -->
		<view class="info-section">
			<text class="section-title">账号绑定</text>
			<view class="info-list">
				<view class="info-item" @tap="handleItem('alipay')">
					<view class="info-icon alipay-icon"></view>
					<view class="info-content">
						<text class="info-label">支付宝账号</text>
						<text class="info-value">未绑定</text>
					</view>
					<text class="info-arrow">〉</text>
				</view>
				
				<view class="info-item" @tap="handleItem('wechat')">
					<view class="info-icon wechat-icon"></view>
					<view class="info-content">
						<text class="info-label">微信账号</text>
						<text class="info-value">未绑定</text>
					</view>
					<text class="info-arrow">〉</text>
				</view>
			</view>
		</view>

		<!-- 退出登录按钮 -->
		<view class="logout-section">
			<button class="logout-btn" @tap="handleLogout">退出登录</button>
		</view>
	</view>
</template>

<script>
import { logout } from '../../utils/api.js';

export default {
	methods: {
		goBack() {
			const pages = getCurrentPages();
			if (pages.length > 1) {
				uni.navigateBack({ delta: 1 });
			} else {
				uni.reLaunch({ url: '/pages/index/index' });
			}
		},
		
		handleItem(type) {
			if (type === 'password') {
				// 跳转到修改登录密码页面
				uni.navigateTo({
					url: '/pages/security/password-edit'
				});
				return;
			}
			
			if (type === 'payment') {
				// 跳转到支付密码页面
				uni.navigateTo({
					url: '/pages/security/payment-password'
				});
				return;
			}
			
			if (type === 'alipay') {
				// 跳转到支付宝绑定页面
				uni.navigateTo({
					url: '/pages/security/alipay-bind'
				});
				return;
			}
			
			if (type === 'wechat') {
				// 跳转到微信绑定页面
				uni.navigateTo({
					url: '/pages/security/wechat-bind'
				});
				return;
			}
			
			// 其他功能暂未开发
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			});
		},
		
		async handleLogout() {
			uni.showModal({
				title: '确认退出',
				content: '退出后将无法接收订单通知，确认退出登录吗？',
				confirmColor: '#ff6b6b',
				success: async (res) => {
					if (res.confirm) {
						try {
							// 显示加载提示
							uni.showLoading({
								title: '退出中...',
								mask: true
							});
							
							// 调用退出登录API
							await logout();
							
							// 清除本地存储的用户信息
							uni.removeStorageSync('token');
							uni.removeStorageSync('userType');
							uni.removeStorageSync('identity');
							uni.removeStorageSync('identityKey');
							uni.removeStorageSync('userInfo');
							
							uni.hideLoading();
							
							// 显示退出成功提示
							uni.showToast({
								title: '已退出登录',
								icon: 'success',
								duration: 1500
							});
							
							// 跳转到登录页面
							setTimeout(() => {
								uni.reLaunch({
									url: '/pages/login/login'
								});
							}, 1500);
							
						} catch (error) {
							uni.hideLoading();
							console.error('退出登录失败:', error);
							
							// 即使API调用失败，也清除本地信息并跳转
							uni.removeStorageSync('token');
							uni.removeStorageSync('userType');
							uni.removeStorageSync('identity');
							uni.removeStorageSync('identityKey');
							uni.removeStorageSync('userInfo');
							
							uni.showToast({
								title: '已退出登录',
								icon: 'success',
								duration: 1500
							});
							
							setTimeout(() => {
								uni.reLaunch({
									url: '/pages/login/login'
								});
							}, 1500);
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
		padding-bottom: 40rpx;
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

	/* 安全等级卡片 */
	.security-level-card {
		margin: calc(160rpx + env(safe-area-inset-top) + 40rpx) 30rpx 30rpx 30rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.4);
	}

	.level-header {
		display: flex;
		align-items: center;
		margin-bottom: 24rpx;
	}

	.shield-icon {
		font-size: 64rpx;
		margin-right: 24rpx;
	}

	.level-info {
		flex: 1;
	}

	.level-title {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		display: block;
		margin-bottom: 6rpx;
	}

	.level-status {
		font-size: 40rpx;
		color: #fff;
		font-weight: bold;
		display: block;
	}

	.level-score {
		display: flex;
		align-items: baseline;
	}

	.score-number {
		font-size: 72rpx;
		color: #fff;
		font-weight: bold;
		line-height: 1;
	}

	.score-total {
		font-size: 32rpx;
		color: rgba(255, 255, 255, 0.8);
		margin-left: 4rpx;
	}

	.progress-bar {
		height: 12rpx;
		background-color: rgba(255, 255, 255, 0.3);
		border-radius: 6rpx;
		overflow: hidden;
		margin-bottom: 20rpx;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
		border-radius: 6rpx;
		transition: width 0.5s ease;
	}

	.level-tip {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.5;
	}

	/* 信息区域 */
	.info-section {
		margin-bottom: 30rpx;
	}

	.section-title {
		display: block;
		font-size: 28rpx;
		color: #999;
		margin: 0 30rpx 20rpx 30rpx;
		font-weight: 500;
	}

	.info-list {
		background-color: #fff;
		margin: 0 30rpx;
		border-radius: 16rpx;
		overflow: hidden;
	}

	.info-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		position: relative;
	}

	.info-item:last-child {
		border-bottom: none;
	}

	.info-item:active {
		background-color: #f8f8f8;
	}

	/* 图标样式 */
	.info-icon {
		width: 48rpx;
		height: 48rpx;
		border-radius: 8rpx;
		margin-right: 24rpx;
		flex-shrink: 0;
		position: relative;
		background-color: #f5f5f5;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.password-icon::before {
		content: '';
		position: absolute;
		width: 20rpx;
		height: 24rpx;
		border: 3rpx solid #000000;
		border-radius: 4rpx;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -35%);
	}

	.password-icon::after {
		content: '';
		position: absolute;
		width: 12rpx;
		height: 12rpx;
		border: 3rpx solid #000000;
		border-radius: 50%;
		border-bottom: none;
		top: 30%;
		left: 50%;
		transform: translate(-50%, -50%);
	}


	.payment-icon::before {
		content: '';
		position: absolute;
		width: 26rpx;
		height: 20rpx;
		border: 3rpx solid #000000;
		border-radius: 3rpx;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.payment-icon::after {
		content: '';
		position: absolute;
		width: 26rpx;
		height: 4rpx;
		background-color: #000000;
		top: 35%;
		left: 50%;
		transform: translateX(-50%);
	}

	.alipay-icon {
		background-color: #1677ff;
	}

	.alipay-icon::before {
		content: '';
		position: absolute;
		width: 24rpx;
		height: 24rpx;
		background-color: #ffffff;
		border-radius: 50%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.alipay-icon::after {
		content: '';
		position: absolute;
		width: 16rpx;
		height: 16rpx;
		border: 2rpx solid #1677ff;
		border-radius: 50%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.wechat-icon {
		background-color: #07c160;
	}

	.wechat-icon::before {
		content: '';
		position: absolute;
		width: 20rpx;
		height: 16rpx;
		background-color: #ffffff;
		border-radius: 10rpx 10rpx 4rpx 4rpx;
		top: 40%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.wechat-icon::after {
		content: '';
		position: absolute;
		width: 14rpx;
		height: 12rpx;
		background-color: #ffffff;
		border-radius: 7rpx 7rpx 3rpx 3rpx;
		top: 65%;
		left: 60%;
		transform: translate(-50%, -50%);
	}

	.info-content {
		flex: 1;
	}

	.info-label {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
		display: block;
		margin-bottom: 6rpx;
	}

	.info-value {
		font-size: 26rpx;
		color: #999;
		display: block;
	}

	.info-value.warning {
		color: #ff9500;
	}

	.recommend-badge {
		background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
		color: #fff;
		font-size: 20rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		margin-right: 12rpx;
		font-weight: 500;
	}

	.info-arrow {
		font-size: 40rpx;
		color: #d0d0d0;
		line-height: 1;
		margin-left: 12rpx;
	}

	/* 退出登录 */
	.logout-section {
		padding: 20rpx 30rpx 40rpx 30rpx;
	}

	.logout-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
		color: #fff;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 44rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.3);
	}

	.logout-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
	}
</style>

