<template>
  <view class="container">
    <!-- 顶部店铺信息 -->
    <view class="shop-header">
      <view class="shop-icon">🏪</view>
      <view class="shop-info">
        <view class="shop-name">美味餐厅</view>
        <view class="shop-status">营业中 · 08:00-22:00</view>
      </view>
    </view>
    
    <!-- 商品管理标题 -->
    <view class="page-title">
      <text class="title-text">商品管理</text>
    </view>
    
    <!-- 操作按钮 -->
    <view class="action-bar">
      <view class="add-btn" @click="goToAddProduct">
        <text class="add-btn-text">添加商品</text>
      </view>
      <view class="filter-btn" @click="showFilter">
        <text class="filter-btn-text">筛选：{{ currentFilter }}</text>
      </view>
    </view>
    
    <!-- 商品列表 -->
    <view class="product-list">
      <view class="product-item" v-for="(item, index) in productList" :key="index">
        <view class="product-image-wrapper">
          <image :src="item.imageUrl" class="product-image" mode="aspectFill"></image>
        </view>
        
        <view class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <text class="product-desc">{{ item.description }}</text>
          <text class="product-price">¥{{ item.price }}</text>
          
          <view class="product-stats">
            <view class="status-tag" :style="{ 
              backgroundColor: item.status === '销售中' ? '#E8F5E9' : '#FFEBEE',
              color: item.status === '销售中' ? '#4CAF50' : '#F44336'
            }">
              <text class="status-text">{{ item.status }}</text>
            </view>
            <text class="stat-text">库 存：{{ item.stock }}</text>
            <text class="stat-text">销 量：{{ item.sales }}</text>
          </view>
        </view>
        
        <view class="product-actions">
          <view class="action-link" @click="editProduct(item)">
            <text class="link-text">编辑</text>
          </view>
          <view class="action-link delete" @click="deleteProduct(item)">
            <text class="link-text">删除</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="productList.length === 0" class="empty">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无商品</text>
        <view class="empty-btn" @click="goToAddProduct">
          <text class="empty-btn-text">添加商品</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getProductList, deleteProduct } from '@/api/product.js';

