<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">我的钱包</text>
			<view class="navbar-right"></view>
		</view>

		<!-- 余额卡片 -->
		<view class="balance-card">
			<text class="balance-label">总余额</text>
			<text class="balance-amount">¥{{ balance }}</text>
			<text class="balance-tip">可提现金额：¥{{ withdrawable }}</text>
			<text v-if="balance === '0.00'" class="wallet-init-tip">钱包将在您获得第一笔收入时自动创建</text>
		</view>

		<!-- 操作按钮 -->
		<view class="action-buttons">
			<view class="action-btn withdraw-btn single-btn" @tap="handleWithdraw">
				<text class="btn-icon">💵</text>
				<text class="btn-text">提现</text>
			</view>
		</view>

		<!-- 今日收入 -->
		<view class="today-income-section">
			<text class="section-title">今日收入</text>
			<view class="income-card">
				<text class="income-label">配送收入</text>
				<text class="income-amount">+¥{{ todayIncome }}</text>
			</view>
		</view>

		<!-- 最近交易 -->
		<view class="transaction-section">
			<text class="section-title">最近交易</text>
			<view class="transaction-list">
				<view class="transaction-item" v-for="(item, index) in transactions" :key="index">
					<view class="transaction-info">
						<text class="transaction-title">{{ item.title }}</text>
						<text class="transaction-time">{{ item.time }}</text>
					</view>
					<text class="transaction-amount" :class="item.type === 'income' ? 'income' : 'expense'">
						{{ item.type === 'income' ? '+' : '-' }}¥{{ item.amount }}
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { getWalletBalance } from '../../utils/api/wallet.js';
	
	export default {
		data() {
			return {
				balance: '0.00',
				withdrawable: '0.00',
				todayIncome: '256.80',
				loading: false,
				walletCreated: false, // 标记钱包是否已创建，避免无限循环
				transactions: [
					{
						title: '订单配送收入',
						time: '今天 14:30',
						amount: '18.50',
						type: 'income'
					},
					{
						title: '订单配送收入',
						time: '今天 13:15',
						amount: '22.00',
						type: 'income'
					},
					{
						title: '订单配送收入',
						time: '今天 12:08',
						amount: '15.80',
						type: 'income'
					},
					{
						title: '提现到银行卡',
						time: '昨天 16:45',
						amount: '500.00',
						type: 'expense'
					}
				]
			}
		},
		onLoad() {
			// 检查本地存储的钱包创建状态
			const walletCreatedFlag = uni.getStorageSync('rider_wallet_created');
			this.walletCreated = walletCreatedFlag === 'true';
			this.loadWalletBalance();
		},
		onShow() {
			// 页面显示时重新加载余额（从其他页面返回时）
			// 总是尝试刷新余额，确保数据最新
			this.loadWalletBalance();
		},
		methods: {
			async loadWalletBalance() {
				try {
					this.loading = true;
					const result = await getWalletBalance();
					
					if (result.code === 200) {
						// 后端返回的数据结构：{ code: 200, msg: "操作成功", balance: 200.00 }
						const balance = result.balance || 0;
						this.balance = balance.toFixed(2);
						this.withdrawable = balance.toFixed(2);
						
						// 余额查询成功，说明钱包已正常工作，清除创建标记
						if (this.walletCreated) {
							this.walletCreated = false;
							uni.removeStorageSync('rider_wallet_created');
						}
					}
				} catch (error) {
					console.error('获取钱包余额失败:', error);
					
					// 如果是钱包不存在的错误，显示0余额并提示用户
					if (error.message && error.message.includes('未找到钱包信息')) {
						console.log('钱包未初始化，显示默认余额0.00');
						this.balance = '0.00';
						this.withdrawable = '0.00';
						// 只有在钱包未创建时才弹窗提示，避免无限循环
						if (!this.walletCreated) {
							this.showWalletInitTip();
						}
					} else {
						// 其他网络错误或系统错误才显示错误提示
						uni.showToast({
							title: '网络异常，请稍后重试',
							icon: 'none'
						});
					}
				} finally {
					this.loading = false;
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
			handleWithdraw() {
				uni.navigateTo({
					url: `/pages/wallet/withdraw?balance=${this.withdrawable}`
				});
			},
			
			// 显示钱包初始化提示
			showWalletInitTip() {
				uni.showModal({
					title: '钱包未激活',
					content: '检测到您还没有钱包，钱包将在您获得第一笔收入时自动创建。',
					confirmText: '我知道了',
					showCancel: false
				});
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

	/* 余额卡片 */
	.balance-card {
		margin: calc(160rpx + env(safe-area-inset-top) + 40rpx) 30rpx 30rpx 30rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 24rpx;
		padding: 50rpx 40rpx;
		box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.3);
	}

	.balance-label {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		display: block;
		margin-bottom: 16rpx;
	}

	.balance-amount {
		font-size: 80rpx;
		color: #ffffff;
		font-weight: bold;
		display: block;
		margin-bottom: 16rpx;
		letter-spacing: 2rpx;
	}

	.balance-tip {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.85);
		display: block;
	}

	.wallet-init-tip {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.7);
		display: block;
		margin-top: 8rpx;
		font-style: italic;
	}

	/* 操作按钮 */
	.action-buttons {
		display: flex;
		gap: 20rpx;
		margin: 0 30rpx 40rpx 30rpx;
	}

	.action-btn {
		flex: 1;
		height: 100rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}
	
	.action-btn.single-btn {
		max-width: 400rpx;
		margin: 0 auto;
	}

	.withdraw-btn {
		background: linear-gradient(135deg, #fa8c16 0%, #ff9800 100%);
	}


	.action-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.btn-icon {
		font-size: 36rpx;
	}

	.btn-text {
		font-size: 32rpx;
		color: #ffffff;
		font-weight: bold;
	}

	/* 今日收入 */
	.today-income-section {
		margin: 0 30rpx 40rpx 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
		display: block;
		margin-bottom: 20rpx;
	}

	.income-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.income-label {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}

	.income-amount {
		font-size: 36rpx;
		color: #52c41a;
		font-weight: bold;
	}

	/* 最近交易 */
	.transaction-section {
		margin: 0 30rpx;
	}

	.transaction-list {
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.transaction-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.transaction-item:last-child {
		border-bottom: none;
	}

	.transaction-item:active {
		background-color: #f8f8f8;
	}

	.transaction-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.transaction-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}

	.transaction-time {
		font-size: 26rpx;
		color: #999;
	}

	.transaction-amount {
		font-size: 36rpx;
		font-weight: bold;
	}

	.transaction-amount.income {
		color: #52c41a;
	}

	.transaction-amount.expense {
		color: #ff4d4f;
	}
</style>

