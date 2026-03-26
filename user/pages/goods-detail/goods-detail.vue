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
        <image class="goods-image" :src="getValidImageUrl(goodsInfo.mainImageUrl)" mode="aspectFill" @error="handleImageError"></image>
      </view>

      <!-- 商品信息卡片 -->
      <view class="info-card">
        <text class="goods-name">{{ goodsInfo.goodsName }}</text>
        <view class="price-container">
          <text class="goods-price">¥{{ goodsInfo.price }}</text>
          <text v-if="goodsInfo.originalPrice && goodsInfo.originalPrice > goodsInfo.price" class="original-price">¥{{ goodsInfo.originalPrice }}</text>
        </view>
        <view class="goods-stats">
          <view class="rating-box">
            <text class="rating-score">{{ goodsInfo.avgRating }}</text>
            <text class="rating-desc">{{ goodsInfo.ratingCount > 0 ? `${goodsInfo.ratingCount}条评价` : '暂无评价' }}</text>
          </view>
          <view class="sales-stock">
            <text class="sales-text">月售{{ goodsInfo.salesCount }}</text>
            <text class="stock-text">库存{{ goodsInfo.stock }}</text>
          </view>
        </view>
        <view class="goods-meta">
          <text class="meta-item">👁️ {{ goodsInfo.viewCount }}人浏览</text>
          <text class="meta-item">❤️ {{ goodsInfo.favoriteCount }}人收藏</text>
          <text class="meta-item">📤 {{ goodsInfo.shareCount }}人分享</text>
        </view>
        <view class="category-tags">
          <text class="category-tag">{{ goodsInfo.category }}</text>
          <text class="subcategory-tag">{{ goodsInfo.subCategory }}</text>
          <text v-for="(tag, index) in getTagNames()" :key="index" class="feature-tag">{{ tag }}</text>
        </view>
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

      <!-- 商品评价 -->
      <view v-if="currentTab === 1" class="review-box">
        <view v-if="goodsInfo.ratingCount > 0" class="rating-overview">
          <view class="rating-summary">
            <text class="rating-score-large">{{ goodsInfo.avgRating }}</text>
            <view class="rating-stars">
              <text v-for="i in 5" :key="i" class="star" :class="{ active: i <= Math.round(goodsInfo.avgRating) }">★</text>
            </view>
            <text class="rating-count">{{ goodsInfo.ratingCount }}条评价</text>
          </view>
          <view class="rating-distribution">
            <view class="rating-item">
              <text class="rating-label">5星</text>
              <view class="rating-bar">
                <view class="rating-progress" :style="{ width: goodsInfo.fiveStarRate + '%' }"></view>
              </view>
              <text class="rating-percent">{{ goodsInfo.fiveStarRate }}%</text>
            </view>
            <view class="rating-item">
              <text class="rating-label">4星</text>
              <view class="rating-bar">
                <view class="rating-progress" :style="{ width: goodsInfo.fourStarRate + '%' }"></view>
              </view>
              <text class="rating-percent">{{ goodsInfo.fourStarRate }}%</text>
            </view>
            <view class="rating-item">
              <text class="rating-label">3星</text>
              <view class="rating-bar">
                <view class="rating-progress" :style="{ width: goodsInfo.threeStarRate + '%' }"></view>
              </view>
              <text class="rating-percent">{{ goodsInfo.threeStarRate }}%</text>
            </view>
            <view class="rating-item">
              <text class="rating-label">2星</text>
              <view class="rating-bar">
                <view class="rating-progress" :style="{ width: goodsInfo.twoStarRate + '%' }"></view>
              </view>
              <text class="rating-percent">{{ goodsInfo.twoStarRate }}%</text>
            </view>
            <view class="rating-item">
              <text class="rating-label">1星</text>
              <view class="rating-bar">
                <view class="rating-progress" :style="{ width: goodsInfo.oneStarRate + '%' }"></view>
              </view>
              <text class="rating-percent">{{ goodsInfo.oneStarRate }}%</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-box">
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
      tabs: ['商品描述', '商品评价', '交易须知'],
      goodsInfo: {
        // 基础信息
        goodsId: '',
        id: '',
        goodsName: '',
        price: '',
        originalPrice: '',
        mainImageUrl: '',
        imageUrls: null,
        imageList: null,
        description: '',
        // 分类信息
        category: '',
        subCategory: '',
        tagCodes: '',
        // 评分信息
        avgRating: 0,
        ratingCount: 0,
        oneStarRate: 0,
        twoStarRate: 0,
        threeStarRate: 0,
        fourStarRate: 0,
        fiveStarRate: 0,
        // 销售信息
        salesCount: 0,
        stock: 0,
        status: 0,
        // 时间信息
        createTime: '',
        updateTime: '',
        // 统计信息
        viewCount: 0,
        favoriteCount: 0,
        shareCount: 0,
        // 卖家信息
        sellerId: '',
        sellerName: '',
        sellerNickname: '',
        sellerAvatar: '',
        sellerPhone: '',
        contact: '',
        // 商家信息
        merchantBaseId: '',
        merchantGoodsId: ''
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
    // 获取标签名称
    getTagNames() {
      const tagMap = {
        'FOOD_NOODLE': '面食',
        'SOUP': '汤面',
        'HOT': '热销',
        'DISCOUNT': '优惠',
        'RECOMMEND': '推荐'
      };
      
      if (!this.goodsInfo.tagCodes) return [];
      
      return this.goodsInfo.tagCodes.split(',').map(tag => {
        return tagMap[tag] || tag;
      }).filter(tag => tag);
    },
    
    // 加载商品详情
    async loadGoodsDetail(goodsId) {
      try {
        uni.showLoading({
          title: '加载中...'
        });
        
        // 调用实际API获取商品详情
        const result = await getGoodsDetail(goodsId);
        console.log('商品详情：', result);
        
        // 更新商品信息
        if (result.data) {
          const goods = result.data;
          
          // 基础信息
          this.goodsInfo.goodsId = goods.goodsId || this.goodsInfo.id || '';
          this.goodsInfo.id = goods.goodsId || this.goodsInfo.id || '';
          this.goodsInfo.goodsName = goods.goodsName || this.goodsInfo.goodsName;
          this.goodsInfo.price = goods.price || this.goodsInfo.price;
          this.goodsInfo.originalPrice = goods.originalPrice || this.goodsInfo.originalPrice;
          this.goodsInfo.description = goods.description || '';
          
          // 分类信息
          this.goodsInfo.category = goods.category || '';
          this.goodsInfo.subCategory = goods.subCategory || '';
          this.goodsInfo.tagCodes = goods.tagCodes || '';
          
          // 评分信息
          this.goodsInfo.avgRating = goods.avgRating || 0;
          this.goodsInfo.ratingCount = goods.ratingCount || 0;
          this.goodsInfo.oneStarRate = goods.oneStarRate || 0;
          this.goodsInfo.twoStarRate = goods.twoStarRate || 0;
          this.goodsInfo.threeStarRate = goods.threeStarRate || 0;
          this.goodsInfo.fourStarRate = goods.fourStarRate || 0;
          this.goodsInfo.fiveStarRate = goods.fiveStarRate || 0;
          
          // 销售信息
          this.goodsInfo.salesCount = goods.salesCount || 0;
          this.goodsInfo.stock = goods.stock || 0;
          this.goodsInfo.status = goods.status || 1;
          
          // 时间信息
          this.goodsInfo.createTime = goods.createTime || '';
          this.goodsInfo.updateTime = goods.updateTime || '';
          
          // 统计信息
          this.goodsInfo.viewCount = goods.viewCount || 0;
          this.goodsInfo.favoriteCount = goods.favoriteCount || 0;
          this.goodsInfo.shareCount = goods.shareCount || 0;
          
          // 卖家信息
          this.goodsInfo.sellerId = goods.userId || goods.sellerId || '';
          this.goodsInfo.sellerName = goods.userName || goods.sellerName || goods.sellerNickname || '卖家';
          this.goodsInfo.sellerNickname = goods.sellerNickname || '';
          this.goodsInfo.sellerAvatar = goods.sellerAvatar || '';
          this.goodsInfo.sellerPhone = goods.sellerPhone || '';
          this.goodsInfo.contact = goods.contact || goods.sellerPhone || '';
          
          // 商家信息
          this.goodsInfo.merchantBaseId = goods.merchantBaseId || '';
          this.goodsInfo.merchantGoodsId = goods.merchantGoodsId || '';
          
          // 处理图片
          this.goodsInfo.imageUrls = goods.imageUrls || null;
          this.goodsInfo.imageList = goods.imageList || goods.imageUrls || null;
          
          // 设置主图
          if (goods.mainImageUrl) {
            this.goodsInfo.mainImageUrl = goods.mainImageUrl;
          } else if (goods.imageUrls && Array.isArray(goods.imageUrls) && goods.imageUrls.length > 0) {
            this.goodsInfo.mainImageUrl = goods.imageUrls[0];
          } else if (goods.image) {
            this.goodsInfo.mainImageUrl = goods.image;
          } else if (goods.imageUrl) {
            this.goodsInfo.mainImageUrl = goods.imageUrl;
          } else if (goods.mainImage) {
            this.goodsInfo.mainImageUrl = goods.mainImage;
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
    
    // 获取有效图片URL
    getValidImageUrl(url) {
      // 如果URL为空，返回占位图
      if (!url || url.trim() === '') {
        return 'https://picsum.photos/750/500';
      }
      
      // 清理URL中的额外字符
      let cleanedUrl = String(url).replace(/[`'"\s]/g, '');
      
      // 检查URL是否以@开头（有些后端可能会返回这种格式）
      if (cleanedUrl.startsWith('@')) {
        cleanedUrl = cleanedUrl.substring(1);
      }
      
      // 检查URL是否为完整的HTTP/HTTPS URL
      if (cleanedUrl.startsWith('http://') || cleanedUrl.startsWith('https://')) {
        return cleanedUrl;
      }
      
      // 检查是否为相对路径
      if (cleanedUrl.startsWith('/')) {
        // 如果是相对路径，尝试添加API基础URL
        return `${this.baseUrl}${cleanedUrl}`;
      }
      
      // 检查是否为静态资源路径
      if (cleanedUrl.startsWith('static/')) {
        return `/${cleanedUrl}`;
      }
      
      // 如果都不是，尝试作为相对路径处理或返回占位图
      return 'https://picsum.photos/750/500';
    },
    
    // 处理图片加载失败
    handleImageError() {
      console.warn('商品图片加载失败，使用占位图');
      this.goodsInfo.mainImageUrl = 'https://picsum.photos/750/500?random=' + Math.floor(Math.random() * 100);
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
        url: `/pages/chat/chat?userId=${this.goodsInfo.sellerId}&userName=${encodeURIComponent(this.goodsInfo.sellerName)}&goodsId=${this.goodsInfo.id || this.goodsInfo.merchantGoodsId}&goodsName=${encodeURIComponent(this.goodsInfo.goodsName)}`
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
        url: `/pages/payment/payment?id=${this.goodsInfo.id || this.goodsInfo.merchantGoodsId}&name=${encodeURIComponent(this.goodsInfo.goodsName)}&price=${this.goodsInfo.price}&image=${encodeURIComponent(this.goodsInfo.mainImageUrl)}`
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
}

.goods-image {
  width: 100%;
  height: 600rpx;
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
  margin-bottom: 15rpx;
  line-height: 1.5;
}

.price-container {
  display: flex;
  align-items: baseline;
  margin-bottom: 20rpx;
}

.goods-price {
  display: inline-block;
  font-size: 48rpx;
  color: #FF6B47;
  font-weight: bold;
  margin-right: 20rpx;
}

.original-price {
  display: inline-block;
  font-size: 28rpx;
  color: #999999;
  text-decoration: line-through;
}

.goods-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.rating-box {
  display: flex;
  align-items: center;
}

.rating-score {
  font-size: 32rpx;
  color: #FF6B47;
  font-weight: bold;
  margin-right: 8rpx;
}

.rating-desc {
  font-size: 26rpx;
  color: #666666;
}

.sales-stock {
  display: flex;
  align-items: center;
}

.sales-text,
.stock-text {
  font-size: 26rpx;
  color: #666666;
  margin-left: 30rpx;
}

/* 商品元数据 */
.goods-meta {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 16rpx 0;
  margin-bottom: 16rpx;
  border-top: 1rpx solid #EEEEEE;
  border-bottom: 1rpx solid #EEEEEE;
  font-size: 22rpx;
  color: #999999;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
}

.category-tag,
.subcategory-tag,
.feature-tag {
  display: inline-block;
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
}

.category-tag {
  background-color: #E3F2FD;
  color: #1976D2;
}

.subcategory-tag {
  background-color: #E8F5E8;
  color: #388E3C;
}

.feature-tag {
  background-color: #FFF3E0;
  color: #F57C00;
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
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.rating-overview {
  padding: 30rpx 0;
}

.rating-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.rating-score-large {
  font-size: 64rpx;
  color: #FF6B47;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.rating-stars {
  display: flex;
  margin-bottom: 10rpx;
}

.star {
  font-size: 32rpx;
  color: #DDDDDD;
  margin-right: 4rpx;
}

.star.active {
  color: #FF6B47;
}

.rating-count {
  font-size: 26rpx;
  color: #666666;
}

.rating-distribution {
  padding: 0 20rpx;
}

.rating-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.rating-label {
  font-size: 26rpx;
  color: #666666;
  width: 60rpx;
}

.rating-bar {
  flex: 1;
  height: 12rpx;
  background-color: #F5F5F5;
  border-radius: 6rpx;
  margin: 0 20rpx;
  overflow: hidden;
}

.rating-progress {
  height: 100%;
  background: linear-gradient(90deg, #FF6B47 0%, #FFA726 100%);
  border-radius: 6rpx;
}

.rating-percent {
  font-size: 26rpx;
  color: #666666;
  width: 60rpx;
  text-align: right;
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

