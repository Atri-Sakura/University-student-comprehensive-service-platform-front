/**
 * ID修复助手工具
 * 专门处理已知的ID精度问题
 */

/**
 * 修复已知的错误ID
 * @param {string|number} id 可能有问题的ID
 * @returns {string} 修复后的正确ID
 */
export function fixKnownId(id) {
  const idStr = String(id);
  
  // 已知的错误ID映射表
  const idFixMap = {
    '781059227119517700': '781059227119517696', // 主要的精度丢失问题
    // 可以在这里添加更多的映射
  };
  
  if (idFixMap[idStr]) {
    return idFixMap[idStr];
  }
  
  return idStr;
}

/**
 * 批量修复ID数组
 * @param {Array} ids ID数组
 * @returns {Array} 修复后的ID数组
 */
export function fixIdArray(ids) {
  if (!Array.isArray(ids)) {
    return ids;
  }
  
  return ids.map(id => fixKnownId(id));
}

/**
 * 修复对象中的ID字段
 * @param {Object} obj 包含ID字段的对象
 * @param {Array} idFields 需要修复的ID字段名数组
 * @returns {Object} 修复后的对象
 */
export function fixObjectIds(obj, idFields = ['userAddressId', 'id', 'userBaseId']) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const fixed = { ...obj };
  
  idFields.forEach(field => {
    if (fixed[field]) {
      fixed[field] = fixKnownId(fixed[field]);
    }
  });
  
  return fixed;
}

export default {
  fixKnownId,
  fixIdArray,
  fixObjectIds
};
