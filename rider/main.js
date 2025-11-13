import App from './App'
import Tabbar from '@/components/tabbar/tabbar.vue'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'

// 全局注册tabbar组件
Vue.component('tabbar', Tabbar)

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  // 全局注册tabbar组件
  app.component('tabbar', Tabbar)
  return {
    app
  }
}
// #endif
