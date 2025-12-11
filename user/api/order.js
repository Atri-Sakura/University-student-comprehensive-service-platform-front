// 订单相关API
import request from './request.js'

const orderApi = {
  /**
   * 获取订单列表
   * @param {Object} params - 查询参数，可以包含订单类型、状态等筛选条件
   * @returns {Promise} - 返回订单列表数据
   */
  getOrderList: (params = {}) => {
    return request.get('/user/order/list', params)
  },
  
  /**
   * 获取订单详情
   * @param {String} orderNo - 订单ID
   * @returns {Promise} - 返回订单详情数据
   */
  getOrderDetail: (orderNo) => {
    return request.get(`/user/order/${orderNo}`)
  },
  
  /**
   * 获取订单统计信息
   * @returns {Promise} - 返回订单统计数据
   */
  getOrderStats: () => {
    return request.get('/user/order/stats')
  },
  
  /**
   * 取消订单
   * @param {String|Number} orderMainId - 订单主表ID
   * @param {String} cancelReason - 取消原因
   * @returns {Promise} - 返回取消订单结果
   */
  cancelOrder: (orderMainId, cancelReason) => {
    return request.put(`/user/order/cancel/${orderMainId}?cancelReason=${encodeURIComponent(cancelReason)}`)
  },
  
  /**
   * 获取二手交易订单详情
   * @param {String} orderNo - 订单号
   * @returns {Promise} - 返回订单详情数据
   */
  getSecondHandOrderDetail: (orderNo) => {
    return request.get(`/user/order/${orderNo}`)
  },
  
  /**
   * 提交骑手评价
   * @param {Object} evaluationData - 评价数据
   * @returns {Promise} - 返回提交结果
   */
  submitRiderEvaluation: (evaluationData) => {
    return request.post('/user/riderEvaluation', evaluationData)
  },
  
  /**
   * 获取跑腿订单详情
   * @param {String} orderNo - 订单号
   * @returns {Promise} - 返回订单详情数据
   */
  getErrandOrderDetail: (orderNo) => {
    return request.get(`/user/order/errandOrder/${orderNo}`)
  }
}

export default orderApi