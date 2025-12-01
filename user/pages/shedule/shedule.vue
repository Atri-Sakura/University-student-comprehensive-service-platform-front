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
      courseSchedule: [
        { id: 1, name: '高等数学', location: '教学楼A201', day: 0, start: 1, end: 3, color: '#FF6B6B' },
        { id: 2, name: '大学英语', location: '外语楼B102', day: 1, start: 1, end: 2, color: '#4ECDC4' },
        { id: 3, name: '程序设计', location: '计算机中心305', day: 2, start: 3, end: 5, color: '#45B7D1' },
        { id: 4, name: '物理实验', location: '实验楼C302', day: 3, start: 2, end: 4, color: '#96CEB4' },
        { id: 5, name: '线性代数', location: '教学楼B301', day: 4, start: 1, end: 3, color: '#FECA57' },
        { id: 6, name: '体育', location: '操场', day: 0, start: 4, end: 5, color: '#FF9FF3' },
        { id: 7, name: '毛概', location: '教学楼A401', day: 3, start: 1, end: 2, color: '#54A0FF' }
      ],
      // 手动输入相关
      showManualInputModal: false,
      editingCourse: null,
      manualCourse: {
        name: '',
        location: '',
        day: 0,
        start: 1,
        endIndex: 1,
        color: '#FF6B6B'
      }
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
      // 简单计算，假设已完成一半课程
      return Math.floor(this.totalCourses / 2);
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
  },
  methods: {
    // 返回上一页
    navBack() {
      uni.navigateBack();
    },

    // 查看课程详情
    viewCourseDetail(course) {
      uni.showActionSheet({
        itemList: ['查看详情', '编辑课程', '删除课程'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 查看详情
            // 计算时间段文本和时间范围
            const timeSlotIndex = Math.ceil(course.start / 2);
            const timeText = this.classTimes[timeSlotIndex - 1];
            const [period, timeRange] = timeText.split('\n');
            
            uni.showModal({
              title: course.name,
              content: `地点：${course.location}\n时间：${this.weekDays[course.day].name} ${period} ${timeRange}`,
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
    // 显示导入选项
    showImportOptions() {
      uni.showActionSheet({
        itemList: ['选择Excel文件', '选择图片识别', '手动输入'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.selectExcelFile();
          } else if (res.tapIndex === 1) {
            this.selectImageFile();
          } else if (res.tapIndex === 2) {
            this.openManualInputModal();
          }
        }
      });
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
        color: '#FF6B6B'
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
    // 保存手动输入的课程
    saveManualCourse() {
      // 表单验证
      if (!this.manualCourse.name.trim()) {
        uni.showToast({ title: '请输入课程名称', icon: 'none' });
        return;
      }
      if (!this.manualCourse.location.trim()) {
        uni.showToast({ title: '请输入上课地点', icon: 'none' });
        return;
      }

      // 计算实际的开始和结束节次（每个时间段占2节课）
      const startSlot = (this.manualCourse.start - 1) * 2 + 1;
      const endSlot = startSlot + (this.manualCourse.endIndex + 1) * 2 - 1;
      
      const courseData = {
        name: this.manualCourse.name.trim(),
        location: this.manualCourse.location.trim(),
        day: this.manualCourse.day,
        start: startSlot,
        end: endSlot,
        color: this.manualCourse.color
      };

      if (this.editingCourse) {
        // 更新课程
        const index = this.courseSchedule.findIndex(item => item.id === this.editingCourse.id);
        if (index !== -1) {
          this.courseSchedule[index] = {
            ...this.courseSchedule[index],
            ...courseData
          };
          uni.showToast({ title: '课程更新成功', icon: 'success' });
        }
      } else {
        // 添加新课程
        courseData.id = Date.now(); // 使用时间戳作为唯一ID
        this.courseSchedule.push(courseData);
        uni.showToast({ title: '课程添加成功', icon: 'success' });
      }

      this.closeManualInputModal();
    },
    // 编辑课程
    editCourse(course) {
      this.editingCourse = course;
      // 计算时间段索引，假设course.start是时间段序号（1开始）
      const timeSlotIndex = Math.ceil(course.start / 2);
      this.manualCourse = {
        name: course.name,
        location: course.location,
        day: course.day,
        start: timeSlotIndex, // 使用时间段序号
        endIndex: Math.ceil(course.end / 2) - timeSlotIndex, // 计算结束时间段索引
        color: course.color
      };
      // 更新结束节次选项
      this.updateEndOptions();
      this.showManualInputModal = true;
    },
    // 删除课程
    deleteCourse(course) {
      uni.showModal({
        title: '删除课程',
        content: `确定要删除"${course.name}"吗？`,
        success: (res) => {
          if (res.confirm) {
            const index = this.courseSchedule.findIndex(c => c.id === course.id);
            if (index !== -1) {
              this.courseSchedule.splice(index, 1);
              uni.showToast({
                title: '课程已删除',
                icon: 'success'
              });
            }
          }
        }
      });
    },
    // 选择Excel文件
    selectExcelFile() {
      uni.chooseFile({
        count: 1,
        extension: ['xlsx', 'xls'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          uni.showLoading({
            title: '解析中...'
          });
          
          // 模拟解析过程
          setTimeout(() => {
            uni.hideLoading();
            this.confirmImport();
          }, 1500);
        },
        fail: () => {
          uni.showToast({
            title: '取消选择',
            icon: 'none'
          });
        }
      });
    },
    // 选择图片文件
    selectImageFile() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          uni.showLoading({
            title: '识别中...'
          });
          
          // 模拟识别过程
          setTimeout(() => {
            uni.hideLoading();
            this.confirmImport();
          }, 1500);
        },
        fail: () => {
          uni.showToast({
            title: '取消选择',
            icon: 'none'
          });
        }
      });
    },
    // 确认导入
    confirmImport() {
      uni.showModal({
        title: '导入成功',
        content: '已成功解析课表数据，是否覆盖当前课表？',
        success: (res) => {
          if (res.confirm) {
            // 这里可以添加覆盖课表的逻辑
            uni.showToast({
              title: '课表已更新',
              icon: 'success'
            });
            // 模拟导入后的课程数据更新
            // 实际应用中，这里应该使用解析得到的真实数据
            this.generateDemoSchedule();
          }
        }
      });
    },
    // 生成演示课表数据
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
}

/* 表头 */
.schedule-header {
  display: flex;
  margin-bottom: 20rpx;
}

.time-cell {
  width: 100rpx;
  flex-shrink: 0;
}

.day-cell {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #666666;
}

/* 课程内容 */
.schedule-content {
  display: flex;
  height: 700rpx;
}

/* 时间列 */
.time-column {
  width: 100rpx;
  flex-shrink: 0;
}

.time-item {
  height: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #999999;
  border-bottom: 1px solid #F0F0F0;
}

/* 课程格子 */
.course-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(5, 140rpx);
  gap: 2rpx;
  background-color: #F0F0F0;
}

.course-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.course-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-location {
  font-size: 20rpx;
  color: #FFFFFF;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
