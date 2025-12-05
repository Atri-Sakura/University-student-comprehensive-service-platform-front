<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="navbar-left" @click="goBack" hover-class="navbar-left-hover">
          <text class="navbar-icon">←</text>
        </view>
        <view class="navbar-center">
          <text class="navbar-title">{{ isEdit ? '修改安全问题' : '设置安全问题' }}</text>
        </view>
        <view class="navbar-right"></view>
      </view>
    </view>

    <!-- 提示信息 -->
    <view class="tips-section">
      <text class="tips-text">设置安全问题后，可用于找回支付密码和验证身份</text>
    </view>

    <!-- 安全问题列表 -->
    <view class="questions-section">
      <view 
        class="question-item" 
        v-for="(question, index) in questions" 
        :key="index"
      >
        <view class="question-header">
          <text class="question-number">问题{{ index + 1 }}</text>
          <text class="question-remove" v-if="isEdit && questions.length > 1" @click="removeQuestion(index)">删除</text>
        </view>
        <view class="question-select-wrapper" @click="showQuestionPicker(index)">
          <input
            class="question-select"
            type="text"
            :placeholder="'请选择问题' + (index + 1)"
            v-model="question.question"
            disabled
          />
          <text class="arrow-icon">></text>
        </view>
        <view class="answer-input-wrapper">
          <input
            class="answer-input"
            type="text"
            :placeholder="'请输入答案' + (index + 1)"
            v-model="question.answer"
            maxlength="20"
          />
        </view>
      </view>
    </view>

    <!-- 添加问题按钮 -->
    <view class="add-question-section" v-if="questions.length < 3">
      <view class="add-question-btn" @click="addQuestion">
        <text class="add-icon">+</text>
        <text class="add-text">添加问题</text>
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="bottom-actions">
      <view class="save-button" @click="saveQuestions">
        <text class="save-text">保存</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isEdit: false,
      questions: [
        { question: '', answer: '' }
      ],
      presetQuestions: [
        '您出生在哪里？',
        '您的小学名称是什么？',
        '您最喜欢的颜色是什么？',
        '您母亲的名字是什么？',
        '您父亲的名字是什么？',
        '您最喜欢的食物是什么？',
        '您最难忘的旅行是哪里？',
        '您最喜爱的电影是什么？',
        '您最喜爱的书籍是什么？',
        '您最喜爱的运动是什么？',
        '您最喜爱的音乐类型是什么？',
        '您最喜爱的宠物是什么？',
        '您最难忘的生日是什么时候？',
        '您最喜爱的季节是什么？',
        '您最喜爱的城市是什么？'
      ]
    };
  },
  onLoad() {
    this.loadSecurityQuestions();
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    loadSecurityQuestions() {
      // 从本地存储加载安全问题
      const storedQuestions = uni.getStorageSync('walletSecurityQuestions');
      if (storedQuestions && storedQuestions.length > 0) {
        this.questions = storedQuestions;
        this.isEdit = true;
      }
    },
    showQuestionPicker(index) {
      uni.showActionSheet({
        itemList: this.presetQuestions,
        success: (res) => {
          this.questions[index].question = this.presetQuestions[res.tapIndex];
        }
      });
    },
    addQuestion() {
      if (this.questions.length >= 3) {
        uni.showToast({
          title: '最多只能设置3个安全问题',
          icon: 'none'
        });
        return;
      }
      this.questions.push({ question: '', answer: '' });
    },
    removeQuestion(index) {
      if (this.questions.length <= 1) {
        uni.showToast({
          title: '至少需要设置1个安全问题',
          icon: 'none'
        });
        return;
      }
      this.questions.splice(index, 1);
    },
    validateQuestions() {
      for (let i = 0; i < this.questions.length; i++) {
        const q = this.questions[i];
        
        if (!q.question || q.question.trim() === '') {
          uni.showToast({
            title: `请选择问题${i + 1}`,
            icon: 'none'
          });
          return false;
        }

        if (!q.answer || q.answer.trim() === '') {
          uni.showToast({
            title: `请输入答案${i + 1}`,
            icon: 'none'
          });
          return false;
        }

        if (q.answer.length < 2) {
          uni.showToast({
            title: `答案${i + 1}至少需要2个字符`,
            icon: 'none'
          });
          return false;
        }
      }

      // 检查是否有重复的问题
      const questionSet = new Set();
      for (let i = 0; i < this.questions.length; i++) {
        if (questionSet.has(this.questions[i].question)) {
          uni.showToast({
            title: '不能设置相同的问题',
            icon: 'none'
          });
          return false;
        }
        questionSet.add(this.questions[i].question);
      }

      return true;
    },
    saveQuestions() {
      if (!this.validateQuestions()) {
        return;
      }

      uni.showLoading({
        title: '保存中...'
      });

      // 模拟API调用
      setTimeout(() => {
        uni.hideLoading();
        
        // 保存到本地存储
        uni.setStorageSync('walletSecurityQuestions', this.questions);
        
        // 更新安全信息
        const securityInfo = uni.getStorageSync('walletSecurityInfo') || {};
        securityInfo.hasSecurityQuestion = true;
        uni.setStorageSync('walletSecurityInfo', securityInfo);
        
        uni.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        });
        
        setTimeout(() => {
          uni.navigateBack();
        }, 2000);
      }, 1000);

      // 实际API调用示例：
      /*
      uni.request({
        url: 'https://your-api.com/wallet/security-questions',
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + uni.getStorageSync('token'),
          'Content-Type': 'application/json'
        },
        data: {
          questions: this.questions
        },
        success: (res) => {
          uni.hideLoading();
          if (res.data.code === 200) {
            uni.setStorageSync('walletSecurityQuestions', this.questions);
            const securityInfo = uni.getStorageSync('walletSecurityInfo') || {};
            securityInfo.hasSecurityQuestion = true;
            uni.setStorageSync('walletSecurityInfo', securityInfo);
            
            uni.showToast({
              title: '保存成功',
              icon: 'success'
            });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || '保存失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          });
        }
      });
      */
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F5F5;
  padding-top: 88rpx;
  padding-bottom: 160rpx;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: linear-gradient(to bottom, #4A90E2, #6AAFE2);
  z-index: 1000;
  display: flex;
  align-items: center;
  padding-top: var(--status-bar-height, 44rpx);
}

