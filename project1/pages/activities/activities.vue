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
    // 每次显示页面时重新加载店铺信息
    this.loadShopInfo();
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
        return this.activities.filter(activity => activity.status === 1 || activity.status === '进行中');
      } else if (this.currentTab === 2) {
        // 未开始
        return this.activities.filter(activity => activity.status === 0 || activity.status === '未开始');
      } else if (this.currentTab === 3) {
        // 已结束
        return this.activities.filter(activity => activity.status === 2 || activity.status === '已结束');
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
      
      // 根据当前选中的标签获取对应状态的活动
      let params = {};
      if (this.currentTab > 0) {
        // 标签页对应的状态码映射：
        // 标签1 -> 状态1:进行中
        // 标签2 -> 状态0:未开始
        // 标签3 -> 状态2:已结束
        if (this.currentTab === 1) {
          params.status = 1; // 进行中
        } else if (this.currentTab === 2) {
          params.status = 0; // 未开始
        } else if (this.currentTab === 3) {
          params.status = 2; // 已结束
        }
      }
      
      getActivityList(params)
        .then(res => {
          this.loading = false;
          // 打印完整原始响应数据，方便调试
          console.log('完整后端响应:', JSON.stringify(res));
          console.log('后端返回的活动数据:', res.data);
          
          // 专门打印活动ID信息，确认后端返回的原始数据
          if (res.data && res.data.rows && Array.isArray(res.data.rows)) {
            console.log('=== 后端返回的原始活动ID信息 ===');
            res.data.rows.forEach((activity, index) => {
              console.log(`活动[${index}]的merchantActivityId:`, activity.merchantActivityId, 
                         '类型:', typeof activity.merchantActivityId);
              console.log(`活动[${index}]的merchant_activity_id:`, activity.merchant_activity_id, 
                         '类型:', typeof activity.merchant_activity_id);
            });
          }
          
          // 处理后端返回的数据
          // 根据截图，后端返回的成功状态码是0而非200
          if (res.data && res.data.code === 0) {
            // 根据后端实际返回的数据格式，数据直接在 res.data.rows 中
            let activitiesData = res.data.rows || [];
            console.log('处理前的活动数据数组长度:', activitiesData.length);
            // 打印每个活动的详细数据
            activitiesData.forEach((activity, index) => {
              console.log(`活动[${index}]完整数据:`, JSON.stringify(activity));
            });
            
            // 转换数据格式，使其符合前端显示要求
            this.activities = activitiesData.map((activity, index) => {
              // 重要：将大整数ID转换为字符串以避免JavaScript精度问题
              // JavaScript的Number类型最大安全整数是2^53-1 (9007199254740991)
              // 后端返回的ID长度为18位，超过了安全范围，需要作为字符串处理
              
              // 转换ID字段为字符串
              const merchantActivityIdStr = String(activity.merchantActivityId || '');
              const merchant_activity_idStr = String(activity.merchant_activity_id || '');
              const idStr = String(activity.id || '');
              
              // 记录ID处理前后的对比
              console.log('处理活动数据，ID信息对比:', {
                original_merchantActivityId: activity.merchantActivityId,
                original_merchant_activity_id: activity.merchant_activity_id,
                original_id: activity.id,
                string_merchantActivityId: merchantActivityIdStr,
                string_merchant_activity_id: merchant_activity_idStr,
                string_id: idStr,
                index: index
              });
              
              // 保留原始ID字段，同时添加临时唯一标识符（使用索引+时间戳的组合）
              // 原始ID用于与后端交互，临时ID用于前端识别不同活动
              return {
                ...activity,
                // 确保ID字段作为字符串保存
                merchantActivityId: merchantActivityIdStr,
                merchant_activity_id: merchant_activity_idStr,
                id: idStr,
                // 添加临时唯一标识符
                tempId: `${merchantActivityIdStr || 'temp'}_${index}_${Date.now()}`,
                // 保留原始ID字段用于后端交互
                name: activity.activity_name || activity.activityName || activity.name,
                // 转换状态为中文显示
                status: this.getStatusText(activity.status),
                statusClass: this.getStatusClass(activity.status),
                startDate: activity.start_time || activity.startDate || activity.beginTime,
                endDate: activity.end_time || activity.endDate || activity.endTime,
                type: this.getActivityTypeText(activity.activity_type || activity.activityType),
                description: activity.content || activity.description || activity.remark
              };
            });
            
            console.log('发现问题：所有活动具有相同的ID:', activitiesData[0]?.merchantActivityId);
            console.log('添加临时唯一标识符后，活动数据:', this.activities);
            
            // 打印转换后的活动数据，方便调试
            console.log('转换后的活动数据:', this.activities);
          } else {
            uni.showToast({
              title: res.data.msg || '获取活动列表失败',
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
     * 根据状态码获取状态文本
     */
    getStatusText(status) {
      // 确保 status 是数字类型
      const statusNum = typeof status === 'string' ? parseInt(status) : status;
      const statusMap = {
        0: '未开始',
        1: '进行中',
        2: '已结束'
      };
      return statusMap[statusNum] || status;
    },
    
    /**
     * 根据状态获取样式类名
     */
    getStatusClass(status) {
      // 确保 status 是数字类型
      const statusNum = typeof status === 'string' ? parseInt(status) : status;
      const classMap = {
        0: 'status-upcoming',
        1: 'status-ongoing',
        2: 'status-ended'
      };
      return classMap[statusNum] || '';
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
      // 切换标签时重新获取数据
      this.fetchActivities();
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
      // 跳转到活动效果页面（暂未实现）
      uni.showToast({
        title: '查看活动效果: ' + activity.name,
        icon: 'none'
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
  gap: 12rpx;
  margin-top: 20rpx;
  width: 100%;
}

.action-btn {
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.action-btn.view {
  background: #F0F8FF;
  color: #2196F3;
}

.action-btn.edit {
  background: #FFF3E0;
  color: #FF9800;
}

.action-btn.delete {
  background: #FEE7E7;
  color: #F56C6C;
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