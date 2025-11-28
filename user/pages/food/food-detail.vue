<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-back" @click="navBack">&lt;</text>
        <text class="nav-title">{{ restaurant.name }}</text>
        <view class="nav-right">
          <text class="nav-icon" @click="callRestaurant">📞</text>
        </view>
      </view>
    </view>

    <!-- 餐厅信息 -->
    <view class="restaurant-header">
      <image class="restaurant-banner" :src="restaurant.image" mode="aspectFill"></image>
      <view class="restaurant-info">
        <text class="restaurant-name">{{ restaurant.name }}</text>
        <text class="restaurant-rating">⭐ {{ restaurant.rating }}</text>
        <text class="restaurant-sales">月售{{ restaurant.sales }}单</text>
        <text class="restaurant-distance">{{ restaurant.distance }}km</text>
        <text class="restaurant-delivery">起送价¥{{ restaurant.minOrder }} | 配送费¥{{ restaurant.deliveryFee }}</text>
      </view>
      <view class="restaurant-tags">
        <view class="tag" v-for="tag in restaurant.tags" :key="tag">{{ tag }}</view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content">
      <!-- 左侧分类 -->
      <scroll-view scroll-y class="food-category-list">
        <view class="category-item" 
              v-for="category in foodCategories" 
              :key="category.id"
              @click="selectFoodCategory(category)"
              :class="{ active: selectedFoodCategory === category.id }">
          <text class="category-name">{{ category.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧菜品列表 -->
      <scroll-view scroll-y class="food-list">
        <view v-for="category in foodCategories" :key="category.id" v-show="selectedFoodCategory === category.id || showAllFoods">
          <view class="category-title">{{ category.name }}</view>
          <view class="food-item" v-for="food in getFoodsByCategory(category.id)" :key="food.id">
            <image class="food-image" :src="food.image" mode="aspectFill"></image>
            <view class="food-info">
              <text class="food-name">{{ food.name }}</text>
              <text class="food-desc">{{ food.description || '' }}</text>
              <text class="food-price">¥{{ food.price }}</text>
            </view>
            <!-- 将增减按钮和数量显示整合在一起 -->
            <view class="food-action" v-if="getCartItemCount(food.id) > 0">
              <text class="count-btn" @click.stop="decreaseCount(food)">-</text>
              <text class="count-text">{{ getCartItemCount(food.id) }}</text>
              <text class="count-btn" @click.stop="increaseCount(food)">+</text>
            </view>
            <view class="food-action" v-else @click="increaseCount(food)">
              <text class="add-btn">+</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 购物车底部栏 -->
    <view class="cart-bottom" v-if="totalCount > 0">
      <view class="cart-info">
        <text class="cart-total">合计：¥{{ totalAmount }}</text>
        <text class="cart-extra" v-if="restaurant.minOrder > totalAmount">
          还差¥{{ restaurant.minOrder - totalAmount }}起送
        </text>
      </view>
      <view class="checkout-btn" :class="{ disabled: restaurant.minOrder > totalAmount }" @click="checkout">
        <text>去结算({{ totalCount }})</text>
      </view>
    </view>

    <!-- 购物车悬浮窗 -->
    <view class="cart-float" :class="{ active: totalCount > 0 }" @click="toggleCart">
      <text class="cart-icon">🛒</text>
      <text class="cart-count" v-if="totalCount > 0">{{ totalCount }}</text>
    </view>

    <!-- 购物车弹窗 -->
    <view class="cart-modal" v-if="showCart">
      <view class="cart-modal-content">
        <view class="cart-modal-header">
          <text class="cart-modal-title">购物车</text>
          <text class="cart-modal-close" @click="toggleCart">✕</text>
        </view>
        <scroll-view scroll-y class="cart-items">
          <view class="cart-item" v-for="item in cartItems" :key="item.id">
            <view class="cart-item-info">
              <text class="cart-item-name">{{ item.name }}</text>
              <text class="cart-item-price">¥{{ item.price }}</text>
            </view>
            <view class="cart-item-count">
              <text class="count-btn" @click="decreaseCount(item)">-</text>
              <text class="count-text">{{ item.count }}</text>
              <text class="count-btn" @click="increaseCount(item)">+</text>
            </view>
          </view>
        </scroll-view>
        <view class="cart-modal-footer">
          <view class="cart-total">合计：¥{{ totalAmount }}</view>
          <view class="checkout-btn" :class="{ disabled: restaurant.minOrder > totalAmount }" @click="checkout">
            <text>去结算</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      restaurant: {},
      foodCategories: [],
      selectedFoodCategory: 1,
      showAllFoods: false,
      cartItems: [],
      showCart: false,
      // 模拟菜单数据
      allFoods: []
    };
  },
  computed: {
    totalCount() {
      return this.cartItems.reduce((sum, item) => sum + item.count, 0);
    },
    totalAmount() {
      // 计算商品总价
      const itemsTotal = this.cartItems.reduce((sum, item) => sum + item.price * item.count, 0);
      // 如果有商品，加上配送费
      const totalWithDelivery = this.cartItems.length > 0 ? itemsTotal + this.restaurant.deliveryFee : itemsTotal;
      return totalWithDelivery.toFixed(2);
    }
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
    
    // 模拟获取餐厅数据，同时传递selectedFoodId
    this.loadRestaurantData(options.restaurantId, options.selectedFoodId);
  },
  methods: {
    // 返回上一页
    navBack() {
      uni.navigateBack();
    },
    
    // 联系餐厅
    callRestaurant() {
      uni.makePhoneCall({
        phoneNumber: '400-123-4567',
        success: () => console.log('拨打电话成功'),
        fail: () => console.log('拨打电话失败')
      });
    },
    
    // 加载餐厅数据
    loadRestaurantData(id, selectedFoodId) {
      // 模拟数据，实际应从API获取
      const restaurantMap = {
        '1': {
          id: 1,
          name: '校园餐厅',
          image: 'https://picsum.photos/600/300?random=1',
          rating: 4.8,
          sales: 356,
          distance: 0.5,
          minOrder: 20,
          deliveryFee: 5,
          tags: ['满20减5', '校园', '健康'],
          categories: [
            { id: 1, name: '热门推荐' },
            { id: 2, name: '主食套餐' },
            { id: 3, name: '小吃' },
            { id: 4, name: '饮品' }
          ],
          foods: [
            { id: 101, categoryId: 1, name: '营养套餐', price: 15, image: 'https://picsum.photos/200/200?random=11', description: '包含米饭、炒菜、汤品' },
            { id: 102, categoryId: 1, name: '香辣鸡腿饭', price: 18, image: 'https://picsum.photos/200/200?random=12', description: '大鸡腿配香辣酱' },
            { id: 103, categoryId: 2, name: '宫保鸡丁饭', price: 16, image: 'https://picsum.photos/200/200?random=13', description: '经典川菜' },
            { id: 104, categoryId: 2, name: '红烧肉饭', price: 20, image: 'https://picsum.photos/200/200?random=14', description: '肥而不腻' },
            { id: 105, categoryId: 3, name: '炸鸡翅', price: 12, image: 'https://picsum.photos/200/200?random=15', description: '外酥里嫩' },
            { id: 106, categoryId: 3, name: '薯条', price: 8, image: 'https://picsum.photos/200/200?random=16', description: '配番茄酱' },
            { id: 107, categoryId: 4, name: '可乐', price: 5, image: 'https://picsum.photos/200/200?random=17', description: '冰镇可乐' },
            { id: 108, categoryId: 4, name: '矿泉水', price: 2, image: 'https://picsum.photos/200/200?random=18', description: '500ml' }
          ]
        },
        '2': {
          id: 2,
          name: '快乐奶茶',
          image: 'https://picsum.photos/600/300?random=2',
          rating: 4.6,
          sales: 289,
          distance: 0.8,
          minOrder: 30,
          deliveryFee: 6,
          tags: ['满30减10', '新店', '奶茶'],
          categories: [
            { id: 1, name: '招牌奶茶' },
            { id: 2, name: '水果茶' },
            { id: 3, name: '冰淇淋' },
            { id: 4, name: '甜点' }
          ],
          foods: [
            { id: 201, categoryId: 1, name: '珍珠奶茶', price: 12, image: 'https://picsum.photos/200/200?random=21', description: '经典口味' },
            { id: 202, categoryId: 1, name: '奶茶三兄弟', price: 15, image: 'https://picsum.photos/200/200?random=22', description: '珍珠、椰果、仙草' },
            { id: 203, categoryId: 2, name: '杨枝甘露', price: 18, image: 'https://picsum.photos/200/200?random=23', description: '芒果、西柚、西米' },
            { id: 204, categoryId: 2, name: '草莓奶昔', price: 16, image: 'https://picsum.photos/200/200?random=24', description: '新鲜草莓' },
            { id: 205, categoryId: 3, name: '香草冰淇淋', price: 8, image: 'https://picsum.photos/200/200?random=25', description: '浓郁香草味' },
            { id: 206, categoryId: 4, name: '抹茶蛋糕', price: 15, image: 'https://picsum.photos/200/200?random=26', description: '日式抹茶' }
          ]
        },
        '3': {
          id: 3,
          name: '川味小厨',
          image: 'https://picsum.photos/600/300?random=3',
          rating: 4.9,
          sales: 456,
          distance: 1.2,
          minOrder: 40,
          deliveryFee: 8,
          tags: ['满40减15', '川菜', '辣味'],
          categories: [
            { id: 1, name: '招牌川菜' },
            { id: 2, name: '盖浇饭' },
            { id: 3, name: '川菜小吃' },
            { id: 4, name: '解辣饮品' }
          ],
          foods: [
            { id: 301, categoryId: 1, name: '麻婆豆腐', price: 20, image: 'https://picsum.photos/200/200?random=31', description: '麻辣鲜香' },
            { id: 302, categoryId: 1, name: '水煮肉片', price: 28, image: 'https://picsum.photos/200/200?random=32', description: '鲜嫩多汁' },
            { id: 303, categoryId: 2, name: '麻婆豆腐饭', price: 25, image: 'https://picsum.photos/200/200?random=33', description: '配米饭' },
            { id: 304, categoryId: 2, name: '鱼香肉丝饭', price: 22, image: 'https://picsum.photos/200/200?random=34', description: '酸甜可口' },
            { id: 305, categoryId: 3, name: '辣子鸡', price: 32, image: 'https://picsum.photos/200/200?random=35', description: '外酥里嫩' },
            { id: 306, categoryId: 4, name: '酸梅汤', price: 6, image: 'https://picsum.photos/200/200?random=36', description: '解辣神器' }
          ]
        },
        '4': {
          id: 4,
          name: '健康沙拉',
          image: 'https://picsum.photos/600/300?random=4',
          rating: 4.7,
          sales: 189,
          distance: 0.6,
          minOrder: 35,
          deliveryFee: 5,
          tags: ['满35减8', '轻食', '减肥'],
          categories: [
            { id: 1, name: '经典沙拉' },
            { id: 2, name: '能量碗' },
            { id: 3, name: '饮品' },
            { id: 4, name: '加料区' }
          ],
          foods: [
            { id: 401, categoryId: 1, name: '蔬菜沙拉', price: 18, image: 'https://picsum.photos/200/200?random=41', description: '多种新鲜蔬菜' },
            { id: 402, categoryId: 1, name: '鸡胸肉沙拉', price: 25, image: 'https://picsum.photos/200/200?random=42', description: '高蛋白低脂肪' },
            { id: 403, categoryId: 2, name: '三文鱼能量碗', price: 38, image: 'https://picsum.photos/200/200?random=43', description: '营养均衡' },
            { id: 404, categoryId: 3, name: '鲜榨果汁', price: 15, image: 'https://picsum.photos/200/200?random=44', description: '多种水果可选' },
            { id: 405, categoryId: 4, name: '牛油果', price: 12, image: 'https://picsum.photos/200/200?random=45', description: '增加营养' },
            { id: 406, categoryId: 4, name: '坚果碎', price: 8, image: 'https://picsum.photos/200/200?random=46', description: '增加口感' }
          ]
        }
      };
      
      const data = restaurantMap[id] || restaurantMap['1'];
      this.restaurant = data;
      this.foodCategories = data.categories;
      this.allFoods = data.foods;
      this.selectedFoodCategory = data.categories[0].id;
      
      // 如果有selectedFoodId参数，则自动选择并添加该商品到购物车
      if (selectedFoodId) {
        const selectedFood = this.allFoods.find(food => food.id.toString() === selectedFoodId);
        if (selectedFood) {
          // 选择对应分类
          this.selectedFoodCategory = selectedFood.categoryId;
          // 自动添加到购物车
          this.increaseCount(selectedFood);
          // 显示购物车
          this.showCart = true;
        }
      }
    },
    
    // 选择菜品分类
    selectFoodCategory(category) {
      this.selectedFoodCategory = category.id;
      this.showAllFoods = false;
    },
    
    // 根据分类获取菜品
    getFoodsByCategory(categoryId) {
      return this.allFoods.filter(food => food.categoryId === categoryId);
    },
    
    // 获取购物车中商品数量
    getCartItemCount(foodId) {
      const item = this.cartItems.find(item => item.id === foodId);
      return item ? item.count : 0;
    },
    
    // 增加商品数量
    increaseCount(food) {
      const existingItem = this.cartItems.find(item => item.id === food.id);
      if (existingItem) {
        existingItem.count++;
      } else {
        this.cartItems.push({
          ...food,
          count: 1
        });
      }
    },
    
    // 减少商品数量
    decreaseCount(food) {
      const index = this.cartItems.findIndex(item => item.id === food.id);
      if (index !== -1) {
        if (this.cartItems[index].count > 1) {
          this.cartItems[index].count--;
        } else {
          this.cartItems.splice(index, 1);
        }
      }
    },
    
    // 切换购物车显示
    toggleCart() {
      this.showCart = !this.showCart;
    },
    
    // 结算
    checkout() {
      if (this.totalAmount < this.restaurant.minOrder) {
        uni.showToast({
          title: `还差¥${this.restaurant.minOrder - this.totalAmount}起送`,
          icon: 'none'
        });
        return;
      }
      
      // 保存购物车数据到本地存储
      uni.setStorageSync('foodCart', {
        restaurant: this.restaurant,
        items: this.cartItems,
        totalAmount: this.totalAmount,
        totalCount: this.totalCount
      });
      
      // 跳转到支付页面
      uni.navigateTo({
        url: '/pages/payment/payment?type=food'
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
  background: linear-gradient(135deg, #FF8A65 0%, #FF6B47 100%);
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
  flex: 1;
  text-align: center;
  margin: 0 40rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-icon {
  font-size: 36rpx;
  color: #FFFFFF;
  width: 40rpx;
  text-align: right;
}

/* 餐厅信息 */
.restaurant-header {
  padding-top: calc(var(--status-bar-height, 0px) + 44px);
  background-color: #FFFFFF;
  margin-bottom: 10rpx;
}

.restaurant-banner {
  width: 100%;
  height: 300rpx;
}

.restaurant-info {
  padding: 20rpx;
  border-bottom: 10rpx solid #F5F5F5;
}

.restaurant-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.restaurant-rating {
  font-size: 28rpx;
  color: #FFB800;
  margin-bottom: 5rpx;
}

.restaurant-sales,
.restaurant-distance,
.restaurant-delivery {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 5rpx;
}

.restaurant-tags {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;
}

.tag {
  font-size: 22rpx;
  color: #FF6B6B;
  background-color: #FFF5F5;
  padding: 2rpx 15rpx;
  border-radius: 15rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
}

/* 内容区域 */
.content {
  display: flex;
  height: calc(100vh - var(--status-bar-height, 0px) - 44px - 300rpx - 300rpx);
  overflow: hidden;
}

/* 菜品分类列表 */
.food-category-list {
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
  color: #FF6B6B;
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
  background-color: #FF6B6B;
  border-radius: 0 4rpx 4rpx 0;
}

.category-name {
  font-size: 28rpx;
  color: #666666;
}

.category-item.active .category-name {
  color: #FF6B6B;
  font-weight: 500;
}

/* 菜品列表 */
.food-list {
  flex: 1;
  background-color: #FFFFFF;
  padding: 20rpx;
}

.category-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
  padding-left: 20rpx;
  border-left: 4rpx solid #FF6B6B;
}

.food-item {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1px solid #F0F0F0;
}

.food-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
  background-color: #F5F5F5;
}

.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  min-height: 120rpx;
}

.food-name {
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.food-desc {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.food-price {
  font-size: 32rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.food-action {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #DDDDDD;
  border-radius: 30rpx;
  margin-left: 20rpx;
  align-self: center;
  background-color: #FFFFFF;
}

.food-action:has(.add-btn) {
  width: 60rpx;
  height: 60rpx;
}

.food-action:has(.count-btn) {
  width: auto;
  background-color: #F5F5F5;
  overflow: hidden;
}

.add-btn {
  font-size: 36rpx;
  color: #666666;
}

.count-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #666666;
}

.count-btn:active {
  background-color: #E0E0E0;
}

.count-text {
  min-width: 60rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333333;
  text-align: center;
  background-color: #FFFFFF;
  height: 60rpx;
  line-height: 60rpx;
}

/* 购物车悬浮窗 */
.cart-float {
  position: fixed;
  bottom: 80rpx;
  right: 40rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #FFFFFF;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 998;
  border: 2rpx solid #DDDDDD;
}

.cart-float.active {
  background-color: #FF6B6B;
  border-color: #FF6B6B;
}

.cart-icon {
  font-size: 44rpx;
  color: #666666;
}

.cart-float.active .cart-icon {
  color: #FFFFFF;
}

.cart-count {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background-color: #FF6B6B;
  color: #FFFFFF;
  font-size: 24rpx;
  padding: 2rpx 15rpx;
  border-radius: 20rpx;
  min-width: 40rpx;
  text-align: center;
}

.cart-float.active .cart-count {
  background-color: #FFFFFF;
  color: #FF6B6B;
}

/* 购物车底部栏 */
.cart-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 998;
}

.cart-info {
  flex: 1;
}

.cart-total {
  font-size: 32rpx;
  font-weight: bold;
  color: #FF6B6B;
}

.cart-extra {
  font-size: 24rpx;
  color: #FF9500;
}

.checkout-btn {
  width: 240rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #FF8A65 0%, #FF6B6B 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 75, 0.3);
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: bold;
}

.checkout-btn.disabled {
  background: #CCCCCC;
  box-shadow: none;
}

/* 购物车弹窗 */
.cart-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

.cart-modal-content {
  background-color: #FFFFFF;
  width: 100%;
  border-radius: 30rpx 30rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.cart-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #F0F0F0;
}

.cart-modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.cart-modal-close {
  font-size: 36rpx;
  color: #999999;
}

.cart-items {
  flex: 1;
  padding: 20rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid #F0F0F0;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.cart-item-price {
  font-size: 28rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.cart-item-count {
  display: flex;
  align-items: center;
}

.cart-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-top: 1px solid #F0F0F0;
}
</style>
