<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-back" @tap="goBack">�?/text>
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
					placeholder="请输入消�?.."
					confirm-type="send"
					@confirm="handleSendMessage"
					:focus="inputFocus"
				/>
				<view class="input-actions">
					<text class="action-btn" @tap="showMoreActions">+</text>
					<button class="send-btn" :disabled="!inputMessage.trim()" @tap="handleSendMessage">发�?/button>
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
						<text class="action-text">发送图�?/text>
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
import { getMessageList, markMessagesAsRead, USER_TYPE, MSG_TYPE, MSG_STATUS } from '@/utils/api/message.js';
import { markSessionAsRead } from '@/utils/api/session.js';
import { sendMessage, getMessagesFromTo } from '@/utils/api/chat.js';

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
		
		console.log('最终参�?');
		console.log('  sessionId:', this.sessionId);
		console.log('  fromType:', this.fromType);
		console.log('  fromId:', this.fromId);
		console.log('  toType:', this.toType);
		console.log('  toId:', this.toId);
		
		this.loadMessages();
		
		// 开始轮询新消息（暂时禁用，便于调试�?		// this.startPolling();
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
			const result = message.fromId == this.fromId && message.fromType == this.fromType;
			console.log('isSelf判断:', {
				'message.fromId': message.fromId,
				'message.fromType': message.fromType,
				'this.fromId': this.fromId,
				'this.fromType': this.fromType,
				'fromId匹配': message.fromId == this.fromId,
				'fromType匹配': message.fromType == this.fromType,
				'最终结�?: result
			});
			return result;
		},
		
		async loadMessages() {
			try {
				console.log('====== 开始加载消�?======');
				console.log('sessionId:', this.sessionId);
				console.log('fromId:', this.fromId);
				console.log('toId:', this.toId);
				
				// 临时方案：由于后端getMessageList存在bug，强制使用getMessagesFromTo
				// 需要双向查询：骑手→用�?+ 用户→骑�?				const [res1, res2] = await Promise.all([
					getMessagesFromTo({
						fromType: this.fromType,
						fromId: String(this.fromId),
						toType: this.toType,
						toId: String(this.toId),
						pageSize: 100
					}),
					getMessagesFromTo({
						fromType: this.toType,
						fromId: String(this.toId),
						toType: this.fromType,
						toId: String(this.fromId),
						pageSize: 100
					})
				]);
				
				let allMessages = [];
				if (res1.code === 200 && res1.data) {
					allMessages = allMessages.concat(res1.data);
				}
				if (res2.code === 200 && res2.data) {
					allMessages = allMessages.concat(res2.data);
				}
				
				if (allMessages.length > 0) {
					this.messages = allMessages
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
		
		// 格式化消息数�?		formatMessage(msg) {
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
		
		// 发送消�?		async handleSendMessage() {
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
					
					// 通过WebSocket实时推�?					const status = wsManager.getStatus();
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
						title: response.msg || '发送失�?,
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('发送消息失�?', error);
				tempMessage.sendFailed = true;
				uni.showToast({
					title: '发送失�?,
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
		
		// 处理WebSocket接收的消�?		handleWebSocketMessage(message) {
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
			
			// 只处理文本消�?			if (msgType !== MSG_TYPE.TEXT) {
				return;
			}
			
			// 检查是否是当前对话的对方发来的消息
			const isFromChatUser = String(fromId).substring(0, 10) === String(this.toId).substring(0, 10);
			const isToMe = (toType === 2 || toType === USER_TYPE.RIDER) && 
			               String(toId).substring(0, 10) === String(this.fromId).substring(0, 10);
			
			if (!isFromChatUser || !isToMe) {
				return;
			}
			
			// 添加到消息列�?			const newMessage = {
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
		
		// 滚动到底�?		scrollToBottom() {
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
		background-color: #f5f5f5;
	}

	/* 导航�?*/
	.nav-bar {
		width: 100%;
		height: 88rpx;
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

	/* 聊天内容 */
	.chat-content {
		flex: 1;
		padding: 20rpx;
		padding-bottom: 120rpx;
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
		background-color: #e0e0e0;
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
