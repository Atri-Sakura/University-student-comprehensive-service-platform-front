// 聊天功能 API 接口
import { request } from './api.js';

const baseUrl = 'http://localhost:8080';

const getToken = () => uni.getStorageSync('token');

const chatRequest = (url, options = {}) => {
  return request(url, {
    ...options,
    header: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
      ...options.header
    }
  });
};

// ==================== 会话管理 ====================
export const getChatList = (params = {}) => {
  const merchantInfo = uni.getStorageSync('merchantInfo') || {};
  const fromType = 3;
  const fromId = String(
    merchantInfo.merchantBaseId ||
    merchantInfo.merchantId ||
    merchantInfo.id ||
    merchantInfo.merchant_base_id ||
    merchantInfo.merchant_id ||
    ''
  );

  if (!fromId) {
    console.error('❌ 错误：无法获取商户ID，请检查登录时是否保存了商户信息！');
    console.error('merchantInfo内容:', JSON.stringify(merchantInfo));
  }

  return chatRequest(`${baseUrl}/platform/chat/session/sessions`, {
    method: 'GET',
    data: {
      fromType,
      fromId,
      ...params
    }
  });
};

export const getChatListBidirectional = async (params = {}) => {
  const merchantInfo = uni.getStorageSync('merchantInfo') || {};
  const merchantType = 3;
  const merchantId = String(
    merchantInfo.merchantBaseId ||
    merchantInfo.merchantId ||
    merchantInfo.id ||
    merchantInfo.merchant_base_id ||
    merchantInfo.merchant_id ||
    ''
  );

  if (!merchantId) {
    console.error('❌ 无法获取商户ID');
    return { data: { code: 500, msg: '无法获取商户ID', data: [] } };
  }

  try {
    const [response1, response2] = await Promise.all([
      chatRequest(`${baseUrl}/platform/chat/session/list`, {
        method: 'GET',
        data: {
          fromType: merchantType,
          fromId: merchantId,
          sessionStatus: 1,
          pageSize: params.pageSize || 50,
          ...params
        }
      }),
      chatRequest(`${baseUrl}/platform/chat/session/list`, {
        method: 'GET',
        data: {
          toType: merchantType,
          toId: merchantId,
          sessionStatus: 1,
          pageSize: params.pageSize || 50,
          ...params
        }
      })
    ]);

    let allSessions = [];
    if (response1.data && (response1.data.code === 200 || response1.data.code === 0)) {
      allSessions = allSessions.concat(response1.data.data || response1.data.rows || []);
    }
    if (response2.data && (response2.data.code === 200 || response2.data.code === 0)) {
      allSessions = allSessions.concat(response2.data.data || response2.data.rows || []);
    }

    const sessionMap = new Map();
    allSessions.forEach((session) => {
      if (!sessionMap.has(session.sessionId)) {
        sessionMap.set(session.sessionId, session);
      }
    });

    const uniqueSessions = Array.from(sessionMap.values());
    uniqueSessions.sort((a, b) => {
      const timeA = new Date(a.lastMsgTime || a.updateTime).getTime();
      const timeB = new Date(b.lastMsgTime || b.updateTime).getTime();
      return timeB - timeA;
    });

    return {
      data: {
        code: 200,
        msg: '查询成功',
        data: uniqueSessions
      }
    };
  } catch (error) {
    console.error('双向查询会话失败:', error);
    return {
      data: {
        code: 500,
        msg: '查询失败',
        data: []
      }
    };
  }
};

export const getChatDetail = (sessionId) => chatRequest(`${baseUrl}/platform/chat/session/${sessionId}`, { method: 'GET' });

export const createChat = (data) => chatRequest(`${baseUrl}/platform/chat/session`, { method: 'POST', data });

export const deleteChat = (sessionId) => chatRequest(`${baseUrl}/platform/chat/session/${sessionId}`, { method: 'DELETE' });

export const deleteChatBatch = (sessionIds) => {
  const idsString = Array.isArray(sessionIds) ? sessionIds.join(',') : sessionIds;
  return chatRequest(`${baseUrl}/platform/chat/session/${idsString}`, { method: 'DELETE' });
};

export const markChatRead = (sessionId) => {
  console.log('markChatRead发送请求，sessionId:', sessionId);
  return chatRequest(`${baseUrl}/platform/chat/session/readUnreadCount?sessionId=${sessionId}`, {
    method: 'POST'
  });
};

export const getUnreadCount = (fromType, fromId) => {
  if (!fromType || !fromId) {
    const merchantInfo = uni.getStorageSync('merchantInfo') || {};
    fromType = 3;
    fromId = String(
      merchantInfo.merchantBaseId ||
      merchantInfo.merchantId ||
      merchantInfo.id ||
      merchantInfo.merchant_base_id ||
      merchantInfo.merchant_id ||
      ''
    );
  }

  return chatRequest(`${baseUrl}/platform/chat/session/unread`, {
    method: 'GET',
    data: { fromType, fromId }
  });
};

