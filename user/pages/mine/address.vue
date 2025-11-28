<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">收货地址</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 地址列表 -->
    <view class="address-list">
      <view 
        class="address-item" 
        v-for="(address, index) in addressList" 
        :key="index"
        @click="selectAddress(address, index)"
      >
        <view class="address-content">
          <view class="address-header">
            <text class="address-name">{{ address.name }}</text>
            <text class="address-phone">{{ address.phone }}</text>
            <view class="address-tags">
              <text class="tag address-tag">{{ getTagLabel(address.addressTag) }}</text>
              <text v-if="address.isDefault" class="tag default-tag">默认</text>
            </view>
          </view>
          <view class="address-detail">
            <text class="address-text">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}</text>
          </view>
        </view>
        <view class="address-actions" @click.stop>
          <view class="action-item" @click="setDefault(address, index)">
            <text class="action-icon">{{ address.isDefault ? '✓' : '○' }}</text>
            <text class="action-text" :class="{ active: address.isDefault }">默认</text>
          </view>
          <view class="action-item" @click="editAddress(address, index)">
            <text class="action-icon">✎</text>
            <text class="action-text">编辑</text>
          </view>
          <view class="action-item" @click="deleteAddress(address, index)">
            <text class="action-icon">🗑️</text>
            <text class="action-text">删除</text>
          </view>
        </view>
      </view>

      <view v-if="addressList.length === 0" class="empty-address">
        <text class="empty-icon">📍</text>
        <text class="empty-text">暂无收货地址</text>
        <text class="empty-desc">点击下方按钮添加地址</text>
      </view>
    </view>

    <!-- 底部添加按钮 -->
    <view class="bottom-actions">
      <view class="add-button" @click="addAddress">
        <text class="add-icon">+</text>
        <text class="add-text">添加新地址</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getAddressList, deleteAddress as deleteAddressAPI, setDefaultAddress } from '@/api/address.js';
import { processApiResponseIds, safeStringifyId } from '@/utils/id-utils.js';
import { fixAddressArray } from '@/utils/address-id-fix.js';
import { fixKnownId } from '@/utils/id-fix-helper.js';
import { safeNavigateBackForMine } from '@/utils/navigation.js';

