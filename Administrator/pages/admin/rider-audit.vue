<template>
  <view class="page-wrapper">
    <sidebar current="rider-audit"></sidebar>
    <view class="audit-container">
      <view class="header">
        <text class="title">骑手资质审核</text>
      </view>
    
    <view class="tabs">
      <view :class="['tab', activeTab === 'pending' && 'active']" @click="switchTab('pending')">待审核</view>
      <view :class="['tab', activeTab === 'approved' && 'active']" @click="switchTab('approved')">已通过</view>
      <view :class="['tab', activeTab === 'rejected' && 'active']" @click="switchTab('rejected')">已拒绝</view>
    </view>
    
    <scroll-view scroll-y class="list-container" @scrolltolower="loadMore">
      <view class="audit-card" v-for="item in filteredList" :key="item.riderBaseId">
        <view class="card-header">
          <image class="avatar" :src="item.avatar || '/static/logo.png'" mode="aspectFill"></image>
          <view class="info">
            <text class="name">{{ item.realName || item.nickname || '未设置昵称' }}</text>
            <text class="phone">{{ item.phone }}</text>
          </view>
          <view :class="['status', getStatusClass(item.auditStatus)]">{{ getStatusText(item.auditStatus) }}</view>
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <text class="label">身份证号：</text>
            <text class="value">{{ formatIdCard(item.idCard) }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请时间：</text>
            <text class="value">{{ item.applyTime || item.createTime }}</text>
          </view>
          <view class="info-row" v-if="item.vehicleType">
            <text class="label">车辆类型：</text>
            <text class="value">{{ item.vehicleType }}</text>
          </view>
          <view class="info-row" v-if="item.vehiclePlate">
            <text class="label">车牌号：</text>
            <text class="value">{{ item.vehiclePlate }}</text>
          </view>
          <view class="cert-images" v-if="getCertImages(item).length > 0">
            <text class="label">证件照片：</text>
            <view class="images">
              <image v-for="(img, idx) in getCertImages(item)" :key="idx" :src="img" mode="aspectFill" @click="previewImage(getCertImages(item), idx)"></image>
            </view>
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

// API基础路径配置
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
    this.fetchRiderList()
  },
  methods: {
    // 获取骑手资质审核列表
    fetchRiderList() {
      this.loading = true
      uni.request({
        url: `${BASE_URL}/platform/qualificationReview`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('接口返回数据:', res.data)
          if (res.statusCode === 200 && res.data) {
            const data = res.data
            if (data.code === 200 || data.msg === '查询成功') {
              // 处理返回的数据，可能是数组或对象
              const listData = Array.isArray(data.data) ? data.data : (data.data ? [data.data] : [])
              console.log('处理后的列表数据:', listData)
              this.list = listData
            } else {
              uni.showToast({ title: data.msg || '获取数据失败', icon: 'none' })
            }
          }
        },
        fail: (error) => {
          console.error('获取骑手列表失败:', error)
          uni.showToast({ title: '网络请求失败', icon: 'none' })
        },
        complete: () => {
          this.loading = false
        }
      })
    },
    
    // 切换标签
    switchTab(tab) {
      this.activeTab = tab
    },
    
    // 加载更多
    loadMore() {
      // 如果需要分页，可以在这里实现
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      if (status === 0 || status === 'pending') return 'pending'
      if (status === 1 || status === 'approved') return 'approved'
      if (status === 2 || status === 'rejected') return 'rejected'
      return 'pending'
    },
    
    // 获取状态文本
    getStatusText(status) {
      if (status === 0 || status === 'pending') return '待审核'
      if (status === 1 || status === 'approved') return '已通过'
      if (status === 2 || status === 'rejected') return '已拒绝'
      return '未知'
    },
    
    // 格式化手机号
    formatPhone(phone) {
      if (!phone) return ''
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },
    
    // 格式化身份证号
    formatIdCard(idCard) {
      if (!idCard) return ''
      return idCard.replace(/(\d{3})\d{11}(\d{4})/, '$1***********$2')
    },
    
    // 获取证件图片数组
    getCertImages(item) {
      const images = []
      if (item.idCardFront) images.push(item.idCardFront)
      if (item.idCardBack) images.push(item.idCardBack)
      if (item.driverLicense) images.push(item.driverLicense)
      if (item.vehiclePhoto) images.push(item.vehiclePhoto)
      if (item.certImages && Array.isArray(item.certImages)) {
        images.push(...item.certImages)
      }
      return images
    },
    
    // 预览图片
    previewImage(urls, current) {
      uni.previewImage({ urls, current: urls[current] })
    },
    
    // 处理审核操作
    handleAudit(item, status) {
      const statusText = status === 1 ? '通过' : '拒绝'
      uni.showModal({
        title: '确认操作',
        content: `确定${statusText}该骑手的资质申请？`,
        success: (res) => {
          if (res.confirm) {
            this.submitAudit(item.riderBaseId, status)
          }
        }
      })
    },
    
    // 提交审核结果
    submitAudit(riderId, status) {
      uni.showLoading({ title: '提交中...' })
      uni.request({
        url: `${BASE_URL}/platform/qualificationReview`,
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          riderId: riderId,
          status: status
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            const data = res.data
            if (data.code === 200 || data.msg === '修改成功') {
              uni.showToast({ title: '操作成功', icon: 'success' })
              // 刷新列表
              this.fetchRiderList()
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
.cert-images .images { display: flex; gap: 16rpx; margin-top: 12rpx; flex-wrap: wrap; }
.cert-images image { width: 160rpx; height: 160rpx; border-radius: 8rpx; }
.card-footer { display: flex; padding: 24rpx; border-top: 1rpx solid #f0f0f0; gap: 20rpx; }
.btn { flex: 1; height: 80rpx; border-radius: 40rpx; font-size: 28rpx; line-height: 80rpx; }
.btn.reject { background: #fff; border: 1rpx solid #f44336; color: #f44336; }
.btn.approve { background: #4a90d9; color: #fff; }
.loading { text-align: center; padding: 40rpx 0; color: #999; font-size: 26rpx; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
</style>
