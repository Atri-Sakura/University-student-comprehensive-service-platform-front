// 聊天功能 API 接口
import { request } from './api.js';

const baseUrl = 'http://localhost:8080';

// ==================== 会话管理 ====================

/**
 * 获取会话列表
 * @param {Object} params - 查询参数
 * @param {Number} params.pageNum - 页码（可选，默认1）
 * @param {Number} params.pageSize - 每页数量（可选，默认20）
 * @param {String} params.keyword - 搜索关键词（可选）
 * @returns {Promise}
 */
export const getChatList = (params = {}) => {
  return request(`${baseUrl}/merchant/chat/list`, {
    method: 'GET',
    data: params
  });
};

/**
 * 获取单个会话详情
 * @param {Number} chatId - 会话ID
 * @returns {Promise}
 */
export const getChatDetail = (chatId) => {
  return request(`${baseUrl}/merchant/chat/detail/${chatId}`, {
    method: 'GET'
  });
};

/**
 * 创建新会话
 * @param {Object} data - 会话信息
 * @param {Number} data.userId - 用户ID
 * @param {String} data.userName - 用户名称
 * @param {String} data.userAvatar - 用户头像（可选）
 * @returns {Promise}
 */
export const createChat = (data) => {
  return request(`${baseUrl}/merchant/chat/create`, {
    method: 'POST',
    data: data
  });
};

/**
 * 删除会话
 * @param {Number} chatId - 会话ID
 * @returns {Promise}
 */
export const deleteChat = (chatId) => {
  return request(`${baseUrl}/merchant/chat/delete/${chatId}`, {
    method: 'DELETE'
  });
};

/**
 * 置顶/取消置顶会话
 * @param {Number} chatId - 会话ID
 * @param {Boolean} isTop - 是否置顶（true:置顶, false:取消置顶）
 * @returns {Promise}
 */
export const toggleChatTop = (chatId, isTop) => {
  return request(`${baseUrl}/merchant/chat/top`, {
    method: 'PUT',
    data: { chatId, isTop }
  });
};

/**
 * 标记会话为已读
 * @param {Number} chatId - 会话ID
 * @returns {Promise}
 */
export const markChatRead = (chatId) => {
  return request(`${baseUrl}/merchant/chat/read/${chatId}`, {
    method: 'PUT'
  });
};

/**
 * 获取未读消息总数
 * @returns {Promise}
 */
export const getUnreadCount = () => {
  return request(`${baseUrl}/merchant/chat/unread/count`, {
    method: 'GET'
  });
};

// ==================== 消息管理 ====================

/**
 * 获取聊天历史消息
 * @param {Object} params - 查询参数
 * @param {Number} params.chatId - 会话ID（必填）
 * @param {Number} params.pageNum - 页码（可选，默认1）
 * @param {Number} params.pageSize - 每页数量（可选，默认50）
 * @param {Number} params.lastMessageId - 最后一条消息ID（可选，用于加载更多）
 * @returns {Promise}
 */
export const getMessageList = (params) => {
  return request(`${baseUrl}/merchant/chat/message/list`, {
    method: 'GET',
    data: params
  });
};

/**
 * 发送文本消息
 * @param {Object} data - 消息数据
 * @param {Number} data.chatId - 会话ID（必填）
 * @param {String} data.content - 消息内容（必填）
 * @param {String} data.messageType - 消息类型（text:文本, image:图片, file:文件, location:位置, system:系统消息，默认text）
 * @returns {Promise}
 */
export const sendMessage = (data) => {
  return request(`${baseUrl}/merchant/chat/message/send`, {
    method: 'POST',
    data: {
      messageType: 'text',
      ...data
    }
  });
};

/**
 * 撤回消息
 * @param {Number} messageId - 消息ID
 * @returns {Promise}
 */
export const recallMessage = (messageId) => {
  return request(`${baseUrl}/merchant/chat/message/recall/${messageId}`, {
    method: 'PUT'
  });
};

/**
 * 删除消息
 * @param {Number} messageId - 消息ID
 * @returns {Promise}
 */
