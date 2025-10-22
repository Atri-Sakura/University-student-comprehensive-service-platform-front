# 骑手端API接口文档

## 基础说明

### 基础URL
```
https://your-api.com/api
```

### 请求格式
- Content-Type: application/json
- Authorization: Bearer {token}

### 响应格式
```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

---

## 1. 骑手状态管理

### 1.1 获取骑手接单状态

**接口地址：** `GET /rider/status`

**请求参数：** 无

**响应示例：**
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "isReceiving": true,  // true: 接单中, false: 休息中
    "riderId": "R123456",
    "riderName": "张三",
    "updateTime": "2024-01-15 14:30:00"
  }
}
```

### 1.2 更新骑手接单状态

**接口地址：** `POST /rider/status`

**请求参数：**
```json
{
  "isReceiving": true  // true: 接单中, false: 休息中
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "状态更新成功",
  "data": {
    "isReceiving": true,
    "updateTime": "2024-01-15 14:30:00"
  }
}
```

---

## 2. 订单管理

### 2.1 获取新订单列表

**接口地址：** `GET /order/new`

**请求参数：**
- page: 页码（可选，默认1）
- pageSize: 每页数量（可选，默认10）

**响应示例：**
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "total": 25,
    "list": [
      {
        "id": "ORD2024123456",
        "merchant": "星巴克咖啡（人民广场店）",
        "address": "上海市黄浦区南京东路123号",
        "deliveryTime": "30分钟内",
        "type": "takeout",
        "typeText": "外卖",
        "price": "15.80",
        "distance": "2.5km",
        "createTime": "2024-01-15 14:00:00"
      }
    ]
  }
}
```

### 2.2 接单

**接口地址：** `POST /order/accept`

**请求参数：**
```json
{
  "orderId": "ORD2024123456"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "接单成功",
  "data": {
    "orderId": "ORD2024123456",
    "status": "pickup",
    "acceptTime": "2024-01-15 14:30:00"
  }
}
```

### 2.3 获取订单详情

**接口地址：** `GET /order/detail`

**请求参数：**
- orderId: 订单ID

**响应示例：**
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": "ORD2024123456",
    "merchant": "星巴克咖啡（人民广场店）",
    "merchantPhone": "021-12345678",
    "merchantAddress": "上海市黄浦区南京东路100号",
    "customerName": "李四",
    "customerPhone": "138****8888",
    "customerAddress": "上海市黄浦区南京东路123号",
    "deliveryTime": "30分钟内",
    "type": "takeout",
    "price": "15.80",
    "status": "pickup",
    "items": [
      {
        "name": "美式咖啡",
        "quantity": 2,
        "price": "25.00"
      }
    ]
  }
}
```

---

## 3. 用户认证

### 3.1 登录

**接口地址：** `POST /user/login`

**请求参数：**
```json
{
  "phone": "13800138000",
  "password": "123456"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": "U123456",
      "name": "张三",
      "phone": "138****8888",
      "avatar": "/static/avatar.png"
    }
  }
}
```

---

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（token过期或无效） |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 前端调用示例

### 使用封装的request方法

```javascript
import { API, request } from '@/utils/api.js';

// 获取骑手状态
async function getRiderStatus() {
  try {
    const res = await request({
      url: API.RIDER_STATUS,
      method: 'GET'
    });
    
    if (res.success) {
      console.log('接单状态:', res.data.isReceiving);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
}

// 更新骑手状态
async function updateRiderStatus(status) {
  try {
    const res = await request({
      url: API.RIDER_STATUS,
      method: 'POST',
      data: {
        isReceiving: status
      }
    });
    
    if (res.success) {
      console.log('更新成功');
    }
  } catch (error) {
    console.error('更新失败:', error);
  }
}
```

---

## 注意事项

1. **Token管理**
   - Token存储在本地Storage中
   - 每次请求自动添加到Header
   - Token过期时自动跳转登录页

2. **错误处理**
   - 网络错误会显示提示信息
   - 请求失败时使用本地缓存数据

3. **离线支持**
   - 关键数据会缓存到本地
   - 网络恢复后自动同步

4. **安全性**
   - 使用HTTPS协议
   - Token有效期建议7天
   - 敏感操作需要二次验证

