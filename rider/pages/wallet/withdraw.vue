<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">提现</text>
			<view class="navbar-right"></view>
		</view>

		<!-- 可提现余额 -->
		<view class="balance-section">
			<text class="balance-label">可提现余额</text>
			<text class="balance-amount">¥{{ availableBalance }}</text>
		</view>

		<!-- 提现金额输入 -->
		<view class="amount-section">
			<text class="section-title">提现金额</text>
			<view class="amount-input-container">
				<text class="currency-symbol">¥</text>
				<input 
					class="amount-input" 
					type="digit" 
					placeholder="请输入提现金额"
					v-model="amount"
					@input="onAmountInput"
				/>
			</view>
			<view class="amount-actions">
				<text class="amount-tip">单笔提现金额：10-{{ availableBalance }}元</text>
				<text class="all-amount" @tap="withdrawAll">全部提现</text>
			</view>
		</view>

		<!-- 提现方式 -->
		<view class="payment-section">
			<text class="section-title">提现方式</text>
			<view class="payment-methods">
				<view class="payment-item active">
					<view class="payment-info">
						<text class="payment-icon">💰</text>
						<text class="payment-name">支付宝</text>
					</view>
					<text class="payment-check">✓</text>
				</view>
			</view>
		</view>

		<!-- 支付密码输入 -->
		<view class="password-section">
			<text class="section-title">支付密码</text>
			<input 
				class="password-input" 
				type="password" 
				placeholder="请输入6位支付密码"
				maxlength="6"
				v-model="payPassword"
			/>
			<text class="password-tip">为了您的资金安全，提现需要验证支付密码</text>
		</view>

		<!-- 提现说明 -->
		<view class="notice-section">
			<text class="notice-title">提现说明</text>
			<view class="notice-list">
				<text class="notice-item">• 提现金额将在1-3个工作日内到账</text>
				<text class="notice-item">• 每日提现次数限制为3次</text>
				<text class="notice-item">• 提现手续费：免费</text>
			</view>
		</view>

		<!-- 提现按钮 -->
		<view class="submit-section">
			<button 
				class="submit-btn" 
				:class="{ disabled: !canSubmit }"
				:disabled="!canSubmit"
				@tap="handleWithdraw"
			>
				确认提现
			</button>
		</view>
	</view>
</template>

<script>
import { withdrawByAlipay } from '../../utils/api/wallet.js';

