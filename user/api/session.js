// 聊天会话相关API
import request from './request.js'

/**
 * 会话状态枚举
 */
export const SESSION_STATUS = {
  DELETED: 0,   // 已删除
  NORMAL: 1,    // 正常
  BLOCKED: 2    // 已屏蔽
}

/**
 * 用户类型枚举
 */
export const USER_TYPE = {
  USER: 1,      // 用户
  RIDER: 2,     // 骑手
  MERCHANT: 3,  // 商家
  SYSTEM: 4     // 系统
}

/**
 * 新增聊天会话
 * @param {Object} sessionData 会话数据
 */
export const addSession = (sessionData) => {
  const data = {
    sessionId: null,
    fromType: sessionData.fromType,
    fromId: sessionData.fromId,
    toType: sessionData.toType,
    toId: sessionData.toId,
    lastMsgId: sessionData.lastMsgId || null,
    lastMsgContent: sessionData.lastMsgContent || '',
    lastMsgType: sessionData.lastMsgType || 1,
    lastMsgTime: sessionData.lastMsgTime || null,
    unreadCount: 0,
    sessionStatus: SESSION_STATUS.NORMAL
  }
  
  return request.post('/platform/chat/session', data)
}

/**
 * 修改聊天会话
 * @param {Object} updateData 更新数据
 */
export const updateSession = (updateData) => {
  const data = {
    sessionId: updateData.sessionId,
    ...updateData
  }
  
  return request.put('/platform/chat/session', data)
}

/**
 * 查询聊天会话列表
 * @param {Object} params 查询参数
 */
export const getSessionList = (params) => {
  const queryParams = new URLSearchParams()
  
  if (params.fromType) queryParams.append('fromType', params.fromType)
  if (params.fromId) queryParams.append('fromId', params.fromId)
  if (params.toType) queryParams.append('toType', params.toType)
  if (params.toId) queryParams.append('toId', params.toId)
  if (params.sessionStatus !== undefined) queryParams.append('sessionStatus', params.sessionStatus)
  if (params.pageNum) queryParams.append('pageNum', params.pageNum)
  if (params.pageSize) queryParams.append('pageSize', params.pageSize)
  
  const url = `/platform/chat/session/list?${queryParams.toString()}`
  return request.get(url)
}

/**
 * 查询未读会话
 * @param {Object} params 查询参数
 */
export const getUnreadSessions = (params) => {
  const queryParams = new URLSearchParams()
  
  if (params.fromType) queryParams.append('fromType', params.fromType)
  if (params.fromId) queryParams.append('fromId', params.fromId)
  
  const url = `/platform/chat/session/unread?${queryParams.toString()}`
  return request.get(url)
}

/**
 * 查询最近会话
 * @param {Object} params 查询参数
 */
export const getRecentSessions = (params) => {
  const queryParams = new URLSearchParams()
  
  if (params.fromType) queryParams.append('fromType', params.fromType)
  if (params.fromId) queryParams.append('fromId', params.fromId)
  if (params.limit) queryParams.append('limit', params.limit)
  
  const url = `/platform/chat/session/sessions?${queryParams.toString()}`
  return request.get(url)
}

/**
 * 增加未读计数
 * @param {Number} sessionId 会话ID
 */
export const increaseUnreadCount = (sessionId) => {
  // 验证sessionId参数
  if (!sessionId) {
    console.error('increaseUnreadCount: sessionId 参数缺失', sessionId);
    throw new Error('会话ID不能为空');
  }
  
  console.log('increaseUnreadCount 调用参数:', { sessionId });
  
  return request.post('/platform/chat/session/increaseUnreadCount', {
    sessionId
  })
}

/**
 * 标记会话为已读（清零未读计数）
 * @param {Number} sessionId 会话ID
 */
export const markSessionAsRead = (sessionId) => {
  // 严格验证sessionId参数
  if (sessionId === null || sessionId === undefined || sessionId === '' || sessionId === 0) {
    console.error('markSessionAsRead: sessionId 参数无效', {
      sessionId,
      type: typeof sessionId,
      isNull: sessionId === null,
      isUndefined: sessionId === undefined,
      isEmpty: sessionId === '',
      isZero: sessionId === 0
    });
    
    // 直接返回一个resolved的Promise，避免调用后端
    return Promise.resolve({
      code: 200,
      msg: '会话ID无效，跳过标记已读操作',
      data: null
    });
  }
  
  // 确保sessionId是数字或字符串
  const validSessionId = String(sessionId).trim();
  if (!validSessionId) {
    console.error('markSessionAsRead: sessionId 转换后为空', sessionId);
    return Promise.resolve({
      code: 200,
      msg: '会话ID转换后为空，跳过标记已读操作',
      data: null
    });
  }
  
  console.log('markSessionAsRead 调用参数:', { 
    originalSessionId: sessionId, 
    validSessionId,
    type: typeof sessionId 
  });
  
  return request.post('/platform/chat/session/readUnreadCount', {
    sessionId: validSessionId
  })
}

/**
 * 获取或创建会话
 * @param {Object} params 会话参数
 * @returns {Object} 返回会话对象，确保包含sessionId字段
 */
export const getOrCreateSession = async (params) => {
  try {
    // 先尝试查询现有会话
    const sessions = await getSessionList({
      fromType: params.fromType,
      fromId: params.fromId,
      toType: params.toType,
      toId: params.toId,
      sessionStatus: SESSION_STATUS.NORMAL
    })
    
    if (sessions.data && sessions.data.length > 0) {
      // 找到现有会话，确保返回的对象有sessionId
      const session = sessions.data[0]
      console.log('找到现有会话:', session)
      return session
    } else {
      // 创建新会话
      const newSession = await addSession(params)
      console.log('创建新会话响应:', newSession)
      // newSession.data 可能是会话对象或直接是sessionId
      const sessionData = newSession.data
      if (typeof sessionData === 'object') {
        return sessionData
      } else {
        // 如果返回的是sessionId，构造一个包含sessionId的对象
        return { sessionId: sessionData }
      }
    }
  } catch (error) {
    console.error('获取或创建会话失败:', error)
    throw error
  }
}

/**
 * 更新会话最后消息信息
 * @param {Number} sessionId 会话ID
 * @param {Object} messageInfo 消息信息
 */
export const updateSessionLastMessage = (sessionId, messageInfo) => {
  return updateSession({
    sessionId,
    lastMsgId: messageInfo.messageId,
    lastMsgContent: messageInfo.msgContent,
    lastMsgType: messageInfo.msgType,
    lastMsgTime: messageInfo.sendTime
  })
}

/**
 * 删除会话
 * @param {Number} sessionId 会话ID
 */
export const deleteSession = (sessionId) => {
  return updateSession({
    sessionId,
    sessionStatus: SESSION_STATUS.DELETED
  })
}

/**
 * 屏蔽会话
 * @param {Number} sessionId 会话ID
 */
export const blockSession = (sessionId) => {
  return updateSession({
    sessionId,
    sessionStatus: SESSION_STATUS.BLOCKED
  })
}

/**
 * 恢复会话
 * @param {Number} sessionId 会话ID
 */
export const restoreSession = (sessionId) => {
  return updateSession({
    sessionId,
    sessionStatus: SESSION_STATUS.NORMAL
  })
}

export default {
  addSession,
  updateSession,
  getSessionList,
  getUnreadSessions,
  getRecentSessions,
  increaseUnreadCount,
  markSessionAsRead,
  getOrCreateSession,
  updateSessionLastMessage,
  deleteSession,
  blockSession,
  restoreSession,
  SESSION_STATUS,
  USER_TYPE
}
