<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 检查登录状态
			this.checkLoginStatus()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				const token = uni.getStorageSync('token')
				const pages = getCurrentPages()
				const currentPage = pages[pages.length - 1]
				const currentRoute = currentPage ? currentPage.route : ''
				
				// 如果未登录且当前不在登录页，则跳转到登录页
				if (!token && currentRoute !== 'pages/login/login') {
					uni.reLaunch({
						url: '/pages/login/login'
					})
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
