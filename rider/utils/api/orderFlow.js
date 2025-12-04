/**
 * 骑手订单流转相关API
 * 包含接单、取货、送达等功能
 */

import { request } from '../api.js';

// API路径
const ORDER_API = {
	// 订单查询接口
	AVAILABLE: '/rider/order/available',        // 可接单列表
	MY_ORDERS: '/rider/order/myOrders',         // 我的订单列表
	ORDER_DETAIL: '/rider/order',               // 订单详情
	STATISTICS: '/rider/order/statistics',      // 订单统计
	
	// 订单流转接口
	ACCEPT: '/rider/orderFlow/accept',          // 骑手接单
	PICKUP: '/rider/orderFlow/pickup',          // 骑手取货
	DELIVER: '/rider/orderFlow/deliver'         // 骑手送达
};

/**
 * 骑手接单
 * @param {String} orderMainId 订单主表ID（字符串格式，避免大数字精度丢失）
 */
export async function acceptOrder(orderMainId) {
	return request({
		url: `${ORDER_API.ACCEPT}/${orderMainId}`,
		method: 'POST'
	});
}

/**
 * 骑手取货
 * @param {String} orderMainId 订单主表ID（字符串格式）
 */
export async function pickupOrder(orderMainId) {
	return request({
		url: `${ORDER_API.PICKUP}/${orderMainId}`,
		method: 'POST'
	});
}

/**
 * 骑手送达（完成跑单）
 * @param {String} orderMainId 订单主表ID（字符串格式）
 */
export async function deliverOrder(orderMainId) {
	return request({
		url: `${ORDER_API.DELIVER}/${orderMainId}`,
		method: 'POST'
	});
}

/**
 * 获取可接单列表（待取货且未被接单的订单）
 * @param {Object} params 查询参数
 * @param {String} params.orderNo 订单号（模糊搜索）
 * @param {Number} params.orderType 订单类型 1-外卖 2-跑腿
 * @param {Number} params.pageNum 页码
 * @param {Number} params.pageSize 每页数量
 */
export async function getAvailableOrders(params = {}) {
	return request({
		url: ORDER_API.AVAILABLE,
		method: 'GET',
		data: params
	});
}

/**
 * 获取我的订单列表
 * @param {Object} params 查询参数
 * @param {String} params.timeRange 时间范围 today/yesterday/week/month
 * @param {Number} params.orderStatus 订单状态
 * @param {Number} params.orderType 订单类型 1-外卖 2-跑腿
 * @param {String} params.orderNo 订单号（模糊搜索）
 * @param {Number} params.pageNum 页码
 * @param {Number} params.pageSize 每页数量
 */
export async function getMyOrders(params = {}) {
	return request({
		url: ORDER_API.MY_ORDERS,
		method: 'GET',
		data: params
	});
}

/**
 * 获取订单统计
 * 返回今日/昨日/本周/本月统计数据
 */
export async function getOrderStatistics() {
	return request({
		url: ORDER_API.STATISTICS,
		method: 'GET'
	});
}

/**
 * 获取订单详情
 * @param {String} orderMainId 订单主表ID（字符串格式）
 */
export async function getOrderDetail(orderMainId) {
	return request({
		url: `${ORDER_API.ORDER_DETAIL}/${orderMainId}`,
		method: 'GET'
	});
}

export default {
	// 订单查询
	getAvailableOrders,
	getMyOrders,
	getOrderDetail,
	getOrderStatistics,
	// 订单流转
	acceptOrder,
	pickupOrder,
	deliverOrder
};
