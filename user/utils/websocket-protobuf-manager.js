/**
 * WebSocket连接管理器 - Protobuf版本
 * 使用Protobuf二进制协议进行消息通信
 */

import protobufManager from './protobuf-manager.js';
import { MSG_TYPE, USER_TYPE } from './protobuf-schema.js';

const WS_URL = 'ws://localhost:8010/ws';
const RECONNECT_DELAY = 3000; // 重连延迟（毫秒）
const MAX_RECONNECT_ATTEMPTS = 5; // 最大重连次数
const HEARTBEAT_INTERVAL = 30000; // 心跳间隔（30秒）

class WebSocketProtobufManager {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isRegistered = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.messageHandlers = [];
    this.userType = null;
    this.userId = null;
    this.heartbeatTimer = null;
    this.isInitialized = false;
  }

  /**
   * 初始化Protobuf（必须先调用）
   */
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      await protobufManager.init();
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ WebSocket Protobuf Manager初始化失败:', error);
      throw error;
    }
  }

  /**
   * 连接WebSocket并注册身份
   * @param {Number} userType - 用户类型（1-用户 2-骑手 3-商家）
   * @param {String} userId - 用户ID
   * @returns {Promise} 等待连接和注册完成
   */
  async connect(userType, userId) {

    // 确保Protobuf已初始化
    if (!this.isInitialized) {
      await this.init();
    }
    
    this.userType = userType;
    this.userId = String(userId);
    
    // 如果已经连接，先关闭
    if (this.ws) {
      this.disconnect();
    }
    
    // 返回Promise，等待连接和注册完成
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket连接超时'));
      }, 10000); // 10秒超时
      
      try {
        this.ws = uni.connectSocket({
          url: WS_URL,
          success: () => {},
          fail: (error) => {
            clearTimeout(timeout);
            console.error('❌ [WebSocket-Protobuf] 连接请求失败:', error);
            reject(error);
            this.handleReconnect();
          }
        });
        
        // 监听连接成功
        this.ws.onOpen(() => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // 发送注册消息
          this.register();
          
          // 等待注册成功后resolve
          const checkRegistered = setInterval(() => {
            if (this.isRegistered) {
              clearInterval(checkRegistered);
              clearTimeout(timeout);
              resolve();
            }
          }, 100); // 每100ms检查一次
          
          // 暂时禁用心跳（调试用）
          // this.startHeartbeat();
        });
      
      // 监听消息（二进制数据）
      this.ws.onMessage((res) => {
        this.handleMessage(res.data);
      });
      
      // 监听错误
      this.ws.onError((error) => {
        console.error('❌ [WebSocket-Protobuf] 连接错误:', error);
        this.isConnected = false;
        this.isRegistered = false;
      });
      
      // 监听关闭
      this.ws.onClose((res) => {
        const wasConnected = this.isConnected;
        const wasRegistered = this.isRegistered;
        
        this.isConnected = false;
        this.isRegistered = false;
        this.stopHeartbeat();
        
        clearTimeout(timeout);
        
        // 只在异常断开时重连（正常关闭code=1000且已注册成功，不重连）
        if (res.code !== 1000 || !wasRegistered) {
          this.handleReconnect();
        }
      });
        
      } catch (error) {
        clearTimeout(timeout);
        console.error('❌ [WebSocket-Protobuf] 连接异常:', error);
        reject(error);
        this.handleReconnect();
      }
    });
  }

  /**
   * 发送注册消息（Protobuf编码）
   */
  register() {
    try {
      // 创建注册消息
      const registerMsg = protobufManager.createRegisterMessage(
        this.userType,
        this.userId
      );

      // Protobuf编码
      const binaryData = protobufManager.encode(registerMsg);

      // 发送二进制数据
      this.sendBinary(binaryData);

      // 注意：isRegistered将在收到服务器"注册成功"响应时设置为true

    } catch (error) {
      console.error('❌ [Protobuf] 注册消息编码失败:', error);
    }
  }

  /**
   * 发送文本消息（Protobuf编码）
   */
  sendTextMessage(params) {
    if (!this.isConnected || !this.isRegistered) {
      console.warn('⚠️ WebSocket未连接或未注册，无法发送消息');
      return false;
    }

    try {
      // 创建文本消息
      const textMsg = protobufManager.createTextMessage(params);

      // Protobuf编码
      const binaryData = protobufManager.encode(textMsg);

      // 发送二进制数据
      this.sendBinary(binaryData);

      return true;

    } catch (error) {
      console.error('❌ [Protobuf] 文本消息编码失败:', error);
      return false;
    }
  }

  /**
   * 发送二进制数据
   */
  sendBinary(binaryData) {
    if (!this.ws) {
      console.error('❌ WebSocket未连接');
      return;
    }

    try {
      this.ws.send({
        data: binaryData,
        success: () => {},
        fail: (error) => {
          console.error('❌ [WebSocket] 二进制消息发送失败:', error);
        }
      });
    } catch (error) {
      console.error('❌ [WebSocket] 发送异常:', error);
    }
  }

  /**
   * 处理接收到的消息（Protobuf解码）
   */
  handleMessage(data) {
    try {
      // 确保是ArrayBuffer
      if (!(data instanceof ArrayBuffer)) {
        console.error('❌ 收到非ArrayBuffer数据:', typeof data);
        return;
      }

      // Protobuf解码
      const message = protobufManager.decode(data);

      // 处理不同类型的消息（解码后字段为下划线命名）
      const msgType = message.msg_type || message.msgType; // 兼容两种命名
      const msgContent = message.msg_content || message.msgContent;
      
      switch (msgType) {
        case MSG_TYPE.REGISTER:
          this.isRegistered = true;
          break;

        case MSG_TYPE.TEXT:
          this.notifyHandlers(message);
          break;

        case MSG_TYPE.IMAGE:
          this.notifyHandlers(message);
          break;

        case MSG_TYPE.SYSTEM:
          // 如果是注册成功消息，设置注册状态
          if (msgContent && msgContent.indexOf('注册成功') !== -1) {
            this.isRegistered = true;
          }
          break;

        case MSG_TYPE.HEARTBEAT:
          break;

        default:
          console.warn('⚠️ 未知消息类型:', msgType, message);
      }

    } catch (error) {
      console.error('❌ [Protobuf] 消息解码失败:', error);
      console.error('原始数据:', data);
    }
  }

  /**
   * 通知所有消息处理器
   */
  notifyHandlers(message) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('❌ 消息处理器执行失败:', error);
      }
    });
  }

  /**
   * 添加消息处理器
   */
  addMessageHandler(handler) {
    if (typeof handler === 'function') {
      // 检查是否已存在，避免重复添加
      if (this.messageHandlers.indexOf(handler) === -1) {
        this.messageHandlers.push(handler);
      }
    }
  }

  /**
   * 移除消息处理器
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
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        try {
          const heartbeatMsg = protobufManager.createHeartbeatMessage(
            this.userType,
            this.userId
          );
          const binaryData = protobufManager.encode(heartbeatMsg);
          this.sendBinary(binaryData);
        } catch (error) {
          console.error('❌ 心跳发送失败:', error);
        }
      }
    }, HEARTBEAT_INTERVAL);
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
   * 处理重连
   */
  handleReconnect() {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('❌ WebSocket重连次数已达上限，停止重连');
      return;
    }

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.userType, this.userId);
    }, RECONNECT_DELAY);
  }

  /**
   * 主动断开连接
   */
  disconnect() {
    this.stopHeartbeat();
    
    // 清理重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // 重置重连计数
    this.reconnectAttempts = 0;

    if (this.ws) {
      try {
        this.ws.close();
      } catch (error) {
        console.error('❌ 关闭WebSocket异常:', error);
      }
      this.ws = null;
    }

    this.isConnected = false;
    this.isRegistered = false;
    
    // 清理所有消息处理器
    this.messageHandlers = [];
  }

  /**
   * 获取连接状态
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isRegistered: this.isRegistered,
      userType: this.userType,
      userId: this.userId,
      isInitialized: this.isInitialized
    };
  }
}

// 导出单例
export default new WebSocketProtobufManager();
