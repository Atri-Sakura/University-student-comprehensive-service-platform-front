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
import foodApi from '../../api/food.js';
import addressApi from '../../api/address.js';

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
      // 确保总价保留两位小数，与支付页面保持一致
      total = parseFloat(total.toFixed(2));
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
      
      // 从商家详情API重新获取配送费，确保数据一致性
      this.loadMerchantDeliveryFee();
    }
    
    // 从后端API加载默认地址，不再从本地存储获取
    this.loadDefaultAddress();
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
      
      try {
        // 深拷贝地址对象，避免引用问题，适配不同的字段名
        // 增强地址字段适配，支持更多可能的字段名
        const receiverName = address.name || address.receiver || address.consignee || '';
        const receiverPhone = address.phone || address.tel || address.mobile || '';
        
        // 确保姓名不为空
        if (!receiverName) {
          console.error('地址对象缺少姓名字段');
          uni.showToast({
            title: '地址信息不完整，缺少收货人姓名',
            icon: 'none'
          });
          return;
        }
        
        // 确保电话不为空
        if (!receiverPhone) {
          console.error('地址对象缺少电话字段');
          uni.showToast({
            title: '地址信息不完整，缺少联系电话',
            icon: 'none'
          });
          return;
        }
        
        // 增强地址拼接逻辑，支持更多可能的字段名和结构
        const province = address.province || address.prov || '';
        const city = address.city || '';
        const district = address.district || address.area || '';
        const detail = address.detail || address.detailAddress || address.addressDetail || address.address || '';
        
        // 构建完整地址字符串，确保所有信息都被包含
        let fullAddress = '';
        if (province && !detail.includes(province)) fullAddress += province;
        if (city && !detail.includes(city)) fullAddress += city;
        if (district && !detail.includes(district)) fullAddress += district;
        fullAddress += detail;
        
        // 如果拼接后的地址为空，使用原始地址字段
        if (!fullAddress) {
          fullAddress = address.address || '未知地址';
        }
        
        // 构建最终的选中地址对象，保存完整的地址信息
        const newAddress = {
          name: receiverName,
          phone: receiverPhone,
          address: fullAddress,
          fullAddress: fullAddress,
          // 保存结构化地址字段
          province: province,
          city: city,
          district: district,
          detail: detail,
          // 保存原始的originalAddress对象（如果存在），否则构建一个
          originalAddress: address.originalAddress || {
            province: province,
            city: city,
            district: district,
            detail: detail
          },
          // 保留原始地址对象的所有其他字段
          ...address
        };
        
        console.log('新地址对象:', newAddress);
        
        // 使用Vue的响应式更新机制设置地址
        this.$set(this, 'selectedAddress', newAddress);
        
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
      // 暂时不用优惠，优惠金额设为0
      this.discountAmount = 0;
    },
    
    // 从商家详情API重新获取配送费，确保数据一致性
    async loadMerchantDeliveryFee() {
      if (!this.restaurant || !this.restaurant.id) {
        console.warn('商家ID不存在，无法获取配送费');
        return;
      }
      
      try {
        console.log('从商家详情API获取配送费，商家ID:', this.restaurant.id);
        const merchantRes = await foodApi.getMerchantDetail(this.restaurant.id);
        
        if (merchantRes && merchantRes.code === 200 && merchantRes.data) {
          // 提取商家信息
          let merchantInfo = null;
          if (merchantRes.data && typeof merchantRes.data === 'object' && !Array.isArray(merchantRes.data)) {
            merchantInfo = merchantRes.data;
          } else if (merchantRes.data && Array.isArray(merchantRes.data.rows) && merchantRes.data.rows.length > 0) {
            merchantInfo = merchantRes.data.rows[0];
          } else if (Array.isArray(merchantRes.rows) && merchantRes.rows.length > 0) {
            merchantInfo = merchantRes.rows[0];
          } else if (Array.isArray(merchantRes.data) && merchantRes.data.length > 0) {
            merchantInfo = merchantRes.data[0];
          }
          
          if (merchantInfo) {
            // 更新配送费，使用API返回的最新值
            const latestDeliveryFee = merchantInfo.deliveryFee || merchantInfo.shippingFee || this.restaurant.deliveryFee || 0;
            if (this.restaurant.deliveryFee !== latestDeliveryFee) {
              console.log('配送费已更新:', this.restaurant.deliveryFee, '->', latestDeliveryFee);
              this.restaurant.deliveryFee = latestDeliveryFee;
            } else {
              console.log('配送费无需更新，当前值:', latestDeliveryFee);
            }
          } else {
            console.warn('无法从API响应中提取商家信息');
          }
        } else {
          console.warn('获取商家详情失败，使用本地存储的配送费:', merchantRes?.msg || merchantRes?.message);
        }
      } catch (error) {
        console.error('获取商家配送费失败:', error);
        // 获取失败时，继续使用本地存储的配送费
      }
    },
    
    // 从后端API加载默认地址
    async loadDefaultAddress() {
      try {
        // 调用后端API获取地址列表
        const addressRes = await addressApi.getAddressList();
        if (addressRes.code === 200 && addressRes.data && addressRes.data.length > 0) {
          // 从地址列表中找到默认地址
          const defaultAddress = addressRes.data.find(address => address.isDefault);
          if (defaultAddress) {
            // 确保地址字段完整
            const fullAddress = [
              defaultAddress.province,
              defaultAddress.city,
              defaultAddress.district,
              defaultAddress.detail
            ].filter(Boolean).join('');
            
            // 增强地址字段适配，支持更多可能的字段名
            // 优先使用name，其次尝试receiver、consignee等字段
            const receiverName = defaultAddress.name || defaultAddress.receiver || defaultAddress.consignee || defaultAddress.contactName || defaultAddress.receiverName || '';
            const receiverPhone = defaultAddress.phone || defaultAddress.tel || defaultAddress.mobile || defaultAddress.contactPhone || defaultAddress.receiverPhone || '';
            
            // 构建完整的地址对象，确保name和phone字段存在
            this.selectedAddress = {
              ...defaultAddress,
              name: receiverName,
              phone: receiverPhone,
              address: fullAddress,
              fullAddress: fullAddress
            };
          }
        }
      } catch (error) {
        console.error('获取默认地址失败:', error);
        uni.showToast({
          title: '获取地址失败，请稍后重试',
          icon: 'none'
        });
      }
    },
    
    // 提交订单
    async submitOrder() {
      // 严格的地址验证逻辑，确保所有必要的地址字段都不为空
      if (!this.selectedAddress) {
        uni.showToast({
          title: '请选择收货地址',
          icon: 'none'
        });
        return;
      }
      
      // 验证收货人姓名
      if (!this.selectedAddress.name || this.selectedAddress.name === '请选择收货地址') {
        uni.showToast({
          title: '请填写收货人姓名',
          icon: 'none'
        });
        return;
      }
      
      // 验证收货人电话
      if (!this.selectedAddress.phone) {
        uni.showToast({
          title: '请填写收货人电话',
          icon: 'none'
        });
        return;
      }
      
      // 验证收货地址
      if (!this.selectedAddress.address && !this.selectedAddress.fullAddress) {
        uni.showToast({
          title: '请填写收货地址',
          icon: 'none'
        });
        return;
      }
      
      console.log('提交订单时的地址信息:', this.selectedAddress);
      
      // 构建订单数据 - 使用新API格式
      const address = this.selectedAddress;
      
      // 确保fullAddress始终有值
      const fullAddress = address.fullAddress || address.address || `${address.province || ''}${address.city || ''}${address.district || ''}${address.detail || ''}`;
      
      // 确保结构化地址字段始终存在，适配不同的地址数据格式
      // 优先从originalAddress提取，其次尝试从address对象直接提取，最后使用空字符串
      const province = address.originalAddress?.province || address.province || '';
      const city = address.originalAddress?.city || address.city || '';
      const district = address.originalAddress?.district || address.district || '';
      const detail = address.originalAddress?.detail || address.detail || '';
      
      // 从本地存储获取用户ID，优先使用user_base_id
      let userId = uni.getStorageSync('user_base_id');
      // 如果没有user_base_id，再尝试从userId获取
      if (!userId) {
        userId = uni.getStorageSync('userId');
      }
      // 确保userId是字符串类型
      userId = String(userId);
      console.log('创建预支付订单时的用户ID:', userId);
      
      // 使用当前商家对象中的配送费（已从API获取最新值）
        const deliveryFee = this.restaurant.deliveryFee || 0;
        
        // 根据后端CreateOrderDTO验证要求，构建完全符合规范的订单数据
        const orderData = {
          // 订单类型：1-外卖单 2-跑腿单 3-二手交易单
          orderType: 1,
          
          // 用户信息
          userId: userId,
          // 同时传递user_base_id字段，确保后端能获取到正确的用户标识
          user_base_id: userId,
          
          // 商家信息
          merchantId: this.restaurant.id,
          merchantName: this.restaurant.name,
          restaurantId: this.restaurant.id,
          restaurantName: this.restaurant.name,
          // 使用从API获取的最新配送费
          restaurant: {
            ...this.restaurant,
            deliveryFee: deliveryFee
          },
          
          // 地址信息 - 包含所有后端可能需要的字段，确保字段有值
          deliverAddressId: address.id || address.addressId || 0, // 使用0代替null，避免后端验证失败
          deliverAddress: fullAddress,
          deliverContact: address.name || '',
          deliverPhone: address.phone || '',
          deliverLongitude: address.longitude || address.lng || 0, // 使用0代替null，避免后端验证失败
          deliverLatitude: address.latitude || address.lat || 0, // 使用0代替null，避免后端验证失败
          
          // 添加结构化地址字段，确保后端能获取到完整的地址结构
          province: province,
          city: city,
          district: district,
          detail: detail,
          
          // 订单备注
          remark: this.orderRemark,
          
          // 订单商品明细列表 - 完全按照后端OrderItemDTO格式构建
          items: this.cartItems.map(item => {
            // 确保商品ID存在，优先使用merchantGoodsId，其次使用id，避免null
            const goodsId = item.merchantGoodsId || item.id || 0;
            // 确保数量字段存在，前端使用count，后端期望quantity，且不为null
            const quantity = item.count || item.quantity || 1;
            return {
              // 仅包含后端OrderItemDTO要求的字段，确保字段名称完全匹配
              goodsId: goodsId,
              goodsName: item.name || item.goodsName || item.foodName || '未知商品',
              goodsPrice: item.price || 0,
              quantity: quantity,
              goodsSpec: item.spec || item.goodsSpec || '',
              goodsTags: item.tags || item.goodsTags || ''
            };
          }),
          
          // 添加前端计算的金额字段，确保支付页面使用一致的金额
          // 确保所有金额都保留两位小数，与支付页面保持一致
          itemsTotal: parseFloat(this.itemsTotal.toFixed(2)),
          // 使用从API获取的最新配送费
          deliveryFee: parseFloat(deliveryFee.toFixed(2)),
          discountAmount: parseFloat(this.discountAmount.toFixed(2)),
          // 重新计算总金额，确保使用最新的配送费
          totalAmount: parseFloat((this.itemsTotal + deliveryFee - this.discountAmount).toFixed(2))
        };
        
        console.log('发送给后端的订单数据（配送费已从API获取）:', {
          '配送费': deliveryFee,
          '总金额': orderData.totalAmount,
          '商品总价': orderData.itemsTotal,
          '优惠金额': orderData.discountAmount
        });
      
      console.log('前端计算的金额:', {
        itemsTotal: this.itemsTotal,
        deliveryFee: this.restaurant.deliveryFee || 0,
        discountAmount: this.discountAmount,
        totalAmount: this.totalAmount
      });
      
      console.log('构建的完整订单数据:', orderData);
      console.log('订单数据中的总金额:', orderData.totalAmount);
      console.log('订单数据中的配送费:', orderData.deliveryFee);
      console.log('订单数据中的商品总价:', orderData.itemsTotal);
      console.log('订单数据中的优惠金额:', orderData.discountAmount);
      
      try {
        // 显示加载提示
        uni.showLoading({
          title: '创建订单中...',
          mask: true
        });
        
        // 调用预支付订单API，创建预支付订单
        console.log('开始发送预支付订单请求...');
        const prepayRes = await foodApi.createPrepayOrder(orderData);
        console.log('预支付订单API完整响应:', JSON.stringify(prepayRes));
        console.log('预支付订单响应中的金额:', prepayRes.data?.amount || prepayRes.data?.totalAmount);
        console.log('预支付订单响应中的订单号:', prepayRes.data?.preOrderNo || prepayRes.data?.prepayOrderId);
        console.log('前端发送的订单数据:', JSON.stringify(orderData));
        
        // 隐藏加载提示
        uni.hideLoading();
        
        if (prepayRes.code !== 200 || !prepayRes.data) {
          throw new Error(prepayRes.msg || prepayRes.message || '创建预支付订单失败');
        }
        
        // 生成临时订单ID（使用时间戳或后端返回的ID）
        const orderId = prepayRes.data.orderId || prepayRes.data.prepayOrderId || prepayRes.data.preOrderNo || Date.now();
        
        // 检查orderData.restaurant是否包含完整的商家地址信息
        console.log('orderData.restaurant包含的商家地址信息:', {
          address: orderData.restaurant?.address,
          addressInfo: orderData.restaurant?.addressInfo,
          province: orderData.restaurant?.province,
          city: orderData.restaurant?.city,
          district: orderData.restaurant?.district,
          detail: orderData.restaurant?.detail
        });
        
        // 保存订单到本地存储，包含预支付信息
        // 先合并预支付信息，保留后端返回的关键金额字段
        const order = {
          id: orderId,
          ...orderData,
          ...prepayRes.data,
          // 确保保存预订单号，兼容不同字段名
          prepayOrderId: prepayRes.data.prepayOrderId || prepayRes.data.orderNo || prepayRes.data.preOrderNo || prepayRes.data.orderId,
          preOrderNo: prepayRes.data.preOrderNo || prepayRes.data.prepayOrderId || prepayRes.data.orderNo || prepayRes.data.orderId,
          // 优先保存后端返回的amount字段，这是最可靠的金额来源
          // 确保amount字段存在且值正确
          amount: prepayRes.data.amount !== undefined ? prepayRes.data.amount : prepayRes.data.totalAmount !== undefined ? prepayRes.data.totalAmount : orderData.totalAmount,
          // 保留前端计算的金额字段，用于展示
          totalAmount: orderData.totalAmount,
          itemsTotal: orderData.itemsTotal,
          deliveryFee: orderData.deliveryFee,
          discountAmount: orderData.discountAmount,
          // 确保restaurant对象中的配送费也是修正后的值，并包含完整的商家地址信息
          restaurant: {
            ...orderData.restaurant,
            // 确保商家地址信息完整，优先使用this.restaurant中的地址
            address: orderData.restaurant?.address || this.restaurant?.address || '',
            addressInfo: orderData.restaurant?.addressInfo || this.restaurant?.addressInfo || '',
            province: orderData.restaurant?.province || this.restaurant?.province || '',
            city: orderData.restaurant?.city || this.restaurant?.city || '',
            district: orderData.restaurant?.district || this.restaurant?.district || '',
            detail: orderData.restaurant?.detail || this.restaurant?.detail || '',
            deliveryFee: orderData.deliveryFee
          },
          // 保存地址信息到订单中，确保支付页面能获取到
          address: {
            name: orderData.deliverContact || this.selectedAddress.name,
            phone: orderData.deliverPhone || this.selectedAddress.phone,
            address: orderData.deliverAddress || this.selectedAddress.fullAddress || this.selectedAddress.address,
            fullAddress: orderData.deliverAddress || this.selectedAddress.fullAddress || this.selectedAddress.address
          },
          // 确保创建时间存在
          createTime: new Date().toISOString()
        };
        
        // 检查最终保存的order.restaurant是否包含完整的商家地址信息
        console.log('保存到本地存储的order.restaurant包含的商家地址信息:', {
          address: order.restaurant?.address,
          addressInfo: order.restaurant?.addressInfo,
          province: order.restaurant?.province,
          city: order.restaurant?.city,
          district: order.restaurant?.district,
          detail: order.restaurant?.detail
        });
        
        // 再次确认订单金额信息，确保支付时使用正确的金额
        console.log('保存到本地存储的订单金额最终确认:', {
          '后端返回的amount': prepayRes.data.amount,
          '后端返回的totalAmount': prepayRes.data.totalAmount,
          '前端计算的totalAmount': orderData.totalAmount,
          '最终保存的amount': order.amount,
          '最终保存的totalAmount': order.totalAmount
        });
        
        console.log('保存到本地存储的订单金额字段:', {
          '前端计算的totalAmount': orderData.totalAmount,
          '保存到订单的amount': order.amount,
          '保存到订单的totalAmount': order.totalAmount,
          '保存到订单的deliveryFee': order.deliveryFee,
          '预支付响应中的amount': prepayRes.data?.amount,
          '预支付响应中的totalAmount': prepayRes.data?.totalAmount
        });
        
        console.log('保存到本地存储的订单地址信息:', order.address);
        
        // 将订单保存到本地存储，供支付页面使用
        uni.setStorageSync('currentOrder', order);
        
        // 清空购物车
        uni.removeStorageSync('foodCart');
        
        // 跳转到food目录下的支付页面
        uni.navigateTo({
          url: `/pages/food/food-payment?orderId=${orderId}&amount=${order.totalAmount}&type=food&title=${encodeURIComponent(order.restaurantName || order.merchantName || this.restaurant.name)}&restaurantId=${this.restaurant.id}`
        });
      } catch (error) {
        // 隐藏加载提示
        uni.hideLoading();
        console.error('订单处理失败:', error);
        uni.showToast({
          title: error.message || '网络异常，订单处理失败',
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
  color: #4AA9FF;
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
  color: #4AA9FF;
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
  transition: all 0.2s ease;
}

.order-item:hover {
  background-color: #FAFAFA;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item-info {
  flex: 1;
}

.order-item-name {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 8rpx;
  display: block;
  font-weight: 500;
}

.order-item-desc {
  font-size: 26rpx;
  color: #999999;
  display: block;
  line-height: 1.3;
}

.order-item-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.price {
  font-size: 32rpx;
  color: #FF6B6B;
  font-weight: bold;
}

.count {
  font-size: 26rpx;
  color: #999999;
  margin-top: 4rpx;
}

/* 订单备注 */
.remark-input {
  border: 1px solid #E0E0E0;
  border-radius: 10rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333333;
  min-height: 120rpx;
  background-color: #F8F9FA;
  transition: all 0.3s ease;
}

.remark-input:focus {
  border-color: #5DCDFF;
  background-color: #FFFFFF;
  box-shadow: 0 0 0 2rpx rgba(93, 205, 255, 0.1);
}

/* 价格明细 */
.price-item {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  transition: all 0.2s ease;
}

.price-item:hover {
  background-color: #FAFAFA;
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
  font-weight: 500;
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
  box-shadow: 0 -2rpx 15rpx rgba(0, 0, 0, 0.08);
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
  margin-left: 8rpx;
}

.submit-btn {
  background: linear-gradient(135deg, #5DCDFF 0%, #4AA9FF 100%);
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
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
  background: linear-gradient(135deg, #5DCDFF 0%, #4AA9FF 100%);
  padding: 20rpx 40rpx;
  border-radius: 40rpx;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: bold;
}
</style>