import http from './request.js'

/**
 * 跑腿服务相关API
 */

/**
 * 创建跑腿预支付订单
 * @param {Object} params 订单参数
 * @param {String} params.serviceType 服务类型：EXPRESS-取快递 FOOD-买食物 SHOPPING-代买物品 OTHER-其他
 * @param {String} params.goodsName 商品名称
 * @param {Number} params.goodsPrice 商品价格
 * @param {Number} params.servicePrice 服务费
 * @param {Number} params.totalPrice 总价
 * @param {Number} params.deliverAddressId 送货地址ID
 * @param {String} params.remark 备注
 * @param {String} params.expectedTime 期望送达时间
 * @returns {Promise}
 */
export const createErrandPrepay = (params) => {
	return http.post('/api/user/errand/prepay', params)
}

/**
 * 支付并创建跑腿订单
 * @param {Object} params 支付参数
 * @param {String} params.preOrderNo 预订单号
 * @param {Number} params.payType 支付方式：1-余额 2-微信 3-支付宝 4-面付
 * @param {Number} params.payAmount 支付金额
 * @param {String} params.payNo 支付密码或支付流水号
 * @param {Number} params.userAddressId 用户地址ID
 * @param {Number} params.deliverAddressId 送货地址ID
 * @returns {Promise}
 */
export const payAndCreateOrder = (params) => {
	return http.post('/api/user/errand/pay', params)
}

/**
 * 获取跑腿订单列表
 * @param {Object} params 查询参数
 * @param {Number} params.pageNum 当前页码（默认1）
 * @param {Number} params.pageSize 每页数量（默认10）
 * @param {String} params.status 订单状态（可选）
 * @returns {Promise}
 */
export const getErrandOrderList = (params = {}) => {
	const { pageNum = 1, pageSize = 10, status } = params
	
	const queryParams = {
		pageNum,
		pageSize
	}
	
	if (status) {
		queryParams.status = status
	}
	
	return http.get('/api/user/errand/order/list', queryParams)
}

/**
 * 获取跑腿订单详情
 * @param {String} orderNo 订单编号
 * @returns {Promise}
 */
export const getErrandOrderDetail = (orderNo) => {
	return http.get(`/api/user/errand/order/detail/${orderNo}`)
}

/**
 * 取消跑腿订单
 * @param {String} orderNo 订单编号
 * @returns {Promise}
 */
export const cancelErrandOrder = (orderNo) => {
	return http.post(`/api/user/errand/order/cancel/${orderNo}`)
}

/**
 * 确认收货
 * @param {String} orderNo 订单编号
 * @returns {Promise}
 */
export const confirmErrandOrder = (orderNo) => {
	return http.post(`/api/user/errand/order/confirm/${orderNo}`)
}

export default {
	createErrandPrepay,
	payAndCreateOrder,
	getErrandOrderList,
	getErrandOrderDetail,
	cancelErrandOrder,
	confirmErrandOrder
}
