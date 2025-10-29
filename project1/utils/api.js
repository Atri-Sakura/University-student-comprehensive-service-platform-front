// API接口配置文件
const baseUrl = 'http://localhost:8080/auth'; 

// 登录相关接口
export const loginAPI = {
  student: `${baseUrl}/user/login`, // 学生登录接口
  rider: `${baseUrl}/rider/login`,     // 骑手登录接口
  merchant: `${baseUrl}/merchant/login` // 商家登录接口
};

// 注册相关接口
export const registerAPI = {
  student: `${baseUrl}/user/register`, // 学生注册接口
  rider: `${baseUrl}/rider/register`,     // 骑手注册接口
  merchant: `${baseUrl}/merchant/register` // 商家注册接口
};

// 用户相关接口
export const userAPI = {
  getUserInfo: `${baseUrl}/api/user/info`,     // 获取用户信息
  updateUserInfo: `${baseUrl}/api/user/update`, // 更新用户信息
  changePassword: `${baseUrl}/api/user/change-password` // 修改密码
};

// 通用请求方法 - 返回Promise以支持async/await
export const request = (url, options = {}) => {
  // 获取本地存储的token
  const token = uni.getStorageSync('token');
  
  // 构建请求参数
  const requestConfig = {
    url,
    method: options.method || 'GET',
    data: options.data || {},
    header: {
      'Content-Type': 'application/json',
      ...options.header
    }
  };
  
  // 如果有token，添加到请求头
  if (token) {
    requestConfig.header['Authorization'] = `Bearer ${token}`;
  }
  
  // 返回Promise以支持async/await
  return new Promise((resolve, reject) => {
    // 直接使用配置对象调用uni.request
    uni.request({
      ...requestConfig,
      // success回调
      success: function(res) {
        console.log('API请求成功:', res);
        // 如果有自定义success回调，调用它
        if (typeof options.success === 'function') {
          options.success(res);
        }
        // 解析Promise
        resolve(res);
      },
      // fail回调
      fail: function(err) {
        console.error('API请求失败:', err);
        // 创建更有意义的错误对象，包含详细信息
        const errorMessage = err.errMsg || '网络请求失败';
        const error = new Error(errorMessage);
        error.originalError = err;
        error.code = err.errno || 'NETWORK_ERROR';
        
        // 如果有自定义fail回调，调用它
        if (typeof options.fail === 'function') {
          options.fail(error);
        }
        // 拒绝Promise
        reject(error);
      },
      // complete回调
      complete: function() {
        // 如果有自定义complete回调，调用它
        if (typeof options.complete === 'function') {
          options.complete();
        }
      }
    });
  });
};
// 商家相关接口
export const merchantAPI = {
  // 首页核心接口 - 订单状态统计
  getOrderStatus: `${baseUrl}merchant/orders/status`,       // 获取订单状态统计（待处理、待配送、配送中）
  
  // 店铺信息（暂时使用订单状态接口，后续可替换）
  getShopInfo: `${baseUrl}merchant/orders/status`,          // 获取店铺信息
  
  // 今日数据统计（暂时使用订单状态接口，后续可替换）
  getTodayData: `${baseUrl}merchant/orders/status`,         // 获取今日数据统计
  
  // 以下接口待后端实现后再配置
  // updateShopInfo: `${baseUrl}merchant/shop/update`,      // 更新店铺信息
  updateOrderStatus: `${baseUrl}merchant/orders/status`, // 更新订单状态
  // getProducts: `${baseUrl}merchant/products/list`,       // 获取商品列表
  // getActivities: `${baseUrl}merchant/activities/list`,   // 获取活动列表
  // getFinanceData: `${baseUrl}merchant/finance/summary`,  // 获取财务汇总
  // getReviews: `${baseUrl}merchant/reviews/list`          // 获取评价列表
};
// 商家订单相关接口
export const merchantOrderAPI = {
  // 查询商家订单列表 - 对应后端MerchantOrderController的list方法
  list: `${baseUrl.replace('/auth', '')}/merchant/order/list`,
  // 商家接单 - 对应后端MerchantOrderController的accept方法
  accept: (orderId) => `${baseUrl.replace('/auth', '')}/merchant/order/accept/${orderId}`,
  // 商家拒单 - 对应后端MerchantOrderController的reject方法
  reject: (orderId) => `${baseUrl.replace('/auth', '')}/merchant/order/reject/${orderId}`,
  // 通知骑手 - 后端暂未提供接口
  notifyRider: (orderId) => `${baseUrl.replace('/auth', '')}/merchant/order/notifyRider/${orderId}`,
  // 订单详情 - 对应后端@GetMapping("/{orderMainId}")接口
  detail: (orderId) => `${baseUrl.replace('/auth', '')}/merchant/order/${orderId}`
};

// 导出API配置
export default {
  baseUrl,
  loginAPI,
  registerAPI,
  userAPI,
  merchantOrderAPI,
  request
};

