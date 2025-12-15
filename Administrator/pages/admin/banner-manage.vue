<template>
  <view class="page-wrapper">
    <sidebar current="banner-manage"></sidebar>
    <view class="main-container">
      <view class="page-header">
        <view class="breadcrumb">业务运营 / 轮播图管理</view>
        <button class="add-btn" @click="chooseImage">+ 添加轮播图</button>
      </view>
      
      <view class="content-card">
        <view class="card-header">
          <text class="card-title">轮播图列表</text>
        </view>
        
        <view class="table-container">
          <view class="table-header">
            <text class="col col-id">序号</text>
            <text class="col col-img">预览图</text>
            <text class="col col-url">图片地址</text>
            <text class="col col-action">操作</text>
          </view>
          
          <view class="table-body">
            <view class="table-row" v-for="(item, index) in bannerList" :key="item.indexImageUrlId">
              <text class="col col-id">{{ index + 1 }}</text>
              <view class="col col-img">
                <image :src="item.indexImageUrl" mode="aspectFill" @click="previewImage(item.indexImageUrl)"></image>
              </view>
              <text class="col col-url">{{ item.indexImageUrl }}</text>
              <view class="col col-action">
                <text class="action-btn delete" @click="deleteBanner(item)">删除</text>
              </view>
            </view>
            <view class="empty-row" v-if="bannerList.length === 0 && !loading">
              <text>暂无轮播图数据</text>
            </view>
            <view class="loading-row" v-if="loading">
              <text>加载中...</text>
            </view>
          </view>
        </view>
        
        <view class="table-footer">
          <text class="total-info">共 {{ bannerList.length }} 条记录</text>
          <text class="refresh-btn" @click="loadBannerList">刷新</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import sidebar from '@/components/sidebar/sidebar.vue'
import { request, uploadFile } from '@/utils/request.js'

export default {
  components: { sidebar },
  data() {
    return {
      loading: false,
      bannerList: []
    }
  },
  onLoad() {
    this.loadBannerList()
  },
  methods: {
    // 获取轮播图列表
    async loadBannerList() {
      this.loading = true
      try {
        const res = await request({ url: '/platform/index/review' })
        this.bannerList = res.data || []
      } catch (e) {
        console.error('获取轮播图列表失败:', e)
      } finally {
        this.loading = false
      }
    },
    
    // 选择图片并上传
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.uploadImage(res.tempFilePaths[0])
        }
      })
    },
    
    // 上传轮播图
    async uploadImage(filePath) {
      uni.showLoading({ title: '上传中...' })
      try {
        await uploadFile({ url: '/platform/index/review', filePath })
        uni.hideLoading()
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.loadBannerList()
      } catch (e) {
        uni.hideLoading()
        console.error('上传失败:', e)
      }
    },
    
    // 删除轮播图
    deleteBanner(item) {
      uni.showModal({
        title: '确认删除',
        content: '确定删除该轮播图？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await request({
                url: '/platform/index/review',
                method: 'DELETE',
                data: {
                  indexImageUrlId: item.indexImageUrlId,
                  indexImageUrl: item.indexImageUrl
                }
              })
              uni.showToast({ title: '删除成功', icon: 'success' })
              this.loadBannerList()
            } catch (e) {
              console.error('删除失败:', e)
            }
          }
        }
      })
    },
    
    // 预览图片
    previewImage(url) {
      uni.previewImage({ urls: [url], current: url })
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
.table-container { border: 1rpx solid #eee; border-radius: 8rpx; overflow: hidden; }
.table-header { display: flex; background: #f8f9fa; padding: 20rpx 16rpx; border-bottom: 1rpx solid #eee; }
.table-header .col { font-size: 24rpx; color: #999; font-weight: bold; }
.table-row { display: flex; align-items: center; padding: 20rpx 16rpx; border-bottom: 1rpx solid #f0f0f0; }
.col { font-size: 24rpx; color: #333; }
.col-id { width: 100rpx; text-align: center; }
.col-img { width: 200rpx; }
.col-img image { width: 160rpx; height: 90rpx; border-radius: 8rpx; border: 1rpx solid #eee; }
.col-url { flex: 1; color: #666; font-size: 22rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 20rpx; }
.col-action { width: 150rpx; text-align: center; }
.action-btn { font-size: 24rpx; padding: 12rpx 24rpx; border-radius: 6rpx; }
.action-btn.delete { background: #f44336; color: #fff; }
.empty-row, .loading-row { padding: 60rpx; text-align: center; color: #999; font-size: 28rpx; }
.table-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 30rpx; padding-top: 20rpx; }
.total-info { font-size: 24rpx; color: #999; }
.refresh-btn { font-size: 24rpx; color: #4a90d9; padding: 12rpx 24rpx; border: 1rpx solid #4a90d9; border-radius: 6rpx; }
</style>
