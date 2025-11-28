/**
 * ID处理工具类
 * 解决JavaScript大整数精度丢失问题
 */

/**
 * 检查是否为大整数（超出安全范围）
 * @param {*} value 要检查的值
 * @returns {boolean} 是否为大整数
 */
export function isBigInteger(value) {
  if (typeof value === 'number') {
    return value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER;
  }
  return false;
}

/**
 * 安全地转换ID为字符串
 * @param {*} id 要转换的ID
 * @returns {string} 字符串形式的ID
 */
export function safeStringifyId(id) {
  if (id === null || id === undefined) {
    return '';
  }
  
  if (typeof id === 'string') {
    return id;
  }
  
  if (typeof id === 'number') {
    if (isBigInteger(id)) {
      console.warn('ID超出安全整数范围，可能存在精度问题:', id);
    }
    return String(id);
  }
  
  return String(id);
}

/**
 * 安全地解析ID为数字（仅在安全范围内）
 * @param {*} id 要解析的ID
 * @returns {number|string} 如果在安全范围内返回数字，否则返回字符串
 */
export function safeParseId(id) {
  if (id === null || id === undefined) {
    return null;
  }
  
  const stringId = String(id);
  const numId = Number(stringId);
  
  // 如果转换后的数字超出安全范围，返回字符串
  if (isBigInteger(numId)) {
    return stringId;
  }
  
  return numId;
}

/**
 * 处理API响应中的ID字段
 * @param {Object} data 响应数据
 * @param {Array<string>} idFields ID字段名数组
 * @returns {Object} 处理后的数据
 */
export function processApiResponseIds(data, idFields = ['id', 'userAddressId', 'userBaseId']) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  // 如果是数组，递归处理每个元素
  if (Array.isArray(data)) {
    return data.map(item => processApiResponseIds(item, idFields));
  }
  
  // 处理对象
  const processedData = { ...data };
  
  idFields.forEach(field => {
    if (processedData.hasOwnProperty(field)) {
      processedData[field] = safeStringifyId(processedData[field]);
    }
  });
  
  return processedData;
}

/**
 * 处理API请求中的ID字段
 * @param {Object} data 请求数据
 * @param {Array<string>} idFields ID字段名数组
 * @returns {Object} 处理后的数据
 */
export function processApiRequestIds(data, idFields = ['id', 'userAddressId', 'userBaseId']) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const processedData = { ...data };
  
  idFields.forEach(field => {
    if (processedData.hasOwnProperty(field)) {
      // 对于请求，我们保持字符串格式，让后端处理类型转换
      processedData[field] = safeStringifyId(processedData[field]);
    }
  });
  
  return processedData;
}

/**
 * 日志记录大整数问题
 * @param {string} context 上下文信息
 * @param {*} id 问题ID
 */
export function logBigIntegerIssue(context, id) {
  console.group(`🔢 大整数精度问题 - ${context}`);
  console.log('问题ID:', id);
  console.log('ID类型:', typeof id);
  console.log('是否超出安全范围:', isBigInteger(id));
  console.log('MAX_SAFE_INTEGER:', Number.MAX_SAFE_INTEGER);
  console.log('建议解决方案: 使用字符串形式处理此ID');
  console.groupEnd();
}

export default {
  isBigInteger,
  safeStringifyId,
  safeParseId,
  processApiResponseIds,
  processApiRequestIds,
  logBigIntegerIssue
};
