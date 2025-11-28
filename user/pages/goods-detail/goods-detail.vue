<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <text class="nav-title">物品详情</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y :style="{ top: navHeight + 'px' }">
      <!-- 商品图片 -->
      <view class="goods-image-box">
        <image class="goods-image" :src="goodsInfo.image" mode="widthFix"></image>
      </view>

      <!-- 商品信息卡片 -->
      <view class="info-card">
        <text class="goods-name">{{ goodsInfo.name }}</text>
        <text class="goods-price">¥{{ goodsInfo.price }}</text>
      </view>

      <!-- 标签页 -->
      <view class="tabs-box">
        <view 
          v-for="(tab, index) in tabs" 
          :key="index"
          class="tab-item"
          :class="{ active: currentTab === index }"
          @click="switchTab(index)"
        >
          <text class="tab-text" :class="{ active: currentTab === index }">{{ tab }}</text>
        </view>
      </view>

      <!-- 商品描述 -->
      <view v-if="currentTab === 0" class="description-box">
        <text class="description-text">{{ goodsInfo.description || '暂无描述' }}</text>
      </view>

      <!-- 卖家评价 -->
      <view v-if="currentTab === 1" class="review-box">
        <view class="empty-box">
          <text class="empty-icon">⭐</text>
          <text class="empty-text">暂无评价</text>
        </view>
      </view>

      <!-- 交易须知 -->
      <view v-if="currentTab === 2" class="notice-box">
        <view class="notice-item">
          <text class="notice-title">📋 交易流程</text>
          <text class="notice-content">1. 联系卖家确认商品详情</text>
          <text class="notice-content">2. 约定交易时间和地点</text>
          <text class="notice-content">3. 当面验货后交易</text>
        </view>
        <view class="notice-item">
          <text class="notice-title">⚠️ 注意事项</text>
          <text class="notice-content">• 建议当面交易，确保安全</text>
          <text class="notice-content">• 仔细验货，检查商品质量</text>
          <text class="notice-content">• 保留聊天记录作为凭证</text>
        </view>
      </view>

      <!-- 占位空间 -->
      <view style="height: 140rpx;"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="contact-btn" @click="contactSeller">
        <text class="contact-icon">💬</text>
        <text class="contact-text">联系卖家</text>
      </view>
      <view class="buy-btn" @click="buyNow">
        <text class="buy-text">立即购买</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getGoodsDetail } from '@/api/secondhandGoods.js'

