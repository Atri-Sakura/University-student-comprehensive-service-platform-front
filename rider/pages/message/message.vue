<template>
	<view class="container">
		<view class="placeholder-content">
			<text class="placeholder-icon">💬</text>
			<text class="placeholder-text">消息页面</text>
			<text class="placeholder-desc">开发中...</text>
		</view>
		
		<tabbar :current="2"></tabbar>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		}
	}
</script>

<style scoped>
	.container {
		min-height: 100vh;
		background-color: #f5f5f5;
		padding-bottom: 120rpx;
	}
	
	.placeholder-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding-top: 200rpx;
	}
	
	.placeholder-icon {
		font-size: 120rpx;
		margin-bottom: 30rpx;
	}
	
	.placeholder-text {
		font-size: 36rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 20rpx;
	}
	
	.placeholder-desc {
		font-size: 28rpx;
		color: #999;
	}
</style>

