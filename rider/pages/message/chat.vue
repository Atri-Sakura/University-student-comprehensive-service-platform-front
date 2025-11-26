<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-back" @tap="goBack">‹</text>
			<text class="nav-title">{{ title }}</text>
			<view class="nav-actions">
				<!-- <text class="service-status online">在线</text> -->
			</view>
		</view>

		<!-- 聊天内容 -->
		<scroll-view class="chat-content" scroll-y :scroll-top="scrollTop" scroll-with-animation>
			<view class="chat-list">
				<view 
					class="chat-item" 
					:class="{ 'chat-self': isSelf(message) }"
					v-for="(message, index) in chatMessages" 
					:key="message.messageId || index"
					:id="'msg-' + index"
				>
					<!-- 对方消息：头像在左，气泡在右 -->
					<template v-if="!isSelf(message)">
						<view class="chat-avatar">
							<text class="avatar-icon service">👤</text>
						</view>
						<view class="chat-bubble">
							<text class="chat-text">{{ message.msgContent }}</text>
							<text class="chat-time">{{ formatTime(message.sendTime) }}</text>
						</view>
					</template>
					
					<!-- 自己消息：气泡在左，头像在右 -->
					<template v-else>
						<view class="chat-bubble self">
							<text class="chat-text">{{ message.msgContent }}</text>
							<text class="chat-time">{{ formatTime(message.sendTime) }}</text>
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
					@confirm="handleSendMessage"
					:focus="inputFocus"
				/>
				<view class="input-actions">
					<text class="action-btn" @tap="showMoreActions">+</text>
					<button class="send-btn" :disabled="!inputMessage.trim()" @tap="handleSendMessage">发送</button>
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
					<!-- 暂时只实现图片发送逻辑，其他功能可扩展 -->
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { sendMessage, getMessageList, getMessagesFromTo, markSessionRead } from '@/utils/api';

export default {
	data() {
		return {
			title: '聊天',
			sessionId: null,
			toId: null,
			toType: null,
			fromId: null,
			fromType: 2, // 假设骑手类型为2
			
			inputMessage: '',
			inputFocus: false,
			scrollTop: 0,
			showMore: false,
			chatMessages: [],
			
			refreshTimer: null
		}
	},
	
	onLoad(options) {
		this.sessionId = options.sessionId;
		this.toId = options.toId;
		this.toType = options.toType;
		this.title = options.title || '聊天';
		
		const riderInfo = uni.getStorageSync('riderInfo');
		if (riderInfo && riderInfo.id) {
			this.fromId = riderInfo.id;
		}
		
		this.loadMessages();
		
		// 开始轮询新消息
		this.startPolling();
	},
	
	onUnload() {
		this.stopPolling();
	},
	
	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 });
		},
		
		formatTime(time) {
			if (!time) return '';
			const date = new Date(time);
			return date.toLocaleTimeString('zh-CN', {
				hour: '2-digit',
				minute: '2-digit'
			});
		},
		
		isSelf(message) {
			return message.fromId == this.fromId && message.fromType == this.fromType;
		},
		
		async loadMessages() {
			try {
				let res;
				if (this.sessionId) {
					res = await getMessageList({
						sessionId: this.sessionId,
						// 可以添加分页逻辑
					});
				} else if (this.fromId && this.toId) {
					res = await getMessagesFromTo({
						fromType: this.fromType,
						fromId: this.fromId,
						toType: this.toType,
						toId: this.toId
					});
				}
				
				if (res && res.code === 200) {
					// 假设返回的是消息列表
					this.chatMessages = res.data || [];
					this.scrollToBottom();
					
					// 标记已读
					if (this.sessionId) {
						markSessionRead(this.sessionId);
					}
				}
			} catch (e) {
				console.error('加载消息失败', e);
			}
		},
		
		async handleSendMessage() {
			if (!this.inputMessage.trim()) return;
			
			const content = this.inputMessage;
			this.inputMessage = ''; // 清空输入框
			
			const msgData = {
				sessionId: this.sessionId, // 如果没有会话ID，后端可能需要处理新建会话逻辑，或者我们这里不传
				fromType: this.fromType,
				fromId: this.fromId,
				toType: this.toType,
				toId: this.toId,
				msgType: 1, // 文本
				msgContent: content,
				msgStatus: 0,
				isDeleted: 0,
				version: 1
			};
			
			try {
				const res = await sendMessage(msgData);
				if (res.code === 200) {
					// 发送成功，刷新列表或追加
					// 如果是新会话，后端可能会返回sessionId
					if (!this.sessionId && res.data && res.data.sessionId) {
						this.sessionId = res.data.sessionId;
					}
					
					// 简单的追加到本地列表（实际应该以服务器返回为准）
					this.chatMessages.push({
						...msgData,
						sendTime: new Date(),
						messageId: res.data ? res.data.messageId : Date.now() // 临时ID
					});
					
					this.scrollToBottom();
				} else {
					uni.showToast({ title: res.msg || '发送失败', icon: 'none' });
				}
			} catch (e) {
				console.error('发送消息失败', e);
				uni.showToast({ title: '发送失败', icon: 'none' });
			}
		},
		
		startPolling() {
			this.refreshTimer = setInterval(() => {
				this.loadMessages();
			}, 5000); // 5秒刷新一次
		},
		
		stopPolling() {
			if (this.refreshTimer) {
				clearInterval(this.refreshTimer);
				this.refreshTimer = null;
			}
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
					// 上传图片并发送消息逻辑...
					// 暂未实现文件上传API，仅做示例
					uni.showToast({ title: '图片发送开发中', icon: 'none' });
				}
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
