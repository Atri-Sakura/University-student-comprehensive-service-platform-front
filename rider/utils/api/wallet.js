/**
 * 钱包相关API接口
 * 包含提现等功能
 */

import { 请求 } from '../api.js';

// ========== API 路径配置 ==========
const WALLET_API = {
	// 骑手钱包提现
	WITHDRAW_ALIPAY: '/rider/finance/withdraw/alipay',
	// 获取钱包余额
	GET_BALANCE: '/rider/wallet/balance',
	// 获取交易记录（待后端实现）
	GET_TRANSACTIONS: '/rider/finance/transactions',
	// 骑手钱包流水查询
	GET_WALLET_FLOW: '/api/rider/wallet/flow'
};

// ========== 钱包相关API ==========

/**
 * 支付宝提现
 * @param {Number} amount 提现金额
 * @param {Number} payChannel 支付渠道 1=支付宝
 * @param {String} payPassword 支付密码（可选）
 */
export async function withdrawByAlipay(amount, payChannel = 1, payPassword = '') {
	return 请求({
		url: WALLET_API.WITHDRAW_ALIPAY,
		method: 'POST',
		data: {
			amount: parseFloat(amount),
			payChannel,
			payPassword
		}
	});
}

/**
 * 获取钱包余额
 */
export async function getWalletBalance() {
	return await 请求({
		url: WALLET_API.GET_BALANCE,
		method: 'GET'
	});
}


/**
 * 获取交易记录（待后端实现）
 * @param {Number} page 页码
 * @param {Number} pageSize 每页数量
 */
export async function getTransactions(page = 1, pageSize = 20) {
	return 请求({
		url: WALLET_API.GET_TRANSACTIONS,
		method: 'GET',
		data: {
			page,
			pageSize
		}
	});
}

/**
 * 骑手钱包流水查询
 * @param {Number} page 页码
 * @param {Number} pageSize 每页数量
 */
export async function getRiderWalletFlow(page = 1, pageSize = 20) {
	return 请求({
		url: WALLET_API.GET_WALLET_FLOW,
		method: 'GET',
		data: {
			page,
			pageSize
		}
	});
}

export default {
	withdrawByAlipay,
	getWalletBalance,
	getTransactions,
	getRiderWalletFlow
};
