<template>
	<view class="container">
		<!-- 顶部标题栏 -->
		<view class="header">
			<text class="header-title">配送路线</text>
			<view class="order-count">
				<text class="count-text">{{ activeOrders.length }}个任务</text>
			</view>
		</view>

		<!-- 地图容器 -->
		<view class="map-container">
			<!-- #ifndef H5 -->
			<map 
				id="deliveryMap"
				:latitude="mapCenter.latitude"
				:longitude="mapCenter.longitude"
				:scale="15"
				:markers="markers"
				:polyline="polyline"
				:show-location="true"
				@markertap="onMarkerTap"
				@updated="onMapUpdated"
				@error="onMapError"
				class="map"
			>
			</map>
			<!-- #endif -->
			
			<!-- #ifdef H5 -->
			<view id="amapContainer" class="amap-container"></view>
			<!-- #endif -->
			
			<!-- 地图控制按钮 -->
			<view class="map-controls">
				<view class="control-btn" @tap="centerToLocation">
					<text class="control-icon">📍</text>
				</view>
				<view class="control-btn" @tap="refreshRoute">
					<text class="control-icon">🔄</text>
				</view>
			</view>
		</view>

		<!-- 订单列表（可滑动） -->
		<view class="orders-panel" :class="{ expanded: isPanelExpanded }">
			<view class="panel-handle" @tap="togglePanel">
				<view class="handle-bar"></view>
				<text class="panel-title">配送列表</text>
			</view>
			
			<scroll-view class="orders-scroll" scroll-y="true">
				<!-- 取货地列表 -->
				<view class="group-section">
					<text class="group-title">取货地</text>
					<view 
						class="order-item" 
						v-for="(order, index) in pickupOrders" 
						:key="order.id"
						@tap="selectOrder(order)"
						:class="{ active: selectedOrderId === order.id }"
					>
						<!-- 左侧序号徽章 -->
						<view class="order-left">
							<view class="order-badge" :style="{ backgroundColor: order.color }">
								<text class="badge-text">{{ index + 1 }}</text>
							</view>
							<view class="order-line" :style="{ backgroundColor: order.color }" v-if="index < pickupOrders.length - 1"></view>
						</view>
						
						<!-- 中间内容区 -->
						<view class="order-content">
							<view class="order-header">
								<view class="order-type-wrapper">
									<text class="order-type-icon">📦</text>
									<text class="order-type-text">取货</text>
								</view>
								<view class="order-tag" :style="{ backgroundColor: order.color }">
									<text class="tag-text">{{ order.statusText }}</text>
								</view>
							</view>
							
					<view class="order-address-row">
						<text class="address-icon">🏠</text>
						<text class="order-address">{{ order.address }}</text>
					</view>
					<view class="order-address-row">
						<text class="address-icon">👤</text>
						<text class="order-address">{{ order.name ? maskName(order.name) : '—' }}</text>
					</view>
							
							<view class="order-info-row">
								<view class="info-item time">
									<text class="info-icon">⏰</text>
									<text class="info-text">{{ order.time }}</text>
								</view>
								<view class="info-item distance">
									<text class="info-icon">📏</text>
									<text class="info-text">{{ order.distance }}</text>
								</view>
							</view>
						</view>
						
						<!-- 右侧操作按钮 -->
						<view class="order-actions">
							<view class="action-btn" @tap.stop="callPhone(order)">
								<text class="action-icon">📞</text>
							</view>
							<view class="action-btn" @tap.stop="navigateTo(order)">
								<text class="action-icon">🧭</text>
							</view>
						</view>
					</view>

					<!-- 空状态（取货地） -->
					<view class="empty-state" v-if="pickupOrders.length === 0">
						<text class="empty-icon">📦</text>
						<text class="empty-text">暂无取货任务</text>
					</view>
				</view>

				<!-- 目的地列表 -->
				<view class="group-section">
					<text class="group-title">目的地</text>
					<view 
						class="order-item" 
						v-for="(order, index) in targetOrders" 
						:key="order.id"
						@tap="selectOrder(order)"
						:class="{ active: selectedOrderId === order.id }"
					>
						<!-- 左侧序号徽章 -->
						<view class="order-left">
							<view class="order-badge" :style="{ backgroundColor: order.color }">
								<text class="badge-text">{{ index + 1 }}</text>
							</view>
							<view class="order-line" :style="{ backgroundColor: order.color }" v-if="index < targetOrders.length - 1"></view>
						</view>
						
						<!-- 中间内容区 -->
						<view class="order-content">
							<view class="order-header">
								<view class="order-type-wrapper">
									<text class="order-type-icon">📍</text>
									<text class="order-type-text">送货</text>
								</view>
								<view class="order-tag" :style="{ backgroundColor: order.color }">
									<text class="tag-text">{{ order.statusText }}</text>
								</view>
							</view>
							
					<view class="order-address-row">
						<text class="address-icon">🏠</text>
						<text class="order-address">{{ order.address }}</text>
					</view>
					<view class="order-address-row">
						<text class="address-icon">👤</text>
						<text class="order-address">{{ order.name ? maskName(order.name) : '—' }}</text>
					</view>
							
							<view class="order-info-row">
								<view class="info-item time">
									<text class="info-icon">⏰</text>
									<text class="info-text">{{ order.time }}</text>
								</view>
								<view class="info-item distance">
									<text class="info-icon">📏</text>
									<text class="info-text">{{ order.distance }}</text>
								</view>
							</view>
						</view>
						
						<!-- 右侧操作按钮 -->
						<view class="order-actions">
							<view class="action-btn" @tap.stop="callPhone(order)">
								<text class="action-icon">📞</text>
							</view>
							<view class="action-btn" @tap.stop="navigateTo(order)">
								<text class="action-icon">🧭</text>
							</view>
						</view>
					</view>

					<!-- 空状态（目的地） -->
					<view class="empty-state" v-if="targetOrders.length === 0">
						<text class="empty-icon">📍</text>
						<text class="empty-text">暂无送货任务</text>
					</view>
				</view>

				<!-- 全局空状态（无任何任务） -->
				<view class="empty-state" v-if="pickupOrders.length === 0 && targetOrders.length === 0">
					<text class="empty-icon">🗂️</text>
					<text class="empty-text">暂无任何配送任务</text>
				</view>
			</scroll-view>
		</view>
		
		<tabbar :current="1"></tabbar>
	</view>
