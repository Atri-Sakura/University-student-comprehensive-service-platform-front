import http from './request.js';

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return http.get('/user/info');
};

/**
 * 上传用户头像
 * @param {String} filePath 本地文件路径
 */
export const uploadAvatar = (filePath) => {
  // 获取用户ID
  let userBaseId = uni.getStorageSync('userId');
  
  // 如果没有userId，尝试从userInfo中获取
  if (!userBaseId) {
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      userBaseId = userInfo.userBaseId || userInfo.userId || userInfo.id;
    }
  }
  
  // 如果还是没有userBaseId，抛出错误
  if (!userBaseId) {
    return Promise.reject(new Error('用户未登录或用户ID不存在'));
  }
  
  return http.uploadFile({
    url: '/platform/user/base/avatar/upload',
    filePath: filePath,
    name: 'file',
    formData: {
      userBaseId: userBaseId
    }
  });
};

/**
 * 更新用户信息
 * @param {Object} data 用户信息
 */
export const updateUserInfo = (data = {}) => {
  // 发送所有字段，包括空字符串（让后端决定如何处理空值）
  // 只过滤掉 undefined 和 null
  // 同时排除响应状态字段（msg, code），这些不应该发送给后端
  const excludeFields = ['msg', 'message', 'code', 'status', 'success'];
  
  // 字段名映射：前端字段名 -> 后端字段名
  // 如果后端期望不同的字段名，在这里添加映射
  const fieldNameMapping = {
    // 如果后端期望不同的字段名，取消注释并修改
    // 'profile': 'bio',  // 例如：如果后端期望 'bio' 而不是 'profile'
    // 'school': 'university',
  };
  
  const filteredData = {};
  Object.keys(data).forEach(key => {
    // 排除响应状态字段
    if (excludeFields.includes(key)) {
      return;
    }
    // 保留所有有效值，包括空字符串、0、false等
    // 只过滤掉 undefined 和 null
    if (data[key] !== undefined && data[key] !== null) {
      // 如果字段名需要映射，使用映射后的字段名
      const backendKey = fieldNameMapping[key] || key;
      filteredData[backendKey] = data[key];
    }
  });
  
  
  return http.put('/user/info', filteredData);
};

export default {
  getUserInfo,
  updateUserInfo,
  uploadAvatar
};
