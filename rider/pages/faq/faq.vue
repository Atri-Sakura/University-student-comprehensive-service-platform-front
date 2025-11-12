<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">常见问题</text>
			<view class="navbar-right"></view>
		</view>

		<!-- 搜索框 -->
		<view class="search-section">
			<view class="search-bar">
				<text class="search-icon">🔍</text>
				<input class="search-input" placeholder="搜索问题" v-model="searchKeyword" @input="filterQuestions" />
			</view>
		</view>

		<!-- 问题分类 -->
		<view class="category-section">
			<view class="category-tabs">
				<view 
					class="category-tab" 
					:class="{ active: activeCategory === category.key }"
					v-for="category in categories" 
					:key="category.key"
					@tap="selectCategory(category.key)"
				>
					<text class="tab-text">{{ category.name }}</text>
				</view>
			</view>
		</view>

		<!-- 问题列表 -->
		<view class="questions-list">
			<view 
				class="question-item" 
				v-for="(question, index) in filteredQuestions" 
				:key="index"
				@tap="toggleQuestion(index)"
			>
				<view class="question-header">
					<text class="question-title">{{ question.title }}</text>
					<text class="expand-icon" :class="{ expanded: question.expanded }">▼</text>
				</view>
				<view class="question-content" v-if="question.expanded">
					<text class="question-answer">{{ question.answer }}</text>
				</view>
			</view>
		</view>

		<!-- 联系客服 -->
		<view class="contact-section">
			<view class="contact-card">
				<text class="contact-title">没有找到您的问题？</text>
				<text class="contact-desc">联系在线客服获取帮助</text>
				<button class="contact-btn" @tap="contactService">联系客服</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				searchKeyword: '',
				activeCategory: 'all',
				categories: [
					{ key: 'all', name: '全部' },
					{ key: 'order', name: '订单问题' },
					{ key: 'payment', name: '支付问题' },
					{ key: 'delivery', name: '配送问题' },
					{ key: 'account', name: '账号问题' }
				],
				questions: [
					{
						title: '如何查看订单状态？',
						answer: '您可以在"我的订单"页面查看所有订单的详细状态，包括待接单、配送中、已完成等状态。',
						category: 'order',
						expanded: false
					},
					{
						title: '订单可以取消吗？',
						answer: '在骑手接单前，您可以随时取消订单。如果骑手已接单，请联系客服协助处理。',
						category: 'order',
						expanded: false
					},
					{
						title: '如何申请退款？',
						answer: '如果遇到订单问题需要退款，请在订单详情页面点击"申请退款"，或联系客服处理。',
						category: 'payment',
						expanded: false
					},
					{
						title: '支付方式有哪些？',
						answer: '我们支持微信支付、支付宝、银行卡等多种支付方式，您可以根据需要选择。',
						category: 'payment',
						expanded: false
					},
					{
						title: '配送费如何计算？',
						answer: '配送费根据距离、时间等因素动态计算，具体费用在确认订单时会显示。',
						category: 'delivery',
						expanded: false
					},
					{
						title: '配送时间多久？',
						answer: '一般情况下，市内配送30-60分钟，具体时间会根据距离和路况调整。',
						category: 'delivery',
						expanded: false
					},
					{
						title: '如何修改个人信息？',
						answer: '您可以在"个人中心"页面点击"个人信息修改"来更新您的个人资料。',
						category: 'account',
						expanded: false
					},
					{
						title: '忘记密码怎么办？',
						answer: '您可以在登录页面点击"忘记密码"，通过手机验证码重置密码。',
						category: 'account',
						expanded: false
					},
					{
						title: '如何联系客服？',
						answer: '您可以通过"在线客服"功能与客服人员实时沟通，或拨打客服热线400-123-4567。',
						category: 'account',
						expanded: false
					},
					{
						title: '如何查看配送路线？',
						answer: '在订单配送过程中，您可以在"路线"页面实时查看骑手的配送路线和位置。',
						category: 'delivery',
						expanded: false
					}
				]
			}
		},
		computed: {
			filteredQuestions() {
				let filtered = this.questions;
				
				// 按分类筛选
				if (this.activeCategory !== 'all') {
					filtered = filtered.filter(q => q.category === this.activeCategory);
				}
				
				// 按搜索关键词筛选
				if (this.searchKeyword) {
					filtered = filtered.filter(q => 
						q.title.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
						q.answer.toLowerCase().includes(this.searchKeyword.toLowerCase())
					);
				}
				
				return filtered;
			}
		},
		methods: {
			goBack() {
				const pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack({ delta: 1 });
				} else {
					uni.reLaunch({ url: '/pages/index/index' });
				}
			},
			selectCategory(categoryKey) {
				this.activeCategory = categoryKey;
			},
			toggleQuestion(index) {
				// 找到当前显示的问题列表中的问题
				const question = this.filteredQuestions[index];
				const originalIndex = this.questions.findIndex(q => q.title === question.title);
				this.questions[originalIndex].expanded = !this.questions[originalIndex].expanded;
			},
			filterQuestions() {
				// 搜索时自动收起所有展开的问题
				this.questions.forEach(q => q.expanded = false);
			},
			contactService() {
				uni.showToast({
					title: '正在连接客服...',
					icon: 'none'
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

	/* 搜索区域 */
	.search-section {
		margin-top: calc(160rpx + env(safe-area-inset-top));
		padding: 30rpx;
		background-color: #ffffff;
	}

	.search-bar {
		display: flex;
		align-items: center;
		background-color: #f8f8f8;
		border-radius: 12rpx;
		border: 2rpx solid #e0e0e0;
		padding: 20rpx;
		gap: 16rpx;
	}

	.search-icon {
		font-size: 32rpx;
		color: #999;
	}

	.search-input {
		flex: 1;
		font-size: 30rpx;
		color: #333;
		background-color: transparent;
		border: none;
		outline: none;
	}

	.search-input::placeholder {
		color: #999;
	}

	/* 分类标签 */
	.category-section {
		padding: 0 30rpx 20rpx 30rpx;
		background-color: #ffffff;
	}

	.category-tabs {
		display: flex;
		gap: 20rpx;
		overflow-x: auto;
		padding-bottom: 10rpx;
	}

	.category-tab {
		flex-shrink: 0;
		padding: 16rpx 32rpx;
		border-radius: 20rpx;
		background-color: #f8f8f8;
		border: 2rpx solid transparent;
	}

	.category-tab.active {
		background-color: #e6f7ff;
		border-color: #1890ff;
	}

	.tab-text {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
	}

	.category-tab.active .tab-text {
		color: #1890ff;
	}

	/* 问题列表 */
	.questions-list {
		padding: 0 30rpx;
	}

	.question-item {
		background-color: #ffffff;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.question-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.question-item:last-child .question-header {
		border-bottom: none;
	}

	.question-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
		flex: 1;
		line-height: 1.4;
	}

	.expand-icon {
		font-size: 24rpx;
		color: #999;
		transition: transform 0.3s ease;
		margin-left: 20rpx;
	}

	.expand-icon.expanded {
		transform: rotate(180deg);
	}

	.question-content {
		padding: 0 30rpx 30rpx 30rpx;
		background-color: #fafafa;
	}

	.question-answer {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		display: block;
		padding-top: 20rpx;
	}

	/* 联系客服 */
	.contact-section {
		padding: 30rpx;
		margin-top: 20rpx;
	}

	.contact-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 40rpx;
		text-align: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.contact-title {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
		display: block;
		margin-bottom: 12rpx;
	}

	.contact-desc {
		font-size: 28rpx;
		color: #666;
		display: block;
		margin-bottom: 30rpx;
	}

	.contact-btn {
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #ffffff;
		font-size: 30rpx;
		font-weight: bold;
		padding: 20rpx 60rpx;
		border-radius: 44rpx;
		border: none;
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
	}

	.contact-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.3);
	}
</style>
