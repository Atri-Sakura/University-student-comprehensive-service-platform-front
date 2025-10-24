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
          <view class="cert-icon" v-if="!certImages.business">
            <text class="cert-icon-text">📄</text>
          </view>
          <image v-else class="cert-image" :src="certImages.business" mode="aspectFill"></image>
          <view class="cert-info">
            <text class="cert-name">营业执照</text>
            <text class="cert-status" :class="certImages.business ? 'cert-verified' : 'cert-unverified'">
              {{ certImages.business ? '已认证' : '未上传' }}
            </text>
          </view>
        </view>
        <text class="cert-action">{{ certImages.business ? '查看' : '上传' }}</text>
      </view>
      <view class="cert-item" @click="viewCert('food')">
        <view class="cert-left">
          <view class="cert-icon" v-if="!certImages.food">
            <text class="cert-icon-text">📄</text>
          </view>
          <image v-else class="cert-image" :src="certImages.food" mode="aspectFill"></image>
          <view class="cert-info">
            <text class="cert-name">食品经营许可证</text>
            <text class="cert-status" :class="certImages.food ? 'cert-verified' : 'cert-unverified'">
              {{ certImages.food ? '已认证' : '未上传' }}
            </text>
          </view>
        </view>
        <text class="cert-action">{{ certImages.food ? '查看' : '上传' }}</text>
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

    <!-- 自定义编辑弹窗 -->
    <view class="edit-modal" v-if="showEditModal" @click="closeEditModal">
      <view class="edit-modal-content" @click.stop>
        <view class="edit-modal-header">
          <text class="edit-modal-title">{{ editModalTitle }}</text>
          <text class="edit-modal-close" @click="closeEditModal">✕</text>
        </view>
        <view class="edit-modal-body">
          <textarea 
            class="edit-textarea"
            :placeholder="editModalPlaceholder"
            :value="editModalValue"
            @input="onEditInput"
            :maxlength="200"
            auto-height
          />
          <view class="char-count">{{ editModalValue.length }}/200</view>
        </view>
        <view class="edit-modal-footer">
          <view class="modal-btn cancel-btn" @click="closeEditModal">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm-btn" @click="confirmEdit">
            <text class="modal-btn-text">确定</text>
          </view>
        </view>
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
      },
      showEditModal: false,
      editModalTitle: '',
      editModalPlaceholder: '',
      editModalValue: '',
      editModalType: '', // 'description' 或 'phone'
      certImages: {
        business: '', // 营业执照图片
        food: '' // 食品经营许可证图片
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
      // 加载资质证书图片
      const savedCertImages = uni.getStorageSync('certImages');
      if (savedCertImages) {
        this.certImages = savedCertImages;
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
    saveCertImages() {
      // 保存资质证书图片到本地存储
      uni.setStorageSync('certImages', this.certImages);
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
      this.editModalTitle = '修改联系电话';
      this.editModalPlaceholder = '请输入新的联系电话';
      this.editModalValue = this.shopInfo.phone;
      this.editModalType = 'phone';
      this.showEditModal = true;
    },
    editDescription() {
      this.editModalTitle = '编辑公告/简介';
      this.editModalPlaceholder = '请输入店铺简介';
      this.editModalValue = this.shopInfo.description;
      this.editModalType = 'description';
      this.showEditModal = true;
    },
    onEditInput(e) {
      this.editModalValue = e.detail.value;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editModalValue = '';
      this.editModalType = '';
    },
    confirmEdit() {
      if (!this.editModalValue.trim()) {
        uni.showToast({
          title: '内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      if (this.editModalType === 'description') {
        this.shopInfo.description = this.editModalValue;
        this.saveShopInfo(); // 保存到本地存储
      } else if (this.editModalType === 'phone') {
        this.shopInfo.phone = this.editModalValue;
        this.saveShopInfo(); // 保存到本地存储
      }
      
      this.closeEditModal();
      uni.showToast({
        title: '修改成功',
        icon: 'success'
      });
    },
    viewCert(type) {
      const certName = type === 'business' ? '营业执照' : '食品经营许可证';
      const hasImage = this.certImages[type];
      
      if (hasImage) {
        // 已有图片，显示操作选项
        uni.showActionSheet({
          itemList: ['查看图片', '更新图片', '删除图片'],
          success: (res) => {
            if (res.tapIndex === 0) {
              // 查看图片
              uni.previewImage({
                urls: [this.certImages[type]],
                current: 0
              });
            } else if (res.tapIndex === 1) {
              // 更新图片
              this.uploadCertImage(type, certName);
            } else if (res.tapIndex === 2) {
              // 删除图片
              uni.showModal({
                title: '确认删除',
                content: `确定要删除${certName}吗？`,
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    this.certImages[type] = '';
                    this.saveCertImages();
                    uni.showToast({
                      title: '删除成功',
                      icon: 'success'
                    });
                  }
                }
              });
            }
          }
        });
      } else {
        // 没有图片，直接上传
        this.uploadCertImage(type, certName);
      }
    },
    uploadCertImage(type, certName) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.certImages[type] = tempFilePath;
          this.saveCertImages();
          uni.showToast({
            title: `${certName}上传成功`,
            icon: 'success'
          });
        },
        fail: () => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          });
        }
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

.cert-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  object-fit: cover;
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

.cert-unverified {
  color: #999;
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

/* 自定义编辑弹窗 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.edit-modal-content {
  width: 85%;
  max-width: 600rpx;
  background: white;
  border-radius: 20rpx;
  overflow: hidden;
}

.edit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: #f8f9fa;
}

.edit-modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.edit-modal-close {
  font-size: 40rpx;
  color: #999;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-modal-body {
  padding: 30rpx;
  min-height: 300rpx;
}

.edit-textarea {
  width: 100%;
  min-height: 280rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  box-sizing: border-box;
  border: 1rpx solid #e0e0e0;
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

.edit-modal-footer {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
}

.modal-btn {
  flex: 1;
  padding: 30rpx 0;
  text-align: center;
  font-size: 30rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  color: white;
  font-weight: bold;
}

.modal-btn-text {
  font-size: 30rpx;
}
</style>
