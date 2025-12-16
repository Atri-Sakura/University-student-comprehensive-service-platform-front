<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-back" @tap="goBack">←</text>
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
					v-for="(message, index) in messages" 
					:key="message.messageId || index"
					:id="'msg-' + index"
				>
					<!-- 对方消息（用户）：头像在左 -->
					<template v-if="!isSelf(message)">
						<view class="chat-avatar">
							<image class="avatar-img" :src="userAvatar" mode="aspectFill"></image>
						</view>
						<view class="chat-main">
							<text class="chat-label">{{ userName }}</text>
							<view class="chat-bubble">
								<text class="chat-text">{{ message.msgContent }}</text>
							</view>
						</view>
					</template>
					
					<!-- 自己消息（骑手）：头像在右 -->
					<template v-else>
						<view class="chat-main self">
							<text class="chat-label">我</text>
							<view class="chat-bubble self">
								<text class="chat-text">{{ message.msgContent }}</text>
							</view>
						</view>
						<view class="chat-avatar">
							<image class="avatar-img" :src="riderAvatar" mode="aspectFill"></image>
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
// WebSocket实时通信（protobufjs已安装）
import wsManager from '@/utils/websocket-protobuf-manager.js';
import { markMessagesAsRead, USER_TYPE, MSG_TYPE, MSG_STATUS } from '@/utils/api/message.js';
import { markSessionAsRead } from '@/utils/api/session.js';
import { sendMessage, getMessageList } from '@/utils/api/chat.js';

