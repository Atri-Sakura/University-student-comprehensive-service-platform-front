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

		<!-- 退出登录按钮 -->
		<view class="logout-section">
			<button class="logout-btn" @tap.stop="handleLogout">退出登录</button>
		</view>
	</view>
</template>

<script>
	import { getRiderBaseInfo, getRiderFullInfo } from '@/utils/api/index.js';
	import { logout } from '@/utils/api/auth.js';
	
	export default {
		data() {
			return {
				defaultUserInfo: {
					avatar: '/static/logo.png',
					name: '未认证',
					nickname: '未设置',
					phone: '未设置',
					riderId: '--',
					auditStatus: null,
					idCard: ''
				},
				userInfo: {
					avatar: '/static/logo.png',
					name: '未认证',
					nickname: '未设置',
					phone: '未设置',
					riderId: '--',
					auditStatus: null,
					idCard: ''
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
				// 与资质认证页面保持一致的逻辑
				// 1. 如果 idCard 为空，显示"待认证"
				if (!this.userInfo.idCard || this.userInfo.idCard.trim() === '') {
					return { text: '待认证', class: 'not-certified' };
				}
				
				// 2. idCard 不为空，根据 auditStatus 判断
				// auditStatus: 0-审核中, 1-已通过, 2-未通过
				const auditStatus = this.userInfo.auditStatus;
				switch (auditStatus) {
					case 0:
						return { text: '审核中', class: 'reviewing' };
					case 1:
						return { text: '已通过', class: 'certified' };
					case 2:
						return { text: '未通过', class: 'rejected' };
					default:
						// 有 idCard 但没有 auditStatus，说明已提交待审核
						return { text: '审核中', class: 'reviewing' };
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
					// 同时获取基本信息和完整信息
					const [baseResponse, fullResponse] = await Promise.all([
						getRiderBaseInfo(),
						getRiderFullInfo()
					]);
					
					if (baseResponse.code === 200 && baseResponse.data) {
						const baseData = baseResponse.data;
						const fullData = fullResponse.code === 200 ? fullResponse.data : {};
						
						// 映射后端数据到前端字段
						this.userInfo = {
							avatar: baseData.avatar || this.defaultUserInfo.avatar,
							name: baseData.realName || '未认证',
							nickname: baseData.nickname || '未设置',
							phone: baseData.phone || '未设置',
							riderId: baseData.riderBaseId || '--',
							accountStatus: baseData.accountStatus || 0,
							creditScore: baseData.creditScore || 0,
							createTime: baseData.createTime,
							// 从完整信息中获取认证相关字段
							idCard: fullData.idCard || '',
							auditStatus: fullData.auditStatus
						};
						
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
				uni.navigateTo({
					url: '/pages/certification/certification'
				});
			},
			navigateToNicknameEdit() {
				uni.navigateTo({
					url: '/pages/profile/nickname-edit'
				});
			},
			handleAvatarError() {
				this.userInfo.avatar = this.defaultUserInfo.avatar;
			},
			// 退出登录
			handleLogout() {
				uni.showModal({
					title: '提示',
					content: '确定要退出登录吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								// 调用后端退出接口
								await logout();
							} catch (error) {
								console.log('退出登录接口调用失败:', error);
							} finally {
								// 无论接口是否成功，都清除本地存储并跳转
								uni.removeStorageSync('token');
								uni.removeStorageSync('userType');
								uni.removeStorageSync('identity');
								uni.removeStorageSync('identityKey');
								uni.removeStorageSync('userInfo');
								uni.removeStorageSync('riderInfo');
								
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
		background-color: #52c41a;
	}
	
	.certification-badge.not-certified {
		background-color: #999999;
	}
	
	.certification-badge.reviewing {
		background-color: #fa8c16;
	}
	
	.certification-badge.rejected {
		background-color: #ff4d4f;
	}

	/* 退出登录区域 */
	.logout-section {
		margin-top: 60rpx;
		padding: 0 30rpx;
	}

	.logout-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #ffffff;
		color: #ff4d4f;
		font-size: 32rpx;
		font-weight: 500;
		border: 1rpx solid #ff4d4f;
		border-radius: 12rpx;
	}

	.logout-btn::after {
		border: none;
	}
</style>
