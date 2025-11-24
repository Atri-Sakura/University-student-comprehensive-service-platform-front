<template>
	<view class="page">
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">验证支付密码</text>
			<text class="nav-placeholder"></text>
		</view>

		<view class="content">
			<!-- 提示信息 -->
			<view class="info-section">
				<text class="info-icon">🔐</text>
				<text class="info-title">请输入当前支付密码</text>
				<text class="info-desc">验证成功后可修改支付密码</text>
			</view>

			<!-- 密码输入区域 -->
			<view class="password-section">
				<text class="password-label">支付密码</text>
				<view class="password-input-container">
					<view 
						class="password-dot" 
						v-for="(item, index) in 6" 
						:key="index"
						:class="{ 'filled': currentPassword.length > index }"
					>
						<text class="dot" v-if="currentPassword.length > index">●</text>
					</view>
				</view>
			</view>

			<!-- 虚拟键盘 -->
			<view class="keyboard-section">
				<view class="keyboard-row" v-for="(row, rowIndex) in keyboard" :key="rowIndex">
					<view 
						class="keyboard-key" 
						v-for="(key, keyIndex) in row" 
						:key="keyIndex"
						:class="{ 'key-delete': key === 'delete', 'key-empty': key === '' }"
						@tap="handleKeyPress(key)"
					>
						<text v-if="key === 'delete'" class="key-text">⌫</text>
						<text v-else-if="key !== ''" class="key-text">{{ key }}</text>
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
			currentPassword: '',
			keyboard: [
				['1', '2', '3'],
				['4', '5', '6'],
				['7', '8', '9'],
				['', '0', 'delete']
			],
			verifying: false
		}
	},
	
	watch: {
		currentPassword(newVal) {
			// 当输入6位密码时自动验证
			if (newVal.length === 6) {
				this.verifyPassword();
			}
		}
	},
	
	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 });
		},
		
		handleKeyPress(key) {
			if (this.verifying) return;
			
			if (key === 'delete') {
				// 删除最后一位
				this.currentPassword = this.currentPassword.slice(0, -1);
			} else if (key !== '' && this.currentPassword.length < 6) {
				// 添加数字
				this.currentPassword += key;
			}
		},
		
		async verifyPassword() {
			if (this.verifying) return;
			
			this.verifying = true;
			
			try {
				uni.showLoading({
					title: '验证中...',
					mask: true
				});
				
				// TODO: 调用后端API验证支付密码
				// 暂时模拟验证，等待后端提供验证接口
				// 实际应该调用类似: POST /api/rider/pay/password/verify
				await new Promise(resolve => setTimeout(resolve, 800));
				
				// 模拟验证成功（实际应该根据后端返回结果）
				const isValid = true;
				
				uni.hideLoading();
				
				if (isValid) {
					// 将原密码临时存储（实际项目中建议使用更安全的方式）
					uni.setStorageSync('temp_old_pay_password', this.currentPassword);
					
					uni.showToast({
						title: '验证成功',
						icon: 'success',
						duration: 1500
					});
					
					// 验证成功，跳转到修改支付密码页面
					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/security/change-payment-password'
						});
					}, 1500);
				} else {
					uni.showToast({
						title: '支付密码错误',
						icon: 'none',
						duration: 2000
					});
					this.currentPassword = '';
				}
			} catch (error) {
				uni.hideLoading();
				console.error('验证支付密码失败:', error);
				uni.showToast({
					title: '验证失败，请重试',
					icon: 'none',
					duration: 2000
				});
				this.currentPassword = '';
			} finally {
				this.verifying = false;
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
		padding: 60rpx 40rpx;
	}

	/* 提示信息 */
	.info-section {
		text-align: center;
		margin-bottom: 80rpx;
	}

	.info-icon {
		font-size: 100rpx;
		display: block;
		margin-bottom: 30rpx;
	}

	.info-title {
		display: block;
		font-size: 36rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 20rpx;
	}

	.info-desc {
		display: block;
		font-size: 28rpx;
		color: #999999;
	}

	/* 密码输入区域 */
	.password-section {
		margin-bottom: 80rpx;
	}

	.password-label {
		display: block;
		font-size: 30rpx;
		color: #333333;
		font-weight: 500;
		margin-bottom: 30rpx;
		text-align: center;
	}

	.password-input-container {
		display: flex;
		justify-content: center;
		gap: 20rpx;
	}

	.password-dot {
		width: 80rpx;
		height: 80rpx;
		border: 2rpx solid #e0e0e0;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #ffffff;
		transition: all 0.3s;
	}

	.password-dot.filled {
		border-color: #007aff;
		background-color: #f0f8ff;
	}

	.dot {
		font-size: 48rpx;
		color: #007aff;
	}

	/* 虚拟键盘 */
	.keyboard-section {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.05);
	}

	.keyboard-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.keyboard-row:last-child {
		margin-bottom: 0;
	}

	.keyboard-key {
		flex: 1;
		height: 100rpx;
		margin: 0 10rpx;
		background-color: #f5f5f5;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.keyboard-key:active {
		background-color: #e0e0e0;
		transform: scale(0.95);
	}

	.keyboard-key.key-empty {
		background-color: transparent;
		cursor: default;
	}

	.keyboard-key.key-delete {
		background-color: #fff3f3;
	}

	.keyboard-key.key-delete:active {
		background-color: #ffe0e0;
	}

	.key-text {
		font-size: 44rpx;
		font-weight: 500;
		color: #333333;
	}
</style>
