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
   * @param {String} orderId - 订单ID
   * @returns {Promise} - 返回订单详情数据
   */
  getOrderDetail: (orderId) => {
    return request.get(`/user/order/detail/${orderId}`)
  },
  
  /**
   * 获取订单统计信息
   * @returns {Promise} - 返回订单统计数据
   */
  getOrderStats: () => {
    return request.get('/user/order/stats')
  }
}

export default orderApi