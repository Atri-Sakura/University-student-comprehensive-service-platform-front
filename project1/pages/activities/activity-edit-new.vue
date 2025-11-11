<template>
  <view class="container">
    <view class="header">
      <view class="header-title">编辑活动</view>
    </view>
    
    <scroll-view class="content" scroll-y>
      <!-- 活动基本信息 -->
      <view class="section">
        <view class="section-title">活动信息</view>
        
        <view class="form-item">
          <view class="form-label">活动名称 <text class="required">*</text></view>
          <input 
            v-model="activity.name" 
            placeholder="请输入活动名称" 
            type="text" 
            class="simple-input"
          />
        </view>
        
        <view class="form-item">
          <view class="form-label">活动类型 <text class="required">*</text></view>
          <picker class="form-picker" @change="onTypeChange" :value="typeIndex" :range="activityTypes">
            <view class="picker-text">{{ activityTypes[typeIndex] }}</view>
          </picker>
        </view>
        
        <view class="form-item">
          <view class="form-label">活动时间 <text class="required">*</text></view>
          <view class="date-container">
            <input 
              class="date-input" 
              v-model="activity.startDate" 
              type="date" 
              placeholder="开始日期"
              @tap="showStartDatePicker"
            />
            <text class="date-separator">至</text>
            <input 
              class="date-input" 
              v-model="activity.endDate" 
              type="date" 
              placeholder="结束日期"
              @tap="showEndDatePicker"
            />
          </view>
        </view>
        
        <view class="form-item">
          <view class="form-label">活动内容 <text class="required">*</text></view>
          <textarea 
            class="form-textarea" 
            v-model="activity.description" 
            placeholder="请输入活动内容描述"
            rows="4"
          ></textarea>
        </view>
        
        
      </view>
    </scroll-view>
    
    <!-- 底部操作按钮 -->
    <view class="footer">
      <button class="cancel-btn" @click="cancel">取消</button>
      <button class="save-btn" @click="saveActivity">保存修改</button>
    </view>
  </view>
</template>

<script>
import { getActivityDetail, updateActivity } from '../../utils/merchantActivityApi.js';

