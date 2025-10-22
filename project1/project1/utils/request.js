// 统一请求封装
const BASE_URL = 'http://localhost:8080'; // 修改为你的后端地址

// 请求拦截器
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 从本地存储获取token
    const token = uni.getStorageSync('token');
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer ' + token : '', // RuoYi框架使用Bearer token
        ...options.header
      },
      success: (res) => {
        // RuoYi框架统一返回格式：{code: 200, msg: "success", data: ...}
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data);
          } else {
            // 业务错误
            uni.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // token过期，跳转登录
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          });
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }, 1500);
          reject(res);
        } else {
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

// GET请求
export const get = (url, data = {}) => {
  return request({
    url,
    method: 'GET',
    data
  });
};

// POST请求
export const post = (url, data = {}) => {
  return request({
    url,
    method: 'POST',
    data
  });
};

// PUT请求
export const put = (url, data = {}) => {
  return request({
    url,
    method: 'PUT',
    data
  });
};

// DELETE请求
export const del = (url, data = {}) => {
  return request({
    url,
    method: 'DELETE',
    data
  });
};

// 文件上传
export const upload = (filePath, name = 'file') => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    
    uni.uploadFile({
      url: BASE_URL + '/common/upload',
      filePath: filePath,
      name: name,
      header: {
        'Authorization': token ? 'Bearer ' + token : ''
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.code === 200) {
          resolve(data);
        } else {
          uni.showToast({
            title: data.msg || '上传失败',
            icon: 'none'
          });
          reject(data);
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

export default request;

