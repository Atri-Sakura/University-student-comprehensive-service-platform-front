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
        <!-- 取货地址 -->
        <view class="form-item">
          <text class="form-label">取货地址</text>
          <view class="form-input-group">
            <view class="form-input">
              <select v-model="form.pickProvince" @change="onProvinceChange">
                <option value="">请选择省份</option>
                <option v-for="province in provinces" :key="province.name" :value="province.name">{{ province.name }}</option>
              </select>
            </view>
            <view class="form-input">
              <select v-model="form.pickCity" @change="onCityChange">
                <option value="">请选择城市</option>
                <option v-for="city in cities" :key="city.name" :value="city.name">{{ city.name }}</option>
              </select>
            </view>
            <view class="form-input">
              <select v-model="form.pickDistrict">
                <option value="">请选择区/县</option>
                <option v-for="district in districts" :key="district" :value="district">{{ district }}</option>
              </select>
            </view>
            <view class="form-input">
              <input type="text" v-model="form.pickDetailAddress" placeholder="详细地址" />
            </view>
          </view>
        </view>

        <!-- 收货地址 -->
        <view class="form-item">
          <text class="form-label">收货地址</text>
          <view class="form-input" @click="selectDeliverAddress">
            <text v-if="selectedDeliverAddress" class="address-text">{{ selectedDeliverAddress.fullAddress }}</text>
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
        <button class="submit-btn" :disabled="submitting" @click="submitOrder">{{ submitting ? '提交中...' : '立即下单' }}</button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { createErrandPrepay } from '@/api/errand.js'
