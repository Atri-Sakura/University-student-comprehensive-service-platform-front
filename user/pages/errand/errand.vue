<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-back" @click="navBack">&lt;</text>
        <text class="nav-title">跑腿服务</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y :style="{ top: navHeight + 'px' }">
      <!-- 服务类型选择 -->
      <view class="service-types">
        <view class="service-item" 
              v-for="service in serviceTypes" 
              :key="service.id"
              @click="selectService(service)"
              :class="{ active: selectedService && selectedService.id === service.id }">
          <text class="service-icon">{{ service.icon }}</text>
          <text class="service-name">{{ service.name }}</text>
        </view>
      </view>

      <!-- 订单表单 -->
      <view class="order-form">
        <!-- 出发地 -->
        <view class="form-item">
          <text class="form-label">出发地</text>
          <view class="form-input">
            <input type="text" v-model="form.startLocation" placeholder="请输入出发地" />
          </view>
        </view>

        <!-- 目的地 -->
        <view class="form-item">
          <text class="form-label">目的地</text>
          <view class="form-input">
            <input type="text" v-model="form.endLocation" placeholder="请输入目的地" />
          </view>
        </view>

        <!-- 物品描述 -->
        <view class="form-item">
          <text class="form-label">物品描述</text>
          <view class="form-textarea">
            <textarea v-model="form.description" placeholder="请详细描述物品" rows="3"></textarea>
          </view>
        </view>

        <!-- 取件时间 -->
        <view class="form-item">
          <text class="form-label">取件时间</text>
          <view class="form-input">
            <input type="text" v-model="form.pickupTime" placeholder="请输入取件时间" />
          </view>
        </view>

        <!-- 配送费 -->
        <view class="form-item">
          <text class="form-label">配送费</text>
          <view class="form-input">
            <text class="price-symbol">¥</text>
            <input type="number" v-model="form.deliveryFee" placeholder="请输入配送费" />
          </view>
        </view>

        <!-- 联系方式 -->
        <view class="form-item">
          <text class="form-label">联系方式</text>
          <view class="form-input">
            <input type="tel" v-model="form.contact" placeholder="请输入手机号" />
          </view>
        </view>
      </view>
        
        <!-- 提交订单按钮 -->
      <view class="submit-section">
        <view class="price-info">
          <text class="price-label">预估费用</text>
          <text class="price-value" v-if="selectedService">¥{{ estimatedPrice }}</text>
          <text class="price-placeholder" v-else>请先选择服务类型</text>
        </view>
        <button class="submit-btn" @click="submitOrder">立即下单</button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      selectedService: null,
      serviceTypes: [
        { id: 1, name: '取快递', icon: '📦' },
        { id: 2, name: '买饭', icon: '🍱' },
        { id: 3, name: '买奶茶', icon: '🥤' },
        { id: 4, name: '代买物品', icon: '🛒' },
        { id: 5, name: '其他', icon: '📝' }
      ],
      form: {
          startLocation: '',
          endLocation: '',
          description: '',
          pickupTime: '',
          deliveryFee: '',
          contact: ''
        }
    };
  },
  computed: {
    estimatedPrice() {
      // 只有在选择了服务类型后才显示价格
      if (!this.selectedService) {
        return 0;
      }
      // 只计算配送费
      let price = 0;
      if (this.form.deliveryFee) {
        price = parseInt(this.form.deliveryFee) || 0;
      }
      return price;
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
  },
  methods: {
    // 返回上一页
    navBack() {
      uni.navigateBack();
    },
    // 选择服务类型
    selectService(service) {
      this.selectedService = service;
      },
      
      // 提交订单
    submitOrder() {
      // 简单的表单验证
      if (!this.selectedService) {
        uni.showToast({
          title: '请选择服务类型',
          icon: 'none'
        });
        return;
      }
      if (!this.form.startLocation || !this.form.endLocation) {
        uni.showToast({
          title: '请填写出发地和目的地',
          icon: 'none'
        });
        return;
      }
      if (!this.form.description) {
        uni.showToast({
          title: '请描述物品',
          icon: 'none'
        });
        return;
      }
      if (!this.form.pickupTime) {
        uni.showToast({
          title: '请填写取件时间',
          icon: 'none'
        });
        return;
      }
      if (!this.form.contact) {
        uni.showToast({
          title: '请填写联系方式',
          icon: 'none'
        });
        return;
      }

      // 保存表单数据到本地存储
      uni.setStorageSync('errandForm', this.form);
      uni.setStorageSync('selectedService', this.selectedService);
      
      // 跳转到支付页面
      uni.navigateTo({
        url: `/pages/payment/payment?amount=${this.estimatedPrice}&type=errand`
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

.nav-right {
  width: 40rpx;
}

/* 内容区域 */
.content {
  padding-bottom: 200rpx;
}

/* 服务类型选择 */
.service-types {
  display: flex;
  flex-wrap: wrap;
  background-color: #FFFFFF;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.service-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  box-sizing: border-box;
}

.service-item.active {
  background-color: #E3F4FF;
  margin: 0;
  padding: 20rpx 5rpx;
  border-radius: 10rpx;
}

.service-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.service-name {
  font-size: 24rpx;
  color: #666666;
}

/* 订单表单 */
.order-form {
  background-color: #FFFFFF;
  margin: 0 30rpx 30rpx 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.form-input {
  border: 1px solid #E0E0E0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
}

.form-input input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
}

.form-textarea {
  border: 1px solid #E0E0E0;
  border-radius: 10rpx;
  padding: 20rpx;
}

.form-textarea textarea {
  width: 100%;
  font-size: 28rpx;
  resize: none;
}

.price-symbol {
  font-size: 28rpx;
  color: #333333;
    margin-right: 10rpx;
  }
  
  /* 提交订单按钮 */
.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  padding: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 24rpx;
  color: #999999;
}

.price-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6B6B;
}

.price-placeholder {
  font-size: 28rpx;
  color: #999999;
}

.submit-btn {
  background-color: #5DCDFF;
  color: #FFFFFF;
  font-size: 32rpx;
  padding: 20rpx 60rpx;
  border-radius: 40rpx;
  border: none;
}

.submit-btn:active {
  opacity: 0.8;
}
</style>
