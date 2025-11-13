<template>
	<view class="page">
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">修改登录密码</text>
			<text class="nav-placeholder"></text>
		</view>

		<view class="content">
			<view class="form-section">
				<view class="form-item">
					<text class="label">当前密码</text>
					<input 
						class="input" 
						type="password" 
						v-model="currentPassword" 
						placeholder="请输入当前密码"
						placeholder-class="placeholder"
						maxlength="20"
					/>
				</view>
				
				<view class="form-item">
					<text class="label">新密码</text>
					<input 
						class="input" 
						type="password" 
						v-model="newPassword" 
						placeholder="请输入新密码"
						placeholder-class="placeholder"
						maxlength="20"
					/>
				</view>
				
				<view class="form-item">
					<text class="label">确认新密码</text>
					<input 
						class="input" 
						type="password" 
						v-model="confirmPassword" 
						placeholder="请再次输入新密码"
						placeholder-class="placeholder"
						maxlength="20"
					/>
				</view>
			</view>
			
			<view class="tips-section">
				<text class="tips-title">密码要求：</text>
				<text class="tips-item">• 长度为6-20个字符</text>
				<text class="tips-item">• 包含字母和数字</text>
				<text class="tips-item">• 不能包含空格</text>
				<text class="tips-item">• 建议包含大小写字母和特殊字符</text>
			</view>
		</view>

		<view class="bottom-bar">
			<button 
				class="save-btn" 
				@tap="handleSave" 
				:disabled="saving || !canSubmit"
			>
				{{ saving ? '修改中...' : '确认修改' }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
			saving: false
		}
	},
	
	computed: {
		canSubmit() {
			return this.currentPassword.trim() !== '' && 
				   this.newPassword.trim() !== '' && 
				   this.confirmPassword.trim() !== '';
		}
	},
	
	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 });
		},
		
		// 验证密码格式
		validatePassword(password) {
			// 长度检查
			if (password.length < 6 || password.length > 20) {
				return '密码长度必须为6-20个字符';
			}
			
			// 不能包含空格
			if (password.includes(' ')) {
				return '密码不能包含空格';
			}
			
			// 必须包含字母和数字
			const hasLetter = /[a-zA-Z]/.test(password);
			const hasNumber = /\d/.test(password);
			
			if (!hasLetter || !hasNumber) {
				return '密码必须包含字母和数字';
			}
			
			return null;
		},
		
		async handleSave() {
			// 验证当前密码
			if (!this.currentPassword.trim()) {
				uni.showToast({
					title: '请输入当前密码',
					icon: 'none'
				});
				return;
			}
			
			// 验证新密码格式
			const passwordError = this.validatePassword(this.newPassword);
			if (passwordError) {
				uni.showToast({
					title: passwordError,
					icon: 'none',
					duration: 3000
				});
				return;
			}
			
			// 验证两次密码是否一致
			if (this.newPassword !== this.confirmPassword) {
				uni.showToast({
					title: '两次输入的新密码不一致',
					icon: 'none'
				});
				return;
			}
			
			// 验证新密码不能与当前密码相同
			if (this.newPassword === this.currentPassword) {
				uni.showToast({
					title: '新密码不能与当前密码相同',
					icon: 'none'
				});
				return;
			}
			
			if (this.saving) return;
			
			this.saving = true;
			
			try {
				// TODO: 调用修改密码API
				// const response = await updatePassword({
				//     currentPassword: this.currentPassword,
				//     newPassword: this.newPassword
				// });
				
				// 模拟API调用
				await new Promise(resolve => setTimeout(resolve, 1500));
				
				// 显示成功提示
				uni.showToast({
					title: '密码修改成功',
					icon: 'success',
					duration: 2000
				});
				
				// 清空表单
				this.currentPassword = '';
				this.newPassword = '';
				this.confirmPassword = '';
				
				// 延迟返回
				setTimeout(() => {
					this.goBack();
				}, 2000);
				
			} catch (error) {
				console.error('修改密码失败:', error);
				
				// 根据错误类型显示不同提示
				let errorMsg = '修改失败，请重试';
				if (error.message && error.message.includes('当前密码')) {
					errorMsg = '当前密码错误';
				} else if (error.message && error.message.includes('密码')) {
					errorMsg = error.message;
				}
				
				uni.showToast({
					title: errorMsg,
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
		flex: 1;
		padding: 40rpx 30rpx 0;
	}

	.form-section {
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 40rpx;
	}

	.form-item {
		padding: 40rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.form-item:last-child {
		border-bottom: none;
	}

	.label {
		display: block;
		font-size: 30rpx;
		color: #333333;
		font-weight: 500;
		margin-bottom: 20rpx;
	}

	.input {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		padding: 0 20rpx;
		border-radius: 12rpx;
		background-color: #f5f5f5;
		font-size: 32rpx;
		color: #333333;
		box-sizing: border-box;
	}

	.placeholder {
		color: #bfbfbf;
		font-size: 30rpx;
	}

	.tips-section {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
	}

	.tips-title {
		display: block;
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
		margin-bottom: 20rpx;
	}

	.tips-item {
		display: block;
		font-size: 26rpx;
		color: #666666;
		line-height: 2;
		margin-bottom: 8rpx;
	}

	.bottom-bar {
		padding: 40rpx 30rpx;
		padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
	}

	.save-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #007aff;
		color: #ffffff;
		font-size: 32rpx;
		font-weight: 500;
		border-radius: 44rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.save-btn[disabled] {
		background-color: #cccccc;
		color: #999999;
	}

	.save-btn:not([disabled]):active {
		background-color: #0056cc;
		transform: translateY(2rpx);
	}
</style>