export const updateChatSession = (data) => chatRequest(`${baseUrl}/platform/chat/session`, { method: 'PUT', data });

export const getChatSessionList = (params) => chatRequest(`${baseUrl}/platform/chat/session/list`, { method: 'GET', data: params });

export const increaseUnreadCount = (sessionId) => chatRequest(`${baseUrl}/platform/chat/session/increaseUnreadCount`, {
  method: 'POST',
  data: { sessionId }
});

// ==================== 消息管理 ====================
export const getMessageList = (params) => {
  return chatRequest(`${baseUrl}/platform/chat/message/list`, {
    method: 'GET',
    data: {
      sessionId: params.sessionId || params.chatId,
      fromType: params.fromType,
      msgType: params.msgType,
      msgStatus: params.msgStatus,
      pageNum: params.pageNum,
      pageSize: params.pageSize
    }
  });
};

export const getMessageDetail = (messageId) => chatRequest(`${baseUrl}/platform/chat/message/${messageId}`, { method: 'GET' });

export const getRecentMessages = () => chatRequest(`${baseUrl}/platform/chat/message/recent`, { method: 'GET' });

export const getMessagesWithAttachment = (params) => chatRequest(`${baseUrl}/platform/chat/message/chatMessageWithAttachment`, {
  method: 'GET',
  data: params
});

export const sendMessage = (data) => {
  const merchantInfo = uni.getStorageSync('merchantInfo') || {};
  const fromType = 3;
  const fromId = String(
    merchantInfo.merchantBaseId ||
    merchantInfo.merchantId ||
    merchantInfo.id ||
    merchantInfo.merchant_base_id ||
    merchantInfo.merchant_id ||
    ''
  );

  let msgType = 1;
  if (data.messageType === 'image' || data.msgType === 2) {
    msgType = 2;
  } else if (data.messageType === 'voice' || data.msgType === 3) {
    msgType = 3;
  } else if (data.messageType === 'system' || data.msgType === 4) {
    msgType = 4;
  }

  return chatRequest(`${baseUrl}/platform/chat/message`, {
    method: 'POST',
    data: {
      sessionId: String(data.sessionId || data.chatId),
      fromType: data.fromType || fromType,
      fromId: String(data.fromId || fromId),
      toType: data.toType,
      toId: String(data.toId),
      msgType,
      msgContent: data.msgContent || data.content,
      msgStatus: 0,
      sendTime: new Date().toISOString().split('T')[0],
      isDeleted: 0,
      version: 1,
      attachment: data.attachment
    }
  });
};

export const deleteMessage = (messageId) => chatRequest(`${baseUrl}/platform/chat/message/${messageId}`, { method: 'DELETE' });

export const deleteMessageBatch = (messageIds) => {
  const idsString = Array.isArray(messageIds) ? messageIds.join(',') : messageIds;
  return chatRequest(`${baseUrl}/platform/chat/message/${idsString}`, { method: 'DELETE' });
};

export const updateMessage = (data) => chatRequest(`${baseUrl}/platform/chat/message`, { method: 'PUT', data });

export const getMultiSessionMessages = (sessionIds) => {
  const idsString = Array.isArray(sessionIds) ? sessionIds.join(',') : sessionIds;
  return chatRequest(`${baseUrl}/platform/chat/message/multiSessionMessages?sessionIds=${idsString}`, { method: 'GET' });
};

export const getMultiSessionMessagesFromTo = (params) => chatRequest(`${baseUrl}/platform/chat/message/multiSessionMessagesFromTo`, {
  method: 'GET',
  data: params
});

// ==================== 消息附件管理 ====================
export const getAttachmentDetail = (attachmentId) => chatRequest(`${baseUrl}/platform/chat/attachment/${attachmentId}`, { method: 'GET' });

export const getAttachmentList = (params) => chatRequest(`${baseUrl}/platform/chat/attachment/list`, { method: 'GET', data: params });

export const createAttachment = (data) => chatRequest(`${baseUrl}/platform/chat/attachment`, { method: 'POST', data });

export const updateAttachment = (data) => chatRequest(`${baseUrl}/platform/chat/attachment`, { method: 'PUT', data });

export const deleteAttachmentBatch = (attachmentIds) => {
  const idsString = Array.isArray(attachmentIds) ? attachmentIds.join(',') : attachmentIds;
  return chatRequest(`${baseUrl}/platform/chat/attachment/${idsString}`, { method: 'DELETE' });
};

// ==================== 文件上传 ====================
export const uploadChatImage = (filePath, sessionId) => new Promise((resolve, reject) => {
  uni.uploadFile({
    url: `${baseUrl}/platform/chat/upload/image`,
    filePath,
    name: 'file',
    formData: { sessionId },
    header: {
      'Authorization': `Bearer ${getToken()}`
    },
    success: (uploadRes) => {
      const data = JSON.parse(uploadRes.data);
      if (data.code === 200 || data.code === 0) {
        resolve(data);
      } else {
        reject(new Error(data.msg || '上传失败'));
      }
    },
    fail: (err) => reject(err)
  });
});

