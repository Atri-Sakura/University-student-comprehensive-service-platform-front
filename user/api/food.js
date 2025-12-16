// 外卖相关API接口

// 导入统一的请求方法（支持大整数精度保护）
import request from './request.js';

// 为了保持代码兼容性，创建简单的封装
const get = (url, data, header) => request.get(url, data, header);
const post = (url, data, header) => request.post(url, data, header);

// 外卖相关API接口 - 用户端商品和商家接口
const foodApi = {
  // 用户端商品接口
  // 查询某商家商品列表
  getMerchantGoodsList(merchantBaseId) {
    return get(`/user/goods/merchant/${merchantBaseId}`)
  },
  
  // 获取商品详细信息
  getGoodsDetail(merchantGoodsId) {
    return get(`/user/goods/${merchantGoodsId}`)
  },
  
  // 获取商品近30天销量
  getGoodsMonthlySales(merchantGoodsId) {
    return get(`/merchant/goods/base/monthly/sales/${merchantGoodsId}`)
  },
  
  // 搜索某商家商品
  searchMerchantGoods(merchantBaseId, keyword) {
    return get(`/user/goods/merchant/${merchantBaseId}/search`, { keyword })
  },
  
  // 用户端商家接口
  // 查询营业中的商家列表
  getMerchantList() {
    return get('/user/merchant/list')
  },
  
  // 获取商家详细信息
  getMerchantDetail(merchantBaseId) {
    return get(`/user/merchant/${merchantBaseId}`)
  },
  
  // 搜索商家
  searchMerchant(keyword) {
    return get('/user/merchant/search', { keyword })
  },
  
  // 按经营范围筛选商家
  getMerchantByScope(businessScope) {
    return get(`/user/merchant/scope/${businessScope}`)
  },
  
  // 热门商家
  getHotMerchants() {
    return get('/user/merchant/hot')
  }
}

// 订单相关API接口
const orderApi = {
  // 创建订单
    createOrder(orderData) {
      return post('/user/order/create', orderData)
    },
  
  // 支付订单
  payOrder(orderId, payType) {
    return post(`/user/order/${orderId}/pay`, { payType })
  },
  
  // 获取订单详情
  getOrderDetail(orderId) {
    return get(`/user/order/${orderId}`)
  },
  
  // 创建预支付订单
  createPrepayOrder(orderData) {
    return post('/user/order/prepay', orderData)
  },
  
  // 支付并创建订单
  payAndCreateOrder(orderData) {
    return post('/user/order/pay-and-create', orderData)
  }
}

export default {
  ...foodApi,
  ...orderApi
}