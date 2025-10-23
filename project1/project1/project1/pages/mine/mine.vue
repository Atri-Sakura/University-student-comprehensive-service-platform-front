<template>
  <view class="page-container">
    <!-- 顶部店铺信息 -->
    <view class="header-section">
      <view class="shop-icon">
        <text class="icon-text">🏪</text>
      </view>
      <view class="header-info">
        <text class="shop-name">{{ shopInfo.name }}</text>
        <text class="shop-hours">{{ shopInfo.openStatus }} · {{ shopInfo.hours }}</text>
      </view>
    </view>

    <!-- 店铺详情卡片 -->
    <view class="detail-card">
      <view class="shop-icon-large">
        <text class="icon-large-text">🏪</text>
      </view>
      <view class="shop-name-row">
        <view class="shop-name-large">{{ shopInfo.name }}</view>
        <view class="edit-name-btn" @click="editShopName">
          <text class="edit-name-text">✏️ 修改</text>
        </view>
      </view>
      <view class="status-badge" :class="shopInfo.status === 'open' ? 'status-open' : 'status-closed'">
        <text class="status-text">{{ getStatusText(shopInfo.status) }}</text>
      </view>

      <!-- 营业状态切换 -->
      <view class="status-section">
        <text class="section-label">营业状态</text>
        <view class="status-buttons">
          <view 
            class="status-btn" 
            :class="shopInfo.status === 'open' ? 'status-btn-active' : ''"
            @click="changeStatus('open')"
          >
            <text class="status-btn-text">营业中</text>
          </view>
          <view 
            class="status-btn" 
            :class="shopInfo.status === 'rest' ? 'status-btn-active' : ''"
            @click="changeStatus('rest')"
          >
            <text class="status-btn-text">休息中</text>
          </view>
          <view 
            class="status-btn" 
            :class="shopInfo.status === 'closed' ? 'status-btn-active' : ''"
            @click="changeStatus('closed')"
          >
            <text class="status-btn-text">手动打烊</text>
          </view>
        </view>
      </view>

      <!-- 联系电话 -->
      <view class="info-section">
        <text class="section-label">联系电话</text>
        <view class="info-row">
          <text class="info-text">{{ shopInfo.phone }}</text>
          <text class="edit-link" @click="editPhone">修改</text>
        </view>
      </view>

      <!-- 公告/简介 -->
      <view class="info-section">
        <text class="section-label">公告/简介</text>
        <view class="info-row">
          <text class="info-text description">{{ shopInfo.description }}</text>
          <text class="edit-link" @click="editDescription">编辑</text>
        </view>
      </view>
    </view>

    <!-- 资质认证 -->
    <view class="cert-card">
      <text class="card-title">资质认证</text>
      <view class="cert-item" @click="viewCert('business')">
        <view class="cert-left">
          <view class="cert-icon">
            <text class="cert-icon-text">📄</text>
          </view>
          <view class="cert-info">
            <text class="cert-name">营业执照</text>
            <text class="cert-status cert-verified">已认证</text>
          </view>
        </view>
        <text class="cert-action">查看</text>
      </view>
      <view class="cert-item" @click="viewCert('food')">
        <view class="cert-left">
          <view class="cert-icon">
            <text class="cert-icon-text">📄</text>
          </view>
          <view class="cert-info">
            <text class="cert-name">食品经营许可证</text>
            <text class="cert-status cert-verified">已认证</text>
          </view>
        </view>
        <text class="cert-action">查看</text>
      </view>
    </view>

    <!-- 营业时间设置 -->
    <view class="time-card">
      <text class="card-title">营业时间</text>
      <view class="time-row">
        <text class="time-label">开始时间</text>
        <picker mode="time" :value="businessHours.startTime" @change="onStartTimeChange">
          <view class="time-picker">
            <text class="time-text">{{ businessHours.startTime }}</text>
            <text class="picker-icon">🕐</text>
          </view>
        </picker>
      </view>
      <view class="time-row">
        <text class="time-label">结束时间</text>
        <picker mode="time" :value="businessHours.endTime" @change="onEndTimeChange">
          <view class="time-picker">
            <text class="time-text">{{ businessHours.endTime }}</text>
            <text class="picker-icon">🕐</text>
          </view>
        </picker>
      </view>
      <view class="delivery-range">
        <text class="range-label">配送范围设置</text>
        <view class="range-info">
          <text class="range-text">{{ deliverySettings.range }}公里范围内</text>
          <text class="edit-link" @click="editRange">设置</text>
        </view>
      </view>
    </view>

    <!-- 配送设置 -->
    <view class="delivery-card">
      <text class="card-title">配送设置</text>
      <view class="delivery-row">
        <text class="delivery-label">起送价</text>
        <view class="delivery-value" @click="editMinPrice">
          <text class="price-text">¥{{ deliverySettings.minPrice }}</text>
        </view>
      </view>
      <view class="delivery-row">
        <text class="delivery-label">配送费</text>
        <view class="delivery-value" @click="editDeliveryFee">
          <text class="price-text">¥{{ deliverySettings.fee }}</text>
        </view>
      </view>
      <view class="modify-btn" @click="modifyDeliverySettings">
        <text class="modify-text">修改配送设置</text>
      </view>
    </view>
    
    <!-- 自定义底部导航栏 -->
    <view class="custom-tab-bar">
      <view class="tab-item" @click="switchTab('index')">
        <view class="tab-icon">🏠</view>
        <view class="tab-text">首页</view>
      </view>
      <view class="tab-item" @click="switchTab('list')">
        <view class="tab-icon">📋</view>
        <view class="tab-text">订单</view>
      </view>
      <view class="tab-item" @click="switchTab('message')">
        <view class="tab-icon">💬</view>
        <view class="tab-text">消息</view>
      </view>
      <view class="tab-item active">
        <view class="tab-icon">👤</view>
        <view class="tab-text">我的</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'MinePage',
  data() {
    return {
      shopInfo: {
        name: '美味餐厅',
        openStatus: '营业中',
        hours: '08:00-22:00',
        status: 'open', // open, rest, closed
        phone: '138-0013-8000',
        description: '本店提供美味健康的快餐食品，用心做好每一份餐品。'
      },
      businessHours: {
        startTime: '08:00',
        endTime: '22:00'
      },
      deliverySettings: {
        range: 3,
        minPrice: 20,
        fee: 5
      }
    }
  },
  onShow() {
    // 从本地存储读取店铺信息
    this.loadShopInfo();
  },
  methods: {
    loadShopInfo() {
      // 从本地存储加载店铺信息
      const savedInfo = uni.getStorageSync('shopInfo');
      if (savedInfo) {
        this.shopInfo = { ...this.shopInfo, ...savedInfo };
      }
      const savedHours = uni.getStorageSync('businessHours');
      if (savedHours) {
        this.businessHours = savedHours;
        this.shopInfo.hours = `${savedHours.startTime}-${savedHours.endTime}`;
      }
    },
    saveShopInfo() {
      // 保存店铺信息到本地存储
      uni.setStorageSync('shopInfo', {
        name: this.shopInfo.name,
        openStatus: this.shopInfo.openStatus,
        hours: this.shopInfo.hours,
        status: this.shopInfo.status,
        phone: this.shopInfo.phone,
        description: this.shopInfo.description
      });
      uni.setStorageSync('businessHours', this.businessHours);
    },
    getStatusText(status) {
      const statusMap = {
        open: '营业中',
        rest: '休息中',
        closed: '手动打烊'
      };
      return statusMap[status] || '营业中';
    },
    editShopName() {
      uni.showModal({
        title: '修改店铺名称',
        editable: true,
        placeholderText: '请输入新的店铺名称',
        content: this.shopInfo.name,
        success: (res) => {
          if (res.confirm && res.content) {
            this.shopInfo.name = res.content;
            this.saveShopInfo(); // 保存到本地存储
            uni.showToast({
              title: '修改成功',
              icon: 'success'
            });
          }
        }
      });
    },
    changeStatus(status) {
      this.shopInfo.status = status;
      this.shopInfo.openStatus = this.getStatusText(status);
      this.saveShopInfo(); // 保存到本地存储
      uni.showToast({
        title: `已切换到${this.getStatusText(status)}`,
        icon: 'success'
      });
    },
    editPhone() {
      uni.showModal({
        title: '修改联系电话',
        editable: true,
        placeholderText: '请输入新的联系电话',
        content: this.shopInfo.phone,
        success: (res) => {
          if (res.confirm && res.content) {
            this.shopInfo.phone = res.content;
            uni.showToast({
              title: '修改成功',
              icon: 'success'
            });
          }
        }
      });
    },
    editDescription() {
      uni.showModal({
        title: '编辑公告/简介',
        editable: true,
        placeholderText: '请输入店铺简介',
        content: this.shopInfo.description,
        success: (res) => {
          if (res.confirm && res.content) {
            this.shopInfo.description = res.content;
            uni.showToast({
              title: '修改成功',
              icon: 'success'
            });
          }
        }
      });
    },
    viewCert(type) {
      const certName = type === 'business' ? '营业执照' : '食品经营许可证';
      uni.showToast({
        title: `查看${certName}`,
        icon: 'none'
      });
    },
    onStartTimeChange(e) {
      this.businessHours.startTime = e.detail.value;
      this.updateBusinessHours();
    },
    onEndTimeChange(e) {
      this.businessHours.endTime = e.detail.value;
      this.updateBusinessHours();
    },
    updateBusinessHours() {
      this.shopInfo.hours = `${this.businessHours.startTime}-${this.businessHours.endTime}`;
      this.saveShopInfo(); // 保存到本地存储
      uni.showToast({
        title: '营业时间已更新',
        icon: 'success'
      });
    },
    editRange() {
      uni.showModal({
        title: '设置配送范围',
        editable: true,
        placeholderText: '请输入配送范围(公里)',
        content: this.deliverySettings.range.toString(),
        success: (res) => {
          if (res.confirm && res.content) {
            const range = parseInt(res.content);
            if (!isNaN(range) && range > 0) {
              this.deliverySettings.range = range;
              uni.showToast({
                title: '设置成功',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: '请输入有效的数字',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    editMinPrice() {
      uni.showModal({
        title: '设置起送价',
        editable: true,
        placeholderText: '请输入起送价',
        content: this.deliverySettings.minPrice.toString(),
        success: (res) => {
          if (res.confirm && res.content) {
            const price = parseFloat(res.content);
            if (!isNaN(price) && price >= 0) {
              this.deliverySettings.minPrice = price;
              uni.showToast({
                title: '设置成功',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: '请输入有效的金额',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    editDeliveryFee() {
      uni.showModal({
        title: '设置配送费',
        editable: true,
        placeholderText: '请输入配送费',
        content: this.deliverySettings.fee.toString(),
        success: (res) => {
          if (res.confirm && res.content) {
            const fee = parseFloat(res.content);
            if (!isNaN(fee) && fee >= 0) {
              this.deliverySettings.fee = fee;
              uni.showToast({
                title: '设置成功',
                icon: 'success'
              });
            } else {
              uni.showToast({
                title: '请输入有效的金额',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    modifyDeliverySettings() {
      uni.showToast({
        title: '配送设置已保存',
        icon: 'success'
      });
    },
    switchTab(tab) {
      const urlMap = {
        index: '/pages/index/index',
        list: '/pages/list/list',
        message: '/pages/message/message'
      };
      
      if (urlMap[tab]) {
        uni.switchTab({
          url: urlMap[tab]
        });
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 100rpx;
}

/* 顶部店铺信息 */
.header-section {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 30rpx;
  display: flex;
  align-items: center;
}

.shop-icon {
  width: 80rpx;
  height: 80rpx;
  background: white;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.icon-text {
  font-size: 40rpx;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shop-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.shop-hours {
  font-size: 24rpx;
  color: #666;
}

/* 店铺详情卡片 */
.detail-card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.shop-icon-large {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
}

.icon-large-text {
  font-size: 60rpx;
}

.shop-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  gap: 20rpx;
}

.shop-name-large {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.edit-name-btn {
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  border-radius: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(74, 144, 226, 0.3);
}

.edit-name-text {
  font-size: 22rpx;
  color: white;
  font-weight: 500;
}

.status-badge {
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  margin: 0 auto 40rpx;
  width: fit-content;
}

.status-open {
  background: #d4edda;
}

.status-closed {
  background: #f8d7da;
}

.status-text {
  font-size: 24rpx;
  color: #155724;
}

.status-closed .status-text {
  color: #721c24;
}

/* 营业状态切换 */
.status-section {
  margin-bottom: 40rpx;
}

.section-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
}

.status-buttons {
  display: flex;
  gap: 20rpx;
}

.status-btn {
  flex: 1;
  padding: 20rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  text-align: center;
  background: white;
}

.status-btn-active {
  border-color: #4A90E2;
  background: #EBF4FF;
}

.status-btn-text {
  font-size: 26rpx;
  color: #666;
}

.status-btn-active .status-btn-text {
  color: #4A90E2;
  font-weight: bold;
}

/* 信息行 */
.info-section {
  margin-bottom: 40rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.info-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.description {
  line-height: 1.6;
  color: #666;
}

.edit-link {
  font-size: 26rpx;
  color: #4A90E2;
  margin-left: 20rpx;
}

/* 资质认证卡片 */
.cert-card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.cert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.cert-item:last-child {
  border-bottom: none;
}

.cert-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.cert-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.cert-icon-text {
  font-size: 36rpx;
}

.cert-info {
  display: flex;
  flex-direction: column;
}

.cert-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.cert-status {
  font-size: 24rpx;
}

.cert-verified {
  color: #52c41a;
}

.cert-action {
  font-size: 26rpx;
  color: #4A90E2;
}

/* 营业时间卡片 */
.time-card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.time-label {
  font-size: 28rpx;
  color: #333;
}

.time-picker {
  display: flex;
  align-items: center;
}

.time-text {
  font-size: 28rpx;
  color: #333;
  margin-right: 12rpx;
}

.picker-icon {
  font-size: 32rpx;
}

.delivery-range {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.range-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.range-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.range-text {
  font-size: 26rpx;
  color: #666;
}

/* 配送设置卡片 */
.delivery-card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.delivery-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.delivery-label {
  font-size: 28rpx;
  color: #333;
}

.delivery-value {
  background: #f5f5f5;
  padding: 12rpx 40rpx;
  border-radius: 8rpx;
}

.price-text {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.modify-btn {
  margin-top: 30rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  border-radius: 12rpx;
  text-align: center;
}

.modify-text {
  font-size: 30rpx;
  color: white;
  font-weight: bold;
}

/* 自定义底部导航栏 */
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  display: flex;
  padding: 10rpx 0;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
  z-index: 999;
  border-top: 1rpx solid #e0e0e0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
  color: #999999;
}

.tab-item.active {
  color: #4A90E2;
}

.tab-icon {
  font-size: 44rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 20rpx;
}
</style>
