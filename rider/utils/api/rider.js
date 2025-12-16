/**
 * 骑手信息相关API
 * 包含查询、修改个人信息、修改密码等功能
 */

import { request } from '../api.js';
import { API_BASE_URL } from '../config.js';

// API路径
const RIDER_API = {
	BASE_INFO: '/api/rider/base/info',          // 查询骑手基本信息（脱敏）
	FULL_INFO: '/rider/info',                   // 查询骑手完整信息（包含auditStatus）
	BASE_UPDATE: '/api/rider/base/update',      // 修改骑手基本信息
	PASSWORD_UPDATE: '/api/rider/base/password', // 修改骑手密码
	QUALIFICATION_UPLOAD: '/rider/qualificationCertification/upload' // 资质认证上传
};

/**
 * 查询骑手脱敏基本信息
 */
export async function getRiderBaseInfo() {
	return request({
		url: RIDER_API.BASE_INFO,
		method: 'GET'
	});
}

/**
 * 查询骑手完整信息（包含审核状态等）
 */
export async function getRiderFullInfo() {
	return request({
		url: RIDER_API.FULL_INFO,
		method: 'GET'
	});
}

/**
 * 修改骑手基本信息
 * 后端使用 @RequestParam 接收参数，需要发送表单格式数据
 * @param {Object} data 修改数据
 * @param {String} data.nickname 昵称（可选）
 * @param {String} data.phone 手机号（可选）
 * @param {String|File} data.avatar 头像文件路径或文件对象（可选）
 */
export async function updateRiderBaseInfo(data) {
	// 检查是否包含头像（可能是文件路径字符串或文件对象）
	const hasAvatar = data.avatar && (
		typeof data.avatar === 'string' ||  // 文件路径
		data.avatar instanceof File ||       // File 对象
		typeof data.avatar === 'object'      // 其他对象类型
	);
	
	// 获取token
	const token = uni.getStorageSync('token');
	const fullUrl = `${API_BASE_URL}${RIDER_API.BASE_UPDATE}`;
	
	return new Promise((resolve, reject) => {
		uni.showLoading({
			title: '加载中...',
			mask: true
		});
		
		if (hasAvatar) {
			// 如果有头像，使用 uni.uploadFile 上传
			const formData = {};
			if (data.nickname) formData.nickname = data.nickname;
			if (data.phone) formData.phone = data.phone;
			
			// 获取文件路径：如果是字符串直接使用，如果是对象则取 path 属性
			const filePath = typeof data.avatar === 'string' ? data.avatar : (data.avatar.path || data.avatar);
			
			uni.uploadFile({
				url: fullUrl,
				filePath: filePath,
				name: 'avatar',
				formData: formData,
				header: {
					'Authorization': token ? `Bearer ${token}` : ''
				},
				success: (res) => {
					uni.hideLoading();
					try {
						const result = JSON.parse(res.data);
						if (result.code === 200) {
							resolve(result);
						} else {
							reject(new Error(result.msg || '修改失败'));
						}
					} catch (e) {
						reject(new Error('响应解析失败'));
					}
				},
				fail: (error) => {
					uni.hideLoading();
					reject(error);
				}
			});
		} else {
			// 没有头像时，使用 uni.request 发送表单格式数据
			// 后端使用 @RequestParam，需要发送 application/x-www-form-urlencoded 格式
			uni.request({
				url: fullUrl,
				method: 'POST',
				data: data,  // uni.request 会自动将对象转换为表单格式
				header: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Authorization': token ? `Bearer ${token}` : ''
				},
				success: (res) => {
					uni.hideLoading();
					if (res.data.code === 200) {
						resolve(res.data);
					} else if (res.data.code === 401) {
						// token过期
						uni.removeStorageSync('token');
						uni.showToast({
							title: '登录已过期，请重新登录',
							icon: 'none'
						});
						setTimeout(() => {
							uni.redirectTo({ url: '/pages/login/login' });
						}, 1500);
						reject(new Error('登录已过期'));
					} else {
						reject(new Error(res.data.msg || '修改失败'));
					}
				},
				fail: (error) => {
					uni.hideLoading();
					reject(error);
				}
			});
		}
	});
}

/**
 * 修改骑手登录密码
 * @param {String} oldPassword 原密码
 * @param {String} newPassword 新密码
 * @param {String} confirmPassword 确认新密码
 */
