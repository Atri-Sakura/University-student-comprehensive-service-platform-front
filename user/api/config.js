// API配置文件

// 开发环境
const DEV_BASE_URL = 'http://localhost:8080'

// 生产环境（部署时修改为实际域名）
const PROD_BASE_URL = 'https://your-production-domain.com'

// 根据环境自动切换
export const BASE_URL = process.env.NODE_ENV === 'production' ? PROD_BASE_URL : DEV_BASE_URL

// 请求超时时间（毫秒）
export const TIMEOUT = 10000

// 上传文件超时时间（毫秒）
export const UPLOAD_TIMEOUT = 30000

// 商品分类选项（与后端接口文档保持一致）
export const GOODS_CATEGORIES = [
	{ code: 'ELECTRONICS', label: '数码电子', desc: '手机、耳机、平板、电脑配件' },
	{ code: 'BOOKS', label: '图书教材', desc: '教材、考研书、小说、工具书' },
	{ code: 'FURNITURE', label: '宿舍家具', desc: '桌椅、衣架、收纳箱、床帘' },
	{ code: 'CLOTHING', label: '服饰鞋包', desc: '衣物、鞋子、背包' },
	{ code: 'SPORTS', label: '体育运动', desc: '球拍、哑铃、滑板、运动鞋' },
	{ code: 'TRANSPORT', label: '交通工具', desc: '自行车、电动车、滑板车' },
	{ code: 'DAILY_USE', label: '生活用品', desc: '水杯、床上用品、小电器' },
	{ code: 'TICKETS', label: '票务卡券', desc: '校园活动票、食堂卡、公交卡' },
	{ code: 'OTHERS', label: '其他', desc: '不归类的物品' }
]

// 支付方式选项
export const PAY_TYPES = [
	{ value: 1, label: '余额支付', icon: '💰' },
	{ value: 2, label: '微信支付', icon: '💚' },
	{ value: 3, label: '支付宝支付', icon: '💙' },
	{ value: 4, label: '面付', icon: '🤝' }
]

// 订单状态
export const ORDER_STATUS = {
	1: { label: '待支付', color: '#FF9800' },
	2: { label: '待线下交付', color: '#2196F3' },
	3: { label: '已完成', color: '#4CAF50' },
	5: { label: '已取消', color: '#999999' }
}

export default {
	BASE_URL,
	TIMEOUT,
	UPLOAD_TIMEOUT,
	GOODS_CATEGORIES
}

