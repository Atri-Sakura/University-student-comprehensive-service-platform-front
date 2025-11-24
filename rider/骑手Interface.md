# Rider Interface

## 查询骑手脱敏基本信息

接口：GET http://localhost:8080/api/rider/base/info

响应：

```json
{
    "msg": "操作成功",
    "code": 200,
    "data": {
        "riderBaseId": 1,
        "nickname": "pig1",
        "avatar": "https://example.com/avatar1.jpg",
        "realName": "旺旺",
        "idCard": "4101**********1234",
        "phone": "139****9999",
        "creditScore": 650,
        "accountStatus": 1,
        "createTime": "2025-10-20 21:22:54"
    }
}
```

## 修改骑手基本信息

接口：POST http://localhost:8080/api/rider/base/update

参数：都非必须

nickname  string

phone  string 

avatar file

## 修改骑手密码接口设计

### principal

1. 二次验证：需要先使用旧密码
2. 暂定是否需要下线所有token(使所有登陆失效)要求重新登陆
3. 密码复杂度规则，不允许与旧密码相同
4. 安全通知，短信??这个可以考虑预留，先学会实现思路
5. 限制修改频率每天最多三次
6. CSRF/XSS：这个需要补充

### about token

token的有效期是后端决定的针对web与app有不同的策略，有时token只要用一次就重置过期时间确保无需重新登陆

### current realize

改密码成功后：删除当前登录 token 对应的会话 + 返回“需要重新登录”的标识，App 收到后清掉本地 token 并跳登录页。

接口：POST http://localhost:8080/api/rider/base/password

参数：

| 字段名          | 类型   | 必填 | 说明                                   |
| --------------- | ------ | ---- | -------------------------------------- |
| oldPassword     | string | 是   | 原密码（明文，用户当前登录使用的密码） |
| newPassword     | string | 是   | 新密码（明文）                         |
| confirmPassword | string | 是   | 确认新密码，应与 `newPassword` 一致    |

```apl
{
  "oldPassword": "123456",
  "newPassword": "abc12345",
  "confirmPassword": "abc12345"
}

```

响应：

```apl
{
  "code": 200,
  "msg": "密码修改成功，请重新登录",
  "data": null
}

{
  "code": 500,
  "msg": "原密码不正确",
  "data": null
}

{
  "code": 500,
  "msg": "两次输入的新密码不一致",
  "data": null
}

{
  "code": 500,
  "msg": "新密码必须为 6-20 位，且同时包含字母和数字，不能包含空格",
  "data": null
}

{
  "code": 401,
  "msg": "未登录或登录已过期",
  "data": null
}

```

## 骑手支付相关接口

### 设置支付密码(第一次使用时需要)

1. 若需要输入手机验证码这个实现怎么搞，直接random生成验证码5分钟有效存入redis,把信息传给第三方发给用户，
2. 需要验证码为了更安全避免账户被盗用户能直接设置支付密码，这样即使账户被盗也需要手机验证码，但盗号的不一定知道你的手机号的验证码

接口：POST http://localhost:8080/api/rider/pay/password/set

请求参数(Body)

| 字段名             | 类型   | 必填 | 说明                       |
| ------------------ | ------ | ---- | -------------------------- |
| payPassword        | string | 是   | 支付密码（6 位数字）       |
| confirmPayPassword | string | 是   | 确认支付密码，应与前者一致 |

```json
{
  "payPassword": "123456",
  "confirmPayPassword": "123456"
}

```

响应：

```json
设置成功
{
  "code": 200,
  "msg": "支付密码设置成功",
  "data": null
}
输入不一致
{
  "code": 500,
  "msg": "两次输入的支付密码不一致",
  "data": null
}
格式不对
{
  "code": 500,
  "msg": "支付密码必须为 6 位数字",
  "data": null
}

当前骑手未成功注册
{
  "code": 500,
  "msg": "当前账号未绑定骑手信息",
  "data": null
}

已设置过支付密码
{
  "code": 500,
  "msg": "已设置支付密码，请使用修改支付密码功能",
  "data": null
}
Token失效
{
  "code": 401,
  "msg": "未登录或登录已过期",
  "data": null
}



```



### 验证支付密码

1. 扣款需要记账+监管需求用于扣税
2. 如何与真钱对其的，虚拟数字，需要严格审核记录，避免恶意修改

### 修改支付密码

接口：POST http://localhost:8080/api/rider/pay/password/update

参数(Body)

| 字段名                | 类型   | 必填 | 说明                                       |
| --------------------- | ------ | ---- | ------------------------------------------ |
| oldPayPassword        | string | 是   | 原支付密码（明文，当前正在使用的）         |
| newPayPassword        | string | 是   | 新支付密码（明文）                         |
| confirmNewPayPassword | string | 是   | 确认新支付密码，应与 `newPayPassword` 一致 |

```json
{
  "oldPayPassword": "123456",
  "newPayPassword": "222222",
  "confirmNewPayPassword": "222222"
}

```



响应：

| 字段名 | 类型          | 说明                          |
| ------ | ------------- | ----------------------------- |
| code   | int           | 状态码，`200` 表示成功        |
| msg    | string        | 提示信息                      |
| data   | object / null | 业务数据，本接口一般为 `null` |

```json
修改成功
{
  "code": 200,
  "msg": "支付密码修改成功",
  "data": null
}

新密码确认密码不一致
{
  "code": 500,
  "msg": "两次输入的新支付密码不一致",
  "data": null
}

原支付密码错误
{
  "code": 500,
  "msg": "原支付密码不正确",
  "data": null
}
支付密码未设置
{
  "code": 500,
  "msg": "尚未设置支付密码，请先设置支付密码",
  "data": null
}
新支付密码格式不对
{
  "code": 500,
  "msg": "支付密码必须为 6 位数字",
  "data": null
}
新旧密码相同
{
  "code": 500,
  "msg": "新支付密码不能与原支付密码相同",
  "data": null
}

{
  "code": 401,
  "msg": "未登录或登录已过期",
  "data": null
}



```



### 忘记支付密码