import { getAddressList } from '@/api/address.js'
import { regionData } from '@/utils/region-data.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      selectedService: null,
      submitting: false, // 防止重复提交
      serviceTypes: [
        { id: 1, name: '取快递', icon: '📦' },
        { id: 2, name: '买食物', icon: '🍱' },
        { id: 3, name: '代买物品', icon: '🛒' },
        { id: 4, name: '其他', icon: '📝' }
      ],
      timeOptions: [],
      addressList: [], // 地址列表
      selectedDeliverAddress: null, // 选中的收货地址
      form: {
          goodsName: '',
          goodsPrice: '',
          servicePrice: '',
          pickupTime: '',
          remark: '',
          description: '', // 物品描述
          pickProvince: '', // 取货省份
          pickCity: '', // 取货城市
          pickDistrict: '', // 取货区/县
          pickDetailAddress: '' // 取货详细地址
        },
        // 省市区数据
        provinces: regionData, // 省份列表
        cities: [], // 城市列表
        districts: [] // 区/县列表
    };
  },
  computed: {
    estimatedPrice() {
      let servicePrice = parseFloat(this.form.servicePrice) || 0;
      let goodsPrice = parseFloat(this.form.goodsPrice) || 0;
      
      // 取快递：只需服务费
      // 其他（买食物、代买物品、其他）：商品价格 + 服务费
      if (this.selectedService && this.selectedService.name === '取快递') {
        return servicePrice;
      } else {
        return goodsPrice + servicePrice;
      }
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
          
          // 自动选择默认地址作为收货地址
          const defaultAddr = this.addressList.find(addr => addr.isDefault === 1);
          if (defaultAddr && !this.selectedDeliverAddress) {
            this.selectedDeliverAddress = defaultAddr;
          }
        }
      } catch (error) {
        // 加载地址列表失败
      }
    },
    

    
    // 选择收货地址
    selectDeliverAddress() {
      this.selectAddressCommon('deliver');
    },
    
    // 省份选择变化
    onProvinceChange() {
      if (this.form.pickProvince) {
        // 找到选中的省份
        const province = this.provinces.find(p => p.name === this.form.pickProvince);
        if (province) {
          this.cities = province.cities;
          this.form.pickCity = '';
          this.districts = [];
          this.form.pickDistrict = '';
        }
      } else {
        this.cities = [];
        this.form.pickCity = '';
        this.districts = [];
        this.form.pickDistrict = '';
      }
    },
    
    // 城市选择变化
    onCityChange() {
      if (this.form.pickCity) {
        // 找到选中的城市
        const city = this.cities.find(c => c.name === this.form.pickCity);
        if (city) {
          this.districts = city.districts;
          this.form.pickDistrict = '';
        }
      } else {
        this.districts = [];
        this.form.pickDistrict = '';
      }
    },
    
    // 通用地址选择方法
    selectAddressCommon(type) {
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
      
      const title = '选择收货地址';
      
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
            this.selectedDeliverAddress = this.addressList[res.tapIndex];
          }
        }
      });
    },
    
    // 选择服务类型
    selectService(service) {
      this.selectedService = service;
    },
    
    // 获取跑腿类型（errandType）
    getErrandType(serviceName) {
      const typeMap = {
        '取快递': 1, // 帮我送
        '买食物': 2, // 帮我买
        '代买物品': 2, // 帮我买
        '其他': 1 // 默认帮我送
      };
      return typeMap[serviceName] || 1;
    },
      
    // 提交订单
    async submitOrder() {
      // 防止重复提交
      if (this.submitting) {
        return;
      }
      
      // 表单验证
      if (!this.selectedService) {
        uni.showToast({
          title: '请选择服务类型',
          icon: 'none'
        });
        return;
      }
      // 验证取货地址
      if (!this.form.pickProvince || !this.form.pickCity || !this.form.pickDistrict || !this.form.pickDetailAddress) {
        uni.showToast({
          title: '请填写完整的取货地址',
          icon: 'none'
        });
        return;
      }
      if (!this.selectedDeliverAddress) {
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
      if (!this.form.servicePrice) {
        uni.showToast({
          title: '请输入服务费',
          icon: 'none'
        });
        return;
      }
      
      // 验证送货地址经纬度
      if (!this.selectedDeliverAddress.longitude || !this.selectedDeliverAddress.latitude) {
        uni.showToast({
          title: '收货地址缺少位置信息，请重新选择',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      try {
        this.submitting = true;
        uni.showLoading({
          title: '创建订单中...'
        });
        
        // 构建期望送达时间（当前时间 + 1小时）
        const today = new Date();
        today.setHours(today.getHours() + 1);
        const dateStr = today.toISOString().split('T')[0];
        const timeStr = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:00`;
        const expectTime = `${dateStr} ${timeStr}`;
        
        // 构建订单数据 - 按照后端CreateErrandOrderDto结构
        const deliverAddressId = this.selectedDeliverAddress.userAddressId;
        // 取快递不需要商品价格，其他服务类型需要
        const goodsPrice = this.selectedService.name === '取快递' ? 0 : (parseFloat(this.form.goodsPrice) || 0);
        const deliverAmount = parseFloat(this.form.servicePrice) || 0; // 配送费（后端字段名为deliverAmount）
        
        // 构建完整的取货地址用于显示
        const pickAddress = `${this.form.pickProvince} ${this.form.pickCity} ${this.form.pickDistrict} ${this.form.pickDetailAddress}`;
        
        const orderData = {
          orderType: 2, // 订单类型：2-跑腿单
          senderId: 1, // 发送者ID（可以从用户信息获取，暂时写死）
          merchantName: '取货点', // 商家名称
          // 取货地址信息
          pickAddressId: 0, // 取货地址ID（暂时写死，后端可能不需要）
          pickAddress: pickAddress, // 取货地址文本
          pickProvince: this.form.pickProvince, // 取货省份
          pickCity: this.form.pickCity, // 取货城市
          pickDistrict: this.form.pickDistrict, // 取货区/县
          pickDetailAddress: this.form.pickDetailAddress, // 取货详细地址
          pickContact: '默认联系人', // 取货联系人（暂时默认）
          pickPhone: '13800138000', // 取货电话（暂时默认）
          pickLongitude: 0, // 取货经度（暂时默认）
          pickLatitude: 0, // 取货纬度（暂时默认）
          // 送货地址信息
          deliverAddressId: deliverAddressId, // 送货地址ID（必填）
          deliverAddress: this.selectedDeliverAddress.fullAddress, // 送货地址文本
          goodsPrice: goodsPrice, // 商品价格（取快递时为0）
          deliverAmount: deliverAmount, // 配送费/服务费（后端必需字段）
          deliverContact: this.selectedDeliverAddress.receiverName, // 收货联系人
          deliverPhone: this.selectedDeliverAddress.receiverPhone, // 收货电话
          deliverLongitude: this.selectedDeliverAddress.longitude || 0, // 送货经度
          deliverLatitude: this.selectedDeliverAddress.latitude || 0, // 送货纬度
          remark: this.form.remark || '', // 订单备注
          expectTime: expectTime, // 预期送达时间（yyyy-MM-dd HH:mm:ss）
          goodsDesc: this.form.description || this.form.goodsName // 商品描述
        };
        
        // 调用创建预支付订单API
        const res = await createErrandPrepay(orderData);
        
        uni.hideLoading();
        
        if (res.code === 200 && res.data) {
          // 完全使用后端返回的金额
          const backendTotalAmount = res.data.totalAmount || res.data.payAmount;
          
          // 保存订单信息到本地存储，包含取货地址ID
        uni.setStorageSync('errandPrepayOrder', {
          preOrderNo: res.data.preOrderNo,
          totalAmount: backendTotalAmount,
          deliveryFee: parseFloat(this.form.servicePrice) || 0,
          goodsAmount: goodsPrice, // 使用计算后的商品价格
          expireTime: res.data.expireTime,
          pickupAddressId: 0, // 取货地址ID
          deliverAddressId: deliverAddressId, // 送货地址ID
          orderInfo: {
            ...orderData,
            serviceType: this.selectedService.name,
            errandType: this.getErrandType(this.selectedService.name)
          }
        });
          
          // 跳转到支付页面
          uni.navigateTo({
            url: `/pages/errand/errand-payment?preOrderNo=${res.data.preOrderNo}&totalPrice=${backendTotalAmount}`
          });
        } else {
          uni.showToast({
            title: res.msg || '创建订单失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: '创建订单失败，请重试',
          icon: 'none'
        });
      } finally {
        this.submitting = false;
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

/* 取货地址输入组 */
.form-input-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
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

.form-input input,
.form-input select {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  font-size: 28rpx;
  color: #333;
  background-color: transparent;
}
  
.form-input select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23999' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 20rpx center;
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
