/**
 * 评价相关 API
 * 包含查询评价列表等功能
 */

import { request } from '../api.js';

// API路径
const EVALUATION_API = {
	MY_LIST: '/rider/evaluation/myList', // 查询收到的评价列表
	MY_STATISTICS: '/rider/evaluation/myStatistics' // 查询评价统计信息
};

/**
 * 查询我收到的评价列表
 * @param {Object} params 查询参数
 * @param {Number} params.rating 评分（可选）
 * @param {String} params.orderSn 订单编号（可选）
 * @param {String} params.startTime 开始时间（可选）
 * @param {String} params.endTime 结束时间（可选）
 */
export async function getMyEvaluationList(params = {}) {
	return request({
		url: EVALUATION_API.MY_LIST,
		method: 'GET',
		data: params
	});
}

/**
 * 查询我的评价统计信息
 */
export async function getMyEvaluationStatistics() {
	return request({
		url: EVALUATION_API.MY_STATISTICS,
		method: 'GET'
	});
}
