<template>
  <view class="page-wrapper">
    <sidebar current="error-report"></sidebar>
    <view class="report-container">
      <view class="header">
        <text class="title">异常报告</text>
      </view>
    
    <view class="form-section">
      <view class="section-title">异常类型</view>
      <view class="type-list">
        <view 
          v-for="type in errorTypes" 
          :key="type.value"
          :class="['type-item', form.errorType === type.value && 'active']"
          @click="form.errorType = type.value"
        >
          <text class="icon">{{ type.icon }}</text>
          <text class="name">{{ type.label }}</text>
        </view>
      </view>
    </view>
    
    <view class="form-section">
      <view class="section-title">关联订单（可选）</view>
      <input v-model="form.orderId" type="text" placeholder="请输入订单号" class="input" />
    </view>
    
    <view class="form-section">
      <view class="section-title">异常描述</view>
      <textarea 
        v-model="form.description" 
        placeholder="请详细描述异常情况，以便我们快速处理..."
        maxlength="500"
        class="textarea"
      ></textarea>
      <text class="word-count">{{ form.description.length }}/500</text>
    </view>
    
    <view class="form-section">
      <view class="section-title">上传图片（最多6张）</view>
      <view class="image-list">
        <view class="image-item" v-for="(img, idx) in form.images" :key="idx">
          <image :src="img" mode="aspectFill"></image>
          <view class="delete-btn" @click="removeImage(idx)">×</view>
        </view>
        <view class="image-item add" @click="chooseImage" v-if="form.images.length < 6">
          <text class="add-icon">+</text>
          <text class="add-text">添加图片</text>
        </view>
      </view>
    </view>
    
    <view class="form-section">
      <view class="section-title">联系方式</view>
      <input v-model="form.contact" type="text" placeholder="请输入您的联系电话" class="input" />
    </view>
    
    <button class="submit-btn" @click="handleSubmit" :loading="loading">提交报告</button>
    
    <view class="history-section">
      <view class="section-header">
        <text class="section-title">历史报告</text>
        <text class="view-all" @click="viewAllHistory">查看全部</text>
      </view>
      <view class="history-list">
        <view class="history-item" v-for="item in historyList" :key="item.id">
          <view class="history-info">
            <text class="history-type">{{ item.typeName }}</text>
            <text class="history-time">{{ item.createTime }}</text>
          </view>
          <view :class="['history-status', item.status]">{{ item.statusText }}</view>
        </view>
      </view>
    </view>
    </view>
  </view>
</template>

<script>
import sidebar from '@/components/sidebar/sidebar.vue'
export default {
  components: { sidebar },
  data() {
    return {
      loading: false,
      form: {
        errorType: '',
        orderId: '',
        description: '',
        images: [],
        contact: ''
      },
      errorTypes: [
        { value: 'order', label: '订单异常', icon: '📦' },
        { value: 'payment', label: '支付问题', icon: '💰' },
        { value: 'delivery', label: '配送问题', icon: '🚗' },
        { value: 'app', label: 'APP故障', icon: '📱' },
        { value: 'account', label: '账号问题', icon: '👤' },
        { value: 'other', label: '其他问题', icon: '❓' }
      ],
      historyList: [
        { id: 1, typeName: '订单异常', createTime: '2025-12-14 10:30', status: 'processing', statusText: '处理中' },
        { id: 2, typeName: '配送问题', createTime: '2025-12-13 15:20', status: 'resolved', statusText: '已解决' }
      ]
    }
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 6 - this.form.images.length,
        success: (res) => {
          this.form.images = [...this.form.images, ...res.tempFilePaths]
        }
      })
    },
    removeImage(idx) {
      this.form.images.splice(idx, 1)
    },
    handleSubmit() {
      if (!this.form.errorType) {
        uni.showToast({ title: '请选择异常类型', icon: 'none' })
        return
      }
      if (!this.form.description) {
        uni.showToast({ title: '请填写异常描述', icon: 'none' })
        return
      }
      this.loading = true
      setTimeout(() => {
        this.loading = false
        uni.showToast({ title: '提交成功', icon: 'success' })
        this.resetForm()
      }, 1000)
    },
    resetForm() {
      this.form = { errorType: '', orderId: '', description: '', images: [], contact: '' }
    },
    viewAllHistory() {
      uni.showToast({ title: '查看全部历史', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.page-wrapper { display: flex; min-height: 100vh; }
.report-container { flex: 1; padding: 30rpx; background: #f5f5f5; min-height: 100vh; overflow-y: auto; }
.header { margin-bottom: 30rpx; }
.header .title { font-size: 40rpx; font-weight: bold; color: #333; }
.form-section { background: #fff; border-radius: 16rpx; padding: 30rpx; margin-bottom: 24rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }
.type-list { display: flex; flex-wrap: wrap; gap: 20rpx; }
.type-item { width: calc(33.33% - 14rpx); padding: 24rpx 0; background: #f8f8f8; border-radius: 12rpx; text-align: center; border: 2rpx solid transparent; }
.type-item.active { border-color: #4a90d9; background: #e8f4ff; }
.type-item .icon { font-size: 40rpx; display: block; margin-bottom: 8rpx; }
.type-item .name { font-size: 26rpx; color: #333; }
.input { width: 100%; height: 88rpx; border: 1rpx solid #e0e0e0; border-radius: 12rpx; padding: 0 24rpx; font-size: 28rpx; }
.textarea { width: 100%; height: 200rpx; border: 1rpx solid #e0e0e0; border-radius: 12rpx; padding: 20rpx; font-size: 28rpx; }
.word-count { font-size: 24rpx; color: #999; text-align: right; display: block; margin-top: 10rpx; }
.image-list { display: flex; flex-wrap: wrap; gap: 16rpx; }
.image-item { width: 160rpx; height: 160rpx; border-radius: 12rpx; overflow: hidden; position: relative; }
.image-item image { width: 100%; height: 100%; }
.image-item.add { background: #f8f8f8; border: 2rpx dashed #ccc; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.add-icon { font-size: 48rpx; color: #999; }
.add-text { font-size: 22rpx; color: #999; margin-top: 8rpx; }
.delete-btn { position: absolute; top: 0; right: 0; width: 40rpx; height: 40rpx; background: rgba(0,0,0,0.5); color: #fff; text-align: center; line-height: 40rpx; font-size: 28rpx; }
.submit-btn { width: 100%; height: 96rpx; background: #4a90d9; color: #fff; font-size: 32rpx; border-radius: 48rpx; margin: 40rpx 0; }
.history-section { background: #fff; border-radius: 16rpx; padding: 30rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.view-all { font-size: 26rpx; color: #4a90d9; }
.history-item { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.history-type { font-size: 28rpx; color: #333; }
.history-time { font-size: 24rpx; color: #999; display: block; margin-top: 8rpx; }
.history-status { font-size: 24rpx; padding: 8rpx 16rpx; border-radius: 20rpx; }
.history-status.processing { background: #fff3e0; color: #ff9800; }
.history-status.resolved { background: #e8f5e9; color: #4caf50; }
</style>
