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
        <input type="text" v-model="searchKeyword" placeholder="搜索美食商家" @input="handleSearch" />
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

        <!-- 商家列表容器 -->
        <view class="restaurant-container">
          <!-- 筛选栏 -->
          <view class="filter-bar">
            <view class="filter-item" @click="toggleFilter('rating')">
              <text :class="{ active: filter.rating }">评分最高</text>
              <text class="filter-arrow" :class="{ active: filter.rating }">↓</text>
            </view>

            <view class="filter-item" @click="toggleFilter('sales')">
              <text :class="{ active: filter.sales }">销量最高</text>
              <text class="filter-arrow" :class="{ active: filter.sales }">↓</text>
            </view>
          </view>
          
          <!-- 商家列表滚动区域 -->
          <scroll-view scroll-y class="restaurant-list" :style="{ height: contentHeight + 'px' }">

          <!-- 商家项 -->
          <view v-if="filteredRestaurants.length > 0">
            <view class="restaurant-item" v-for="restaurant in filteredRestaurants" :key="restaurant.id" @click="viewRestaurant(restaurant)">
              <!-- 商家头部信息 -->
              <view class="restaurant-header">
                <!-- 商家图片 -->
                <image class="restaurant-image" :src="restaurant.image" mode="aspectFill"></image>
                
                <!-- 商家基本信息 -->
                <view class="restaurant-info">
                  <!-- 商家名称和营业状态 -->
                  <view class="restaurant-name-row">
                    <text class="restaurant-name">{{ restaurant.name }}</text>
                    <view class="status-tag" :class="restaurant.businessStatus === 1 ? 'open' : 'closed'">
                      {{ restaurant.businessStatus === 1 ? '营业中' : '已打烊' }}
                    </view>
                  </view>
                  
                  <!-- 评分、销量 -->
                  <view class="restaurant-stats">
                    <text class="restaurant-rating">⭐ {{ restaurant.rating }}</text>
                    <text class="stat-divider">|</text>
                    <text class="restaurant-sales">月售{{ restaurant.sales }}单</text>
                  </view>
                  
                  <!-- 价格信息 -->
                  <view class="restaurant-price-info">
                    <text class="restaurant-min-order">起送价: <span class="price-value">¥{{ restaurant.minOrderAmount }}</span></text>
                    <text class="price-divider">|</text>
                    <text class="restaurant-delivery-fee">配送费: <span class="price-value">¥{{ restaurant.deliveryFee || 0 }}</span></text>
                  </view>
                  
                  <!-- 营业时间 -->
                  <view class="restaurant-hours">
                    <text class="business-hours">{{ restaurant.businessHours }}</text>
                  </view>
                </view>
              </view>
              
              <!-- 分隔线 -->
              <view class="divider"></view>
              
              <!-- 商家标签 -->
              <view class="restaurant-tags" v-if="restaurant.tags && restaurant.tags.length > 0">
                <view class="tag" v-for="tag in restaurant.tags" :key="tag">{{ tag }}</view>
              </view>
              
              <!-- 商家推荐商品 -->
              <view class="restaurant-foods" v-if="restaurant.foods && restaurant.foods.length > 0">
                <view class="food-item" v-for="(food, index) in restaurant.foods.slice(0, 2)" :key="food.id || index">
                  <image 
                    class="food-image" 
                    :src="getValidImageUrl(food.image || food.mainImageUrl || food.imageUrl)" 
                    mode="aspectFill"
                    @error="handleImageError($event, index, 'goods')">
                  </image>
                  <view class="food-info">
                    <text class="food-name">{{ food.goodsName }}</text>
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
    </view>

    <!-- 购物车悬浮窗 -->
    <view class="cart-float" v-if="cartCount > 0" @click="viewCart">
      <text class="cart-icon">🛒</text>
      <text class="cart-count">{{ cartCount }}</text>
      <text class="cart-text">去结算</text>
    </view>

    <!-- 购物车弹窗 -->
    <view class="cart-modal-overlay" v-if="showCartModal" @click="closeCartModal">
      <view class="cart-modal" @click.stop>
        <!-- 弹窗头部 -->
        <view class="cart-modal-header">
          <text class="cart-modal-title">购物车</text>
          <view class="cart-modal-actions">
            <text class="cart-modal-clear" @click="confirmClearCart">清空</text>
            <text class="cart-modal-close" @click="closeCartModal">✕</text>
          </view>
        </view>

        <!-- 购物车内容 -->
        <scroll-view scroll-y class="cart-modal-body" v-if="groupedCartItems.length > 0">
          <!-- 按店铺分组 -->
          <view class="cart-restaurant-group" v-for="group in groupedCartItems" :key="group.restaurantId">
            <!-- 店铺头部 -->
            <view class="cart-restaurant-header" @click="goToRestaurant(group.restaurantId)">
              <image class="cart-restaurant-logo" :src="getValidImageUrl(group.restaurant.image)" mode="aspectFill"></image>
              <view class="cart-restaurant-info">
                <text class="cart-restaurant-name">{{ group.restaurant.name }}</text>
                <text class="cart-restaurant-tip" v-if="!group.minOrderMet">还差¥{{ group.remainingAmount.toFixed(2) }}起送</text>
              </view>
              <text class="cart-restaurant-arrow">›</text>
            </view>

            <!-- 商品列表 -->
            <view class="cart-item" v-for="item in group.items" :key="item.id">
              <image class="cart-item-image" :src="getValidImageUrl(item.image)" mode="aspectFill"></image>
              <view class="cart-item-info">
                <text class="cart-item-name">{{ item.name }}</text>
                <text class="cart-item-price">¥{{ item.price.toFixed(2) }}</text>
              </view>
              <view class="cart-item-actions">
                <text class="cart-item-btn" @click="decreaseCartItem(item, group)">-</text>
                <text class="cart-item-count">{{ item.count }}</text>
                <text class="cart-item-btn" @click="increaseCartItem(item, group)">+</text>
              </view>
            </view>

            <!-- 店铺小计 -->
            <view class="cart-restaurant-footer">
              <view class="cart-subtotal">
                <text class="cart-subtotal-label">小计：</text>
                <text class="cart-subtotal-value">¥{{ group.subtotal.toFixed(2) }}</text>
                <text class="cart-delivery-fee" v-if="group.restaurant.deliveryFee">（配送费¥{{ group.restaurant.deliveryFee }}）</text>
              </view>
              <view class="cart-checkout-btn" :class="{ disabled: !group.minOrderMet }" @click="checkoutRestaurant(group)">
                <text>去结算</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 空购物车状态 -->
        <view class="cart-empty" v-else>
          <text class="cart-empty-icon">🛒</text>
          <text class="cart-empty-text">购物车是空的</text>
          <text class="cart-empty-hint">快去挑选美食吧~</text>
        </view>

        <!-- 弹窗底部 -->
        <view class="cart-modal-footer" v-if="groupedCartItems.length > 0">
          <view class="cart-total-info">
            <text class="cart-total-count">共{{ cartCount }}件商品</text>
            <text class="cart-total-amount">合计：¥{{ cartTotalAmount.toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 引入外卖相关API
import foodApi from '../../api/food.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      contentHeight: 0, // 内容区域高度
      searchKeyword: '',
      selectedCategory: '全部', // 选中的分类名称，默认为"全部"分类
        filter: {
          rating: false,
          sales: false
        },
        searchTimer: null,
      categories: [
        {
          id: '全部',
          name: '全部'
        }
      ],
      merchants: [], // 从API获取的商家列表
      goodsMap: {}, // 以商家ID为键，商品列表为值的映射
      cartCount: 0,
      showCartModal: false, // 购物车弹窗显示状态
      cartItems: [] // 购物车商品列表
    };
  },
  
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    // 计算导航栏高度（默认44px + 状态栏高度）
    this.navHeight = systemInfo.statusBarHeight + 44;
    
    // 计算内容区域高度（屏幕高度 - 导航栏 - 搜索栏 - 筛选栏）
    // 筛选栏高度约80rpx，转换为px（假设1rpx = 0.5px）
    const filterBarHeight = 40; // 筛选栏高度（px）
    this.contentHeight = systemInfo.windowHeight - this.navHeight - 80 - filterBarHeight;
    
    // 页面加载时初始化加载商品列表
    this.loadGoodsList();
  },
  onShow() {
    // 页面显示时刷新商家列表数据，确保月售数量是最新的
    // 这样可以确保从支付页面返回时，能看到最新的商家月售数据
    this.loadGoodsList();
    // 刷新购物车数据
    this.loadCartData();
  },
  computed: {
    // 将商家和对应的商品列表组合
    restaurants() {
      console.log('restaurants计算属性 - merchants:', this.merchants);
      console.log('restaurants计算属性 - goodsMap:', this.goodsMap);
      
      const mappedRestaurants = this.merchants.map(merchant => {
        // 从goodsMap中获取当前商家的商品列表
        const merchantGoods = this.goodsMap[merchant.merchantBaseId] || [];
        
        // 使用getValidImageUrl方法处理商家logo URL
        let logoUrl = this.getValidImageUrl(merchant.logo);
        
        // 计算商家所有商品的总月售（累加所有商品的销量）
        let totalMonthSales = 0;
        if (merchantGoods && merchantGoods.length > 0) {
          // 调试：输出第一个商品的字段，帮助排查问题
          if (merchantGoods.length > 0) {
            console.log(`商家${merchant.merchantBaseId}的第一个商品数据:`, merchantGoods[0]);
            console.log(`商家${merchant.merchantBaseId}的第一个商品所有字段:`, Object.keys(merchantGoods[0]));
          }
          
          totalMonthSales = merchantGoods.reduce((sum, goods, index) => {
            // 支持多种销量字段名
            let goodsSales = 0;
            if (goods.salesCount !== undefined && goods.salesCount !== null) {
              goodsSales = Number(goods.salesCount) || 0;
            } else if (goods.sales_count !== undefined && goods.sales_count !== null) {
              goodsSales = Number(goods.sales_count) || 0;
            } else if (goods.monthlySales !== undefined && goods.monthlySales !== null) {
              goodsSales = Number(goods.monthlySales) || 0;
            } else if (goods.monthlySalesCount !== undefined && goods.monthlySalesCount !== null) {
              goodsSales = Number(goods.monthlySalesCount) || 0;
            }
            
            // 调试：输出每个商品的销量信息
            if (index === 0) {
              console.log(`商家${merchant.merchantBaseId}的商品销量字段检查:`, {
                salesCount: goods.salesCount,
                sales_count: goods.sales_count,
                monthlySales: goods.monthlySales,
                monthlySalesCount: goods.monthlySalesCount,
                计算出的销量: goodsSales
              });
            }
            
            return sum + goodsSales;
          }, 0);
          
          console.log(`商家${merchant.merchantBaseId}的总月售:`, totalMonthSales);
        }
        
        // 如果商品列表为空或总销量为0，尝试使用商家本身的月售字段作为备选
        if (totalMonthSales === 0) {
          if (merchant.monthSales !== undefined && merchant.monthSales !== null) {
            totalMonthSales = Number(merchant.monthSales) || 0;
          } else if (merchant.month_sales !== undefined && merchant.month_sales !== null) {
            totalMonthSales = Number(merchant.month_sales) || 0;
          } else if (merchant.salesCount !== undefined && merchant.salesCount !== null) {
            totalMonthSales = Number(merchant.salesCount) || 0;
          } else if (merchant.sales_count !== undefined && merchant.sales_count !== null) {
            totalMonthSales = Number(merchant.sales_count) || 0;
          }
        }
        
        // 完整映射后端返回的商家字段
        return {
          id: merchant.merchantBaseId,
          name: merchant.merchantName || '未命名商家',
          image: logoUrl,
          rating: merchant.rating || 0,
          sales: totalMonthSales, // 使用计算出的总月售
          tags: [], // 不再使用经营范围作为标签
          foods: merchantGoods,
          // 添加后端返回的其他商家字段
          businessHours: merchant.businessHours || '00:00-24:00',
          businessScope: merchant.businessScope || '',
          businessStatus: merchant.businessStatus || 0,
          deliveryFee: merchant.deliveryFee || 0,
          deliveryRange: merchant.deliveryRange || 0,
          minOrderAmount: merchant.minOrderAmount || 0
        };
      });
      
      console.log('restaurants计算属性 - mappedRestaurants:', mappedRestaurants);
      return mappedRestaurants;
    },
    
    // 按店铺分组的购物车商品
    groupedCartItems() {
      if (!this.cartItems || this.cartItems.length === 0) {
        return [];
      }
      
      // 按店铺ID分组
      const groupMap = new Map();
      this.cartItems.forEach(item => {
        const restaurantId = item.restaurantId;
        if (!groupMap.has(restaurantId)) {
          // 优先从购物车商品项中获取商家信息，如果没有则从restaurants列表中查找
          let restaurantInfo = {
            id: restaurantId,
            name: item.restaurantName || '未知店铺',
            image: item.restaurantImage || '/static/images/default-food.svg',
            minOrder: item.restaurantMinOrder || 0,
            deliveryFee: item.restaurantDeliveryFee || 0
          };
          
          // 如果购物车商品项中没有商家名称，尝试从restaurants列表中查找
          if (!item.restaurantName || item.restaurantName === '未知店铺') {
            const foundRestaurant = this.restaurants.find(r => String(r.id) === String(restaurantId));
            if (foundRestaurant) {
              restaurantInfo = {
                id: restaurantId,
                name: foundRestaurant.name || '未知店铺',
                image: foundRestaurant.image || '/static/images/default-food.svg',
                minOrder: foundRestaurant.minOrderAmount || 0,
                deliveryFee: foundRestaurant.deliveryFee || 0
              };
            }
          }
          
          groupMap.set(restaurantId, {
            restaurantId: restaurantId,
            restaurant: restaurantInfo,
            items: [],
            subtotal: 0,
            itemCount: 0
          });
        }
        groupMap.get(restaurantId).items.push(item);
      });
      
      // 计算每个店铺的小计和起送状态
      const groups = Array.from(groupMap.values()).map(group => {
        group.subtotal = group.items.reduce((sum, item) => sum + item.price * item.count, 0);
        group.itemCount = group.items.reduce((sum, item) => sum + item.count, 0);
        group.minOrderMet = group.subtotal >= group.restaurant.minOrder;
        group.remainingAmount = group.minOrderMet ? 0 : group.restaurant.minOrder - group.subtotal;
        return group;
      });
      
      return groups;
    },
    
    // 购物车总金额
    cartTotalAmount() {
      return this.cartItems.reduce((sum, item) => sum + item.price * item.count, 0);
    },
    
    filteredRestaurants() {
      let result = [...this.restaurants];
      console.log('filteredRestaurants计算属性 - 初始result:', result);
      console.log('filteredRestaurants计算属性 - selectedCategory:', this.selectedCategory);
      
      // 根据选中的分类筛选商家
      if (this.selectedCategory !== '全部') {
        result = result.filter(restaurant => restaurant.businessScope === this.selectedCategory);
      }
      
      // 排序
      if (this.filter.rating) {
          result.sort((a, b) => b.rating - a.rating);
        } else if (this.filter.sales) {
          result.sort((a, b) => b.sales - a.sales);
        }
      
      console.log('filteredRestaurants计算属性 - 最终result:', result);
      return result;
    }
  },
  methods: {
    // 处理图片加载错误
    handleImageError(event, index, type) {
      console.log('图片加载失败:', { event, index, type });
      // 设置默认占位图
      if (event && event.target) {
        event.target.src = '/static/images/default-food.svg';
      }
    },
    
    // 获取有效图片URL
    getValidImageUrl(url) {
      console.log('原始URL输入:', url);
      
      // 如果URL为空，直接返回默认占位图而不是空字符串
      if (!url) {
        console.log('URL为空，返回默认占位图');
        return '/static/images/default-food.svg';
      }
      
      // 先进行trim去除前后空白
      let cleanedUrl = String(url).trim();
      console.log('trim后URL:', cleanedUrl);
      
      // 加强反引号清理，使用更严格的正则表达式
      cleanedUrl = cleanedUrl.replace(/[`\u0060]/g, '');
      console.log('第一次移除反引号后URL:', cleanedUrl);
      
      // 再次尝试移除可能的转义反引号
      cleanedUrl = cleanedUrl.replace(/[`\u0060]/g, '');
      console.log('第二次移除反引号后URL:', cleanedUrl);
      
      // 再次trim确保去除反引号后的空白
      cleanedUrl = cleanedUrl.trim();
      console.log('最终清理后URL:', cleanedUrl);
      
      // 如果清理后URL为空，返回默认占位图
      if (!cleanedUrl) {
        console.log('清理后URL为空，返回默认占位图');
        return '/static/images/default-food.svg';
      }
      
      // 检查URL是否以@开头（有些后端可能会返回这种格式）
      if (cleanedUrl.startsWith('@')) {
        cleanedUrl = cleanedUrl.substring(1);
      }
      
      // 检查URL是否为完整的HTTP/HTTPS URL
      if (cleanedUrl.startsWith('http://') || cleanedUrl.startsWith('https://')) {
        // 对URL进行编码处理，特别是处理中文和空格
        if (cleanedUrl.includes(' ') || cleanedUrl.match(/[\\u4e00-\\u9fa5]/)) {
          // 对URL进行编码，但保留协议和主机部分（包括端口号）
          const protocolMatch = cleanedUrl.match(/^(https?:\/\/[^\/]+)(\/.*)?$/);
          if (protocolMatch) {
            const [, protocolAndHost, path] = protocolMatch;
            if (path) {
              const encodedPath = path.split('/').map(segment => segment ? encodeURIComponent(segment) : '').join('/');
              cleanedUrl = protocolAndHost + encodedPath;
              console.log('编码后URL:', cleanedUrl);
            }
          }
        }
        return cleanedUrl;
      }
      
      // 检查是否为相对路径
      if (cleanedUrl.startsWith('/')) {
        // 如果是相对路径，尝试添加API基础URL
        const baseUrl = 'http://localhost:8080';
        let fullUrl = `${baseUrl}${cleanedUrl}`;
        // 对URL进行编码处理
        if (fullUrl.includes(' ') || fullUrl.match(/[\\u4e00-\\u9fa5]/)) {
          // 对URL进行编码，但保留协议部分
          const protocol = fullUrl.split('://')[0] + '://';
          const path = fullUrl.substring(protocol.length);
          const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
          fullUrl = protocol + encodedPath;
          console.log('相对路径编码后URL:', fullUrl);
        }
        return fullUrl;
      }
      
      // 检查是否为静态资源路径
      if (cleanedUrl.startsWith('static/')) {
        return `/${cleanedUrl}`;
      }
      
      // 如果都不是，返回默认占位图
      console.log('处理后URL不满足任何条件，返回默认占位图');
      // 使用本地静态资源作为占位图
      return '/static/images/default-food.svg';
    },
    
    // 加载商品列表
    async loadGoodsList() {
      try {
        let merchantResponse;
        
        // 添加调试信息
        console.log('开始加载商品列表，搜索关键词:', this.searchKeyword, '选中分类:', this.selectedCategory);
        
        // 根据搜索关键词调用不同的API
        if (this.searchKeyword) {
          // 使用后端搜索接口
          merchantResponse = await foodApi.searchMerchant(this.searchKeyword);
          console.log('searchMerchant完整响应:', merchantResponse);
        } else {
          // 获取营业中的商家列表
          merchantResponse = await foodApi.getMerchantList();
          console.log('getMerchantList完整响应:', merchantResponse);
        }
        
        let merchantList = [];
        if (merchantResponse) {
          console.log('API调用结果存在，code:', merchantResponse.code, 'message:', merchantResponse.message || merchantResponse.msg);
          
          if (merchantResponse.code === 200) {
            // 首先检查顶层rows字段（API返回的特殊数据结构）
            if (merchantResponse.rows && Array.isArray(merchantResponse.rows)) {
              console.log('使用顶层rows字段，长度:', merchantResponse.rows.length);
              merchantList = merchantResponse.rows;
            }
            // 然后检查data.rows字段（标准分页数据结构）
            else if (merchantResponse.data && merchantResponse.data.rows && Array.isArray(merchantResponse.data.rows)) {
              console.log('使用data.rows字段，长度:', merchantResponse.data.rows.length);
              merchantList = merchantResponse.data.rows;
            }
            // 兼容直接返回数组的情况
            else if (merchantResponse.data && Array.isArray(merchantResponse.data)) {
              console.log('直接返回数组，长度:', merchantResponse.data.length);
              merchantList = merchantResponse.data;
            }
            // 兼容直接返回商家对象列表的情况
            else if (merchantResponse.data) {
              console.log('返回对象，尝试作为单个商家处理');
              merchantList = [merchantResponse.data];
            }
          }
          // 即使code不为200，也尝试获取数据
          else {
            // 同样检查顶层rows字段和data.rows字段
            if (merchantResponse.rows && Array.isArray(merchantResponse.rows)) {
              console.log('code不为200，但存在顶层rows字段，长度:', merchantResponse.rows.length);
              merchantList = merchantResponse.rows;
            }
            else if (merchantResponse.data && merchantResponse.data.rows && Array.isArray(merchantResponse.data.rows)) {
              console.log('code不为200，但存在data.rows字段，长度:', merchantResponse.data.rows.length);
              merchantList = merchantResponse.data.rows;
            }
            else if (merchantResponse.data && Array.isArray(merchantResponse.data)) {
              console.log('code不为200，但存在data数组，长度:', merchantResponse.data.length);
              merchantList = merchantResponse.data;
            }
          }
        } else {
          console.error('API调用失败，返回undefined');
        }
        
        console.log('最终商家列表长度:', merchantList.length);
        console.log('商家列表详情:', merchantList);
        
        // 不依赖businessStatus，直接使用所有返回的商家
        this.merchants = merchantList;
        
        // 从商家数据中提取唯一的businessScope作为分类
        this.generateCategoriesFromBusinessScope();
        
        // 为商家获取商品列表
        // 注意：不要清空goodsMap，否则会覆盖热门商家的商品数据
        for (const merchant of this.merchants) {
          try {
            const goodsResponse = await foodApi.getMerchantGoodsList(merchant.merchantBaseId);
            console.log(`商家${merchant.merchantBaseId}的商品响应:`, goodsResponse);
            
            let goodsList = [];
            if (goodsResponse && goodsResponse.code === 200) {
              // 处理商品数据的分页结构，支持多种返回格式
              // 1. 顶层rows字段（如：{code: 200, rows: [...]}）
              if (goodsResponse.rows && Array.isArray(goodsResponse.rows)) {
                goodsList = goodsResponse.rows;
                console.log(`商家${merchant.merchantBaseId}的商品使用顶层rows字段，长度:`, goodsList.length);
              }
              // 2. data.rows字段（标准分页结构）
              else if (goodsResponse.data && goodsResponse.data.rows && Array.isArray(goodsResponse.data.rows)) {
                goodsList = goodsResponse.data.rows;
                console.log(`商家${merchant.merchantBaseId}的商品使用data.rows字段，长度:`, goodsList.length);
              }
              // 3. data直接是数组
              else if (goodsResponse.data && Array.isArray(goodsResponse.data)) {
                goodsList = goodsResponse.data;
                console.log(`商家${merchant.merchantBaseId}的商品直接返回数组，长度:`, goodsList.length);
              }
            }
            
            // 预拉取每个商品的月售数据，便于前端直接展示近30天销量
            const monthlySalesMap = new Map();
            await Promise.all((goodsList || []).map(async (goods) => {
              const gid = goods.merchantGoodsId || goods.id;
              if (!gid) return;
              try {
                const monthlyRes = await foodApi.getGoodsMonthlySales(gid);
                if (monthlyRes && monthlyRes.code === 200 && monthlyRes.data !== undefined) {
                  monthlySalesMap.set(gid, Number(monthlyRes.data) || 0);
                }
              } catch (err) {
                console.warn(`获取商品${gid}月售失败:`, err);
              }
            }));
            
            // 完整映射后端返回的商品字段，确保前端能正确显示所有信息
            const mappedGoods = goodsList.map((item, index) => {
              // 调试：输出第一个商品的原始数据
              if (index === 0) {
                console.log(`商家${merchant.merchantBaseId}的商品原始数据示例:`, item);
                console.log(`商家${merchant.merchantBaseId}的商品原始数据所有字段:`, Object.keys(item));
              }
              
              // 处理销量字段，支持多种可能的字段名，保留原始值
              const monthlyKey = item.merchantGoodsId || item.id;
              let salesCount = monthlySalesMap.has(monthlyKey) ? monthlySalesMap.get(monthlyKey) : 0;
              if (!salesCount) {
                if (item.salesCount !== undefined && item.salesCount !== null) {
                  salesCount = Number(item.salesCount) || 0;
                } else if (item.sales_count !== undefined && item.sales_count !== null) {
                  salesCount = Number(item.sales_count) || 0;
                } else if (item.monthlySales !== undefined && item.monthlySales !== null) {
                  salesCount = Number(item.monthlySales) || 0;
                } else if (item.monthlySalesCount !== undefined && item.monthlySalesCount !== null) {
                  salesCount = Number(item.monthlySalesCount) || 0;
                }
              }
              
              // 处理商品图片URL，支持多种可能的字段名
              let goodsImageUrl = '';
              // 优先使用mainImageUrl（后端查询的主图）
              if (item.mainImageUrl && typeof item.mainImageUrl === 'string' && item.mainImageUrl.trim() !== '') {
                goodsImageUrl = item.mainImageUrl.trim();
              } 
              // 其次使用imageUrl
              else if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '') {
                goodsImageUrl = item.imageUrl.trim();
              } 
              // 再次使用image
              else if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
                goodsImageUrl = item.image.trim();
              } 
              // 最后尝试从imageList中获取
              else if (item.imageList && Array.isArray(item.imageList) && item.imageList.length > 0) {
                const firstImage = item.imageList[0];
                if (firstImage && typeof firstImage === 'string' && firstImage.trim() !== '') {
                  goodsImageUrl = firstImage.trim();
                } else if (firstImage && firstImage.imageUrl && typeof firstImage.imageUrl === 'string' && firstImage.imageUrl.trim() !== '') {
                  goodsImageUrl = firstImage.imageUrl.trim();
                }
              }
              
              // 如果还是没有图片URL，使用默认占位图
              if (!goodsImageUrl || goodsImageUrl === '') {
                goodsImageUrl = '/static/images/default-food.svg';
              }
              
              // 调试：输出图片URL处理结果（仅第一个商品）
              if (index === 0) {
                console.log(`商家${merchant.merchantBaseId}的商品图片处理:`, {
                  mainImageUrl: item.mainImageUrl,
                  imageUrl: item.imageUrl,
                  image: item.image,
                  imageList: item.imageList,
                  最终图片URL: goodsImageUrl
                });
              }
              
              return {
                ...item, // 先展开所有原始字段，确保不丢失任何数据
                // 确保基础字段存在并处理
                goodsName: item.goodsName || '未命名商品',
                // 价格相关字段
                price: item.price || 0,
                originalPrice: item.originalPrice || null,
                // 评分相关字段 - 优先使用后端返回的真实数据
                avgRating: item.avgRating,
                ratingCount: item.ratingCount,
                fiveStarRate: item.fiveStarRate,
                fourStarRate: item.fourStarRate,
                threeStarRate: item.threeStarRate,
                twoStarRate: item.twoStarRate,
                oneStarRate: item.oneStarRate,
                // 销量和月售字段 - 使用处理后的值，但保留原始字段
                salesCount: salesCount || item.salesCount || 0,
                sales_count: item.sales_count || salesCount || 0,
                monthlySales: salesCount,
                monthlySalesCount: salesCount,
                // 图片字段 - 使用处理后的图片URL
                image: goodsImageUrl,
                mainImageUrl: goodsImageUrl,
                imageUrl: goodsImageUrl,
                // 其他字段
                stock: item.stock || 0,
                description: item.description || '',
                status: item.status || 1,
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                avgScore: item.avgScore || 4.5,
                totalSalesCount: item.totalSalesCount || 0,
                inventory: item.inventory || 0
              };
            });
            
            // 按销量排序商品（销量高的在前）
            mappedGoods.sort((a, b) => {
              const salesA = a.salesCount || a.sales_count || a.monthlySales || a.monthlySalesCount || 0;
              const salesB = b.salesCount || b.sales_count || b.monthlySales || b.monthlySalesCount || 0;
              return Number(salesB) - Number(salesA); // 降序排列
            });
            
            // 存储商家的商品列表到goodsMap（已按销量排序）
            // 使用Vue.set确保响应式更新，触发计算属性重新计算
            this.$set(this.goodsMap, merchant.merchantBaseId, mappedGoods);
          } catch (error) {
            console.error(`获取商家${merchant.merchantBaseId}的商品失败:`, error);
            // 即使获取失败，也将空数组存储到goodsMap，避免后续出错
            this.$set(this.goodsMap, merchant.merchantBaseId, []);
          }
        }
        
        console.log('商品加载完成，goodsMap:', this.goodsMap);
        
        // 强制更新视图，确保计算属性重新计算商家月售
        this.$nextTick(() => {
          this.$forceUpdate();
        });
        
      } catch (error) {
        console.error('加载商品列表失败:', error);
        uni.showToast({
          title: '加载商品失败',
          icon: 'none'
        });
        
        // API调用失败时，不添加默认商家和商品
        this.merchants = [];
        this.goodsMap = {};
      }
    },
    
    // 返回主页
    navBack() {
      // 检查当前页面栈，确保能正确返回主页
      const pages = getCurrentPages();
      console.log('当前页面栈长度:', pages.length);
      
      // 如果页面栈长度小于2，说明直接从主页进入，使用reLaunch跳转到主页
      if (pages.length < 2) {
        uni.reLaunch({
          url: '/pages/index/index'
        });
      } else {
        uni.navigateBack();
      }
    },
    
    // 根据商家的businessScope生成分类列表
    generateCategoriesFromBusinessScope() {
      // 提取所有唯一的businessScope值
      const businessScopes = [...new Set(this.merchants.map(merchant => merchant.businessScope || '其他'))];
      
      // 生成分类列表，始终包含"全部"分类
      const generatedCategories = [
        {
          id: '全部',
          name: '全部'
        }
      ];
      
      // 添加从businessScope提取的分类
      businessScopes.forEach((scope, index) => {
        generatedCategories.push({
          id: scope,
          name: scope
        });
      });
      
      this.categories = generatedCategories;
      console.log('生成的分类列表:', this.categories);
    },
    
    selectCategory(category) {
      this.selectedCategory = category.id;
      // 分类变化时不需要重新加载数据，直接筛选即可
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
    
    // 处理搜索
    handleSearch() {
      // 防抖处理，避免频繁调用API
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.loadGoodsList();
      }, 500);
    },
    
    // 查看购物车
    viewCart() {
      this.loadCartData();
      this.showCartModal = true;
    },
    
    // 关闭购物车弹窗
    closeCartModal() {
      this.showCartModal = false;
    },
    
    // 加载购物车数据
    loadCartData() {
      const cartData = uni.getStorageSync('foodCart');
      if (cartData && cartData.items && cartData.items.length > 0) {
        this.cartItems = cartData.items;
        this.cartCount = cartData.items.reduce((sum, item) => sum + item.count, 0);
      } else {
        this.cartItems = [];
        this.cartCount = 0;
      }
    },
    
    // 保存购物车数据
    saveCartData() {
      if (this.cartItems.length > 0) {
        // 获取第一个商品的店铺信息作为当前店铺（兼容现有结构）
        const firstItem = this.cartItems[0];
        uni.setStorageSync('foodCart', {
          restaurant: {
            id: firstItem.restaurantId,
            name: firstItem.restaurantName,
            image: firstItem.restaurantImage,
            minOrder: firstItem.restaurantMinOrder,
            deliveryFee: firstItem.restaurantDeliveryFee
          },
          items: this.cartItems,
          totalAmount: this.cartTotalAmount,
          totalCount: this.cartCount
        });
      } else {
        uni.removeStorageSync('foodCart');
      }
      // 更新购物车数量
      this.cartCount = this.cartItems.reduce((sum, item) => sum + item.count, 0);
    },
    
    // 增加购物车商品数量
    increaseCartItem(item, group) {
      const cartItem = this.cartItems.find(i => i.id === item.id && i.restaurantId === item.restaurantId);
      if (cartItem) {
        cartItem.count++;
        this.saveCartData();
      }
    },
    
    // 减少购物车商品数量
    decreaseCartItem(item, group) {
      const index = this.cartItems.findIndex(i => i.id === item.id && i.restaurantId === item.restaurantId);
      if (index !== -1) {
        if (this.cartItems[index].count > 1) {
          this.cartItems[index].count--;
        } else {
          this.cartItems.splice(index, 1);
        }
        this.saveCartData();
        
        // 如果购物车为空，关闭弹窗
        if (this.cartItems.length === 0) {
          this.showCartModal = false;
        }
      }
    },
    
    // 跳转到店铺详情
    goToRestaurant(restaurantId) {
      this.showCartModal = false;
      uni.navigateTo({
        url: `/pages/food/food-detail?restaurantId=${restaurantId}`
      });
    },
    
    // 结算指定店铺的商品
    checkoutRestaurant(group) {
      if (!group.minOrderMet) {
        uni.showToast({
          title: `还差¥${group.remainingAmount.toFixed(2)}起送`,
          icon: 'none'
        });
        return;
      }
      
      // 保存该店铺的购物车数据
      uni.setStorageSync('foodCart', {
        restaurant: group.restaurant,
        items: group.items,
        totalAmount: group.subtotal + group.restaurant.deliveryFee,
        totalCount: group.itemCount
      });
      
      this.showCartModal = false;
      
      // 跳转到订单确认页面
      uni.navigateTo({
        url: '/pages/food/order-confirm'
      });
    },
    
    // 确认清空购物车
    confirmClearCart() {
      uni.showModal({
        title: '提示',
        content: '确定要清空购物车吗？',
        success: (res) => {
          if (res.confirm) {
            this.cartItems = [];
            this.saveCartData();
            this.showCartModal = false;
            uni.showToast({
              title: '购物车已清空',
              icon: 'success'
            });
          }
        }
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
  background-color: #E6F7FF;
  border-radius: 40rpx;
  padding: 0 30rpx;
  height: 60rpx;
  border: 1rpx solid rgba(93, 205, 255, 0.3);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.search-input:hover {
  background-color: #F0FCFF;
  box-shadow: 0 3rpx 8rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 28rpx;
  color: #4AA9FF;
  margin-right: 20rpx;
}

.search-input input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  background-color: transparent;
  border: none;
  outline: none;
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
  height: 100%;
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
  height: 100%;
  background-color: #fafafa;
  padding: 10rpx;
  box-sizing: border-box;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 80rpx;
  background-color: #ffffff;
  box-sizing: border-box;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
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
  margin-bottom: 20rpx;
  background-color: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.restaurant-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

/* 商家头部信息 */
.restaurant-header {
  display: flex;
  padding: 20rpx;
  align-items: flex-start;
}

.restaurant-image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.restaurant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 150rpx;
}

/* 商家名称和营业状态 */
.restaurant-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.restaurant-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  flex: 1;
  margin-right: 10rpx;
}

.status-tag {
  font-size: 20rpx;
  padding: 2rpx 12rpx;
  border-radius: 12rpx;
  font-weight: 500;
}

.status-tag.open {
  background-color: #E6F7EE;
  color: #48BB78;
}

.status-tag.closed {
  background-color: #F7F7F7;
  color: #9CA3AF;
}

/* 评分、销量 */
.restaurant-stats {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.restaurant-rating {
  font-size: 26rpx;
  color: #FFB800;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.stat-divider {
  font-size: 24rpx;
  color: #E0E0E0;
  margin: 0 10rpx;
}

.restaurant-sales {
  font-size: 24rpx;
  color: #999999;
}

/* 价格信息 */
.restaurant-price-info {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.restaurant-min-order,
.restaurant-delivery-fee {
  font-size: 24rpx;
  color: #666666;
}

.price-value {
  font-size: 26rpx;
  color: #FF6B6B;
  font-weight: 600;
}

.price-divider {
  font-size: 24rpx;
  color: #E0E0E0;
  margin: 0 10rpx;
}

/* 营业时间 */
.restaurant-hours {
  font-size: 22rpx;
  color: #999999;
}

.business-hours {
  font-size: 22rpx;
}

/* 分隔线 */
.divider {
  height: 1rpx;
  background-color: #F0F0F0;
  margin: 0 20rpx;
}

/* 商家标签 */
.restaurant-tags {
  display: flex;
  padding: 15rpx 20rpx 0;
  flex-wrap: wrap;
}

.tag {
  font-size: 22rpx;
  color: #666666;
  background-color: #F5F5F5;
  padding: 4rpx 15rpx;
  border-radius: 15rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
}

/* 商家推荐商品 */
.restaurant-foods {
  display: flex;
  padding: 15rpx 20rpx 20rpx;
  background-color: #FAFAFA;
}

.food-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-right: 15rpx;
}

.food-item:last-child {
  margin-right: 0;
}

.food-image {
  width: 100%;
  height: 120rpx;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
  object-fit: cover;
}

.food-name {
  font-size: 24rpx;
  color: #333333;
  margin-bottom: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.food-price {
  font-size: 26rpx;
  color: #FF6B6B;
  font-weight: 600;
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

/* 商家容器 */
.restaurant-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
  height: 100%;
  overflow: hidden;
}

/* 空状态提示 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 40rpx;
  text-align: center;
  background-color: #fafafa;
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

/* 购物车弹窗样式 */
.cart-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.cart-modal {
  width: 100%;
  max-height: 70vh;
  background-color: #FFFFFF;
  border-radius: 30rpx 30rpx 0 0;
  display: flex;
  flex-direction: column;
}

.cart-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.cart-modal-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
}

.cart-modal-actions {
  display: flex;
  align-items: center;
}

.cart-modal-clear {
  font-size: 28rpx;
  color: #999999;
  margin-right: 30rpx;
}

.cart-modal-close {
  font-size: 36rpx;
  color: #999999;
  padding: 10rpx;
}

.cart-modal-body {
  flex: 1;
  max-height: 50vh;
  padding: 0 20rpx;
}

/* 店铺分组 */
.cart-restaurant-group {
  margin: 20rpx 0;
  background-color: #FAFAFA;
  border-radius: 16rpx;
  overflow: hidden;
}

.cart-restaurant-header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
}

.cart-restaurant-logo {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.cart-restaurant-info {
  flex: 1;
}

.cart-restaurant-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  display: block;
}

.cart-restaurant-tip {
  font-size: 24rpx;
  color: #FF6B6B;
  margin-top: 6rpx;
  display: block;
}

.cart-restaurant-arrow {
  font-size: 36rpx;
  color: #CCCCCC;
}

/* 购物车商品项 */
.cart-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #F5F5F5;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-size: 28rpx;
  color: #333333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item-price {
  font-size: 28rpx;
  color: #FF6B6B;
  font-weight: 600;
  margin-top: 8rpx;
  display: block;
}

