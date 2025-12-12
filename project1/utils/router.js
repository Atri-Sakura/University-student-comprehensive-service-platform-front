/**
 * 全局路由管理工具
 * 用于统一管理页面跳转，确保返回键能正确返回到上一个页面
 */

// 页面访问历史栈（不包含登录页和tabBar页面）
let pageHistory = [];

// 需要登录的页面列表
const needAuthPages = [
  'pages/index/index',
  'pages/list/list',
  'pages/message/message',
  'pages/mine/mine',
  'pages/analytics/analytics',
  'pages/products/products',
  'pages/reviews/reviews',
  'pages/activities/activities',
  'pages/finance/finance',
  'pages/support/support',
  'pages/list/order-detail',
  'pages/message/chat',
  'pages/finance/order-detail1',
  'pages/finance/withdraw',
  'pages/activities/activity-edit',
  'pages/activities/activity-edit-new',
  'pages/activities/activity-detail'
];

// tabBar页面列表
const tabBarPages = [
  'pages/index/index',
  'pages/list/list',
  'pages/message/message',
  'pages/mine/mine'
];

/**
 * 检查页面是否需要登录
 */
function needAuth(url) {
  const path = url.split('?')[0];
  return needAuthPages.some(page => path.includes(page));
}

/**
 * 检查是否是tabBar页面
 */
function isTabBarPage(url) {
  const path = url.split('?')[0];
  return tabBarPages.some(page => path.includes(page));
}

/**
 * 获取当前页面路径
 */
function getCurrentPagePath() {
  const pages = getCurrentPages();
  if (pages.length > 0) {
    return '/' + pages[pages.length - 1].route;
  }
  return '';
}

/**
 * 添加到页面历史
 */
function addToHistory(url) {
  const path = url.split('?')[0];
  // 不记录登录页和tabBar页面
  if (path !== '/pages/login/login' && !isTabBarPage(path)) {
    // 避免重复添加
    if (pageHistory.length === 0 || pageHistory[pageHistory.length - 1] !== path) {
      pageHistory.push(path);
      // 限制历史记录数量，避免内存溢出
      if (pageHistory.length > 50) {
        pageHistory.shift();
      }
    }
  }
}

/**
 * 获取上一个页面路径
 */
function getPreviousPage() {
  if (pageHistory.length > 0) {
    return pageHistory[pageHistory.length - 1];
  }
  // 如果没有历史记录，返回首页
  return '/pages/index/index';
}

/**
 * 清除页面历史
 */
function clearHistory() {
  pageHistory = [];
}

/**
 * 返回上一页
 */
function navigateBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    // 有页面栈，直接返回
    uni.navigateBack();
  } else {
    // 没有页面栈，跳转到上一个历史页面或首页
    const previousPage = getPreviousPage();
    if (previousPage && previousPage !== getCurrentPagePath()) {
      // 移除当前页面
      if (pageHistory.length > 0) {
        pageHistory.pop();
      }
      uni.redirectTo({
        url: previousPage,
        fail: () => {
          // 如果跳转失败，跳转到首页
          uni.switchTab({
            url: '/pages/index/index'
          });
        }
      });
    } else {
      // 跳转到首页
      uni.switchTab({
        url: '/pages/index/index'
      });
    }
  }
}

/**
 * 统一的路由跳转方法
 * @param {Object} options - 跳转选项
 * @param {String} options.url - 跳转路径
 * @param {String} options.method - 跳转方法: navigateTo, redirectTo, switchTab, reLaunch
 * @param {Object} options.params - 跳转参数
 */
function navigateTo(options = {}) {
  const { url, method = 'navigateTo', params } = options;
  
  if (!url) {
    console.error('路由跳转失败: url不能为空');
    return;
  }

  // 检查登录状态
  const token = uni.getStorageSync('token');
  if (needAuth(url) && !token) {
    // 需要登录但未登录，先保存目标页面，然后跳转到登录页
    if (url !== '/pages/login/login') {
      uni.setStorageSync('targetPage', url);
    }
    uni.redirectTo({
      url: '/pages/login/login',
      fail: () => {
        uni.reLaunch({
          url: '/pages/login/login'
        });
      }
    });
    return;
  }

  // 构建完整的URL（包含参数）
  let fullUrl = url;
  if (params && Object.keys(params).length > 0) {
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    fullUrl += (url.indexOf('?') === -1 ? '?' : '&') + queryString;
  }

  // 根据方法跳转
  switch (method) {
    case 'navigateTo':
      uni.navigateTo({
        url: fullUrl,
        fail: (err) => {
          console.error('navigateTo失败:', err);
          // 如果是tabBar页面，使用switchTab
          if (isTabBarPage(fullUrl)) {
            uni.switchTab({
              url: fullUrl.split('?')[0]
            });
          }
        }
      });
      // 添加到历史记录
      addToHistory(fullUrl);
      break;

    case 'redirectTo':
      uni.redirectTo({
        url: fullUrl,
        fail: (err) => {
          console.error('redirectTo失败:', err);
        }
      });
      // redirectTo会替换当前页面，更新历史记录
      if (pageHistory.length > 0) {
        pageHistory.pop();
      }
      addToHistory(fullUrl);
      break;

    case 'switchTab':
      uni.switchTab({
        url: fullUrl.split('?')[0], // switchTab不支持参数
        fail: (err) => {
          console.error('switchTab失败:', err);
        }
      });
      // tabBar页面不添加到历史记录
      break;

    case 'reLaunch':
      // reLaunch会清空页面栈，只在必要时使用（如登录后跳转）
      uni.reLaunch({
        url: fullUrl,
        fail: (err) => {
          console.error('reLaunch失败:', err);
        }
      });
      // reLaunch会清空页面栈，也清空历史记录
      clearHistory();
      break;

    default:
      console.error('未知的跳转方法:', method);
  }
}

/**
 * 登录成功后跳转到目标页面
 */
function navigateAfterLogin() {
  const targetPage = uni.getStorageSync('targetPage');
  if (targetPage) {
    uni.removeStorageSync('targetPage');
    // 使用reLaunch确保页面栈正确
    navigateTo({
      url: targetPage,
      method: 'reLaunch'
    });
  } else {
    // 没有目标页面，跳转到首页
    navigateTo({
      url: '/pages/index/index',
      method: 'switchTab'
    });
  }
}

export default {
  navigateTo,
  navigateBack,
  navigateAfterLogin,
  needAuth,
  isTabBarPage,
  getCurrentPagePath,
  getPreviousPage,
  addToHistory,
  clearHistory
};

