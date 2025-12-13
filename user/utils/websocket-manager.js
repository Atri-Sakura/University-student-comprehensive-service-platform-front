/**
 * WebSocket连接管理器
 * 用于实时消息通信
 */

const WS_URL = 'ws://localhost:8010/ws';
const RECONNECT_DELAY = 3000; // 重连延迟（毫秒）
const MAX_RECONNECT_ATTEMPTS = 5; // 最大重连次数

class WebSocketManager {
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
  }

  /**
   * 连接WebSocket并注册身份
   * @param {Number} userType - 用户类型（1-用户 2-骑手 3-商家）
   * @param {String} userId - 用户ID
   */
  connect(userType, userId) {
    console.log('🔌 [WebSocket] 开始连接...', { 
      userType, 
      userId: String(userId),
      url: WS_URL 
    });
    
    this.userType = userType;
    this.userId = String(userId);
    
    // 如果已经连接，先关闭
    if (this.ws) {
      console.log('🔄 [WebSocket] 已有连接，先断开...');
      this.disconnect();
    }
    
    try {
      this.ws = uni.connectSocket({
        url: WS_URL,
        success: () => {
          console.log('📡 [WebSocket] 连接请求已发送到:', WS_URL);
        },
        fail: (error) => {
          console.error('❌ [WebSocket] 连接请求失败:', error);
          console.error('❌ [WebSocket] 请检查后端服务是否运行在', WS_URL);
          this.handleReconnect();
        }
      });
      
      // 监听连接成功
      this.ws.onOpen(() => {
        console.log('✅ [WebSocket] 连接已建立');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // 发送注册消息
        this.register();
        
        // 启动心跳
        this.startHeartbeat();
      });
      
      // 监听消息
      this.ws.onMessage((res) => {
        console.log('📩 [WebSocket] 收到原始消息:', res.data);
        this.handleMessage(res.data);
      });
      
      // 监听错误
      this.ws.onError((error) => {
        console.error('❌ [WebSocket] 连接错误:', error);
        console.error('❌ [WebSocket] 错误详情:', JSON.stringify(error));
        this.isConnected = false;
        this.isRegistered = false;
      });
      
      // 监听关闭
      this.ws.onClose((res) => {
        console.log('🔌 [WebSocket] 连接已关闭');
        console.log('🔌 [WebSocket] 关闭信息:', res);
        this.isConnected = false;
        this.isRegistered = false;
        this.stopHeartbeat();
        
        // 尝试重连
        this.handleReconnect();
      });
      
    } catch (error) {
      console.error('创建WebSocket连接异常:', error);
      this.handleReconnect();
    }
  }
  
  /**
   * 注册用户身份
   */
  register() {
    if (!this.isConnected) {
      console.warn('WebSocket未连接，无法注册');
      return;
    }
    
    const registerMsg = {
      type: 'REGISTER',
      userType: this.userType,
      userId: this.userId,
      timestamp: Date.now()
    };
    
    console.log('发送注册消息:', registerMsg);
    
    this.sendRaw(JSON.stringify(registerMsg));
    this.isRegistered = true;
  }
  
  /**
   * 发送消息
   * @param {Object} messageData - 消息数据
   */
  sendMessage(messageData) {
    if (!this.isConnected || !this.isRegistered) {
      console.error('WebSocket未连接或未注册，无法发送消息');
      return Promise.reject(new Error('WebSocket未就绪'));
    }
    
    const msg = {
      type: 'MESSAGE',
      ...messageData,
      timestamp: Date.now()
    };
    
    console.log('通过WebSocket发送消息:', msg);
    
    try {
      this.sendRaw(JSON.stringify(msg));
      return Promise.resolve();
    } catch (error) {
      console.error('发送消息失败:', error);
      return Promise.reject(error);
    }
  }
  
  /**
   * 发送原始数据
   * @param {String} data - 要发送的数据
   */
  sendRaw(data) {
    if (!this.ws || !this.isConnected) {
      throw new Error('WebSocket未连接');
    }
    
    this.ws.send({
      data: data,
      success: () => {
        console.log('WebSocket消息发送成功');
      },
      fail: (error) => {
        console.error('WebSocket消息发送失败:', error);
      }
    });
  }
  
  /**
   * 处理接收到的消息
   * @param {String} data - 消息数据
   */
  handleMessage(data) {
    try {
      console.log('收到WebSocket消息:', data);
      
      let message;
      if (typeof data === 'string') {
        message = JSON.parse(data);
      } else {
        message = data;
      }
      
      // 处理不同类型的消息
      switch (message.type) {
        case 'REGISTER_ACK':
          console.log('注册确认:', message);
          this.isRegistered = true;
          break;
          
        case 'MESSAGE':
          console.log('收到聊天消息:', message);
          // 通知所有消息处理器
          this.messageHandlers.forEach(handler => {
            try {
              handler(message);
            } catch (error) {
              console.error('消息处理器执行错误:', error);
            }
          });
          break;
          
        case 'PONG':
          console.log('收到心跳响应');
          break;
          
        default:
          console.log('未知消息类型:', message.type);
      }
    } catch (error) {
      console.error('处理WebSocket消息失败:', error, data);
    }
  }
  
  /**
   * 添加消息处理器
   * @param {Function} handler - 消息处理函数
   */
  addMessageHandler(handler) {
    if (typeof handler === 'function') {
      this.messageHandlers.push(handler);
    }
  }
  
  /**
   * 移除消息处理器
   * @param {Function} handler - 要移除的处理函数
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
        const ping = {
          type: 'PING',
          timestamp: Date.now()
        };
        
        try {
          this.sendRaw(JSON.stringify(ping));
        } catch (error) {
          console.error('发送心跳失败:', error);
        }
      }
    }, 30000); // 每30秒发送一次心跳
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
    // 清除之前的重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    // 检查是否超过最大重连次数
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('WebSocket重连次数已达上限，停止重连');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`准备第${this.reconnectAttempts}次重连...`);
    
    this.reconnectTimer = setTimeout(() => {
      if (this.userType && this.userId) {
        this.connect(this.userType, this.userId);
      }
    }, RECONNECT_DELAY);
  }
  
  /**
   * 断开连接
   */
  disconnect() {
    console.log('主动断开WebSocket连接');
    
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close({
        success: () => {
          console.log('WebSocket连接已关闭');
        }
      });
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isRegistered = false;
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
      userId: this.userId
    };
  }
}

// 创建单例
const wsManager = new WebSocketManager();

export default wsManager;
