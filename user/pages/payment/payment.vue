<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="nav-title">确认订单</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y :style="{ top: navHeight + 'px' }">
      <!-- 商品信息 -->
      <view class="goods-card">
        <view class="card-title">
          <text class="title-text">📦 商品信息</text>
        </view>
        <view class="goods-info">
          <image class="goods-image" :src="orderInfo.image" mode="aspectFill"></image>
          <view class="goods-detail">
            <text class="goods-name">{{ orderInfo.title }}</text>
            <text class="goods-price">¥{{ orderInfo.price }}</text>
          </view>
        </view>
      </view>

      <!-- 交易地点 -->
      <view class="buyer-card">
        <view class="card-title">
          <text class="title-text">📍 交易地点</text>
        </view>
        <view class="form-item">
          <text class="item-label">交易地点</text>
          <input 
            class="item-input" 
            v-model="buyerInfo.location" 
            placeholder="请输入交易地点"
          />
        </view>
      </view>

      <!-- 支付方式 -->
      <view class="payment-card">
        <view class="card-title">
          <text class="title-text">💳 支付方式</text>
        </view>
        <view 
          v-for="(item, index) in paymentMethods" 
          :key="index"
          class="payment-item"
          @click="selectPayment(index)"
        >
          <view class="payment-left">
            <view class="payment-icon-box" :style="{ backgroundColor: item.color + '20', borderColor: item.color }">
              <text class="payment-icon" :style="{ color: item.color }">{{ item.icon }}</text>
            </view>
            <text class="payment-name">{{ item.name }}</text>
          </view>
          <view class="payment-radio" :class="{ active: selectedPayment === index }">
            <view v-if="selectedPayment === index" class="radio-dot"></view>
          </view>
        </view>
      </view>

      <!-- 订单备注 -->
      <view class="remark-card">
        <view class="card-title">
          <text class="title-text">📝 订单备注</text>
        </view>
        <textarea 
          class="remark-textarea"
          v-model="remark"
          placeholder="选填，可以告诉卖家您的特殊需求"
          maxlength="200"
        />
      </view>

      <!-- 价格明细 -->
      <view class="price-card">
        <view class="price-item">
          <text class="price-label">商品价格</text>
          <text class="price-value">¥{{ orderInfo.price }}</text>
        </view>
        <view class="price-item">
          <text class="price-label">服务费</text>
          <text class="price-value">¥0</text>
        </view>
        <view class="price-divider"></view>
        <view class="price-item total">
          <text class="price-label">合计</text>
          <text class="price-value total">¥{{ orderInfo.price }}</text>
        </view>
      </view>

      <!-- 占位空间 -->
      <view style="height: 160rpx;"></view>
    </scroll-view>

    <!-- 底部提交栏 -->
    <view class="bottom-bar">
      <view class="total-box">
        <text class="total-label">实付款：</text>
        <text class="total-price">¥{{ orderInfo.price }}</text>
      </view>
      <view class="submit-btn" @click="submitOrder">
        <text class="submit-text">提交订单</text>
      </view>
    </view>
    
    <!-- 支付密码输入框 -->
    <view v-if="showPasswordModal" class="password-modal-mask" @click="closePasswordModal">
      <view class="password-modal-content" @click.stop>
        <view class="password-modal-header">
          <text class="password-modal-title">请输入支付密码</text>
          <text class="password-modal-close" @click="closePasswordModal">✕</text>
        </view>
        
        <view class="password-tips">
          <text class="tips-text">支付密码为6位数字</text>
        </view>
        
        <view class="password-input-box" @click="focusPasswordInput">
          <view 
            v-for="(item, index) in 6" 
            :key="index"
            class="password-dot-box"
            :class="{ active: index === paymentPassword.length }"
          >
            <view v-if="index < paymentPassword.length" class="password-dot">●</view>
          </view>
        </view>
        
        <!-- 隐藏的输入框 -->
        <input 
          ref="passwordInput"
          class="password-input-hidden"
          type="number"
          maxlength="6"
          :value="paymentPassword"
          @input="onPasswordInput"
          @blur="onPasswordBlur"
          :focus="passwordInputFocus"
        />
        
        <view class="password-actions">
          <view class="password-cancel-btn" @click="closePasswordModal">
            <text class="cancel-btn-text">取消</text>
          </view>
          <view class="password-confirm-btn" @click="confirmPaymentPassword">
            <text class="confirm-btn-text">确认支付</text>
          </view>
        </view>
        
        <view class="password-forget">
          <text class="forget-text">忘记密码？</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getGoodsDetail, createOrder, payOrder, confirmOrder, generateRequestId } from '@/api/secondhandGoods.js'
