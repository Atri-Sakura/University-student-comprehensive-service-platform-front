// API配置文件

// 基础URL - 请替换为实际的后端服务器地址
const BASE_URL = 'https://your-api.com/api';

// API接口地址
const API = {
	// 骑手相关
	RIDER_STATUS: BASE_URL + '/rider/status', // 获取/更新骑手接单状态
	RIDER_INFO: BASE_URL + '/rider/info', // 获取骑手信息
	
	// 订单相关
	ORDER_NEW: BASE_URL + '/order/new', // 获取新订单列表
	ORDER_PICKUP: BASE_URL + '/order/pickup', // 获取待取货订单
	ORDER_DELIVERY: BASE_URL + '/order/delivery', // 获取待送达订单
	ORDER_ACCEPT: BASE_URL + '/order/accept', // 接单
	ORDER_DETAIL: BASE_URL + '/order/detail', // 订单详情
	
	// 用户相关
	USER_LOGIN: BASE_URL + '/user/login', // 登录
	USER_LOGOUT: BASE_URL + '/user/logout', // 登出
	USER_INFO: BASE_URL + '/user/info', // 用户信息
};

// 通用请求方法
const request = (options) => {
	return new Promise((resolve, reject) => {
		// 获取token
		const token = uni.getStorageSync('token') || '';
		
		// 设置默认header
		const header = {
			'Content-Type': 'application/json',
			...(options.header || {})
		};
		
		// 如果有token，添加到header
		if (token) {
			header['Authorization'] = 'Bearer ' + token;
		}
		
		uni.request({
			url: options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header: header,
			success: (res) => {
				// 判断请求是否成功
				if (res.statusCode === 200) {
					resolve(res.data);
				} else if (res.statusCode === 401) {
					// token过期或未登录
					uni.showToast({
						title: '请先登录',
						icon: 'none'
					});
					// 跳转到登录页
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/login/login'
						});
					}, 1500);
					reject(res);
				} else {
					uni.showToast({
						title: res.data.message || '请求失败',
						icon: 'none'
					});
					reject(res);
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络请求失败',
					icon: 'none'
				});
				reject(err);
			}
		});
	});
};

// 导出API和request方法
export { API, request };