</template>

<script>
    import { getPickupCoords, getTargetCoords } from '../../utils/api/index.js'
	export default {
		data() {
			return {
				// 地图中心点（默认上海人民广场）
				mapCenter: {
					latitude: 31.231706,
					longitude: 121.472644
				},
				// 骑手当前位置
				riderLocation: {
					latitude: 31.231706,
					longitude: 121.472644
				},
				// 选中的订单ID
				selectedOrderId: '',
				// 面板是否展开
				isPanelExpanded: false,
				// H5端高德地图实例
				// #ifdef H5
				amapInstance: null,
				amapMarkers: [],
				amapPolylines: [],
				// #endif
				// 活动订单列表（由后端数据构建）
				activeOrders: [],
				// 分组订单列表
				pickupOrders: [],
				targetOrders: [],
				// 地图标记点
				markers: [],
				// 路线
				polyline: []
			}
		},
		onLoad() {
			console.log('页面加载，地图中心:', this.mapCenter);
			console.log('订单数量:', this.activeOrders.length);
			
			// #ifndef H5
			// 非H5端：等待拉取后端数据再绘制
			// #endif
			
			// #ifdef H5
			// H5端：等待DOM渲染后初始化高德地图
			this.$nextTick(() => {
				setTimeout(() => {
					this.initAmap();
				}, 500);
			});
			// #endif
			
			// 获取骑手当前位置后拉取后端路线数据
			this.getRiderLocation();
			this.fetchRoadData();
		},
		methods: {
			// 拉取后端路线数据并构建订单
			async fetchRoadData() {
				try {
					const [pickupRes, targetRes] = await Promise.all([
						getPickupCoords(),
						getTargetCoords()
					]);

					const pickupArray = this.extractCoordArray(pickupRes, ['取货地经纬度', 'pickup', 'data', 'coords']);
					const targetArray = this.extractCoordArray(targetRes, ['目的地经纬度', 'target', 'data', 'coords']);
                    const pickupContacts = this.extractContactArray(pickupRes, ['顾客姓名和电话', 'contacts', 'data.contacts', '用户信息']);
                    const targetContacts = this.extractContactArray(targetRes, ['顾客姓名和电话', 'contacts', 'data.contacts', '用户信息']);
                    const pickupTimes = this.extractTimeArray(pickupRes, ['送达时间', '配送时间', 'deliveryTimes', 'data.times']);
                    const targetTimes = this.extractTimeArray(targetRes, ['送达时间', '配送时间', 'deliveryTimes', 'data.times']);

					console.log('[路线数据] 取货点数量:', pickupArray.length, '目的地数量:', targetArray.length);
					console.log('[联系人] 取货联系人:', pickupContacts, '目的地联系人:', targetContacts);
					console.log('[时间] 取货时间:', pickupTimes, '目的地时间:', targetTimes);

					// 分别构建两类订单
					const pickupOrders = [];
					pickupArray.forEach((pt, i) => {
						const dist = this.calcDistance(this.riderLocation.latitude, this.riderLocation.longitude, pt.latitude, pt.longitude);
						const timeStr = this.formatTimeString(pickupTimes[i]);
						const contact = pickupContacts[i] || {};
						pickupOrders.push({
							id: `A${String(i + 1).padStart(3, '0')}`,
							type: 'pickup',
							address: `取货点 ${i + 1}`,
							time: timeStr,
							distance: this.formatDistance(dist),
							status: 'pending',
							statusText: '待取货',
							color: '#FF9800',
							name: contact.name || '',
							phone: contact.phone || '',
							latitude: pt.latitude,
							longitude: pt.longitude
						});
					});

					const targetOrders = [];
					targetArray.forEach((pt, i) => {
						const dist = this.calcDistance(this.riderLocation.latitude, this.riderLocation.longitude, pt.latitude, pt.longitude);
						const timeStr = this.formatTimeString(targetTimes[i]);
						const contact = targetContacts[i] || {};
						targetOrders.push({
							id: `B${String(i + 1).padStart(3, '0')}`,
							type: 'delivery',
							address: `目的地 ${i + 1}`,
							time: timeStr,
							distance: this.formatDistance(dist),
							status: 'pending',
							statusText: '待送达',
							color: '#4CAF50',
							name: contact.name || '',
							phone: contact.phone || '',
							latitude: pt.latitude,
							longitude: pt.longitude
						});
					});

					// 赋值到页面状态
					this.pickupOrders = pickupOrders;
					this.targetOrders = targetOrders;
					this.activeOrders = [...pickupOrders, ...targetOrders];

					// 初始化地图标记和路线
					this.initMapMarkers();
					this.drawRoute();

					// #ifdef H5
					if (this.amapInstance) {
						this.addAmapMarkers();
						this.drawAmapRoute();
					}
					// #endif
				} catch (e) {
					console.error('路线数据获取失败:', e);
					uni.showToast({ title: '路线数据获取失败', icon: 'none' });
				}
			},

			// 提取并解析经纬度数组（兼容奇怪结构）
			extractCoordArray(res, possibleKeys = []) {
				if (!res) return [];
				let raw = null;
				for (const k of possibleKeys) {
					if (res[k]) { raw = res[k]; break; }
				}
				// 如果没有命中，尝试 res.data
				if (!raw && res.data) raw = res.data;
				return this.parseCoordArray(raw);
			},

			// 提取顾客姓名和电话数组（与坐标索引对应）
            extractContactArray(res, possibleKeys = []) {
                if (!res) return [];
                let raw = null;
                for (const k of possibleKeys) {
                    if (res[k]) { raw = res[k]; break; }
                }
                if (!raw && res.data && Array.isArray(res.data.contacts)) raw = res.data.contacts;
                if (!Array.isArray(raw)) return [];
                const contacts = [];
                raw.forEach(item => {
                    if (item && typeof item === 'object') {
                        // 兼容 { phone: '177...', nickname: '田涛' } 结构
                        if (item.phone && item.nickname) {
                            contacts.push({ name: item.nickname, phone: item.phone });
                        } else {
                            const keys = Object.keys(item);
                            if (keys.length > 0) {
                                const nameKey = keys[0];
                                const phoneVal = item[nameKey];
                                contacts.push({ name: nameKey, phone: phoneVal });
                            } else {
                                contacts.push({ name: '', phone: '' });
                            }
                        }
                    } else {
                        contacts.push({ name: '', phone: '' });
                    }
                });
                return contacts;
            },

			// 提取送达时间数组（与坐标索引对应）
            extractTimeArray(res, possibleKeys = []) {
                if (!res) return [];
                let raw = null;
                for (const k of possibleKeys) {
                    if (res[k]) { raw = res[k]; break; }
                }
                if (!raw && res.data && Array.isArray(res.data.times)) raw = res.data.times;
                if (!Array.isArray(raw)) return [];
                return raw;
            },

				// 将后端时间字符串格式化为易读文案
				formatTimeString(val) {
					if (!val) return '—';
					try {
						const d = new Date(val);
						if (isNaN(d.getTime())) return '—';
						const pad = (n) => String(n).padStart(2, '0');
						const Y = d.getFullYear();
						const M = pad(d.getMonth() + 1);
						const D = pad(d.getDate());
						const h = pad(d.getHours());
						const m = pad(d.getMinutes());
						return `${Y}-${M}-${D} ${h}:${m}`;
					} catch (_) {
						return '—';
					}
				},

				// 姓名脱敏：仅显示姓氏（支持常见复姓），如“田涛”->“田某”
				maskName(name) {
					if (!name || typeof name !== 'string') return '—';
					const compounds = [
						'欧阳','太史','司马','上官','东方','独孤','南宫','夏侯','诸葛','闻人','赫连','皇甫','公孙','慕容','轩辕','令狐','钟离','宇文','长孙','鲜于','闾丘','子车','司徒','司空','亓官','司寇','公羊','澹台','公冶','宗政','濮阳','淳于','仲孙','太叔','申屠','公孙','公良','公伯','公仲','公子'
					];
					const firstTwo = name.slice(0, 2);
					const surname = compounds.includes(firstTwo) ? firstTwo : name.slice(0, 1);
					return `${surname}*`;
				},

			// 将数组 [{"lat": lon}, {...}] 解析为 [{latitude, longitude}]
			parseCoordArray(rawArray) {
				const coords = [];
				if (!rawArray) return coords;
				if (Array.isArray(rawArray)) {
					rawArray.forEach(item => {
						if (item == null) return;
						// 1) 对象结构
						if (typeof item === 'object' && !Array.isArray(item)) {
							let lat = undefined;
							let lon = undefined;
							// 1.a 支持 { lat, lng/lon/longitude } 或中文 { 纬度, 经度 }
							const latKey = 'lat' in item ? 'lat' : ('latitude' in item ? 'latitude' : ('纬度' in item ? '纬度' : null));
							const lonKey = 'lng' in item ? 'lng' : ('lon' in item ? 'lon' : ('longitude' in item ? 'longitude' : ('经度' in item ? '经度' : null)));
							if (latKey && lonKey) {
								lat = Number(item[latKey]);
								lon = Number(item[lonKey]);
							} else {
								// 1.b 原始结构：{ "31.23": 121.47 }
								const keys = Object.keys(item);
								if (keys.length > 0) {
									const latStr = keys[0];
									const lonVal = item[latStr];
									lat = Number(latStr);
									lon = Number(lonVal);
								}
							}
							if (!isNaN(lat) && !isNaN(lon)) {
								coords.push({ latitude: lat, longitude: lon });
							}
						} else if (Array.isArray(item)) {
							// 2) 数组结构：[lat, lon] 或 [lon, lat]
							const a = Number(item[0]);
							const b = Number(item[1]);
							if (!isNaN(a) && !isNaN(b)) {
								const lat = Math.abs(a) <= 90 ? a : b;
								const lon = Math.abs(a) <= 90 ? b : a;
								coords.push({ latitude: lat, longitude: lon });
							}
						} else if (typeof item === 'string') {
							// 3) 字符串结构："lat,lon" 或 "lon,lat"
							const parts = item.split(/[，,\s]+/).map(s => Number(s));
							if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
								const a = parts[0];
								const b = parts[1];
								const lat = Math.abs(a) <= 90 ? a : b;
								const lon = Math.abs(a) <= 90 ? b : a;
								coords.push({ latitude: lat, longitude: lon });
							}
						}
					});
				} else if (typeof rawArray === 'object') {
					// 4) 包裹结构：{ coords: [...] } 或 { list: [...] } 等
					const maybe = rawArray.coords || rawArray.list || rawArray.points || rawArray.data;
					if (Array.isArray(maybe)) {
						return this.parseCoordArray(maybe);
					}
				}
				return coords;
			},

			// 计算两点距离（米）
			calcDistance(lat1, lon1, lat2, lon2) {
				const toRad = d => d * Math.PI / 180;
				const R = 6371000; // 地球半径
				const dLat = toRad(lat2 - lat1);
				const dLon = toRad(lon2 - lon1);
				const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
				const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
				return R * c;
			},

			formatDistance(meters) {
				if (meters < 1000) return `${Math.round(meters)}m`;
				return `${(meters/1000).toFixed(1)}km`;
			},
			// 初始化地图标记点
			initMapMarkers() {
				const markers = [];
				
				// 添加骑手位置标记
				markers.push({
					id: 0,
					latitude: this.riderLocation.latitude,
					longitude: this.riderLocation.longitude,
					width: 35,
					height: 35,
					title: '骑手',
					label: {
						content: '🚴',
						fontSize: 28,
						color: '#ffffff',
						bgColor: '#1890ff',
						borderRadius: 25,
						padding: 5,
						textAlign: 'center'
					},
					callout: {
						content: '骑手B',
						fontSize: 12,
						borderRadius: 8,
						bgColor: '#1890ff',
						color: '#ffffff',
						padding: 8,
						display: 'ALWAYS'
					}
				});
				
				// 添加配送点标记
				this.activeOrders.forEach((order, index) => {
					const emoji = order.type === 'pickup' ? '📦' : '📍';
					const label = order.type === 'pickup' ? `${order.id.charAt(0)}取货点` : `${order.id.charAt(0)}送货点`;
					
					markers.push({
						id: index + 1,
						latitude: order.latitude,
						longitude: order.longitude,
						width: 35,
						height: 35,
						label: {
							content: emoji,
							fontSize: 24,
							color: '#ffffff',
							bgColor: order.color,
							borderRadius: 20,
							padding: 5,
							textAlign: 'center'
						},
						callout: {
							content: label,
							fontSize: 12,
							borderRadius: 8,
							bgColor: order.color,
							color: '#ffffff',
							padding: 6,
							display: 'ALWAYS'
						}
					});
				});
				
				this.markers = markers;
			},
			
			// 绘制路线
			drawRoute() {
				const points = [];
				
				// 从骑手位置开始
				points.push({
					latitude: this.riderLocation.latitude,
					longitude: this.riderLocation.longitude
				});
				
				// 按照订单顺序添加点
				this.activeOrders.forEach(order => {
					points.push({
						latitude: order.latitude,
						longitude: order.longitude
					});
				});
				
				// 根据配送类型绘制不同颜色的路线
				const polylines = [];
				
				// A订单路线（橙色）
				const aOrderPoints = [];
				aOrderPoints.push(points[0]); // 骑手位置
				this.activeOrders.forEach((order, index) => {
					if (order.id.startsWith('A')) {
						aOrderPoints.push(points[index + 1]);
					}
				});
				
				if (aOrderPoints.length > 1) {
					polylines.push({
						points: aOrderPoints,
						color: '#FF9800',
						width: 6,
						arrowLine: true,
						borderColor: '#ffffff',
						borderWidth: 2
					});
				}
				
				// B订单路线（绿色）
				const bOrderPoints = [];
				bOrderPoints.push(points[0]); // 骑手位置
				this.activeOrders.forEach((order, index) => {
					if (order.id.startsWith('B')) {
						bOrderPoints.push(points[index + 1]);
					}
				});
				
				if (bOrderPoints.length > 1) {
					polylines.push({
						points: bOrderPoints,
						color: '#4CAF50',
						width: 6,
						arrowLine: true,
						borderColor: '#ffffff',
						borderWidth: 2
					});
				}
				
				this.polyline = polylines;
			},
			
			// 获取骑手位置
			getRiderLocation() {
				uni.getLocation({
					type: 'gcj02',
					success: (res) => {
						this.riderLocation = {
							latitude: res.latitude,
							longitude: res.longitude
						};
						this.mapCenter = {
							latitude: res.latitude,
							longitude: res.longitude
						};
						this.initMapMarkers();
						this.drawRoute();
					},
					fail: (err) => {
						console.log('获取位置失败', err);
					}
				});
			},
			
			// 点击标记点
			onMarkerTap(e) {
				const markerId = e.detail.markerId;
				if (markerId > 0) {
					const order = this.activeOrders[markerId - 1];
					if (order) {
						this.selectOrder(order);
					}
				}
			},
			
			// 选中订单
			selectOrder(order) {
				this.selectedOrderId = order.id;
				// 地图中心移动到该订单位置
				this.mapCenter = {
					latitude: order.latitude,
					longitude: order.longitude
				};
				
				// #ifdef H5
				// H5端：移动高德地图中心
				if (this.amapInstance) {
					this.amapInstance.setCenter([order.longitude, order.latitude]);
					this.amapInstance.setZoom(16);
				}
				// #endif
			},

			// 开始导航到订单点（高德导航）
			navigateTo(order) {
				if (!order) return;
				const name = order.address || (order.type === 'pickup' ? '取货点' : '目的地');
				const h5Url = `https://uri.amap.com/navigation?to=${order.longitude},${order.latitude},${encodeURIComponent(name)}&mode=car&src=campus-life&coordinate=gaode`;

				// #ifdef APP-PLUS
				try {
					const platform = uni.getSystemInfoSync().platform;
					const scheme = platform === 'android'
						? `androidamap://navi?sourceApplication=CampusRider&poiname=${encodeURIComponent(name)}&lat=${order.latitude}&lon=${order.longitude}&dev=0&style=2`
						: `iosamap://navi?sourceApplication=CampusRider&poiname=${encodeURIComponent(name)}&lat=${order.latitude}&lon=${order.longitude}&dev=0&style=2`;
					plus.runtime.openURL(scheme, (e) => {
						// 若未安装APP，回退到H5
						plus.runtime.openURL(h5Url);
					});
				} catch (err) {
					// 回退到H5链接
					plus.runtime.openURL(h5Url);
				}
				// #endif

				// #ifdef H5
				window.location.href = h5Url;
				// #endif
			},
			
			// 居中到当前位置
			centerToLocation() {
				this.mapCenter = {
					latitude: this.riderLocation.latitude,
					longitude: this.riderLocation.longitude
				};
				
				// #ifdef H5
				// H5端：移动高德地图中心
				if (this.amapInstance) {
					this.amapInstance.setCenter([this.riderLocation.longitude, this.riderLocation.latitude]);
					this.amapInstance.setZoom(15);
				}
				// #endif
				
				uni.showToast({
					title: '已居中',
					icon: 'success',
					duration: 1000
				});
			},
			
			// 刷新路线
			refreshRoute() {
				uni.showLoading({
					title: '刷新中...'
				});
				
				setTimeout(() => {
					this.getRiderLocation();
					
					// #ifdef H5
					// H5端：重新绘制高德地图
					if (this.amapInstance) {
						this.addAmapMarkers();
						this.drawAmapRoute();
					}
					// #endif
					
					uni.hideLoading();
					uni.showToast({
						title: '刷新成功',
						icon: 'success'
					});
				}, 1000);
			},
			
			// 切换面板展开/收起
			togglePanel() {
				this.isPanelExpanded = !this.isPanelExpanded;
			},
			
			// 拨打电话
			callPhone(order) {
				uni.makePhoneCall({
					phoneNumber: order.phone,
					fail: (err) => {
						uni.showToast({
							title: '拨号失败',
							icon: 'none'
						});
					}
				});
			},
			
			// 地图更新回调
			onMapUpdated(e) {
				console.log('地图更新:', e);
			},
			
			// 地图错误回调
			onMapError(e) {
				console.error('地图错误:', e);
				uni.showToast({
					title: '地图加载失败',
					icon: 'none'
				});
			},
			
			// #ifdef H5
			// 初始化高德地图（H5端）
			initAmap() {
				if (typeof AMap === 'undefined') {
					console.error('高德地图API未加载');
					uni.showToast({
						title: '地图加载失败',
						icon: 'none'
					});
					return;
				}
				
				// 创建地图实例
				this.amapInstance = new AMap.Map('amapContainer', {
					zoom: 15,
					center: [this.mapCenter.longitude, this.mapCenter.latitude],
					viewMode: '3D',
					showLabel: true
				});
				
				console.log('高德地图初始化成功');
				
				// 添加标记和路线
				this.addAmapMarkers();
				this.drawAmapRoute();
			},
			
			// 添加高德地图标记
			addAmapMarkers() {
				if (!this.amapInstance) return;
				
				// 清除旧标记
				if (this.amapMarkers.length > 0) {
					this.amapInstance.remove(this.amapMarkers);
					this.amapMarkers = [];
				}
				
				// 添加骑手位置标记
				const riderMarker = new AMap.Marker({
					position: [this.riderLocation.longitude, this.riderLocation.latitude],
					title: '骑手B',
					icon: new AMap.Icon({
						size: new AMap.Size(40, 40),
						image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
							<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
								<circle cx="20" cy="20" r="18" fill="#1890ff" stroke="#fff" stroke-width="2"/>
								<text x="20" y="28" text-anchor="middle" fill="#fff" font-size="20">🚴</text>
							</svg>
						`),
						imageSize: new AMap.Size(40, 40)
					}),
					offset: new AMap.Pixel(-20, -20)
				});
				this.amapMarkers.push(riderMarker);
				
				// 添加订单标记
				this.activeOrders.forEach((order, index) => {
					const emoji = order.type === 'pickup' ? '📦' : '📍';
					const marker = new AMap.Marker({
						position: [order.longitude, order.latitude],
						title: order.address,
						icon: new AMap.Icon({
							size: new AMap.Size(35, 35),
							image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
								<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35">
									<circle cx="17.5" cy="17.5" r="16" fill="${order.color}" stroke="#fff" stroke-width="2"/>
									<text x="17.5" y="24" text-anchor="middle" fill="#fff" font-size="16">${emoji}</text>
								</svg>
							`),
							imageSize: new AMap.Size(35, 35)
						}),
						offset: new AMap.Pixel(-17.5, -17.5)
					});
					
					// 添加标签
					const label = new AMap.Text({
						text: order.type === 'pickup' ? `${order.id.charAt(0)}取货点` : `${order.id.charAt(0)}送货点`,
						position: [order.longitude, order.latitude],
						offset: new AMap.Pixel(0, -30),
						style: {
							'background-color': order.color,
							'border': 'none',
							'color': '#ffffff',
							'font-size': '12px',
							'padding': '4px 8px',
							'border-radius': '8px'
						}
					});
					
					this.amapMarkers.push(marker);
					this.amapMarkers.push(label);
					
					// 点击事件
					marker.on('click', () => {
						this.selectOrder(order);
					});
				});
				
				// 添加到地图
				this.amapInstance.add(this.amapMarkers);
			},
			
			// 绘制高德地图路线
			drawAmapRoute() {
				if (!this.amapInstance) return;
				
				// 清除旧路线
				if (this.amapPolylines.length > 0) {
					this.amapInstance.remove(this.amapPolylines);
					this.amapPolylines = [];
				}
				
				// A订单路线（橙色）
				const aOrderPath = [[this.riderLocation.longitude, this.riderLocation.latitude]];
				this.activeOrders.forEach(order => {
					if (order.id.startsWith('A')) {
						aOrderPath.push([order.longitude, order.latitude]);
					}
				});
				
				if (aOrderPath.length > 1) {
					const aPolyline = new AMap.Polyline({
						path: aOrderPath,
						strokeColor: '#FF9800',
						strokeWeight: 6,
						strokeOpacity: 0.8,
						showDir: true
					});
					this.amapPolylines.push(aPolyline);
				}
				
				// B订单路线（绿色）
				const bOrderPath = [[this.riderLocation.longitude, this.riderLocation.latitude]];
				this.activeOrders.forEach(order => {
					if (order.id.startsWith('B')) {
						bOrderPath.push([order.longitude, order.latitude]);
					}
				});
				
				if (bOrderPath.length > 1) {
					const bPolyline = new AMap.Polyline({
						path: bOrderPath,
						strokeColor: '#4CAF50',
						strokeWeight: 6,
						strokeOpacity: 0.8,
						showDir: true
					});
					this.amapPolylines.push(bPolyline);
				}
				
				// 添加到地图
				this.amapInstance.add(this.amapPolylines);
				
				// 自动调整视野
				this.amapInstance.setFitView();
			}
			// #endif
		}
	}
