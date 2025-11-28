<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="handleBack" :class="{ 'navbar-left-hover': leftHover }" 
              @touchstart="leftHover = true" @touchend="leftHover = false">
          <text class="navbar-icon">&lt;</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">选择收货地址</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 地址列表 -->
    <view class="address-list">
      <view v-if="addressList.length > 0" class="list-content">
        <view v-for="(item, index) in addressList" :key="item.id" class="address-item" @click="selectAddress(item)">
          <view class="address-header">
            <text class="receiver-name">{{ item.name }}</text>
            <text class="receiver-phone">{{ item.phone }}</text>
            <text v-if="item.isDefault" class="default-tag">默认</text>
          </view>
          <view class="address-content">
            <text class="address-text">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}</text>
            <text class="address-tag">{{ item.addressTag || '' }}</text>
          </view>
          <view class="address-footer">
            <view class="address-actions">
              <text class="action-item" @click.stop="editAddress(item, index)">编辑</text>
              <text class="action-item" @click.stop="deleteAddress(item.id, index)">删除</text>
              <text v-if="!item.isDefault" class="action-item" @click.stop="setDefault(item.id, index)">设为默认</text>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="empty-address">
        <text class="empty-text">暂无收货地址</text>
        <view class="add-address-btn" @click="addAddress">添加地址</view>
      </view>
    </view>

    <!-- 底部添加按钮 -->
    <view v-if="addressList.length > 0" class="bottom-actions">
      <view class="add-address-btn" @click="addAddress">添加新地址</view>
    </view>
  </view>
</template>

<script>
import { getAddressList, deleteAddress, setDefaultAddress } from '@/api/address.js';

