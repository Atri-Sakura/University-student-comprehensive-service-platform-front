/**
 * Protobuf 编解码管理器
 * 使用 protobufjs 库处理二进制消息
 */

import { CHAT_MESSAGE_PROTO_SCHEMA, MSG_TYPE, USER_TYPE } from './protobuf-schema.js';

// uni-app兼容的导入方式 - 使用静态import（webpack会处理）
// 注意：如果webpack配置不支持，可能需要配置resolve.alias
let protobuf = null;

// 尝试多种方式加载protobufjs
if (typeof window !== 'undefined' && window.uni) {
  // uni-app环境，尝试require
  try {
    protobuf = require('protobufjs');
    console.log('✅ protobufjs加载成功（require）');
  } catch (e) {
    console.warn('⚠️ require方式失败，将在init时尝试动态加载');
  }
} else {
  // 非uni-app环境，直接require
  try {
    protobuf = require('protobufjs');
    console.log('✅ protobufjs加载成功（require）');
  } catch (e) {
    console.warn('⚠️ require方式失败，将在init时尝试动态加载');
  }
}

class ProtobufManager {
  constructor() {
    this.root = null;
    this.ChatMessage = null;
    this.Attachment = null;
    this.isInitialized = false;
  }

  /**
   * 初始化Protobuf（必须在使用前调用）
   */
  async init() {
    if (this.isInitialized) {
      return;
    }

    try {
      // 确保protobuf已加载
      if (!protobuf) {
        try {
          // 尝试动态import
          const protobufModule = await import('protobufjs');
          protobuf = protobufModule.default || protobufModule;
          console.log('✅ protobufjs动态加载成功');
        } catch (e) {
          console.error('❌ protobufjs加载失败:', e);
          throw new Error('请先安装protobufjs: npm install protobufjs。如果已安装，请重启开发服务器。');
        }
      }
      
      // 手动构建protobuf类型定义
      const root = new protobuf.Root();
      
      // 定义Attachment消息
      const Attachment = new protobuf.Type('Attachment')
        .add(new protobuf.Field('attachment_id', 1, 'int64'))
        .add(new protobuf.Field('message_id', 2, 'int64'))
        .add(new protobuf.Field('attachment_type', 3, 'int32'))
        .add(new protobuf.Field('attachment_url', 4, 'string'))
        .add(new protobuf.Field('file_name', 5, 'string'))
        .add(new protobuf.Field('file_size', 6, 'int64'))
        .add(new protobuf.Field('file_ext', 7, 'string'))
        .add(new protobuf.Field('expire_time', 8, 'string'))
        .add(new protobuf.Field('is_valid', 9, 'int32'))
        .add(new protobuf.Field('create_time', 10, 'string'))
        .add(new protobuf.Field('update_time', 11, 'string'))
        .add(new protobuf.Field('image_data', 12, 'bytes'));
      
      // 定义ChatMessage消息
      const ChatMessage = new protobuf.Type('ChatMessage')
        .add(new protobuf.Field('message_id', 1, 'int64'))
        .add(new protobuf.Field('session_id', 2, 'int64'))
        .add(new protobuf.Field('from_type', 3, 'int32'))
        .add(new protobuf.Field('from_id', 4, 'int64'))
        .add(new protobuf.Field('to_type', 5, 'int32'))
        .add(new protobuf.Field('to_id', 6, 'int64'))
        .add(new protobuf.Field('msg_type', 7, 'int32'))
        .add(new protobuf.Field('msg_content', 8, 'string'))
        .add(new protobuf.Field('msg_status', 9, 'int32'))
        .add(new protobuf.Field('send_time', 10, 'string'))
        .add(new protobuf.Field('deliver_time', 11, 'string'))
        .add(new protobuf.Field('read_time', 12, 'string'))
        .add(new protobuf.Field('is_deleted', 13, 'int32'))
        .add(new protobuf.Field('create_time', 14, 'string'))
        .add(new protobuf.Field('update_time', 15, 'string'))
        .add(new protobuf.Field('attachments', 16, 'Attachment', 'repeated'));
      
      // 添加到root
      root.add(Attachment);
      root.add(ChatMessage);
      
      this.root = root;
      this.ChatMessage = ChatMessage;
      this.Attachment = Attachment;
      
      this.isInitialized = true;
      
    } catch (error) {
      console.error('❌ Protobuf初始化失败:', error);
      throw new Error('Protobuf初始化失败: ' + error.message);
    }
  }

  /**
   * 编码：将JavaScript对象编码为Protobuf二进制数据（带自定义帧头）
   * @param {Object} message - 消息对象
   * @returns {ArrayBuffer} 二进制数据
   */
  encode(message) {
    if (!this.isInitialized) {
      throw new Error('Protobuf未初始化，请先调用init()');
    }

    try {
      // 直接创建消息实例（create方法会自动处理字符串形式的long，无需手动转换）
      // Protobuf.js的create方法能正确处理字符串 -> Long的转换，避免JavaScript精度丢失
      const chatMessage = this.ChatMessage.create(message);
      
      // 编码为二进制
      const protobufData = this.ChatMessage.encode(chatMessage).finish();
      
      // 后端期望格式：[8字节魔数] + [1字节类型] + [4字节长度] + [Protobuf数据]
      const frameHeaderSize = 13; // 8 + 1 + 4
      const frameHeader = new Uint8Array(frameHeaderSize);
      const dataView = new DataView(frameHeader.buffer);
      
      // 1. 前8字节：魔数 0xCAFEBABEL（Java long，大端序）
      // Java中 0xCAFEBABEL = 0x00000000CAFEBABE（8字节）
      dataView.setUint32(0, 0x00000000, false); // 高4字节为0
      dataView.setUint32(4, 0xCAFEBABE, false); // 低4字节是魔数
      
      // 2. 第9字节：消息类型（从msg_type映射）
      const msgType = message.msg_type || 0;
      frameHeader[8] = msgType;
      
      // 3. 第10-13字节：Protobuf数据长度（大端序）
      dataView.setUint32(9, protobufData.length, false);
      
      // 4. 合并帧头和Protobuf数据
      const finalData = new Uint8Array(frameHeaderSize + protobufData.length);
      finalData.set(frameHeader, 0);
      finalData.set(protobufData, frameHeaderSize);
      
      return finalData.buffer;
      
    } catch (error) {
      console.error('❌ Protobuf编码失败:', error, message);
      throw error;
    }
  }

