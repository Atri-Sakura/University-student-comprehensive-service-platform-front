<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-back" @click="navBack">&lt;</text>
        <text class="nav-title">确认订单</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 收货地址 -->
    <view class="address-section">
      <view class="address-card" @click="selectAddress">
        <view class="address-icon">📍</view>
        <view class="address-info">
          <view class="address-top">
            <text class="address-name">{{ selectedAddress.name || '请选择收货地址' }}</text>
            <text class="address-phone">{{ selectedAddress.phone || '' }}</text>
          </view>
          <text class="address-detail">{{ selectedAddress.address || '' }}</text>
        </view>
        <text class="address-arrow">›</text>
      </view>
    </view>

    <!-- 配送信息 -->
    <view class="delivery-section">
      <view class="section-title">配送信息</view>
      <view class="delivery-info">
        <view class="delivery-item" @click="selectDeliveryTime">
          <text class="delivery-label">配送时间</text>
          <text class="delivery-value">{{ selectedDeliveryTime || '尽快送达' }}</text>
          <text class="delivery-arrow">›</text>
        </view>
        <view class="delivery-item">
          <text class="delivery-label">餐厅</text>
          <text class="delivery-value">{{ restaurant.name }}</text>
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="order-section">
      <view class="section-title">商品信息</view>
      <view class="order-list">
        <view class="order-item" v-for="item in cartItems" :key="item.id">
          <view class="order-item-info">
            <text class="order-item-name">{{ item.name }}</text>
            <text class="order-item-desc">{{ item.description || '' }}</text>
          </view>
          <view class="order-item-price">
            <text class="price">¥{{ (item.price || 0).toFixed(2) }}</text>
            <text class="count">x{{ item.count }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="remark-section">
      <view class="section-title">订单备注</view>
      <input class="remark-input" v-model="orderRemark" placeholder="如有特殊要求，请在此备注" placeholder-style="color: #999;">
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="price-item">
        <text class="price-label">商品金额</text>
        <text class="price-value">¥{{ (itemsTotal || 0).toFixed(2) }}</text>
      </view>
      <view class="price-item">
        <text class="price-label">配送费</text>
        <text class="price-value">¥{{ (restaurant.deliveryFee || 0).toFixed(2) }}</text>
      </view>
      <view class="price-item" v-if="discountAmount > 0">
        <text class="price-label">优惠</text>
        <text class="price-value discount">-¥{{ (discountAmount || 0).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view class="bottom-bar">
      <view class="total-info">
        <text class="total-label">合计：</text>
        <text class="total-price">¥{{ (totalAmount || 0).toFixed(2) }}</text>
      </view>
      <view class="submit-btn" @click="submitOrder">
        <text>提交订单</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 0,
      restaurant: {},
      cartItems: [],
      selectedAddress: {
        name: '',
        phone: '',
        address: ''
      },
      selectedDeliveryTime: '',
      orderRemark: '',
      discountAmount: 0
    };
  },
  computed: {
    itemsTotal() {
      return this.cartItems.reduce((sum, item) => sum + item.price * item.count, 0);
    },
    totalAmount() {
      // 计算总价 = 商品总价 + 配送费 - 优惠金额
      let total = this.itemsTotal + this.restaurant.deliveryFee - this.discountAmount;
      return total < 0 ? 0 : total;
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    
    // 从本地存储获取购物车数据
    const cartData = uni.getStorageSync('foodCart');
    if (cartData) {
      this.restaurant = cartData.restaurant || {};
      this.cartItems = cartData.items || [];
      // 模拟优惠计算
      this.calculateDiscount();
    }
    
    // 尝试从本地存储恢复上次选择的地址（优先检查从地址选择页保存的selectedAddress）
    let savedAddress = uni.getStorageSync('selectedAddress');
    
    // 如果没有找到selectedAddress，再检查selectedOrderAddress
    if (!savedAddress || !savedAddress.name) {
      savedAddress = uni.getStorageSync('selectedOrderAddress');
    }
    
    if (savedAddress && savedAddress.name) {
      console.log('从本地存储恢复地址:', savedAddress);
      
      // 适配地址格式，确保address字段正确拼接
      const addressData = {
        name: savedAddress.name,
        phone: savedAddress.phone,
        address: savedAddress.address || 
                `${savedAddress.province || ''}${savedAddress.city || ''}${savedAddress.district || ''}${savedAddress.detail || ''}`
      };
      
      this.selectedAddress = addressData;
      
      // 清除临时存储的selectedAddress，避免下次重复加载
      uni.removeStorageSync('selectedAddress');
    } else {
      // 如果没有保存的地址，才加载默认地址
      this.loadDefaultAddress();
    }
  },
  methods: {
    // 返回上一页
    navBack() {
      uni.navigateBack();
    },
    
    // 选择收货地址
    selectAddress() {
      // 跳转到地址选择页面
      uni.navigateTo({
        url: '/pages/food/address-select'
      });
    },
    
    // 设置选中的地址（供地址选择页面调用）
    setSelectedAddress(address) {
      console.log('接收到的地址数据:', JSON.stringify(address));
      
      // 检查地址数据是否有效
      if (!address) {
        console.error('地址参数为undefined或null');
        uni.showToast({
          title: '地址数据异常',
          icon: 'none'
        });
        return;
      }
      
      if (!address.name) {
        console.error('地址对象缺少name属性');
        uni.showToast({
          title: '地址信息不完整',
          icon: 'none'
        });
        return;
      }
      
      try {
        // 深拷贝地址对象，避免引用问题，适配不同的字段名
        const newAddress = {
          name: address.name || address.receiver || '',
          phone: address.phone || '',
          // 确保地址拼接正确，处理undefined值
          address: `${address.province || ''}${address.city || ''}${address.district || ''}${address.detail || address.detailAddress || ''}`
        };
        
        console.log('新地址对象:', newAddress);
        
        // 使用Vue的响应式更新机制设置地址
        this.$set(this, 'selectedAddress', newAddress);
        
        // 保存到本地存储
        uni.setStorageSync('selectedOrderAddress', newAddress);
        // 同时清除临时存储的selectedAddress（如果存在）
        uni.removeStorageSync('selectedAddress');
        console.log('地址已保存到本地存储');
        
        // 显示成功提示
        uni.showToast({
          title: '地址选择成功',
          icon: 'success',
          duration: 1000
        });
      } catch (error) {
        console.error('设置地址时出错:', error);
        uni.showToast({
          title: '设置地址失败',
          icon: 'none'
        });
      }
    },
    
    // 选择配送时间
    selectDeliveryTime() {
      // 生成可选择的时间段，将"尽快送达"作为第一个选项
      const deliverySlots = ['尽快送达', ...this.generateDeliverySlots()];
      uni.showActionSheet({
        itemList: deliverySlots,
        success: (res) => {
          this.selectedDeliveryTime = deliverySlots[res.tapIndex];
        }
      });
    },
    
    // 生成配送时间段
    generateDeliverySlots() {
      const slots = [];
      const now = new Date();
      const currentHour = now.getHours();
      
      // 从当前时间的下一个小时开始，生成接下来的8个时间段（每小时一个）
      for (let i = 1; i <= 8; i++) {
        const startHour = (currentHour + i) % 24;
        const endHour = (startHour + 1) % 24;
        
        // 格式化时间段，例如："16:00-17:00"
        const slot = `${startHour.toString().padStart(2, '0')}:00-${endHour.toString().padStart(2, '0')}:00`;
        slots.push(slot);
      }
      
      return slots;
    },
    
    // 计算优惠金额
    calculateDiscount() {
      // 模拟优惠逻辑
      const totalBeforeDiscount = this.itemsTotal;
      if (totalBeforeDiscount >= 20) {
        this.discountAmount = 5;
      } else if (totalBeforeDiscount >= 10) {
        this.discountAmount = 2;
      }
    },
    
    // 加载默认地址
    loadDefaultAddress() {
      // 模拟数据，实际应从API获取
      this.selectedAddress = {
        name: '张三',
        phone: '138****1234',
        address: '学生公寓A栋101室'
      };
    },
    
    // 提交订单
    submitOrder() {
      // 简化地址验证逻辑
      if (!this.selectedAddress || !this.selectedAddress.name || this.selectedAddress.name === '请选择收货地址') {
        uni.showToast({
          title: '请选择收货地址',
          icon: 'none'
        });
        return;
      }
      
      // 构建订单数据
      const order = {
        id: Date.now(), // 模拟订单ID
        restaurantId: this.restaurant.id,
        restaurantName: this.restaurant.name,
        items: this.cartItems,
        address: this.selectedAddress,
        deliveryTime: this.selectedDeliveryTime || '尽快送达',
        remark: this.orderRemark,
        itemsTotal: this.itemsTotal,
        deliveryFee: this.restaurant.deliveryFee,
        discountAmount: this.discountAmount,
        totalAmount: this.totalAmount,
        status: 'pending',
        createTime: new Date().toISOString()
      };
      
      // 保存订单到本地存储（实际应该调用API）
      uni.setStorageSync('currentOrder', order);
      
      // 清空购物车
      uni.removeStorageSync('foodCart');
      
      // 跳转到food目录下的支付页面
      uni.navigateTo({
        url: `/pages/food/food-payment?orderId=${order.id}&amount=${order.totalAmount}&type=food&title=${encodeURIComponent(order.restaurantName)}`
      });
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
  background: linear-gradient(135deg, #FF8A65 0%, #FF6B47 100%);
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
}

.nav-right {
  width: 40rpx;
}

/* 收货地址 */
.address-section {
  padding-top: calc(var(--status-bar-height, 0px) + 44px);
  background-color: #FFFFFF;
  margin-bottom: 10rpx;
}

.address-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
}

.address-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.address-info {
  flex: 1;
}

.address-top {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.address-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 20rpx;
}

.address-phone {
  font-size: 28rpx;
  color: #666666;
}

.address-detail {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.4;
}

.address-arrow {
  font-size: 36rpx;
  color: #999999;
  margin-left: 20rpx;
}

/* 配送信息 */
.delivery-section,
.order-section,
.remark-section,
.price-section {
  background-color: #FFFFFF;
  margin-bottom: 10rpx;
  padding: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.delivery-info {
  border-top: 1px solid #F0F0F0;
}

.delivery-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #F0F0F0;
}

.delivery-item:last-child {
  border-bottom: none;
}

.delivery-label {
  font-size: 28rpx;
  color: #666666;
  width: 140rpx;
}

.delivery-value {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.delivery-arrow {
  font-size: 36rpx;
  color: #999999;
  margin-left: 20rpx;
}

/* 订单商品列表 */
.order-list {
  border-top: 1px solid #F0F0F0;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid #F0F0F0;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item-info {
  flex: 1;
}

.order-item-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
}

.order-item-desc {
  font-size: 24rpx;
  color: #999999;
  display: block;
}

.order-item-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.price {
  font-size: 28rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.count {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
}

/* 订单备注 */
.remark-input {
  border: 1px solid #E0E0E0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333333;
  min-height: 120rpx;
}

/* 价格明细 */
.price-item {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
}

.price-label {
  font-size: 28rpx;
  color: #666666;
}

.price-value {
  font-size: 28rpx;
  color: #333333;
}

.discount {
  color: #FF6B6B;
}

/* 底部结算栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #FFFFFF;
  border-top: 1px solid #E0E0E0;
}

.total-info {
  display: flex;
  align-items: center;
}

.total-label {
  font-size: 28rpx;
  color: #666666;
}

.total-price {
  font-size: 36rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.submit-btn {
  background: linear-gradient(135deg, #FF8A65 0%, #FF6B47 100%);
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