export default {
  data() {
    return {
      leftHover: false,
      addressList: [],
      loading: false
    };
  },
  onLoad() {
    this.getAddressList();
  },
  methods: {
    // 返回上一页
    handleBack() {
      uni.navigateBack();
    },
    
    // 获取地址列表
    async getAddressList() {
      try {
        // 首先从本地存储获取地址列表
        const localAddressList = uni.getStorageSync('addressList') || [];
        if (localAddressList.length > 0) {
          this.addressList = localAddressList;
        }
        
        // 然后尝试从服务器获取最新地址列表
        const result = await getAddressList();
        if (result && result.code === 200) {
          this.addressList = result.data || [];
          // 更新本地存储
          uni.setStorageSync('addressList', this.addressList);
        }
      } catch (error) {
        console.error('获取地址列表失败:', error);
      }
    },
    
    // 选择地址
    selectAddress(address) {
      console.log('选择的地址:', JSON.stringify(address));
      
      // 验证地址对象是否有效
      if (!address) {
        console.error('地址对象为undefined或null');
        uni.showToast({
          title: '地址数据异常',
          icon: 'none'
        });
        return;
      }
      
      // 检查必要字段（适配不同的字段名）
      if (!address.phone) {
        console.error('地址对象缺少phone字段', address);
        uni.showToast({
          title: '地址信息不完整，缺少联系电话',
          icon: 'none'
        });
        return;
      }
      
      // 检查姓名字段（可能是name或receiver）
      if (!address.name && !address.receiver) {
        console.error('地址对象缺少name或receiver字段', address);
        uni.showToast({
          title: '地址信息不完整，缺少收货人姓名',
          icon: 'none'
        });
        return;
      }
      
      // 获取页面栈
      const pages = getCurrentPages();
      console.log('页面栈长度:', pages.length);
      
      // 确保页面栈有足够的页面
      if (pages.length < 2) {
        console.warn('页面栈深度不足，将地址存储到本地');
        // 转换地址对象，适配期望的字段名
        const formattedAddress = {
          // 使用receiver作为name（数据结构适配）
          name: address.receiver || address.name,
          phone: address.phone,
          province: address.province,
          city: address.city,
          district: address.district,
          // 使用detailAddress作为detail（数据结构适配）
          detail: address.detailAddress || address.detail,
          // 保留其他原始字段
          ...address
        };
        
        // 将选择的地址存储到本地
        uni.setStorageSync('selectedAddress', formattedAddress);
        
        uni.showToast({
          title: '地址已选择，请返回订单页',
          icon: 'none'
        });
        
        // 尝试返回上一页，如果失败则不做处理
        try {
          uni.navigateBack();
        } catch (error) {
          console.log('无法返回上一页');
        }
        return;
      }
      
      // 获取上一个页面
      const prevPage = pages[pages.length - 2];
      console.log('前一个页面:', prevPage.route);
      
      // 确保是订单确认页面
      if (prevPage.route !== 'pages/food/order-confirm') {
        console.error('前一个页面不是订单确认页');
        uni.showToast({
          title: '系统异常，请重试',
          icon: 'none'
        });
        return;
      }
      
      // 检查方法是否存在
      if (typeof prevPage.setSelectedAddress !== 'function') {
        console.error('前一个页面没有setSelectedAddress方法');
        uni.showToast({
          title: '系统异常，请重试',
          icon: 'none'
        });
        return;
      }
      
      try {
        // 转换地址对象，适配期望的字段名
        const formattedAddress = {
          // 使用receiver作为name（数据结构适配）
          name: address.receiver || address.name,
          phone: address.phone,
          province: address.province,
          city: address.city,
          district: address.district,
          // 使用detailAddress作为detail（数据结构适配）
          detail: address.detailAddress || address.detail,
          // 保留其他原始字段
          ...address
        };
        
        console.log('转换后的地址对象:', JSON.stringify(formattedAddress));
        // 调用前一个页面的方法设置地址
        prevPage.setSelectedAddress(formattedAddress);
        console.log('地址设置成功');
        
        // 延迟返回，确保地址设置生效
        setTimeout(() => {
          uni.navigateBack();
        }, 100);
      } catch (error) {
        console.error('设置地址时出错:', error);
        uni.showToast({
          title: '设置地址失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 编辑地址
    editAddress(address, index) {
      // 跳转到地址编辑页面
      uni.navigateTo({
        url: `/pages/mine/address-edit?id=${address.id}&index=${index}`
      });
    },
    
    // 添加地址
    addAddress() {
      // 跳转到地址编辑页面
      uni.navigateTo({
        url: '/pages/mine/address-edit'
      });
    },
    
    // 删除地址
    async deleteAddress(addressId, index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个地址吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              this.loading = true;
              // 调用删除地址API，传递正确的参数格式
              const result = await deleteAddress({ userAddressId: addressId });
              
              if (result && result.code === 200) {
                // 从列表中移除
                this.addressList.splice(index, 1);
                // 更新本地存储
                uni.setStorageSync('addressList', this.addressList);
                
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
              this.loading = false;
            }
          }
        }
      });
    },
    
    // 设为默认地址
    async setDefault(addressId, index) {
      try {
        this.loading = true;
        // 调用设置默认地址API，使用正确的函数名
        const result = await setDefaultAddress(addressId);
        
        if (result && result.code === 200) {
          // 更新本地列表
          this.addressList.forEach(item => {
            item.isDefault = item.id === addressId;
          });
          
          // 更新本地存储
          uni.setStorageSync('addressList', this.addressList);
          
          uni.showToast({
            title: '设置成功',
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
        this.loading = false;
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

/* 地址列表 */
.address-list {
  width: 100%;
  padding: 20rpx;
}

.address-item {
  background-color: white;
  margin-bottom: 20rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.receiver-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 20rpx;
}

.receiver-phone {
  font-size: 30rpx;
  color: #666666;
  margin-right: 20rpx;
}

.default-tag {
  font-size: 24rpx;
  color: white;
  background-color: #4A90E2;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}

.address-content {
  margin-bottom: 20rpx;
}

.address-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  word-break: break-all;
}

.address-tag {
  font-size: 26rpx;
  color: #999999;
  margin-top: 10rpx;
  display: inline-block;
}

.address-footer {
  display: flex;
  justify-content: flex-end;
}

.address-actions {
  display: flex;
  gap: 30rpx;
}

.action-item {
  font-size: 28rpx;
  color: #666666;
  padding: 8rpx 0;
}

/* 空地址状态 */
.empty-address {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 30rpx;
  color: #999999;
  margin-bottom: 40rpx;
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

.add-address-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.add-address-btn:active {
  opacity: 0.8;
}
</style>
