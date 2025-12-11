// 商家财务管理 API 接口
import { 请求 } from './api.js';

const baseUrl = 'http://localhost:8080';

/**
 * 获取提现页总览信息
 * @returns {Promise} 返回包含可用余额、今日收入、结算中金额、提现费率等信息
 */
export const getWithdrawOverview = () => {
  return 请求(`${baseUrl}/api/merchant/finance/withdraw/overview`, {
    method: 'GET'
  });
};

/**
 * 获取财务概览数据
 * @returns {Promise}
 */
export const getFinancialOverview = () => {
  return 请求(`${baseUrl}/merchant/finance/overview`, {
    method: 'GET'
  });
};

/**
 * 获取商家今日收入统计
 * @returns {Promise}
 */
export const getTodayIncome = () => {
  return 请求(`${baseUrl}/api/merchant/finance/income/today`, {
    method: 'GET'
  });
};

/**
 * 获取商家钱包信息
 * @returns {Promise}
 */
export const getMerchantWallet = () => {
  return 请求(`${baseUrl}/api/merchant/finance/wallet`, {
    method: 'GET'
  });
};

/**
 * 初始化商家钱包
 * @returns {Promise}
 */
export const initMerchantWallet = () => {
  // 生成8位数字的钱包ID
  const merchantWalletId = Math.floor(10000000 + Math.random() * 90000000);
  
  return 请求(`${baseUrl}/merchant/info/initWallet?merchantWalletId=${merchantWalletId}`, {
    method: 'POST'
  });
};

/**
 * 获取交易记录列表
 * @param {Object} params - 查询参数
 * @param {String} params.dateRange - 日期范围类型(today/week/month/custom)
 * @param {String} [params.startDate] - 自定义开始日期(yyyy-MM-dd)
 * @param {String} [params.endDate] - 自定义结束日期(yyyy-MM-dd)
 * @param {Number} [params.pageNum] - 页码
 * @param {Number} [params.pageSize] - 每页数量
 * @returns {Promise}
 */
export const getTransactionList = (params = {}) => {
  return 请求(`${baseUrl}/merchant/finance/transactions`, {
    method: 'GET',
    data: params
  });
};

/**
 * 获取交易详情
 * @param {String|Number} orderId - 订单ID
 * @returns {Promise}
 */
export const getTransactionDetail = (orderId) => {
  // 确保订单ID是字符串类型
  const id = String(orderId || '').trim();
  
  // 验证ID格式
  if (!id) {
    return Promise.reject(new Error('无效的订单ID'));
  }
  
  // 构建请求URL
  const url = `${baseUrl}/merchant/finance/transaction/${id}`;
  return 请求(url, {
    method: 'GET'
  });
};

/**
 * 查询当前商家钱包流水列表（含订单详情）
 * @param {Object} params - 查询参数
 * @param {String} [params.flowType] - 流水类型
 * @param {String} [params.orderNo] - 订单号
 * @param {String} [params.startTime] - 开始时间
 * @param {String} [params.endTime] - 结束时间
 * @returns {Promise}
 */
export const getWalletFlowListWithOrder = (params = {}) => {
  return 请求(`${baseUrl}/merchant/walletFlow/listWithOrder`, {
    method: 'GET',
    data: params
  });
};

/**
 * 获取提现账户列表
 * @returns {Promise} 返回账户列表数据，包含accountId、accountType、accountName、accountNumber、bankName等信息
 */
export const getWithdrawalAccounts = () => {
  return 请求(`${baseUrl}/api/merchant/finance/withdraw/account/list`, {
    method: 'GET'
  });
};

/**
 * 删除商家提现账户
 * @param {String|Number} accountId - 账户ID
 * @returns {Promise}
 */
export const deleteWithdrawAccount = (accountId) => {
  // 验证必要参数
  if (!accountId && accountId !== 0) {
    return Promise.reject(new Error('无效的账户ID'));
  }
  
  // 构建请求URL，将账户ID添加到路径中
  const url = `${baseUrl}/api/merchant/finance/withdraw/account/${accountId}`;
  
  return 请求(url, {
    method: 'DELETE'
  });
};

/**
 * 设置提现账户为默认账户
 * @param {String|Number} accountId - 账户ID
 * @returns {Promise}
 */
export const setDefaultWithdrawAccount = (accountId) => {
  // 验证必要参数
  if (!accountId && accountId !== 0) {
    return Promise.reject(new Error('无效的账户ID'));
  }
  
  // 构建请求URL，将账户ID添加到路径中
  const url = `${baseUrl}/api/merchant/finance/withdraw/account/${accountId}/default`;
  
  return 请求(url, {
    method: 'PUT'
  });
};

