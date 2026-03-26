/**
 * Protobuf Schema 定义
 * 必须与后端 chat_message.proto 保持一致
 */

// 完整的Protobuf Schema定义（与后端chat_message.proto完全一致）
export const CHAT_MESSAGE_PROTO_SCHEMA = `
syntax = "proto3";
package protobuf;

// 聊天消息主结构
message ChatMessage {
  // 对应 chat_message.message_id
  int64 message_id = 1;
  // 对应 chat_message.session_id
  int64 session_id = 2;
  // 对应 chat_message.from_type，1-用户 2-骑手 3-商家 4-系统
  int32 from_type = 3;
  // 对应 chat_message.from_id
  int64 from_id = 4;
  // 对应 chat_message.to_type，1-用户 2-骑手 3-商家
  int32 to_type = 5;
  // 对应 chat_message.to_id
  int64 to_id = 6;
  // 对应 chat_message.msg_type，1-文本 2-图片 3-语音 4-系统通知
  int32 msg_type = 7;
  // 对应 chat_message.msg_content
  string msg_content = 8;
  // 对应 chat_message.msg_status，0-发送中 1-已送达 2-已读 3-已撤回 4-发送失败
  int32 msg_status = 9;
  // 对应 chat_message.send_time
  string send_time = 10;
  // 对应 chat_message.deliver_time
  string deliver_time = 11;
  // 对应 chat_message.read_time
  string read_time = 12;
  // 对应 chat_message.is_deleted，0-未删除 1-已删除
  int32 is_deleted = 13;
  // 对应 chat_message.create_time
  string create_time = 14;
  // 对应 chat_message.update_time
  string update_time = 15;

  // 关联的附件列表（对应 chat_attachment，一条消息可多个附件）
  repeated Attachment attachments = 16;
}

// 附件结构（对应 chat_attachment 表）
message Attachment {
  // 对应 chat_attachment.attachment_id
  int64 attachment_id = 1;
  // 对应 chat_attachment.message_id（关联到 ChatMessage.message_id）
  int64 message_id = 2;
  // 对应 chat_attachment.attachment_type，1-图片 2-语音
  int32 attachment_type = 3;
  // 对应 chat_attachment.attachment_url
  string attachment_url = 4;
  // 对应 chat_attachment.file_name
  string file_name = 5;
  // 对应 chat_attachment.file_size
  int64 file_size = 6;
  // 对应 chat_attachment.file_ext
  string file_ext = 7;
  // 对应 chat_attachment.expire_time
  string expire_time = 8;
  // 对应 chat_attachment.is_valid，0-无效 1-有效
  int32 is_valid = 9;
  // 对应 chat_attachment.create_time
  string create_time = 10;
  // 对应 chat_attachment.update_time
  string update_time = 11;

  bytes image_data = 12;
}
`;

/**
 * 消息类型枚举（与后端保持一致）
 */
export const MSG_TYPE = {
  REGISTER: 0,     // 注册消息
  TEXT: 1,         // 文本消息
  IMAGE: 2,        // 图片消息
  VOICE: 3,        // 语音消息
  SYSTEM: 4,       // 系统通知
  HEARTBEAT: 6     // 心跳消息
};

/**
 * 用户类型枚举
 */
export const USER_TYPE = {
  USER: 1,         // 用户
  RIDER: 2,        // 骑手
  MERCHANT: 3,     // 商家
  SYSTEM: 4        // 系统
};

/**
 * 消息状态枚举
 */
export const MSG_STATUS = {
  SENDING: 0,      // 发送中
  DELIVERED: 1,    // 已送达
  READ: 2,         // 已读
  RECALLED: 3,     // 已撤回
  FAILED: 4        // 发送失败
};
