<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-title">消息</text>
			<view class="nav-actions">
				<text class="clear-btn" @tap="clearAllMessages">清空</text>
			</view>
		</view>

		<!-- 标签页导航 -->
		<view class="tab-bar">
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 'all' }"
				@tap="switchTab('all')"
			>
				<text class="tab-text">全部消息</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 'group' }"
				@tap="switchTab('group')"
			>
				<text class="tab-text">群聊</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ active: activeTab === 'system' }"
				@tap="switchTab('system')"
			>
				<text class="tab-text">系统通知</text>
			</view>
		</view>

		<!-- 消息列表 -->
		<view class="message-list">
			<!-- 全部消息 / 会话列表 -->
			<template v-if="activeTab === 'all' || activeTab === 'group'">
				<!-- 遍历会话列表 -->
				<view class="message-item" @tap="openChat(item)" v-for="item in sessions" :key="item.sessionId">
					<view class="message-avatar">
						<text class="avatar-icon group">💬</text>
						<view class="unread-dot" v-if="item.unreadCount > 0"></view>
					</view>
					<view class="message-content">
						<view class="message-header">
							<text class="message-title">{{ item.displayName || '用户' }}</text>
							<text class="message-time">{{ formatTime(item.lastMsgTime) }}</text>
						</view>
						<text class="message-preview" :class="{ unread: item.unreadCount > 0 }">{{ item.lastMsgContent || '暂无消息' }}</text>
					</view>
					<view class="group-badge" v-if="item.unreadCount > 0">{{ item.unreadCount }}</view>
				</view>
			</template>

			<!-- 系统通知 -->
			<template v-if="activeTab === 'system' || activeTab === 'all'">
				<!-- 系统消息 -->
				<view class="message-item system" @tap="viewMessage(item)" v-for="item in systemMessages" :key="item.id">
					<view class="message-avatar">
						<text class="avatar-icon system">🔔</text>
						<view class="unread-dot" v-if="!item.isRead"></view>
					</view>
					<view class="message-content">
						<view class="message-header">
							<text class="message-title">{{ item.title }}</text>
							<text class="message-time">{{ formatTime(item.time) }}</text>
						</view>
						<text class="message-preview" :class="{ unread: !item.isRead }">{{ item.content }}</text>
					</view>
				</view>
			</template>

			<!-- 空状态 -->
			<view class="empty-state" v-if="(activeTab === 'all' && sessions.length === 0 && systemMessages.length === 0) || (activeTab !== 'all' && currentTabMessages.length === 0)">
				<text class="empty-icon">💬</text>
				<text class="empty-text">{{ emptyStateText }}</text>
				<text class="empty-desc">{{ emptyStateDesc }}</text>
			</view>
		</view>

		<tabbar :current="2"></tabbar>
	</view>
</template>

<script>
import { getSessionList, markSessionAsRead, SESSION_STATUS } from '@/utils/api/session.js';
import { USER_TYPE } from '@/utils/api/message.js';
import { getRiderBaseInfo } from '@/utils/profile-api.js';

