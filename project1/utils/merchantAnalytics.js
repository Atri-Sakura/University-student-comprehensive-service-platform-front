// 商家数据分析 API 接口
import { request } from './api.js';

const baseUrl = 'http://localhost:8080';

// ==================== 商家数据分析接口 ====================

/**
 * 获取销售数据（订单量、营业额）
 * @param {Object} params - 查询参数
 * @param {String} params.startDate - 开始日期（可选）
 * @param {String} params.endDate - 结束日期（可选）
 * @returns {Promise}
 */
export const getSalesData = (params) => {
  return request(`${baseUrl}/merchant/analytics/sales`, {
    method: 'GET',
    data: params || {}
  });
};

/**
 * 获取评价数据分析
 * @returns {Promise}
 */
export const getRatingsData = () => {
  return request(`${baseUrl}/merchant/analytics/ratings`, {
    method: 'GET'
  });
};

/**
 * 获取热销商品排行榜
 * @param {Number} limit - 返回数量，默认10
 * @param {String} type - 类型：hot-热销, slow-滞销
 * @returns {Promise}
 */
export const getTopGoods = (limit = 10, type = 'hot') => {
  return request(`${baseUrl}/merchant/analytics/topGoods`, {
    method: 'GET',
    data: { limit, type }
  });
};

/**
 * 获取订单趋势数据
 * @param {String} type - 类型：day/week/month
 * @returns {Promise}
 */
export const getOrderTrend = (type = 'week') => {
  return request(`${baseUrl}/merchant/analytics/orderTrend`, {
    method: 'GET',
    data: { type }
  });
};

/**
 * 获取商家综合仪表盘数据
 * @returns {Promise}
 */
export const getDashboardData = () => {
  return request(`${baseUrl}/merchant/analytics/dashboard`, {
    method: 'GET'
  });
};

/**
 * 获取评价词云数据（高频关键词）
 * @param {Object} params - 可选的时间范围等参数
 * @param {String} params.startDate - 开始日期（可选）
 * @param {String} params.endDate - 结束日期（可选）
 * @returns {Promise}
 */
export const getWordCloud = (params = {}) => {
  return request(`${baseUrl}/merchant/analytics/wordCloud`, {
    method: 'GET',
    data: params
  });
};

