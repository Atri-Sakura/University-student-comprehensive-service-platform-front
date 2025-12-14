import http from './request.js'

/**
 * 二手商品相关API
 */

/**
 * 发布二手商品
 * @param {Object} params 商品信息
 * @param {Array} params.files 商品图片数组（本地路径）
 * @param {String} params.goodsName 商品名称
 * @param {Number} params.price 商品价格
 * @param {String} params.category 商品分类
 * @param {String} params.description 商品描述
 * @returns {Promise}
 */
export const publishGoods = (params) => {
	return new Promise((resolve, reject) => {
		const { files, goodsName, price, category, description } = params
		
		// 如果只有一张图片，直接上传
		if (files && files.length === 1) {
			http.uploadFile({
				url: '/api/user/secondhandGoods/publish',
				filePath: files[0],
				name: 'files',
				formData: {
					goodsName,
					price,
					category,
					description
				}
			}).then(res => {
				resolve(res)
			}).catch(err => {
				reject(err)
			})
		} 
		// 多张图片需要特殊处理
		else if (files && files.length > 1) {
			// uni-app的uploadFile一次只能上传一个文件
			// 需要使用多次上传或者后端支持批量上传
			// 这里提供一个方案：循环上传每张图片
			const uploadPromises = []
			
			files.forEach((filePath, index) => {
				const uploadPromise = http.uploadFile({
					url: '/api/user/secondhandGoods/publish',
					filePath: filePath,
					name: 'files',
					formData: index === 0 ? {
						goodsName,
						price,
						category,
						description
					} : {}
				})
				uploadPromises.push(uploadPromise)
			})
			
			// 如果后端支持多次请求，使用Promise.all
			// 如果后端只需要一次请求，需要联系后端调整接口
			Promise.all(uploadPromises)
				.then(results => {
					resolve(results[results.length - 1])
				})
				.catch(err => {
					reject(err)
				})
		} else {
			reject(new Error('请至少上传一张商品图片'))
		}
	})
}

/**
 * 获取已发布二手商品列表
 * @param {Object} params 查询参数
 * @param {String} params.category 商品分类（可选）
 * @param {Number} params.pageNum 当前页码（默认1）
 * @param {Number} params.pageSize 每页数量（默认10）
 * @returns {Promise}
 */
export const getGoodsList = (params = {}) => {
	const { category, pageNum = 1, pageSize = 10 } = params
	
	// 构建查询参数
	const queryParams = {
		pageNum,
		pageSize
	}
	
	// 如果传入了category，则添加到查询参数中
	if (category) {
		queryParams.category = category
	}
	
	return http.get('/api/user/secondhandGoods/list', queryParams)
}

/**
 * 搜索二手商品
 * @param {Object} params 查询参数
 * @param {String} params.keyword 搜索关键字（可选）
 * @param {String} params.category 商品分类（可选）
 * @param {String} params.sortBy 排序字段：price、create_time、view_count（可选，默认create_time）
 * @param {String} params.sortOrder 排序方向：asc、desc（可选，默认desc）
 * @param {Number} params.pageNum 当前页码（可选，默认1）
 * @param {Number} params.pageSize 每页数量（可选，默认10）
 * @returns {Promise}
 */
export const searchGoods = (params = {}) => {
	const { keyword, category, sortBy = 'create_time', sortOrder = 'desc', pageNum = 1, pageSize = 10 } = params
	
	// 构建查询参数
	const queryParams = {
		pageNum,
		pageSize,
		sortBy,
		sortOrder
	}
	
	// 如果传入了keyword，添加到查询参数中
	if (keyword) {
		queryParams.keyword = keyword
	}
	
	// 如果传入了category，添加到查询参数中
	if (category) {
		queryParams.category = category
	}
	
	return http.get('/api/user/secondhandGoods/search', queryParams)
}

/**
 * 选择并上传商品图片
 * @param {Number} count 最多选择图片数量，默认9张
 * @returns {Promise} 返回选择的图片路径数组
 */
export const chooseGoodsImages = (count = 9) => {
	return new Promise((resolve, reject) => {
		uni.chooseImage({
			count: count,
			sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: (res) => {
				resolve(res.tempFilePaths)
			},
			fail: (err) => {
				reject(err)
			}
		})
	})
}

/**
 * 获取商品详情
 * @param {Number} goodsId 商品ID
 * @returns {Promise}
 */
export const getGoodsDetail = (goodsId) => {
	return http.get(`/api/user/secondhandGoods/detail/${goodsId}`)
}

/**
 * 创建二手商品订单
 * @param {Object} params 订单参数
 * @param {Number} params.goodsId 二手商品ID
 * @param {String} params.receiverName 收货人姓名
 * @param {String} params.receiverPhone 收货人手机号
 * @param {String} params.tradePlace 面交地点或收货地址
 * @param {Number} params.payType 支付方式：1余额 2微信 3支付宝 4面付
 * @param {String} params.remark 订单备注（可选）
 * @param {String} params.requestId 请求幂等标识（可选）
 * @returns {Promise}
 */
export const createOrder = (params) => {
	return http.post('/api/user/secondhandGoods/order/create', params)
}

/**
 * 支付订单
 * @param {String} orderNo 订单编号
 * @returns {Promise}
 */
export const payOrder = (orderNo) => {
	return http.post(`/api/user/secondhandGoods/order/pay/${orderNo}`)
}

/**
 * 确认收货/交易完成
 * @param {String} orderNo 订单编号
 * @returns {Promise}
 */
export const confirmOrder = (orderNo) => {
	return http.post(`/api/user/secondhandGoods/order/confirm/${orderNo}`)
}

/**
 * 获取二手商品订单详情
 * @param {String} orderNo 订单编号
 * @returns {Promise}
 */
export const getOrderDetail = (orderNo) => {
	return http.get(`/user/order/${orderNo}`)
}

/**
 * 获取卖家订单列表（作为卖家出售的商品订单）
 * @param {Object} params 查询参数（可选）
 * @returns {Promise}
 */
export const getSellerOrderList = (params = {}) => {
	return http.get('/api/user/secondhandGoods/order/seller/list', params)
}

/**
 * 生成唯一请求ID（用于幂等性）
 * @returns {String}
 */
export const generateRequestId = () => {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default {
	publishGoods,
	getGoodsList,
	searchGoods,
	getGoodsDetail,
	createOrder,
	payOrder,
	confirmOrder,
	getOrderDetail,
	getSellerOrderList,
	chooseGoodsImages,
	generateRequestId
}

