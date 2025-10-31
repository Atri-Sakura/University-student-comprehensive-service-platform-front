// 评价相关接口配置文件
import { request } from './api.js';

const baseUrl = 'http://localhost:8080/';

// 评价相关接口
export const evaluationAPI = {
  // 获取评价列表
  list: `${baseUrl}merchant/evaluation/list`,
  
  // 获取评价详情（需要传入 goodsEvaluationId）
  detail: (goodsEvaluationId) => `${baseUrl}merchant/evaluation/detail/${goodsEvaluationId}`,
  
  // 商家回复评价
  reply: `${baseUrl}merchant/evaluation/reply`
};

// 获取评价列表
export const getEvaluationList = (params = {}) => {
  return request(evaluationAPI.list, {
    method: 'GET',
    data: params
  });
};

// 获取评价详情
export const getEvaluationDetail = (goodsEvaluationId) => {
  return request(evaluationAPI.detail(goodsEvaluationId), {
    method: 'GET'
  });
};

// 商家回复评价
export const replyEvaluation = (goodsEvaluationId, replyContent) => {
  // 使用 URL 参数方式发送数据（后端使用 @RequestParam）
  // 注意：后端参数名是 merchantReply，不是 replyContent
  const url = `${evaluationAPI.reply}?goodsEvaluationId=${goodsEvaluationId}&merchantReply=${encodeURIComponent(replyContent)}`;
  return request(url, {
    method: 'POST'
  });
};

// 默认导出
export default {
  evaluationAPI,
  getEvaluationList,
  getEvaluationDetail,
  replyEvaluation
};

