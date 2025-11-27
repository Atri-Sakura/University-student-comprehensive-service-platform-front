/**
 * 统一请求封装
 * 提供基础的HTTP请求功能
 */

import { API_BASE_URL } from '../config.js';

/**
 * 统一请求方法
 * @param {Object} options 请求配置
 * @param {String} options.url 请求地址
 * @param {String} options.method 请求方法 GET/POST/PUT/DELETE
 * @param {Object} options.data 请求数据
 * @param {Object} options.headers 额外的请求头
 * @param {Boolean} options.needAuth 是否需要token认证，默认true
 */
async function 请求(options) {
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
	
	// 处理请求数据
	let requestData = data;
	
	// 如果是表单格式，并且data是对象，转换为URL编码字符串
	if (requestHeaders['Content-Type'] === 'application/x-www-form-urlencoded' && 
	    typeof data === 'object' && 
	    !(data instanceof FormData) &&
	    method.toUpperCase() !== 'GET') {
		const params = [];
		for (const key in data) {
			if (data.hasOwnProperty(key) && data[key] !== undefined && data[key] !== null) {
				params.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
			}
		}
		requestData = params.join('&');
		console.log('🔄 转换表单数据:', requestData);
	}
	
	try {
		// 显示加载提示
		uni.showLoading({
			title: '加载中...',
			mask: true
		});

		// 处理GET请求参数
		let url = fullUrl;
		if (method.toUpperCase() === 'GET' && requestData && typeof requestData === 'object') {
			const params = [];
			for (const key in requestData) {
				if (requestData.hasOwnProperty(key) && requestData[key] !== undefined && requestData[key] !== null) {
					params.push(`${encodeURIComponent(key)}=${encodeURIComponent(requestData[key])}`);
				}
			}
			if (params.length > 0) {
				url += (fullUrl.includes('?') ? '&' : '?') + params.join('&');
			}
		}
		
		// 使用 uni.request 发送请求
		const response = await new Promise((resolve, reject) => {
			uni.请求({
				url: url,
				method: method.toUpperCase(),
				data: method.toUpperCase() === 'GET' ? {} : requestData,
				header: requestHeaders,
				success: (res) => {
					resolve(res);
				},
				fail: (error) => {
					reject(error);
				}
			});
		});
		
		// 隐藏加载提示
		uni.hideLoading();
		
		// 处理响应
		return handleResponse(response.data);
		
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
// 如果结果是数组，直接返回成功格式
	if (Array.isArray(result)) {
		return {
			code: 200,
			data: result,
			msg: '请求成功'
		};
	}
	
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

export { 请求, API_BASE_URL };
export default 请求;
