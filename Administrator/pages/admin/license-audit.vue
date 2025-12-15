<template>
  <view class="page-wrapper">
    <sidebar current="license-audit"></sidebar>
    <view class="audit-container">
      <view class="header">
        <text class="title">平台营业执照审核</text>
      </view>
    
    <view class="tabs">
      <view :class="['tab', activeTab === 'pending' && 'active']" @click="switchTab('pending')">待审核</view>
      <view :class="['tab', activeTab === 'approved' && 'active']" @click="switchTab('approved')">已通过</view>
      <view :class="['tab', activeTab === 'rejected' && 'active']" @click="switchTab('rejected')">已拒绝</view>
    </view>
    
    <scroll-view scroll-y class="list-container">
      <view class="audit-card" v-for="item in filteredList" :key="item.merchantId">
        <view class="card-header">
          <view class="company-info">
            <text class="company-name">{{ item.shopName || item.merchantName || '未设置店铺名' }}</text>
            <text class="legal-person">联系人：{{ item.contactName || item.nickname || '未设置' }}</text>
          </view>
          <view :class="['status', getStatusClass(item.auditStatus)]">{{ getStatusText(item.auditStatus) }}</view>
        </view>
        
        <view class="card-body">
          <view class="info-row" v-if="item.creditCode">
            <text class="label">统一社会信用代码：</text>
            <text class="value">{{ item.creditCode }}</text>
          </view>
          <view class="info-row" v-if="item.address">
            <text class="label">注册地址：</text>
            <text class="value">{{ item.address }}</text>
          </view>
          <view class="info-row" v-if="item.businessScope">
            <text class="label">经营范围：</text>
            <text class="value">{{ item.businessScope }}</text>
          </view>
          <view class="info-row" v-if="item.phone">
            <text class="label">联系电话：</text>
            <text class="value">{{ item.phone }}</text>
          </view>
          <view class="info-row" v-if="item.createTime">
            <text class="label">申请时间：</text>
            <text class="value">{{ item.createTime }}</text>
          </view>
          <view class="license-image" v-if="item.businessLicense">
            <text class="label">营业执照：</text>
            <image :src="item.businessLicense" mode="aspectFit" @click="previewImage(item.businessLicense)"></image>
          </view>
        </view>
        
        <view class="card-footer" v-if="item.auditStatus === 0">
          <button class="btn reject" @click="handleAudit(item, 2)">拒绝</button>
          <button class="btn approve" @click="handleAudit(item, 1)">通过</button>
        </view>
      </view>
      
      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>
      
      <view class="empty" v-if="!loading && filteredList.length === 0">
        <text>暂无数据</text>
      </view>
    </scroll-view>
    </view>
  </view>
</template>

<script>
import sidebar from '@/components/sidebar/sidebar.vue'

const BASE_URL = 'http://localhost:8080'

export default {
  components: { sidebar },
  data() {
    return {
      activeTab: 'pending',
      list: [],
      loading: false
    }
  },
  computed: {
    filteredList() {
      return this.list.filter(item => {
        const status = item.auditStatus
        if (this.activeTab === 'pending') {
          return status === 0
        } else if (this.activeTab === 'approved') {
          return status === 1
        } else if (this.activeTab === 'rejected') {
          return status === 2
        }
        return false
      })
    }
  },
  onLoad() {
    this.fetchMerchantList()
  },
  methods: {
    // 获取商家资质审核列表
    fetchMerchantList() {
      this.loading = true
      uni.request({
        url: `${BASE_URL}/platform/qualificationReview/merchant`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('商家接口返回数据:', res.data)
          if (res.statusCode === 200 && res.data) {
            const data = res.data
            if (data.code === 200 || data.msg === '查询成功') {
              this.list = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : [])
              console.log('商家列表数据:', this.list)
            } else {
              uni.showToast({ title: data.msg || '获取数据失败', icon: 'none' })
            }
          }
        },
        fail: (error) => {
          console.error('获取商家列表失败:', error)
          uni.showToast({ title: '网络请求失败', icon: 'none' })
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    
    switchTab(tab) {
      this.activeTab = tab
    },
    
    getStatusClass(status) {
      if (status === 0) return 'pending'
      if (status === 1) return 'approved'
      if (status === 2) return 'rejected'
      return 'pending'
    },
    
    getStatusText(status) {
      if (status === 0) return '待审核'
      if (status === 1) return '已通过'
      if (status === 2) return '已拒绝'
      return '未知'
    },
    
    previewImage(url) {
      uni.previewImage({ urls: [url], current: url })
    },
    
    handleAudit(item, status) {
      const statusText = status === 1 ? '通过' : '拒绝'
      uni.showModal({
        title: '确认操作',
        content: `确定${statusText}该商家的营业执照审核？`,
        success: (res) => {
          if (res.confirm) {
            this.submitAudit(item.merchantId, status)
          }
        }
      })
    },
    
    submitAudit(merchantId, status) {
      uni.showLoading({ title: '提交中...' })
      uni.request({
        url: `${BASE_URL}/platform/qualificationReview/merchant`,
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          merchantId: merchantId,
          status: status
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            const data = res.data
            if (data.code === 200 || data.msg === '修改成功') {
              uni.showToast({ title: '操作成功', icon: 'success' })
              this.fetchMerchantList()
            } else {
              uni.showToast({ title: data.msg || '操作失败', icon: 'none' })
            }
          }
        },
        fail: (error) => {
          console.error('提交审核失败:', error)
          uni.showToast({ title: '网络请求失败', icon: 'none' })
        },
        complete: () => {
          uni.hideLoading()
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
.card-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24rpx; border-bottom: 1rpx solid #f0f0f0; }
.company-info { flex: 1; }
.company-name { font-size: 32rpx; font-weight: bold; color: #333; display: block; }
.legal-person { font-size: 26rpx; color: #999; margin-top: 8rpx; display: block; }
.status { font-size: 24rpx; padding: 8rpx 20rpx; border-radius: 20rpx; }
.status.pending { background: #fff3e0; color: #ff9800; }
.status.approved { background: #e8f5e9; color: #4caf50; }
.status.rejected { background: #ffebee; color: #f44336; }
.card-body { padding: 24rpx; }
.info-row { display: flex; margin-bottom: 16rpx; font-size: 26rpx; }
.label { color: #999; flex-shrink: 0; }
.value { color: #333; flex: 1; }
.license-image { margin-top: 16rpx; }
.license-image image { width: 100%; height: 300rpx; border-radius: 8rpx; margin-top: 12rpx; }
.card-footer { display: flex; padding: 24rpx; border-top: 1rpx solid #f0f0f0; gap: 20rpx; }
.btn { flex: 1; height: 80rpx; border-radius: 40rpx; font-size: 28rpx; line-height: 80rpx; }
.btn.reject { background: #fff; border: 1rpx solid #f44336; color: #f44336; }
.btn.approve { background: #4a90d9; color: #fff; }
.loading { text-align: center; padding: 40rpx 0; color: #999; font-size: 26rpx; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
</style>
