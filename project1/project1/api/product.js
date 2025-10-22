// 商品管理API
import { get, post, put, del } from '@/utils/request.js';

// 获取商品列表
export const getProductList = (params) => {
  return get('/api/product/list', params);
};

// 获取商品详情
export const getProductDetail = (id) => {
  return get('/api/product/' + id);
};

// 添加商品
export const addProduct = (data) => {
  return post('/api/product', data);
};

// 更新商品
export const updateProduct = (data) => {
  return put('/api/product', data);
};

// 删除商品
export const deleteProduct = (id) => {
  return del('/api/product/' + id);
};

// 批量删除商品
export const batchDeleteProduct = (ids) => {
  return del('/api/product/batch', { ids });
};

// 更新商品状态
export const updateProductStatus = (id, status) => {
  return put('/api/product/status', { id, status });
};

