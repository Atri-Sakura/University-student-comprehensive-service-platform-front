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
  },

  /**
   * 获取所有商品分类（主分类）
   * @returns {Promise}
   */
  async getCategories() {
    // 尝试多种可能的API路径
    const possibleUrls = [
      `${BASE_URL}/categories`,
      `${BASE_URL}/category/list`,
      `${BASE_URL}/category`,
      `http://localhost:8080/category/list`,
      `http://localhost:8080/category/categories`
    ]
    
    // 先尝试第一个路径
    let url = possibleUrls[0]
    
    try {
      const response = await request(url, {
        method: 'GET'
      })
      
      return response.data
    } catch (error) {
      // 如果第一个路径失败，尝试其他路径
      for (let i = 1; i < possibleUrls.length; i++) {
        try {
          const response = await request(possibleUrls[i], {
            method: 'GET'
          })
          if (response && response.data) {
            return response.data
          }
        } catch (retryError) {
          if (i === possibleUrls.length - 1) {
            throw error // 如果所有路径都失败，抛出原始错误
          }
        }
      }
      throw error
    }
  },

  /**
   * 根据主分类获取子分类列表
   * @param {String} category - 主分类名称
   * @returns {Promise}
   */
  async getSubCategories(category) {
    // 尝试多种可能的API路径
    const possibleUrls = [
      `${BASE_URL}/subCategories`,
      `${BASE_URL}/subCategory/list`,
      `${BASE_URL}/subCategory`,
      `http://localhost:8080/subCategory/list`,
      `http://localhost:8080/subCategory/subCategories`
    ]
    
    let url = possibleUrls[0]
    
    try {
      const response = await request(url, {
        method: 'GET',
        data: { category: category }
      })
      
      return response.data
    } catch (error) {
      // 如果第一个路径失败，尝试其他路径
      for (let i = 1; i < possibleUrls.length; i++) {
        try {
          const response = await request(possibleUrls[i], {
            method: 'GET',
            data: { category: category }
          })
          if (response && response.data) {
            return response.data
          }
        } catch (retryError) {
          if (i === possibleUrls.length - 1) {
            throw error // 如果所有路径都失败，抛出原始错误
          }
        }
      }
      throw error
    }
  }
}

