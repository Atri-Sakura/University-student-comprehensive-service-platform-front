<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-back" @click="navBack">&lt;</text>
        <text class="nav-title">{{ goods.goodsName }}</text>
        <view class="nav-right">
          <text class="nav-icon" @click="callRestaurant">📞</text>
        </view>
      </view>
    </view>

    <!-- 商品图片 -->
    <view class="goods-image-section">
      <image class="goods-image" :src="goods.image" mode="aspectFill" @error="handleImageError"></image>
    </view>

    <!-- 商品基本信息 -->
    <view class="goods-info-section">
      <text class="goods-name">{{ goods.goodsName }}</text>
      <text class="goods-price">¥{{ goods.price }}</text>
      
      <!-- 商品描述 -->
      <view class="goods-desc-section">
        <text class="section-title">商品描述</text>
        <text class="goods-desc">{{ goods.description || '暂无描述' }}</text>
      </view>

      <!-- 商品属性 -->
      <view class="goods-attributes-section">
        <text class="section-title">商品属性</text>
        <view class="attribute-item">
          <text class="attribute-label">库存：</text>
          <text class="attribute-value">{{ goods.stock || 0 }}份</text>
        </view>
        <view class="attribute-item">
          <text class="attribute-label">销量：</text>
          <text class="attribute-value">{{ goods.sales || 0 }}份</text>
        </view>
        <view class="attribute-item">
          <text class="attribute-label">分类：</text>
          <text class="attribute-value">{{ goods.categoryName || '未分类' }}</text>
        </view>
      </view>

      <!-- 商品规格 -->
      <view class="goods-specs-section" v-if="goods.specifications && goods.specifications.length > 0">
        <text class="section-title">商品规格</text>
        <view class="spec-item" v-for="spec in goods.specifications" :key="spec.id">
          <text class="spec-name">{{ spec.name }}：</text>
          <text class="spec-value">{{ spec.value }}</text>
        </view>
      </view>
    </view>

    <!-- 返回按钮 -->
    <view class="bottom-btn-section">
      <button class="back-btn" @click="navBack">返回</button>
      <button class="add-to-cart-btn" @click="addToCart">加入购物车</button>
    </view>
  </view>
</template>

<script>
import foodApi from '@/api/food.js';
import { BASE_URL } from '@/api/config.js';

