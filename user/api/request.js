// 基础请求配置
const BASE_URL = 'http://localhost:8080'

// 导入地址ID修复工具
import { fixAddressIdPrecision } from '@/utils/address-id-fix.js';

/**
 * 大整数安全的JSON解析器
 * 将所有超过MAX_SAFE_INTEGER的整数转换为字符串
 * @param {string} jsonString JSON字符串
 * @returns {any} 解析后的对象
 */
function safeParseBigInt(jsonString) {
	if (!jsonString || typeof jsonString !== 'string') {
		return jsonString;
	}
	
	// 首先使用地址ID修复工具
	let processed = jsonString;
	if (jsonString.includes('userAddressId') || jsonString.includes('address')) {
		processed = fixAddressIdPrecision(jsonString);
	}
	
	// 使用正则表达式将大整数转换为字符串
	// 匹配不在引号内的数字，且长度超过15位（可能超出安全范围）
	processed = processed.replace(
		/([:\[,]\s*)(\d{15,})(\s*[,\}\]])/g,
		(match, prefix, number, suffix) => {
			return prefix + '"' + number + '"' + suffix;
		}
	);
	
	// 额外处理可能的科学计数法格式 (如 7.810592271195177e+17)
	processed = processed.replace(
		/([:\[,]\s*)(\d+\.?\d*e[+-]?\d+)(\s*[,\}\]])/gi,
		(match, prefix, number, suffix) => {
			return prefix + '"' + number + '"' + suffix;
		}
	);
	
	// 特别处理userAddressId字段 - 更严格的匹配
	processed = processed.replace(
		/"userAddressId"\s*:\s*(\d{15,})/g,
		(match, number) => {
			return '"userAddressId":"' + number + '"';
		}
	);
	
	// 处理数组中的大整数ID
	processed = processed.replace(
		/(\[\s*|\,\s*)(\d{15,})(\s*[\,\]])/g,
		(match, prefix, number, suffix) => {
			if (number.length >= 15) {
				return prefix + '"' + number + '"' + suffix;
			}
			return match;
		}
	);
	
	try {
		const result = JSON.parse(processed);
		return result;
	} catch (e) {
		// 如果自定义解析失败，回退到原始JSON.parse
		return JSON.parse(jsonString);
	}
}

/**
 * 封装uni.request请求
 * @param {Object} options 请求配置
 */
const request = (options) => {
	return new Promise((resolve, reject) => {
		// 获取token
		const token = uni.getStorageSync('token');
		
		// 设置请求头
		const header = {
			'Content-Type': 'application/json',
			...options.header
		};
		
		// 如果有token，添加到请求头
		if (token) {
			header['Authorization'] = 'Bearer ' + token;
		}
		
		const fullUrl = BASE_URL + options.url;
		const requestData = options.data || {};
		
		// 对于包含大整数ID的请求，确保数据以JSON字符串形式发送
		let finalData = requestData;
		let finalHeader = { ...header };
		
		if (requestData && typeof requestData === 'object' && requestData.userAddressId) {
			finalData = JSON.stringify(requestData);
			finalHeader['Content-Type'] = 'application/json';
		}
		
		uni.request({
			url: fullUrl,
			method: options.method || 'GET',
			data: finalData,
			header: finalHeader,
			dataType: 'text', // 获取原始文本，避免自动JSON.parse导致大整数精度丢失
			timeout: options.timeout || 10000,
			success: (res) => {
				
				if (res.statusCode === 200) {
					// 使用大整数安全的JSON解析
					let parsedData;
					try {
						parsedData = safeParseBigInt(res.data);
					} catch (e) {
						console.error('JSON解析失败:', e);
						parsedData = res.data;
					}
					
					// HTTP 状态码是 200，但需要检查业务状态码
					// 如果业务状态码不是 200，仍然 resolve，让调用方处理
					resolve(parsedData)
				} else if (res.statusCode === 401) {
					// 401 未授权，token可能过期或无效
					console.error('认证失败 (401):', {
						url: fullUrl,
						header: header,
						response: res.data
					});
					uni.showToast({
						title: '登录已过期，请重新登录',
						icon: 'none',
						duration: 2000
					});
					reject({
						statusCode: res.statusCode,
						message: '认证失败',
						data: res.data
					});
				} else if (res.statusCode === 500) {
					// 500 服务器错误
					console.error('服务器错误 (500):', {
						url: fullUrl,
						response: res.data
					});
					uni.showToast({
						title: '服务器错误，请稍后重试',
						icon: 'none',
						duration: 2000
					});
					reject({
						statusCode: res.statusCode,
						message: '服务器错误',
						data: res.data
					});
				} else {
					// 其他HTTP状态码错误
					console.error(`请求失败 (${res.statusCode}):`, {
						url: fullUrl,
						response: res.data
					});
					uni.showToast({
						title: '请求失败',
						icon: 'none',
						duration: 2000
					});
					reject({
						statusCode: res.statusCode,
						message: '请求失败',
						data: res.data
					});
				}
			},
			fail: (err) => {
				console.error('网络请求失败:', {
					url: fullUrl,
					error: err
				});
				uni.showToast({
					title: '网络请求失败',
					icon: 'none',
					duration: 2000
				});
				reject(err);
			}
		})
	})
}

/**
 * 文件上传请求（用于form-data格式）
 * @param {Object} options 上传配置
 */
const uploadFile = (options) => {
	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: BASE_URL + options.url,
			filePath: options.filePath,
			name: options.name || 'file',
			formData: options.formData || {},
			header: options.header || {},
			timeout: options.timeout || 30000,
			success: (res) => {
				if (res.statusCode === 200) {
					try {
						const data = typeof res.data === 'string' ? safeParseBigInt(res.data) : res.data
						resolve(data)
					} catch (e) {
						resolve(res.data)
					}
				} else {
					uni.showToast({
						title: '上传失败',
						icon: 'none',
						duration: 2000
					})
					reject(res)
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '上传失败',
					icon: 'none',
					duration: 2000
				})
				reject(err)
			}
		})
	})
}

/**
 * GET请求
 */
const get = (url, data = {}, header = {}) => {
	return request({
		url,
		method: 'GET',
		data,
		header
	})
}

/**
 * POST请求
 */
const post = (url, data = {}, header = {}) => {
	return request({
		url,
		method: 'POST',
		data,
		header
	})
}

/**
 * PUT请求
 */
const put = (url, data = {}, header = {}) => {
	return request({
		url,
		method: 'PUT',
		data,
		header
	})
}

/**
 * DELETE请求
 */
const del = (url, data = {}, header = {}) => {
	return request({
		url,
		method: 'DELETE',
		data,
		header
	})
}

export default {
	request,
	uploadFile,
	get,
	post,
	put,
	del
}

