// API接口配置文件
const baseUrl = 'http://localhost:8080/';

// 登录相关接口
export const loginAPI = {
  student: `${baseUrl}user/login`,      // 学生登录接口
  rider: `${baseUrl}rider/login`,       // 骑手登录接口
  merchant: `${baseUrl}merchant/login`  // 商家登录接口
};

// 注册相关接口
export const registerAPI = {
  student: `${baseUrl}user/register`,      // 学生注册接口
  rider: `${baseUrl}rider/register`,       // 骑手注册接口
  merchant: `${baseUrl}merchant/register`  // 商家注册接口
};

// 用户相关接口
// export const userAPI = {
//   getUserInfo: `${baseUrl}/api/user/info`,     // 获取用户信息
//   updateUserInfo: `${baseUrl}/api/user/update`, // 更新用户信息
//   changePassword: `${baseUrl}/api/user/change-password` // 修改密码
// };

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
  getOrders: `${baseUrl}merchant/orders/status`,           // 获取订单列表
  getOrderDetail: `${baseUrl}merchant/orders/status`,    // 获取订单详情
  updateOrderStatus: `${baseUrl}merchant/orders/status`, // 更新订单状态
  // getProducts: `${baseUrl}merchant/products/list`,       // 获取商品列表
  // getActivities: `${baseUrl}merchant/activities/list`,   // 获取活动列表
  // getFinanceData: `${baseUrl}merchant/finance/summary`,  // 获取财务汇总
  // getReviews: `${baseUrl}merchant/reviews/list`          // 获取评价列表
};

// 通用请求方法（Promise 封装）
export const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    // 获取本地存储的token
    const token = uni.getStorageSync('token');
    
    // 构建请求参数
    const requestOptions = {
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success: (res) => {
        // 如果有自定义成功回调，调用它
        if (options.success) {
          options.success(res);
        }
        resolve(res);
      },
      fail: (err) => {
        // 如果有自定义失败回调，调用它
        if (options.fail) {
          options.fail(err);
        }
        console.error('请求失败:', err);
        reject(err);
      },
      complete: options.complete
    };
    
    // 如果有token，添加到请求头
    if (token) {
      requestOptions.header['Authorization'] = `Bearer ${token}`;
    }
    
    // 发起请求
    uni.request(requestOptions);
  });
};

// 导出API配置
export default {
  baseUrl,
  loginAPI,
  registerAPI,
  merchantAPI,
  request
};
