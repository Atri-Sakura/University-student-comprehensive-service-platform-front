<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">隐私设置</text>
			<view class="navbar-right"></view>
		</view>
		
		<!-- 隐私设置说明 -->
		<view class="privacy-tip">
			<text class="tip-text">我们重视您的隐私安全，请根据需要调整以下设置</text>
		</view>
		
		<!-- 隐私设置列表 -->
		<view class="settings-section">
			<view class="settings-group">
				<text class="group-title">个人信息</text>
				
				<view class="setting-item">
					<view class="setting-left">
						<text class="setting-label">公开个人资料</text>
						<text class="setting-desc">允许其他用户查看您的基本信息</text>
					</view>
					<switch :checked="settings.publicProfile" @change="handleSwitch('publicProfile', $event)" color="#0984e3" />
				</view>
				
				<view class="setting-item">
					<view class="setting-left">
						<text class="setting-label">显示手机号</text>
						<text class="setting-desc">在订单中向客户显示您的手机号</text>
					</view>
					<switch :checked="settings.showPhone" @change="handleSwitch('showPhone', $event)" color="#0984e3" />
				</view>
			</view>
			
			<view class="settings-group">
				<text class="group-title">位置信息</text>
				
				<view class="setting-item">
					<view class="setting-left">
						<text class="setting-label">实时位置共享</text>
						<text class="setting-desc">在配送过程中与客户共享实时位置</text>
					</view>
					<switch :checked="settings.shareLocation" @change="handleSwitch('shareLocation', $event)" color="#0984e3" />
				</view>
				
				<view class="setting-item">
					<view class="setting-left">
						<text class="setting-label">位置历史记录</text>
						<text class="setting-desc">保存您的配送路线历史记录</text>
					</view>
					<switch :checked="settings.locationHistory" @change="handleSwitch('locationHistory', $event)" color="#0984e3" />
				</view>
			</view>
			
			<view class="settings-group">
				<text class="group-title">订单信息</text>
				
				<view class="setting-item">
					<view class="setting-left">
						<text class="setting-label">订单历史可见</text>
						<text class="setting-desc">允许平台查看您的历史订单</text>
					</view>
					<switch :checked="settings.orderHistory" @change="handleSwitch('orderHistory', $event)" color="#0984e3" />
				</view>
				
				<view class="setting-item">
					<view class="setting-left">
						<text class="setting-label">评价可见</text>
						<text class="setting-desc">允许其他用户查看您收到的评价</text>
					</view>
					<switch :checked="settings.showRating" @change="handleSwitch('showRating', $event)" color="#0984e3" />
				</view>
			</view>
			
			<view class="settings-group">
				<text class="group-title">通知设置</text>
				
				<view class="setting-item">
					<view class="setting-left">
						<text class="setting-label">推送通知</text>
						<text class="setting-desc">接收新订单和系统消息通知</text>
					</view>
					<switch :checked="settings.pushNotification" @change="handleSwitch('pushNotification', $event)" color="#0984e3" />
				</view>
				
				<view class="setting-item">
					<view class="setting-left">
						<text class="setting-label">营销信息</text>
						<text class="setting-desc">接收平台优惠和活动信息</text>
					</view>
					<switch :checked="settings.marketing" @change="handleSwitch('marketing', $event)" color="#0984e3" />
				</view>
			</view>
		</view>
		
		<!-- 隐私政策 -->
		<view class="policy-section">
			<text class="policy-link" @tap="viewPrivacyPolicy">查看隐私政策</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				settings: {
					publicProfile: true,
					showPhone: true,
					shareLocation: true,
					locationHistory: true,
					orderHistory: true,
					showRating: true,
					pushNotification: true,
					marketing: false
				}
			}
		},
		onLoad() {
			// 从本地存储加载设置
			const savedSettings = uni.getStorageSync('privacySettings');
			if (savedSettings) {
				this.settings = { ...this.settings, ...savedSettings };
			}
		},
		methods: {
			goBack() {
				const pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack({ delta: 1 });
				} else {
					uni.reLaunch({ url: '/pages/index/index' });
				}
			},
			handleSwitch(key, event) {
				this.settings[key] = event.detail.value;
				
				// 保存到本地存储
				uni.setStorageSync('privacySettings', this.settings);
				
				// 显示提示
				uni.showToast({
					title: event.detail.value ? '已开启' : '已关闭',
					icon: 'none',
					duration: 1500
				});
			},
			viewPrivacyPolicy() {
				uni.showModal({
					title: '隐私政策',
					content: '我们承诺保护您的个人隐私和数据安全。您的信息仅用于提供配送服务，不会泄露给第三方。',
					confirmText: '我知道了',
					showCancel: false
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
	
	/* 隐私说明 */
	.privacy-tip {
		margin-top: calc(160rpx + env(safe-area-inset-top));
		padding: 30rpx;
		background-color: #fff3cd;
		border-left: 4rpx solid #ffc107;
	}
	
	.tip-text {
		font-size: 28rpx;
		color: #856404;
		line-height: 1.6;
	}
	
	/* 设置组 */
	.settings-section {
		margin-top: 20rpx;
	}
	
	.settings-group {
		background-color: #ffffff;
		margin-bottom: 20rpx;
		padding: 0 30rpx;
	}
	
	.group-title {
		display: block;
		font-size: 28rpx;
		color: #999;
		padding: 30rpx 0 20rpx 0;
		font-weight: 500;
	}
	
	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.setting-item:last-child {
		border-bottom: none;
	}
	
	.setting-left {
		flex: 1;
		margin-right: 20rpx;
	}
	
	.setting-label {
		display: block;
		font-size: 32rpx;
		color: #333;
		margin-bottom: 8rpx;
		font-weight: 500;
	}
	
	.setting-desc {
		display: block;
		font-size: 26rpx;
		color: #999;
		line-height: 1.4;
	}
	
	/* 隐私政策 */
	.policy-section {
		padding: 40rpx 30rpx;
		text-align: center;
	}
	
	.policy-link {
		font-size: 28rpx;
		color: #0984e3;
		text-decoration: underline;
	}
</style>

