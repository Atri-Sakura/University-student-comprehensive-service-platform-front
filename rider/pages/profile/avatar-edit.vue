<template>
	<view class="page">
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">修改头像</text>
			<text class="nav-placeholder"></text>
		</view>

		<view class="content">
			<image class="avatar-preview" :src="previewAvatar" mode="aspectFill"></image>
			<button class="choose-btn" @tap="handleChooseImage">从相册选择</button>
			<text class="tip">支持 jpg、png，建议尺寸 200×200 像素以上</text>
		</view>

		<view class="bottom-bar">
			<button class="save-btn" @tap="handleSave" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				previewAvatar: '/static/logo.png',
				originalAvatar: '/static/logo.png',
				saving: false
			}
		},
		onLoad() {
			this.loadUserInfo();
		},
		methods: {
			loadUserInfo() {
				try {
					const storedInfo = uni.getStorageSync('userInfo');
					if (storedInfo && storedInfo.avatar) {
						this.previewAvatar = storedInfo.avatar;
						this.originalAvatar = storedInfo.avatar;
					}
				} catch (e) {
					console.log('加载头像失败:', e);
				}
			},
			goBack() {
				uni.navigateBack({ delta: 1 });
			},
			handleChooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed', 'original'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						if (res.tempFilePaths && res.tempFilePaths.length > 0) {
							this.previewAvatar = res.tempFilePaths[0];
						}
					}
				});
			},
			handleSave() {
				if (this.previewAvatar === this.originalAvatar) {
					uni.showToast({
						title: '头像未变化',
						icon: 'none'
					});
					return;
				}
				this.saving = true;
				setTimeout(() => {
					try {
						const stored = uni.getStorageSync('userInfo') || {};
						uni.setStorageSync('userInfo', { ...stored, avatar: this.previewAvatar });
						uni.showToast({ title: '保存成功', icon: 'success' });
						this.originalAvatar = this.previewAvatar;
						setTimeout(() => {
							this.goBack();
						}, 500);
					} catch (err) {
						uni.showToast({
							title: '保存失败',
							icon: 'none'
						});
						console.log('保存头像失败:', err);
					} finally {
						this.saving = false;
					}
				}, 300);
			}
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background-color: #f7f7f7;
		padding-top: calc(112rpx + env(safe-area-inset-top));
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
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

	.nav-placeholder {
		width: 48rpx;
		height: 48rpx;
	}

	.content {
		padding: 120rpx 40rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.avatar-preview {
		width: 240rpx;
		height: 240rpx;
		border-radius: 50%;
		background-color: #ffffff;
		border: 2rpx solid #e6e6e6;
	}

	.choose-btn {
		margin-top: 40rpx;
		width: 320rpx;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 40rpx;
		background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
		color: #ffffff;
		font-size: 30rpx;
	}

	.tip {
		margin-top: 20rpx;
		font-size: 26rpx;
		color: #999999;
	}

	.bottom-bar {
		padding: 40rpx;
	}

	.save-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #007aff;
		color: #ffffff;
		font-size: 32rpx;
		border-radius: 44rpx;
	}
</style>

