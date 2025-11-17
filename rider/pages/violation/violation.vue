<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="custom-navbar">
			<view class="navbar-left" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="navbar-title">违规申诉</text>
			<view class="navbar-right"></view>
		</view>

		<!-- 申诉状态 -->
		<view class="status-card">
			<view class="status-header">
				<view class="status-icon">
					<text class="icon-text">⚖️</text>
				</view>
				<text class="status-title">申诉状态</text>
			</view>
			<view class="status-info">
				<text class="status-label">当前状态:</text>
				<text class="status-value pending">待处理</text>
			</view>
			<text class="status-desc">您的申诉已提交，我们会在24小时内处理</text>
		</view>

		<!-- 申诉记录 -->
		<view class="records-section">
			<text class="section-title">申诉记录</text>
			<view class="records-list">
				<view class="record-item" v-for="(record, index) in records" :key="index">
					<view class="record-header">
						<text class="record-title">{{ record.title }}</text>
						<text class="record-status" :class="record.status">{{ record.statusText }}</text>
					</view>
					<text class="record-time">{{ record.time }}</text>
					<text class="record-reason">{{ record.reason }}</text>
					<view class="record-content" v-if="record.content">
						<text class="content-label">申诉内容:</text>
						<text class="content-text">{{ record.content }}</text>
					</view>
					<view class="record-result" v-if="record.result">
						<text class="result-label">处理结果:</text>
						<text class="result-text">{{ record.result }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 提交申诉 -->
		<view class="submit-section">
			<text class="section-title">提交申诉</text>
			<view class="form-card">
				<view class="form-item">
					<text class="form-label">申诉类型</text>
					<picker @change="onTypeChange" :value="typeIndex" :range="violationTypes">
						<view class="picker-view">
							<text class="picker-text">{{ selectedType || '请选择申诉类型' }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>

				<view class="form-item">
					<text class="form-label">违规时间</text>
					<picker mode="date" @change="onDateChange" :value="violationDate">
						<view class="picker-view">
							<text class="picker-text">{{ violationDate || '请选择违规时间' }}</text>
							<text class="picker-arrow">▼</text>
						</view>
					</picker>
				</view>

				<view class="form-item">
					<text class="form-label">申诉原因</text>
					<textarea 
						class="form-textarea" 
						v-model="appealReason" 
						placeholder="请详细描述申诉原因，包括具体情况、时间、地点等"
						maxlength="500"
					></textarea>
					<text class="char-count">{{ appealReason.length }}/500</text>
				</view>

				<view class="form-item">
					<text class="form-label">相关证据</text>
					<view class="upload-area">
						<view class="uploaded-images" v-if="uploadedImages.length > 0">
							<view class="image-item" v-for="(image, index) in uploadedImages" :key="index">
								<image :src="image" class="uploaded-image" mode="aspectFill"></image>
								<view class="delete-btn" @tap="deleteImage(index)">×</view>
							</view>
						</view>
						<view class="upload-btn" @tap="uploadImage" v-if="uploadedImages.length < 6">
							<text class="upload-icon">📷</text>
							<text class="upload-text">添加图片</text>
						</view>
					</view>
					<text class="upload-tip">最多可上传6张图片，支持JPG、PNG格式</text>
				</view>

				<button class="submit-btn" @tap="submitAppeal" :disabled="!canSubmit">提交申诉</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				violationTypes: ['订单取消', '配送超时', '服务态度', '费用争议', '其他'],
				typeIndex: 0,
				selectedType: '',
				violationDate: '',
				appealReason: '',
				uploadedImages: [],
				records: [
					{
						title: '订单取消申诉',
						time: '2024-01-15 14:30',
						reason: '订单无故被取消',
						content: '我在正常配送过程中，订单突然被取消，没有收到任何通知',
						result: '经核实，订单取消是由于商家原因，已为您恢复订单并补偿配送费',
						status: 'resolved',
						statusText: '已处理'
					},
					{
						title: '配送超时申诉',
						time: '2024-01-10 18:45',
						reason: '配送时间过长',
						content: '订单配送时间超过预期1小时，影响客户体验',
						result: '已核实配送路线，确实存在绕路情况，已调整配送费',
						status: 'resolved',
						statusText: '已处理'
					},
					{
						title: '服务态度申诉',
						time: '2024-01-08 12:20',
						reason: '客户投诉服务态度',
						content: '客户投诉我服务态度不好，但实际情况并非如此',
						status: 'pending',
						statusText: '处理中'
					}
				]
			}
		},
		computed: {
			canSubmit() {
				return this.selectedType && this.violationDate && this.appealReason.trim().length > 10;
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
			onTypeChange(e) {
				this.typeIndex = e.detail.value;
				this.selectedType = this.violationTypes[e.detail.value];
			},
			onDateChange(e) {
				this.violationDate = e.detail.value;
			},
			uploadImage() {
				uni.chooseImage({
					count: 6 - this.uploadedImages.length,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.uploadedImages.push(...res.tempFilePaths);
					},
					fail: () => {
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
				});
			},
			deleteImage(index) {
				this.uploadedImages.splice(index, 1);
			},
			submitAppeal() {
				if (!this.canSubmit) {
					uni.showToast({
						title: '请完善申诉信息',
						icon: 'none'
					});
					return;
				}

				uni.showLoading({
					title: '提交中...'
				});

				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '申诉提交成功',
						icon: 'success'
					});
					
					// 重置表单
					this.selectedType = '';
					this.typeIndex = 0;
					this.violationDate = '';
					this.appealReason = '';
					this.uploadedImages = [];
				}, 1500);
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

	/* 申诉状态 */
	.status-card {
		margin: calc(160rpx + env(safe-area-inset-top) + 20rpx) 30rpx 30rpx 30rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.status-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.status-icon {
		width: 48rpx;
		height: 48rpx;
		background-color: #fa8c16;
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

	.status-title {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
	}

	.status-info {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 12rpx;
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
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.status-desc {
		font-size: 26rpx;
		color: #999;
		line-height: 1.4;
	}

	/* 申诉记录 */
	.records-section,
	.submit-section {
		margin: 0 30rpx 30rpx 30rpx;
	}

	.section-title {
		font-size: 32rpx;
		color: #333;
		font-weight: bold;
		display: block;
		margin-bottom: 20rpx;
	}

	.records-list {
		background-color: #ffffff;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.record-item {
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.record-item:last-child {
		border-bottom: none;
	}

	.record-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.record-title {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
	}

	.record-status {
		font-size: 24rpx;
		padding: 6rpx 12rpx;
		border-radius: 20rpx;
		font-weight: 500;
	}

	.record-status.resolved {
		background-color: #f6ffed;
		color: #52c41a;
	}

	.record-status.pending {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.record-time {
		font-size: 26rpx;
		color: #999;
		display: block;
		margin-bottom: 12rpx;
	}

	.record-reason {
		font-size: 28rpx;
		color: #666;
		display: block;
		margin-bottom: 16rpx;
	}

	.record-content,
	.record-result {
		margin-bottom: 16rpx;
	}

	.content-label,
	.result-label {
		font-size: 26rpx;
		color: #999;
		display: block;
		margin-bottom: 8rpx;
	}

	.content-text,
	.result-text {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
		display: block;
	}

	/* 提交申诉表单 */
	.form-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.form-item:last-child {
		margin-bottom: 0;
	}

	.form-label {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		display: block;
		margin-bottom: 16rpx;
	}

	.picker-view {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
		background-color: #f8f8f8;
		border-radius: 8rpx;
		border: 2rpx solid #e0e0e0;
	}

	.picker-text {
		font-size: 28rpx;
		color: #333;
	}

	.picker-arrow {
		font-size: 20rpx;
		color: #999;
	}

	.form-textarea {
		width: 100%;
		min-height: 120rpx;
		background-color: #f8f8f8;
		padding: 20rpx;
		font-size: 28rpx;
		color: #333;
		border: 2rpx solid #e0e0e0;
		border-radius: 8rpx;
		outline: none;
		resize: none;
		box-sizing: border-box;
	}

	.form-textarea::placeholder {
		color: #999;
	}

	.char-count {
		font-size: 24rpx;
		color: #999;
		text-align: right;
		display: block;
		margin-top: 8rpx;
	}

	.upload-area {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.uploaded-images {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
	}

	.image-item {
		position: relative;
		width: 120rpx;
		height: 120rpx;
		border-radius: 8rpx;
		overflow: hidden;
	}

	.uploaded-image {
		width: 100%;
		height: 100%;
	}

	.delete-btn {
		position: absolute;
		top: -8rpx;
		right: -8rpx;
		width: 32rpx;
		height: 32rpx;
		background-color: #ff4d4f;
		color: #ffffff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		font-weight: bold;
	}

	.upload-btn {
		width: 120rpx;
		height: 120rpx;
		border: 2rpx dashed #d9d9d9;
		border-radius: 8rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
	}

	.upload-btn:active {
		border-color: #1890ff;
		background-color: #f0f8ff;
	}

	.upload-icon {
		font-size: 32rpx;
		color: #1890ff;
		margin-bottom: 8rpx;
	}

	.upload-text {
		font-size: 24rpx;
		color: #1890ff;
	}

	.upload-tip {
		font-size: 24rpx;
		color: #999;
		margin-top: 12rpx;
		display: block;
	}

	.submit-btn {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
		color: #ffffff;
		font-size: 32rpx;
		font-weight: bold;
		border-radius: 44rpx;
		border: none;
		margin-top: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.3);
	}

	.submit-btn:disabled {
		background: #d9d9d9;
		color: #999;
		box-shadow: none;
	}

	.submit-btn:active:not(:disabled) {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.3);
	}
</style>
