<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-title">校园生活</text>
        <view class="location">
          <text class="location-icon">📍</text>
          <text class="location-text">贵州大学</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y :style="{ top: navHeight + 'px' }">
      <!-- 轮播图 -->
      <view class="banner-section">
        <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" circular>
          <swiper-item v-for="(item, index) in bannerList" :key="index">
            <image class="banner-image" :src="item.image" mode="aspectFill"></image>
          </swiper-item>
        </swiper>
      </view>

      <!-- 功能按钮 -->
      <view class="function-section">
        <view class="function-item" @click="navToSchedule">
          <view class="function-icon-box">
            <text class="function-icon">📅</text>
          </view>
          <text class="function-text">个人课表</text>
        </view>
        <view class="function-item" @click="navToErrand">
          <view class="function-icon-box">
            <text class="function-icon">🏃</text>
          </view>
          <text class="function-text">跑腿服务</text>
        </view>
        <view class="function-item" @click="navToFood">
          <view class="function-icon-box">
            <text class="function-icon">🍽️</text>
          </view>
          <text class="function-text">外卖点餐</text>
        </view>
      </view>

      <!-- 今日课程 -->
      <view class="course-section">
        <view class="section-header">
          <text class="section-title">今日课程</text>
          <text class="section-more" @click="viewAllCourses">查看全部</text>
        </view>
        <view class="course-list">
          <view class="course-item" v-for="(item, index) in courseList" :key="index">
            <view class="course-time">{{ item.time }}</view>
            <view class="course-info">
              <text class="course-name">{{ item.name }}</text>
              <text class="course-location">{{ item.location }}</text>
            </view>
          </view>
          <view v-if="courseList.length === 0" class="empty-course">
            <text class="empty-text">今日暂无课程</text>
          </view>
        </view>
      </view>

      <!-- 推荐外卖 -->
      <view class="recommend-section">
        <view class="section-header">
          <text class="section-title">推荐外卖</text>
          <text class="section-more" @click="viewAllFood">查看全部</text>
        </view>
        <scroll-view class="recommend-scroll" scroll-x>
          <view class="recommend-list">
            <view class="recommend-item" v-for="(item, index) in recommendList" :key="index" @click="viewFoodDetail(item)">
              <image class="recommend-image" :src="item.image" mode="aspectFill"></image>
              <text class="recommend-name">{{ item.name }}</text>
              <text class="recommend-price">¥{{ item.price }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
      
      <!-- 推荐二手商品 -->
      <view class="recommend-section">
        <view class="section-header">
          <text class="section-title">推荐二手商品</text>
          <text class="section-more" @click="viewAllSecondHand">查看全部</text>
        </view>
        <scroll-view class="recommend-scroll" scroll-x>
          <view class="recommend-list">
            <view class="recommend-item" v-for="(item, index) in secondHandList" :key="item.goodsId || item.id || index" @click="viewSecondHandDetail(item)">
              <image class="recommend-image" :src="getGoodsImage(item)" mode="aspectFill"></image>
              <text class="recommend-name">{{ item.goodsName || item.name || item.title }}</text>
              <text class="recommend-price">¥{{ item.price }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </scroll-view>
    
    <!-- 自定义底部导航栏 -->
    <custom-tabbar :current="0"></custom-tabbar>
  </view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
import { getGoodsList } from '@/api/secondhandGoods.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      bannerList: [
        // 校园生活主题图片 - 教学楼场景
        { image: 'https://picsum.photos/id/1067/750/400', bgColor: '#E8F5E9' },
        // 校园生活主题图片 - 图书馆场景
        { image: 'https://picsum.photos/id/24/750/400', bgColor: '#E3F2FD' },
        // 校园生活主题图片 - 校园风景
        { image: 'https://picsum.photos/id/110/750/400', bgColor: '#FFF3E0' }
      ],
      courseList: [
        { time: '08:00', name: '高等数学', location: '教学楼A201' },
        { time: '10:00', name: '大学英语', location: '外语楼B102' },
        { time: '14:00', name: '程序设计', location: '计算机中心305' }
      ],
      recommendList: [
        { id: 1, restaurantId: '1001', image: 'https://picsum.photos/200/200?random=11', name: '营养套餐', price: '15', icon: '🍱' },
        { id: 2, restaurantId: '1001', image: 'https://picsum.photos/200/200?random=12', name: '香辣鸡腿饭', price: '18', icon: '🍗' },
        { id: 3, restaurantId: '1002', image: 'https://picsum.photos/200/200?random=13', name: '蔬菜沙拉', price: '12', icon: '🥗' },
        { id: 4, restaurantId: '1002', image: 'https://picsum.photos/200/200?random=14', name: '水果拼盘', price: '20', icon: '🍉' }
      ],
      secondHandList: []
    };
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
    
    // 加载推荐二手商品
    this.loadSecondHandGoods();
  },
  onShow() {
    // 每次显示页面时刷新二手商品列表
    this.loadSecondHandGoods();
  },
  methods: {
    // 导航到个人课表
    navToSchedule() {
      uni.navigateTo({
        url: '/pages/schedule/schedule'
      });
    },
    // 导航到跑腿服务
    navToErrand() {
      uni.navigateTo({
        url: '/pages/errand/errand'
      });
    },
    // 导航到外卖点餐
    navToFood() {
      uni.navigateTo({
        url: '/pages/food/food'
      });
    },
    // 查看全部课程
    viewAllCourses() {
      uni.navigateTo({
        url: '/pages/schedule/schedule'
      });
    },
    // 查看全部外卖
    viewAllFood() {
      uni.navigateTo({
        url: '/pages/food/food?view=all'
      });
    },
    // 查看外卖详情 - 直接跳转到商家页面并选择对应套餐
    viewFoodDetail(item) {
      uni.navigateTo({
        url: `/pages/food/food-detail?restaurantId=${item.restaurantId}&selectedFoodId=${item.id}`
      });
    },
    // 查看所有二手商品 - 修改为与底部导航栏一致的跳转方式
    viewAllSecondHand() {
      uni.reLaunch({
        url: '/pages/market/market',
        success: () => {
          console.log('跳转成功: 二手交易');
        },
        fail: (err) => {
          console.error('跳转失败:', err);
        }
      });
    },
    // 查看二手商品详情 - 跳转到二手交易页面并自动选择对应商品
    viewSecondHandDetail(item) {
      // 获取商品ID，兼容不同字段名
      const goodsId = item.id || item.goodsId || item.goods_id || item.secondhandGoodsId;
      const name = item.goodsName || item.name || item.title;
      const price = item.price;
      const image = this.getGoodsImage(item);
      const description = item.description || item.desc || '';
      
      if (!goodsId) {
        console.error('商品ID不存在！商品数据：', item);
        return;
      }
      
      // 跳转到商品详情页
      uni.navigateTo({
        url: `/pages/goods-detail/goods-detail?id=${goodsId}&name=${encodeURIComponent(name)}&price=${price}&image=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`
      });
    },
    // 加载推荐二手商品
    async loadSecondHandGoods() {
      try {
        const result = await getGoodsList({
          pageNum: 1,
          pageSize: 4  // 只获取4个推荐商品
        });
        
        // 根据后端实际返回的数据结构调整
        let list = [];
        
        if (result.rows) {
          list = result.rows;
        } else if (result.data) {
          if (Array.isArray(result.data)) {
            list = result.data;
          } else if (result.data.rows) {
            list = result.data.rows;
          } else if (result.data.list) {
            list = result.data.list;
          } else if (result.data.records) {
            list = result.data.records;
          }
        } else if (result.list) {
          list = result.list;
        } else if (result.records) {
          list = result.records;
        }
        
        // 过滤掉已售、下架的商品，只显示上架的商品
        // status: 0-未发布，1-上架，2-已售，3-下架
        const availableList = list.filter(item => {
          const status = item.status;
          return status === 0 || status === 1 || status === undefined || status === null;
        });
        
        // 只取前4个
        this.secondHandList = availableList.slice(0, 4);
        
      } catch (error) {
        console.error('加载推荐二手商品失败：', error);
        // 失败时使用默认数据
        this.secondHandList = [
          { id: 2, image: 'https://picsum.photos/200/200?random=22', name: '高等数学教材', price: '25' },
          { id: 4, image: 'https://picsum.photos/200/200?random=24', name: '自行车', price: '200' },
          { id: 6, image: 'https://picsum.photos/200/200?random=26', name: '耳机', price: '50' },
          { id: 5, image: 'https://picsum.photos/200/200?random=25', name: '智能手机', price: '800' }
        ];
      }
    },
    // 获取商品图片
    getGoodsImage(item) {
      let imageUrl = '';
      
      // 支持多种字段名：imageUrls, mainImageUrl, image, images
      if (item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
        imageUrl = item.imageUrls[0];
      } else if (item.mainImageUrl) {
        imageUrl = item.mainImageUrl;
      } else if (item.image) {
        imageUrl = item.image;
      } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        imageUrl = item.images[0];
      } else {
        // 默认占位图
        return 'https://picsum.photos/200/200';
      }
      
      // 处理图片URL前面可能存在的 @ 符号
      if (imageUrl && imageUrl.startsWith('@')) {
        imageUrl = imageUrl.substring(1);
      }
      
      return imageUrl;
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #F5F5F5;
}

