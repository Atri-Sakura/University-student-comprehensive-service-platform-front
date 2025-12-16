<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">{{ isEdit ? '编辑地址' : '新增地址' }}</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 地区选择弹窗 -->
    <view class="region-picker-mask" v-if="showRegionPopup" @click="closeRegionPicker"></view>
    <view class="region-picker-popup" :class="{ show: showRegionPopup }">
      <view class="region-picker-header">
        <text class="region-picker-cancel" @click="closeRegionPicker">取消</text>
        <text class="region-picker-title">选择地区</text>
        <text class="region-picker-confirm" @click="confirmRegion">确定</text>
      </view>
      <view class="region-tabs">
        <text 
          class="region-tab" 
          :class="{ active: currentLevel === 0 }"
          @click="switchLevel(0)"
        >{{ tempProvince || '请选择' }}</text>
        <text 
          class="region-tab" 
          :class="{ active: currentLevel === 1 }"
          @click="switchLevel(1)"
          v-if="tempProvince"
        >{{ tempCity || '请选择' }}</text>
        <text 
          class="region-tab" 
          :class="{ active: currentLevel === 2 }"
          @click="switchLevel(2)"
          v-if="tempCity"
        >{{ tempDistrict || '请选择' }}</text>
      </view>
      <scroll-view 
        class="region-list" 
        scroll-y 
        :scroll-top="scrollTop"
        @scroll="onRegionScroll"
      >
        <view 
          class="region-item" 
          v-for="(item, index) in currentRegionList" 
          :key="index"
          :class="{ selected: isRegionSelected(item) }"
          @click="selectRegion(item)"
        >
          <text class="region-item-text">{{ item }}</text>
          <text class="region-item-check" v-if="isRegionSelected(item)">✓</text>
        </view>
      </scroll-view>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="form-item">
        <view class="form-label">
          <text class="label-text">收货人</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="text"
            placeholder="请输入收货人姓名"
            v-model="formData.name"
            maxlength="20"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-text">手机号</text>
        </view>
        <view class="form-input-wrapper">
          <input
            class="form-input"
            type="number"
            placeholder="请输入手机号"
            v-model="formData.phone"
            maxlength="11"
          />
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-text">所在地区</text>
        </view>
        <view class="form-input-wrapper region-selector" @click="showRegionPicker">
          <text class="form-input region-text" :class="{ placeholder: !regionText }">
            {{ regionText || '请选择省市区' }}
          </text>
          <text class="arrow-icon">></text>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-text">详细地址</text>
        </view>
        <view class="form-input-wrapper">
          <textarea
            class="form-textarea"
            placeholder="请输入街道、门牌号等详细地址"
            v-model="formData.detail"
            maxlength="100"
            auto-height
          ></textarea>
        </view>
      </view>

      <view class="form-item">
        <view class="form-label">
          <text class="label-text">地址标签</text>
        </view>
        <view class="tag-selector">
          <view 
            class="tag-item" 
            :class="{ active: formData.addressTag === tag.value }"
            v-for="tag in addressTags" 
            :key="tag.value"
            @click="selectTag(tag.value)"
          >
            <text class="tag-text">{{ tag.label }}</text>
          </view>
        </view>
      </view>

      <view class="form-item checkbox-item">
        <view class="checkbox-wrapper" @click="toggleDefault">
          <view class="checkbox" :class="{ checked: formData.isDefault }">
            <text class="checkbox-icon" v-if="formData.isDefault">✓</text>
          </view>
          <text class="checkbox-label">设为默认地址</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="bottom-actions">
      <view class="save-button" @click="saveAddress">
        <text class="save-text">保存</text>
      </view>
    </view>
  </view>
</template>

<script>
import { addAddress, updateAddress, getAddressDetail } from '@/api/address.js';
import { regionData } from '@/utils/region-data.js';
import { processApiResponseIds, safeStringifyId } from '@/utils/id-utils.js';
import { fixKnownId } from '@/utils/id-fix-helper.js';

