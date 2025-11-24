<template>
	<view class="page">
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">支付宝账号</text>
		</view>

		<view class="content">
			<!-- 绑定状态卡片 -->
			<view class="status-card">
				<view class="status-header">
					<view class="alipay-logo">
						<text class="logo-text">支</text>
					</view>
					<view class="status-info">
						<text class="status-title">支付宝账号</text>
						<text class="status-desc" :class="{ bound: isBound }">
							{{ isBound ? '已绑定' : '未绑定' }}
						</text>
					</view>
					<view class="status-badge" v-if="isBound">
						<text class="badge-text">已验证</text>
					</view>
				</view>
				
				<view class="account-info" v-if="isBound">
					<text class="account-label">绑定账号：</text>
					<text class="account-value">{{ maskedAccount }}</text>
				</view>
			</view>

			<!-- 绑定表单 -->
			<view class="bind-card" v-if="!isBound">
				<text class="card-title">绑定支付宝账号</text>
				
				<view class="form-group">
					<text class="form-label">支付宝账号</text>
					<input 
						class="form-input" 
						type="text" 
						v-model="alipayAccount" 
						placeholder="请输入支付宝账号（手机号或邮箱）"
					/>
				</view>

				<view class="form-group">
					<text class="form-label">真实姓名</text>
					<input 
						class="form-input" 
						type="text" 
						v-model="realName" 
						placeholder="请输入支付宝实名认证姓名"
					/>
				</view>

				<view class="verify-section">
					<text class="verify-title">验证方式</text>
					<view class="verify-options">
						<view 
							class="verify-option" 
							:class="{ active: verifyMethod === 'sms' }"
							@tap="selectVerifyMethod('sms')"
						>
							<text class="option-icon">📱</text>
							<text class="option-text">短信验证</text>
						</view>
						<view 
							class="verify-option" 
							:class="{ active: verifyMethod === 'alipay' }"
							@tap="selectVerifyMethod('alipay')"
						>
							<text class="option-icon">💰</text>
							<text class="option-text">支付宝验证</text>
						</view>
					</view>
				</view>

				<view class="verify-code-group" v-if="showVerifyCode">
					<input 
						class="verify-input" 
						type="number" 
						v-model="verifyCode" 
						placeholder="请输入验证码"
						maxlength="6"
					/>
					<button 
						class="send-code-btn" 
						:disabled="!canSendCode || sendingCode"
						@tap="sendVerifyCode"
					>
						{{ sendingCode ? '发送中...' : (countdown > 0 ? `${countdown}s` : '发送验证码') }}
					</button>
				</view>

				<button 
					class="bind-btn" 
					:disabled="!canBind || binding"
					@tap="bindAccount"
				>
					{{ binding ? '绑定中...' : '绑定账号' }}
				</button>
			</view>

			<!-- 已绑定操作 -->
			<view class="bound-card" v-if="isBound">
				<text class="card-title">账号管理</text>
				
				<view class="action-list">
					<view class="action-item" @tap="changeAccount">
						<text class="action-icon">🔄</text>
						<text class="action-text">更换账号</text>
						<text class="action-arrow">〉</text>
					</view>
					
					<view class="action-item danger" @tap="unbindAccount">
						<text class="action-icon">🔗</text>
						<text class="action-text">解除绑定</text>
						<text class="action-arrow">〉</text>
					</view>
				</view>
			</view>

			<!-- 安全提示 -->
			<view class="tips-card">
				<view class="tips-header">
					<text class="tips-icon">💡</text>
					<text class="tips-title">绑定说明</text>
				</view>
				<text class="tips-item">• 绑定后可用于收款和提现</text>
				<text class="tips-item">• 请确保账号信息准确无误</text>
				<text class="tips-item">• 支持手机号和邮箱账号绑定</text>
				<text class="tips-item">• 如需更换请先解除当前绑定</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isBound: false,
			alipayAccount: '',
			realName: '',
			verifyMethod: 'sms',
			verifyCode: '',
			sendingCode: false,
			binding: false,
			countdown: 0,
			maskedAccount: ''
		}
	},
	
	computed: {
		showVerifyCode() {
			return this.alipayAccount && this.realName;
		},
		
		canSendCode() {
			return this.showVerifyCode && this.countdown === 0;
		},
		
		canBind() {
			return this.alipayAccount && this.realName && this.verifyCode.length === 6;
		}
	},
	
	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 });
		},
		
		selectVerifyMethod(method) {
			this.verifyMethod = method;
		},
		
		async sendVerifyCode() {
			if (!this.canSendCode) return;
			
			this.sendingCode = true;
			
			try {
				await new Promise(resolve => setTimeout(resolve, 1000));
				
				uni.showToast({
					title: '验证码已发送',
					icon: 'success'
				});
				
				this.startCountdown();
				
			} catch (error) {
				uni.showToast({
					title: '发送失败，请重试',
					icon: 'none'
				});
			} finally {
				this.sendingCode = false;
			}
		},
		
		startCountdown() {
			this.countdown = 60;
			const timer = setInterval(() => {
				this.countdown--;
				if (this.countdown <= 0) {
					clearInterval(timer);
				}
			}, 1000);
		},
		
		async bindAccount() {
			if (!this.canBind) return;
			
			this.binding = true;
			
			try {
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				this.isBound = true;
				this.maskedAccount = this.maskAccount(this.alipayAccount);
				
				uni.showToast({
					title: '绑定成功',
					icon: 'success'
				});
				
			} catch (error) {
				uni.showToast({
					title: '绑定失败，请重试',
					icon: 'none'
				});
			} finally {
				this.binding = false;
			}
		},
		
		maskAccount(account) {
			if (account.includes('@')) {
				// 邮箱脱敏
				const [name, domain] = account.split('@');
				return name.substring(0, 2) + '***@' + domain;
			} else {
				// 手机号脱敏
				return account.substring(0, 3) + '****' + account.substring(7);
			}
		},
		
		changeAccount() {
			this.isBound = false;
			this.alipayAccount = '';
			this.realName = '';
			this.verifyCode = '';
		},
		
		unbindAccount() {
			uni.showModal({
				title: '解除绑定',
				content: '解除绑定后将无法使用该账号收款，确定要解除吗？',
				success: (res) => {
					if (res.confirm) {
						this.isBound = false;
						this.alipayAccount = '';
						this.realName = '';
						this.verifyCode = '';
						this.maskedAccount = '';
						
						uni.showToast({
							title: '已解除绑定',
							icon: 'success'
						});
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
		background-color: #f7f7f7;
		padding-top: calc(112rpx + env(safe-area-inset-top));
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

	.content {
		padding: 40rpx 30rpx;
	}

	.status-card,
	.bind-card,
	.bound-card,
	.tips-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.card-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 30rpx;
		display: block;
	}

	.status-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.alipay-logo {
		width: 60rpx;
		height: 60rpx;
		background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.logo-text {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: bold;
	}

	.status-info {
		flex: 1;
	}

	.status-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
		display: block;
		margin-bottom: 6rpx;
	}

	.status-desc {
		font-size: 26rpx;
		color: #999999;
		display: block;
	}

	.status-desc.bound {
		color: #52c41a;
	}

	.status-badge {
		background-color: #52c41a;
		color: #ffffff;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
	}

	.account-info {
		padding: 20rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
	}

	.account-label {
		font-size: 26rpx;
		color: #666666;
	}

	.account-value {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}

	.form-group {
		margin-bottom: 30rpx;
	}

	.form-label {
		font-size: 28rpx;
		color: #333333;
		display: block;
		margin-bottom: 12rpx;
	}

	.form-input {
		width: 100%;
		height: 80rpx;
		padding: 0 20rpx;
		border: 2rpx solid #f0f0f0;
		border-radius: 12rpx;
		font-size: 30rpx;
		color: #333333;
		box-sizing: border-box;
	}

	.verify-section {
		margin-bottom: 30rpx;
	}

	.verify-title {
		font-size: 28rpx;
		color: #333333;
		display: block;
		margin-bottom: 20rpx;
	}

	.verify-options {
		display: flex;
		gap: 20rpx;
	}

	.verify-option {
		flex: 1;
		padding: 20rpx;
		border: 2rpx solid #f0f0f0;
		border-radius: 12rpx;
		text-align: center;
		transition: all 0.3s;
	}

	.verify-option.active {
		border-color: #1677ff;
		background-color: #f0f8ff;
	}

	.option-icon {
		font-size: 32rpx;
		display: block;
		margin-bottom: 8rpx;
	}

	.option-text {
		font-size: 26rpx;
		color: #666666;
	}

	.verify-code-group {
		display: flex;
		gap: 20rpx;
		margin-bottom: 40rpx;
	}

	.verify-input {
		flex: 1;
		height: 80rpx;
		padding: 0 20rpx;
		border: 2rpx solid #f0f0f0;
		border-radius: 12rpx;
		font-size: 30rpx;
		color: #333333;
		box-sizing: border-box;
	}

	.send-code-btn {
		width: 200rpx;
		height: 80rpx;
		background-color: #1677ff;
		color: #ffffff;
		border: none;
		border-radius: 12rpx;
		font-size: 26rpx;
	}

	.send-code-btn[disabled] {
		background-color: #d9d9d9;
		color: #999999;
	}

	.bind-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 44rpx;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(22, 119, 255, 0.3);
	}

	.bind-btn[disabled] {
		background: #d9d9d9;
		color: #999999;
		box-shadow: none;
	}

	.action-list {
		margin-top: 20rpx;
	}

	.action-item {
		display: flex;
		align-items: center;
		padding: 24rpx 0;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.action-item:last-child {
		border-bottom: none;
	}

	.action-item.danger .action-text {
		color: #ff4d4f;
	}

	.action-icon {
		font-size: 32rpx;
		margin-right: 20rpx;
	}

	.action-text {
		flex: 1;
		font-size: 30rpx;
		color: #333333;
	}

	.action-arrow {
		font-size: 28rpx;
		color: #d0d0d0;
	}

	.tips-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.tips-icon {
		font-size: 32rpx;
		margin-right: 12rpx;
	}

	.tips-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #333333;
	}

	.tips-item {
		font-size: 26rpx;
		color: #666666;
		line-height: 2;
		margin-bottom: 8rpx;
		display: block;
	}
</style>
