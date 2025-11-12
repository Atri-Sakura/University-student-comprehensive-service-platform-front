/**
 * API 接口配置文件
 * 封装与后端交互的登录认证接口
 */

// ========== 基础配置 ==========
const API_BASE_URL = 'http://localhost:8080';

// ========== API 路径配置 ==========
const API = {
	// 认证相关
	LOGIN_RIDER: '/platform/auth/rider/login',        // 骑手登录
	REGISTER_RIDER: '/platform/auth/rider/register',  // 骑手注册
	CAPTCHA: '/captchaImage',                          // 获取验证码
	GET_INFO: '/getInfo',                              // 获取用户信息
	LOGOUT: '/logout',                                 // 退出登录
};

// ========== 请求封装 ==========
/**
 * 统一请求方法
 * @param {Object} options 请求配置
 * @param {String} options.url 请求地址
 * @param {String} options.method 请求方法 GET/POST/PUT/DELETE
 * @param {Object} options.data 请求数据
 * @param {Object} options.headers 额外的请求头
 * @param {Boolean} options.needAuth 是否需要token认证，默认true
 */
async function request(options) {
	const {
		url,
		method = 'GET',
		data = {},
		headers = {},
		needAuth = true
	} = options;
	
	// 构建完整URL
	const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
	
	// 构建请求头
	const requestHeaders = {
		'Content-Type': 'application/json',
		...headers
	};
	
	// 添加token
	if (needAuth) {
		const token = uni.getStorageSync('token');
		if (token) {
			requestHeaders['Authorization'] = `Bearer ${token}`;
		}
	}
	
	// 构建请求配置
	const requestConfig = {
		method: method.toUpperCase(),
		headers: requestHeaders
	};
	
	// 添加请求体（GET请求不需要body）
	if (method.toUpperCase() !== 'GET' && Object.keys(data).length > 0) {
		requestConfig.body = JSON.stringify(data);
	}
	
	try {
		// 显示加载提示
		uni.showLoading({
			title: '加载中...',
			mask: true
		});
		
		// 发送请求
		const response = await fetch(fullUrl, requestConfig);
		const result = await response.json();
		
		// 隐藏加载提示
		uni.hideLoading();
		
		// 处理响应
		return handleResponse(result);
		
	} catch (error) {
		uni.hideLoading();
		console.error('请求失败:', error);
		
		// 显示错误提示
		uni.showToast({
			title: '网络请求失败',
			icon: 'none',
			duration: 2000
		});
		
		throw error;
	}
}

/**
 * 处理响应数据
 */
function handleResponse(result) {
	// 根据code判断请求是否成功
	if (result.code === 200) {
		return result;
	}
	
	// token过期或无效
	if (result.code === 401) {
		handleTokenExpired();
		throw new Error(result.msg || 'Token已过期，请重新登录');
	}
	
	// 其他错误
	uni.showToast({
		title: result.msg || '请求失败',
		icon: 'none',
		duration: 2000
	});
	
	throw new Error(result.msg || '请求失败');
}

/**
 * 处理token过期
 */
function handleTokenExpired() {
	// 清除本地存储
	uni.removeStorageSync('token');
	uni.removeStorageSync('userType');
	uni.removeStorageSync('identity');
	uni.removeStorageSync('identityKey');
	
	// 提示用户
	uni.showToast({
		title: '登录已过期，请重新登录',
		icon: 'none',
		duration: 2000
	});
	
	// 跳转到登录页
	setTimeout(() => {
		uni.redirectTo({
			url: '/pages/login/login'
		});
	}, 2000);
}

// ========== 认证相关API ==========

/**
 * 骑手登录
 * @param {String} phonenumber 手机号
 * @param {String} password 密码
 * @param {String} code 验证码
 * @param {String} uuid 验证码UUID
 */
export async function loginRider(phonenumber, password, code, uuid) {
	return request({
		url: API.LOGIN_RIDER,
		method: 'POST',
		data: { phonenumber, password, code, uuid },
		needAuth: false
	});
}

/**
 * 骑手注册
 * @param {String} phone 手机号
 * @param {String} password 密码
 * @param {String} code 验证码
 * @param {String} uuid 验证码UUID
 */
export async function registerRider(phone, password, code, uuid) {
	return request({
		url: API.REGISTER_RIDER,
		method: 'POST',
		data: { phone, password, code, uuid },
		needAuth: false
	});
}

/**
 * 获取验证码
 */
export async function getCaptcha() {
	return request({
		url: API.CAPTCHA,
		method: 'GET',
		needAuth: false
	});
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo() {
	return request({
		url: API.GET_INFO,
		method: 'GET'
	});
}

/**
 * 退出登录
 */
export async function logout() {
	return request({
		url: API.LOGOUT,
		method: 'POST'
	});
}

// ========== 导出 ==========
export {
	API_BASE_URL,
	API,
	request
};

export default {
	API_BASE_URL,
	API,
	request,
	// 认证相关
	loginRider,
	registerRider,
	getCaptcha,
	getUserInfo,
	logout
};

// ========== 待开发API（后端完成后添加）==========
// 
// 骑手状态管理
// - getRiderStatus() 获取骑手接单状态
// - updateRiderStatus(isReceiving) 更新骑手接单状态
// 
// 订单管理
// - getNewOrders(page, pageSize) 获取新订单列表
// - acceptOrder(orderId) 接单
// - getOrderDetail(orderId) 订单详情
// - pickupOrder(orderId) 取货
// - completeOrder(orderId) 完成配送
// - getHistoryOrders(page, pageSize) 历史订单
//
