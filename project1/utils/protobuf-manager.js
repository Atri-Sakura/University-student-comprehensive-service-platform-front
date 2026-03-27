/**
 * Protobuf 编解码管理器
 * 使用 protobufjs 库处理二进制消息
 */

import protobuf from 'protobufjs';
import { CHAT_MESSAGE_PROTO_SCHEMA, MSG_TYPE } from './protobuf-schema.js';

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
      // 创建Root（完整版API）
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

      // 添加类型到root
      root.add(Attachment);
      root.add(ChatMessage);

      // 保存类型定义
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
   */
  encode(message) {
    if (!this.isInitialized) {
      throw new Error('Protobuf未初始化，请先调用init()');
    }

    try {
      const chatMessage = this.ChatMessage.create(message);
      const protobufData = this.ChatMessage.encode(chatMessage).finish();

      // 帧头：[8字节魔数] + [1字节类型] + [4字节长度]
      const frameHeaderSize = 13;
      const frameHeader = new Uint8Array(frameHeaderSize);
      const dataView = new DataView(frameHeader.buffer);

      // 高4字节0，低4字节魔数
      dataView.setUint32(0, 0x00000000, false);
      dataView.setUint32(4, 0xCAFEBABE, false);

      // 消息类型
      const msgType = message.msg_type || 0;
      frameHeader[8] = msgType;

      // 数据长度
      dataView.setUint32(9, protobufData.length, false);

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
   */
  decode(buffer) {
    if (!this.isInitialized) {
      throw new Error('Protobuf未初始化，请先调用init()');
    }

    try {
      let uint8Array;
      if (buffer instanceof ArrayBuffer) {
        uint8Array = new Uint8Array(buffer);
      } else if (buffer instanceof Uint8Array) {
        uint8Array = buffer;
      } else {
        throw new Error('不支持的buffer类型: ' + typeof buffer);
      }

      // 跳过帧头
      if (uint8Array.length > 13) {
        uint8Array = uint8Array.slice(13);
      }

      const message = this.ChatMessage.decode(uint8Array);
      return this.ChatMessage.toObject(message, {
        longs: String,
        enums: Number,
        bytes: String,
        defaults: true,
        arrays: true,
        objects: true,
        oneofs: true
      });
    } catch (error) {
      console.error('❌ Protobuf解码失败:', error);
      console.error('原始数据:', buffer);
      throw error;
    }
  }

  /**
   * 生成唯一消息ID
   */
  generateMessageId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return timestamp * 1000 + random;
  }

  createRegisterMessage(userType, userId) {
    return {
      message_id: 0,
      session_id: 0,
      from_type: userType,
      from_id: String(userId || '0'),
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

  createTextMessage(params) {
    const {
      sessionId,
      fromType,
      fromId,
      toType,
      toId,
      msgContent,
      content
    } = params;

    return {
      message_id: this.generateMessageId(),
      session_id: String(sessionId || '0'),
      from_type: fromType,
      from_id: String(fromId || '0'),
      to_type: toType,
      to_id: String(toId || '0'),
      msg_type: MSG_TYPE.TEXT,
      msg_content: msgContent || content || '',
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

  createHeartbeatMessage(userType, userId) {
    return {
      message_id: 0,
      session_id: 0,
      from_type: userType,
      from_id: String(userId || '0'),
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

export default new ProtobufManager();

