// 外卖相关API接口
// 直接定义API配置常量
const BASE_URL = 'http://localhost:8080';
const TIMEOUT = 10000;

/**
 * 封装get请求
 * @param {string} url 请求路径
 * @param {Object} data 请求参数
 * @param {Object} header 请求头
 */
const get = (url, data = {}, header = {}) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token');
    
    // 设置请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    };
    
    // 如果有token，添加到请求头
    if (token) {
      requestHeader['Authorization'] = 'Bearer ' + token;
    }
    
    const fullUrl = BASE_URL + url;
    
    uni.request({
      url: fullUrl,
      method: 'GET',
      data,
      header: requestHeader,
      timeout: TIMEOUT,
      success: (res) => {
        if (res.statusCode === 200) {
          // 统一处理响应格式
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
          const errorMsg = res.data?.message || res.errMsg || '请求失败';
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
          reject(res);
        }
      },
      fail: (err) => {
        // 显示错误信息
        const errorMsg = err.errMsg || '网络请求失败';
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

/**
 * 封装post请求
 * @param {string} url 请求路径
 * @param {Object} data 请求参数
 * @param {Object} header 请求头
 */
const post = (url, data = {}, header = {}) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token');
    
    // 设置请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    };
    
    // 如果有token，添加到请求头
    if (token) {
      requestHeader['Authorization'] = 'Bearer ' + token;
    }
    
    const fullUrl = BASE_URL + url;
    
    uni.request({
      url: fullUrl,
      method: 'POST',
      data,
      header: requestHeader,
      timeout: TIMEOUT,
      success: (res) => {
        if (res.statusCode === 200) {
          // 统一处理响应格式
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
          const errorMsg = res.data?.message || res.errMsg || '请求失败';
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
          });
          reject(res);
        }
      },
      fail: (err) => {
        // 显示错误信息
        const errorMsg = err.errMsg || '网络请求失败';
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

// 外卖相关API接口 - 用户端商品和商家接口
const foodApi = {
  // 用户端商品接口
  // 查询某商家商品列表
  getMerchantGoodsList(merchantBaseId) {
    return get(`/user/goods/merchant/${merchantBaseId}`)
  },
  
  // 获取商品详细信息
  getGoodsDetail(merchantGoodsId) {
    return get(`/user/goods/${merchantGoodsId}`)
  },
  
  // 搜索某商家商品
  searchMerchantGoods(merchantBaseId, keyword) {
    return get(`/user/goods/merchant/${merchantBaseId}/search`, { keyword })
  },
  
  // 用户端商家接口
  // 查询营业中的商家列表
  getMerchantList() {
    return get('/user/merchant/list')
  },
  
  // 获取商家详细信息
  getMerchantDetail(merchantBaseId) {
    return get(`/user/merchant/${merchantBaseId}`)
  },
  
  // 搜索商家
  searchMerchant(keyword) {
    return get('/user/merchant/search', { keyword })
  },
  
  // 按经营范围筛选商家
  getMerchantByScope(businessScope) {
    return get(`/user/merchant/scope/${businessScope}`)
  },
  
  // 热门商家
  getHotMerchants() {
    return get('/user/merchant/hot')
  }
}

// 订单相关API接口
const orderApi = {
  // 创建订单
    createOrder(orderData) {
      return post('/user/order/create', orderData)
    },
  
  // 支付订单
  payOrder(orderId, payType) {
    return post(`/user/order/${orderId}/pay`, { payType })
  },
  
  // 获取订单详情
  getOrderDetail(orderId) {
    return get(`/user/order/${orderId}`)
  },
  
  // 创建预支付订单
  createPrepayOrder(orderData) {
    return post('/user/order/prepay', orderData)
  },
  
  // 支付并创建订单
  payAndCreateOrder(orderData) {
    return post('/user/order/pay-and-create', orderData)
  }
}

export default {
  ...foodApi,
  ...orderApi
}
