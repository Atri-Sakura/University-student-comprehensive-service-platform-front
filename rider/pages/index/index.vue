<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<text class="navbar-title">个人中心</text>
		</view>
		
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-info">
				<image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
				<view class="user-detail">
					<text class="username">{{ userInfo.name }}</text>
					<view class="rating">
						<text class="star">⭐</text>
						<text class="score">{{ userInfo.rating }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 数据统计卡片 -->
		<view class="stats-card">
			<view class="stat-item" @click="goToOrders">
				<text class="stat-number">15</text>
				<text class="stat-label">今日完成</text>
				<view class="stat-link">
					<text>我的订单</text>
					<text class="arrow">〉</text>
				</view>
			</view>
			<view class="divider"></view>
			<view class="stat-item" @click="goToWallet">
				<text class="stat-number">256.80</text>
				<text class="stat-label">今日收入</text>
				<view class="stat-link">
					<text>我的钱包</text>
					<text class="arrow">〉</text>
				</view>
			</view>
		</view>

		<!-- 我的服务 -->
		<view class="service-section">
			<text class="section-title">我的服务</text>
			
			<view class="service-grid">
				<view class="service-item" @click="handleService('profile')">
					<view class="service-icon">✏️</view>
					<text class="service-text">个人信息\n修改</text>
				</view>
				<view class="service-item" @click="handleService('security')">
					<view class="service-icon">🛡️</view>
					<text class="service-text">账号安全</text>
				</view>
				<view class="service-item" @click="handleService('privacy')">
					<view class="service-icon">🕵️</view>
					<text class="service-text">隐私设置</text>
				</view>
				<view class="service-item" @click="handleService('certificate')">
					<view class="service-icon">📇</view>
					<text class="service-text">资质认证</text>
				</view>
			</view>

			<view class="service-grid">
				<view class="service-item" @click="handleService('rating')">
					<view class="service-icon">⭐</view>
					<text class="service-text">服务评价</text>
				</view>
				<view class="service-item" @click="handleService('support')">
					<view class="service-icon">🎧</view>
					<text class="service-text">在线客服</text>
				</view>
				<view class="service-item" @click="handleService('faq')">
					<view class="service-icon">❓</view>
					<text class="service-text">常见问题</text>
				</view>
				<view class="service-item" @click="handleService('violation')">
					<view class="service-icon">⚠️</view>
					<text class="service-text">违规申诉</text>
				</view>
			</view>
		</view>
		
		<tabbar :current="3"></tabbar>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {
					name: '蜂鸟骑士',
					rating: 4.8,
					todayOrders: 15,
					todayIncome: 256.80,
					avatar: '/static/logo.png'
				}
			}
		},
		onLoad() {
			// 从本地缓存恢复用户信息（若有）
			try {
				const saved = uni.getStorageSync('userInfo');
				if (saved && typeof saved === 'object') {
					this.userInfo = { ...this.userInfo, ...saved };
				}
			} catch (e) {}
		},
		onShow() {
			// 返回时再同步一次，保证个人中心显示最新数据
			try {
				const saved = uni.getStorageSync('userInfo');
				if (saved && typeof saved === 'object') {
					this.userInfo = { ...this.userInfo, ...saved };
				}
			} catch (e) {}
		},
		methods: {
			goToOrders() {
				uni.navigateTo({ url: '/pages/orders/orders' });
			},
			goToWallet() {
				uni.navigateTo({ url: '/pages/wallet/wallet' });
			},
		handleService(type) {
			if (type === 'profile') {
				uni.navigateTo({ url: '/pages/profile/profile' });
				return;
			}
			if (type === 'security') {
				uni.navigateTo({ url: '/pages/security/security' });
				return;
			}
			if (type === 'privacy') {
				uni.navigateTo({ url: '/pages/privacy/privacy' });
				return;
			}
			if (type === 'certificate') {
				uni.navigateTo({ url: '/pages/certification/certification' });
				return;
			}
			if (type === 'faq') {
				uni.navigateTo({ url: '/pages/faq/faq' });
				return;
			}
			if (type === 'violation') {
				uni.navigateTo({ url: '/pages/violation/violation' });
				return;
			}
			if (type === 'rating') {
				uni.navigateTo({ url: '/pages/rating/rating' });
				return;
			}
			const serviceNames = {
				support: '在线客服'
			};
		}
		}
	}
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx;
		padding-top: 0;
	}
	
	/* 自定义导航栏 */
	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #ffffff;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-top: env(safe-area-inset-top);
		padding-bottom: 16rpx;
		z-index: 999;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.navbar-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	/* 用户信息卡片 */
	.user-card {
		background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
		margin: 30rpx;
		margin-top: calc(100rpx + env(safe-area-inset-top) + 40rpx);
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(9, 132, 227, 0.3);
	}

	.user-info {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
		background-color: #fff;
		border: 4rpx solid rgba(255, 255, 255, 0.5);
	}

	.user-detail {
		margin-left: 30rpx;
		flex: 1;
	}

	.username {
		font-size: 44rpx;
		color: #fff;
		font-weight: bold;
		display: block;
		margin-bottom: 10rpx;
	}

	.rating {
		display: flex;
		align-items: center;
	}

	.star {
		font-size: 36rpx;
		margin-right: 8rpx;
	}

	.score {
		font-size: 36rpx;
		color: #fff;
		font-weight: bold;
	}

	/* 数据统计卡片 */
	.stats-card {
		background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
		margin: 60rpx 30rpx;
		border-radius: 24rpx;
		padding: 40rpx;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 0 8rpx 24rpx rgba(9, 132, 227, 0.3);
	}

	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-number {
		font-size: 60rpx;
		color: #fff;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.stat-label {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 20rpx;
	}

	.stat-link {
		display: flex;
		align-items: center;
		color: #fff;
		font-size: 26rpx;
	}

	.arrow {
		margin-left: 8rpx;
		font-size: 24rpx;
	}

	.divider {
		width: 2rpx;
		height: 120rpx;
		background-color: rgba(255, 255, 255, 0.3);
	}

	/* 我的服务 */
	.service-section {
		background-color: #fff;
		margin: 60rpx 30rpx 30rpx 30rpx;
		border-radius: 24rpx;
		padding: 40rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		display: block;
	}

	.service-grid {
		display: flex;
		justify-content: space-between;
		margin-bottom: 50rpx;
	}

	.service-grid:last-child {
		margin-bottom: 0;
	}

	.service-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
	}

	.service-icon {
		width: 88rpx;
		height: 88rpx;
		background-color: #f0f0f0;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 44rpx;
		margin-bottom: 16rpx;
	}

	.service-text {
		font-size: 24rpx;
		color: #666;
		text-align: center;
		line-height: 1.4;
	}
</style>
