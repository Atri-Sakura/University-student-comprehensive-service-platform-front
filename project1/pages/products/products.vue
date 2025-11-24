<template>
  <view class="page-container">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input">
        <text class="search-icon">🔍</text>
        <input 
          type="text" 
          placeholder="搜索商品名称" 
          v-model="searchText"
          @input="onSearch"
          placeholder-style="color: #999;"
        />
      </view>
      <view class="test-btn" @click="testCurrentUser" style="margin-right: 5px; background: #4CAF50; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px;">
        <text class="test-text">测试用户</text>
      </view>
      <view class="relogin-btn" @click="forceRelogin" style="margin-right: 5px; background: #FF9800; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px;">
        <text class="relogin-text">重新登录</text>
      </view>
      <view class="fix-btn" @click="refreshMerchantInfo" style="margin-right: 10px; background: #ff6b6b; color: white; padding: 8px 12px; border-radius: 4px; font-size: 12px;">
        <text class="fix-text">修复ID</text>
      </view>
      <view class="add-btn" @click="addProduct">
        <text class="add-text">+ 添加</text>
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-tabs">
      <view 
        class="category-tab" 
        :class="{ active: currentCategory === index }"
        v-for="(category, index) in categories" 
        :key="index"
        @click="switchCategory(index)"
      >
        <text class="category-text">{{ category }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="content">
      <!-- 加载中 -->
      <view v-if="loading && products.length === 0" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 商品列表 -->
      <view class="product-item" v-for="(item, index) in filteredProducts" :key="item.id || index">
        <view class="product-image">
          <image v-if="item.image" :src="item.image" mode="aspectFill" lazy-load />
          <text v-else class="product-emoji">{{ item.emoji }}</text>
        </view>
        <view class="product-info">
          <text class="product-name">{{ item.name }}</text>
          <text class="product-desc">{{ item.description }}</text>
          <view class="product-footer">
            <text class="product-price">¥{{ item.price }}</text>
            <text class="product-stock">库存: {{ item.stock }}</text>
          </view>
        </view>
        <view class="product-actions">
          <view class="action-btn edit-btn" @click="editProduct(item)">
            <text class="action-text">编辑</text>
          </view>
          <view class="action-btn delete-btn" @click="deleteProduct(item)">
            <text class="action-text">删除</text>
          </view>
          <view class="switch-btn" @click="toggleStatus(item)">
            <view class="switch" :class="{ active: item.status }">
              <view class="switch-circle"></view>
            </view>
            <text class="switch-text">{{ item.status ? '上架' : '下架' }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="!showEmpty && hasMore && products.length > 0" class="load-more">
        <text class="load-more-text">{{ loadingMore ? '加载中...' : '上拉加载更多' }}</text>
      </view>

      <!-- 没有更多 -->
      <view v-if="!showEmpty && !hasMore && products.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="showEmpty" class="empty">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无商品</text>
        <view class="empty-btn" @click="addProduct">
          <text class="empty-btn-text">添加商品</text>
        </view>
      </view>
    </view>

    <!-- 编辑商品弹窗 -->
    <view class="edit-modal" v-if="showEditModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingProduct.id ? '编辑商品' : '添加商品' }}</text>
          <text class="modal-close" @click="closeModal">✕</text>
        </view>
        
        <view class="modal-body">
          <!-- 商品图片 -->
          <view class="form-item">
            <text class="form-label">商品图片</text>
            <view class="image-upload" @click="chooseImage">
              <image v-if="editingProduct.image" :src="editingProduct.image" class="upload-image" mode="aspectFill" />
              <view v-else class="upload-placeholder">
                <text class="upload-icon">📷</text>
                <text class="upload-text">点击上传图片</text>
              </view>
            </view>
          </view>

          <!-- 商品名称 -->
          <view class="form-item">
            <text class="form-label">商品名称</text>
            <input 
              class="form-input" 
              type="text" 
              :value="editingProduct.name"
              @input="editingProduct.name = $event.detail.value"
              placeholder="请输入商品名称"
              placeholder-style="color: #999;"
            />
          </view>

          <!-- 商品描述 -->
          <view class="form-item">
            <text class="form-label">商品描述</text>
            <textarea 
              class="form-textarea" 
              :value="editingProduct.description"
              @input="editingProduct.description = $event.detail.value"
              placeholder="请输入商品描述"
              placeholder-style="color: #999;"
              maxlength="200"
            />
          </view>

          <!-- 商品标签 -->
          <view class="form-item">
            <text class="form-label">商品标签</text>
            <view class="tags-select">
              <view 
                class="tag-option" 
                v-for="(tag, index) in availableTags" 
                :key="index"
                :class="{ selected: isTagSelected(tag.code) }"
                @click="toggleTag(tag)"
              >
                <text class="tag-option-text">{{ tag.name }}</text>
              </view>
            </view>
            <text class="tag-hint">已选择: {{ selectedTags.length }} 个标签</text>
          </view>

          <!-- 商品分类 -->
          <view class="form-item">
            <text class="form-label">商品分类</text>
            <view class="category-select">
              <view 
                class="category-option" 
                v-for="(cat, index) in categories.slice(1)" 
                :key="index"
                :class="{ selected: editingProduct.category === cat }"
                @click="selectCategory(cat)"
              >
                <text class="category-option-text">{{ cat }}</text>
              </view>
            </view>
          </view>

          <!-- 商品子分类 -->
          <view class="form-item" v-if="subCategories.length > 0">
            <text class="form-label">商品子分类</text>
            <view class="category-select">
              <view 
                class="category-option" 
                v-for="(subCat, index) in subCategories" 
                :key="index"
                :class="{ selected: editingProduct.subCategory === subCat }"
                @click="editingProduct.subCategory = subCat"
              >
                <text class="category-option-text">{{ subCat }}</text>
              </view>
            </view>
          </view>

          <!-- 价格和原价 -->
          <view class="form-row">
            <view class="form-item half">
              <text class="form-label">商品价格</text>
              <view class="price-input-wrapper">
                <text class="price-symbol">¥</text>
                <input 
                  class="form-input price-input" 
                  type="digit" 
                  :value="editingProduct.price"
                  @input="editingProduct.price = $event.detail.value"
                  placeholder="0.00"
                  placeholder-style="color: #999;"
                />
              </view>
            </view>
            <view class="form-item half">
              <text class="form-label">商品原价</text>
              <view class="price-input-wrapper">
                <text class="price-symbol">¥</text>
                <input 
                  class="form-input price-input" 
                  type="digit" 
                  :value="editingProduct.originalPrice"
                  @input="editingProduct.originalPrice = $event.detail.value"
                  placeholder="0.00"
                  placeholder-style="color: #999;"
                />
              </view>
            </view>
          </view>

          <!-- 库存 -->
          <view class="form-item">
            <text class="form-label">库存数量</text>
            <input 
              class="form-input" 
              type="number" 
              :value="editingProduct.stock"
              @input="editingProduct.stock = $event.detail.value"
              placeholder="0"
              placeholder-style="color: #999;"
            />
          </view>
        </view>

        <view class="modal-footer">
          <view class="modal-btn cancel-btn" @click="closeModal">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm-btn" @click="saveProduct">
            <text class="modal-btn-text">保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import goodsApi from '@/utils/goodsApi.js'

export default {
  name: 'ProductsPage',
  
  data() {
    return {
      // ===== 搜索和筛选 =====
      searchText: '',
      currentCategory: 0,
      categories: ['全部'], // 初始只有"全部"，其他分类从数据库动态加载
      subCategories: [], // 当前主分类下的子分类列表
      
      // 商品标签列表（中文名 → 英文编码）
      availableTags: [
        { name: '辣的', code: 'FOOD_SPICY' },
        { name: '快餐', code: 'FAST_FOOD' },
        { name: '面食', code: 'FOOD_NOODLE' },
        { name: '汤类', code: 'SOUP' },
        { name: '小吃', code: 'SNACK' },
        { name: '鸡肉', code: 'CHICKEN' },
        { name: '海鲜', code: 'SEAFOOD' },
        { name: '健康', code: 'HEALTH' },
        { name: '素食', code: 'VEGETARIAN' },
        { name: '沙拉', code: 'SALAD' },
        { name: '热销', code: 'HOT_SALE' },
        { name: '新品', code: 'NEW' },
        { name: '推荐', code: 'RECOMMEND' }
      ],
      selectedTags: [], // 当前选中的标签
      
      // ===== 商品列表 =====
      products: [],
      
      // ===== 分页 =====
      pageNum: 1,
      pageSize: 10,
      total: 0,
      hasMore: true,
      
      // ===== 编辑状态 =====
      showEditModal: false,
      editingProduct: {
        id: null,
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        stock: '',
        category: '中餐',
        subCategory: '',
        image: '',
        emoji: '🍔',
        status: true,
        tagCodes: ''
      },
      editingIndex: -1,
      
      // ===== 加载状态 =====
      loading: false,
      refreshing: false,
      loadingMore: false
    }
  },
  computed: {
    // 过滤后的商品列表
    filteredProducts() {
      let products = this.products;
      
      // 按分类筛选
      if (this.currentCategory !== 0) {
        const categoryName = this.categories[this.currentCategory];
        products = products.filter(p => p.category === categoryName);
      }
      
      // 按搜索文本筛选
      if (this.searchText) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(this.searchText.toLowerCase())
        );
      }
      
      return products;
    },
    
    // 是否显示空状态
    showEmpty() {
      return !this.loading && this.filteredProducts.length === 0;
    },
    
    // 是否是添加模式
    isAddMode() {
      return !this.editingProduct.id;
    }
  },
  
  // 页面生命周期
  async onLoad() {
    // 🔥 检测到数据失真，强制重新获取商家信息
    const merchantInfo = uni.getStorageSync('merchantInfo') || {};
    const currentMerchantBaseId = String(merchantInfo.merchantBaseId || merchantInfo.id || merchantInfo.merchantId || '');
    
    // 检查是否是失真的ID（以000结尾）
    if (currentMerchantBaseId.endsWith('000')) {
      console.warn('⚠️ 检测到商家ID精度丢失，将从商品列表中获取正确ID...');
      // 先使用失真的ID加载商品列表，然后从返回的商品数据中获取正确的ID
    }
    
    const merchantBaseId = currentMerchantBaseId;
    
    console.log('🔍 商品页面初始化 - 商家信息详细分析:', {
      merchantInfo_full: merchantInfo,
      merchantBaseId_from_storage: merchantInfo.merchantBaseId,
      merchantBaseId_type: typeof merchantInfo.merchantBaseId,
      merchantBaseId_json: JSON.stringify(merchantInfo.merchantBaseId),
      id_from_storage: merchantInfo.id,
      id_type: typeof merchantInfo.id,
      id_json: JSON.stringify(merchantInfo.id),
      merchantId_from_storage: merchantInfo.merchantId,
      merchantId_type: typeof merchantInfo.merchantId,
      finalMerchantBaseId: merchantBaseId,
      finalMerchantBaseId_type: typeof merchantBaseId,
      finalMerchantBaseId_length: merchantBaseId.length,
      // 检查是否有精度丢失
      precision_check: {
        merchantBaseId_equals_string: merchantInfo.merchantBaseId === String(merchantInfo.merchantBaseId),
        id_equals_string: merchantInfo.id === String(merchantInfo.id),
        merchantId_equals_string: merchantInfo.merchantId === String(merchantInfo.merchantId)
      }
    });
    
    if (!merchantBaseId) {
      console.error('❌ 商家ID不存在，无法加载商品');
      uni.showToast({
        title: '商家信息异常，请重新登录',
        icon: 'none'
      });
      return;
    }
    
    // 数据完整性检查
    this.performDataIntegrityCheck();
    
    // 先尝试加载分类，如果失败则从商品列表中提取
    await this.loadCategories();
    // 加载商品列表（如果分类加载失败，会从商品列表中提取分类）
    await this.loadGoodsList(true);
    // 如果分类列表还是只有"全部"，尝试从商品列表中提取
    if (this.categories.length === 1) {
      this.extractCategoriesFromProducts();
    }
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.onRefresh().then(() => {
      uni.stopPullDownRefresh();
    });
  },
  
  // 上拉加载
  onReachBottom() {
    this.onLoadMore();
  },
  methods: {
    // ===== 数据完整性检查 =====
    
    /**
     * 执行数据完整性检查
     */
    performDataIntegrityCheck() {
      const merchantInfo = uni.getStorageSync('merchantInfo') || {};
      const token = uni.getStorageSync('token');
      
      // 解析JWT token
      let tokenPayload = null;
      if (token) {
        try {
          const payloadPart = token.split('.')[1];
          if (payloadPart) {
            const decodedPayload = atob(payloadPart);
            tokenPayload = JSON.parse(decodedPayload);
          }
        } catch (e) {
          console.warn('⚠️ JWT token解析失败:', e);
        }
      }
      
      console.log('🔍 数据完整性检查报告:', {
        // 本地存储数据
        localStorage: {
          merchantBaseId: merchantInfo.merchantBaseId,
          merchantBaseId_type: typeof merchantInfo.merchantBaseId,
          merchantBaseId_string: String(merchantInfo.merchantBaseId),
          id: merchantInfo.id,
          id_type: typeof merchantInfo.id,
          id_string: String(merchantInfo.id),
          merchantId: merchantInfo.merchantId,
          merchantId_type: typeof merchantInfo.merchantId
        },
        // JWT token数据
        jwtToken: tokenPayload ? {
          merchantBaseId: tokenPayload.merchantBaseId,
          merchantBaseId_type: typeof tokenPayload.merchantBaseId,
          merchantBaseId_string: String(tokenPayload.merchantBaseId),
          id: tokenPayload.id,
          id_type: typeof tokenPayload.id,
          userId: tokenPayload.userId,
          sub: tokenPayload.sub
        } : null,
        // 数据一致性检查
        consistency: tokenPayload ? {
          merchantBaseId_match: String(merchantInfo.merchantBaseId) === String(tokenPayload.merchantBaseId),
          id_match: String(merchantInfo.id) === String(tokenPayload.id),
          any_match: [
            String(merchantInfo.merchantBaseId) === String(tokenPayload.merchantBaseId),
            String(merchantInfo.merchantBaseId) === String(tokenPayload.id),
            String(merchantInfo.id) === String(tokenPayload.merchantBaseId),
            String(merchantInfo.id) === String(tokenPayload.id)
          ].some(match => match)
        } : null,
        // 精度丢失检查
        precisionLoss: {
          merchantBaseId_precision_lost: merchantInfo.merchantBaseId !== String(merchantInfo.merchantBaseId),
          id_precision_lost: merchantInfo.id !== String(merchantInfo.id),
          token_merchantBaseId_precision_lost: tokenPayload ? tokenPayload.merchantBaseId !== String(tokenPayload.merchantBaseId) : null,
          token_id_precision_lost: tokenPayload ? tokenPayload.id !== String(tokenPayload.id) : null
        }
      });
    },
    
    /**
     * 重新获取商家信息（修复精度丢失）
     */
    async refreshMerchantInfo() {
      try {
        const token = uni.getStorageSync('token');
        if (!token) {
          console.error('❌ 没有token，无法重新获取商家信息');
          return;
        }
        
        console.log('🔄 重新获取商家信息...');
        
        const response = await fetch('http://localhost:8080/getInfo', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        console.log('🔍 重新获取的商家信息响应:', result);
        
        if (result.code === 200 && result.user) {
          // 使用相同的精度修复逻辑
          const responseText = JSON.stringify(result);
          
          const extractIdFromResponse = (fieldName) => {
            const regex = new RegExp(`"${fieldName}":\\s*(\\d+)`);
            const match = responseText.match(regex);
            return match ? match[1] : null;
          };
          
          const realMerchantBaseId = extractIdFromResponse('merchantBaseId') 
            || extractIdFromResponse('merchant_base_id')
            || extractIdFromResponse('merchantId')
            || extractIdFromResponse('merchant_id')
            || extractIdFromResponse('id')
            || extractIdFromResponse('userId')
            || extractIdFromResponse('user_id');
          
          console.log('🔍 重新提取的真实ID:', {
            merchantBaseId_from_regex: extractIdFromResponse('merchantBaseId'),
            id_from_regex: extractIdFromResponse('id'),
            finalRealId: realMerchantBaseId
          });
          
          const merchantInfo = {
            merchantBaseId: realMerchantBaseId || '',
            id: realMerchantBaseId || '',
            merchantId: realMerchantBaseId || '',
            merchantName: result.user.merchantName || result.user.userName || result.user.nickName,
            phonenumber: result.user.phonenumber || result.user.phone,
            email: result.user.email,
            avatar: result.user.avatar,
            ...result.user
          };
          
          uni.setStorageSync('merchantInfo', merchantInfo);
          console.log('✅ 商家信息已更新:', merchantInfo);
          
          uni.showToast({
            title: '商家信息已更新',
            icon: 'success'
          });
        }
      } catch (error) {
        console.error('❌ 重新获取商家信息失败:', error);
      }
    },
    
    /**
     * 测试当前用户信息
     */
    async testCurrentUser() {
      try {
        console.log('🔍 开始测试当前用户信息...');
        const result = await goodsApi.testCurrentUser();
        
        // 解析JWT Token进行对比
        const token = uni.getStorageSync('token');
        let tokenInfo = 'Token解析失败';
        if (token) {
          try {
            const payloadPart = token.split('.')[1];
            if (payloadPart) {
              const decodedPayload = atob(payloadPart);
              const tokenPayload = JSON.parse(decodedPayload);
              tokenInfo = `Token中的用户ID: ${tokenPayload.id || tokenPayload.sub || tokenPayload.userId || 'null'}\nToken中的商家ID: ${tokenPayload.merchantBaseId || tokenPayload.merchantId || 'null'}`;
            }
          } catch (e) {
            tokenInfo = 'Token解析出错: ' + e.message;
          }
        }
        
        uni.showModal({
          title: '用户信息对比',
          content: `API返回:\n用户ID: ${result.data?.user?.id || 'null'}\n商家ID: ${result.data?.user?.merchantBaseId || 'null'}\n\n${tokenInfo}`,
          showCancel: false
        });
      } catch (error) {
        console.error('❌ 测试用户信息失败:', error);
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    },
    
    /**
     * 强制重新登录
     */
    forceRelogin() {
      uni.showModal({
        title: '重新登录',
        content: '检测到Token可能已过期，是否重新登录？',
        success: (res) => {
          if (res.confirm) {
            // 清除所有登录信息
            uni.removeStorageSync('token');
            uni.removeStorageSync('merchantInfo');
            uni.removeStorageSync('userType');
            uni.removeStorageSync('identity');
            uni.removeStorageSync('identityKey');
            
            // 跳转到登录页面
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }
        }
      });
    },
    
    // ===== 数据加载 =====
    
    /**
     * 加载商品列表
     * @param {Boolean} isRefresh - 是否刷新（重置页码）
     */
    async loadGoodsList(isRefresh = false) {
      // 刷新时重置页码
      if (isRefresh) {
        this.pageNum = 1;
        this.products = [];
      }
      
      // 防止重复加载
      if (this.loading) return;
      
      this.loading = true;
      
      try {
        const res = await goodsApi.getGoodsList({
          pageNum: this.pageNum,
          pageSize: this.pageSize
        });
        
        if (res.code === 200) {
          // 🔥 精度丢失修复：从商品数据中获取正确的商家ID
          if (res.rows && res.rows.length > 0 && res.rows[0].merchantBaseId) {
            const correctMerchantBaseId = String(res.rows[0].merchantBaseId);
            const currentMerchantInfo = uni.getStorageSync('merchantInfo') || {};
            const currentMerchantBaseId = String(currentMerchantInfo.merchantBaseId || '');
            
            // 如果当前ID以000结尾且与商品数据中的ID不同，则更新
            if (currentMerchantBaseId.endsWith('000') && currentMerchantBaseId !== correctMerchantBaseId) {
              console.log('🔧 修复商家ID精度丢失:', {
                错误的ID: currentMerchantBaseId,
                正确的ID: correctMerchantBaseId
              });
              
              // 更新本地存储中的商家信息
              const updatedMerchantInfo = {
                ...currentMerchantInfo,
                merchantBaseId: correctMerchantBaseId,
                id: correctMerchantBaseId,
                merchantId: correctMerchantBaseId
              };
              
              uni.setStorageSync('merchantInfo', updatedMerchantInfo);
              
              uni.showToast({
                title: '商家ID已自动修复',
                icon: 'success'
              });
            }
          }
          
          // 数据转换
          const newProducts = res.rows.map(item => this.mapBackendToFrontend(item));
          
          // 刷新或追加
          if (isRefresh) {
            this.products = newProducts;
          } else {
            this.products.push(...newProducts);
          }
          
          // 更新分页信息
          this.total = res.total || 0;
          this.hasMore = this.products.length < this.total;
          
          // 如果分类列表只有"全部"，从商品列表中提取分类
          if (this.categories.length === 1 && this.products.length > 0) {
            this.extractCategoriesFromProducts();
          }
        } else {
          this.handleError(res, '加载商品列表失败');
        }
      } catch (error) {
        this.handleError(error, '加载商品列表失败');
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 下拉刷新
     */
    async onRefresh() {
      this.refreshing = true;
      await this.loadGoodsList(true);
      this.refreshing = false;
    },
    
    /**
     * 上拉加载更多
     */
    async onLoadMore() {
      if (!this.hasMore || this.loading || this.loadingMore) return;
      
      this.loadingMore = true;
      this.pageNum++;
      await this.loadGoodsList(false);
      this.loadingMore = false;
    },
    
    // ===== 搜索和筛选 =====
    
    /**
     * 搜索输入处理
     */
    onSearch() {
      // 搜索逻辑已在计算属性中处理
      // 可在此处添加防抖优化或调用后端搜索接口
    },
    
    /**
     * 切换分类
     */
    switchCategory(index) {
      this.currentCategory = index;
    },
    
    /**
     * 选择商品分类（在编辑弹窗中）
     * @param {String} category - 分类名称
     */
    async selectCategory(category) {
      // 更新选中的分类
      this.editingProduct.category = category;
      
      // 清空之前选择的子分类
      this.editingProduct.subCategory = '';
      
      // 先清空子分类列表
      this.subCategories = [];
      
      // 加载该分类下的子分类
      await this.loadSubCategories(category);
    },
    
    /**
     * 加载所有分类（从数据库）
     */
    async loadCategories() {
      try {
        const res = await goodsApi.getCategories();
        
        // 检查返回结果
        if (!res) {
          return false;
        }
        
        // 如果返回的code不是200，说明接口不存在或失败
        if (res.code !== 200) {
          return false;
        }
        
        // 处理返回的分类数据
        let categoryList = [];
        
        if (res.data) {
          // 如果返回的是数组
          if (Array.isArray(res.data)) {
            // 检查数组元素是字符串还是对象
            categoryList = res.data.map(item => {
              if (typeof item === 'string') {
                return item;
              } else if (typeof item === 'object' && item !== null) {
                // 尝试多种可能的字段名
                return item.name || item.categoryName || item.category || item.categoryName || item.value || '';
              }
              return String(item || '');
            }).filter(cat => cat && cat !== '全部');
          } 
          // 如果返回的是对象，尝试提取分类列表
          else if (res.data.categories || res.data.list) {
            const dataList = res.data.categories || res.data.list || [];
            categoryList = dataList.map(item => {
              if (typeof item === 'string') {
                return item;
              } else if (typeof item === 'object' && item !== null) {
                return item.name || item.categoryName || item.category || item.value || '';
              }
              return String(item || '');
            }).filter(cat => cat && cat !== '全部');
          }
          // 如果返回的是对象，尝试从对象中提取分类名称
          else if (typeof res.data === 'object') {
            categoryList = Object.keys(res.data).map(key => {
              const item = res.data[key];
              if (typeof item === 'object' && item !== null) {
                return item.name || item.categoryName || item.category || key;
              } else if (typeof item === 'string') {
                return item;
              }
              return key;
            }).filter(cat => cat && cat !== '全部');
          }
        }
        
        // 确保分类列表不为空，且去重
        categoryList = [...new Set(categoryList.filter(cat => cat && cat.trim() !== ''))];
        
        if (categoryList.length > 0) {
          // 更新分类列表，保留"全部"在第一位
          this.categories = ['全部', ...categoryList];
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    },
    
    /**
     * 从商品列表中提取分类（备用方案）
     */
    extractCategoriesFromProducts() {
      if (!this.products || this.products.length === 0) {
        return;
      }
      
      // 从商品列表中提取所有唯一的分类
      const categorySet = new Set();
      
      this.products.forEach(product => {
        if (product.category && product.category.trim() !== '' && product.category !== '全部') {
          categorySet.add(product.category);
        }
      });
      
      // 转换为数组并排序
      const categoryList = Array.from(categorySet).sort();
      
      if (categoryList.length > 0) {
        this.categories = ['全部', ...categoryList];
      }
    },
    
    /**
     * 加载子分类列表（从数据库或商品列表）
     * @param {String} category - 主分类名称
     */
    async loadSubCategories(category) {
      if (!category || category === '全部') {
        this.subCategories = [];
        return;
      }
      
      try {
        const res = await goodsApi.getSubCategories(category);
        
        // 如果接口返回成功
        if (res && res.code === 200 && res.data) {
          // 处理返回的子分类数据
          let subCategoryList = [];
          
          // 如果返回的是数组
          if (Array.isArray(res.data)) {
            subCategoryList = res.data.map(item => {
              if (typeof item === 'string') {
                return item;
              } else if (typeof item === 'object' && item !== null) {
                return item.name || item.subCategoryName || item.subCategory || item.value || '';
              }
              return String(item || '');
            }).filter(subCat => subCat && subCat.trim() !== '');
          } 
          // 如果返回的是对象，尝试提取子分类列表
          else if (res.data.subCategories || res.data.list) {
            const dataList = res.data.subCategories || res.data.list || [];
            subCategoryList = dataList.map(item => {
              if (typeof item === 'string') {
                return item;
              } else if (typeof item === 'object' && item !== null) {
                return item.name || item.subCategoryName || item.subCategory || item.value || '';
              }
              return String(item || '');
            }).filter(subCat => subCat && subCat.trim() !== '');
          }
          // 如果返回的是对象，尝试从对象中提取子分类名称
          else if (typeof res.data === 'object') {
            subCategoryList = Object.keys(res.data).map(key => {
              const item = res.data[key];
              if (typeof item === 'object' && item !== null) {
                return item.name || item.subCategoryName || item.subCategory || key;
              } else if (typeof item === 'string') {
                return item;
              }
              return key;
            }).filter(subCat => subCat && subCat.trim() !== '');
          }
          
          // 确保子分类列表不为空，且去重
          this.subCategories = [...new Set(subCategoryList)];
          return;
        }
        
        // 如果接口失败，从所有商品中提取该分类的子分类
        await this.extractSubCategoriesFromAllProducts(category);
        
      } catch (error) {
        // 从所有商品中提取子分类
        await this.extractSubCategoriesFromAllProducts(category);
      }
    },
    
    /**
     * 从所有商品中提取指定分类的子分类（加载该分类下的所有商品）
     * @param {String} category - 主分类名称
     */
    async extractSubCategoriesFromAllProducts(category) {
      try {
        // 先尝试加载该分类下的所有商品（如果接口支持按分类筛选）
        let allProducts = [];
        let hasMore = true;
        let pageNum = 1;
        const pageSize = 100; // 每页100条
        
        // 尝试加载多页数据，直到获取完所有该分类的商品
        while (hasMore && pageNum <= 10) { // 最多加载10页，避免无限循环
          const res = await goodsApi.getGoodsList({
            pageNum: pageNum,
            pageSize: pageSize,
            category: category // 如果接口支持按分类筛选
          });
          
          if (res.code === 200 && res.rows && res.rows.length > 0) {
            const products = res.rows.map(item => this.mapBackendToFrontend(item));
            
            // 如果接口不支持按分类筛选，需要手动过滤
            if (category && category !== '全部') {
              const filteredProducts = products.filter(p => p.category === category);
              allProducts.push(...filteredProducts);
            } else {
              allProducts.push(...products);
            }
            
            // 检查是否还有更多数据
            hasMore = products.length === pageSize && allProducts.length < (res.total || 0);
            pageNum++;
          } else {
            hasMore = false;
          }
        }
        
        // 如果还是没有获取到商品，使用当前已加载的商品列表
        if (allProducts.length === 0) {
          allProducts = this.products || [];
        }
        
        // 从商品列表中提取该分类下的所有唯一子分类
        const subCategorySet = new Set();
        
        allProducts.forEach(product => {
          // 检查主分类是否匹配
          if (product.category === category) {
            // 检查子分类是否存在且不为空
            if (product.subCategory) {
              const subCat = String(product.subCategory).trim();
              if (subCat !== '' && subCat !== 'null' && subCat !== 'undefined') {
                subCategorySet.add(subCat);
              }
            }
          }
        });
        
        // 转换为数组并排序
        const subCategoryList = Array.from(subCategorySet).sort();
        
        this.subCategories = subCategoryList;
        
        if (subCategoryList.length === 0) {
          // 如果还是没有，尝试从当前商品列表中提取
          this.extractSubCategoriesFromProducts(category);
        }
        
      } catch (error) {
        // 失败时，使用当前商品列表
        this.extractSubCategoriesFromProducts(category);
      }
    },
    
    /**
     * 从商品列表中提取子分类（备用方案）
     * @param {String} category - 主分类名称
     */
    extractSubCategoriesFromProducts(category) {
      if (!this.products || this.products.length === 0) {
        this.subCategories = [];
        return;
      }
      
      // 从商品列表中提取该分类下的所有唯一子分类
      const subCategorySet = new Set();
      
      this.products.forEach(product => {
        // 检查主分类是否匹配
        if (product.category === category) {
          // 检查子分类是否存在且不为空
          if (product.subCategory) {
            const subCat = String(product.subCategory).trim();
            if (subCat !== '' && subCat !== 'null' && subCat !== 'undefined') {
              subCategorySet.add(subCat);
            }
          }
        }
      });
      
      // 转换为数组并排序
      const subCategoryList = Array.from(subCategorySet).sort();
      
      this.subCategories = subCategoryList;
    },
    
    // ===== 添加商品 =====
    
    /**
     * 打开添加商品弹窗
     */
    addProduct() {
      this.editingProduct = this.getEmptyProduct();
      this.editingIndex = -1;
      this.selectedTags = []; // 清空选中的标签
      this.showEditModal = true;
    },
    
    // ===== 编辑商品 =====
    
    /**
     * 编辑商品
     * @param {Object} item - 商品对象
     */
    async editProduct(item) {
      // 可选：调用详情接口获取完整数据
      // try {
      //   const res = await goodsApi.getGoodsDetail(item.id);
      //   if (res.code === 200) {
      //     this.editingProduct = this.mapBackendToFrontend(res.data);
      //   }
      // } catch (error) {
      //   this.handleError(error, '获取商品详情失败');
      //   return;
      // }
      
      // 直接使用列表数据
      this.editingIndex = this.products.findIndex(p => p.id === item.id);
      this.editingProduct = { ...item };
      this.showEditModal = true;
      
      // 如果商品有分类，加载对应的子分类
      if (this.editingProduct.category) {
        await this.loadSubCategories(this.editingProduct.category);
      }
      
      // 初始化选中的标签
      this.initSelectedTags(this.editingProduct.tagCodes);
    },
    
    /**
     * 保存商品（添加或编辑）
     */
    async saveProduct() {
      // 验证表单
      if (!this.validateProduct()) {
        return;
      }
      
      try {
        // 转换数据格式
        const data = this.mapFrontendToBackend(this.editingProduct);
        
        if (this.isAddMode) {
          // 添加商品
          const res = await goodsApi.addGoods(data);
          if (res.code === 200) {
            const goodsId = res.data?.id || res.data?.goodsId;
            
            // 如果有图片，添加到商品图片关联表
            if (this.editingProduct.image && goodsId) {
              try {
                console.log('🖼️ 添加商品图片关联:', { goodsId, imageUrl: this.editingProduct.image });
                await goodsApi.addGoodsImage(goodsId, this.editingProduct.image);
                console.log('✅ 商品图片关联添加成功');
              } catch (imageError) {
                console.warn('⚠️ 商品图片关联失败:', imageError);
                // 图片关联失败不影响商品添加成功的提示
              }
            }
            
            uni.showToast({ 
              title: '添加成功', 
              icon: 'success' 
            });
            this.closeModal();
            this.onRefresh(); // 刷新列表
          } else {
            this.handleError(res, '添加失败');
          }
        } else {
          // 修改商品
          const res = await goodsApi.updateGoods(this.editingProduct.id, data);
          if (res.code === 200) {
            // 如果有图片且商品ID存在，更新商品图片关联
            if (this.editingProduct.image && this.editingProduct.id) {
              try {
                console.log('🖼️ 更新商品图片关联:', { goodsId: this.editingProduct.id, imageUrl: this.editingProduct.image });
                await goodsApi.addGoodsImage(this.editingProduct.id, this.editingProduct.image);
                console.log('✅ 商品图片关联更新成功');
              } catch (imageError) {
                console.warn('⚠️ 商品图片关联失败:', imageError);
                // 图片关联失败不影响商品修改成功的提示
              }
            }
            
            uni.showToast({ 
              title: '修改成功', 
              icon: 'success' 
            });
            this.closeModal();
            this.onRefresh(); // 刷新列表
          } else {
            this.handleError(res, '修改失败');
          }
        }
      } catch (error) {
        this.handleError(error, '保存失败');
      }
    },
    
    // ===== 删除商品 =====
    
    /**
     * 删除商品
     * @param {Object} item - 商品对象
     */
    deleteProduct(item) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除"${item.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const result = await goodsApi.deleteGoods(item.id);
              if (result.code === 200) {
                uni.showToast({ 
                  title: '删除成功', 
                  icon: 'success' 
                });
                this.onRefresh(); // 刷新列表
              } else {
                this.handleError(result, '删除失败');
              }
            } catch (error) {
              this.handleError(error, '删除失败');
            }
          }
        }
      });
    },
    
    // ===== 上下架 =====
    
    /**
     * 切换商品上下架状态
     * @param {Object} item - 商品对象
     */
    async toggleStatus(item) {
      const newStatus = !item.status;
      const api = newStatus ? goodsApi.upGoods : goodsApi.downGoods;
      
      try {
        const res = await api(item.id);
        if (res.code === 200) {
          uni.showToast({
            title: newStatus ? '商品已上架' : '商品已下架',
            icon: 'success'
          });
          // 刷新列表，确保数据与后端一致
          this.onRefresh();
        } else {
          this.handleError(res, '操作失败');
        }
      } catch (error) {
        this.handleError(error, '操作失败');
      }
    },
    
    // ===== 标签处理 =====
    
    /**
     * 判断标签是否被选中
     * @param {String} code - 标签编码
     */
    isTagSelected(code) {
      return this.selectedTags.includes(code);
    },
    
    /**
     * 切换标签选中状态
     * @param {Object} tag - 标签对象 {name, code}
     */
    toggleTag(tag) {
      const index = this.selectedTags.indexOf(tag.code);
      if (index > -1) {
        // 已选中，取消选择
        this.selectedTags.splice(index, 1);
      } else {
        // 未选中，添加选择
        this.selectedTags.push(tag.code);
      }
    },
    
    /**
     * 初始化选中的标签（从 tagCodes 字符串）
     * @param {String} tagCodes - 标签编码字符串（如："FOOD_SPICY,FAST_FOOD"）
     */
    initSelectedTags(tagCodes) {
      if (!tagCodes) {
        this.selectedTags = [];
        return;
      }
      
      // 将字符串分割为数组
      this.selectedTags = tagCodes.split(',').filter(code => code.trim());
    },
    
    /**
     * 获取标签编码字符串（逗号分隔）
     * @returns {String} 如："FOOD_SPICY,FAST_FOOD"
     */
    getTagCodesString() {
      return this.selectedTags.join(',');
    },
    
    // ===== 图片处理 =====
    
    /**
     * 选择图片
     */
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          
          // 立即显示本地图片预览
          this.editingProduct.image = tempFilePath;
          
          // 上传图片到服务器
          uni.showLoading({ title: '上传中...' });
          
          try {
            const imageUrl = await this.uploadImage(tempFilePath);
            
            // 上传成功，使用服务器返回的URL
            this.editingProduct.image = imageUrl;
            
            uni.hideLoading();
            uni.showToast({ 
              title: '图片上传成功', 
              icon: 'success' 
            });
            
            // ⚠️ 临时方案：因后端 addImage 接口有bug，暂时跳过单独调用
            // 图片URL已保存在 editingProduct.image 中
            // 在点击"保存"按钮时会一起提交到后端
            
            if (this.editingProduct.id) {
              // 提示用户需要点击保存
              uni.showToast({
                title: '请点击"保存"按钮保存图片',
                icon: 'none',
                duration: 2000
              });
            }
          } catch (error) {
            uni.hideLoading();
            this.editingProduct.image = '';
            
            this.handleError(error, '图片上传失败');
          }
        },
        fail: () => {
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    
    /**
     * 上传图片到服务器
     * @param {String} filePath - 本地图片路径
     * @returns {Promise<String>} 服务器图片URL
     */
    uploadImage(filePath) {
      return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');
        const uploadUrl = 'http://localhost:8080/common/upload';
        
        uni.uploadFile({
          url: uploadUrl,
          filePath: filePath,
          name: 'file', // 后端接收的参数名
          header: {
            'Authorization': 'Bearer ' + token
          },
          success: (uploadRes) => {
            try {
              const data = JSON.parse(uploadRes.data);
              
              if (data.code === 200) {
                // 处理多种可能的图片URL格式
                let imageUrl = '';
                
                if (data.data && typeof data.data === 'object') {
                  imageUrl = data.data.url || data.data.imageUrl || data.data.fileName;
                } else if (data.url) {
                  imageUrl = data.url;
                } else if (data.fileName) {
                  imageUrl = data.fileName;
                } else if (typeof data.data === 'string') {
                  imageUrl = data.data;
                }
                
                console.log('🔍 图片上传响应:', data);
                console.log('🖼️ 解析出的图片URL:', imageUrl);
                
                // 返回服务器上的图片URL
                resolve(imageUrl);
              } else {
                const errorMsg = data.msg || '上传失败';
                
                reject(new Error(errorMsg));
              }
            } catch (e) {
              reject(new Error('解析响应失败'));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    },
    
    // ===== 工具方法 =====
    
    /**
     * 获取空商品对象
     */
    getEmptyProduct() {
      return {
        id: null,
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        stock: '',
        category: '中餐',
        subCategory: '',
        image: '',
        emoji: '🍔',
        status: true,
        tagCodes: ''
      };
    },
    
    /**
     * 验证商品数据
     */
    validateProduct() {
      if (!this.editingProduct.name) {
        uni.showToast({ 
          title: '请输入商品名称', 
          icon: 'none' 
        });
        return false;
      }
      if (!this.editingProduct.price) {
        uni.showToast({ 
          title: '请输入商品价格', 
          icon: 'none' 
        });
        return false;
      }
      if (!this.editingProduct.stock && this.editingProduct.stock !== 0) {
        uni.showToast({ 
          title: '请输入库存数量', 
          icon: 'none' 
        });
        return false;
      }
      return true;
    },
    
    /**
     * 后端数据转换为前端格式
     * @param {Object} data - 后端数据
     */
    mapBackendToFrontend(data) {
      // 处理子分类字段，支持多种可能的字段名
      const subCategory = data.subCategory || 
                         data.subcategory || 
                         data.sub_category || 
                         data.subCategoryName ||
                         data.subcategoryName ||
                         '';
      
      // 处理图片URL，支持多种可能的字段名
      let imageUrl = '';
      if (data.mainImageUrl) {
        imageUrl = data.mainImageUrl;
      } else if (data.imageUrl) {
        imageUrl = data.imageUrl;
      } else if (data.image) {
        imageUrl = data.image;
      } else if (data.imageList && data.imageList.length > 0) {
        // 如果有图片列表，使用第一张图片
        imageUrl = data.imageList[0].imageUrl || data.imageList[0].url || data.imageList[0];
      }
      
      console.log('🔍 商品数据映射:', { 
        goodsId: data.merchantGoodsId, 
        goodsName: data.goodsName,
        mainImageUrl: data.mainImageUrl,
        imageUrl: data.imageUrl,
        imageList: data.imageList,
        finalImage: imageUrl
      });
      
      return {
        id: data.merchantGoodsId,
        name: data.goodsName,
        category: data.category,
        subCategory: subCategory, // 使用处理后的子分类
        price: data.price,
        originalPrice: data.originalPrice,
        stock: data.stock,
        description: data.description,
        tagCodes: data.tagCodes,
        status: data.status === 1, // 转为boolean
        image: imageUrl, // 使用处理后的图片URL
        imageList: data.imageList || [],
        salesCount: data.salesCount || 0,
        avgRating: data.avgRating || 0,
        emoji: this.getCategoryEmoji(data.category) // 根据分类获取emoji
      };
    },
    
    /**
     * 前端数据转换为后端格式
     * @param {Object} data - 前端数据
     */
    mapFrontendToBackend(data) {
      // 获取商家ID
      const merchantInfo = uni.getStorageSync('merchantInfo') || {};
      const merchantBaseId = String(merchantInfo.merchantBaseId || merchantInfo.id || merchantInfo.merchantId || '');
      
      console.log('🔍 商品数据转换 - merchantBaseId:', merchantBaseId);
      
      return {
        merchantBaseId: merchantBaseId,  // 商家ID（必需）
        goodsName: data.name,
        category: data.category,
        subCategory: data.subCategory || '',
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
        stock: parseInt(data.stock),
        description: data.description || '',
        tagCodes: this.getTagCodesString(),  // 从选中的标签生成编码字符串
        mainImageUrl: data.image || '',  // 商品主图URL
        // 添加必需字段
        status: data.status ? 1 : 0,  // 上架状态：1-上架，0-下架
        salesCount: 0,                 // 初始销量为0
        avgRating: 0,                  // 初始评分为0
        ratingCount: 0,                // 初始评分次数为0
        fiveStarRate: 0,               // 初始五星率为0
        fourStarRate: 0,               // 初始四星率为0
        threeStarRate: 0,              // 初始三星率为0
        twoStarRate: 0,                // 初始二星率为0
        oneStarRate: 0                 // 初始一星率为0
      };
    },
    
    /**
     * 根据分类获取emoji
     * @param {String} category - 分类名称
     */
    getCategoryEmoji(category) {
      const emojiMap = {
        '中餐': '🥢',
        '快餐': '🍔',
        '轻食': '🥗',
        '小吃': '🍟',
        '主食': '🍚'
      };
      return emojiMap[category] || '🍔';
    },
    
    /**
     * 关闭弹窗
     */
    closeModal() {
      this.showEditModal = false;
    },
    
     /**
      * 错误处理
      * @param {Object} error - 错误对象
      * @param {String} defaultMsg - 默认错误信息
      */
    handleError(error, defaultMsg = '操作失败') {
      // 从响应对象中提取错误信息
       const errorData = error.data || error;
       const code = errorData.code || error.statusCode;
       
       // 处理未登录
       if (code === 401) {
         uni.showToast({
           title: '请先登录',
           icon: 'none',
           duration: 2000
         });
         setTimeout(() => {
           uni.navigateTo({ url: '/pages/login/login' });
         }, 2000);
         return;
       }
       
       // 处理权限不足
       if (code === 403) {
         uni.showToast({
           title: '没有权限操作',
           icon: 'none'
         });
         return;
       }
       
       // 显示错误信息
       const msg = errorData.msg || errorData.message || error.errMsg || defaultMsg;
       uni.showToast({
         title: msg,
         icon: 'none',
         duration: 2000
       });
     }
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
}

/* 搜索栏 */
.search-bar {
  background: white;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 40rpx;
  padding: 20rpx 30rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.search-input input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.add-btn {
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  border-radius: 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(74, 144, 226, 0.3);
}

.add-text {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

/* 分类标签 */
.category-tabs {
  background: white;
  padding: 20rpx 30rpx;
  display: flex;
  gap: 20rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.category-tab {
  padding: 15rpx 35rpx;
  background: #f5f7fa;
  border-radius: 40rpx;
  transition: all 0.3s;
}

.category-tab.active {
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  box-shadow: 0 2rpx 8rpx rgba(74, 144, 226, 0.3);
}

.category-text {
  font-size: 26rpx;
  color: #666;
}

.category-tab.active .category-text {
  color: white;
  font-weight: 500;
}

/* 商品列表 */
.content {
  padding: 20rpx;
}

.product-item {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #FFE5B4, #FFD699);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 25rpx;
  flex-shrink: 0;
  overflow: hidden;
}

.product-image image {
  width: 100%;
  height: 100%;
}

.product-emoji {
  font-size: 60rpx;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.product-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.product-desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.product-footer {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.product-price {
  font-size: 32rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.product-stock {
  font-size: 22rpx;
  color: #666;
  background: #f5f7fa;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  margin-left: 20rpx;
}

.action-btn {
  padding: 10rpx 25rpx;
  border-radius: 30rpx;
  text-align: center;
  min-width: 100rpx;
}

.edit-btn {
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
}

.delete-btn {
  background: linear-gradient(135deg, #FF6B9D, #FE5196);
}

.action-text {
  font-size: 22rpx;
  color: white;
  font-weight: 500;
}

.switch-btn {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.switch {
  width: 80rpx;
  height: 40rpx;
  background: #ddd;
  border-radius: 20rpx;
  position: relative;
  transition: all 0.3s;
}

.switch.active {
  background: #4A90E2;
}

.switch-circle {
  width: 32rpx;
  height: 32rpx;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: all 0.3s;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.switch.active .switch-circle {
  left: 44rpx;
}

.switch-text {
  font-size: 22rpx;
  color: #666;
}

/* 加载状态 */
.loading-container {
  padding: 100rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

/* 加载更多 */
.load-more {
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.load-more-text {
  font-size: 26rpx;
  color: #999;
}

/* 没有更多 */
.no-more {
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-more-text {
  font-size: 26rpx;
  color: #999;
}

/* 空状态 */
.empty {
  padding: 200rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.empty-btn {
  padding: 25rpx 60rpx;
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  border-radius: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(74, 144, 226, 0.3);
}

.empty-btn-text {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

/* 编辑弹窗 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  width: 90%;
  max-height: 80vh;
  background: white;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 0 10rpx;
}

.modal-body {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item.half {
  flex: 1;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 15rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  line-height: 80rpx;
}

.form-textarea {
  width: 100%;
  height: 180rpx;
  padding: 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  line-height: 1.6;
}

.form-row {
  display: flex;
  gap: 20rpx;
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f7fa;
  border-radius: 12rpx;
  padding-left: 20rpx;
  height: 80rpx;
}

.price-symbol {
  font-size: 28rpx;
  color: #666;
  font-weight: bold;
}

.price-input {
  flex: 1;
  padding-left: 10rpx;
  background: transparent;
  height: 80rpx;
  line-height: 80rpx;
}

/* 图片上传 */
.image-upload {
  width: 240rpx;
  height: 240rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2rpx dashed #ddd;
  cursor: pointer;
}

.upload-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15rpx;
}

.upload-icon {
  font-size: 60rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

/* 分类选择 */
.category-select {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.category-option {
  padding: 20rpx 35rpx;
  background: #f5f7fa;
  border-radius: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  cursor: pointer;
}

.category-option.selected {
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  border-color: #4A90E2;
}

.category-option-text {
  font-size: 26rpx;
  color: #666;
}

.category-option.selected .category-option-text {
  color: white;
  font-weight: 500;
}

/* 子分类加载状态 */
.sub-category-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx;
}

.sub-category-loading .loading-text {
  font-size: 24rpx;
  color: #999;
}

/* 标签选择 */
.tags-select {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 15rpx;
}

.tag-option {
  padding: 15rpx 30rpx;
  background: #f5f7fa;
  border-radius: 30rpx;
  border: 2rpx solid transparent;
  transition: all 0.3s;
  cursor: pointer;
}

.tag-option.selected {
  background: linear-gradient(135deg, #FF6B9D, #FE5196);
  border-color: #FF6B9D;
}

.tag-option-text {
  font-size: 24rpx;
  color: #666;
}

.tag-option.selected .tag-option-text {
  color: white;
  font-weight: 500;
}

.tag-hint {
  font-size: 22rpx;
  color: #999;
  margin-top: 10rpx;
}

/* 弹窗底部 */
.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  padding: 30rpx;
  border-radius: 12rpx;
  text-align: center;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f7fa;
}

.confirm-btn {
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
}

.modal-btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

.cancel-btn .modal-btn-text {
  color: #666;
}

.confirm-btn .modal-btn-text {
  color: white;
}
</style>

