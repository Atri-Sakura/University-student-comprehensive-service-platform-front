<template>
	<view class="page">
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">支付密码</text>
			<text class="nav-placeholder"></text>
		</view>

		<view class="content">
			<!-- 当前状态卡片 -->
			<view class="status-card">
				<view class="status-icon">
					<text class="icon">🔒</text>
				</view>
				<view class="status-info">
					<text class="status-title">支付密码状态</text>
					<text class="status-desc" :class="hasPaymentPassword ? 'enabled' : 'disabled'">
						{{ hasPaymentPassword ? '已设置' : '未设置' }}
					</text>
				</view>
			</view>

			<!-- 功能选项 -->
			<view class="options-section">
				<view class="option-item" @tap="handleSetPassword" v-if="!hasPaymentPassword">
					<view class="option-icon set-icon"></view>
					<view class="option-content">
						<text class="option-title">设置支付密码</text>
						<text class="option-desc">设置6位数字支付密码</text>
					</view>
					<text class="option-arrow">〉</text>
				</view>

				<view class="option-item" @tap="handleChangePassword" v-if="hasPaymentPassword">
					<view class="option-icon change-icon"></view>
					<view class="option-content">
						<text class="option-title">修改支付密码</text>
						<text class="option-desc">修改当前支付密码</text>
					</view>
					<text class="option-arrow">〉</text>
				</view>

				<view class="option-item" @tap="handleResetPassword" v-if="hasPaymentPassword">
					<view class="option-icon reset-icon"></view>
					<view class="option-content">
						<text class="option-title">重置支付密码</text>
						<text class="option-desc">忘记密码时重新设置</text>
					</view>
					<text class="option-arrow">〉</text>
				</view>
			</view>

			<!-- 安全提示 -->
			<view class="tips-section">
				<view class="tips-header">
					<text class="tips-icon">💡</text>
					<text class="tips-title">安全提示</text>
				</view>
				<text class="tips-item">• 支付密码用于确认支付和提现操作</text>
				<text class="tips-item">• 请设置6位数字密码，避免使用生日等简单数字</text>
				<text class="tips-item">• 不要将支付密码告诉他人</text>
				<text class="tips-item">• 建议定期更换支付密码</text>
			</view>
		</view>

		<!-- 密码输入弹窗 -->
		<view class="password-modal" v-if="showPasswordModal" @tap="closeModal">
			<view class="modal-content" @tap.stop="">
				<view class="modal-header">
					<text class="modal-title">{{ modalTitle }}</text>
					<text class="modal-close" @tap="closeModal">✕</text>
				</view>

				<!-- 当前密码输入（修改时需要） -->
				<view class="password-section" v-if="modalType === 'change'">
					<text class="password-label">请输入当前支付密码</text>
					<view class="password-input-container">
						<view 
							class="password-dot" 
							v-for="(item, index) in 6" 
							:key="index"
							:class="{ 'filled': currentPassword.length > index }"
						>
							<text v-if="currentPassword.length > index">●</text>
						</view>
					</view>
				</view>

				<!-- 新密码输入 -->
				<view class="password-section">
					<text class="password-label">
						{{ modalType === 'set' ? '请设置6位支付密码' : '请输入新的支付密码' }}
					</text>
					<view class="password-input-container">
						<view 
							class="password-dot" 
							v-for="(item, index) in 6" 
							:key="index"
							:class="{ 'filled': newPassword.length > index }"
						>
							<text v-if="newPassword.length > index">●</text>
						</view>
					</view>
				</view>

				<!-- 确认密码输入 -->
				<view class="password-section" v-if="showConfirmPassword">
					<text class="password-label">请再次输入支付密码</text>
					<view class="password-input-container">
						<view 
							class="password-dot" 
							v-for="(item, index) in 6" 
							:key="index"
							:class="{ 'filled': confirmPassword.length > index }"
						>
							<text v-if="confirmPassword.length > index">●</text>
						</view>
					</view>
				</view>

				<!-- 数字键盘 -->
				<view class="number-keyboard">
					<view class="keyboard-row" v-for="(row, rowIndex) in keyboardLayout" :key="rowIndex">
						<view 
							class="keyboard-key" 
							v-for="(key, keyIndex) in row" 
							:key="keyIndex"
							:class="{ 'delete-key': key === 'delete', 'disabled': key === '' }"
							@tap="handleKeyPress(key)"
						>
							<text v-if="key === 'delete'" class="delete-icon">⌫</text>
							<text v-else-if="key !== ''">{{ key }}</text>
						</view>
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
			hasPaymentPassword: true, // 模拟是否已设置支付密码
			showPasswordModal: false,
			modalType: '', // 'set', 'change', 'reset'
			modalTitle: '',
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
			showConfirmPassword: false,
			currentStep: 1, // 1: 输入当前密码, 2: 输入新密码, 3: 确认新密码
			keyboardLayout: [
				['1', '2', '3'],
				['4', '5', '6'],
				['7', '8', '9'],
				['', '0', 'delete']
			]
		}
	},

	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 });
		},

		handleSetPassword() {
			this.modalType = 'set';
			this.modalTitle = '设置支付密码';
			this.showConfirmPassword = false;
			this.currentStep = 1;
			this.resetPasswordInputs();
			this.showPasswordModal = true;
		},

		handleChangePassword() {
			this.modalType = 'change';
			this.modalTitle = '修改支付密码';
			this.showConfirmPassword = false;
			this.currentStep = 1;
			this.resetPasswordInputs();
			this.showPasswordModal = true;
		},

		handleResetPassword() {
			uni.showModal({
				title: '重置支付密码',
				content: '重置支付密码需要验证身份信息，是否继续？',
				success: (res) => {
					if (res.confirm) {
						uni.showToast({
							title: '功能开发中',
							icon: 'none'
						});
					}
				}
			});
		},

		closeModal() {
			this.showPasswordModal = false;
			this.resetPasswordInputs();
		},

		resetPasswordInputs() {
			this.currentPassword = '';
			this.newPassword = '';
			this.confirmPassword = '';
			this.currentStep = 1;
			this.showConfirmPassword = false;
		},

		handleKeyPress(key) {
			if (key === '' || key === undefined) return;

			if (key === 'delete') {
				this.handleDelete();
			} else {
				this.handleNumberInput(key);
			}
		},

		handleDelete() {
			if (this.modalType === 'change' && this.currentStep === 1) {
				// 删除当前密码
				if (this.currentPassword.length > 0) {
					this.currentPassword = this.currentPassword.slice(0, -1);
				}
			} else if (this.currentStep === 2 || (this.modalType === 'set' && this.currentStep === 1)) {
				// 删除新密码
				if (this.newPassword.length > 0) {
					this.newPassword = this.newPassword.slice(0, -1);
				}
			} else if (this.currentStep === 3) {
				// 删除确认密码
				if (this.confirmPassword.length > 0) {
					this.confirmPassword = this.confirmPassword.slice(0, -1);
				}
			}
		},

		handleNumberInput(number) {
			if (this.modalType === 'change' && this.currentStep === 1) {
				// 输入当前密码
				if (this.currentPassword.length < 6) {
					this.currentPassword += number;
					if (this.currentPassword.length === 6) {
						this.verifyCurrentPassword();
					}
				}
			} else if (this.currentStep === 2 || (this.modalType === 'set' && this.currentStep === 1)) {
				// 输入新密码
				if (this.newPassword.length < 6) {
					this.newPassword += number;
					if (this.newPassword.length === 6) {
						this.handleNewPasswordComplete();
					}
				}
			} else if (this.currentStep === 3) {
				// 输入确认密码
				if (this.confirmPassword.length < 6) {
					this.confirmPassword += number;
					if (this.confirmPassword.length === 6) {
						this.handleConfirmPasswordComplete();
					}
				}
			}
		},

		verifyCurrentPassword() {
			// 模拟验证当前密码
			setTimeout(() => {
				// 这里应该调用API验证密码
				const isValid = true; // 模拟验证结果

				if (isValid) {
					this.currentStep = 2;
					this.currentPassword = '';
				} else {
					uni.showToast({
						title: '当前密码错误',
						icon: 'none'
					});
					this.currentPassword = '';
				}
			}, 300);
		},

		handleNewPasswordComplete() {
			setTimeout(() => {
				if (this.modalType === 'set') {
					// 设置密码需要确认
					this.showConfirmPassword = true;
					this.currentStep = 3;
				} else {
					// 修改密码也需要确认
					this.showConfirmPassword = true;
					this.currentStep = 3;
				}
			}, 300);
		},

		handleConfirmPasswordComplete() {
			setTimeout(() => {
				if (this.newPassword === this.confirmPassword) {
					// 密码一致，提交
					this.submitPassword();
				} else {
					uni.showToast({
						title: '两次输入的密码不一致',
						icon: 'none'
					});
					this.confirmPassword = '';
				}
			}, 300);
		},

		submitPassword() {
			// 模拟提交密码
			uni.showLoading({
				title: '设置中...',
				mask: true
			});

			setTimeout(() => {
				uni.hideLoading();
				
				const successMsg = this.modalType === 'set' ? '支付密码设置成功' : '支付密码修改成功';
				
				uni.showToast({
					title: successMsg,
					icon: 'success',
					duration: 2000
				});

				// 更新状态
				if (this.modalType === 'set') {
					this.hasPaymentPassword = true;
				}

				this.closeModal();
			}, 1500);
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
		padding: 40rpx 30rpx;
	}

	/* 状态卡片 */
	.status-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 20rpx;
		padding: 40rpx;
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
	}

	.status-icon {
		width: 80rpx;
		height: 80rpx;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
	}

	.status-icon .icon {
		font-size: 40rpx;
	}

	.status-info {
		flex: 1;
	}

	.status-title {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		display: block;
		margin-bottom: 8rpx;
	}

	.status-desc {
		font-size: 36rpx;
		font-weight: bold;
		display: block;
	}

	.status-desc.enabled {
		color: #4CAF50;
	}

	.status-desc.disabled {
		color: #FF9800;
	}

	/* 选项区域 */
	.options-section {
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 40rpx;
	}

	.option-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.option-item:last-child {
		border-bottom: none;
	}

	.option-item:active {
		background-color: #f8f8f8;
	}

	.option-icon {
		width: 48rpx;
		height: 48rpx;
		border-radius: 8rpx;
		margin-right: 24rpx;
		flex-shrink: 0;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.set-icon {
		background-color: #e8f5e8;
	}

	.set-icon::before {
		content: '';
		position: absolute;
		width: 20rpx;
		height: 20rpx;
		border: 3rpx solid #4CAF50;
		border-radius: 50%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.set-icon::after {
		content: '';
		position: absolute;
		width: 8rpx;
		height: 2rpx;
		background-color: #4CAF50;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		box-shadow: 0 -4rpx 0 #4CAF50, 0 4rpx 0 #4CAF50;
	}

	.change-icon {
		background-color: #e3f2fd;
	}

	.change-icon::before {
		content: '';
		position: absolute;
		width: 20rpx;
		height: 20rpx;
		border: 3rpx solid #2196F3;
		border-radius: 50%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.change-icon::after {
		content: '';
		position: absolute;
		width: 12rpx;
		height: 12rpx;
		border: 2rpx solid #2196F3;
		border-radius: 50%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.reset-icon {
		background-color: #fff3e0;
	}

	.reset-icon::before {
		content: '';
		position: absolute;
		width: 18rpx;
		height: 18rpx;
		border: 3rpx solid #FF9800;
		border-radius: 50%;
		border-top: 3rpx solid transparent;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(45deg);
	}

	.reset-icon::after {
		content: '';
		position: absolute;
		width: 6rpx;
		height: 6rpx;
		border-left: 2rpx solid #FF9800;
		border-bottom: 2rpx solid #FF9800;
		top: 35%;
		left: 60%;
		transform: rotate(45deg);
	}

	.option-content {
		flex: 1;
	}

	.option-title {
		font-size: 32rpx;
		color: #333333;
		font-weight: 500;
		display: block;
		margin-bottom: 6rpx;
	}

	.option-desc {
		font-size: 26rpx;
		color: #999999;
		display: block;
	}

	.option-arrow {
		font-size: 32rpx;
		color: #d0d0d0;
		margin-left: 12rpx;
	}

	/* 提示区域 */
	.tips-section {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
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
		color: #333333;
		font-weight: 500;
	}

	.tips-item {
		display: block;
		font-size: 26rpx;
		color: #666666;
		line-height: 2;
		margin-bottom: 8rpx;
	}

	/* 密码弹窗 */
	.password-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: flex-end;
		z-index: 1000;
	}

	.modal-content {
		width: 100%;
		background-color: #ffffff;
		border-radius: 24rpx 24rpx 0 0;
		padding: 40rpx 30rpx;
		padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 40rpx;
	}

	.modal-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
	}

	.modal-close {
		font-size: 40rpx;
		color: #999999;
		padding: 10rpx;
	}

	.password-section {
		margin-bottom: 40rpx;
	}

	.password-label {
		font-size: 28rpx;
		color: #666666;
		display: block;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.password-input-container {
		display: flex;
		justify-content: center;
		gap: 20rpx;
	}

	.password-dot {
		width: 60rpx;
		height: 60rpx;
		border: 2rpx solid #e0e0e0;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		color: #333333;
	}

	.password-dot.filled {
		border-color: #007aff;
		background-color: #f0f8ff;
	}

	/* 数字键盘 */
	.number-keyboard {
		margin-top: 40rpx;
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
		width: 200rpx;
		height: 100rpx;
		background-color: #f8f8f8;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		font-weight: bold;
		color: #333333;
	}

	.keyboard-key:active {
		background-color: #e0e0e0;
	}

	.keyboard-key.delete-key {
		background-color: #ff6b6b;
		color: #ffffff;
	}

	.keyboard-key.delete-key:active {
		background-color: #ff5252;
	}

	.keyboard-key.disabled {
		background-color: transparent;
	}

	.delete-icon {
		font-size: 36rpx;
	}
</style>
