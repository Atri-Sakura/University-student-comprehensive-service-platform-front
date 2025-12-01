<template>
  <view class="errand-order-edit-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">&lt;</text>
      </view>
      <view class="nav-title">修改订单</view>
      <view class="confirm-btn" @click="confirmEdit">
        <text class="confirm-text">确认修改</text>
      </view>
    </view>

    <!-- 提示信息 -->
    <view class="warning-tip">
      <text class="warning-icon">⚠️</text>
      <text class="warning-text">修改订单后需要重新等待接单，当前订单将被取消</text>
    </view>

    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 订单标题 -->
      <view class="form-item">
        <input type="text" v-model="form.title" class="form-input" placeholder="例如：代取校外外卖（麦当劳）" />
      </view>

      <!-- 任务类型 -->
      <view class="form-item">
        <text class="item-label">任务类型<text class="required">*</text></text>
        <view class="task-type-container">
          <view class="type-tag" v-for="(type, index) in taskTypes" :key="index" 
                :class="{ active: form.taskType === type.value }" 
                @click="form.taskType = type.value">
            {{ type.label }}
          </view>
        </view>
      </view>

      <!-- 取件地点 -->
      <view class="form-item">
        <text class="item-label">取件地点<text class="required">*</text></text>
        <view class="location-input">
          <text class="location-icon">📍</text>
          <input type="text" v-model="form.pickupLocation" class="location-text" placeholder="请输入取件地点" />
        </view>
      </view>

      <!-- 送达地点 -->
      <view class="form-item">
        <text class="item-label">送达地点<text class="required">*</text></text>
        <view class="location-input">
          <text class="location-icon">📍</text>
          <input type="text" v-model="form.deliveryLocation" class="location-text" placeholder="请输入送达地点" />
        </view>
      </view>

      <!-- 截止时间 -->
      <view class="form-item">
        <text class="item-label">截止时间<text class="required">*</text></text>
        <input type="text" v-model="form.deadline" class="form-input" placeholder="选择截止时间" @click="showDatePicker" />
      </view>

      <!-- 任务报酬 -->
      <view class="form-item">
        <text class="item-label">任务报酬（元）</text>
        <view class="reward-input">
          <text class="currency-symbol">¥</text>
          <input type="number" v-model.number="form.reward" class="reward-text" placeholder="0" />
        </view>
      </view>

      <!-- 任务描述 -->
      <view class="form-item">
        <text class="item-label">任务描述</text>
        <textarea v-model="form.description" class="description-textarea" placeholder="请输入任务描述，例如：订单号、特殊要求等" :auto-height="true"></textarea>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 订单表单数据
      form: {
        title: '代取校外外卖（麦当劳）',
        taskType: 'takeout_campus',
        pickupLocation: '校门口外卖架',
        deliveryLocation: '计算机学院201',
        deadline: '今天 18:00',
        reward: 2,
        description: '麦当劳订单号：MCD123456，请取餐时核对小票'
      },
      // 任务类型选项
      taskTypes: [
        { label: '代取快递', value: 'express' },
        { label: '代取校外外卖', value: 'takeout_campus' },
        { label: '代取食堂外卖', value: 'takeout_canteen' },
        { label: '代打印', value: 'print' },
        { label: '代购物', value: 'shopping' },
        { label: '其他', value: 'other' }
      ]
    }
  },
  onLoad(options) {
    // 如果有订单ID参数，可以根据ID获取订单详情
    if (options.orderId) {
      console.log('订单ID:', options.orderId);
      // 这里可以添加根据订单ID获取订单详情的逻辑
      // 模拟数据已在data中定义
    }
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack();
    },
    
    // 显示日期选择器
    showDatePicker() {
      // 实际项目中应该调用日期选择器API
      // 这里只是模拟
      uni.showToast({
        title: '日期选择器功能开发中',
        icon: 'none'
      });
    },
    
    // 确认修改订单
    confirmEdit() {
      // 表单验证
      if (!this.form.title.trim()) {
        uni.showToast({ title: '请输入订单标题', icon: 'none' });
        return;
      }
      
      if (!this.form.taskType) {
        uni.showToast({ title: '请选择任务类型', icon: 'none' });
        return;
      }
      
      if (!this.form.pickupLocation.trim()) {
        uni.showToast({ title: '请输入取件地点', icon: 'none' });
        return;
      }
      
      if (!this.form.deliveryLocation.trim()) {
        uni.showToast({ title: '请输入送达地点', icon: 'none' });
        return;
      }
      
      if (!this.form.deadline) {
        uni.showToast({ title: '请选择截止时间', icon: 'none' });
        return;
      }
      
      // 显示确认对话框
      uni.showModal({
        title: '确认修改',
        content: '修改订单后需要重新等待接单，当前订单将被取消，确定要继续吗？',
        success: (res) => {
          if (res.confirm) {
            // 模拟提交修改
            uni.showLoading({ title: '提交中...' });
            
            setTimeout(() => {
              uni.hideLoading();
              uni.showToast({ title: '修改成功', icon: 'success' });
              
              // 修改成功后返回上一页
              setTimeout(() => {
                this.goBack();
              }, 1500);
            }, 1000);
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.errand-order-edit-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  background-color: #5DCDFF;
  padding: 0 15px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.back-btn {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  color: white;
  font-size: 20px;
}

.nav-title {
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.confirm-btn {
  width: 80px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
}

.confirm-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
}

/* 提示信息 */
.warning-tip {
  margin-top: 30px;
  padding: 12px 15px;
  background-color: #FFF9E6;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.warning-icon {
  font-size: 16px;
  margin-right: 8px;
}

.warning-text {
  color: #E6A23C;
  flex: 1;
}

/* 表单容器 */
.form-container {
  background-color: white;
  margin-top: 10px;
  padding: 15px;
}

/* 表单项 */
.form-item {
  margin-bottom: 20px;
}

.item-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.required {
  color: #ff4444;
}

/* 输入框 */
.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #5DCDFF;
  outline: none;
}

/* 任务类型选择器 */
.task-type-container {
  display: flex;
  flex-wrap: wrap;
  margin: -5px;
}

.type-tag {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border-radius: 16px;
  font-size: 14px;
  color: #666;
  margin: 5px;
}

.type-tag.active {
  background-color: #5DCDFF;
  color: white;
}

/* 地点输入框 */
.location-input {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-sizing: border-box;
}

.location-icon {
  font-size: 16px;
  margin-right: 8px;
}

.location-text {
  flex: 1;
  height: 100%;
  border: none;
  font-size: 14px;
  outline: none;
}

/* 报酬输入框 */
.reward-input {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-sizing: border-box;
}

.currency-symbol {
  font-size: 16px;
  color: #333;
  margin-right: 4px;
}

.reward-text {
  flex: 1;
  height: 100%;
  border: none;
  font-size: 14px;
  outline: none;
}

/* 任务描述文本域 */
.description-textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  resize: none;
}

.description-textarea:focus {
  border-color: #5DCDFF;
  outline: none;
}

/* 底部间距 */
.form-container {
  padding-bottom: 100px;
}
</style>