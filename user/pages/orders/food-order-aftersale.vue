<template>
  <view class="aftersale-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">&lt;</text>
      </view>
      <view class="nav-title">申请售后</view>
      <view class="nav-right"></view>
    </view>

    <!-- 订单概要信息 -->
    <view class="order-summary">
      <view class="summary-title">订单概要</view>
      <view class="order-info">
        <view class="info-item">
          <text class="info-label">订单号：</text>
          <text class="info-value">{{ order.orderNo }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">下单时间：</text>
          <text class="info-value">{{ order.orderTime }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">收货地址：</text>
          <text class="info-value">{{ order.address }}</text>
        </view>
        <!-- 订单商品列表 -->
        <view class="order-products">
          <view class="product-item" v-for="(product, index) in order.products" :key="index">
            <text class="product-name">{{ product.name }}</text>
            <text class="product-quantity">×{{ product.quantity }}</text>
            <text class="product-price">¥{{ product.price.toFixed(2) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 售后申请表单 -->
    <view class="aftersale-form">
      <view class="form-title">填写售后申请</view>
      
      <!-- 售后类型 -->
      <view class="form-item">
        <text class="item-label">售后类型</text>
        <picker mode="selector" :range="aftersaleTypes" v-model="form.aftersaleTypeIndex" class="picker-select">
          <view class="picker-content">{{ form.aftersaleTypeIndex >= 0 ? aftersaleTypes[form.aftersaleTypeIndex] : '请选择售后类型' }}</view>
        </picker>
      </view>

      <!-- 申请售后商品 -->
      <view class="form-item">
        <text class="item-label">申请售后商品</text>
        <view class="product-select-container">
          <view class="product-checkbox" v-for="(product, index) in order.products" :key="index">
            <view class="checkbox-item" :class="{ active: form.selectedProducts.includes(index) }" @click="toggleProduct(index)">
              <view class="checkbox-icon">{{ form.selectedProducts.includes(index) ? '✓' : '' }}</view>
              <text class="product-name">{{ product.name }}</text>
            </view>
          </view>
          <text class="select-tip">可多选。如全部餐品有问题请全选。</text>
        </view>
      </view>

      <!-- 问题描述 -->
      <view class="form-item">
        <text class="item-label">问题描述</text>
        <textarea class="description-input" v-model="form.description" placeholder="请详细描述您的售后问题" :auto-height="true"></textarea>
      </view>

      <!-- 问题图片 -->
      <view class="form-item">
        <text class="item-label">问题图片（选填，最多3张）</text>
        <view class="image-upload-container">
          <view class="image-item" v-for="(image, index) in form.images" :key="index">
            <image :src="image" mode="aspectFill" class="uploaded-image"></image>
            <view class="delete-btn" @click="deleteImage(index)">×</view>
          </view>
          <view class="upload-btn" v-if="form.images.length < 3" @click="chooseImage">
            <text class="upload-icon">+</text>
            <text class="upload-text">添加图片</text>
          </view>
        </view>
        <text class="image-tip">如有图片证据请上传，便于更快处理。</text>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-container">
        <button class="submit-btn" @click="submitAftersale">提交售后申请</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 订单信息（模拟数据）
      order: {
        orderNo: '20250905183201',
        orderTime: '2025-09-05 18:32',
        address: '北京市海淀区XX路88号',
        products: [
          { name: '麻辣香锅', quantity: 1, price: 22.00 },
          { name: '可乐', quantity: 2, price: 5.40 }
        ]
      },
      // 售后类型选项
      aftersaleTypes: ['退款', '退款并退货', '换货', '投诉'],
      // 表单数据
      form: {
        aftersaleTypeIndex: -1,
        selectedProducts: [],
        description: '',
        images: []
      }
    }
  },
  onLoad(options) {
    // 如果有订单ID参数，可以根据ID获取订单详情
    if (options.orderId) {
      console.log('订单ID:', options.orderId);
      // 这里可以添加根据订单ID获取订单详情的逻辑
      // 模拟数据已在data中定义
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 切换商品选中状态
    toggleProduct(index) {
      if (this.form.selectedProducts.includes(index)) {
        // 取消选中
        this.form.selectedProducts = this.form.selectedProducts.filter(item => item !== index);
      } else {
        // 选中商品
        this.form.selectedProducts.push(index);
      }
    },
    
    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 3 - this.form.images.length,
        success: (res) => {
          this.form.images = [...this.form.images, ...res.tempFilePaths];
        },
        fail: () => {
          uni.showToast({ title: '选择图片失败', icon: 'none' });
        }
      });
    },
    
    // 删除图片
    deleteImage(index) {
      this.form.images.splice(index, 1);
    },
    
    // 提交售后申请
    submitAftersale() {
      // 表单验证
      if (this.form.aftersaleTypeIndex < 0) {
        uni.showToast({ title: '请选择售后类型', icon: 'none' });
        return;
      }
      
      if (this.form.selectedProducts.length === 0) {
        uni.showToast({ title: '请选择申请售后的商品', icon: 'none' });
        return;
      }
      
      if (!this.form.description.trim()) {
        uni.showToast({ title: '请详细描述售后问题', icon: 'none' });
        return;
      }
      
      // 模拟提交
      uni.showLoading({ title: '提交中...' });
      
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({ title: '提交成功', icon: 'success' });
        
        // 提交成功后返回上一页
        setTimeout(() => {
          this.goBack();
        }, 1500);
      }, 1000);
    }
  }
}
</script>

