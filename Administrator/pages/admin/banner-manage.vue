<template>
  <view class="page-wrapper">
    <sidebar current="banner-manage"></sidebar>
    <view class="main-container">
      <view class="page-header">
        <view class="breadcrumb">业务运营 / 轮播图管理</view>
        <button class="add-btn" @click="showAddModal">+ 添加轮播图</button>
      </view>
      
      <view class="content-card">
        <view class="card-header">
          <text class="card-title">轮播图列表</text>
          <picker mode="selector" :range="statusOptions" range-key="label" @change="filterStatus">
            <view class="status-filter">{{ currentStatus }} ▼</view>
          </picker>
        </view>
        
        <view class="table-container">
          <view class="table-header">
            <text class="col col-id">序号</text>
            <text class="col col-img">预览图</text>
            <text class="col col-name">名称</text>
            <text class="col col-link">跳转链接</text>
            <text class="col col-sort">排序</text>
            <text class="col col-status">状态</text>
            <text class="col col-action">操作</text>
          </view>
          
          <view class="table-body">
            <view class="table-row" v-for="(item, index) in bannerList" :key="item.id">
              <text class="col col-id">{{ index + 1 }}</text>
              <view class="col col-img">
                <image :src="item.image" mode="aspectFill" @click="previewImage(item.image)"></image>
              </view>
              <text class="col col-name">{{ item.name }}</text>
              <text class="col col-link">{{ item.link }}</text>
              <text class="col col-sort">{{ item.sort }}</text>
              <view class="col col-status">
                <switch :checked="item.status" @change="toggleStatus(item)" color="#4a90d9" />
              </view>
              <view class="col col-action">
                <text class="action-btn edit" @click="editBanner(item)">编辑</text>
                <text class="action-btn move" @click="moveUp(item)">上移</text>
                <text class="action-btn delete" @click="deleteBanner(item)">删除</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="table-footer">
          <text class="total-info">显示 1 到 {{ bannerList.length }} 条，共 {{ bannerList.length }} 条记录</text>
          <view class="pagination">
            <text class="page-btn">上一页</text>
            <text class="page-btn">下一页</text>
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
      currentStatus: '全部状态',
      statusOptions: [
        { label: '全部状态', value: '' },
        { label: '已启用', value: 'on' },
        { label: '已禁用', value: 'off' }
      ],
      bannerList: [
        { id: 1, name: '首页主轮播', image: '/static/logo.png', link: '/pages/index/index', sort: 10, status: true },
        { id: 2, name: '活动推广', image: '/static/logo.png', link: '/pages/activity/detail?id=123', sort: 20, status: true },
        { id: 3, name: '新生专区', image: '/static/logo.png', link: '/pages/freshman/zone', sort: 30, status: false }
      ]
    }
  },
  methods: {
    filterStatus(e) {
      this.currentStatus = this.statusOptions[e.detail.value].label
    },
    previewImage(url) {
      uni.previewImage({ urls: [url], current: url })
    },
    toggleStatus(item) {
      item.status = !item.status
      uni.showToast({ title: item.status ? '已启用' : '已禁用', icon: 'none' })
    },
    showAddModal() {
      uni.showToast({ title: '添加轮播图', icon: 'none' })
    },
    editBanner(item) {
      uni.showToast({ title: '编辑: ' + item.name, icon: 'none' })
    },
    moveUp(item) {
      const idx = this.bannerList.findIndex(b => b.id === item.id)
      if (idx > 0) {
        const temp = this.bannerList[idx - 1]
        this.$set(this.bannerList, idx - 1, item)
        this.$set(this.bannerList, idx, temp)
        uni.showToast({ title: '已上移', icon: 'none' })
      }
    },
    deleteBanner(item) {
      uni.showModal({
        title: '确认删除',
        content: `确定删除轮播图"${item.name}"？`,
        success: (res) => {
          if (res.confirm) {
            this.bannerList = this.bannerList.filter(b => b.id !== item.id)
            uni.showToast({ title: '删除成功', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.page-wrapper { display: flex; min-height: 100vh; }
.main-container { flex: 1; background: #f0f5fa; padding: 30rpx; overflow-y: auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30rpx; }
.breadcrumb { font-size: 28rpx; color: #666; }
.add-btn { background: #4a90d9; color: #fff; font-size: 26rpx; padding: 16rpx 32rpx; border-radius: 8rpx; }
.content-card { background: #fff; border-radius: 12rpx; padding: 30rpx; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30rpx; }
.card-title { font-size: 32rpx; font-weight: bold; color: #333; }
.status-filter { font-size: 26rpx; color: #666; padding: 12rpx 24rpx; border: 1rpx solid #ddd; border-radius: 8rpx; }
.table-container { border: 1rpx solid #eee; border-radius: 8rpx; overflow: hidden; }
.table-header { display: flex; background: #f8f9fa; padding: 20rpx 16rpx; border-bottom: 1rpx solid #eee; }
.table-header .col { font-size: 24rpx; color: #999; font-weight: bold; }
.table-row { display: flex; align-items: center; padding: 20rpx 16rpx; border-bottom: 1rpx solid #f0f0f0; }
.col { font-size: 24rpx; color: #333; }
.col-id { width: 80rpx; text-align: center; }
.col-img { width: 140rpx; }
.col-img image { width: 100rpx; height: 60rpx; border-radius: 6rpx; border: 1rpx solid #4a90d9; }
.col-name { width: 180rpx; }
.col-link { flex: 1; color: #666; font-size: 22rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-sort { width: 100rpx; text-align: center; }
.col-status { width: 100rpx; }
.col-action { width: 240rpx; display: flex; gap: 16rpx; }
.action-btn { font-size: 24rpx; padding: 8rpx 16rpx; border-radius: 6rpx; }
.action-btn.edit { color: #4a90d9; }
.action-btn.move { color: #666; }
.action-btn.delete { background: #f44336; color: #fff; }
.table-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 30rpx; padding-top: 20rpx; }
.total-info { font-size: 24rpx; color: #999; }
.pagination { display: flex; gap: 20rpx; }
.page-btn { font-size: 24rpx; color: #4a90d9; }
</style>
