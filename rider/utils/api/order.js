/**
 * 订单相关API
 * 包含订单查询、接单、取货、配送等功能
 * 待后端接口完成后实现
 */

import { request } from '../api.js';

// API路径
const ORDER_API = {
	NEW_ORDERS: '/api/rider/order/new',           // 获取新订单列表
	ORDER_DETAIL: '/rider/order',                 // 订单详情
	ACCEPT_ORDER: '/api/rider/order/accept',      // 接单
	PICKUP_ORDER: '/api/rider/order/pickup',      // 取货
	DELIVER_ORDER: '/api/rider/order/deliver',    // 配送中
	COMPLETE_ORDER: '/api/rider/order/complete',  // 完成配送
	HISTORY_ORDERS: '/rider/order/myOrders',      // 历史订单
	ORDER_STATISTICS: '/api/rider/order/stats'    // 订单统计
};

/**
 * 获取新订单列表
 * @param {Number} page 页码
 * @param {Number} pageSize 每页数量
 */
export async function getNewOrders(page = 1, pageSize = 10) {
	return request({
		url: ORDER_API.NEW_ORDERS,
		method: 'GET',
		data: { page, pageSize }
	});
}

/**
 * 获取订单详情
 * @param {String} orderId 订单ID
 */
export async function getOrderDetail(orderId) {
	console.log('🔗 getOrderDetail接收到的orderId:', orderId);
	console.log('🔗 orderId类型:', typeof orderId);
	const url = `${ORDER_API.ORDER_DETAIL}/${orderId}`;
	console.log('🔗 最终请求URL:', url);
	
	return request({
		url: url,
		method: 'GET'
	});
}

/**
 * 接单
 * @param {String} orderId 订单ID
 */
export async function acceptOrder(orderId) {
	return request({
		url: ORDER_API.ACCEPT_ORDER,
		method: 'POST',
		data: { orderId }
	});
}

/**
 * 取货
 * @param {String} orderId 订单ID
 */
export async function pickupOrder(orderId) {
	return request({
		url: ORDER_API.PICKUP_ORDER,
		method: 'POST',
		data: { orderId }
	});
}

/**
 * 开始配送
 * @param {String} orderId 订单ID
 */
export async function deliverOrder(orderId) {
	return request({
		url: ORDER_API.DELIVER_ORDER,
		method: 'POST',
		data: { orderId }
	});
}

/**
 * 完成配送
 * @param {String} orderId 订单ID
 * @param {String} deliveryCode 取餐码
 */
export async function completeOrder(orderId, deliveryCode) {
	return request({
		url: ORDER_API.COMPLETE_ORDER,
		method: 'POST',
		data: { orderId, deliveryCode }
	});
}

/**
 * 获取历史订单
 * @param {Object} orderMain 查询条件
 * @param {String} timeRange 时间范围: today-今日, yesterday-昨日, week-本周, month-本月
 * @param {Number} page 页码
 * @param {Number} pageSize 每页数量
 */
export async function getHistoryOrders(orderMain = {}, timeRange = null, page = 1, pageSize = 10) {
	return request({
		url: ORDER_API.HISTORY_ORDERS,
		method: 'GET',
		data: { ...orderMain, timeRange, page, pageSize }
	});
}

/**
 * 获取订单统计
 * @param {String} startDate 开始日期
 * @param {String} endDate 结束日期
 */
export async function getOrderStatistics(startDate, endDate) {
	return request({
		url: ORDER_API.ORDER_STATISTICS,
		method: 'GET',
		data: { startDate, endDate }
	});
}

/**
 * 异常报备
 * @param {Object} orderData 订单数据
 * @param {Number} orderData.riderId 骑手ID
 * @param {String} orderData.orderMainId 订单主ID
 * @param {String} orderData.cancelReason 异常类型（报备原因）
 */
export async function reportException(orderData) {
	return request({
		url: ORDER_API.REPORT_EXCEPTION,
		method: 'PUT',
		data: orderData
	});
}

export default {
	getNewOrders,
	getOrderDetail,
	acceptOrder,
	pickupOrder,
	deliverOrder,
	completeOrder,
	getHistoryOrders,
	reportException,
	getOrderStatistics
};
