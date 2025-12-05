import http from './request.js';

/**
 * 查询我的反馈列表
 * @param {Object} params 查询参数 { pageNum, pageSize, status, type }
 */
export const getFeedbackList = (params = {}) => {
  return http.get('/user/feedback/list', params);
};

/**
 * 查询反馈详情
 * @param {String} feedbackId 反馈ID
 */
export const getFeedbackDetail = (feedbackId) => {
  return http.get(`/user/feedback/${feedbackId}`);
};

/**
 * 新增反馈
 * @param {Object} data 反馈信息 { feedbackTitle, feedbackContent, feedbackType, feedbackContact }
 */
export const addFeedback = (data) => {
  return http.post('/user/feedback', data);
};

/**
 * 修改反馈
 * @param {Object} data 反馈信息 { feedbackId, feedbackTitle, feedbackContent, feedbackType, feedbackContact }
 */
export const updateFeedback = (data) => {
  return http.put('/user/feedback', data);
};

/**
 * 删除反馈（支持批量）
 * @param {String} feedbackIds 反馈ID，多个用逗号分隔
 */
export const deleteFeedback = (feedbackIds) => {
  return http.del(`/user/feedback/${feedbackIds}`);
};

export default {
  getFeedbackList,
  getFeedbackDetail,
  addFeedback,
  updateFeedback,
  deleteFeedback
};
