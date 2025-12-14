/**
 * API统一入口
 * 汇总所有API模块，提供统一的导出
 */

// 导入基础请求
import { request as 请求, API_BASE_URL } from '../api.js';

// 导入各模块API
import * as authApi from './auth.js';
import * as riderApi from './rider.js';
import * as paymentApi from './payment.js';
import * as orderApi from './order.js';
import * as orderFlowApi from './orderFlow.js';
import * as chatApi from './chat.js';
import * as evaluationApi from './evaluation.js';
import feedbackApi from './feedback.js';
import * as roadApi from './road.js';

// ========== 重新导出所有API ==========

// 认证相关
export const {
	loginRider,
	registerRider,
	getCaptcha,
	getUserInfo,
	logout
} = authApi;

// 骑手信息相关
export const {
	getRiderBaseInfo,
	getRiderFullInfo,
	updateRiderBaseInfo,
	updateRiderPassword,
	uploadQualificationCertification
} = riderApi;

// 支付密码相关
export const {
	setPayPassword,
	updatePayPassword,
	resetPayPassword
} = paymentApi;

// 订单相关
export const {
	getNewOrders,
	getHistoryOrders
} = orderApi;

// 订单流转相关（骑手接单、取货、送达）
export const {
	// 订单查询
	getAvailableOrders,
	getMyOrders,
	getOrderDetail,
	getOrderStatistics,
	// 订单流转
	acceptOrder: riderAcceptOrder,
	pickupOrder: riderPickupOrder,
	deliverOrder: riderDeliverOrder
} = orderFlowApi;

// 评价相关
export const {
	getMyEvaluationList
} = evaluationApi;

// 聊天相关
export const {
	sendMessage,
	getMessageList,
	getSessionList,
	createSession,
	markSessionRead,
	getMessagesFromTo
} = chatApi;

// 路线相关
export const {
    getPickupCoords,
    getTargetCoords
} = roadApi;

// 反馈相关
export const getFeedbackInfo = feedbackApi.getFeedbackInfo;
export const addFeedback = feedbackApi.addFeedback;

// ========== 导出请求方法和配置 ==========
export { 请求, API_BASE_URL };

// ========== 默认导出 ==========
export default {
	// 基础
	请求,
	API_BASE_URL,
	
	// 认证相关
	...authApi,
	
	// 骑手信息相关
	...riderApi,
	
	// 支付密码相关
	...paymentApi,
	
	// 订单相关
	...orderApi,
	
	// 订单流转相关
	...orderFlowApi,

	// 反馈相关
	...feedbackApi,

    // 路线相关
    ...roadApi
};
