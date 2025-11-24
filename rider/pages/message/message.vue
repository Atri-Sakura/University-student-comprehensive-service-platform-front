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
							<text class="message-title">会话 {{ item.toId }}</text>
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
	export default {
		data() {
			return {
				activeTab: 'all', // 当前选中的标签
				systemMessages: [
					{
						id: 'sys_001',
						title: '系统通知',
						content: '您的账户已通过实名认证，可以正常接单了',
						time: new Date(Date.now() - 2 * 60 * 60 * 1000),
						isRead: false,
						type: 'system'
					},
					{
						id: 'sys_002',
						title: '安全提醒',
						content: '为了您的账户安全，请定期修改密码',
						time: new Date(Date.now() - 24 * 60 * 60 * 1000),
						isRead: true,
						type: 'system'
					}
				],
				announcements: [
					{
						id: 'ann_001',
						title: '平台公告',
						content: '春节期间配送费调整通知，详情请查看',
						time: new Date(Date.now() - 12 * 60 * 60 * 1000),
						isRead: false,
						type: 'announcement'
					}
				],
				orderGroupChats: [
					{
						id: 'order_group_001',
						orderId: 'ORD2024123456',
						orderTitle: '星巴克咖啡配送',
						participants: ['商家', '顾客', '骑手'],
						lastMessage: '顾客：请问大概还有多久到？',
						time: new Date(Date.now() - 30 * 60 * 1000),
						isRead: false,
						type: 'orderGroup',
						unreadCount: 2
					},
					{
						id: 'order_group_002',
						orderId: 'ORD2024123455',
						orderTitle: '麦当劳外卖配送',
						participants: ['商家', '顾客', '骑手'],
						lastMessage: '商家：订单已准备好，请尽快取餐',
						time: new Date(Date.now() - 2 * 60 * 60 * 1000),
						isRead: true,
						type: 'orderGroup',
						unreadCount: 0
					},
					{
						id: 'order_group_003',
						orderId: 'ORD2024123454',
						orderTitle: '肯德基配送订单',
						participants: ['商家', '顾客', '骑手'],
						lastMessage: '骑手：我已到达楼下，请下来取餐',
						time: new Date(Date.now() - 5 * 60 * 60 * 1000),
						isRead: false,
						type: 'orderGroup',
						unreadCount: 1
					}
				],
				hasUnreadService: true,
				lastServiceTime: '昨天',
				lastServiceMessage: '您好，有什么可以帮助您的吗？'
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
			formatTime(time) {
				const now = new Date();
				const msgTime = new Date(time);
				const diff = now - msgTime;
				
				const minutes = Math.floor(diff / (1000 * 60));
				const hours = Math.floor(diff / (1000 * 60 * 60));
				const days = Math.floor(diff / (1000 * 60 * 60 * 24));
				
				if (minutes < 60) {
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

