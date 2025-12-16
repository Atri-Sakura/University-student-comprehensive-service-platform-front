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
 * 钱包充值（支付宝）
 * @param {Object} data 充值数据
 * @param {Number} data.amount 充值金额
 * @param {Number} data.payChannel 支付渠道（1-支付宝）
 */
export const rechargeWallet = (data) => {
  console.log('API层 - 钱包充值:', data);
  
  return http.post('/user/finance/recharge/alipay', {
    amount: data.amount,
    payChannel: data.payChannel || 1
  });
};

/**
 * 钱包提现（支付宝）
 * @param {Object} data 提现数据
 * @param {Number} data.amount 提现金额
 * @param {Number} data.payChannel 支付渠道（1-支付宝）
 * @param {String} data.payPassword 支付密码
 */
export const withdrawWallet = (data) => {
  console.log('API层 - 钱包提现:', data);
  
  return http.post('/user/finance/withdraw/alipay', {
    amount: data.amount,
    payChannel: data.payChannel || 1,
    passWord: data.payPassword || ''
  });
};

/**
 * 验证支付密码
 * 注意：由于密码在后端使用BCrypt加密存储，前端无法直接验证
 * 这里只检查用户是否设置了支付密码，实际验证由后端支付接口完成
 * @param {String} password 用户输入的支付密码
 * @returns {Promise<{code: number, msg: string, valid: boolean}>}
 */
export const verifyPaymentPassword = async (password) => {
  try {
    // 检查密码格式
    if (!password || password.length !== 6) {
      return { code: 500, msg: '支付密码为6位数字', valid: false };
    }
    
    // 从后端获取用户信息，检查是否设置了支付密码
    const result = await http.get('/user/info');
    if (result && result.code === 200 && result.data) {
      const storedPassword = result.data.payPassword;
      // 检查是否设置了支付密码
      if (!storedPassword) {
        return { code: 500, msg: '未设置支付密码', valid: false };
      }
      // 密码已设置，格式正确，允许提交到后端验证
      // 实际的密码验证由后端支付接口使用BCrypt完成
      return { code: 200, msg: '验证成功', valid: true };
    }
    return { code: 500, msg: '获取用户信息失败', valid: false };
  } catch (error) {
    console.error('验证支付密码失败:', error);
    return { code: 500, msg: '验证失败', valid: false };
  }
};

/**
 * 设置支付密码
 * @param {String} oldPayPassword 旧支付密码（首次设置时传空字符串）
 * @param {String} newPayPassword 新支付密码
 */
export const setPaymentPassword = (oldPayPassword, newPayPassword) => {
  // 明文传输，使用URL查询参数方式传递
  const url = `/user/walletRecord/setPayPassword?oldPayPassword=${encodeURIComponent(oldPayPassword || '')}&newPayPassword=${encodeURIComponent(newPayPassword)}`;
  return http.post(url, {});
};

/**
 * 检查用户是否已设置支付密码
 * 通过获取用户信息接口，判断payPassword字段是否为空
 * @returns {Promise<{code: number, data: {hasPaymentPassword: boolean}}>}
 */
export const checkPaymentPasswordStatus = async () => {
  try {
    // 调用用户信息接口获取用户数据
    const result = await http.get('/user/info');
    if (result && result.code === 200 && result.data) {
      // 判断payPassword字段是否有值
      const hasPaymentPassword = !!(result.data.payPassword && result.data.payPassword.length > 0);
      return {
        code: 200,
        data: {
          hasPaymentPassword: hasPaymentPassword
        }
      };
    }
    return {
      code: 200,
      data: {
        hasPaymentPassword: false
      }
    };
  } catch (error) {
    console.error('检查支付密码状态失败:', error);
    // 出错时返回默认值
    return {
      code: 200,
      data: {
        hasPaymentPassword: false
      }
    };
  }
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
  checkPaymentPasswordStatus,
  getWalletSecurity,
  updateWalletSecurity,
  freezeWallet,
  unfreezeWallet
};
