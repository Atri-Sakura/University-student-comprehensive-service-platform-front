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
import AvatarManager from '@/utils/avatar-manager.js';

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
        // 先从本地存储加载用户信息，包括专门的头像存储
        const storedInfo = uni.getStorageSync('userInfo');
        const storedAvatar = uni.getStorageSync('userAvatar');
        
        if (storedInfo && typeof storedInfo === 'object') {
          Object.keys(this.userInfo).forEach(key => {
            if (storedInfo[key] !== undefined && storedInfo[key] !== null && storedInfo[key] !== '') {
              this.userInfo[key] = storedInfo[key];
            }
          });
          
          // 如果有专门保存的头像，优先使用
          if (storedAvatar) {
            this.userInfo.avatar = storedAvatar;
          }
        }
        
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
          
          // 保存当前头像信息，避免被覆盖
          const currentAvatar = this.userInfo.avatar;
          const storedAvatar = uni.getStorageSync('userAvatar');
          
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
                // 对于头像字段，如果后端返回空值，优先使用专门保存的头像，然后是当前头像
                if (frontendKey === 'avatar') {
                  this.userInfo[frontendKey] = storedAvatar || currentAvatar || '';
                } else {
                  this.userInfo[frontendKey] = '';
                }
              } else {
                // 对于头像字段，如果后端返回了头像，同步更新专门的头像存储
                if (frontendKey === 'avatar' && value && value.trim() !== '') {
                  // 确保头像URL是完整的
                  const fullAvatarUrl = value.startsWith('http') 
                    ? value 
                    : `http://localhost:8080${value}`;
                  this.userInfo[frontendKey] = fullAvatarUrl;
                  uni.setStorageSync('userAvatar', fullAvatarUrl);
                } else if (frontendKey === 'avatar') {
                  // 后端返回的头像为空，使用本地保存的头像
                  this.userInfo[frontendKey] = storedAvatar || currentAvatar || '';
                } else {
                  this.userInfo[frontendKey] = value;
                }
              }
            } else {
              // 如果后端没有返回该字段，对于头像保留本地保存的值，其他字段保持为空
              if (frontendKey === 'avatar') {
                this.userInfo[frontendKey] = storedAvatar || currentAvatar || '';
              } else {
                this.userInfo[frontendKey] = '';
              }
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
          
          // 显示上传进度
          uni.showLoading({
            title: '上传头像中...',
            mask: true
          });
          
          try {
            // 先上传图片到服务器
            const uploadResult = await this.uploadAvatar(tempFilePath);
            
            if (uploadResult && uploadResult.url) {
              // 使用返回的URL
              this.userInfo.avatar = uploadResult.url;
              uni.showToast({
                title: '头像上传成功',
                icon: 'success'
              });
            } else {
              // 如果上传失败，恢复原头像
              this.userInfo.avatar = originalAvatar;
              uni.showToast({
                title: '头像上传失败',
                icon: 'error'
              });
              return; // 不继续保存
            }
            
            // 使用头像管理器保存头像
            AvatarManager.saveAvatar(this.userInfo.avatar);
            
            // 保存用户信息到服务器
            await this.saveUserInfo({ toastTitle: '头像更新成功' });
            
          } catch (error) {
            console.error('头像上传失败:', error);
            this.userInfo.avatar = originalAvatar;
            uni.showToast({
              title: '头像上传失败',
              icon: 'none'
            });
          } finally {
            uni.hideLoading();
          }
        }
      });
    },
    
    // 上传头像到服务器
    async uploadAvatar(filePath) {
      try {
        const http = (await import('@/api/request.js')).default;
        
        // 首先尝试专门的头像上传接口
        try {
          const result = await http.uploadFile({
            url: '/system/user/profile/avatar', // 正确的头像上传接口
            filePath: filePath,
            name: 'avatarfile', // 后端要求的参数名
            formData: {}
          });
          
          if (result.code === 200 && result.imgUrl) {
            // 拼接完整的服务器地址
            const fullUrl = result.imgUrl.startsWith('http') 
              ? result.imgUrl 
              : `http://localhost:8080${result.imgUrl}`;
            return {
              url: fullUrl,
              isServerUrl: true
            };
          }
        } catch (avatarUploadError) {
          console.log('专门头像上传接口失败，尝试通用接口:', avatarUploadError);
        }
        
        // 如果专门接口失败，尝试通用文件上传接口
        try {
          const result = await http.uploadFile({
            url: '/common/upload', // 通用文件上传接口
            filePath: filePath,
            name: 'file',
            formData: {}
          });
          
          if (result.code === 200 && result.data) {
            // 修复：正确提取URL
            const uploadUrl = result.data.url || result.url || 
                             (result.data.fileName ? `http://localhost:8080${result.data.fileName}` : null) ||
                             (result.fileName ? `http://localhost:8080${result.fileName}` : null);
            
            if (uploadUrl) {
              // 确保URL是完整的服务器地址
              const fullUrl = uploadUrl.startsWith('http') 
                ? uploadUrl 
                : `http://localhost:8080${uploadUrl}`;
              return {
                url: fullUrl,
                isServerUrl: true
              };
            }
          }
        } catch (commonUploadError) {
          // 通用接口也失败
        }
        
        // 如果都失败了，返回null
        return null;
        
      } catch (error) {
        console.error('头像上传完全失败:', error);
        // 最后的备选方案：转换为base64
        return await this.convertToBase64(filePath);
      }
    },
    
    // 将图片转换为base64格式
    async convertToBase64(filePath) {
      return new Promise((resolve) => {
        try {
          console.log('尝试转换base64，文件路径:', filePath);
          
          // 在H5环境中，使用Canvas转换blob URL为base64
          if (filePath.startsWith('blob:')) {
            this.blobToBase64(filePath).then(base64 => {
              if (base64) {
                console.log('Canvas转换base64成功，长度:', base64.length);
                resolve({
                  url: base64,
                  isBase64: true
                });
              } else {
                console.log('Canvas转换失败，使用本地标识');
                resolve({
                  url: 'LOCAL_AVATAR_' + Date.now(),
                  isLocal: true
                });
              }
            });
            return;
          }
          
          // 尝试uni-app的文件系统API
          if (uni.getFileSystemManager) {
            uni.getFileSystemManager().readFile({
              filePath: filePath,
              encoding: 'base64',
              success: (res) => {
                const base64 = 'data:image/jpeg;base64,' + res.data;
                console.log('uni-app转换base64成功，长度:', base64.length);
                resolve({
                  url: base64,
                  isBase64: true
                });
              },
              fail: (error) => {
                console.error('uni-app转换base64失败:', error);
                resolve({
                  url: 'LOCAL_AVATAR_' + Date.now(),
                  isLocal: true
                });
              }
            });
          } else {
            console.log('uni-app文件系统API不可用，使用本地标识');
            resolve({
              url: 'LOCAL_AVATAR_' + Date.now(),
              isLocal: true
            });
          }
        } catch (error) {
          console.error('base64转换异常:', error);
          resolve({
            url: 'LOCAL_AVATAR_' + Date.now(),
            isLocal: true
          });
        }
      });
    },
    
    // 使用Canvas将blob URL转换为base64
    async blobToBase64(blobUrl) {
      return new Promise((resolve) => {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            try {
              const base64 = canvas.toDataURL('image/jpeg', 0.8);
              resolve(base64);
            } catch (error) {
              console.error('Canvas转换失败:', error);
              resolve(null);
            }
          };
          
          img.onerror = function() {
            console.error('图片加载失败');
            resolve(null);
          };
          
          img.src = blobUrl;
        } catch (error) {
          console.error('Canvas转换异常:', error);
          resolve(null);
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
