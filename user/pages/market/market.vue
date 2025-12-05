<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-title">二手交易</text>
        <view class="publish-btn" @click="publishItem">
          <text class="publish-text">发布</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view 
      class="content" 
      scroll-y 
      :style="{ top: navHeight + 'px' }"
      @scrolltolower="loadMore"
      lower-threshold="100"
    >
      <!-- 搜索栏 -->
      <view class="search-container">
        <view class="search-box">
          <view class="search-icon">🔍</view>
          <input 
            class="search-input" 
            type="text" 
            v-model="searchKeyword" 
            placeholder="搜索商品名称或描述"
            @confirm="handleSearch"
          />
          <view v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</view>
        </view>
        <view class="search-btn" @click="handleSearch">
          <text class="search-btn-text">搜索</text>
        </view>
      </view>

      <!-- 排序栏 -->
      <view class="sort-container">
        <view 
          class="sort-item" 
          :class="{ active: sortBy === 'create_time' }"
          @click="selectSort('create_time')"
        >
          <text class="sort-text" :class="{ active: sortBy === 'create_time' }">最新</text>
          <text v-if="sortBy === 'create_time'" class="sort-arrow">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
        </view>
        <view 
          class="sort-item" 
          :class="{ active: sortBy === 'price' }"
          @click="selectSort('price')"
        >
          <text class="sort-text" :class="{ active: sortBy === 'price' }">价格</text>
          <text v-if="sortBy === 'price'" class="sort-arrow">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
        </view>
        <view 
          class="sort-item" 
          :class="{ active: sortBy === 'view_count' }"
          @click="selectSort('view_count')"
        >
          <text class="sort-text" :class="{ active: sortBy === 'view_count' }">热度</text>
          <text v-if="sortBy === 'view_count'" class="sort-arrow">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
        </view>
      </view>

      <!-- 分类标签 -->
      <scroll-view class="category-scroll" scroll-x>
        <view class="category-list">
          <view 
            v-for="(item, index) in categoryList" 
            :key="index"
            class="category-item"
            :class="{ active: currentCategory === index }"
            @click="selectCategory(index)"
          >
            <text class="category-text" :class="{ active: currentCategory === index }">{{ item }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 商品列表 -->
      <view class="goods-list">
        <view 
          v-for="(item, index) in goodsList" 
          :key="item.goodsId || item.id || index"
          class="goods-item"
          @click="viewDetail(item)"
        >
          <image 
            class="goods-image" 
            :src="getGoodsImage(item)" 
            mode="aspectFill"
            @error="imageError"
            @load="imageLoad"
          ></image>
          <view class="goods-info">
            <text class="goods-name">{{ item.goodsName || item.name || item.title }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price }}</text>
              <view class="buy-btn" @click.stop="buyItem(item)">
                <text class="buy-text">购买</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多状态 -->
      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 没有更多数据 -->
      <view v-if="!loading && noMore && goodsList.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && goodsList.length === 0" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无商品</text>
      </view>
    </scroll-view>
    
    <!-- 自定义底部导航栏 -->
    <custom-tabbar :current="1"></custom-tabbar>
  </view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
