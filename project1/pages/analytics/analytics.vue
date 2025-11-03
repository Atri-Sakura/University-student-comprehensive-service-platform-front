<template>
  <view class="page-container">
    <!-- 顶部导航栏 - 固定定位 -->
    <view class="nav-header fixed-header">
      <view class="nav-left">
        <view class="back-button" @click="goBack">
          <svg class="back-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          <text>返回</text>
        </view>
      </view>
      <view class="nav-title">数据分析</view>
      <view class="nav-right">
        <!-- 右侧空白区域 -->
      </view>
    </view>
    
    <!-- 主要内容区域 - 可滚动 -->
    <view class="content-scroll">
      <!-- 日期选择 -->
      <view class="date-selector">
        <view class="date-tabs">
          <view 
            class="date-tab" 
            :class="{ active: currentDateTab === 'today' }"
            @click="switchDateTab('today')"
          >
            今日
          </view>
          <view 
            class="date-tab" 
            :class="{ active: currentDateTab === 'yesterday' }"
            @click="switchDateTab('yesterday')"
          >
            昨日
          </view>
          <view 
            class="date-tab" 
            :class="{ active: currentDateTab === 'week' }"
            @click="switchDateTab('week')"
          >
            本周
          </view>
          <view 
            class="date-tab" 
            :class="{ active: currentDateTab === 'month' }"
            @click="switchDateTab('month')"
          >
            本月
          </view>
        </view>
        <view class="date-range">
          <svg class="date-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
          <text class="date-range-text">{{ currentDateRange }}</text>
        </view>
      </view>
      
      <!-- 核心数据 -->
      <view class="core-data">
        <view class="data-cards">
          <view class="data-card">
            <svg class="data-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            <view class="data-title">订单量</view>
            <view class="data-value">{{ coreData.orderCount }}</view>
            <view class="data-compare" :class="coreData.orderTrend > 0 ? 'compare-up' : 'compare-down'">
              <svg class="trend-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" v-if="coreData.orderTrend > 0"/>
                <path d="M16 18l-2.29-2.29-4.88 4.88-4-4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z" v-else/>
              </svg>
              <text>{{ coreData.orderTrend > 0 ? '+' : '' }}{{ coreData.orderTrend }}% 较昨日</text>
            </view>
          </view>
          <view class="data-card">
            <svg class="data-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H12.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.78-1.18 2.75-2.65 3.09z"/>
            </svg>
            <view class="data-title">营业额</view>
            <view class="data-value">¥{{ coreData.revenue }}</view>
            <view class="data-compare" :class="coreData.revenueTrend > 0 ? 'compare-up' : 'compare-down'">
              <svg class="trend-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" v-if="coreData.revenueTrend > 0"/>
                <path d="M16 18l-2.29-2.29-4.88 4.88-4-4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z" v-else/>
              </svg>
              <text>{{ coreData.revenueTrend > 0 ? '+' : '' }}{{ coreData.revenueTrend }}% 较昨日</text>
            </view>
          </view>
          <view class="data-card">
            <svg class="data-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <view class="data-title">实收金额</view>
            <view class="data-value">¥{{ coreData.actualRevenue }}</view>
            <view class="data-compare" :class="coreData.actualRevenueTrend > 0 ? 'compare-up' : 'compare-down'">
              <svg class="trend-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" v-if="coreData.actualRevenueTrend > 0"/>
                <path d="M16 18l-2.29-2.29-4.88 4.88-4-4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z" v-else/>
              </svg>
              <text>{{ coreData.actualRevenueTrend > 0 ? '+' : '' }}{{ coreData.actualRevenueTrend }}% 较昨日</text>
            </view>
          </view>
          <view class="data-card">
            <svg class="data-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
            <view class="data-title">单均价</view>
            <view class="data-value">¥{{ coreData.avgPrice }}</view>
            <view class="data-compare" :class="coreData.avgPriceTrend > 0 ? 'compare-up' : 'compare-down'">
              <svg class="trend-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" v-if="coreData.avgPriceTrend > 0"/>
                <path d="M16 18l-2.29-2.29-4.88 4.88-4-4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z" v-else/>
              </svg>
              <text>{{ coreData.avgPriceTrend > 0 ? '+' : '' }}{{ coreData.avgPriceTrend }}% 较昨日</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 数据趋势图 -->
      <view class="trend-section">
        <view class="section-header">
          <view class="section-title">经营趋势</view>
          <view class="section-actions" @click="changeTrendPeriod">近7天</view>
        </view>
        
        <!-- 有数据时显示趋势图 -->
        <view class="chart-container" v-if="trendData.dates.length > 0">
          <view class="chart-area">
            <!-- Y轴刻度 -->
            <view class="y-axis">
              <view class="y-label" v-for="(label, index) in yAxisLabels" :key="index">{{ label }}</view>
            </view>
            
            <!-- 图表区域 -->
            <view class="chart-main">
              <!-- 背景网格线 -->
              <view class="grid-lines">
                <view class="grid-line" v-for="n in 5" :key="n"></view>
              </view>
              
              <!-- 营业额柱状图 -->
              <view class="line-chart revenue-line">
                <view 
                  class="chart-bar revenue-bar" 
                  v-for="(item, index) in trendData.revenue" 
                  :key="'revenue-' + index"
                  :style="{ height: item.percentage + '%' }"
                >
                  <view class="bar-dot revenue-dot"></view>
                  <view 
                    class="bar-value revenue-value" 
                    :class="{ 'value-high': item.percentage > 60 }"
                  >
                    ¥{{ item.displayValue }}
                  </view>
                </view>
              </view>
              
              <!-- 订单量柱状图 -->
              <view class="line-chart order-line">
                <view 
                  class="chart-bar order-bar" 
                  v-for="(item, index) in trendData.orders" 
                  :key="'order-' + index"
                  :style="{ height: item.percentage + '%' }"
                >
                  <view class="bar-dot order-dot"></view>
                  <view 
                    class="bar-value order-value" 
                    :class="{ 'value-high': item.percentage > 60 }"
                  >
                    {{ item.value }}
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- X轴日期 -->
          <view class="x-axis">
            <view class="x-label" v-for="(date, index) in trendData.dates" :key="index">{{ date }}</view>
          </view>
        </view>
        
        <!-- 无数据时显示占位符 -->
        <view class="chart-container" v-else>
          <view class="chart-placeholder">
            <svg class="chart-main-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
            </svg>
            <text>暂无趋势数据</text>
          </view>
        </view>
        
        <view class="chart-legend">
          <view class="legend-item">
            <view class="legend-color color-1"></view>
            <text>营业额</text>
          </view>
          <view class="legend-item">
            <view class="legend-color color-2"></view>
            <text>订单量</text>
          </view>
        </view>
      </view>
      
      <!-- 商品销量排行 -->
      <view class="sales-ranking">
        <view class="section-header">
          <view class="section-title">{{ rankingType === 'hot' ? '热销商品' : '滞销商品' }}排行</view>
          <view class="section-actions" @click="viewAllRanking">查看更多</view>
        </view>
        <view class="ranking-tabs">
          <view 
            class="ranking-tab" 
            :class="{ active: rankingType === 'hot' }"
            @click="switchRankingType('hot')"
          >
            热销商品
          </view>
          <view 
            class="ranking-tab" 
            :class="{ active: rankingType === 'slow' }"
            @click="switchRankingType('slow')"
          >
            滞销商品
          </view>
        </view>
        <view class="product-list">
          <!-- 商品列表 -->
          <view class="product-item" v-for="(item, index) in productRanking" :key="index">
            <view class="product-rank" :class="index < 3 ? 'rank-' + (index+1) : ''">{{ index+1 }}</view>
            <view class="product-info">
              <view class="product-name">{{ item.name }}</view>
              <view class="product-sales">销量: {{ item.sales }}份</view>
            </view>
            <view class="product-amount">¥{{ item.amount }}</view>
          </view>
          <!-- 空数据提示 -->
          <view class="empty-data" v-if="productRanking.length === 0">
            <view class="empty-icon">📦</view>
            <view class="empty-text">暂无{{ rankingType === 'hot' ? '热销' : '滞销' }}商品数据</view>
            <view class="empty-hint" v-if="rankingType === 'hot'">试试切换到"滞销商品"查看</view>
          </view>
        </view>
      </view>
      
      <!-- 评价分析 -->
      <view class="rating-analysis">
        <view class="section-header">
          <view class="section-title">评价分析</view>
          <view class="section-actions">近30天</view>
        </view>
        
        <!-- 有评价数据时显示 -->
        <view v-if="ratingData.totalRatings > 0">
          <view class="rating-overview">
            <view class="rating-score">
              <view class="score-value">{{ ratingData.overallScore }}</view>
              <view class="score-label">综合评分</view>
            </view>
            <view class="rating-detail">
              <view class="rating-bar" v-for="(item, idx) in ratingData.starDistribution" :key="idx">
                <view class="bar-label">{{ 5-idx }}星</view>
                <view class="bar-container">
                  <view class="bar-fill" :style="{ width: item.percentage + '%' }"></view>
                </view>
                <view class="bar-count">{{ item.percentage }}%</view>
              </view>
            </view>
          </view>
          <view class="keywords-section">
            <view class="keywords-title">好评关键词</view>
            <view class="keywords-list">
              <view class="keyword-item" v-for="(keyword, index) in ratingData.positiveKeywords" :key="index">{{ keyword }}</view>
            </view>
          </view>
          <view class="keywords-section">
            <view class="keywords-title">差评关键词</view>
            <view class="keywords-list">
              <view class="keyword-item keyword-bad" v-for="(keyword, index) in ratingData.negativeKeywords" :key="index">{{ keyword }}</view>
            </view>
          </view>
        </view>
        
        <!-- 无评价数据时显示 -->
        <view class="empty-data" v-else>
          <view class="empty-icon">⭐</view>
          <view class="empty-text">暂无评价数据</view>
          <view class="empty-hint">期待顾客的第一条评价</view>
        </view>
      </view>
      
      <!-- 底部留白区域 -->
      <view class="bottom-space"></view>
    </view>
    
    <!-- 底部导航 - 固定在底部 -->
    <view class="custom-tab-bar">
      <view class="tab-item" @click="switchTab('index')" :class="{ active: currentTab === 'index' }">
        <view class="tab-icon">🏠</view>
        <view class="tab-text">首页</view>
      </view>
      <view class="tab-item" @click="switchTab('list')" :class="{ active: currentTab === 'list' }">
        <view class="tab-icon">📋</view>
        <view class="tab-text">订单</view>
      </view>
      <view class="tab-item" @click="switchTab('message')" :class="{ active: currentTab === 'message' }">
        <view class="tab-icon">💬</view>
        <view class="tab-text">消息</view>
      </view>
      <view class="tab-item" @click="switchTab('mine')" :class="{ active: currentTab === 'mine' }">
        <view class="tab-icon">👤</view>
        <view class="tab-text">我的</view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getSalesData,
  getRatingsData,
  getTopGoods
} from '@/utils/merchantAnalytics.js';

