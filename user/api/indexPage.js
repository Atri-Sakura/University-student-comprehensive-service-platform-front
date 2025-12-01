// 首页相关API接口

// API配置
const DEV_BASE_URL = 'http://localhost:8080';
const PROD_BASE_URL = 'https://your-production-domain.com';
const BASE_URL = process.env.NODE_ENV === 'production' ? PROD_BASE_URL : DEV_BASE_URL;
const TIMEOUT = 10000;

// 封装请求方法
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token');
    
    // 设置请求头
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    };
    
    // 如果有token，添加到请求头
    if (token) {
      header['Authorization'] = 'Bearer ' + token;
    }
    
    const fullUrl = BASE_URL + options.url;
    const requestData = options.data || {};
    
    // 添加调试信息
    console.log(`${options.method || 'GET'}请求详情:`, {
      url: fullUrl,
      method: options.method || 'GET',
      data: requestData,
      header: header
    });
    
    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: requestData,
      header: header,
      timeout: options.timeout || TIMEOUT,
      success: (res) => {
        // 添加响应调试信息
        console.log(`${options.method || 'GET'}响应详情:`, {
          statusCode: res.statusCode,
          data: res.data
        });
        
        if (res.statusCode === 200) {
          // HTTP 状态码是 200，统一处理响应格式
          let responseData = res.data;
          
          // 确保返回的是对象格式
          if (typeof responseData !== 'object' || responseData === null) {
            responseData = { code: 200, message: '请求成功', data: responseData };
          }
          
          // 确保返回对象包含code、message和data字段
          if (responseData.code === undefined) {
            responseData.code = 200;
          }
          
          if (responseData.message === undefined) {
            responseData.message = responseData.code === 200 ? '请求成功' : '请求失败';
          }
          
          if (responseData.data === undefined) {
            responseData.data = null;
          }
          
          resolve(responseData);
        } else {
          // HTTP 状态码不是 200，直接 reject
          uni.showToast({
            title: '请求失败',
            icon: 'none',
            duration: 2000
          });
          reject(res);
        }
      },
      fail: (err) => {
        // 显示更详细的错误信息
        const errorMsg = err.errMsg || '网络请求失败';
        console.error(`${options.method || 'GET'}请求失败详情:`, err);
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 3000
        });
        reject(err);
      }
    });
  });
};

// 请求方法封装
const get = (url, data = {}, header = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    header
  });
};

const post = (url, data = {}, header = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    header
  });
};

const put = (url, data = {}, header = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    header
  });
};

const del = (url, data = {}, header = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    header
  });
};

// 首页相关API接口
const indexPageApi = {
  // 获取轮播图
  getCarousel() {
    return get('/user/index/carousel');
  },
  
  // 获取今日课程
  getTodayCourses() {
    return get('/user/index/todayCourses');
  },
  
  // 获取完整课程表
  getSchedule() {
    return get('/user/index/userCourses');
  },
  
  // 获取推荐外卖
  getTakeoutRecommendations() {
    return get('/user/index/takeout');
  },
  
  // 获取推荐二手商品
  getSecondhandRecommendations() {
    return get('/user/index/secondhand');
  }
};

export default indexPageApi;
