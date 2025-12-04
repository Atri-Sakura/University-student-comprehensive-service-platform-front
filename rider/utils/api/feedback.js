import { request } from '../api.js'

/**
 * 获取反馈详情
 * @param {number} feedbackId 反馈ID
 */
export async function getFeedbackInfo(feedbackId) {
  return request({
    url: `/rider/feedback/${feedbackId}`,
    method: 'GET'
  })
}

/**
 * 新增反馈
 * @param {Object} feedbackData 反馈数据
 */
export async function addFeedback(feedbackData) {
  return request({
    url: '/rider/feedback',
    method: 'POST',
    data: feedbackData
  })
}

export default {
  getFeedbackInfo,
  addFeedback
}
