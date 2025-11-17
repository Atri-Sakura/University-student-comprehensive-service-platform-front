/**
 * 个人信息相关 API 接口
 * 封装骑手基本信息的增删改查操作
 */

// ========== 基础配置 ==========
import { API_BASE_URL } from './config.js';

// ========== 个人信息 API 路径配置 ==========
const PROFILE_API = {
	RIDER_BASE_INFO: '/api/rider/base/info',           // 查询骑手基本信息
	RIDER_BASE_UPDATE: '/api/rider/base/update',       // 修改骑手基本信息
};

// ========== 请求封装 ==========
/**
 * 统一请求方法
 * @param {Object} options 请求配置
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
	
	// uni.request 不需要预先构建配置对象
	
	try {
		// 显示加载提示
		uni.showLoading({
			title: '加载中...',
			mask: true
		});
		
		// 使用 uni.request 发送请求
		const response = await new Promise((resolve, reject) => {
			uni.request({
				url: fullUrl,
				method: method.toUpperCase(),
				data: method.toUpperCase() === 'GET' ? {} : data,
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
 * 表单数据请求方法（用于 @RequestParam 接口）
 * @param {Object} options 请求配置
 */
async function requestForm(options) {
	const {
		url,
		method = 'POST',
		data,
		headers = {},
		needAuth = true
	} = options;
	
	// 构建完整URL
	const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
	
	// 构建请求头（不设置 Content-Type，让浏览器自动设置）
	const requestHeaders = {
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
		uni.showLoading({
			title: '加载中...',
			mask: true
		});
		
		// 将 FormData 转换为普通对象
		const formDataObj = {};
		if (data instanceof FormData) {
			for (let [key, value] of data.entries()) {
				formDataObj[key] = value;
			}
		} else {
			Object.assign(formDataObj, data);
		}
		
		// 使用 uni.request 发送请求
		const response = await new Promise((resolve, reject) => {
			uni.request({
				url: fullUrl,
				method: method.toUpperCase(),
				data: formDataObj,
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
		console.error('表单请求失败:', error);
		
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

// ========== 个人信息相关API ==========

/**
 * 查询骑手基本信息
 * @returns {Promise} 返回骑手基本信息
 */
export async function getRiderBaseInfo() {
	return request({
		url: PROFILE_API.RIDER_BASE_INFO,
		method: 'GET'
	});
}

/**
 * 修改骑手基本信息
 * @param {Object} data 骑手信息数据
 * @param {String} data.nickname 昵称（可选）
 * @param {String} data.phone 手机号（可选）
 * @param {String} data.avatarPath 头像文件路径（可选，本地路径）
 * @returns {Promise} 返回修改结果
 */
export async function updateRiderBaseInfo(data) {
	console.log('🚀 updateRiderBaseInfo 调用参数:', data);
	
	// 如果包含头像文件，使用文件上传方式
	if (data.avatarPath) {
		console.log('📁 使用文件上传方式');
		return uploadRiderInfo(data);
	}
	
	// 否则使用表单数据请求（适配后端 @RequestParam）
	const { avatarPath, ...requestData } = data;
	console.log('📝 发送表单请求数据:', requestData);
	console.log('🔗 请求URL:', PROFILE_API.RIDER_BASE_UPDATE);
	
	// 构建表单数据
	const formData = new FormData();
	if (requestData.nickname) formData.append('nickname', requestData.nickname);
	if (requestData.phone) formData.append('phone', requestData.phone);
	
	console.log('📋 FormData内容:', {
		nickname: requestData.nickname,
		phone: requestData.phone
	});
	
	const result = await requestForm({
		url: PROFILE_API.RIDER_BASE_UPDATE,
		method: 'POST',
		data: formData
	});
	
	console.log('✅ 后端响应结果:', result);
	return result;
}

/**
 * 上传骑手信息（包含文件）
 * @param {Object} data 骑手信息数据
 * @param {String} data.nickname 昵称（可选）
 * @param {String} data.phone 手机号（可选）
 * @param {String} data.avatarPath 头像文件路径（可选，本地路径）
 */
async function uploadRiderInfo(data) {
	const { avatarPath, nickname, phone } = data;
	
	// 获取token
	const token = uni.getStorageSync('token');
	
	// 构建完整URL
	const fullUrl = `${API_BASE_URL}${PROFILE_API.RIDER_BASE_UPDATE}`;
	
	return new Promise((resolve, reject) => {
		try {
			// 显示加载提示
			uni.showLoading({
				title: '上传中...',
				mask: true
			});
			
			// 构建formData数据
			const formData = {};
			if (nickname) formData.nickname = nickname;
			if (phone) formData.phone = phone;
			
			// 使用uni.uploadFile上传
			uni.uploadFile({
				url: fullUrl,
				filePath: avatarPath,
				name: 'avatar',  // 后端接收的文件字段名
				formData: formData,
				header: {
					'Authorization': token ? `Bearer ${token}` : ''
				},
				success: (uploadRes) => {
					uni.hideLoading();
					
					try {
						const result = JSON.parse(uploadRes.data);
						
						// 处理响应
						if (result.code === 200) {
							uni.showToast({
								title: result.msg || '修改成功',
								icon: 'success',
								duration: 2000
							});
							resolve(result);
						} else if (result.code === 401) {
							handleTokenExpired();
							reject(new Error(result.msg || 'Token已过期'));
						} else {
							uni.showToast({
								title: result.msg || '修改失败',
								icon: 'none',
								duration: 2000
							});
							reject(new Error(result.msg));
						}
					} catch (parseError) {
						console.error('解析响应失败:', parseError);
						uni.showToast({
							title: '响应数据解析失败',
							icon: 'none',
							duration: 2000
						});
						reject(parseError);
					}
				},
				fail: (error) => {
					uni.hideLoading();
					console.error('上传失败:', error);
					uni.showToast({
						title: '上传失败',
						icon: 'none',
						duration: 2000
					});
					reject(error);
				}
			});
		} catch (error) {
			uni.hideLoading();
			reject(error);
		}
	});
}

// ========== 导出 ==========
export {
	PROFILE_API,
	API_BASE_URL
};

export default {
	API_BASE_URL,
	PROFILE_API,
	// 个人信息相关
	getRiderBaseInfo,
	updateRiderBaseInfo
};