export default {
  name: 'ActivityEditNew',
  data() {
    return {
      activityId: '',
      activity: {
        name: '',
        type: '满减',
        startDate: '',
        endDate: '',
        description: '',
        enabled: true
      },
      activityTypes: ['满减', '折扣', '赠品', '积分'],
      typeIndex: 0,
      merchantBaseId: '',
      loading: false
    };
  },
  onLoad(options) {
    // 页面加载时获取活动ID
    if (options && options.activityId) {
      this.activityId = options.activityId;
      // 初始化商家基础ID（实际应该从登录信息或全局状态中获取）
      this.merchantBaseId = getApp().globalData.merchantId || '3'; // 设置默认值以防止空值
      // 加载活动详情数据
      this.loadActivityData();
    } else {
      uni.showToast({
        title: '参数错误，无法加载活动信息',
        icon: 'none'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    }
  },
  methods: {
    /**
     * 格式化日期为YYYY-MM-DD格式
     */
    formatDate(date) {
      if (!date) return '';
      
      try {
        // 处理不同类型的日期输入
        let d;
        
        // 如果是数字，可能是时间戳
        if (typeof date === 'number') {
          d = new Date(date);
        } 
        // 如果是字符串，尝试直接转换或解析
        else if (typeof date === 'string') {
          // 如果已经是YYYY-MM-DD格式，直接返回
          if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }
          // 否则尝试解析
          d = new Date(date);
        } 
        // 如果已经是Date对象，直接使用
        else if (date instanceof Date) {
          d = date;
        } else {
          return '';
        }
        
        // 检查日期是否有效
        if (isNaN(d.getTime())) {
          console.warn('无效的日期:', date);
          return '';
        }
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
      } catch (error) {
        console.error('日期格式化错误:', error);
        return '';
      }
    },
    
    /**
     * 加载活动详情数据
     */
    loadActivityData() {
      // 显示加载状态
      this.loading = true;
      uni.showLoading({
        title: '加载活动详情...'
      });
      
      console.log('开始加载活动详情，活动ID:', this.activityId);
      
      // 调用API获取活动详情
      getActivityDetail(this.activityId)
        .then(res => {
          uni.hideLoading();
          this.loading = false;
          
          console.log('获取活动详情返回结果:', JSON.stringify(res));
          
          // 检查返回数据格式是否正确，兼容不同的返回格式
          let activityDetail = null;
          console.log('响应数据详细结构分析:', JSON.stringify(res, null, 2));
          
          // 增加健壮性检查，确保res是对象
          if (typeof res !== 'object' || res === null) {
            console.error('响应不是有效的对象:', res);
            uni.showToast({ title: '系统错误：无效的响应数据', icon: 'none' });
            return;
          }
          
          // 首先直接检查data字段是否存在活动相关属性
          if (res.data && (res.data.activityId || res.data.activity_id || res.data.id)) {
            // 直接匹配到了活动数据
            activityDetail = res.data;
          } 
          // 根据日志中的实际返回格式，处理多层嵌套的情况
          else if (res.data && res.data.code === 200 && res.data.data) {
            // 格式1: {data: {code: 200, data: {...}}}
            activityDetail = res.data.data;
          } else if (res.code === 200 && res.data && typeof res.data === 'object') {
            // 格式2: {code: 200, data: {...}}
            activityDetail = res.data;
          } else if (res.code === 200) {
            // 格式3: {code: 200, ...其他数据字段...}
            activityDetail = res;
          } else if (res.data && res.data.code === 0 && res.data.data) {
            // 格式4: {data: {code: 0, data: {...}}}
            activityDetail = res.data.data;
          } else if (res.data && res.code === 0) {
            // 格式5: {code: 0, data: {...}}
            activityDetail = res.data;
          } else if (res.code === 0) {
            // 格式6: {code: 0, ...其他数据字段...}
            activityDetail = res;
          }
          
          // 添加额外的回退检查
          if (!activityDetail && res.result) {
            // 可能是直接返回result字段
            activityDetail = res.result;
          } else if (!activityDetail && res.activity) {
            // 可能是直接返回activity字段
            activityDetail = res.activity;
          }
          
          if (activityDetail) {
              console.log('解析到的活动详情数据:', activityDetail);
              
              // 安全地处理日期格式化，避免空值导致的错误
              const safeFormatDate = (dateValue) => {
                if (!dateValue) return '';
                try {
                  return this.formatDate(dateValue);
                } catch (error) {
                  console.error('日期格式化失败:', error, '原始值:', dateValue);
                  return '';
                }
              };
              
              // 安全地访问activityDetail对象属性
              const getProperty = (obj, ...props) => {
                if (!obj || typeof obj !== 'object') return '';
                for (const prop of props) {
                  if (obj[prop] !== undefined) return obj[prop];
                }
                return '';
              };
              
              // 根据后端返回的结构映射数据，支持多种可能的字段名
              this.activity = {
                name: getProperty(activityDetail, 'activityName', 'activity_name', 'name', 'title'),
                type: getProperty(activityDetail, 'activityType', 'activity_type', 'type'),
                startDate: safeFormatDate(getProperty(activityDetail, 'startTime', 'start_time', 'beginTime')),
                endDate: safeFormatDate(getProperty(activityDetail, 'endTime', 'end_time')),
                description: getProperty(activityDetail, 'content', 'description', 'remark', 'detail'),
                enabled: (getProperty(activityDetail, 'status') === 1) || 
                         (getProperty(activityDetail, 'status') === '进行中') ||
                         (getProperty(activityDetail, 'status') === 'ACTIVE')
              };
              
              console.log('格式化后的活动数据:', this.activity);
              
              // 确保活动类型不为空，设置默认值
              if (!this.activity.type) {
                this.activity.type = this.activityTypes[0] || '满减';
              }
              
              // 设置活动类型索引
              this.typeIndex = this.activityTypes.indexOf(this.activity.type);
              if (this.typeIndex === -1) {
                // 如果找不到完全匹配的类型，尝试使用数字索引或设置默认值
                const typeMap = {
                  1: '满减',
                  2: '折扣',
                  3: '赠品',
                  4: '积分',
                  'DISCOUNT': '折扣',
                  'FULL_REDUCTION': '满减',
                  'NEW_USER': '新用户',
                  'OTHER': '其他'
                };
                
                // 检查是否是数字类型的活动类型
                const typeNum = parseInt(this.activity.type);
                if (!isNaN(typeNum) && typeMap[typeNum]) {
                  this.activity.type = typeMap[typeNum];
                  this.typeIndex = this.activityTypes.indexOf(this.activity.type);
                } else if (typeof this.activity.type === 'string' && typeMap[this.activity.type.toUpperCase()]) {
                  // 尝试匹配枚举类型的活动类型
                  this.activity.type = typeMap[this.activity.type.toUpperCase()];
                  this.typeIndex = this.activityTypes.indexOf(this.activity.type);
                } else {
                  // 设置默认类型
                  console.log('未找到匹配的活动类型，使用默认值:', this.activity.type);
                  this.typeIndex = 0;
                  this.activity.type = this.activityTypes[0] || '满减';
                }
              }
              
              // 验证数据完整性，如果关键字段缺失提供默认值
              if (!this.activity.name) {
                console.warn('活动名称缺失，使用默认名称');
                this.activity.name = '未命名活动';
              }
            } else {
              const errorMsg = res.data?.msg || res.msg || '加载活动失败';
              console.error('加载活动失败，返回数据格式不符合预期:', res);
              // 提供默认数据，避免页面崩溃
              this.activity = {
                name: '',
                type: '满减',
                startDate: '',
                endDate: '',
                description: '',
                enabled: false
              };
              this.typeIndex = 0;
              uni.showToast({
                title: errorMsg,
                icon: 'none'
              });
            }
          })
          .catch(error => {
          uni.hideLoading();
          this.loading = false;
          console.error('获取活动详情失败:', error);
          
          // 提供默认数据，避免页面崩溃
          this.activity = {
            name: '',
            type: '满减',
            startDate: '',
            endDate: '',
            description: '',
            enabled: false
          };
          this.typeIndex = 0;
          
          // 显示更详细的错误信息
          let errorMsg = '获取活动详情失败';
          if (error.response) {
            errorMsg = `加载失败: ${error.response.status} ${error.response.statusText}`;
          } else if (error.message) {
            errorMsg = `加载失败: ${error.message}`;
          }
          
          uni.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          });
        });
    },
    
    /**
     * 处理活动类型选择变更
     */
    onTypeChange(e) {
      const index = e.detail.value;
      this.typeIndex = index;
      this.activity.type = this.activityTypes[index];
    },
    
    /**
     * 显示开始日期选择器
     */
    showStartDatePicker() {
      // 系统会自动弹出日期选择器
    },
    
    /**
     * 显示结束日期选择器
     */
    showEndDatePicker() {
      // 系统会自动弹出日期选择器
    },
    
    /**
     * 取消编辑，返回上一页
     */
    cancel() {
      uni.navigateBack();
    },
    
    /**
     * 保存活动信息
     */
    saveActivity() {
      // 表单验证
      if (!this.activity.name.trim()) {
        uni.showToast({
          title: '请输入活动名称',
          icon: 'none'
        });
        return;
      }
      
      if (!this.activity.startDate || !this.activity.endDate) {
        uni.showToast({
          title: '请选择活动时间',
          icon: 'none'
        });
        return;
      }
      
      // 验证日期有效性
      const startDate = new Date(this.activity.startDate);
      const endDate = new Date(this.activity.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        uni.showToast({
          title: '请选择有效的活动时间',
          icon: 'none'
        });
        return;
      }
      
      // 验证结束日期不早于开始日期
      if (endDate < startDate) {
        uni.showToast({
          title: '结束日期不能早于开始日期',
          icon: 'none'
        });
        return;
      }
      
      if (!this.activity.description.trim()) {
        uni.showToast({
          title: '请输入活动内容',
          icon: 'none'
        });
        return;
      }
      
      // 构建提交数据，严格按照后端API要求的字段结构
      const activityData = {
        merchantBaseId: this.merchantBaseId,
        id: this.activityId, // 添加活动ID，确保正确更新活动
        activityName: this.activity.name,
        activityType: this.activity.type,
        content: this.activity.description,
        startTime: startDate.getTime(),
        endTime: endDate.getTime(),
        status: this.activity.enabled ? 1 : 0
      };
      console.log('更新活动数据:', activityData);
      
      // 显示加载提示
      this.loading = true;
      uni.showLoading({
        title: '保存中...'
      });
      
      // 调用更新活动API
      updateActivity(activityData)
        .then(res => {
          uni.hideLoading();
          this.loading = false;
          
          console.log('更新活动接口返回结果:', JSON.stringify(res));
          
          // 修改条件判断，适应可能的不同返回码
          let isSuccess = false;
          let errorMsg = '保存失败';
          
          // 检查多种可能的成功响应格式
          if (res && (res.code === 200 || res.code === 0)) {
            isSuccess = true;
          } else if (res && res.data && (res.data.code === 200 || res.data.code === 0)) {
            isSuccess = true;
          } else if (res && !res.code && !res.data?.code) {
            // 如果没有明确的状态码，可以假设成功
            isSuccess = true;
          } else {
            // 获取错误信息
            errorMsg = res.data?.msg || res.msg || '保存失败';
          }
          
          if (isSuccess) {
            uni.showToast({
              title: '保存成功',
              icon: 'success'
            });
            // 保存成功后返回上一页
            setTimeout(() => {
              const pages = getCurrentPages();
              if (pages.length <= 1) {
                uni.reLaunch({ url: '/pages/index/index' });
              } else {
                uni.navigateBack();
              }
            }, 1000);
          } else {
            console.error('保存活动失败:', errorMsg);
            uni.showToast({
              title: errorMsg,
              icon: 'none'
            });
          }
        })
        .catch(err => {
          console.error('保存活动失败:', err);
          uni.hideLoading();
          this.loading = false;
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        });
    }
  }
}
</script>