import { getGoodsList } from '@/api/secondhandGoods.js';
import { GOODS_CATEGORIES } from '@/api/config.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      searchKeyword: '',
      sortBy: 'create_time',
      sortOrder: 'desc',
      currentCategory: 0,
      categoryList: ['全部', ...GOODS_CATEGORIES.map(item => item.label)],
      categories: GOODS_CATEGORIES, // 保存完整的分类数据（包含code和label）
      goodsList: [],
      allGoodsList: [], // 存储所有商品，用于前端搜索和排序
      pageNum: 1,
      pageSize: 10,
      loading: false,
      noMore: false,
      isFirstLoad: false
    };
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
    
    // 加载商品列表
    this.loadGoodsList();
    this.isFirstLoad = true;
  },
  onShow() {
    // 每次显示页面时刷新列表（避免第一次加载时重复请求）
    if (!this.isFirstLoad) {
      this.refreshList();
    }
    this.isFirstLoad = false;
  },
  methods: {
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
        return 'https://picsum.photos/300/300';
      }
      
      // 处理图片URL前面可能存在的 @ 符号
      if (imageUrl && imageUrl.startsWith('@')) {
        imageUrl = imageUrl.substring(1);
      }
      
      return imageUrl;
    },
    
    // 图片加载成功
    imageLoad(e) {
      console.log('图片加载成功');
    },
    
    // 图片加载失败
    imageError(e) {
      console.error('图片加载失败：', e);
    },
    
    // 加载商品列表
    async loadGoodsList(isRefresh = false) {
      if (this.loading) return;
      
      this.loading = true;
      
      try {
        // 如果是刷新，重置页码
        if (isRefresh) {
          this.pageNum = 1;
          this.noMore = false;
        }
        
        // 获取当前分类
        // 如果是"全部"（索引0），不传category参数
        // 否则传递分类代码（如 ELECTRONICS）而不是标签（如 数码电子）
        let category = '';
        if (this.currentCategory > 0) {
          const categoryIndex = this.currentCategory - 1; // 减1因为第一个是"全部"
          category = this.categories[categoryIndex].code; // 使用英文代码
        }
        
        const result = await getGoodsList({
          category: category || undefined,
          pageNum: this.pageNum,
          pageSize: this.pageSize
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
        
        // 过滤掉已售、下架的商品
        // status: 0-未发布，1-上架，2-已售，3-下架
        const availableList = list.filter(item => {
          const status = item.status;
          return status === 0 || status === 1 || status === undefined || status === null;
        });
        
        if (isRefresh) {
          this.allGoodsList = availableList;
        } else {
          this.allGoodsList = [...this.allGoodsList, ...availableList];
        }
        
        // 应用前端搜索和排序
        this.applySearchAndSort();
        
        // 判断是否还有更多数据
        if (list.length < this.pageSize) {
          this.noMore = true;
        }
        
      } catch (error) {
        console.error('加载商品列表失败：', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },
    
    // 刷新列表
    refreshList() {
      this.loadGoodsList(true);
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        0: '未发布',
        1: '上架',
        2: '已售',
        3: '下架'
      };
      return statusMap[status] || '未知';
    },
    
    // 加载更多
    loadMore() {
      if (this.loading || this.noMore) return;
      
      this.pageNum++;
      this.loadGoodsList();
    },
    
    // 选择分类
    selectCategory(index) {
      if (this.currentCategory === index) return;
      
      this.currentCategory = index;
      this.pageNum = 1;
      this.goodsList = [];
      this.allGoodsList = [];
      this.noMore = false;
      
      // 清空搜索关键字，重置排序
      this.searchKeyword = '';
      this.sortBy = 'create_time';
      this.sortOrder = 'desc';
      
      // 加载该分类的商品
      this.loadGoodsList(true);
    },
    
    // 发布商品
    publishItem() {
      uni.navigateTo({
        url: '/pages/publish/publish'
      });
    },
    
    // 查看详情
    viewDetail(item) {
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
      
      // 跳转到详情页，并携带更多参数
      uni.navigateTo({
        url: `/pages/goods-detail/goods-detail?id=${goodsId}&name=${encodeURIComponent(name)}&price=${price}&image=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`
      });
    },
    
    // 购买商品
    buyItem(item) {
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
      
      // 跳转到详情页，并携带更多参数
      uni.navigateTo({
        url: `/pages/goods-detail/goods-detail?id=${goodsId}&name=${encodeURIComponent(name)}&price=${price}&image=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`
      });
    },
    
    // 处理搜索
    handleSearch() {
      this.applySearchAndSort();
    },
    
    // 清除搜索
    clearSearch() {
      this.searchKeyword = '';
      this.handleSearch();
    },
    
    // 选择排序方式
    selectSort(sortField) {
      // 如果点击同一个排序字段，切换排序方向
      if (this.sortBy === sortField) {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
      } else {
        // 切换到新的排序字段，默认降序
        this.sortBy = sortField;
        this.sortOrder = 'desc';
      }
      
      // 应用排序
      this.applySearchAndSort();
    },
    
    // 前端搜索和排序
    applySearchAndSort() {
      let filteredList = [...this.allGoodsList];
      
      // 1. 应用搜索过滤
      if (this.searchKeyword && this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.trim().toLowerCase();
        filteredList = filteredList.filter(item => {
          const name = (item.goodsName || item.name || item.title || '').toLowerCase();
          const desc = (item.description || '').toLowerCase();
          return name.includes(keyword) || desc.includes(keyword);
        });
      }
      
      // 2. 应用排序
      filteredList.sort((a, b) => {
        let compareResult = 0;
        
        if (this.sortBy === 'price') {
          // 价格排序
          compareResult = (a.price || 0) - (b.price || 0);
        } else if (this.sortBy === 'view_count') {
          // 浏览量排序
          compareResult = (a.viewCount || a.view_count || 0) - (b.viewCount || b.view_count || 0);
        } else if (this.sortBy === 'create_time') {
          // 创建时间排序
          const timeA = new Date(a.createTime || a.create_time || 0).getTime();
          const timeB = new Date(b.createTime || b.create_time || 0).getTime();
          compareResult = timeA - timeB;
        }
        
        // 根据排序方向调整结果
        return this.sortOrder === 'desc' ? -compareResult : compareResult;
      });
      
      this.goodsList = filteredList;
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

.publish-btn {
  background-color: #FFFFFF;
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
}

.publish-text {
  font-size: 28rpx;
  color: #5DCDFF;
}

/* 内容区域 */
.content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 搜索栏 */
.search-container {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #FFFFFF;
  margin-bottom: 10rpx;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #F5F5F5;
  border-radius: 40rpx;
  padding: 16rpx 30rpx;
  margin-right: 20rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.clear-icon {
  font-size: 32rpx;
  color: #999999;
  margin-left: 16rpx;
  padding: 0 10rpx;
}

.search-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #89CFF0 0%, #5DCDFF 100%);
  border-radius: 40rpx;
}

.search-btn-text {
  font-size: 28rpx;
  color: #FFFFFF;
}

/* 排序栏 */
.sort-container {
  display: flex;
  align-items: center;
  background-color: #FFFFFF;
  padding: 20rpx 30rpx;
  margin-bottom: 10rpx;
  justify-content: space-around;
}

.sort-item {
  display: flex;
  align-items: center;
  padding: 10rpx 30rpx;
  border-radius: 30rpx;
  transition: all 0.3s;
}

.sort-item.active {
  background-color: #F0F9FF;
}

.sort-text {
  font-size: 28rpx;
  color: #666666;
  margin-right: 8rpx;
}

.sort-text.active {
  color: #5DCDFF;
  font-weight: 500;
}

.sort-arrow {
  font-size: 24rpx;
  color: #5DCDFF;
  font-weight: bold;
}

/* 分类标签 */
.category-scroll {
  white-space: nowrap;
  background-color: #FFFFFF;
  padding: 20rpx 0;
}

.category-list {
  display: inline-flex;
  padding: 0 20rpx;
}

.category-item {
  display: inline-block;
  padding: 16rpx 40rpx;
  margin-right: 20rpx;
  border-radius: 40rpx;
  background-color: #F5F5F5;
  transition: all 0.3s;
}

.category-item.active {
  background: linear-gradient(135deg, #89CFF0 0%, #5DCDFF 100%);
}

.category-text {
  font-size: 28rpx;
  color: #666666;
  white-space: nowrap;
}

.category-text.active {
  color: #FFFFFF;
  font-weight: 500;
}

/* 商品列表 */
.goods-list {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx 20rpx 160rpx 20rpx;
  justify-content: space-between;
}

.goods-item {
  width: 345rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.goods-image {
  width: 100%;
  height: 345rpx;
  background-color: #F0F0F0;
}

.goods-info {
  padding: 20rpx;
}

.goods-name {
  font-size: 28rpx;
  color: #333333;
  display: block;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goods-price {
  font-size: 32rpx;
  color: #FF4444;
  font-weight: bold;
}

.buy-btn {
  padding: 10rpx 28rpx;
  background-color: #F5F5F5;
  border-radius: 30rpx;
}

.buy-text {
  font-size: 24rpx;
  color: #666666;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 28rpx;
  color: #CCCCCC;
}

/* 加载更多 */
.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx 0 160rpx 0;
}

.loading-text,
.no-more-text {
  font-size: 24rpx;
  color: #CCCCCC;
}
</style>

