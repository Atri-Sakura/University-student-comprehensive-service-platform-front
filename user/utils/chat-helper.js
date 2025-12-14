// 聊天辅助工具函数
import request from '@/api/request.js'
import { USER_TYPE } from '@/api/session.js'

/**
 * 打开与商家的聊天
 * @param {String} merchantId - 商家ID
 * @param {String} merchantName - 商家名称
 * @param {String} merchantPhone - 商家电话（可选，已废弃，保留以兼容旧代码）
 */
export async function openChatWithMerchant(merchantId, merchantName = '商家', merchantPhone = '') {
  if (!merchantId) {
    uni.showToast({
      title: '无法获取商家信息',
      icon: 'none'
    })
    return false
  }
  
  // 直接打开聊天页面
  return await startChatSession(merchantId, merchantName)
}

/**
 * 打开与骑手的聊天
 * @param {String} riderId - 骑手ID
 * @param {String} riderName - 骑手名称
 * @param {String} riderPhone - 骑手电话（可选，已废弃，保留以兼容旧代码）
 */
export async function openChatWithRider(riderId, riderName = '骑手', riderPhone = '') {
  if (!riderId) {
    uni.showToast({
      title: '无法获取骑手信息',
      icon: 'none'
    })
    return false
  }
  
  // 直接打开聊天页面
  return await startChatSessionWithRider(riderId, riderName)
}

/**
 * 创建或获取与商家的会话并跳转到聊天页面
 * @param {String} merchantId - 商家ID
 * @param {String} merchantName - 商家名称
 */
async function startChatSession(merchantId, merchantName) {
  uni.showLoading({ title: '正在打开聊天...' })
  
  try {
    // 1. 获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    const userId = uni.getStorageSync('userId')
    
    // 多字段容错获取用户ID
    let currentUserId = null
    if (userInfo) {
      currentUserId = userInfo.id || userInfo.userId || userInfo.userBaseId
    }
    if (!currentUserId) {
      currentUserId = userId
    }
    
    if (!currentUserId) {
      throw new Error('用户信息获取失败，请重新登录')
    }
    
    console.log('用户ID:', currentUserId)
    console.log('商家ID:', merchantId)
    
    // 2. 查询现有会话
    const sessionRes = await request.get(
      '/platform/chat/session/list',
      {
        fromType: USER_TYPE.USER,  // 用户
        fromId: String(currentUserId),
        toType: USER_TYPE.MERCHANT,  // 商家
        toId: String(merchantId)
      }
    )
    
    let sessionId = null
    if (sessionRes && sessionRes.code === 200 && sessionRes.data) {
      const sessions = sessionRes.data
      if (sessions && sessions.length > 0) {
        sessionId = sessions[0].sessionId
        console.log('找到现有会话:', sessionId)
      }
    }
    
    // 3. 如果没有现有会话，创建新会话
    if (!sessionId) {
      console.log('创建新会话...')
      const createRes = await request.post(
        '/platform/chat/session',
        {
          fromType: USER_TYPE.USER,  // 用户
          fromId: String(currentUserId),
          toType: USER_TYPE.MERCHANT,  // 商家
          toId: String(merchantId),
          sessionStatus: 1
        }
      )
      
      if (createRes && createRes.code === 200 && createRes.data) {
        sessionId = createRes.data
        console.log('创建会话成功:', sessionId)
      }
    }
    
    uni.hideLoading()
    
    // 4. 跳转到聊天页面
    if (sessionId) {
      uni.navigateTo({
        url: `/pages/message/chat-detail?sessionId=${sessionId}&toType=${USER_TYPE.MERCHANT}&toId=${merchantId}&fromType=${USER_TYPE.USER}&fromId=${currentUserId}&name=${encodeURIComponent(merchantName)}`
      })
      return true
    } else {
      uni.showToast({
        title: '无法创建会话',
        icon: 'none'
      })
      return false
    }
    
  } catch (error) {
    uni.hideLoading()
    console.error('打开聊天失败:', error)
    uni.showToast({
      title: error.message || '打开聊天失败',
      icon: 'none'
    })
    return false
  }
}

/**
 * 创建或获取与骑手的会话并跳转到聊天页面
 * @param {String} riderId - 骑手ID
 * @param {String} riderName - 骑手名称
 */
async function startChatSessionWithRider(riderId, riderName) {
  uni.showLoading({ title: '正在打开聊天...' })
  
  try {
    // 1. 获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    const userId = uni.getStorageSync('userId')
    
    // 多字段容错获取用户ID
    let currentUserId = null
    if (userInfo) {
      currentUserId = userInfo.id || userInfo.userId || userInfo.userBaseId
    }
    if (!currentUserId) {
      currentUserId = userId
    }
    
    if (!currentUserId) {
      throw new Error('用户信息获取失败，请重新登录')
    }
    
    console.log('用户ID:', currentUserId)
    console.log('骑手ID:', riderId)
    
    // 2. 查询现有会话
    const sessionRes = await request.get(
      '/platform/chat/session/list',
      {
        fromType: USER_TYPE.USER,  // 用户
        fromId: String(currentUserId),
        toType: USER_TYPE.RIDER,  // 骑手
        toId: String(riderId)
      }
    )
    
    let sessionId = null
    if (sessionRes && sessionRes.code === 200 && sessionRes.data) {
      const sessions = sessionRes.data
      if (sessions && sessions.length > 0) {
        sessionId = sessions[0].sessionId
        console.log('找到现有会话:', sessionId)
      }
    }
    
    // 3. 如果没有现有会话，创建新会话
    if (!sessionId) {
      console.log('创建新会话...')
      const createRes = await request.post(
        '/platform/chat/session',
        {
          fromType: USER_TYPE.USER,  // 用户
          fromId: String(currentUserId),
          toType: USER_TYPE.RIDER,  // 骑手
          toId: String(riderId),
          sessionStatus: 1
        }
      )
      
      if (createRes && createRes.code === 200 && createRes.data) {
        sessionId = createRes.data
        console.log('创建会话成功:', sessionId)
      }
    }
    
    uni.hideLoading()
    
    // 4. 跳转到聊天页面
    if (sessionId) {
      uni.navigateTo({
        url: `/pages/message/chat-detail?sessionId=${sessionId}&toType=${USER_TYPE.RIDER}&toId=${riderId}&fromType=${USER_TYPE.USER}&fromId=${currentUserId}&name=${encodeURIComponent(riderName)}`
      })
      return true
    } else {
      uni.showToast({
        title: '无法创建会话',
        icon: 'none'
      })
      return false
    }
    
  } catch (error) {
    uni.hideLoading()
    console.error('打开聊天失败:', error)
    uni.showToast({
      title: error.message || '打开聊天失败',
      icon: 'none'
    })
    return false
  }
}

export default {
  openChatWithMerchant,
  openChatWithRider
}
