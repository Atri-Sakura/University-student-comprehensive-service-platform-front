import http from './request.js'

/**
 * 设备管理相关API
 */

/**
 * 查询设备列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页大小
 * @param {string} params.deviceType 设备类型（可选）
 * @param {string} params.status 设备状态（可选）
 */
export const getDeviceList = (params = {}) => {
  const queryParams = {
    pageNum: params.pageNum || 1,
    pageSize: params.pageSize || 10,
    ...params
  }
  
  // 构建查询字符串
  const queryString = Object.keys(queryParams)
    .filter(key => queryParams[key] !== undefined && queryParams[key] !== '')
    .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
    .join('&')
  
  const url = queryString ? `/user/device/list?${queryString}` : '/user/device/list'
  
  return http.get(url)
}

/**
 * 查询单个设备信息
 * @param {string|number} id 设备ID
 */
export const getDeviceInfo = (id) => {
  return http.get(`/user/device/${id}`)
}

/**
 * 设备删除
 * @param {string|number} id 设备ID
 */
export const deleteDevice = (id) => {
  return http.del(`/user/device/${id}`)
}

/**
 * 批量删除设备
 * @param {Array} ids 设备ID数组
 */
export const batchDeleteDevices = (ids) => {
  return http.del('/user/device/batch', { ids })
}

/**
 * 分类查询设备
 * @param {string} category 设备分类
 */
export const getDevicesByCategory = (category) => {
  return http.get(`/user/device/category?category=${encodeURIComponent(category)}`)
}

/**
 * 查看当前登录设备
 */
export const getCurrentDevice = () => {
  return http.get('/user/device/current')
}

/**
 * 设备下线
 * @param {string|number} id 设备ID
 */
export const offlineDevice = (id) => {
  return http.post(`/user/device/offline/${id}`)
}

/**
 * 统计设备数量
 */
export const getDeviceCount = () => {
  return http.get('/user/device/count')
}

/**
 * 退出所有其他设备（批量下线）
 * @param {Array} excludeIds 排除的设备ID数组（通常是当前设备）
 */
export const logoutAllOtherDevices = (excludeIds = []) => {
  return http.post('/user/device/batch-offline', { excludeIds })
}

/**
 * 获取设备类型映射
 */
export const getDeviceTypeMap = () => {
  return {
    'iOS': { icon: '📱', name: 'iPhone' },
    'Android': { icon: '📱', name: 'Android' },
    'Windows': { icon: '💻', name: 'Windows PC' },
    'macOS': { icon: '💻', name: 'Mac' },
    'Linux': { icon: '💻', name: 'Linux' },
    'iPad': { icon: '📱', name: 'iPad' },
    'Web': { icon: '🌐', name: '网页版' },
    'Unknown': { icon: '💻', name: '未知设备' }
  }
}

/**
 * 格式化设备信息
 * @param {Object} device 原始设备信息
 */
export const formatDeviceInfo = (device) => {
  const typeMap = getDeviceTypeMap()
  const deviceType = device.deviceType || 'Unknown'
  const typeInfo = typeMap[deviceType] || typeMap['Unknown']
  
  return {
    id: device.id || device.deviceId,
    deviceName: device.deviceName || device.name || typeInfo.name,
    deviceType: deviceType,
    deviceIcon: typeInfo.icon,
    lastLoginTime: formatLoginTime(device.lastLoginTime || device.loginTime),
    location: device.location || device.loginLocation || '未知位置',
    status: device.status || 'online',
    isCurrent: device.isCurrent || false,
    loginIp: device.loginIp || device.ip,
    userAgent: device.userAgent || device.browser,
    createTime: device.createTime,
    updateTime: device.updateTime
  }
}

/**
 * 格式化登录时间
 * @param {string|number} timestamp 时间戳或时间字符串
 */
export const formatLoginTime = (timestamp) => {
  if (!timestamp) return '未知时间'
  
  const now = new Date().getTime()
  const loginTime = new Date(timestamp).getTime()
  const diff = now - loginTime
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    const date = new Date(loginTime)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }
}

export default {
  getDeviceList,
  getDeviceInfo,
  deleteDevice,
  batchDeleteDevices,
  getDevicesByCategory,
  getCurrentDevice,
  offlineDevice,
  getDeviceCount,
  logoutAllOtherDevices,
  getDeviceTypeMap,
  formatDeviceInfo,
  formatLoginTime
}
