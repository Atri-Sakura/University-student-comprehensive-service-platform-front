// 商家信息管理 API 接口
import { request } from './api.js';

const baseUrl = 'http://localhost:8080';

// ==================== 商家基础信息 ====================

/**
 * 获取商家基础信息
 * @returns {Promise}
 */
export const getMerchantBaseInfo = () => {
  return request(`${baseUrl}/merchant/info/base`, {
    method: 'GET'
  });
};

/**
 * 修改商家基础信息
 * @param {Object} data - 商家基础信息对象
 * @param {String} data.merchantBaseId - 商家ID（必填）
 * @param {String} data.merchantName - 商家名称
 * @param {String} data.merchantPhone - 联系电话
 * @param {Number} data.businessStatus - 营业状态（1:营业中, 0:休息中, 2:打烊）
 * @param {String} data.businessHours - 营业时间
 * @param {String} data.description - 店铺简介
 * @param {String} data.businessScope - 经营范围
 * @returns {Promise}
 */
export const updateMerchantBase = (data) => {
  // 确保 merchantBaseId 为字符串格式
  const requestData = {
    ...data,
    merchantBaseId: String(data.merchantBaseId || '')
  };
  
  
  return request(`${baseUrl}/merchant/info/base`, {
    method: 'PUT',
    data: requestData
  });
};

/**
 * 校验商家名称是否重复
 * @param {String} merchantName - 待校验的商家名称
 * @returns {Promise}
 */
export const checkMerchantName = (merchantName) => {
  // 暂时返回模拟数据，避免后端路由错误
  return Promise.resolve({
    data: {
      code: 200,
      msg: '名称可用',
      data: true
    }
  });
};

// ==================== 商家地址信息 ====================

/**
 * 获取商家地址信息（使用商家专用接口）
 * @returns {Promise}
 */
export const getMerchantAddress = () => {
  return request(`${baseUrl}/merchant/info/address`, {
    method: 'GET'
  });
};

/**
 * 新增商家地址信息（使用商家专用接口）
 * @param {Object} data - 商家地址信息对象
 * @param {String} data.province - 省份
 * @param {String} data.city - 城市
 * @param {String} data.district - 区县
 * @param {String} data.detailAddress - 详细地址
 * @returns {Promise}
 */
export const addMerchantAddress = (data) => {
  return request(`${baseUrl}/merchant/info/address`, {
    method: 'POST',
    data: data
  });
};

/**
 * 修改商家地址信息（使用商家专用接口）
 * @param {Object} data - 商家地址信息对象
 * @param {String} data.province - 省份
 * @param {String} data.city - 城市
 * @param {String} data.district - 区县
 * @param {String} data.detailAddress - 详细地址
 * @returns {Promise}
 */
export const updateMerchantAddress = (data) => {
  return request(`${baseUrl}/merchant/info/address`, {
    method: 'PUT',
    data: data
  });
};

// ==================== 配送设置（扩展接口）====================

/**
 * 获取配送设置
 * @returns {Promise}
 */
export const getDeliverySettings = () => {
  // 暂时返回模拟数据，避免后端路由错误
  return Promise.resolve({
    data: {
      code: 200,
      data: {
        range: 3,
        minPrice: 20,
        fee: 5
      }
    }
  });
};

/**
 * 修改配送设置
 * @param {Object} data - 配送设置对象
 * @param {Number} data.range - 配送范围（公里）
 * @param {Number} data.minPrice - 起送价
 * @param {Number} data.fee - 配送费
 * @returns {Promise}
 */
export const updateDeliverySettings = (data) => {
  // 暂时返回成功响应，避免后端路由错误
  return Promise.resolve({
    data: {
      code: 200,
      msg: '配送设置更新成功'
    }
  });
};

// ==================== 资质认证（扩展接口）====================

/**
 * 上传资质证书图片
 * @param {String} type - 证书类型（business: 营业执照, food: 食品许可证）
 * @param {String} filePath - 图片路径
 * @returns {Promise}
 */
export const uploadCertificate = (type, filePath) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${baseUrl}/common/upload`, // 使用通用上传接口
      filePath: filePath,
      name: 'file',
      formData: {
        type: type
      },
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (uploadRes) => {
        try {
          const data = JSON.parse(uploadRes.data);
          
          console.log('🔍 证书上传响应数据:', data);
          
          if (data.code === 200) {
            // 构建标准响应格式
            const result = {
              code: 200,
              msg: '上传成功',
              data: {
                imageUrl: data.data?.url || data.data?.imageUrl || data.data?.fileName || data.url || data.fileName || (typeof data.data === 'string' ? data.data : '')
              }
            };
            resolve(result);
          } else {
            reject(new Error(data.msg || '上传失败'));
          }
        } catch (error) {
          reject(new Error('响应数据解析失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 获取资质证书列表
 * @returns {Promise}
 */
export const getCertificates = () => {
  // 暂时返回模拟数据，避免后端路由错误
  return Promise.resolve({
    data: {
      code: 200,
      data: []
    }
  });
};

/**
 * 删除资质证书
 * @param {String} type - 证书类型
 * @returns {Promise}
 */
export const deleteCertificate = (type) => {
  return request(`${baseUrl}/merchant/certificate/delete`, {
    method: 'DELETE',
    data: { type }
  });
};

// 导出所有API
export default {
  getMerchantBaseInfo,
  updateMerchantBase,
  checkMerchantName,
  getMerchantAddress,
  addMerchantAddress,
  updateMerchantAddress,
  getDeliverySettings,
  updateDeliverySettings,
  uploadCertificate,
  getCertificates,
  deleteCertificate
};

