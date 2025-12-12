// 订单相关API
import 请求 from './request.js'

const orderApi = {
  /**
   * 获取订单列表
   * @param {Object} params - 查询参数，可以包含订单类型、状态等筛选条件
   * @returns {Promise} - 返回订单列表数据
   */
  getOrderList: (params = {}) => {
    return 请求.get('/user/order/list', params)
  },
  
  /**
   * 获取订单详情
   * @param {String} orderNo - 订单ID
   * @returns {Promise} - 返回订单详情数据
   */
  getOrderDetail: (orderNo) => {
    return 请求.get(`/user/order/${orderNo}`)
  },
  
  /**
   * 获取订单统计信息
   * @returns {Promise} - 返回订单统计数据
   */
  getOrderStats: () => {
    return 请求.get('/user/order/stats')
  },
  
  /**
   * 取消订单
   * @param {String|Number} orderMainId - 订单主表ID
   * @param {String} cancelReason - 取消原因
   * @returns {Promise} - 返回取消订单结果
   */
  cancelOrder: (orderMainId, cancelReason) => {
    return 请求.put(`/user/order/cancel/${orderMainId}?cancelReason=${encodeURIComponent(cancelReason)}`)
  },
  
  /**
   * 获取二手交易订单详情
   * @param {String} orderNo - 订单号
   * @returns {Promise} - 返回订单详情数据
   */
  getSecondHandOrderDetail: (orderNo) => {
    return 请求.get(`/api/user/secondhandGoods/order/detail/${orderNo}`)
  },
  
  /**
   * 提交骑手评价
   * @param {Object} evaluationData - 评价数据
   * @returns {Promise} - 返回提交结果
   */
  submitRiderEvaluation: (evaluationData) => {
    return 请求.post('/user/riderEvaluation', evaluationData)
  },

    /**
   * 提交商家评价
   * @param {Object} evaluationData - 评价数据
   * @returns {Promise} - 返回提交结果
   */
  submitMerchantEvaluation: (evaluationData) => {
    return 请求.post('/platform/evaluation/add', evaluationData)
  },
  
  /**
   * 获取跑腿订单详情
   * @param {String} orderNo - 订单号
   * @returns {Promise} - 返回订单详情数据
   */
  getErrandOrderDetail: (orderNo) => {
    return 请求.get(`/user/order/errandOrder/${orderNo}`)
  }
}


export default orderApi
