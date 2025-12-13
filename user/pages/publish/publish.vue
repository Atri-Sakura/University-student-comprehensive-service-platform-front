<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="nav-title">发布商品</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y :style="{ top: navHeight + 'px' }">
      <view class="form-container">
        <!-- 图片上传 -->
        <view class="form-item">
          <view class="form-label">
            <text class="label-text">商品图片</text>
            <text class="label-tip">最多上传9张</text>
          </view>
          <view class="image-upload">
            <view 
              v-for="(item, index) in imageList" 
              :key="index"
              class="image-item"
            >
              <image class="upload-image" :src="item" mode="aspectFill"></image>
              <view class="image-delete" @click="deleteImage(index)">
                <text class="delete-icon">×</text>
              </view>
            </view>
            <view 
              v-if="imageList.length < 9"
              class="upload-btn"
              @click="chooseImage"
            >
              <text class="upload-icon">📷</text>
              <text class="upload-text">添加图片</text>
            </view>
          </view>
        </view>

        <!-- 商品名称 -->
        <view class="form-item">
          <view class="form-label">
            <text class="label-text">商品名称</text>
            <text class="required">*</text>
          </view>
          <input 
            class="form-input"
            v-model="formData.name"
            placeholder="请输入商品名称"
            maxlength="50"
          />
        </view>

        <!-- 商品价格 -->
        <view class="form-item">
          <view class="form-label">
            <text class="label-text">商品价格</text>
            <text class="required">*</text>
          </view>
          <view class="price-input-box">
            <text class="price-symbol">¥</text>
            <input 
              class="price-input"
              v-model="formData.price"
              placeholder="请输入价格"
              type="digit"
            />
          </view>
        </view>

        <!-- 商品分类 -->
        <view class="form-item" @click="showCategoryPicker">
          <view class="form-label">
            <text class="label-text">商品分类</text>
            <text class="required">*</text>
          </view>
          <view class="select-box">
            <text class="select-text" :class="{ placeholder: !formData.category }">
              {{ formData.category || '请选择分类' }}
            </text>
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <!-- 商品描述 -->
        <view class="form-item">
          <view class="form-label">
            <text class="label-text">商品描述</text>
          </view>
          <textarea 
            class="form-textarea"
            v-model="formData.description"
            placeholder="请详细描述商品信息，如新旧程度、购买时间等"
            maxlength="500"
          />
          <view class="word-count">{{ formData.description.length }}/500</view>
        </view>

        <!-- 联系方式 -->
        <view class="form-item">
          <view class="form-label">
            <text class="label-text">联系方式</text>
            <text class="required">*</text>
          </view>
          <input 
            class="form-input"
            v-model="formData.contact"
            placeholder="请输入手机号或微信号"
            maxlength="20"
          />
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-container">
        <button class="submit-btn" @click="submitForm">立即发布</button>
      </view>
    </scroll-view>

    <!-- 分类选择器 -->
    <view v-if="showPicker" class="picker-mask" @click="hideCategoryPicker">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-cancel" @click="hideCategoryPicker">取消</text>
          <text class="picker-title">选择分类</text>
          <text class="picker-confirm" @click="confirmCategory">确定</text>
        </view>
        <view class="picker-list">
          <view 
            v-for="(item, index) in categoryList" 
            :key="index"
            class="picker-item"
            :class="{ active: tempCategory === item.label }"
            @click="selectCategory(item.label)"
          >
            <view class="category-content">
              <text class="picker-item-text">{{ item.label }}</text>
              <text class="picker-item-desc">{{ item.desc }}</text>
            </view>
            <text v-if="tempCategory === item.label" class="picker-check">✓</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { publishGoods } from '@/api/secondhandGoods.js'
