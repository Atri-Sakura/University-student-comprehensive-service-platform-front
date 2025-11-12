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
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$a = {
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
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
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
  const Tabbar = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-e9b92a61"], ["__file", "D:/shiyan/rider/rider/components/tabbar/tabbar.vue"]]);
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
  const _sfc_main$9 = {
    data() {
      return {};
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_tabbar = resolveEasycom(vue.resolveDynamicComponent("tabbar"), Tabbar);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "placeholder-content" }, [
        vue.createElementVNode("text", { class: "placeholder-icon" }, "📋"),
        vue.createElementVNode("text", { class: "placeholder-text" }, "订单页面"),
        vue.createElementVNode("text", { class: "placeholder-desc" }, "开发中...")
      ]),
      vue.createVNode(_component_tabbar, { current: 0 })
    ]);
  }
  const PagesOrderOrder = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-93207a4f"], ["__file", "D:/shiyan/rider/rider/pages/order/order.vue"]]);
  const _sfc_main$8 = {
    data() {
      return {};
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesRouteRoute = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-9b6e348a"], ["__file", "D:/shiyan/rider/rider/pages/route/route.vue"]]);
  const _sfc_main$7 = {
    data() {
      return {};
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesMessageMessage = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-4c1b26cf"], ["__file", "D:/shiyan/rider/rider/pages/message/message.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        userInfo: {
          name: "蜂鸟骑士",
          rating: 4.8,
          todayOrders: 15,
          todayIncome: 256.8,
          avatar: "/static/logo.png"
        }
      };
    },
    onLoad() {
      try {
        const saved = uni.getStorageSync("userInfo");
        if (saved && typeof saved === "object") {
          this.userInfo = { ...this.userInfo, ...saved };
        }
      } catch (e) {
      }
    },
    onShow() {
      try {
        const saved = uni.getStorageSync("userInfo");
        if (saved && typeof saved === "object") {
          this.userInfo = { ...this.userInfo, ...saved };
        }
      } catch (e) {
      }
    },
    methods: {
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
        const serviceNames = {
          certificate: "资质认证",
          rating: "服务评价",
          support: "在线客服",
          faq: "常见问题",
          violation: "违规申诉"
        };
        uni.showToast({ title: serviceNames[type], icon: "none" });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/shiyan/rider/rider/pages/index/index.vue"]]);
  const _sfc_main$5 = {
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
        uni.showToast({
          title: "功能开发中",
          icon: "none"
        });
      },
      handleLogout() {
        uni.showModal({
          title: "确认退出",
          content: "退出后将无法接收订单通知，确认退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: "已退出登录",
                icon: "success"
              });
              setTimeout(() => {
                uni.reLaunch({
                  url: "/pages/index/index"
                });
              }, 1500);
            }
          }
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
            onClick: _cache[2] || (_cache[2] = ($event) => $options.handleItem("phone"))
          }, [
            vue.createElementVNode("view", { class: "info-icon phone-icon" }),
            vue.createElementVNode("view", { class: "info-content" }, [
              vue.createElementVNode("text", { class: "info-label" }, "绑定手机"),
              vue.createElementVNode("text", { class: "info-value" }, "138****8888")
            ]),
            vue.createElementVNode("text", { class: "info-arrow" }, "〉")
          ]),
          vue.createElementVNode("view", {
            class: "info-item",
            onClick: _cache[3] || (_cache[3] = ($event) => $options.handleItem("payment"))
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
            onClick: _cache[4] || (_cache[4] = ($event) => $options.handleItem("2fa"))
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
            onClick: _cache[5] || (_cache[5] = ($event) => $options.handleItem("face"))
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
            onClick: _cache[6] || (_cache[6] = ($event) => $options.handleItem("fingerprint"))
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
          onClick: _cache[7] || (_cache[7] = (...args) => $options.handleLogout && $options.handleLogout(...args))
        }, "退出登录")
      ])
    ]);
  }
  const PagesSecuritySecurity = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-841ba230"], ["__file", "D:/shiyan/rider/rider/pages/security/security.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        userInfo: {
          avatar: "/static/logo.png",
          name: "蜂鸟骑士",
          phone: "138****8888",
          idCard: "320***********1234",
          address: "江苏省南京市鼓楼区中山路123号"
        }
      };
    },
    onLoad() {
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.$vm && prevPage.$vm.userInfo) {
        this.userInfo.name = prevPage.$vm.userInfo.name;
        this.userInfo.avatar = prevPage.$vm.userInfo.avatar;
      }
    },
    onShow() {
    },
    methods: {
      goBack() {
        formatAppLog("log", "at pages/profile/profile.vue:80", "返回按钮被点击");
        uni.showToast({
          title: "正在返回...",
          icon: "none",
          duration: 500
        });
        setTimeout(() => {
          const pages = getCurrentPages();
          formatAppLog("log", "at pages/profile/profile.vue:90", "当前页面栈长度:", pages.length);
          if (pages.length > 1) {
            formatAppLog("log", "at pages/profile/profile.vue:93", "使用 navigateBack");
            uni.navigateBack({
              delta: 1,
              success: () => {
                formatAppLog("log", "at pages/profile/profile.vue:97", "返回成功");
              },
              fail: (err) => {
                formatAppLog("log", "at pages/profile/profile.vue:100", "返回失败:", err);
                uni.reLaunch({ url: "/pages/index/index" });
              }
            });
          } else {
            formatAppLog("log", "at pages/profile/profile.vue:106", "使用 reLaunch");
            uni.reLaunch({ url: "/pages/index/index" });
          }
        }, 100);
      },
      chooseAvatar() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.userInfo.avatar = res.tempFilePaths[0];
          }
        });
      },
      saveProfile() {
        if (!this.userInfo.name) {
          uni.showToast({
            title: "请输入姓名",
            icon: "none"
          });
          return;
        }
        if (!this.userInfo.phone) {
          uni.showToast({
            title: "请输入手机号",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "保存中..."
        });
        setTimeout(() => {
          uni.hideLoading();
          uni.showToast({
            title: "保存成功",
            icon: "success"
          });
          try {
            uni.setStorageSync("userInfo", {
              name: this.userInfo.name,
              avatar: this.userInfo.avatar,
              phone: this.userInfo.phone,
              idCard: this.userInfo.idCard,
              address: this.userInfo.address
            });
          } catch (e) {
          }
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }, 1e3);
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
        vue.createElementVNode("text", { class: "navbar-title" }, "个人信息修改"),
        vue.createElementVNode("view", { class: "navbar-right" })
      ]),
      vue.createCommentVNode(" 头像区域 "),
      vue.createElementVNode("view", { class: "avatar-section" }, [
        vue.createElementVNode("view", {
          class: "avatar-container",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.chooseAvatar && $options.chooseAvatar(...args))
        }, [
          vue.createElementVNode("image", {
            class: "avatar",
            src: $data.userInfo.avatar,
            mode: "aspectFill"
          }, null, 8, ["src"]),
          vue.createElementVNode("view", { class: "avatar-overlay" }, [
            vue.createElementVNode("text", { class: "camera-icon" }, "📷")
          ])
        ]),
        vue.createElementVNode("text", { class: "avatar-tip" }, "点击更换头像")
      ]),
      vue.createCommentVNode(" 表单区域 "),
      vue.createElementVNode("view", { class: "form-section" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "姓名"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.userInfo.name = $event),
              placeholder: "请输入姓名"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.userInfo.name]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "手机号"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.userInfo.phone = $event),
              placeholder: "请输入手机号",
              type: "number"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.userInfo.phone]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "身份证号"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "form-input",
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.userInfo.idCard = $event),
              placeholder: "请输入身份证号"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.userInfo.idCard]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "现居住地址"),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              class: "form-textarea",
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.userInfo.address = $event),
              placeholder: "请输入现居住地址"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.userInfo.address]
          ])
        ])
      ]),
      vue.createCommentVNode(" 保存按钮 "),
      vue.createElementVNode("view", { class: "save-section" }, [
        vue.createElementVNode("button", {
          class: "save-btn",
          onClick: _cache[6] || (_cache[6] = (...args) => $options.saveProfile && $options.saveProfile(...args))
        }, "保存修改")
      ])
    ]);
  }
  const PagesProfileProfile = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-dd383ca2"], ["__file", "D:/shiyan/rider/rider/pages/profile/profile.vue"]]);
  const _sfc_main$3 = {
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
  const PagesPrivacyPrivacy = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-33d54784"], ["__file", "D:/shiyan/rider/rider/pages/privacy/privacy.vue"]]);
  const _sfc_main$2 = {
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
  const PagesWalletWallet = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-4c380209"], ["__file", "D:/shiyan/rider/rider/pages/wallet/wallet.vue"]]);
  const _sfc_main$1 = {
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
  const PagesOrdersOrders = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-1acc51a1"], ["__file", "D:/shiyan/rider/rider/pages/orders/orders.vue"]]);
  __definePage("pages/order/order", PagesOrderOrder);
  __definePage("pages/route/route", PagesRouteRoute);
  __definePage("pages/message/message", PagesMessageMessage);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/security/security", PagesSecuritySecurity);
  __definePage("pages/profile/profile", PagesProfileProfile);
  __definePage("pages/privacy/privacy", PagesPrivacyPrivacy);
  __definePage("pages/wallet/wallet", PagesWalletWallet);
  __definePage("pages/orders/orders", PagesOrdersOrders);
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
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/shiyan/rider/rider/App.vue"]]);
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
