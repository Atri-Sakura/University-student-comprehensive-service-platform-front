/**
 * API 接口配置文件
 * 封装与后端交互的登录认证接口
 */

// ========== 基础配置 ==========
import { API_BASE_URL } from './config.js';

// ========== API 路径配置 ==========
const API = {
	// 认证相关
	LOGIN_RIDER: '/platform/auth/rider/login',        // 骑手登录
	REGISTER_RIDER: '/platform/auth/rider/register',  // 骑手注册
	CAPTCHA: '/captchaImage',                          // 获取验证码
	GET_INFO: '/getInfo',                              // 获取用户信息
	LOGOUT: '/logout',                                 // 退出登录
	
	// 骑手基本信息
	RIDER_BASE_INFO: '/api/rider/base/info',          // 查询骑手基本信息
	RIDER_BASE_UPDATE: '/api/rider/base/update',      // 修改骑手基本信息
	RIDER_PASSWORD_UPDATE: '/api/rider/base/password', // 修改骑手密码
	
	// 支付密码
	PAY_PASSWORD_SET: '/api/rider/pay/password/set',     // 设置支付密码
	PAY_PASSWORD_UPDATE: '/api/rider/pay/password/update', // 修改支付密码
	
	// 钱包相关
	WITHDRAW_ALIPAY: '/rider/finance/withdraw/alipay'    // 支付宝提现
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
 * @param {Boolean} options.showLoading 是否显示加载提示，默认true
 */
async function request(options) {
	const {
		url,
		method = 'GET',
		data = {},
		headers = {},
		needAuth = true,
		showLoading = true
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
	
	try {
		// 显示加载提示
		if (showLoading) {
			uni.showLoading({
				title: '加载中...',
				mask: true
			});
		}
		
		// 使用 uni.request 发送请求
		const response = await new Promise((resolve, reject) => {
			// 对于POST/PUT请求，手动序列化data为JSON字符串，保持大整数为字符串
			let requestData;
			const httpMethod = method.toUpperCase();
			
			if (httpMethod === 'GET') {
				requestData = {};
			} else {
				// 将data序列化为JSON字符串，确保大整数ID保持为字符串格式
				requestData = JSON.stringify(data);
				// 如果data中包含大整数ID，需要设置正确的Content-Type
				if (!requestHeaders['Content-Type']) {
					requestHeaders['Content-Type'] = 'application/json';
				}
			}
			
			console.log('🚀 发送请求:', {
				url: fullUrl,
				method: httpMethod,
				originalData: data,
				requestData: requestData,
				headers: requestHeaders
			});
			
			uni.request({
				url: fullUrl,
				method: httpMethod,
				data: requestData,
				header: requestHeaders,
				dataType: 'text', // 获取原始文本，避免自动JSON解析
				success: (res) => {
					// 手动解析JSON，处理大整数
					try {
						if (typeof res.data === 'string') {
							res.data = parseJsonWithLargeIntegers(res.data);
						}
					} catch (e) {
						console.warn('JSON解析失败，使用原始数据:', e);
					}
					resolve(res);
				},
				fail: (error) => {
					reject(error);
				}
			});
		});
		
		// 隐藏加载提示
		if (showLoading) {
			uni.hideLoading();
		}
		
		// 处理响应（大整数已在JSON解析阶段处理）
		return handleResponse(response.data);
		
	} catch (error) {
		if (showLoading) {
			uni.hideLoading();
		}
		
		// 钱包相关错误只记录日志，不显示错误提示
		if (error.message && error.message.includes('未找到钱包信息')) {
			console.log('钱包查询:', error.message);
		} else {
			console.error('请求失败:', error);
			// 显示错误提示
			uni.showToast({
				title: '网络请求失败',
				icon: 'none',
				duration: 2000
			});
		}
		
		throw error;
	}
}


/**
 * 使用自定义 reviver 解析 JSON，将大整数ID字段转换为字符串
 * @param {string} jsonString JSON字符串
 * @returns {*} 解析后的对象
 */
function parseJsonWithLargeIntegers(jsonString) {
	// ID类字段列表（需要转换为字符串的大整数ID）
	const idFields = [
		'orderMainId',
		'orderId', 
		'id',
		'userId',
		'riderId',
		'merchantId',
		'userBaseId',
		'riderBaseId',
		'merchantBaseId',
		// 聊天相关ID
		'sessionId',
		'messageId',
		'toId',
		'fromId',
		'chatSessionId'
	];
	
	// 先用正则表达式预处理，将大整数ID字段转换为字符串
	let processedJson = jsonString;
	
	idFields.forEach(field => {
		// 匹配 "fieldName":数字 的模式
		const regex = new RegExp(`"${field}":(\\d+)`, 'g');
		processedJson = processedJson.replace(regex, (match, number) => {
			return `"${field}":"${number}"`;
		});
	});
	
	// 然后正常解析JSON
	return JSON.parse(processedJson);
}

/**
 * 处理大整数字段，将可能超出JavaScript精度的Long类型转换为字符串
 * @param {*} data 要处理的数据
 * @returns {*} 处理后的数据
 */
function processLargeIntegers(data) {
	if (!data) return data;
	
	// 需要转换为字符串的字段列表（ID类字段）
	const largeIntegerFields = [
		'orderMainId',
		'orderId', 
		'id',
		'userId',
		'riderId',
		'merchantId',
		'userBaseId',
		'riderBaseId',
		'merchantBaseId',
		// 聊天相关ID
		'sessionId',
		'messageId',
		'toId',
		'fromId',
		'chatSessionId'
	];
	
	// 递归处理对象
	function processObject(obj) {
		if (obj === null || typeof obj !== 'object') {
			return obj;
		}
		
		if (Array.isArray(obj)) {
			return obj.map(item => processObject(item));
		}
		
		const processed = {};
		for (const [key, value] of Object.entries(obj)) {
			if (largeIntegerFields.includes(key) && typeof value === 'number') {
				// 对于ID类字段，直接转换为字符串（避免精度丢失）
				processed[key] = value.toString();
				console.log(`转换ID字段 ${key}: ${value} -> "${value}"`);
			} else if (typeof value === 'object') {
				processed[key] = processObject(value);
			} else {
				processed[key] = value;
			}
		}
		return processed;
	}
	
	return processObject(data);
}

/**
 * 处理响应数据
 */
function handleResponse(result) {
	console.log('📥 后端响应:', {
		code: result.code,
		msg: result.msg,
		data: result.data,
		fullResult: result
	});
	
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
	console.error('❌ 业务错误:', {
		code: result.code,
		msg: result.msg,
		data: result.data
	});
	
	// 钱包相关错误不显示通用错误提示，让具体页面处理
	if (!(result.msg && result.msg.includes('未找到钱包信息'))) {
		uni.showToast({
			title: result.msg || '请求失败',
			icon: 'none',
			duration: 2000
		});
	}
	
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

// ========== 骑手基本信息API ==========

/**
 * 查询骑手脱敏基本信息
 */
export async function getRiderBaseInfo() {
	return request({
		url: API.RIDER_BASE_INFO,
		method: 'GET'
	});
}

/**
 * 修改骑手基本信息
 * @param {Object} data 修改数据
 * @param {String} data.nickname 昵称（可选）
 * @param {String} data.phone 手机号（可选）
 * @param {File} data.avatar 头像文件（可选）
 */
export async function updateRiderBaseInfo(data) {
	// 检查是否包含文件，决定Content-Type
	const hasFile = data.avatar && (data.avatar instanceof File || typeof data.avatar === 'object');
	
	return request({
		url: API.RIDER_BASE_UPDATE,
		method: 'POST',
		data,
		headers: hasFile ? {
			'Content-Type': 'multipart/form-data'
		} : {
			'Content-Type': 'application/json'
		}
	});
}

/**
 * 修改骑手密码
 * @param {String} oldPassword 原密码
 * @param {String} newPassword 新密码
 * @param {String} confirmPassword 确认新密码
 */
export async function updateRiderPassword(oldPassword, newPassword, confirmPassword) {
	return request({
		url: API.RIDER_PASSWORD_UPDATE,
		method: 'POST',
		data: {
			oldPassword,
			newPassword,
			confirmPassword
		}
	});
}

// ========== 支付密码API ==========

/**
 * 设置支付密码（第一次使用）
 * @param {String} payPassword 支付密码（6位数字）
 * @param {String} confirmPayPassword 确认支付密码
 */
export async function setPayPassword(payPassword, confirmPayPassword) {
	return request({
		url: API.PAY_PASSWORD_SET,
		method: 'POST',
		data: {
			payPassword,
			confirmPayPassword
		}
	});
}

/**
 * 修改支付密码
 * @param {String} oldPayPassword 原支付密码
 * @param {String} newPayPassword 新支付密码
 * @param {String} confirmNewPayPassword 确认新支付密码
 */
export async function updatePayPassword(oldPayPassword, newPayPassword, confirmNewPayPassword) {
	return request({
		url: API.PAY_PASSWORD_UPDATE,
		method: 'POST',
		data: {
			oldPayPassword,
			newPayPassword,
			confirmNewPayPassword
		}
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
	logout,
	// 骑手基本信息
	getRiderBaseInfo,
	updateRiderBaseInfo,
	updateRiderPassword,
	// 支付密码
	setPayPassword,
	updatePayPassword
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
