<template>
  <view class="page-container">
    <!-- 顶部店铺信息 -->
    <view class="header-section">
      <view class="shop-icon" @click="changeLogo">
        <image v-if="shopInfo.logo" class="logo-image" :src="shopInfo.logo" mode="aspectFill"></image>
        <text v-else class="icon-text">🏪</text>
      </view>
      <view class="header-info">
        <text class="shop-name">{{ shopInfo.name }}</text>
        <text class="shop-hours">{{ shopInfo.openStatus }} · {{ shopInfo.hours }}</text>
      </view>
    </view>

    <!-- 店铺详情卡片 -->
    <view class="detail-card">
      <view class="shop-icon-large" @click="changeLogo">
        <image v-if="shopInfo.logo" class="logo-image-large" :src="shopInfo.logo" mode="aspectFill"></image>
        <text v-else class="icon-large-text">🏪</text>
        <view class="logo-edit-hint">点击更换</view>
      </view>
      <view class="shop-name-row">
        <view class="shop-name-large">{{ shopInfo.name }}</view>
        <view class="edit-name-btn" @click="editShopName">
          <text class="edit-name-text">✏️ 修改</text>
        </view>
      </view>
      <view class="status-badge" :class="shopInfo.status === 'open' ? 'status-open' : 'status-closed'">
        <text class="status-text">{{ getStatusText(shopInfo.status) }}</text>
      </view>

      <!-- 营业状态切换 -->
      <view class="status-section">
        <text class="section-label">营业状态</text>
        <view class="status-buttons">
          <view 
            class="status-btn" 
            :class="shopInfo.status === 'open' ? 'status-btn-active' : ''"
            @click="changeStatus('open')"
          >
            <text class="status-btn-text">营业中</text>
          </view>
          <view 
            class="status-btn" 
            :class="shopInfo.status === 'rest' ? 'status-btn-active' : ''"
            @click="changeStatus('rest')"
          >
            <text class="status-btn-text">休息中</text>
          </view>
          <view 
            class="status-btn" 
            :class="shopInfo.status === 'closed' ? 'status-btn-active' : ''"
            @click="changeStatus('closed')"
          >
            <text class="status-btn-text">手动打烊</text>
          </view>
        </view>
      </view>

      <!-- 联系电话 -->
      <view class="info-section">
        <text class="section-label">联系电话</text>
        <view class="info-row">
          <text class="info-text">{{ shopInfo.phone }}</text>
          <text class="edit-link" @click="editPhone">修改</text>
        </view>
      </view>

      <!-- 公告/简介 -->
      <view class="info-section">
        <text class="section-label">公告/简介</text>
        <view class="info-row">
          <text class="info-text description">{{ shopInfo.description }}</text>
          <text class="edit-link" @click="editDescription">编辑</text>
        </view>
      </view>
      
      <!-- 经营范围 -->
      <view class="info-section">
        <text class="section-label">经营范围</text>
        <view class="info-row">
          <text class="info-text business-scope">{{ shopInfo.businessScope || '暂未设置经营范围' }}</text>
          <text class="edit-link" @click="editBusinessScope">编辑</text>
        </view>
      </view>
      
      <!-- 店铺地址 -->
      <view class="info-section">
        <text class="section-label">店铺地址</text>
        <view class="info-row">
          <text class="info-text address">{{ getFullAddress() }}</text>
          <text class="edit-link" @click="editAddress">编辑</text>
        </view>
      </view>
    </view>

    <!-- 资质认证 -->
    <view class="cert-card">
      <text class="card-title">资质认证</text>
      <view class="cert-item" @click="viewCert('business')">
        <view class="cert-left">
          <view class="cert-icon" v-if="!certImages.business">
            <text class="cert-icon-text">📄</text>
          </view>
          <image v-else class="cert-image" :src="certImages.business" mode="aspectFill"></image>
          <view class="cert-info">
            <text class="cert-name">营业执照</text>
            <text class="cert-status" :class="certImages.business ? 'cert-verified' : 'cert-unverified'">
              {{ certImages.business ? '已认证' : '未上传' }}
            </text>
          </view>
        </view>
        <text class="cert-action">{{ certImages.business ? '查看' : '上传' }}</text>
      </view>
      <view class="cert-item" @click="viewCert('food')">
        <view class="cert-left">
          <view class="cert-icon" v-if="!certImages.food">
            <text class="cert-icon-text">📄</text>
          </view>
          <image v-else class="cert-image" :src="certImages.food" mode="aspectFill"></image>
          <view class="cert-info">
            <text class="cert-name">食品经营许可证</text>
            <text class="cert-status" :class="certImages.food ? 'cert-verified' : 'cert-unverified'">
              {{ certImages.food ? '已认证' : '未上传' }}
            </text>
          </view>
        </view>
        <text class="cert-action">{{ certImages.food ? '查看' : '上传' }}</text>
      </view>
    </view>

    <!-- 营业时间设置 -->
    <view class="time-card">
      <text class="card-title">营业时间</text>
      <view class="time-row">
        <text class="time-label">开始时间</text>
        <picker mode="time" :value="businessHours.startTime" @change="onStartTimeChange">
          <view class="time-picker">
            <text class="time-text">{{ businessHours.startTime }}</text>
            <text class="picker-icon">🕐</text>
          </view>
        </picker>
      </view>
      <view class="time-row">
        <text class="time-label">结束时间</text>
        <picker mode="time" :value="businessHours.endTime" @change="onEndTimeChange">
          <view class="time-picker">
            <text class="time-text">{{ businessHours.endTime }}</text>
            <text class="picker-icon">🕐</text>
          </view>
        </picker>
      </view>
      <view class="delivery-range">
        <text class="range-label">配送范围设置</text>
        <view class="range-info">
          <text class="range-text">{{ deliverySettings.range }}公里范围内</text>
          <text class="edit-link" @click="editRange">设置</text>
        </view>
      </view>
    </view>

    <!-- 配送设置 -->
    <view class="delivery-card">
      <text class="card-title">配送设置</text>
      <view class="delivery-row">
        <text class="delivery-label">起送价</text>
        <view class="delivery-value" @click="editMinPrice">
          <text class="price-text">¥{{ deliverySettings.minPrice }}</text>
        </view>
      </view>
      <view class="delivery-row">
        <text class="delivery-label">配送费</text>
        <view class="delivery-value" @click="editDeliveryFee">
          <text class="price-text">¥{{ deliverySettings.fee }}</text>
        </view>
      </view>
      <view class="modify-btn" @click="modifyDeliverySettings">
        <text class="modify-text">保存配送设置</text>
      </view>
    </view>
    
    <!-- 自定义底部导航栏 -->
    <view class="custom-tab-bar">
      <view class="tab-item" @click="switchTab('index')">
        <view class="tab-icon">🏠</view>
        <view class="tab-text">首页</view>
      </view>
      <view class="tab-item" @click="switchTab('list')">
        <view class="tab-icon">📋</view>
        <view class="tab-text">订单</view>
      </view>
      <view class="tab-item" @click="switchTab('message')">
        <view class="tab-icon">💬</view>
        <view class="tab-text">消息</view>
      </view>
      <view class="tab-item active">
        <view class="tab-icon">👤</view>
        <view class="tab-text">我的</view>
      </view>
    </view>

    <!-- 地址编辑弹窗 -->
    <view class="edit-modal" v-if="showAddressModal" @click.self="closeAddressModal">
      <view class="edit-modal-content address-modal-content" @click.stop>
        <view class="edit-modal-header">
          <text class="edit-modal-title">编辑店铺地址</text>
          <text class="edit-modal-close" @click="closeAddressModal">✕</text>
        </view>
        <view class="edit-modal-body address-modal-body">
          <view class="address-form">
            <view class="form-item">
              <text class="form-label">详细地址</text>
              <textarea 
                class="form-textarea" 
                v-model="addressInfo.detailAddress"
                placeholder="请输入完整地址，如：贵州省贵阳市花溪区贵州大学北区食堂三楼奶茶店"
                maxlength="200"
              />
            </view>
          </view>
        </view>
        <view class="edit-modal-footer">
          <view class="modal-btn cancel-btn" @click="closeAddressModal">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm-btn" @click="confirmAddressEdit">
            <text class="modal-btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 自定义编辑弹窗 -->
    <view class="edit-modal" v-if="showEditModal" @click="closeEditModal">
      <view class="edit-modal-content" @click.stop>
        <view class="edit-modal-header">
          <text class="edit-modal-title">{{ editModalTitle }}</text>
          <text class="edit-modal-close" @click="closeEditModal">✕</text>
        </view>
        <view class="edit-modal-body">
          <textarea 
            class="edit-textarea"
            :placeholder="editModalPlaceholder"
            :value="editModalValue"
            @input="onEditInput"
            :maxlength="200"
            auto-height
          />
          <view class="char-count">{{ editModalValue.length }}/200</view>
        </view>
        <view class="edit-modal-footer">
          <view class="modal-btn cancel-btn" @click="closeEditModal">
            <text class="modal-btn-text">取消</text>
          </view>
          <view class="modal-btn confirm-btn" @click="confirmEdit">
            <text class="modal-btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getMerchantBaseInfo,
  updateMerchantBase,
  checkMerchantName,
  getMerchantAddress,
  addMerchantAddress,
  updateMerchantAddress,
  getDeliverySettings,
  updateDeliverySettings,
  uploadCertificate,
  getCertificates,
  deleteCertificate
} from '@/utils/merchantApi.js';