  /**
   * 解码：将Protobuf二进制数据解码为JavaScript对象
   * @param {ArrayBuffer|Uint8Array} buffer - 二进制数据
   * @returns {Object} 消息对象
   */
  decode(buffer) {
    if (!this.isInitialized) {
      throw new Error('Protobuf未初始化，请先调用init()');
    }

    try {
      // 转换为Uint8Array
      let uint8Array;
      if (buffer instanceof ArrayBuffer) {
        uint8Array = new Uint8Array(buffer);
      } else if (buffer instanceof Uint8Array) {
        uint8Array = buffer;
      } else {
        throw new Error('不支持的buffer类型: ' + typeof buffer);
      }

      // 打印原始二进制数据（前30字节的十六进制）

      // 跳过前13字节的帧头：[8字节魔数] + [1字节类型] + [4字节长度]
      if (uint8Array.length > 13) {
        const dataView = new DataView(uint8Array.buffer, uint8Array.byteOffset);
        
        // 读取8字节魔数（Java long）
        const magicHigh = dataView.getUint32(0, false);
        const magicLow = dataView.getUint32(4, false);
        
        // 读取1字节消息类型
        const msgType = uint8Array[8];
        
        // 读取4字节数据长度
        const dataLength = dataView.getUint32(9, false);
        
        // 跳过13字节帧头，只解码Protobuf部分
        uint8Array = uint8Array.slice(13);
      }

      // 解码Protobuf数据
      const message = this.ChatMessage.decode(uint8Array);
      
      // 转换为普通对象
      const plainObject = this.ChatMessage.toObject(message, {
        longs: String,     // 将long类型转为字符串（避免精度丢失）
        enums: Number,     // 枚举保持为数字
        bytes: String,     // bytes转为字符串
        defaults: true,    // 包含默认值
        arrays: true,      // 包含空数组
        objects: true,     // 包含空对象
        oneofs: true       // 包含oneof字段
      });

      return plainObject;
      
    } catch (error) {
      console.error('❌ Protobuf解码失败:', error);
      console.error('原始数据:', buffer);
      throw error;
    }
  }

  /**
   * 生成唯一消息ID（使用时间戳+随机数）
   */
  generateMessageId() {
    // 时间戳（毫秒）+ 3位随机数，确保唯一性
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return timestamp * 1000 + random;
  }

  /**
   * 创建注册消息
   */
  createRegisterMessage(userType, userId) {
    return {
      message_id: 0,
      session_id: 0,
      from_type: userType,
      from_id: String(userId || '0'),  // 字符串，由Protobuf.js自动转Long
      to_type: 0,
      to_id: '0',
      msg_type: MSG_TYPE.REGISTER,
      msg_content: '注册消息',
      msg_status: 0,
      send_time: new Date().toISOString(),
      deliver_time: '',
      read_time: '',
      is_deleted: 0,
      create_time: new Date().toISOString(),
      update_time: '',
      attachments: []
    };
  }

  /**
   * 创建文本消息
   */
  createTextMessage(params) {
    const {
      sessionId,
      fromType,
      fromId,
      toType,
      toId,
      msgContent,
      content  // 兼容content字段
    } = params;

    return {
      message_id: this.generateMessageId(), // 数值型，由generateMessageId生成
      session_id: String(sessionId || '0'),  // 字符串，由Protobuf.js自动转Long
      from_type: fromType,
      from_id: String(fromId || '0'),  // 字符串，由Protobuf.js自动转Long
      to_type: toType,
      to_id: String(toId || '0'),  // 字符串，由Protobuf.js自动转Long
      msg_type: MSG_TYPE.TEXT,
      msg_content: msgContent || content || '',  // 兼容两种字段名
      msg_status: 0,
      send_time: new Date().toISOString(),
      deliver_time: '',
      read_time: '',
      is_deleted: 0,
      create_time: new Date().toISOString(),
      update_time: '',
      attachments: []
    };
  }

  /**
   * 创建心跳消息
   */
  createHeartbeatMessage(userType, userId) {
    return {
      message_id: 0,
      session_id: 0,
      from_type: userType,
      from_id: String(userId || '0'),  // 字符串，由Protobuf.js自动转Long
      to_type: 0,
      to_id: '0',
      msg_type: MSG_TYPE.HEARTBEAT,
      msg_content: 'ping',
      msg_status: 0,
      send_time: new Date().toISOString(),
      deliver_time: '',
      read_time: '',
      is_deleted: 0,
      create_time: new Date().toISOString(),
      update_time: '',
      attachments: []
    };
  }
}

// 导出单例
export default new ProtobufManager();
