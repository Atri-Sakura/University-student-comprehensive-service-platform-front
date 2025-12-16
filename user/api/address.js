import http from './request.js';
import { safeStringifyId, processApiRequestIds } from '@/utils/id-utils.js';

/**
 * 获取地址列表
 */
export const getAddressList = () => {
  return http.get('/user/address/list');
};

/**
 * 新增地址
 * @param {Object} addressData 地址数据
 */
export const addAddress = (addressData) => {
  return http.post('/user/address/add', addressData);
};

/**
 * 更新地址
 * @param {Object} addressData 地址数据
 */
export const updateAddress = (addressData) => {
  // 使用ID处理工具确保大整数安全传递
  const processedData = processApiRequestIds(addressData, ['userAddressId']);
  return http.put('/user/address/edit', processedData);
};

/**
 * 获取地址详情
 * @param {String|Number} userAddressId 地址ID
 */
export const getAddressDetail = (userAddressId) => {
  const safeId = safeStringifyId(userAddressId);
  console.log('API层 - 获取地址详情ID:', safeId, '原始ID:', userAddressId);
  return http.get(`/user/address/detail/${safeId}`);
};

/**
 * 删除地址
 * @param {Object} data 包含地址ID的数据
 */
export const deleteAddress = (data) => {
  // 使用ID处理工具确保安全处理
  const processedData = processApiRequestIds(data, ['userAddressId']);
  const addressId = safeStringifyId(processedData.userAddressId);
  
  console.log('API层 - 删除地址ID:', addressId, '原始ID:', data.userAddressId);
  console.log('ID类型:', typeof addressId, '字符串长度:', addressId.length);
  console.log('处理后的数据:', processedData);
  
  // 后端期望Long[]，发送字符串数组，Spring Boot会自动转换
  return http.request({
    url: '/user/address/delete',
    method: 'DELETE',
    data: [addressId]
  });
};

/**
 * 设置默认地址
 * @param {String|Number} userAddressId 地址ID
 */
export const setDefaultAddress = (userAddressId) => {
  const safeId = safeStringifyId(userAddressId);
  console.log('API层 - 设置默认地址ID:', safeId, '原始ID:', userAddressId);
  return http.put(`/user/address/setDefault/${safeId}`, {});
};

export default {
  getAddressList,
  addAddress,
  updateAddress,
  getAddressDetail,
  deleteAddress,
  setDefaultAddress
};