export default {
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      currentTab: 0,
      tabs: ['商品描述', '卖家评价', '交易须知'],
      goodsInfo: {
        id: '',
        name: '外星人笔记本',
        price: '1200',
        image: 'https://picsum.photos/750/600?random=30',
        description: '',
        contact: '',
        sellerId: '',
        sellerName: ''
      }
    };
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;

    // 先从 URL 参数获取基本信息（用于快速显示）
    if (options.id) {
      this.goodsInfo.id = options.id;
      // 调用 API 获取完整的商品详情（包括描述）
      this.loadGoodsDetail(options.id);
    }
    if (options.name) {
      this.goodsInfo.name = decodeURIComponent(options.name);
    }
    if (options.price) {
      this.goodsInfo.price = options.price;
    }
    if (options.image) {
      this.goodsInfo.image = decodeURIComponent(options.image);
    }
    if (options.description) {
      this.goodsInfo.description = decodeURIComponent(options.description);
    }
  },
  methods: {
    // 加载商品详情
    async loadGoodsDetail(goodsId) {
      try {
        uni.showLoading({
          title: '加载中...'
        });
        
        const result = await getGoodsDetail(goodsId);
        
        console.log('商品详情：', result);
        
        // 更新商品信息
        if (result.data) {
          const goods = result.data;
          this.goodsInfo.name = goods.goodsName || goods.name || this.goodsInfo.name;
          this.goodsInfo.price = goods.price || this.goodsInfo.price;
          this.goodsInfo.description = goods.description || goods.desc || '';
          this.goodsInfo.contact = goods.contact || '';
          this.goodsInfo.sellerId = goods.userId || goods.sellerId || '';
          this.goodsInfo.sellerName = goods.userName || goods.sellerName || '卖家';
          
          // 处理图片
          if (goods.imageUrls && Array.isArray(goods.imageUrls) && goods.imageUrls.length > 0) {
            let imageUrl = goods.imageUrls[0];
            // 处理图片URL前面可能存在的 @ 符号
            if (imageUrl && imageUrl.startsWith('@')) {
              imageUrl = imageUrl.substring(1);
            }
            this.goodsInfo.image = imageUrl;
          } else if (goods.mainImageUrl) {
            this.goodsInfo.image = goods.mainImageUrl;
          } else if (goods.image) {
            this.goodsInfo.image = goods.image;
          }
        }
        
        uni.hideLoading();
      } catch (error) {
        console.error('加载商品详情失败：', error);
        uni.hideLoading();
        
        // 如果加载失败，使用URL参数中的信息
        uni.showToast({
          title: '加载详情失败',
          icon: 'none'
        });
      }
    },
    
    // 返回
    goBack() {
      uni.navigateBack();
    },
    // 切换标签
    switchTab(index) {
      this.currentTab = index;
    },
    // 联系卖家
    contactSeller() {
      uni.showActionSheet({
        itemList: ['💬 消息联系', '📞 电话联系'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 消息联系
            this.messageContact();
          } else if (res.tapIndex === 1) {
            // 电话联系
            this.phoneContact();
          }
        }
      });
    },
    
    // 消息联系
    messageContact() {
      if (!this.goodsInfo.sellerId) {
        uni.showToast({
          title: '卖家信息不完整',
          icon: 'none'
        });
        return;
      }
      
      // 跳转到聊天页面
      uni.navigateTo({
        url: `/pages/chat/chat?userId=${this.goodsInfo.sellerId}&userName=${encodeURIComponent(this.goodsInfo.sellerName)}&goodsId=${this.goodsInfo.id}&goodsName=${encodeURIComponent(this.goodsInfo.name)}`
      });
    },
    
    // 电话联系
    phoneContact() {
      if (!this.goodsInfo.contact) {
        uni.showToast({
          title: '卖家未留联系电话',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '拨打电话',
        content: `是否拨打卖家电话：${this.goodsInfo.contact}？`,
        confirmText: '拨打',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.makePhoneCall({
              phoneNumber: this.goodsInfo.contact,
              fail: (err) => {
                console.error('拨打电话失败：', err);
                uni.showToast({
                  title: '拨打失败',
                  icon: 'none'
                });
              }
            });
          }
        }
      });
    },
    // 立即购买
    buyNow() {
      uni.navigateTo({
        url: `/pages/payment/payment?id=${this.goodsInfo.id}&name=${encodeURIComponent(this.goodsInfo.name)}&price=${this.goodsInfo.price}&image=${encodeURIComponent(this.goodsInfo.image)}`
      });
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 100vh;
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

.nav-left,
.nav-right {
  width: 80rpx;
}

.back-icon {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 300;
}

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

/* 内容区域 */
.content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 商品图片 */
.goods-image-box {
  width: 100%;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.goods-image {
  width: 100%;
  height: auto;
  display: block;
}

/* 商品信息卡片 */
.info-card {
  background-color: #FFFFFF;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.goods-name {
  display: block;
  font-size: 36rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.goods-price {
  display: block;
  font-size: 48rpx;
  color: #FF6B47;
  font-weight: bold;
}

/* 标签页 */
.tabs-box {
  display: flex;
  background-color: #FFFFFF;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  position: relative;
}

.tab-text {
  font-size: 28rpx;
  color: #666666;
}

.tab-text.active {
  color: #5DCDFF;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background: linear-gradient(90deg, #5DCDFF 0%, #89CFF0 100%);
  border-radius: 3rpx;
}

/* 商品描述 */
.description-box {
  background-color: #FFFFFF;
  padding: 30rpx;
  margin-bottom: 20rpx;
  min-height: 200rpx;
}

.description-text {
  display: block;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 评价区域 */
.review-box {
  background-color: #FFFFFF;
  padding: 60rpx 30rpx;
  margin-bottom: 20rpx;
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 28rpx;
  color: #CCCCCC;
}

/* 交易须知 */
.notice-box {
  background-color: #FFFFFF;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.notice-item {
  margin-bottom: 40rpx;
}

.notice-item:last-child {
  margin-bottom: 0;
}

.notice-title {
  display: block;
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.notice-content {
  display: block;
  font-size: 26rpx;
  color: #666666;
  line-height: 1.8;
  margin-bottom: 12rpx;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 999;
}

.contact-btn {
  width: 280rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #D0EFFF 0%, #A8E4FF 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.contact-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.contact-text {
  font-size: 28rpx;
  color: #5DCDFF;
  font-weight: 500;
}

.buy-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, #FF8A65 0%, #FF6B47 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.buy-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: bold;
}
</style>