export default {
  name: 'ProductsPage',
  data() {
    return {
      allProducts: [],
      productList: [],
      currentFilter: '全部商品',
      loading: false
    }
  },
  onLoad() {
    this.loadProductsFromServer();
  },
  onShow() {
    // 从编辑页面返回时刷新列表
    this.loadProductsFromServer();
  },
  methods: {
    // 从服务器加载商品数据
    async loadProductsFromServer() {
      if (this.loading) return;
      
      this.loading = true;
      uni.showLoading({
        title: '加载中...'
      });
      
      try {
        const res = await getProductList({
          pageNum: 1,
          pageSize: 100
        });
        
        // 假设后端返回格式：{code: 200, data: {rows: [...], total: 10}}
        if (res.code === 200) {
          this.allProducts = res.data.rows || res.data || [];
          this.loadProducts();
        }
      } catch (error) {
        console.error('加载商品失败', error);
        // 如果网络请求失败，使用本地模拟数据
        this.allProducts = [
          {
            id: 1,
            imageUrl: '/static/logo.png',
            name: '招牌汉堡',
            description: '精选牛肉饼，搭配新鲜蔬菜和特制酱料',
            price: '32.00',
            status: '销售中',
            stock: 42,
            sales: 128
          },
          {
            id: 2,
            imageUrl: '/static/logo.png',
            name: '意式披萨',
            description: '多种配料，手工制作，香脆可口',
            price: '58.00',
            status: '销售中',
            stock: 26,
            sales: 96
          }
        ];
        this.loadProducts();
      } finally {
        this.loading = false;
        uni.hideLoading();
      }
    },
    // 根据筛选条件加载商品
    loadProducts() {
      if (this.currentFilter === '全部商品') {
        this.productList = [...this.allProducts];
      } else if (this.currentFilter === '销售中') {
        this.productList = this.allProducts.filter(p => p.status === '销售中');
      } else if (this.currentFilter === '已售罄') {
        this.productList = this.allProducts.filter(p => p.status === '已售罄');
      } else if (this.currentFilter === '库存不足') {
        this.productList = this.allProducts.filter(p => p.stock > 0 && p.stock <= 10);
      }
    },
    goToAddProduct() {
      // 跳转到添加商品页面
      uni.navigateTo({
        url: '/pages/products/edit'
      });
    },
    showFilter() {
      const that = this;
      uni.showActionSheet({
        itemList: ['全部商品', '销售中', '已售罄', '库存不足'],
        success: (res) => {
          const filters = ['全部商品', '销售中', '已售罄', '库存不足'];
          that.currentFilter = filters[res.tapIndex];
          that.loadProducts();
          uni.showToast({
            title: '已切换到：' + that.currentFilter,
            icon: 'none'
          });
        }
      });
    },
    editProduct(item) {
      // 找到商品在原始列表中的索引
      const index = this.allProducts.findIndex(p => p.name === item.name);
      
      // 跳转到编辑页面，传递商品数据
      uni.navigateTo({
        url: '/pages/products/edit?data=' + encodeURIComponent(JSON.stringify(item)) + '&index=' + index
      });
    },
    async deleteProduct(item) {
      const that = this;
      uni.showModal({
        title: '确认删除',
        content: `确定要删除"${item.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中...'
            });
            
            try {
              // 调用后端API删除商品
              await deleteProduct(item.id);
              
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              });
              
              // 重新加载商品列表
              that.loadProductsFromServer();
            } catch (error) {
              console.error('删除商品失败', error);
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              });
            } finally {
              uni.hideLoading();
            }
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

/* 顶部店铺信息 */
.shop-header {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 30rpx;
  display: flex;
  align-items: center;
}

.shop-icon {
  font-size: 60rpx;
  margin-right: 20rpx;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 6rpx;
}

.shop-status {
  font-size: 24rpx;
  color: #666;
}

/* 页面标题 */
.page-title {
  padding: 30rpx;
  background: white;
}

.title-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

/* 操作按钮栏 */
.action-bar {
  padding: 20rpx 30rpx;
  background: white;
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.add-btn {
  background: linear-gradient(135deg, #64B5F6, #42A5F5);
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
}

.add-btn-text {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

.filter-btn {
  padding: 20rpx 40rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 8rpx;
}

.filter-btn-text {
  font-size: 28rpx;
  color: #666;
}

/* 商品列表 */
.product-list {
  padding: 0 20rpx;
}

.product-item {
  background: white;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  position: relative;
}

.product-image-wrapper {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  overflow: hidden;
  margin-right: 24rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 100%;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.product-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12rpx;
}

.product-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff6b6b;
  margin-bottom: 16rpx;
}

.product-stats {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex-wrap: wrap;
}

.status-tag {
  padding: 6rpx 16rpx;
  border-radius: 4rpx;
  font-size: 22rpx;
}

.status-text {
  font-size: 22rpx;
}

.stat-text {
  font-size: 24rpx;
  color: #999;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  justify-content: center;
  margin-left: 20rpx;
}

.action-link {
  padding: 8rpx 24rpx;
  background: white;
  border: 1rpx solid #e0e0e0;
  border-radius: 6rpx;
  text-align: center;
}

.action-link.delete {
  border-color: #ffcdd2;
}

.link-text {
  font-size: 26rpx;
  color: #333;
}

.action-link.delete .link-text {
  color: #f44336;
}

/* 空状态 */
.empty {
  padding: 150rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.empty-btn {
  background: linear-gradient(135deg, #64B5F6, #42A5F5);
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
}

.empty-btn-text {
  font-size: 28rpx;
  color: white;
}
</style>

