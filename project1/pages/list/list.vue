<template>
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <text class="title">订单管理</text>
    </view>
    
    <!-- 标签切换 -->
    <view class="tabs">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab"
        :class="{ active: currentTab === index }"
        @click="switchTabIndex(index)"
      >
        <text>{{ tab.name }}</text>
        <text v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</text>
      </view>
    </view>
    
    <!-- 订单列表 -->
    <view class="order-list">
      <view v-for="item in currentOrders" :key="item.id" class="order-card">
        <view class="order-header">
          <text class="order-no">订单号：{{ item.orderNo }}</text>
          <text :style="{ color: getStatusColor(item.status) }" class="order-status">{{ item.status }}</text>
        </view>
        
        <view class="order-info">
          <view class="customer-info">
            <text class="customer-name">👤 {{ item.customerName }}</text>
            <text class="customer-phone">{{ item.phone }}</text>
          </view>
          <text class="order-time">下单时间：{{ item.orderTime }}</text>
        </view>
        
        <view class="order-content">
          <view v-for="(product, idx) in item.items" :key="idx" class="product-item">
            <view class="product-name">{{ product.name }}</view>
            <view class="product-detail">
              <text v-if="product.options" class="product-options">{{ product.options }}</text>
              <text class="product-quantity">· {{ product.quantity }}份</text>
              <text class="product-price">¥{{ product.price }}</text>
            </view>
          </view>
        </view>
        
        <view class="order-footer">
          <view class="order-amount">
            <text>¥{{ item.amount }}</text>
          </view>
          
          <view class="order-actions">
            <!-- 商家待接单状态 - 优化布局 -->
            <view v-if="item.status === '商家待接单'">
              <!-- 第一行：主要操作按钮 -->
              <view class="action-group primary-actions">
                <button class="action-btn reject" @click="rejectOrder(item)">拒单</button>
                <button class="action-btn accept" @click="acceptOrder(item)">接单</button>
              </view>
              <!-- 第二行：次要操作按钮 -->
              <view class="action-group secondary-actions">
                <button class="action-btn detail" @click="viewOrderDetail(item)">查看详情</button>
                <button class="action-btn contact customer" @click="contactCustomer(item)">联系客户</button>
              </view>
            </view>
            
            <!-- 骑手待接单/待取货状态 -->
            <view v-if="item.status === '骑手待接单' || item.status === '骑手待取货'" class="action-group">
              <button class="action-btn detail" @click="viewOrderDetail(item)">查看详情</button>
              <button class="action-btn contact customer" @click="contactCustomer(item)">联系客户</button>
              <button class="action-btn notify" @click="notifyRider(item)">联系骑手</button>
            </view>
            
            <!-- 骑手配送中状态 -->
            <view v-if="item.status === '骑手配送中'">
              <view class="action-group tight-group">
                <button class="action-btn detail" @click="viewOrderDetail(item)">查看详情</button>
                <button class="action-btn contact rider" @click="contactRider(item)">联系骑手</button>
                <button class="action-btn contact customer" @click="contactCustomer(item)">联系客户</button>
              </view>
              <view class="rider-info" v-if="item.riderName">
                <text>骑手：{{ item.riderName }}</text>
                <text>{{ item.riderAcceptTime }}</text>
              </view>
            </view>
            
            <!-- 已送达状态 -->
            <view v-if="item.status === '已送达'">
              <view class="action-group tight-group">
                <button class="action-btn detail" @click="viewOrderDetail(item)">查看详情</button>
                <button class="action-btn contact customer" @click="contactCustomer(item)">联系客户</button>
                <button v-if="item.review" class="action-btn review" @click="viewReview(item)">查看评价</button>
              </view>
              <view class="complete-info" v-if="item.completeTime">
                <text>完成时间：{{ item.completeTime }}</text>
              </view>
            </view>
            
            <!-- 已取消状态 -->
            <view v-if="item.status === '已取消'">
              <view class="action-group tight-group">
                <button class="action-btn detail" @click="viewOrderDetail(item)">查看详情</button>
                <button class="action-btn contact customer" @click="contactCustomer(item)">联系客户</button>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">加载中...</text>
      </view>
      <!-- 空状态 -->
      <view v-else-if="currentOrders.length === 0" class="empty">
        <text class="empty-icon">📦</text>
        <text class="empty-text">暂无订单</text>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <view class="custom-tab-bar">
      <view class="tab-item" @click="switchTab('index')">
        <view class="tab-icon">🏠</view>
        <view class="tab-text">首页</view>
      </view>
      <view class="tab-item active" @click="switchTab('list')">
        <view class="tab-icon">📋</view>
        <view class="tab-text">订单</view>
      </view>
      <view class="tab-item" @click="switchTab('message')">
        <view class="tab-icon">💬</view>
        <view class="tab-text">消息</view>
      </view>
      <view class="tab-item" @click="switchTab('mine')">
        <view class="tab-icon">👤</view>
        <view class="tab-text">我的</view>
      </view>
    </view>
  </view>
