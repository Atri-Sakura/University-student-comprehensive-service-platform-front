// 接口基础地址
const BASE_URL = 'http://localhost:8080'

// 获取token
const getToken = () => {
  return uni.getStorageSync('token') || ''
}

// 通用请求方法
export const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Authorization': getToken(),
        'Content-Type': options.contentType || 'application/json',
        ...options.header
      },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data)
        } else {
          uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' })
          reject(res.data)
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        uni.showToast({ title: '网络错误', icon: 'none' })
        reject(err)
      }
    })
  })
}

// 上传文件
export const uploadFile = (options) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + options.url,
      filePath: options.filePath,
      name: options.name || 'file',
      header: {
        'Authorization': getToken(),
        ...options.header
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data)
        } else {
          uni.showToast({ title: data.msg || '上传失败', icon: 'none' })
          reject(data)
        }
      },
      fail: (err) => {
        console.error('上传失败:', err)
        uni.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

export default { request, uploadFile, BASE_URL }
