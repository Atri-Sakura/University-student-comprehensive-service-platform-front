<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">资质认证</text>
			<view class="navbar-right"></view>
		</view>

		<!-- 认证状态 -->
		<view class="status-card">
			<view class="card-header">
				<view class="status-icon">
					<text class="icon-text">🆔</text>
				</view>
				<text class="card-title">认证状态</text>
			</view>
			<view class="status-info">
				<text class="status-label">当前状态:</text>
				<text class="status-value reviewing">审核中</text>
			</view>
		</view>

		<!-- 认证流程 -->
		<view class="process-card">
			<text class="card-title">认证流程</text>
			<view class="process-steps">
				<view class="step-item">
					<view class="step-number completed">1</view>
					<view class="step-content">
						<text class="step-title">身份信息验证</text>
						<text class="step-desc">上传身份证正反面照片进行实名认证</text>
					</view>
					<text class="step-status completed">已完成</text>
				</view>
				
				<view class="step-line"></view>
				
				<view class="step-item">
					<view class="step-number current">2</view>
					<view class="step-content">
						<text class="step-title">认证完成</text>
						<text class="step-desc">审核通过后即可获得认证标识</text>
					</view>
					<text class="step-status reviewing">审核中</text>
				</view>
			</view>
		</view>

		<!-- 上传材料 -->
		<view class="upload-card">
			<text class="card-title">上传材料</text>
			
			<view class="upload-section">
				<text class="upload-title">身份证正面</text>
				<text class="upload-desc">请上传清晰的身份证正面照片</text>
				<view class="upload-area" @tap="uploadIdCard('front')">
					<image v-if="idCardFront" :src="idCardFront" class="uploaded-image" mode="aspectFit"></image>
					<view v-else class="upload-placeholder">
						<text class="upload-icon">📤</text>
						<text class="upload-text">上传文件</text>
					</view>
				</view>
			</view>
			
			<view class="upload-section">
				<text class="upload-title">身份证反面</text>
				<text class="upload-desc">请上传清晰的身份证反面照片</text>
				<view class="upload-area" @tap="uploadIdCard('back')">
					<image v-if="idCardBack" :src="idCardBack" class="uploaded-image" mode="aspectFit"></image>
					<view v-else class="upload-placeholder">
						<text class="upload-icon">📤</text>
						<text class="upload-text">上传文件</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				idCardFront: '',
				idCardBack: ''
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
			uploadIdCard(type) {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						if (type === 'front') {
							this.idCardFront = res.tempFilePaths[0];
						} else {
							this.idCardBack = res.tempFilePaths[0];
						}
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						});
					},
					fail: () => {
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
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

	/* 卡片通用样式 */
	.status-card,
	.process-card,
	.upload-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		margin: 20rpx 30rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.status-card {
		margin-top: calc(160rpx + env(safe-area-inset-top) + 20rpx);
	}

	.card-title {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
		display: block;
		margin-bottom: 20rpx;
	}

	/* 认证状态 */
	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.status-icon {
		width: 48rpx;
		height: 48rpx;
		background-color: #1890ff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16rpx;
	}

	.icon-text {
		font-size: 24rpx;
		color: #ffffff;
	}

	.status-info {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.status-label {
		font-size: 28rpx;
		color: #666;
	}

	.status-value {
		font-size: 28rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-weight: 500;
	}

	.status-value.reviewing {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	/* 认证流程 */
	.process-steps {
		margin-top: 20rpx;
	}

	.step-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.step-number {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: bold;
		color: #ffffff;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.step-number.completed {
		background-color: #52c41a;
	}

	.step-number.current {
		background-color: #1890ff;
	}

	.step-content {
		flex: 1;
		margin-right: 20rpx;
	}

	.step-title {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		display: block;
		margin-bottom: 8rpx;
	}

	.step-desc {
		font-size: 26rpx;
		color: #666;
		display: block;
		line-height: 1.4;
	}

	.step-status {
		font-size: 24rpx;
		padding: 6rpx 12rpx;
		border-radius: 20rpx;
		font-weight: 500;
	}

	.step-status.completed {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.step-status.reviewing {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.step-line {
		width: 2rpx;
		height: 40rpx;
		background-color: #e0e0e0;
		margin-left: 23rpx;
		margin-bottom: 20rpx;
	}

	/* 上传材料 */
	.upload-section {
		margin-bottom: 40rpx;
	}

	.upload-section:last-child {
		margin-bottom: 0;
	}

	.upload-title {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		display: block;
		margin-bottom: 8rpx;
	}

	.upload-desc {
		font-size: 26rpx;
		color: #666;
		display: block;
		margin-bottom: 20rpx;
	}

	.upload-area {
		width: 100%;
		height: 200rpx;
		border: 2rpx dashed #d9d9d9;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
		position: relative;
		overflow: hidden;
	}

	.upload-area:active {
		border-color: #1890ff;
		background-color: #f0f8ff;
	}

	.upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}

	.upload-icon {
		font-size: 48rpx;
		color: #1890ff;
	}

	.upload-text {
		font-size: 28rpx;
		color: #1890ff;
		font-weight: 500;
	}

	.uploaded-image {
		width: 100%;
		height: 100%;
		border-radius: 10rpx;
	}
</style>