export async function updateRiderPassword(oldPassword, newPassword, confirmPassword) {
	return request({
		url: RIDER_API.PASSWORD_UPDATE,
		method: 'POST',
		data: {
			oldPassword,
			newPassword,
			confirmPassword
		}
	});
}

/**
 * 上传骑手资质认证材料
 * 后端需要同时接收两个 MultipartFile 文件（frontFile 和 backFile）
 * H5平台：使用原生 XMLHttpRequest 和 FormData 同时上传两个文件
 * 非H5平台：由于 uni-app 限制，暂不支持，建议使用 H5 版本
 * @param {String} frontFilePath 身份证正面图片路径
 * @param {String} backFilePath 身份证反面图片路径
 * @param {String} idCardNumber 身份证号码
 */
export async function uploadQualificationCertification(frontFilePath, backFilePath, idCardNumber) {
	return new Promise((resolve, reject) => {
		// 获取token
		const token = uni.getStorageSync('token');
		
		// 显示加载提示
		uni.showLoading({
			title: '上传中...',
			mask: true
		});
		
		// #ifdef H5
		// H5平台：使用原生 XMLHttpRequest 同时上传两个文件
		console.log('H5平台，使用原生方式上传两个文件');
		
		// 获取两个文件的 Blob 对象
		Promise.all([
			fetch(frontFilePath).then(res => res.blob()),
			fetch(backFilePath).then(res => res.blob())
		]).then(([frontBlob, backBlob]) => {
			// 创建 FormData
			const formData = new FormData();
			formData.append('frontFile', frontBlob, 'front.jpg');
			formData.append('backFile', backBlob, 'back.jpg');
			formData.append('idCardNumber', idCardNumber);
			
			console.log('准备上传，参数信息：', {
				url: `${API_BASE_URL}${RIDER_API.QUALIFICATION_UPLOAD}`,
				frontFilePath,
				backFilePath,
				idCardNumber,
				frontBlobSize: frontBlob.size,
				backBlobSize: backBlob.size
			});
			
			// 使用 XMLHttpRequest 上传
			const xhr = new XMLHttpRequest();
			xhr.open('POST', `${API_BASE_URL}${RIDER_API.QUALIFICATION_UPLOAD}`, true);
			
			// 设置请求头
			if (token) {
				xhr.setRequestHeader('Authorization', `Bearer ${token}`);
			}
			
			xhr.onload = function() {
				uni.hideLoading();
				console.log('上传响应状态:', xhr.status);
				console.log('上传响应内容:', xhr.responseText);
				
				if (xhr.status === 200) {
					try {
						const result = JSON.parse(xhr.responseText);
						console.log('解析后的结果:', result);
						if (result.code === 200) {
							resolve(result);
						} else {
							console.error('上传失败，错误信息:', result.msg);
							reject(new Error(result.msg || '上传失败'));
						}
					} catch (error) {
						console.error('解析响应失败:', error, '原始数据:', xhr.responseText);
						reject(new Error('响应解析失败'));
					}
				} else {
					console.error('HTTP错误:', xhr.status, xhr.statusText);
					reject(new Error(`HTTP错误: ${xhr.status}`));
				}
			};
			
			xhr.onerror = function() {
				uni.hideLoading();
				console.error('网络错误');
				reject(new Error('网络错误'));
			};
			
			xhr.upload.onprogress = function(e) {
				if (e.lengthComputable) {
					const percent = Math.round((e.loaded / e.total) * 100);
					console.log('上传进度:', percent + '%');
				}
			};
			
			// 发送请求
			xhr.send(formData);
			
		}).catch(error => {
			uni.hideLoading();
			console.error('获取文件失败:', error);
			reject(new Error('获取文件失败: ' + error.message));
		});
		// #endif
		
		// #ifndef H5
		// 非H5平台：uni-app 的 uploadFile 不支持同时上传多个文件
		uni.hideLoading();
		console.error('当前平台不支持同时上传两个文件，请使用H5版本或联系后端修改接口');
		reject(new Error('当前平台暂不支持，请使用H5版本'));
		// #endif
	});
}

export default {
	getRiderBaseInfo,
	getRiderFullInfo,
	updateRiderBaseInfo,
	updateRiderPassword,
	uploadQualificationCertification
};
