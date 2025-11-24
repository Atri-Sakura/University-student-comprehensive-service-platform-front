// API接口配置文件
const baseUrl = 'http://localhost:8080';

// 获取token的函数
const getToken = () => {
  return uni.getStorageSync('token');
};

// 登录相关接口
export const loginAPI = {
  student: `${baseUrl}/user/login`,      // 学生登录接口
  rider: `${baseUrl}/rider/login`,       // 骑手登录接口
  merchant: `${baseUrl}/merchant/login`  // 商家登录接口
};

// 注册相关接口
export const registerAPI = {
  student: `${baseUrl}/user/register`,      // 学生注册接口
  rider: `${baseUrl}/rider/register`,       // 骑手注册接口
  merchant: `${baseUrl}/merchant/register`  // 商家注册接口
};

// 商家相关接口
export const merchantAPI = {
  // 首页核心接口 - 订单状态统计
  getOrderStatus: `${baseUrl}/merchant/orders/status`,       // 获取订单状态统计（待处理、待配送、配送中）
  
  // 店铺信息（暂时使用订单状态接口，后续可替换）
  getShopInfo: `${baseUrl}/merchant/orders/status`,          // 获取店铺信息
  
  // 今日数据统计（暂时使用订单状态接口，后续可替换）
  getTodayData: `${baseUrl}/merchant/orders/status`,         // 获取今日数据统计
  
  // 以下接口待后端实现后再配置
  // updateShopInfo: `${baseUrl}/merchant/shop/update`,      // 更新店铺信息
  getOrders: `${baseUrl}/merchant/orders/status`,           // 获取订单列表
  getOrderDetail: `${baseUrl}/merchant/orders/status`,    // 获取订单详情
  updateOrderStatus: `${baseUrl}/merchant/orders/status`, // 更新订单状态
  // getProducts: `${baseUrl}/merchant/products/list`,       // 获取商品列表
  // getActivities: `${baseUrl}/merchant/activities/list`,   // 获取活动列表
  // getFinanceData: `${baseUrl}/merchant/finance/summary`,  // 获取财务汇总
  // getReviews: `${baseUrl}/merchant/reviews/list`          // 获取评价列表
};

// 商家订单相关接口
export const merchantOrderAPI = {
  list: `${baseUrl}/merchant/takeoutorder/list`,                    // 获取订单列表
  accept: (orderId) => `${baseUrl}/merchant/takeoutorder/${orderId}`, // 接受订单
  reject: (orderId) => `${baseUrl}/merchant/takeoutorder/${orderId}`, // 拒绝订单
  notifyRider: (orderId) => `${baseUrl}/merchant/takeoutorder/${orderId}`, // 通知骑手
  detail: (orderId) => `${baseUrl}/merchant/takeoutorder/${orderId}`  // 订单详情
};