import { GOODS_CATEGORIES } from '@/api/config.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      imageList: [],
      formData: {
        name: '',
        price: '',
        category: '',
        description: '',
        contact: ''
      },
      categoryList: GOODS_CATEGORIES,
      categoryLabels: GOODS_CATEGORIES.map(item => item.label),
      showPicker: false,
      tempCategory: ''
    };
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
  },
  methods: {
    // 返回
    goBack() {
      uni.navigateBack();
    },
    // 选择图片
    chooseImage() {
      const count = 9 - this.imageList.length;
      uni.chooseImage({
        count: count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.imageList = this.imageList.concat(res.tempFilePaths);
        }
      });
    },
    // 删除图片
    deleteImage(index) {
      uni.showModal({
        title: '提示',
        content: '确定删除这张图片吗？',
        success: (res) => {
          if (res.confirm) {
            this.imageList.splice(index, 1);
          }
        }
      });
    },
    // 显示分类选择器
    showCategoryPicker() {
      this.tempCategory = this.formData.category;
      this.showPicker = true;
    },
    // 隐藏分类选择器
    hideCategoryPicker() {
      this.showPicker = false;
    },
    // 选择分类
    selectCategory(category) {
      this.tempCategory = category;
    },
    // 确认分类
    confirmCategory() {
      this.formData.category = this.tempCategory;
      this.showPicker = false;
    },
    // 表单验证
    validateForm() {
      if (this.imageList.length === 0) {
        uni.showToast({
          title: '请上传商品图片',
          icon: 'none'
        });
        return false;
      }
      
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
      
      if (!this.formData.category) {
        uni.showToast({
          title: '请选择商品分类',
          icon: 'none'
        });
        return false;
      }
      
      if (!this.formData.contact.trim()) {
        uni.showToast({
          title: '请输入联系方式',
          icon: 'none'
        });
        return false;
      }
      
      return true;
    },
    // 提交表单
    async submitForm() {
      if (!this.validateForm()) {
        return;
      }
      
      try {
        uni.showLoading({
          title: '发布中...'
        });
        
        // 根据分类标签找到对应的分类代码
        const categoryItem = this.categoryList.find(item => item.label === this.formData.category);
        const categoryCode = categoryItem ? categoryItem.code : this.formData.category;
        
        // 调用发布商品API
        const result = await publishGoods({
          files: this.imageList,
          goodsName: this.formData.name,
          price: parseFloat(this.formData.price),
          category: categoryCode, // 使用分类代码而不是标签
          description: this.formData.description,
          contact: this.formData.contact // 添加联系方式
        });
        
        uni.hideLoading();
        
        // 发布成功
        uni.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000
        });
        
        console.log('发布结果：', result);
        
        // 延迟返回
        setTimeout(() => {
          uni.navigateBack();
        }, 2000);
        
      } catch (error) {
        uni.hideLoading();
        console.error('发布失败：', error);
        
        const errorMsg = error.data?.msg || error.msg || error.message || '发布失败，请重试';
        
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
      }
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
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

.nav-left,
.nav-right {
  width: 80rpx;
}

.back-icon {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 300;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

/* 内容区域 */
.content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}

.form-container {
  padding: 20rpx 30rpx;
}

/* 表单项 */
.form-item {
  background-color: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.form-label {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.label-text {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.label-tip {
  font-size: 24rpx;
  color: #999999;
  margin-left: 16rpx;
}

.required {
  color: #FF4444;
  margin-left: 8rpx;
  font-size: 32rpx;
}

/* 图片上传 */
.image-upload {
  display: flex;
  flex-wrap: wrap;
}

.image-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.upload-image {
  width: 100%;
  height: 100%;
}

.image-delete {
  position: absolute;
  top: 0;
  right: 0;
  width: 50rpx;
  height: 50rpx;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 12rpx 0 12rpx;
}

.delete-icon {
  color: #FFFFFF;
  font-size: 48rpx;
  font-weight: 300;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #DDDDDD;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #FAFAFA;
}

.upload-icon {
  font-size: 60rpx;
  margin-bottom: 12rpx;
  opacity: 0.5;
}

.upload-text {
  font-size: 24rpx;
  color: #999999;
}

/* 输入框 */
.form-input {
  width: 100%;
  height: 80rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333333;
}

/* 价格输入 */
.price-input-box {
  display: flex;
  align-items: center;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 80rpx;
}

.price-symbol {
  font-size: 32rpx;
  color: #FF4444;
  font-weight: bold;
  margin-right: 12rpx;
}

.price-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

/* 选择框 */
.select-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 80rpx;
}

.select-text {
  font-size: 28rpx;
  color: #333333;
}

.select-text.placeholder {
  color: #CCCCCC;
}

.arrow-icon {
  font-size: 48rpx;
  color: #CCCCCC;
  font-weight: 300;
  transform: rotate(90deg);
}

/* 文本域 */
.form-textarea {
  width: 100%;
  min-height: 200rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

.word-count {
  text-align: right;
  font-size: 24rpx;
  color: #CCCCCC;
  margin-top: 12rpx;
}

/* 提交按钮 */
.submit-container {
  padding: 30rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #89CFF0 0%, #5DCDFF 100%);
  border-radius: 44rpx;
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: bold;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(93, 205, 255, 0.3);
}

.submit-btn::after {
  border: none;
}

/* 分类选择器 */
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-end;
}

.picker-content {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.picker-cancel,
.picker-confirm {
  font-size: 28rpx;
  color: #5DCDFF;
}

.picker-title {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.picker-list {
  max-height: 600rpx;
  overflow-y: auto;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #F5F5F5;
}

.picker-item.active {
  background-color: #F0FAFF;
}

.category-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.picker-item-text {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.picker-item-desc {
  font-size: 24rpx;
  color: #999999;
  line-height: 1.4;
}

.picker-check {
  font-size: 32rpx;
  color: #5DCDFF;
  font-weight: bold;
  margin-left: 20rpx;
}
</style>

