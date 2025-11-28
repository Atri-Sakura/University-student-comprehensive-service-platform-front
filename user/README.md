# 校园生活 - 用户端

这是一个基于 uni-app 开发的校园生活服务平台用户端应用。

## 功能特性

### 首页
- 🎨 自定义导航栏（天蓝色渐变背景）
- 🖼️ 轮播图展示
- 📚 个人课表快捷入口
- 🏃 跑腿服务
- 🍔 外卖点餐
- 📅 今日课程列表
- 🍜 推荐外卖横向滚动

### 底部导航
- 首页
- 二手交易
- 消息
- 我的

## 项目结构

```
user/
├── pages/              # 页面文件
│   ├── index/         # 首页
│   ├── market/        # 二手交易
│   ├── message/       # 消息
│   └── mine/          # 我的
├── static/            # 静态资源（图片、图标等）
├── common/            # 公共样式和工具
├── App.vue            # 应用配置
├── main.js            # 入口文件
├── manifest.json      # 应用配置
├── pages.json         # 页面配置
└── uni.scss          # 全局样式变量
```

## 开发说明

### 运行项目

1. 使用 HBuilderX 打开项目
2. 选择运行到浏览器/模拟器/真机

或使用命令行：

```bash
# 运行到 H5
npm run dev:h5

# 运行到微信小程序
npm run dev:mp-weixin

# 运行到 APP
npm run dev:app-plus
```

### 图片资源说明

需要在 `static/` 目录下准备以下图片资源：

#### 导航栏
- `location.png` - 位置图标（白色，32x32rpx）

#### 功能图标
- `schedule.png` - 课表图标（蓝色，60x60rpx）
- `errand.png` - 跑腿图标（蓝色，60x60rpx）
- `food.png` - 外卖图标（蓝色，60x60rpx）

#### 轮播图
- `banner1.jpg` - 轮播图1（建议尺寸：750x400rpx）
- `banner2.jpg` - 轮播图2
- `banner3.jpg` - 轮播图3

#### 外卖推荐
- `food1.jpg` ~ `food4.jpg` - 外卖图片（200x200rpx）

#### 底部导航图标
- `tabbar/home.png` / `home-active.png` - 首页图标
- `tabbar/market.png` / `market-active.png` - 二手交易图标
- `tabbar/message.png` / `message-active.png` - 消息图标
- `tabbar/mine.png` / `mine-active.png` - 我的图标

## 技术栈

- uni-app
- Vue.js
- uni-ui（可选）

## 设计特点

1. **渐变背景导航栏**：使用天蓝色渐变（#89CFF0 到 #5DCDFF）
2. **卡片式设计**：所有模块使用圆角卡片，带有轻微阴影
3. **扁平化图标**：功能图标使用浅蓝色圆角背景
4. **清晰的信息层级**：使用不同字体大小和颜色区分信息重要性
5. **响应式布局**：适配不同屏幕尺寸

## 待开发功能

- [ ] 完善二手交易页面
- [ ] 完善消息页面
- [ ] 完善个人中心页面
- [ ] 实现课表详情页
- [ ] 实现跑腿服务页
- [ ] 实现外卖点餐页
- [ ] 接入后端 API

## 注意事项

1. 使用 rpx 单位进行布局，自动适配不同屏幕
2. 图片资源路径以 `/static/` 开头
3. 自定义导航栏需要适配不同设备的状态栏高度
4. 底部导航栏图标需要准备普通和选中两种状态

## 许可证

MIT

