import http from './request.js';

/**
 * 跑腿订单相关API
 */

/**
 * 创建跑腿预支付订单
 * @param {Object} data - 订单数据
 * @param {String} data.serviceType - 服务类型（EXPRESS/FOOD/SHOPPING/OTHER）
 * @param {String} data.goodsName - 商品名称
 * @param {Number} data.goodsPrice - 商品价格
 * @param {Number} data.servicePrice - 服务费
 * @param {Number} data.totalPrice - 总价
 * @param {Number} data.deliverAddressId - 送货地址ID（必填）
 * @param {String} data.remark - 备注
 * @param {String} data.expectedTime - 期望送达时间
 */
export function createErrandPrepay(data) {
  return http.post('/user/errandOrder/prepay', data);
}

/**
 * 支付并创建订单
 * @param {Object} data - 支付数据
 * @param {String} data.preOrderNo - 预订单号
 * @param {Number} data.payType - 支付方式（1-余额 2-微信 3-支付宝 4-面付）
 * @param {Number} data.payAmount - 支付金额（必填）
 * @param {String} data.payNo - 支付流水号
 * @param {Number} data.userAddressId - 用户地址ID
 */
export function payAndCreateOrder(data) {
  return http.post('/user/errandOrder/pay-and-create', data);
}

/**
 * 取消预支付订单
 * @param {String} preOrderNo - 预订单号
 */
export function cancelPrepayOrder(preOrderNo) {
  return http.del(`/user/errandOrder/prepay/${preOrderNo}`);
}

/**
 * 用户取消订单
 * @param {Number} orderMainId - 订单ID
 * @param {String} cancelReason - 取消原因
 */
export function cancelOrder(orderMainId, cancelReason) {
  return http.put(`/user/errandOrder/cancel/${orderMainId}`, { cancelReason });
}

/**
 * 用户确认收货
 * @param {Number} orderMainId - 订单ID
 * @param {Number} riderId - 骑手ID（可选）
 */
export function confirmOrder(orderMainId, riderId) {
  return http.put(`/user/errandOrder/confirm/${orderMainId}`, riderId ? { riderId } : {});
}

/**
 * 查询用户订单列表
 * @param {Object} params - 查询参数
 * @param {Number} params.pageNum - 页码
 * @param {Number} params.pageSize - 每页数量
 * @param {String} params.orderStatus - 订单状态（可选）
 * @param {String} params.orderType - 订单类型（可选）
 */
export function getErrandOrderList(params) {
  return http.get('/user/errandOrder/list', params);
}

/**
 * 查询订单详情
 * @param {Number} orderMainId - 订单ID
 */
export function getErrandOrderDetail(orderMainId) {
  return http.get(`/user/errandOrder/${orderMainId}`);
}
