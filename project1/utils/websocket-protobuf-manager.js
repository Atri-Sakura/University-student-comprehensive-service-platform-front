/**
 * WebSocket连接管理器 - Protobuf版本
 * 使用Protobuf二进制协议进行消息通信
 */

import protobufManager from './protobuf-manager.js';
import { MSG_TYPE } from './protobuf-schema.js';

const WS_URL = 'ws://localhost:8010/ws';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 30000;

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

  async init() {
    if (this.isInitialized) return;
    await protobufManager.init();
    this.isInitialized = true;
  }

  async connect(userType, userId) {
    if (!this.isInitialized) {
      await this.init();
    }

    this.userType = userType;
    this.userId = String(userId);

    if (this.ws) {
      this.disconnect();
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket连接超时'));
      }, 10000);

      try {
        this.ws = uni.connectSocket({
          url: WS_URL,
          success: () => {},
          fail: (error) => {
            clearTimeout(timeout);
            reject(error);
            this.handleReconnect();
          }
        });

        this.ws.onOpen(() => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.register();

          const checkRegistered = setInterval(() => {
            if (this.isRegistered) {
              clearInterval(checkRegistered);
              clearTimeout(timeout);
              resolve();
            }
          }, 100);
        });

        this.ws.onMessage((res) => {
          this.handleMessage(res.data);
        });

        this.ws.onError(() => {
          this.isConnected = false;
          this.isRegistered = false;
        });

        this.ws.onClose((res) => {
          const wasRegistered = this.isRegistered;
          this.isConnected = false;
          this.isRegistered = false;
          this.stopHeartbeat();
          clearTimeout(timeout);
          if (res.code !== 1000 || !wasRegistered) {
            this.handleReconnect();
          }
        });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
        this.handleReconnect();
      }
    });
  }

  register() {
    try {
      const registerMsg = protobufManager.createRegisterMessage(this.userType, this.userId);
      const binaryData = protobufManager.encode(registerMsg);
      this.sendBinary(binaryData);
    } catch (error) {
      console.error('注册消息编码失败:', error);
    }
  }

  sendTextMessage(params) {
    if (!this.isConnected || !this.isRegistered) {
      console.warn('WebSocket未连接或未注册，无法发送消息');
      return false;
    }

    try {
      const textMsg = protobufManager.createTextMessage(params);
      const binaryData = protobufManager.encode(textMsg);
      this.sendBinary(binaryData);
      return true;
    } catch (error) {
      console.error('文本消息编码失败:', error);
      return false;
    }
  }

  sendBinary(binaryData) {
    if (!this.ws) {
      console.error('WebSocket未连接');
      return;
    }
    this.ws.send({
      data: binaryData,
      success: () => {},
      fail: (error) => {
        console.error('二进制消息发送失败:', error);
      }
    });
  }

  handleMessage(data) {
    try {
      if (!(data instanceof ArrayBuffer)) {
        console.error('收到非ArrayBuffer数据:', typeof data);
        return;
      }

      const message = protobufManager.decode(data);
      const msgType = message.msg_type || message.msgType;
      const msgContent = message.msg_content || message.msgContent;

      switch (msgType) {
        case MSG_TYPE.REGISTER:
          this.isRegistered = true;
          break;
        case MSG_TYPE.TEXT:
        case MSG_TYPE.IMAGE:
          this.notifyHandlers(message);
          break;
        case MSG_TYPE.SYSTEM:
          if (msgContent && msgContent.indexOf('注册成功') !== -1) {
            this.isRegistered = true;
          }
          break;
        case MSG_TYPE.HEARTBEAT:
          break;
        default:
          console.warn('未知消息类型:', msgType, message);
      }
    } catch (error) {
      console.error('消息解码失败:', error);
    }
  }

  notifyHandlers(message) {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('消息处理器执行失败:', error);
      }
    });
  }

  addMessageHandler(handler) {
    if (typeof handler === 'function' && this.messageHandlers.indexOf(handler) === -1) {
      this.messageHandlers.push(handler);
    }
  }

  removeMessageHandler(handler) {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        try {
          const heartbeatMsg = protobufManager.createHeartbeatMessage(this.userType, this.userId);
          const binaryData = protobufManager.encode(heartbeatMsg);
          this.sendBinary(binaryData);
        } catch (error) {
          console.error('心跳发送失败:', error);
        }
      }
    }, HEARTBEAT_INTERVAL);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('WebSocket重连次数已达上限，停止重连');
      return;
    }
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.userType, this.userId);
    }, RECONNECT_DELAY);
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
    if (this.ws) {
      try {
        this.ws.close();
      } catch (error) {
        console.error('关闭WebSocket异常:', error);
      }
      this.ws = null;
    }
    this.isConnected = false;
    this.isRegistered = false;
    this.messageHandlers = [];
  }

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

export default new WebSocketProtobufManager();