<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 40rpx 30rpx;
  text-align: center;
  position: relative;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.content {
  flex: 1;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f8f8f8;
}

.content {
  width: 100%;
  max-width: 700rpx;
  padding-bottom: 120rpx;
}

.section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  width: 100%;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  border-left: 6rpx solid #07c160;
  padding-left: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-label .required {
  color: #ff4757;
  margin-left: 5rpx;
}

/* 输入框样式 */
.simple-input,
.form-input,
.date-input {
  width: 90%;
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #333333;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
}

.simple-input:focus,
.form-input:focus,
.date-input:focus {
  border-color: #07c160;
}

/* 文本域样式 */
.form-textarea {
  width: 90%;
  min-height: 200rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #333333;
  resize: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
  line-height: 1.6;
}

.form-textarea:focus {
  border-color: #07c160;
}

/* 选择器样式 */
.form-picker {
  width: 90%;
  height: 88rpx;
  line-height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 10rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #ffffff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-picker::after {
  content: '▼';
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 20rpx;
}

.picker-text {
  color: #333;
}

/* 日期选择区域样式 */
.date-container {
  display: flex;
  align-items: center;
  width: 90%;
}

.date-input {
  flex: 1;
  margin: 0;
}

.date-separator {
  font-size: 28rpx;
  color: #666;
  white-space: nowrap;
  padding: 0 16rpx;
}

/* 状态开关样式 */
.status-container {
  display: flex;
  align-items: center;
}

.form-switch {
  transform: scale(0.9);
}

.status-text {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: #666;
}

/* 底部按钮样式 */
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 24rpx 30rpx;
  display: flex;
  gap: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.cancel-btn {
  flex: 1;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #666;
  font-size: 34rpx;
  border-radius: 10rpx;
  border: none;
}

.save-btn {
  flex: 1;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #07c160;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 10rpx;
  border: none;
}

.save-btn:active {
  background-color: #06ad56;
}

/* 加载状态样式 */
.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  z-index: 999;
}
</style>