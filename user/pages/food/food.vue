<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-back" @click="navBack">&lt;</text>
        <text class="nav-title">外卖点餐</text>
        <view class="nav-right">
          <text class="nav-icon" @click="viewCart">🛒</text>
        </view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar" :style="{ top: navHeight + 'px' }">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input type="text" v-model="searchKeyword" placeholder="搜索美食商家" />
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content" :style="{ top: navHeight + 80 + 'px' }">
      <!-- 分类导航 -->
      <view class="category-nav">
        <scroll-view scroll-y class="category-list">
          <view class="category-item" 
                v-for="category in categories" 
                :key="category.id"
                @click="selectCategory(category)"
                :class="{ active: selectedCategory === category.id }">
            <text class="category-name">{{ category.name }}</text>
          </view>
        </scroll-view>

        <!-- 商家列表 -->
        <scroll-view scroll-y class="restaurant-list">
          <!-- 筛选栏 -->
          <view class="filter-bar">
            <view class="filter-item" @click="toggleFilter('rating')">
              <text :class="{ active: filter.rating }">评分最高</text>
              <text class="filter-arrow" :class="{ active: filter.rating }">↓</text>
            </view>
            <view class="filter-item" @click="toggleFilter('distance')">
              <text :class="{ active: filter.distance }">距离最近</text>
              <text class="filter-arrow" :class="{ active: filter.distance }">↓</text>
            </view>
            <view class="filter-item" @click="toggleFilter('sales')">
              <text :class="{ active: filter.sales }">销量最高</text>
              <text class="filter-arrow" :class="{ active: filter.sales }">↓</text>
            </view>
          </view>

          <!-- 商家项 -->
          <view v-if="filteredRestaurants.length > 0">
            <view class="restaurant-item" v-for="restaurant in filteredRestaurants" :key="restaurant.id" @click="viewRestaurant(restaurant)">
              <view class="restaurant-header">
                <image class="restaurant-image" :src="restaurant.image" mode="aspectFill"></image>
                <view class="restaurant-info">
                  <text class="restaurant-name">{{ restaurant.name }}</text>
                  <text class="restaurant-rating">⭐ {{ restaurant.rating }}</text>
                  <text class="restaurant-sales">月售{{ restaurant.sales }}单</text>
                  <text class="restaurant-distance">{{ restaurant.distance }}km</text>
                </view>
              </view>
              <view class="restaurant-tags">
                <view class="tag" v-for="tag in restaurant.tags" :key="tag">{{ tag }}</view>
              </view>
              <view class="restaurant-foods">
                <view class="food-item" v-for="(food, index) in restaurant.foods.slice(0, 2)" :key="food.id">
                  <image class="food-image" :src="food.image" mode="aspectFill"></image>
                  <view class="food-info">
                    <text class="food-name">{{ food.name }}</text>
                    <text class="food-price">¥{{ food.price }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <!-- 空状态提示 -->
          <view v-else class="empty-state">
            <text class="empty-icon">🍽️</text>
            <text class="empty-text">暂无符合条件的商家</text>
            <text class="empty-hint">请尝试其他分类或搜索关键词</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 购物车悬浮窗 -->
    <view class="cart-float" v-if="cartCount > 0" @click="viewCart">
      <text class="cart-icon">🛒</text>
      <text class="cart-count">{{ cartCount }}</text>
      <text class="cart-text">去结算</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      searchKeyword: '',
      selectedCategory: 1,
      filter: {
        rating: false,
        distance: false,
        sales: false
      },
      categories: [
        { id: 1, name: '全部' },
        { id: 2, name: '快餐便当' },
        { id: 3, name: '饮品甜点' },
        { id: 4, name: '特色小吃' },
        { id: 5, name: '水果生鲜' },
        { id: 6, name: '西餐披萨' },
        { id: 7, name: '面食' },
        { id: 8, name: '日料韩料' }
      ],
      restaurants: [
        {
          id: 1,
          name: '校园餐厅',
          image: 'https://picsum.photos/300/200?random=1',
          rating: 4.8,
          sales: 356,
          distance: 0.5,
          tags: ['满20减5', '校园', '健康'],
          foods: [
            { id: 101, name: '营养套餐', price: 15, image: 'https://picsum.photos/200/200?random=11' },
            { id: 102, name: '香辣鸡腿饭', price: 18, image: 'https://picsum.photos/200/200?random=12' }
          ]
        },
        {
          id: 2,
          name: '快乐奶茶',
          image: 'https://picsum.photos/300/200?random=2',
          rating: 4.6,
          sales: 289,
          distance: 0.8,
          tags: ['满30减10', '新店', '奶茶'],
          foods: [
            { id: 201, name: '珍珠奶茶', price: 12, image: 'https://picsum.photos/200/200?random=21' },
            { id: 202, name: '水果茶', price: 15, image: 'https://picsum.photos/200/200?random=22' }
          ]
        },
        {
          id: 3,
          name: '川味小厨',
          image: 'https://picsum.photos/300/200?random=3',
          rating: 4.9,
          sales: 456,
          distance: 1.2,
          tags: ['满40减15', '川菜', '辣味'],
          foods: [
            { id: 301, name: '麻婆豆腐饭', price: 20, image: 'https://picsum.photos/200/200?random=31' },
            { id: 302, name: '水煮肉片饭', price: 25, image: 'https://picsum.photos/200/200?random=32' }
          ]
        },
        {
          id: 4,
          name: '健康沙拉',
          image: 'https://picsum.photos/300/200?random=4',
          rating: 4.7,
          sales: 189,
          distance: 0.6,
          tags: ['满35减8', '轻食', '减肥'],
          foods: [
            { id: 401, name: '蔬菜沙拉', price: 18, image: 'https://picsum.photos/200/200?random=41' },
            { id: 402, name: '鸡胸肉沙拉', price: 22, image: 'https://picsum.photos/200/200?random=42' }
          ]
        }
      ],
      cartCount: 0
    };
  },
  computed: {
    filteredRestaurants() {
      let result = [...this.restaurants];
      
      // 搜索筛选
      if (this.searchKeyword) {
        result = result.filter(restaurant => 
          restaurant.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        );
      }
      
      // 分类筛选
      if (this.selectedCategory !== 1) {
        // 根据分类ID筛选商家
        // 为简化演示，我们假设商家的tags中包含分类名称
        const categoryName = this.categories.find(c => c.id === this.selectedCategory)?.name || '';
        if (categoryName) {
          // 将分类名称映射到相应的关键词进行筛选
          const categoryKeywords = {
            '快餐便当': ['套餐', '便当', '饭'],
            '饮品甜点': ['奶茶', '茶', '甜点'],
            '特色小吃': ['小吃'],
            '水果生鲜': ['水果', '沙拉'],
            '西餐披萨': ['西餐', '披萨'],
            '面食': ['面', '粉'],
            '日料韩料': ['日料', '韩料']
          };
          
          const keywords = categoryKeywords[categoryName] || [categoryName];
          result = result.filter(restaurant => {
            // 检查商家名称或标签是否包含相关关键词
            const nameLower = restaurant.name.toLowerCase();
            const hasMatchingKeyword = keywords.some(keyword => 
              nameLower.includes(keyword) || 
              restaurant.tags.some(tag => tag.includes(keyword))
            );
            return hasMatchingKeyword;
          });
        }
      }
      
      // 排序
      if (this.filter.rating) {
        result.sort((a, b) => b.rating - a.rating);
      } else if (this.filter.distance) {
        result.sort((a, b) => a.distance - b.distance);
      } else if (this.filter.sales) {
        result.sort((a, b) => b.sales - a.sales);
      }
      
      return result;
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
  },
  methods: {
    // 返回上一页
    navBack() {
      uni.navigateBack();
    },
    // 选择分类
    selectCategory(category) {
      this.selectedCategory = category.id;
    },
    // 切换筛选
    toggleFilter(type) {
      Object.keys(this.filter).forEach(key => {
        this.filter[key] = false;
      });
      this.filter[type] = !this.filter[type];
    },
    // 查看餐厅
    viewRestaurant(restaurant) {
      // 确保传递字符串类型的id以匹配food-detail中的数据结构
      const restaurantId = String(restaurant.id);
      uni.navigateTo({
        url: `/pages/food/food-detail?restaurantId=${restaurantId}`
      });
    },
    // 查看购物车
    viewCart() {
      uni.showToast({
        title: '查看购物车',
        icon: 'none'
      });
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

.nav-back {
  font-size: 36rpx;
  color: #FFFFFF;
  width: 40rpx;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.nav-icon {
  font-size: 36rpx;
  color: #FFFFFF;
  width: 40rpx;
  text-align: right;
}

/* 搜索栏 */
.search-bar {
  position: fixed;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  padding: 20rpx;
  z-index: 998;
}

.search-input {
  display: flex;
  align-items: center;
  background-color: #F5F5F5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  height: 60rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #999999;
  margin-right: 20rpx;
}

.search-input input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

/* 内容区域 */
.content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

/* 分类导航 */
.category-nav {
  display: flex;
  height: 100%;
}

/* 分类列表 */
.category-list {
  width: 200rpx;
  background-color: #F5F5F5;
  flex-shrink: 0;
}

.category-item {
  padding: 30rpx 20rpx;
  text-align: center;
  border-bottom: 1px solid #E0E0E0;
}

.category-item.active {
  background-color: #FFFFFF;
  color: #5DCDFF;
  position: relative;
}

.category-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 8rpx;
  height: 30rpx;
  background-color: #5DCDFF;
  border-radius: 0 4rpx 4rpx 0;
}

.category-name {
  font-size: 28rpx;
  color: #666666;
}

.category-item.active .category-name {
  color: #5DCDFF;
  font-weight: 500;
}

/* 商家列表 */
.restaurant-list {
  flex: 1;
  background-color: #F5F5F5;
  padding: 20rpx;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  border-bottom: 1px solid #F0F0F0;
  padding: 20rpx 0;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.filter-item text.active {
  color: #5DCDFF;
}

.filter-arrow {
  margin-left: 5rpx;
  font-size: 20rpx;
  color: #999999;
}

.filter-arrow.active {
  color: #5DCDFF;
}

/* 商家项 */
.restaurant-item {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.restaurant-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.restaurant-header {
  display: flex;
  margin-bottom: 15rpx;
}

.restaurant-image {
  width: 200rpx;
  height: 150rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.restaurant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.restaurant-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.restaurant-rating {
  font-size: 28rpx;
  color: #FFB800;
}

.restaurant-sales,
.restaurant-distance {
  font-size: 24rpx;
  color: #999999;
}

/* 商家标签 */
.restaurant-tags {
  display: flex;
  margin-bottom: 15rpx;
}

.tag {
  font-size: 22rpx;
  color: #FF6B6B;
  background-color: #FFF5F5;
  padding: 2rpx 15rpx;
  border-radius: 15rpx;
  margin-right: 10rpx;
}

/* 商家食品 */
.restaurant-foods {
  display: flex;
}

.food-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 20rpx;
}

.food-item:last-child {
  margin-right: 0;
}

.food-image {
  width: 100%;
  height: 120rpx;
  border-radius: 8rpx;
  margin-bottom: 10rpx;
}

.food-name {
  font-size: 26rpx;
  color: #333333;
  margin-bottom: 5rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.food-price {
  font-size: 28rpx;
  color: #FF6B6B;
  font-weight: bold;
}

/* 空状态提示 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666666;
  margin-bottom: 15rpx;
}

.empty-hint {
  font-size: 28rpx;
  color: #999999;
}

/* 购物车悬浮窗 */
.cart-float {
  position: fixed;
  bottom: 120rpx;
  right: 40rpx;
  background-color: #5DCDFF;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  padding: 20rpx 40rpx;
  border-radius: 50rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.cart-icon {
  font-size: 36rpx;
  margin-right: 10rpx;
}

.cart-count {
  background-color: #FF6B6B;
  color: #FFFFFF;
  font-size: 24rpx;
  padding: 2rpx 15rpx;
  border-radius: 20rpx;
  margin-right: 15rpx;
}

.cart-text {
  font-size: 28rpx;
  font-weight: 500;
}
</style>
