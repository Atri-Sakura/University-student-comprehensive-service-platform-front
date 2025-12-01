<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-back" @click="navBack">&lt;</text>
        <text class="nav-title">{{ goods.name }}</text>
        <view class="nav-right">
          <text class="nav-icon" @click="callRestaurant">📞</text>
        </view>
      </view>
    </view>

    <!-- 商品图片 -->
    <view class="goods-image-section">
      <image class="goods-image" :src="goods.image" mode="aspectFill"></image>
    </view>

    <!-- 商品基本信息 -->
    <view class="goods-info-section">
      <text class="goods-name">{{ goods.name }}</text>
      <text class="goods-price">¥{{ goods.price }}</text>
      
      <!-- 商品描述 -->
      <view class="goods-desc-section">
        <text class="section-title">商品描述</text>
        <text class="goods-desc">{{ goods.description || '暂无描述' }}</text>
      </view>

      <!-- 商品属性 -->
      <view class="goods-attributes-section">
        <text class="section-title">商品属性</text>
        <view class="attribute-item">
          <text class="attribute-label">库存：</text>
          <text class="attribute-value">{{ goods.stock || 0 }}份</text>
        </view>
        <view class="attribute-item">
          <text class="attribute-label">销量：</text>
          <text class="attribute-value">{{ goods.sales || 0 }}份</text>
        </view>
        <view class="attribute-item">
          <text class="attribute-label">分类：</text>
          <text class="attribute-value">{{ goods.categoryName || '未分类' }}</text>
        </view>
      </view>

      <!-- 商品规格 -->
      <view class="goods-specs-section" v-if="goods.specifications && goods.specifications.length > 0">
        <text class="section-title">商品规格</text>
        <view class="spec-item" v-for="spec in goods.specifications" :key="spec.id">
          <text class="spec-name">{{ spec.name }}：</text>
          <text class="spec-value">{{ spec.value }}</text>
        </view>
      </view>
    </view>

    <!-- 返回按钮 -->
    <view class="bottom-btn-section">
      <button class="back-btn" @click="navBack">返回</button>
      <button class="add-to-cart-btn" @click="addToCart">加入购物车</button>
    </view>
  </view>
</template>

<script>
import foodApi from '@/api/food.js';

export default {
  data() {
    return {
      statusBarHeight: 0,
      goods: {},
      goodsId: '',
      restaurantId: '',
      restaurant: {}
    };
  },
  onLoad(options) {
    // 获取状态栏高度
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
    
    // 获取商品ID和商家ID
    this.goodsId = options.goodsId || '';
    this.restaurantId = options.restaurantId || '';
    
    // 加载商品详情和商家信息
    this.loadGoodsDetail();
    this.loadRestaurantInfo();
  },
  methods: {
    // 加载商品详情
    async loadGoodsDetail() {
      try {
        const result = await foodApi.getGoodsDetail(this.goodsId);
        if (result && result.code === 200) {
          this.goods = result.data;
        }
      } catch (error) {
        console.error('加载商品详情失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    },
    
    // 加载商家信息
    async loadRestaurantInfo() {
      try {
        const result = await foodApi.getMerchantDetail(this.restaurantId);
        if (result && result.code === 200) {
          this.restaurant = result.data;
        }
      } catch (error) {
        console.error('加载商家信息失败:', error);
      }
    },
    
    // 返回上一页
    navBack() {
      uni.navigateBack();
    },
    
    // 联系商家
    callRestaurant() {
      if (this.restaurant.phone) {
        uni.makePhoneCall({
          phoneNumber: this.restaurant.phone
        });
      } else {
        uni.showToast({
          title: '餐厅暂未提供电话',
          icon: 'none'
        });
      }
    },
    
    // 加入购物车
    addToCart() {
      // 这里可以添加加入购物车的逻辑
      uni.showToast({
        title: '已加入购物车',
        icon: 'success'
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
}

/* 导航栏 */
.nav-bar {
  background-color: #5DCDFF;
  color: white;
  height: 44px;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  height: 100%;
}

.nav-back {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.nav-right {
  display: flex;
  align-items: center;
}

.nav-icon {
  font-size: 32rpx;
  margin-left: 30rpx;
  color: white;
}

/* 商品图片 */
.goods-image-section {
  width: 100%;
  height: 400rpx;
  background-color: #FFFFFF;
  overflow: hidden;
}

.goods-image {
  width: 100%;
  height: 100%;
}

/* 商品基本信息 */
.goods-info-section {
  background-color: #FFFFFF;
  padding: 30rpx;
  margin-top: 20rpx;
}

.goods-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.goods-price {
  font-size: 32rpx;
  color: #FF5722;
  font-weight: bold;
  margin-bottom: 30rpx;
  display: block;
}

/* 通用区块样式 */
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

/* 商品描述 */
.goods-desc-section {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1px solid #EEEEEE;
}

.goods-desc {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
}

/* 商品属性 */
.goods-attributes-section {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1px solid #EEEEEE;
}

.attribute-item {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
}

.attribute-label {
  color: #999999;
  margin-right: 20rpx;
}

.attribute-value {
  color: #333333;
}

/* 商品规格 */
.goods-specs-section {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1px solid #EEEEEE;
}

.spec-item {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
}

.spec-name {
  color: #999999;
  margin-right: 20rpx;
}

.spec-value {
  color: #333333;
}

/* 底部按钮区域 */
.bottom-btn-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  flex: 1;
  background-color: #F5F5F5;
  color: #333333;
  border: none;
  border-radius: 40rpx;
  height: 80rpx;
  font-size: 30rpx;
  margin-right: 20rpx;
}

.add-to-cart-btn {
  flex: 2;
  background-color: #FF5722;
  color: white;
  border: none;
  border-radius: 40rpx;
  height: 80rpx;
  font-size: 30rpx;
}
</style>