.navbar-content {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.navbar-left {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.navbar-left-hover {
  opacity: 0.7;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.navbar-icon {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
}

.navbar-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-title {
  font-size: 36rpx;
  color: white;
  font-weight: bold;
}

.navbar-right {
  width: 60rpx;
}

/* 提示信息 */
.tips-section {
  background-color: #FFF4E6;
  margin: 20rpx 30rpx;
  padding: 24rpx 30rpx;
  border-radius: 12rpx;
  border-left: 4rpx solid #FF9800;
}

.tips-text {
  font-size: 26rpx;
  color: #FF9800;
  line-height: 1.6;
}

/* 安全问题列表 */
.questions-section {
  background-color: white;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
}

.question-item {
  margin-bottom: 40rpx;
  padding-bottom: 40rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.question-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.question-number {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.question-remove {
  font-size: 26rpx;
  color: #FF4444;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background-color: #FFEBEE;
}

.question-select-wrapper {
  position: relative;
  margin-bottom: 20rpx;
}

.question-select {
  width: 100%;
  height: 88rpx;
  padding: 0 20rpx;
  padding-right: 60rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #333333;
}

.question-select[disabled] {
  color: #999999;
  background-color: #F5F5F5;
}

.arrow-icon {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 32rpx;
  color: #CCCCCC;
}

.answer-input-wrapper {
  margin-top: 20rpx;
}

.answer-input {
  width: 100%;
  height: 88rpx;
  padding: 0 20rpx;
  background-color: #F8F8F8;
  border-radius: 12rpx;
  font-size: 30rpx;
  color: #333333;
}

/* 添加问题按钮 */
.add-question-section {
  margin: 20rpx 30rpx;
}

.add-question-btn {
  width: 100%;
  height: 88rpx;
  background-color: white;
  border: 2rpx dashed #CCCCCC;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.add-question-btn:active {
  background-color: #F8F8F8;
  border-color: #4A90E2;
}

.add-icon {
  font-size: 36rpx;
  color: #999999;
  font-weight: bold;
}

.add-text {
  font-size: 30rpx;
  color: #999999;
}

.add-question-btn:active .add-icon,
.add-question-btn:active .add-text {
  color: #4A90E2;
}

/* 底部保存按钮 */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #F0F0F0;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.save-button {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(to right, #4A90E2, #6AAFE2);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-text {
  font-size: 32rpx;
  color: white;
  font-weight: bold;
}

.save-button:active {
  opacity: 0.8;
}
</style>