export default {
  name: 'DataAnalysis',
  data() {
    return {
      currentDateTab: 'today',
      currentDateRange: '2023-11-15',
      todayDate: '',
      rankingType: 'hot',
      currentTab: '', // 当前不在底部导航栏中，所以为空
      isLoading: false, // 加载状态
      
      coreData: {
        orderCount: 0,
        orderTrend: 0,
        revenue: '0',
        revenueTrend: 0,
        actualRevenue: '0',
        actualRevenueTrend: 0,
        avgPrice: '0',
        avgPriceTrend: 0
      },
      productRanking: [],
      ratingData: {
        overallScore: 0,
        totalRatings: 0,
        starDistribution: [
          { star: 5, percentage: 0 },
          { star: 4, percentage: 0 },
          { star: 3, percentage: 0 },
          { star: 2, percentage: 0 },
          { star: 1, percentage: 0 }
        ],
        positiveKeywords: [],
        negativeKeywords: []
      },
      
      // 趋势数据
      trendData: {
        dates: [],
        revenue: [],
        orders: []
      }
    }
  },
  computed: {
    // Y轴标签（动态计算）
    yAxisLabels() {
      if (this.trendData.revenue.length === 0) return ['0'];
      
      const maxRevenue = Math.max(...this.trendData.revenue.map(item => item.rawValue || 0));
      const step = Math.ceil(maxRevenue / 4);
      
      return [
        this.formatNumber(step * 4),
        this.formatNumber(step * 3),
        this.formatNumber(step * 2),
        this.formatNumber(step),
        '0'
      ];
    }
  },
  onLoad() {
    // 页面加载时获取数据
    this.updateDateRange();
    this.loadAllData();
  },
  onShow() {
    // 每次显示页面时刷新数据
    this.updateDateRange();
    this.loadAllData();
  },
  methods: {
    // ==================== 数据加载方法 ====================
    
    /**
     * 加载所有数据（从后端）
     */
    async loadAllData() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      
      try {
        const range = this.getSelectedDateRange();
        // 并行请求所有数据
        const [salesRes, ratingsRes, topGoodsRes] = await Promise.all([
          getSalesData(range).catch(() => ({ data: { code: 500, data: null } })),
          getRatingsData().catch(() => ({ data: { code: 500, data: null } })),
          getTopGoods(10, this.rankingType).catch(() => ({ data: { code: 500, data: null } }))
        ]);
        
        // 处理销售数据
        if (salesRes.data && salesRes.data.code === 200 && salesRes.data.data) {
          const salesData = salesRes.data.data;
          
          // 使用后端实际返回的字段名
          this.coreData.orderCount = salesData.orderCount || 0;
          this.coreData.revenue = this.formatNumber(salesData.totalRevenue || 0);
          this.coreData.actualRevenue = this.formatNumber(salesData.actualIncome || salesData.totalRevenue || 0);
          this.coreData.avgPrice = this.formatNumber(salesData.avgOrderAmount || 0);
          
          // 趋势数据（与昨日对比，百分比）
          this.coreData.orderTrend = salesData.orderCountChangePercent || 0;
          this.coreData.revenueTrend = salesData.totalRevenueChangePercent || 0;
          this.coreData.actualRevenueTrend = salesData.actualIncomeChangePercent || salesData.totalRevenueChangePercent || 0;
          this.coreData.avgPriceTrend = salesData.avgOrderAmountChangePercent || 0;
          
          // 处理趋势数据
          if (salesData.trendData || salesData.dailyData) {
            this.processTrendData(salesData.trendData || salesData.dailyData);
          } else {
            this.generateMockTrendData();
          }
        }
        
        // 处理评价数据
        if (ratingsRes.data && ratingsRes.data.code === 200 && ratingsRes.data.data) {
          const ratingsData = ratingsRes.data.data;
          
          // 使用后端实际返回的字段名
          this.ratingData.overallScore = ratingsData.avgRating || 0;
          this.ratingData.totalRatings = ratingsData.totalReviews || 0;
          
          // 评分分布（使用 ratingDistributions）
          if (ratingsData.ratingDistributions && ratingsData.ratingDistributions.length > 0) {
            this.ratingData.starDistribution = ratingsData.ratingDistributions.map(item => ({
              star: item.star || item.rating || 5,
              percentage: item.percentage || item.percent || 0
            }));
          } else {
            // 默认数据
            this.ratingData.starDistribution = [
              { star: 5, percentage: 0 },
              { star: 4, percentage: 0 },
              { star: 3, percentage: 0 },
              { star: 2, percentage: 0 },
              { star: 1, percentage: 0 }
            ];
          }
          
          // 关键词
          this.ratingData.positiveKeywords = ratingsData.positiveKeywords || [];
          this.ratingData.negativeKeywords = ratingsData.negativeKeywords || [];
        }
        
        // 处理商品排行数据
        if (topGoodsRes.data && topGoodsRes.data.code === 200 && topGoodsRes.data.data) {
          const rankingData = topGoodsRes.data.data;
          
          // 根据类型选择热销或滞销商品
          const topGoodsData = this.rankingType === 'hot' 
            ? (rankingData.hotSellingProducts || [])
            : (rankingData.slowMovingProducts || []);
          
          this.productRanking = topGoodsData.map(item => ({
            name: item.productName || item.goodsName || item.name || '未知商品',
            sales: item.salesVolume || item.salesCount || item.sales || 0,
            amount: this.formatNumber(item.totalSales || item.salesAmount || item.amount || 0)
          }));
        }
        
      } catch (error) {
        console.error('加载数据失败:', error);
        
        // 使用默认数据
        this.loadDefaultData();
        
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * 加载默认数据（兜底）
     */
    loadDefaultData() {
      this.coreData = {
        orderCount: 86,
        orderTrend: 12,
        revenue: '5,268',
        revenueTrend: 8,
        actualRevenue: '4,835',
        actualRevenueTrend: 7,
        avgPrice: '61.3',
        avgPriceTrend: 3
      };
      
      this.productRanking = [
        { name: '招牌汉堡套餐', sales: 156, amount: '35.00' },
        { name: '经典炸鸡桶', sales: 134, amount: '68.00' },
        { name: '芝士牛肉汉堡', sales: 98, amount: '28.00' },
        { name: '薯条（大份）', sales: 87, amount: '15.00' },
        { name: '可乐（大杯）', sales: 76, amount: '8.00' }
      ];
      
      this.ratingData = {
        overallScore: 4.8,
        totalRatings: 2680,
        starDistribution: [
          { star: 5, percentage: 78 },
          { star: 4, percentage: 15 },
          { star: 3, percentage: 5 },
          { star: 2, percentage: 1 },
          { star: 1, percentage: 1 }
        ],
        positiveKeywords: ['味道好', '配送快', '包装精美', '服务热情', '性价比高'],
        negativeKeywords: ['等待时间长', '分量不足', '包装破损']
      };
    },
    
    /**
     * 格式化数字（添加千分位）
     */
    formatNumber(num) {
      if (!num && num !== 0) return '0';
      const number = parseFloat(num);
      if (isNaN(number)) return '0';
      return number.toLocaleString('zh-CN', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      });
    },
    
    /**
     * 计算百分比
     */
    calculatePercentage(count, total) {
      if (!total || total === 0) return 0;
      return Math.round((count / total) * 100);
    },
    
    /**
     * 更新日期范围显示
     */
    updateDateRange() {
      const today = new Date();
      this.todayDate = this.formatDate(today);
      // 根据当前tab决定展示的范围文本
      if (this.currentDateTab === 'today') {
        this.currentDateRange = this.todayDate;
      } else if (this.currentDateTab === 'yesterday') {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        const yd = this.formatDate(y);
        this.currentDateRange = yd;
      } else if (this.currentDateTab === 'week') {
        const { startDate, endDate } = this.getSelectedDateRange();
        this.currentDateRange = `${startDate} 至 ${endDate}`;
      } else if (this.currentDateTab === 'month') {
        const { startDate, endDate } = this.getSelectedDateRange();
        this.currentDateRange = `${startDate} 至 ${endDate}`;
      }
    },

    // 根据当前日期tab返回查询范围
    getSelectedDateRange() {
      const today = new Date();
      if (this.currentDateTab === 'today') {
        return { startDate: this.todayDate, endDate: this.todayDate };
      }
      if (this.currentDateTab === 'yesterday') {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        const yd = this.formatDate(y);
        return { startDate: yd, endDate: yd };
      }
      if (this.currentDateTab === 'week') {
        // 以周一为一周开始
        const d = new Date(today);
        const day = d.getDay(); // 周日=0, 周一=1
        const diffToMonday = (day + 6) % 7; // 距离周一的天数
        const start = new Date(d);
        start.setDate(d.getDate() - diffToMonday);
        const end = new Date(d);
        // 本周截至今日
        const startDate = this.formatDate(start);
        const endDate = this.formatDate(end);
        return { startDate, endDate };
      }
      if (this.currentDateTab === 'month') {
        const d = new Date(today);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d);
        const startDate = this.formatDate(start);
        const endDate = this.formatDate(end);
        return { startDate, endDate };
      }
      return {};
    },

    // 工具：日期格式化 YYYY-MM-DD
    formatDate(dateObj) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },
    
    // ==================== 原有方法 ====================
    
    goBack() {
      // 返回上一页
      uni.navigateBack();
    },
    
    switchDateTab(tab) {
      this.currentDateTab = tab;
      this.updateDateRange();
      // 切换日期时重新加载数据
      this.loadAllData();
    },
    
    async switchRankingType(type) {
      this.rankingType = type;
      
      // 重新加载商品排行数据
      try {
        const topGoodsRes = await getTopGoods(10, type);
        
        if (topGoodsRes.data && topGoodsRes.data.code === 200 && topGoodsRes.data.data) {
          const rankingData = topGoodsRes.data.data;
          
          // 🔧 根据类型选择热销或滞销商品
          const topGoodsData = type === 'hot' 
            ? (rankingData.hotSellingProducts || [])
            : (rankingData.slowMovingProducts || []);
          
          this.productRanking = topGoodsData.map(item => ({
            name: item.productName || item.goodsName || item.name || '未知商品',
            sales: item.salesVolume || item.salesCount || item.sales || 0,
            amount: this.formatNumber(item.totalSales || item.salesAmount || item.amount || 0)
          }));
        }
      } catch (error) {
        console.error('切换排行榜失败:', error);
      }
    },
    
    switchTab(tab) {
      this.currentTab = tab;
      
      // 根据tab跳转到相应页面
      switch(tab) {
        case 'index':
          uni.switchTab({
            url: '/pages/index/index'
          });
          break;
        case 'list':
          uni.switchTab({
            url: '/pages/list/list'
          });
          break;
        case 'message':
          uni.switchTab({
            url: '/pages/message/message'
          });
          break;
        case 'mine':
          uni.switchTab({
            url: '/pages/mine/mine'
          });
          break;
      }
    },
    
    changeTrendPeriod() {
      // TODO: 实现趋势周期切换逻辑
      // 暂时重新生成模拟数据
      this.generateMockTrendData();
    },
    
    viewAllRanking() {
      // TODO: 跳转到商品排行详情页
    },
    
    /**
     * 处理趋势数据（从后端）
     */
    processTrendData(trendData) {
      if (!trendData || trendData.length === 0) {
        this.generateMockTrendData();
        return;
      }
      
      // 提取日期
      this.trendData.dates = trendData.map(item => {
        const date = item.date || item.day || '';
        return date.substring(5); // '2025-10-28' -> '10-28'
      });
      
      // 提取营业额数据
      const revenueValues = trendData.map(item => item.revenue || item.totalRevenue || 0);
      const maxRevenue = Math.max(...revenueValues, 1);
      
      this.trendData.revenue = revenueValues.map(value => ({
        rawValue: value,
        value: this.formatNumber(value),
        displayValue: this.formatShortNumber(value), // 简化显示
        percentage: (value / maxRevenue) * 75 // 最高75%高度，留出空间显示标签
      }));
      
      // 提取订单量数据
      const orderValues = trendData.map(item => item.orders || item.orderCount || 0);
      const maxOrders = Math.max(...orderValues, 1);
      
      this.trendData.orders = orderValues.map(value => ({
        rawValue: value,
        value: value,
        percentage: (value / maxOrders) * 75 // 最高75%高度，留出空间显示标签
      }));
    },
    
    /**
     * 生成模拟趋势数据（7天）
     */
    generateMockTrendData() {
      const today = new Date();
      const dates = [];
      const revenueValues = [];
      const orderValues = [];
      
      // 生成7天的数据
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        dates.push(`${month}-${day}`);
        
        // 模拟营业额（20-100之间的随机数）
        const revenue = Math.floor(Math.random() * 80) + 20;
        revenueValues.push(revenue);
        
        // 模拟订单量（1-10之间的随机数）
        const orders = Math.floor(Math.random() * 9) + 1;
        orderValues.push(orders);
      }
      
      this.trendData.dates = dates;
      
      const maxRevenue = Math.max(...revenueValues, 1);
      this.trendData.revenue = revenueValues.map(value => ({
        rawValue: value,
        value: this.formatNumber(value),
        displayValue: this.formatShortNumber(value),
        percentage: (value / maxRevenue) * 75
      }));
      
      const maxOrders = Math.max(...orderValues, 1);
      this.trendData.orders = orderValues.map(value => ({
        rawValue: value,
        value: value,
        percentage: (value / maxOrders) * 75
      }));
    },
    
    /**
     * 格式化简短数字（用于图表显示）
     */
    formatShortNumber(num) {
      if (!num && num !== 0) return '0';
      const number = parseFloat(num);
      if (isNaN(number)) return '0';
      
      if (number >= 10000) {
        return (number / 10000).toFixed(1) + 'w';
      } else if (number >= 1000) {
        return (number / 1000).toFixed(1) + 'k';
      } else {
        return number.toFixed(0);
      }
    }
  }
}
</script>

