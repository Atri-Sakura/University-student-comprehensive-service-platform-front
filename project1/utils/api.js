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
  请求
};
