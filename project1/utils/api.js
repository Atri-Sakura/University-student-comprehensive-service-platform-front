// API接口配置文件
const baseUrl = 'http://localhost:8080/';

// 获取token的函数
const getToken = () => {
  return uni.getStorageSync('token');
};

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

// 商家订单相关接口
export const merchantOrderAPI = {
  list: `${baseUrl}merchant/takeoutorder/list`,                    // 获取订单列表
  accept: (orderId) => `${baseUrl}merchant/takeoutorder/${orderId}`, // 接受订单
  reject: (orderId) => `${baseUrl}merchant/takeoutorder/${orderId}`, // 拒绝订单
  notifyRider: (orderId) => `${baseUrl}merchant/takeoutorder/${orderId}`, // 通知骑手
  detail: (orderId) => `${baseUrl}merchant/takeoutorder/${orderId}`  // 订单详情
};

// 通用请求方法（Promise 封装）
export const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    // 构建请求参数
    const requestOptions = {
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      // 重要：设置dataType为text，手动处理JSON解析，避免大整数被截断
      dataType: 'text',
      success: (res) => {
        // 手动处理JSON响应，确保大整数不被截断
        try {
          // 手动解析响应数据
          if (typeof res.data === 'string') {
            // 使用正则表达式将所有数字ID字段转换为字符串
            let processedData = res.data
              .replace(/"merchantActivityId":\s*(\d{18,})/g, '"merchantActivityId":"$1"')
              .replace(/"merchant_activity_id":\s*(\d{18,})/g, '"merchant_activity_id":"$1"')
              .replace(/"id":\s*(\d{18,})/g, '"id":"$1"');
            res.data = JSON.parse(processedData);
          }
          
          // 如果有自定义成功回调，调用它
          if (options.success) {
            options.success(res);
          }
          resolve(res);
        } catch (e) {
          reject(e);
        }
      },
      fail: (err) => {
        // 如果有自定义失败回调，调用它
        if (options.fail) {
          options.fail(err);
        }
        reject(err);
      },
      complete: (res) => {
        if (options.complete) {
          options.complete(res);
        }
      }
    };
    
    // 确保header对象存在
    if (!requestOptions.header) {
      requestOptions.header = {};
    }
    
    // 仿照示例代码：如果有token且options中没有明确设置不使用token，则添加到请求头
    const isToken = options.isToken === false; // 默认使用token
    if (getToken() && !isToken) {
      requestOptions.header['Authorization'] = 'Bearer ' + getToken(); // 让每个请求携带自定义token
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
  merchantOrderAPI,
  request
};
