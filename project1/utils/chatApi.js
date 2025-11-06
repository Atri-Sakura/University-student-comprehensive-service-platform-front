// 聊天功能 API 接口
import { request } from './api.js';

const baseUrl = 'http://localhost:8080';

// ==================== 会话管理 ====================

/**
 * 获取会话列表
 * @param {Object} params - 查询参数
 * @param {Number} params.fromType - 发送方类型：1-用户 2-骑手 3-商家（必填）
 * @param {Number} params.fromId - 发送方ID（必填）
 * @param {Number} params.pageNum - 页码（可选，默认1）
 * @param {Number} params.pageSize - 每页数量（可选，默认20）
 * @returns {Promise}
 */
export const getChatList = (params = {}) => {
  // 从localStorage获取商户信息
  const merchantInfo = uni.getStorageSync('merchantInfo') || {};
  const fromType = 3; // 3-商家
  
  // 尝试多个可能的字段名
  const fromId = merchantInfo.merchantBaseId 
    || merchantInfo.merchantId 
    || merchantInfo.id 
    || merchantInfo.merchant_base_id
    || merchantInfo.merchant_id;
  
  // 调试日志
  console.log('===== getChatList 调试 =====');
  console.log('merchantInfo:', merchantInfo);
  console.log('fromType:', fromType);
  console.log('fromId:', fromId);
  console.log('===========================');
  
  // 如果没有fromId，给出警告
  if (!fromId) {
    console.error('❌ 错误：无法获取商户ID，请检查登录时是否保存了商户信息！');
    console.error('merchantInfo内容:', JSON.stringify(merchantInfo));
  }
  
  return request(`${baseUrl}/platform/chat/session/sessions`, {
    method: 'GET',
    data: {
      fromType: fromType,
      fromId: fromId,
      ...params
    }
  });
};

/**
 * 获取单个会话详情
 * @param {Number} sessionId - 会话ID
 * @returns {Promise}
 */
export const getChatDetail = (sessionId) => {
  return request(`${baseUrl}/platform/chat/session/${sessionId}`, {
    method: 'GET'
  });
};

/**
 * 创建新会话
 * @param {Object} data - 会话信息
 * @param {Number} data.fromType - 发送方类型（必填）
 * @param {Number} data.fromId - 发送方ID（必填）
 * @param {Number} data.toType - 接收方类型（必填）
 * @param {Number} data.toId - 接收方ID（必填）
 * @returns {Promise}
 */
export const createChat = (data) => {
  return request(`${baseUrl}/platform/chat/session`, {
    method: 'POST',
    data: data
  });
};

/**
 * 删除会话
 * @param {Number} sessionId - 会话ID
 * @returns {Promise}
 */
export const deleteChat = (sessionId) => {
  return request(`${baseUrl}/platform/chat/session/${sessionId}`, {
    method: 'DELETE'
  });
};

/**
 * 标记会话为已读
 * @param {Number} sessionId - 会话ID
 * @returns {Promise}
 */
export const markChatRead = (sessionId) => {
  return request(`${baseUrl}/platform/chat/session/readUnreadCount`, {
    method: 'POST',
    data: { sessionId }
  });
};

/**
 * 获取未读消息总数
 * @param {Number} fromType - 发送方类型：1-用户 2-骑手 3-商家
 * @param {Number} fromId - 发送方ID
 * @returns {Promise}
 */
export const getUnreadCount = (fromType, fromId) => {
  // 如果没有传参，从localStorage获取商户信息
  if (!fromType || !fromId) {
    const merchantInfo = uni.getStorageSync('merchantInfo') || {};
    fromType = 3; // 3-商家
    fromId = merchantInfo.merchantBaseId 
      || merchantInfo.merchantId 
      || merchantInfo.id 
      || merchantInfo.merchant_base_id
      || merchantInfo.merchant_id;
    
    console.log('getUnreadCount - fromId:', fromId);
  }
  
  return request(`${baseUrl}/platform/chat/session/unread`, {
    method: 'GET',
    data: { fromType, fromId }
  });
};

// ==================== 消息管理 ====================

/**
 * 获取聊天历史消息
 * @param {Object} params - 查询参数
 * @param {Number} params.sessionId - 会话ID（必填）
 * @param {Number} params.pageNum - 页码（可选，默认1）
 * @param {Number} params.pageSize - 每页数量（可选，默认50）
 * @returns {Promise}
 */
export const getMessageList = (params) => {
  return request(`${baseUrl}/platform/chat/message/list`, {
    method: 'GET',
    data: {
      sessionId: params.sessionId || params.chatId, // 兼容旧参数名
      pageNum: params.pageNum,
      pageSize: params.pageSize
    }
  });
};

