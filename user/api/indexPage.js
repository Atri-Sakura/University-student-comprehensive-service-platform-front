// 首页相关API接口

// 导入统一的请求方法（支持大整数精度保护）
import request from './request.js';

// 首页相关API接口
const indexPageApi = {
  // 获取轮播图
  getCarousel() {
    return request.get('/user/index/carousel');
  },
  
  // 获取今日课程
  getTodayCourses() {
    return request.get('/user/index/todayCourses');
  },
  
  // 获取完整课程表
  getSchedule() {
    return request.get('/user/index/userCourses');
  },
  
  // 获取推荐外卖
  getTakeoutRecommendations() {
    return request.get('/user/index/takeout');
  },
  
  // 获取推荐二手商品
  getSecondhandRecommendations() {
    return request.get('/user/index/secondhand');
  }
};

export default indexPageApi;
