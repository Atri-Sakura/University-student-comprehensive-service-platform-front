<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <text class="nav-title">校园生活</text>
        <view class="location">
          <text class="location-icon">📍</text>
          <text class="location-text">贵州大学</text>
        </view>
      </view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y :style="{ top: navHeight + 'px' }">
      <!-- 轮播图 -->
      <view class="banner-section">
        <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500" circular>
          <swiper-item v-for="(item, index) in bannerList" :key="index">
            <image class="banner-image" :src="item.image" mode="aspectFit"></image>
          </swiper-item>
        </swiper>
      </view>

      <!-- 功能按钮 -->
      <view class="function-section">
        <view class="function-item" @click="navToSchedule">
          <view class="function-icon-box">
            <text class="function-icon">📅</text>
          </view>
          <text class="function-text">个人课表</text>
        </view>
        <view class="function-item" @click="navToErrand">
          <view class="function-icon-box">
            <text class="function-icon">🏃</text>
          </view>
          <text class="function-text">跑腿服务</text>
        </view>
        <view class="function-item" @click="navToFood">
          <view class="function-icon-box">
            <text class="function-icon">🍽️</text>
          </view>
          <text class="function-text">外卖点餐</text>
        </view>
      </view>

      <!-- 今日课程 -->
      <view class="course-section">
        <view class="section-header">
          <text class="section-title">今日课程</text>
          <text class="section-more" @click="viewAllCourses">查看全部</text>
        </view>
        <view class="course-list">
          <view class="course-item" v-for="(item, index) in courseList" :key="item.id || index">
            <view class="course-time">{{ item.time }}</view>
            <view class="course-info">
              <text class="course-name">{{ item.name }}</text>
              <text class="course-location">{{ item.location }}</text>
              <text class="course-teacher">👨‍🏫 {{ item.teacher }}</text>
            </view>
          </view>
          <view v-if="courseList.length === 0" class="empty-course">
            <text class="empty-text">今日暂无课程</text>
          </view>
        </view>
      </view>

      <!-- 推荐外卖 -->
      <view class="recommend-section">
        <view class="section-header">
          <text class="section-title">推荐外卖</text>
          <text class="section-more" @click="viewAllFood">查看全部</text>
        </view>
        <view class="recommend-grid">
          <view class="recommend-item" v-for="(item, index) in recommendList" :key="item.id || index" @click="viewFoodDetail(item)">
            <image class="recommend-image" :src="item.image" mode="aspectFill" @error="handleImageError($event, index, 'food')"></image>
            <!-- 商品信息 -->
            <view class="recommend-info">
              <!-- 商品名称 -->
              <text class="recommend-name">{{ item.goodsName }}</text>
              <!-- 评分和销量 -->
              <view class="recommend-meta">
                <view class="recommend-rating">
                  <text class="rating-star">⭐</text>
                  <text class="rating-score">{{ item.avgRating || 0 }}</text>
                </view>
                <text class="recommend-sales">月售{{ item.salesCount || 0 }}</text>
              </view>
              <!-- 价格区域 -->
              <view class="recommend-price-area">
                <text class="recommend-price">¥{{ item.price }}</text>
                <text v-if="item.originalPrice && item.originalPrice > item.price" class="recommend-original-price">¥{{ item.originalPrice }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 推荐二手商品 -->
      <view class="recommend-section">
        <view class="section-header">
          <text class="section-title">推荐二手商品</text>
          <text class="section-more" @click="viewAllSecondHand">查看全部</text>
        </view>
        <view class="recommend-grid">
          <view class="secondhand-item" v-for="(item, index) in secondHandList" :key="item.id || index" @click="viewSecondHandDetail(item)">
            <image class="secondhand-image" :src="getValidImageUrl(item.image)" mode="aspectFill" @error="handleImageError($event, index, 'secondHand')"></image>
            <text class="secondhand-name">{{ item.goodsName }}</text>
            <text class="secondhand-price">¥{{ item.price }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 自定义底部导航栏 -->
    <custom-tabbar :current="0"></custom-tabbar>
  </view>
</template>

<script>
import CustomTabbar from '@/components/custom-tabbar/custom-tabbar.vue';
import api from '@/api/index.js';

export default {
  components: {
    CustomTabbar
  },
  data() {
    return {
      statusBarHeight: 0,
      navHeight: 0,
      bannerList: [],
      courseList: [],
      recommendList: [],
      secondHandList: []
    };
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight || 0;
    this.navHeight = this.statusBarHeight + 44;
    
    // 加载所有数据
    this.loadAllData();
  },
  methods: {
    // 加载所有数据
    async loadAllData() {
      console.log('开始加载首页数据...');
      try {
        // 并行加载所有数据
        await Promise.all([
          this.getCarousel(),
          this.getTodayCourses(),
          this.getTakeoutRecommendations(),
          this.getSecondhandRecommendations()
        ]);
        
        console.log('首页数据加载完成');
      } catch (error) {
        console.error('首页数据加载失败:', error);
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    },
    
    // 获取轮播图数据
    async getCarousel() {
      try {
        const res = await api.indexPage.getCarousel();
        if (res && res.code === 200 && res.data && Array.isArray(res.data)) {
          // 转换数据格式，使用getValidImageUrl处理图片URL
          this.bannerList = res.data.map(item => ({
            image: this.getValidImageUrl(item.indexImageUrl),
            id: item.indexImageUrlId || Math.floor(Math.random() * 10000)
          }));
        } else {
          console.warn('获取轮播图失败:', res?.message || '未知错误');
          this.bannerList = [];
        }
        return res;
      } catch (error) {
        console.error('获取轮播图异常:', error);
        this.bannerList = [];
        return null;
      }
    },
    
    // 获取今日课程
    async getTodayCourses() {
      try {
        const res = await api.indexPage.getTodayCourses();
        
        // 添加详细的响应日志
        console.log('=== 今日课程API响应详情 ===');
        console.log('完整响应对象:', res);
        console.log('响应code:', res.code);
        console.log('响应message:', res.message || res.msg);
        console.log('响应data:', res.data);
        console.log('响应data类型:', typeof res.data);
        console.log('响应data是否为数组:', Array.isArray(res.data));
        if (Array.isArray(res.data)) {
          console.log('响应data长度:', res.data.length);
          if (res.data.length > 0) {
            console.log('响应data前1项:', res.data[0]);
          }
        }
        
        if (res && res.code === 200 && res.data && Array.isArray(res.data)) {
          // 转换今日课程数据格式
          const classTimes = ['一二节\n8:00-9:50', '三四节\n10:10-12:00', '五六节\n14:30-16:20', '七八节\n16:40-18:30', '九十节\n19:30-21:20'];
          
          let transformedCourses = [];
          
          res.data.forEach(course => {
            // 尝试多种可能的教师字段名
            const teacher = course.courseTeacher || course.teacher || course.course_teacher || course.teacherName || '未指定教师';
            
            // 计算课程跨越的时间段数量
            const startPeriod = course.startPeriod || 1;
            const endPeriod = course.endPeriod || 1;
            
            // 如果课程只有一个时间段或结束时间小于开始时间，直接转换
            if (endPeriod <= startPeriod) {
              let timeText = '未知时间';
              if (startPeriod >= 1 && startPeriod <= 5) {
                timeText = classTimes[startPeriod - 1];
              }
              transformedCourses.push({
                time: timeText,
                name: course.courseName || '未命名课程',
                location: course.classRoom || '未指定地点',
                teacher: teacher,
                originalData: course
              });
            } else {
              // 课程跨多个时间段，拆分成多个课程项显示
              // 每两个小节为一个时间段，比如1-2节为一个时间段，3-4节为一个时间段
              for (let i = startPeriod; i <= endPeriod; i += 2) {
                // 计算当前时间段对应的索引（一二节对应索引0，三四节对应索引1，以此类推）
                const periodIndex = Math.ceil(i / 2) - 1;
                if (periodIndex >= 0 && periodIndex < classTimes.length) {
                  transformedCourses.push({
                    time: classTimes[periodIndex],
                    name: course.courseName || '未命名课程',
                    location: course.classRoom || '未指定地点',
                    teacher: teacher,
                    originalData: course
                  });
                }
              }
            }
          });
          
          this.courseList = transformedCourses;
          console.log('今日课程数据转换成功，共', this.courseList.length, '门课程');
          console.log('转换后的数据:', this.courseList);
        } else if (res && res.code === 500 && res.message === '用户未登录') {
          console.warn('用户未登录，无法获取今日课程');
          this.courseList = [];
        } else {
          console.warn('获取今日课程失败:', res?.message || '未知错误');
          this.courseList = [];
        }
        return res;
      } catch (error) {
        console.error('获取今日课程异常:', error);
        this.courseList = [];
        return null;
      }
    },
    
    // 直接清理URL中的反引号等特殊字符
    cleanUrl(url) {
      if (!url) return '';
      
      let cleaned = String(url);
      console.log('cleanUrl输入:', cleaned);
      
      // 改进的反引号移除逻辑
      // 方法1: 增强的逐字符过滤，检查多种可能的反引号编码
      let filtered = '';
      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned.charAt(i);
        const code = char.charCodeAt(0);
        // 跳过反引号字符及其变种（ASCII码96和其他可能的变体）
        if (code !== 96 && code !== 65344) { // 65344是Unicode中可能的反引号变种
          filtered += char;
        }
      }
      
      // 方法2: 增强的正则表达式清理
      // 使用更强大的正则表达式确保移除所有形式的反引号
      filtered = filtered.replace(/[`\u0060\uFF1B]/g, ''); // 匹配多种反引号形式
      
      // 额外的安全检查，确保没有残留的反引号
      while (filtered.includes('`') || filtered.includes('\u0060')) {
        filtered = filtered.replace(/[`\u0060]/g, '');
      }
      
      // 去除前后空白
      filtered = filtered.trim();
      
      console.log('cleanUrl输出:', filtered);
      return filtered;
    },
    
    // 获取有效图片URL
    getValidImageUrl(url) {
      console.log('原始URL输入:', url);
      
      // 如果URL为空，直接返回默认占位图而不是空字符串
      if (!url) {
        console.log('URL为空，返回默认占位图');
        return '/static/images/default-food.svg';
      }
      
      // 先进行trim去除前后空白
      let cleanedUrl = String(url).trim();
      console.log('trim后URL:', cleanedUrl);
      
      // 加强反引号清理，使用更严格的正则表达式
      cleanedUrl = cleanedUrl.replace(/[`\u0060]/g, '');
      console.log('第一次移除反引号后URL:', cleanedUrl);
      
      // 再次尝试移除可能的转义反引号
      cleanedUrl = cleanedUrl.replace(/[`\u0060]/g, '');
      console.log('第二次移除反引号后URL:', cleanedUrl);
      
      // 再次trim确保去除反引号后的空白
      cleanedUrl = cleanedUrl.trim();
      console.log('最终清理后URL:', cleanedUrl);
      
      // 如果清理后URL为空，返回默认占位图
      if (!cleanedUrl) {
        console.log('清理后URL为空，返回默认占位图');
        return '/static/images/default-food.svg';
      }
      
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
        const baseUrl = 'http://localhost:8080';
        return `${baseUrl}${cleanedUrl}`;
      }
      
      // 检查是否为静态资源路径
      if (cleanedUrl.startsWith('static/')) {
        return `/${cleanedUrl}`;
      }
      
      // 如果都不是，返回默认占位图
      console.log('处理后URL不满足任何条件，返回默认占位图');
      // 使用本地静态资源作为占位图
      return '/static/images/default-food.svg';
    },
    
    // 处理图片加载失败
    handleImageError(event, index, type = 'food') {
      console.error(`商品图片加载失败，索引: ${index}，类型: ${type}`);
      console.error('错误事件详情:', event);
      
      // 如果是外卖类型，尝试修复URL
      if (type === 'food' && this.recommendList && this.recommendList[index]) {
        console.error(`外卖项[${index}]图片加载失败，当前图片URL:`, this.recommendList[index].image);
        console.error(`原始mainImageUrl:`, this.recommendList[index].mainImageUrl);
        
        // 直接操作DOM元素，尝试修复URL并重新设置图片源
        if (event && event.target) {
          // 获取当前失败的URL
          let failedUrl = event.target.src;
          console.log('失败的DOM图片URL:', failedUrl);
          
          // 强制移除所有可能的反引号（确保failedUrl存在）
          if (failedUrl) {
            let fixedUrl = failedUrl.replace(/[`\u0060]/g, '');
            console.log('强制修复后的URL:', fixedUrl);
            
            // 如果URL确实发生了变化，尝试重新加载
            if (fixedUrl !== failedUrl) {
              console.log('尝试重新加载修复后的URL');
              event.target.src = fixedUrl;
              return; // 尝试修复后返回，避免立即设置默认图片
            }
          }
          
          // 如果修复失败或failedUrl不存在，尝试使用cleanUrl处理后的mainImageUrl
          if (this.recommendList[index].mainImageUrl) {
            let cleanMainImageUrl = this.cleanUrl(this.recommendList[index].mainImageUrl);
            console.log('使用清理后的mainImageUrl:', cleanMainImageUrl);
            event.target.src = cleanMainImageUrl;
            return; // 尝试使用mainImageUrl后返回
          }
          
          // 所有尝试失败后，使用默认占位图
          console.log('所有修复尝试失败，使用默认占位图');
          event.target.src = '/static/images/default-food.svg';
        }
      } 
      // 如果是二手商品类型，记录相关图片信息并使用默认占位图
      else if (type === 'secondHand' && this.secondHandList && this.secondHandList[index]) {
        console.error(`二手商品项[${index}]图片加载失败，当前图片URL:`, this.secondHandList[index].image);
        if (event && event.target) {
          event.target.src = '/static/images/default-secondhand.svg';
        }
      }
    },
    
    // 获取推荐外卖
    async getTakeoutRecommendations() {
      console.log('开始获取推荐外卖数据');
      try {
        // 使用indexPage.js中的推荐外卖接口
        const res = await api.indexPage.getTakeoutRecommendations();
        
        if (res && res.code === 200 && res.data && Array.isArray(res.data)) {
          // 完整映射后端返回的所有字段，确保前端能正确显示所有信息
          this.recommendList = res.data.map(item => {
            console.log('单个外卖项数据:', item);
            // 处理图片URL，优先使用mainImageUrl，否则使用默认图片
            let imageUrl = item.mainImageUrl;
            // 如果有imageList且是数组，也可以考虑使用第一张图片
            if (!imageUrl && item.imageList && Array.isArray(item.imageList) && item.imageList.length > 0) {
              imageUrl = item.imageList[0];
            }
            // 使用getValidImageUrl函数处理图片URL
            const finalImageUrl = this.getValidImageUrl(imageUrl);
            
            return {
              ...item,
              // 确保基础字段存在并处理
              goodsName: item.goodsName || item.name || '未命名商品',
              // 图片字段 - 使用处理后的图片URL
              image: finalImageUrl,
              // 价格相关字段
              price: item.price || 0,
              originalPrice: item.originalPrice || null,
              // 评分相关字段
              avgRating: item.avgRating || 0,
              ratingCount: item.ratingCount || 0,
              // 销量信息
              salesCount: item.salesCount || 0,
              // 导航所需字段
              id: String(item.id || item.merchantGoodsId || Math.floor(Math.random() * 1000)),
              // 确保商家ID使用字符串类型，避免大数字精度丢失问题
              // 所有商家相关ID都转换为字符串
              restaurantId: item.restaurantId ? String(item.restaurantId) : (item.merchantBaseId ? String(item.merchantBaseId) : null),
              merchantBaseId: item.merchantBaseId ? String(item.merchantBaseId) : null,
              merchantGoodsId: item.merchantGoodsId || null,
              // 分类信息
              category: item.category || '',
              subCategory: item.subCategory || '',
              // 其他附加信息
              description: item.description || '',
              stock: item.stock || 0,
              status: item.status || 1,
              tagCodes: item.tagCodes || ''
            };
          });
          console.log('处理后的推荐外卖列表:', this.recommendList);
        } else if (res && res.code === 500 && res.message === '用户未登录') {
          console.warn('用户未登录，无法获取推荐外卖');
          this.recommendList = [];
        } else {
          console.warn('获取推荐外卖失败:', res?.message || '未知错误');
          this.recommendList = [];
        }
        return res;
      } catch (error) {
        console.error('获取推荐外卖异常:', error);
        this.recommendList = [];
        return null;
      }
    },
    
    // 获取推荐二手商品
    async getSecondhandRecommendations() {
      try {
        const res = await api.indexPage.getSecondhandRecommendations();
        
        if (res && res.code === 200 && res.data && Array.isArray(res.data)) {
          // 处理二手商品数据，确保图片URL正确
          this.secondHandList = res.data.map(item => {
            // 获取有效的图片URL，尝试多个可能的字段
            let imageUrl = '';
            if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
              imageUrl = item.imageUrls[0];
            } else {
              // 添加对imageUrl字段的支持
              imageUrl = item.imageUrl || item.image || item.mainImageUrl || '';
            }
            
            // 使用getValidImageUrl处理图片URL，确保清理反引号和空格
            const validImage = this.getValidImageUrl(imageUrl);
            
            return {
              ...item,
              // 使用goodsName作为商品名称
              goodsName: item.goodsName || item.name || '未命名商品',
              // 使用处理后的有效图片URL
              image: validImage,
              // 确保id字段存在，优先使用goodsId
              id: item.goodsId || item.id || item.secondhandId || `secondhand_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              // 确保基础字段存在
              price: item.price || 0,
              status: item.status || 1,
              // 统计信息
              viewCount: item.viewCount || 0,
              favoriteCount: item.favoriteCount || 0,
              shareCount: item.shareCount || 0,
              // 卖家信息
              sellerNickname: item.sellerNickname || '未知卖家',
              sellerAvatar: item.sellerAvatar || '',
              sellerPhone: item.sellerPhone || ''
            };
          });
        } else if (res && res.code === 500 && res.message === '用户未登录') {
          console.warn('用户未登录，无法获取推荐二手商品');
          this.secondHandList = [];
        } else {
          console.warn('获取推荐二手商品失败:', res?.message || '未知错误');
          this.secondHandList = [];
        }
        return res;
      } catch (error) {
        console.error('获取推荐二手商品异常:', error);
        this.secondHandList = [];
        return null;
      }
    },
    // 导航到个人课表
    navToSchedule() {
      console.log('开始导航到个人课表...');
      uni.navigateTo({
        url: '/pages/shedule/shedule',
        success: () => {
          console.log('导航到个人课表成功');
        },
        fail: (err) => {
          console.error('导航到个人课表失败:', err);
          uni.showToast({
            title: '导航失败，请重试',
            icon: 'none'
          });
        }
      });
    },
    // 导航到跑腿服务
    navToErrand() {
      console.log('开始导航到跑腿服务...');
      uni.navigateTo({
        url: '/pages/errand/errand',
        success: () => {
          console.log('成功导航到跑腿服务');
        },
        fail: (err) => {
          console.error('导航到跑腿服务失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    // 导航到外卖点餐
    navToFood() {
      console.log('开始导航到外卖点餐...');
      uni.navigateTo({
        url: '/pages/food/food',
        success: () => {
          console.log('成功导航到外卖点餐');
        },
        fail: (err) => {
          console.error('导航到外卖点餐失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    // 查看全部课程
    viewAllCourses() {
      console.log('开始导航到全部课程...');
      uni.navigateTo({
        url: '/pages/shedule/shedule',
        success: () => {
          console.log('成功导航到全部课程');
        },
        fail: (err) => {
          console.error('导航到全部课程失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    // 查看全部外卖
    viewAllFood() {
      console.log('开始导航到全部外卖...');
      uni.navigateTo({
        url: '/pages/food/food?view=all',
        success: () => {
          console.log('成功导航到全部外卖');
        },
        fail: (err) => {
          console.error('导航到全部外卖失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    // 查看外卖详情 - 直接跳转到商家页面并选择对应套餐
    viewFoodDetail(item) {
      console.log('开始导航到外卖详情...', {
        restaurantId: item.restaurantId,
        merchantBaseId: item.merchantBaseId,
        foodId: item.id
      });
      // 验证参数有效性 - 确保商家ID不为空、不为null、不为undefined且商品ID存在
      const restaurantId = item.restaurantId || item.merchantBaseId;
      // 验证商家ID是否有效（不为null、undefined或空字符串）
      const isValidRestaurantId = restaurantId !== null && restaurantId !== undefined && restaurantId !== "";
      if (!isValidRestaurantId || !item.id) {
        console.error('外卖详情参数不完整或商家ID无效:', item);
        uni.showToast({
          title: '商品信息不完整，无法跳转',
          icon: 'none'
        });
        return;
      }
      // 将商家ID转换为字符串，确保传递正确的参数
      const stringRestaurantId = String(restaurantId);
      uni.navigateTo({
        // 确保商家ID作为字符串传递，避免大数字精度问题
        url: `/pages/food/food-detail?restaurantId=${encodeURIComponent(stringRestaurantId)}&selectedFoodId=${encodeURIComponent(String(item.id))}`,
        success: () => {
          console.log('成功导航到外卖详情');
        },
        fail: (err) => {
          console.error('导航到外卖详情失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    // 查看所有二手商品 - 修改为与底部导航栏一致的跳转方式
    viewAllSecondHand() {
      console.log('开始导航到全部二手商品...');
      uni.reLaunch({
        url: '/pages/market/market',
        success: () => {
          console.log('跳转成功: 二手交易');
        },
        fail: (err) => {
          console.error('跳转失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    },
    // 查看二手商品详情 - 跳转到二手交易页面并自动选择对应商品
    viewSecondHandDetail(item) {
      console.log('开始导航到二手商品详情...', {
        itemId: item.id
      });
      // 验证参数有效性
      if (!item.id) {
        console.error('二手商品详情参数不完整:', item);
        uni.showToast({
          title: '商品信息不完整',
          icon: 'none'
        });
        return;
      }
      // 使用navigateTo保持页面栈的完整性，而不是reLaunch
      uni.navigateTo({
        url: `/pages/market/market?selectedItemId=${item.id}&autoBuy=true`,
        success: () => {
          console.log('跳转成功: 二手交易，已选择商品ID', item.id);
        },
        fail: (err) => {
          console.error('跳转失败:', err);
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
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

.nav-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.location {
  display: flex;
  align-items: center;
}

.location-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.location-text {
  font-size: 28rpx;
  color: #FFFFFF;
}

/* 内容区域 */
.content {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding-bottom: 140rpx; /* 为底部导航栏预留空间 */
}

/* 轮播图 */
.banner-section {
  margin: 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.banner-swiper {
  height: 400rpx;
  width: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 功能按钮 */
.function-section {
  display: flex;
  justify-content: space-around;
  background-color: #FFFFFF;
  margin: 30rpx;
  padding: 40rpx 0;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.function-icon-box {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #E3F4FF 0%, #D0EFFF 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.function-icon {
  font-size: 56rpx;
}

.function-text {
  font-size: 26rpx;
  color: #666666;
}

/* 今日课程 */
.course-section {
  background-color: #FFFFFF;
  margin: 20rpx 30rpx;
  padding: 30rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.section-more {
  font-size: 26rpx;
  color: #5DCDFF;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  background-color: #F0F9FF;
  transition: all 0.3s ease;
}

.section-more:active {
  background-color: #E0F2FE;
  transform: scale(0.98);
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.course-item {
  display: flex;
  align-items: center;
  background-color: #F8FAFC;
  padding: 24rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  border-left: 8rpx solid #5DCDFF;
}

.course-item:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
}

.course-item:active {
  transform: translateY(0);
}

.course-time {
  font-size: 28rpx;
  font-weight: bold;
  color: #5DCDFF;
  width: 140rpx;
  flex-shrink: 0;
  text-align: center;
  background-color: #FFFFFF;
  padding: 16rpx 12rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(93, 205, 255, 0.15);
  line-height: 1.3;
}

.course-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 24rpx;
  min-height: 100rpx;
  justify-content: center;
}

.course-name {
  font-size: 30rpx;
  color: #333333;
  font-weight: 600;
  margin-bottom: 8rpx;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.course-location {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 6rpx;
  line-height: 1.4;
}

.course-teacher {
  font-size: 26rpx;
  color: #999999;
  line-height: 1.4;
  display: block;
  margin-top: 4rpx;
  line-height: 1.4;
}

.empty-course {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #999999;
  font-size: 28rpx;
  background-color: #F8FAFC;
  border-radius: 16rpx;
  margin-top: 20rpx;
}

.empty-text {
  color: #999999;
  font-size: 28rpx;
}

.empty-course {
  text-align: center;
  padding: 60rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #CCCCCC;
}

/* 推荐外卖 */
.recommend-section {
  background-color: #FFFFFF;
  margin: 30rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.recommend-section:last-child {
  margin-bottom: 140rpx;
}

/* 自适应网格布局 */
.recommend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280rpx, 1fr));
  gap: 20rpx;
  padding: 20rpx 0;
}

/* 推荐外卖商品样式 */
.recommend-item {
  display: flex;
  flex-direction: column;
  border-radius: 20rpx;
  overflow: hidden;
  background-color: #FFFFFF;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.recommend-image {
  width: 100%;
  height: 200rpx;
  border-radius: 20rpx 20rpx 0 0;
  margin-bottom: 0;
  object-fit: cover;
}

.recommend-info {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.recommend-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 10rpx;
  min-height: 70rpx;
  white-space: normal;
}

.recommend-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #999999;
}

.recommend-rating {
  display: flex;
  align-items: center;
}

.rating-star {
  font-size: 20rpx;
  margin-right: 4rpx;
}

.rating-score {
  color: #FF6B81;
  font-weight: 500;
}

.recommend-sales {
  font-size: 22rpx;
}

.recommend-price-area {
  display: flex;
  align-items: baseline;
  margin-top: auto;
}

.recommend-price {
    font-size: 36rpx;
    font-weight: bold;
    color: #FF6B81;
    display: inline;
  }

  .recommend-original-price {
    margin-left: 10rpx;
    font-size: 24rpx;
    color: #999999;
    text-decoration: line-through;
  }
  
  /* 二手商品样式 */
  .secondhand-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx;
    border-radius: 16rpx;
    background-color: #FFFFFF;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
    width: 100%;
    box-sizing: border-box;
  }
  
  .secondhand-image {
    width: 100%;
    height: 200rpx;
    border-radius: 16rpx;
    margin-bottom: 16rpx;
    object-fit: cover;
  }
  
  .secondhand-name {
    display: block;
    font-size: 26rpx;
    color: #333333;
    margin-bottom: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    text-align: center;
  }
  
  .secondhand-price {
    display: block;
    font-size: 28rpx;
    font-weight: bold;
    color: #FF6B6B;
    text-align: center;
  }
  </style>

