/**
 * 支付密码相关API
 * 包含设置、修改、重置支付密码等功能
 */

import request from './request.js';

// API路径
const PAYMENT_API = {
	PASSWORD_SET: '/api/rider/pay/password/set',       // 设置支付密码
	PASSWORD_UPDATE: '/api/rider/pay/password/update', // 修改支付密码
	PASSWORD_RESET: '/api/rider/pay/password/reset'    // 重置支付密码（待实现）
};

/**
 * 设置支付密码（第一次使用）
 * @param {String} payPassword 支付密码（6位数字）
 * @param {String} confirmPayPassword 确认支付密码
 */
export async function setPayPassword(payPassword, confirmPayPassword) {
	return request({
		url: PAYMENT_API.PASSWORD_SET,
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
		url: PAYMENT_API.PASSWORD_UPDATE,
		method: 'POST',
		data: {
			oldPayPassword,
			newPayPassword,
			confirmNewPayPassword
		}
	});
}

/**
 * 重置支付密码（忘记密码）
 * @param {String} phone 手机号
 * @param {String} code 验证码
 * @param {String} newPayPassword 新支付密码
 * @param {String} confirmNewPayPassword 确认新支付密码
 */
export async function resetPayPassword(phone, code, newPayPassword, confirmNewPayPassword) {
	return request({
		url: PAYMENT_API.PASSWORD_RESET,
		method: 'POST',
		data: {
			phone,
			code,
			newPayPassword,
			confirmNewPayPassword
		}
	});
}

export default {
	setPayPassword,
	updatePayPassword,
	resetPayPassword
};
