<template>
  <view class="page-wrapper">
    <sidebar current="student-home"></sidebar>
    <view class="home-container">
      <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input" @click="goSearch">
        <text class="search-icon">🔍</text>
        <text class="placeholder">搜索商品、店铺</text>
      </view>
    </view>
    
    <!-- 轮播图 -->
    <swiper class="banner" indicator-dots autoplay circular :interval="3000">
      <swiper-item v-for="(item, idx) in bannerList" :key="idx">
        <image :src="item.image" mode="aspectFill" @click="handleBannerClick(item)"></image>
      </swiper-item>
    </swiper>
    
    <!-- 分类导航 -->
    <view class="category-nav">
      <view class="category-item" v-for="item in categoryList" :key="item.id" @click="goCategory(item)">
        <image :src="item.icon" mode="aspectFill"></image>
        <text>{{ item.name }}</text>
      </view>
    </view>
    
    <!-- 活动专区 -->
    <view class="activity-section">
      <view class="section-header">
        <text class="section-title">🔥 热门活动</text>
        <text class="view-more" @click="viewMoreActivity">更多 ></text>
      </view>
      <scroll-view scroll-x class="activity-scroll">
        <view class="activity-item" v-for="item in activityList" :key="item.id" @click="goActivity(item)">
          <image :src="item.image" mode="aspectFill"></image>
          <view class="activity-info">
            <text class="activity-title">{{ item.title }}</text>
            <text class="activity-desc">{{ item.desc }}</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 推荐商品 -->
    <view class="recommend-section">
      <view class="section-header">
        <text class="section-title">✨ 为你推荐</text>
      </view>
      <view class="goods-grid">
        <view class="goods-item" v-for="item in goodsList" :key="item.id" @click="goGoodsDetail(item)">
          <image :src="item.image" mode="aspectFill"></image>
          <view class="goods-info">
            <text class="goods-name">{{ item.name }}</text>
            <view class="goods-price">
              <text class="price">¥{{ item.price }}</text>
              <text class="original-price" v-if="item.originalPrice">¥{{ item.originalPrice }}</text>
            </view>
            <text class="goods-sales">已售{{ item.sales }}件</text>
          </view>
        </view>
      </view>
    </view>
    
      <!-- 加载更多 -->
      <view class="load-more" @click="loadMore">
        <text>{{ loading ? '加载中...' : '点击加载更多' }}</text>
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
      bannerList: [
        { id: 1, image: '/static/logo.png', link: '' },
        { id: 2, image: '/static/logo.png', link: '' },
        { id: 3, image: '/static/logo.png', link: '' }
      ],
      categoryList: [
        { id: 1, name: '美食', icon: '/static/logo.png' },
        { id: 2, name: '超市', icon: '/static/logo.png' },
        { id: 3, name: '水果', icon: '/static/logo.png' },
        { id: 4, name: '鲜花', icon: '/static/logo.png' },
        { id: 5, name: '蛋糕', icon: '/static/logo.png' },
        { id: 6, name: '药品', icon: '/static/logo.png' },
        { id: 7, name: '跑腿', icon: '/static/logo.png' },
        { id: 8, name: '更多', icon: '/static/logo.png' }
      ],
      activityList: [
        { id: 1, image: '/static/logo.png', title: '新人专享', desc: '首单立减10元' },
        { id: 2, image: '/static/logo.png', title: '限时秒杀', desc: '每日10点开抢' },
        { id: 3, image: '/static/logo.png', title: '满减优惠', desc: '满30减5' }
      ],
      goodsList: [
        { id: 1, image: '/static/logo.png', name: '招牌奶茶', price: '12.00', originalPrice: '18.00', sales: 999 },
        { id: 2, image: '/static/logo.png', name: '炸鸡套餐', price: '25.00', originalPrice: '35.00', sales: 666 },
        { id: 3, image: '/static/logo.png', name: '水果拼盘', price: '19.90', originalPrice: '', sales: 520 },
        { id: 4, image: '/static/logo.png', name: '咖啡拿铁', price: '15.00', originalPrice: '22.00', sales: 888 }
      ]
    }
  },
  methods: {
    goSearch() {
      uni.navigateTo({ url: '/pages/student/search' })
    },
    handleBannerClick(item) {
      if (item.link) uni.navigateTo({ url: item.link })
    },
    goCategory(item) {
      uni.navigateTo({ url: `/pages/student/category?id=${item.id}&name=${item.name}` })
    },
    viewMoreActivity() {
      uni.navigateTo({ url: '/pages/student/activity' })
    },
    goActivity(item) {
      uni.navigateTo({ url: `/pages/student/activity-detail?id=${item.id}` })
    },
    goGoodsDetail(item) {
      uni.navigateTo({ url: `/pages/student/goods-detail?id=${item.id}` })
    },
    loadMore() {
      if (this.loading) return
      this.loading = true
      setTimeout(() => {
        this.goodsList.push(
          { id: Date.now(), image: '/static/logo.png', name: '新品推荐', price: '20.00', originalPrice: '30.00', sales: 100 }
        )
        this.loading = false
      }, 1000)
    }
  }
}
</script>

