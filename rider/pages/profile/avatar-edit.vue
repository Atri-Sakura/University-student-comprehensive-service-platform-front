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
	import { updateRiderBaseInfo } from '@/utils/profile-api.js';
	
	export default {
		data() {
			return {
				previewAvatar: '/static/logo.png',
				originalAvatar: '/static/logo.png',
				selectedImagePath: '', // 新选择的图片路径
				saving: false
			}
		},
		onLoad() {
			this.loadUserInfo();
		},
		methods: {
			loadUserInfo() {
				try {
					// 从本地缓存获取骑手信息
					const riderInfo = uni.getStorageSync('riderInfo');
					if (riderInfo && riderInfo.avatar) {
						this.previewAvatar = riderInfo.avatar;
						this.originalAvatar = riderInfo.avatar;
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
					sizeType: ['compressed'], // 优先使用压缩图片
					sourceType: ['album', 'camera'],
					success: (res) => {
						if (res.tempFilePaths && res.tempFilePaths.length > 0) {
							this.selectedImagePath = res.tempFilePaths[0];
							this.previewAvatar = res.tempFilePaths[0];
							console.log('已选择头像:', this.selectedImagePath);
						}
					},
					fail: (error) => {
						console.error('选择图片失败:', error);
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						});
					}
				});
			},
			async handleSave() {
				// 检查是否选择了新头像
				if (!this.selectedImagePath) {
					uni.showToast({
						title: '请先选择头像',
						icon: 'none'
					});
					return;
				}
				
				if (this.saving) return;
				
				this.saving = true;
				
				try {
					// 使用 API 上传头像
					const response = await updateRiderBaseInfo({
						avatarPath: this.selectedImagePath
					});
					
					if (response.code === 200) {
						// 上传成功，更新本地缓存
						try {
							const riderInfo = uni.getStorageSync('riderInfo') || {};
							// 如果后端返回了新的头像 URL，使用后端返回的，否则使用本地路径
							const newAvatar = response.data?.avatar || this.selectedImagePath;
							riderInfo.avatar = newAvatar;
							uni.setStorageSync('riderInfo', riderInfo);
							
							this.originalAvatar = newAvatar;
						} catch (storageError) {
							console.error('更新本地缓存失败:', storageError);
						}
						
						// 显示成功提示并返回
						uni.showToast({
							title: '修改成功',
							icon: 'success',
							duration: 1500
						});
						
						setTimeout(() => {
							// 通知上一页刷新数据
							const pages = getCurrentPages();
							if (pages.length > 1) {
								const prevPage = pages[pages.length - 2];
								if (prevPage && prevPage.$vm && prevPage.$vm.refreshUserInfo) {
									prevPage.$vm.refreshUserInfo();
								}
							}
							this.goBack();
						}, 1500);
					} else {
						// 后端返回错误
						uni.showToast({
							title: response.msg || '上传失败',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					console.error('上传头像失败:', error);
					uni.showToast({
						title: '上传失败，请重试',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.saving = false;
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

