<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<text class="navbar-title">个人中心</text>
		</view>
		
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-info">
				<image class="avatar" :src="userInfo.avatar" mode="aspectFill"></image>
				<view class="user-detail">
					<text class="username">{{ userInfo.name }}</text>
					<view class="rating">
						<text class="star">⭐</text>
						<text class="score">{{ userInfo.rating }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 数据统计卡片 -->
		<view class="stats-card">
			<view class="stat-item" @click="goToOrders">
				<text class="stat-number">{{ statistics.todayCompleted }}</text>
				<text class="stat-label">今日完成</text>
				<view class="stat-link">
					<text>我的订单</text>
					<text class="arrow">〉</text>
				</view>
			</view>
			<view class="divider"></view>
			<view class="stat-item" @click="goToWallet">
				<text class="stat-number">{{ statistics.todayIncome }}</text>
				<text class="stat-label">今日收入</text>
				<view class="stat-link">
					<text>我的钱包</text>
					<text class="arrow">〉</text>
				</view>
			</view>
		</view>

		<!-- 我的服务 -->
		<view class="service-section">
			<text class="section-title">我的服务</text>
			
			<view class="service-grid">
				<view class="service-item" @click="handleService('profile')">
					<view class="service-icon">✏️</view>
					<text class="service-text">个人信息\n修改</text>
				</view>
				<view class="service-item" @click="handleService('security')">
					<view class="service-icon">🛡️</view>
					<text class="service-text">账号安全</text>
				</view>
				<view class="service-item" @click="handleService('privacy')">
					<view class="service-icon">🕵️</view>
					<text class="service-text">隐私设置</text>
				</view>
				<view class="service-item" @click="handleService('certificate')">
					<view class="service-icon">📇</view>
					<text class="service-text">资质认证</text>
				</view>
				<view class="service-item" @click="handleService('rating')">
					<view class="service-icon">⭐</view>
					<text class="service-text">服务评价</text>
				</view>
				<view class="service-item" @click="handleService('support')">
					<view class="service-icon">🎧</view>
					<text class="service-text">在线客服</text>
				</view>
				<view class="service-item" @click="handleService('faq')">
					<view class="service-icon">❓</view>
					<text class="service-text">常见问题</text>
				</view>
				<view class="service-item" @click="handleService('feedback')">
					<view class="service-icon">💬</view>
					<text class="service-text">意见反馈</text>
				</view>
			</view>
		</view>

		<!-- 退出登录按钮 -->
		<view class="logout-section">
			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>
		
		<tabbar :current="3"></tabbar>
	</view>
</template>

<script>
	import { getRiderBaseInfo } from '@/utils/profile-api.js';
	import { getMyEvaluationStatistics } from '@/utils/api/evaluation.js';
	import { getRiderWalletFlow } from '@/utils/api/wallet.js';
	import { logout } from '@/utils/api/auth.js';
	
	export default {
		data() {
			return {
				userInfo: {
					name: '未设置',  // 显示骑手昵称
					rating: 4.8,
					avatar: '/static/logo.png'
				},
				statistics: {
					todayCompleted: 0,
					todayIncome: '0.00'
				},
				loading: false
			}
		},
		onLoad() {
			// 页面加载时获取骑手信息
			this.loadRiderInfo();
		},
		onShow() {
			// 返回时再同步一次，保证个人中心显示最新数据
			this.loadRiderInfo();
		},
		methods: {
			// 加载骑手信息
			async loadRiderInfo() {
				if (this.loading) return;
				
				this.loading = true;
				try {
					// 并行请求获取骑手基本信息、评价统计信息
					const [baseInfoResponse, evaluationResponse] = await Promise.all([
						getRiderBaseInfo(),
						getMyEvaluationStatistics()
					]);
					
					// 更新骑手基本信息
					if (baseInfoResponse.code === 200 && baseInfoResponse.data) {
						const data = baseInfoResponse.data;
						console.log('🏠 个人中心获取到的数据:', data);
						
						// 更新用户信息，优先显示昵称，如果没有昵称则显示真实姓名
						this.userInfo = {
							...this.userInfo,
							name: data.nickname || data.realName || '未设置',
							avatar: data.avatar || '/static/logo.png'
						};
						
						// 保存到本地缓存
						uni.setStorageSync('riderInfo', {
							nickname: data.nickname,
							realName: data.realName,
							avatar: data.avatar,
							phone: data.phone,
							riderBaseId: data.riderBaseId,
							accountStatus: data.accountStatus,
							creditScore: data.creditScore,
							createTime: data.createTime
						});
					} else {
						// 如果接口失败，从本地缓存获取
						this.loadFromCache();
					}
					
					// 更新评价统计信息
					if (evaluationResponse.code === 200 && evaluationResponse.data) {
						const evalStats = evaluationResponse.data;
						console.log('⭐ 个人中心获取到的评价统计:', evalStats);
						
						// 更新综合评分，只有当avgRating为null或undefined时才使用默认值，0是有效的评分
						this.userInfo = {
							...this.userInfo,
							rating: evalStats.avgRating !== null && evalStats.avgRating !== undefined ? evalStats.avgRating : this.userInfo.rating
						};
					}
					
					// 更新订单统计信息：通过钱包流水计算今日收入
					await this.loadTodayIncome();
					
					console.log('📱 个人中心更新后的用户信息:', this.userInfo);
					console.log('📊 个人中心订单统计:', this.statistics);
				} catch (error) {
					console.error('个人中心获取骑手信息失败:', error);
					// 网络错误时从本地缓存获取
					this.loadFromCache();
				} finally {
					this.loading = false;
				}
			},
			
			// 从本地缓存加载数据
			loadFromCache() {
				try {
					const riderInfo = uni.getStorageSync('riderInfo');
					if (riderInfo) {
						this.userInfo = {
							...this.userInfo,
							name: riderInfo.nickname || riderInfo.realName || '未设置',
							avatar: riderInfo.avatar || '/static/logo.png'
						};
						console.log('💾 从缓存加载的用户信息:', this.userInfo);
					}
				} catch (e) {
					console.log('获取缓存信息失败:', e);
				}
			},
			
			goToOrders() {
				uni.navigateTo({ url: '/pages/orders/orders' });
			},
			goToWallet() {
				uni.navigateTo({ url: '/pages/wallet/wallet' });
			},

			// 加载今日收入：通过钱包流水计算
			async loadTodayIncome() {
				try {
					const result = await getRiderWalletFlow();
					// 检查响应结构
					console.log('个人中心钱包流水接口响应:', result);
					
					// 获取当前日期（用于判断今日交易）
					const today = new Date();
					// 使用统一的日期格式进行比较（格式：YYYY-MM-DD）
					const todayYear = today.getFullYear();
					const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
					const todayDay = String(today.getDate()).padStart(2, '0');
					const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;
					
					// 处理API响应：从data字段获取交易记录数组
					const flowData = result.data || [];
					
					console.log('个人中心处理后的流水数据:', flowData);
					console.log('个人中心今日日期:', todayStr);
					
					// 初始化今日订单计数器和收入
					let todayCompleted = 0;
					let todayIncomeTotal = 0;
					
					// 遍历流水记录，计算今日收入
					if (flowData && flowData.length > 0) {
						flowData.forEach(item => {
							// 确定交易类型：根据tradeType或amount判断
							const type = (item.tradeType === 1 || item.amount > 0) ? 'income' : 'expense';
							
							try {
								// 使用tradeTime字段作为时间来源
								const tradeTime = item.tradeTime;
								
								// 如果tradeTime存在且是有效的日期字符串，则解析为日期
								if (tradeTime) {
									const date = new Date(tradeTime);
									
									// 检查是否是今日的订单配送收入
									const tradeYear = date.getFullYear();
									const tradeMonth = String(date.getMonth() + 1).padStart(2, '0');
									const tradeDay = String(date.getDate()).padStart(2, '0');
									const tradeDate = `${tradeYear}-${tradeMonth}-${tradeDay}`;
									
									// 调试日志：检查每个交易记录的属性
									console.log('个人中心交易记录:', {
										tradeDate, 
										todayStr, 
										type, 
										remark: item.remark, 
										amount: item.amount
									});
									
									// 检查是否是今日的订单配送收入
									if (tradeDate === todayStr && type === 'income' && item.remark && 
										(item.remark.includes('订单收入') || item.remark.includes('订单配送收入'))) {
										todayCompleted++;
										todayIncomeTotal += parseFloat(item.amount);
										console.log('个人中心匹配到今日订单收入:', item.amount);
									}
								}
							} catch (e) {
								// 如果日期格式不正确，跳过该记录
								console.error('个人中心处理交易记录日期失败:', e);
							}
						});
					}
					
					// 更新今日完成订单数和今日收入
					this.statistics = {
						todayCompleted: todayCompleted,
						todayIncome: todayIncomeTotal.toFixed(2)
					};
					
					console.log('个人中心今日订单数量:', todayCompleted);
					console.log('个人中心今日订单收入:', todayIncomeTotal.toFixed(2));
				} catch (error) {
					console.error('个人中心获取钱包流水失败:', error);
					// 如果获取失败，保持当前统计数据不变
				}
			},
		handleService(type) {
			if (type === 'profile') {
				uni.navigateTo({ url: '/pages/profile/profile' });
				return;
			}
			if (type === 'security') {
				uni.navigateTo({ url: '/pages/security/security' });
				return;
			}
			if (type === 'privacy') {
				uni.navigateTo({ url: '/pages/privacy/privacy' });
				return;
			}
			if (type === 'certificate') {
				uni.navigateTo({ url: '/pages/certification/certification' });
				return;
			}
			if (type === 'faq') {
				uni.navigateTo({ url: '/pages/faq/faq' });
				return;
			}
			if (type === 'violation') {
				uni.navigateTo({ url: '/pages/violation/violation' });
				return;
			}
			if (type === 'rating') {
				uni.navigateTo({ url: '/pages/rating/rating' });
				return;
			}
			if (type === 'support') {
					uni.navigateTo({ url: '/pages/message/customer-service' });
					return;
				}
				
				if (type === 'feedback') {
					uni.navigateTo({ url: '/pages/feedback/feedback' });
					return;
				}
				
				// 其他未实现的功能显示提示
				const serviceNames = {
				support: '在线客服'
				};
				
				uni.showToast({
				title: '功能开发中',
				icon: 'none'
				});
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
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx;
		padding-top: 0;
	}
	
	/* 自定义导航栏 */
	.custom-navbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 100rpx;
		background-color: #ffffff;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding-top: env(safe-area-inset-top);
		padding-bottom: 16rpx;
		z-index: 999;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.navbar-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	/* 用户信息卡片 */
	.user-card {
		background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
		margin: 30rpx;
		margin-top: calc(100rpx + env(safe-area-inset-top) + 40rpx);
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(9, 132, 227, 0.3);
	}

	.user-info {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 60rpx;
		background-color: #fff;
		border: 4rpx solid rgba(255, 255, 255, 0.5);
	}

	.user-detail {
		margin-left: 30rpx;
		flex: 1;
	}

	.username {
		font-size: 44rpx;
		color: #fff;
		font-weight: bold;
		display: block;
		margin-bottom: 10rpx;
	}

	.rating {
		display: flex;
		align-items: center;
	}

	.star {
		font-size: 36rpx;
		margin-right: 8rpx;
	}

	.score {
		font-size: 36rpx;
		color: #fff;
		font-weight: bold;
	}

	/* 数据统计卡片 */
	.stats-card {
		background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
		margin: 60rpx 30rpx;
		border-radius: 24rpx;
		padding: 40rpx;
		display: flex;
		justify-content: space-around;
		align-items: center;
		box-shadow: 0 8rpx 24rpx rgba(9, 132, 227, 0.3);
	}

	.stat-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.stat-number {
		font-size: 60rpx;
		color: #fff;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.stat-label {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 20rpx;
	}

	.stat-link {
		display: flex;
		align-items: center;
		color: #fff;
		font-size: 26rpx;
	}

	.arrow {
		margin-left: 8rpx;
		font-size: 24rpx;
	}

	.divider {
		width: 2rpx;
		height: 120rpx;
		background-color: rgba(255, 255, 255, 0.3);
	}

	/* 我的服务 */
	.service-section {
		background-color: #fff;
		margin: 60rpx 30rpx 30rpx 30rpx;
		border-radius: 24rpx;
		padding: 40rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
		display: block;
	}

	.service-grid {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		margin-bottom: 50rpx;
		gap: 60rpx 0;
	}



	.service-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		width: 25%;
		box-sizing: border-box;
		padding: 0 20rpx;
	}

	.service-icon {
		width: 88rpx;
		height: 88rpx;
		background-color: #f0f0f0;
		border-radius: 44rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 44rpx;
		margin-bottom: 16rpx;
	}

	.service-text {
		font-size: 24rpx;
		color: #666;
		text-align: center;
		line-height: 1.4;
	}

	/* 退出登录区域 */
	.logout-section {
		margin: 40rpx 30rpx 30rpx 30rpx;
		padding-bottom: 30rpx;
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

