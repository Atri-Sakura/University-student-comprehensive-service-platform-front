/**
 * 骑手信息相关API
 * 包含查询、修改个人信息、修改密码等功能
 */

import request from './request.js';

// API路径
const RIDER_API = {
	BASE_INFO: '/api/rider/base/info',          // 查询骑手基本信息
	BASE_UPDATE: '/api/rider/base/update',      // 修改骑手基本信息
	PASSWORD_UPDATE: '/api/rider/base/password' // 修改骑手密码
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
 * 修改骑手基本信息
 * @param {Object} data 修改数据
 * @param {String} data.nickname 昵称（可选）
 * @param {String} data.phone 手机号（可选）
 * @param {File} data.avatar 头像文件（可选）
 */
export async function updateRiderBaseInfo(data) {
	// 检查是否包含文件
	const hasFile = data.avatar && (data.avatar instanceof File || typeof data.avatar === 'object');
	
	// 如果有文件，使用FormData
	if (hasFile) {
		const formData = new FormData();
		if (data.nickname) formData.append('nickname', data.nickname);
		if (data.phone) formData.append('phone', data.phone);
		if (data.avatar) formData.append('avatar', data.avatar);
		
		return request({
			url: RIDER_API.BASE_UPDATE,
			method: 'POST',
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
	}
	
	// 如果没有文件，使用表单格式发送
	// request.js会自动将对象转换为URL编码格式
	return request({
		url: RIDER_API.BASE_UPDATE,
		method: 'POST',
		data: data,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
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

export default {
	getRiderBaseInfo,
	updateRiderBaseInfo,
	updateRiderPassword
};