export default {
  data() {
    return {
      statusBarHeight: 0,
      goods: {},
      goodsId: '',
      restaurantId: '',
      restaurant: {}
    };
  },
  onLoad(options) {
    // 获取状态栏高度
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
    
    // 获取商品ID和商家ID
    this.goodsId = options.goodsId || '';
    this.restaurantId = options.restaurantId || '';
    
    // 检查是否有传递过来的商品信息
    if (options.goodsInfo) {
      // 直接使用传递过来的商品信息
      this.goods = JSON.parse(decodeURIComponent(options.goodsInfo));
      // 处理商品图片URL
      this.goods.image = this.getValidImageUrl(this.goods.image);
    } else {
      // 没有传递商品信息，调用API加载
      this.loadGoodsDetail();
    }
    
    // 加载商家信息
    this.loadRestaurantInfo();
  },
  methods: {
    // 获取有效图片URL
    getValidImageUrl(url) {
      console.log('=== 开始处理图片URL ===');
      console.log('原始URL输入:', url);
      console.log('原始URL类型:', typeof url);
      
      // 如果URL为空，直接返回空字符串
      if (!url) {
        console.log('URL为空，返回空字符串');
        return '';
      }
      
      // 先进行trim去除前后空白
      let cleanedUrl = String(url).trim();
      console.log('第一次trim后:', cleanedUrl);
      
      // 移除所有可能的引号（双引号、单引号和反引号）
      const beforeReplace = cleanedUrl;
      cleanedUrl = cleanedUrl.replace(/["'`\u0060]/g, '');
      console.log('移除引号前:', beforeReplace);
      console.log('移除引号后:', cleanedUrl);
      
      // 再次trim确保去除引号后的空白
      cleanedUrl = cleanedUrl.trim();
      console.log('第二次trim后:', cleanedUrl);
      
      // 如果清理后URL为空，返回空字符串
      if (!cleanedUrl) {
        console.log('清理后URL为空，返回空字符串');
        return '';
      }
      
      // 检查URL是否以@开头（有些后端可能会返回这种格式）
      if (cleanedUrl.startsWith('@')) {
        cleanedUrl = cleanedUrl.substring(1);
        console.log('处理@开头的URL后:', cleanedUrl);
      }
      
      // 检查URL是否为完整的HTTP/HTTPS URL
      if (cleanedUrl.startsWith('http://') || cleanedUrl.startsWith('https://')) {
        // 对URL进行编码处理，特别是处理中文和空格
        if (cleanedUrl.includes(' ') || cleanedUrl.match(/[\u4e00-\u9fa5]/)) {
          // 对URL进行编码，但保留协议和主机部分（包括端口号）
          const protocolMatch = cleanedUrl.match(/^(https?:\/\/[^\/]+)(\/.*)?$/);
          if (protocolMatch) {
            const [, protocolAndHost, path] = protocolMatch;
            if (path) {
              const encodedPath = path.split('/').map(segment => segment ? encodeURIComponent(segment) : '').join('/');
              cleanedUrl = protocolAndHost + encodedPath;
              console.log('完整URL编码后:', cleanedUrl);
            }
          }
        }
        console.log('是完整HTTP/HTTPS URL，返回:', cleanedUrl);
        return cleanedUrl;
      }
      
      // 检查是否为相对路径
      if (cleanedUrl.startsWith('/')) {
        // 如果是相对路径，添加API基础URL
        let fullUrl = `${BASE_URL}${cleanedUrl}`;
        // 对URL进行编码处理
        if (fullUrl.includes(' ') || fullUrl.match(/[\u4e00-\u9fa5]/)) {
          // 对URL进行编码，但保留协议部分
          const protocol = fullUrl.split('://')[0] + '://';
          const path = fullUrl.substring(protocol.length);
          const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
          fullUrl = protocol + encodedPath;
          console.log('相对路径编码后URL:', fullUrl);
        }
        return fullUrl;
      }
      
      // 检查是否为静态资源路径
      if (cleanedUrl.startsWith('static/')) {
        const staticUrl = `/${cleanedUrl}`;
        console.log('是静态资源路径，处理后:', staticUrl);
        return staticUrl;
      }
      
      console.log('处理后URL不满足任何条件，返回空字符串');
      console.log('=== 图片URL处理结束 ===');
      return '';
    },
    
    // 处理图片加载失败
    handleImageError(event) {
      console.error('商品图片加载失败:', event);
      
      // 如果是DOM事件，尝试设置为空字符串避免显示错误图片
      if (event && event.target) {
        event.target.src = '';
      } else {
        // 直接更新数据
        this.goods.image = '';
      }
    },
    
    // 加载商品详情
    async loadGoodsDetail() {
      try {
        const result = await foodApi.getGoodsDetail(this.goodsId);
        if (result && result.code === 200) {
          let goodsData = result.data;
          
          // 获取近30天销量并覆盖默认销量
          try {
            const monthlyRes = await foodApi.getGoodsMonthlySales(this.goodsId);
            if (monthlyRes && monthlyRes.code === 200 && monthlyRes.data !== undefined) {
              goodsData.salesCount = Number(monthlyRes.data) || goodsData.salesCount || 0;
            }
          } catch (err) {
            console.warn('获取商品月售失败:', err);
          }
          
          // 处理商品图片URL，支持多种字段名称
          let imageUrl = '';
          
          // 尝试获取图片URL的优先级：mainImageUrl > imageUrl > image > imageList[0]
          if (goodsData.mainImageUrl) {
            imageUrl = goodsData.mainImageUrl;
            console.log('使用mainImageUrl作为图片URL:', imageUrl);
          } else if (goodsData.imageUrl) {
            imageUrl = goodsData.imageUrl;
            console.log('使用imageUrl作为图片URL:', imageUrl);
          } else if (goodsData.image) {
            imageUrl = goodsData.image;
            console.log('使用image作为图片URL:', imageUrl);
          } else if (goodsData.imageList && Array.isArray(goodsData.imageList) && goodsData.imageList.length > 0) {
            imageUrl = goodsData.imageList[0];
            console.log('使用imageList[0]作为图片URL:', imageUrl);
          } else {
            console.log('没有找到图片URL');
          }
          
          // 使用getValidImageUrl处理图片URL
          goodsData.image = this.getValidImageUrl(imageUrl);
          
          this.goods = goodsData;
        }
      } catch (error) {
        console.error('加载商品详情失败:', error);
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    },
    
    // 加载商家信息
    async loadRestaurantInfo() {
      try {
        const result = await foodApi.getMerchantDetail(this.restaurantId);
        if (result && result.code === 200) {
          this.restaurant = result.data;
        }
      } catch (error) {
        console.error('加载商家信息失败:', error);
      }
    },
    
    // 返回上一页
    navBack() {
      uni.navigateBack();
    },
    
    // 联系商家
    callRestaurant() {
      if (this.restaurant.phone) {
        uni.makePhoneCall({
          phoneNumber: this.restaurant.phone
        });
      } else {
        uni.showToast({
          title: '餐厅暂未提供电话',
          icon: 'none'
        });
      }
    },
    
    // 加入购物车
    addToCart() {
      // 这里可以添加加入购物车的逻辑
      uni.showToast({
        title: '已加入购物车',
        icon: 'success'
      });
      
      // 延迟返回上一页
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
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
  background-color: #5DCDFF;
  color: white;
  height: 44px;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  height: 100%;
}

.nav-back {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
}

.nav-right {
  display: flex;
  align-items: center;
}

.nav-icon {
  font-size: 32rpx;
  margin-left: 30rpx;
  color: white;
}

/* 商品图片 */
.goods-image-section {
  height: 500rpx;
  width: 100%;
  background-color: #F5F5F5;
  overflow: hidden;
}

.goods-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品基本信息 */
.goods-info-section {
  background-color: #FFFFFF;
  padding: 30rpx;
  margin-top: 20rpx;
}

.goods-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

.goods-price {
  font-size: 32rpx;
  color: #FF5722;
  font-weight: bold;
  margin-bottom: 30rpx;
  display: block;
}

/* 通用区块样式 */
.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  display: block;
}

/* 商品描述 */
.goods-desc-section {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1px solid #EEEEEE;
}

.goods-desc {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.5;
}

/* 商品属性 */
.goods-attributes-section {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1px solid #EEEEEE;
}

.attribute-item {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
}

.attribute-label {
  color: #999999;
  margin-right: 20rpx;
}

.attribute-value {
  color: #333333;
}

/* 商品规格 */
.goods-specs-section {
  margin-top: 40rpx;
  padding-top: 30rpx;
  border-top: 1px solid #EEEEEE;
}

.spec-item {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
}

.spec-name {
  color: #999999;
  margin-right: 20rpx;
}

.spec-value {
  color: #333333;
}

/* 底部按钮区域 */
.bottom-btn-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  flex: 1;
  background-color: #F5F5F5;
  color: #333333;
  border: none;
  border-radius: 40rpx;
  height: 80rpx;
  font-size: 30rpx;
  margin-right: 20rpx;
}

.add-to-cart-btn {
  flex: 2;
  background-color: #FF5722;
  color: white;
  border: none;
  border-radius: 40rpx;
  height: 80rpx;
  font-size: 30rpx;
}
</style>
