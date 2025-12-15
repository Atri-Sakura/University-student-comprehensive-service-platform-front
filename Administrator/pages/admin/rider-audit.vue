<template>
  <view class="page-wrapper">
    <sidebar current="rider-audit"></sidebar>
    <view class="audit-container">
      <view class="header">
        <text class="title">骑手资质审核</text>
      </view>
    
    <view class="tabs">
      <view :class="['tab', activeTab === 'pending' && 'active']" @click="activeTab = 'pending'">待审核</view>
      <view :class="['tab', activeTab === 'approved' && 'active']" @click="activeTab = 'approved'">已通过</view>
      <view :class="['tab', activeTab === 'rejected' && 'active']" @click="activeTab = 'rejected'">已拒绝</view>
    </view>
    
    <scroll-view scroll-y class="list-container">
      <view class="audit-card" v-for="item in filteredList" :key="item.id">
        <view class="card-header">
          <image class="avatar" :src="item.avatar" mode="aspectFill"></image>
          <view class="info">
            <text class="name">{{ item.name }}</text>
            <text class="phone">{{ item.phone }}</text>
          </view>
          <view :class="['status', item.status]">{{ statusText[item.status] }}</view>
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <text class="label">身份证号：</text>
            <text class="value">{{ item.idCard }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请时间：</text>
            <text class="value">{{ item.applyTime }}</text>
          </view>
          <view class="cert-images">
            <text class="label">证件照片：</text>
            <view class="images">
              <image v-for="(img, idx) in item.certImages" :key="idx" :src="img" mode="aspectFill" @click="previewImage(item.certImages, idx)"></image>
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
          id: 1, name: '张三', phone: '138****1234', idCard: '310***********1234',
          avatar: '/static/logo.png', applyTime: '2025-12-14 10:30',
          certImages: ['/static/logo.png', '/static/logo.png'], status: 'pending'
        },
        {
          id: 2, name: '李四', phone: '139****5678', idCard: '320***********5678',
          avatar: '/static/logo.png', applyTime: '2025-12-13 14:20',
          certImages: ['/static/logo.png'], status: 'approved'
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
      uni.showModal({
        title: '确认操作',
        content: `确定${status === 'approved' ? '通过' : '拒绝'}该骑手的资质申请？`,
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
.card-header { display: flex; align-items: center; padding: 24rpx; border-bottom: 1rpx solid #f0f0f0; }
.avatar { width: 100rpx; height: 100rpx; border-radius: 50%; margin-right: 20rpx; }
.info { flex: 1; }
.name { font-size: 32rpx; font-weight: bold; color: #333; display: block; }
.phone { font-size: 26rpx; color: #999; margin-top: 8rpx; display: block; }
.status { font-size: 24rpx; padding: 8rpx 20rpx; border-radius: 20rpx; }
.status.pending { background: #fff3e0; color: #ff9800; }
.status.approved { background: #e8f5e9; color: #4caf50; }
.status.rejected { background: #ffebee; color: #f44336; }
.card-body { padding: 24rpx; }
.info-row { display: flex; margin-bottom: 16rpx; font-size: 26rpx; }
.label { color: #999; width: 160rpx; }
.value { color: #333; flex: 1; }
.cert-images { margin-top: 16rpx; }
.cert-images .images { display: flex; gap: 16rpx; margin-top: 12rpx; }
.cert-images image { width: 160rpx; height: 160rpx; border-radius: 8rpx; }
.card-footer { display: flex; padding: 24rpx; border-top: 1rpx solid #f0f0f0; gap: 20rpx; }
.btn { flex: 1; height: 80rpx; border-radius: 40rpx; font-size: 28rpx; }
.btn.reject { background: #fff; border: 1rpx solid #f44336; color: #f44336; }
.btn.approve { background: #4a90d9; color: #fff; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
</style>
