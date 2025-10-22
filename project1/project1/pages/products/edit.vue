<template>
  <view class="container">
    <view class="form">
      <!-- 商品图片上传 -->
      <view class="form-item">
        <text class="label">商品图片</text>
        <view class="image-upload-area" @click="chooseImage">
          <view v-if="!formData.imageUrl" class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">点击上传图片</text>
          </view>
          <image v-else :src="formData.imageUrl" class="preview-image" mode="aspectFill"></image>
        </view>
        <text class="hint-text">建议尺寸：800x800px，支持jpg、png格式</text>
      </view>
      
      <!-- 商品名称 -->
      <view class="form-item">
        <text class="label">商品名称 <text class="required">*</text></text>
        <input 
          class="input" 
          v-model="formData.name" 
          placeholder="请输入商品名称"
          placeholder-style="color: #ccc"
        />
      </view>
      
      <!-- 商品描述 -->
      <view class="form-item">
        <text class="label">商品描述</text>
        <textarea 
          class="textarea" 
          v-model="formData.description" 
          placeholder="请输入商品描述"
          placeholder-style="color: #ccc"
          maxlength="200"
        />
        <text class="char-count">{{ formData.description.length }}/200</text>
      </view>
      
      <!-- 商品价格 -->
      <view class="form-item">
        <text class="label">商品价格 <text class="required">*</text></text>
        <view class="input-wrapper">
          <text class="prefix">¥</text>
          <input 
            class="input with-prefix" 
            v-model="formData.price" 
            type="digit"
            placeholder="0.00"
            placeholder-style="color: #ccc"
          />
        </view>
      </view>
      
      <!-- 库存数量 -->
      <view class="form-item">
        <text class="label">库存数量 <text class="required">*</text></text>
        <input 
          class="input" 
          v-model="formData.stock" 
          type="number"
          placeholder="请输入库存数量"
          placeholder-style="color: #ccc"
        />
      </view>
      
      <!-- 商品状态 -->
      <view class="form-item">
        <text class="label">商品状态</text>
        <view class="status-selector">
          <view 
            class="status-option" 
            :class="{ active: formData.status === '销售中' }"
            @click="formData.status = '销售中'"
          >
            <text class="status-text">销售中</text>
          </view>
          <view 
            class="status-option" 
            :class="{ active: formData.status === '已售罄' }"
            @click="formData.status = '已售罄'"
          >
            <text class="status-text">已售罄</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="footer">
      <view class="cancel-btn" @click="cancel">
        <text class="btn-text">取消</text>
      </view>
      <view class="save-btn" @click="save">
        <text class="btn-text">保存</text>
      </view>
    </view>
  </view>
</template>

<script>
import { addProduct, updateProduct } from '@/api/product.js';
import { upload } from '@/utils/request.js';

export default {
  name: 'ProductEdit',
  data() {
    return {
      isEdit: false,
      productId: null,
      formData: {
        imageUrl: '',
        name: '',
        description: '',
        price: '',
        stock: '',
        status: '销售中',
        sales: 0
      },
      uploading: false
    }
  },
  onLoad(options) {
    // 如果是编辑模式，从上一页获取数据
    if (options.data) {
      try {
        const data = JSON.parse(decodeURIComponent(options.data));
        this.isEdit = true;
        this.productId = data.id;
        this.formData = { ...data };
        
        // 更新标题
        uni.setNavigationBarTitle({
          title: '编辑商品'
        });
      } catch (e) {
        console.error('解析数据失败', e);
      }
    } else {
      // 添加模式
      uni.setNavigationBarTitle({
        title: '添加商品'
      });
    }
  },
  methods: {
    async chooseImage() {
      const that = this;
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          // 先显示本地临时图片
          that.formData.imageUrl = res.tempFilePaths[0];
          
          // 上传图片到服务器
          that.uploading = true;
          uni.showLoading({
            title: '上传中...'
          });
          
          try {
            const uploadRes = await upload(res.tempFilePaths[0], 'file');
            
            if (uploadRes.code === 200) {
              // 获取服务器返回的图片URL
              that.formData.imageUrl = uploadRes.data.url || uploadRes.data.fileName;
              
              uni.showToast({
                title: '上传成功',
                icon: 'success'
              });
            }
          } catch (error) {
            console.error('上传图片失败', error);
            uni.showToast({
              title: '上传失败，将使用本地图片',
              icon: 'none'
            });
          } finally {
            that.uploading = false;
            uni.hideLoading();
          }
        },
        fail: (err) => {
          console.error('选择图片失败', err);
        }
      });
    },
    validate() {
      if (!this.formData.name.trim()) {
        uni.showToast({
          title: '请输入商品名称',
          icon: 'none'
        });
        return false;
      }
      if (!this.formData.price || parseFloat(this.formData.price) <= 0) {
        uni.showToast({
          title: '请输入正确的价格',
          icon: 'none'
        });
        return false;
      }
      if (!this.formData.stock || parseInt(this.formData.stock) < 0) {
        uni.showToast({
          title: '请输入正确的库存数量',
          icon: 'none'
        });
        return false;
      }
      return true;
    },
    async save() {
      if (!this.validate()) {
        return;
      }
      
      if (this.uploading) {
        uni.showToast({
          title: '图片上传中，请稍候',
          icon: 'none'
        });
        return;
      }
      
      // 格式化数据
      const submitData = {
        ...this.formData,
        price: parseFloat(this.formData.price).toFixed(2),
        stock: parseInt(this.formData.stock)
      };
      
      // 如果库存为0，自动设置为已售罄
      if (submitData.stock === 0) {
        submitData.status = '已售罄';
      }
      
      uni.showLoading({
        title: this.isEdit ? '保存中...' : '添加中...'
      });
      
      try {
        if (this.isEdit) {
          // 编辑模式：更新商品
          submitData.id = this.productId;
          await updateProduct(submitData);
          
          uni.showToast({
            title: '更新成功',
            icon: 'success'
          });
        } else {
          // 添加模式：新增商品
          await addProduct(submitData);
          
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          });
        }
        
        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
        
      } catch (error) {
        console.error('保存失败', error);
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },
    cancel() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.form {
  background: white;
  padding: 20rpx 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 16rpx;
}

.required {
  color: #ff4d4f;
}

.input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 0 24rpx;
  height: 80rpx;
}

.prefix {
  font-size: 28rpx;
  color: #666;
  margin-right: 8rpx;
}

.input.with-prefix {
  background: transparent;
  padding: 0;
  flex: 1;
}

.textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #333;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

/* 图片上传区域 */
.image-upload-area {
  width: 300rpx;
  height: 300rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  border: 2rpx dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.upload-icon {
  font-size: 80rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.hint-text {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 12rpx;
}

/* 状态选择器 */
.status-selector {
  display: flex;
  gap: 20rpx;
}

.status-option {
  flex: 1;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid transparent;
}

.status-option.active {
  background: #E8F5E9;
  border-color: #4CAF50;
}

.status-text {
  font-size: 28rpx;
  color: #333;
}

/* 底部按钮 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 20rpx 30rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  flex: 1;
  height: 88rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn {
  flex: 1;
  height: 88rpx;
  background: linear-gradient(135deg, #64B5F6, #42A5F5);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn .btn-text {
  font-size: 32rpx;
  color: #666;
}

.save-btn .btn-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}
</style>