</script>

<style scoped>
	.container {
		height: 100vh;
		background-color: #f5f5f5;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	/* 顶部标题栏 */
	.header {
		background-color: #ffffff;
		padding: 70rpx 30rpx 20rpx 30rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1rpx solid #f0f0f0;
		z-index: 10;
	}

	.header-title {
		font-size: 40rpx;
		color: #333;
		font-weight: bold;
	}

	.order-count {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
	}

	.count-text {
		font-size: 24rpx;
		color: #ffffff;
		font-weight: 500;
	}

	/* 地图容器 */
	.map-container {
		flex: 1;
		position: relative;
		width: 100%;
		min-height: 600rpx;
		background-color: #e0e0e0;
	}

	.map {
		width: 100%;
		height: 100%;
		min-height: 600rpx;
	}
	
	/* H5端高德地图容器 */
	.amap-container {
		width: 100%;
		height: 100%;
		min-height: 600rpx;
	}

	/* 地图控制按钮 */
	.map-controls {
		position: absolute;
		right: 30rpx;
		bottom: 30rpx;
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		z-index: 999;
	}

	.control-btn {
		width: 80rpx;
		height: 80rpx;
		background-color: #ffffff;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}

	.control-btn:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
	}

	.control-icon {
		font-size: 36rpx;
	}

	/* 订单面板 */
	.orders-panel {
		position: absolute;
		bottom: 120rpx;
		left: 0;
		right: 0;
		background-color: #ffffff;
		border-radius: 32rpx 32rpx 0 0;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
		max-height: 100rpx;
		transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 10;
		overflow: hidden;
	}

	.orders-panel.expanded {
		max-height: 75vh;
	}

	.panel-handle {
		padding: 16rpx 30rpx 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: pointer;
		background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
		border-bottom: 1rpx solid #f0f0f0;
		position: relative;
	}

	.handle-bar {
		width: 60rpx;
		height: 6rpx;
		background: linear-gradient(90deg, #d9d9d9 0%, #bfbfbf 50%, #d9d9d9 100%);
		border-radius: 3rpx;
		margin-bottom: 12rpx;
		transition: all 0.3s ease;
	}
	
	.orders-panel.expanded .handle-bar {
		background: linear-gradient(90deg, #1890ff 0%, #40a9ff 50%, #1890ff 100%);
	}
	
	.panel-handle:active .handle-bar {
		width: 80rpx;
		transform: scaleY(1.3);
	}

	.panel-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
		letter-spacing: 1rpx;
	}

	.orders-scroll {
		max-height: 600rpx;
		padding: 20rpx 0;
	}

	/* 订单项 */
	.order-item {
		background-color: #ffffff;
		border-radius: 20rpx;
		padding: 24rpx 20rpx;
		margin: 0 20rpx 16rpx 20rpx;
		display: flex;
		align-items: stretch;
		gap: 24rpx;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
		position: relative;
		overflow: hidden;
	}
	
	.order-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 6rpx;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.05) 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.order-item:active {
		transform: translateY(-2rpx);
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	}

	.order-item.active {
		box-shadow: 0 4rpx 24rpx rgba(24, 144, 255, 0.15);
		background: linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%);
	}
	
	.order-item.active::before {
		opacity: 1;
	}

	/* 左侧序号区域 */
	.order-left {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
		position: relative;
	}

	.order-badge {
		width: 56rpx;
		height: 56rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
		position: relative;
		z-index: 2;
	}

	.badge-text {
		font-size: 26rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	.order-line {
		flex: 1;
		width: 4rpx;
		margin-top: 8rpx;
		border-radius: 2rpx;
		opacity: 0.3;
	}

	/* 中间内容区域 */
	.order-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		min-width: 0;
	}

	.order-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
	}
	
	.order-type-wrapper {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}
	
	.order-type-icon {
		font-size: 28rpx;
	}

	.order-type-text {
		font-size: 32rpx;
		color: #333;
		font-weight: 600;
	}

	.order-tag {
		padding: 6rpx 16rpx;
		border-radius: 12rpx;
		flex-shrink: 0;
	}

	.tag-text {
		font-size: 22rpx;
		color: #ffffff;
		font-weight: 500;
	}

	.order-address-row {
		display: flex;
		align-items: flex-start;
		gap: 8rpx;
		padding: 12rpx;
		background-color: #f8f9fa;
		border-radius: 12rpx;
	}
	
	.address-icon {
		font-size: 24rpx;
		flex-shrink: 0;
		margin-top: 2rpx;
	}

	.order-address {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		flex: 1;
		word-break: break-all;
	}

	.order-info-row {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}
	
	.info-item {
		display: flex;
		align-items: center;
		gap: 6rpx;
		padding: 8rpx 12rpx;
		background-color: #f0f7ff;
		border-radius: 8rpx;
	}
	
	.info-icon {
		font-size: 20rpx;
	}

	.info-text {
		font-size: 24rpx;
		color: #666;
	}

	.order-actions {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 12rpx;
		flex-shrink: 0;
	}

	.action-btn {
		width: 60rpx;
		height: 60rpx;
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}
	
	.action-btn::before {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.action-btn:active {
		transform: scale(0.9);
		box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.4);
	}
	
	.action-btn:active::before {
		opacity: 1;
	}

	.action-icon {
		font-size: 28rpx;
		position: relative;
		z-index: 1;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 60rpx;
	}

	.empty-icon {
		font-size: 100rpx;
		margin-bottom: 30rpx;
		opacity: 0.3;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
</style>