export default {
	data() {
		return {
			title: '聊天',
			sessionId: null,
			toId: null,
			toType: null,
			fromId: null,
			fromType: USER_TYPE.RIDER,
			currentUser: null,
			wsConnected: false,
			
			// 用户信息
			userName: '用户',
			userAvatar: '/static/logo.png',
			// 骑手信息
			riderName: '骑手',
			riderAvatar: '/static/logo.png',
			
			inputMessage: '',
			messages: [],
			inputFocus: false,
			scrollTop: 0,
			showMore: false,
			
			refreshTimer: null
		};
	},
	
	onLoad(options) {
		console.log('====== 聊天页面参数 ======');
		console.log('options:', options);
		console.log('sessionId:', options.sessionId);
		console.log('fromType:', options.fromType);
		console.log('fromId:', options.fromId);
		console.log('toType:', options.toType);
		console.log('toId:', options.toId);
		
		this.sessionId = options.sessionId;
		this.toId = options.toId;
		this.toType = parseInt(options.toType);
		this.fromType = parseInt(options.fromType) || USER_TYPE.RIDER;
		this.fromId = options.fromId;
		this.title = decodeURIComponent(options.title || '聊天');
		
		// 如果没有fromId，从本地存储获取
		if (!this.fromId) {
			const riderInfo = uni.getStorageSync('riderInfo');
			const riderId = uni.getStorageSync('riderId');
			console.log('riderInfo:', riderInfo);
			console.log('riderId:', riderId);
			
			if (riderInfo && riderInfo.id) {
				this.fromId = riderInfo.id;
			} else if (riderId) {
				this.fromId = riderId;
			}
		}
		
		console.log('最终参数:');
		console.log('  sessionId:', this.sessionId);
		console.log('  fromType:', this.fromType);
		console.log('  fromId:', this.fromId);
		console.log('  toType:', this.toType);
		console.log('  toId:', this.toId);
		
		this.loadMessages();
		
		// 开始轮询新消息（暂时禁用，便于调试）
		// this.startPolling();
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
			// 骑手端：fromType=2 的消息是骑手发的，显示在右边
			// 同时检查fromId是否匹配当前骑手（比较前10位避免精度问题）
			const msgFromType = Number(message.fromType);
			const msgFromId = String(message.fromId || '');
			const myId = String(this.fromId || '');
			
			// 骑手类型且ID匹配
			const isRiderType = msgFromType === 2;
			const isIdMatch = msgFromId.substring(0, 10) === myId.substring(0, 10);
			
			return isRiderType && isIdMatch;
		},
		
		async loadMessages() {
			try {
				console.log('====== 开始加载消息 ======');
				console.log('sessionId:', this.sessionId);
				console.log('fromId:', this.fromId);
				console.log('toId:', this.toId);
				
				// 使用sessionId查询消息（后端支持按sessionId过滤）
				const response = await getMessageList({
					sessionId: this.sessionId,
					pageSize: 100
				});
				
				console.log('消息查询结果:', response);
				
				let allMessages = [];
				if (response.code === 200 && response.data) {
					allMessages = response.data;
				}
				
				// 打印每条消息的详细信息
				console.log('原始消息列表:');
				allMessages.forEach((msg, index) => {
					console.log(`消息${index}:`, {
						messageId: msg.messageId,
						content: msg.msgContent,
						fromType: msg.fromType,
						fromId: msg.fromId
					});
				});
				
				if (allMessages.length > 0) {
					// 按messageId去重
					const uniqueMessages = [];
					const seenIds = new Set();
					
					allMessages.forEach(msg => {
						const msgId = String(msg.messageId || msg.id || '');
						if (msgId && !seenIds.has(msgId)) {
							seenIds.add(msgId);
							uniqueMessages.push(msg);
						}
					});
					
					console.log('去重前:', allMessages.length, '去重后:', uniqueMessages.length);
					
					this.messages = uniqueMessages
						.map(msg => this.formatMessage(msg))
						.sort((a, b) => {
							const timeA = new Date(a.createTime || a.sendTime || 0);
							const timeB = new Date(b.createTime || b.sendTime || 0);
							return timeA - timeB;
						});
					
					this.$nextTick(() => {
						this.scrollToBottom();
					});
				} else {
					this.messages = [];
				}
			} catch (error) {
				console.error('加载消息异常:', error);
				uni.showToast({
					title: '加载消息失败',
					icon: 'none'
				});
			}
		},
		
		// 格式化消息数据
		formatMessage(msg) {
			const isSelf = String(msg.fromId) === String(this.fromId) && 
			                Number(msg.fromType) === Number(this.fromType);
			
			return {
				messageId: msg.messageId || msg.id,
				sessionId: msg.sessionId,
				fromType: msg.fromType,
				fromId: msg.fromId,
				toType: msg.toType,
				toId: msg.toId,
				msgContent: msg.msgContent || msg.content,
				time: this.formatTime(msg.createTime || msg.sendTime),
				sendTime: msg.sendTime,
				createTime: msg.createTime,
				msgType: msg.msgType,
				msgStatus: msg.msgStatus,
				isSelf: isSelf
			};
		},
		
		// 发送消息
		async handleSendMessage() {
			if (!this.inputMessage.trim()) {
				return;
			}
			
			if (!this.sessionId) {
				uni.showToast({
					title: '会话信息异常',
					icon: 'none'
				});
				return;
			}
			
			const content = this.inputMessage.trim();
			this.inputMessage = '';
			
			// 先添加到本地显示（乐观更新）
			const tempMessage = {
				messageId: Date.now(),
				msgContent: content,
				sendTime: new Date(),
				isSelf: true,
				sending: true
			};
			
			this.messages.push(tempMessage);
			
			this.$nextTick(() => {
				this.scrollToBottom();
			});
			
			try {
				// 调用HTTP API保存消息
				const response = await sendMessage({
					sessionId: this.sessionId,
					fromType: this.fromType,
					fromId: String(this.fromId),
					toType: this.toType,
					toId: String(this.toId),
					msgType: MSG_TYPE.TEXT,
					msgContent: content,
					msgStatus: MSG_STATUS.SENDING,
					isDeleted: 0,
					version: 1
				});
				
				if (response.code === 200) {
					tempMessage.sending = false;
					tempMessage.messageId = response.data.messageId || response.data;
					
					// 通过WebSocket实时推送
					const status = wsManager.getStatus();
					if (status.isConnected && status.isRegistered) {
						try {
							await wsManager.sendTextMessage({
								sessionId: this.sessionId,
								fromType: this.fromType,
								fromId: String(this.fromId),
								toType: this.toType,
								toId: String(this.toId),
								content: content
							});
						} catch (err) {
							console.warn('WebSocket发送失败，消息已通过HTTP保存:', err);
						}
					}
				} else {
					tempMessage.sendFailed = true;
					uni.showToast({
						title: response.msg || '发送失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('发送消息失败:', error);
				tempMessage.sendFailed = true;
				uni.showToast({
					title: '发送失败',
					icon: 'none'
				});
			}
		},
		
		// 连接WebSocket
		async connectWebSocket() {
			try {
				await wsManager.connect(USER_TYPE.RIDER, this.fromId);
				wsManager.addMessageHandler(this.handleWebSocketMessage);
				
				this.wsConnected = true;
			} catch (error) {
				console.error('WebSocket连接失败:', error);
				uni.showToast({
					title: 'WebSocket连接失败',
					icon: 'none'
				});
			}
		},
		
		// 断开WebSocket
		disconnectWebSocket() {
			try {
				const index = wsManager.messageHandlers.indexOf(this.handleWebSocketMessage);
				if (index > -1) {
					wsManager.messageHandlers.splice(index, 1);
				}
			} catch (error) {
				console.error('移除handler失败:', error);
			}
			this.wsConnected = false;
		},
		
		// 处理WebSocket接收的消息
		handleWebSocketMessage(message) {
			// 兼容字段命名
			const msgType = message.msg_type || message.msgType;
			const msgContent = message.msg_content || message.msgContent || message.content;
			const fromId = String(message.from_id || message.fromId || '');
			const fromType = message.from_type || message.fromType;
			const toId = String(message.to_id || message.toId || '');
			const toType = message.to_type || message.toType;
			const sendTime = message.send_time || message.sendTime;
			
			// 过滤掉自己发送的消息（避免回声）
			if (this.currentUser && fromId) {
				const currentRiderId = String(this.currentUser.id || '');
				const isSelf = fromId.substring(0, 10) === currentRiderId.substring(0, 10);
				
				if (isSelf) {
					return;
				}
			}
			
			// 只处理文本消息
			if (msgType !== MSG_TYPE.TEXT) {
				return;
			}
			
			// 检查是否是当前对话的对方发来的消息
			const isFromChatUser = String(fromId).substring(0, 10) === String(this.toId).substring(0, 10);
			const isToMe = (toType === 2 || toType === USER_TYPE.RIDER) && 
			               String(toId).substring(0, 10) === String(this.fromId).substring(0, 10);
			
			if (!isFromChatUser || !isToMe) {
				return;
			}
			
			// 添加到消息列表
			const newMessage = {
				messageId: message.message_id || message.messageId || Date.now(),
				msgContent: msgContent,
				sendTime: sendTime || Date.now(),
				isSelf: false
			};
			
			this.messages.push(newMessage);
			
			this.$nextTick(() => {
				this.scrollToBottom();
			});
		},
		
		// 滚动到底部
		scrollToBottom() {
			const query = uni.createSelectorQuery().in(this);
			query.select('.chat-list').boundingClientRect(data => {
				if (data) {
					this.scrollTop = data.height;
				}
			}).exec();
		}
	}
};
</script>

<style scoped>
	/* 页面容器 */
	.page {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f0f2f5;
	}

	/* 导航栏 */
	.nav-bar {
		position: relative;
		width: 100%;
		height: calc(88rpx + env(safe-area-inset-top));
		padding-top: env(safe-area-inset-top);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #ffffff;
		border-bottom: 1rpx solid #e8e8e8;
		z-index: 10;
	}

	.nav-back {
		position: absolute;
		left: 24rpx;
		font-size: 44rpx;
		color: #333333;
		padding: 10rpx;
	}

	.nav-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #333333;
	}

	.nav-actions {
		position: absolute;
		right: 24rpx;
	}

	/* 聊天内容 */
	.chat-content {
		flex: 1;
		padding: 20rpx 24rpx;
		padding-bottom: 140rpx;
		background-color: #f0f2f5;
	}

	.chat-list {
		padding-bottom: 20rpx;
	}

	.chat-item {
		display: flex;
		margin-bottom: 32rpx;
		align-items: flex-start;
	}

	.chat-item.chat-self {
		justify-content: flex-end;
	}

	.chat-avatar {
		flex-shrink: 0;
	}

	.avatar-img {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: #e0e0e0;
	}

	.chat-main {
		display: flex;
		flex-direction: column;
		margin-left: 16rpx;
		max-width: 500rpx;
	}

	.chat-main.self {
		margin-left: 0;
		margin-right: 16rpx;
		align-items: flex-end;
	}

	.chat-label {
		font-size: 24rpx;
		color: #999999;
		margin-bottom: 8rpx;
	}

	.chat-bubble {
		max-width: 100%;
		padding: 20rpx 28rpx;
		border-radius: 16rpx;
		word-break: break-all;
	}

	.chat-bubble:not(.self) {
		background-color: #ffffff;
		border-top-left-radius: 4rpx;
	}

	.chat-bubble.self {
		background-color: #4facfe;
		border-top-right-radius: 4rpx;
	}

	.chat-text {
		font-size: 30rpx;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.chat-bubble:not(.self) .chat-text {
		color: #333333;
	}

	.chat-bubble.self .chat-text {
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
		font-size: 42rpx;
		color: #1890ff;
		padding: 0 12rpx;
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

	/* 更多面板 */
	.more-panel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0,0,0,0.3);
		display: flex;
		align-items: flex-end;
		justify-content: center;
		z-index: 200;
	}

	.panel-content {
		width: 100%;
		background-color: #ffffff;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		padding: 20rpx 30rpx 40rpx 30rpx;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.panel-title {
		font-size: 32rpx;
		font-weight: 600;
	}

	.panel-close {
		font-size: 40rpx;
		color: #999999;
	}

	.panel-actions {
		display: flex;
		gap: 30rpx;
		flex-wrap: wrap;
	}

	.action-item {
		width: 140rpx;
		height: 160rpx;
		border-radius: 16rpx;
		background-color: #f7f7f7;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
	}

	.action-icon {
		font-size: 48rpx;
	}

	.action-text {
		font-size: 26rpx;
		color: #333333;
	}
</style>
