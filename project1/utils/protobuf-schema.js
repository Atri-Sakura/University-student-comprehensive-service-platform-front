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
  int64 message_id = 1;
  int64 session_id = 2;
  int32 from_type = 3; // 1-用户 2-骑手 3-商家 4-系统
  int64 from_id = 4;
  int32 to_type = 5;   // 1-用户 2-骑手 3-商家
  int64 to_id = 6;
  int32 msg_type = 7;  // 1-文本 2-图片 3-语音 4-系统通知
  string msg_content = 8;
  int32 msg_status = 9; // 0-发送中 1-已送达 2-已读 3-已撤回 4-发送失败
  string send_time = 10;
  string deliver_time = 11;
  string read_time = 12;
  int32 is_deleted = 13;
  string create_time = 14;
  string update_time = 15;

  repeated Attachment attachments = 16;
}

// 附件结构
message Attachment {
  int64 attachment_id = 1;
  int64 message_id = 2;
  int32 attachment_type = 3; // 1-图片 2-语音
  string attachment_url = 4;
  string file_name = 5;
  int64 file_size = 6;
  string file_ext = 7;
  string expire_time = 8;
  int32 is_valid = 9;
  string create_time = 10;
  string update_time = 11;
  bytes image_data = 12;
}
`;

// 消息类型枚举
export const MSG_TYPE = {
  REGISTER: 0,
  TEXT: 1,
  IMAGE: 2,
  VOICE: 3,
  SYSTEM: 4,
  HEARTBEAT: 6
};

// 用户类型枚举
export const USER_TYPE = {
  USER: 1,
  RIDER: 2,
  MERCHANT: 3,
  SYSTEM: 4
};

// 消息状态枚举
export const MSG_STATUS = {
  SENDING: 0,
  DELIVERED: 1,
  READ: 2,
  RECALLED: 3,
  FAILED: 4
};

