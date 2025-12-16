<template>
  <view class="container">
    <!-- 顶部店铺信息 -->
    <view class="shop-header">
      <view class="shop-icon">🏪</view>
      <view class="shop-info">
        <view class="shop-name">{{ shopData.name }}</view>
        <view class="shop-status">{{ shopData.businessStatus }} · {{ shopData.businessHours }}</view>
      </view>
    </view>
    
    <!-- 创建新活动按钮 -->
    <view class="create-btn" @click="createNewActivity">
      <text class="btn-text">创建新活动</text>
    </view>
    
    <!-- 活动状态筛选 -->
    <view class="filter-tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === index }" 
        v-for="(tab, index) in tabs" 
        :key="index"
        @click="switchTab(index)"
      >
        <text class="tab-text">{{ tab.name }}</text>
      </view>
    </view>
    
    <!-- 活动列表 -->
    <view class="activity-list">
      <!-- 加载中状态 -->
      <view v-if="loading" class="loading">
        <text class="loading-text">加载中...</text>
        <view class="loading-spinner"></view>
      </view>
      
      <!-- 活动卡片列表 -->
      <view v-else>
        <view class="activity-card" v-for="activity in filteredActivities" :key="activity.tempId || activity.merchantActivityId || activity.id || index">
          <view class="activity-header">
            <text class="activity-name">{{ activity.name }}</text>
            <view class="status-badge" :class="activity.statusClass">{{ activity.status }}</view>
          </view>
          <text class="activity-time">{{ activity.startDate }} 至 {{ activity.endDate }}</text>
          <view class="activity-type">{{ activity.type }}</view>
          <text class="activity-description">{{ activity.description }}</text>
          
          <!-- 操作按钮 -->
          <view class="activity-actions">
            <view class="action-btn view" @click="viewActivity(activity)">
              <text class="btn-text">查看详情</text>
            </view>
            <view class="action-btn edit" @click="editActivity(activity)">
              <text class="btn-text">编辑</text>
            </view>
            <view class="action-btn delete" @click="handleDeleteActivity(activity)">
              <text class="btn-text">删除</text>
            </view>
          </view>
        </view>
      
        <!-- 空状态 -->
        <view v-if="filteredActivities.length === 0" class="empty">
          <text class="empty-icon">📋</text>
          <text class="empty-text">暂无活动</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getActivityList, deleteActivity, addMerchantActivity } from '../../utils/merchantActivityApi.js';
import { merchantAPI, request } from '../../utils/api.js';
// 获取token的函数
const getToken = () => {
  return uni.getStorageSync('token');
};

