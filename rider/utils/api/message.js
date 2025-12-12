// 聊天消息相关API - 骑手端
import { request } from '../api.js';

/**
 * 消息类型枚举
 */
export const MSG_TYPE = {
  TEXT: 1,      // 文本消息
  IMAGE: 2,     // 图片消息
  VOICE: 3,     // 语音消息
  SYSTEM: 4     // 系统通知
};

/**
 * 消息状态枚举
 */
export const MSG_STATUS = {
  SENDING: 0,   // 发送中
  DELIVERED: 1, // 已送达
  READ: 2,      // 已读
  RECALLED: 3,  // 已撤回
  FAILED: 4     // 发送失败
};

/**
 * 用户类型枚举
 */
export const USER_TYPE = {
  USER: 1,      // 用户
  RIDER: 2,     // 骑手
  MERCHANT: 3,  // 商家
  SYSTEM: 4     // 系统
};

/**
 * 新增聊天消息
 * @param {Object} messageData 消息数据
 */
export const addMessage = (messageData) => {
  // 验证必要参数
  if (!messageData.fromId) {
    console.error('addMessage: fromId 参数缺失', messageData);
    throw new Error('发送方ID不能为空');
  }
  
  if (!messageData.sessionId) {
    console.error('addMessage: sessionId 参数缺失', messageData);
    throw new Error('会话ID不能为空');
  }
  
  const data = {
    messageId: null,
    sessionId: messageData.sessionId,
    fromType: messageData.fromType || USER_TYPE.RIDER,
    fromId: messageData.fromId,
    toType: messageData.toType || USER_TYPE.USER,
    toId: messageData.toId,
    msgType: messageData.msgType || MSG_TYPE.TEXT,
    msgContent: messageData.msgContent,
    msgStatus: MSG_STATUS.SENDING,
    sendTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    deliverTime: null,
    readTime: null,
    isDeleted: 0,
    version: 1
  };
  
  return request({
    url: '/platform/chat/message',
    method: 'POST',
    data
  });
};

/**
 * 修改聊天消息状态
 * @param {Object} updateData 更新数据
 */
export const updateMessage = (updateData) => {
  const data = {
    messageId: updateData.messageId,
    msgStatus: updateData.msgStatus,
    version: updateData.version
  };
  
  // 如果是标记为已读，添加已读时间
  if (updateData.msgStatus === MSG_STATUS.READ) {
    data.readTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }
  
  // 如果是标记为已送达，添加送达时间
  if (updateData.msgStatus === MSG_STATUS.DELIVERED) {
    data.deliverTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }
  
  return request({
    url: '/platform/chat/message',
    method: 'PUT',
    data
  });
};

/**
 * 查询聊天消息列表
 * @param {Object} params 查询参数
 */
export const getMessageList = (params) => {
  const queryParams = new URLSearchParams();
  
  if (params.sessionId) queryParams.append('sessionId', params.sessionId);
  if (params.fromType) queryParams.append('fromType', params.fromType);
  if (params.msgType) queryParams.append('msgType', params.msgType);
  if (params.msgStatus !== undefined) queryParams.append('msgStatus', params.msgStatus);
  if (params.pageNum) queryParams.append('pageNum', params.pageNum);
  if (params.pageSize) queryParams.append('pageSize', params.pageSize);
  
  const url = `/platform/chat/message/list?${queryParams.toString()}`;
  return request({
    url: url,
    method: 'GET'
  });
};

/**
 * 多会话消息查询
 * @param {Array} sessionIds 会话ID数组
 */
export const getMultiSessionMessages = (sessionIds) => {
  const queryParams = new URLSearchParams();
  sessionIds.forEach(id => queryParams.append('sessionIds', id));
  
  const url = `/platform/chat/message/multiSessionMessages?${queryParams.toString()}`;
  return request({
    url: url,
    method: 'GET'
  });
};

/**
 * 按收发方查询消息
 * @param {Object} params 查询参数
 */
export const getMessagesFromTo = (params) => {
  const queryParams = new URLSearchParams();
  
  if (params.fromType) queryParams.append('fromType', params.fromType);
  if (params.fromId) queryParams.append('fromId', params.fromId);
  if (params.toType) queryParams.append('toType', params.toType);
  if (params.toId) queryParams.append('toId', params.toId);
  
  const url = `/platform/chat/message/multiSessionMessagesFromTo?${queryParams.toString()}`;
  return request({
    url: url,
    method: 'GET'
  });
};

/**
 * 批量标记消息为已读
 * @param {Array} messageIds 消息ID数组
 */
export const markMessagesAsRead = async (messageIds) => {
  const promises = messageIds.map(messageId => 
    updateMessage({
      messageId,
      msgStatus: MSG_STATUS.READ,
      version: 1 // 实际应用中需要获取当前版本号
    })
  );
  
  return Promise.all(promises);
};

/**
 * 撤回消息
 * @param {Number} messageId 消息ID
 * @param {Number} version 版本号
 */
export const recallMessage = (messageId, version) => {
  return updateMessage({
    messageId,
    msgStatus: MSG_STATUS.RECALLED,
    version
  });
};

export default {
  addMessage,
  updateMessage,
  getMessageList,
  getMultiSessionMessages,
  getMessagesFromTo,
  markMessagesAsRead,
  recallMessage,
  MSG_TYPE,
  MSG_STATUS,
  USER_TYPE
};