export const uploadChatFile = (filePath, sessionId) => new Promise((resolve, reject) => {
  uni.uploadFile({
    url: `${baseUrl}/platform/chat/upload/file`,
    filePath,
    name: 'file',
    formData: { sessionId },
    header: {
      'Authorization': `Bearer ${getToken()}`
    },
    success: (uploadRes) => {
      const data = JSON.parse(uploadRes.data);
      if (data.code === 200 || data.code === 0) {
        resolve(data);
      } else {
        reject(new Error(data.msg || '上传失败'));
      }
    },
    fail: (err) => reject(err)
  });
});

export const sendLocation = (data) => {
  const locationContent = JSON.stringify({
    type: 'location',
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
    name: data.name
  });

  return sendMessage({
    sessionId: data.sessionId,
    fromType: data.fromType,
    fromId: data.fromId,
    toType: data.toType,
    toId: data.toId,
    msgContent: locationContent,
    msgType: 1
  });
};

// ==================== WebSocket 连接管理（兼容旧版） ====================
export class ChatWebSocket {
  constructor() {
    this.socketTask = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.reconnectCount = 0;
    this.maxReconnectCount = 5;
    this.heartbeatTimer = null;
    this.heartbeatInterval = 30000;
    this.messageHandlers = [];
  }

  connect(options = {}) {
    const token = getToken();
    if (!token) {
      console.error('未找到token，无法连接WebSocket');
      return;
    }

    const merchantInfo = uni.getStorageSync('merchantInfo') || {};
    const merchantId = String(merchantInfo.merchantBaseId || merchantInfo.id || '');
    if (!merchantId) {
      console.error('未找到商户ID，无法连接WebSocket');
      return;
    }

    const wsUrl = `ws://localhost:8010/ws`;

    this.socketTask = uni.connectSocket({
      url: wsUrl,
      success: () => {},
      fail: (err) => {
        if (options.onError) options.onError(err);
        this.reconnect(options);
      }
    });

    this.socketTask.onOpen(() => {
      this.isConnected = true;
      this.reconnectCount = 0;
      this.startHeartbeat();
      this.send({
        type: 'REGISTER',
        userType: 3,
        userId: merchantId,
        timestamp: Date.now()
      });
    });

    this.socketTask.onMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        this.messageHandlers.forEach((handler) => handler(data));
        if (options.onMessage) options.onMessage(data);
      } catch (err) {
        console.error('WebSocket消息解析失败:', err);
      }
    });

    this.socketTask.onError((err) => {
      this.isConnected = false;
      if (options.onError) options.onError(err);
    });

    this.socketTask.onClose(() => {
      this.isConnected = false;
      this.stopHeartbeat();
      if (options.onClose) options.onClose();
      this.reconnect(options);
    });
  }

  send(data) {
    if (!this.isConnected) {
      console.error('WebSocket未连接');
      return false;
    }
    this.socketTask.send({
      data: JSON.stringify(data),
      success: () => {},
      fail: (err) => {
        console.error('消息发送失败:', err);
      }
    });
    return true;
  }

  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler) {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'heartbeat', timestamp: Date.now() });
      }
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  reconnect(options) {
    if (this.reconnectCount >= this.maxReconnectCount) {
      return;
    }
    this.reconnectCount += 1;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectCount), 30000);
    this.reconnectTimer = setTimeout(() => {
      this.connect(options);
    }, delay);
  }

  close() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socketTask) {
      this.socketTask.close();
      this.socketTask = null;
    }
    this.isConnected = false;
    this.messageHandlers = [];
  }
}

export const chatWebSocket = new ChatWebSocket();

export const msgTypeToString = (msgType) => {
  const typeMap = { 1: 'text', 2: 'image', 3: 'voice', 4: 'system' };
  return typeMap[msgType] || 'text';
};

export const msgTypeToNumber = (messageType) => {
  const typeMap = { text: 1, image: 2, voice: 3, system: 4 };
  return typeMap[messageType] || 1;
};

export default {
  getChatList,
  getChatListBidirectional,
  getChatDetail,
  createChat,
  deleteChat,
  deleteChatBatch,
  markChatRead,
  getUnreadCount,
  updateChatSession,
  getChatSessionList,
  increaseUnreadCount,
  getMessageList,
  getMessageDetail,
  getRecentMessages,
  getMessagesWithAttachment,
  sendMessage,
  deleteMessage,
  deleteMessageBatch,
  updateMessage,
  getMultiSessionMessages,
  getMultiSessionMessagesFromTo,
  getAttachmentDetail,
  getAttachmentList,
  createAttachment,
  updateAttachment,
  deleteAttachmentBatch,
  uploadChatImage,
  uploadChatFile,
  sendLocation,
  ChatWebSocket,
  chatWebSocket,
  msgTypeToString,
  msgTypeToNumber
};