.cart-item-actions {
  display: flex;
  align-items: center;
}

.cart-item-btn {
  width: 50rpx;
  height: 50rpx;
  line-height: 46rpx;
  text-align: center;
  font-size: 32rpx;
  color: #5DCDFF;
  border: 2rpx solid #5DCDFF;
  border-radius: 50%;
}

.cart-item-count {
  font-size: 28rpx;
  color: #333333;
  min-width: 60rpx;
  text-align: center;
}

/* 店铺小计 */
.cart-restaurant-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #FFFFFF;
  border-top: 1rpx solid #F0F0F0;
}

.cart-subtotal {
  display: flex;
  align-items: center;
}

.cart-subtotal-label {
  font-size: 26rpx;
  color: #666666;
}

.cart-subtotal-value {
  font-size: 32rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.cart-delivery-fee {
  font-size: 22rpx;
  color: #999999;
  margin-left: 10rpx;
}

.cart-checkout-btn {
  background: linear-gradient(135deg, #5DCDFF 0%, #4AA9FF 100%);
  color: #FFFFFF;
  font-size: 26rpx;
  padding: 16rpx 40rpx;
  border-radius: 30rpx;
}

.cart-checkout-btn.disabled {
  background: #CCCCCC;
}

/* 空购物车 */
.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.cart-empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.cart-empty-text {
  font-size: 32rpx;
  color: #666666;
  margin-bottom: 15rpx;
}

.cart-empty-hint {
  font-size: 26rpx;
  color: #999999;
}

/* 弹窗底部 */
.cart-modal-footer {
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #F0F0F0;
  background-color: #FFFFFF;
}

.cart-total-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-total-count {
  font-size: 26rpx;
  color: #666666;
}

.cart-total-amount {
  font-size: 32rpx;
  color: #FF6B6B;
  font-weight: bold;
}
</style>