<style scoped>
.page-wrapper { display: flex; min-height: 100vh; }
.home-container { flex: 1; background: #f5f5f5; min-height: 100vh; padding-bottom: 30rpx; overflow-y: auto; }
.search-bar { padding: 20rpx 30rpx; background: #4a90d9; }
.search-input { display: flex; align-items: center; background: #fff; border-radius: 36rpx; padding: 16rpx 30rpx; }
.search-icon { font-size: 32rpx; margin-right: 16rpx; }
.placeholder { color: #999; font-size: 28rpx; }
.banner { height: 300rpx; margin: 20rpx; border-radius: 16rpx; overflow: hidden; }
.banner image { width: 100%; height: 100%; }
.category-nav { display: flex; flex-wrap: wrap; background: #fff; margin: 0 20rpx; border-radius: 16rpx; padding: 30rpx 0; }
.category-item { width: 25%; display: flex; flex-direction: column; align-items: center; margin-bottom: 30rpx; }
.category-item image { width: 80rpx; height: 80rpx; margin-bottom: 12rpx; }
.category-item text { font-size: 24rpx; color: #333; }
.activity-section, .recommend-section { margin: 20rpx; background: #fff; border-radius: 16rpx; padding: 24rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.section-title { font-size: 32rpx; font-weight: bold; color: #333; }
.view-more { font-size: 26rpx; color: #999; }
.activity-scroll { white-space: nowrap; }
.activity-item { display: inline-block; width: 280rpx; margin-right: 20rpx; border-radius: 12rpx; overflow: hidden; background: #f8f8f8; }
.activity-item image { width: 100%; height: 160rpx; }
.activity-info { padding: 16rpx; }
.activity-title { font-size: 28rpx; font-weight: bold; color: #333; display: block; }
.activity-desc { font-size: 24rpx; color: #999; margin-top: 8rpx; display: block; }
.goods-grid { display: flex; flex-wrap: wrap; gap: 20rpx; }
.goods-item { width: calc(50% - 10rpx); background: #fff; border-radius: 12rpx; overflow: hidden; box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05); }
.goods-item image { width: 100%; height: 280rpx; }
.goods-info { padding: 16rpx; }
.goods-name { font-size: 28rpx; color: #333; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.goods-price { display: flex; align-items: baseline; margin-top: 12rpx; }
.price { font-size: 32rpx; color: #f44336; font-weight: bold; }
.original-price { font-size: 24rpx; color: #999; text-decoration: line-through; margin-left: 12rpx; }
.goods-sales { font-size: 22rpx; color: #999; margin-top: 8rpx; display: block; }
.load-more { text-align: center; padding: 30rpx; color: #999; font-size: 26rpx; }
</style>
