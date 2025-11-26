<template>
	<view class="page">
		<!-- 自定义导航栏 -->
		<view class="nav-bar">
			<text class="nav-back" @tap.stop="goBack">‹</text>
			<text class="nav-title">异常报备</text>
		</view>

		<view class="content">
			<!-- 订单信息 -->
			<view class="order-info-card">
				<view class="card-title">订单信息</view>
				<view class="order-basic">
					<text class="order-id">{{ orderInfo.id }}</text>
					<view class="order-tag" :class="orderInfo.type">{{ orderInfo.typeText }}</view>
				</view>
				<text class="order-merchant">{{ orderInfo.merchant }}</text>
				<text class="order-status">当前状态：{{ statusText }}</text>
			</view>

			<!-- 异常类型选择 -->
			<view class="exception-card">
				<view class="card-title">异常类型</view>
				<view class="select-wrapper" @tap="showTypePicker">
					<text class="select-text" :class="{ placeholder: !selectedTypeText }">
						{{ selectedTypeText || '请选择异常类型' }}
					</text>
					<text class="select-arrow">〉</text>
				</view>
			</view>

			<!-- 异常描述 -->
			<view class="description-card">
				<view class="card-title">异常描述</view>
				<textarea 
					class="description-input" 
					v-model="description"
					placeholder="请详细描述遇到的异常情况，以便客服更好地为您处理..."
					maxlength="500"
					:show-confirm-bar="false"
				></textarea>
				<view class="char-count">{{ description.length }}/500</view>
			</view>

			<!-- 图片上传 -->
			<view class="upload-card">
				<view class="card-title">
					<text>现场照片</text>
					<text class="upload-tip">（选填，最多9张）</text>
				</view>
				
				<view class="upload-grid">
					<view 
						class="upload-item" 
						v-for="(image, index) in uploadedImages" 
						:key="index"
					>
						<image class="upload-image" :src="image" mode="aspectFill"></image>
						<view class="delete-btn" @tap="deleteImage(index)">
							<text class="delete-icon">×</text>
						</view>
					</view>
					
					<view 
						class="upload-add" 
						v-if="uploadedImages.length < 9"
						@tap="chooseImage"
					>
						<text class="add-plus">+</text>
					</view>
				</view>
			</view>

		</view>

		<!-- 提交按钮 -->
		<view class="submit-section">
			<button 
				class="submit-btn" 
				:disabled="!canSubmit || submitting"
				@tap="submitReport"
			>
				{{ submitting ? '提交中...' : '提交报备' }}
			</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			orderId: '',
			orderStatus: '',
			orderInfo: {
				id: 'ORD2024123456',
				type: 'takeout',
				typeText: '外卖',
				merchant: '星巴克咖啡（人民广场店）'
			},
			selectedType: '',
			description: '',
			uploadedImages: [],
			submitting: false,
			exceptionTypes: [
				{ key: 'merchant_not_ready', name: '商家未准备好', icon: '⏰' },
				{ key: 'merchant_closed', name: '商家已关门', icon: '🚪' },
				{ key: 'merchant_not_found', name: '找不到商家', icon: '🔍' },
				{ key: 'customer_unreachable', name: '顾客联系不上', icon: '📞' },
				{ key: 'wrong_address', name: '地址有误', icon: '📍' },
				{ key: 'goods_issue', name: '商品问题', icon: '📦' },
				{ key: 'weather_issue', name: '天气原因', icon: '🌧️' },
				{ key: 'traffic_issue', name: '交通问题', icon: '🚧' },
				{ key: 'other', name: '其他异常', icon: '❓' }
			]
		}
	},
	
	computed: {
		statusText() {
			const statusMap = {
				'pickup': '待取货',
				'delivery': '配送中'
			};
			return statusMap[this.orderStatus] || '未知状态';
		},
		
		selectedTypeText() {
			const selectedTypeObj = this.exceptionTypes.find(type => type.key === this.selectedType);
			return selectedTypeObj ? selectedTypeObj.name : '';
		},
		
		canSubmit() {
			return this.selectedType && this.description.trim();
		}
	},
	
	onLoad(options) {
		if (options.orderId) {
			this.orderId = options.orderId;
			this.orderInfo.id = options.orderId;
		}
		if (options.status) {
			this.orderStatus = options.status;
		}
	},
	
	methods: {
		goBack() {
			uni.navigateBack({ delta: 1 });
		},
		
		showTypePicker() {
			const typeNames = this.exceptionTypes.map(type => type.name);
			
			uni.showActionSheet({
				itemList: typeNames,
				success: (res) => {
					const selectedTypeObj = this.exceptionTypes[res.tapIndex];
					this.selectedType = selectedTypeObj.key;
				}
			});
		},
		
		chooseImage() {
			const remainingCount = 9 - this.uploadedImages.length;
			
			uni.chooseImage({
				count: remainingCount,
				sizeType: ['compressed'],
				sourceType: ['camera', 'album'],
				success: (res) => {
					this.uploadedImages.push(...res.tempFilePaths);
				},
				fail: (err) => {
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			});
		},
		
		deleteImage(index) {
			uni.showModal({
				title: '删除图片',
				content: '确定要删除这张图片吗？',
				success: (res) => {
					if (res.confirm) {
						this.uploadedImages.splice(index, 1);
					}
				}
			});
		},
		
		async uploadImages() {
			if (this.uploadedImages.length === 0) {
				return [];
			}
			
			const uploadPromises = this.uploadedImages.map(imagePath => {
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url: 'https://api.example.com/upload', // 替换为实际的上传接口
						filePath: imagePath,
						name: 'file',
						success: (uploadRes) => {
							try {
								const data = JSON.parse(uploadRes.data);
								resolve(data.url);
							} catch (e) {
								reject(e);
							}
						},
						fail: reject
					});
				});
			});
			
			try {
				const imageUrls = await Promise.all(uploadPromises);
				return imageUrls;
			} catch (error) {
				throw new Error('图片上传失败');
			}
		},
		
		async submitReport() {
			if (!this.canSubmit) return;
			
			this.submitting = true;
			
			try {
				// 上传图片
				let imageUrls = [];
				if (this.uploadedImages.length > 0) {
					uni.showLoading({ title: '上传图片中...' });
					imageUrls = await this.uploadImages();
					uni.hideLoading();
				}
				
				// 提交报备数据
				uni.showLoading({ title: '提交中...' });
				
				const reportData = {
					orderId: this.orderId,
					orderStatus: this.orderStatus,
					exceptionType: this.selectedType,
					description: this.description,
					images: imageUrls,
					createTime: new Date().toISOString()
				};
				
				// 模拟API调用
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				uni.hideLoading();
				
				// 提交成功
				uni.showModal({
					title: '提交成功',
					content: '异常报备已提交，客服将在15分钟内联系您处理。',
					showCancel: false,
					success: () => {
						// 返回上一页或订单列表
						uni.navigateBack({ delta: 1 });
					}
				});
				
			} catch (error) {
				uni.hideLoading();
				uni.showModal({
					title: '提交失败',
					content: error.message || '网络异常，请稍后重试',
					showCancel: false
				});
			} finally {
				this.submitting = false;
			}
		}
	}
}
</script>

