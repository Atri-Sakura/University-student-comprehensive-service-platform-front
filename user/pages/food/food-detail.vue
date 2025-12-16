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
      <!-- 横幅图片 -->
      <image class="restaurant-banner" :src="restaurant.image" mode="aspectFill"></image>

      <!-- 餐厅基本信息 -->
      <view class="restaurant-info-section">
        <!-- Logo和名称评分区域 -->
        <view class="restaurant-basic-info">
          <image class="restaurant-logo" :src="restaurant.image" mode="aspectFill"></image>
          <view class="restaurant-main-info">
            <text class="restaurant-name">{{ restaurant.name }}</text>
            <text class="restaurant-rating">⭐ {{ restaurant.rating }}</text>
          </view>
        </view>

        <!-- 营业状态、营业时间和经营范围 -->
        <view class="restaurant-status-row">
          <text class="business-status" :class="restaurant.businessStatus === 1 ? 'status-open' : 'status-closed'">
            {{ restaurant.businessStatus === 1 ? '营业中' : '已打烊' }}
          </text>
          <text class="business-hours">营业时间：{{ restaurant.businessHours }}</text>
        </view>
        <!-- 经营范围 -->
        <view class="restaurant-business-scope" v-if="restaurant.businessScope">
          <text class="scope-label">经营范围：</text>
          <text class="scope-content">{{ restaurant.businessScope }}</text>
        </view>

        <!-- 属性展示区域 -->
        <view class="restaurant-attributes">
          <view class="attribute-item">
            <text class="attribute-label">月售：</text>
            <text class="attribute-value">{{ restaurant.sales }}单</text>
          </view>

          <view class="attribute-item">
            <text class="attribute-label">起送价：</text>
            <text class="attribute-value">¥{{ restaurant.minOrder }}</text>
          </view>
          <view class="attribute-item">
            <text class="attribute-label">配送费：</text>
            <text class="attribute-value">¥{{ restaurant.deliveryFee }}</text>
          </view>
          <view class="attribute-item">
            <text class="attribute-label">配送范围：</text>
            <text class="attribute-value">{{ restaurant.deliveryRange }}km</text>
          </view>

        </view>
      </view>

      <!-- 餐厅标签 -->
      <view class="restaurant-tags">
        <view class="tag" v-for="tag in restaurant.tags" :key="tag">{{ tag }}</view>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input type="text" v-model="searchKeyword" placeholder="搜索菜品" @input="handleSearch" />
        <text class="search-clear" v-if="searchKeyword" @click="clearSearch">✕</text>
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
        <view v-for="category in foodCategories" :key="category.id" v-show="selectedFoodCategory === category.id || showAllFoods" class="category-section">
          <view class="category-title">{{ category.name }}</view>
          <view class="food-item" v-for="food in getFilteredFoodsByCategory(category.id)" :key="food.id" @click="viewGoodsDetail(food)">
            <image class="food-image" :src="food.image" mode="aspectFill"></image>
            <view class="food-info">
              <text class="food-name">{{ food.name }}</text>
              <text class="food-price">¥{{ food.price }}</text>
            </view>
            <!-- 将增减按钮和数量显示整合在一起 -->
            <view class="food-action" v-if="getCartItemCount(food.id) > 0">
              <text class="count-btn" @click.stop="decreaseCount(food)">-</text>
              <text class="count-text">{{ getCartItemCount(food.id) }}</text>
              <text class="count-btn" @click.stop="increaseCount(food)">+</text>
            </view>
            <view class="food-action" v-else @click.stop="increaseCount(food)">
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
          <view class="cart-modal-actions">
            <text class="cart-modal-clear" @click="clearCart">清空</text>
            <text class="cart-modal-close" @click="toggleCart">✕</text>
          </view>
        </view>
        <scroll-view scroll-y class="cart-items">
          <view class="cart-item" v-for="item in cartItems" :key="item.id">
            <image class="cart-item-image" :src="item.image" mode="aspectFill"></image>
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

    <!-- 商品详情弹窗 -->

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
      restaurant: {
        id: '',
        name: '加载中...',
        image: '',
        rating: 0,
        sales: 0,

        deliveryFee: 0,
        minOrder: 0,
        tags: [],
        businessHours: '',
        phone: '',
        address: ''
      },
      foodCategories: [],
      selectedFoodCategory: 1,
      showAllFoods: false,
      cartItems: [],
      showCart: false,

      // 模拟菜单数据
      allFoods: [],
      // 记录当前餐厅ID，用于购物车管理
      currentRestaurantId: null,
      // 搜索关键词
      searchKeyword: '',
      // 防抖定时器
      searchTimer: null,
      // 原始商品列表，用于搜索时恢复
      originalFoods: []
    };
  },
  computed: {
    totalCount() {
      // 只计算当前餐厅的商品数量
      return this.cartItems.filter(item => item.restaurantId === this.restaurant.id)
          .reduce((sum, item) => sum + item.count, 0);
    },
    totalAmount() {
      // 只计算当前餐厅的商品总价
      const currentItems = this.cartItems.filter(item => item.restaurantId === this.restaurant.id);
      const itemsTotal = currentItems.reduce((sum, item) => sum + item.price * item.count, 0);
      // 如果有商品，加上配送费
      const totalWithDelivery = currentItems.length > 0 ? itemsTotal + this.restaurant.deliveryFee : itemsTotal;
      return totalWithDelivery.toFixed(2);
    }
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;

    // 使用food.js中的API获取餐厅数据，同时传递selectedFoodId
    this.loadRestaurantData(options.restaurantId, options.selectedFoodId);
  },
  methods: {
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
    // 返回上一页
    navBack() {
      // 获取当前页面栈
      const pages = getCurrentPages();

      // 如果页面栈只有1页（刷新后的情况）或没有上一页，跳转到外卖列表
      if (pages.length <= 1) {
        uni.reLaunch({
          url: '/pages/food/food',
          fail: (err) => {
            console.error('跳转到外卖列表失败:', err);
            // 如果跳转外卖列表失败，跳转到首页
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }
        });
      } else {
        // 有上一页，正常返回
        uni.navigateBack({
          fail: (err) => {
            console.error('返回上一页失败:', err);
            // 如果返回失败，跳转到外卖列表
            uni.reLaunch({
              url: '/pages/food/food'
            });
          }
        });
      }
    },

    // 联系餐厅
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

    // 查看商品详情
    viewGoodsDetail(food) {
      // 跳转到商品详情页面，传递完整的商品信息
      uni.navigateTo({
        url: `/pages/food/goods-detail?goodsId=${food.merchantGoodsId || food.id}&restaurantId=${this.restaurant.id}&goodsInfo=${encodeURIComponent(JSON.stringify(food))}`
      });
    },

    // 关闭商品详情
    // 使用food.js中的API获取餐厅数据
    async loadRestaurantData(id, selectedFoodId) {

      // 验证商家ID是否有效
      if (!id || id === 'undefined' || id === 'null') {
        console.error('❌ 商家ID无效:', id);
        uni.showToast({
          title: '商家信息缺失，请重试',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      try {
        // 先获取商家详细信息
        const merchantRes = await foodApi.getMerchantDetail(id);
        // 验证API响应是否成功且包含有效数据
        if (!merchantRes || merchantRes.code !== 200 || !merchantRes.data) {
          console.error('❌ 商家详情API返回无效数据:', merchantRes);
          uni.showToast({
            title: '获取商家信息失败',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        // 再获取商品列表
        const goodsRes = await foodApi.getMerchantGoodsList(id);

        // 处理商家信息
        let merchantInfo = null;
        if (merchantRes && merchantRes.code === 200) {
          // 兼容不同的API返回结构：直接在data中、在data.rows中、或在rows中
          if (merchantRes.data && typeof merchantRes.data === 'object' && !Array.isArray(merchantRes.data)) {
            merchantInfo = merchantRes.data;
          } else if (merchantRes.data && Array.isArray(merchantRes.data.rows) && merchantRes.data.rows.length > 0) {
            merchantInfo = merchantRes.data.rows[0];
          } else if (Array.isArray(merchantRes.rows) && merchantRes.rows.length > 0) {
            merchantInfo = merchantRes.rows[0];
          } else if (Array.isArray(merchantRes.data) && merchantRes.data.length > 0) {
            merchantInfo = merchantRes.data[0];
          } else {
            console.warn('无法从API响应中提取商家信息');
          }
        } else {
          console.error('❌ 商家详情API调用失败');
          console.error('错误码:', merchantRes?.code);
          console.error('错误信息:', merchantRes?.message || merchantRes?.msg);

          // 显示友好的错误提示
          uni.showToast({
            title: merchantRes?.message || merchantRes?.msg || '获取商家信息失败',
            icon: 'none',
            duration: 2000
          });
        }

        // 处理商品列表
        let goodsList = [];
        if (goodsRes && goodsRes.code === 200) {
          // 兼容不同的API返回结构：直接在data中、在data.rows中、或在rows中
          if (Array.isArray(goodsRes.data)) {
            goodsList = goodsRes.data;
          } else if (goodsRes.data && Array.isArray(goodsRes.data.rows)) {
            goodsList = goodsRes.data.rows;
          } else if (Array.isArray(goodsRes.rows)) {
            goodsList = goodsRes.rows;
          }
        }

        // 计算商家月售（累加所有商品的销量）
        let totalSales = 0;
        if (goodsList && goodsList.length > 0) {
          totalSales = goodsList.reduce((sum, goods) => {
            // 支持多种销量字段名
            let goodsSales = 0;
            if (goods.salesCount !== undefined && goods.salesCount !== null) {
              goodsSales = Number(goods.salesCount) || 0;
            } else if (goods.sales_count !== undefined && goods.sales_count !== null) {
              goodsSales = Number(goods.sales_count) || 0;
            }
            return sum + goodsSales;
          }, 0);
        }
        // 如果商品销量为0，尝试使用商家本身的月售字段
        if (totalSales === 0) {
          totalSales = merchantInfo?.monthSales || merchantInfo?.salesCount || 0;
        }

        // 构建餐厅信息
        // 处理商家logo URL，使用getValidImageUrl方法确保URL有效性
        let logoUrl = this.getValidImageUrl(merchantInfo?.logo || merchantInfo?.image);

        this.restaurant = {
          // 优先使用商家详情接口返回的数据
          id: id || (merchantInfo?.merchantBaseId || merchantInfo?.id || 1),
          name: merchantInfo?.merchantName || merchantInfo?.name || '未知商家',
          image: logoUrl,
          rating: merchantInfo?.rating || merchantInfo?.avgRating || 4.5,
          sales: totalSales, // 使用计算出的总月售

          minOrder: merchantInfo?.minOrderAmount || merchantInfo?.minOrder || 20,
          deliveryFee: merchantInfo?.deliveryFee || merchantInfo?.shippingFee || 3,
          // 不再使用经营范围作为标签
          tags: merchantInfo?.tags ? merchantInfo.tags :
              ['暂无标签'],
          // 添加后端返回的其他商家字段
          businessHours: merchantInfo?.businessHours || '00:00-24:00',
          businessScope: merchantInfo?.businessScope || '',
          businessStatus: merchantInfo?.businessStatus || 0,
          deliveryRange: merchantInfo?.deliveryRange || 0,
          phone: merchantInfo?.phone || merchantInfo?.contactPhone || '',
          // 添加商家地址信息，确保订单创建时包含完整地址
          address: merchantInfo?.address || merchantInfo?.merchantAddress || '',
          addressInfo: merchantInfo?.addressInfo || merchantInfo?.address || '',
          // 结构化地址字段，兼容后端可能需要的格式
          province: merchantInfo?.province || '',
          city: merchantInfo?.city || '',
          district: merchantInfo?.district || '',
          detail: merchantInfo?.detail || ''
        };

        // 如果商家名称仍然是"未知商家"，给出警告
        if (this.restaurant.name === '未知商家') {
          console.error('⚠️⚠️⚠️ 商家名称为"未知商家"，可能是数据获取失败');
          console.error('请检查：1. 传入的商家ID是否正确 2. 后端商家数据是否存在 3. 商家是否已审核通过并营业中');
        }

        // 设置当前餐厅ID
        this.currentRestaurantId = this.restaurant.id;

        // 如果没有商品数据，使用默认值
        if (goodsList.length === 0) {
          this.foodCategories = [{ id: 1, name: '全部' }];
          this.allFoods = [];
          this.selectedFoodCategory = 1;
          this.loadCartData();
          return;
        }

        // 从商品列表中提取分类信息
        const categoryMap = new Map();
        goodsList.forEach(good => {
          if (good.category && !categoryMap.has(good.category)) {
            categoryMap.set(good.category, {
              id: categoryMap.size + 2, // 从2开始，避免与"全部"分类的id=1冲突
              name: good.category
            });
          }
        });

        // 添加"全部"分类
        this.foodCategories = [{ id: 1, name: '全部' }, ...Array.from(categoryMap.values())];

        // 处理所有商品，添加categoryId字段
        const processedFoods = goodsList.map(good => {
          // 查找或创建分类ID
          let categoryId = 1; // 默认"全部"分类
          if (good.category) {
            const category = Array.from(categoryMap.values()).find(cat => cat.name === good.category);
            if (category) {
              categoryId = category.id;
            }
          }

          // 使用merchantBaseId和merchantGoodsId组合生成唯一id，避免重复
          const uniqueId = good.merchantGoodsId ? `${good.merchantBaseId || id}-${good.merchantGoodsId}` : good.id || `${id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

          return {
            ...good,
            id: uniqueId,
            categoryId: categoryId,
            name: good.goodsName || good.name || '未命名商品',
            image: good.mainImageUrl || good.goodsImage || good.image || '/static/images/default-food.svg',
            price: good.price || 0,
            description: good.description || ''
          };
        });

        this.allFoods = processedFoods;
        this.originalFoods = processedFoods; // 保存原始商品列表
        this.selectedFoodCategory = this.foodCategories[0].id;

        // 从本地存储加载购物车数据
        this.loadCartData();

        // 如果有selectedFoodId参数，则自动选择并添加该商品到购物车
        if (selectedFoodId) {
          const selectedFood = this.allFoods.find(food => food.id === selectedFoodId || food.merchantGoodsId?.toString() === selectedFoodId);
          if (selectedFood) {
            // 选择对应分类
            this.selectedFoodCategory = selectedFood.categoryId;
            // 自动添加到购物车
            this.increaseCount(selectedFood);
            // 显示购物车
            this.showCart = true;
          }
        }
      } catch (error) {
        console.error('❌❌❌ 加载餐厅数据异常:', error);
        console.error('错误堆栈:', error.stack);

        // 显示错误提示
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none',
          duration: 2000
        });

        // 不使用任何模拟数据，只显示空状态
        this.restaurant = {
          name: '加载失败'
        };
        this.foodCategories = [];
        this.allFoods = [];
        this.originalFoods = [];
        this.selectedFoodCategory = null;
        this.currentRestaurantId = null;
        this.loadCartData();
      }
    },

    // 选择菜品分类
    selectFoodCategory(category) {
      this.selectedFoodCategory = category.id;
      this.showAllFoods = false;
    },

    // 根据分类获取菜品
    getFoodsByCategory(categoryId) {
      // 如果是"全部"分类（id=1），返回所有商品
      if (categoryId === 1) {
        return this.allFoods;
      }
      return this.allFoods.filter(food => food.categoryId === categoryId);
    },

    // 根据分类获取筛选后的菜品（考虑搜索关键词）
    getFilteredFoodsByCategory(categoryId) {
      const foods = this.getFoodsByCategory(categoryId);
      if (!this.searchKeyword) {
        return foods;
      }
      return foods.filter(food =>
          food.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
          (food.description && food.description.toLowerCase().includes(this.searchKeyword.toLowerCase()))
      );
    },

    // 处理搜索
    async handleSearch() {
      // 防抖处理，避免频繁调用API
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(async () => {
        if (!this.searchKeyword) {
          // 如果搜索关键词为空，恢复原始商品列表
          this.allFoods = [...this.originalFoods];
          return;
        }

        try {
          // 调用后端搜索接口，传递正确的keyword参数
          const searchResponse = await foodApi.searchMerchantGoods(this.restaurant.id, this.searchKeyword);

          if (searchResponse && searchResponse.code === 200 && searchResponse.data && Array.isArray(searchResponse.data)) {
            // 处理搜索结果
            const searchResults = searchResponse.data.map(good => {
              // 查找或创建分类ID
              let categoryId = 1; // 默认"全部"分类
              if (good.category) {
                const category = this.foodCategories.find(cat => cat.name === good.category);
                if (category) {
                  categoryId = category.id;
                }
              }

              // 使用merchantBaseId和merchantGoodsId组合生成唯一id，避免重复
              const uniqueId = good.merchantGoodsId ? `${good.merchantBaseId || this.restaurant.id}-${good.merchantGoodsId}` : good.id || `${this.restaurant.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

              return {
                ...good,
                id: uniqueId,
                categoryId: categoryId,
                name: good.goodsName || good.name || '未命名商品',
                image: good.mainImageUrl || good.goodsImage || good.image || '/static/images/default-food.svg',
                price: good.price || 0,
                description: good.description || ''
              };
            });

            this.allFoods = searchResults;
          }
        } catch (error) {
          console.error('搜索商品失败:', error);
          // 如果搜索失败，回退到前端搜索
          this.allFoods = [...this.originalFoods];
        }
      }, 500);
    },

    // 清空搜索
    clearSearch() {
      this.searchKeyword = '';
      this.allFoods = [...this.originalFoods];
    },

    // 获取购物车中商品数量
    getCartItemCount(foodId) {
      const item = this.cartItems.find(item => item.id === foodId && item.restaurantId === this.restaurant.id);
      return item ? item.count : 0;
    },

    // 加载购物车数据
    loadCartData() {
      const cartData = uni.getStorageSync('foodCart');
      if (cartData && cartData.items) {
        // 只加载当前餐厅的商品到显示列表
        this.cartItems = cartData.items.filter(item => item.restaurantId === this.restaurant.id);
      } else {
        this.cartItems = [];
      }
    },

    // 保存购物车数据
    saveCartData() {
      // 获取已保存的所有购物车数据
      const existingCartData = uni.getStorageSync('foodCart');
      let allItems = [];

      if (existingCartData && existingCartData.items) {
        // 保留其他餐厅的商品，移除当前餐厅的旧数据
        allItems = existingCartData.items.filter(item => item.restaurantId !== this.restaurant.id);
      }

      // 添加当前餐厅的商品
      allItems = [...allItems, ...this.cartItems];

      uni.setStorageSync('foodCart', {
        restaurant: this.restaurant,
        items: allItems,
        totalAmount: this.totalAmount,
        totalCount: this.totalCount
      });
    },

    // 清空购物车
    clearCart() {
      // 只清空当前餐厅的商品
      this.cartItems = this.cartItems.filter(item => item.restaurantId !== this.restaurant.id);
      this.saveCartData();
      this.showCart = false;
      uni.showToast({
        title: '购物车已清空',
        icon: 'success'
      });
    },

    // 增加商品数量
    increaseCount(food) {
      const existingItem = this.cartItems.find(item => item.id === food.id && item.restaurantId === this.restaurant.id);
      if (existingItem) {
        existingItem.count++;
      } else {
        this.cartItems.push({
          ...food,
          restaurantId: this.restaurant.id,
          restaurantName: this.restaurant.name,
          restaurantImage: this.restaurant.image,
          restaurantMinOrder: this.restaurant.minOrder,
          restaurantDeliveryFee: this.restaurant.deliveryFee,
          count: 1
        });
      }
      // 保存购物车数据
      this.saveCartData();
    },

    // 减少商品数量
    decreaseCount(food) {
      const index = this.cartItems.findIndex(item => item.id === food.id && item.restaurantId === this.restaurant.id);
      if (index !== -1) {
        if (this.cartItems[index].count > 1) {
          this.cartItems[index].count--;
        } else {
          this.cartItems.splice(index, 1);
        }
        // 保存购物车数据
        this.saveCartData();
      }
    },

    // 切换购物车显示
    toggleCart() {
      this.showCart = !this.showCart;
    },

    // 结算
    checkout() {
      // 只获取当前餐厅的商品
      const currentItems = this.cartItems.filter(item => item.restaurantId === this.restaurant.id);
      const itemsTotal = currentItems.reduce((sum, item) => sum + item.price * item.count, 0);

      if (itemsTotal < this.restaurant.minOrder) {
        uni.showToast({
          title: `还差¥${this.restaurant.minOrder - itemsTotal}起送`,
          icon: 'none'
        });
        return;
      }

      // 保存购物车数据到本地存储
      uni.setStorageSync('foodCart', {
        restaurant: this.restaurant,
        items: currentItems,
        totalAmount: itemsTotal + this.restaurant.deliveryFee,
        totalCount: currentItems.reduce((sum, item) => sum + item.count, 0)
      });

      // 跳转到订单确认页面
      uni.navigateTo({
        url: '/pages/food/order-confirm'
      });
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #F8F9FA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 导航栏 - 蓝色风格 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #5DCDFF 0%, #4AA9FF 100%);
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
  margin-top: calc(var(--status-bar-height, 0px) + 44px);
  background-color: #FFFFFF;
  margin-bottom: 0;
  box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.08);
  z-index: 5;
}

.restaurant-banner {
  width: 100%;
  height: 300rpx;
  object-fit: cover;
}

.restaurant-info-section {
  background-color: #FFFFFF;
  padding: 25rpx;
  border-bottom: none;
}

.restaurant-basic-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.restaurant-logo {
  width: 110rpx;
  height: 110rpx;
  border-radius: 12rpx;
  margin-right: 25rpx;
  object-fit: cover;
  border: 2rpx solid #F0F0F0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.restaurant-basic-info:hover .restaurant-logo {
  transform: scale(1.05);
  box-shadow: 0 6rpx 15rpx rgba(0, 0, 0, 0.15);
}

.restaurant-main-info {
  flex: 1;
}

.restaurant-name {
  font-size: 38rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 12rpx;
  display: block;
  line-height: 1.3;
}

.restaurant-rating {
  font-size: 30rpx;
  color: #FFB800;
  margin-bottom: 0;
  display: block;
}

.restaurant-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.business-status {
  font-size: 26rpx;
  font-weight: 600;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.status-open {
  color: #52C41A;
  background-color: #F6FFED;
  border: 1rpx solid #B7EB8F;
}

.status-closed {
  color: #FF4D4F;
  background-color: #FFF2F0;
  border: 1rpx solid #FFCCC7;
}

.business-hours {
  font-size: 24rpx;
  color: #666666;
}

.restaurant-business-scope {
  display: flex;
  align-items: center;
  margin-top: 15rpx;
  padding: 15rpx 25rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  border: 1rpx solid #F0F0F0;
}

.scope-label {
  color: #999999;
  font-size: 24rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.scope-content {
  color: #333333;
  font-size: 24rpx;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.restaurant-attributes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx 25rpx;
  margin-bottom: 20rpx;
}

.attribute-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  background-color: #FAFAFA;
  padding: 15rpx 20rpx;
  border-radius: 12rpx;
  border: 1rpx solid #F0F0F0;
  transition: all 0.3s ease;
}

.attribute-item:hover {
  background-color: #F0FCFF;
  border-color: #E6F7FF;
}

.attribute-label {
  color: #999999;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.attribute-value {
  color: #333333;
  font-weight: 600;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.restaurant-tags {
  display: flex;
  flex-wrap: wrap;
  padding: 0 25rpx 25rpx;
  gap: 12rpx;
}

.tag {
  font-size: 22rpx;
  color: #5DCDFF;
  background-color: #E6F7FF;
  padding: 8rpx 18rpx;
  border-radius: 20rpx;
  margin: 0;
  border: 1rpx solid #B3E5FC;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 6rpx rgba(93, 205, 255, 0.1);
}

.tag:hover {
  background-color: #5DCDFF;
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(93, 205, 255, 0.3);
}

/* 搜索栏 - 蓝色风格 */
.search-bar {
  background-color: #E6F7FF;
  padding: 15rpx 20rpx;
  margin-bottom: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.search-input {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 40rpx;
  padding: 18rpx 25rpx;
  position: relative;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(93, 205, 255, 0.3);
  transition: all 0.3s ease;
}

.search-input:active {
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.search-icon {
  font-size: 28rpx;
  color: #4AA9FF;
  margin-right: 15rpx;
}

.search-input input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  background-color: transparent;
  border: none;
  outline: none;
}

.search-clear {
  font-size: 24rpx;
  color: #4AA9FF;
  padding: 8rpx;
  background-color: rgba(74, 169, 255, 0.1);
  border-radius: 50%;
  margin-left: 10rpx;
  transition: all 0.3s ease;
}

.search-clear:hover {
  background-color: #e0e0e0;
  color: #666;
}

/* 内容区域 */
.content {
  display: flex;
  height: calc(100vh - var(--status-bar-height, 0px) - 44px - 300rpx - 300rpx);
  overflow: hidden;
}

/* 左侧分类列表 */
.food-category-list {
  width: 200rpx;
  background-color: #FFFFFF;
  flex-shrink: 0;
  box-shadow: 2rpx 0 10rpx rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.category-item {
  padding: 30rpx 20rpx;
  text-align: center;
  border-bottom: 1px solid #F0F0F0;
  transition: all 0.3s ease;
  background-color: #FFFFFF;
  position: relative;
  margin: 0;
}

.category-item:hover {
  background-color: #f0fcff;
}

.category-item.active {
  background-color: #F0FCFF;
  color: #4AA9FF;
  position: relative;
  box-shadow: 0 2rpx 8rpx rgba(93, 205, 255, 0.15);
}

.category-item.active::before {
  display: none;
}

.category-name {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
  transition: all 0.3s ease;
}

.category-item.active .category-name {
  color: #5DCDFF;
  font-weight: bold;
}

/* 菜品列表 */
.food-list {
  flex: 1;
  background-color: #F8F9FA;
  padding: 15rpx;
  overflow-y: auto;
  padding-bottom: 200rpx; /* 增加底部内边距，防止商品被底部栏挡住 */
}

.category-section {
  background-color: #FFFFFF;
  margin-bottom: 20rpx;
  border-radius: 15rpx;
  overflow: hidden;
  box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.category-section:hover {
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
}

.category-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
  margin: 0;
  padding: 20rpx 25rpx 15rpx;
  border-left: none;
  background-color: #FFFFFF;
  border-bottom: none;
  position: relative;
}

.category-title::after {
  content: '';
  position: absolute;
  left: 25rpx;
  bottom: 0;
  width: 40rpx;
  height: 4rpx;
  background-color: #5DCDFF;
  border-radius: 2rpx;
}

.food-item {
  display: flex;
  padding: 25rpx;
  border-bottom: none;
  transition: all 0.3s ease;
  margin: 0 20rpx;
  border-radius: 15rpx;
  margin-bottom: 15rpx;
  background-color: #FFFFFF;
  box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid #F0F0F0;
  /* 确保商品项内容顶部对齐，为多行商品名留出空间 */
  align-items: flex-start;
  /* 相对定位，用于子元素绝对定位 */
  position: relative;
}

.food-item:last-child {
  margin-bottom: 40rpx; /* 增加最后一个商品的底部外边距 */
}

.food-item:hover {
  background-color: #FFFFFF;
  transform: translateY(-2rpx);
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.12);
  border-color: #E6F7FF;
}

.food-image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 15rpx;
  margin-right: 25rpx;
  background-color: #F5F5F5;
  object-fit: cover;
  box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.food-item:hover .food-image {
  transform: scale(1.05);
  box-shadow: 0 5rpx 12rpx rgba(0, 0, 0, 0.15);
}

.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: relative;
  min-height: 120rpx;
  /* 确保商品信息区域固定宽度，不被加减器影响 */
  min-width: 0;
  /* 进一步减小右侧预留空间，让商品名称占据更多空间 */
  padding-right: 120rpx;
}

.food-name {
  font-size: 32rpx;
  color: #333333;
  margin-bottom: 10rpx;
  font-weight: 600;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.food-price {
  font-size: 34rpx;
  color: #FF6B6B;
  font-weight: bold;
  line-height: 1;
}

.food-action {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #E6F7FF;
  border-radius: 25rpx;
  /* 固定高度，调小尺寸 */
  height: 50rpx;
  background-color: #F0FCFF;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
  /* 绝对定位到右下角 */
  position: absolute;
  right: 25rpx;
  bottom: 25rpx;
  min-width: 80rpx;
  max-width: 120rpx;
}

.food-action:hover {
  border-color: #5DCDFF;
  box-shadow: 0 4rpx 12rpx rgba(93, 205, 255, 0.25);
  transform: scale(1.05);
}

.food-action:has(.add-btn) {
  width: 50rpx;
  height: 50rpx;
  background-color: #5DCDFF;
  border-color: #5DCDFF;
  min-width: 50rpx;
}

.food-action:has(.count-btn) {
  /* 保持固定宽度，优化宽度为商品名称腾出空间 */
  height: 50rpx;
  background-color: #F0FCFF;
  overflow: hidden;
  min-width: 120rpx;
  max-width: 120rpx;
}

.add-btn {
  font-size: 28rpx;
  color: #FFFFFF;
  transition: all 0.3s ease;
  font-weight: bold;
}

.add-btn:active {
  color: #FFFFFF;
  transform: scale(0.95);
}

.count-btn {
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #5DCDFF;
  transition: all 0.3s ease;
  font-weight: bold;
}

.count-btn:active {
  background-color: #5DCDFF;
  color: #FFFFFF;
  border-radius: 50%;
}

.count-text {
  min-width: 30rpx;
  padding: 0 10rpx;
  font-size: 24rpx;
  color: #333333;
  text-align: center;
  background-color: #FFFFFF;
  height: 50rpx;
  line-height: 50rpx;
  border-left: 1px solid #E6F7FF;
  border-right: 1px solid #E6F7FF;
  font-weight: 600;
}

/* 购物车悬浮窗 */
.cart-float {
  position: fixed;
  bottom: 90rpx;
  right: 50rpx;
  width: 110rpx;
  height: 110rpx;
  background-color: #FFFFFF;
  border-radius: 55rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5rpx 25rpx rgba(0, 0, 0, 0.15);
  z-index: 998;
  border: 3rpx solid #5DCDFF;
  transition: all 0.3s ease;
}

.cart-float:hover {
  transform: scale(1.1);
  box-shadow: 0 8rpx 30rpx rgba(93, 205, 255, 0.3);
}

.cart-float.active {
  background-color: #5DCDFF;
  border-color: #5DCDFF;
  transform: scale(1.1);
  box-shadow: 0 8rpx 30rpx rgba(93, 205, 255, 0.3);
}

.cart-icon {
  font-size: 48rpx;
  color: #5DCDFF;
  transition: all 0.3s ease;
}

.cart-float.active .cart-icon {
  color: #FFFFFF;
}

.cart-count {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  background-color: #FF6B6B;
  color: #FFFFFF;
  font-size: 26rpx;
  padding: 4rpx 18rpx;
  border-radius: 25rpx;
  min-width: 45rpx;
  text-align: center;
  box-shadow: 0 3rpx 8rpx rgba(0, 0, 0, 0.2);
  font-weight: bold;
}

.cart-float.active .cart-count {
  background-color: #FFFFFF;
  color: #5DCDFF;
  box-shadow: 0 3rpx 8rpx rgba(93, 205, 255, 0.3);
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
  padding: 25rpx 35rpx;
  box-shadow: 0 -5rpx 25rpx rgba(0, 0, 0, 0.1);
  z-index: 998;
  border-top: 1rpx solid #F0F0F0;
}

.cart-info {
  flex: 1;
}

.cart-total {
  font-size: 34rpx;
  font-weight: bold;
  color: #FF6B6B;
  margin-bottom: 5rpx;
  display: block;
}

.cart-extra {
  font-size: 26rpx;
  color: #FF9500;
}

.checkout-btn {
  width: 260rpx;
  height: 90rpx;
  background: linear-gradient(135deg, #5DCDFF 0%, #4AA9FF 100%);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(93, 205, 255, 0.35);
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: bold;
  transition: all 0.3s ease;
  border: none;
}

.checkout-btn:hover:not(.disabled) {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 25rpx rgba(93, 205, 255, 0.4);
}

.checkout-btn:active:not(.disabled) {
  transform: translateY(0);
}

.checkout-btn.disabled {
  background: #CCCCCC;
  box-shadow: none;
  color: #FFFFFF;
  cursor: not-allowed;
}

/* 购物车弹窗 */
.cart-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cart-modal-content {
  background-color: #FFFFFF;
  width: 100%;
  border-radius: 40rpx 40rpx 0 0;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8rpx 30rpx rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.cart-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 35rpx;
  border-bottom: 1px solid #F0F0F0;
  background-color: #FFFFFF;
  border-radius: 40rpx 40rpx 0 0;
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
  font-size: 30rpx;
  color: #FF6B6B;
  margin-right: 40rpx;
  transition: all 0.3s ease;
  font-weight: 500;
}

.cart-modal-clear:hover {
  color: #FF4D4F;
}

.cart-modal-close {
  font-size: 44rpx;
  color: #999999;
  transition: all 0.3s ease;
  padding: 5rpx;
  border-radius: 50%;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-modal-close:hover {
  background-color: #F0F0F0;
  color: #666666;
}

.cart-items {
  flex: 1;
  padding: 20rpx 35rpx;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid #F5F5F5;
  transition: all 0.3s ease;
}

.cart-item:hover {
  background-color: #FAFAFA;
  border-radius: 10rpx;
  margin: 0 -10rpx;
  padding: 20rpx 10rpx;
}

.cart-item-image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  background-color: #F8F9FA;
}

.cart-item-info {
  flex: 1;
  margin-right: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cart-item-name {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 8rpx;
  font-weight: 500;
  display: block;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.cart-item-price {
  font-size: 32rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.cart-item-count {
  display: flex;
  align-items: center;
  background-color: #F0F0F0;
  border-radius: 30rpx;
  padding: 5rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.cart-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 35rpx;
  border-top: 2rpx solid #F0F0F0;
  background-color: #FFFFFF;
}
</style>
