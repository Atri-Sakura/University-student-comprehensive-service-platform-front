<template>
	<view class="page">
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">修改昵称</text>
			<text class="nav-placeholder"></text>
		</view>

		<view class="content">
			<text class="label">昵称</text>
			<input class="input" v-model="nickname" maxlength="12" placeholder="请输入昵称" placeholder-class="placeholder" />
			<text class="hint">昵称支持中英文、数字，最多 12 个字符</text>
		</view>

		<view class="bottom-bar">
			<button class="save-btn" @tap="handleSave" :disabled="saving || nickname.trim() === ''">{{ saving ? '保存中...' : '保存' }}</button>
		</view>
	</view>
</template>

<script>
	import { updateRiderBaseInfo } from '@/utils/profile-api.js';
	
	export default {
		data() {
			return {
				nickname: '',
				originalNickname: '',
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
					if (riderInfo && riderInfo.nickname) {
						this.nickname = riderInfo.nickname;
						this.originalNickname = riderInfo.nickname;
					}
				} catch (err) {
					console.log('加载昵称失败:', err);
				}
			},
			goBack() {
				uni.navigateBack({ delta: 1 });
			},
			async handleSave() {
				const trimmed = this.nickname.trim();
				
				// 验证昵称
				if (trimmed.length === 0) {
					uni.showToast({ title: '昵称不能为空', icon: 'none' });
					return;
				}
				
				if (trimmed.length > 12) {
					uni.showToast({ title: '昵称不能超过12个字符', icon: 'none' });
					return;
				}
				
				if (trimmed === this.originalNickname) {
					uni.showToast({ title: '昵称未变化', icon: 'none' });
					return;
				}
				
				if (this.saving) return;
				
				this.saving = true;
				
				try {
					// 使用 API 修改昵称
					const response = await updateRiderBaseInfo({
						nickname: trimmed
					});
					
					if (response.code === 200) {
						// 修改成功，更新本地缓存
						try {
							const riderInfo = uni.getStorageSync('riderInfo') || {};
							riderInfo.nickname = trimmed;
							uni.setStorageSync('riderInfo', riderInfo);
							
							this.originalNickname = trimmed;
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
							title: response.msg || '修改失败',
							icon: 'none',
							duration: 2000
						});
					}
				} catch (error) {
					console.error('修改昵称失败:', error);
					uni.showToast({
						title: '修改失败，请重试',
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
		margin: 140rpx 0 0;
		padding: 0 40rpx;
		background-color: #ffffff;
	}

	.label {
		display: block;
		padding-top: 32rpx;
		font-size: 30rpx;
		color: #333333;
	}

	.input {
		margin-top: 16rpx;
		padding: 0 20rpx;
		height: 90rpx;
		line-height: 90rpx;
		border-radius: 12rpx;
		background-color: #f5f5f5;
		font-size: 32rpx;
		color: #333333;
	}

	.placeholder {
		color: #bfbfbf;
		font-size: 30rpx;
	}

	.hint {
		display: block;
		padding: 20rpx 0 32rpx;
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