<style scoped>
	.page {
		min-height: 100vh;
		background-color: #f7f7f7;
		padding-top: calc(112rpx + env(safe-area-inset-top));
		padding-bottom: 120rpx;
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

	.content {
		padding: 40rpx 30rpx;
	}

	/* 卡片通用样式 */
	.order-info-card,
	.exception-card,
	.description-card,
	.upload-card {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.card-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 30rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	/* 订单信息 */
	.order-basic {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 16rpx;
	}

	.order-id {
		font-size: 30rpx;
		font-weight: 600;
		color: #333333;
	}

	.order-tag {
		font-size: 22rpx;
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-weight: 500;
	}

	.order-tag.takeout {
		background-color: #fff2f0;
		color: #ff4d4f;
	}

	.order-tag.express {
		background-color: #e6fffb;
		color: #13c2c2;
	}

	.order-merchant {
		font-size: 28rpx;
		color: #666666;
		margin-bottom: 12rpx;
		display: block;
	}

	.order-status {
		font-size: 26rpx;
		color: #1890ff;
		font-weight: 500;
	}

	/* 异常类型选择器 */
	.select-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 20rpx;
		border: 2rpx solid #f0f0f0;
		border-radius: 12rpx;
		background-color: #fafafa;
		transition: all 0.3s;
	}

	.select-wrapper:active {
		border-color: #ff4d4f;
		background-color: #fff2f0;
	}

	.select-text {
		font-size: 30rpx;
		color: #333333;
		flex: 1;
	}

	.select-text.placeholder {
		color: #999999;
	}

	.select-arrow {
		font-size: 28rpx;
		color: #d0d0d0;
		transform: rotate(90deg);
		margin-left: 20rpx;
	}

	/* 异常描述 */
	.description-input {
		width: 100%;
		min-height: 200rpx;
		padding: 20rpx;
		border: 2rpx solid #f0f0f0;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333333;
		line-height: 1.6;
		box-sizing: border-box;
	}

	.char-count {
		text-align: right;
		font-size: 24rpx;
		color: #999999;
		margin-top: 12rpx;
	}

	/* 图片上传 */
	.upload-tip {
		font-size: 24rpx;
		color: #999999;
		font-weight: normal;
	}

	.upload-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;
	}

	.upload-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 12rpx;
		overflow: hidden;
	}

	.upload-image {
		width: 100%;
		height: 100%;
	}

	.delete-btn {
		position: absolute;
		top: 8rpx;
		right: 8rpx;
		width: 40rpx;
		height: 40rpx;
		background-color: rgba(0, 0, 0, 0.6);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-icon {
		font-size: 24rpx;
		color: #ffffff;
		font-weight: bold;
	}

	.upload-add {
		aspect-ratio: 1;
		border: 2rpx dashed #d9d9d9;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fafafa;
	}

	.add-plus {
		font-size: 80rpx;
		color: #d9d9d9;
		font-weight: 300;
		line-height: 1;
	}

	/* 提交按钮 */
	.submit-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		border-top: 1rpx solid #f0f0f0;
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
		box-shadow: 0 8rpx 24rpx rgba(255, 77, 79, 0.3);
	}

	.submit-btn[disabled] {
		background: #d9d9d9;
		color: #999999;
		box-shadow: none;
	}
</style>