export const deleteMessage = (messageId) => {
  return request(`${baseUrl}/merchant/chat/message/delete/${messageId}`, {
    method: 'DELETE'
  });
};

// ==================== 文件上传 ====================

/**
 * 上传聊天图片
 * @param {String} filePath - 图片本地路径
 * @param {Number} chatId - 会话ID
 * @returns {Promise}
 */
export const uploadChatImage = (filePath, chatId) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${baseUrl}/merchant/chat/upload/image`,
      filePath: filePath,
      name: 'file',
      formData: {
        chatId: chatId
      },
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (uploadRes) => {
        const data = JSON.parse(uploadRes.data);
        if (data.code === 200) {
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
 * @param {Number} chatId - 会话ID
 * @returns {Promise}
 */
export const uploadChatFile = (filePath, chatId) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${baseUrl}/merchant/chat/upload/file`,
      filePath: filePath,
      name: 'file',
      formData: {
        chatId: chatId
      },
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (uploadRes) => {
        const data = JSON.parse(uploadRes.data);
        if (data.code === 200) {
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
 * 发送位置信息
 * @param {Object} data - 位置数据
 * @param {Number} data.chatId - 会话ID
 * @param {String} data.latitude - 纬度
 * @param {String} data.longitude - 经度
 * @param {String} data.address - 地址描述
 * @param {String} data.name - 位置名称（可选）
 * @returns {Promise}
 */
export const sendLocation = (data) => {
  return request(`${baseUrl}/merchant/chat/message/location`, {
    method: 'POST',
    data: data
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

    // 构建WebSocket URL（注意：ws协议，不是http）
    const wsUrl = `ws://localhost:8080/merchant/chat/ws?token=${token}`;

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
    });

    // 监听WebSocket接收消息
    this.socketTask.onMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        console.log('收到消息:', data);
        
        // 调用所有消息处理器
        this.messageHandlers.forEach(handler => {
          handler(data);
        });
        
        if (options.onMessage) {
          options.onMessage(data);
        }
      } catch (err) {
        console.error('消息解析失败:', err);
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

// ==================== 快捷回复 ====================

/**
 * 获取快捷回复列表
 * @returns {Promise}
 */
export const getQuickReplyList = () => {
  return request(`${baseUrl}/merchant/chat/quick-reply/list`, {
    method: 'GET'
  });
};

/**
 * 添加快捷回复
 * @param {Object} data - 快捷回复数据
 * @param {String} data.content - 回复内容
 * @param {String} data.category - 分类（可选）
 * @returns {Promise}
 */
export const addQuickReply = (data) => {
  return request(`${baseUrl}/merchant/chat/quick-reply/add`, {
    method: 'POST',
    data: data
  });
};

/**
 * 删除快捷回复
 * @param {Number} replyId - 快捷回复ID
 * @returns {Promise}
 */
export const deleteQuickReply = (replyId) => {
  return request(`${baseUrl}/merchant/chat/quick-reply/delete/${replyId}`, {
    method: 'DELETE'
  });
};

// ==================== 消息统计 ====================

/**
 * 获取聊天统计数据
 * @param {Object} params - 查询参数
 * @param {String} params.startDate - 开始日期（可选，格式：YYYY-MM-DD）
 * @param {String} params.endDate - 结束日期（可选，格式：YYYY-MM-DD）
 * @returns {Promise}
 */
export const getChatStatistics = (params = {}) => {
  return request(`${baseUrl}/merchant/chat/statistics`, {
    method: 'GET',
    data: params
  });
};

// 导出所有API
export default {
  // 会话管理
  getChatList,
  getChatDetail,
  createChat,
  deleteChat,
  toggleChatTop,
  markChatRead,
  getUnreadCount,
  
  // 消息管理
  getMessageList,
  sendMessage,
  recallMessage,
  deleteMessage,
  
  // 文件上传
  uploadChatImage,
  uploadChatFile,
  sendLocation,
  
  // WebSocket
  ChatWebSocket,
  chatWebSocket,
  
  // 快捷回复
  getQuickReplyList,
  addQuickReply,
  deleteQuickReply,
  
  // 统计
  getChatStatistics
};

