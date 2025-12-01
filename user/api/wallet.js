import http from './request.js';
import { safeStringifyId, processApiResponseIds, processApiRequestIds } from '@/utils/id-utils.js';

/**
 * 获取用户钱包信息
 */
export const getUserWallet = () => {
  // 先尝试从userId获取
  let userId = uni.getStorageSync('userId');
  
  // 如果没有userId，从userInfo中获取
  if (!userId) {
    const userInfo = uni.getStorageSync('userInfo');
    
    if (userInfo) {
      userId = userInfo.userBaseId || userInfo.userId || userInfo.id;
      if (userId) {
        // 保存到userId以便下次直接使用
        uni.setStorageSync('userId', userId);
      }
    }
  }
  
  if (!userId) {
    return Promise.reject(new Error('用户未登录'));
  }
  
  return http.get('/platform/wallet/list', { userBaseId: userId });
};

/**
 * 获取钱包余额
 * 后端通过token获取userId，无需传参
 */
export const getWalletBalance = () => {
  // 检查token是否存在
  const token = uni.getStorageSync('token');
  if (!token) {
    return Promise.reject(new Error('用户未登录'));
  }
  
  // 调用新接口：/user/walletRecord/getUserWalletBalance
  return http.get('/user/walletRecord/getUserWalletBalance');
};

/**
 * 获取钱包流水记录
 * 后端通过token获取userId，无需传参
 * @param {Object} params 查询参数（可选）
 */
export const getWalletRecords = (params = {}) => {
  // 检查token是否存在
  const token = uni.getStorageSync('token');
  if (!token) {
    return Promise.reject(new Error('用户未登录'));
  }
  
  // 调用新接口：/user/walletRecord/getUserWalletRecord
  return http.get('/user/walletRecord/getUserWalletRecord', params);
};

/**
 * 钱包充值
 * @param {Object} data 充值数据
 * @param {Number} data.amount 充值金额
 * @param {String} data.paymentMethod 支付方式
 */
export const rechargeWallet = (data) => {
  const processedData = processApiRequestIds(data, ['userWalletId']);
  
  console.log('API层 - 钱包充值:', processedData);
  
  return http.post('/user/wallet/recharge', processedData);
};

/**
 * 钱包提现
 * @param {Object} data 提现数据
 * @param {Number} data.amount 提现金额
 * @param {String} data.bankCard 银行卡号
 * @param {String} data.paymentPassword 支付密码
 */
export const withdrawWallet = (data) => {
  const processedData = processApiRequestIds(data, ['userWalletId']);
  
  console.log('API层 - 钱包提现:', processedData);
  
  return http.post('/user/wallet/withdraw', processedData);
};

/**
 * 验证支付密码
 * @param {String} password 支付密码
 */
export const verifyPaymentPassword = (password) => {
  return http.post('/user/wallet/verifyPassword', { password });
};

/**
 * 设置支付密码
 * @param {String} oldPayPassword 旧支付密码
 * @param {String} newPayPassword 新支付密码
 */
export const setPaymentPassword = (oldPayPassword, newPayPassword) => {
  const params = new URLSearchParams();
  params.append('oldPayPassword', oldPayPassword);
  params.append('newPayPassword', newPayPassword);
  
  return http.post('/user/walletRecord/setPayPassword', params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

/**
 * 获取钱包安全设置
 */
export const getWalletSecurity = () => {
  return http.get('/user/wallet/security');
};

/**
 * 更新钱包安全设置
 * @param {Object} data 安全设置数据
 */
export const updateWalletSecurity = (data) => {
  return http.put('/user/wallet/security', data);
};

/**
 * 冻结钱包
 */
export const freezeWallet = () => {
  return http.post('/user/walletRecord/freezeWallet');
};

/**
 * 解冻钱包
 */
export const unfreezeWallet = () => {
  return http.post('/user/walletRecord/unfreezeWallet');
};

export default {
  getUserWallet,
  getWalletBalance,
  getWalletRecords,
  rechargeWallet,
  withdrawWallet,
  verifyPaymentPassword,
  setPaymentPassword,
  getWalletSecurity,
  updateWalletSecurity,
  freezeWallet,
  unfreezeWallet
};
