<script>
export default {
  onLaunch: function() {
    console.log('App Launch');
    // 检查登录状态
    this.checkLoginStatus();
  },
  onShow: function() {
    console.log('App Show');
  },
  onHide: function() {
    console.log('App Hide');
  },
  methods: {
    checkLoginStatus() {
      // 获取当前页面路径
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentRoute = currentPage ? currentPage.route : '';
      
      // 如果当前已经在登录页，不需要跳转
      if (currentRoute === 'pages/login/login') {
        return;
      }
      
      // 检查是否有token
      const token = uni.getStorageSync('token');
      if (!token) {
        // 没有token，跳转到登录页
        console.log('未登录，跳转到登录页');
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }
    }
  }
};
</script>

<style>
/*每个页面公共css */
@import url('./common/common.css');

page {
  background-color: #F5F5F5;
}
</style>

