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

        <!-- 收货地址 -->
        <view class="form-item">
          <text class="form-label">收货地址</text>
          <view class="form-input" @click="selectAddress">
            <text v-if="selectedAddress" class="address-text">{{ selectedAddress.fullAddress }}</text>
            <text v-else class="placeholder-text">请选择收货地址</text>
            <text class="arrow-icon">›</text>
          </view>
        </view>

        <!-- 商品名称 -->
        <view class="form-item">
          <text class="form-label">商品名称</text>
          <view class="form-input">
            <input type="text" v-model="form.goodsName" placeholder="请输入商品名称" />
          </view>
        </view>

        <!-- 商品价格 -->
        <view class="form-item">
          <text class="form-label">商品价格</text>
          <view class="form-input">
            <text class="price-symbol">¥</text>
            <input type="number" v-model="form.goodsPrice" placeholder="请输入商品价格" />
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
          <view class="form-input" @click="showTimePicker">
            <text v-if="form.pickupTime" class="time-text">{{ form.pickupTime }}</text>
            <text v-else class="placeholder-text">请选择取件时间</text>
          </view>
        </view>

        <!-- 服务费 -->
        <view class="form-item">
          <text class="form-label">服务费</text>
          <view class="form-input">
            <text class="price-symbol">¥</text>
            <input type="number" v-model="form.servicePrice" placeholder="请输入服务费" />
          </view>
        </view>

        <!-- 备注 -->
        <view class="form-item">
          <text class="form-label">备注</text>
          <view class="form-input">
            <input type="text" v-model="form.remark" placeholder="请输入备注信息" />
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
import { createErrandPrepay } from '@/api/errand.js'
import { getAddressList } from '@/api/address.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      selectedService: null,
      serviceTypes: [
        { id: 1, name: '取快递', icon: '📦' },
        { id: 2, name: '买食物', icon: '🍱' },
        { id: 3, name: '代买物品', icon: '🛒' },
        { id: 4, name: '其他', icon: '📝' }
      ],
      timeOptions: [],
      addressList: [], // 地址列表
      selectedAddress: null, // 选中的收货地址
      form: {
          startLocation: '',
          goodsName: '',
          goodsPrice: '',
          servicePrice: '',
          pickupTime: '',
          remark: ''
        }
    };
  },
  computed: {
    estimatedPrice() {
      // 计算总价：商品价格 + 服务费
      let goodsPrice = parseFloat(this.form.goodsPrice) || 0;
      let servicePrice = parseFloat(this.form.servicePrice) || 0;
      return goodsPrice + servicePrice;
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
    
    // 初始化时间选项（整点和半点）
    this.initTimeOptions();
    
    // 加载地址列表
    this.loadAddressList();
  },
  
  onShow() {
    // 页面显示时重新加载地址列表（用户可能添加了新地址）
    this.loadAddressList();
  },
  methods: {
    // 返回上一页
    navBack() {
      // 获取当前页面栈
      const pages = getCurrentPages();
      
      // 如果页面栈只有一个页面（刷新后的情况），则跳转到首页
      if (pages.length <= 1) {
        uni.redirectTo({
          url: '/pages/index/index'
        });
      } else {
        // 否则正常返回上一页
        uni.navigateBack();
      }
    },
    // 初始化时间选项
    initTimeOptions() {
      const times = [];
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, '0');
        times.push(`${hourStr}:00`);
        times.push(`${hourStr}:30`);
      }
      this.timeOptions = times;
    },
    
    // 显示时间选择器
    showTimePicker() {
      uni.showActionSheet({
        itemList: this.timeOptions,
        success: (res) => {
          this.form.pickupTime = this.timeOptions[res.tapIndex];
        }
      });
    },
    
    // 加载地址列表
    async loadAddressList() {
      try {
        const res = await getAddressList();
        if (res.code === 200 && res.data) {
          this.addressList = res.data.map(addr => {
            // 构建完整地址，过滤掉空值
            const parts = [
              addr.receiverName,
              addr.receiverPhone,
              addr.province,
              addr.city,
              addr.district,
              addr.detailAddress
            ].filter(item => item); // 过滤掉 undefined、null、空字符串
            
            return {
              ...addr,
              fullAddress: parts.join(' ')
            };
          });
          
          // 自动选择默认地址
          const defaultAddr = this.addressList.find(addr => addr.isDefault === 1);
          if (defaultAddr) {
            this.selectedAddress = defaultAddr;
          }
        }
      } catch (error) {
        console.error('加载地址列表失败：', error);
      }
    },
    
    // 选择收货地址
    selectAddress() {
      if (this.addressList.length === 0) {
        uni.showModal({
          title: '提示',
          content: '您还没有地址，是否前往添加？',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/mine/address'
              });
            }
          }
        });
        return;
      }
      
      // 添加"新增地址"选项
      const addressOptions = [
        ...this.addressList.map(addr => addr.fullAddress),
        '+ 添加新地址'
      ];
      
      uni.showActionSheet({
        itemList: addressOptions,
        success: (res) => {
          // 如果选择的是最后一项（添加新地址）
          if (res.tapIndex === this.addressList.length) {
            uni.navigateTo({
              url: '/pages/mine/address'
            });
          } else {
            // 选择已有地址
            this.selectedAddress = this.addressList[res.tapIndex];
          }
        }
      });
    },
    
    // 选择服务类型
    selectService(service) {
      this.selectedService = service;
    },
    
    // 获取服务类型代码
    getServiceTypeCode(serviceName) {
      const typeMap = {
        '取快递': 'EXPRESS',
        '买食物': 'FOOD',
        '代买物品': 'SHOPPING',
        '其他': 'OTHER'
      };
      return typeMap[serviceName] || 'OTHER';
    },
      
    // 提交订单
    async submitOrder() {
      // 表单验证
      if (!this.selectedService) {
        uni.showToast({
          title: '请选择服务类型',
          icon: 'none'
        });
        return;
      }
      if (!this.form.startLocation) {
        uni.showToast({
          title: '请输入出发地',
          icon: 'none'
        });
        return;
      }
      if (!this.selectedAddress) {
        uni.showToast({
          title: '请选择收货地址',
          icon: 'none'
        });
        return;
      }
      if (!this.form.goodsName) {
        uni.showToast({
          title: '请输入商品名称',
          icon: 'none'
        });
        return;
      }
      if (!this.form.pickupTime) {
        uni.showToast({
          title: '请选择取件时间',
          icon: 'none'
        });
        return;
      }
      if (!this.form.servicePrice) {
        uni.showToast({
          title: '请输入服务费',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({
          title: '创建订单中...'
        });
        
        // 构建期望送达时间（今天的日期 + 选择的时间）
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const expectedTime = `${dateStr} ${this.form.pickupTime}:00`;
        
        // 构建订单数据
        // 根据后端接口文档要求的字段
        const addressId = this.selectedAddress.userAddressId;
        const orderData = {
          serviceType: this.getServiceTypeCode(this.selectedService.name),
          goodsName: this.form.goodsName,
          goodsPrice: parseFloat(this.form.goodsPrice) || 0,
          servicePrice: parseFloat(this.form.servicePrice),
          totalPrice: this.estimatedPrice,
          deliverAddressId: addressId, // 送货地址ID（使用真实的地址ID）
          remark: `出发地: ${this.form.startLocation}${this.form.remark ? '\n备注: ' + this.form.remark : ''}`,
          expectedTime: expectedTime
        };
        
        console.log('=== 创建预订单调试 ===');
        console.log('提取的地址ID：', addressId);
        console.log('地址ID类型：', typeof addressId);
        console.log('地址ID是否为空：', !addressId);
        console.log('完整订单数据：', JSON.stringify(orderData, null, 2));
        console.log('orderData.deliverAddressId：', orderData.deliverAddressId);
        console.log('==================');
        
        // 调用创建预支付订单API
        const res = await createErrandPrepay(orderData);
        
        uni.hideLoading();
        
        if (res.code === 200 && res.data) {
          console.log('预订单创建成功：', res.data);
          
          // 保存订单信息到本地存储
          uni.setStorageSync('errandPrepayOrder', {
            preOrderNo: res.data.preOrderNo,
            payAmount: res.data.payAmount,
            totalAmount: res.data.totalAmount,
            goodsAmount: res.data.goodsAmount,
            deliveryFee: res.data.deliveryFee,
            discountAmount: res.data.discountAmount,
            expireTime: res.data.expireTime,
            deliverAddressId: this.selectedAddress.userAddressId, // 保存地址ID
            orderInfo: orderData
          });
          
          // 跳转到支付页面，传递预订单号和应付金额
          uni.navigateTo({
            url: `/pages/errand/errand-payment?preOrderNo=${res.data.preOrderNo}&totalPrice=${res.data.payAmount}`
          });
        } else {
          uni.showToast({
            title: res.msg || '创建订单失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('创建订单失败：', error);
        uni.hideLoading();
        uni.showToast({
          title: '创建订单失败，请重试',
          icon: 'none'
        });
      }
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
  margin-top: 30rpx;
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

.time-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.placeholder-text {
  flex: 1;
  font-size: 28rpx;
  color: #CCCCCC;
}

.address-text {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow-icon {
  font-size: 32rpx;
  color: #999999;
  margin-left: 10rpx;
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