export default {
	data() {
		return {
			activeTab: 'all',
			currentUser: null,
			loading: false,
			sessions: [], // 真实会话列表
			systemMessages: [],
			announcements: [],
			orderGroupChats: [],
			hasUnreadService: false,
			lastServiceTime: '',
			lastServiceMessage: ''
		};
	},
	
	async onLoad() {
		await this.initRiderInfo();
		this.loadChatSessions();
	},
	
	onShow() {
		// 每次显示时刷新会话列表
		if (this.currentUser) {
			this.loadChatSessions();
		}
	},
	
	computed: {
		allMessages() {
			return [...this.systemMessages, ...this.announcements]
				.sort((a, b) => new Date(b.time) - new Date(a.time));
		},
		
		currentTabMessages() {
			switch (this.activeTab) {
				case 'all':
					return [...this.systemMessages, ...this.announcements];
				case 'group':
					return this.orderGroupChats;
				case 'system':
					return [...this.systemMessages, ...this.announcements];
				default:
					return [];
			}
		},
		
		emptyStateText() {
			switch (this.activeTab) {
				case 'all':
					return '暂无消息';
				case 'group':
					return '暂无群聊';
				case 'system':
					return '暂无系统通知';
				default:
					return '暂无消息';
			}
		},
		
		emptyStateDesc() {
			switch (this.activeTab) {
				case 'all':
					return '您的消息将在这里显示';
				case 'group':
					return '订单群聊将在这里显示';
				case 'system':
					return '系统通知将在这里显示';
				default:
					return '消息将在这里显示';
			}
		}
	},
	
	methods: {
		// 初始化骑手信息
		async initRiderInfo() {
			try {
				// 优先从缓存获取
				let riderInfo = uni.getStorageSync('riderInfo');
				
				// 强制从API获取最新数据
				console.log('从API获取骑手信息...');
				const response = await getRiderBaseInfo();
				console.log('📥 后端返回的完整数据:', JSON.stringify(response, null, 2));
				
				if (response.code === 200 && response.data) {
					riderInfo = response.data;
					console.log('📥 data字段:', JSON.stringify(riderInfo, null, 2));
					console.log('📥 riderBaseId字段:', riderInfo.riderBaseId);
					console.log('📥 riderId字段:', riderInfo.riderId);
					console.log('📥 id字段:', riderInfo.id);
					// 保存到缓存
					uni.setStorageSync('riderInfo', riderInfo);
				}
				
				if (riderInfo) {
					// 确保使用 riderBaseId 作为主ID
					this.currentUser = {
						...riderInfo,
						id: riderInfo.riderBaseId  // 使用 riderBaseId
					};
					console.log('骑手信息初始化成功, riderBaseId:', riderInfo.riderBaseId);
				}
				
				if (!this.currentUser || !this.currentUser.id) {
					console.warn('无法获取骑手ID，请重新登录');
				}
			} catch (error) {
				console.error('获取骑手信息失败:', error);
			}
		},
		
		// 加载聊天会话列表
		async loadChatSessions() {
			if (!this.currentUser) {
				console.warn('loadChatSessions: 骑手信息不存在');
				return;
			}
			
			// 优先使用 riderBaseId
			let currentRiderId = this.currentUser.riderBaseId || this.currentUser.id;
			console.log('使用的骑手ID (riderBaseId):', currentRiderId);
			
			this.loading = true;
			try {
				// 查询1: 骑手作为发起方的会话
				const params1 = {
					fromType: USER_TYPE.RIDER,
					fromId: currentRiderId,
					sessionStatus: SESSION_STATUS.NORMAL,
					pageSize: 50
				};
				
				// 查询2: 骑手作为接收方的会话
				const params2 = {
					toType: USER_TYPE.RIDER,
					toId: currentRiderId,
					sessionStatus: SESSION_STATUS.NORMAL,
					pageSize: 50
				};
				
				// 并发查询
				const [response1, response2] = await Promise.all([
					getSessionList(params1),
					getSessionList(params2)
				]);
				
				let allSessions = [];
				
				if (response1.code === 200 && response1.data) {
					allSessions = allSessions.concat(response1.data);
				}
				if (response2.code === 200 && response2.data) {
					allSessions = allSessions.concat(response2.data);
				}
				
				console.log('所有会话数量:', allSessions.length);
				console.log('当前骑手ID:', currentRiderId);
				
				if (allSessions.length > 0) {
					// 筛选正确的会话：骑手作为其中一方，用户(type=1)或商家(type=3)作为另一方
					const validSessions = allSessions.filter(session => {
						// 骑手ID匹配检查（比较前10位，避免精度问题）
						const riderIdStr = String(currentRiderId);
						const fromIdStr = String(session.fromId);
						const toIdStr = String(session.toId);
						
						const isRiderFrom = session.fromType === 2 && fromIdStr.substring(0, 10) === riderIdStr.substring(0, 10);
						const isRiderTo = session.toType === 2 && toIdStr.substring(0, 10) === riderIdStr.substring(0, 10);
						// 用户(type=1)或商家(type=3)
						const isOtherFrom = session.fromType === 1 || session.fromType === 3;
						const isOtherTo = session.toType === 1 || session.toType === 3;
						
						// 正确的会话：(骑手→用户/商家) 或 (用户/商家→骑手)
						const isValid = (isRiderFrom && isOtherTo) || (isOtherFrom && isRiderTo);
						
						if (!isValid) {
							console.log('过滤掉会话:', session.sessionId, 'fromType:', session.fromType, 'toType:', session.toType);
						}
						
						return isValid;
					});
					
					console.log('有效会话数量:', validSessions.length);
					
					// 按对话双方合并：同一组用户的会话只保留最新的
					const dialogMap = new Map();
					validSessions.forEach(session => {
						// 找出对方的ID和类型（不管是fromId还是toId）
						let otherUserId, otherUserType;
						// 对方是用户(type=1)或商家(type=3)
						if (session.fromType === 1 || session.fromType === 3) {
							otherUserId = String(session.fromId);
							otherUserType = session.fromType;
						} else if (session.toType === 1 || session.toType === 3) {
							otherUserId = String(session.toId);
							otherUserType = session.toType;
						}
						
						if (!otherUserId) {
							return;
						}
						
						// 保存对方用户信息到session对象
						session.otherUserId = otherUserId;
						session.otherUserType = otherUserType;
						session.otherUserType = otherUserType;
						session.displayName = '用户 ' + otherUserId.slice(-6);
						
						// 使用对方ID前15位作为key（同一个用户）
						const dialogKey = otherUserId.substring(0, 15);
						
						// 如果已存在，比较时间，保留最新的
						if (dialogMap.has(dialogKey)) {
							const existing = dialogMap.get(dialogKey);
							const existingTime = new Date(existing.lastMsgTime || 0);
							const currentTime = new Date(session.lastMsgTime || 0);
							
							if (currentTime > existingTime) {
								session.sessionId = String(session.sessionId || '');
								session.fromId = String(session.fromId || '');
								session.toId = String(session.toId || '');
								dialogMap.set(dialogKey, session);
							}
						} else {
							session.sessionId = String(session.sessionId || '');
							session.fromId = String(session.fromId || '');
							session.toId = String(session.toId || '');
							dialogMap.set(dialogKey, session);
						}
					});
					
					this.sessions = Array.from(dialogMap.values())
						.sort((a, b) => new Date(b.lastMsgTime) - new Date(a.lastMsgTime));
				} else {
					this.sessions = [];
				}
			} catch (error) {
				console.error('加载会话失败:', error);
			} finally {
				this.loading = false;
			}
		},
		
		// 打开聊天
		async openChat(item) {
			// 标记已读
			if (item.unreadCount > 0) {
				try {
					await markSessionAsRead(String(item.sessionId));
					item.unreadCount = 0;
				} catch (error) {
					console.error('标记已读失败:', error);
				}
			}
			
			// 获取当前骑手ID
			const riderId = uni.getStorageSync('riderId');
			let currentRiderId = this.currentUser?.id || this.currentUser?.riderId || this.currentUser?.riderBaseId || riderId;
			
			// 判断骑手是发送方还是接收方，确定对方用户的信息
			let otherUserId, otherUserType;
			if (item.fromType === USER_TYPE.RIDER && String(item.fromId) === String(currentRiderId)) {
				// 骑手是发送方，对方是接收方
				otherUserId = item.toId;
				otherUserType = item.toType;
			} else {
				// 骑手是接收方，对方是发送方
				otherUserId = item.fromId;
				otherUserType = item.fromType;
			}
			
			// 跳转到聊天页面，骑手始终作为 from
			const params = {
				sessionId: String(item.sessionId),
				fromType: String(USER_TYPE.RIDER),
				fromId: String(currentRiderId),
				toType: String(item.otherUserType || otherUserType),
				toId: String(item.otherUserId || otherUserId),
				title: encodeURIComponent(item.displayName || `用户 ${otherUserId}`)
			};
			
			const queryString = Object.keys(params)
				.map(key => `${key}=${params[key]}`)
				.join('&');
			
			uni.navigateTo({
				url: `/pages/message/chat?${queryString}`
			});
		},
		
		formatTime(time) {
			// 检查时间是否有效
			if (!time) {
				return '';
			}
			
			const msgTime = new Date(time);
			
			// 检查是否是有效日期（1970年说明时间戳为0或无效）
			if (isNaN(msgTime.getTime()) || msgTime.getFullYear() < 2000) {
				return '';
			}
			
			const now = new Date();
			const diff = now - msgTime;
			
			const minutes = Math.floor(diff / (1000 * 60));
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			
			if (minutes < 0) {
				return '刚刚';
			} else if (minutes < 60) {
				return minutes <= 1 ? '刚刚' : `${minutes}分钟前`;
			} else if (hours < 24) {
				return `${hours}小时前`;
			} else if (days < 7) {
				return `${days}天前`;
			} else {
				return msgTime.toLocaleDateString();
			}
		},
		
		viewMessage(message) {
			// 标记为已读
			message.isRead = true;
			
			// 跳转到消息详情页面
			uni.navigateTo({
				url: `/pages/message/message-detail?id=${message.id}&type=${message.type}`
			});
		},
		
		openCustomerService() {
			// 标记客服消息为已读
			this.hasUnreadService = false;
			
			// 跳转到客服聊天页面
			uni.navigateTo({
				url: '/pages/message/customer-service'
			});
		},
		
		switchTab(tab) {
			this.activeTab = tab;
		},
		
		viewGroupChat(orderGroup) {
			// 标记订单群聊为已读
			orderGroup.isRead = true;
			orderGroup.unreadCount = 0;
			
			// 跳转到订单群聊页面（暂时显示提示）
			uni.showToast({
				title: `订单${orderGroup.orderId}群聊功能开发中`,
				icon: 'none'
			});
		},
			
		clearAllMessages() {
			const tabName = this.activeTab === 'all' ? '所有消息' : 
						this.activeTab === 'group' ? '群聊消息' : '系统通知';
						
			uni.showModal({
				title: '清空消息',
				content: `确定要清空${tabName}吗？此操作不可恢复。`,
				confirmColor: '#ff4d4f',
				success: (res) => {
					if (res.confirm) {
						if (this.activeTab === 'all') {
							this.systemMessages = [];
							this.announcements = [];
						} else if (this.activeTab === 'group') {
							this.orderGroupChats = [];
						} else if (this.activeTab === 'system') {
							this.systemMessages = [];
							this.announcements = [];
						}
						
						uni.showToast({
							title: `已清空${tabName}`,
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
	.container {
		min-height: 100vh;
		background-color: #f7f7f7;
		padding-top: calc(112rpx + env(safe-area-inset-top));
		padding-bottom: 120rpx;
	}

	/* 导航栏 */
	.nav-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: calc(112rpx + env(safe-area-inset-top));
		padding: env(safe-area-inset-top) 30rpx 0;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		background-color: #ffffff;
		border-bottom: 1rpx solid #f0f0f0;
		z-index: 10;
	}

	.nav-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 22rpx;
	}

	.nav-actions {
		margin-bottom: 22rpx;
	}

	.clear-btn {
		font-size: 28rpx;
		color: #1890ff;
		padding: 8rpx 16rpx;
	}

	/* 标签页导航 */
	.tab-bar {
		display: flex;
		background-color: #ffffff;
		border-bottom: 1rpx solid #f0f0f0;
		padding: 0 30rpx;
	}

	.tab-item {
		flex: 1;
		padding: 24rpx 0;
		text-align: center;
		position: relative;
	}

	.tab-text {
		font-size: 30rpx;
		color: #666666;
		transition: color 0.3s;
	}

	.tab-item.active .tab-text {
		color: #1890ff;
		font-weight: 600;
	}

	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60rpx;
		height: 4rpx;
		background-color: #1890ff;
		border-radius: 2rpx;
	}

	/* 消息列表 */
	.message-list {
		padding: 20rpx 0;
	}

	.message-item {
		display: flex;
		align-items: flex-start;
		padding: 24rpx 30rpx;
		background-color: #ffffff;
		border-bottom: 1rpx solid #f0f0f0;
		position: relative;
		transition: background-color 0.3s;
	}

	.message-item:active {
		background-color: #f8f9fa;
	}

	.message-item:last-child {
		border-bottom: none;
	}

	/* 头像区域 */
	.message-avatar {
		position: relative;
		margin-right: 24rpx;
		flex-shrink: 0;
	}

	.avatar-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
	}

	.avatar-icon.system {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.avatar-icon.order {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.avatar-icon.service {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	.avatar-icon.announcement {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.avatar-icon.group {
		background-color: #f0f9ff;
		color: #0ea5e9;
	}

	.unread-dot {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 16rpx;
		height: 16rpx;
		background-color: #ff4d4f;
		border-radius: 50%;
		border: 2rpx solid #ffffff;
	}

	/* 消息内容 */
	.message-content {
		flex: 1;
		min-width: 0;
	}

	.message-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12rpx;
	}

	.message-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
	}

	.message-time {
		font-size: 24rpx;
		color: #999999;
		flex-shrink: 0;
		margin-left: 20rpx;
	}

	.message-preview {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.5;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.message-preview.unread {
		color: #333333;
		font-weight: 500;
	}

	/* 订单群聊信息 */
	.order-info {
		margin: 8rpx 0;
	}

	.order-id {
		font-size: 24rpx;
		color: #1890ff;
		display: block;
		margin-bottom: 4rpx;
	}

	.participants {
		font-size: 22rpx;
		color: #999999;
		display: block;
	}

	.message-arrow {
		font-size: 28rpx;
		color: #d0d0d0;
		transform: rotate(90deg);
		margin-left: 20rpx;
		flex-shrink: 0;
	}

	.group-badge {
		min-width: 36rpx;
		height: 36rpx;
		background-color: #ff4d4f;
		color: #ffffff;
		border-radius: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		font-weight: 600;
		padding: 0 8rpx;
		margin-left: 20rpx;
		flex-shrink: 0;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 120rpx 40rpx;
		background-color: #ffffff;
		margin: 20rpx;
		border-radius: 16rpx;
	}

	.empty-icon {
		font-size: 120rpx;
		margin-bottom: 30rpx;
		opacity: 0.6;
	}

	.empty-text {
		font-size: 32rpx;
		color: #333333;
		font-weight: 600;
		margin-bottom: 16rpx;
	}

	.empty-desc {
		font-size: 26rpx;
		color: #999999;
		text-align: center;
		line-height: 1.5;
	}

	/* 消息类型特殊样式 */
	.message-item.system {
		border-left: 6rpx solid #1890ff;
	}

	.message-item.order {
		border-left: 6rpx solid #52c41a;
	}

	.message-item.service {
		border-left: 6rpx solid #ff4d4f;
	}

	.message-item.announcement {
		border-left: 6rpx solid #fa8c16;
	}

	.message-item.group {
		border-left: 6rpx solid #0ea5e9;
	}
</style>