import { PAY_TYPES } from '@/api/config.js'
import { verifyPaymentPassword, checkPaymentPasswordStatus } from '@/api/wallet.js'
import { getUserInfo } from '@/api/user.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      goodsId: '',
      sellerId: '', // 卖家ID
      currentUserId: '', // 当前登录用户ID
      currentUserName: '', // 当前登录用户姓名
      currentUserPhone: '', // 当前登录用户手机号
      orderInfo: {
        id: '',
        title: '商品名称',
        price: '0',
        image: 'https://picsum.photos/200/200?random=31'
      },
      buyerInfo: {
        location: ''
      },
      selectedPayment: 3, // 默认选择面付（索引3，payType=4）
      paymentMethods: [],
      remark: '',
      loading: false,
      showPasswordModal: false, // 显示密码输入框
      paymentPassword: '', // 支付密码
      orderNo: '', // 临时保存订单号
      passwordInputFocus: false // 密码输入框聚焦状态
    };
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
    
    // 初始化支付方式列表
    this.paymentMethods = PAY_TYPES.map((item) => ({
      icon: item.icon,
      name: item.label,
      payType: item.value,
      color: this.getPaymentColor(item.value)
    }));

    // 获取商品ID并加载详情
    const goodsId = options.goodsId || options.id;
    
    if (!goodsId || goodsId === 'undefined') {
      console.error('商品ID无效：', options);
      uni.showToast({
        title: '商品ID无效',
        icon: 'none',
        duration: 2000
      });
      
      setTimeout(() => {
        uni.navigateBack();
      }, 2000);
      return;
    }
    
    console.log('支付页面接收到的商品ID：', goodsId);
    this.goodsId = goodsId;
    this.loadGoodsDetail(goodsId);
    this.loadCurrentUser();
  },
  methods: {
    // 获取支付方式颜色
    getPaymentColor(payType) {
      const colors = {
        1: '#FF9800', // 余额
        2: '#07C160', // 微信
        3: '#1677FF', // 支付宝
        4: '#FF6B47'  // 面付
      };
      return colors[payType] || '#999999';
    },
    
    // 加载当前登录用户信息
    async loadCurrentUser() {
      try {
        // 先从本地存储获取
        let userId = uni.getStorageSync('userId');
        let userName = '';
        let userPhone = '';
        
        const localUserInfo = uni.getStorageSync('userInfo');
        if (localUserInfo) {
          userId = userId || localUserInfo.userBaseId || localUserInfo.userId || localUserInfo.id;
          userName = localUserInfo.realName || localUserInfo.nickName || localUserInfo.userName || '';
          userPhone = localUserInfo.phone || localUserInfo.phonenumber || '';
        }
        
        if (userId) {
          this.currentUserId = String(userId);
          this.currentUserName = userName;
          this.currentUserPhone = userPhone;
          console.log('从本地存储获取的用户信息：', this.currentUserId, this.currentUserName, this.currentUserPhone);
        }
        
        // 从API获取最新信息
        const result = await getUserInfo();
        if (result && result.data) {
          const user = result.data;
          this.currentUserId = String(user.userBaseId || user.userId || user.id || '');
          this.currentUserName = user.realName || user.nickName || user.userName || this.currentUserName || '';
          this.currentUserPhone = user.phone || user.phonenumber || this.currentUserPhone || '';
          console.log('从API获取的用户信息：', this.currentUserId, this.currentUserName, this.currentUserPhone);
        }
      } catch (error) {
        console.error('获取用户信息失败：', error);
      }
    },
    
    // 加载商品详情
    async loadGoodsDetail(goodsId) {
      try {
        uni.showLoading({
          title: '加载中...'
        });
        
        const result = await getGoodsDetail(goodsId);
        const data = result.data || result;
        
        this.orderInfo = {
          id: data.goodsId || data.id,
          title: data.goodsName || data.title || data.name,
          price: data.price,
          image: this.parseImage(data)
        };
        
        // 保存卖家ID
        this.sellerId = String(data.userId || data.sellerId || '');
        console.log('卖家ID：', this.sellerId);
        
        uni.hideLoading();
        
      } catch (error) {
        console.error('加载商品详情失败：', error);
        uni.hideLoading();
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
        
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    
    // 解析图片
    parseImage(data) {
      let image = '';
      
      // 优先使用 imageUrls（后端返回的字段）
      if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
        image = data.imageUrls[0];
      } else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        image = data.images[0];
      } else if (data.mainImageUrl) {
        image = data.mainImageUrl;
      } else if (data.image) {
        image = data.image;
      }
      
      if (image && image.startsWith('@')) {
        image = image.substring(1);
      }
      
      return image || 'https://picsum.photos/200/200';
    },
    
    // 返回
    goBack() {
      uni.navigateBack();
    },
    
    // 选择支付方式
    selectPayment(index) {
      this.selectedPayment = index;
    },
    
    // 表单验证
    validateForm() {
      if (!this.buyerInfo.location.trim()) {
        uni.showToast({
          title: '请输入交易地点',
          icon: 'none'
        });
        return false;
      }
      
      return true;
    },
    
    // 检查是否购买自己的商品
    checkSelfPurchase() {
      if (this.currentUserId && this.sellerId && this.currentUserId === this.sellerId) {
        uni.showModal({
          title: '提示',
          content: '不能购买自己发布的商品',
          showCancel: false,
          confirmText: '确定',
          success: () => {
            // 返回二手交易页面
            uni.navigateBack({
              delta: 2 // 返回2级：支付页 → 详情页 → 列表页
            });
          }
        });
        return false;
      }
      return true;
    },
    
    // 提交订单
    async submitOrder() {
      if (!this.validateForm()) {
        return;
      }
      
      // 检查是否购买自己的商品
      if (!this.checkSelfPurchase()) {
        return;
      }
      
      if (this.loading) return;
      
      const paymentMethod = this.paymentMethods[this.selectedPayment];
      
      uni.showModal({
        title: '确认订单',
        content: `确认使用${paymentMethod.name}购买"${this.orderInfo.title}"吗？`,
        confirmText: '确认',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.createOrderRequest();
          }
        }
      });
    },
    
    // 创建订单请求
    async createOrderRequest() {
      try {
        this.loading = true;
        uni.showLoading({
          title: '提交中...'
        });
        
        const paymentMethod = this.paymentMethods[this.selectedPayment];
        
        // 构建订单参数（买家信息自动获取）
        const orderParams = {
          goodsId: parseInt(this.goodsId),
          receiverName: this.currentUserName,
          receiverPhone: this.currentUserPhone,
          tradePlace: this.buyerInfo.location,
          payType: paymentMethod.payType,
          remark: this.remark,
          requestId: generateRequestId() // 幂等性标识
        };
        
        console.log('创建订单参数：', orderParams);
        
        const result = await createOrder(orderParams);
        console.log('创建订单结果：', result);
        
        uni.hideLoading();
        
        // 检查是否返回错误（包括自购错误）
        if (result.code && result.code !== 200) {
          // 检查是否是自购错误
          if (result.msg && result.msg.includes('自己')) {
            uni.showModal({
              title: '提示',
              content: '不能购买自己发布的商品',
              showCancel: false,
              confirmText: '确定',
              success: () => {
                // 返回二手交易页面
                uni.navigateBack({
                  delta: 2
                });
              }
            });
          } else {
            uni.showToast({
              title: result.msg || '订单创建失败',
              icon: 'none',
              duration: 2000
            });
          }
          return;
        }
        
        const orderData = result.data || result;
        const orderNo = orderData.orderNo;
        
        // 判断支付类型
        if (paymentMethod.payType === 4) {
          // 面付，直接提示成功，不需要密码
          uni.showToast({
            title: '订单创建成功',
            icon: 'success',
            duration: 2000
          });
          
          console.log('✅ 面付订单创建成功，返回列表页');
          
          setTimeout(() => {
            uni.navigateBack({
              delta: 2 // 返回2级：支付页 → 详情页 → 列表页
            });
          }, 2000);
          
        } else {
          // 线上支付，需要输入支付密码
          this.orderNo = orderNo; // 保存订单号
          this.showPasswordModal = true; // 显示密码输入框
          
          // 延迟聚焦，确保输入框已渲染
          setTimeout(() => {
            this.passwordInputFocus = true;
          }, 300);
        }
        
      } catch (error) {
        console.error('创建订单失败：', error);
        uni.hideLoading();
        
        const errorMsg = error.data?.msg || error.msg || error.message || '订单创建失败';
        
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        });
        
      } finally {
        this.loading = false;
      }
    },
    
    // 关闭密码输入框
    closePasswordModal() {
      this.showPasswordModal = false;
      this.passwordInputFocus = false;
      this.paymentPassword = '';
    },
    
    // 聚焦密码输入框
    focusPasswordInput() {
      this.passwordInputFocus = true;
    },
    
    // 密码输入框失去焦点
    onPasswordBlur() {
      // 延迟重新聚焦，保持键盘显示
      setTimeout(() => {
        if (this.showPasswordModal) {
          this.passwordInputFocus = true;
        }
      }, 100);
    },
    
    // 密码输入
    onPasswordInput(e) {
      this.paymentPassword = e.detail.value;
      
      // 如果输入满6位，自动提交
      if (e.detail.value.length === 6) {
        setTimeout(() => {
          this.confirmPaymentPassword();
        }, 300);
      }
    },
    
    // 确认支付密码
    async confirmPaymentPassword() {
      if (!this.paymentPassword) {
        uni.showToast({
          title: '请输入支付密码',
          icon: 'none'
        });
        this.passwordInputFocus = true;
        return;
      }
      
      if (this.paymentPassword.length !== 6) {
        uni.showToast({
          title: '支付密码为6位数字',
          icon: 'none'
        });
        this.passwordInputFocus = true;
        return;
      }
      
      // 验证支付密码（前端比对）
      uni.showLoading({ title: '验证中...' });
      const verifyResult = await verifyPaymentPassword(this.paymentPassword);
      uni.hideLoading();
      
      if (!verifyResult.valid) {
        uni.showToast({
          title: verifyResult.msg || '支付密码错误',
          icon: 'none'
        });
        this.paymentPassword = '';
        this.passwordInputFocus = true;
        return;
      }
      
      // 关闭密码输入框
      this.showPasswordModal = false;
      this.passwordInputFocus = false;
      
      // 调用支付接口
      const paymentMethod = this.paymentMethods[this.selectedPayment];
      await this.processOnlinePayment(this.orderNo, paymentMethod);
      
      // 清空密码
      this.paymentPassword = '';
    },
    
    // 处理线上支付
    async processOnlinePayment(orderNo, paymentMethod) {
      try {
        uni.showLoading({
          title: '支付处理中...'
        });
        
        // 步骤1：调用支付接口
        const payResult = await payOrder(orderNo);
        console.log('✅ 支付成功：', payResult);
        
        // 步骤2：自动确认交易（这样商品才会标记为已售）
        console.log('📦 自动确认交易...');
        const confirmResult = await confirmOrder(orderNo);
        console.log('✅ 交易已确认：', confirmResult);
        
        uni.hideLoading();
        
        uni.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        });
        
        console.log('✅ 交易完成，商品已标记为已售，将从列表中移除');
        
        // 延迟返回，返回后商品列表会自动刷新
        setTimeout(() => {
          uni.navigateBack({
            delta: 2 // 返回2级：支付页 → 详情页 → 列表页
          });
        }, 2000);
        
      } catch (error) {
        console.error('❌ 支付/确认失败：', error);
        uni.hideLoading();
        
        const errorMsg = error.data?.msg || error.msg || error.message || '支付失败';
        
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

/* 卡片通用样式 */
.goods-card,
.buyer-card,
.payment-card,
.remark-card,
.price-card {
  background-color: #FFFFFF;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.card-title {
  margin-bottom: 24rpx;
}

.title-text {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

/* 商品信息 */
.goods-info {
  display: flex;
  align-items: center;
}

.goods-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  background-color: #F5F5F5;
}

.goods-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.goods-name {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price {
  font-size: 36rpx;
  color: #FF6B47;
  font-weight: bold;
}

/* 买家信息表单 */
.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.form-item:last-child {
  border-bottom: none;
}

.item-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #666666;
  flex-shrink: 0;
}

.item-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

/* 支付方式 */
.payment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-left {
  display: flex;
  align-items: center;
}

.payment-icon-box {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  border: 2rpx solid;
}

.payment-icon {
  font-size: 44rpx;
}

.payment-name {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.payment-radio {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #DDDDDD;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.payment-radio.active {
  border-color: #5DCDFF;
}

.radio-dot {
  width: 24rpx;
  height: 24rpx;
  background-color: #5DCDFF;
  border-radius: 50%;
}

/* 订单备注 */
.remark-textarea {
  width: 100%;
  min-height: 160rpx;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

/* 价格明细 */
.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}

.price-label {
  font-size: 28rpx;
  color: #666666;
}

.price-value {
  font-size: 28rpx;
  color: #333333;
}

.price-item.total .price-label {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
}

.price-item.total .price-value {
  font-size: 40rpx;
  color: #FF6B47;
  font-weight: bold;
}

.price-divider {
  height: 1rpx;
  background-color: #F0F0F0;
  margin: 16rpx 0;
}

/* 底部提交栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 999;
}

.total-box {
  flex: 1;
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 28rpx;
  color: #666666;
  margin-right: 8rpx;
}

.total-price {
  font-size: 40rpx;
  color: #FF6B47;
  font-weight: bold;
}

.submit-btn {
  width: 280rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #FF8A65 0%, #FF6B47 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 71, 0.3);
}

.submit-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: bold;
}

/* 支付密码输入框 */
.password-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-modal-content {
  width: 600rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx;
  animation: scaleIn 0.3s;
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.password-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.password-modal-title {
  font-size: 34rpx;
  color: #333333;
  font-weight: bold;
}

.password-modal-close {
  font-size: 40rpx;
  color: #999999;
  font-weight: 300;
  padding: 0 10rpx;
}

.password-tips {
  text-align: center;
  margin-bottom: 40rpx;
}

.tips-text {
  font-size: 26rpx;
  color: #666666;
}

/* 密码输入格子 */
.password-input-box {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
}

.password-dot-box {
  width: 80rpx;
  height: 80rpx;
  border: 2rpx solid #E0E0E0;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F8F8F8;
  transition: all 0.3s;
}

.password-dot-box.active {
  border-color: #5DCDFF;
  background-color: #F0FAFF;
  box-shadow: 0 0 0 4rpx rgba(93, 205, 255, 0.1);
}

.password-dot {
  font-size: 40rpx;
  color: #333333;
}

/* 隐藏的输入框 */
.password-input-hidden {
  position: absolute;
  left: -9999rpx;
  opacity: 0;
}

/* 按钮区域 */
.password-actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.password-cancel-btn,
.password-confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-cancel-btn {
  background-color: #F5F5F5;
}

.password-confirm-btn {
  background: linear-gradient(135deg, #89CFF0 0%, #5DCDFF 100%);
  box-shadow: 0 4rpx 16rpx rgba(93, 205, 255, 0.3);
}

.cancel-btn-text {
  font-size: 30rpx;
  color: #666666;
}

.confirm-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: bold;
}

/* 忘记密码 */
.password-forget {
  text-align: center;
}

.forget-text {
  font-size: 26rpx;
  color: #5DCDFF;
}
</style>

