<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.setupGlobalInterceptors();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			// 设置全局拦截器
			setupGlobalInterceptors() {
				// 拦截所有路由跳转方法
				this.interceptUniMethods();
			},
			
			// 拦截uni的路由方法
			interceptUniMethods() {
				// 保存原始方法
				const originalNavigateTo = uni.navigateTo;
				const originalRedirectTo = uni.redirectTo;
				const originalSwitchTab = uni.switchTab;
				const originalReLaunch = uni.reLaunch;
				const originalNavigateBack = uni.navigateBack;
				
				// 拦截 reLaunch - 修复无效URL问题
				uni.reLaunch = function(options) {
					// 检测并修复无效的URL
					if (!options.url || options.url === '/' || options.url === '') {
						const token = uni.getStorageSync('token');
						if (token) {
							// 有token，改为跳转到首页
							return originalSwitchTab.call(uni, { url: '/pages/index/index' });
						} else {
							// 无token，改为跳转到登录页
							return originalRedirectTo.call(uni, { url: '/pages/login/login' });
						}
					}
					return originalReLaunch.call(uni, options);
				};
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