</template>

<script>
// 使用api.js中的request函数，它包含大整数处理逻辑
import { request, merchantOrderAPI } from '../../utils/api.js'

export default {
  name: 'OrderPage',
  data() {
      return {
        currentTab: 0,
        tabs: [
        { name: '待处理', count: 0 },
        { name: '配送中', count: 0 },
        { name: '已完成', count: 0 }
      ],
        allOrders: [],
        isLoading: false // 加载状态
      }
    },
  created() {
      // 页面加载时获取订单列表
      this.getOrderList()
    },
    onShow() {
      // 页面显示时立即刷新一次订单数据
      if (!this.isLoading) {
        this.getOrderList()
      }
    },
  computed: {
    // 待处理订单：商家待接单、骑手待接单、骑手待取货
    pendingOrders() {
      return this.allOrders.filter(order => ['商家待接单', '骑手待接单', '骑手待取货'].includes(order.status))
    },
    // 配送中：骑手配送中
    deliveringOrders() {
      return this.allOrders.filter(order => order.status === '骑手配送中')
    },
    // 已完成：已送达、已取消、异常报备
    completedOrders() {
      return this.allOrders.filter(order => 
        order.status === '已送达' ||
        order.status === '已取消' ||
        order.status === '异常报备'
      )
    },
    currentOrders() {
      switch (this.currentTab) {
        case 0: return this.pendingOrders
        case 1: return this.deliveringOrders
        case 2: return this.completedOrders
        default: return this.pendingOrders
      }
    }
  },
  methods: {

      
      // 页面内标签切换方法，避免与底部导航栏方法冲突
      switchTabIndex(index) {
        this.currentTab = index
        // 调用getOrderList方法刷新订单数据
        this.getOrderList()
      },
    

    
    // 获取订单列表
    async getOrderList() {
      // 设置加载状态为true
      this.isLoading = true
      try {
        const res = await request(merchantOrderAPI.list, {
          method: 'GET'
        })
        
        
        // 检查响应是否有效
        if (!res) {
          throw new Error('响应为空')
        }
        
        // 统一处理响应数据
        let orderData = []
        
        // 处理微信小程序/uni-app标准响应格式
        if (res.statusCode === 200 && res.data) {
          // 后端返回的标准格式：{code: 200, msg: "", total: 0, rows: []}
          if (res.data.code === 200 || res.data.code === 1) {
            // 后端返回成功状态码
            orderData = res.data.rows || []
          } else {
            // 后端返回错误状态码
            throw new Error(res.data.msg || '后端返回错误')
          }
        } else {
          // 非标准响应格式
          throw new Error(`请求失败，状态码: ${res.statusCode || '未知'}`)
        }
        
        // 处理获取到的数据
        if (orderData.length > 0) {
          // 将后端返回的数据转换为前端所需的格式
          const transformedOrders = this.transformOrderData(orderData)
          this.allOrders = transformedOrders
          this.updateOrderCount()
        } else {
          this.allOrders = []
          this.updateOrderCount()
        }
      } catch (error) {
        console.error('获取订单列表失败:', error)
        uni.showToast({
          title: error.message || '获取订单失败',
          icon: 'none'
        })
      } finally {
        // 请求完成后无论成功失败，都将加载状态设置为false
        this.isLoading = false
      }
    },
    
    // 转换后端订单数据格式为前端所需格式
    transformOrderData(backendOrders) {
        return backendOrders.map((order, index) => {
        
        // 调试：打印骑手相关字段
        console.log('订单骑手信息:', {
          riderId: order.riderId,
          rider_id: order.rider_id,
          riderBaseId: order.riderBaseId,
          rider_base_id: order.rider_base_id,
          riderName: order.riderName,
          rider_nickname: order.rider_nickname,
          riderRealName: order.riderRealName,
          rider_real_name: order.rider_real_name
        });
        
        // 根据后端返回的订单状态进行完整映射
        // 1: 商家待接单；2: 骑手待接单；3: 骑手待取货；4: 骑手配送中；5: 已送达；6: 已取消
        const statusMap = {
          1: '商家待接单',
          2: '骑手待接单',
          3: '骑手待取货',
          4: '骑手配送中',
          5: '已送达',
          6: '已取消',
          7: '异常报备'
        };
        
        // 使用后端返回的状态，如果找不到对应映射则默认为'待接单'
        let orderStatus = statusMap[order.orderStatus] || '待接单';
        
        // 统一金额计算：商品小计 + 配送费，金额来源优先顺序与详情一致
        const goodsAmountRaw = parseFloat(order.goodsAmount || 0);
        const totalAmountRaw = parseFloat(order.totalAmount || order.total_amount || 0);
        const deliveryFromBackend = parseFloat(
          order.deliveryFeeAmount || // 后端主字段
          order.deliveryFee ||
          order.delivery_fee ||
          order.deliveryAmount ||
          order.shippingFee ||
          order.DeliceryFee || // 后端字段拼写
          order.deliceryFee || 0
        );
        const payAmountRaw = parseFloat(order.actualAmount || order.actual_amount || order.payAmount || order.pay_amount || 0);

        // 转换商品列表，便于求和
        const { itemsRaw, items: itemsDisplay } = this.transformProductsForList(order);
        const productAmountFromItems = this.sumProductsForList(itemsRaw);

        // 商品金额
        let productAmount = productAmountFromItems || goodsAmountRaw;
        if (!productAmount) {
          productAmount = totalAmountRaw;
        }
        if (productAmount < 0) productAmount = 0;

        // 配送费：优先后端 deliveryFeeAmount，若缺失且 payAmountRaw>商品小计，用差值兜底
        let deliveryFee = !isNaN(deliveryFromBackend) ? deliveryFromBackend : NaN;
        if ((deliveryFee === undefined || isNaN(deliveryFee)) && payAmountRaw && productAmount) {
          deliveryFee = payAmountRaw - productAmount;
        }
        if (isNaN(deliveryFee) || deliveryFee < 0) deliveryFee = 0;

        // 实付金额：优先后端实付；否则商品金额 + 配送费
        let amountDisplay = payAmountRaw || (productAmount + deliveryFee);
        
        // 使用后端实际的商品数据
        const items = itemsRaw.length ? itemsDisplay : [{
          name: '商品',
          options: '',
          quantity: 1,
          price: amountDisplay || 0
        }];
        
        return {
          id: order.orderMainId,
          orderNo: order.orderNo,
          customerName: order.deliverContact || order.userNickname || '顾客',
          phone: order.deliverPhone || '',
          orderTime: order.createTime,
          status: orderStatus,
          amount: amountDisplay,
          items: items,
          completeTime: order.completeTime,
          riderId: order.riderId || order.rider_id || order.riderBaseId || order.rider_base_id,
          riderName: order.riderName,
          riderPhone: order.riderPhone,
          riderAcceptTime: order.riderAcceptTime,
          review: order.review,
          userId: order.userId,
          userNickname: order.userNickname
        };
      })
    },
    

    // 转换商品数据（列表页专用，保留原始项以便求和）
    transformProductsForList(order) {
      let productList = null
      if (order.orderTakeoutDetailList && Array.isArray(order.orderTakeoutDetailList)) {
        productList = order.orderTakeoutDetailList
      } else if (order.orderItems && Array.isArray(order.orderItems)) {
        productList = order.orderItems
      } else if (order.products && Array.isArray(order.products)) {
        productList = order.products
      } else if (Array.isArray(order)) {
        productList = order
      }
      const itemsRaw = (productList || []).map(item => {
        const price = parseFloat(item.goodsPrice || item.price || 0)
        const qty = item.quantity || item.productCount || 1
        const subtotal = parseFloat(item.subtotal || (price * qty))
        return {
          name: item.goodsName || item.productName || item.name || '商品',
          options: item.goodsSpec || item.productOption || item.options || item.spec || '',
          quantity: qty,
          price: price,
          subtotal: subtotal
        }
      })
      const items = itemsRaw.map(i => ({
        name: i.name,
        options: i.options,
        quantity: i.quantity,
        price: i.price
      }))
      return { itemsRaw, items }
    },

    // 汇总商品小计（列表页）
    sumProductsForList(itemsRaw) {
      if (!Array.isArray(itemsRaw)) return 0
      return itemsRaw.reduce((sum, p) => {
        const val = parseFloat(p.subtotal || (p.price || 0) * (p.quantity || 1))
        return sum + (isNaN(val) ? 0 : val)
      }, 0)
    },


    
    getStatusColor(status) {
      const colors = {
        '商家待接单': '#ff9800',
        '骑手待接单': '#ff6b00',
        '骑手待取货': '#ff6b00',
        '骑手配送中': '#2196f3',
        '已送达': '#52c41a',
        '已取消': '#999999',
        '异常报备': '#faad14'
      }
      return colors[status] || '#666'
    },
    
    // 接单操作
    acceptOrder(item) {
      uni.showModal({
        title: '接单确认',
        content: '确定要接受该订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 使用orderMainId作为后端API的订单ID参数（保持字符串类型，避免大整数精度丢失）
              const orderId = item.id // orderMainId已经被正确处理为字符串类型
              
              // 调用后端接单接口
              const response = await request(merchantOrderAPI.accept(orderId), {
                method: 'PUT'
              });
              
              // 适配后端AjaxResult格式
              if (response.statusCode === 200) {
                // 后端返回的是AjaxResult对象，检查code字段
                if (response.data && (response.data.code === 200 || response.data.code === 1)) {
                  // 更新前端订单状态
                  item.status = '骑手待接单'
                  this.updateOrderCount()
                  uni.showToast({
                    title: '接单成功',
                    icon: 'success'
                  })
                } else {
                  uni.showToast({
                    title: (response.data && response.data.msg) || '接单失败',
                    icon: 'none'
                  })
                }
              } else {
                uni.showToast({
                  title: '请求失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              uni.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    

    
    // 联系骑手（创建聊天会话）
    async notifyRider(item) {
      if (!item.riderId) {
        uni.showToast({
          title: '暂无骑手信息',
          icon: 'none'
        });
        return;
      }

      uni.showLoading({
        title: '正在打开聊天...'
      });

      try {
        const merchantInfo = uni.getStorageSync('merchantInfo');
        if (!merchantInfo || !merchantInfo.merchantBaseId) {
          throw new Error('商家信息获取失败');
        }

        // 查询是否已有会话
        const sessionRes = await request(
          `http://localhost:8080/platform/chat/session/list`,
          {
            method: 'GET',
            data: {
              fromType: 3,
              fromId: merchantInfo.merchantBaseId,
              toType: 2,
              toId: item.riderId
            }
          }
        );

        let sessionId = null;
        if (sessionRes && sessionRes.statusCode === 200 && sessionRes.data) {
          const sessions = sessionRes.data.data || sessionRes.data.rows || [];
          if (sessions.length > 0) {
            sessionId = sessions[0].sessionId;
          }
        }

        // 如果没有会话则创建新会话
        if (!sessionId) {
          const createRes = await request(
            `http://localhost:8080/platform/chat/session`,
            {
              method: 'POST',
              data: {
                fromType: 3,
                fromId: String(merchantInfo.merchantBaseId),
                toType: 2,
                toId: String(item.riderId),
                sessionStatus: 1
              }
            }
          );
          console.log('创建骑手会话响应:', createRes);
          if (createRes && createRes.statusCode === 200 && createRes.data) {
            sessionId = createRes.data.data?.sessionId || createRes.data.data || createRes.data.sessionId;
          }
        }

        uni.hideLoading();
        console.log('骑手会话sessionId:', sessionId);

        if (sessionId) {
          uni.navigateTo({
            url: `/pages/message/chat?sessionId=${sessionId}&fromType=3&fromId=${merchantInfo.merchantBaseId}&toType=2&toId=${item.riderId}&title=${encodeURIComponent(item.riderName || '骑手')}`
          });
        } else {
          uni.showToast({
            title: '无法创建会话',
            icon: 'none'
          });
        }

      } catch (error) {
        uni.hideLoading();
        console.error('创建骑手会话失败:', error);
        uni.showToast({
          title: error.message || '打开聊天失败',
          icon: 'none'
        });
      }
    },
    
    // 更新订单数量统计
    updateOrderCount() {
      this.tabs[0].count = this.pendingOrders.length
      this.tabs[1].count = this.deliveringOrders.length
      this.tabs[2].count = this.completedOrders.length
    },
    
    // 联系客户
    async contactCustomer(item) {
      uni.showActionSheet({
        itemList: ['电话联系', '消息联系'],
        success: async (res) => {
          if (res.tapIndex === 0) {
            if (!item.phone) {
              uni.showToast({
                title: '客户电话不可用',
                icon: 'none'
              });
              return;
            }
            uni.makePhoneCall({
              phoneNumber: item.phone
            })
          } else if (res.tapIndex === 1) {
            if (!item.userId) {
              uni.showToast({
                title: '无法获取客户信息',
                icon: 'none'
              });
              return;
            }

            uni.showLoading({
              title: '正在打开聊天...'
            });

            try {
              const merchantInfo = uni.getStorageSync('merchantInfo');
              if (!merchantInfo || !merchantInfo.merchantBaseId) {
                throw new Error('商家信息获取失败');
              }

              const sessionRes = await request(
                `http://localhost:8080/platform/chat/session/list`,
                {
                  method: 'GET',
                  data: {
                    fromType: 3,
                    fromId: merchantInfo.merchantBaseId,
                    toType: 1,
                    toId: item.userId
                  }
                }
              );

              let sessionId = null;
              if (sessionRes && sessionRes.statusCode === 200 && sessionRes.data) {
                const sessions = sessionRes.data.data || sessionRes.data.rows || [];
                if (sessions.length > 0) {
                  sessionId = sessions[0].sessionId;
                }
              }

              if (!sessionId) {
                const createRes = await request(
                  `http://localhost:8080/platform/chat/session`,
                  {
                    method: 'POST',
                    data: {
                      fromType: 3,
                      fromId: String(merchantInfo.merchantBaseId),
                      toType: 1,
                      toId: String(item.userId),
                      sessionStatus: 1
                    }
                  }
                );
                console.log('创建会话响应:', createRes);
                if (createRes && createRes.statusCode === 200 && createRes.data) {
                  // 兼容多种返回格式
                  sessionId = createRes.data.data?.sessionId || createRes.data.data || createRes.data.sessionId;
                }
              }

              uni.hideLoading();
              
              console.log('最终sessionId:', sessionId);

              if (sessionId) {
                uni.navigateTo({
                  url: `/pages/message/chat?sessionId=${sessionId}&fromType=3&fromId=${merchantInfo.merchantBaseId}&toType=1&toId=${item.userId}&title=${encodeURIComponent(item.customerName || item.userNickname || '用户')}`
                });
              } else {
                uni.showToast({
                  title: '无法创建会话',
                  icon: 'none'
                });
              }

            } catch (error) {
              uni.hideLoading();
              console.error('创建会话失败:', error);
              uni.showToast({
                title: error.message || '打开聊天失败',
                icon: 'none'
              });
            }
          }
        }
      })
    },
    
    // 联系骑手
    contactRider(item) {
      if (item.riderPhone) {
        uni.showActionSheet({
          itemList: ['电话联系', '消息联系'],
          success: (res) => {
            if (res.tapIndex === 0) {
              // 电话联系
              uni.makePhoneCall({
                phoneNumber: item.riderPhone
              })
            } else if (res.tapIndex === 1) {
              // 消息联系，跳转到消息中心（tabbar页面）
              // 保存参数到全局，因为switchTab不能传递参数
              getApp().globalData.contactParams = {
                contactType: 'rider',
                name: item.riderName,
                id: item.id
              }
              uni.switchTab({
                url: '/pages/message/message'
              })
            }
          }
        })
      }
    },
    
    // 查看订单详情
    viewOrderDetail(item) {
      console.log('查看订单详情:', item.id);
      // 跳转到订单详情页面，使用list目录下的order-detail页面
      uni.navigateTo({
        url: `/pages/list/order-detail?id=${item.id}&orderNo=${item.orderNo}`
      });
    },
    
    // 查看评价
    viewReview(item) {
      if (item.review) {
        uni.showModal({
          title: '顾客评价',
          content: `评分：${item.review.rating}星\n评价：${item.review.content}`,
          showCancel: false
        })
      }
    },
    
    // 拒单操作
    rejectOrder(item) {
      uni.showModal({
        title: '拒单确认',
        content: '确定要拒绝该订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 使用orderMainId作为后端API的订单ID参数（保持字符串类型，避免大整数精度丢失）
              const orderId = item.id // orderMainId已经被正确处理为字符串类型
              // 调用后端拒单接口
              const response = await request(merchantOrderAPI.reject(orderId), {
                method: 'PUT'
              })
              
              // 适配后端AjaxResult格式
              if (response.statusCode === 200) {
                // 后端返回的是AjaxResult对象，检查code字段
                if (response.data && (response.data.code === 200 || response.data.code === 1)) {
                  // 从订单列表中移除
                  this.allOrders = this.allOrders.filter(order => order.id !== item.id)
                  this.updateOrderCount()
                  uni.showToast({
                    title: '拒单成功',
                    icon: 'success'
                  })
                } else {
                  uni.showToast({
                    title: (response.data && response.data.msg) || '拒单失败',
                    icon: 'none'
                  })
                }
              } else {
                uni.showToast({
                  title: '请求失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('拒单失败:', error)
              uni.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    // 底部导航栏切换
    switchTab(tab) {
      const urlMap = {
        index: '/pages/index/index',
        message: '/pages/message/message',
        mine: '/pages/mine/mine'
      };
      
      if (urlMap[tab]) {
        uni.switchTab({
          url: urlMap[tab]
        });
      }
    }
  }
}
</script>

<style scoped>
.container {
  padding-bottom: 120rpx;
}

.header {
  background-color: #4A90E2;
  color: white;
  padding: 40rpx 0;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
}

.tabs {
  display: flex;
  background-color: white;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab {
  flex: 1;
  text-align: center;
  position: relative;
  padding: 10rpx 0;
}

.tab.active {
  color: #4A90E2;
  font-weight: bold;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30%;
  width: 40%;
  height: 4rpx;
  background-color: #4A90E2;
}

.tab-badge {
  position: absolute;
  top: -10rpx;
  right: 20rpx;
  background-color: #ff4d4f;
  color: white;
  font-size: 20rpx;
  padding: 0 10rpx;
  border-radius: 10rpx;
  min-width: 24rpx;
  height: 24rpx;
  line-height: 24rpx;
  text-align: center;
}

.order-list {
  padding: 20rpx;
  background-color: #f5f5f5;
}

.order-card {
  background-color: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.order-no {
  font-size: 28rpx;
  color: #666;
}

.order-status {
  font-size: 30rpx;
  font-weight: bold;
}

.order-info {
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.customer-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.customer-name {
  font-size: 28rpx;
  color: #333;
}

.customer-phone {
  font-size: 28rpx;
  color: #666;
}

.order-time {
  font-size: 26rpx;
  color: #999;
}

.order-content {
  margin-bottom: 20rpx;
}

.product-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.product-detail {
  text-align: right;
  font-size: 26rpx;
  color: #666;
}

.product-options {
  margin-right: 10rpx;
}

.product-quantity {
  margin-right: 10rpx;
}

.product-price {
  color: #333;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-amount {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.order-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.action-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.action-group.tight-group {
  gap: 12rpx;
  margin-bottom: 8rpx;
}

/* 主要操作按钮组 - 待接单状态 */
.action-group.primary-actions {
  gap: 20rpx;
  margin-bottom: 12rpx;
}

.action-group.primary-actions .action-btn {
  min-width: 130rpx;
  font-size: 28rpx;
  padding: 12rpx 30rpx;
  font-weight: 500;
}

/* 次要操作按钮组 - 待接单状态 */
.action-group.secondary-actions {
  gap: 16rpx;
}

.action-group.secondary-actions .action-btn {
  min-width: 140rpx;
}

.action-btn {
  font-size: 26rpx;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
  margin-left: 0;
  line-height: 1.5;
  min-width: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.accept {
  background-color: #52c41a;
  color: white;
  border: none;
  min-width: 120rpx;
}

.action-btn.reject {
  background-color: #ff4d4f;
  color: white;
  border: none;
  min-width: 120rpx;
}

.action-btn.complete {
  background-color: #1890ff;
  color: white;
  border: none;
  min-width: 140rpx;
}

.action-btn.notify {
  background-color: #faad14;
  color: white;
  border: none;
  min-width: 140rpx;
}

.action-btn.contact {
  background-color: #1890ff;
  color: white;
  border: none;
  min-width: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
}

.action-btn.contact.customer {
  background-color: #52c41a;
}

.action-btn.contact.rider {
  background-color: #1890ff;
}

.action-btn.review {
  background-color: #faad14;
  color: white;
  border: none;
  min-width: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
}

/* 查看详情按钮样式 - 增加清晰的边框 */
.action-btn.detail {
  background-color: #ffffff;
  color: #4A90E2;
  border: 2rpx solid #4A90E2;
  min-width: 140rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  padding: 10rpx 24rpx;
  border-radius: 24rpx;
}

.rider-info {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  text-align: right;
}

.complete-info {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
  text-align: right;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 自定义底部导航栏 - 与主页保持一致 */
.custom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  display: flex;
  padding: 10rpx 0;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
  z-index: 999;
  border-top: 1rpx solid #e0e0e0;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
  color: #999999;
  position: relative;
}

.tab-item.active {
  color: #4A90E2;
}

.tab-icon {
  font-size: 44rpx;
  margin-bottom: 4rpx;
  display: block;
  width: auto;
  height: auto;
  text-align: center;
  line-height: 1;
}

.tab-text {
  font-size: 28rpx;
  margin-top: 2rpx;
  text-align: center;
}

.tab-badge {
  position: absolute;
  top: 10rpx;
  right: 20rpx;
  background-color: #ff4d4f;
  color: white;
  font-size: 20rpx;
  padding: 0 10rpx;
  border-radius: 10rpx;
  min-width: 24rpx;
  height: 24rpx;
  line-height: 24rpx;
  text-align: center;
}

.page-container {
  padding-bottom: 140rpx;
}
</style>
