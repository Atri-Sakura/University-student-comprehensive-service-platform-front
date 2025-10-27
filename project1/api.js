// API接口配置文件
const baseUrl = 'http://localhost:8080/platform/auth'; 

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

// 商品管理相关接口
export const productAPI = {
  getProductList: `${baseUrl}/api/products`,           // 获取商品列表
  getProductById: `${baseUrl}/api/products`,           // 获取商品详情 (需要拼接id)
  addProduct: `${baseUrl}/api/products`,               // 添加商品
  updateProduct: `${baseUrl}/api/products`,            // 更新商品 (需要拼接id)
  deleteProduct: `${baseUrl}/api/products`,            // 删除商品 (需要拼接id)
  toggleProductStatus: `${baseUrl}/api/products`,      // 切换商品状态 (需要拼接id/status)
  uploadImage: `${baseUrl}/api/upload/image`           // 上传商品图片
};
// 商家订单相关接口
export const merchantOrderAPI = {
  list: `${baseUrl.replace('/auth', '')}/merchant/order/list`, // 查询商家订单列表
  accept: (orderId) => `${baseUrl.replace('/auth', '')}/merchant/order/accept/${orderId}`, // 商家接单
  reject: (orderId) => `${baseUrl.replace('/auth', '')}/merchant/order/reject/${orderId}`, // 商家拒单
  produceComplete: (orderId) => `${baseUrl.replace('/auth', '')}/merchant/order/produce-complete/${orderId}`, // 出品完成
  notifyRider: (orderId) => `${baseUrl.replace('/auth', '')}/merchant/order/notify-rider/${orderId}` // 通知骑手
};


// 门店设置相关接口
export const storeAPI = {
  getStoreInfo: `${baseUrl}/api/store/info`,           // 获取门店信息
  updateStoreName: `${baseUrl}/api/store/name`,        // 更新门店名称
  updateStoreStatus: `${baseUrl}/api/store/status`,    // 更新营业状态
  updateStorePhone: `${baseUrl}/api/store/phone`,      // 更新联系电话
  updateStoreDescription: `${baseUrl}/api/store/description`, // 更新门店简介
  updateBusinessHours: `${baseUrl}/api/store/business-hours`, // 更新营业时间
  updateDeliverySettings: `${baseUrl}/api/store/delivery`,    // 更新配送设置
  uploadCertificate: `${baseUrl}/api/store/certificate`,      // 上传资质证书
  deleteCertificate: `${baseUrl}/api/store/certificate`       // 删除资质证书 (需要拼接类型)
};

// 通用请求方法
export const 请求 = (url, options = {}) => {
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
    },
    fail: (err) => {
      // 如果有自定义失败回调，调用它
      if (options.fail) {
        options.fail(err);
      }
      console.error('请求失败:', err);
    },
    complete: options.complete
  };
  
  // 如果有token，添加到请求头
  if (token) {
    requestOptions.header['Authorization'] = `Bearer ${token}`;
  }
  
  // 发起请求
  return uni.请求(requestOptions);
};

// 导出API配置
export default {
  baseUrl,
  loginAPI,
  registerAPI,
  userAPI,
  productAPI,
  storeAPI,
  merchantOrderAPI,
  请求
};
