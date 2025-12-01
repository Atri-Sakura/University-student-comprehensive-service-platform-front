<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-back" @click="navBack">&lt;</text>
        <text class="nav-title">确认支付</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-section">
      <view class="section-title">订单信息</view>
      <view class="order-info">
        <view class="info-item">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ orderInfo.id || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">餐厅</text>
          <text class="info-value">{{ orderInfo.restaurantName || '-' }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">订单时间</text>
          <text class="info-value">{{ formatTime(orderInfo.createTime) }}</text>
        </view>
      </view>
    </view>

    <!-- 收货信息 -->
    <view class="address-section">
      <view class="section-title">收货信息</view>
      <view class="address-info" v-if="orderInfo.address && (orderInfo.address.name || orderInfo.address.phone || orderInfo.address.address)">
        <view class="address-top">
          <text class="address-name">{{ orderInfo.address.name || '-' }}</text>
          <text class="address-phone">{{ orderInfo.address.phone || '-' }}</text>
        </view>
        <text class="address-detail">{{ orderInfo.address.address || '-' }}</text>
      </view>
      <view v-else class="empty-info">暂无收货信息</view>
    </view>

    <!-- 支付方式 -->
    <view class="payment-section">
      <view class="section-title">支付方式</view>
      <view class="payment-options">
        <view class="payment-option" 
              v-for="option in paymentOptions" 
              :key="option.id" 
              @click="selectPayment(option.id)"
              :class="{ 'selected': selectedPayment === option.id }">
          <view class="option-left">
            <text class="option-icon">{{ option.icon }}</text>
            <text class="option-name">{{ option.name }}</text>
          </view>
          <view class="option-right">
            <text class="option-check" v-if="selectedPayment === option.id">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="remark-section" v-if="orderInfo.remark">
      <view class="section-title">订单备注</view>
      <view class="remark-content">{{ orderInfo.remark }}</view>
    </view>

    <!-- 价格明细 -->
    <view class="price-section">
      <view class="price-item">
        <text class="price-label">商品金额</text>
        <text class="price-value">¥{{ (orderInfo.itemsTotal || 0).toFixed(2) }}</text>
      </view>
      <view class="price-item">
        <text class="price-label">配送费</text>
        <text class="price-value">¥{{ (orderInfo.deliveryFee || 0).toFixed(2) }}</text>
      </view>
      <view class="price-item" v-if="orderInfo.discountAmount > 0">
        <text class="price-label">优惠</text>
        <text class="price-value discount">-¥{{ (orderInfo.discountAmount || 0).toFixed(2) }}</text>
      </view>
    </view>

    <!-- 底部支付栏 -->
    <view class="bottom-bar">
      <view class="total-info">
        <text class="total-label">实付款：</text>
        <text class="total-price">¥{{ (orderInfo.totalAmount || 0).toFixed(2) }}</text>
      </view>
      <view class="pay-btn" @click="handlePayment" :disabled="isProcessing">
        <text>{{ isProcessing ? '处理中...' : '立即支付' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import foodApi from '../../api/food.js';

export default {
  data() {
    return {
      statusBarHeight: 0,
      options: {}, // 保存页面参数
      orderInfo: {
        id: '',
        restaurantName: '',
        restaurant: {},
        items: [],
        address: {
          name: '',
          phone: '',
          address: ''
        },
        deliveryTime: '尽快送达',
        remark: '',
        itemsTotal: 0,
        deliveryFee: 0,
        discountAmount: 0,
        totalAmount: 0,
        status: 'pending',
        createTime: new Date().toISOString()
      },
      selectedPayment: 'wechat', // 默认选择微信支付
      isProcessing: false,
      paymentOptions: [
        { id: 'wechat', name: '微信支付', icon: '💳' },
        { id: 'alipay', name: '支付宝', icon: '💸' },
        { id: 'balance', name: '余额付款', icon: '💎' }
      ]
    };
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    
    // 保存页面参数到data中，以便在navBack方法中使用
    this.options = options;
    
    // 解析URL参数
    console.log('页面参数:', options);
    
    // 从本地存储获取订单数据
    const savedOrder = uni.getStorageSync('currentOrder');
    if (savedOrder) {
      // 检查savedOrder的id是否与options.orderId匹配，如果没有options.orderId则直接使用
      // 将id转换为字符串进行比较，避免类型不匹配问题
      const savedOrderId = String(savedOrder.id);
      const optionsOrderId = String(options.orderId || '');
      if (!options.orderId || savedOrderId === optionsOrderId) {
        // 直接合并保存的订单数据，保留所有字段
        const orderData = {
          ...this.orderInfo,
          ...savedOrder
        };
        console.log('合并前的savedOrder:', savedOrder);
        console.log('合并后的orderData:', orderData);
        console.log('savedOrder中的restaurant:', savedOrder.restaurant);
        console.log('orderData中的restaurant:', orderData.restaurant);
        
        // 处理餐厅名称：如果restaurantName不存在，使用merchantName作为备选
        if (!orderData.restaurantName) {
          orderData.restaurantName = savedOrder.merchantName || this.restaurant?.name || '';
        }
        
        // 确保restaurant对象存在且包含完整信息
        // 合并savedOrder中的restaurant属性到现有的restaurant对象，确保包含完整的商家地址
        orderData.restaurant = {
          ...(orderData.restaurant || {}),
          ...(savedOrder.restaurant || {})
        };
        console.log('从savedOrder合并的完整restaurant对象:', orderData.restaurant);
        // 如果restaurant对象存在但名称为空，设置名称
        if (orderData.restaurant && !orderData.restaurant.name) {
          orderData.restaurant.name = orderData.restaurantName || savedOrder.merchantName || '';
        }
        
        // 处理地址信息：确保orderInfo.address是完整的地址对象
        if (savedOrder.deliverContact && savedOrder.deliverPhone && savedOrder.deliverAddress) {
          // 如果订单数据中有deliverContact、deliverPhone和deliverAddress字段，使用它们构建地址对象
          orderData.address = {
            name: savedOrder.deliverContact,
            phone: savedOrder.deliverPhone,
            address: savedOrder.deliverAddress,
            fullAddress: savedOrder.deliverAddress
          };
        } else if (savedOrder.address && typeof savedOrder.address === 'object') {
          // 如果已有地址对象，直接使用
          orderData.address = savedOrder.address;
        } else if (savedOrder.address && typeof savedOrder.address === 'string') {
          // 如果address是字符串，转换为对象格式
          orderData.address = {
            name: '',
            phone: '',
            address: savedOrder.address,
            fullAddress: savedOrder.address
          };
        } else {
          // 如果没有地址信息，创建默认空对象
          orderData.address = {
            name: '',
            phone: '',
            address: '',
            fullAddress: ''
          };
        }
        
        // 添加addressInfo字段以便统一处理
        orderData.addressInfo = orderData.address;
        
        // 确保保存所有可能的商家ID字段
        const merchantIdFields = ['restaurantId', 'merchantId', 'shopId', 'storeId', 'vendorId', 'merchantBaseId'];
        for (const field of merchantIdFields) {
          if (savedOrder[field]) {
            orderData[field] = savedOrder[field];
          }
        }
        
        // 确保restaurantId始终存在
        orderData.restaurantId = orderData.restaurantId || orderData.restaurant?.id || orderData.merchantId || orderData.shopId || orderData.storeId || '';
        
        // 确保items字段存在，避免支付时验证失败
        if (!orderData.items || orderData.items.length === 0) {
          orderData.items = savedOrder.items || [];
        }
        
        // 直接使用保存的金额字段，不要重新计算，确保与预支付订单创建时的金额完全一致
        // 检查是否有前端计算的金额字段
        if (savedOrder.itemsTotal !== undefined) {
          orderData.itemsTotal = savedOrder.itemsTotal;
        }
        
        if (savedOrder.deliveryFee !== undefined) {
          orderData.deliveryFee = savedOrder.deliveryFee;
        }
        
        if (savedOrder.discountAmount !== undefined) {
          orderData.discountAmount = savedOrder.discountAmount;
        }
        
        // 直接使用保存的总金额，不要重新计算，确保与预支付订单创建时的金额完全一致
        if (savedOrder.totalAmount !== undefined) {
          orderData.totalAmount = savedOrder.totalAmount;
        }
        
        // 确保创建时间存在
        if (!orderData.createTime) {
          orderData.createTime = new Date().toISOString();
        }
        
        console.log('订单金额信息 - 前端计算值:', {
          itemsTotal: savedOrder.itemsTotal,
          deliveryFee: savedOrder.deliveryFee,
          discountAmount: savedOrder.discountAmount,
          totalAmount: savedOrder.totalAmount
        });
        
        this.orderInfo = orderData;
        console.log('从本地存储加载到订单信息:', this.orderInfo);
        console.log('订单信息中的商家ID:', this.orderInfo.restaurantId);
        console.log('订单信息中的餐厅名称:', this.orderInfo.restaurantName);
        console.log('订单信息中的预支付订单号:', this.orderInfo.prepayOrderId || this.orderInfo.orderNo || this.orderInfo.prepay_id || this.orderInfo.prepayId);
        console.log('订单信息中的地址对象:', this.orderInfo.address || this.orderInfo.addressInfo);
        console.log('订单信息中的商品信息:', this.orderInfo.items);
      }
    }
    
    // 如果本地存储没有订单信息，或者id不匹配，尝试从URL参数构建订单信息
    if (!this.orderInfo.id || !this.orderInfo.restaurantName) {
      // 从参数构建基本信息
      const basicOrderInfo = {
        id: options.orderId || '',
        totalAmount: parseFloat(options.amount) || 0,
        restaurantName: decodeURIComponent(options.title || ''),
        restaurantId: options.restaurantId || options.shopId || options.storeId || '',
        restaurant: {
          id: options.restaurantId || options.shopId || options.storeId || '',
          name: decodeURIComponent(options.title || '')
        },
        createTime: new Date().toISOString(),
        address: {
          name: '',
          phone: '',
          address: '',
          fullAddress: '',
          province: '',
          city: '',
          district: '',
          detail: ''
        }
      };
      
      // 更新订单信息
      this.orderInfo = {
        ...this.orderInfo,
        ...basicOrderInfo
      };
      
      console.log('从URL参数构建订单信息:', this.orderInfo);
    }
    
    console.log('最终订单信息:', this.orderInfo);
  },
  methods: {
    // 返回上一页
    navBack() {
      uni.navigateBack();
    },
    
    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    // 选择支付方式
    selectPayment(paymentId) {
      this.selectedPayment = paymentId;
      console.log('选择支付方式:', paymentId);
    },
    
    // 处理支付
    async handlePayment() {
      if (this.isProcessing) return;
      
      this.isProcessing = true;
      
      try {
        // 所有支付方式都需要密码验证
        this.showPaymentDialog();
      } finally {
        this.isProcessing = false;
      }
    },
    
    // 显示支付确认弹窗
    showPaymentDialog() {
      // 模拟弹窗，实际应该调用支付SDK或自定义密码输入组件
      uni.showModal({
        title: '支付确认',
        content: `确认使用${this.getSelectedPaymentName()}支付¥${(this.orderInfo.totalAmount || 0).toFixed(2)}吗？`,
        success: (res) => {
          if (res.confirm) {
            // 调用真实支付API
            this.doPayment();
          }
        }
      });
    },
    
    // 执行支付请求
    async doPayment() {
      let loadingShown = false;
      try {
        this.isProcessing = true;
        uni.showLoading({ title: '支付处理中...' });
        loadingShown = true;
        
        // 调用后端支付API
        const payTypeMap = {
          'wechat': 2,
          'alipay': 3,
          'balance': 1
        };
        
        const payType = payTypeMap[this.selectedPayment];
        
        // 1. 检查订单信息中是否已经包含预支付信息
        console.log('检查订单信息中是否包含预支付信息');
        
        // 提取预订单号，尝试不同的字段名称
        const prepayOrderId = this.orderInfo.preOrderNo || this.orderInfo.prepayOrderId || this.orderInfo.orderNo || this.orderInfo.prepay_id || this.orderInfo.prepayId || this.orderInfo.orderId || this.orderInfo.id;
        
        console.log('尝试从订单信息中获取预订单号，可用字段:', {
          preOrderNo: this.orderInfo.preOrderNo,
          prepayOrderId: this.orderInfo.prepayOrderId,
          orderNo: this.orderInfo.orderNo,
          orderId: this.orderInfo.orderId,
          id: this.orderInfo.id
        });
        
        if (!prepayOrderId) {
          // 如果没有预订单号，尝试从URL参数中获取
          const options = this.$root.$mp.query;
          const urlPrepayId = options.prepayOrderId || options.orderNo || options.preOrderNo || options.orderId;
          if (urlPrepayId) {
            console.log('从URL参数获取到预订单号:', urlPrepayId);
            prepayOrderId = urlPrepayId;
          } else {
            throw new Error('未获取到预订单号，请返回上一页重新下单');
          }
        }
        
        console.log('从订单信息中获取到预订单号:', prepayOrderId);
        
        // 2. 根据用户提供的接口字段要求，构建正确的支付请求数据
        // 优先使用预支付订单返回的amount字段，确保与后端存储的金额一致
        // 注意：根据调试结果，后端期望金额以元为单位，且需要保留两位小数
        let payAmount;
        
        // 首先检查是否有后端返回的amount字段，这是最可靠的金额来源
        if (this.orderInfo.amount !== undefined) {
          payAmount = this.orderInfo.amount;
          console.log('使用预支付订单返回的amount:', payAmount);
        } else if (this.orderInfo.totalAmount !== undefined) {
          // 如果没有后端返回的amount，使用前端保存的totalAmount
          payAmount = this.orderInfo.totalAmount;
          console.log('使用前端保存的totalAmount:', payAmount);
        } else {
          // 如果都没有，尝试从订单信息中重新计算
          const itemsTotal = this.orderInfo.itemsTotal || 0;
          const deliveryFee = this.orderInfo.deliveryFee || 0;
          const discountAmount = this.orderInfo.discountAmount || 0;
          payAmount = itemsTotal + deliveryFee - discountAmount;
          console.log('重新计算支付金额:', {
            itemsTotal,
            deliveryFee,
            discountAmount,
            calculatedAmount: payAmount
          });
        }
        
        // 确保支付金额保留两位小数，这是金融系统的常见要求
        payAmount = parseFloat(payAmount.toFixed(2));
        
        // 输出详细的金额调试信息
        console.log('最终支付金额调试信息:', {
          '预支付订单返回的amount': this.orderInfo.amount,
          '前端保存的totalAmount': this.orderInfo.totalAmount,
          '商品总价': this.orderInfo.itemsTotal,
          '配送费': this.orderInfo.deliveryFee,
          '优惠金额': this.orderInfo.discountAmount,
          '处理后的payAmount（元）': payAmount,
          '金额类型': typeof payAmount
        });
        
        // 再次验证金额，确保与预支付订单创建时的金额一致
        console.log('预支付订单号:', prepayOrderId);
        console.log('准备使用该金额支付:', payAmount);
        
        // 从本地存储获取用户ID，优先使用user_base_id
        let userId = uni.getStorageSync('user_base_id');
        // 如果没有user_base_id，再尝试从userId获取
        if (!userId) {
          userId = uni.getStorageSync('userId');
          // 如果本地存储没有userId，尝试从token中解析
          const token = uni.getStorageSync('token');
          if (!userId && token) {
            try {
              const tokenParts = token.split('.');
              if (tokenParts.length === 3) {
                // 解码JWT payload
                const base64Url = tokenParts[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const paddedBase64 = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=');
                const payload = JSON.parse(atob(paddedBase64));
                // 从token中获取user_base_id
                if (payload.user_base_id) {
                  userId = String(payload.user_base_id);
                  // 保存到本地存储，以便后续使用
                  uni.setStorageSync('user_base_id', userId);
                  uni.setStorageSync('userId', userId);
                  console.log('从token中解析到并保存的user_base_id:', userId);
                }
              }
            } catch (error) {
              console.error('从token解析user_base_id失败:', error);
            }
          }
        }
        // 确保userId是字符串类型
        userId = String(userId);
        console.log('最终使用的用户ID:', userId);
        
        // 构建符合新接口要求的请求数据，包含完整的订单信息，特别是商家地址
        // 确保商家地址信息被正确传递，特别是pick开头的取货地址字段
        
        // 从orderInfo或restaurant对象中获取商家信息
        const merchantId = this.orderInfo.restaurantId || this.orderInfo.merchantId || this.orderInfo.restaurant?.id || '';
        const merchantName = this.orderInfo.restaurantName || this.orderInfo.merchantName || this.orderInfo.restaurant?.name || '';
        const merchantAddress = this.orderInfo.restaurant?.address || this.orderInfo.restaurant?.addressInfo || this.orderInfo.restaurant?.location || '';
        
        // 构建商家地址的结构化信息
        const structuredMerchantAddress = `${this.orderInfo.restaurant?.province || ''}${this.orderInfo.restaurant?.city || ''}${this.orderInfo.restaurant?.district || ''}${this.orderInfo.restaurant?.detail || ''}`;
        
        // 最终使用的商家地址，优先使用完整地址，其次使用结构化地址，最后使用商家ID作为标识
        const finalMerchantAddress = merchantAddress || (structuredMerchantAddress && structuredMerchantAddress !== '') ? structuredMerchantAddress : `商家${merchantId}地址`;
        
        // 构建配送地址信息
        const deliverAddress = this.orderInfo.address?.fullAddress || this.orderInfo.address?.address || this.orderInfo.deliverAddress || '';
        const deliverContact = this.orderInfo.address?.name || this.orderInfo.deliverContact || '';
        const deliverPhone = this.orderInfo.address?.phone || this.orderInfo.deliverPhone || '';
        
        // 构建完整的支付请求数据
        const paymentRequestData = {
          preOrderNo: prepayOrderId,
          payAmount: payAmount,
          payType: payType,
          // 用户标识字段
          userId: userId,
          user_base_id: userId,
          // 商家基本信息
          merchantId: merchantId,
          merchantName: merchantName,
          merchantBaseId: merchantId,
          // 餐厅信息
          restaurantId: merchantId,
          restaurantName: merchantName,
          // 完整的餐厅对象，确保包含地址信息
          restaurant: {
            ...(this.orderInfo.restaurant || {}),
            id: merchantId,
            name: merchantName,
            address: finalMerchantAddress,
            // 确保结构化地址字段存在
            province: this.orderInfo.restaurant?.province || '',
            city: this.orderInfo.restaurant?.city || '',
            district: this.orderInfo.restaurant?.district || '',
            detail: this.orderInfo.restaurant?.detail || ''
          },
          // 直接传递的商家地址字段
          merchantAddress: finalMerchantAddress,
          restaurantAddress: finalMerchantAddress,
          address: finalMerchantAddress,
          // 结构化地址字段
          restaurantProvince: this.orderInfo.restaurant?.province || '',
          restaurantCity: this.orderInfo.restaurant?.city || '',
          restaurantDistrict: this.orderInfo.restaurant?.district || '',
          restaurantDetail: this.orderInfo.restaurant?.detail || '',
          province: this.orderInfo.restaurant?.province || '',
          city: this.orderInfo.restaurant?.city || '',
          district: this.orderInfo.restaurant?.district || '',
          detail: this.orderInfo.restaurant?.detail || '',
          // 配送地址信息
          deliverAddress: deliverAddress,
          deliverContact: deliverContact,
          deliverPhone: deliverPhone,
          // 确保包含deliverAddressId字段
          deliverAddressId: this.orderInfo.deliverAddressId || '',
          // 包含经纬度信息
          deliverLongitude: this.orderInfo.deliverLongitude || this.orderInfo.address?.longitude || 0,
          deliverLatitude: this.orderInfo.deliverLatitude || this.orderInfo.address?.latitude || 0,
          // 包含订单备注
          remark: this.orderInfo.remark || '',
          // 包含订单商品列表
          items: this.orderInfo.items || [],
          // 关键修复：添加商家取货地址相关字段，这是成功订单中必需的字段
          pickAddress: finalMerchantAddress,
          pickAddressId: merchantId,
          pickContact: merchantName,
          pickPhone: this.orderInfo.restaurant?.phone || this.orderInfo.restaurant?.contactPhone || '',
          pickLongitude: this.orderInfo.restaurant?.longitude || this.orderInfo.restaurant?.lng || 0,
          pickLatitude: this.orderInfo.restaurant?.latitude || this.orderInfo.restaurant?.lat || 0
        };
        
        console.log('=== 调试 - 最终支付请求数据 ===');
        console.log(JSON.stringify(paymentRequestData, null, 2));
        console.log('=== 调试 - 关键商家地址字段 ===');
        console.log('pickAddress:', paymentRequestData.pickAddress);
        console.log('merchantAddress:', paymentRequestData.merchantAddress);
        console.log('restaurant.address:', paymentRequestData.restaurant.address);
        console.log('构建的支付请求数据:', paymentRequestData);
        
        // 添加token存在性检查
        const token = uni.getStorageSync('token');
        console.log('检查本地存储中的token:', token ? '存在' : '不存在');
        console.log('token值:', token);
        console.log('token类型:', typeof token);
        console.log('token长度:', token ? token.length : 0);
        
        // 如果token不存在或格式不正确，提示用户重新登录
        if (!token || typeof token !== 'string' || token.length < 10) {
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          });
          // 跳转到登录页面
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/login/login'
            });
          }, 2000);
          return;
        }
        
        console.log('准备调用支付API，请求数据:', paymentRequestData);
        console.log('开始发送支付请求...');
        // 调用支付并创建订单接口，这是符合用户要求的生成订单接口
        const payRes = await foodApi.payAndCreateOrder(paymentRequestData);
        console.log('支付API响应:', payRes);
        
        console.log('支付API响应:', payRes);
        
        // 先隐藏loading，再显示toast
        if (loadingShown) {
          uni.hideLoading();
          loadingShown = false;
        }
        
        if (payRes.code === 200 && payRes.data) {
          // 支付成功
          this.paymentSuccess(payRes.data);
        } else {
          // 支付失败，显示详细错误信息
          uni.showToast({
            title: payRes.msg || payRes.message || '支付失败',
            icon: 'none',
            duration: 3000 // 延长显示时间，让用户能看清错误信息
          });
        }
      } catch (error) {
        console.error('支付请求失败:', error);
        // 先隐藏loading，再显示toast
        if (loadingShown) {
          uni.hideLoading();
          loadingShown = false;
        }
        uni.showToast({
          title: error.message || '网络异常，支付失败',
          icon: 'none',
          duration: 3000
        });
      } finally {
        this.isProcessing = false;
        // 确保loading被正确隐藏
        if (loadingShown) {
          uni.hideLoading();
        }
      }
    },
    
    // 获取选中的支付方式名称
    getSelectedPaymentName() {
      const payment = this.paymentOptions.find(option => option.id === this.selectedPayment);
      return payment ? payment.name : '';
    },
    
    // 支付成功处理
    paymentSuccess(paymentData) {
      // 更新订单状态
      this.orderInfo.status = 'paid';
      this.orderInfo.paymentTime = new Date().toISOString();
      this.orderInfo.paymentMethod = this.selectedPayment;
      this.orderInfo.paymentId = paymentData.paymentId || '';
      
      // 保存更新后的订单信息
      uni.setStorageSync('currentOrder', this.orderInfo);
      
      // 显示成功提示
      uni.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000
      });
      
      // 延迟跳转到外卖点餐首页，使用reLaunch清空整个页面栈
      setTimeout(() => {
        // 使用订单信息中的餐厅ID作为商家ID
        const restaurantId = this.orderInfo.restaurantId || this.orderInfo.restaurant?.id || this.orderInfo.merchantId || '';
        
        // 使用reLaunch清空所有页面栈，只保留外卖点餐页面
        // 这样点击返回按钮会回到首页，而不是提交订单页面
        uni.reLaunch({
          url: `/pages/food/food?restaurantId=${restaurantId}`
        });
      }, 2000);
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
  background: linear-gradient(135deg, #5DCDFF 0%, #4AA9FF 100%);
  z-index: 999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

/* 订单信息 */
.order-section,
.address-section,
.payment-section,
.remark-section,
.price-section {
  margin-top: 20rpx;
  background-color: #FFFFFF;
  padding: 20rpx;
}

.order-section {
  margin-top: calc(var(--status-bar-height, 0px) + 44px);
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.order-info,
.address-info,
.payment-options {
  border-top: 1px solid #F0F0F0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid #F0F0F0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666666;
}

.info-value {
  font-size: 28rpx;
  color: #333333;
  max-width: 60%;
  text-align: right;
  word-break: break-all;
}

/* 收货信息 */
.address-info {
  padding: 20rpx 0;
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

.empty-info {
  text-align: center;
  padding: 40rpx 0;
  color: #999999;
  font-size: 28rpx;
}

/* 支付方式 */
.payment-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #F0F0F0;
}

.payment-option:last-child {
  border-bottom: none;
}

.payment-option.selected {
  background-color: #F0FCFF;
  transition: all 0.3s ease;
}

.option-left {
  display: flex;
  align-items: center;
}

.option-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.option-name {
  font-size: 32rpx;
  color: #333333;
}

.option-check {
  font-size: 36rpx;
  color: #4AA9FF;
  font-weight: bold;
}

/* 订单备注 */
.remark-content {
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.4;
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
  color: #FF6B6B;
}

.discount {
  color: #FF6B6B;
}

/* 底部支付栏 */
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

.pay-btn {
  background: linear-gradient(135deg, #5DCDFF 0%, #4AA9FF 100%);
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(93, 205, 255, 0.3);
  transition: all 0.3s ease;
}

.pay-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(93, 205, 255, 0.3);
}

.pay-btn:disabled {
  background-color: #CCCCCC;
  opacity: 0.7;
  box-shadow: none;
}
</style>