<style scoped>
.page-container {
  position: relative;
  min-height: 100vh;
  background-color: #f5f5f5;
  color: #333;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

/* 主要内容滚动区域 - 调整顶部间距避免被导航栏遮挡 */
.content-scroll {
  overflow-y: auto;
  padding: 160rpx 24rpx 120rpx; /* 增加顶部间距避免被导航栏遮挡 */
  box-sizing: border-box;
}

/* 底部留白区域 */
.bottom-space {
  height: 40rpx;
}

/* 图片通用样式 */
.data-icon {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 10rpx;
}

.trend-icon {
  width: 30rpx;
  height: 30rpx;
}

.date-icon {
  width: 32rpx;
  height: 32rpx;
  color: #2a8cc4;
}

.chart-main-icon {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 20rpx;
}

.back-icon {
  width: 40rpx;
  height: 40rpx;
}

/* 顶部导航栏 - 固定定位，调整大小和背景色与模板一致 */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

.nav-header {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0); /* 与模板页面相同的背景色 */
  padding: 30rpx; /* 调整内边距与模板一致 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  height: 120rpx; /* 固定高度与模板一致 */
  box-sizing: border-box;
}

.nav-left {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

.nav-title {
  flex: 2;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 20rpx;
  font-size: 28rpx;
  color: #333; /* 调整为深色与模板一致 */
}

/* 日期选择 */
.date-selector {
  padding: 30rpx;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  flex-wrap: nowrap;
  overflow: hidden;
  box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 24rpx;
  border-radius: 16rpx;
}

.date-tabs {
  display: flex;
  gap: 8rpx;
  overflow-x: auto;
  padding-bottom: 5rpx;
  flex: 1;
  min-width: 0;
}

.date-tab {
  min-width: 100rpx;
  height: 56rpx;
  line-height: 56rpx;
  padding: 0 24rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  text-align: center;
  white-space: nowrap;
  background: #f7f9fb;
  border: 1rpx solid #e6f0f6;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.date-tab.active {
  background: #E6F4FF;
  border-color: #91caff;
  color: #2a8cc4;
  font-weight: 500;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 8rpx 14rpx;
  background: #f7f9fb;
  border: 1rpx solid #e6f0f6;
  border-radius: 40rpx;
  font-size: 24rpx;
  color: #333;
  white-space: nowrap;
  flex-shrink: 0;
  max-width: 340rpx;
}

.date-range-text {
  display: block;
  max-width: 280rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 核心数据 */
.core-data {
  padding: 30rpx;
  background: white;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.data-card {
  padding: 30rpx 20rpx;
  border-radius: 16rpx;
  text-align: center;
  background: linear-gradient(135deg, rgba(147, 210, 243, 0.1), rgba(147, 210, 243, 0.2));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.data-title {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.data-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #2a8cc4;
  margin-bottom: 10rpx;
}

.data-compare {
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.compare-up {
  color: #52c41a;
}

.compare-down {
  color: #ff4d4f;
}

/* 数据趋势图 */
.trend-section {
  padding: 30rpx;
  background: white;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2a8cc4;
}

.section-actions {
  font-size: 26rpx;
  color: #2a8cc4;
  cursor: pointer;
}

.chart-container {
  height: 420rpx;
  position: relative;
  margin: 24rpx 0;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(147, 210, 243, 0.1), rgba(147, 210, 243, 0.05));
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 28rpx;
  flex-direction: column;
  gap: 20rpx;
}

/* 趋势图具体样式 */
.chart-area {
  display: flex;
  height: 380rpx;
  margin-bottom: 24rpx;
}

.y-axis {
  width: 90rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 20rpx;
}

.y-label {
  font-size: 24rpx;
  color: #999;
  text-align: right;
  line-height: 1.2;
}

.chart-main {
  flex: 1;
  position: relative;
  border-left: 2rpx solid #e5e5e5;
  border-bottom: 2rpx solid #e5e5e5;
  padding: 0 12rpx;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.grid-line {
  height: 1rpx;
  background: #f0f0f0;
}

.line-chart {
  position: absolute;
  bottom: 0;
  left: 12rpx;
  right: 12rpx;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100%;
}

.chart-bar {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin: 0 5rpx;
  transition: all 0.3s ease;
  min-width: 20rpx;
}

.revenue-bar {
  background: linear-gradient(to top, rgba(42, 140, 196, 0.9), rgba(42, 140, 196, 0.4));
  border-radius: 8rpx 8rpx 0 0;
  min-height: 20rpx;
}

.order-bar {
  background: linear-gradient(to top, rgba(255, 159, 64, 0.9), rgba(255, 159, 64, 0.4));
  border-radius: 8rpx 8rpx 0 0;
  min-height: 20rpx;
}

.bar-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: white;
  margin-top: -7rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.revenue-dot {
  border: 3rpx solid #2a8cc4;
}

.order-dot {
  border: 3rpx solid #ff9f40;
}

.bar-value {
  position: absolute;
  top: -40rpx;
  font-size: 20rpx;
  font-weight: 600;
  white-space: nowrap;
  padding: 3rpx 7rpx;
  border-radius: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
  left: 50%;
}

.revenue-value {
  background: linear-gradient(135deg, rgba(42, 140, 196, 0.98), rgba(42, 140, 196, 0.92));
  color: white;
  z-index: 12;
  transform: translateX(-100%) translateX(-8rpx);
  border: 1rpx solid rgba(42, 140, 196, 1);
}

.order-value {
  background: linear-gradient(135deg, rgba(255, 159, 64, 0.98), rgba(255, 159, 64, 0.92));
  color: white;
  z-index: 11;
  transform: translateX(8rpx);
  border: 1rpx solid rgba(255, 159, 64, 1);
}

/* 当柱子高度超过60%时，标签显示在柱子内部 */
.revenue-value.value-high {
  top: 8rpx !important;
  transform: translateX(-100%) translateX(-6rpx);
}

.order-value.value-high {
  top: 8rpx !important;
  transform: translateX(6rpx);
}

.x-axis {
  display: flex;
  justify-content: space-around;
  padding: 0 102rpx 0 107rpx;
  margin-top: 16rpx;
}

.x-label {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  font-weight: 500;
  line-height: 1.2;
}

.chart-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50rpx;
  margin-top: 30rpx;
  padding: 20rpx;
  background: rgba(147, 210, 243, 0.05);
  border-radius: 12rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.legend-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.color-1 {
  background: linear-gradient(135deg, rgba(42, 140, 196, 0.9), rgba(42, 140, 196, 0.6));
}

.color-2 {
  background: linear-gradient(135deg, rgba(255, 159, 64, 0.9), rgba(255, 159, 64, 0.6));
}

/* 商品销量排行 */
.sales-ranking {
  padding: 30rpx;
  background: white;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.ranking-tabs {
  display: flex;
  gap: 10rpx;
  margin-bottom: 24rpx;
}

.ranking-tab {
  padding: 15rpx 30rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  background: #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.ranking-tab.active {
  background: rgba(147, 210, 243, 0.3);
  color: #2a8cc4;
  font-weight: 500;
}

.product-list {
  max-height: 400rpx;
  overflow-y: auto;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.product-item:last-child {
  border-bottom: none;
}

.product-rank {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.rank-1 {
  background: #ffd666;
  color: #fff;
}

.rank-2 {
  background: #d9d9d9;
  color: #fff;
}

.rank-3 {
  background: #ffc069;
  color: #fff;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 28rpx;
  margin-bottom: 8rpx;
}

.product-sales {
  font-size: 24rpx;
  color: #888;
}

.product-amount {
  font-size: 32rpx;
  font-weight: 500;
  color: #2a8cc4;
}

/* 评价分析 */
.rating-analysis {
  padding: 30rpx;
  background: white;
  margin-bottom: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.rating-overview {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 30rpx;
}

.rating-score {
  text-align: center;
}

.score-value {
  font-size: 80rpx;
  font-weight: bold;
  color: #ffa940;
}

.score-label {
  font-size: 26rpx;
  color: #888;
}

.rating-detail {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.bar-label {
  font-size: 24rpx;
  width: 50rpx;
  color: #888;
}

.bar-container {
  flex: 1;
  height: 16rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #ffa940;
  border-radius: 8rpx;
  transition: width 0.3s;
}

.bar-count {
  font-size: 24rpx;
  color: #888;
  width: 80rpx;
  text-align: right;
}

.keywords-section {
  margin-top: 30rpx;
}

.keywords-title {
  font-size: 28rpx;
  font-weight: 500;
  margin-bottom: 20rpx;
  color: #2a8cc4;
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.keyword-item {
  padding: 10rpx 20rpx;
  background: rgba(255, 169, 64, 0.1);
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #ffa940;
}

.keyword-bad {
  background: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}

/* 空数据提示 */
.empty-data {
  padding: 80rpx 40rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #bbb;
}

/* 自定义底部导航栏 - 按照配置修改 */
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff; /* 背景色 */
  display: flex;
  padding: 10rpx 0;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
  z-index: 999;
  border-top: 1rpx solid #e0e0e0; /* 边框样式 */
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
  font-size: 20rpx;
  color: #999999; /* 默认颜色 */
  cursor: pointer;
  transition: all 0.3s;
}

.tab-item.active {
  color: #4A90E2; /* 选中颜色 */
}

.tab-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.tab-text {
  font-size: 20rpx;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 1rpx;
  height: 1rpx;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 1rpx;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 1rpx;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>