<script>
export default {
  onLaunch: function() {
    // 检查登录状态
    this.checkLoginStatus();
  },
  onShow: function() {
    // 页面显示时也检查登录状态
    this.checkLoginStatus();
  },
  onHide: function() {
    // 页面隐藏
  },
  methods: {
    checkLoginStatus() {
      // 延迟执行，等待页面栈有内容
      setTimeout(() => {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const currentRoute = currentPage ? currentPage.route : '';
        
        if (pages.length === 0 || currentRoute === 'pages/login/login' || currentRoute === 'pages/index/index') {
          return;
        }
        
        const token = uni.getStorageSync('token');
        if (!token) {
          if (currentRoute === 'pages/message/chat-detail' && pages.length <= 1) {
            uni.reLaunch({
              url: '/pages/message/message'
            });
          } else {
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }
        }
      }, 100);
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

