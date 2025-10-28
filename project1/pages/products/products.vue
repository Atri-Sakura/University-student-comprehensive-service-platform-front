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
      <view class="product-item" v-for="(item, index) in filteredProducts" :key="index">
        <view class="product-image">
          <image v-if="item.image" :src="item.image" mode="aspectFill" />
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
          <view class="action-btn delete-btn" @click="deleteProduct(item, index)">
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

      <view v-if="filteredProducts.length === 0" class="empty">
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

          <!-- 商品分类 -->
          <view class="form-item">
            <text class="form-label">商品分类</text>
            <view class="category-select">
              <view 
                class="category-option" 
                v-for="(cat, index) in categories.slice(1)" 
                :key="index"
                :class="{ selected: editingProduct.category === cat }"
                @click="editingProduct.category = cat"
              >
                <text class="category-option-text">{{ cat }}</text>
              </view>
            </view>
          </view>

          <!-- 价格和库存 -->
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
export default {
  name: 'ProductsPage',
  data() {
    return {
      searchText: '',
      currentCategory: 0,
      categories: ['全部', '主食', '饮料', '小吃', '套餐'],
      showEditModal: false,
      editingProduct: {
        id: null,
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '主食',
        image: '',
        emoji: '🍔',
        status: true
      },
      editingIndex: -1,
      products: [
        { name: '招牌汉堡套餐', emoji: '🍔', description: '汉堡+薯条+可乐', price: '35.00', stock: 50, category: '套餐', status: true },
        { name: '经典炸鸡桶', emoji: '🍗', description: '香脆炸鸡8块', price: '68.00', stock: 30, category: '主食', status: true },
        { name: '芝士牛肉汉堡', emoji: '🍔', description: '双层牛肉芝士', price: '28.00', stock: 45, category: '主食', status: true },
        { name: '薯条（大份）', emoji: '🍟', description: '金黄酥脆薯条', price: '15.00', stock: 100, category: '小吃', status: true },
        { name: '可乐（大杯）', emoji: '🥤', description: '冰镇可口可乐', price: '8.00', stock: 80, category: '饮料', status: true },
        { name: '鸡米花', emoji: '🍿', description: '香脆鸡米花', price: '18.00', stock: 60, category: '小吃', status: true },
        { name: '奶茶（珍珠）', emoji: '🧋', description: '珍珠奶茶', price: '12.00', stock: 70, category: '饮料', status: true },
        { name: '鸡翅（2个）', emoji: '🍗', description: '香辣鸡翅', price: '16.00', stock: 40, category: '小吃', status: false }
      ]
    }
  },
  computed: {
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
    }
  },
  methods: {
    switchCategory(index) {
      this.currentCategory = index;
    },
    onSearch() {
      // 搜索逻辑已在计算属性中处理
    },
    addProduct() {
      this.editingProduct = {
        id: null,
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '主食',
        image: '',
        emoji: '🍔',
        status: true
      };
      this.editingIndex = -1;
      this.showEditModal = true;
    },
    editProduct(item) {
      // 找到原始产品的索引
      this.editingIndex = this.products.findIndex(p => p === item);
      // 复制商品信息到编辑对象
      this.editingProduct = {
        ...item,
        id: this.editingIndex
      };
      this.showEditModal = true;
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.editingProduct.image = res.tempFilePaths[0];
        },
        fail: () => {
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    closeModal() {
      this.showEditModal = false;
    },
    saveProduct() {
      // 验证必填项
      if (!this.editingProduct.name) {
        uni.showToast({
          title: '请输入商品名称',
          icon: 'none'
        });
        return;
      }
      if (!this.editingProduct.price) {
        uni.showToast({
          title: '请输入商品价格',
          icon: 'none'
        });
        return;
      }
      if (!this.editingProduct.stock) {
        uni.showToast({
          title: '请输入库存数量',
          icon: 'none'
        });
        return;
      }

      // 格式化价格
      this.editingProduct.price = parseFloat(this.editingProduct.price).toFixed(2);
      this.editingProduct.stock = parseInt(this.editingProduct.stock);

      if (this.editingIndex >= 0) {
        // 编辑现有商品
        this.products.splice(this.editingIndex, 1, {
          name: this.editingProduct.name,
          description: this.editingProduct.description,
          price: this.editingProduct.price,
          stock: this.editingProduct.stock,
          category: this.editingProduct.category,
          image: this.editingProduct.image,
          emoji: this.editingProduct.emoji,
          status: this.editingProduct.status
        });
        uni.showToast({
          title: '修改成功',
          icon: 'success'
        });
      } else {
        // 添加新商品
        this.products.unshift({
          name: this.editingProduct.name,
          description: this.editingProduct.description,
          price: this.editingProduct.price,
          stock: this.editingProduct.stock,
          category: this.editingProduct.category,
          image: this.editingProduct.image,
          emoji: this.editingProduct.emoji,
          status: true
        });
        uni.showToast({
          title: '添加成功',
          icon: 'success'
        });
      }

      this.closeModal();
    },
    deleteProduct(item, index) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除"${item.name}"吗？`,
        success: (res) => {
          if (res.confirm) {
            this.products.splice(index, 1);
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            });
          }
        }
      });
    },
    toggleStatus(item) {
      item.status = !item.status;
      uni.showToast({
        title: item.status ? '商品已上架' : '商品已下架',
        icon: 'success'
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

