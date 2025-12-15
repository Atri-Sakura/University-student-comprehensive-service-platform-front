<template>
  <view class="page-wrapper">
    <sidebar current="license-audit"></sidebar>
    <view class="audit-container">
      <view class="header">
        <text class="title">平台营业执照审核</text>
      </view>
    
    <view class="tabs">
      <view :class="['tab', activeTab === 'pending' && 'active']" @click="activeTab = 'pending'">待审核</view>
      <view :class="['tab', activeTab === 'approved' && 'active']" @click="activeTab = 'approved'">已通过</view>
      <view :class="['tab', activeTab === 'rejected' && 'active']" @click="activeTab = 'rejected'">已拒绝</view>
    </view>
    
    <scroll-view scroll-y class="list-container">
      <view class="audit-card" v-for="item in filteredList" :key="item.id">
        <view class="card-header">
          <view class="company-info">
            <text class="company-name">{{ item.companyName }}</text>
            <text class="legal-person">法人：{{ item.legalPerson }}</text>
          </view>
          <view :class="['status', item.status]">{{ statusText[item.status] }}</view>
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <text class="label">统一社会信用代码：</text>
            <text class="value">{{ item.creditCode }}</text>
          </view>
          <view class="info-row">
            <text class="label">注册地址：</text>
            <text class="value">{{ item.address }}</text>
          </view>
          <view class="info-row">
            <text class="label">经营范围：</text>
            <text class="value">{{ item.businessScope }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请时间：</text>
            <text class="value">{{ item.applyTime }}</text>
          </view>
          <view class="license-image">
            <text class="label">营业执照：</text>
            <image :src="item.licenseImage" mode="aspectFit" @click="previewImage(item.licenseImage)"></image>
          </view>
        </view>
        
        <view class="card-footer" v-if="item.status === 'pending'">
          <button class="btn reject" @click="handleAudit(item, 'rejected')">拒绝</button>
          <button class="btn approve" @click="handleAudit(item, 'approved')">通过</button>
        </view>
        
        <view class="reject-reason" v-if="item.status === 'rejected' && item.rejectReason">
          <text class="label">拒绝原因：</text>
          <text class="reason">{{ item.rejectReason }}</text>
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
          id: 1, companyName: '某某科技有限公司', legalPerson: '王五',
          creditCode: '91310000MA1FL8XXXX', address: '上海市浦东新区XX路XX号',
          businessScope: '技术开发、技术咨询、技术服务',
          applyTime: '2025-12-14 09:00', licenseImage: '/static/logo.png', status: 'pending'
        },
        {
          id: 2, companyName: '某某餐饮管理公司', legalPerson: '赵六',
          creditCode: '91310000MA1FL9XXXX', address: '上海市静安区XX路XX号',
          businessScope: '餐饮服务、食品销售',
          applyTime: '2025-12-13 15:30', licenseImage: '/static/logo.png', status: 'approved'
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
    previewImage(url) {
      uni.previewImage({ urls: [url], current: url })
    },
    handleAudit(item, status) {
      if (status === 'rejected') {
        uni.showModal({
          title: '请输入拒绝原因',
          editable: true,
          placeholderText: '请输入拒绝原因',
          success: (res) => {
            if (res.confirm) {
              item.status = status
              item.rejectReason = res.content || '资料不符合要求'
              uni.showToast({ title: '操作成功', icon: 'success' })
            }
          }
        })
      } else {
        uni.showModal({
          title: '确认操作',
          content: '确定通过该营业执照审核？',
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
.btn { flex: 1; height: 80rpx; border-radius: 40rpx; font-size: 28rpx; }
.btn.reject { background: #fff; border: 1rpx solid #f44336; color: #f44336; }
.btn.approve { background: #4a90d9; color: #fff; }
.reject-reason { padding: 20rpx 24rpx; background: #fff5f5; }
.reject-reason .label { color: #f44336; font-size: 26rpx; }
.reject-reason .reason { color: #666; font-size: 26rpx; }
.empty { text-align: center; padding: 100rpx 0; color: #999; font-size: 28rpx; }
</style>
