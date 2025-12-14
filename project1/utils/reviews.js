// 评价相关接口配置文件
import { request } from './api.js';

const baseUrl = 'http://localhost:8080';

// 评价相关接口（使用新的 /merchant/evaluation/manage 路径）
export const evaluationAPI = {
  // 获取评价列表（支持分页和高级筛选）
  list: `${baseUrl}/merchant/evaluation/manage/list`,
  
  // 获取评价统计信息
  statistics: `${baseUrl}/merchant/evaluation/manage/statistics`,
  
  // 获取评价详情（需要传入 merchantEvaluationId）
  detail: (merchantEvaluationId) => `${baseUrl}/merchant/evaluation/manage/${merchantEvaluationId}`,
  
  // 商家回复评价
  reply: `${baseUrl}/merchant/evaluation/manage/reply`
};

/**
 * 获取评价列表（支持分页和高级筛选）
 * @param {Object} params - 查询参数
 * @param {Number} params.pageNum - 当前页码，默认1
 * @param {Number} params.pageSize - 每页显示数量，默认10
 * @param {Number} params.rating - 评分筛选（1-5分，null表示全部）
 * @param {Number} params.hasContent - 是否只看有内容的评价：0-全部 1-只看有内容
 * @param {Number} params.hasImages - 是否只看有图片的评价：0-全部 1-只看有图片
 * @param {Number} params.replyStatus - 回复状态：0-未回复 1-已回复 null-全部
 * @param {Number} params.sortType - 排序方式：1-最新评价 2-评分最高 3-评分最低
 * @param {String} params.orderByColumn - 排序列名
 * @param {String} params.isAsc - 排序方向：asc/desc
 * @returns {Promise}
 */
export const getEvaluationList = (params = {}) => {
  // 设置默认值
  const queryParams = {
    pageNum: params.pageNum || 1,
    pageSize: params.pageSize || 10,
    ...params
  };
  
  // 移除 undefined 和 null 的筛选参数（除了 rating 可能为 null）
  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] === undefined || (queryParams[key] === null && key !== 'rating')) {
      delete queryParams[key];
    }
  });
  
  return request(evaluationAPI.list, {
    method: 'GET',
    data: queryParams
  });
};

/**
 * 获取评价统计信息
 * @returns {Promise}
 */
export const getEvaluationStatistics = () => {
  return request(evaluationAPI.statistics, {
    method: 'GET'
  });
};

/**
 * 获取评价详情
 * @param {String|Number} merchantEvaluationId - 评价ID
 * @returns {Promise}
 */
export const getEvaluationDetail = (merchantEvaluationId) => {
  return request(evaluationAPI.detail(String(merchantEvaluationId)), {
    method: 'GET'
  });
};

/**
 * 商家回复评价
 * @param {String|Number} merchantEvaluationId - 评价ID
 * @param {String} merchantReply - 回复内容（1-500个字符）
 * @returns {Promise}
 */
export const replyEvaluation = (merchantEvaluationId, merchantReply) => {
  return request(evaluationAPI.reply, {
    method: 'POST',
    data: {
      merchantEvaluationId: String(merchantEvaluationId),
      merchantReply: merchantReply
    }
  });
};

// 默认导出
export default {
  evaluationAPI,
  getEvaluationList,
  getEvaluationStatistics,
  getEvaluationDetail,
  replyEvaluation
};

