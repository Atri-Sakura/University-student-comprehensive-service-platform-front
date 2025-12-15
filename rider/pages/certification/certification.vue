<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">资质认证</text>
			<view class="navbar-right"></view>
		</view>

		<!-- 认证状态 -->
		<view class="status-card">
			<view class="card-header">
				<view class="status-icon" :class="statusClass">
					<text class="icon-text">🆔</text>
				</view>
				<text class="card-title">认证状态</text>
			</view>
			<view class="status-info">
				<text class="status-label">当前状态:</text>
				<text class="status-value" :class="statusClass">{{ statusText }}</text>
			</view>
			<!-- 重新提交按钮已移至表单区域，此处不再显示 -->
		</view>

		<!-- 认证流程 -->
		<view class="process-card">
			<text class="card-title">认证流程</text>
			<view class="process-steps">
				<view class="step-item">
					<view class="step-number" :class="step1Class">1</view>
					<view class="step-content">
						<text class="step-title">身份信息验证</text>
						<text class="step-desc">上传身份证正反面照片进行实名认证</text>
					</view>
					<text class="step-status" :class="step1Class">{{ step1StatusText }}</text>
				</view>
				
				<view class="step-line"></view>
				
				<view class="step-item">
					<view class="step-number" :class="step2Class">2</view>
					<view class="step-content">
						<text class="step-title">认证完成</text>
						<text class="step-desc">审核通过后即可获得认证标识</text>
					</view>
					<text class="step-status" :class="step2Class">{{ step2StatusText }}</text>
				</view>
			</view>
		</view>

		<!-- 上传材料 -->
		<view class="upload-card">
			<text class="card-title">上传材料</text>
			
			<!-- 身份证号码输入 -->
			<view class="input-section">
				<text class="input-title">身份证号码</text>
				<text class="input-desc">请输入18位身份证号码</text>
				<input 
					class="id-card-input" 
					type="idcard" 
					placeholder="请输入身份证号码" 
					v-model="idCardNumber"
					maxlength="18"
				/>
			</view>
			
			<view class="upload-section">
				<text class="upload-title">身份证正面</text>
				<text class="upload-desc">请上传清晰的身份证正面照片</text>
				<view class="upload-area" @tap="uploadImage('idCardFront')">
					<image v-if="idCardFront" :src="idCardFront" class="uploaded-image" mode="aspectFit" @tap.stop="previewImage(idCardFront)"></image>
					<view v-if="idCardFront" class="image-actions">
						<text class="delete-btn" @tap.stop="deleteImage('idCardFront')">✕</text>
					</view>
					<view v-else class="upload-placeholder">
						<text class="upload-icon">📤</text>
						<text class="upload-text">上传文件</text>
					</view>
				</view>
			</view>
			
			<view class="upload-section">
				<text class="upload-title">身份证反面</text>
				<text class="upload-desc">请上传清晰的身份证反面照片</text>
				<view class="upload-area" @tap="uploadImage('idCardBack')">
					<image v-if="idCardBack" :src="idCardBack" class="uploaded-image" mode="aspectFit" @tap.stop="previewImage(idCardBack)"></image>
					<view v-if="idCardBack" class="image-actions">
						<text class="delete-btn" @tap.stop="deleteImage('idCardBack')">✕</text>
					</view>
					<view v-else class="upload-placeholder">
						<text class="upload-icon">📤</text>
						<text class="upload-text">上传文件</text>
					</view>
				</view>
			</view>
			
			<!-- 提交按钮 -->
			<view class="submit-section">
				<button 
					class="submit-btn" 
					:class="{ disabled: !canSubmit || submitting }"
					@tap="submitCertification"
					:disabled="!canSubmit || submitting"
				>
					{{ submitting ? '提交中...' : '提交认证' }}
				</button>
				<text class="submit-tip">提交后将进入审核流程，请确保信息准确无误</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { uploadQualificationCertification, getRiderFullInfo } from '@/utils/api/index.js';
	
	export default {
		data() {
			return {
				// 认证状态
				certificationStatus: 'pending', // pending, reviewing, approved, rejected
				
				// 上传的文件
				idCardFront: '',
				idCardBack: '',
				
				// 身份证号码
				idCardNumber: '',
				
				// 提交状态
				submitting: false,
				
				// 加载状态
				loading: false,
				
				// 骑手身份证是否为空
				hasIdCard: false
			}
		},
		
		onLoad() {
			this.loadCertificationStatus();
		},
		
		onShow() {
			this.loadCertificationStatus();
		},
		
		computed: {
			// 认证状态文本
			statusText() {
				// 如果id_card为空，显示"待认证"
				if (!this.hasIdCard) {
					return '待认证';
				}
				const statusMap = {
					pending: '待提交',
					reviewing: '审核中',
					approved: '已通过',
					rejected: '未通过'
				};
				return statusMap[this.certificationStatus] || '未知状态';
			},
			
			// 认证状态样式类
			statusClass() {
				// 如果id_card为空，使用pending样式
				if (!this.hasIdCard) {
					return 'pending';
				}
				return this.certificationStatus;
			},
			
			// 是否可以提交
			canSubmit() {
				return this.idCardFront && this.idCardBack && this.idCardNumber && this.idCardNumber.length === 18 && !this.submitting;
			},
			
			// 步骤1状态样式
			step1Class() {
				// 如果id_card为空，显示待认证状态
				if (!this.hasIdCard) {
					return 'current';
				}
				if (this.certificationStatus === 'pending') {
					return 'current';
				}
				return 'completed';
			},
			
			// 步骤1状态文本
			step1StatusText() {
				// 如果id_card为空，显示"待认证"
				if (!this.hasIdCard) {
					return '待认证';
				}
				if (this.certificationStatus === 'pending') {
					return '待提交';
				}
				return '已完成';
			},
			
			// 步骤2状态样式
			step2Class() {
				// 如果id_card为空，显示待认证状态
				if (!this.hasIdCard) {
					return 'waiting';
				}
				if (this.certificationStatus === 'pending') {
					return 'waiting';
				} else if (this.certificationStatus === 'reviewing') {
					return 'reviewing';
				} else if (this.certificationStatus === 'approved') {
					return 'completed';
				} else if (this.certificationStatus === 'rejected') {
					return 'rejected';
				}
				return 'waiting';
			},
			
			// 步骤2状态文本
			step2StatusText() {
				// 如果id_card为空，显示"待认证"
				if (!this.hasIdCard) {
					return '待认证';
				}
				if (this.certificationStatus === 'pending') {
					return '待审核';
				} else if (this.certificationStatus === 'reviewing') {
					return '审核中';
				} else if (this.certificationStatus === 'approved') {
					return '已通过';
				} else if (this.certificationStatus === 'rejected') {
					return '未通过';
				}
				return '待审核';
			}
		},
		methods: {
			// 从后端加载认证状态
			async loadCertificationStatus() {
				if (this.loading) return;
				
				this.loading = true;
				try {
					const response = await getRiderFullInfo();
					console.log('📦 骑手信息响应:', response);
					
					if (response.code === 200 && response.data) {
						// 打印完整数据，查看实际字段名
						console.log('📦 完整骑手数据:', JSON.stringify(response.data));
						
						// 获取骑手身份证号
						const idCard = response.data.idCard;
						console.log('📦 idCard:', idCard);
						
						// 检测id_card是否为空
						if (!idCard || idCard.trim() === '') {
							// id_card为空，所有状态显示为"待认证"
							this.hasIdCard = false;
							this.certificationStatus = 'pending';
							console.log('📦 id_card为空，显示待认证状态');
						} else {
							// id_card不为空，使用认证状态码来控制
							this.hasIdCard = true;
							
							// 后端字段可能是 auditStatus 而不是 accountStatus
							// audit_status: 0-待审核, 1-已通过
							const auditStatus = response.data.auditStatus;
							const accountStatus = response.data.accountStatus;
							console.log('📦 auditStatus:', auditStatus);
							console.log('📦 accountStatus:', accountStatus);
							
							// 使用 auditStatus（审核状态）来判断认证状态
							// audit_status: 0-待审核, 1-已通过
							if (auditStatus !== undefined && auditStatus !== null) {
								// 根据审核状态映射认证状态
								switch (auditStatus) {
									case 0:
										// 待审核（已提交，等待审核）
										this.certificationStatus = 'reviewing';
										break;
									case 1:
										// 已通过
										this.certificationStatus = 'approved';
										break;
									case 2:
										// 审核不通过
										this.certificationStatus = 'rejected';
										break;
									default:
										// 未提交认证
										this.certificationStatus = 'pending';
										break;
								}
							} else {
								// 后端未返回 auditStatus，已有idCard说明已提交
								this.certificationStatus = 'reviewing'; // 已提交，待审核
								console.warn('⚠️ 后端未返回 auditStatus 字段，请联系后端添加');
							}
						}
						console.log('📦 hasIdCard:', this.hasIdCard);
						console.log('📦 映射后的认证状态:', this.certificationStatus);
					}
				} catch (error) {
					console.error('获取认证状态失败:', error);
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
			// 上传图片
			uploadImage(type) {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const filePath = res.tempFilePaths[0];
						
						// 根据类型设置对应的图片
						if (type === 'idCardFront') {
							this.idCardFront = filePath;
						} else if (type === 'idCardBack') {
							this.idCardBack = filePath;
						}
						
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						});
					},
					fail: () => {
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
				});
			},
			
			// 预览图片
			previewImage(imagePath) {
				if (!imagePath) return;
				
				uni.previewImage({
					urls: [imagePath],
					current: imagePath
				});
			},
			
			// 删除图片
			deleteImage(type) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这张图片吗？',
					success: (res) => {
						if (res.confirm) {
							if (type === 'idCardFront') {
								this.idCardFront = '';
							} else if (type === 'idCardBack') {
								this.idCardBack = '';
							}
							
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
						}
					}
				});
			},
			
			// 提交认证
			submitCertification() {
				if (!this.canSubmit) {
					uni.showToast({
						title: '请完善所有必填信息',
						icon: 'none'
					});
					return;
				}
				
				uni.showModal({
					title: '确认提交',
					content: '提交后将进入审核流程，请确认信息无误',
					success: async (res) => {
						if (res.confirm) {
							this.submitting = true;
							
							try {
								// 调用上传API
								const result = await uploadQualificationCertification(
									this.idCardFront,
									this.idCardBack,
									this.idCardNumber
								);
								
								// 更新状态
								this.hasIdCard = true; // 提交成功后标记已有身份证
								this.certificationStatus = 'reviewing';
								
								uni.showToast({
									title: '提交成功',
									icon: 'success',
									duration: 2000
								});
								
								// 延迟后重新加载状态
								setTimeout(() => {
									this.loadCertificationStatus();
								}, 1000);
								
							} catch (error) {
								console.error('提交认证失败:', error);
								
								uni.showToast({
									title: error.message || '提交失败，请重试',
									icon: 'none'
								});
							} finally {
								this.submitting = false;
							}
						}
					}
				});
			},
			
			// 重新提交认证
			resubmitCertification() {
				this.certificationStatus = 'pending';
				uni.showToast({
					title: '可以重新编辑提交',
					icon: 'success'
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

	/* 卡片通用样式 */
	.status-card,
	.process-card,
	.upload-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		margin: 20rpx 30rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.status-card {
		margin-top: calc(160rpx + env(safe-area-inset-top) + 20rpx);
	}

	.card-title {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
		display: block;
		margin-bottom: 20rpx;
	}

	/* 认证状态 */
	.card-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.status-icon {
		width: 48rpx;
		height: 48rpx;
		background-color: #1890ff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16rpx;
	}

	.icon-text {
		font-size: 24rpx;
		color: #ffffff;
	}

	.status-info {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.status-label {
		font-size: 28rpx;
		color: #666;
	}

	.status-value {
		font-size: 28rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-weight: 500;
	}

	.status-value.pending {
		background-color: #f0f0f0;
		color: #666666;
	}

	.status-value.reviewing {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.status-value.approved {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.status-value.rejected {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	.status-actions {
		margin-top: 20rpx;
	}

	.resubmit-btn {
		background-color: #1890ff;
		color: #ffffff;
		border: none;
		border-radius: 8rpx;
		padding: 12rpx 24rpx;
		font-size: 28rpx;
	}

	/* 认证流程 */
	.process-steps {
		margin-top: 20rpx;
	}

	.step-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.step-number {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: bold;
		color: #ffffff;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	.step-number.completed {
		background-color: #52c41a;
	}

	.step-number.current {
		background-color: #1890ff;
	}

	.step-number.waiting {
		background-color: #d9d9d9;
	}

	.step-number.reviewing {
		background-color: #fa8c16;
	}

	.step-number.rejected {
		background-color: #ff4d4f;
	}

	.step-content {
		flex: 1;
		margin-right: 20rpx;
	}

	.step-title {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		display: block;
		margin-bottom: 8rpx;
	}

	.step-desc {
		font-size: 26rpx;
		color: #666;
		display: block;
		line-height: 1.4;
	}

	.step-status {
		font-size: 24rpx;
		padding: 6rpx 12rpx;
		border-radius: 20rpx;
		font-weight: 500;
	}

	.step-status.completed {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.step-status.current {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.step-status.reviewing {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.step-status.waiting {
		background-color: #f5f5f5;
		color: #999999;
	}

	.step-status.rejected {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	.step-line {
		width: 2rpx;
		height: 40rpx;
		background-color: #e0e0e0;
		margin-left: 23rpx;
		margin-bottom: 20rpx;
	}

	/* 输入区域 */
	.input-section {
		margin-bottom: 40rpx;
	}
	
	.input-title {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		display: block;
		margin-bottom: 8rpx;
	}
	
	.input-desc {
		font-size: 26rpx;
		color: #666;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.id-card-input {
		width: 100%;
		height: 88rpx;
		background-color: #f8f8f8;
		border: 2rpx solid #e0e0e0;
		border-radius: 12rpx;
		padding: 0 24rpx;
		font-size: 30rpx;
		color: #333;
		box-sizing: border-box;
	}
	
	.id-card-input:focus {
		border-color: #1890ff;
		background-color: #ffffff;
	}
	
	/* 上传材料 */
	.upload-section {
		margin-bottom: 40rpx;
	}

	.upload-section:last-child {
		margin-bottom: 0;
	}

	.upload-title {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		display: block;
		margin-bottom: 8rpx;
	}

	.upload-desc {
		font-size: 26rpx;
		color: #666;
		display: block;
		margin-bottom: 20rpx;
	}

	.upload-area {
		width: 100%;
		height: 200rpx;
		border: 2rpx dashed #d9d9d9;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
		position: relative;
		overflow: hidden;
	}

	.upload-area:active {
		border-color: #1890ff;
		background-color: #f0f8ff;
	}

	.upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}

	.upload-icon {
		font-size: 48rpx;
		color: #1890ff;
	}

	.upload-text {
		font-size: 28rpx;
		color: #1890ff;
		font-weight: 500;
	}

	.uploaded-image {
		width: 100%;
		height: 100%;
		border-radius: 10rpx;
	}

	.image-actions {
		position: absolute;
		top: 10rpx;
		right: 10rpx;
		z-index: 10;
	}

	.delete-btn {
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.6);
		color: #ffffff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		font-weight: bold;
	}

	/* 提交区域 */
	.submit-section {
		margin-top: 40rpx;
		padding-top: 30rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.submit-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 44rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);
		margin-bottom: 20rpx;
	}

	.submit-btn.disabled {
		background: #d9d9d9;
		color: #999999;
		box-shadow: none;
	}

	.submit-btn:not(.disabled):active {
		transform: translateY(2rpx);
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
	}

	.submit-tip {
		font-size: 24rpx;
		color: #999999;
		text-align: center;
		line-height: 1.5;
		display: block;
	}
</style>