export default {
  data() {
    return {
      isEdit: false,
      editIndex: -1,
      addressId: null,
      formData: {
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        addressTag: 'HOME',
        isDefault: false
      },
      regionText: '',
      addressTags: [
        { label: '家', value: 'HOME' },
        { label: '公司', value: 'COMPANY' },
        { label: '学校', value: 'SCHOOL' },
        { label: '其他', value: 'OTHER' }
      ],
      // 地区选择器相关
      showRegionPopup: false,
      currentLevel: 0, // 0: 省, 1: 市, 2: 区
      tempProvince: '',
      tempCity: '',
      tempDistrict: '',
      scrollTop: 0,
      lastScrollTop: 0
    };
  },
  computed: {
    // 计算地区文本显示
    regionDisplay() {
      if (this.formData.province && this.formData.city && this.formData.district) {
        return `${this.formData.province} ${this.formData.city} ${this.formData.district}`;
      }
      return '';
    },
    // 当前级别的地区列表
    currentRegionList() {
      if (this.currentLevel === 0) {
        // 返回所有省份
        return regionData.map(p => p.name);
      } else if (this.currentLevel === 1) {
        // 返回选中省份的城市
        const province = regionData.find(p => p.name === this.tempProvince);
        return province ? province.cities.map(c => c.name) : [];
      } else if (this.currentLevel === 2) {
        // 返回选中城市的区县
        const province = regionData.find(p => p.name === this.tempProvince);
        if (province) {
          const city = province.cities.find(c => c.name === this.tempCity);
          return city ? city.districts : [];
        }
        return [];
      }
      return [];
    }
  },
  watch: {
    regionDisplay(newVal) {
      this.regionText = newVal;
    }
  },
  onLoad(options) {
    if (options.id) {
      // 编辑模式
      this.isEdit = true;
      this.addressId = options.id;
      this.editIndex = options.index ? parseInt(options.index) : -1;
      
      // 修正错误的ID
      this.addressId = fixKnownId(this.addressId);
      
      this.loadAddressData();
    } else {
      // 新增模式
      this.isEdit = false;
    }
  },
  methods: {
    goBack() {
      this.safeNavigateBack();
    },
    safeNavigateBack() {
      // 检查页面栈，如果只有一个页面（刷新后的情况），则跳转到地址列表
      const pages = getCurrentPages();
      if (pages.length <= 1) {
        // 页面栈只有一个页面，直接跳转到地址列表
        uni.redirectTo({
          url: '/pages/mine/address'
        });
      } else {
        // 正常返回上一页
        uni.navigateBack();
      }
    },
    async loadAddressData() {
      if (!this.addressId) return;
      
      let loadingShown = false;
      try {
        uni.showLoading({
          title: '加载中...'
        });
        loadingShown = true;
        
        const res = await getAddressDetail(this.addressId);
        
        if (res && res.code === 200 && res.data) {
          // 使用ID处理工具处理响应数据，确保大整数ID安全
          const processedData = processApiResponseIds(res.data, ['userAddressId', 'userBaseId']);
          const data = processedData;
          
          // 确保ID以字符串形式存储
          this.addressId = safeStringifyId(data.userAddressId || this.addressId);
          
          this.formData = {
            name: data.receiver || data.consignee || data.name || '',
            phone: data.phone || '',
            province: data.province || data.provinceName || '',
            city: data.city || data.cityName || '',
            district: data.district || data.districtName || '',
            detail: data.detailAddress || data.detail || '',
            addressTag: data.addressTag || 'HOME',
            isDefault: data.isDefault === 1 || data.isDefault === true
          };
          this.regionText = this.regionDisplay;
        } else {
          uni.showToast({
            title: res.msg || '获取地址信息失败',
            icon: 'none'
          });
          
          // 如果接口失败，尝试从本地存储加载
          const addressList = uni.getStorageSync('addressList') || [];
          if (this.editIndex >= 0 && addressList[this.editIndex]) {
            this.formData = { ...addressList[this.editIndex] };
            this.regionText = this.regionDisplay;
          }
        }
      } catch (error) {
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        
        // 网络错误时，从本地存储加载
        const addressList = uni.getStorageSync('addressList') || [];
        if (this.editIndex >= 0 && addressList[this.editIndex]) {
          this.formData = { ...addressList[this.editIndex] };
          this.regionText = this.regionDisplay;
        }
      } finally {
        if (loadingShown) {
          uni.hideLoading();
        }
      }
    },
    showRegionPicker() {
      // 初始化临时选择值
      this.tempProvince = this.formData.province || '';
      this.tempCity = this.formData.city || '';
      this.tempDistrict = this.formData.district || '';
      // 根据已选择的值决定显示哪一级
      if (this.tempDistrict) {
        this.currentLevel = 2;
      } else if (this.tempCity) {
        this.currentLevel = 2;
      } else if (this.tempProvince) {
        this.currentLevel = 1;
      } else {
        this.currentLevel = 0;
      }
      this.scrollTop = 0;
      this.showRegionPopup = true;
    },
    closeRegionPicker() {
      this.showRegionPopup = false;
    },
    confirmRegion() {
      if (this.tempProvince && this.tempCity && this.tempDistrict) {
        this.formData.province = this.tempProvince;
        this.formData.city = this.tempCity;
        this.formData.district = this.tempDistrict;
        this.regionText = this.regionDisplay;
        this.closeRegionPicker();
      } else {
        uni.showToast({
          title: '请选择完整的地区',
          icon: 'none'
        });
      }
    },
    switchLevel(level) {
      if (level === 0) {
        this.currentLevel = 0;
      } else if (level === 1 && this.tempProvince) {
        this.currentLevel = 1;
      } else if (level === 2 && this.tempCity) {
        this.currentLevel = 2;
      }
      // 切换级别时滚动到顶部
      this.resetScrollTop();
    },
    resetScrollTop() {
      // 先设置一个不同的值，再设置为0，确保scroll-view响应变化
      this.scrollTop = this.lastScrollTop + 1;
      this.$nextTick(() => {
        this.scrollTop = 0;
      });
    },
    onRegionScroll(e) {
      this.lastScrollTop = e.detail.scrollTop;
    },
    selectRegion(item) {
      if (this.currentLevel === 0) {
        // 选择省份
        if (this.tempProvince !== item) {
          this.tempProvince = item;
          this.tempCity = '';
          this.tempDistrict = '';
        }
        this.currentLevel = 1;
        // 切换到下一级时滚动到顶部
        this.resetScrollTop();
      } else if (this.currentLevel === 1) {
        // 选择城市
        if (this.tempCity !== item) {
          this.tempCity = item;
          this.tempDistrict = '';
        }
        this.currentLevel = 2;
        // 切换到下一级时滚动到顶部
        this.resetScrollTop();
      } else if (this.currentLevel === 2) {
        // 选择区县
        this.tempDistrict = item;
        // 选择完区县后自动确认
        this.confirmRegion();
      }
    },
    isRegionSelected(item) {
      if (this.currentLevel === 0) {
        return this.tempProvince === item;
      } else if (this.currentLevel === 1) {
        return this.tempCity === item;
      } else {
        return this.tempDistrict === item;
      }
    },
    parseAddress(address) {
      // 简单的地址解析（实际项目中应该使用更精确的方法）
      // 这里只是示例，实际应该使用地址解析API或正则表达式
      if (address.includes('北京')) {
        this.formData.province = '北京市';
        this.formData.city = '北京市';
        // 尝试提取区名
        const districtMatch = address.match(/(\w+区)/);
        if (districtMatch) {
          this.formData.district = districtMatch[1];
        } else {
          this.formData.district = '朝阳区';
        }
      } else {
        // 其他地址的解析逻辑
        this.formData.province = '请选择';
        this.formData.city = '请选择';
        this.formData.district = '请选择';
      }
      this.regionText = this.regionDisplay;
    },
    selectTag(tagValue) {
      this.formData.addressTag = tagValue;
    },
    toggleDefault() {
      this.formData.isDefault = !this.formData.isDefault;
    },
    validateForm() {
      if (!this.formData.name || this.formData.name.trim() === '') {
        uni.showToast({
          title: '请输入收货人姓名',
          icon: 'none'
        });
        return false;
      }

      if (!this.formData.phone || this.formData.phone.trim() === '') {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        });
        return false;
      }

      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(this.formData.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        });
        return false;
      }

      if (!this.formData.province || !this.formData.city || !this.formData.district) {
        uni.showToast({
          title: '请选择所在地区',
          icon: 'none'
        });
        return false;
      }

      if (!this.formData.detail || this.formData.detail.trim() === '') {
        uni.showToast({
          title: '请输入详细地址',
          icon: 'none'
        });
        return false;
      }

      return true;
    },
    async saveAddress() {
      if (!this.validateForm()) {
        return;
      }

      let loadingShown = false;
      try {
        uni.showLoading({
          title: '保存中...'
        });
        loadingShown = true;
        
        // 准备提交的数据
        const submitData = {
          receiver: this.formData.name,
          phone: this.formData.phone,
          province: this.formData.province,
          city: this.formData.city,
          district: this.formData.district,
          detailAddress: this.formData.detail,
          addressTag: this.formData.addressTag,
          isDefault: this.formData.isDefault ? 1 : 0
        };
        
        // 如果是编辑模式，添加ID
        if (this.isEdit && this.addressId) {
          // 确保ID以字符串形式提交
          submitData.userAddressId = safeStringifyId(this.addressId);
        }
        
        let result;
        if (this.isEdit) {
          result = await updateAddress(submitData);
        } else {
          result = await addAddress(submitData);
        }
        
        if (result && result.code === 200) {
          // 更新本地存储（为了保持数据一致性）
          let addressList = uni.getStorageSync('addressList') || [];
          
          if (this.isEdit && this.editIndex >= 0) {
            // 编辑模式：更新地址
            addressList[this.editIndex] = {
              ...this.formData,
              id: this.addressId
            };
          } else {
            // 新增模式：添加地址
            const newAddress = {
              ...this.formData,
              id: result.data?.userAddressId || Math.floor(Math.random() * 90000000) + 10000000
            };
            
            // 如果设置为默认地址，取消其他默认地址
            if (newAddress.isDefault) {
              addressList.forEach(item => {
                item.isDefault = false;
              });
            }
            
            addressList.push(newAddress);
          }
          
          // 保存到本地存储
          uni.setStorageSync('addressList', addressList);
          
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            this.safeNavigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: result.msg || '保存失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      } finally {
        if (loadingShown) {
          uni.hideLoading();
        }
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
  padding-top: 88rpx;
  padding-bottom: 160rpx;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(to bottom, #4A90E2, #6AAFE2);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding-top: var(--status-bar-height, 44rpx);
}

.navbar-content {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.navbar-left {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.navbar-left-hover {
  opacity: 0.7;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.navbar-icon {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
}

.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 36rpx;
  color: white;
  font-weight: bold;
}

.navbar-right {
  width: 60rpx;
}

/* 表单区域 */
.form-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 40rpx 30rpx;
  border-radius: 20rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-item:last-of-type {
  margin-bottom: 0;
}

.checkbox-item {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #F0F0F0;
}

.form-label {
  margin-bottom: 20rpx;
}

.label-text {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.form-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  flex: 1;
  height: 88rpx;
  padding: 0 20rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #333333;
}

.form-input[disabled] {
  color: #333333;
  background-color: #F8F8F8;
  pointer-events: none;
}

.region-selector {
  cursor: pointer;
}

.region-text {
  flex: 1;
  display: flex;
  align-items: center;
}

.region-text.placeholder {
  color: #999999;
}

.arrow-icon {
  position: absolute;
  right: 20rpx;
  font-size: 32rpx;
  color: #CCCCCC;
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 20rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #333333;
  line-height: 1.6;
}

/* 地址标签选择器样式 */
.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 10rpx;
}

.tag-item {
  padding: 16rpx 32rpx;
  background-color: #F5F5F5;
  border: 2rpx solid #E0E0E0;
  border-radius: 24rpx;
  font-size: 28rpx;
  color: #666666;
  transition: all 0.3s ease;
}

.tag-item.active {
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  border-color: #4A90E2;
  color: white;
}

.tag-text {
  font-size: 28rpx;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #CCCCCC;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  background-color: white;
}

.checkbox.checked {
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  border-color: #4A90E2;
}

.checkbox-icon {
  font-size: 24rpx;
  color: white;
  font-weight: bold;
}

.checkbox-label {
  font-size: 28rpx;
  color: #333333;
}

/* 底部保存按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #F0F0F0;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.save-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.save-button:active {
  opacity: 0.8;
}

/* 地区选择器弹窗样式 */
.region-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

.region-picker-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  z-index: 1002;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  height: 60vh;
  display: flex;
  flex-direction: column;
}

.region-picker-popup.show {
  transform: translateY(0);
}

.region-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.region-picker-cancel {
  font-size: 28rpx;
  color: #999;
  padding: 10rpx 20rpx;
}

.region-picker-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.region-picker-confirm {
  font-size: 28rpx;
  color: #4A90E2;
  padding: 10rpx 20rpx;
  font-weight: 500;
}

.region-tabs {
  display: flex;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  gap: 30rpx;
}

.region-tab {
  font-size: 28rpx;
  color: #666;
  padding: 10rpx 0;
  position: relative;
}

.region-tab.active {
  color: #4A90E2;
  font-weight: 500;
}

.region-tab.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4rpx;
  background-color: #4A90E2;
  border-radius: 2rpx;
}

.region-list {
  flex: 1;
  height: 0;
  padding: 10rpx 0;
}

.region-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx;
}

.region-item:active {
  background-color: #f5f5f5;
}

.region-item.selected {
  background-color: #f0f7ff;
}

.region-item-text {
  font-size: 30rpx;
  color: #333;
}

.region-item.selected .region-item-text {
  color: #4A90E2;
  font-weight: 500;
}

.region-item-check {
  font-size: 28rpx;
  color: #4A90E2;
  font-weight: bold;
}
</style>