/**
 * 添加提现账户
 * @param {Object} accountData - 账户信息
 * @param {String} accountData.accountName - 账户名称
 * @param {String} accountData.accountType - 账户类型(alipay/wechat/bank)
 * @param {String} accountData.accountNumber - 账号
 * @param {String} [accountData.bankName] - 银行名称(当accountType为bank时必填)
 * @param {Number} [accountData.isDefault] - 是否设为默认账户(1是0否)
 * @param {String} [accountData.remark] - 备注
 * @returns {Promise}
 */
export const addWithdrawalAccount = (accountData) => {
  // 验证必要参数
  if (!accountData || !accountData.accountName || !accountData.accountType || !accountData.accountNumber) {
    return Promise.reject(new Error('缺少必要的账户信息参数'));
  }
  
  // 验证银行账户特殊参数
  if (accountData.accountType === 'bank' && !accountData.bankName) {
    return Promise.reject(new Error('银行账户需要提供银行名称'));
  }
  
  return 请求(`${baseUrl}/api/merchant/finance/withdraw/account/add`, {
    method: 'POST',
    data: accountData
  });
};

/**
 * 申请提现 (旧接口，保留兼容)
 * @param {Object} withdrawalData - 提现信息
 * @param {Number} withdrawalData.amount - 提现金额
 * @param {String} withdrawalData.accountId - 提现账户ID
 * @param {String} [withdrawalData.remark] - 备注
 * @returns {Promise}
 */
export const applyWithdrawal = (withdrawalData) => {
  // 验证必要参数
  if (!withdrawalData || !withdrawalData.amount || !withdrawalData.accountId) {
    return Promise。reject(new 错误('缺少必要的提现信息参数'));
  }
  
  // 验证金额格式
  if (typeof withdrawalData.amount !== 'number' || withdrawalData.amount <= 0) {
    return Promise。reject(new 错误('提现金额必须为大于0的数字'));
  }
  
  return 请求(`${baseUrl}/merchant/finance/withdraw`， {
    method: 'POST',
    data: withdrawalData
  });
};

/**
 * 生成UUID作为幂等性键
 * @returns {String} 生成的UUID
 */
const generateIdempotentKey = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'。替换(/[xy]/g， function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * 申请提现 (新接口，支持幂等性)
 * @param {Object} withdrawalData - 提现信息
 * @param {Number} withdrawalData.accountId - 提现账户ID
 * @param {Number} withdrawalData.amount - 提现金额
 * @param {String} [withdrawalData.remark] - 备注
 * @returns {Promise} 返回提现申请结果
 */
export const applyWithdraw = (withdrawalData) => {
  // 验证必要参数
  if (!withdrawalData || !withdrawalData。accountId || !withdrawalData。amount) {
    return Promise。reject(new 错误('缺少必要的提现信息参数'));
  }
  
  // 验证金额格式
  if (typeof withdrawalData。amount !== 'number' || withdrawalData.amount <= 0) {
    return Promise。reject(new 错误('提现金额必须为大于0的数字'));
  }
  
  // 生成幂等性键，防止重复提交
  const idempotentKey = generateIdempotentKey();
  
  // 构建请求数据
  const requestData = {
    accountId: withdrawalData.accountId,
    amount: withdrawalData。amount,
    idempotentKey: idempotentKey
  };
  
  // 如果有备注，添加到请求数据中
  if (withdrawalData。remark) {
    requestData。remark = withdrawalData。remark;
  }
  
  return 请求(`${baseUrl}/api/merchant/finance/withdraw/apply`， {
    method: 'POST'，
    data: requestData
  });
};

/**
 * 获取提现记录
 * @param {Object} params - 查询参数
 * @param {String} [params.status] - 提现状态(processing/completed/failed)
 * @param {Number} [params.pageNum] - 页码
 * @param {Number} [params.pageSize] - 每页数量
 * @returns {Promise}
 */
export const getWithdrawalRecords = (params = {}) => {
  return 请求(`${baseUrl}/merchant/finance/withdrawals`， {
    method: 'GET'，
    data: params
  });
};

/**
 * 获取商家提现记录列表
 * @param {Object} params - 查询参数
 * @param {String} [params.status] - 提现状态(SUCCESS等)
 * @returns {Promise} 返回提现记录列表数据
 */
export const getWithdrawRecordList = (params = {}) => {
  return 请求(`${baseUrl}/api/merchant/finance/withdraw/records`， {
    method: 'GET'，
    data: params
  });
};