<style scoped>
.aftersale-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  background-color: #5DCDFF;
  padding: 0 15px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.back-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  color: white;
  font-size: 20px;
}

.nav-title {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.nav-right {
  width: 30px;
}

/* 内容区域 */
.order-summary,
.aftersale-form {
  margin-top: 10px;
  margin-bottom: 15px;
  padding: 15px;
  background-color: white;
}

.aftersale-form {
  margin-top: 0;
  padding-bottom: 80px;
}

.summary-title,
.form-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

/* 订单信息 */
.order-info {
  font-size: 14px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-label {
  color: #666;
  min-width: 70px;
}

.info-value {
  color: #333;
  flex: 1;
}

/* 订单商品列表 */
.order-products {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.product-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.product-name {
  flex: 1;
  color: #333;
}

.product-quantity {
  margin: 0 10px;
  color: #666;
}

.product-price {
  color: #ff6b6b;
  font-weight: bold;
}

/* 表单样式 */
.form-item {
  margin-bottom: 12px;
}

.item-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

/* 选择器样式 */
.picker-select {
  background-color: #f8f8f8;
  border-radius: 6px;
  padding: 12px;
}

.picker-content {
  font-size: 14px;
  color: #333;
}

/* 商品选择 */
.product-select-container {
  background-color: #f8f8f8;
  border-radius: 6px;
  padding: 10px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: white;
  border-radius: 4px;
  margin-bottom: 8px;
}

.checkbox-item:last-child {
  margin-bottom: 0;
}

.checkbox-item.active {
  border: 1px solid #5DCDFF;
  background-color: #e8f4ff;
}

.checkbox-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 14px;
  color: #5DCDFF;
}

.checkbox-item.active .checkbox-icon {
  background-color: #5DCDFF;
  border-color: #5DCDFF;
  color: white;
}

.select-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 问题描述输入框 */
.description-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
}

/* 图片上传 */
.image-upload-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.image-item {
  position: relative;
  width: 80px;
  height: 80px;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden;
}

.uploaded-image {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.upload-btn {
  width: 80px;
  height: 80px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  color: #999;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.upload-text {
  font-size: 12px;
}

.image-tip {
  font-size: 12px;
  color: #999;
}

/* 提交按钮 */
.submit-container {
  margin-top: 15px;
}

.submit-btn {
  width: 100%;
  height: 45px;
  background-color: #5DCDFF;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
}

.submit-btn:active {
  background-color: #4ab8e8;
}
</style>