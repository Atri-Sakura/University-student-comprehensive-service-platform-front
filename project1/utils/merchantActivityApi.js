// 商家活动管理 API 接口
import { request } from './api.js';

const baseUrl = 'http://localhost:8080';

/**
 * 获取商家活动列表
 * @param {Object} params - 查询参数
 * @param {Number} params.status - 活动状态（可选）
 * @returns {Promise}
 */
export const getActivityList = (params = {}) => {
  return request(`${baseUrl}/merchant/Activity/list`, {
    method: 'GET',
    data: params
  });
};

/**
 * 新增商家活动
 * @param {Object} merchantActivity - 活动信息
 * @param {String} merchantActivity.activityName - 活动名称
 * @param {String} merchantActivity.activityType - 活动类型
 * @param {String} merchantActivity.content - 活动内容
 * @param {String} merchantActivity.startTime - 开始时间
 * @param {String} merchantActivity.endTime - 结束时间
 * @param {Number} merchantActivity.status - 活动状态
 * @returns {Promise}
 */
export const addMerchantActivity = (merchantActivity) => {
  // 验证必要参数
  if (!merchantActivity || !merchantActivity.activityName) {
    console.error('缺少必要的活动名称参数');
    return Promise.reject(new Error('缺少必要的活动名称参数'));
  }
  
  // 添加商家基础ID
  const requestData = {
    ...merchantActivity,
    merchantBaseId: 3
  };
  
  return request(`${baseUrl}/merchant/Activity`, {
    method: 'POST',
    data: requestData
  }).catch(err => {
    throw err;
  });
};

/**
 * 获取活动详情
 * @param {String|Number} activityId - 活动ID
 * @returns {Promise}
 */
export const getActivityDetail = (activityId) => {
  // 确保活动ID是字符串类型
  const id = String(activityId || '').trim();
  
  // 验证ID格式
  if (!id || isNaN(id)) {
    return Promise.reject(new Error('无效的活动ID'));
  }
  
  // 构建请求URL
  const url = `${baseUrl}/merchant/Activity/${id}`;
  return request(url, {
    method: 'GET'
  });
};

/**
 * 删除活动
 * @param {Array<String|Number>} merchantActivityIds - 活动ID数组
 * @returns {Promise}
 */
export const deleteActivity = (merchantActivityIds) => {
  // 验证参数
  if (!Array.isArray(merchantActivityIds) || merchantActivityIds.length === 0) {
    return Promise.reject(new Error('无效的活动ID列表'));
  }
  
  console.log('调用deleteActivity接口，活动ID列表:', merchantActivityIds);
  
  // 使用第一个ID值
  const id = merchantActivityIds[0];
  
  // 构建URL
  const url = `${baseUrl}/merchant/Activity/${id}`;
  
  // 获取token并构建请求头
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = uni.getStorageSync('token');
  if (token && typeof token === 'string' && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  
  // 发送DELETE请求
  return request(url, {
    method: 'DELETE',
    header: headers
  });
};

/**
 * 新增活动
 * @param {Object} data - 活动数据
 * @returns {Promise}
 */
export const addActivity = (data) => {
  return request(`${baseUrl}/merchant/Activity`, {
    method: 'POST',
    data: data
  });
};

/**
 * 修改活动
 * @param {Object} data - 活动数据
 * @returns {Promise}
 */
export const updateActivity = function(data) {
  // 验证参数
  if (!data || !data.id) {
    console.error('缺少必要的活动ID参数');
    return Promise.reject(new Error('缺少必要的活动ID参数'));
  }
  
  const activityId = data.id;
  
  // 确保merchantBaseId存在
  if (!data.merchantBaseId) {
    data.merchantBaseId = 3;
  }
  
  // 构建URL
  const finalUrl = `${baseUrl}/merchant/Activity`;
  
  // 获取token
  const token = uni.getStorageSync('token');
  
  // 构建完整的请求选项
  const requestOptions = {
    method: 'PUT',
    data: { 
      ...data, 
      merchantActivityId: activityId,
      id: undefined
    },
    header: {
      'Content-Type': 'application/json'
    }
  };
  
  // 添加Authorization头
  if (token && typeof token === 'string' && token.trim()) {
    requestOptions.header['Authorization'] = `Bearer ${token.trim()}`;
  }
  
  // 执行请求
  return new Promise((resolve, reject) => {
    uni.request({
      url: finalUrl,
      ...requestOptions,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data || res);
        } else {
          reject(new Error(`请求失败: ${res.data?.message || res.errMsg || '未知错误'}`));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
};

// 导出所有活动相关API
export default {
  getActivityList,
  addMerchantActivity,
  getActivityDetail,
  deleteActivity,
  addActivity,
  updateActivity
};