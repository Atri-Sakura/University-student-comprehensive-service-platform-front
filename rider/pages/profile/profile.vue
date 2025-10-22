<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">个人信息修改</text>
			<view class="navbar-right"></view>
		</view>
		
		<!-- 头像区域 -->
		<view class="avatar-section">
			<view class="avatar-container" @click="chooseAvatar">
				<image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
				<view class="avatar-overlay">
					<text class="camera-icon">📷</text>
				</view>
			</view>
			<text class="avatar-tip">点击更换头像</text>
		</view>
		
		<!-- 表单区域 -->
		<view class="form-section">
			<view class="form-item">
				<text class="form-label">姓名</text>
				<input class="form-input" v-model="userInfo.name" placeholder="请输入姓名" />
			</view>
			
			<view class="form-item">
				<text class="form-label">手机号</text>
				<input class="form-input" v-model="userInfo.phone" placeholder="请输入手机号" type="number" />
			</view>
			
			<view class="form-item">
				<text class="form-label">身份证号</text>
				<input class="form-input" v-model="userInfo.idCard" placeholder="请输入身份证号" />
			</view>
			
			<view class="form-item">
				<text class="form-label">现居住地址</text>
				<textarea class="form-textarea" v-model="userInfo.address" placeholder="请输入现居住地址" />
			</view>
		</view>
		
		<!-- 保存按钮 -->
		<view class="save-section">
			<button class="save-btn" @click="saveProfile">保存修改</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {
					avatar: '/static/logo.png',
					name: '蜂鸟骑士',
					phone: '138****8888',
					idCard: '320***********1234',
					address: '江苏省南京市鼓楼区中山路123号'
				}
			}
		},
		onLoad() {
			// 获取个人中心页面传递的用户信息
			const pages = getCurrentPages();
			const prevPage = pages[pages.length - 2];
			if (prevPage && prevPage.$vm && prevPage.$vm.userInfo) {
				this.userInfo.name = prevPage.$vm.userInfo.name;
				this.userInfo.avatar = prevPage.$vm.userInfo.avatar;
			}
		},
		onShow() {
			// 确保页面显示时返回按钮可以正常工作
		},
		methods: {
			goBack() {
				console.log('返回按钮被点击');
				// 显示反馈
				uni.showToast({
					title: '正在返回...',
					icon: 'none',
					duration: 500
				});
				
				setTimeout(() => {
					const pages = getCurrentPages();
					console.log('当前页面栈长度:', pages.length);
					
					if (pages.length > 1) {
						console.log('使用 navigateBack');
						uni.navigateBack({ 
							delta: 1,
							success: () => {
								console.log('返回成功');
							},
							fail: (err) => {
								console.log('返回失败:', err);
								// 失败时使用 reLaunch
								uni.reLaunch({ url: '/pages/index/index' });
							}
						});
					} else {
						console.log('使用 reLaunch');
						uni.reLaunch({ url: '/pages/index/index' });
					}
				}, 100);
			},
			chooseAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.userInfo.avatar = res.tempFilePaths[0];
					}
				});
			},
			saveProfile() {
				// 简单的表单验证
				if (!this.userInfo.name) {
					uni.showToast({
						title: '请输入姓名',
						icon: 'none'
					});
					return;
				}
				if (!this.userInfo.phone) {
					uni.showToast({
						title: '请输入手机号',
						icon: 'none'
					});
					return;
				}
				
				// 模拟保存
				uni.showLoading({
					title: '保存中...'
				});
				
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
					// 写入本地缓存，供个人中心读取
					try {
						uni.setStorageSync('userInfo', {
							name: this.userInfo.name,
							avatar: this.userInfo.avatar,
							phone: this.userInfo.phone,
							idCard: this.userInfo.idCard,
							address: this.userInfo.address
						});
					} catch (e) {}
					
					// 延迟返回
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				}, 1000);
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
	
	/* 头像区域 */
	.avatar-section {
		margin-top: calc(160rpx + env(safe-area-inset-top));
		padding: 60rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.avatar-container {
		position: relative;
		width: 160rpx;
		height: 160rpx;
		border-radius: 80rpx;
		overflow: hidden;
		border: 4rpx solid #f0f0f0;
	}
	
	.avatar {
		width: 100%;
		height: 100%;
	}
	
	.avatar-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: opacity 0.3s;
	}
	
	.avatar-container:active .avatar-overlay {
		opacity: 1;
	}
	
	.camera-icon {
		font-size: 48rpx;
		color: #fff;
	}
	
	.avatar-tip {
		font-size: 28rpx;
		color: #999;
		margin-top: 20rpx;
	}
	
	/* 表单区域 */
	.form-section {
		margin: 0 30rpx;
		padding: 0;
	}
	
	.form-item {
		margin-bottom: 40rpx;
		padding: 0;
	}
	
	.form-item:last-child {
		margin-bottom: 0;
	}
	
	.form-label {
		display: block;
		font-size: 32rpx;
		color: #333;
		margin-bottom: 10rpx;
		font-weight: 500;
	}
	
	.form-input {
		width: 100%;
		height: 60rpx;
		background-color: #f8f8f8;
		padding: 0 20rpx;
		font-size: 32rpx;
		color: #333;
		border: 2rpx solid #e0e0e0;
		border-radius: 8rpx;
		outline: none;
		box-sizing: border-box;
	}
	
	.form-input::placeholder {
		color: #999;
	}
	
	.form-textarea {
		width: 100%;
		min-height: 100rpx;
		background-color: #f8f8f8;
		padding: 20rpx;
		font-size: 32rpx;
		color: #333;
		border: 2rpx solid #e0e0e0;
		border-radius: 8rpx;
		outline: none;
		resize: none;
		box-sizing: border-box;
	}
	
	.form-textarea::placeholder {
		color: #999;
	}
	
	/* 保存按钮 */
	.save-section {
		padding: 0 30rpx 10rpx 30rpx;
		margin-top: 40rpx;
	}
	
	.save-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
		color: #fff;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 44rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(9, 132, 227, 0.3);
	}
	
	.save-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 12rpx rgba(9, 132, 227, 0.3);
	}
</style>