export default {
  data() {
    return {
      addressList: [],
      selectMode: false // 是否是从订单页面选择地址
    };
  },
  onLoad(options) {
    // 如果是从订单页面跳转过来的，进入选择模式
    if (options.select === 'true') {
      this.selectMode = true;
    }
    this.loadAddressList();
  },
  methods: {
    getTagLabel(tagValue) {
      const tagMap = {
        'HOME': '家',
        'COMPANY': '公司', 
        'SCHOOL': '学校',
        'OTHER': '其他'
      };
      return tagMap[tagValue] || '家';
    },
    goBack() {
      safeNavigateBackForMine('address');
    },
    async loadAddressList() {
      let loadingShown = false;
      try {
        uni.showLoading({
          title: '加载中...'
        });
        loadingShown = true;
        
        const res = await getAddressList();
        
        if (res && res.code === 200) {
          // 使用ID处理工具处理响应数据
          const processedData = processApiResponseIds(res.data, ['userAddressId', 'userBaseId', 'id']);
          
          // 使用地址ID修复工具进一步修复
          const fixedData = fixAddressArray(processedData);
          
          // 处理后端返回的地址数据
          this.addressList = (fixedData || []).map(item => {
            return {
              id: safeStringifyId(item.userAddressId || item.id),
              userAddressId: safeStringifyId(item.userAddressId),
              userBaseId: safeStringifyId(item.userBaseId), // 也转为字符串，保持一致性
              name: item.receiver || item.consignee || item.name || '',
              phone: item.phone || '',
              province: item.province || item.provinceName || '',
              city: item.city || item.cityName || '',
              district: item.district || item.districtName || '',
              detail: item.detailAddress || item.detail || '',
              addressTag: item.addressTag || 'HOME',
              isDefault: item.isDefault === 1 || item.isDefault === true
            };
          });
          
          // 保存到本地存储
          uni.setStorageSync('addressList', this.addressList);
        } else {
          uni.showToast({
            title: res.msg || '获取地址列表失败',
            icon: 'none'
          });
          
          // 如果接口失败，尝试从本地存储加载
          const storedAddresses = uni.getStorageSync('addressList');
          if (storedAddresses && storedAddresses.length > 0) {
            this.addressList = storedAddresses;
          }
        }
      } catch (error) {
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
        
        // 网络错误时，从本地存储加载
        const storedAddresses = uni.getStorageSync('addressList');
        if (storedAddresses && storedAddresses.length > 0) {
          this.addressList = storedAddresses;
        }
      } finally {
        if (loadingShown) {
          uni.hideLoading();
        }
      }
    },
    addAddress() {
      uni.navigateTo({
        url: '/pages/mine/address-edit'
      });
    },
    editAddress(address, index) {
      // 不使用parseInt，直接传递字符串ID，避免大整数精度丢失
      const addressId = address.userAddressId || address.id;
      
      // 确保ID以字符串形式传递
      let safeAddressId = safeStringifyId(addressId);
      
      // 修复已知的错误ID
      safeAddressId = fixKnownId(safeAddressId);
      
      uni.navigateTo({
        url: `/pages/mine/address-edit?id=${safeAddressId}&index=${index}`
      });
    },
    deleteAddress(address, index) {
      uni.showModal({
        title: '删除地址',
        content: '确定要删除这个收货地址吗？',
        confirmText: '删除',
        confirmColor: '#FF4444',
        success: async (res) => {
          if (res.confirm) {
            // 调试信息
            console.log('删除地址 - address对象:', address);
            const addressId = address.userAddressId || address.id;
            console.log('删除使用的ID:', addressId);
            console.log('当前用户token:', uni.getStorageSync('token'));
            console.log('地址完整信息:', JSON.stringify(address, null, 2));
            
            // 检查大整数问题
            if (typeof addressId === 'number') {
              logBigIntegerIssue('删除地址操作', addressId);
            }
            
            let loadingShown = false;
            try {
              uni.showLoading({
                title: '删除中...'
              });
              loadingShown = true;
              
              // 使用安全的ID处理
              const safeAddressId = safeStringifyId(addressId);
              console.log('准备删除的ID:', safeAddressId, '类型:', typeof safeAddressId);
              console.log('原始ID是否超出安全整数范围:', typeof addressId === 'number' && addressId > Number.MAX_SAFE_INTEGER);
              
              const result = await deleteAddressAPI({
                userAddressId: safeAddressId
              });
              
              console.log('删除API返回结果:', result);
              
              if (result && result.code === 200) {
                this.addressList.splice(index, 1);
                this.saveAddressList();
                
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
              } else {
                uni.showToast({
                  title: result.msg || '删除失败',
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
      });
    },
    async setDefault(address, index) {
      if (address.isDefault) {
        return;
      }
      
      // 调试信息
      console.log('设置默认地址 - address对象:', address);
      const addressId = address.userAddressId || address.id;
      console.log('使用的ID:', addressId);
      
      // 检查大整数问题
      if (typeof addressId === 'number') {
        logBigIntegerIssue('设置默认地址操作', addressId);
      }
      
      let loadingShown = false;
      try {
        uni.showLoading({
          title: '设置中...'
        });
        loadingShown = true;
        
        // 使用安全的ID处理
        const safeAddressId = safeStringifyId(addressId);
        const result = await setDefaultAddress(safeAddressId);
        
        if (result && result.code === 200) {
          // 取消其他默认地址
          this.addressList.forEach(item => {
            item.isDefault = false;
          });
          // 设置当前为默认
          this.addressList[index].isDefault = true;
          this.saveAddressList();
          
          uni.showToast({
            title: '已设置为默认地址',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: result.msg || '设置失败',
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
    },
    selectAddress(address, index) {
      // 如果是从订单页面选择地址
      if (this.selectMode) {
        // 通过事件总线或全局状态管理返回选中的地址
        // 这里使用页面栈传递数据
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2];
        if (prevPage && prevPage.selectAddress) {
          prevPage.selectAddress(address);
        }
        safeNavigateBackForMine('address');
      }
    },
    saveAddressList() {
      // 保存到本地存储
      uni.setStorageSync('addressList', this.addressList);
    }
  },
  onShow() {
    // 页面显示时重新加载地址列表（可能从编辑页面返回）
    this.loadAddressList();
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

/* 地址列表 */
.address-list {
  padding: 20rpx 30rpx;
}

.address-item {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.address-content {
  margin-bottom: 20rpx;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.address-name {
  font-size: 32rpx;
  color: #333333;
  font-weight: 500;
  margin-right: 20rpx;
}

.address-phone {
  font-size: 28rpx;
  color: #666666;
  margin-right: 20rpx;
}

.address-tags {
  display: flex;
  align-items: center;
}

.tag {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-right: 10rpx;
}

.address-tag {
  background-color: #F0F0F0;
  color: #666666;
}

.default-tag {
  background-color: #E8F4FD;
  color: #4A90E2;
}

.address-detail {
  margin-top: 12rpx;
}

.address-text {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

.address-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-top: 20rpx;
  border-top: 1rpx solid #F0F0F0;
}

.action-item {
  display: flex;
  align-items: center;
  margin-left: 30rpx;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.action-item:active {
  background-color: #F5F5F5;
}

.action-icon {
  font-size: 28rpx;
  color: #666666;
  margin-right: 8rpx;
}

.action-item.active .action-icon {
  color: #4A90E2;
}

.action-text {
  font-size: 26rpx;
  color: #666666;
}

.action-item.active .action-text {
  color: #4A90E2;
}

/* 空状态 */
.empty-address {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 32rpx;
  color: #999999;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #CCCCCC;
}

/* 底部添加按钮 */
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

.add-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-icon {
  font-size: 40rpx;
  color: white;
  margin-right: 12rpx;
  font-weight: bold;
}

.add-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.add-button:active {
  opacity: 0.8;
}
</style>