/* 导航栏 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #89CFF0 0%, #5DCDFF 100%);
  z-index: 999;
}

.nav-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.location {
  display: flex;
  align-items: center;
}

.location-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.location-text {
  font-size: 28rpx;
  color: #FFFFFF;
}

/* 内容区域 */
.content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 轮播图 */
.banner-section {
  margin: 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.banner-swiper {
  height: 400rpx;
}

.banner-image {
  width: 100%;
  height: 100%;
}

/* 功能按钮 */
.function-section {
  display: flex;
  justify-content: space-around;
  background-color: #FFFFFF;
  margin: 30rpx;
  padding: 40rpx 0;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.function-icon-box {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #E3F4FF 0%, #D0EFFF 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.function-icon {
  font-size: 56rpx;
}

.function-text {
  font-size: 26rpx;
  color: #666666;
}

/* 今日课程 */
.course-section {
  background-color: #FFFFFF;
  margin: 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.section-more {
  font-size: 26rpx;
  color: #5DCDFF;
}

.course-list {
  display: flex;
  flex-direction: column;
}

.course-item {
  display: flex;
  padding: 30rpx 0;
  border-bottom: 1px solid #F0F0F0;
}

.course-item:last-child {
  border-bottom: none;
}

.course-time {
  font-size: 32rpx;
  font-weight: bold;
  color: #5DCDFF;
  width: 120rpx;
  flex-shrink: 0;
}

.course-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.course-name {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.course-location {
  font-size: 26rpx;
  color: #999999;
}

.empty-course {
  text-align: center;
  padding: 60rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #CCCCCC;
}

/* 推荐外卖 */
.recommend-section {
  background-color: #FFFFFF;
  margin: 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.recommend-section:last-child {
  margin-bottom: 30rpx;
  padding-bottom: 140rpx;
}

.recommend-scroll {
  white-space: nowrap;
  width: 100%;
}

.recommend-list {
  display: inline-flex;
  padding: 20rpx 0;
  width: auto;
  min-width: 100%;
}

.recommend-item {
  display: inline-block;
  width: 200rpx;
  margin-right: 20rpx;
}

.recommend-item:last-child {
  margin-right: 0;
}

.recommend-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.recommend-name {
  display: block;
  font-size: 26rpx;
  color: #333333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-price {
  display: block;
  font-size: 28rpx;
  color: #FF6B6B;
  font-weight: bold;
}
</style>

