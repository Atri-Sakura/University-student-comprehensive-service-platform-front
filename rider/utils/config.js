/**
 * 应用配置文件
 * 统一管理不同环境下的配置
 */

// ========== 开发环境配置 ==========
const DEV_CONFIG = {
	// H5 端配置
	H5_API_BASE_URL: 'http://localhost:8080',
	
	// App 端配置（已更新为您的电脑实际 IP 地址）
	APP_API_BASE_URL: 'http://192.168.100.15:8080',
	
	// 小程序端配置
	MP_API_BASE_URL: 'http://192.168.100.15:8080'
};

// ========== 生产环境配置 ==========
const PROD_CONFIG = {
	API_BASE_URL: 'https://your-production-domain.com'
};

// ========== 环境判断 ==========
function getApiBaseUrl() {
	// 判断是否为生产环境
	// #ifdef APP-PLUS
	if (process.env.NODE_ENV === 'production') {
		return PROD_CONFIG.API_BASE_URL;
	}
	// #endif
	
	// 开发环境根据平台选择
	// #ifdef H5
	return DEV_CONFIG.H5_API_BASE_URL;
	// #endif
	
	// #ifdef APP-PLUS
	return DEV_CONFIG.APP_API_BASE_URL;
	// #endif
	
	// #ifdef MP
	return DEV_CONFIG.MP_API_BASE_URL;
	// #endif
	
	// 默认配置
	return DEV_CONFIG.H5_API_BASE_URL;
}

// ========== 其他配置 ==========
const APP_CONFIG = {
	// 应用信息
	APP_NAME: '蜂鸟骑士',
	VERSION: '1.0.0',
	
	// 请求配置
	REQUEST_TIMEOUT: 10000, // 请求超时时间（毫秒）
	
	// 缓存配置
	CACHE_KEYS: {
		TOKEN: 'token',
		USER_INFO: 'userInfo',
		RIDER_INFO: 'riderInfo',
		USER_TYPE: 'userType',
		IDENTITY: 'identity',
		IDENTITY_KEY: 'identityKey'
	},
	
	// 页面路径
	PAGES: {
		LOGIN: '/pages/login/login',
		INDEX: '/pages/index/index',
		PROFILE: '/pages/profile/profile'
	}
};

// ========== 导出配置 ==========
export const API_BASE_URL = getApiBaseUrl();
export const CONFIG = APP_CONFIG;

export default {
	API_BASE_URL,
	CONFIG: APP_CONFIG,
	DEV_CONFIG,
	PROD_CONFIG
};