/**
 * 发送文本消息
 * @param {Object} data - 消息数据
 * @param {Number} data.sessionId - 会话ID（必填）
 * @param {Number} data.fromType - 发送方类型（必填）
 * @param {Number} data.fromId - 发送方ID（必填）
 * @param {Number} data.toType - 接收方类型（必填）
 * @param {Number} data.toId - 接收方ID（必填）
 * @param {String} data.msgContent - 消息内容（必填）
 * @param {Number} data.msgType - 消息类型：1-文本 2-图片 3-语音 4-系统通知（默认1）
 * @returns {Promise}
 */
export const sendMessage = (data) => {
  // 从localStorage获取商户信息
  const merchantInfo = uni.getStorageSync('merchantInfo') || {};
  const fromType = 3; // 3-商家
  const fromId = merchantInfo.merchantBaseId 
    || merchantInfo.merchantId 
    || merchantInfo.id 
    || merchantInfo.merchant_base_id
    || merchantInfo.merchant_id;
  
  // 转换消息类型：字符串转数字
  let msgType = 1; // 默认文本
  if (data.messageType === 'image' || data.msgType === 2) {
    msgType = 2;
  } else if (data.messageType === 'voice' || data.msgType === 3) {
    msgType = 3;
  } else if (data.messageType === 'system' || data.msgType === 4) {
    msgType = 4;
  }
  
  return request(`${baseUrl}/platform/chat/message`, {
    method: 'POST',
    data: {
      sessionId: data.sessionId || data.chatId, // 兼容旧参数名
      fromType: data.fromType || fromType,
      fromId: data.fromId || fromId,
      toType: data.toType,
      toId: data.toId,
      msgType: msgType,
      msgContent: data.msgContent || data.content, // 兼容旧参数名
      msgStatus: 0 // 0-发送中
    }
  });
};

/**
 * 删除消息
 * @param {Number} messageId - 消息ID
 * @returns {Promise}
 */
export const deleteMessage = (messageId) => {
  return request(`${baseUrl}/platform/chat/message/${messageId}`, {
    method: 'DELETE'
  });
};

// ==================== 文件上传 ====================

/**
 * 上传聊天图片
 * @param {String} filePath - 图片本地路径
 * @param {Number} sessionId - 会话ID
 * @returns {Promise}
 */
export const uploadChatImage = (filePath, sessionId) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${baseUrl}/platform/chat/upload/image`,
      filePath: filePath,
      name: 'file',
      formData: {
        sessionId: sessionId
      },
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (uploadRes) => {
        const data = JSON.parse(uploadRes.data);
        if (data.code === 200 || data.code === 0) {
          resolve(data);
        } else {
          reject(new Error(data.msg || '上传失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 上传聊天文件
 * @param {String} filePath - 文件本地路径
 * @param {Number} sessionId - 会话ID
 * @returns {Promise}
 */
export const uploadChatFile = (filePath, sessionId) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${baseUrl}/platform/chat/upload/file`,
      filePath: filePath,
      name: 'file',
      formData: {
        sessionId: sessionId
      },
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (uploadRes) => {
        const data = JSON.parse(uploadRes.data);
        if (data.code === 200 || data.code === 0) {
          resolve(data);
        } else {
          reject(new Error(data.msg || '上传失败'));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * 发送位置信息（作为文本消息发送）
 * @param {Object} data - 位置数据
 * @param {Number} data.sessionId - 会话ID
 * @param {Number} data.fromType - 发送方类型
 * @param {Number} data.fromId - 发送方ID
 * @param {Number} data.toType - 接收方类型
 * @param {Number} data.toId - 接收方ID
 * @param {String} data.latitude - 纬度
 * @param {String} data.longitude - 经度
 * @param {String} data.address - 地址描述
 * @param {String} data.name - 位置名称（可选）
 * @returns {Promise}
 */
export const sendLocation = (data) => {
  // 将位置信息作为特殊格式的文本消息发送
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
    msgType: 1 // 使用文本类型，内容为JSON
  });
};

// ==================== WebSocket 连接管理 ====================

/**
 * WebSocket 连接管理类
 */
export class ChatWebSocket {
  constructor() {
    this.socketTask = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.reconnectCount = 0;
    this.maxReconnectCount = 5;
    this.heartbeatTimer = null;
    this.heartbeatInterval = 30000; // 30秒心跳
    this.messageHandlers = [];
  }

