<template>
  <view class="page-wrapper">
    <sidebar current="error-audit"></sidebar>
    <view class="audit-container">
      <view class="header">
        <text class="title">骑手异常审核</text>
      </view>
      
      <view class="tabs">
        <view :class="['tab', activeTab === 'pending' && 'active']" @click="activeTab = 'pending'">待审核</view>
        <view :class="['tab', activeTab === 'approved' && 'active']" @click="activeTab = 'approved'">已通过</view>
        <view :class="['tab', activeTab === 'rejected' && 'active']" @click="activeTab = 'rejected'">已拒绝</view>
      </view>
      
      <scroll-view scroll-y class="list-container">
        <view class="audit-card" v-for="item in filteredList" :key="item.id">
          <view class="card-header">
            <view class="rider-info">
              <image class="avatar" :src="item.avatar" mode="aspectFill"></image>
              <view class="info">
                <text class="name">{{ item.riderName }}</text>
                <text class="phone">{{ item.phone }}</text>
              </view>
            </view>
            <view :class="['status', item.status]">{{ statusText[item.status] }}</view>
          </view>
          
          <view class="card-body">
            <view class="info-row">
              <text class="label">异常类型：</text>
              <text class="value type-tag">{{ item.errorType }}</text>
            </view>
            <view class="info-row">
              <text class="label">关联订单：</text>
              <text class="value">{{ item.orderId || '无' }}</text>
            </view>
            <view class="info-row">
              <text class="label">提交时间：</text>
              <text class="value">{{ item.submitTime }}</text>
            </view>
            <view class="info-row desc">
              <text class="label">异常描述：</text>
              <text class="value">{{ item.description }}</text>
            </view>
            <view class="error-images" v-if="item.images && item.images.length">
              <text class="label">相关图片：</text>
              <view class="images">
                <image v-for="(img, idx) in item.images" :key="idx" :src="img" mode="aspectFill" 
                  @click="previewImage(item.images, idx)"></image>
              </view>
            </view>
          </view>
          
          <view class="card-footer" v-if="item.status === 'pending'">
            <button class="btn reject" @click="handleAudit(item, 'rejected')">拒绝</button>
            <button class="btn approve" @click="handleAudit(item, 'approved')">通过</button>
          </view>
        </view>
        
        <view class="empty" v-if="filteredList.length === 0">
          <text>暂无数据</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import sidebar from '@/components/sidebar/sidebar.vue'
export default {
  components: { sidebar },
  data() {
    return {
      activeTab: 'pending',
      statusText: { pending: '待审核', approved: '已通过', rejected: '已拒绝' },
      list: [
        {
          id: 1, riderName: '张三', phone: '138****1234', avatar: '/static/logo.png',
          errorType: '订单异常', orderId: 'DD202512140001', submitTime: '2025-12-14 10:30',
          description: '客户地址错误，无法送达，已联系客户确认新地址',
          images: ['/static/logo.png'], status: 'pending'
        },
        {
          id: 2, riderName: '李四', phone: '139****5678', avatar: '/static/logo.png',
          errorType: '配送问题', orderId: 'DD202512140002', submitTime: '2025-12-14 09:15',
          description: '电动车故障，需要更换车辆',
          images: ['/static/logo.png', '/static/logo.png'], status: 'pending'
        },
        {
          id: 3, riderName: '王五', phone: '137****9012', avatar: '/static/logo.png',
          errorType: '支付问题', orderId: '', submitTime: '2025-12-13 16:20',
          description: '收款未到账，请核实',
          images: [], status: 'approved'
        }
      ]
    }
  },
  computed: {
    filteredList() {
      return this.list.filter(item => item.status === this.activeTab)
    }
  },
  methods: {
    previewImage(urls, current) {
      uni.previewImage({ urls, current: urls[current] })
    },
    handleAudit(item, status) {
      const action = status === 'approved' ? '通过' : '拒绝'
      uni.showModal({
        title: '确认操作',
        content: `确定${action}该异常申请？`,
        success: (res) => {
          if (res.confirm) {
            item.status = status
            uni.showToast({ title: '操作成功', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page-wrapper { display: flex; min-height: 100vh; }
.audit-container { flex: 1; min-height: 100vh; background: #f5f5f5; overflow-y: auto; }
.header { padding: 30rpx; background: #4a90d9; }
.header .title { font-size: 40rpx; font-weight: bold; color: #fff; }
.tabs { display: flex; background: #fff; padding: 20rpx 0; }
.tab { flex: 1; text-align: center; font-size: 28rpx; color: #666; padding: 16rpx 0; position: relative; }
.tab.active { color: #4a90d9; font-weight: bold; }
.tab.active::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 60rpx; height: 6rpx; background: #4a90d9; border-radius: 3rpx; }
.list-container { height: calc(100vh - 200rpx); padding: 20rpx; }
.audit-card { background: #fff; border-radius: 16rpx; margin-bottom: 24rpx; overflow: hidden; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 24rpx; border-bottom: 1rpx solid #f0f0f0; }
.rider-info { display: flex; align-items: center; }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; margin-right: 16rpx; }
.name { font-size: 30rpx; font-weight: bold; color: #333; display: block; }
.phone { font-size: 24rpx; color: #999; margin-top: 6rpx; display: block; }
.status { font-size: 24rpx; padding: 8rpx 20rpx; border-radius: 20rpx; }
.status.pending { background: #fff3e0; color: #ff9800; }
.status.approved { background: #e8f5e9; color: #4caf50; }
.status.rejected { background: #ffebee; color: #f44336; }
.card-body { padding: 24rpx; }
.info-row { display: flex; margin-bottom: 16rpx; font-size: 26rpx; }
.info-row.desc { flex-direction: column; }
.info-row.desc .value { margin-top: 8rpx; line-height: 1.6; }
.label { color: #999; flex-shrink: 0; }
.value { color: #333; flex: 1; }
.type-tag { color: #4a90d9; }
.error-images { margin-top: 16rpx; }
.error-images .images { display: flex; gap: 16rpx; margin-top: 12rpx; flex-wrap: wrap; }
.error-images image { width: 150rpx; height: 150rpx; border-radius: 8rpx; }
.card-footer { display: flex; padding: 24rpx; border-top: 1rpx solid #f0f0f0; gap: 20rpx; }
.btn { flex: 1; height: 80rpx; border-radius: 40rpx; font-size: 28rpx; }
.btn.reject { background: #fff; border: 1rpx solid #f44336; color: #f44336; }
.btn.approve { background: #4a90d9; color: #fff; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
</style>
