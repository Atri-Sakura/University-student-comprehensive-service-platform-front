// 首页相关API接口

// 导入统一的请求方法（支持大整数精度保护）
import request from './request.js';

// 为了保持代码兼容性，创建简单的封装
const get = (url, data, header) => request.get(url, data, header);
const post = (url, data, header) => request.post(url, data, header);
const put = (url, data, header) => request.put(url, data, header);
const del = (url, data, header) => request.del(url, data, header);

// 首页相关API接口
const indexPageApi = {
  // 获取轮播图
  getCarousel() {
    return get('/user/index/carousel');
  },
  
  // 获取今日课程
  getTodayCourses() {
    return get('/user/index/todayCourses');
  },
  
  // 获取完整课程表（旧接口）
  getSchedule() {
    return get('/user/index/userCourses');
  },
  
  // 课程表相关接口（新接口）
  // 获取个人课详情
  getTimetableDetail(userTimetableId) {
    return get(`/platform/timetable/${userTimetableId}`);
  },
  
  // 查询个人课列表
  getTimetableList(params) {
    return get('/platform/timetable/list', params);
  },
  
  // 新增个人课
  addTimetable(data) {
    // 确保userBaseId等ID字段以字符串形式传递
    const processedData = { ...data };
    // 直接实现字符串转换逻辑，不依赖外部工具函数
    const idFields = ['id', 'userAddressId', 'userBaseId'];
    idFields.forEach(field => {
      if (processedData.hasOwnProperty(field)) {
        processedData[field] = String(processedData[field]);
      }
    });
    return post('/platform/timetable', processedData);
  },
  
  // 修改个人课
  updateTimetable(data) {
    // 确保userBaseId等ID字段以字符串形式传递
    const processedData = { ...data };
    // 直接实现字符串转换逻辑，不依赖外部工具函数
    const idFields = ['id', 'userAddressId', 'userBaseId'];
    idFields.forEach(field => {
      if (processedData.hasOwnProperty(field)) {
        processedData[field] = String(processedData[field]);
      }
    });
    return put('/platform/timetable', processedData);
  },
  
  // 批量删除个人课
  deleteTimetable(userTimetableIds) {
    return del('/platform/timetable/batch', userTimetableIds);
  },
  
  // 单个删除课程
  deleteUserCourse(userTimetableId) {
    return del(`/user/index/userCoursesDelete/${userTimetableId}`);
  },
  
  // 新增课程（新接口）
  addUserCourse(data) {
    // 确保userBaseId等ID字段以字符串形式传递
    const processedData = { ...data };
    // 直接实现字符串转换逻辑，不依赖外部工具函数
    const idFields = ['id', 'userAddressId', 'userBaseId'];
    idFields.forEach(field => {
      if (processedData.hasOwnProperty(field)) {
        processedData[field] = String(processedData[field]);
      }
    });
    return post('/user/index/userCoursesAdd', processedData);
  },
  
  // 获取推荐外卖
  getTakeoutRecommendations() {
    return get('/user/index/takeout');
  },
  
  // 获取推荐二手商品
  getSecondhandRecommendations() {
    return get('/user/index/secondhand');
  }
};

export default indexPageApi;
