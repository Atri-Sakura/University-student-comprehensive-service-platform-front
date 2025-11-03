/**
 * 商品管理 API
 * 对接后端商品管理接口
 */

import { request } from './api.js'

// 基础URL - 与 api.js 中的 baseUrl 保持一致
const BASE_URL = 'http://localhost:8080/goods'

export default {
  /**
   * 获取商品列表（分页）
   * @param {Object} params - 分页参数 { pageNum, pageSize }
   * @returns {Promise}
   */
  async getGoodsList(params) {
    const url = `${BASE_URL}/list`
    
    try {
      const response = await request(url, {
        method: 'GET',
        data: params
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 添加商品
   * @param {Object} data - 商品数据
   * @returns {Promise}
   */
  async addGoods(data) {
    const url = `${BASE_URL}/add`
    
    try {
      const response = await request(url, {
        method: 'POST',
        data: data
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 修改商品
   * @param {Number} goodsId - 商品ID
   * @param {Object} data - 商品数据
   * @returns {Promise}
   */
  async updateGoods(goodsId, data) {
    const url = `${BASE_URL}/update/${goodsId}`
    
    try {
      const response = await request(url, {
        method: 'PUT',
        data: data
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 删除商品
   * @param {Number} goodsId - 商品ID
   * @returns {Promise}
   */
  async deleteGoods(goodsId) {
    const url = `${BASE_URL}/delete/${goodsId}`
    
    try {
      const response = await request(url, {
        method: 'DELETE'
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 商品上架
   * @param {Number} goodsId - 商品ID
   * @returns {Promise}
   */
  async upGoods(goodsId) {
    const url = `${BASE_URL}/up/${goodsId}`
    
    try {
      const response = await request(url, {
        method: 'PUT'
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 商品下架
   * @param {Number} goodsId - 商品ID
   * @returns {Promise}
   */
  async downGoods(goodsId) {
    const url = `${BASE_URL}/down/${goodsId}`
    
    try {
      const response = await request(url, {
        method: 'PUT'
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 获取商品详情
   * @param {Number} goodsId - 商品ID
   * @returns {Promise}
   */
  async getGoodsDetail(goodsId) {
    const url = `${BASE_URL}/detail/${goodsId}`
    
    try {
      const response = await request(url, {
        method: 'GET'
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 添加商品图片
   * @param {Number} goodsId - 商品ID
   * @param {String} imageUrl - 图片URL
   * @returns {Promise}
   */
  async addGoodsImage(goodsId, imageUrl) {
    const url = `${BASE_URL}/addImage/${goodsId}`
    
    try {
      const response = await request(url, {
        method: 'POST',
        data: { imageUrl: imageUrl },  // 包装为对象
        header: {
          'Content-Type': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * 删除商品图片
   * @param {Number} goodsId - 商品ID
   * @param {String} imageUrl - 图片URL
   * @returns {Promise}
   */
  async deleteGoodsImage(goodsId, imageUrl) {
    const url = `${BASE_URL}/deleteImage/${goodsId}`
    
    try {
      const response = await request(url, {
        method: 'DELETE',
        data: imageUrl,
        header: {
          'Content-Type': 'application/json'
        }
      })
      
      return response.data
    } catch (error) {
      throw error
    }
  }
}

