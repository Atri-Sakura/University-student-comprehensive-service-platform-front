// 商家财务管理 API 接口
import { request } from './api.js';

const baseUrl = 'http://localhost:8080';

export const getWithdrawOverview = () => request(`${baseUrl}/api/merchant/finance/withdraw/overview`, { method: 'GET' });

export const getFinancialOverview = () => request(`${baseUrl}/merchant/finance/overview`, { method: 'GET' });

export const getTodayIncome = () => request(`${baseUrl}/api/merchant/finance/income/today`, { method: 'GET' });

export const getMerchantWallet = () => request(`${baseUrl}/api/merchant/finance/wallet`, { method: 'GET' });

export const initMerchantWallet = () => {
  const merchantWalletId = Math.floor(10000000 + Math.random() * 90000000);
  return request(`${baseUrl}/merchant/info/initWallet?merchantWalletId=${merchantWalletId}`, { method: 'POST' });
};

export const getTransactionList = (params = {}) => request(`${baseUrl}/merchant/finance/transactions`, {
  method: 'GET',
  data: params
});

export const getTransactionDetail = (orderId) => {
  const id = String(orderId || '').trim();
  if (!id) return Promise.reject(new Error('无效的订单ID'));
  return request(`${baseUrl}/merchant/finance/transaction/${id}`, { method: 'GET' });
};

// 新增：获取钱包流水（含订单详情）
export const getWalletFlowListWithOrder = (params = {}) => request(`${baseUrl}/merchant/walletFlow/listWithOrder`, {
  method: 'GET',
  data: params
});

export const getWithdrawalAccounts = () => request(`${baseUrl}/api/merchant/finance/withdraw/account/list`, { method: 'GET' });

export const deleteWithdrawAccount = (accountId) => {
  if (!accountId && accountId !== 0) return Promise.reject(new Error('无效的账户ID'));
  return request(`${baseUrl}/api/merchant/finance/withdraw/account/${accountId}`, { method: 'DELETE' });
};

export const setDefaultWithdrawAccount = (accountId) => {
  if (!accountId && accountId !== 0) return Promise.reject(new Error('无效的账户ID'));
  return request(`${baseUrl}/api/merchant/finance/withdraw/account/${accountId}/default`, { method: 'PUT' });
};

export const addWithdrawalAccount = (accountData) => {
  if (!accountData || !accountData.accountName || !accountData.accountType || !accountData.accountNumber) {
    return Promise.reject(new Error('缺少必要的账户信息参数'));
  }
  if (accountData.accountType === 'bank' && !accountData.bankName) {
    return Promise.reject(new Error('银行账户需要提供银行名称'));
  }
  return request(`${baseUrl}/api/merchant/finance/withdraw/account/add`, {
    method: 'POST',
    data: accountData
  });
};

export const applyWithdrawal = (withdrawalData) => {
  if (!withdrawalData || !withdrawalData.amount || !withdrawalData.accountId) {
    return Promise.reject(new Error('缺少必要的提现信息参数'));
  }
  if (typeof withdrawalData.amount !== 'number' || withdrawalData.amount <= 0) {
    return Promise.reject(new Error('提现金额必须为大于0的数字'));
  }
  return request(`${baseUrl}/merchant/finance/withdraw`, { method: 'POST', data: withdrawalData });
};

const generateIdempotentKey = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0;
  const v = c === 'x' ? r : (r & 0x3 | 0x8);
  return v.toString(16);
});

export const applyWithdraw = (withdrawalData) => {
  if (!withdrawalData || !withdrawalData.accountId || !withdrawalData.amount) {
    return Promise.reject(new Error('缺少必要的提现信息参数'));
  }
  if (typeof withdrawalData.amount !== 'number' || withdrawalData.amount <= 0) {
    return Promise.reject(new Error('提现金额必须为大于0的数字'));
  }
  const requestData = {
    accountId: withdrawalData.accountId,
    amount: withdrawalData.amount,
    idempotentKey: generateIdempotentKey()
  };
  if (withdrawalData.remark) requestData.remark = withdrawalData.remark;
  return request(`${baseUrl}/api/merchant/finance/withdraw/apply`, { method: 'POST', data: requestData });
};

export const getWithdrawalRecords = (params = {}) => request(`${baseUrl}/merchant/finance/withdrawals`, {
  method: 'GET',
  data: params
});

export const getWithdrawRecordList = (params = {}) => request(`${baseUrl}/api/merchant/finance/withdraw/records`, {
  method: 'GET',
  data: params
});

export const getWithdrawalDetail = (withdrawalId) => {
  const id = String(withdrawalId || '').trim();
  if (!id) return Promise.reject(new Error('无效的提现记录ID'));
  return request(`${baseUrl}/merchant/finance/withdrawal/${id}`, { method: 'GET' });
};

export const cancelWithdrawal = (withdrawalId) => {
  const id = String(withdrawalId || '').trim();
  if (!id) return Promise.reject(new Error('无效的提现记录ID'));
  return request(`${baseUrl}/merchant/finance/withdraw/cancel`, {
    method: 'POST',
    data: { withdrawalId: id }
  });
};

export const getWithdrawalFeeRate = () => request(`${baseUrl}/merchant/finance/withdraw/fee-rate`, { method: 'GET' });

export const printReceipt = (orderId) => {
  const id = String(orderId || '').trim();
  if (!id) return Promise.reject(new Error('无效的订单ID'));
  return request(`${baseUrl}/merchant/finance/receipt/print`, {
    method: 'POST',
    data: { orderId: id }
  });
};

export const previewWithdraw = (amount) => {
  if (amount === undefined || amount === null) {
    return Promise.reject(new Error('缺少必要的提现金额参数'));
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return Promise.reject(new Error('提现金额必须为大于0的数字'));
  }
  return request(`${baseUrl}/api/merchant/finance/withdraw/preview?amount=${amount}`, { method: 'POST' });
};

export const handleRefund = (refundData) => {
  if (!refundData || !refundData.orderId || !refundData.refundAmount) {
    return Promise.reject(new Error('缺少必要的退款信息参数'));
  }
  if (typeof refundData.refundAmount !== 'number' || refundData.refundAmount <= 0) {
    return Promise.reject(new Error('退款金额必须为大于0的数字'));
  }
  return request(`${baseUrl}/merchant/finance/order/refund`, { method: 'POST', data: refundData });
};

export const merchantFinanceApi = {
  getFinancialOverview,
  getTodayIncome,
  getMerchantWallet,
  initMerchantWallet,
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
  previewWithdraw,
  getWithdrawRecordList
};

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

