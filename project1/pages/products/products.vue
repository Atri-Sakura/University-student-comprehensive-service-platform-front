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

      <!-- 分页组件 -->
      <view class="pagination" v-if="total > 0">
        <view class="pagination-info">
          <text class="pagination-text">共 {{ total }} 条，第 {{ pageNum }}/{{ totalPages }} 页</text>
        </view>
        <view class="pagination-buttons">
          <view 
            class="pagination-btn" 
            :class="{ disabled: pageNum === 1 }"
            @click="prevPage"
          >
            <text class="pagination-btn-text">上一页</text>
          </view>
          <view class="pagination-num">
            <text class="page-num">{{ pageNum }}</text>
          </view>
          <view 
            class="pagination-btn" 
            :class="{ disabled: pageNum >= totalPages }"
            @click="nextPage"
          >
            <text class="pagination-btn-text">下一页</text>
          </view>
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
import { productAPI, 请求 } from '@/utils/api.js';

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
      products: [],
      loading: false,
      // 分页相关
      pageNum: 1,           // 当前页码
      pageSize: 10,         // 每页显示数量
      total: 0              // 总记录数
    }
  },
  onLoad() {
    // 页面加载时获取商品列表
    this.loadProducts();
  },
  computed: {
    filteredProducts() {
      // 后端已经处理了分页，直接返回商品列表
      return this.products;
    },
    // 计算总页数
    totalPages() {
      return Math.ceil(this.total / this.pageSize);
    }
  },
  methods: {
    // 加载商品列表
    async loadProducts() {
      this.loading = true;
      try {
        // 构建查询参数（若依分页格式）
        const params = {
          pageNum: this.pageNum,
          pageSize: this.pageSize
        };
        
        // 添加搜索关键词
        if (this.searchText) {
          params.name = this.searchText;
        }
        
        // 添加分类筛选
        if (this.currentCategory !== 0) {
          params.category = this.categories[this.currentCategory];
        }
        
        // 将参数转为查询字符串
        const queryString = Object.keys(params)
          .map(key => `${key}=${encodeURIComponent(params[key])}`)
          .join('&');
        
        const url = `${productAPI.getProductList}?${queryString}`;
        
        const res = await 请求(url, {
          method: 'GET',
          success: (result) => {
            if (result.statusCode === 200 && result.data.code === 200) {
              // 若依分页格式：rows 和 total
              const rows = result.data.rows || [];
              
              // 将后端的各种可能的 ID 字段统一映射为 id
              this.products = rows.map(item => {
                // 按优先级查找 ID：goodsId > goods_id > id
                const goodsId = item.goodsId || item.goods_id || item.id || item.GoodsId;
                return {
                  ...item,
                  id: goodsId,
                  goodsId: goodsId  // 同时保留 goodsId，确保兼容性
                };
              });
              
              this.total = result.data.total || 0;
              
              // 如果没有数据，给出提示
              if (this.products.length === 0) {
                console.log('商品列表为空');
              }
            } else {
              uni.showToast({
                title: result.data.msg || result.data.message || '获取商品列表失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            console.error('获取商品列表失败:', err);
            uni.showToast({
              title: '网络请求失败',
              icon: 'none'
            });
          }
        });
      } catch (error) {
        console.error('加载商品列表异常:', error);
      } finally {
        this.loading = false;
      }
    },
    switchCategory(index) {
      this.currentCategory = index;
      // 切换分类时重置到第一页
      this.pageNum = 1;
      this.loadProducts();
    },
    onSearch() {
      // 搜索时重置到第一页
      this.pageNum = 1;
      this.loadProducts();
    },
    // 分页方法
    prevPage() {
      if (this.pageNum > 1) {
        this.pageNum--;
        this.loadProducts();
      }
    },
    nextPage() {
      if (this.pageNum < this.totalPages) {
        this.pageNum++;
        this.loadProducts();
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.pageNum = page;
        this.loadProducts();
      }
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
      this.showEditModal = true;
    },
    editProduct(item) {
      // 复制商品信息到编辑对象
      this.editingProduct = {
        ...item
      };
      this.showEditModal = true;
    },
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          // 上传图片到服务器
          this.uploadImage(tempFilePath);
        },
        fail: () => {
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    // 上传图片到服务器
    uploadImage(filePath) {
      uni.showLoading({
        title: '上传中...'
      });
      
      const token = uni.getStorageSync('token');
      
      uni.uploadFile({
        url: productAPI.uploadImage,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          uni.hideLoading();
          try {
            const data = JSON.parse(res.data);
            if (data.code === 200) {
              this.editingProduct.image = data.data.url; // 假设后端返回图片URL
              uni.showToast({
                title: '上传成功',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: data.msg || data.message || '上传失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('解析上传响应失败:', error);
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('上传图片失败:', err);
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
      });
    },
    closeModal() {
      this.showEditModal = false;
    },
    async saveProduct() {
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

      uni.showLoading({
        title: this.editingProduct.id ? '保存中...' : '添加中...'
      });

      try {
        if (this.editingProduct.id) {
          // 编辑现有商品 - goodsId 在 URL 中
          const goodsId = this.editingProduct.id || this.editingProduct.goodsId;
          
          if (!goodsId) {
            uni.hideLoading();
            uni.showToast({
              title: '商品ID不存在，无法修改',
              icon: 'none'
            });
            return;
          }
          
          const productData = {
            name: this.editingProduct.name,
            description: this.editingProduct.description,
            price: parseFloat(this.editingProduct.price).toFixed(2),
            stock: parseInt(this.editingProduct.stock),
            category: this.editingProduct.category,
            image: this.editingProduct.image,
            emoji: this.editingProduct.emoji,
            status: this.editingProduct.status
          };
          
          await 请求(`${productAPI.updateProduct}/${goodsId}`, {
            method: 'PUT',
            data: productData,
            success: (res) => {
              uni.hideLoading();
              if (res.statusCode === 200 && res.data.code === 200) {
                uni.showToast({
                  title: '修改成功',
                  icon: 'success'
                });
                // 重新加载商品列表
                this.loadProducts();
                this.closeModal();
              } else {
                uni.showToast({
                  title: res.data.msg || res.data.message || '修改失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              uni.hideLoading();
              console.error('修改商品失败:', err);
              uni.showToast({
                title: '网络请求失败',
                icon: 'none'
              });
            }
          });
        } else {
          // 添加新商品 - 不需要 goodsId
          const productData = {
            name: this.editingProduct.name,
            description: this.editingProduct.description,
            price: parseFloat(this.editingProduct.price).toFixed(2),
            stock: parseInt(this.editingProduct.stock),
            category: this.editingProduct.category,
            image: this.editingProduct.image,
            emoji: this.editingProduct.emoji,
            status: this.editingProduct.status
          };
          
          await 请求(productAPI.addProduct, {
            method: 'POST',
            data: productData,
            success: (res) => {
              uni.hideLoading();
              if (res.statusCode === 200 && res.data.code === 200) {
                uni.showToast({
                  title: '添加成功',
                  icon: 'success'
                });
                // 重新加载商品列表
                this.loadProducts();
                this.closeModal();
              } else {
                uni.showToast({
                  title: res.data.msg || res.data.message || '添加失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              uni.hideLoading();
              console.error('添加商品失败:', err);
              uni.showToast({
                title: '网络请求失败',
                icon: 'none'
              });
            }
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('保存商品异常:', error);
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
    },
    deleteProduct(item, index) {
      const goodsId = item.id || item.goodsId;
      
      if (!goodsId) {
        uni.showToast({
          title: '商品ID不存在，无法删除',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '确认删除',
        content: `确定要删除"${item.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中...'
            });
            
            try {
              await 请求(`${productAPI.deleteProduct}/${goodsId}`, {
                method: 'DELETE',
                success: (result) => {
                  uni.hideLoading();
                  if (result.statusCode === 200 && result.data.code === 200) {
                    uni.showToast({
                      title: '删除成功',
                      icon: 'success'
                    });
                    // 重新加载商品列表
                    this.loadProducts();
                  } else {
                    uni.showToast({
                      title: result.data.msg || result.data.message || '删除失败',
                      icon: 'none'
                    });
                  }
                },
                fail: (err) => {
                  uni.hideLoading();
                  console.error('删除商品失败:', err);
                  uni.showToast({
                    title: '网络请求失败',
                    icon: 'none'
                  });
                }
              });
            } catch (error) {
              uni.hideLoading();
              console.error('删除商品异常:', error);
              uni.showToast({
                title: '操作失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    async toggleStatus(item) {
      const goodsId = item.id || item.goodsId;
      
      if (!goodsId) {
        uni.showToast({
          title: '商品ID不存在，无法操作',
          icon: 'none'
        });
        return;
      }
      
      const newStatus = !item.status;
      
      uni.showLoading({
        title: '操作中...'
      });
      
      try {
        // 根据当前状态选择上架或下架接口
        const apiUrl = newStatus 
          ? `${productAPI.upProduct}/${goodsId}`     // 上架
          : `${productAPI.downProduct}/${goodsId}`;  // 下架
        
        await 请求(apiUrl, {
          method: 'PUT',
          success: (res) => {
            uni.hideLoading();
            if (res.statusCode === 200 && res.data.code === 200) {
              item.status = newStatus;
              uni.showToast({
                title: newStatus ? '商品已上架' : '商品已下架',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: res.data.msg || res.data.message || '操作失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            uni.hideLoading();
            console.error('切换商品状态失败:', err);
            uni.showToast({
              title: '网络请求失败',
              icon: 'none'
            });
          }
        });
      } catch (error) {
        uni.hideLoading();
        console.error('切换商品状态异常:', error);
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        });
      }
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

/* 分页组件样式 */
.pagination {
  background: white;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.pagination-info {
  text-align: center;
  margin-bottom: 20rpx;
}

.pagination-text {
  font-size: 24rpx;
  color: #666;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}

.pagination-btn {
  padding: 15rpx 35rpx;
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  border-radius: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(74, 144, 226, 0.3);
  transition: all 0.3s;
}

.pagination-btn.disabled {
  background: #e0e0e0;
  box-shadow: none;
  opacity: 0.5;
}

.pagination-btn-text {
  font-size: 26rpx;
  color: white;
  font-weight: 500;
}

.pagination-btn.disabled .pagination-btn-text {
  color: #999;
}

.pagination-num {
  min-width: 80rpx;
  height: 60rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #4A90E2;
}

.page-num {
  font-size: 28rpx;
  color: #4A90E2;
  font-weight: bold;
}
</style>


