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
    
    // 获取商家ID，确保只获取当前商家的商品
    const merchantInfo = uni.getStorageSync('merchantInfo') || {};
    const merchantBaseId = String(merchantInfo.merchantBaseId || merchantInfo.id || merchantInfo.merchantId || '');
    
    // 将商家ID添加到查询参数中
    const queryParams = {
      ...params,
      merchantBaseId: merchantBaseId
    };
    
    console.log('🔍 获取商品列表 - 查询参数:', queryParams);
    
    try {
      const response = await request(url, {
        method: 'GET',
        data: queryParams
      })
      
      console.log('🔍 商品列表响应:', response);
      if (response.data && response.data.rows && response.data.rows.length > 0) {
        console.log('🔍 第一个商品数据示例:', response.data.rows[0]);
      }
      
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
   * 测试当前用户信息（调试用）
   */
  async testCurrentUser() {
    try {
      const token = uni.getStorageSync('token');
      const response = await request('http://localhost:8080/getInfo', {
        method: 'GET'
      });
      
      console.log('🔍 当前用户信息测试:', {
        hasToken: !!token,
        response: response,
        userInfo: response.data ? response.data.user : null
      });
      
      return response;
    } catch (error) {
      console.error('❌ 获取当前用户信息失败:', error);
      throw error;
    }
  },

  /**
   * 调试商品权限验证（发送详细信息给后端）
   */
  async debugGoodsPermission(goodsId) {
    try {
      const merchantInfo = uni.getStorageSync('merchantInfo') || {};
      const token = uni.getStorageSync('token');
      
      // 解析JWT token
      let tokenPayload = null;
      if (token) {
        try {
          const payloadPart = token.split('.')[1];
          if (payloadPart) {
            const decodedPayload = atob(payloadPart);
            tokenPayload = JSON.parse(decodedPayload);
          }
        } catch (e) {
          console.warn('⚠️ JWT token解析失败:', e);
        }
      }
      
      const debugInfo = {
        goodsId: goodsId,
        frontendMerchantInfo: merchantInfo,
        tokenPayload: tokenPayload,
        timestamp: new Date().toISOString()
      };
      
      console.log('🔍 发送调试信息到后端:', debugInfo);
      
      // 发送调试信息到后端（如果后端有调试接口）
      const response = await request(`${BASE_URL}/debug/permission`, {
        method: 'POST',
        data: debugInfo
      });
      
      return response;
    } catch (error) {
      console.warn('⚠️ 调试接口调用失败（可能后端没有此接口）:', error);
      return null;
    }
  },

  /**
   * 删除商品
   * @param {Number} goodsId - 商品ID
   * @returns {Promise}
   */
  async deleteGoods(goodsId) {
    // 获取商家ID和token用于调试
    const merchantInfo = uni.getStorageSync('merchantInfo') || {};
    const merchantBaseId = String(merchantInfo.merchantBaseId || merchantInfo.id || merchantInfo.merchantId || '');
    const token = uni.getStorageSync('token');
    
    // 尝试解析JWT token中的商家信息
    let tokenPayload = null;
    if (token) {
      try {
        // JWT token的payload部分（base64解码）
        const payloadPart = token.split('.')[1];
        if (payloadPart) {
          const decodedPayload = atob(payloadPart);
          tokenPayload = JSON.parse(decodedPayload);
        }
      } catch (e) {
        console.warn('⚠️ JWT token解析失败:', e);
      }
    }
    
    console.log('🔍 删除商品详细信息:', {
      goodsId: goodsId,
      goodsIdType: typeof goodsId,
      merchantBaseId: merchantBaseId,
      merchantBaseIdType: typeof merchantBaseId,
      merchantBaseId_json: JSON.stringify(merchantBaseId),
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPayload: tokenPayload,
      tokenMerchantInfo: tokenPayload ? {
        merchantBaseId: tokenPayload.merchantBaseId,
        merchantBaseId_type: typeof tokenPayload.merchantBaseId,
        merchantBaseId_string: String(tokenPayload.merchantBaseId),
        merchantId: tokenPayload.merchantId,
        merchantId_type: typeof tokenPayload.merchantId,
        id: tokenPayload.id,
        id_type: typeof tokenPayload.id,
        userId: tokenPayload.userId,
        sub: tokenPayload.sub,
        exp: tokenPayload.exp,
        // 完整的token payload
        fullPayload: tokenPayload
      } : null,
      merchantInfo: merchantInfo,
      // 比较本地存储和token中的商家ID
      idComparison: tokenPayload ? {
        localStorage_vs_token_merchantBaseId: merchantBaseId === String(tokenPayload.merchantBaseId),
        localStorage_vs_token_id: merchantBaseId === String(tokenPayload.id),
        localStorage_vs_token_merchantId: merchantBaseId === String(tokenPayload.merchantId),
        localStorage_vs_token_sub: merchantBaseId === String(tokenPayload.sub),
        localStorage_vs_token_userId: merchantBaseId === String(tokenPayload.userId),
        // 详细对比
        detailedComparison: {
          localStorage_merchantBaseId: merchantBaseId,
          token_merchantBaseId: String(tokenPayload.merchantBaseId || 'null'),
          token_id: String(tokenPayload.id || 'null'),
          token_merchantId: String(tokenPayload.merchantId || 'null'),
          token_sub: String(tokenPayload.sub || 'null'),
          token_userId: String(tokenPayload.userId || 'null')
        }
      } : null
    });
    
    // 🔥 关键调试：检查JWT token是否包含正确的商家身份信息
    if (tokenPayload) {
      console.log('🔍 JWT Token 商家身份验证详细分析:', {
        token解析成功: true,
        可能的商家ID字段: {
          merchantBaseId: tokenPayload.merchantBaseId,
          merchantId: tokenPayload.merchantId,
          id: tokenPayload.id,
          userId: tokenPayload.userId,
          sub: tokenPayload.sub,
          username: tokenPayload.username,
          user_name: tokenPayload.user_name
        },
        本地存储的商家ID: merchantBaseId,
        是否匹配: {
          merchantBaseId匹配: merchantBaseId === String(tokenPayload.merchantBaseId || ''),
          merchantId匹配: merchantBaseId === String(tokenPayload.merchantId || ''),
          id匹配: merchantBaseId === String(tokenPayload.id || ''),
          userId匹配: merchantBaseId === String(tokenPayload.userId || ''),
          sub匹配: merchantBaseId === String(tokenPayload.sub || '')
        },
        token过期时间: new Date(tokenPayload.exp * 1000).toLocaleString(),
        token是否过期: Date.now() > tokenPayload.exp * 1000
      });
    } else {
      console.error('❌ JWT Token 解析失败，无法验证商家身份');
    }
    
    // 🔥 在删除前先测试当前用户信息和权限调试
    console.log('🔍 删除前测试当前用户信息...');
    try {
      await this.testCurrentUser();
    } catch (error) {
      console.warn('⚠️ 获取当前用户信息失败，但继续删除操作:', error);
    }
    
    // 🔥 调试权限验证
    console.log('🔍 调试商品权限验证...');
    try {
      await this.debugGoodsPermission(goodsId);
    } catch (error) {
      console.warn('⚠️ 权限调试失败，但继续删除操作:', error);
    }
    
    const url = `${BASE_URL}/delete/${goodsId}`
    
    try {
      const response = await request(url, {
        method: 'DELETE'
        // 依赖 api.js 中的通用 Authorization 头进行权限验证
        // 后端应该通过JWT token识别当前商家身份
      })
      
      console.log('✅ 删除商品响应:', response);
      return response.data
    } catch (error) {
      console.error('❌ 删除商品失败:', error);
      console.error('❌ 错误详情:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
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
    
    console.log('🔍 商品上架 - goodsId:', goodsId, 'goodsIdType:', typeof goodsId);
    
    try {
      const response = await request(url, {
        method: 'PUT'
        // 依赖JWT token进行权限验证
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
    
    console.log('🔍 商品下架 - goodsId:', goodsId, 'goodsIdType:', typeof goodsId);
    
    try {
      const response = await request(url, {
        method: 'PUT'
        // 依赖JWT token进行权限验证
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
    
    console.log('🔍 调用 addGoodsImage API:', { goodsId, imageUrl, url });
    
    try {
      const response = await request(url, {
        method: 'POST',
        data: { imageUrl: imageUrl },  // 包装为对象
        header: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('✅ addGoodsImage 响应:', response);
      return response.data
    } catch (error) {
      console.error('❌ addGoodsImage 失败:', error);
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