export default {
	data() {
		return {
			amount: '',
			payPassword: '',
			availableBalance: '556.80', // 从钱包页面传入或API获取
			payChannel: 1, // 1=支付宝
			loading: false
		}
	},
	computed: {
		canSubmit() {
			const amt = parseFloat(this.amount);
			const balance = parseFloat(this.availableBalance);
			return amt >= 10 && 
				   amt <= balance && 
				   this.payPassword.length === 6 && 
				   !this.loading;
		}
	},
	onLoad(options) {
		// 从参数中获取可提现余额
		if (options.balance) {
			this.availableBalance = options.balance;
		}
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		
		onAmountInput(e) {
			let value = e.detail.value;
			// 限制只能输入数字和小数点
			value = value.replace(/[^\d.]/g, '');
			// 限制只能有一个小数点
			const parts = value.split('.');
			if (parts.length > 2) {
				value = parts[0] + '.' + parts.slice(1).join('');
			}
			// 限制小数点后最多2位
			if (parts[1] && parts[1].length > 2) {
				value = parts[0] + '.' + parts[1].substring(0, 2);
			}
			this.amount = value;
		},
		
		withdrawAll() {
			this.amount = this.availableBalance;
		},
		
		async handleWithdraw() {
			if (!this.canSubmit) return;
			
			const amount = parseFloat(this.amount);
			const balance = parseFloat(this.availableBalance);
			
			if (amount < 10) {
				uni.showToast({
					title: '提现金额不能少于10元',
					icon: 'none'
				});
				return;
			}
			
			if (amount > balance) {
				uni.showToast({
					title: '提现金额不能超过可用余额',
					icon: 'none'
				});
				return;
			}
			
			if (this.payPassword.length !== 6) {
				uni.showToast({
					title: '请输入6位支付密码',
					icon: 'none'
				});
				return;
			}
			
			// 确认提现
			uni.showModal({
				title: '确认提现',
				content: `确认提现 ¥${amount} 到支付宝账户？`,
				success: async (res) => {
					if (res.confirm) {
						await this.doWithdraw(amount);
					}
				}
			});
		},
		
		async doWithdraw(amount) {
			try {
				this.loading = true;
				
				const result = await withdrawByAlipay(amount, this.payChannel, this.payPassword);
				
				if (result.code === 200) {
					// 更新前一页面的余额显示
					this.updatePreviousPageBalance(amount);
					
					uni.showToast({
						title: '提现申请成功',
						icon: 'success'
					});
					
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				}
			} catch (error) {
				console.error('提现失败:', error);
				let errorMsg = '提现失败，请重试';
				
				if (error.message) {
					if (error.message.includes('余额不足')) {
						errorMsg = '余额不足，无法提现';
					} else if (error.message.includes('密码')) {
						errorMsg = '支付密码错误';
					} else {
						errorMsg = error.message;
					}
				}
				
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				});
			} finally {
				this.loading = false;
			}
		},
		
		// 更新前一页面的余额显示
		updatePreviousPageBalance(withdrawAmount) {
			const pages = getCurrentPages();
			const prevPage = pages[pages.length - 2];
			if (prevPage && prevPage.route.includes('wallet/wallet')) {
				// 减少余额
				const currentBalance = parseFloat(prevPage.balance) || 0;
				const newBalance = Math.max(0, currentBalance - withdrawAmount);
				
				prevPage.balance = newBalance.toFixed(2);
				prevPage.withdrawable = newBalance.toFixed(2);
				
				// 同时更新当前页面的可提现余额
				this.availableBalance = newBalance.toFixed(2);
			}
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 140rpx;
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

/* 可提现余额 */
.balance-section {
	margin: calc(160rpx + env(safe-area-inset-top) + 40rpx) 30rpx 30rpx 30rpx;
	background: linear-gradient(135deg, #fa8c16 0%, #ff9800 100%);
	border-radius: 16rpx;
	padding: 40rpx 30rpx;
	text-align: center;
	box-shadow: 0 8rpx 24rpx rgba(250, 140, 22, 0.3);
}

.balance-label {
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.9);
	display: block;
	margin-bottom: 16rpx;
}

.balance-amount {
	font-size: 72rpx;
	color: #ffffff;
	font-weight: bold;
	display: block;
	letter-spacing: 2rpx;
}

/* 提现金额输入 */
.amount-section {
	margin: 0 30rpx 30rpx 30rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
	font-size: 32rpx;
	color: #333;
	font-weight: bold;
	display: block;
	margin-bottom: 30rpx;
}

.amount-input-container {
	display: flex;
	align-items: center;
	border-bottom: 2rpx solid #e8e8e8;
	padding-bottom: 20rpx;
	margin-bottom: 20rpx;
}

.currency-symbol {
	font-size: 48rpx;
	color: #333;
	font-weight: bold;
	margin-right: 10rpx;
}

.amount-input {
	flex: 1;
	font-size: 48rpx;
	color: #333;
	font-weight: bold;
	border: none;
	outline: none;
}

.amount-actions {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.amount-tip {
	font-size: 26rpx;
	color: #999;
}

.all-amount {
	font-size: 28rpx;
	color: #1890ff;
	padding: 10rpx 20rpx;
	border: 1rpx solid #1890ff;
	border-radius: 8rpx;
}

/* 提现方式 */
.payment-section {
	margin: 0 30rpx 30rpx 30rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.payment-methods {
	margin-top: 30rpx;
}

.payment-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
}

.payment-item.active {
	color: #1890ff;
}

.payment-info {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.payment-icon {
	font-size: 40rpx;
}

.payment-name {
	font-size: 32rpx;
	font-weight: 500;
}

.payment-check {
	font-size: 32rpx;
	color: #1890ff;
	font-weight: bold;
}

/* 支付密码 */
.password-section {
	margin: 0 30rpx 30rpx 30rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.password-input {
	width: 100%;
	height: 80rpx;
	border: 2rpx solid #e8e8e8;
	border-radius: 12rpx;
	padding: 0 20rpx;
	font-size: 32rpx;
	margin-top: 20rpx;
	margin-bottom: 20rpx;
}

.password-input:focus {
	border-color: #1890ff;
}

.password-tip {
	font-size: 26rpx;
	color: #999;
}

/* 提现说明 */
.notice-section {
	margin: 0 30rpx 30rpx 30rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 40rpx 30rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.notice-title {
	font-size: 32rpx;
	color: #333;
	font-weight: bold;
	display: block;
	margin-bottom: 20rpx;
}

.notice-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.notice-item {
	font-size: 28rpx;
	color: #666;
	line-height: 1.5;
}

/* 提现按钮 */
.submit-section {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 30rpx;
	background-color: #ffffff;
	border-top: 1rpx solid #f0f0f0;
	padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.submit-btn {
	width: 100%;
	height: 100rpx;
	background: linear-gradient(135deg, #fa8c16 0%, #ff9800 100%);
	border-radius: 16rpx;
	color: #ffffff;
	font-size: 36rpx;
	font-weight: bold;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
}

.submit-btn.disabled {
	background: #d9d9d9;
	color: #ffffff;
}

.submit-btn:active:not(.disabled) {
	transform: translateY(2rpx);
}
</style>
