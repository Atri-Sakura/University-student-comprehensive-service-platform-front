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
      <view class="activity-card" v-for="(activity, index) in filteredActivities" :key="index">
        <view class="activity-header">
          <text class="activity-name">{{ activity.name }}</text>
          <view class="status-badge" :class="activity.statusClass">{{ activity.status }}</view>
        </view>
        <text class="activity-time">{{ activity.startDate }} 至 {{ activity.endDate }}</text>
        <view class="activity-type">{{ activity.type }}</view>
        <text class="activity-description">{{ activity.description }}</text>
        
        <!-- 活动数据 -->
        <view class="activity-stats">
          <view class="stat-item">
            <text class="stat-value">{{ activity.participantCount }}</text>
            <text class="stat-label">参与人数</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">¥{{ activity.subsidyCost }}</text>
            <text class="stat-label">补贴成本</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ activity.orderCount }}</text>
            <text class="stat-label">带来订单</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="activity-actions">
          <view class="action-btn view" @click="viewActivity(activity)">
            <text class="btn-text">查看效果</text>
          </view>
          <view class="action-btn edit" @click="editActivity(activity)">
            <text class="btn-text">编辑</text>
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
</template>

<script>
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
      activities: [
        {
          name: "新客立减活动",
          status: "进行中",
          statusClass: "status-ongoing",
          startDate: "2023-11-01",
          endDate: "2023-11-30",
          type: "新客立减",
          description: "新用户首次下单立减15元",
          participantCount: "328",
          subsidyCost: "4,920",
          orderCount: "125"
        },
        {
          name: "满减优惠",
          status: "进行中",
          statusClass: "status-ongoing",
          startDate: "2023-11-10",
          endDate: "2023-11-20",
          type: "满减",
          description: "满50减8，满80减15，满120减25",
          participantCount: "562",
          subsidyCost: "6,744",
          orderCount: "289"
        },
        {
          name: "折扣商品",
          status: "未开始",
          statusClass: "status-upcoming",
          startDate: "2023-11-20",
          endDate: "2023-11-27",
          type: "折扣商品",
          description: "精选商品7折优惠，仅限一周",
          participantCount: "-",
          subsidyCost: "-",
          orderCount: "-"
        },
        {
          name: "买一送一",
          status: "已结束",
          statusClass: "status-ended",
          startDate: "2023-10-20",
          endDate: "2023-10-30",
          type: "买一送一",
          description: "指定饮品买一送一，限时优惠",
          participantCount: "198",
          subsidyCost: "1,584",
          orderCount: "76"
        }
      ]
    }
  },
  computed: {
    filteredActivities() {
      if (this.currentTab === 0) {
        return this.activities;
      } else if (this.currentTab === 1) {
        return this.activities.filter(activity => activity.status === "进行中");
      } else if (this.currentTab === 2) {
        return this.activities.filter(activity => activity.status === "未开始");
      } else if (this.currentTab === 3) {
        return this.activities.filter(activity => activity.status === "已结束");
      }
      return [];
    }
  },
  methods: {
    switchTab(index) {
      this.currentTab = index;
    },
    createNewActivity() {
      // 跳转到创建活动页面
      uni.navigateTo({
        url: '/pages/activities/activity-edit'
      });
    },
    viewActivity(activity) {
      // 跳转到活动效果页面（暂未实现）
      uni.showToast({
        title: '查看活动效果: ' + activity.name,
        icon: 'none'
      });
    },
    editActivity(activity) {
      // 跳转到编辑活动页面，带上活动ID
      uni.navigateTo({
        url: `/pages/activities/activity-edit?id=${activity.name}`
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

/* 活动数据 */
.activity-stats {
  display: flex;
  border-top: 2rpx solid #f0f0f0;
  padding-top: 24rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

/* 操作按钮 */
.activity-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  transition: all 0.2s ease;
}

.action-btn.view {
  background: #F0F8FF;
  color: #2196F3;
}

.action-btn.edit {
  background: #FFF3E0;
  color: #FF9800;
}

.action-btn:active {
  opacity: 0.8;
  transform: scale(0.96);
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