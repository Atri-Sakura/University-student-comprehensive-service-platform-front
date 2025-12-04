/**
 * 认证相关API
 * 包含登录、注册、退出等功能
 */

import { request } from '../api.js';

// API路径
const AUTH_API = {
	LOGIN_RIDER: '/platform/auth/rider/login',        // 骑手登录
	REGISTER_RIDER: '/platform/auth/rider/register',  // 骑手注册
	CAPTCHA: '/captchaImage',                          // 获取验证码
	GET_INFO: '/getInfo',                              // 获取用户信息
	LOGOUT: '/logout'                                  // 退出登录
};

/**
 * 骑手登录
 * @param {String} phonenumber 手机号
 * @param {String} password 密码
 * @param {String} code 验证码
 * @param {String} uuid 验证码UUID
 */
export async function loginRider(phonenumber, password, code, uuid) {
	return request({
		url: AUTH_API.LOGIN_RIDER,
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
		url: AUTH_API.REGISTER_RIDER,
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
		url: AUTH_API.CAPTCHA,
		method: 'GET',
		needAuth: false
	});
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo() {
	return request({
		url: AUTH_API.GET_INFO,
		method: 'GET'
	});
}

/**
 * 退出登录
 */
export async function logout() {
	return request({
		url: AUTH_API.LOGOUT,
		method: 'POST'
	});
}

export default {
	loginRider,
	registerRider,
	getCaptcha,
	getUserInfo,
	logout
};