// 通用请求方法（Promise 封装）
export const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    const method = options.method || 'GET';
    let requestUrl = url;
    let requestData = options.data || {};
    
    // 处理请求数据中的大数字ID字段，确保转换为字符串
    if (requestData && typeof requestData === 'object') {
      const processedData = { ...requestData };
      
      // 需要转换为字符串的ID字段
      const idFields = [
        'merchantBaseId', 'merchant_base_id', 'merchantId', 'merchant_id',
        'id', 'userId', 'user_id', 'goodsId', 'goods_id',
        'sessionId', 'messageId', 'fromId', 'toId', 'merchantActivityId'
      ];
      
      idFields.forEach(field => {
        if (processedData[field] !== null && processedData[field] !== undefined) {
          processedData[field] = String(processedData[field]);
        }
      });
      
      // 调试：记录ID字段的转换
      const hasIdFields = idFields.some(field => processedData[field] !== undefined);
      if (hasIdFields) {
        console.log('🔍 API请求 - ID字段转换:', {
          url: requestUrl,
          method: method,
          originalData: requestData,
          processedData: processedData
        });
      }
      
      requestData = processedData;
    }
    
    // 对于GET请求，将data转换为URL参数
    if (method === 'GET' && requestData && Object.keys(requestData).length > 0) {
      const params = [];
      for (const key in requestData) {
        const value = requestData[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(item => {
              params.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
            });
          } else {
            params.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
          }
        }
      }
      if (params.length > 0) {
        requestUrl += (url.indexOf('?') === -1 ? '?' : '&') + params.join('&');
      }
      requestData = {}; // GET请求不需要body
    }
    
    
    // 获取token并添加到请求头
    const token = uni.getStorageSync('token');
    
    // 调试：记录token信息
    if (requestUrl.includes('/goods/') && (method === 'DELETE' || method === 'PUT')) {
      console.log('🔍 商品操作API请求:', {
        url: requestUrl,
        method: method,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPrefix: token ? token.substring(0, 20) + '...' : 'null'
      });
    }
    
    // 构建请求参数
    const requestOptions = {
      url: requestUrl,
      method: method,
      data: requestData,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.header
      },
      // 重要：设置dataType为text，手动处理JSON解析，避免大整数被截断
      dataType: 'text',
      success: (res) => {
        // 手动处理JSON响应，确保大整数不被截断
        try {
          // 手动解析响应数据
          if (typeof res.data === 'string') {
            // 记录原始数据用于调试
            const originalData = res.data;
            
            // 使用正则表达式将所有数字ID字段转换为字符串
            let processedData = res.data
              // 商家相关的ID字段
              .replace(/"merchantBaseId":\s*(\d{15,})/g, '"merchantBaseId":"$1"')
              .replace(/"merchant_base_id":\s*(\d{15,})/g, '"merchant_base_id":"$1"')
              .replace(/"merchantId":\s*(\d{15,})/g, '"merchantId":"$1"')
              .replace(/"merchant_id":\s*(\d{15,})/g, '"merchant_id":"$1"')
              // 活动相关的ID字段
              .replace(/"merchantActivityId":\s*(\d{15,})/g, '"merchantActivityId":"$1"')
              .replace(/"merchant_activity_id":\s*(\d{15,})/g, '"merchant_activity_id":"$1"')
              // 通用ID字段
              .replace(/"id":\s*(\d{15,})/g, '"id":"$1"')
              .replace(/"userId":\s*(\d{15,})/g, '"userId":"$1"')
              .replace(/"user_id":\s*(\d{15,})/g, '"user_id":"$1"')
              // 聊天相关的ID字段
              .replace(/"sessionId":\s*(\d{15,})/g, '"sessionId":"$1"')
              .replace(/"messageId":\s*(\d{15,})/g, '"messageId":"$1"')
              .replace(/"fromId":\s*(\d{15,})/g, '"fromId":"$1"')
              .replace(/"toId":\s*(\d{15,})/g, '"toId":"$1"');
            
            // 详细调试：检查数据转换过程
            if (originalData !== processedData && (originalData.includes('merchantBaseId') || originalData.includes('merchant_base_id'))) {
              console.log('🔍 API响应大数字转换详细分析:', {
                url: requestUrl,
                originalData_sample: originalData.substring(0, 500),
                processedData_sample: processedData.substring(0, 500),
                hasChanges: originalData !== processedData,
                merchantBaseId_matches: originalData.match(/"merchantBaseId":\s*(\d{15,})/g),
                merchant_base_id_matches: originalData.match(/"merchant_base_id":\s*(\d{15,})/g),
                id_matches: originalData.match(/"id":\s*(\d{15,})/g)
              });
            }
            
            res.data = JSON.parse(processedData);
            
            // 解析后再次检查
            if (res.data && res.data.data && (res.data.data.merchantBaseId || res.data.data.id)) {
              console.log('🔍 API响应解析后数据检查:', {
                url: requestUrl,
                merchantBaseId: res.data.data.merchantBaseId,
                merchantBaseId_type: typeof res.data.data.merchantBaseId,
                id: res.data.data.id,
                id_type: typeof res.data.data.id,
                fullData: res.data.data
              });
            }
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
