<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-back" @click="navBack">&lt;</text>
        <text class="nav-title">个人课表</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content" :style="{ marginTop: navHeight + 'px' }">
      <!-- 导入按钮 -->
      <view class="import-btn-container">
        <view class="import-btn" @click="showImportOptions">
          <text class="import-icon">📥</text>
          <text class="import-text">导入课表</text>
        </view>
      </view>

      <!-- 课程表 -->
      <view class="schedule-container">
        <!-- 表头 -->
        <view class="schedule-header">
          <view class="time-cell"></view>
          <view class="day-cell" v-for="day in weekDays" :key="day.value">{{ day.name }}</view>
        </view>

        <!-- 课程内容 -->
        <view class="schedule-content">
          <!-- 时间列 -->
          <view class="time-column">
            <view class="time-item" v-for="time in classTimes" :key="time">{{ time }}</view>
          </view>

          <!-- 课程格子 -->
          <view class="course-grid">
            <view class="course-item" 
                  v-for="course in courseSchedule" 
                  :key="course.id"
                  :style="{
                    gridRowStart: course.start,
                    gridRowEnd: course.end,
                    gridColumn: course.day + 1,
                    backgroundColor: course.color,
                    opacity: 0.9
                  }"
                  @click="viewCourseDetail(course)">
              <text class="course-name">{{ course.name }}</text>
              <text class="course-location">{{ course.location }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 课程统计 -->
      <view class="course-stats">
        <view class="stat-item">
          <text class="stat-number">{{ totalCourses }}</text>
          <text class="stat-label">课程总数</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ todayCourses }}</text>
          <text class="stat-label">今日课程</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ completedCourses }}</text>
          <text class="stat-label">已完成</text>
        </view>
      </view>
    </view>

    <!-- 手动输入课程模态框 -->
    <view class="modal" v-if="showManualInputModal" @click.self="closeManualInputModal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">{{ editingCourse ? '编辑课程' : '添加课程' }}</text>
          <text class="modal-close" @click="closeManualInputModal">&times;</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">课程名称</text>
            <input type="text" v-model="manualCourse.name" placeholder="请输入课程名称" />
          </view>
          <view class="form-item">
            <text class="form-label">上课地点</text>
            <input type="text" v-model="manualCourse.location" placeholder="请输入上课地点" />
          </view>
          <view class="form-item">
            <text class="form-label">星期几</text>
            <view class="picker-container">
              <picker mode="selector" :value="manualCourse.day" :range="weekDays" :range-key="'name'" :show-toolbar="true" @change="onWeekChange">
                <view class="picker">
                  {{ weekDays[manualCourse.day].name }}
                </view>
              </picker>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">开始节次</text>
            <view class="picker-container">
              <picker mode="selector" :value="manualCourse.start - 1" :range="startOptions" :show-toolbar="true" @change="onStartChange">
                <view class="picker">
                  {{ getPeriodText(manualCourse.start) }}
                </view>
              </picker>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">结束节次</text>
            <view class="picker-container">
              <picker mode="selector" :value="manualCourse.endIndex" :range="endOptions" :show-toolbar="true" @change="onEndChange">
                <view class="picker">
                  {{ getPeriodText(manualCourse.start + manualCourse.endIndex) }}
                </view>
              </picker>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">教师姓名</text>
            <input type="text" v-model="manualCourse.teacherName" placeholder="请输入教师姓名" />
          </view>
          <view class="form-item">
            <text class="form-label">开始日期</text>
            <view class="picker-container">
              <picker mode="date" :value="startDatePickerValue" @change="onStartDateChange" :start="'2023-01-01'" :end="'2030-12-31'">
                <input type="text" :value="startDatePickerValue" placeholder="请选择开始日期" readonly />
              </picker>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">开始时间</text>
            <view class="picker-container">
              <picker mode="time" :value="startTimePickerValue" @change="onStartTimeChange">
                <input type="text" :value="startTimePickerValue" placeholder="请选择开始时间" readonly />
              </picker>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">结束日期</text>
            <view class="picker-container">
              <picker mode="date" :value="endDatePickerValue" @change="onEndDateChange" :start="'2023-01-01'" :end="'2030-12-31'">
                <input type="text" :value="endDatePickerValue" placeholder="请选择结束日期" readonly />
              </picker>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">结束时间</text>
            <view class="picker-container">
              <picker mode="time" :value="endTimePickerValue" @change="onEndTimeChange">
                <input type="text" :value="endTimePickerValue" placeholder="请选择结束时间" readonly />
              </picker>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">课程颜色</text>
            <view class="color-picker">
              <view class="color-item" 
                    v-for="(color, index) in colorOptions" 
                    :key="index"
                    :style="{ backgroundColor: color }"
                    :class="{ active: manualCourse.color === color }"
                    @click="manualCourse.color = color"></view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="btn-cancel" @click="closeManualInputModal">取消</button>
          <button class="btn-confirm" @click="saveManualCourse">{{ editingCourse ? '更新' : '添加' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '../../api/index.js';
export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
        weekDays: [
        { name: '周一', value: 0 },
        { name: '周二', value: 1 },
        { name: '周三', value: 2 },
        { name: '周四', value: 3 },
        { name: '周五', value: 4 },
        { name: '周六', value: 5 },
        { name: '周日', value: 6 }
      ],
      classTimes: ['一二节\n8:00-9:50', '三四节\n10:10-12:00', '五六节\n14:30-16:20', '七八节\n16:40-18:30', '九十节\n19:30-21:20'],
      classOptions: [1, 2, 3, 4, 5],
      colorOptions: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'],
      startOptions: ['一二节', '三四节', '五六节', '七八节', '九十节'],
      endOptions: [], // 动态计算的结束节次选项
      courseSchedule: [],

      // 手动输入相关
      showManualInputModal: false,
      editingCourse: null,
      manualCourse: {
        name: '',
        location: '',
        day: 0,
        start: 1,
        endIndex: 1,
        color: '#FF6B6B',
        teacherName: '',
        startDate: '',
        endDate: ''
      },
      // 开始日期时间选择器状态
      startDatePickerValue: '',
      startTimePickerValue: '08:00',
      // 结束日期时间选择器状态
      endDatePickerValue: '',
      endTimePickerValue: '09:40'
    };
  },
  computed: {
    totalCourses() {
      return this.courseSchedule.length;
    },
    todayCourses() {
      const today = new Date().getDay();
      // 周日是0，对应我们数组中的索引6
      const dayIndex = today === 0 ? 6 : today - 1;
      return this.courseSchedule.filter(course => course.day === dayIndex).length;
    },
    completedCourses() {
      // 基于时间段课程实例的数量来计算已完成的课程数
      // 这里可以根据实际需求修改完成状态的判断逻辑
      // 目前暂时返回所有课程实例的数量，后续可以根据课程的时间信息与当前时间比较来判断是否已完成
      return this.courseSchedule.length;
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
    // 获取课程表数据
    this.getScheduleData();
  },
  methods: {
    // 获取课程表数据
    async getScheduleData() {
      try {
        // 检查token是否存在
        const token = uni.getStorageSync('token');
        console.log('=== 课程表请求前token检查 ===');
        console.log('当前存储的token:', token ? '存在' : '不存在');
        console.log('token类型:', typeof token);
        if (token) {
          console.log('token前30字符:', token.substring(0, Math.min(30, token.length)) + '...');
        }
        
        // 调用API获取课程表数据
        console.log('=== 开始调用课程表API ===');
        console.log('API路径:', '/user/index/userCourses');
        
        const res = await api.indexPage.getSchedule();
        
        // 添加详细的响应日志
        console.log('=== 课程表API响应详情 ===');
        console.log('完整响应对象:', res);
        console.log('响应code:', res.code);
        console.log('响应message:', res.message || res.msg);
        console.log('响应data:', res.data);
        console.log('响应data类型:', typeof res.data);
        console.log('响应data是否为数组:', Array.isArray(res.data));
        if (Array.isArray(res.data)) {
          console.log('响应data长度:', res.data.length);
          if (res.data.length > 0) {
            console.log('响应data前1项:', res.data[0]);
          }
        }
        
        // 更新课程表数据
        if (res && res.code === 200) {
          // 检查data字段是否存在
          if (res.data !== undefined && res.data !== null) {
            if (Array.isArray(res.data)) {
              // 转换后端返回的数据格式为课程表所需格式
              // 将每个课程拆分为多个时间段的独立课程
              this.courseSchedule = res.data.flatMap(course => {
                  // 后端weekDay从1开始计数(1=周一, 2=周二)，前端从0开始索引(0=周一, 1=周二)
                  const dayIndex = course.weekDay !== undefined ? course.weekDay - 1 : 0;
                  // 确保dayIndex在0-6范围内
                  const validDayIndex = Math.max(0, Math.min(6, dayIndex));
                  
                  const startPeriod = course.startPeriod || 1;
                  const endPeriod = course.endPeriod || 2;
                  
                  // 计算该课程跨越的时间段数量
                  const startSlotIndex = Math.ceil(startPeriod / 2);
                  const endSlotIndex = Math.ceil(endPeriod / 2);
                  
                  // 为每个时间段创建一个独立的课程实例
                  const courses = [];
                  for (let slotIndex = startSlotIndex; slotIndex <= endSlotIndex; slotIndex++) {
                      courses.push({
                          id: `${course.userTimetableId || Math.random().toString(36).substr(2, 9)}-${slotIndex}`,
                          userTimetableId: course.userTimetableId, // 保存后端返回的原始ID
                          name: course.courseName || '未命名课程',
                          location: course.classRoom || '未指定地点',
                          teacherName: course.teacherName || '',
                          startTime: course.startTime || '',
                          endTime: course.endTime || '',
                          startDate: course.startDate || '',
                          endDate: course.endDate || '',
                          day: validDayIndex,
                          start: slotIndex,
                          end: slotIndex + 1, // 每个课程只占一个时间段
                          color: this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)]
                      });
                  }
                  
                  return courses;
              });
              console.log('课程表数据转换成功，共', this.courseSchedule.length, '门课程');
              console.log('转换后的数据格式:', this.courseSchedule);
              
              // 如果数据为空，显示提示
              if (this.courseSchedule.length === 0) {
                console.log('课程表数据为空数组，可能该用户没有课程');
                uni.showToast({
                  title: '暂无课程数据',
                  icon: 'none',
                  duration: 2000
                });
              }
            } else {
              // 如果data不是数组，可能是单个对象或其他格式
              console.warn('课程表data不是数组，尝试转换:', res.data);
              // 转换单个课程数据为多个时间段实例
              // 后端weekDay从1开始计数(1=周一, 2=周二)，前端从0开始索引(0=周一, 1=周二)
              const dayIndex = res.data.weekDay !== undefined ? res.data.weekDay - 1 : 0;
              // 确保dayIndex在0-6范围内
              const validDayIndex = Math.max(0, Math.min(6, dayIndex));
              
              const startPeriod = res.data.startPeriod || 1;
              const endPeriod = res.data.endPeriod || 2;
              
              // 计算该课程跨越的时间段数量
              const startSlotIndex = Math.ceil(startPeriod / 2);
              const endSlotIndex = Math.ceil(endPeriod / 2);
              
              // 为每个时间段创建一个独立的课程实例
              const courses = [];
              for (let slotIndex = startSlotIndex; slotIndex <= endSlotIndex; slotIndex++) {
                  courses.push({
                      id: `${res.data.userTimetableId || Math.random().toString(36).substr(2, 9)}-${slotIndex}`,
                      userTimetableId: res.data.userTimetableId, // 保存后端返回的原始ID
                      name: res.data.courseName || '未命名课程',
                      location: res.data.classRoom || '未指定地点',
                      teacherName: res.data.teacherName || '',
                      startTime: res.data.startTime || '',
                      endTime: res.data.endTime || '',
                      startDate: res.data.startDate || '',
                      endDate: res.data.endDate || '',
                      day: validDayIndex,
                      start: slotIndex,
                      end: slotIndex + 1, // 每个课程只占一个时间段
                      color: this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)]
                  });
              }
              this.courseSchedule = courses;
              console.log('单个课程数据转换成功:', this.courseSchedule);
            }
          } else {
            // 如果data字段不存在或为null
            this.courseSchedule = [];
            console.log('课程表data字段不存在或为null，设置为空数组');
            uni.showToast({
              title: '暂无课程数据',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          this.courseSchedule = [];
          console.error('获取课程表失败，状态码:', res.code, '消息:', res.message || res.msg);
          uni.showToast({
            title: res.message || res.msg || '获取课程表失败',
            icon: 'none',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('=== 获取课程表异常 ===');
        console.error('错误类型:', error.name);
        console.error('错误消息:', error.message);
        console.error('完整错误:', error);
        this.courseSchedule = [];
        uni.showToast({
          title: '网络请求失败，请检查网络连接',
          icon: 'none',
          duration: 2000
        });
      }
    },
    
    // 返回上一页
    navBack() {
      try {
        // 尝试返回上一页
        uni.navigateBack({
          delta: 1,
          fail: (err) => {
            console.error('返回上一页失败，将直接跳转到首页:', err);
            // 如果返回失败（如页面栈已清空），直接跳转到首页
            uni.navigateTo({
              url: '/pages/index/index'
            });
          }
        });
      } catch (error) {
        console.error('返回操作出错:', error);
        // 出错时直接跳转到首页
        uni.navigateTo({
          url: '/pages/index/index'
        });
      }
    },

    // 查看课程详情
    viewCourseDetail(course) {
      uni.showActionSheet({
        itemList: ['查看详情', '编辑课程', '删除课程'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 查看详情
            // 优先使用后端返回的实际时间，否则使用计算的时间段
            let timeDisplay = '';
            if (course.startTime && course.endTime) {
              // 使用后端返回的实际时间
              timeDisplay = `${course.startTime}-${course.endTime}`;
            } else {
              // 计算时间段文本和时间范围
              const timeSlotIndex = Math.ceil(course.start / 2);
              const timeText = this.classTimes[timeSlotIndex - 1] || '';
              if (timeText) {
                const [period, timeRange] = timeText.split('\n');
                timeDisplay = `${period} ${timeRange}`;
              }
            }
            
            uni.showModal({
              title: course.name,
              content: `地点：${course.location}\n时间：${this.weekDays[course.day].name} ${timeDisplay}`,
              showCancel: false
            });
          } else if (res.tapIndex === 1) {
            // 编辑课程
            this.editCourse(course);
          } else if (res.tapIndex === 2) {
            // 删除课程
            this.deleteCourse(course);
          }
        }
      });
    },
    // 显示导入选项（直接使用手动输入）
    showImportOptions() {
      this.openManualInputModal();
    },
    // 打开手动输入模态框
    openManualInputModal() {
      this.editingCourse = null;
      this.manualCourse = {
        name: '',
        location: '',
        day: 0,
        start: 1,
        endIndex: 0, // 从0开始索引
        color: '#FF6B6B',
        teacherName: '',
        startDate: '',
        endDate: ''
      };
      // 初始化结束节次选项
      this.updateEndOptions();
      this.showManualInputModal = true;
    },
    // 关闭手动输入模态框
    closeManualInputModal() {
      this.showManualInputModal = false;
    },
    // 获取结束节次选项
    // 初始化结束节次选项
    updateEndOptions() {
      this.endOptions = [];
      // 最大结束时间段序号为5
      const maxEnd = 5 - this.manualCourse.start;
      for (let i = 1; i <= maxEnd; i++) {
        this.endOptions.push(`${this.getPeriodText(this.manualCourse.start + i)}`);
      }
      // 如果当前选择的结束节次超出范围，重置为0
      if (this.manualCourse.endIndex >= this.endOptions.length) {
        this.manualCourse.endIndex = 0;
      }
    },
    // 获取时间段文本
    getPeriodText(index) {
      const texts = ['一二节', '三四节', '五六节', '七八节', '九十节'];
      return texts[index - 1] || `时间段${index}`;
    },
    // 星期几选择改变事件
    onWeekChange(e) {
      this.manualCourse.day = e.detail.value;
    },
    // 开始节次选择改变事件
    onStartChange(e) {
      // e.detail.value是索引，需要+1得到实际的节次
      const newStart = parseInt(e.detail.value) + 1;
      this.manualCourse.start = newStart;
      // 更新结束节次选项
      this.updateEndOptions();
    },
    // 结束节次选择改变事件
    onEndChange(e) {
      this.manualCourse.endIndex = parseInt(e.detail.value);
    },
    // 开始日期选择事件
    onStartDateChange(e) {
      this.startDatePickerValue = e.detail.value;
      // 如果已经选择了时间，更新完整的开始日期时间
      if (this.startTimePickerValue) {
        this.manualCourse.startDate = `${this.startDatePickerValue} ${this.startTimePickerValue}`;
      }
    },
    // 开始时间选择事件
    onStartTimeChange(e) {
      this.startTimePickerValue = e.detail.value;
      // 如果已经选择了日期，更新完整的开始日期时间
      if (this.startDatePickerValue) {
        this.manualCourse.startDate = `${this.startDatePickerValue} ${this.startTimePickerValue}`;
      }
    },
    // 结束日期选择事件
    onEndDateChange(e) {
      this.endDatePickerValue = e.detail.value;
      // 如果已经选择了时间，更新完整的结束日期时间
      if (this.endTimePickerValue) {
        this.manualCourse.endDate = `${this.endDatePickerValue} ${this.endTimePickerValue}`;
      }
    },
    // 结束时间选择事件
    onEndTimeChange(e) {
      this.endTimePickerValue = e.detail.value;
      // 如果已经选择了日期，更新完整的结束日期时间
      if (this.endDatePickerValue) {
        this.manualCourse.endDate = `${this.endDatePickerValue} ${this.endTimePickerValue}`;
      }
    },
    // 保存手动输入的课程（使用新接口）
    async saveManualCourse() {
      // 表单验证
      if (!this.manualCourse.name.trim()) {
        uni.showToast({ title: '请输入课程名称', icon: 'none' });
        return;
      }
      if (!this.manualCourse.teacherName.trim()) {
        uni.showToast({ title: '请输入教师姓名', icon: 'none' });
        return;
      }
      if (!this.manualCourse.location.trim()) {
        uni.showToast({ title: '请输入上课地点', icon: 'none' });
        return;
      }
      if (!this.manualCourse.startDate) {
        uni.showToast({ title: '请选择开始日期时间', icon: 'none' });
        return;
      }
      if (!this.manualCourse.endDate) {
        uni.showToast({ title: '请选择结束日期时间', icon: 'none' });
        return;
      }

      // 使用表单中选择的节次索引
      
      // 处理picker组件返回的日期时间格式 (YYYY-MM-DD HH:mm)
      // 提取日期部分和时间部分
      const startParts = this.manualCourse.startDate ? this.manualCourse.startDate.split(' ') : ['', ''];
      const endParts = this.manualCourse.endDate ? this.manualCourse.endDate.split(' ') : ['', ''];
      
      // 提取日期部分 (YYYY-MM-DD)
      const startDate = startParts[0];
      const endDate = endParts[0];
      
      // 提取时间部分 (HH:MM)
      const startTime = startParts[1] || '00:00';
      const endTime = endParts[1] || '00:00';
      
      // 获取当前用户ID并转换为String形式
      const userBaseId = String(uni.getStorageSync('userId'));

      // 转换为后端期望的数据格式
      const courseData = {
        userBaseId: userBaseId,
        courseName: (this.manualCourse.name || '').trim(),
        teacherName: (this.manualCourse.teacherName || '').trim(),
        classRoom: (this.manualCourse.location || '').trim(),
        weekDay: this.manualCourse.startDate ? new Date(this.manualCourse.startDate).getDay() + 1 : 1, // 从开始日期获取星期几，后端weekDay从1开始计数
        startPeriod: this.manualCourse.start,
        endPeriod: this.manualCourse.endIndex,
        startTime: startTime,
        endTime: endTime,
        startDate: startDate,
        endDate: endDate,
        createTime: new Date().toISOString().slice(0, 19).replace('T', ' '), // 格式：YYYY-MM-DD HH:mm:ss
        importSource: 'manual' // 手动添加
      };

      try {
        // 调用新的API接口
        const res = await api.indexPage.addTimetable(courseData);
        if (res && res.code === 200) {
          uni.showToast({ title: res.msg || '课程添加成功', icon: 'success' });
          // 重新获取课程表数据以确保显示最新的课程
          await this.getScheduleData();
          this.closeManualInputModal();
        } else {
          uni.showToast({ title: res.msg || '课程添加失败', icon: 'none' });
        }
      } catch (error) {
        console.error('保存课程失败:', error);
        uni.showToast({ title: '网络请求失败', icon: 'none' });
      }
    },
    // 编辑课程
    editCourse(course) {
      this.editingCourse = course;
      // 计算时间段索引，假设course.start是时间段序号（1开始）
      const timeSlotIndex = Math.ceil(course.start / 2);
      
      // 组合日期和时间为picker组件需要的格式 (YYYY-MM-DD HH:mm)
      const startDateTime = course.startDate && course.startTime ? `${course.startDate} ${course.startTime}` : '';
      const endDateTime = course.endDate && course.endTime ? `${course.endDate} ${course.endTime}` : '';
      
      this.manualCourse = {
        name: course.name || course.courseName || '',
        location: course.location || course.classRoom || '',
        day: course.day,
        start: timeSlotIndex, // 使用时间段序号
        endIndex: Math.ceil(course.end / 2) - timeSlotIndex, // 计算结束时间段索引
        color: course.color,
        teacherName: course.teacherName || '',
        startDate: startDateTime,
        endDate: endDateTime
      };
      
      // 更新日期时间选择器的值
      if (this.manualCourse.startDate) {
        const [startDate, startTime] = this.manualCourse.startDate.split(' ');
        this.startDatePickerValue = startDate;
        this.startTimePickerValue = startTime || '08:00';
      }
      if (this.manualCourse.endDate) {
        const [endDate, endTime] = this.manualCourse.endDate.split(' ');
        this.endDatePickerValue = endDate;
        this.endTimePickerValue = endTime || '09:40';
      }
        
        // 更新结束节次选项
      this.updateEndOptions();
      this.showManualInputModal = true;
    },
    // 删除课程
    async deleteCourse(course) {
      uni.showModal({
        title: '删除课程',
        content: `确定要删除"${course.name}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              // 调用后端删除接口，使用原始的userTimetableId而不是格式化后的id
              await api.indexPage.deleteUserCourse(course.userTimetableId);
              
              // 从本地课程列表中删除所有具有相同userTimetableId的课程实例
              this.courseSchedule = this.courseSchedule.filter(c => c.userTimetableId !== course.userTimetableId);
              
              // 显示删除成功提示
              uni.showToast({
                title: '课程已删除',
                icon: 'success'
              });
              
              // 重新获取课程数据，确保本地数据与服务器一致
              this.getScheduleData();
            } catch (error) {
              console.error('删除课程失败:', error);
              uni.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    // 生成演示课表数据（仅保留手动输入相关功能）
    generateDemoSchedule() {
      // 生成一些随机的课程数据用于演示
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
      const courses = [
        { name: '高等数学', location: '教学楼A201' },
        { name: '大学英语', location: '外语楼B102' },
        { name: '程序设计', location: '计算机中心305' },
        { name: '物理实验', location: '实验楼C302' },
        { name: '线性代数', location: '教学楼B301' },
        { name: '体育', location: '操场' },
        { name: '毛概', location: '教学楼A401' },
        { name: '数据结构', location: '计算机中心205' },
        { name: '概率论', location: '教学楼C101' }
      ];
      
      const newSchedule = [];
      let id = 1;
      
      // 随机生成每周的课程安排
      for (let day = 0; day < 5; day++) { // 周一到周五
        const courseCount = Math.floor(Math.random() * 3) + 1; // 每天1-3节课
        const selectedIndices = new Set();
        
        while (selectedIndices.size < courseCount) {
          selectedIndices.add(Math.floor(Math.random() * courses.length));
        }
        
        const timeSlots = [];
        selectedIndices.forEach(index => {
          let start;
          do {
            start = Math.floor(Math.random() * 4) + 1; // 1-4节课开始
          } while (timeSlots.some(slot => 
            (start >= slot.start && start < slot.end) || 
            (start + 1 >= slot.start && start + 1 < slot.end)
          ));
          
          const duration = Math.floor(Math.random() * 2) + 1; // 1-2节连堂
          timeSlots.push({ start, end: start + duration });
          
          newSchedule.push({
            id: id++,
            name: courses[index].name,
            location: courses[index].location,
            day,
            start,
            end: start + duration,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        });
      }
      
      this.courseSchedule = newSchedule;
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #F5F5F5;
}

/* 导航栏 */
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #89CFF0 0%, #5DCDFF 100%);
  z-index: 999;
}

.nav-content {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.nav-back {
  font-size: 36rpx;
  color: #FFFFFF;
  width: 40rpx;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.nav-right {
  width: 40rpx;
}

/* 内容区域 */
.content {
  padding-bottom: 30rpx;
}

/* 导入按钮容器 */
.import-btn-container {
  margin: 20rpx 30rpx;
}

.import-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #5DCDFF;
  color: #FFFFFF;
  padding: 20rpx;
  border-radius: 20rpx;
  font-size: 28rpx;
}

.import-icon {
  margin-right: 10rpx;
  font-size: 32rpx;
}

.import-text {
  font-weight: 500;
}

/* 课程表 */
.schedule-container {
  background-color: #FFFFFF;
  margin: 0 30rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  white-space: nowrap;
}

/* 表头 */
.schedule-header {
  display: flex;
  margin-bottom: 20rpx;
  min-width: max-content;
}

.time-cell {
  width: 100rpx;
  flex-shrink: 0;
}

.day-cell {
  width: 180rpx;
  text-align: center;
  font-size: 28rpx;
  color: #666666;
  flex-shrink: 0;
}

/* 课程内容 */
.schedule-content {
  display: flex;
  height: 700rpx;
  min-width: max-content;
}

/* 时间列 */
.time-column {
  width: 120rpx;
  flex-shrink: 0;
  background-color: #ffffff;
}

.time-item {
  height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #888888;
  border-bottom: 1px solid #F0F0F0;
  line-height: 1.4;
  text-align: center;
  padding: 10rpx;
  white-space: pre-line;
}

/* 课程格子 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(7, 180rpx);
  grid-template-rows: repeat(5, 140rpx);
  gap: 2rpx;
  background-color: #f5f5f5;
}

.course-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.course-name {
  font-size: 22rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
  max-width: 90%;
}

.course-location {
  font-size: 18rpx;
  color: rgba(255, 255, 255, 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
  max-width: 90%;
}

/* 课程统计 */
.course-stats {
  display: flex;
  justify-content: space-around;
  margin: 30rpx;
  background-color: #FFFFFF;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #5DCDFF;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

/* 模态框样式 */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    /* 确保原生组件能在模态框上显示 */
    z-index: 999;
    /* 允许原生组件穿透 */
    overflow: visible;
  }
  
  .modal-content {
    width: 90%;
    max-height: 80vh;
    background-color: #FFFFFF;
    border-radius: 20rpx;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    /* 修复原生组件显示问题 */
    z-index: 1000;
  }

  .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #E0E0E0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.modal-close {
  font-size: 40rpx;
  color: #999999;
}

.modal-body {
  padding: 30rpx;
  overflow-y: auto;
  flex: 1;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.form-item input {
  width: 100%;
  height: 80rpx;
  border: 1px solid #E0E0E0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.picker {
  width: 100%;
  height: 80rpx;
  border: 1px solid #E0E0E0;
  border-radius: 10rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #333333;
  background-color: #F9F9F9;
}

/* 为原生picker组件提供更好的层级支持 */
  .picker-container {
    position: relative;
    /* 确保picker选择器能正确弹出 */
    z-index: 1000;
    /* 重要：确保picker可以突破模态框限制弹出 */
    overflow: visible;
  }
  
  /* 优化picker触摸区域，确保容易点击 */
  .picker {
    width: 100%;
    height: 80rpx;
    border: 1px solid #E0E0E0;
    border-radius: 10rpx;
    padding: 0 20rpx;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #333333;
    background-color: #F9F9F9;
    /* 增加点击区域的可识别性 */
    position: relative;
  }
  
  .picker::after {
    content: '▼';
    position: absolute;
    right: 20rpx;
    font-size: 20rpx;
    color: #999999;
  }

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.color-item {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  border: 2px solid transparent;
}

.color-item.active {
  border-color: #333333;
  transform: scale(1.1);
}

.modal-footer {
  display: flex;
  border-top: 1px solid #E0E0E0;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  font-size: 32rpx;
  border: none;
  background-color: transparent;
}

.btn-cancel {
  color: #999999;
  border-right: 1px solid #E0E0E0;
}

.btn-confirm {
  color: #5DCDFF;
  font-weight: 500;
}
</style>
