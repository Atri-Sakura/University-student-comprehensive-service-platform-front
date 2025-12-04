/**
 * 聊天消息相关 API
 */
import { request } from '../api.js';

const API = {
  // 消息相关
  MESSAGE_ADD: '/platform/chat/message', // 新增聊天消息
  MESSAGE_UPDATE: '/platform/chat/message', // 修改聊天消息
  MESSAGE_LIST: '/platform/chat/message/list', // 查询聊天消息列表
  MESSAGE_MULTI_SESSION: '/platform/chat/message/multiSessionMessages', // 多会话消息查询
  MESSAGE_FROM_TO: '/platform/chat/message/multiSessionMessagesFromTo', // 按收发方查询消息
  
  // 会话相关
  SESSION_ADD: '/platform/chat/session', // 新增聊天会话
  SESSION_UPDATE: '/platform/chat/session', // 修改聊天会话
  SESSION_LIST: '/platform/chat/session/list', // 查询聊天会话列表
  SESSION_UNREAD: '/platform/chat/session/unread', // 未读会话查询
  SESSION_SESSIONS: '/platform/chat/session/sessions', // 最近会话查询
  SESSION_INCREASE_UNREAD: '/platform/chat/session/increaseUnreadCount', // 增加未读计数
  SESSION_READ_UNREAD: '/platform/chat/session/readUnreadCount', // 已读未读计数
};

// ========== 消息 API ==========

/**
 * 发送聊天消息
 * @param {Object} data 消息数据
 */
export function sendMessage(data) {
  return request({
    url: API.MESSAGE_ADD,
    method: 'POST',
    data
  });
}

/**
 * 修改聊天消息
 * @param {Object} data 修改数据
 */
export function updateMessage(data) {
  return request({
    url: API.MESSAGE_UPDATE,
    method: 'PUT',
    data
  });
}

/**
 * 查询聊天消息列表
 * @param {Object} params 查询参数
 */
export function getMessageList(params) {
  let url = API.MESSAGE_LIST;
  // 构建查询字符串
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return request({
    url: url,
    method: 'GET'
  });
}

/**
 * 按收发方查询消息
 * @param {Object} params 查询参数
 */
export function getMessagesFromTo(params) {
  let url = API.MESSAGE_FROM_TO;
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return request({
    url: url,
    method: 'GET'
  });
}


// ========== 会话 API ==========

/**
 * 创建聊天会话
 * @param {Object} data 会话数据
 */
export function createSession(data) {
  return request({
    url: API.SESSION_ADD,
    method: 'POST',
    data
  });
}

/**
 * 修改聊天会话
 * @param {Object} data 修改数据
 */
export function updateSession(data) {
  return request({
    url: API.SESSION_UPDATE,
    method: 'PUT',
    data
  });
}

/**
 * 查询聊天会话列表
 * @param {Object} params 查询参数
 */
export function getSessionList(params) {
  let url = API.SESSION_LIST;
  const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return request({
    url: url,
    method: 'GET'
  });
}

/**
 * 标记会话已读
 * @param {Number} sessionId 会话ID
 */
export function markSessionRead(sessionId) {
  return request({
    url: API.SESSION_READ_UNREAD,
    method: 'POST',
    data: { sessionId }
  });
}

export default {
  sendMessage,
  updateMessage,
  getMessageList,
  getMessagesFromTo,
  createSession,
  updateSession,
  getSessionList,
  markSessionRead
};
