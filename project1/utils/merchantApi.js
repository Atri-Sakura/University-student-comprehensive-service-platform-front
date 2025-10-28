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
 * @param {Number} data.merchantBaseId - 商家ID（必填）
 * @param {String} data.merchantName - 商家名称
 * @param {String} data.merchantPhone - 联系电话
 * @param {Number} data.businessStatus - 营业状态（1:营业中, 0:休息中, 2:打烊）
 * @param {String} data.businessHours - 营业时间
 * @param {String} data.description - 店铺简介
 * @returns {Promise}
 */
export const updateMerchantBase = (data) => {
  return request(`${baseUrl}/merchant/info/base`, {
    method: 'PUT',
    data: data
  });
};

// ==================== 商家地址信息 ====================

/**
 * 获取商家地址信息
 * @returns {Promise}
 */
export const getMerchantAddress = () => {
  return request(`${baseUrl}/merchant/info/address`, {
    method: 'GET'
  });
};

/**
 * 修改商家地址信息
 * @param {Object} data - 商家地址信息对象
 * @param {Number} data.merchantAddressId - 地址ID（必填）
 * @param {String} data.address - 详细地址
 * @param {String} data.longitude - 经度
 * @param {String} data.latitude - 纬度
 * @param {String} data.contactName - 联系人
 * @param {String} data.contactPhone - 联系电话
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
  return request(`${baseUrl}/merchant/delivery/settings`, {
    method: 'GET'
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
  return request(`${baseUrl}/merchant/delivery/settings`, {
    method: 'PUT',
    data: data
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
      url: `${baseUrl}/merchant/certificate/upload`,
      filePath: filePath,
      name: 'file',
      formData: {
        type: type
      },
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (uploadRes) => {
        const data = JSON.parse(uploadRes.data);
        if (data.code === 200) {
          resolve(data);
        } else {
          reject(new Error(data.msg || '上传失败'));
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
  return request(`${baseUrl}/merchant/certificate/list`, {
    method: 'GET'
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
  getMerchantAddress,
  updateMerchantAddress,
  getDeliverySettings,
  updateDeliverySettings,
  uploadCertificate,
  getCertificates,
  deleteCertificate
};