  /**
   * 连接WebSocket
   * @param {Object} options - 连接选项
   * @param {Function} options.onMessage - 消息回调
   * @param {Function} options.onError - 错误回调
   * @param {Function} options.onClose - 关闭回调
   */
  connect(options = {}) {
    const token = uni.getStorageSync('token');
    if (!token) {
      console.error('未找到token，无法连接WebSocket');
      return;
    }

    // 获取商户信息
    const merchantInfo = uni.getStorageSync('merchantInfo') || {};
    const merchantId = merchantInfo.merchantBaseId || merchantInfo.id;
    
    if (!merchantId) {
      console.error('未找到商户ID，无法连接WebSocket');
      return;
    }

    // 构建WebSocket URL（注意：ws协议，不是http）
    // 后端WebSocket路径可能需要调整，这里使用通用的chat路径
    const wsUrl = `ws://localhost:8080/ws/chat?token=${token}&userType=3&userId=${merchantId}`;

    this.socketTask = uni.connectSocket({
      url: wsUrl,
      success: () => {
        console.log('WebSocket连接中...');
      },
      fail: (err) => {
        console.error('WebSocket连接失败:', err);
        if (options.onError) {
          options.onError(err);
        }
        this.reconnect(options);
      }
    });

    // 监听WebSocket连接打开
    this.socketTask.onOpen(() => {
      console.log('WebSocket连接已打开');
      this.isConnected = true;
      this.reconnectCount = 0;
      this.startHeartbeat();
      
      // 发送认证消息
      this.send({
        type: 'auth',
        token: token,
        userType: 3, // 3-商家
        userId: merchantId
      });
    });

    // 监听WebSocket接收消息
    this.socketTask.onMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        console.log('收到WebSocket消息:', data);
        
        // 调用所有消息处理器
        this.messageHandlers.forEach(handler => {
          handler(data);
        });
        
        if (options.onMessage) {
          options.onMessage(data);
        }
      } catch (err) {
        console.error('WebSocket消息解析失败:', err);
      }
    });

    // 监听WebSocket错误
    this.socketTask.onError((err) => {
      console.error('WebSocket错误:', err);
      this.isConnected = false;
      if (options.onError) {
        options.onError(err);
      }
    });

    // 监听WebSocket连接关闭
    this.socketTask.onClose(() => {
      console.log('WebSocket连接已关闭');
      this.isConnected = false;
      this.stopHeartbeat();
      
      if (options.onClose) {
        options.onClose();
      }
      
      // 尝试重连
      this.reconnect(options);
    });
  }

  /**
   * 发送消息
   * @param {Object} data - 消息数据
   */
  send(data) {
    if (!this.isConnected) {
      console.error('WebSocket未连接');
      return false;
    }

    this.socketTask.send({
      data: JSON.stringify(data),
      success: () => {
        console.log('消息发送成功');
      },
      fail: (err) => {
        console.error('消息发送失败:', err);
      }
    });
    return true;
  }

  /**
   * 添加消息处理器
   * @param {Function} handler - 消息处理函数
   */
  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  /**
   * 移除消息处理器
   * @param {Function} handler - 消息处理函数
   */
  removeMessageHandler(handler) {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  /**
   * 启动心跳
   */
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'heartbeat', timestamp: Date.now() });
      }
    }, this.heartbeatInterval);
  }

  /**
   * 停止心跳
   */
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 重连
   * @param {Object} options - 连接选项
   */
  reconnect(options) {
    if (this.reconnectCount >= this.maxReconnectCount) {
      console.log('已达到最大重连次数');
      return;
    }

    this.reconnectCount++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectCount), 30000);
    
    console.log(`${delay/1000}秒后尝试第${this.reconnectCount}次重连...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect(options);
    }, delay);
  }

  /**
   * 关闭连接
   */
  close() {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.socketTask) {
      this.socketTask.close({
        success: () => {
          console.log('WebSocket主动关闭成功');
        }
      });
      this.socketTask = null;
    }
    
    this.isConnected = false;
    this.messageHandlers = [];
  }
}

// 创建全局WebSocket实例
export const chatWebSocket = new ChatWebSocket();

// ==================== 工具函数 ====================

/**
 * 将消息类型从数字转换为字符串
 * @param {Number} msgType - 消息类型：1-文本 2-图片 3-语音 4-系统通知
 * @returns {String} - 'text', 'image', 'voice', 'system'
 */
export const msgTypeToString = (msgType) => {
  const typeMap = {
    1: 'text',
    2: 'image',
    3: 'voice',
    4: 'system'
  };
  return typeMap[msgType] || 'text';
};

/**
 * 将消息类型从字符串转换为数字
 * @param {String} messageType - 消息类型：'text', 'image', 'voice', 'system'
 * @returns {Number} - 1-文本 2-图片 3-语音 4-系统通知
 */
export const msgTypeToNumber = (messageType) => {
  const typeMap = {
    'text': 1,
    'image': 2,
    'voice': 3,
    'system': 4
  };
  return typeMap[messageType] || 1;
};

// 导出所有API
export default {
  // 会话管理
  getChatList,
  getChatDetail,
  createChat,
  deleteChat,
  markChatRead,
  getUnreadCount,
  
  // 消息管理
  getMessageList,
  sendMessage,
  deleteMessage,
  
  // 文件上传
  uploadChatImage,
  uploadChatFile,
  sendLocation,
  
  // WebSocket
  ChatWebSocket,
  chatWebSocket,
  
  // 工具函数
  msgTypeToString,
  msgTypeToNumber
};