export default {
  name: 'MinePage',
  data() {
    return {
      merchantBaseId: null, // 商家ID（从后端获取）
      shopInfo: {
        name: '美味餐厅',
        openStatus: '营业中',
        hours: '08:00-22:00',
        status: 'open', // open, rest, closed
        phone: '138-0013-8000',
        description: '本店提供美味健康的快餐食品，用心做好每一份餐品。',
        businessScope: '餐饮, 简餐, 饮料', // 经营范围
        logo: '' // 店铺Logo URL
      },
      businessHours: {
        startTime: '08:00',
        endTime: '22:00'
      },
      deliverySettings: {
        range: 3,
        minPrice: 20,
        fee: 5
      },
      // 地址信息
      addressInfo: {
        merchantBaseId: null,
        merchantAddressId: null,
        detailAddress: ''
      },
      hasAddress: false, // 标记是否已有地址
      showAddressModal: false, // 地址编辑弹窗
      showEditModal: false,
      editModalTitle: '',
      editModalPlaceholder: '',
      editModalValue: '',
      editModalType: '', // 'description'、'phone'、'businessScope'
      certImages: {
        business: '', // 营业执照图片
        food: '' // 食品经营许可证图片
      },
      isLoading: false // 加载状态
    }
  },
  onLoad() {
    // 页面加载时从后端获取数据
    this.loadAllData();
  },
  onShow() {
    // 每次显示页面时刷新数据
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
        // 并行请求所有数据
        const [baseInfoRes, addressRes, deliveryRes, certRes] = await Promise.all([
          getMerchantBaseInfo(),
          getMerchantAddress().catch(() => ({ data: { code: 404, data: null } })),
          getDeliverySettings().catch(() => ({ data: { data: null } })),
          getCertificates().catch(() => ({ data: { data: [] } }))
        ]);
        
        // 处理基础信息
        if (baseInfoRes.data && baseInfoRes.data.code === 200) {
          const data = baseInfoRes.data.data;
          
          // 如果后端没有返回 merchantBaseId，从登录缓存中获取
          if (!data.merchantBaseId) {
            const merchantInfo = uni.getStorageSync('merchantInfo') || {};
            this.merchantBaseId = String(merchantInfo.merchantBaseId || merchantInfo.id || '');
            console.log('⚠️ 后端未返回 merchantBaseId，从缓存获取:', this.merchantBaseId);
          } else {
            this.merchantBaseId = String(data.merchantBaseId || '');
          }
          
          
          // 映射数据到前端格式
          this.shopInfo.name = data.merchantName || '美味餐厅';
          
          // 优先使用后端返回的值，如果为空则使用本地缓存
          const savedPhone = uni.getStorageSync('shopInfo')?.phone;
          this.shopInfo.phone = data.merchantPhone || data.phone || savedPhone || '';
          
          this.shopInfo.description = data.description || '';
          this.shopInfo.businessScope = data.businessScope || '';
          this.shopInfo.logo = data.logo || '';
          
          // 营业状态映射：1-营业中, 0-休息中, 2-打烊
          const statusMap = { 1: 'open', 0: 'rest', 2: 'closed' };
          this.shopInfo.status = statusMap[data.businessStatus] || 'open';
          this.shopInfo.openStatus = this.getStatusText(this.shopInfo.status);
          
          // 营业时间
          if (data.businessHours) {
            this.shopInfo.hours = data.businessHours;
            const times = data.businessHours.split('-');
            if (times.length === 2) {
              this.businessHours.startTime = times[0];
              this.businessHours.endTime = times[1];
            }
          }
          
          // 配送设置
          this.deliverySettings = {
            range: data.deliveryRange || 3,
            minPrice: data.deliveryMinPrice || 20,
            fee: data.deliveryFee || 5
          };
          
          // 保存到本地缓存
          this.saveToLocal();
          this.saveDeliverySettings();
        }
        
        // 处理地址信息
        if (addressRes.data && addressRes.data.code === 200 && addressRes.data.data) {
          const addr = addressRes.data.data;
          this.addressInfo = {
            merchantBaseId: addr.merchantBaseId || this.merchantBaseId,
            merchantAddressId: addr.merchantAddressId || null,
            detailAddress: addr.detailAddress || ''
          };
          this.hasAddress = true; // 标记已有地址
          this.saveAddressToLocal();
        } else {
          // 如果后端没有地址数据，尝试从本地缓存加载
          this.hasAddress = false; // 标记没有地址
          this.loadAddressFromLocal();
        }
        
        // 处理资质证书
        if (certRes.data && certRes.data.data) {
          const certs = certRes.data.data;
          certs.forEach(cert => {
            if (cert.type === 'business') {
              this.certImages.business = cert.imageUrl || '';
            } else if (cert.type === 'food') {
              this.certImages.food = cert.imageUrl || '';
            }
          });
        }
        
      } catch (error) {
        console.error('加载数据失败:', error);
        
        // 失败时从本地缓存加载
        this.loadFromLocal();
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * 从本地缓存加载（兜底方案）
     */
    loadFromLocal() {
      const savedInfo = uni.getStorageSync('shopInfo');
      if (savedInfo) {
        this.shopInfo = { ...this.shopInfo, ...savedInfo };
      }
      const savedHours = uni.getStorageSync('businessHours');
      if (savedHours) {
        this.businessHours = savedHours;
      }
      const savedCertImages = uni.getStorageSync('certImages');
      if (savedCertImages) {
        this.certImages = savedCertImages;
      }
      // 加载配送设置
      this.loadDeliverySettings();
    },
    
    /**
     * 保存到本地缓存
     */
    saveToLocal() {
      uni.setStorageSync('shopInfo', {
        name: this.shopInfo.name,
        openStatus: this.shopInfo.openStatus,
        hours: this.shopInfo.hours,
        status: this.shopInfo.status,
        phone: this.shopInfo.phone,
        description: this.shopInfo.description,
        businessScope: this.shopInfo.businessScope, // 经营范围
        logo: this.shopInfo.logo // 🔧 保存Logo
      });
      uni.setStorageSync('businessHours', this.businessHours);
      uni.setStorageSync('certImages', this.certImages);
    },
    
    /**
     * 保存基础信息到后端
     */
    async saveShopInfoToBackend() {
      if (!this.merchantBaseId) {
        uni.showToast({
          title: '商家ID未获取',
          icon: 'none'
        });
        return false;
      }
      
      try {
        // 状态映射：open-1, rest-0, closed-2
        const statusMap = { 'open': 1, 'rest': 0, 'closed': 2 };
        
        const data = {
          merchantBaseId: String(this.merchantBaseId || ''),
          merchantName: this.shopInfo.name,
          merchantPhone: this.shopInfo.phone,
          businessStatus: statusMap[this.shopInfo.status],
          businessHours: this.shopInfo.hours,
          description: this.shopInfo.description,
          businessScope: this.shopInfo.businessScope,
          logo: this.shopInfo.logo,
          deliveryRange: this.deliverySettings.range,
          deliveryMinPrice: this.deliverySettings.minPrice,
          deliveryFee: this.deliverySettings.fee
        };
        
        
        const res = await updateMerchantBase(data);
        
        if (res.data && res.data.code === 200) {
          // 保存到本地缓存
          this.saveToLocal();
          return true;
        } else {
          // 若后端返回名称冲突之类提示，前端展示
          const msg = res.data?.msg || res.data?.message || '';
          if (/已存在|重复|冲突/.test(msg)) {
            uni.showToast({ title: '店铺名重复', icon: 'none' });
            return false;
          }
          throw new Error(msg || '保存失败');
        }
      } catch (error) {
        console.error('保存失败:', error);
        // 统一解析后端唯一约束报错，输出友好提示
        const rawMsg = String(error?.message || '');
        const isDuplicate = /duplicate|unique|uk_merchant_name|Duplicate entry|UNIQUE/i.test(rawMsg);
        const toastMsg = isDuplicate ? '店铺名重复' : (error.message || '保存失败');
        uni.showToast({ title: toastMsg, icon: 'none' });
        return false;
      }
    },
    
    // ==================== 原有方法（已修改）====================
    
    loadShopInfo() {
      // 保留此方法用于兼容性，实际调用 loadAllData
      this.loadAllData();
    },
    
    saveShopInfo() {
      // 保留此方法用于兼容性，实际调用 saveShopInfoToBackend
      return this.saveShopInfoToBackend();
    },
    
    saveCertImages() {
      // 保存到本地缓存
      uni.setStorageSync('certImages', this.certImages);
    },
    getStatusText(status) {
      const statusMap = {
        open: '营业中',
        rest: '休息中',
        closed: '手动打烊'
      };
      return statusMap[status] || '营业中';
    },
    async editShopName() {
      uni.showModal({
        title: '修改店铺名称',
        editable: true,
        placeholderText: '请输入新的店铺名称',
        content: this.shopInfo.name,
        success: async (res) => {
          if (res.confirm && res.content) {
            const newName = res.content.trim();
            if (!newName) {
              uni.showToast({ title: '店铺名称不能为空', icon: 'none' });
              return;
            }
            if (newName === this.shopInfo.name) {
              return; // 未变化
            }
            const oldName = this.shopInfo.name;
            try {
              // 先调用后端校验是否重名
              const checkRes = await checkMerchantName(newName).catch(() => ({ data: { code: 500 } }));
              if (checkRes.data && checkRes.data.code === 200) {
                // 兼容后端返回 {exists:true} 或 {data:{exists:true}}
                const exists = checkRes.data.exists === true || checkRes.data.data === true || checkRes.data.data?.exists === true;
                if (exists) {
                  uni.showToast({ title: '店铺名重复', icon: 'none' });
                  return;
                }
              }
              // 未重复则保存
              this.shopInfo.name = newName;
              const success = await this.saveShopInfo();
              if (success) {
                uni.showToast({ title: '修改成功', icon: 'success' });
              } else {
                // 保存失败则回退显示
                this.shopInfo.name = oldName;
              }
            } catch (e) {
              // 若校验接口不可用，降级到保存时由后端校验
              this.shopInfo.name = newName;
              const success = await this.saveShopInfo();
              if (success) {
                uni.showToast({ title: '修改成功', icon: 'success' });
              } else {
                // 保存失败（可能重名），回退原名
                this.shopInfo.name = oldName;
              }
            }
          }
        }
      });
    },
    async changeStatus(status) {
      this.shopInfo.status = status;
      this.shopInfo.openStatus = this.getStatusText(status);
      const success = await this.saveShopInfo();
      if (success) {
        uni.showToast({
          title: `已切换到${this.getStatusText(status)}`,
          icon: 'success'
        });
      }
    },
    editPhone() {
      this.editModalTitle = '修改联系电话';
      this.editModalPlaceholder = '请输入新的联系电话';
      this.editModalValue = this.shopInfo.phone;
      this.editModalType = 'phone';
      this.showEditModal = true;
    },
    editDescription() {
      this.editModalTitle = '编辑公告/简介';
      this.editModalPlaceholder = '请输入店铺简介';
      this.editModalValue = this.shopInfo.description;
      this.editModalType = 'description';
      this.showEditModal = true;
    },
    editBusinessScope() {
      this.editModalTitle = '编辑经营范围';
      this.editModalPlaceholder = '请输入经营范围，如：餐饮, 简餐, 饮料';
      this.editModalValue = this.shopInfo.businessScope;
      this.editModalType = 'businessScope';
      this.showEditModal = true;
    },
    
    // ==================== 地址管理方法 ====================
    
    /**
     * 打开地址编辑弹窗
     */
    editAddress() {
      this.showAddressModal = true;
    },
    
    /**
     * 关闭地址编辑弹窗
     */
    closeAddressModal() {
      this.showAddressModal = false;
    },
    
    /**
     * 确认保存地址
     */
    async confirmAddressEdit() {
      // 验证必填字段
      if (!this.addressInfo.detailAddress || !this.addressInfo.detailAddress.trim()) {
        uni.showToast({
          title: '请填写详细地址',
          icon: 'none'
        });
        return;
      }
      
      uni.showLoading({
        title: '保存中...'
      });
      
      try {
        // 准备保存数据
        const saveData = {
          merchantBaseId: this.merchantBaseId,
          detailAddress: this.addressInfo.detailAddress.trim()
        };
        
        // 如果是更新操作，需要传递merchantAddressId
        if (this.hasAddress && this.addressInfo.merchantAddressId) {
          saveData.merchantAddressId = this.addressInfo.merchantAddressId;
        }
        
        console.log('💾 保存地址数据:', {
          data: saveData,
          hasAddress: this.hasAddress,
          method: this.hasAddress ? 'PUT (更新)' : 'POST (新增)'
        });
        
        let res;
        if (this.hasAddress) {
          // 已有地址，使用PUT更新
          res = await updateMerchantAddress(saveData);
        } else {
          // 没有地址，使用POST新增
          res = await addMerchantAddress(saveData);
        }
        
        console.log('✅ 保存地址响应:', res.data);
        
        if (res.data && res.data.code === 200) {
          // 如果是新增，保存返回的ID
          if (!this.hasAddress && res.data.data) {
            this.addressInfo.merchantAddressId = res.data.data.merchantAddressId || res.data.data;
          }
          
          // 标记已有地址
          this.hasAddress = true;
          
          // 保存到本地缓存
          this.saveAddressToLocal();
          
          uni.hideLoading();
          this.closeAddressModal();
          
          uni.showToast({
            title: '地址保存成功',
            icon: 'success'
          });
        } else {
          throw new Error(res.data?.msg || '保存失败');
        }
      } catch (error) {
        console.error('保存地址失败:', error);
        uni.hideLoading();
        
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'none',
          duration: 3000
        });
      }
    },
    
    /**
     * 获取完整地址字符串
     */
    getFullAddress() {
      if (!this.addressInfo.detailAddress) {
        return '暂未设置店铺地址';
      }
      return this.addressInfo.detailAddress;
    },
    
    /**
     * 保存地址到本地缓存
     */
    saveAddressToLocal() {
      uni.setStorageSync('addressInfo', this.addressInfo);
    },
    
    /**
     * 从本地缓存加载地址
     */
    loadAddressFromLocal() {
      const saved = uni.getStorageSync('addressInfo');
      if (saved) {
        this.addressInfo = saved;
      }
    },
    
    onEditInput(e) {
      this.editModalValue = e.detail.value;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editModalValue = '';
      this.editModalType = '';
    },
    async confirmEdit() {
      if (!this.editModalValue.trim()) {
        uni.showToast({
          title: '内容不能为空',
          icon: 'none'
        });
        return;
      }
      
      if (this.editModalType === 'description') {
        this.shopInfo.description = this.editModalValue;
      } else if (this.editModalType === 'phone') {
        this.shopInfo.phone = this.editModalValue;
      } else if (this.editModalType === 'businessScope') {
        this.shopInfo.businessScope = this.editModalValue;
      }
      
      // 显示加载提示
      uni.showLoading({
        title: '保存中...'
      });
      
      const success = await this.saveShopInfo();
      
      uni.hideLoading();
      this.closeEditModal();
      
      if (success) {
        uni.showToast({
          title: '修改成功',
          icon: 'success'
        });
      }
    },
    viewCert(type) {
      const certName = type === 'business' ? '营业执照' : '食品经营许可证';
      const hasImage = this.certImages[type];
      
      if (hasImage) {
        // 已有图片，显示操作选项
        uni.showActionSheet({
          itemList: ['查看图片', '更新图片', '删除图片'],
          success: (res) => {
            if (res.tapIndex === 0) {
              // 查看图片
              uni.previewImage({
                urls: [this.certImages[type]],
                current: 0
              });
            } else if (res.tapIndex === 1) {
              // 更新图片
              this.uploadCertImage(type, certName);
            } else if (res.tapIndex === 2) {
              // 删除图片
              uni.showModal({
                title: '确认删除',
                content: `确定要删除${certName}吗？`,
                success: async (modalRes) => {
                  if (modalRes.confirm) {
                    try {
                      const deleteRes = await deleteCertificate(type);
                      if (deleteRes.data && deleteRes.data.code === 200) {
                        this.certImages[type] = '';
                        this.saveCertImages();
                        uni.showToast({
                          title: '删除成功',
                          icon: 'success'
                        });
                      } else {
                        throw new Error(deleteRes.data.msg || '删除失败');
                      }
                    } catch (error) {
                      console.error('删除失败:', error);
                      uni.showToast({
                        title: error.message || '删除失败',
                        icon: 'none'
                      });
                    }
                  }
                }
              });
            }
          }
        });
      } else {
        // 没有图片，直接上传
        this.uploadCertImage(type, certName);
      }
    },
    async uploadCertImage(type, certName) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          
          // 显示加载提示
          uni.showLoading({
            title: '上传中...'
          });
          
          try {
            // 调用上传接口
            const uploadRes = await uploadCertificate(type, tempFilePath);
            
            if (uploadRes.code === 200) {
              // 上传成功，更新图片地址
              this.certImages[type] = uploadRes.data.imageUrl || tempFilePath;
              this.saveCertImages();
              
              uni.hideLoading();
              uni.showToast({
                title: `${certName}上传成功`,
                icon: 'success'
              });
            } else {
              throw new Error(uploadRes.msg || '上传失败');
            }
          } catch (error) {
            console.error('上传失败:', error);
            uni.hideLoading();
            uni.showToast({
              title: error.message || '上传失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    onStartTimeChange(e) {
      this.businessHours.startTime = e.detail.value;
      this.updateBusinessHours();
    },
    onEndTimeChange(e) {
      this.businessHours.endTime = e.detail.value;
      this.updateBusinessHours();
    },
    async updateBusinessHours() {
      this.shopInfo.hours = `${this.businessHours.startTime}-${this.businessHours.endTime}`;
      const success = await this.saveShopInfo();
      if (success) {
        uni.showToast({
          title: '营业时间已更新',
          icon: 'success'
        });
      }
    },
    async editRange() {
      uni.showModal({
        title: '设置配送范围',
        editable: true,
        placeholderText: '请输入配送范围(公里)',
        content: this.deliverySettings.range.toString(),
        success: async (res) => {
          if (res.confirm && res.content) {
            const range = parseInt(res.content);
            if (!isNaN(range) && range > 0) {
              this.deliverySettings.range = range;
              
              // 🔧 保存到后端数据库
              const success = await this.saveShopInfo();
              if (success) {
                uni.showToast({
                  title: '设置成功',
                  icon: 'success'
                });
              }
            } else {
              uni.showToast({
                title: '请输入有效的数字',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    async editMinPrice() {
      uni.showModal({
        title: '设置起送价',
        editable: true,
        placeholderText: '请输入起送价',
        content: this.deliverySettings.minPrice.toString(),
        success: async (res) => {
          if (res.confirm && res.content) {
            const price = parseFloat(res.content);
            if (!isNaN(price) && price >= 0) {
              this.deliverySettings.minPrice = price;
              
              // 🔧 保存到后端数据库
              const success = await this.saveShopInfo();
              if (success) {
                uni.showToast({
                  title: '设置成功',
                  icon: 'success'
                });
              }
            } else {
              uni.showToast({
                title: '请输入有效的金额',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    async editDeliveryFee() {
      uni.showModal({
        title: '设置配送费',
        editable: true,
        placeholderText: '请输入配送费',
        content: this.deliverySettings.fee.toString(),
        success: async (res) => {
          if (res.confirm && res.content) {
            const fee = parseFloat(res.content);
            if (!isNaN(fee) && fee >= 0) {
              this.deliverySettings.fee = fee;
              
              // 🔧 保存到后端数据库
              const success = await this.saveShopInfo();
              if (success) {
                uni.showToast({
                  title: '设置成功',
                  icon: 'success'
                });
              }
            } else {
              uni.showToast({
                title: '请输入有效的金额',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    async modifyDeliverySettings() {
      // 🔧 通过基础信息接口保存配送设置到后端数据库
      console.log('💾 保存配送设置到后端数据库:', this.deliverySettings);
      
      try {
        // 调用 saveShopInfo，会将配送设置一起保存到后端
        const success = await this.saveShopInfo();
        
        if (success) {
          uni.showToast({
            title: '配送设置已保存',
            icon: 'success',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('保存配送设置失败:', error);
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'none'
        });
      }
    },
    
    /**
     * 保存配送设置到本地缓存
     */
    saveDeliverySettings() {
      uni.setStorageSync('deliverySettings', this.deliverySettings);
      console.log('✅ 配送设置已保存到本地缓存');
    },
    
    /**
     * 从本地缓存加载配送设置
     */
    loadDeliverySettings() {
      const saved = uni.getStorageSync('deliverySettings');
      if (saved) {
        this.deliverySettings = saved;
        console.log('✅ 从本地缓存加载配送设置:', saved);
      }
    },
    /**
     * 更换Logo
     */
    changeLogo() {
      uni.showActionSheet({
        itemList: this.shopInfo.logo ? ['查看Logo', '更换Logo', '删除Logo'] : ['上传Logo'],
        success: (res) => {
          if (this.shopInfo.logo) {
            // 已有Logo
            if (res.tapIndex === 0) {
              // 查看Logo
              uni.previewImage({
                urls: [this.shopInfo.logo],
                current: 0
              });
            } else if (res.tapIndex === 1) {
              // 更换Logo
              this.uploadLogo();
            } else if (res.tapIndex === 2) {
              // 删除Logo
              this.deleteLogo();
            }
          } else {
            // 没有Logo
            if (res.tapIndex === 0) {
              // 上传Logo
              this.uploadLogo();
            }
          }
        }
      });
    },
    
    /**
     * 上传Logo
     */
    uploadLogo() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          
          // 显示加载提示
          uni.showLoading({
            title: '上传中...'
          });
          
          // 🔧 上传到服务器（通用文件上传接口）
          uni.uploadFile({
            url: 'http://localhost:8080/common/upload', // 通用文件上传接口
            filePath: tempFilePath,
            name: 'file',
            header: {
              'Authorization': `Bearer ${uni.getStorageSync('token')}`
            },
            success: (uploadRes) => {
              try {
                const data = JSON.parse(uploadRes.data);
                
                console.log('🔍 上传响应数据:', data);
                
                if (data.code === 200) {
                  // 上传成功，获取图片URL - 添加安全检查
                  let logoUrl = '';
                  
                  if (data.data && typeof data.data === 'object') {
                    logoUrl = data.data.url || data.data.imageUrl || data.data.fileName;
                  } else if (data.url) {
                    logoUrl = data.url;
                  } else if (data.fileName) {
                    logoUrl = data.fileName;
                  } else if (typeof data.data === 'string') {
                    logoUrl = data.data;
                  }
                  
                  console.log('🖼️ Logo上传成功，URL:', logoUrl);
                  
                  if (logoUrl) {
                    // 更新Logo URL
                    this.shopInfo.logo = logoUrl;
                  } else {
                    throw new Error('无法获取上传文件的URL');
                  }
                  
                  // 保存到后端
                  this.saveShopInfo().then(success => {
                    uni.hideLoading();
                    
                    if (success) {
                      uni.showToast({
                        title: 'Logo更换成功',
                        icon: 'success'
                      });
                    } else {
                      // 保存失败，恢复原logo
                      this.shopInfo.logo = '';
                      uni.showToast({
                        title: '保存失败',
                        icon: 'none'
                      });
                    }
                  });
                } else {
                  throw new Error(data.msg || '上传失败');
                }
              } catch (error) {
                console.error('上传失败:', error);
                uni.hideLoading();
                uni.showToast({
                  title: error.message || '上传失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              console.error('上传失败:', err);
              uni.hideLoading();
              uni.showToast({
                title: '上传失败',
                icon: 'none'
              });
            }
          });
        },
        fail: () => {
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    },
    
    /**
     * 删除Logo
     */
    async deleteLogo() {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除Logo吗？',
        success: async (res) => {
          if (res.confirm) {
            const oldLogo = this.shopInfo.logo;
            this.shopInfo.logo = '';
            
            const success = await this.saveShopInfo();
            if (success) {
              uni.showToast({
                title: 'Logo已删除',
                icon: 'success'
              });
            } else {
              // 保存失败，恢复原logo
              this.shopInfo.logo = oldLogo;
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    switchTab(tab) {
      const urlMap = {
        index: '/pages/index/index',
        list: '/pages/list/list',
        message: '/pages/message/message'
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
.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 100rpx;
}

/* 顶部店铺信息 */
.header-section {
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  padding: 30rpx;
  display: flex;
  align-items: center;
}

.shop-icon {
  width: 80rpx;
  height: 80rpx;
  background: white;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.shop-icon:active {
  opacity: 0.8;
}

.logo-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  object-fit: cover;
}

.icon-text {
  font-size: 40rpx;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shop-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.shop-hours {
  font-size: 24rpx;
  color: #666;
}

/* 店铺详情卡片 */
.detail-card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.shop-icon-large {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.shop-icon-large:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.logo-image-large {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
  object-fit: cover;
}

.logo-edit-hint {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 20rpx;
  text-align: center;
  padding: 4rpx 0;
  line-height: 1.2;
}

.icon-large-text {
  font-size: 60rpx;
}

.shop-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  gap: 20rpx;
}

.shop-name-large {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.edit-name-btn {
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  border-radius: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(74, 144, 226, 0.3);
}

.edit-name-text {
  font-size: 22rpx;
  color: white;
  font-weight: 500;
}

.status-badge {
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  margin: 0 auto 40rpx;
  width: fit-content;
}

.status-open {
  background: #d4edda;
}

.status-closed {
  background: #f8d7da;
}

.status-text {
  font-size: 24rpx;
  color: #155724;
}

.status-closed .status-text {
  color: #721c24;
}

/* 营业状态切换 */
.status-section {
  margin-bottom: 40rpx;
}

.section-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 20rpx;
}

.status-buttons {
  display: flex;
  gap: 20rpx;
}

.status-btn {
  flex: 1;
  padding: 20rpx;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  text-align: center;
  background: white;
}

.status-btn-active {
  border-color: #4A90E2;
  background: #EBF4FF;
}

.status-btn-text {
  font-size: 26rpx;
  color: #666;
}

.status-btn-active .status-btn-text {
  color: #4A90E2;
  font-weight: bold;
}

/* 信息行 */
.info-section {
  margin-bottom: 40rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.info-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.description {
  line-height: 1.6;
  color: #666;
}

.business-scope {
  line-height: 1.6;
  color: #666;
}

.address {
  line-height: 1.6;
  color: #666;
}

.edit-link {
  font-size: 26rpx;
  color: #4A90E2;
  margin-left: 20rpx;
}

/* 资质认证卡片 */
.cert-card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.cert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.cert-item:last-child {
  border-bottom: none;
}

.cert-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.cert-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #A8D8EA, #B3E5F0);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.cert-icon-text {
  font-size: 36rpx;
}

.cert-image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  object-fit: cover;
}

.cert-info {
  display: flex;
  flex-direction: column;
}

.cert-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.cert-status {
  font-size: 24rpx;
}

.cert-verified {
  color: #52c41a;
}

.cert-unverified {
  color: #999;
}

.cert-action {
  font-size: 26rpx;
  color: #4A90E2;
}

/* 营业时间卡片 */
.time-card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.time-label {
  font-size: 28rpx;
  color: #333;
}

.time-picker {
  display: flex;
  align-items: center;
}

.time-text {
  font-size: 28rpx;
  color: #333;
  margin-right: 12rpx;
}

.picker-icon {
  font-size: 32rpx;
}

.delivery-range {
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.range-label {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 20rpx;
}

.range-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.range-text {
  font-size: 26rpx;
  color: #666;
}

/* 配送设置卡片 */
.delivery-card {
  background: white;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.delivery-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.delivery-label {
  font-size: 28rpx;
  color: #333;
}

.delivery-value {
  background: #f5f5f5;
  padding: 12rpx 40rpx;
  border-radius: 8rpx;
}

.price-text {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.modify-btn {
  margin-top: 30rpx;
  padding: 30rpx;
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  border-radius: 12rpx;
  text-align: center;
}

.modify-text {
  font-size: 30rpx;
  color: white;
  font-weight: bold;
}

/* 自定义底部导航栏 */
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
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
  color: #999999;
}

.tab-item.active {
  color: #4A90E2;
}

.tab-icon {
  font-size: 44rpx;
  margin-bottom: 4rpx;
}

.tab-text {
  font-size: 20rpx;
}

/* 自定义编辑弹窗 */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.edit-modal-content {
  width: 85%;
  max-width: 600rpx;
  background: white;
  border-radius: 20rpx;
  overflow: visible;
}

.edit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: #f8f9fa;
  border-radius: 20rpx 20rpx 0 0;
}

.edit-modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.edit-modal-close {
  font-size: 40rpx;
  color: #999;
  width: 50rpx;
  height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-modal-body {
  padding: 30rpx;
  min-height: 300rpx;
}

.edit-textarea {
  width: 100%;
  min-height: 280rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  box-sizing: border-box;
  border: 1rpx solid #e0e0e0;
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 16rpx;
}

.edit-modal-footer {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
  border-radius: 0 0 20rpx 20rpx;
  overflow: hidden;
}

.modal-btn {
  flex: 1;
  padding: 30rpx 0;
  text-align: center;
  font-size: 30rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #4A90E2, #5BA3F5);
  color: white;
  font-weight: bold;
}

.modal-btn-text {
  font-size: 30rpx;
}

/* 地址编辑弹窗样式 */
.address-modal-content {
  max-width: 680rpx;
  width: 90%;
}

.address-modal-body {
  max-height: 70vh;
  overflow-y: auto;
  pointer-events: auto;
}

.address-form {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  pointer-events: auto;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  pointer-events: auto;
}

.form-label {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 32rpx;
  color: #333;
  border: 1rpx solid #e0e0e0;
  box-sizing: border-box;
  pointer-events: auto;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  font-size: 32rpx;
  line-height: 1.6;
  color: #333;
  border: 1rpx solid #e0e0e0;
  box-sizing: border-box;
  pointer-events: auto;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #4A90E2;
  background: #fff;
}

.form-picker {
  width: 100%;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx solid #e0e0e0;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-picker.disabled {
  background: #f0f0f0;
  opacity: 0.6;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.picker-text.placeholder {
  color: #999;
}

.picker-arrow {
  font-size: 20rpx;
  color: #999;
  margin-left: 12rpx;
}
</style>