/**
 * 获取提现详情
 * @param {String|Number} withdrawalId - 提现记录ID
 * @returns {Promise}
 */
export const getWithdrawalDetail = (withdrawalId) => {
  // 确保提现记录ID是字符串类型
  const id = String(withdrawalId || '').trim();
  
  // 验证ID格式
  if (!id) {
    return Promise.reject(new Error('无效的提现记录ID'));
  }
  
  // 构建请求URL
  const url = `${baseUrl}/merchant/finance/withdrawal/${id}`;
  return 请求(url, {
    method: 'GET'
  });
};

/**
 * 取消提现申请
 * @param {String|Number} withdrawalId - 提现记录ID
 * @returns {Promise}
 */
export const cancelWithdrawal = (withdrawalId) => {
  // 确保提现记录ID是字符串类型
  const id = String(withdrawalId || '').trim();
  
  // 验证ID格式
  if (!id) {
    return Promise.reject(new Error('无效的提现记录ID'));
  }
  
  return 请求(`${baseUrl}/merchant/finance/withdraw/cancel`, {
    method: 'POST',
    data: { withdrawalId: id }
  });
};

/**
 * 获取提现手续费率
 * @returns {Promise}
 */
export const getWithdrawalFeeRate = () => {
  return 请求(`${baseUrl}/merchant/finance/withdraw/fee-rate`, {
    method: 'GET'
  });
};

/**
 * 打印小票
 * @param {String|Number} orderId - 订单ID
 * @returns {Promise}
 */
export const printReceipt = (orderId) => {
  // 确保订单ID是字符串类型
  const id = String(orderId || '').trim();
  
  // 验证ID格式
  if (!id) {
    return Promise.reject(new Error('无效的订单ID'));
  }
  
  return 请求(`${baseUrl}/merchant/finance/receipt/print`, {
    method: 'POST',
    data: { orderId: id }
  });
};

/**
 * 获取提现预估结果
 * @param {Number} amount - 提现金额
 * @returns {Promise} 返回预估的手续费和实际到账金额
 */
export const previewWithdraw = (amount) => {
  // 验证必要参数
  if (amount === undefined || amount === null) {
    return Promise.reject(new Error('缺少必要的提现金额参数'));
  }
  
  // 验证金额格式
  if (typeof amount !== 'number' || amount <= 0) {
    return Promise.reject(new Error('提现金额必须为大于0的数字'));
  }
  
  // 由于后端使用@RequestParam，需要将amount作为查询参数发送
  return 请求(`${baseUrl}/api/merchant/finance/withdraw/preview?amount=${amount}`, {
    method: 'POST'
  });
};

// 导出API对象
export const merchantFinanceApi = {
  getFinancialOverview,
  getTodayIncome,
  getMerchantWallet,
  initMerchantWallet,
  getTransactionList,
  getTransactionDetail,
  getWithdrawalAccounts,
  getWalletFlowListWithOrder,
  addWithdrawalAccount,
  applyWithdrawal,
  applyWithdraw,
  getWithdrawalRecords,
  getWithdrawalDetail,
  cancelWithdrawal,
  getWithdrawalFeeRate,
  printReceipt,
  previewWithdraw,
  getWithdrawRecordList
};

/**
 * 处理退款
 * @param {Object} refundData - 退款信息
 * @param {String|Number} refundData.orderId - 订单ID
 * @param {Number} refundData.refundAmount - 退款金额
 * @param {String} [refundData.refundReason] - 退款原因
 * @returns {Promise}
 */
export const handleRefund = (refundData) => {
  // 验证必要参数
  if (!refundData || !refundData.orderId || !refundData.refundAmount) {
    return Promise.reject(new Error('缺少必要的退款信息参数'));
  }
  
  // 验证金额格式
  if (typeof refundData.refundAmount !== 'number' || refundData.refundAmount <= 0) {
    return Promise.reject(new Error('退款金额必须为大于0的数字'));
  }
  
  return 请求(`${baseUrl}/merchant/finance/order/refund`, {
    method: 'POST',
    data: refundData
  });
};

// 导出所有财务相关API
export default {
  getFinancialOverview,
  getTodayIncome,
  getTransactionList,
  getTransactionDetail,
  getWalletFlowListWithOrder,
  getWithdrawalAccounts,
  addWithdrawalAccount,
  applyWithdrawal,
  applyWithdraw,
  getWithdrawalRecords,
  getWithdrawalDetail,
  cancelWithdrawal,
  getWithdrawalFeeRate,
  printReceipt,
  handleRefund,
  previewWithdraw,
  getWithdrawRecordList
};
