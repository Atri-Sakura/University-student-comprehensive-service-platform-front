// API统一导出文件
import secondhandGoodsApi from './secondhandGoods.js'
import userApi from './user.js'
import indexPageApi from './indexPage.js'
import foodApi from './food.js'

export default {
	secondhandGoods: secondhandGoodsApi,
	user: userApi,
	indexPage: indexPageApi,
	food: foodApi
}

