if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const DEV_CONFIG = {
    // H5 端配置
    H5_API_BASE_URL: "http://localhost:8080",
    // App 端配置（已更新为您的电脑实际 IP 地址）
    APP_API_BASE_URL: "http://192.168.100.15:8080",
    // 小程序端配置
    MP_API_BASE_URL: "http://192.168.100.15:8080"
  };
  function getApiBaseUrl() {
    return DEV_CONFIG.APP_API_BASE_URL;
  }
  const API_BASE_URL = getApiBaseUrl();
  const API = {
    // 认证相关
    LOGIN_RIDER: "/platform/auth/rider/login",
    // 骑手登录
    REGISTER_RIDER: "/platform/auth/rider/register",
    // 骑手注册
    CAPTCHA: "/captchaImage",
    // 获取验证码
    GET_INFO: "/getInfo",
    // 获取用户信息
    LOGOUT: "/logout"
    // 退出登录
  };
  async function request$1(options) {
    const {
      url,
      method = "GET",
      data = {},
      headers = {},
      needAuth = true
    } = options;
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const requestHeaders = {
      "Content-Type": "application/json",
      ...headers
    };
    if (needAuth) {
      const token = uni.getStorageSync("token");
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }
    try {
      uni.showLoading({
        title: "加载中...",
        mask: true
      });
      const response = await new Promise((resolve, reject) => {
        uni.request({
          url: fullUrl,
          method: method.toUpperCase(),
          data: method.toUpperCase() === "GET" ? {} : data,
          header: requestHeaders,
          success: (res) => {
            resolve(res);
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
      uni.hideLoading();
      return handleResponse$1(response.data);
    } catch (error) {
      uni.hideLoading();
      formatAppLog("error", "at utils/api.js:89", "请求失败:", error);
      uni.showToast({
        title: "网络请求失败",
        icon: "none",
        duration: 2e3
      });
      throw error;
    }
  }
  function handleResponse$1(result) {
    if (result.code === 200) {
      return result;
    }
    if (result.code === 401) {
      handleTokenExpired$1();
      throw new Error(result.msg || "Token已过期，请重新登录");
    }
    uni.showToast({
      title: result.msg || "请求失败",
      icon: "none",
      duration: 2e3
    });
    throw new Error(result.msg || "请求失败");
  }
  function handleTokenExpired$1() {
    uni.removeStorageSync("token");
    uni.removeStorageSync("userType");
    uni.removeStorageSync("identity");
    uni.removeStorageSync("identityKey");
    uni.showToast({
      title: "登录已过期，请重新登录",
      icon: "none",
      duration: 2e3
    });
    setTimeout(() => {
      uni.redirectTo({
        url: "/pages/login/login"
      });
    }, 2e3);
  }
  async function loginRider(phonenumber, password, code, uuid) {
    return request$1({
      url: API.LOGIN_RIDER,
      method: "POST",
      data: { phonenumber, password, code, uuid },
      needAuth: false
    });
  }
  async function registerRider(phone, password, code, uuid) {
    return request$1({
      url: API.REGISTER_RIDER,
      method: "POST",
      data: { phone, password, code, uuid },
      needAuth: false
    });
  }
  async function getCaptcha() {
    return request$1({
      url: API.CAPTCHA,
      method: "GET",
      needAuth: false
    });
  }
  async function logout() {
    return request$1({
      url: API.LOGOUT,
      method: "POST"
    });
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$l = {
    data() {
      return {
        phoneNumber: "",
        password: "",
        showPassword: false,
        verificationCode: "",
        // 验证码
        captchaImage: "/static/c1.png",
        // 验证码图片URL（设置默认值确保页面加载时可见）
        uuid: ""
        // 验证码UUID
      };
    },
    // 页面创建时获取验证码
    created() {
      this.refreshCaptcha();
    },
    // 页面加载时获取验证码（增加兼容性）
    onLoad() {
      if (!this.captchaImage) {
        this.refreshCaptcha();
      }
    },
    methods: {
      // 切换密码显示
      togglePassword() {
        this.showPassword = !this.showPassword;
      },
      // 显示消息
      showMessage(message, type) {
        const icon = type === "error" ? "none" : "success";
        uni.showToast({
          title: message,
          icon,
          duration: 3e3
        });
      },
      // 处理登录
      async handleLogin() {
        if (!this.validateForm()) {
          return;
        }
        try {
          const result = await loginRider(
            this.phoneNumber,
            this.password,
            this.verificationCode,
            this.uuid || uni.getStorageSync("captchaUuid")
          );
          formatAppLog("log", "at pages/login/login.vue:135", "登录响应:", result);
          uni.setStorageSync("token", result.token);
          uni.setStorageSync("userType", "rider");
          uni.setStorageSync("identity", "骑手");
          uni.setStorageSync("identityKey", "rider");
          if (result.user) {
            uni.setStorageSync("userInfo", result.user);
          }
          this.showMessage("登录成功！", "success");
          setTimeout(() => {
            uni.redirectTo({
              url: "/pages/order/order",
              fail: () => {
                uni.navigateTo({
                  url: "/pages/order/order"
                });
              }
            });
          }, 1e3);
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:163", "登录错误:", error);
          this.showMessage(error.message || "登录失败", "error");
          this.refreshCaptcha();
        }
      },
      // 处理注册
      handleRegister() {
        uni.navigateTo({
          url: "/pages/register/register"
        });
      },
      // 短信验证码登录
      handleSmsLogin() {
        uni.showToast({
          title: "跳转到短信登录",
          icon: "none"
        });
      },
      // 忘记密码
      handleForgotPassword() {
        uni.showToast({
          title: "跳转到找回密码",
          icon: "none"
        });
      },
      // 刷新验证码
      async refreshCaptcha() {
        this.setStaticCaptcha();
        try {
          formatAppLog("log", "at pages/login/login.vue:201", "尝试获取服务器验证码");
          const result = await getCaptcha();
          formatAppLog("log", "at pages/login/login.vue:203", "验证码响应:", result);
          if (result.img) {
            this.uuid = result.uuid;
            uni.setStorageSync("captchaUuid", result.uuid);
            this.captchaImage = "data:image/jpeg;base64," + result.img;
            formatAppLog("log", "at pages/login/login.vue:212", "服务器验证码加载成功");
          } else {
            formatAppLog("log", "at pages/login/login.vue:214", "服务器验证码返回错误或无图片");
          }
        } catch (error) {
          formatAppLog("error", "at pages/login/login.vue:218", "获取服务器验证码失败:", error);
        }
      },
      // 设置静态验证码
      setStaticCaptcha() {
        const randomNum = Math.floor(Math.random() * 9) + 1;
        const staticCaptchaPath = `/static/c${randomNum}.png?timestamp=${Date.now()}`;
        this.captchaImage = staticCaptchaPath;
        this.uuid = "temp_" + Date.now();
        uni.setStorageSync("captchaUuid", this.uuid);
        formatAppLog("log", "at pages/login/login.vue:231", "使用静态验证码:", staticCaptchaPath);
      },
      // 表单验证
      validateForm() {
        if (!this.phoneNumber) {
          uni.showToast({
            title: "请输入手机号",
            icon: "none"
          });
          return false;
        }
        if (!/^1[3-9]\d{9}$/.test(this.phoneNumber)) {
          uni.showToast({
            title: "请输入正确的手机号",
            icon: "none"
          });
          return false;
        }
        if (!this.password) {
          uni.showToast({
            title: "请输入密码",
            icon: "none"
          });
          return false;
        }
        if (this.password.length < 6) {
          uni.showToast({
            title: "密码至少6位",
            icon: "none"
          });
          return false;
        }
        if (!this.verificationCode) {
          uni.showToast({
            title: "请输入验证码",
            icon: "none"
          });
          return false;
        }
        return true;
      }
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createCommentVNode(" 背景颜色 "),
      vue.createElementVNode("view", { class: "background-gradient" }),
      vue.createCommentVNode(" 登录卡片 "),
      vue.createElementVNode("view", { class: "login-card" }, [
        vue.createCommentVNode(" 标题 "),
        vue.createElementVNode("view", { class: "login-title" }, "骑手登录"),
        vue.createCommentVNode(" 表单区域 "),
        vue.createElementVNode("view", { class: "form-container" }, [
          vue.createCommentVNode(" 手机号输入 "),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "手机号"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input-field",
                type: "number",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.phoneNumber = $event),
                placeholder: "请输入手机号",
                maxlength: "11"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.phoneNumber]
            ])
          ]),
          vue.createCommentVNode(" 密码输入 "),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "密码"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "input-field",
              type: $data.showPassword ? "text" : "password",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.password = $event),
              placeholder: "请输入密码"
            }, null, 8, ["type"]), [
              [vue.vModelDynamic, $data.password]
            ])
          ]),
          vue.createCommentVNode(" 验证码输入 "),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "验证码"),
            vue.createElementVNode("view", { class: "verification-code-container" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "input-field verification-input",
                  type: "text",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.verificationCode = $event),
                  placeholder: "请输入验证码",
                  maxlength: "6"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.verificationCode]
              ]),
              vue.createElementVNode("view", { class: "captcha-container" }, [
                vue.createElementVNode("image", {
                  src: $data.captchaImage,
                  class: "captcha-image",
                  onClick: _cache[3] || (_cache[3] = (...args) => $options.refreshCaptcha && $options.refreshCaptcha(...args)),
                  mode: "aspectFit"
                }, null, 8, ["src"])
              ])
            ])
          ]),
          vue.createCommentVNode(" 按钮区域 "),
          vue.createElementVNode("view", { class: "button-group" }, [
            vue.createElementVNode("button", {
              class: "login-btn",
              onClick: _cache[4] || (_cache[4] = (...args) => $options.handleLogin && $options.handleLogin(...args))
            }, "登录"),
            vue.createElementVNode("button", {
              class: "register-btn",
              onClick: _cache[5] || (_cache[5] = (...args) => $options.handleRegister && $options.handleRegister(...args))
            }, "注册")
          ]),
          vue.createCommentVNode(" 辅助功能 "),
          vue.createElementVNode("view", { class: "helper-links" }, [
            vue.createElementVNode("text", {
              class: "helper-link",
              onClick: _cache[6] || (_cache[6] = (...args) => $options.handleSmsLogin && $options.handleSmsLogin(...args))
            }, "短信验证码登录"),
            vue.createElementVNode("text", {
              class: "helper-link",
              onClick: _cache[7] || (_cache[7] = (...args) => $options.handleForgotPassword && $options.handleForgotPassword(...args))
            }, "忘记密码")
          ])
        ])
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__scopeId", "data-v-e4e4508d"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/login/login.vue"]]);
  const _sfc_main$k = {
    data() {
      return {
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        verificationCode: "",
        showPassword: false,
        showConfirmPassword: false,
        captchaImage: "/static/c1.png",
        // 验证码图片URL
        uuid: ""
        // 验证码UUID
      };
    },
    methods: {
      // 切换密码显示
      togglePassword() {
        this.showPassword = !this.showPassword;
      },
      // 切换确认密码显示
      toggleConfirmPassword() {
        this.showConfirmPassword = !this.showConfirmPassword;
      },
      // 页面加载时获取验证码
      onLoad() {
        this.refreshCaptcha();
      },
      // 刷新验证码
      async refreshCaptcha() {
        this.setStaticCaptcha();
        try {
          const result = await getCaptcha();
          formatAppLog("log", "at pages/register/register.vue:121", "验证码响应:", result);
          if (result.img) {
            this.uuid = result.uuid;
            uni.setStorageSync("captchaUuid", result.uuid);
            this.captchaImage = "data:image/jpeg;base64," + result.img;
            formatAppLog("log", "at pages/register/register.vue:130", "服务器验证码加载成功");
          } else {
            formatAppLog("log", "at pages/register/register.vue:132", "服务器验证码返回错误或无图片");
          }
        } catch (error) {
          formatAppLog("error", "at pages/register/register.vue:136", "获取服务器验证码失败:", error);
        }
      },
      // 设置静态验证码
      setStaticCaptcha() {
        const randomNum = Math.floor(Math.random() * 9) + 1;
        const staticCaptchaPath = `/static/c${randomNum}.png?timestamp=${Date.now()}`;
        this.captchaImage = staticCaptchaPath;
        this.uuid = "temp_" + Date.now();
        uni.setStorageSync("captchaUuid", this.uuid);
        formatAppLog("log", "at pages/register/register.vue:149", "使用静态验证码:", staticCaptchaPath);
      },
      // 统一消息提示方法
      showMessage(title, icon = "none") {
        uni.showToast({
          title,
          icon
        });
      },
      // 处理注册
      async handleRegister() {
        if (!this.validateForm()) {
          return;
        }
        try {
          const result = await registerRider(
            this.phoneNumber,
            this.password,
            this.verificationCode,
            this.uuid || uni.getStorageSync("captchaUuid")
          );
          formatAppLog("log", "at pages/register/register.vue:175", "注册响应:", result);
          this.showMessage("注册成功", "success");
          setTimeout(() => {
            uni.navigateBack({
              delta: 1,
              fail: () => {
                uni.redirectTo({
                  url: "/pages/login/login",
                  fail: () => {
                    uni.reLaunch({ url: "/pages/login/login" });
                  }
                });
              }
            });
          }, 1500);
        } catch (error) {
          formatAppLog("error", "at pages/register/register.vue:197", "注册失败:", error);
          this.showMessage(error.message || "注册失败", "none");
          this.refreshCaptcha();
        }
      },
      // 处理返回登录
      handleLogin() {
        uni.navigateBack({
          delta: 1,
          fail: () => {
            uni.redirectTo({
              url: "/pages/login/login",
              fail: () => {
                uni.reLaunch({ url: "/pages/login/login" });
              }
            });
          }
        });
      },
      // 表单验证
      validateForm() {
        if (!this.phoneNumber) {
          uni.showToast({
            title: "请输入手机号",
            icon: "none"
          });
          return false;
        }
        if (!/^1[3-9]\d{9}$/.test(this.phoneNumber)) {
          uni.showToast({
            title: "请输入正确的手机号",
            icon: "none"
          });
          return false;
        }
        if (!this.password) {
          uni.showToast({
            title: "请输入密码",
            icon: "none"
          });
          return false;
        }
        if (this.password.length < 6) {
          uni.showToast({
            title: "密码长度不能少于6位",
            icon: "none"
          });
          return false;
        }
        if (!this.confirmPassword) {
          uni.showToast({
            title: "请确认密码",
            icon: "none"
          });
          return false;
        }
        if (this.password !== this.confirmPassword) {
          uni.showToast({
            title: "两次输入的密码不一致",
            icon: "none"
          });
          return false;
        }
        if (!this.verificationCode) {
          uni.showToast({
            title: "请输入验证码",
            icon: "none"
          });
          return false;
        }
        return true;
      }
    }
  };
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createCommentVNode(" 背景渐变 "),
      vue.createElementVNode("view", { class: "background-gradient" }),
      vue.createCommentVNode(" 注册卡片 "),
      vue.createElementVNode("view", { class: "register-card" }, [
        vue.createCommentVNode(" 标题 "),
        vue.createElementVNode("view", { class: "register-title" }, "骑手注册"),
        vue.createCommentVNode(" 表单区域 "),
        vue.createElementVNode("view", { class: "form-container" }, [
          vue.createCommentVNode(" 手机号输入 "),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "手机号"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input-field",
                type: "number",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.phoneNumber = $event),
                placeholder: "请输入手机号",
                maxlength: "11"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.phoneNumber]
            ])
          ]),
          vue.createCommentVNode(" 设置密码输入 "),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "设置密码"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "input-field",
              type: $data.showPassword ? "text" : "password",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.password = $event),
              placeholder: "请输入密码"
            }, null, 8, ["type"]), [
              [vue.vModelDynamic, $data.password]
            ])
          ]),
          vue.createCommentVNode(" 确认密码输入 "),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "确认密码"),
            vue.withDirectives(vue.createElementVNode("input", {
              class: "input-field",
              type: $data.showConfirmPassword ? "text" : "password",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.confirmPassword = $event),
              placeholder: "请确认密码"
            }, null, 8, ["type"]), [
              [vue.vModelDynamic, $data.confirmPassword]
            ])
          ]),
          vue.createCommentVNode(" 验证码输入 "),
          vue.createElementVNode("view", { class: "input-group" }, [
            vue.createElementVNode("text", { class: "input-label" }, "验证码"),
            vue.createElementVNode("view", { class: "verification-code-container" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  class: "verification-input",
                  type: "text",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.verificationCode = $event),
                  placeholder: "请输入验证码",
                  maxlength: "6"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.verificationCode]
              ]),
              vue.createElementVNode("view", { class: "captcha-container" }, [
                vue.createElementVNode("image", {
                  src: $data.captchaImage,
                  class: "captcha-image",
                  onClick: _cache[4] || (_cache[4] = (...args) => $options.refreshCaptcha && $options.refreshCaptcha(...args)),
                  mode: "aspectFit"
                }, null, 8, ["src"])
              ])
            ])
          ]),
          vue.createCommentVNode(" 按钮区域 "),
          vue.createElementVNode("view", { class: "button-group" }, [
            vue.createElementVNode("button", {
              class: "register-btn",
              onClick: _cache[5] || (_cache[5] = (...args) => $options.handleRegister && $options.handleRegister(...args))
            }, "注册"),
            vue.createElementVNode("button", {
              class: "login-btn",
              onClick: _cache[6] || (_cache[6] = (...args) => $options.handleLogin && $options.handleLogin(...args))
            }, "返回登录")
          ])
        ])
      ])
    ]);
  }
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__scopeId", "data-v-bac4a35d"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/register/register.vue"]]);
  const _sfc_main$j = {
    name: "Tabbar",
    props: {
      current: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        list: [
          {
            text: "订单",
            pagePath: "/pages/order/order"
          },
          {
            text: "路线",
            pagePath: "/pages/route/route"
          },
          {
            text: "消息",
            pagePath: "/pages/message/message"
          },
          {
            text: "我的",
            pagePath: "/pages/index/index"
          }
        ]
      };
    },
    methods: {
      switchTab(index) {
        if (this.current === index)
          return;
        const item = this.list[index];
        uni.navigateTo({
          url: item.pagePath
        });
      }
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "tabbar" }, [
      (vue.openBlock(true), vue.createElementBlock(
        vue.Fragment,
        null,
        vue.renderList($data.list, (item, index) => {
          return vue.openBlock(), vue.createElementBlock("view", {
            key: index,
            class: "tabbar-item",
            onClick: ($event) => $options.switchTab(index)
          }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["tabbar-icon", { "active": $props.current === index }])
              },
              [
                vue.createCommentVNode(" 订单图标 "),
                index === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "icon icon-order"
                }, [
                  vue.createElementVNode("view", { class: "icon-rect" }),
                  vue.createElementVNode("view", { class: "icon-line1" }),
                  vue.createElementVNode("view", { class: "icon-line2" }),
                  vue.createElementVNode("view", { class: "icon-line3" })
                ])) : index === 1 ? (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 1 },
                  [
                    vue.createCommentVNode(" 路线图标 "),
                    vue.createElementVNode("view", { class: "icon icon-route" }, [
                      vue.createElementVNode("view", { class: "route-pin" }),
                      vue.createElementVNode("view", { class: "route-circle" })
                    ])
                  ],
                  2112
                  /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                )) : index === 2 ? (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 2 },
                  [
                    vue.createCommentVNode(" 消息图标 "),
                    vue.createElementVNode("view", { class: "icon icon-message" }, [
                      vue.createElementVNode("view", { class: "message-bubble" }),
                      vue.createElementVNode("view", { class: "message-dot1" }),
                      vue.createElementVNode("view", { class: "message-dot2" }),
                      vue.createElementVNode("view", { class: "message-dot3" })
                    ])
                  ],
                  2112
                  /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                )) : (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 3 },
                  [
                    vue.createCommentVNode(" 我的图标 "),
                    vue.createElementVNode("view", { class: "icon icon-user" }, [
                      vue.createElementVNode("view", { class: "user-head" }),
                      vue.createElementVNode("view", { class: "user-body" })
                    ])
                  ],
                  2112
                  /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
                ))
              ],
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["tabbar-text", { "active": $props.current === index }])
              },
              vue.toDisplayString(item.text),
              3
              /* TEXT, CLASS */
            )
          ], 8, ["onClick"]);
        }),
        128
        /* KEYED_FRAGMENT */
      ))
    ]);
  }
  const Tabbar = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__scopeId", "data-v-e9b92a61"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/components/tabbar/tabbar.vue"]]);
  const _sfc_main$i = {
    data() {
      return {
        isReceiving: true,
        // 是否接单中
        activeTab: "new",
        tabs: [
          { key: "new", name: "新任务" },
          { key: "pickup", name: "待取货" },
          { key: "delivery", name: "待送达" }
        ],
        orders: [
          {
            id: "ORD2024123456",
            merchant: "星巴克咖啡（人民广场店）",
            address: "上海市黄浦区南京东路123号",
            deliveryTime: "30分钟内",
            type: "takeout",
            typeText: "外卖",
            status: "new"
          },
          {
            id: "ORD2024123459",
            merchant: "必胜客（陆家嘴店）",
            address: "上海市浦东新区陆家嘴环路1000号",
            deliveryTime: "45分钟内",
            type: "takeout",
            typeText: "外卖",
            status: "new"
          },
          {
            id: "RUN2024123001",
            merchant: "文件取送服务",
            address: "上海市浦东新区世纪大道88号金茂大厦",
            deliveryTime: "1小时内",
            type: "express",
            typeText: "跑腿",
            status: "new"
          },
          {
            id: "ORD2024123450",
            merchant: "麦当劳（淮海路店）",
            address: "上海市徐汇区淮海中路456号",
            deliveryTime: "25分钟内",
            type: "takeout",
            typeText: "外卖",
            status: "pickup"
          },
          {
            id: "ORD2024123448",
            merchant: "肯德基（静安寺店）",
            address: "上海市静安区南京西路789号",
            deliveryTime: "20分钟内",
            type: "takeout",
            typeText: "外卖",
            status: "delivery"
          }
        ]
      };
    },
    onLoad() {
      const cachedStatus = uni.getStorageSync("riderStatus");
      if (cachedStatus !== "") {
        this.isReceiving = cachedStatus;
      }
    },
    computed: {
      filteredOrders() {
        if (!this.isReceiving && this.activeTab === "new") {
          return [];
        }
        return this.orders.filter((order) => order.status === this.activeTab);
      }
    },
    methods: {
      // 更新骑手接单状态（暂时使用本地存储，后端API就绪后再对接）
      updateRiderStatus(status) {
        uni.setStorageSync("riderStatus", status);
        return true;
      },
      toggleStatus() {
        if (this.isReceiving) {
          uni.showModal({
            title: "提示",
            content: "是否休息？休息期间将不再接收新订单",
            success: (res) => {
              if (res.confirm) {
                this.updateRiderStatus(false);
                this.isReceiving = false;
                uni.showToast({
                  title: "已进入休息模式",
                  icon: "success"
                });
              }
            }
          });
        } else {
          this.updateRiderStatus(true);
          this.isReceiving = true;
          uni.showToast({
            title: "开始接单",
            icon: "success"
          });
        }
      },
      startReceiving() {
        this.updateRiderStatus(true);
        this.isReceiving = true;
        uni.showToast({
          title: "开始接单",
          icon: "success"
        });
      },
      switchTab(tabKey) {
        this.activeTab = tabKey;
      },
      viewDetail(order) {
        uni.showToast({
          title: "查看订单详情",
          icon: "none"
        });
      },
      contactMerchant(order) {
        uni.showModal({
          title: "联系商家",
          content: `商家：${order.merchant}
地址：${order.address}`,
          confirmText: "拨打电话",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              uni.makePhoneCall({
                phoneNumber: "13800138000"
                // 这里应该从订单数据中获取商家电话
              });
            }
          }
        });
      },
      contactCustomer(order) {
        uni.showModal({
          title: "联系顾客",
          content: `配送地址：${order.address}`,
          confirmText: "拨打电话",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              uni.makePhoneCall({
                phoneNumber: "13900139000"
                // 这里应该从订单数据中获取顾客电话
              });
            }
          }
        });
      },
      acceptOrder(order) {
        let title = "";
        let content = "";
        let successMsg = "";
        let nextStatus = "";
        if (this.activeTab === "new") {
          title = "确认接单";
          content = `确定要接受订单 ${order.id} 吗？`;
          successMsg = "接单成功";
          nextStatus = "pickup";
        } else if (this.activeTab === "pickup") {
          title = "确认取货";
          content = `确定已取到订单 ${order.id} 的货物吗？`;
          successMsg = "取货成功，请尽快送达";
          nextStatus = "delivery";
        } else if (this.activeTab === "delivery") {
          title = "确认送达";
          content = `确定订单 ${order.id} 已送达吗？`;
          successMsg = "订单已完成";
          nextStatus = "completed";
        }
        uni.showModal({
          title,
          content,
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: successMsg,
                icon: "success"
              });
              const orderIndex = this.orders.findIndex((o) => o.id === order.id);
              if (orderIndex !== -1) {
                this.orders[orderIndex].status = nextStatus;
              }
            }
          }
        });
      }
    }
  };
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_tabbar = resolveEasycom(vue.resolveDynamicComponent("tabbar"), Tabbar);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部标题栏 "),
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "header-title" }, "骑手工作台"),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["status-btn", $data.isReceiving ? "receiving" : "resting"]),
            onClick: _cache[0] || (_cache[0] = (...args) => $options.toggleStatus && $options.toggleStatus(...args))
          },
          [
            vue.createElementVNode(
              "text",
              { class: "status-icon" },
              vue.toDisplayString($data.isReceiving ? "⚡" : "💤"),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "status-text" },
              vue.toDisplayString($data.isReceiving ? "接单中" : "休息中"),
              1
              /* TEXT */
            )
          ],
          2
          /* CLASS */
        )
      ]),
      vue.createCommentVNode(" 标签导航 "),
      vue.createElementVNode("view", { class: "tabs" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.tabs, (tab) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: vue.normalizeClass(["tab-item", { active: $data.activeTab === tab.key }]),
              key: tab.key,
              onClick: ($event) => $options.switchTab(tab.key)
            }, [
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString(tab.name),
                1
                /* TEXT */
              )
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 订单列表 "),
      vue.createElementVNode("view", { class: "orders-list" }, [
        vue.createCommentVNode(" 休息状态提示 "),
        !$data.isReceiving && $data.activeTab === "new" && $options.filteredOrders.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "rest-hint"
        }, [
          vue.createElementVNode("text", { class: "rest-icon" }, "🌙"),
          vue.createElementVNode("text", { class: "rest-title" }, "您当前处于休息状态"),
          vue.createElementVNode("text", { class: "rest-desc" }, "点击下方按钮开始接单"),
          vue.createElementVNode("button", {
            class: "start-btn",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.startReceiving && $options.startReceiving(...args))
          }, "开始接单")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 订单卡片 "),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.filteredOrders, (order, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "order-card",
              key: index
            }, [
              vue.createElementVNode("view", { class: "order-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "order-id" },
                  vue.toDisplayString(order.id),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["order-tag", order.type])
                  },
                  vue.toDisplayString(order.typeText),
                  3
                  /* TEXT, CLASS */
                )
              ]),
              vue.createElementVNode("view", { class: "order-info" }, [
                vue.createElementVNode("view", { class: "info-row" }, [
                  vue.createElementVNode("view", { class: "icon-wrapper merchant" }, [
                    vue.createElementVNode("text", { class: "icon-dot" }, "●")
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "info-text" },
                    vue.toDisplayString(order.merchant),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "info-row" }, [
                  vue.createElementVNode("view", { class: "icon-wrapper address" }, [
                    vue.createElementVNode("text", { class: "icon-dot" }, "📍")
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "info-text" },
                    vue.toDisplayString(order.address),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "info-row" }, [
                  vue.createElementVNode("view", { class: "icon-wrapper time" }, [
                    vue.createElementVNode("text", { class: "icon-dot" }, "⏰")
                  ]),
                  vue.createElementVNode(
                    "text",
                    { class: "info-text" },
                    "预计送达: " + vue.toDisplayString(order.deliveryTime),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "order-footer" }, [
                vue.createCommentVNode(" 新任务：查看详情 + 立即接单 "),
                $data.activeTab === "new" ? (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 0 },
                  [
                    vue.createElementVNode("button", {
                      class: "detail-btn",
                      onClick: ($event) => $options.viewDetail(order)
                    }, "查看详情", 8, ["onClick"]),
                    vue.createElementVNode("button", {
                      class: "accept-btn",
                      onClick: ($event) => $options.acceptOrder(order)
                    }, "立即接单", 8, ["onClick"])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : $data.activeTab === "pickup" ? (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 1 },
                  [
                    vue.createCommentVNode(" 待取货：联系商家 + 确认取货 "),
                    vue.createElementVNode("button", {
                      class: "contact-btn",
                      onClick: ($event) => $options.contactMerchant(order)
                    }, "联系商家", 8, ["onClick"]),
                    vue.createElementVNode("button", {
                      class: "accept-btn",
                      onClick: ($event) => $options.acceptOrder(order)
                    }, "确认取货", 8, ["onClick"])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : $data.activeTab === "delivery" ? (vue.openBlock(), vue.createElementBlock(
                  vue.Fragment,
                  { key: 2 },
                  [
                    vue.createCommentVNode(" 待送达：联系顾客 + 确认送达 "),
                    vue.createElementVNode("button", {
                      class: "contact-btn",
                      onClick: ($event) => $options.contactCustomer(order)
                    }, "联系顾客", 8, ["onClick"]),
                    vue.createElementVNode("button", {
                      class: "accept-btn",
                      onClick: ($event) => $options.acceptOrder(order)
                    }, "确认送达", 8, ["onClick"])
                  ],
                  64
                  /* STABLE_FRAGMENT */
                )) : vue.createCommentVNode("v-if", true)
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createVNode(_component_tabbar, { current: 0 })
    ]);
  }
  const PagesOrderOrder = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__scopeId", "data-v-93207a4f"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/order/order.vue"]]);
  const _sfc_main$h = {
    data() {
      return {};
    }
  };
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_tabbar = resolveEasycom(vue.resolveDynamicComponent("tabbar"), Tabbar);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "placeholder-content" }, [
        vue.createElementVNode("text", { class: "placeholder-icon" }, "🗺️"),
        vue.createElementVNode("text", { class: "placeholder-text" }, "路线页面"),
        vue.createElementVNode("text", { class: "placeholder-desc" }, "开发中...")
      ]),
      vue.createVNode(_component_tabbar, { current: 1 })
    ]);
  }
  const PagesRouteRoute = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-9b6e348a"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/route/route.vue"]]);
  const _sfc_main$g = {
    data() {
      return {};
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_tabbar = resolveEasycom(vue.resolveDynamicComponent("tabbar"), Tabbar);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "placeholder-content" }, [
        vue.createElementVNode("text", { class: "placeholder-icon" }, "💬"),
        vue.createElementVNode("text", { class: "placeholder-text" }, "消息页面"),
        vue.createElementVNode("text", { class: "placeholder-desc" }, "开发中...")
      ]),
      vue.createVNode(_component_tabbar, { current: 2 })
    ]);
  }
  const PagesMessageMessage = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-4c1b26cf"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/message/message.vue"]]);
  const PROFILE_API = {
    RIDER_BASE_INFO: "/api/rider/base/info",
    // 查询骑手基本信息
    RIDER_BASE_UPDATE: "/api/rider/base/update"
    // 修改骑手基本信息
  };
  async function request(options) {
    const {
      url,
      method = "GET",
      data = {},
      headers = {},
      needAuth = true
    } = options;
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const requestHeaders = {
      "Content-Type": "application/json",
      ...headers
    };
    if (needAuth) {
      const token = uni.getStorageSync("token");
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }
    try {
      uni.showLoading({
        title: "加载中...",
        mask: true
      });
      const response = await new Promise((resolve, reject) => {
        uni.request({
          url: fullUrl,
          method: method.toUpperCase(),
          data: method.toUpperCase() === "GET" ? {} : data,
          header: requestHeaders,
          success: (res) => {
            resolve(res);
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
      uni.hideLoading();
      return handleResponse(response.data);
    } catch (error) {
      uni.hideLoading();
      formatAppLog("error", "at utils/profile-api.js:79", "请求失败:", error);
      uni.showToast({
        title: "网络请求失败",
        icon: "none",
        duration: 2e3
      });
      throw error;
    }
  }
  async function requestForm(options) {
    const {
      url,
      method = "POST",
      data,
      headers = {},
      needAuth = true
    } = options;
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const requestHeaders = {
      ...headers
    };
    if (needAuth) {
      const token = uni.getStorageSync("token");
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }
    try {
      uni.showLoading({
        title: "加载中...",
        mask: true
      });
      const formDataObj = {};
      if (data instanceof FormData) {
        for (let [key, value] of data.entries()) {
          formDataObj[key] = value;
        }
      } else {
        Object.assign(formDataObj, data);
      }
      const response = await new Promise((resolve, reject) => {
        uni.request({
          url: fullUrl,
          method: method.toUpperCase(),
          data: formDataObj,
          header: requestHeaders,
          success: (res) => {
            resolve(res);
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
      uni.hideLoading();
      return handleResponse(response.data);
    } catch (error) {
      uni.hideLoading();
      formatAppLog("error", "at utils/profile-api.js:162", "表单请求失败:", error);
      uni.showToast({
        title: "网络请求失败",
        icon: "none",
        duration: 2e3
      });
      throw error;
    }
  }
  function handleResponse(result) {
    if (result.code === 200) {
      return result;
    }
    if (result.code === 401) {
      handleTokenExpired();
      throw new Error(result.msg || "Token已过期，请重新登录");
    }
    uni.showToast({
      title: result.msg || "请求失败",
      icon: "none",
      duration: 2e3
    });
    throw new Error(result.msg || "请求失败");
  }
  function handleTokenExpired() {
    uni.removeStorageSync("token");
    uni.removeStorageSync("userType");
    uni.removeStorageSync("identity");
    uni.removeStorageSync("identityKey");
    uni.showToast({
      title: "登录已过期，请重新登录",
      icon: "none",
      duration: 2e3
    });
    setTimeout(() => {
      uni.redirectTo({
        url: "/pages/login/login"
      });
    }, 2e3);
  }
  async function getRiderBaseInfo() {
    return request({
      url: PROFILE_API.RIDER_BASE_INFO,
      method: "GET"
    });
  }
  async function updateRiderBaseInfo(data) {
    formatAppLog("log", "at utils/profile-api.js:247", "🚀 updateRiderBaseInfo 调用参数:", data);
    if (data.avatarPath) {
      formatAppLog("log", "at utils/profile-api.js:251", "📁 使用文件上传方式");
      return uploadRiderInfo(data);
    }
    const { avatarPath, ...requestData } = data;
    formatAppLog("log", "at utils/profile-api.js:257", "📝 发送表单请求数据:", requestData);
    formatAppLog("log", "at utils/profile-api.js:258", "🔗 请求URL:", PROFILE_API.RIDER_BASE_UPDATE);
    const formData = new FormData();
    if (requestData.nickname)
      formData.append("nickname", requestData.nickname);
    if (requestData.phone)
      formData.append("phone", requestData.phone);
    formatAppLog("log", "at utils/profile-api.js:265", "📋 FormData内容:", {
      nickname: requestData.nickname,
      phone: requestData.phone
    });
    const result = await requestForm({
      url: PROFILE_API.RIDER_BASE_UPDATE,
      method: "POST",
      data: formData
    });
    formatAppLog("log", "at utils/profile-api.js:276", "✅ 后端响应结果:", result);
    return result;
  }
  async function uploadRiderInfo(data) {
    const { avatarPath, nickname, phone } = data;
    const token = uni.getStorageSync("token");
    const fullUrl = `${API_BASE_URL}${PROFILE_API.RIDER_BASE_UPDATE}`;
    return new Promise((resolve, reject) => {
      try {
        uni.showLoading({
          title: "上传中...",
          mask: true
        });
        const formData = {};
        if (nickname)
          formData.nickname = nickname;
        if (phone)
          formData.phone = phone;
        uni.uploadFile({
          url: fullUrl,
          filePath: avatarPath,
          name: "avatar",
          // 后端接收的文件字段名
          formData,
          header: {
            "Authorization": token ? `Bearer ${token}` : ""
          },
          success: (uploadRes) => {
            uni.hideLoading();
            try {
              const result = JSON.parse(uploadRes.data);
              if (result.code === 200) {
                uni.showToast({
                  title: result.msg || "修改成功",
                  icon: "success",
                  duration: 2e3
                });
                resolve(result);
              } else if (result.code === 401) {
                handleTokenExpired();
                reject(new Error(result.msg || "Token已过期"));
              } else {
                uni.showToast({
                  title: result.msg || "修改失败",
                  icon: "none",
                  duration: 2e3
                });
                reject(new Error(result.msg));
              }
            } catch (parseError) {
              formatAppLog("error", "at utils/profile-api.js:344", "解析响应失败:", parseError);
              uni.showToast({
                title: "响应数据解析失败",
                icon: "none",
                duration: 2e3
              });
              reject(parseError);
            }
          },
          fail: (error) => {
            uni.hideLoading();
            formatAppLog("error", "at utils/profile-api.js:355", "上传失败:", error);
            uni.showToast({
              title: "上传失败",
              icon: "none",
              duration: 2e3
            });
            reject(error);
          }
        });
      } catch (error) {
        uni.hideLoading();
        reject(error);
      }
    });
  }
  const _sfc_main$f = {
    data() {
      return {
        userInfo: {
          name: "未设置",
          // 显示骑手昵称
          rating: 4.8,
          todayOrders: 15,
          todayIncome: 256.8,
          avatar: "/static/logo.png"
        },
        loading: false
      };
    },
    onLoad() {
      this.loadRiderInfo();
    },
    onShow() {
      this.loadRiderInfo();
    },
    methods: {
      // 加载骑手信息
      async loadRiderInfo() {
        if (this.loading)
          return;
        this.loading = true;
        try {
          const response = await getRiderBaseInfo();
          if (response.code === 200 && response.data) {
            const data = response.data;
            formatAppLog("log", "at pages/index/index.vue:126", "🏠 个人中心获取到的数据:", data);
            this.userInfo = {
              ...this.userInfo,
              name: data.nickname || data.realName || "未设置",
              avatar: data.avatar || "/static/logo.png"
            };
            formatAppLog("log", "at pages/index/index.vue:135", "📱 个人中心更新后的用户信息:", this.userInfo);
            uni.setStorageSync("riderInfo", {
              nickname: data.nickname,
              realName: data.realName,
              avatar: data.avatar,
              phone: data.phone,
              riderBaseId: data.riderBaseId,
              accountStatus: data.accountStatus,
              creditScore: data.creditScore,
              createTime: data.createTime
            });
          } else {
            this.loadFromCache();
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:153", "个人中心获取骑手信息失败:", error);
          this.loadFromCache();
        } finally {
          this.loading = false;
        }
      },
      // 从本地缓存加载数据
      loadFromCache() {
        try {
          const riderInfo = uni.getStorageSync("riderInfo");
          if (riderInfo) {
            this.userInfo = {
              ...this.userInfo,
              name: riderInfo.nickname || riderInfo.realName || "未设置",
              avatar: riderInfo.avatar || "/static/logo.png"
            };
            formatAppLog("log", "at pages/index/index.vue:171", "💾 从缓存加载的用户信息:", this.userInfo);
          }
        } catch (e) {
          formatAppLog("log", "at pages/index/index.vue:174", "获取缓存信息失败:", e);
        }
      },
      goToOrders() {
        uni.navigateTo({ url: "/pages/orders/orders" });
      },
      goToWallet() {
        uni.navigateTo({ url: "/pages/wallet/wallet" });
      },
      handleService(type) {
        if (type === "profile") {
          uni.navigateTo({ url: "/pages/profile/profile" });
          return;
        }
        if (type === "security") {
          uni.navigateTo({ url: "/pages/security/security" });
          return;
        }
        if (type === "privacy") {
          uni.navigateTo({ url: "/pages/privacy/privacy" });
          return;
        }
        if (type === "certificate") {
          uni.navigateTo({ url: "/pages/certification/certification" });
          return;
        }
        if (type === "faq") {
          uni.navigateTo({ url: "/pages/faq/faq" });
          return;
        }
        if (type === "violation") {
          uni.navigateTo({ url: "/pages/violation/violation" });
          return;
        }
        if (type === "rating") {
          uni.navigateTo({ url: "/pages/rating/rating" });
          return;
        }
      }
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_tabbar = resolveEasycom(vue.resolveDynamicComponent("tabbar"), Tabbar);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 自定义导航栏 "),
      vue.createElementVNode("view", { class: "custom-navbar" }, [
        vue.createElementVNode("text", { class: "navbar-title" }, "个人中心")
      ]),
      vue.createCommentVNode(" 用户信息卡片 "),
      vue.createElementVNode("view", { class: "user-card" }, [
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode("image", {
            class: "avatar",
            src: $data.userInfo.avatar,
            mode: "aspectFill"
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "user-detail" }, [
            vue.createElementVNode(
              "text",
              { class: "username" },
              vue.toDisplayString($data.userInfo.name),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "rating" }, [
              vue.createElementVNode("text", { class: "star" }, "⭐"),
              vue.createElementVNode(
                "text",
                { class: "score" },
                vue.toDisplayString($data.userInfo.rating),
                1
                /* TEXT */
              )
            ])
          ])
        ])
      ]),
      vue.createCommentVNode(" 数据统计卡片 "),
      vue.createElementVNode("view", { class: "stats-card" }, [
        vue.createElementVNode("view", {
          class: "stat-item",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goToOrders && $options.goToOrders(...args))
        }, [
          vue.createElementVNode("text", { class: "stat-number" }, "15"),
          vue.createElementVNode("text", { class: "stat-label" }, "今日完成"),
          vue.createElementVNode("view", { class: "stat-link" }, [
            vue.createElementVNode("text", null, "我的订单"),
            vue.createElementVNode("text", { class: "arrow" }, "〉")
          ])
        ]),
        vue.createElementVNode("view", { class: "divider" }),
        vue.createElementVNode("view", {
          class: "stat-item",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.goToWallet && $options.goToWallet(...args))
        }, [
          vue.createElementVNode("text", { class: "stat-number" }, "256.80"),
          vue.createElementVNode("text", { class: "stat-label" }, "今日收入"),
          vue.createElementVNode("view", { class: "stat-link" }, [
            vue.createElementVNode("text", null, "我的钱包"),
            vue.createElementVNode("text", { class: "arrow" }, "〉")
          ])
        ])
      ]),
      vue.createCommentVNode(" 我的服务 "),
      vue.createElementVNode("view", { class: "service-section" }, [
        vue.createElementVNode("text", { class: "section-title" }, "我的服务"),
        vue.createElementVNode("view", { class: "service-grid" }, [
          vue.createElementVNode("view", {
            class: "service-item",
            onClick: _cache[2] || (_cache[2] = ($event) => $options.handleService("profile"))
          }, [
            vue.createElementVNode("view", { class: "service-icon" }, "✏️"),
            vue.createElementVNode("text", { class: "service-text" }, "个人信息\\n修改")
          ]),
          vue.createElementVNode("view", {
            class: "service-item",
            onClick: _cache[3] || (_cache[3] = ($event) => $options.handleService("security"))
          }, [
            vue.createElementVNode("view", { class: "service-icon" }, "🛡️"),
            vue.createElementVNode("text", { class: "service-text" }, "账号安全")
          ]),
          vue.createElementVNode("view", {
            class: "service-item",
            onClick: _cache[4] || (_cache[4] = ($event) => $options.handleService("privacy"))
          }, [
            vue.createElementVNode("view", { class: "service-icon" }, "🕵️"),
            vue.createElementVNode("text", { class: "service-text" }, "隐私设置")
          ]),
          vue.createElementVNode("view", {
            class: "service-item",
            onClick: _cache[5] || (_cache[5] = ($event) => $options.handleService("certificate"))
          }, [
            vue.createElementVNode("view", { class: "service-icon" }, "📇"),
            vue.createElementVNode("text", { class: "service-text" }, "资质认证")
          ])
        ]),
        vue.createElementVNode("view", { class: "service-grid" }, [
          vue.createElementVNode("view", {
            class: "service-item",
            onClick: _cache[6] || (_cache[6] = ($event) => $options.handleService("rating"))
          }, [
            vue.createElementVNode("view", { class: "service-icon" }, "⭐"),
            vue.createElementVNode("text", { class: "service-text" }, "服务评价")
          ]),
          vue.createElementVNode("view", {
            class: "service-item",
            onClick: _cache[7] || (_cache[7] = ($event) => $options.handleService("support"))
          }, [
            vue.createElementVNode("view", { class: "service-icon" }, "🎧"),
            vue.createElementVNode("text", { class: "service-text" }, "在线客服")
          ]),
          vue.createElementVNode("view", {
            class: "service-item",
            onClick: _cache[8] || (_cache[8] = ($event) => $options.handleService("faq"))
          }, [
            vue.createElementVNode("view", { class: "service-icon" }, "❓"),
            vue.createElementVNode("text", { class: "service-text" }, "常见问题")
          ]),
          vue.createElementVNode("view", {
            class: "service-item",
            onClick: _cache[9] || (_cache[9] = ($event) => $options.handleService("violation"))
          }, [
            vue.createElementVNode("view", { class: "service-icon" }, "⚠️"),
            vue.createElementVNode("text", { class: "service-text" }, "违规申诉")
          ])
        ])
      ]),
      vue.createVNode(_component_tabbar, { current: 3 })
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/index/index.vue"]]);
  const _sfc_main$e = {
    methods: {
      goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack({ delta: 1 });
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      },
      handleItem(type) {
        if (type === "password") {
          uni.navigateTo({
            url: "/pages/security/password-edit"
          });
          return;
        }
        if (type === "payment") {
          uni.navigateTo({
            url: "/pages/security/payment-password"
          });
          return;
        }
        uni.showToast({
          title: "功能开发中",
          icon: "none"
        });
      },
      async handleLogout() {
        uni.showModal({
          title: "确认退出",
          content: "退出后将无法接收订单通知，确认退出登录吗？",
          confirmColor: "#ff6b6b",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({
                  title: "退出中...",
                  mask: true
                });
                await logout();
                uni.removeStorageSync("token");
                uni.removeStorageSync("userType");
                uni.removeStorageSync("identity");
                uni.removeStorageSync("identityKey");
                uni.removeStorageSync("userInfo");
                uni.hideLoading();
                uni.showToast({
                  title: "已退出登录",
                  icon: "success",
                  duration: 1500
                });
                setTimeout(() => {
                  uni.reLaunch({
                    url: "/pages/login/login"
                  });
                }, 1500);
              } catch (error) {
                uni.hideLoading();
                formatAppLog("error", "at pages/security/security.vue:176", "退出登录失败:", error);
                uni.removeStorageSync("token");
                uni.removeStorageSync("userType");
                uni.removeStorageSync("identity");
                uni.removeStorageSync("identityKey");
                uni.removeStorageSync("userInfo");
                uni.showToast({
                  title: "已退出登录",
                  icon: "success",
                  duration: 1500
                });
                setTimeout(() => {
                  uni.reLaunch({
                    url: "/pages/login/login"
                  });
                }, 1500);
              }
            }
          }
        });
      }
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 自定义导航栏 "),
      vue.createElementVNode("view", { class: "custom-navbar" }, [
        vue.createElementVNode("view", {
          class: "navbar-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "navbar-title" }, "账号安全"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 安全等级卡片 "),
      vue.createElementVNode("view", { class: "security-level-card" }, [
        vue.createElementVNode("view", { class: "level-header" }, [
          vue.createElementVNode("view", { class: "shield-icon" }, "🛡️"),
          vue.createElementVNode("view", { class: "level-info" }, [
            vue.createElementVNode("text", { class: "level-title" }, "安全等级"),
            vue.createElementVNode("text", { class: "level-status" }, "良好")
          ]),
          vue.createElementVNode("view", { class: "level-score" }, [
            vue.createElementVNode("text", { class: "score-number" }, "85"),
            vue.createElementVNode("text", { class: "score-total" }, "/100")
          ])
        ]),
        vue.createElementVNode("view", { class: "progress-bar" }, [
          vue.createElementVNode("view", {
            class: "progress-fill",
            style: { width: "85%" }
          })
        ]),
        vue.createElementVNode("text", { class: "level-tip" }, "建议完善更多安全设置以提高账号安全性")
      ]),
      vue.createCommentVNode(" 账号信息 "),
      vue.createElementVNode("view", { class: "info-section" }, [
        vue.createElementVNode("text", { class: "section-title" }, "账号信息"),
        vue.createElementVNode("view", { class: "info-list" }, [
          vue.createElementVNode("view", {
            class: "info-item",
            onClick: _cache[1] || (_cache[1] = ($event) => $options.handleItem("password"))
          }, [
            vue.createElementVNode("view", { class: "info-icon password-icon" }),
            vue.createElementVNode("view", { class: "info-content" }, [
              vue.createElementVNode("text", { class: "info-label" }, "登录密码"),
              vue.createElementVNode("text", { class: "info-value" }, "已设置")
            ]),
            vue.createElementVNode("text", { class: "info-arrow" }, "〉")
          ]),
          vue.createElementVNode("view", {
            class: "info-item",
            onClick: _cache[2] || (_cache[2] = ($event) => $options.handleItem("payment"))
          }, [
            vue.createElementVNode("view", { class: "info-icon payment-icon" }),
            vue.createElementVNode("view", { class: "info-content" }, [
              vue.createElementVNode("text", { class: "info-label" }, "支付密码"),
              vue.createElementVNode("text", { class: "info-value" }, "已设置")
            ]),
            vue.createElementVNode("text", { class: "info-arrow" }, "〉")
          ])
        ])
      ]),
      vue.createCommentVNode(" 安全验证 "),
      vue.createElementVNode("view", { class: "info-section" }, [
        vue.createElementVNode("text", { class: "section-title" }, "安全验证"),
        vue.createElementVNode("view", { class: "info-list" }, [
          vue.createElementVNode("view", {
            class: "info-item",
            onClick: _cache[3] || (_cache[3] = ($event) => $options.handleItem("2fa"))
          }, [
            vue.createElementVNode("view", { class: "info-icon verify-icon" }),
            vue.createElementVNode("view", { class: "info-content" }, [
              vue.createElementVNode("text", { class: "info-label" }, "两步验证"),
              vue.createElementVNode("text", { class: "info-value warning" }, "未开启")
            ]),
            vue.createElementVNode("view", { class: "recommend-badge" }, "推荐"),
            vue.createElementVNode("text", { class: "info-arrow" }, "〉")
          ]),
          vue.createElementVNode("view", {
            class: "info-item",
            onClick: _cache[4] || (_cache[4] = ($event) => $options.handleItem("face"))
          }, [
            vue.createElementVNode("view", { class: "info-icon face-icon" }),
            vue.createElementVNode("view", { class: "info-content" }, [
              vue.createElementVNode("text", { class: "info-label" }, "人脸识别"),
              vue.createElementVNode("text", { class: "info-value" }, "已开启")
            ]),
            vue.createElementVNode("text", { class: "info-arrow" }, "〉")
          ]),
          vue.createElementVNode("view", {
            class: "info-item",
            onClick: _cache[5] || (_cache[5] = ($event) => $options.handleItem("fingerprint"))
          }, [
            vue.createElementVNode("view", { class: "info-icon finger-icon" }),
            vue.createElementVNode("view", { class: "info-content" }, [
              vue.createElementVNode("text", { class: "info-label" }, "指纹登录"),
              vue.createElementVNode("text", { class: "info-value" }, "已开启")
            ]),
            vue.createElementVNode("text", { class: "info-arrow" }, "〉")
          ])
        ])
      ]),
      vue.createCommentVNode(" 退出登录按钮 "),
      vue.createElementVNode("view", { class: "logout-section" }, [
        vue.createElementVNode("button", {
          class: "logout-btn",
          onClick: _cache[6] || (_cache[6] = (...args) => $options.handleLogout && $options.handleLogout(...args))
        }, "退出登录")
      ])
    ]);
  }
  const PagesSecuritySecurity = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__scopeId", "data-v-841ba230"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/security/security.vue"]]);
  const _sfc_main$d = {
    data() {
      return {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        saving: false
      };
    },
    computed: {
      canSubmit() {
        return this.currentPassword.trim() !== "" && this.newPassword.trim() !== "" && this.confirmPassword.trim() !== "";
      }
    },
    methods: {
      goBack() {
        uni.navigateBack({ delta: 1 });
      },
      // 验证密码格式
      validatePassword(password) {
        if (password.length < 6 || password.length > 20) {
          return "密码长度必须为6-20个字符";
        }
        if (password.includes(" ")) {
          return "密码不能包含空格";
        }
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        if (!hasLetter || !hasNumber) {
          return "密码必须包含字母和数字";
        }
        return null;
      },
      async handleSave() {
        if (!this.currentPassword.trim()) {
          uni.showToast({
            title: "请输入当前密码",
            icon: "none"
          });
          return;
        }
        const passwordError = this.validatePassword(this.newPassword);
        if (passwordError) {
          uni.showToast({
            title: passwordError,
            icon: "none",
            duration: 3e3
          });
          return;
        }
        if (this.newPassword !== this.confirmPassword) {
          uni.showToast({
            title: "两次输入的新密码不一致",
            icon: "none"
          });
          return;
        }
        if (this.newPassword === this.currentPassword) {
          uni.showToast({
            title: "新密码不能与当前密码相同",
            icon: "none"
          });
          return;
        }
        if (this.saving)
          return;
        this.saving = true;
        try {
          await new Promise((resolve) => setTimeout(resolve, 1500));
          uni.showToast({
            title: "密码修改成功",
            icon: "success",
            duration: 2e3
          });
          this.currentPassword = "";
          this.newPassword = "";
          this.confirmPassword = "";
          setTimeout(() => {
            this.goBack();
          }, 2e3);
        } catch (error) {
          formatAppLog("error", "at pages/security/password-edit.vue:187", "修改密码失败:", error);
          let errorMsg = "修改失败，请重试";
          if (error.message && error.message.includes("当前密码")) {
            errorMsg = "当前密码错误";
          } else if (error.message && error.message.includes("密码")) {
            errorMsg = error.message;
          }
          uni.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2e3
          });
        } finally {
          this.saving = false;
        }
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("text", {
          class: "nav-back",
          onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.goBack && $options.goBack(...args), ["stop"]))
        }, "‹"),
        vue.createElementVNode("text", { class: "nav-title" }, "修改登录密码"),
        vue.createElementVNode("text", { class: "nav-placeholder" })
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "当前密码"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                type: "password",
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.currentPassword = $event),
                placeholder: "请输入当前密码",
                "placeholder-class": "placeholder",
                maxlength: "20"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.currentPassword]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "新密码"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                type: "password",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.newPassword = $event),
                placeholder: "请输入新密码",
                "placeholder-class": "placeholder",
                maxlength: "20"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.newPassword]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "label" }, "确认新密码"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                class: "input",
                type: "password",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.confirmPassword = $event),
                placeholder: "请再次输入新密码",
                "placeholder-class": "placeholder",
                maxlength: "20"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.confirmPassword]
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "tips-section" }, [
          vue.createElementVNode("text", { class: "tips-title" }, "密码要求："),
          vue.createElementVNode("text", { class: "tips-item" }, "• 长度为6-20个字符"),
          vue.createElementVNode("text", { class: "tips-item" }, "• 包含字母和数字"),
          vue.createElementVNode("text", { class: "tips-item" }, "• 不能包含空格"),
          vue.createElementVNode("text", { class: "tips-item" }, "• 建议包含大小写字母和特殊字符")
        ])
      ]),
      vue.createElementVNode("view", { class: "bottom-bar" }, [
        vue.createElementVNode("button", {
          class: "save-btn",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.handleSave && $options.handleSave(...args)),
          disabled: $data.saving || !$options.canSubmit
        }, vue.toDisplayString($data.saving ? "修改中..." : "确认修改"), 9, ["disabled"])
      ])
    ]);
  }
  const PagesSecurityPasswordEdit = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-ac94d5ca"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/security/password-edit.vue"]]);
  const _sfc_main$c = {
    data() {
      return {
        hasPaymentPassword: true,
        // 模拟是否已设置支付密码
        showPasswordModal: false,
        modalType: "",
        // 'set', 'change', 'reset'
        modalTitle: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        showConfirmPassword: false,
        currentStep: 1,
        // 1: 输入当前密码, 2: 输入新密码, 3: 确认新密码
        keyboardLayout: [
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
          ["", "0", "delete"]
        ]
      };
    },
    methods: {
      goBack() {
        uni.navigateBack({ delta: 1 });
      },
      handleSetPassword() {
        this.modalType = "set";
        this.modalTitle = "设置支付密码";
        this.showConfirmPassword = false;
        this.currentStep = 1;
        this.resetPasswordInputs();
        this.showPasswordModal = true;
      },
      handleChangePassword() {
        this.modalType = "change";
        this.modalTitle = "修改支付密码";
        this.showConfirmPassword = false;
        this.currentStep = 1;
        this.resetPasswordInputs();
        this.showPasswordModal = true;
      },
      handleResetPassword() {
        uni.showModal({
          title: "重置支付密码",
          content: "重置支付密码需要验证身份信息，是否继续？",
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: "功能开发中",
                icon: "none"
              });
            }
          }
        });
      },
      closeModal() {
        this.showPasswordModal = false;
        this.resetPasswordInputs();
      },
      resetPasswordInputs() {
        this.currentPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
        this.currentStep = 1;
        this.showConfirmPassword = false;
      },
      handleKeyPress(key) {
        if (key === "" || key === void 0)
          return;
        if (key === "delete") {
          this.handleDelete();
        } else {
          this.handleNumberInput(key);
        }
      },
      handleDelete() {
        if (this.modalType === "change" && this.currentStep === 1) {
          if (this.currentPassword.length > 0) {
            this.currentPassword = this.currentPassword.slice(0, -1);
          }
        } else if (this.currentStep === 2 || this.modalType === "set" && this.currentStep === 1) {
          if (this.newPassword.length > 0) {
            this.newPassword = this.newPassword.slice(0, -1);
          }
        } else if (this.currentStep === 3) {
          if (this.confirmPassword.length > 0) {
            this.confirmPassword = this.confirmPassword.slice(0, -1);
          }
        }
      },
      handleNumberInput(number) {
        if (this.modalType === "change" && this.currentStep === 1) {
          if (this.currentPassword.length < 6) {
            this.currentPassword += number;
            if (this.currentPassword.length === 6) {
              this.verifyCurrentPassword();
            }
          }
        } else if (this.currentStep === 2 || this.modalType === "set" && this.currentStep === 1) {
          if (this.newPassword.length < 6) {
            this.newPassword += number;
            if (this.newPassword.length === 6) {
              this.handleNewPasswordComplete();
            }
          }
        } else if (this.currentStep === 3) {
          if (this.confirmPassword.length < 6) {
            this.confirmPassword += number;
            if (this.confirmPassword.length === 6) {
              this.handleConfirmPasswordComplete();
            }
          }
        }
      },
      verifyCurrentPassword() {
        setTimeout(() => {
          {
            this.currentStep = 2;
            this.currentPassword = "";
          }
        }, 300);
      },
      handleNewPasswordComplete() {
        setTimeout(() => {
          if (this.modalType === "set") {
            this.showConfirmPassword = true;
            this.currentStep = 3;
          } else {
            this.showConfirmPassword = true;
            this.currentStep = 3;
          }
        }, 300);
      },
      handleConfirmPasswordComplete() {
        setTimeout(() => {
          if (this.newPassword === this.confirmPassword) {
            this.submitPassword();
          } else {
            uni.showToast({
              title: "两次输入的密码不一致",
              icon: "none"
            });
            this.confirmPassword = "";
          }
        }, 300);
      },
      submitPassword() {
        uni.showLoading({
          title: "设置中...",
          mask: true
        });
        setTimeout(() => {
          uni.hideLoading();
          const successMsg = this.modalType === "set" ? "支付密码设置成功" : "支付密码修改成功";
          uni.showToast({
            title: successMsg,
            icon: "success",
            duration: 2e3
          });
          if (this.modalType === "set") {
            this.hasPaymentPassword = true;
          }
          this.closeModal();
        }, 1500);
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("text", {
          class: "nav-back",
          onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.goBack && $options.goBack(...args), ["stop"]))
        }, "‹"),
        vue.createElementVNode("text", { class: "nav-title" }, "支付密码"),
        vue.createElementVNode("text", { class: "nav-placeholder" })
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createCommentVNode(" 当前状态卡片 "),
        vue.createElementVNode("view", { class: "status-card" }, [
          vue.createElementVNode("view", { class: "status-icon" }, [
            vue.createElementVNode("text", { class: "icon" }, "🔒")
          ]),
          vue.createElementVNode("view", { class: "status-info" }, [
            vue.createElementVNode("text", { class: "status-title" }, "支付密码状态"),
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["status-desc", $data.hasPaymentPassword ? "enabled" : "disabled"])
              },
              vue.toDisplayString($data.hasPaymentPassword ? "已设置" : "未设置"),
              3
              /* TEXT, CLASS */
            )
          ])
        ]),
        vue.createCommentVNode(" 功能选项 "),
        vue.createElementVNode("view", { class: "options-section" }, [
          !$data.hasPaymentPassword ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "option-item",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.handleSetPassword && $options.handleSetPassword(...args))
          }, [
            vue.createElementVNode("view", { class: "option-icon set-icon" }),
            vue.createElementVNode("view", { class: "option-content" }, [
              vue.createElementVNode("text", { class: "option-title" }, "设置支付密码"),
              vue.createElementVNode("text", { class: "option-desc" }, "设置6位数字支付密码")
            ]),
            vue.createElementVNode("text", { class: "option-arrow" }, "〉")
          ])) : vue.createCommentVNode("v-if", true),
          $data.hasPaymentPassword ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "option-item",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.handleChangePassword && $options.handleChangePassword(...args))
          }, [
            vue.createElementVNode("view", { class: "option-icon change-icon" }),
            vue.createElementVNode("view", { class: "option-content" }, [
              vue.createElementVNode("text", { class: "option-title" }, "修改支付密码"),
              vue.createElementVNode("text", { class: "option-desc" }, "修改当前支付密码")
            ]),
            vue.createElementVNode("text", { class: "option-arrow" }, "〉")
          ])) : vue.createCommentVNode("v-if", true),
          $data.hasPaymentPassword ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "option-item",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.handleResetPassword && $options.handleResetPassword(...args))
          }, [
            vue.createElementVNode("view", { class: "option-icon reset-icon" }),
            vue.createElementVNode("view", { class: "option-content" }, [
              vue.createElementVNode("text", { class: "option-title" }, "重置支付密码"),
              vue.createElementVNode("text", { class: "option-desc" }, "忘记密码时重新设置")
            ]),
            vue.createElementVNode("text", { class: "option-arrow" }, "〉")
          ])) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 安全提示 "),
        vue.createElementVNode("view", { class: "tips-section" }, [
          vue.createElementVNode("view", { class: "tips-header" }, [
            vue.createElementVNode("text", { class: "tips-icon" }, "💡"),
            vue.createElementVNode("text", { class: "tips-title" }, "安全提示")
          ]),
          vue.createElementVNode("text", { class: "tips-item" }, "• 支付密码用于确认支付和提现操作"),
          vue.createElementVNode("text", { class: "tips-item" }, "• 请设置6位数字密码，避免使用生日等简单数字"),
          vue.createElementVNode("text", { class: "tips-item" }, "• 不要将支付密码告诉他人"),
          vue.createElementVNode("text", { class: "tips-item" }, "• 建议定期更换支付密码")
        ])
      ]),
      vue.createCommentVNode(" 密码输入弹窗 "),
      $data.showPasswordModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "password-modal",
        onClick: _cache[6] || (_cache[6] = (...args) => $options.closeModal && $options.closeModal(...args))
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[5] || (_cache[5] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString($data.modalTitle),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", {
              class: "modal-close",
              onClick: _cache[4] || (_cache[4] = (...args) => $options.closeModal && $options.closeModal(...args))
            }, "✕")
          ]),
          vue.createCommentVNode(" 当前密码输入（修改时需要） "),
          $data.modalType === "change" ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "password-section"
          }, [
            vue.createElementVNode("text", { class: "password-label" }, "请输入当前支付密码"),
            vue.createElementVNode("view", { class: "password-input-container" }, [
              (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(6, (item, index) => {
                  return vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["password-dot", { "filled": $data.currentPassword.length > index }]),
                      key: index
                    },
                    [
                      $data.currentPassword.length > index ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "●")) : vue.createCommentVNode("v-if", true)
                    ],
                    2
                    /* CLASS */
                  );
                }),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 新密码输入 "),
          vue.createElementVNode("view", { class: "password-section" }, [
            vue.createElementVNode(
              "text",
              { class: "password-label" },
              vue.toDisplayString($data.modalType === "set" ? "请设置6位支付密码" : "请输入新的支付密码"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "password-input-container" }, [
              (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(6, (item, index) => {
                  return vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["password-dot", { "filled": $data.newPassword.length > index }]),
                      key: index
                    },
                    [
                      $data.newPassword.length > index ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "●")) : vue.createCommentVNode("v-if", true)
                    ],
                    2
                    /* CLASS */
                  );
                }),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ]),
          vue.createCommentVNode(" 确认密码输入 "),
          $data.showConfirmPassword ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "password-section"
          }, [
            vue.createElementVNode("text", { class: "password-label" }, "请再次输入支付密码"),
            vue.createElementVNode("view", { class: "password-input-container" }, [
              (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList(6, (item, index) => {
                  return vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["password-dot", { "filled": $data.confirmPassword.length > index }]),
                      key: index
                    },
                    [
                      $data.confirmPassword.length > index ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "●")) : vue.createCommentVNode("v-if", true)
                    ],
                    2
                    /* CLASS */
                  );
                }),
                64
                /* STABLE_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 数字键盘 "),
          vue.createElementVNode("view", { class: "number-keyboard" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.keyboardLayout, (row, rowIndex) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "keyboard-row",
                  key: rowIndex
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(row, (key, keyIndex) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: vue.normalizeClass(["keyboard-key", { "delete-key": key === "delete", "disabled": key === "" }]),
                        key: keyIndex,
                        onClick: ($event) => $options.handleKeyPress(key)
                      }, [
                        key === "delete" ? (vue.openBlock(), vue.createElementBlock("text", {
                          key: 0,
                          class: "delete-icon"
                        }, "⌫")) : key !== "" ? (vue.openBlock(), vue.createElementBlock(
                          "text",
                          { key: 1 },
                          vue.toDisplayString(key),
                          1
                          /* TEXT */
                        )) : vue.createCommentVNode("v-if", true)
                      ], 10, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesSecurityPaymentPassword = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-d72de668"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/security/payment-password.vue"]]);
  const _sfc_main$b = {
    data() {
      return {
        defaultUserInfo: {
          avatar: "/static/logo.png",
          name: "未认证",
          nickname: "未设置",
          phone: "未设置",
          riderId: "--",
          auditStatus: "pending"
        },
        userInfo: {
          avatar: "/static/logo.png",
          name: "未认证",
          nickname: "未设置",
          phone: "未设置",
          riderId: "--",
          auditStatus: "pending"
          // 'pending', 'passed', 'failed'
        },
        loading: false
      };
    },
    computed: {
      avatarSrc() {
        return this.userInfo.avatar || this.defaultUserInfo.avatar;
      },
      displayPhone() {
        const phone = this.userInfo.phone || "";
        if (phone.includes("*")) {
          return phone;
        }
        if (/^1[3-9]\d{9}$/.test(phone)) {
          return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
        }
        return phone || "未设置";
      },
      certificationStatus() {
        if (this.userInfo.accountStatus === 1) {
          return { text: "已认证", class: "certified" };
        } else {
          return { text: "未认证", class: "not-certified" };
        }
      }
    },
    onLoad() {
      this.refreshUserInfo();
    },
    onShow() {
      this.refreshUserInfo();
    },
    methods: {
      // 从后端获取骑手信息
      async refreshUserInfo() {
        if (this.loading)
          return;
        this.loading = true;
        try {
          const response = await getRiderBaseInfo();
          if (response.code === 200 && response.data) {
            const data = response.data;
            formatAppLog("log", "at pages/profile/profile.vue:114", "🔄 获取到的后端数据:", data);
            this.userInfo = {
              avatar: data.avatar || this.defaultUserInfo.avatar,
              name: data.realName || "未认证",
              nickname: data.nickname || "未设置",
              phone: data.phone || "未设置",
              riderId: data.riderBaseId || "--",
              accountStatus: data.accountStatus || 0,
              creditScore: data.creditScore || 0,
              createTime: data.createTime
            };
            formatAppLog("log", "at pages/profile/profile.vue:128", "📱 更新后的用户信息:", this.userInfo);
            uni.setStorageSync("riderInfo", this.userInfo);
          } else {
            this.loadFromCache();
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/profile.vue:137", "获取骑手信息失败:", error);
          this.loadFromCache();
          uni.showToast({
            title: "获取信息失败",
            icon: "none",
            duration: 2e3
          });
        } finally {
          this.loading = false;
        }
      },
      // 从本地缓存加载数据
      loadFromCache() {
        try {
          const cachedInfo = uni.getStorageSync("riderInfo");
          if (cachedInfo) {
            this.userInfo = { ...this.defaultUserInfo, ...cachedInfo };
          } else {
            this.userInfo = { ...this.defaultUserInfo };
          }
        } catch (e) {
          formatAppLog("log", "at pages/profile/profile.vue:162", "获取缓存信息失败:", e);
          this.userInfo = { ...this.defaultUserInfo };
        }
      },
      goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack({ delta: 1 });
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      },
      navigateToAvatarUpload() {
        uni.navigateTo({
          url: "/pages/profile/avatar-edit"
        });
      },
      navigateToPhoneEdit() {
        uni.navigateTo({
          url: "/pages/profile/phone-edit"
        });
      },
      navigateToCertification() {
        uni.showToast({
          title: "查看实名认证",
          icon: "none"
        });
      },
      navigateToNicknameEdit() {
        uni.navigateTo({
          url: "/pages/profile/nickname-edit"
        });
      },
      handleAvatarError() {
        this.userInfo.avatar = this.defaultUserInfo.avatar;
      }
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("text", {
          class: "nav-back",
          onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.goBack && $options.goBack(...args), ["stop"]))
        }, "‹"),
        vue.createElementVNode("text", { class: "nav-title" }, "个人信息"),
        vue.createElementVNode("text", { class: "nav-placeholder" })
      ]),
      vue.createElementVNode("view", {
        class: "info-item avatar-item",
        onClick: _cache[2] || (_cache[2] = vue.withModifiers((...args) => $options.navigateToAvatarUpload && $options.navigateToAvatarUpload(...args), ["stop"]))
      }, [
        vue.createElementVNode("text", { class: "info-label" }, "头像"),
        vue.createElementVNode("view", { class: "avatar-right" }, [
          vue.createElementVNode("image", {
            class: "avatar",
            src: $options.avatarSrc,
            mode: "aspectFill",
            onError: _cache[1] || (_cache[1] = (...args) => $options.handleAvatarError && $options.handleAvatarError(...args))
          }, null, 40, ["src"]),
          vue.createElementVNode("text", { class: "arrow-icon" }, "›")
        ])
      ]),
      vue.createElementVNode("view", {
        class: "info-item",
        onClick: _cache[3] || (_cache[3] = vue.withModifiers((...args) => $options.navigateToCertification && $options.navigateToCertification(...args), ["stop"]))
      }, [
        vue.createElementVNode("text", { class: "info-label" }, "实名认证"),
        vue.createElementVNode("view", { class: "info-right" }, [
          vue.createElementVNode(
            "text",
            { class: "info-value name" },
            vue.toDisplayString($data.userInfo.name),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["certification-badge", $options.certificationStatus.class])
            },
            vue.toDisplayString($options.certificationStatus.text),
            3
            /* TEXT, CLASS */
          ),
          vue.createElementVNode("text", { class: "arrow-icon" }, "›")
        ])
      ]),
      vue.createElementVNode("view", {
        class: "info-item",
        onClick: _cache[4] || (_cache[4] = vue.withModifiers((...args) => $options.navigateToNicknameEdit && $options.navigateToNicknameEdit(...args), ["stop"]))
      }, [
        vue.createElementVNode("text", { class: "info-label" }, "昵称"),
        vue.createElementVNode("view", { class: "info-right" }, [
          vue.createElementVNode(
            "text",
            { class: "info-value gray" },
            vue.toDisplayString($data.userInfo.nickname),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "arrow-icon" }, "›")
        ])
      ]),
      vue.createElementVNode("view", { class: "info-item" }, [
        vue.createElementVNode("text", { class: "info-label" }, "ID"),
        vue.createElementVNode(
          "text",
          { class: "info-value gray" },
          vue.toDisplayString($data.userInfo.riderId),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", {
        class: "info-item",
        onClick: _cache[5] || (_cache[5] = vue.withModifiers((...args) => $options.navigateToPhoneEdit && $options.navigateToPhoneEdit(...args), ["stop"]))
      }, [
        vue.createElementVNode("text", { class: "info-label" }, "手机号"),
        vue.createElementVNode("view", { class: "info-right" }, [
          vue.createElementVNode(
            "text",
            { class: "info-value gray" },
            vue.toDisplayString($options.displayPhone),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "arrow-icon" }, "›")
        ])
      ])
    ]);
  }
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-dd383ca2"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/profile/profile.vue"]]);
  const _sfc_main$a = {
    data() {
      return {
        previewAvatar: "/static/logo.png",
        originalAvatar: "/static/logo.png",
        selectedImagePath: "",
        // 新选择的图片路径
        saving: false
      };
    },
    onLoad() {
      this.loadUserInfo();
    },
    methods: {
      loadUserInfo() {
        try {
          const riderInfo = uni.getStorageSync("riderInfo");
          if (riderInfo && riderInfo.avatar) {
            this.previewAvatar = riderInfo.avatar;
            this.originalAvatar = riderInfo.avatar;
          }
        } catch (e) {
          formatAppLog("log", "at pages/profile/avatar-edit.vue:46", "加载头像失败:", e);
        }
      },
      goBack() {
        uni.navigateBack({ delta: 1 });
      },
      handleChooseImage() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          // 优先使用压缩图片
          sourceType: ["album", "camera"],
          success: (res) => {
            if (res.tempFilePaths && res.tempFilePaths.length > 0) {
              this.selectedImagePath = res.tempFilePaths[0];
              this.previewAvatar = res.tempFilePaths[0];
              formatAppLog("log", "at pages/profile/avatar-edit.vue:61", "已选择头像:", this.selectedImagePath);
            }
          },
          fail: (error) => {
            formatAppLog("error", "at pages/profile/avatar-edit.vue:65", "选择图片失败:", error);
            uni.showToast({
              title: "选择图片失败",
              icon: "none"
            });
          }
        });
      },
      async handleSave() {
        var _a;
        if (!this.selectedImagePath) {
          uni.showToast({
            title: "请先选择头像",
            icon: "none"
          });
          return;
        }
        if (this.saving)
          return;
        this.saving = true;
        try {
          const response = await updateRiderBaseInfo({
            avatarPath: this.selectedImagePath
          });
          if (response.code === 200) {
            try {
              const riderInfo = uni.getStorageSync("riderInfo") || {};
              const newAvatar = ((_a = response.data) == null ? void 0 : _a.avatar) || this.selectedImagePath;
              riderInfo.avatar = newAvatar;
              uni.setStorageSync("riderInfo", riderInfo);
              this.originalAvatar = newAvatar;
            } catch (storageError) {
              formatAppLog("error", "at pages/profile/avatar-edit.vue:104", "更新本地缓存失败:", storageError);
            }
            uni.showToast({
              title: "修改成功",
              icon: "success",
              duration: 1500
            });
            setTimeout(() => {
              const pages = getCurrentPages();
              if (pages.length > 1) {
                const prevPage = pages[pages.length - 2];
                if (prevPage && prevPage.$vm && prevPage.$vm.refreshUserInfo) {
                  prevPage.$vm.refreshUserInfo();
                }
              }
              this.goBack();
            }, 1500);
          } else {
            uni.showToast({
              title: response.msg || "上传失败",
              icon: "none",
              duration: 2e3
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/avatar-edit.vue:134", "上传头像失败:", error);
          uni.showToast({
            title: "上传失败，请重试",
            icon: "none",
            duration: 2e3
          });
        } finally {
          this.saving = false;
        }
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("text", {
          class: "nav-back",
          onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.goBack && $options.goBack(...args), ["stop"]))
        }, "‹"),
        vue.createElementVNode("text", { class: "nav-title" }, "修改头像"),
        vue.createElementVNode("text", { class: "nav-placeholder" })
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("image", {
          class: "avatar-preview",
          src: $data.previewAvatar,
          mode: "aspectFill"
        }, null, 8, ["src"]),
        vue.createElementVNode("button", {
          class: "choose-btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.handleChooseImage && $options.handleChooseImage(...args))
        }, "从相册选择"),
        vue.createElementVNode("text", { class: "tip" }, "支持 jpg、png，建议尺寸 200×200 像素以上")
      ]),
      vue.createElementVNode("view", { class: "bottom-bar" }, [
        vue.createElementVNode("button", {
          class: "save-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.handleSave && $options.handleSave(...args)),
          disabled: $data.saving
        }, vue.toDisplayString($data.saving ? "保存中..." : "保存"), 9, ["disabled"])
      ])
    ]);
  }
  const PagesProfileAvatarEdit = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-b5fdd8e1"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/profile/avatar-edit.vue"]]);
  const _sfc_main$9 = {
    data() {
      return {
        nickname: "",
        originalNickname: "",
        saving: false
      };
    },
    onLoad() {
      this.loadUserInfo();
    },
    methods: {
      loadUserInfo() {
        try {
          const riderInfo = uni.getStorageSync("riderInfo");
          if (riderInfo && riderInfo.nickname) {
            this.nickname = riderInfo.nickname;
            this.originalNickname = riderInfo.nickname;
          }
        } catch (err) {
          formatAppLog("log", "at pages/profile/nickname-edit.vue:45", "加载昵称失败:", err);
        }
      },
      goBack() {
        uni.navigateBack({ delta: 1 });
      },
      async handleSave() {
        const trimmed = this.nickname.trim();
        if (trimmed.length === 0) {
          uni.showToast({ title: "昵称不能为空", icon: "none" });
          return;
        }
        if (trimmed.length > 12) {
          uni.showToast({ title: "昵称不能超过12个字符", icon: "none" });
          return;
        }
        if (trimmed === this.originalNickname) {
          uni.showToast({ title: "昵称未变化", icon: "none" });
          return;
        }
        if (this.saving)
          return;
        this.saving = true;
        try {
          const response = await updateRiderBaseInfo({
            nickname: trimmed
          });
          if (response.code === 200) {
            try {
              const riderInfo = uni.getStorageSync("riderInfo") || {};
              riderInfo.nickname = trimmed;
              uni.setStorageSync("riderInfo", riderInfo);
              this.originalNickname = trimmed;
            } catch (storageError) {
              formatAppLog("error", "at pages/profile/nickname-edit.vue:89", "更新本地缓存失败:", storageError);
            }
            uni.showToast({
              title: "修改成功",
              icon: "success",
              duration: 1500
            });
            setTimeout(() => {
              const pages = getCurrentPages();
              if (pages.length > 1) {
                const prevPage = pages[pages.length - 2];
                if (prevPage && prevPage.$vm && prevPage.$vm.refreshUserInfo) {
                  prevPage.$vm.refreshUserInfo();
                }
              }
              this.goBack();
            }, 1500);
          } else {
            uni.showToast({
              title: response.msg || "修改失败",
              icon: "none",
              duration: 2e3
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/nickname-edit.vue:119", "修改昵称失败:", error);
          uni.showToast({
            title: "修改失败，请重试",
            icon: "none",
            duration: 2e3
          });
        } finally {
          this.saving = false;
        }
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("text", {
          class: "nav-back",
          onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.goBack && $options.goBack(...args), ["stop"]))
        }, "‹"),
        vue.createElementVNode("text", { class: "nav-title" }, "修改昵称"),
        vue.createElementVNode("text", { class: "nav-placeholder" })
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("text", { class: "label" }, "昵称"),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "input",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.nickname = $event),
            maxlength: "12",
            placeholder: "请输入昵称",
            "placeholder-class": "placeholder"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.nickname]
        ]),
        vue.createElementVNode("text", { class: "hint" }, "昵称支持中英文、数字，最多 12 个字符")
      ]),
      vue.createElementVNode("view", { class: "bottom-bar" }, [
        vue.createElementVNode("button", {
          class: "save-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.handleSave && $options.handleSave(...args)),
          disabled: $data.saving || $data.nickname.trim() === ""
        }, vue.toDisplayString($data.saving ? "保存中..." : "保存"), 9, ["disabled"])
      ])
    ]);
  }
  const PagesProfileNicknameEdit = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-7349775b"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/profile/nickname-edit.vue"]]);
  const _sfc_main$8 = {
    data() {
      return {
        phone: "",
        originalPhone: "",
        saving: false
      };
    },
    onLoad() {
      this.loadUserInfo();
    },
    methods: {
      loadUserInfo() {
        try {
          const riderInfo = uni.getStorageSync("riderInfo");
          if (riderInfo && riderInfo.phone) {
            if (riderInfo.phone.includes("*")) {
              this.phone = "";
              this.originalPhone = "";
            } else {
              this.phone = riderInfo.phone.replace(/\s/g, "");
              this.originalPhone = this.phone;
            }
          }
        } catch (err) {
          formatAppLog("log", "at pages/profile/phone-edit.vue:56", "加载手机号失败:", err);
        }
      },
      goBack() {
        uni.navigateBack({ delta: 1 });
      },
      validatePhone(phone) {
        return /^1[3-9]\d{9}$/.test(phone);
      },
      async handleSave() {
        const cleanPhone = this.phone.trim();
        if (!this.validatePhone(cleanPhone)) {
          uni.showToast({ title: "请输入正确的手机号", icon: "none" });
          return;
        }
        if (cleanPhone === this.originalPhone) {
          uni.showToast({ title: "手机号未变化", icon: "none" });
          return;
        }
        if (this.saving)
          return;
        this.saving = true;
        try {
          const response = await updateRiderBaseInfo({
            phone: cleanPhone
          });
          if (response.code === 200) {
            try {
              const riderInfo = uni.getStorageSync("riderInfo") || {};
              riderInfo.phone = cleanPhone;
              uni.setStorageSync("riderInfo", riderInfo);
              this.originalPhone = cleanPhone;
            } catch (storageError) {
              formatAppLog("error", "at pages/profile/phone-edit.vue:98", "更新本地缓存失败:", storageError);
            }
            uni.showToast({
              title: "修改成功",
              icon: "success",
              duration: 1500
            });
            setTimeout(() => {
              const pages = getCurrentPages();
              if (pages.length > 1) {
                const prevPage = pages[pages.length - 2];
                if (prevPage && prevPage.$vm && prevPage.$vm.refreshUserInfo) {
                  prevPage.$vm.refreshUserInfo();
                }
              }
              this.goBack();
            }, 1500);
          } else {
            uni.showToast({
              title: response.msg || "修改失败",
              icon: "none",
              duration: 2e3
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/profile/phone-edit.vue:128", "修改手机号失败:", error);
          uni.showToast({
            title: "修改失败，请重试",
            icon: "none",
            duration: 2e3
          });
        } finally {
          this.saving = false;
        }
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page" }, [
      vue.createElementVNode("view", { class: "nav-bar" }, [
        vue.createElementVNode("text", {
          class: "nav-back",
          onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.goBack && $options.goBack(...args), ["stop"]))
        }, "‹"),
        vue.createElementVNode("text", { class: "nav-title" }, "修改手机号"),
        vue.createElementVNode("text", { class: "nav-placeholder" })
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createElementVNode("text", { class: "label" }, "手机号"),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "input",
            type: "number",
            maxlength: "11",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.phone = $event),
            placeholder: "请输入新的手机号",
            "placeholder-class": "placeholder"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.phone]
        ]),
        vue.createElementVNode("text", { class: "hint" }, "请输入 11 位大陆手机号，保存后将作为您的登录账号使用")
      ]),
      vue.createElementVNode("view", { class: "bottom-bar" }, [
        vue.createElementVNode("button", {
          class: "save-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.handleSave && $options.handleSave(...args)),
          disabled: $data.saving || $data.phone.trim() === ""
        }, vue.toDisplayString($data.saving ? "保存中..." : "保存"), 9, ["disabled"])
      ])
    ]);
  }
  const PagesProfilePhoneEdit = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-856d8303"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/profile/phone-edit.vue"]]);
  const _sfc_main$7 = {
    data() {
      return {
        settings: {
          publicProfile: true,
          showPhone: true,
          shareLocation: true,
          locationHistory: true,
          orderHistory: true,
          showRating: true,
          pushNotification: true,
          marketing: false
        }
      };
    },
    onLoad() {
      const savedSettings = uni.getStorageSync("privacySettings");
      if (savedSettings) {
        this.settings = { ...this.settings, ...savedSettings };
      }
    },
    methods: {
      goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack({ delta: 1 });
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      },
      handleSwitch(key, event) {
        this.settings[key] = event.detail.value;
        uni.setStorageSync("privacySettings", this.settings);
        uni.showToast({
          title: event.detail.value ? "已开启" : "已关闭",
          icon: "none",
          duration: 1500
        });
      },
      viewPrivacyPolicy() {
        uni.showModal({
          title: "隐私政策",
          content: "我们承诺保护您的个人隐私和数据安全。您的信息仅用于提供配送服务，不会泄露给第三方。",
          confirmText: "我知道了",
          showCancel: false
        });
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 自定义导航栏 "),
      vue.createElementVNode("view", { class: "custom-navbar" }, [
        vue.createElementVNode("view", {
          class: "navbar-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "navbar-title" }, "隐私设置"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 隐私设置说明 "),
      vue.createElementVNode("view", { class: "privacy-tip" }, [
        vue.createElementVNode("text", { class: "tip-text" }, "我们重视您的隐私安全，请根据需要调整以下设置")
      ]),
      vue.createCommentVNode(" 隐私设置列表 "),
      vue.createElementVNode("view", { class: "settings-section" }, [
        vue.createElementVNode("view", { class: "settings-group" }, [
          vue.createElementVNode("text", { class: "group-title" }, "个人信息"),
          vue.createElementVNode("view", { class: "setting-item" }, [
            vue.createElementVNode("view", { class: "setting-left" }, [
              vue.createElementVNode("text", { class: "setting-label" }, "公开个人资料"),
              vue.createElementVNode("text", { class: "setting-desc" }, "允许其他用户查看您的基本信息")
            ]),
            vue.createElementVNode("switch", {
              checked: $data.settings.publicProfile,
              onChange: _cache[1] || (_cache[1] = ($event) => $options.handleSwitch("publicProfile", $event)),
              color: "#0984e3"
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", { class: "setting-item" }, [
            vue.createElementVNode("view", { class: "setting-left" }, [
              vue.createElementVNode("text", { class: "setting-label" }, "显示手机号"),
              vue.createElementVNode("text", { class: "setting-desc" }, "在订单中向客户显示您的手机号")
            ]),
            vue.createElementVNode("switch", {
              checked: $data.settings.showPhone,
              onChange: _cache[2] || (_cache[2] = ($event) => $options.handleSwitch("showPhone", $event)),
              color: "#0984e3"
            }, null, 40, ["checked"])
          ])
        ]),
        vue.createElementVNode("view", { class: "settings-group" }, [
          vue.createElementVNode("text", { class: "group-title" }, "位置信息"),
          vue.createElementVNode("view", { class: "setting-item" }, [
            vue.createElementVNode("view", { class: "setting-left" }, [
              vue.createElementVNode("text", { class: "setting-label" }, "实时位置共享"),
              vue.createElementVNode("text", { class: "setting-desc" }, "在配送过程中与客户共享实时位置")
            ]),
            vue.createElementVNode("switch", {
              checked: $data.settings.shareLocation,
              onChange: _cache[3] || (_cache[3] = ($event) => $options.handleSwitch("shareLocation", $event)),
              color: "#0984e3"
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", { class: "setting-item" }, [
            vue.createElementVNode("view", { class: "setting-left" }, [
              vue.createElementVNode("text", { class: "setting-label" }, "位置历史记录"),
              vue.createElementVNode("text", { class: "setting-desc" }, "保存您的配送路线历史记录")
            ]),
            vue.createElementVNode("switch", {
              checked: $data.settings.locationHistory,
              onChange: _cache[4] || (_cache[4] = ($event) => $options.handleSwitch("locationHistory", $event)),
              color: "#0984e3"
            }, null, 40, ["checked"])
          ])
        ]),
        vue.createElementVNode("view", { class: "settings-group" }, [
          vue.createElementVNode("text", { class: "group-title" }, "订单信息"),
          vue.createElementVNode("view", { class: "setting-item" }, [
            vue.createElementVNode("view", { class: "setting-left" }, [
              vue.createElementVNode("text", { class: "setting-label" }, "订单历史可见"),
              vue.createElementVNode("text", { class: "setting-desc" }, "允许平台查看您的历史订单")
            ]),
            vue.createElementVNode("switch", {
              checked: $data.settings.orderHistory,
              onChange: _cache[5] || (_cache[5] = ($event) => $options.handleSwitch("orderHistory", $event)),
              color: "#0984e3"
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", { class: "setting-item" }, [
            vue.createElementVNode("view", { class: "setting-left" }, [
              vue.createElementVNode("text", { class: "setting-label" }, "评价可见"),
              vue.createElementVNode("text", { class: "setting-desc" }, "允许其他用户查看您收到的评价")
            ]),
            vue.createElementVNode("switch", {
              checked: $data.settings.showRating,
              onChange: _cache[6] || (_cache[6] = ($event) => $options.handleSwitch("showRating", $event)),
              color: "#0984e3"
            }, null, 40, ["checked"])
          ])
        ]),
        vue.createElementVNode("view", { class: "settings-group" }, [
          vue.createElementVNode("text", { class: "group-title" }, "通知设置"),
          vue.createElementVNode("view", { class: "setting-item" }, [
            vue.createElementVNode("view", { class: "setting-left" }, [
              vue.createElementVNode("text", { class: "setting-label" }, "推送通知"),
              vue.createElementVNode("text", { class: "setting-desc" }, "接收新订单和系统消息通知")
            ]),
            vue.createElementVNode("switch", {
              checked: $data.settings.pushNotification,
              onChange: _cache[7] || (_cache[7] = ($event) => $options.handleSwitch("pushNotification", $event)),
              color: "#0984e3"
            }, null, 40, ["checked"])
          ]),
          vue.createElementVNode("view", { class: "setting-item" }, [
            vue.createElementVNode("view", { class: "setting-left" }, [
              vue.createElementVNode("text", { class: "setting-label" }, "营销信息"),
              vue.createElementVNode("text", { class: "setting-desc" }, "接收平台优惠和活动信息")
            ]),
            vue.createElementVNode("switch", {
              checked: $data.settings.marketing,
              onChange: _cache[8] || (_cache[8] = ($event) => $options.handleSwitch("marketing", $event)),
              color: "#0984e3"
            }, null, 40, ["checked"])
          ])
        ])
      ]),
      vue.createCommentVNode(" 隐私政策 "),
      vue.createElementVNode("view", { class: "policy-section" }, [
        vue.createElementVNode("text", {
          class: "policy-link",
          onClick: _cache[9] || (_cache[9] = (...args) => $options.viewPrivacyPolicy && $options.viewPrivacyPolicy(...args))
        }, "查看隐私政策")
      ])
    ]);
  }
  const PagesPrivacyPrivacy = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-33d54784"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/privacy/privacy.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        balance: "556.80",
        withdrawable: "556.80",
        todayIncome: "256.80",
        transactions: [
          {
            title: "订单配送收入",
            time: "今天 14:30",
            amount: "18.50",
            type: "income"
          },
          {
            title: "订单配送收入",
            time: "今天 13:15",
            amount: "22.00",
            type: "income"
          },
          {
            title: "订单配送收入",
            time: "今天 12:08",
            amount: "15.80",
            type: "income"
          },
          {
            title: "提现到银行卡",
            time: "昨天 16:45",
            amount: "500.00",
            type: "expense"
          }
        ]
      };
    },
    methods: {
      goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack({ delta: 1 });
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      },
      handleWithdraw() {
        uni.showToast({
          title: "提现功能开发中",
          icon: "none"
        });
      },
      handleRecharge() {
        uni.showToast({
          title: "充值功能开发中",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 自定义导航栏 "),
      vue.createElementVNode("view", { class: "custom-navbar" }, [
        vue.createElementVNode("view", {
          class: "navbar-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "navbar-title" }, "我的钱包"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 余额卡片 "),
      vue.createElementVNode("view", { class: "balance-card" }, [
        vue.createElementVNode("text", { class: "balance-label" }, "总余额"),
        vue.createElementVNode(
          "text",
          { class: "balance-amount" },
          "¥" + vue.toDisplayString($data.balance),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "balance-tip" },
          "可提现金额：¥" + vue.toDisplayString($data.withdrawable),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 操作按钮 "),
      vue.createElementVNode("view", { class: "action-buttons" }, [
        vue.createElementVNode("view", {
          class: "action-btn withdraw-btn",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.handleWithdraw && $options.handleWithdraw(...args))
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "💵"),
          vue.createElementVNode("text", { class: "btn-text" }, "提现")
        ]),
        vue.createElementVNode("view", {
          class: "action-btn recharge-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.handleRecharge && $options.handleRecharge(...args))
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "➕"),
          vue.createElementVNode("text", { class: "btn-text" }, "充值")
        ])
      ]),
      vue.createCommentVNode(" 今日收入 "),
      vue.createElementVNode("view", { class: "today-income-section" }, [
        vue.createElementVNode("text", { class: "section-title" }, "今日收入"),
        vue.createElementVNode("view", { class: "income-card" }, [
          vue.createElementVNode("text", { class: "income-label" }, "配送收入"),
          vue.createElementVNode(
            "text",
            { class: "income-amount" },
            "+¥" + vue.toDisplayString($data.todayIncome),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 最近交易 "),
      vue.createElementVNode("view", { class: "transaction-section" }, [
        vue.createElementVNode("text", { class: "section-title" }, "最近交易"),
        vue.createElementVNode("view", { class: "transaction-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.transactions, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "transaction-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "transaction-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "transaction-title" },
                    vue.toDisplayString(item.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "transaction-time" },
                    vue.toDisplayString(item.time),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["transaction-amount", item.type === "income" ? "income" : "expense"])
                  },
                  vue.toDisplayString(item.type === "income" ? "+" : "-") + "¥" + vue.toDisplayString(item.amount),
                  3
                  /* TEXT, CLASS */
                )
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])
    ]);
  }
  const PagesWalletWallet = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-4c380209"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/wallet/wallet.vue"]]);
  const _sfc_main$5 = {
    data() {
      return {
        searchKeyword: "",
        selectedTimeFilter: "全部时间",
        showFilter: false,
        orders: [
          {
            id: "ORD20240115001",
            status: "已完成",
            type: "外卖",
            dateTime: "2024-01-15 14:30",
            merchant: "星巴克咖啡(人民广场店)",
            address: "上海市黄浦区南京东路123号",
            price: "15.80"
          },
          {
            id: "ORD20240114002",
            status: "已完成",
            type: "外卖",
            dateTime: "2024-01-14 18:45",
            merchant: "麦当劳(淮海路店)",
            address: "上海市徐汇区淮海中路456号",
            price: "12.50"
          },
          {
            id: "ORD20240113003",
            status: "已取消",
            type: "外卖",
            dateTime: "2024-01-13 12:20",
            merchant: "肯德基(静安寺店)",
            address: "上海市静安区南京西路789号",
            price: "18.20"
          },
          {
            id: "ORD20240112004",
            status: "已完成",
            type: "外卖",
            dateTime: "2024-01-12 19:15",
            merchant: "必胜客(陆家嘴店)",
            address: "上海市浦东新区陆家嘴环路1000号",
            price: "25.60"
          },
          {
            id: "ORD20240111005",
            status: "配送中",
            type: "外卖",
            dateTime: "2024-01-11 16:30",
            merchant: "海底捞(徐家汇店)",
            address: "上海市徐汇区漕溪北路88号",
            price: "68.90"
          }
        ]
      };
    },
    computed: {
      filteredOrders() {
        let filtered = this.orders;
        if (this.searchKeyword) {
          filtered = filtered.filter(
            (order) => order.id.toLowerCase().includes(this.searchKeyword.toLowerCase()) || order.address.toLowerCase().includes(this.searchKeyword.toLowerCase()) || order.merchant.toLowerCase().includes(this.searchKeyword.toLowerCase())
          );
        }
        if (this.selectedTimeFilter !== "全部时间") {
          const today = /* @__PURE__ */ new Date();
          filtered = filtered.filter((order) => {
            const orderDate = new Date(order.dateTime);
            switch (this.selectedTimeFilter) {
              case "今天":
                return orderDate.toDateString() === today.toDateString();
              case "昨天":
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return orderDate.toDateString() === yesterday.toDateString();
              case "本周":
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                return orderDate >= weekStart;
              case "本月":
                return orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
              default:
                return true;
            }
          });
        }
        return filtered;
      }
    },
    methods: {
      goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack({ delta: 1 });
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      },
      showTimeFilter() {
        this.showFilter = true;
      },
      hideTimeFilter() {
        this.showFilter = false;
      },
      selectTimeFilter(time) {
        this.selectedTimeFilter = time;
        this.showFilter = false;
      },
      viewOrderDetail(order) {
        uni.showToast({
          title: "查看订单详情",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 自定义导航栏 "),
      vue.createElementVNode("view", { class: "custom-navbar" }, [
        vue.createElementVNode("view", {
          class: "navbar-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "navbar-title" }, "历史订单"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 搜索和筛选区域 "),
      vue.createElementVNode("view", { class: "search-section" }, [
        vue.createElementVNode("view", {
          class: "filter-dropdown",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.showTimeFilter && $options.showTimeFilter(...args))
        }, [
          vue.createElementVNode("text", { class: "filter-text" }, "全部时间"),
          vue.createElementVNode("text", { class: "filter-arrow" }, "▼")
        ]),
        vue.createElementVNode("view", { class: "search-bar" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              placeholder: "搜索订单号或地址",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.searchKeyword = $event)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.searchKeyword]
          ])
        ])
      ]),
      vue.createCommentVNode(" 订单列表 "),
      vue.createElementVNode("view", { class: "orders-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.filteredOrders, (order, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "order-card",
              key: index
            }, [
              vue.createElementVNode("view", { class: "order-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "order-id" },
                  vue.toDisplayString(order.id),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "status-tags" }, [
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["status-tag", order.status === "已完成" ? "completed" : order.status === "已取消" ? "cancelled" : "pending"])
                    },
                    vue.toDisplayString(order.status),
                    3
                    /* TEXT, CLASS */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "type-tag" },
                    vue.toDisplayString(order.type),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode(
                "view",
                { class: "order-time" },
                vue.toDisplayString(order.dateTime),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "order-details" }, [
                vue.createElementVNode("view", { class: "detail-item" }, [
                  vue.createElementVNode("text", { class: "detail-dot green" }, "●"),
                  vue.createElementVNode(
                    "text",
                    { class: "detail-text" },
                    vue.toDisplayString(order.merchant),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "detail-item" }, [
                  vue.createElementVNode("text", { class: "detail-dot red" }, "●"),
                  vue.createElementVNode(
                    "text",
                    { class: "detail-text" },
                    vue.toDisplayString(order.address),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "order-footer" }, [
                vue.createElementVNode(
                  "text",
                  { class: "order-price" },
                  "¥" + vue.toDisplayString(order.price),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("button", {
                  class: "detail-btn",
                  onClick: ($event) => $options.viewOrderDetail(order)
                }, "查看详情", 8, ["onClick"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 时间筛选弹窗 "),
      $data.showFilter ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "filter-modal",
        onClick: _cache[9] || (_cache[9] = (...args) => $options.hideTimeFilter && $options.hideTimeFilter(...args))
      }, [
        vue.createElementVNode("view", {
          class: "filter-content",
          onClick: _cache[8] || (_cache[8] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", {
            class: "filter-option",
            onClick: _cache[3] || (_cache[3] = ($event) => $options.selectTimeFilter("全部时间"))
          }, [
            vue.createElementVNode("text", null, "全部时间")
          ]),
          vue.createElementVNode("view", {
            class: "filter-option",
            onClick: _cache[4] || (_cache[4] = ($event) => $options.selectTimeFilter("今天"))
          }, [
            vue.createElementVNode("text", null, "今天")
          ]),
          vue.createElementVNode("view", {
            class: "filter-option",
            onClick: _cache[5] || (_cache[5] = ($event) => $options.selectTimeFilter("昨天"))
          }, [
            vue.createElementVNode("text", null, "昨天")
          ]),
          vue.createElementVNode("view", {
            class: "filter-option",
            onClick: _cache[6] || (_cache[6] = ($event) => $options.selectTimeFilter("本周"))
          }, [
            vue.createElementVNode("text", null, "本周")
          ]),
          vue.createElementVNode("view", {
            class: "filter-option",
            onClick: _cache[7] || (_cache[7] = ($event) => $options.selectTimeFilter("本月"))
          }, [
            vue.createElementVNode("text", null, "本月")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesOrdersOrders = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-1acc51a1"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/orders/orders.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        idCardFront: "",
        idCardBack: ""
      };
    },
    methods: {
      goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack({ delta: 1 });
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      },
      uploadIdCard(type) {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            if (type === "front") {
              this.idCardFront = res.tempFilePaths[0];
            } else {
              this.idCardBack = res.tempFilePaths[0];
            }
            uni.showToast({
              title: "上传成功",
              icon: "success"
            });
          },
          fail: () => {
            uni.showToast({
              title: "上传失败",
              icon: "none"
            });
          }
        });
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 自定义导航栏 "),
      vue.createElementVNode("view", { class: "custom-navbar" }, [
        vue.createElementVNode("view", {
          class: "navbar-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "navbar-title" }, "资质认证"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 认证状态 "),
      vue.createElementVNode("view", { class: "status-card" }, [
        vue.createElementVNode("view", { class: "card-header" }, [
          vue.createElementVNode("view", { class: "status-icon" }, [
            vue.createElementVNode("text", { class: "icon-text" }, "🆔")
          ]),
          vue.createElementVNode("text", { class: "card-title" }, "认证状态")
        ]),
        vue.createElementVNode("view", { class: "status-info" }, [
          vue.createElementVNode("text", { class: "status-label" }, "当前状态:"),
          vue.createElementVNode("text", { class: "status-value reviewing" }, "审核中")
        ])
      ]),
      vue.createCommentVNode(" 认证流程 "),
      vue.createElementVNode("view", { class: "process-card" }, [
        vue.createElementVNode("text", { class: "card-title" }, "认证流程"),
        vue.createElementVNode("view", { class: "process-steps" }, [
          vue.createElementVNode("view", { class: "step-item" }, [
            vue.createElementVNode("view", { class: "step-number completed" }, "1"),
            vue.createElementVNode("view", { class: "step-content" }, [
              vue.createElementVNode("text", { class: "step-title" }, "身份信息验证"),
              vue.createElementVNode("text", { class: "step-desc" }, "上传身份证正反面照片进行实名认证")
            ]),
            vue.createElementVNode("text", { class: "step-status completed" }, "已完成")
          ]),
          vue.createElementVNode("view", { class: "step-line" }),
          vue.createElementVNode("view", { class: "step-item" }, [
            vue.createElementVNode("view", { class: "step-number current" }, "2"),
            vue.createElementVNode("view", { class: "step-content" }, [
              vue.createElementVNode("text", { class: "step-title" }, "认证完成"),
              vue.createElementVNode("text", { class: "step-desc" }, "审核通过后即可获得认证标识")
            ]),
            vue.createElementVNode("text", { class: "step-status reviewing" }, "审核中")
          ])
        ])
      ]),
      vue.createCommentVNode(" 上传材料 "),
      vue.createElementVNode("view", { class: "upload-card" }, [
        vue.createElementVNode("text", { class: "card-title" }, "上传材料"),
        vue.createElementVNode("view", { class: "upload-section" }, [
          vue.createElementVNode("text", { class: "upload-title" }, "身份证正面"),
          vue.createElementVNode("text", { class: "upload-desc" }, "请上传清晰的身份证正面照片"),
          vue.createElementVNode("view", {
            class: "upload-area",
            onClick: _cache[1] || (_cache[1] = ($event) => $options.uploadIdCard("front"))
          }, [
            $data.idCardFront ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              src: $data.idCardFront,
              class: "uploaded-image",
              mode: "aspectFit"
            }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "upload-placeholder"
            }, [
              vue.createElementVNode("text", { class: "upload-icon" }, "📤"),
              vue.createElementVNode("text", { class: "upload-text" }, "上传文件")
            ]))
          ])
        ]),
        vue.createElementVNode("view", { class: "upload-section" }, [
          vue.createElementVNode("text", { class: "upload-title" }, "身份证反面"),
          vue.createElementVNode("text", { class: "upload-desc" }, "请上传清晰的身份证反面照片"),
          vue.createElementVNode("view", {
            class: "upload-area",
            onClick: _cache[2] || (_cache[2] = ($event) => $options.uploadIdCard("back"))
          }, [
            $data.idCardBack ? (vue.openBlock(), vue.createElementBlock("image", {
              key: 0,
              src: $data.idCardBack,
              class: "uploaded-image",
              mode: "aspectFit"
            }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "upload-placeholder"
            }, [
              vue.createElementVNode("text", { class: "upload-icon" }, "📤"),
              vue.createElementVNode("text", { class: "upload-text" }, "上传文件")
            ]))
          ])
        ])
      ])
    ]);
  }
  const PagesCertificationCertification = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-1ee499d8"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/certification/certification.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        searchKeyword: "",
        activeCategory: "all",
        categories: [
          { key: "all", name: "全部" },
          { key: "order", name: "订单问题" },
          { key: "payment", name: "支付问题" },
          { key: "delivery", name: "配送问题" },
          { key: "account", name: "账号问题" }
        ],
        questions: [
          {
            title: "如何查看订单状态？",
            answer: '您可以在"我的订单"页面查看所有订单的详细状态，包括待接单、配送中、已完成等状态。',
            category: "order",
            expanded: false
          },
          {
            title: "订单可以取消吗？",
            answer: "在骑手接单前，您可以随时取消订单。如果骑手已接单，请联系客服协助处理。",
            category: "order",
            expanded: false
          },
          {
            title: "如何申请退款？",
            answer: '如果遇到订单问题需要退款，请在订单详情页面点击"申请退款"，或联系客服处理。',
            category: "payment",
            expanded: false
          },
          {
            title: "支付方式有哪些？",
            answer: "我们支持微信支付、支付宝、银行卡等多种支付方式，您可以根据需要选择。",
            category: "payment",
            expanded: false
          },
          {
            title: "配送费如何计算？",
            answer: "配送费根据距离、时间等因素动态计算，具体费用在确认订单时会显示。",
            category: "delivery",
            expanded: false
          },
          {
            title: "配送时间多久？",
            answer: "一般情况下，市内配送30-60分钟，具体时间会根据距离和路况调整。",
            category: "delivery",
            expanded: false
          },
          {
            title: "如何修改个人信息？",
            answer: '您可以在"个人中心"页面点击"个人信息修改"来更新您的个人资料。',
            category: "account",
            expanded: false
          },
          {
            title: "忘记密码怎么办？",
            answer: '您可以在登录页面点击"忘记密码"，通过手机验证码重置密码。',
            category: "account",
            expanded: false
          },
          {
            title: "如何联系客服？",
            answer: '您可以通过"在线客服"功能与客服人员实时沟通，或拨打客服热线400-123-4567。',
            category: "account",
            expanded: false
          },
          {
            title: "如何查看配送路线？",
            answer: '在订单配送过程中，您可以在"路线"页面实时查看骑手的配送路线和位置。',
            category: "delivery",
            expanded: false
          }
        ]
      };
    },
    computed: {
      filteredQuestions() {
        let filtered = this.questions;
        if (this.activeCategory !== "all") {
          filtered = filtered.filter((q) => q.category === this.activeCategory);
        }
        if (this.searchKeyword) {
          filtered = filtered.filter(
            (q) => q.title.toLowerCase().includes(this.searchKeyword.toLowerCase()) || q.answer.toLowerCase().includes(this.searchKeyword.toLowerCase())
          );
        }
        return filtered;
      }
    },
    methods: {
      goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack({ delta: 1 });
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      },
      selectCategory(categoryKey) {
        this.activeCategory = categoryKey;
      },
      toggleQuestion(index) {
        const question = this.filteredQuestions[index];
        const originalIndex = this.questions.findIndex((q) => q.title === question.title);
        this.questions[originalIndex].expanded = !this.questions[originalIndex].expanded;
      },
      filterQuestions() {
        this.questions.forEach((q) => q.expanded = false);
      },
      contactService() {
        uni.showToast({
          title: "正在连接客服...",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 自定义导航栏 "),
      vue.createElementVNode("view", { class: "custom-navbar" }, [
        vue.createElementVNode("view", {
          class: "navbar-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "navbar-title" }, "常见问题"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 搜索框 "),
      vue.createElementVNode("view", { class: "search-section" }, [
        vue.createElementVNode("view", { class: "search-bar" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "search-input",
              placeholder: "搜索问题",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.searchKeyword = $event),
              onInput: _cache[2] || (_cache[2] = (...args) => $options.filterQuestions && $options.filterQuestions(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.searchKeyword]
          ])
        ])
      ]),
      vue.createCommentVNode(" 问题分类 "),
      vue.createElementVNode("view", { class: "category-section" }, [
        vue.createElementVNode("view", { class: "category-tabs" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.categories, (category) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["category-tab", { active: $data.activeCategory === category.key }]),
                key: category.key,
                onClick: ($event) => $options.selectCategory(category.key)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "tab-text" },
                  vue.toDisplayString(category.name),
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 问题列表 "),
      vue.createElementVNode("view", { class: "questions-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.filteredQuestions, (question, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "question-item",
              key: index,
              onClick: ($event) => $options.toggleQuestion(index)
            }, [
              vue.createElementVNode("view", { class: "question-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "question-title" },
                  vue.toDisplayString(question.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["expand-icon", { expanded: question.expanded }])
                  },
                  "▼",
                  2
                  /* CLASS */
                )
              ]),
              question.expanded ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "question-content"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "question-answer" },
                  vue.toDisplayString(question.answer),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 联系客服 "),
      vue.createElementVNode("view", { class: "contact-section" }, [
        vue.createElementVNode("view", { class: "contact-card" }, [
          vue.createElementVNode("text", { class: "contact-title" }, "没有找到您的问题？"),
          vue.createElementVNode("text", { class: "contact-desc" }, "联系在线客服获取帮助"),
          vue.createElementVNode("button", {
            class: "contact-btn",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.contactService && $options.contactService(...args))
          }, "联系客服")
        ])
      ])
    ]);
  }
  const PagesFaqFaq = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-c6d6aa18"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/faq/faq.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {
        violationTypes: ["订单取消", "配送超时", "服务态度", "费用争议", "其他"],
        typeIndex: 0,
        selectedType: "",
        violationDate: "",
        appealReason: "",
        uploadedImages: [],
        records: [
          {
            title: "订单取消申诉",
            time: "2024-01-15 14:30",
            reason: "订单无故被取消",
            content: "我在正常配送过程中，订单突然被取消，没有收到任何通知",
            result: "经核实，订单取消是由于商家原因，已为您恢复订单并补偿配送费",
            status: "resolved",
            statusText: "已处理"
          },
          {
            title: "配送超时申诉",
            time: "2024-01-10 18:45",
            reason: "配送时间过长",
            content: "订单配送时间超过预期1小时，影响客户体验",
            result: "已核实配送路线，确实存在绕路情况，已调整配送费",
            status: "resolved",
            statusText: "已处理"
          },
          {
            title: "服务态度申诉",
            time: "2024-01-08 12:20",
            reason: "客户投诉服务态度",
            content: "客户投诉我服务态度不好，但实际情况并非如此",
            status: "pending",
            statusText: "处理中"
          }
        ]
      };
    },
    computed: {
      canSubmit() {
        return this.selectedType && this.violationDate && this.appealReason.trim().length > 10;
      }
    },
    methods: {
      goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack({ delta: 1 });
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      },
      onTypeChange(e) {
        this.typeIndex = e.detail.value;
        this.selectedType = this.violationTypes[e.detail.value];
      },
      onDateChange(e) {
        this.violationDate = e.detail.value;
      },
      uploadImage() {
        uni.chooseImage({
          count: 6 - this.uploadedImages.length,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.uploadedImages.push(...res.tempFilePaths);
          },
          fail: () => {
            uni.showToast({
              title: "上传失败",
              icon: "none"
            });
          }
        });
      },
      deleteImage(index) {
        this.uploadedImages.splice(index, 1);
      },
      submitAppeal() {
        if (!this.canSubmit) {
          uni.showToast({
            title: "请完善申诉信息",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "提交中..."
        });
        setTimeout(() => {
          uni.hideLoading();
          uni.showToast({
            title: "申诉提交成功",
            icon: "success"
          });
          this.selectedType = "";
          this.typeIndex = 0;
          this.violationDate = "";
          this.appealReason = "";
          this.uploadedImages = [];
        }, 1500);
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 自定义导航栏 "),
      vue.createElementVNode("view", { class: "custom-navbar" }, [
        vue.createElementVNode("view", {
          class: "navbar-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "navbar-title" }, "违规申诉"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 申诉状态 "),
      vue.createElementVNode("view", { class: "status-card" }, [
        vue.createElementVNode("view", { class: "status-header" }, [
          vue.createElementVNode("view", { class: "status-icon" }, [
            vue.createElementVNode("text", { class: "icon-text" }, "⚖️")
          ]),
          vue.createElementVNode("text", { class: "status-title" }, "申诉状态")
        ]),
        vue.createElementVNode("view", { class: "status-info" }, [
          vue.createElementVNode("text", { class: "status-label" }, "当前状态:"),
          vue.createElementVNode("text", { class: "status-value pending" }, "待处理")
        ]),
        vue.createElementVNode("text", { class: "status-desc" }, "您的申诉已提交，我们会在24小时内处理")
      ]),
      vue.createCommentVNode(" 申诉记录 "),
      vue.createElementVNode("view", { class: "records-section" }, [
        vue.createElementVNode("text", { class: "section-title" }, "申诉记录"),
        vue.createElementVNode("view", { class: "records-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.records, (record, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "record-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "record-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "record-title" },
                    vue.toDisplayString(record.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["record-status", record.status])
                    },
                    vue.toDisplayString(record.statusText),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "record-time" },
                  vue.toDisplayString(record.time),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "record-reason" },
                  vue.toDisplayString(record.reason),
                  1
                  /* TEXT */
                ),
                record.content ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "record-content"
                }, [
                  vue.createElementVNode("text", { class: "content-label" }, "申诉内容:"),
                  vue.createElementVNode(
                    "text",
                    { class: "content-text" },
                    vue.toDisplayString(record.content),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true),
                record.result ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 1,
                  class: "record-result"
                }, [
                  vue.createElementVNode("text", { class: "result-label" }, "处理结果:"),
                  vue.createElementVNode(
                    "text",
                    { class: "result-text" },
                    vue.toDisplayString(record.result),
                    1
                    /* TEXT */
                  )
                ])) : vue.createCommentVNode("v-if", true)
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 提交申诉 "),
      vue.createElementVNode("view", { class: "submit-section" }, [
        vue.createElementVNode("text", { class: "section-title" }, "提交申诉"),
        vue.createElementVNode("view", { class: "form-card" }, [
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "申诉类型"),
            vue.createElementVNode("picker", {
              onChange: _cache[1] || (_cache[1] = (...args) => $options.onTypeChange && $options.onTypeChange(...args)),
              value: $data.typeIndex,
              range: $data.violationTypes
            }, [
              vue.createElementVNode("view", { class: "picker-view" }, [
                vue.createElementVNode(
                  "text",
                  { class: "picker-text" },
                  vue.toDisplayString($data.selectedType || "请选择申诉类型"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "picker-arrow" }, "▼")
              ])
            ], 40, ["value", "range"])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "违规时间"),
            vue.createElementVNode("picker", {
              mode: "date",
              onChange: _cache[2] || (_cache[2] = (...args) => $options.onDateChange && $options.onDateChange(...args)),
              value: $data.violationDate
            }, [
              vue.createElementVNode("view", { class: "picker-view" }, [
                vue.createElementVNode(
                  "text",
                  { class: "picker-text" },
                  vue.toDisplayString($data.violationDate || "请选择违规时间"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "picker-arrow" }, "▼")
              ])
            ], 40, ["value"])
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "申诉原因"),
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                class: "form-textarea",
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.appealReason = $event),
                placeholder: "请详细描述申诉原因，包括具体情况、时间、地点等",
                maxlength: "500"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.appealReason]
            ]),
            vue.createElementVNode(
              "text",
              { class: "char-count" },
              vue.toDisplayString($data.appealReason.length) + "/500",
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "form-item" }, [
            vue.createElementVNode("text", { class: "form-label" }, "相关证据"),
            vue.createElementVNode("view", { class: "upload-area" }, [
              $data.uploadedImages.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "uploaded-images"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($data.uploadedImages, (image, index) => {
                    return vue.openBlock(), vue.createElementBlock("view", {
                      class: "image-item",
                      key: index
                    }, [
                      vue.createElementVNode("image", {
                        src: image,
                        class: "uploaded-image",
                        mode: "aspectFill"
                      }, null, 8, ["src"]),
                      vue.createElementVNode("view", {
                        class: "delete-btn",
                        onClick: ($event) => $options.deleteImage(index)
                      }, "×", 8, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : vue.createCommentVNode("v-if", true),
              $data.uploadedImages.length < 6 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "upload-btn",
                onClick: _cache[4] || (_cache[4] = (...args) => $options.uploadImage && $options.uploadImage(...args))
              }, [
                vue.createElementVNode("text", { class: "upload-icon" }, "📷"),
                vue.createElementVNode("text", { class: "upload-text" }, "添加图片")
              ])) : vue.createCommentVNode("v-if", true)
            ]),
            vue.createElementVNode("text", { class: "upload-tip" }, "最多可上传6张图片，支持JPG、PNG格式")
          ]),
          vue.createElementVNode("button", {
            class: "submit-btn",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.submitAppeal && $options.submitAppeal(...args)),
            disabled: !$options.canSubmit
          }, "提交申诉", 8, ["disabled"])
        ])
      ])
    ]);
  }
  const PagesViolationViolation = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-d57b78e4"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/violation/violation.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        activeFilter: "all",
        filters: [
          { key: "all", name: "全部" },
          { key: "good", name: "好评" },
          { key: "medium", name: "中评" },
          { key: "bad", name: "差评" }
        ],
        reviews: [
          {
            customer: "张先生",
            avatar: "/static/logo.png",
            time: "2024-01-15 14:30",
            rating: 5,
            content: "骑手服务态度非常好，配送速度很快，食物也很完整，非常满意！",
            tags: ["服务好", "速度快", "态度好"],
            orderId: "ORD20240115001",
            type: "good"
          },
          {
            customer: "李女士",
            avatar: "/static/logo.png",
            time: "2024-01-14 18:45",
            rating: 5,
            content: "准时送达，骑手很有礼貌，下次还会继续使用。",
            tags: ["准时", "有礼貌"],
            orderId: "ORD20240114002",
            type: "good"
          },
          {
            customer: "王先生",
            avatar: "/static/logo.png",
            time: "2024-01-13 12:20",
            rating: 4,
            content: "配送速度可以，但是联系不太及时，希望改进。",
            tags: ["速度可以"],
            orderId: "ORD20240113003",
            type: "medium"
          },
          {
            customer: "刘女士",
            avatar: "/static/logo.png",
            time: "2024-01-12 19:15",
            rating: 5,
            content: "骑手很负责任，下雨天还帮忙送到楼上，非常感谢！",
            tags: ["负责任", "服务好"],
            orderId: "ORD20240112004",
            type: "good"
          },
          {
            customer: "陈先生",
            avatar: "/static/logo.png",
            time: "2024-01-11 16:30",
            rating: 3,
            content: "配送时间比预计的晚了一些，其他还好。",
            tags: ["有待改进"],
            orderId: "ORD20240111005",
            type: "medium"
          },
          {
            customer: "周女士",
            avatar: "/static/logo.png",
            time: "2024-01-10 15:20",
            rating: 5,
            content: "很棒的服务体验，骑手很专业，值得推荐！",
            tags: ["专业", "推荐"],
            orderId: "ORD20240110006",
            type: "good"
          },
          {
            customer: "吴先生",
            avatar: "/static/logo.png",
            time: "2024-01-09 13:45",
            rating: 2,
            content: "配送速度太慢了，等了很久才到。",
            tags: ["速度慢"],
            orderId: "ORD20240109007",
            type: "bad"
          },
          {
            customer: "赵女士",
            avatar: "/static/logo.png",
            time: "2024-01-08 11:30",
            rating: 5,
            content: "非常满意，骑手态度好，配送快，五星好评！",
            tags: ["满意", "五星"],
            orderId: "ORD20240108008",
            type: "good"
          }
        ]
      };
    },
    computed: {
      filteredReviews() {
        if (this.activeFilter === "all") {
          return this.reviews;
        }
        return this.reviews.filter((review) => review.type === this.activeFilter);
      }
    },
    methods: {
      goBack() {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack({ delta: 1 });
        } else {
          uni.reLaunch({ url: "/pages/index/index" });
        }
      },
      selectFilter(filterKey) {
        this.activeFilter = filterKey;
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 自定义导航栏 "),
      vue.createElementVNode("view", { class: "custom-navbar" }, [
        vue.createElementVNode("view", {
          class: "navbar-left",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
        }, [
          vue.createElementVNode("text", { class: "back-icon" }, "←")
        ]),
        vue.createElementVNode("text", { class: "navbar-title" }, "服务评价"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 评分统计 "),
      vue.createElementVNode("view", { class: "stats-card" }, [
        vue.createElementVNode("view", { class: "stats-header" }, [
          vue.createElementVNode("view", { class: "overall-score" }, [
            vue.createElementVNode("text", { class: "score-number" }, "4.8"),
            vue.createElementVNode("text", { class: "score-total" }, "/5.0")
          ]),
          vue.createElementVNode("view", { class: "score-info" }, [
            vue.createElementVNode("text", { class: "score-label" }, "综合评分"),
            vue.createElementVNode("view", { class: "stars" }, [
              vue.createElementVNode("text", { class: "star filled" }, "★"),
              vue.createElementVNode("text", { class: "star filled" }, "★"),
              vue.createElementVNode("text", { class: "star filled" }, "★"),
              vue.createElementVNode("text", { class: "star filled" }, "★"),
              vue.createElementVNode("text", { class: "star half" }, "★")
            ]),
            vue.createElementVNode("text", { class: "total-reviews" }, "共328条评价")
          ])
        ]),
        vue.createElementVNode("view", { class: "rating-bars" }, [
          vue.createElementVNode("view", { class: "rating-bar-item" }, [
            vue.createElementVNode("text", { class: "rating-label" }, "5星"),
            vue.createElementVNode("view", { class: "bar-wrapper" }, [
              vue.createElementVNode("view", {
                class: "bar-fill",
                style: { "width": "85%" }
              })
            ]),
            vue.createElementVNode("text", { class: "rating-percent" }, "85%")
          ]),
          vue.createElementVNode("view", { class: "rating-bar-item" }, [
            vue.createElementVNode("text", { class: "rating-label" }, "4星"),
            vue.createElementVNode("view", { class: "bar-wrapper" }, [
              vue.createElementVNode("view", {
                class: "bar-fill",
                style: { "width": "10%" }
              })
            ]),
            vue.createElementVNode("text", { class: "rating-percent" }, "10%")
          ]),
          vue.createElementVNode("view", { class: "rating-bar-item" }, [
            vue.createElementVNode("text", { class: "rating-label" }, "3星"),
            vue.createElementVNode("view", { class: "bar-wrapper" }, [
              vue.createElementVNode("view", {
                class: "bar-fill",
                style: { "width": "3%" }
              })
            ]),
            vue.createElementVNode("text", { class: "rating-percent" }, "3%")
          ]),
          vue.createElementVNode("view", { class: "rating-bar-item" }, [
            vue.createElementVNode("text", { class: "rating-label" }, "2星"),
            vue.createElementVNode("view", { class: "bar-wrapper" }, [
              vue.createElementVNode("view", {
                class: "bar-fill",
                style: { "width": "1%" }
              })
            ]),
            vue.createElementVNode("text", { class: "rating-percent" }, "1%")
          ]),
          vue.createElementVNode("view", { class: "rating-bar-item" }, [
            vue.createElementVNode("text", { class: "rating-label" }, "1星"),
            vue.createElementVNode("view", { class: "bar-wrapper" }, [
              vue.createElementVNode("view", {
                class: "bar-fill",
                style: { "width": "1%" }
              })
            ]),
            vue.createElementVNode("text", { class: "rating-percent" }, "1%")
          ])
        ])
      ]),
      vue.createCommentVNode(" 筛选标签 "),
      vue.createElementVNode("view", { class: "filter-section" }, [
        vue.createElementVNode("view", { class: "filter-tabs" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.filters, (filter) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: vue.normalizeClass(["filter-tab", { active: $data.activeFilter === filter.key }]),
                key: filter.key,
                onClick: ($event) => $options.selectFilter(filter.key)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "tab-text" },
                  vue.toDisplayString(filter.name),
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 评价列表 "),
      vue.createElementVNode("view", { class: "reviews-list" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($options.filteredReviews, (review, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "review-item",
              key: index
            }, [
              vue.createElementVNode("view", { class: "review-header" }, [
                vue.createElementVNode("image", {
                  class: "customer-avatar",
                  src: review.avatar,
                  mode: "aspectFill"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "customer-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "customer-name" },
                    vue.toDisplayString(review.customer),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "review-time" },
                    vue.toDisplayString(review.time),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "review-stars" }, [
                  (vue.openBlock(), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(5, (i) => {
                      return vue.createElementVNode(
                        "text",
                        {
                          class: vue.normalizeClass(["star", { filled: i < review.rating }]),
                          key: i
                        },
                        "★",
                        2
                        /* CLASS */
                      );
                    }),
                    64
                    /* STABLE_FRAGMENT */
                  ))
                ])
              ]),
              vue.createElementVNode("view", { class: "review-content" }, [
                vue.createElementVNode(
                  "text",
                  { class: "review-text" },
                  vue.toDisplayString(review.content),
                  1
                  /* TEXT */
                )
              ]),
              review.tags && review.tags.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "review-tags"
              }, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList(review.tags, (tag, tIndex) => {
                    return vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        class: "review-tag",
                        key: tIndex
                      },
                      vue.toDisplayString(tag),
                      1
                      /* TEXT */
                    );
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])) : vue.createCommentVNode("v-if", true),
              vue.createElementVNode("view", { class: "order-info" }, [
                vue.createElementVNode(
                  "text",
                  { class: "order-text" },
                  "订单：" + vue.toDisplayString(review.orderId),
                  1
                  /* TEXT */
                )
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])
    ]);
  }
  const PagesRatingRating = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-4aa1c0e0"], ["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/pages/rating/rating.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/register/register", PagesRegisterRegister);
  __definePage("pages/order/order", PagesOrderOrder);
  __definePage("pages/route/route", PagesRouteRoute);
  __definePage("pages/message/message", PagesMessageMessage);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/security/security", PagesSecuritySecurity);
  __definePage("pages/security/password-edit", PagesSecurityPasswordEdit);
  __definePage("pages/security/payment-password", PagesSecurityPaymentPassword);
  __definePage("pages/profile/profile", PagesProfileProfile);
  __definePage("pages/profile/avatar-edit", PagesProfileAvatarEdit);
  __definePage("pages/profile/nickname-edit", PagesProfileNicknameEdit);
  __definePage("pages/profile/phone-edit", PagesProfilePhoneEdit);
  __definePage("pages/privacy/privacy", PagesPrivacyPrivacy);
  __definePage("pages/wallet/wallet", PagesWalletWallet);
  __definePage("pages/orders/orders", PagesOrdersOrders);
  __definePage("pages/certification/certification", PagesCertificationCertification);
  __definePage("pages/faq/faq", PagesFaqFaq);
  __definePage("pages/violation/violation", PagesViolationViolation);
  __definePage("pages/rating/rating", PagesRatingRating);
  const _sfc_main = {
    globalData: {},
    onLaunch: function() {
      formatAppLog("log", "at App.vue:7", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:10", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:13", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/University-student-comprehensive-service-platform-front-rider/University-student-comprehensive-service-platform-front-rider/rider/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    app.component("tabbar", Tabbar);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
