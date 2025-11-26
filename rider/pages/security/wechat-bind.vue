<template>
	<view class="page">
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">微信账号</text>
		</view>

		<view class="content">
			<!-- 绑定状态卡片 -->
			<view class="status-card">
				<view class="status-header">
					<view class="wechat-logo">
						<text class="logo-text">微</text>
					</view>
					<view class="status-info">
						<text class="status-title">微信账号</text>
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

			<!-- 绑定方式选择 -->
			<view class="bind-card" v-if="!isBound">
				<text class="card-title">绑定微信账号</text>
				
				<view class="bind-methods">
					<view class="method-item" @tap="bindByQR">
						<view class="method-icon qr">
							<text class="icon">📱</text>
						</view>
						<view class="method-content">
							<text class="method-name">扫码绑定</text>
							<text class="method-desc">使用微信扫描二维码快速绑定</text>
						</view>
						<text class="method-arrow">〉</text>
					</view>

					<view class="method-item" @tap="bindByPhone">
						<view class="method-icon phone">
							<text class="icon">📞</text>
						</view>
						<view class="method-content">
							<text class="method-name">手机号绑定</text>
							<text class="method-desc">通过微信绑定的手机号验证</text>
						</view>
						<text class="method-arrow">〉</text>
					</view>
				</view>
			</view>

			<!-- 二维码绑定 -->
			<view class="qr-card" v-if="showQRBind">
				<text class="card-title">扫码绑定</text>
				
				<view class="qr-section">
					<view class="qr-code">
						<image src="/static/wechat-qr-placeholder.png" class="qr-image" mode="aspectFit"></image>
					</view>
					<text class="qr-desc">请使用微信扫描上方二维码</text>
					<text class="qr-tip">扫码后在微信中确认绑定即可</text>
				</view>

				<view class="qr-actions">
					<button class="refresh-btn" @tap="refreshQR">刷新二维码</button>
					<button class="cancel-btn" @tap="cancelQRBind">取消</button>
				</view>
			</view>

			<!-- 手机号绑定 -->
			<view class="phone-card" v-if="showPhoneBind">
				<text class="card-title">手机号绑定</text>
				
				<view class="form-group">
					<text class="form-label">手机号码</text>
					<input 
						class="form-input" 
						type="number" 
						v-model="phoneNumber" 
						placeholder="请输入微信绑定的手机号"
						maxlength="11"
					/>
				</view>

				<view class="verify-code-group">
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

				<view class="phone-actions">
					<button class="cancel-btn" @tap="cancelPhoneBind">取消</button>
					<button 
						class="bind-btn" 
						:disabled="!canBind || binding"
						@tap="bindByPhoneConfirm"
					>
						{{ binding ? '绑定中...' : '确认绑定' }}
					</button>
				</view>
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
				<text class="tips-item">• 绑定后可用于微信支付收款</text>
				<text class="tips-item">• 支持扫码和手机号两种绑定方式</text>
				<text class="tips-item">• 请确保微信账号安全可靠</text>
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
			showQRBind: false,
			showPhoneBind: false,
			phoneNumber: '',
			verifyCode: '',
			sendingCode: false,
			binding: false,
			countdown: 0,
			maskedAccount: ''
		}
	},
	
	computed: {
		canSendCode() {
			return this.phoneNumber.length === 11 && this.countdown === 0;
		},
		
		canBind() {
			return this.phoneNumber.length === 11 && this.verifyCode.length === 6;
		}
	},
	
	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 });
		},
		
		bindByQR() {
			this.showQRBind = true;
			this.showPhoneBind = false;
		},
		
		bindByPhone() {
			this.showPhoneBind = true;
			this.showQRBind = false;
		},
		
		cancelQRBind() {
			this.showQRBind = false;
		},
		
		cancelPhoneBind() {
			this.showPhoneBind = false;
			this.phoneNumber = '';
			this.verifyCode = '';
		},
		
		refreshQR() {
			uni.showToast({
				title: '二维码已刷新',
				icon: 'success'
			});
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
		
		async bindByPhoneConfirm() {
			if (!this.canBind) return;
			
			this.binding = true;
			
			try {
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				this.isBound = true;
				this.maskedAccount = this.maskPhone(this.phoneNumber);
				this.showPhoneBind = false;
				
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
		
		maskPhone(phone) {
			return phone.substring(0, 3) + '****' + phone.substring(7);
		},
		
		changeAccount() {
			this.isBound = false;
			this.phoneNumber = '';
			this.verifyCode = '';
			this.maskedAccount = '';
		},
		
		unbindAccount() {
			uni.showModal({
				title: '解除绑定',
				content: '解除绑定后将无法使用微信收款，确定要解除吗？',
				success: (res) => {
					if (res.confirm) {
						this.isBound = false;
						this.phoneNumber = '';
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
	.qr-card,
	.phone-card,
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

	.wechat-logo {
		width: 60rpx;
		height: 60rpx;
		background: linear-gradient(135deg, #07c160 0%, #00a048 100%);
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

	.bind-methods {
		margin-top: 20rpx;
	}

	.method-item {
		display: flex;
		align-items: center;
		padding: 24rpx;
		border: 2rpx solid #f0f0f0;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
	}

	.method-icon {
		width: 48rpx;
		height: 48rpx;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.method-icon.qr {
		background-color: #e6f7ff;
	}

	.method-icon.phone {
		background-color: #f6ffed;
	}

	.icon {
		font-size: 28rpx;
	}

	.method-content {
		flex: 1;
	}

	.method-name {
		font-size: 30rpx;
		font-weight: 500;
		color: #333333;
		display: block;
		margin-bottom: 6rpx;
	}

	.method-desc {
		font-size: 26rpx;
		color: #999999;
		display: block;
	}

	.method-arrow {
		font-size: 28rpx;
		color: #d0d0d0;
	}

	.qr-section {
		text-align: center;
		margin-bottom: 30rpx;
	}

	.qr-code {
		width: 300rpx;
		height: 300rpx;
		margin: 0 auto 20rpx;
		border: 2rpx solid #f0f0f0;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.qr-image {
		width: 100%;
		height: 100%;
	}

	.qr-desc {
		font-size: 28rpx;
		color: #333333;
		margin-bottom: 12rpx;
		display: block;
	}

	.qr-tip {
		font-size: 24rpx;
		color: #999999;
	}

	.qr-actions,
	.phone-actions {
		display: flex;
		gap: 20rpx;
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
		background-color: #07c160;
		color: #ffffff;
		border: none;
		border-radius: 12rpx;
		font-size: 26rpx;
	}

	.send-code-btn[disabled] {
		background-color: #d9d9d9;
		color: #999999;
	}

	.refresh-btn,
	.cancel-btn,
	.bind-btn {
		flex: 1;
		height: 80rpx;
		border: none;
		border-radius: 12rpx;
		font-size: 30rpx;
		font-weight: 500;
	}

	.refresh-btn {
		background-color: #07c160;
		color: #ffffff;
	}

	.cancel-btn {
		background-color: #f0f0f0;
		color: #666666;
	}

	.bind-btn {
		background: linear-gradient(135deg, #07c160 0%, #00a048 100%);
		color: #ffffff;
	}

	.bind-btn[disabled] {
		background: #d9d9d9;
		color: #999999;
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
