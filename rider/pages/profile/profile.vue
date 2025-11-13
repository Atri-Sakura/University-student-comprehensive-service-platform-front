<template>
	<view class="page">
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">个人信息</text>
			<text class="nav-placeholder"></text>
		</view>

		<view class="info-item avatar-item" @tap.stop="navigateToAvatarUpload">
			<text class="info-label">头像</text>
			<view class="avatar-right">
				<image class="avatar" :src="avatarSrc" mode="aspectFill" @error="handleAvatarError"></image>
				<text class="arrow-icon">›</text>
			</view>
		</view>

		<view class="info-item" @tap.stop="navigateToCertification">
			<text class="info-label">实名认证</text>
			<view class="info-right">
				<text class="info-value name">{{ userInfo.name }}</text>
				<text class="certification-badge" :class="certificationStatus.class">{{ certificationStatus.text }}</text>
				<text class="arrow-icon">›</text>
			</view>
		</view>

		<view class="info-item" @tap.stop="navigateToNicknameEdit">
			<text class="info-label">昵称</text>
			<view class="info-right">
				<text class="info-value gray">{{ userInfo.nickname }}</text>
				<text class="arrow-icon">›</text>
			</view>
		</view>

		<view class="info-item">
			<text class="info-label">ID</text>
			<text class="info-value gray">{{ userInfo.riderId }}</text>
		</view>

		<view class="info-item" @tap.stop="navigateToPhoneEdit">
			<text class="info-label">手机号</text>
			<view class="info-right">
				<text class="info-value gray">{{ displayPhone }}</text>
				<text class="arrow-icon">›</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { getRiderBaseInfo } from '@/utils/profile-api.js';
	
	export default {
		data() {
			return {
				defaultUserInfo: {
					avatar: '/static/logo.png',
					name: '未认证',
					nickname: '未设置',
					phone: '未设置',
					riderId: '--',
					auditStatus: 'pending'
				},
				userInfo: {
					avatar: '/static/logo.png',
					name: '未认证',
					nickname: '未设置',
					phone: '未设置',
					riderId: '--',
					auditStatus: 'pending' // 'pending', 'passed', 'failed'
				},
				loading: false
			}
		},
		computed: {
			avatarSrc() {
				return this.userInfo.avatar || this.defaultUserInfo.avatar;
			},
			displayPhone() {
				const phone = this.userInfo.phone || '';
				if (phone.includes('*')) {
					return phone;
				}
				if (/^1[3-9]\d{9}$/.test(phone)) {
					return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
				}
				return phone || '未设置';
			},
			certificationStatus() {
				// 根据 accountStatus 判断认证状态
				if (this.userInfo.accountStatus === 1) {
					return { text: '已认证', class: 'certified' };
				} else {
					return { text: '未认证', class: 'not-certified' };
				}
			}
		},
		onLoad() {
			this.refreshUserInfo();
		},
		onShow() {
			this.refreshUserInfo();
		},
		methods: {
			// 从后端获取骑手信息
			async refreshUserInfo() {
				if (this.loading) return;
				
				this.loading = true;
				try {
					const response = await getRiderBaseInfo();
					
					if (response.code === 200 && response.data) {
						const data = response.data;
						console.log('🔄 获取到的后端数据:', data);
						
						// 映射后端数据到前端字段
						this.userInfo = {
							avatar: data.avatar || this.defaultUserInfo.avatar,
							name: data.realName || '未认证',
							nickname: data.nickname || '未设置',
							phone: data.phone || '未设置',
							riderId: data.riderBaseId || '--',
							accountStatus: data.accountStatus || 0,
							creditScore: data.creditScore || 0,
							createTime: data.createTime
						};
						
						console.log('📱 更新后的用户信息:', this.userInfo);
						
						// 同时保存到本地存储作为缓存
						uni.setStorageSync('riderInfo', this.userInfo);
					} else {
						// 如果接口失败，尝试从本地缓存获取
						this.loadFromCache();
					}
				} catch (error) {
					console.error('获取骑手信息失败:', error);
					
					// 网络错误时从本地缓存获取
					this.loadFromCache();
					
					uni.showToast({
						title: '获取信息失败',
						icon: 'none',
						duration: 2000
					});
				} finally {
					this.loading = false;
				}
			},
			
			// 从本地缓存加载数据
			loadFromCache() {
				try {
					const cachedInfo = uni.getStorageSync('riderInfo');
					if (cachedInfo) {
						this.userInfo = { ...this.defaultUserInfo, ...cachedInfo };
					} else {
						this.userInfo = { ...this.defaultUserInfo };
					}
				} catch (e) {
					console.log('获取缓存信息失败:', e);
					this.userInfo = { ...this.defaultUserInfo };
				}
			},
			goBack() {
				const pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack({ delta: 1 });
				} else {
					uni.reLaunch({ url: '/pages/index/index' });
				}
			},
			navigateToAvatarUpload() {
				uni.navigateTo({
					url: '/pages/profile/avatar-edit'
				});
			},
			navigateToPhoneEdit() {
				uni.navigateTo({
					url: '/pages/profile/phone-edit'
				});
			},
			navigateToCertification() {
				uni.showToast({
					title: '查看实名认证',
					icon: 'none'
				});
			},
			navigateToNicknameEdit() {
				uni.navigateTo({
					url: '/pages/profile/nickname-edit'
				});
			},
			handleAvatarError() {
				this.userInfo.avatar = this.defaultUserInfo.avatar;
			}
		}
	}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background-color: #ffffff;
		padding-top: calc(112rpx + env(safe-area-inset-top));
		box-sizing: border-box;
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

	.info-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 34rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.info-label {
		font-size: 32rpx;
		color: #333333;
		font-weight: 500;
	}

	.info-right,
	.avatar-right {
		display: flex;
		align-items: center;
	}

	.info-value {
		font-size: 32rpx;
		color: #333333;
	}

	.info-value.gray {
		color: #999999;
	}

	.info-value.name {
		color: #666666;
	}

	.arrow-icon {
		font-size: 32rpx;
		color: #c7c7cc;
		margin-left: 18rpx;
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-left: 20rpx;
	}

	.audit-status {
		color: #ff6400;
		font-size: 28rpx;
		margin-right: 14rpx;
	}

	.certification-badge {
		display: inline-block;
		padding: 6rpx 20rpx;
		color: #ffffff;
		font-size: 24rpx;
		border-radius: 8rpx;
		margin: 0 16rpx;
	}
	
	.certification-badge.certified {
		background-color: #007aff;
	}
	
	.certification-badge.not-certified {
		background-color: #ff6400;
	}
</style>
