<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-back" @tap="goBack">‹</text>
			<text class="nav-title">客服聊天</text>
			<view class="nav-actions">
				<text class="service-status online">在线</text>
			</view>
		</view>

		<!-- 聊天内容 -->
		<scroll-view class="chat-content" scroll-y :scroll-top="scrollTop" scroll-with-animation>
			<view class="chat-list">
				<view 
					class="chat-item" 
					:class="{ 'chat-self': message.isSelf }"
					v-for="(message, index) in chatMessages" 
					:key="index"
					:id="'msg-' + index"
				>
					<!-- 客服消息：头像在左，气泡在右 -->
					<template v-if="!message.isSelf">
						<view class="chat-avatar">
							<text class="avatar-icon service">👥</text>
						</view>
						<view class="chat-bubble">
							<text class="chat-text">{{ message.content }}</text>
							<text class="chat-time">{{ formatTime(message.time) }}</text>
						</view>
					</template>
					
					<!-- 骑手消息：气泡在左，头像在右 -->
					<template v-else>
						<view class="chat-bubble self">
							<text class="chat-text">{{ message.content }}</text>
							<text class="chat-time">{{ formatTime(message.time) }}</text>
						</view>
						<view class="chat-avatar">
							<text class="avatar-icon user">👤</text>
						</view>
					</template>
				</view>
				<!-- 底部锚点 -->
				<view id="chat-bottom" style="height: 1rpx;"></view>
			</view>
		</scroll-view>


		<!-- 输入区域 -->
		<view class="input-section">
			<view class="input-wrapper">
				<input 
					class="message-input" 
					v-model="inputMessage"
					placeholder="请输入消息..."
					confirm-type="send"
					@confirm="sendMessage"
					:focus="inputFocus"
				/>
				<view class="input-actions">
					<text class="action-btn" @tap="showMoreActions">+</text>
					<button class="send-btn" :disabled="!inputMessage.trim()" @tap="sendMessage">发送</button>
				</view>
			</view>
		</view>

		<!-- 更多操作面板 -->
		<view class="more-panel" v-if="showMore" @tap="hideMoreActions">
			<view class="panel-content" @tap.stop="">
				<view class="panel-header">
					<text class="panel-title">更多功能</text>
					<text class="panel-close" @tap="hideMoreActions">×</text>
				</view>
				<view class="panel-actions">
					<view class="action-item" @tap="chooseImage">
						<text class="action-icon">📷</text>
						<text class="action-text">发送图片</text>
					</view>
					<view class="action-item" @tap="callService">
						<text class="action-icon">📞</text>
						<text class="action-text">语音通话</text>
					</view>
					<view class="action-item" @tap="sendLocation">
						<text class="action-icon">📍</text>
						<text class="action-text">发送位置</text>
					</view>
					<view class="action-item" @tap="reportProblem">
						<text class="action-icon">⚠️</text>
						<text class="action-text">问题反馈</text>
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
			inputMessage: '',
			inputFocus: false,
			scrollTop: 0,
			showMore: false,
			chatMessages: [
				{
					content: '您好！欢迎使用客服服务，我是您的专属客服小助手。请问有什么可以帮助您的吗？',
					time: new Date(Date.now() - 10 * 60 * 1000),
					isSelf: false
				},
				{
					content: '我想咨询一下配送费的计算规则',
					time: new Date(Date.now() - 8 * 60 * 1000),
					isSelf: true
				},
				{
					content: '好的，配送费主要由以下几部分组成：\n\n1. 基础配送费：根据距离计算\n2. 时间段费用：高峰期会有额外费用\n3. 天气补贴：恶劣天气时的额外补贴\n4. 特殊订单费：大件或特殊商品的额外费用\n\n具体费用会在接单时显示，您还有其他问题吗？',
					time: new Date(Date.now() - 7 * 60 * 1000),
					isSelf: false
				}
			]
		}
	},
	
	onLoad() {
		this.scrollToBottom();
	},
	
	watch: {
		chatMessages: {
			handler() {
				// 当消息数组变化时自动滚动到底部
				this.$nextTick(() => {
					this.scrollToBottom();
				});
			},
			deep: true
		}
	},
	
	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 });
		},
		
		formatTime(time) {
			const date = new Date(time);
			return date.toLocaleTimeString('zh-CN', {
				hour: '2-digit',
				minute: '2-digit'
			});
		},
		
		sendMessage() {
			if (!this.inputMessage.trim()) return;
			
			// 添加用户消息
			this.chatMessages.push({
				content: this.inputMessage,
				time: new Date(),
				isSelf: true
			});
			
			const userMessage = this.inputMessage;
			this.inputMessage = '';
			
			// 立即滚动到底部
			setTimeout(() => {
				this.scrollToBottom();
			}, 50);
			
			// 模拟客服回复
			setTimeout(() => {
				this.simulateServiceReply(userMessage);
			}, 1000);
		},
		
		
		simulateServiceReply(userMessage) {
			let reply = '';
			
			if (userMessage.includes('配送费') || userMessage.includes('费用')) {
				reply = '关于配送费用，您可以在订单详情中查看具体的费用明细。如果对费用有疑问，可以联系我们进行核实。';
			} else if (userMessage.includes('订单') || userMessage.includes('接单')) {
				reply = '订单相关问题我来帮您解答。请告诉我具体是什么问题，比如订单状态、接单流程等。';
			} else if (userMessage.includes('账户') || userMessage.includes('密码')) {
				reply = '账户安全很重要，如果遇到账户问题，建议您及时修改密码并联系我们处理。';
			} else if (userMessage.includes('谢谢') || userMessage.includes('明白')) {
				reply = '不客气！如果还有其他问题，随时可以联系我。祝您工作顺利！';
			} else {
				reply = '我已经收到您的问题，正在为您查询相关信息，请稍等片刻...';
			}
			
			this.chatMessages.push({
				content: reply,
				time: new Date(),
				isSelf: false
			});
			
			// 客服回复后滚动到底部
			setTimeout(() => {
				this.scrollToBottom();
			}, 50);
		},
		
		scrollToBottom() {
			this.$nextTick(() => {
				// 使用递增的值确保每次都能触发滚动
				this.scrollTop = this.scrollTop === 99999 ? 99998 : 99999;
			});
		},
		
		showMoreActions() {
			this.showMore = true;
		},
		
		hideMoreActions() {
			this.showMore = false;
		},
		
		chooseImage() {
			this.hideMoreActions();
			uni.chooseImage({
				count: 1,
				success: (res) => {
					// 模拟发送图片
					this.chatMessages.push({
						content: '[图片]',
						time: new Date(),
						isSelf: true,
						type: 'image',
						image: res.tempFilePaths[0]
					});
					
					// 模拟客服回复
					setTimeout(() => {
						this.chatMessages.push({
							content: '我已经收到您发送的图片，正在为您分析处理...',
							time: new Date(),
							isSelf: false
						});
					}, 1000);
				}
			});
		},
		
		callService() {
			this.hideMoreActions();
			uni.showModal({
				title: '语音通话',
				content: '即将为您转接人工客服，是否继续？',
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
		
		sendLocation() {
			this.hideMoreActions();
			uni.getLocation({
				type: 'wgs84',
				success: (res) => {
					this.chatMessages.push({
						content: `[位置] 纬度：${res.latitude.toFixed(6)}，经度：${res.longitude.toFixed(6)}`,
						time: new Date(),
						isSelf: true,
						type: 'location'
					});
					
					// 模拟客服回复
					setTimeout(() => {
						this.chatMessages.push({
							content: '我已经收到您的位置信息，如果需要帮助请告诉我具体情况。',
							time: new Date(),
							isSelf: false
						});
					}, 1000);
				},
				fail: () => {
					uni.showToast({
						title: '获取位置失败',
						icon: 'none'
					});
				}
			});
		},
		
		reportProblem() {
			this.hideMoreActions();
			uni.navigateTo({
				url: '/pages/feedback/feedback'
			});
		}
	}
}
</script>

<style scoped>
	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
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

	.nav-actions {
		position: absolute;
		right: 30rpx;
		bottom: 22rpx;
	}

	.service-status {
		font-size: 24rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-weight: 500;
	}

	.service-status.online {
		background-color: #f6ffed;
		color: #52c41a;
	}

	/* 聊天内容 */
	.chat-content {
		flex: 1;
		padding: 20rpx;
		padding-bottom: 120rpx; /* 为固定的输入区域留出空间 */
	}

	.chat-list {
		padding-bottom: 20rpx;
	}

	.chat-item {
		display: flex;
		margin-bottom: 30rpx;
		align-items: flex-end;
	}

	.chat-item.chat-self {
		justify-content: flex-end;
	}

	.chat-avatar {
		margin: 0 16rpx;
		flex-shrink: 0;
	}

	.avatar-icon {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
	}

	.avatar-icon.service {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	.avatar-icon.user {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.chat-bubble {
		max-width: 480rpx;
		padding: 20rpx 24rpx;
		border-radius: 20rpx;
		position: relative;
	}

	.chat-bubble:not(.self) {
		background-color: #ffffff;
		border-bottom-left-radius: 8rpx;
	}

	.chat-bubble.self {
		background-color: #1890ff;
		border-bottom-right-radius: 8rpx;
	}

	.chat-text {
		font-size: 28rpx;
		line-height: 1.6;
		white-space: pre-line;
		display: block;
		margin-bottom: 8rpx;
	}

	.chat-bubble:not(.self) .chat-text {
		color: #333333;
	}

	.chat-bubble.self .chat-text {
		color: #ffffff;
	}

	.chat-time {
		font-size: 20rpx;
		opacity: 0.7;
	}

	.chat-bubble:not(.self) .chat-time {
		color: #999999;
	}

	.chat-bubble.self .chat-time {
		color: #ffffff;
	}


	/* 输入区域 */
	.input-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx;
		background-color: #ffffff;
		border-top: 1rpx solid #f0f0f0;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		z-index: 100;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.message-input {
		flex: 1;
		height: 72rpx;
		padding: 0 20rpx;
		border: 2rpx solid #f0f0f0;
		border-radius: 36rpx;
		font-size: 28rpx;
		background-color: #f8f9fa;
	}

	.input-actions {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.action-btn {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background-color: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		color: #666666;
	}

	.send-btn {
		height: 64rpx;
		padding: 0 24rpx;
		background-color: #1890ff;
		color: #ffffff;
		border: none;
		border-radius: 32rpx;
		font-size: 28rpx;
	}

	.send-btn[disabled] {
		background-color: #d9d9d9;
		color: #999999;
	}

	/* 更多操作面板 */
	.more-panel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 100;
		display: flex;
		align-items: flex-end;
	}

	.panel-content {
		width: 100%;
		background-color: #ffffff;
		border-radius: 20rpx 20rpx 0 0;
		padding: 30rpx;
		padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.panel-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
	}

	.panel-close {
		font-size: 40rpx;
		color: #999999;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.panel-actions {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 30rpx;
	}

	.action-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
	}

	.action-icon {
		font-size: 48rpx;
		margin-bottom: 16rpx;
	}

	.action-text {
		font-size: 24rpx;
		color: #666666;
		text-align: center;
	}
</style>
