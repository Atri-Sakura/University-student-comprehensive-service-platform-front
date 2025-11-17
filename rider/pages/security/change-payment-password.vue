<template>
	<view class="page">
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">修改支付密码</text>
			<text class="nav-placeholder"></text>
		</view>

		<view class="content">
			<!-- 步骤指示器 -->
			<view class="steps-section">
				<view class="step" :class="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
					<view class="step-number">{{ currentStep > 1 ? '✓' : '1' }}</view>
					<text class="step-text">输入新密码</text>
				</view>
				<view class="step-line"></view>
				<view class="step" :class="{ 'active': currentStep === 2 }">
					<view class="step-number">2</view>
					<text class="step-text">确认密码</text>
				</view>
			</view>

			<!-- 提示信息 -->
			<view class="info-section">
				<text class="info-title">{{ currentStep === 1 ? '请输入新的支付密码' : '请再次输入新密码' }}</text>
				<text class="info-desc">{{ currentStep === 1 ? '支付密码为6位数字' : '确认您的新支付密码' }}</text>
			</view>

			<!-- 密码输入区域 -->
			<view class="password-section">
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
import { updatePayPassword } from '@/utils/api/index.js';

export default {
	data() {
		return {
			currentStep: 1,  // 1: 输入新密码, 2: 确认密码
			newPassword: '',
			confirmPassword: '',
			currentPassword: '',  // 当前显示的密码（根据步骤切换）
			keyboard: [
				['1', '2', '3'],
				['4', '5', '6'],
				['7', '8', '9'],
				['', '0', 'delete']
			],
			submitting: false
		}
	},
	
	onLoad(options) {
		// 可以从上一页接收验证后的原密码
		if (options.oldPassword) {
			this.oldPassword = options.oldPassword;
		}
	},
	
	watch: {
		currentPassword(newVal) {
			// 当输入6位密码时自动进入下一步或提交
			if (newVal.length === 6) {
				if (this.currentStep === 1) {
					// 第一步：保存新密码，进入确认步骤
					this.newPassword = newVal;
					setTimeout(() => {
						this.currentStep = 2;
						this.currentPassword = '';
					}, 300);
				} else if (this.currentStep === 2) {
					// 第二步：验证两次密码是否一致
					this.confirmPassword = newVal;
					this.submitPassword();
				}
			}
		}
	},
	
	methods: {
		goBack() {
			if (this.currentStep === 2) {
				// 第二步返回到第一步
				this.currentStep = 1;
				this.currentPassword = '';
				this.confirmPassword = '';
			} else {
				// 第一步返回上一页
				uni.navigateBack({ delta: 1 });
			}
		},
		
		handleKeyPress(key) {
			if (this.submitting) return;
			
			if (key === 'delete') {
				// 删除最后一位
				this.currentPassword = this.currentPassword.slice(0, -1);
			} else if (key !== '' && this.currentPassword.length < 6) {
				// 添加数字
				this.currentPassword += key;
			}
		},
		
		async submitPassword() {
			if (this.submitting) return;
			
			// 验证两次密码是否一致
			if (this.newPassword !== this.confirmPassword) {
				uni.showToast({
					title: '两次密码不一致',
					icon: 'none',
					duration: 2000
				});
				this.currentStep = 1;
				this.currentPassword = '';
				this.newPassword = '';
				this.confirmPassword = '';
				return;
			}
			
			this.submitting = true;
			
			try {
				uni.showLoading({
					title: '修改中...',
					mask: true
				});
				
				// 调用修改支付密码API
				// 注意：这里需要从上一页传递过来的原密码
				// 或者在验证页面将原密码存储到本地，这里读取
				const oldPassword = uni.getStorageSync('temp_old_pay_password');
				
				const result = await updatePayPassword(
					oldPassword,
					this.newPassword,
					this.confirmPassword
				);
				
				uni.hideLoading();
				
				if (result.code === 200) {
					// 清除临时存储的原密码
					uni.removeStorageSync('temp_old_pay_password');
					
					uni.showToast({
						title: '修改成功',
						icon: 'success',
						duration: 2000
					});
					
					setTimeout(() => {
						// 返回支付密码管理页面
						uni.navigateBack({ delta: 2 });
					}, 2000);
				} else {
					uni.showToast({
						title: result.msg || '修改失败',
						icon: 'none',
						duration: 2000
					});
					this.resetForm();
				}
			} catch (error) {
				uni.hideLoading();
				console.error('修改支付密码失败:', error);
				uni.showToast({
					title: '修改失败，请重试',
					icon: 'none',
					duration: 2000
				});
				this.resetForm();
			} finally {
				this.submitting = false;
			}
		},
		
		resetForm() {
			this.currentStep = 1;
			this.currentPassword = '';
			this.newPassword = '';
			this.confirmPassword = '';
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
		padding: 40rpx;
	}

	/* 步骤指示器 */
	.steps-section {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 60rpx;
		padding: 0 60rpx;
	}

	.step {
		display: flex;
		flex-direction: column;
		align-items: center;
		opacity: 0.4;
		transition: all 0.3s;
	}

	.step.active,
	.step.completed {
		opacity: 1;
	}

	.step-number {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: #e0e0e0;
		color: #999999;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 600;
		margin-bottom: 16rpx;
		transition: all 0.3s;
	}

	.step.active .step-number {
		background-color: #007aff;
		color: #ffffff;
	}

	.step.completed .step-number {
		background-color: #52c41a;
		color: #ffffff;
	}

	.step-text {
		font-size: 24rpx;
		color: #999999;
	}

	.step.active .step-text,
	.step.completed .step-text {
		color: #333333;
		font-weight: 500;
	}

	.step-line {
		flex: 1;
		height: 2rpx;
		background-color: #e0e0e0;
		margin: 0 20rpx;
		margin-bottom: 40rpx;
	}

	/* 提示信息 */
	.info-section {
		text-align: center;
		margin-bottom: 60rpx;
	}

	.info-title {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 16rpx;
	}

	.info-desc {
		display: block;
		font-size: 26rpx;
		color: #999999;
	}

	/* 密码输入区域 */
	.password-section {
		margin-bottom: 60rpx;
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