export default {
  name: 'ActivityManagement',
  data() {
    return {
      shopData: {
        name: "美味餐厅",
        businessStatus: "营业中",
        businessHours: "08:00-22:00"
      },
      currentTab: 0,
      tabs: [
        { name: '全部活动' },
        { name: '进行中' },
        { name: '未开始' },
        { name: '已结束' }
      ],
      activities: [],
      loading: false
    }
  },
  onLoad() {
    // 页面加载时获取活动列表和店铺信息
    this.loadShopInfo();
    this.fetchActivities();
  },
  onShow() {
    // 每次显示页面时重新加载店铺信息和活动数据
    this.loadShopInfo();
    this.fetchActivities();
  },
  created() {
    // 组件创建时的初始化操作
  },
  computed: {
      filteredActivities() {
        // 根据不同状态进行筛选
        
        if (this.currentTab === 0) {
          return this.activities;
        } else if (this.currentTab === 1) {
          // 进行中
          return this.activities.filter(activity => activity.status === '进行中');
        } else if (this.currentTab === 2) {
          // 未开始
          return this.activities.filter(activity => activity.status === '未开始');
        } else if (this.currentTab === 3) {
          // 已结束
          return this.activities.filter(activity => activity.status === '已结束');
        }
        return [];
      }
    },
  methods: {
      /**
       * 加载店铺信息 - 简化版本，专注于从缓存获取数据
       */
    loadShopInfo() {
      console.log('开始加载店铺信息...');
      
      // 直接从本地缓存获取店铺信息
      const savedInfo = uni.getStorageSync('shopInfo');
      console.log('从缓存读取到的数据:', savedInfo);
      
      if (savedInfo && (savedInfo.name || savedInfo.openStatus || savedInfo.hours)) {
        this.shopData = {
          name: savedInfo.name || "默认餐厅",
          businessStatus: savedInfo.openStatus || "营业中",
          businessHours: savedInfo.hours || "00:00-24:00"
        };
        console.log('已成功从缓存更新店铺信息:', this.shopData);
      } else {
        console.log('缓存中没有有效数据，使用默认值:', this.shopData);
        // 手动设置一个测试数据
        const testShopData = {
          name: "test11",
          openStatus: "营业中",
          hours: "9:00-21:00"
        };
        // 保存测试数据到缓存
        uni.setStorageSync('shopInfo', testShopData);
        console.log('已保存测试数据到缓存:', testShopData);
        // 更新页面数据
        this.shopData = {
          name: testShopData.name,
          businessStatus: testShopData.openStatus,
          businessHours: testShopData.hours
        };
      }
    },
    
    /**
     * 获取活动列表
     */
    fetchActivities() {
      this.loading = true;
      
      // 总是获取所有活动，不按状态筛选
      let params = {};
      
      getActivityList(params)
        .then(res => {
          this.loading = false;
          // 打印完整原始响应数据，方便调试
          console.log('完整后端响应:', JSON.stringify(res));
          
          // 处理后端返回的数据
          // 根据截图，后端返回的成功状态码是0而非200
          if (res.data && res.data.code === 0) {
            // 根据后端实际返回的数据格式，数据直接在 res.data.rows 中
            let activitiesData = res.data.rows || [];
            console.log('处理前的活动数据数组长度:', activitiesData.length);
            
            // 转换数据格式，使其符合前端显示要求
            this.activities = activitiesData.map((activity, index) => {
              // 创建活动副本，避免修改原始数据
              const activityCopy = { ...activity };
              
              // 转换ID字段为字符串
              const merchantActivityIdStr = String(activity.merchantActivityId || '');
              const merchant_activity_idStr = String(activity.merchant_activity_id || '');
              const idStr = String(activity.id || '');
              
              // 全面查找日期信息，检查所有可能的字段名
              const startDateSources = [
                activity.start_time, activity.startDate, activity.beginTime, 
                activity.start, activity.begin_time, activity.begin_date,
                activity.starting_time, activity.starting_date, activity.startingDate,
                activity.startTime // 添加与后端匹配的startTime字段名
              ];
              
              const endDateSources = [
                activity.end_time, activity.endDate, activity.endTime, 
                activity.end, activity.finish_time, activity.finish_date,
                activity.ending_time, activity.ending_date, activity.endingDate,
                activity.endTime // 添加与后端匹配的endTime字段名
              ];
              
              // 找到第一个非空的日期字段
              const startDate = startDateSources.find(date => date !== null && date !== undefined && date !== '');
              const endDate = endDateSources.find(date => date !== null && date !== undefined && date !== '');
              
              const activityName = activity.activity_name || activity.activityName || activity.name || '未命名活动';
              console.log(`=== 处理活动[${index}]: ${activityName} ===`);
              console.log(`日期来源 - 开始: ${startDateSources.filter(d => d).join(', ') || '无'}`);
              console.log(`日期来源 - 结束: ${endDateSources.filter(d => d).join(', ') || '无'}`);
              console.log(`选定的日期: ${startDate} 至 ${endDate}`);
              console.log(`后端状态值: ${activity.status}, enabled: ${activity.enabled}`);
              
              // 计算状态 - 优先基于日期计算，确保日期比较正确
              let statusText = '状态未知';
              
              // 先尝试基于日期计算状态
              try {
                // 解析日期
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                
                let parsedStart = null;
                let parsedEnd = null;
                
                // 标准化解析结束日期的函数
                const parseDateString = (dateStr) => {
                  if (!dateStr) return null;
                  
                  let date = new Date(dateStr);
                  
                  // 如果直接解析失败，尝试提取日期部分
                  if (isNaN(date.getTime()) && typeof dateStr === 'string') {
                    const dateMatch = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
                    if (dateMatch) {
                      date = new Date(dateMatch[1]);
                      console.log(`提取日期部分: ${dateMatch[1]} 转换为: ${date.toISOString()}`);
                    }
                  }
                  
                  // 确保日期有效
                  if (!isNaN(date.getTime())) {
                    date.setHours(0, 0, 0, 0);
                    return date;
                  }
                  return null;
                };
                
                // 尝试解析开始和结束日期
                if (startDate) {
                  parsedStart = parseDateString(startDate);
                  console.log(`解析开始日期: ${startDate} 结果: ${parsedStart ? parsedStart.toISOString() : '无效'}`);
                }
                
                if (endDate) {
                  parsedEnd = parseDateString(endDate);
                  console.log(`解析结束日期: ${endDate} 结果: ${parsedEnd ? parsedEnd.toISOString() : '无效'}`);
                }
                
                // 根据可用的日期信息计算状态
                if (parsedEnd) {
                  // 有结束日期，优先判断是否已结束
                  console.log(`比较当前日期 ${now.toISOString()} 和结束日期 ${parsedEnd.toISOString()}`);
                  if (now > parsedEnd) {
                    console.log(`活动已结束: ${parsedEnd.toISOString()} 早于当前日期`);
                    statusText = '已结束';
                  } else {
                    // 未结束，判断是否有开始日期
                    if (parsedStart) {
                      console.log(`比较当前日期 ${now.toISOString()} 和开始日期 ${parsedStart.toISOString()}`);
                      if (now < parsedStart) {
                        console.log(`活动未开始: ${now.toISOString()} 早于开始日期`);
                        statusText = '未开始';
                      } else {
                        console.log(`活动进行中: 在开始日期之后，结束日期之前`);
                        statusText = '进行中';
                      }
                    } else {
                      console.log(`只有结束日期，且未过期，默认为进行中`);
                      statusText = '进行中';
                    }
                  }
                } else if (parsedStart) {
                  // 只有开始日期，判断是否未开始
                  console.log(`只有开始日期，比较当前日期 ${now.toISOString()} 和开始日期 ${parsedStart.toISOString()}`);
                  statusText = now < parsedStart ? '未开始' : '进行中';
                  console.log(`状态: ${statusText}`);
                } else {
                  console.log('没有有效的开始日期和结束日期');
                }
              } catch (error) {
                console.error('日期计算出错:', error);
              }
              
              // 如果日期计算失败，尝试使用后端状态作为备选
              if (statusText === '状态未知' && activity.status !== undefined) {
                console.log('日期计算失败，使用后端状态');
                const statusMap = {
                  0: '未开始',
                  1: '未开始',
                  2: '进行中',
                  3: '已结束'
                };
                statusText = statusMap[activity.status] || `状态(${activity.status})`;
              }
              
              // 清理临时保存的活动引用
              this.activity = null;
              
              // 创建处理后的活动对象
              const processedActivity = {
                ...activityCopy,
                // 确保ID字段作为字符串保存
                merchantActivityId: merchantActivityIdStr,
                merchant_activity_id: merchant_activity_idStr,
                id: idStr,
                // 添加临时唯一标识符
                tempId: `${merchantActivityIdStr || 'temp'}_${index}_${Date.now()}`,
                // 基本信息
                name: activityName,
                // 状态信息
                status: statusText,
                statusClass: this.getStatusClass(statusText),
                // 保存原始状态值用于调试
                _originalStatus: activity.status,
                _originalEnabled: activity.enabled,
                // 日期信息
                startDate: startDate,
                endDate: endDate,
                // 其他信息
                type: this.getActivityTypeText(activity.activity_type || activity.activityType),
                description: activity.content || activity.description || activity.remark || '暂无描述'
              };
              
              console.log(`活动[${index}]处理完成，最终状态: ${statusText}`);
              return processedActivity;
            });
            
            console.log('处理完成的活动列表:', this.activities.map(a => ({ name: a.name, status: a.status })));
          } else {
            uni.showToast({
              title: res.data?.msg || '获取活动列表失败',
              icon: 'none'
            });
          }
        })
        .catch(err => {
          this.loading = false;
          console.error('获取活动列表失败:', err);
          uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        });
    },
    
    /**
     * 标准化日期，将任何日期格式转换为当天0点
     */
    normalizeDate(date) {
      // 防止传入undefined或null
      if (!date) return new Date('invalid');
      
      // 创建日期对象
      let dateObj;
      
      // 尝试多种解析方式
      if (typeof date === 'string') {
        // 尝试直接解析
        dateObj = new Date(date);
        
        // 如果直接解析失败，尝试其他格式
        if (isNaN(dateObj.getTime())) {
          // 尝试处理ISO格式
          if (date.includes('T')) {
            // 处理ISO格式，移除时区信息
            const cleanDate = date.split('T')[0];
            dateObj = new Date(cleanDate);
          } 
          // 尝试处理中文格式
          else if (date.includes('年') || date.includes('月') || date.includes('日')) {
            // 简单的中文日期格式处理
            const year = date.match(/\d{4}/);
            const month = date.match(/\d{1,2}月/);
            const day = date.match(/\d{1,2}日/);
            
            if (year && month && day) {
              const yearNum = parseInt(year[0]);
              const monthNum = parseInt(month[0]);
              const dayNum = parseInt(day[0]);
              
              dateObj = new Date(yearNum, monthNum - 1, dayNum);
            }
          }
          // 尝试处理纯数字格式（如时间戳）
          else if (/^\d+$/.test(date)) {
            dateObj = new Date(parseInt(date));
          }
        }
      } else if (typeof date === 'number') {
        // 数字格式（时间戳）
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        // 已经是Date对象
        dateObj = new Date(date);
      } else {
        // 其他类型，转换为字符串后尝试
        dateObj = new Date(String(date));
      }
      
      // 标准化为当天0点
      if (!isNaN(dateObj.getTime())) {
        dateObj.setHours(0, 0, 0, 0);
        return dateObj;
      } else {
        // 返回无效日期
        return new Date('invalid');
      }
    },
    
    /**
     * 根据开始和结束日期计算活动状态文本
     */
    getStatusText(startDate, endDate) {
      console.log('计算活动状态:', { 
        startDate: JSON.stringify(startDate), 
        endDate: JSON.stringify(endDate),
        activity: this.activity ? '存在' : '不存在'
      });
      
      try {
        // 尝试多种方式获取日期，确保不遗漏任何可能的日期字段
        // 从临时保存的活动引用中获取更多可能的日期字段
        const extendedStartDate = startDate || (this.activity?.start) || (this.activity?.begin_time);
        const extendedEndDate = endDate || (this.activity?.end) || (this.activity?.finish_time);
        
        console.log('扩展后的日期字段:', { extendedStartDate, extendedEndDate });
        
        // 解析并标准化日期
        const parsedStart = this.normalizeDate(extendedStartDate);
        const parsedEnd = this.normalizeDate(extendedEndDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // 打印解析结果
        console.log('日期解析结果:', {
          originalStart: extendedStartDate,
          parsedStart,
          isValidStart: !isNaN(parsedStart.getTime()),
          originalEnd: extendedEndDate,
          parsedEnd,
          isValidEnd: !isNaN(parsedEnd.getTime()),
          today
        });
        
        // 如果日期有效，进行状态计算
        if (!isNaN(parsedStart.getTime()) && !isNaN(parsedEnd.getTime())) {
          if (parsedStart > today) {
            console.log('状态判断：未开始');
            return '未开始';
          } else if (parsedEnd < today) {
            console.log('状态判断：已结束');
            return '已结束';
          } else {
            console.log('状态判断：进行中');
            return '进行中';
          }
        }
        
        // 日期无效，尝试使用后端状态
        console.warn('日期无效，尝试使用后端状态');
        return this.getStatusFromBackend();
      } catch (error) {
        console.error('计算状态时发生错误:', error);
        // 出错时使用后端状态
        return this.getStatusFromBackend();
      }
    },
    
    /**
     * 从后端状态获取状态文本
     */
    getStatusFromBackend() {
      if (!this.activity) {
        console.warn('没有后端活动数据，无法获取状态');
        return '状态未知';
      }
      
      const originalStatus = this.activity.status;
      const enabled = this.activity.enabled;
      
      console.log('使用后端状态:', { originalStatus, enabled });
      
      // 先检查enabled字段，可能代表活动是否启用
      if (enabled !== undefined) {
        if (!enabled) {
          return '已禁用';
        }
      }
      
      // 根据后端状态值返回状态文本
      switch(originalStatus) {
        case 1:
        case '1':
          return '未开始';
        case 2:
        case '2':
          return '进行中';
        case 3:
        case '3':
          return '已结束';
        default:
          return `状态未知(${originalStatus !== undefined ? originalStatus : '无值'})`;
      }
    },
    
    /**
     * 根据状态文本获取样式类名
     */
    getStatusClass(statusText) {
      const classMap = {
        '未开始': 'status-upcoming',
        '进行中': 'status-ongoing',
        '已结束': 'status-ended',
        '状态未知': 'status-unknown'
      };
      return classMap[statusText] || 'status-unknown';
    },
    
    /**
     * 获取活动类型文本
     */
    getActivityTypeText(type) {
      // 确保 type 是数字类型
      const typeNum = typeof type === 'string' ? parseInt(type) : type;
      const typeMap = {
        1: '新客立减',
        2: '满减',
        3: '折扣商品',
        4: '买一送一'
      };
      // 如果映射中没有找到，返回通用描述
      return typeMap[typeNum] || `活动类型${type}`;
    },
    
    /**
     * 格式化数字，添加千分位
     */
    formatNumber(num) {
      if (typeof num === 'number') {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      return num;
    },
    switchTab(index) {
      this.currentTab = index;
      // 切换标签时不再重新获取数据，而是让filteredActivities计算属性自动筛选
    },
    /**
     * 创建新活动 - 跳转到活动创建页面
     */
    createNewActivity() {
      // 跳转到创建活动页面
      uni.navigateTo({
        url: '/pages/activities/activity-edit',
        success: () => {
          console.log('成功跳转到创建活动页面');
        },
        fail: (err) => {
          console.error('跳转到创建活动页面失败:', err);
          uni.showToast({
            title: '跳转失败: ' + (err.errMsg || '未知错误'),
            icon: 'none'
          });
        }
      });
    },
    
    /**
     * 格式化日期为YYYY-MM-DD格式
     * @param {Date} date - 日期对象
     * @returns {String} 格式化后的日期字符串
     */
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    viewActivity(activity) {
      // 跳转到活动详情页面
      const activityId = activity.merchantActivityId || activity.id;
      uni.navigateTo({
        url: `/pages/activities/activity-detail?activityId=${activityId}`,
        success: () => {
          console.log('成功跳转到活动详情页面:', activityId);
        },
        fail: (err) => {
          console.error('跳转到活动详情页面失败:', err);
          uni.showToast({
            title: '跳转失败: ' + (err.errMsg || '未知错误'),
            icon: 'none'
          });
        }
      });
    },
    editActivity(activity) {
      // 跳转到新的编辑活动页面，带上活动ID
      uni.navigateTo({
        url: `/pages/activities/activity-edit-new?activityId=${activity.merchantActivityId || activity.id}`
      });
    },
    
    /**
     * 删除活动
     */
    handleDeleteActivity(activity) {
      // 显示确认对话框
      uni.showModal({
        title: '确认删除',
        content: `确定要删除活动"${activity.name}"吗？此操作不可撤销。`,
        showCancel: true,
        cancelText: '取消',
        confirmText: '删除',
        confirmColor: '#f56c6c',
        success: (res) => {
          if (res.confirm) {
            // 获取活动ID - 确保使用原始的数据库ID字段
            console.log('原始活动对象数据:', JSON.stringify(activity));
            
            // 重要：确保使用与后端交互的正确ID字段
            // 从日志和后端数据来看，直接使用后端返回的merchantActivityId字段
            // 同时考虑到后端可能存在的字段命名差异，添加更健壮的处理逻辑
            let activityId;
            
            // 首先检查是否有merchantActivityId字段（后端返回的字段名）
            if (activity.merchantActivityId !== undefined) {
              activityId = activity.merchantActivityId;
              console.log('使用后端返回的 merchantActivityId:', activityId, '类型:', typeof activityId);
              
              // 额外检查ID是否有效（非空、非0等）
              if (!activityId || activityId === 0) {
                console.error('活动ID无效:', activityId);
                uni.showToast({ title: '活动ID无效，无法删除', icon: 'none' });
                return;
              }
            } 
            // 备用方案：检查是否有下划线格式的字段名
            else if (activity.merchant_activity_id !== undefined) {
              activityId = activity.merchant_activity_id;
              console.log('使用下划线格式字段 merchant_activity_id:', activityId, '类型:', typeof activityId);
            } 
            // 最后尝试通用id字段
            else if (activity.id !== undefined) {
              activityId = activity.id;
              console.log('使用通用ID字段 id:', activityId, '类型:', typeof activityId);
            } else {
              console.error('未找到有效的活动ID字段');
              uni.showToast({ title: '活动数据异常，未找到ID', icon: 'none' });
              return;
            }
            
            // 记录完整的活动数据，帮助调试ID问题
            console.log('完整活动对象:', activity);
            console.log('当前环境信息:', {
              timestamp: new Date().toISOString(),
              browser: navigator.userAgent
            });
            
            // 保存当前要删除的活动索引，以便在删除成功后直接从本地列表移除
            const activityIndex = this.activities.findIndex(item => 
              item.merchantActivityId === activity.merchantActivityId || 
              item.tempId === activity.tempId
            );
            
            // 调用删除接口
            this.loading = true;
            deleteActivity([activityId])
              .then(res => {
                this.loading = false;
                console.log('删除活动响应:', res);
                
                // 处理响应
                if (res.data && (res.data.code === 0 || res.data.code === 200)) {
                  uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                  });
                  
                  // 优先从本地列表中直接移除该项，避免重新请求数据
                  if (activityIndex !== -1) {
                    console.log(`从本地活动列表中移除索引为${activityIndex}的活动`);
                    this.activities.splice(activityIndex, 1);
                  } else {
                    // 如果找不到索引，再重新获取整个活动列表
                    console.log('未找到要删除的活动索引，重新获取活动列表');
                    this.fetchActivities();
                  }
                } else if (res.data && res.data.code) {
                  // 显示具体的错误信息，包括权限错误
                  const errorMsg = res.data.msg || '删除失败';
                  const errorCode = res.data.code;
                  
                  console.error(`删除活动失败 - 错误码: ${errorCode}, 错误信息: ${errorMsg}`);
                  
                  // 特别处理权限错误
                  if (errorMsg.includes('无权') || errorCode === 500) {
                    uni.showModal({
                      title: '删除失败',
                      content: `权限验证失败: ${errorMsg}\n请确认您有权限删除此活动`,
                      showCancel: false,
                      confirmText: '确定'
                    });
                  } else {
                    // 其他类型错误
                    uni.showToast({
                      title: errorMsg,
                      icon: 'none'
                    });
                  }
                } else {
                  uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                  });
                  // 重新获取活动列表
                  this.fetchActivities();
                }
              })
              .catch(err => {
                this.loading = false;
                console.error('删除活动失败:', err);
                uni.showToast({
                  title: '网络错误，请稍后重试',
                  icon: 'none'
                });
              });
          }
        }
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
}

/* 顶部店铺信息 */
.shop-header {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
  position: relative;
}



.shop-icon {
  font-size: 80rpx;
  margin-right: 24rpx;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.shop-status {
  font-size: 28rpx;
  color: #666;
}

/* 创建新活动按钮 */
.create-btn {
  margin: 24rpx 30rpx;
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  box-shadow: 0 4rpx 12rpx rgba(168, 216, 234, 0.4);
  transition: all 0.2s ease;
}

.create-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 6rpx rgba(168, 216, 234, 0.6);
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  background: white;
  margin: 0 30rpx;
  border-radius: 12rpx;
  overflow: hidden;
  padding: 4rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 8rpx;
  transition: all 0.2s ease;
}

.tab-item.active {
  background: #E3F2FD;
  color: #2196F3;
  font-weight: bold;
}

.tab-text {
  font-size: 28rpx;
}

/* 活动列表 */
.activity-list {
  padding: 24rpx 30rpx;
}

.activity-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.activity-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.status-badge {
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-unknown {
  background: #E0E0E0;
  color: #666;
}

.status-ongoing {
  background: #E8F5E9;
  color: #4CAF50;
}

.status-upcoming {
  background: #FFF3E0;
  color: #FF9800;
}

.status-ended {
  background: #F5F5F5;
  color: #9E9E9E;
}

.activity-time {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.activity-type {
  display: inline-block;
  background: #E3F2FD;
  color: #2196F3;
  padding: 4rpx 16rpx;
  border-radius: 4rpx;
  font-size: 24rpx;
  margin-bottom: 16rpx;
}

.activity-description {
  display: block;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 24rpx;
  line-height: 1.5;
}



/* 操作按钮 */
.activity-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 20rpx;
  width: 100%;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.action-btn.view {
  background-color: #F0F9FF;
  color: #40A9FF;
}

.action-btn.edit {
  background-color: #E6F7FF;
  color: #1890FF;
}

.action-btn.delete {
  background-color: #FFF1F0;
  color: #FF4D4F;
}

.action-btn:active {
  opacity: 0.8;
  transform: scale(0.96);
}

/* 加载中状态 */
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    color: #999;
  }

  .loading-text {
    font-size: 30rpx;
    margin-bottom: 20rpx;
  }

  .loading-spinner {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid #f3f3f3;
    border-top: 4rpx solid #2196F3;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* 空状态 */
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    color: #999;
  }

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
  }

  .empty-text {
    font-size: 30rpx;
  }
</style>