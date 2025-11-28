import http from './request.js';

/**
 * 跑腿订单相关API
 */

/**
 * 创建跑腿预支付订单
 * @param {Object} data - 订单数据（CreateErrandOrderDto）
 * @param {Number} data.orderType - 订单类型：1-外卖单 2-跑腿单 3-二手交易单
 * @param {Number} data.senderId - 发送者ID
 * @param {String} data.merchantName - 商家名称（冗余）
 * @param {Number} data.deliverAddressId - 送货地址ID（必填）
 * @param {String} data.deliverAddress - 送货地址文本
 * @param {Number} data.goodsPrice - 商品价格
 * @param {String} data.deliverContact - 收货联系人
 * @param {String} data.deliverPhone - 收货电话
 * @param {Number} data.deliverLongitude - 送货经度
 * @param {Number} data.deliverLatitude - 送货纬度
 * @param {String} data.remark - 订单备注
 * @param {String} data.expectTime - 预期送达时间（格式：yyyy-MM-dd HH:mm:ss）
 * @param {String} data.goodsDesc - 商品描述
 */
export function createErrandPrepay(data) {
  return http.post('/user/errandOrder/prepay', data);
}

/**
 * 支付并创建订单
 * @param {Object} data - 支付数据（PayOrderDTO）
 * @param {String} data.preOrderNo - 预订单号
 * @param {String} data.payPassword - 支付密码
 * @param {Number} data.payType - 支付方式（1-余额 2-微信 3-支付宝 4-面付）
 * @param {Number} data.payAmount - 支付金额
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
  return http.put(`/user/errandOrder/cancel/${orderMainId}?cancelReason=${encodeURIComponent(cancelReason)}`);
}

/**
 * 用户确认收货
 * @param {Number} orderMainId - 订单ID
 * @param {Number} riderId - 骑手ID（可选）
 */
export function confirmOrder(orderMainId, riderId) {
  const url = riderId 
    ? `/user/errandOrder/confirm/${orderMainId}?riderId=${riderId}`
    : `/user/errandOrder/confirm/${orderMainId}`;
  return http.put(url);
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
