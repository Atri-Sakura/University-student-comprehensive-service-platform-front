<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">个人信息</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrapper" @click="changeAvatar">
        <image v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar-image" mode="aspectFill"></image>
        <view v-else class="avatar-placeholder">
          <text class="avatar-text">待上传</text>
        </view>
        <view class="avatar-mask">
          <text class="avatar-edit-text">点击更换</text>
        </view>
      </view>
    </view>

    <!-- 信息列表 -->
    <view class="info-section">
      <view class="info-item" @click="editField('nickname')">
        <view class="info-label">
          <text class="label-text">昵称</text>
        </view>
        <view class="info-value">
          <text class="value-text">{{ userInfo.nickname || '待填写' }}</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="info-item" @click="editField('profile')">
        <view class="info-label">
          <text class="label-text">个人简介</text>
        </view>
        <view class="info-value">
          <text class="value-text">{{ userInfo.profile || '待填写' }}</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="info-divider"></view>

      <view class="info-item" @click="editField('school')">
        <view class="info-label">
          <text class="label-text">学校</text>
        </view>
        <view class="info-value">
          <text class="value-text">{{ userInfo.school || '待填写' }}</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="info-item" @click="editField('college')">
        <view class="info-label">
          <text class="label-text">学院</text>
        </view>
        <view class="info-value">
          <text class="value-text">{{ userInfo.college || '待填写' }}</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="info-item" @click="editField('studentId')">
        <view class="info-label">
          <text class="label-text">学号</text>
        </view>
        <view class="info-value">
          <text class="value-text">{{ userInfo.studentId || '待填写' }}</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="info-divider"></view>

      <view class="info-item" @click="editField('phone')">
        <view class="info-label">
          <text class="label-text">手机号</text>
        </view>
        <view class="info-value">
          <text class="value-text">{{ userInfo.phone || '待填写' }}</text>
          <text class="arrow">></text>
        </view>
      </view>


      <view class="info-item" @click="editField('gender')">
        <view class="info-label">
          <text class="label-text">性别</text>
        </view>
        <view class="info-value">
          <text class="value-text">{{ genderText }}</text>
          <text class="arrow">></text>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
import { getUserInfo, updateUserInfo } from '@/api/user.js';

export default {
  data() {
    return {
      userInfo: {
        avatar: '',
        nickname: '',
        profile: '',
        school: '',
        college: '',
        studentId: '',
        phone: '',
        gender: 0 // 0: 未知, 1: 男, 2: 女
      }
    };
  },
  computed: {
    genderText() {
      const genderMap = {
        0: '待填写',
        1: '男',
        2: '女'
      };
      return genderMap[this.userInfo.gender] || '待填写';
    }
  },
  onLoad() {
    // 从本地存储或服务器加载用户信息
    this.loadUserInfo();
  },
  methods: {
    goBack() {
      // 获取当前页面栈信息
      const pages = getCurrentPages();
      
      // 如果页面栈长度为1，说明这是唯一的页面，直接使用reLaunch跳转
      if (pages.length <= 1) {
        uni.reLaunch({
          url: '/pages/mine/mine',
          fail: (err) => {
            // 如果 reLaunch 也失败，尝试使用 redirectTo
            uni.redirectTo({
              url: '/pages/mine/mine',
              fail: (err2) => {
                // 最后尝试使用 navigateTo
                uni.navigateTo({
                  url: '/pages/mine/mine',
                  fail: (err3) => {
                    uni.showToast({
                      title: '返回失败，请手动返回',
                      icon: 'none'
                    });
                  }
                });
              }
            });
          }
        });
        return;
      }
      
      // 页面栈长度大于1，使用正常的返回逻辑
      uni.navigateBack({
        delta: 1,
        fail: (err) => {
          // 当navigateBack失败时，使用reLaunch返回到我的页面
          uni.reLaunch({
            url: '/pages/mine/mine',
            fail: (err) => {
              // 如果 reLaunch 也失败，尝试使用 redirectTo
              uni.redirectTo({
                url: '/pages/mine/mine',
                fail: (err2) => {
                  // 最后尝试使用 navigateTo
                  uni.navigateTo({
                    url: '/pages/mine/mine',
                    fail: (err3) => {
                      uni.showToast({
                        title: '返回失败，请手动返回',
                        icon: 'none'
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    },
    async loadUserInfo() {
      try {
        const res = await getUserInfo();
        
        // 检查响应格式
        if (!res) {
          uni.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          });
          return;
        }
        
        // 检查业务状态码
        if (res.code !== undefined && res.code !== 200) {
          uni.showToast({
            title: res.msg || res.message || '个人信息加载失败',
            icon: 'none'
          });
          // 如果加载失败，尝试从本地存储获取，但不使用默认值
          const storedInfo = uni.getStorageSync('userInfo');
          if (storedInfo && typeof storedInfo === 'object') {
            // 只使用本地存储中实际存在的值，空值保持为空
            Object.keys(this.userInfo).forEach(key => {
              if (storedInfo[key] !== undefined && storedInfo[key] !== null && storedInfo[key] !== '') {
                this.userInfo[key] = storedInfo[key];
              }
            });
          }
          return;
        }
        
        // 提取数据（可能在 res.data 中，也可能直接在 res 中）
        const data = res.data !== undefined ? res.data : res;
        
        if (data && typeof data === 'object') {
          
          // 字段映射表（处理可能的字段名差异）
          // 注意：根据后端返回的字段，可能需要调整映射关系
          const fieldMapping = {
            // 前端字段名: 后端可能的字段名
            'profile': ['profile', 'signature', 'bio', 'introduction', 'description', 'remark'],
            'school': ['school', 'university', 'schoolName', 'school_name'],
            'nickname': ['nickname', 'nickName', 'name'],
            'college': ['college', 'department', 'faculty'],
            'studentId': ['studentId', 'student_id', 'studentNo', 'student_no'],
            'phone': ['phone', 'phoneNumber', 'phonenumber', 'mobile'],
            'avatar': ['avatar', 'avatarUrl', 'headImg'],
            'gender': ['gender', 'sex']
          };
          
          // 直接使用后端返回的数据，如果字段为空则保持为空，不使用默认值
          Object.keys(this.userInfo).forEach(frontendKey => {
            let value = undefined;
            
            // 首先尝试直接匹配
            if (data[frontendKey] !== undefined) {
              value = data[frontendKey];
            } else {
              // 尝试通过映射表查找
              const possibleKeys = fieldMapping[frontendKey] || [];
              for (let backendKey of possibleKeys) {
                if (data[backendKey] !== undefined) {
                  value = data[backendKey];
                  break;
                }
              }
            }
            
            // 设置值
            if (value !== undefined) {
              // 如果后端返回的值是 null 或 undefined，设置为空字符串
              // 注意：0、false 等有效值需要保留
              if (value === null || value === undefined) {
                this.userInfo[frontendKey] = '';
              } else {
                this.userInfo[frontendKey] = value;
              }
            } else {
              // 如果后端没有返回该字段，保持为空
              this.userInfo[frontendKey] = '';
            }
          });
          
          
          uni.setStorageSync('userInfo', this.userInfo);
        } else {
          // 如果后端返回的数据为空或格式不正确，清空所有字段
          this.userInfo = {
            avatar: '',
            nickname: '',
            profile: '',
            school: '',
            college: '',
            studentId: '',
            phone: '',
            gender: 0
          };
        }
      } catch (error) {
        // 加载失败时，尝试从本地存储获取，但不使用默认值
        const storedInfo = uni.getStorageSync('userInfo');
        if (storedInfo && typeof storedInfo === 'object') {
          Object.keys(this.userInfo).forEach(key => {
            if (storedInfo[key] !== undefined && storedInfo[key] !== null && storedInfo[key] !== '') {
              this.userInfo[key] = storedInfo[key];
            }
          });
        }
        uni.showToast({
          title: error.msg || error.message || '个人信息加载失败',
          icon: 'none'
        });
      }
    },
    changeAvatar() {
      const originalAvatar = this.userInfo.avatar;
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.userInfo.avatar = tempFilePath;
          try {
            await this.saveUserInfo({ toastTitle: '头像更新成功' });
          } catch (error) {
            this.userInfo.avatar = originalAvatar;
          }
        }
      });
    },
    editField(field) {
      const fieldConfig = {
        nickname: { title: '修改昵称', placeholder: '请输入昵称', type: 'input' },
        profile: { title: '修改个人简介', placeholder: '请输入个人简介', type: 'textarea' },
        school: { title: '修改学校', placeholder: '请输入学校', type: 'input' },
        college: { title: '修改学院', placeholder: '请输入学院', type: 'input' },
        studentId: { title: '修改学号', placeholder: '请输入学号', type: 'input' },
        phone: { title: '修改手机号', placeholder: '请输入手机号', type: 'input' },
        gender: { title: '选择性别', type: 'picker' }
      };

      const config = fieldConfig[field];
      if (!config) return;

      if (field === 'gender') {
        const originalGender = this.userInfo.gender;
        // 性别选择
        uni.showActionSheet({
          itemList: ['男', '女'],
          success: async (res) => {
            this.userInfo.gender = res.tapIndex + 1;
            try {
              await this.saveUserInfo({ toastTitle: '修改成功' });
            } catch (error) {
              this.userInfo.gender = originalGender;
            }
          }
        });
      } else {
        const originalValue = this.userInfo[field];
        // 文本输入
        uni.showModal({
          title: config.title,
          editable: true,
          placeholderText: config.placeholder,
          content: this.userInfo[field] || '',
          success: async (res) => {
            // 允许保存空值（用户可能想清空某个字段）
            if (res.confirm && res.content !== undefined) {
              const newValue = res.content || ''; // 如果为空则设置为空字符串
              this.userInfo[field] = newValue;
              try {
                await this.saveUserInfo({ toastTitle: '修改成功' });
              } catch (error) {
                this.userInfo[field] = originalValue;
              }
            } else {
            }
          },
          fail: (err) => {
          }
        });
      }
    },
    async saveUserInfo({ toastTitle = '修改成功', showToast = true } = {}) {
      uni.showLoading({
        title: '保存中...',
        mask: true
      });
      try {
        const res = await updateUserInfo(this.userInfo);
        
        // 检查响应
        if (!res) {
          throw new Error('保存失败：响应为空');
        }
        
        // 检查业务状态码
        if (res.code !== undefined && res.code !== 200) {
          const errorMsg = res.msg || res.message || '保存失败';
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          });
          throw new Error(errorMsg);
        }
        
        // 保存当前数据到本地存储（在合并后端返回数据之前）
        // 这样可以确保即使后端返回的数据不完整，也能保留用户刚输入的数据
        const currentUserInfo = JSON.parse(JSON.stringify(this.userInfo));
        uni.setStorageSync('userInfo', currentUserInfo);
        
        // 提取返回的数据（如果有）
        // 注意：后端可能返回 {msg: '修改成功', code: 200} 或 {code: 200, data: {...}}
        const data = res.data !== undefined ? res.data : res;
        
        // 排除响应状态字段（msg, code），这些不是用户数据
        const excludeFields = ['msg', 'message', 'code', 'status', 'success'];
        
        if (data && typeof data === 'object') {
          
          // 检查是否包含用户数据字段（排除状态字段后）
          const userDataFields = Object.keys(data).filter(key => !excludeFields.includes(key));
          
          if (userDataFields.length > 0) {
            // 合并后端返回的用户数据，但保留当前已输入的值（如果后端没有返回该字段）
            userDataFields.forEach(key => {
              if (data[key] !== undefined && data[key] !== null) {
                // 只有后端返回了值才更新（包括空字符串）
                this.userInfo[key] = data[key];
              }
            });
          } else {
            // 后端只返回了状态信息，保持当前数据不变
          }
        } else {
          // 保持当前数据不变
        }
        
        // 再次保存到本地存储（合并后的数据）
        uni.setStorageSync('userInfo', this.userInfo);
        
        // 不要立即重新加载，避免覆盖刚保存的数据
        // 如果用户需要查看最新数据，可以手动刷新页面
        
        if (showToast) {
          uni.showToast({
            title: toastTitle,
            icon: 'success'
          });
        }
      } catch (error) {
        const errorMsg = error.msg || error.message || '保存失败';
        if (error.message !== '保存失败' && !errorMsg.includes('保存失败')) {
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          });
        }
        throw error;
      } finally {
        // 确保 hideLoading 被调用
        try {
          uni.hideLoading();
        } catch (e) {
          // hideLoading 调用失败
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
  padding-top: 88rpx; /* 为导航栏留出空间 */
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
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 头像区域 */
.avatar-section {
  background: linear-gradient(to bottom, #4A90E2, #6AAFE2);
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 6rpx solid white;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.avatar-text {
  font-size: 28rpx;
  font-weight: normal;
  color: #999999;
}

.avatar-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60rpx;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-edit-text {
  font-size: 24rpx;
  color: white;
}

/* 信息列表 */
.info-section {
  margin-top: 20rpx;
  background-color: white;
  padding: 0 30rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  flex-shrink: 0;
}

.label-text {
  font-size: 32rpx;
  color: #333333;
}

.info-value {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-left: 40rpx;
}

.value-text {
  font-size: 32rpx;
  color: #666666;
  text-align: right;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  font-size: 32rpx;
  color: #CCCCCC;
  margin-left: 20rpx;
}

.info-divider {
  height: 20rpx;
  background-color: #F5F5F5;
  margin: 0 -30rpx;
}
</style>
