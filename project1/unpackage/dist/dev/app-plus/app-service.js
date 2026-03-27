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
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$5 = {
    name: "RestaurantHome",
    data() {
      return {
        shopData: {
          name: "美味餐厅",
          businessStatus: "营业中",
          businessHours: "08:00-22:00"
        },
        todayDate: "",
        todayData: {
          orderCount: 86,
          orderTrend: 12,
          revenue: "5,268",
          revenueTrend: 8
        },
        orderStatus: {
          pending: 12,
          toDeliver: 8,
          delivering: 5
        },
        functions: [
          { name: "商品管理", icon: "🍴", color: "#B3D9FF", path: "/pages/products/products" },
          { name: "订单管理", icon: "📋", color: "#B3D9FF", path: "/pages/orders/orders" },
          { name: "活动管理", icon: "📈", color: "#B3D9FF", path: "/pages/activities/activities" },
          { name: "门店设置", icon: "🏪", color: "#B3D9FF", path: "/pages/settings/settings" },
          { name: "评价查看", icon: "📝", color: "#B3D9FF", path: "/pages/reviews/reviews" },
          { name: "财务管理", icon: "💰", color: "#B3D9FF", path: "/pages/finance/finance" },
          { name: "数据分析", icon: "📊", color: "#B3D9FF", path: "/pages/analytics/analytics" },
          { name: "联系客服", icon: "🎧", color: "#B3D9FF", path: "/pages/support/support" }
        ]
      };
    },
    onLoad() {
      this.getTodayDate();
      this.loadTodayData();
    },
    methods: {
      getTodayDate() {
        const date = /* @__PURE__ */ new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        this.todayDate = `${year}-${month}-${day}`;
      },
      loadTodayData() {
        formatAppLog("log", "at pages/index/index.vue:132", "加载今日数据");
      },
      goToAnalytics() {
        uni.navigateTo({
          url: "/pages/analytics/analytics"
        });
      },
      goToOrders(status) {
        uni.navigateTo({
          url: `/pages/orders/orders?status=${status}`
        });
      },
      goToFunction(path) {
        if (path === "/pages/analytics/analytics") {
          this.goToAnalytics();
        } else {
          uni.showToast({
            title: "功能开发中",
            icon: "none"
          });
        }
      },
      goToActivity() {
        uni.showToast({
          title: "查看活动详情",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 顶部店铺信息 "),
      vue.createElementVNode("view", { class: "shop-header" }, [
        vue.createElementVNode("view", { class: "shop-icon" }, "🏪"),
        vue.createElementVNode("view", { class: "shop-info" }, [
          vue.createElementVNode(
            "view",
            { class: "shop-name" },
            vue.toDisplayString($data.shopData.name),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "view",
            { class: "shop-status" },
            vue.toDisplayString($data.shopData.businessStatus) + " · " + vue.toDisplayString($data.shopData.businessHours),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 主要内容区域 "),
      vue.createElementVNode("view", { class: "content" }, [
        vue.createCommentVNode(" 今日数据 "),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-title" }, [
            vue.createElementVNode("text", { class: "title-text" }, "今日数据"),
            vue.createElementVNode(
              "text",
              { class: "date-text" },
              vue.toDisplayString($data.todayDate),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "data-cards" }, [
            vue.createElementVNode("view", {
              class: "data-card",
              onClick: _cache[0] || (_cache[0] = (...args) => $options.goToAnalytics && $options.goToAnalytics(...args))
            }, [
              vue.createElementVNode("text", { class: "card-label" }, "订单量"),
              vue.createElementVNode(
                "text",
                { class: "card-value" },
                vue.toDisplayString($data.todayData.orderCount),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "card-trend positive" },
                vue.toDisplayString($data.todayData.orderTrend > 0 ? "+" : "") + vue.toDisplayString($data.todayData.orderTrend) + "% 昨日 ",
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "data-card",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.goToAnalytics && $options.goToAnalytics(...args))
            }, [
              vue.createElementVNode("text", { class: "card-label" }, "营业额"),
              vue.createElementVNode(
                "text",
                { class: "card-value" },
                "¥" + vue.toDisplayString($data.todayData.revenue),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "card-trend positive" },
                vue.toDisplayString($data.todayData.revenueTrend > 0 ? "+" : "") + vue.toDisplayString($data.todayData.revenueTrend) + "% 昨日 ",
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createCommentVNode(" 订单状态 "),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-title" }, [
            vue.createElementVNode("text", { class: "title-text" }, "订单状态")
          ]),
          vue.createElementVNode("view", { class: "order-status-cards" }, [
            vue.createElementVNode("view", {
              class: "status-card",
              onClick: _cache[2] || (_cache[2] = ($event) => $options.goToOrders("pending"))
            }, [
              vue.createElementVNode("text", { class: "status-label" }, "待处理"),
              vue.createElementVNode(
                "text",
                { class: "status-count" },
                vue.toDisplayString($data.orderStatus.pending),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "status-card",
              onClick: _cache[3] || (_cache[3] = ($event) => $options.goToOrders("toDeliver"))
            }, [
              vue.createElementVNode("text", { class: "status-label" }, "待配送"),
              vue.createElementVNode(
                "text",
                { class: "status-count" },
                vue.toDisplayString($data.orderStatus.toDeliver),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "status-card",
              onClick: _cache[4] || (_cache[4] = ($event) => $options.goToOrders("delivering"))
            }, [
              vue.createElementVNode("text", { class: "status-label" }, "配送中"),
              vue.createElementVNode(
                "text",
                { class: "status-count" },
                vue.toDisplayString($data.orderStatus.delivering),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createCommentVNode(" 常用功能 "),
        vue.createElementVNode("view", { class: "section" }, [
          vue.createElementVNode("view", { class: "section-title" }, [
            vue.createElementVNode("text", { class: "title-text" }, "常用功能")
          ]),
          vue.createElementVNode("view", { class: "function-grid" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.functions, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "function-item",
                  key: item.name,
                  onClick: ($event) => $options.goToFunction(item.path)
                }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: "function-icon",
                      style: vue.normalizeStyle({ backgroundColor: item.color })
                    },
                    [
                      vue.createElementVNode(
                        "text",
                        { class: "icon-text" },
                        vue.toDisplayString(item.icon),
                        1
                        /* TEXT */
                      )
                    ],
                    4
                    /* STYLE */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "function-name" },
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createCommentVNode(" 活动通知 "),
        vue.createElementVNode("view", {
          class: "notice-banner",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.goToActivity && $options.goToActivity(...args))
        }, [
          vue.createElementVNode("text", { class: "notice-text" }, "新客立减活动进行中，点击查看"),
          vue.createElementVNode("view", { class: "notice-btn" }, "查看")
        ])
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-1cf27b2a"], ["__file", "C:/Users/Administrator/Desktop/project1/project1.0/pages/index/index.vue"]]);
  const _sfc_main$4 = {
    name: "OrderPage",
    data() {
      return {
        currentTab: 0,
        tabs: [
          { name: "全部", count: 0 },
          { name: "待处理", count: 3 },
          { name: "配送中", count: 2 },
          { name: "已完成", count: 0 }
        ],
        allOrders: [
          {
            orderNo: "20241022001",
            customerName: "张先生",
            status: "待处理",
            statusColor: "#ff9800",
            time: "10:30",
            address: "科技园A座1201",
            amount: "128.00",
            actionText: "接单"
          },
          {
            orderNo: "20241022002",
            customerName: "李女士",
            status: "待处理",
            statusColor: "#ff9800",
            time: "10:45",
            address: "万科广场B栋502",
            amount: "85.50",
            actionText: "接单"
          },
          {
            orderNo: "20241022003",
            customerName: "王先生",
            status: "待处理",
            statusColor: "#ff9800",
            time: "11:00",
            address: "阳光小区3号楼801",
            amount: "256.80",
            actionText: "接单"
          },
          {
            orderNo: "20241022004",
            customerName: "赵女士",
            status: "配送中",
            statusColor: "#2196f3",
            time: "09:30",
            address: "CBD中心2栋1508",
            amount: "198.00",
            actionText: "查看"
          },
          {
            orderNo: "20241022005",
            customerName: "刘先生",
            status: "配送中",
            statusColor: "#2196f3",
            time: "09:15",
            address: "锦绣花园12栋302",
            amount: "156.00",
            actionText: "查看"
          }
        ],
        orderList: []
      };
    },
    onLoad() {
      this.loadOrders();
    },
    methods: {
      switchTab(index) {
        this.currentTab = index;
        this.loadOrders();
      },
      loadOrders() {
        if (this.currentTab === 0) {
          this.orderList = this.allOrders;
        } else if (this.currentTab === 1) {
          this.orderList = this.allOrders.filter((order) => order.status === "待处理");
        } else if (this.currentTab === 2) {
          this.orderList = this.allOrders.filter((order) => order.status === "配送中");
        } else {
          this.orderList = [];
        }
      },
      viewOrder(item) {
        uni.showToast({
          title: "查看订单详情",
          icon: "none"
        });
      },
      handleOrder(item) {
        if (item.status === "待处理") {
          uni.showModal({
            title: "提示",
            content: "确定接单吗？",
            success: (res) => {
              if (res.confirm) {
                uni.showToast({
                  title: "接单成功",
                  icon: "success"
                });
              }
            }
          });
        }
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "订单管理")
      ]),
      vue.createCommentVNode(" 订单状态筛选 "),
      vue.createElementVNode("view", { class: "tabs" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.tabs, (tab, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: vue.normalizeClass(["tab-item", { active: $data.currentTab === index }]),
              key: index,
              onClick: ($event) => $options.switchTab(index)
            }, [
              vue.createElementVNode(
                "text",
                { class: "tab-text" },
                vue.toDisplayString(tab.name),
                1
                /* TEXT */
              ),
              tab.count > 0 ? (vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: 0,
                  class: "tab-badge"
                },
                vue.toDisplayString(tab.count),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ], 10, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.orderList, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "order-item",
              key: index,
              onClick: ($event) => $options.viewOrder(item)
            }, [
              vue.createElementVNode("view", { class: "order-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "order-no" },
                  "订单号：" + vue.toDisplayString(item.orderNo),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  {
                    class: "order-status",
                    style: vue.normalizeStyle({ color: item.statusColor })
                  },
                  vue.toDisplayString(item.status),
                  5
                  /* TEXT, STYLE */
                )
              ]),
              vue.createElementVNode("view", { class: "order-content" }, [
                vue.createElementVNode("view", { class: "order-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "customer-name" },
                    "👤 " + vue.toDisplayString(item.customerName),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "order-time" },
                    "🕐 " + vue.toDisplayString(item.time),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "order-address" },
                    "📍 " + vue.toDisplayString(item.address),
                    1
                    /* TEXT */
                  )
                ])
              ]),
              vue.createElementVNode("view", { class: "order-footer" }, [
                vue.createElementVNode(
                  "text",
                  { class: "order-amount" },
                  "¥" + vue.toDisplayString(item.amount),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "order-actions" }, [
                  vue.createElementVNode("view", {
                    class: "action-btn",
                    onClick: vue.withModifiers(($event) => $options.handleOrder(item), ["stop"])
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "btn-text" },
                      vue.toDisplayString(item.actionText),
                      1
                      /* TEXT */
                    )
                  ], 8, ["onClick"])
                ])
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $data.orderList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, [
          vue.createElementVNode("text", { class: "empty-icon" }, "📋"),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无订单")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesListList = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-98a9e0b2"], ["__file", "C:/Users/Administrator/Desktop/project1/project1.0/pages/list/list.vue"]]);
  const _sfc_main$3 = {
    name: "MessagePage",
    data() {
      return {
        messages: [
          {
            icon: "📋",
            iconColor: "#FFE5B4",
            title: "订单通知",
            content: "您有3个新订单待处理",
            time: "10:30",
            unread: 3
          },
          {
            icon: "💬",
            iconColor: "#B3E5FC",
            title: "系统消息",
            content: "您的店铺认证已通过",
            time: "昨天",
            unread: 1
          },
          {
            icon: "🎉",
            iconColor: "#F8BBD0",
            title: "活动通知",
            content: "新客立减活动即将开始",
            time: "2天前",
            unread: 0
          },
          {
            icon: "💰",
            iconColor: "#C8E6C9",
            title: "财务通知",
            content: "您有一笔提现到账",
            time: "3天前",
            unread: 0
          }
        ]
      };
    },
    methods: {
      viewMessage(item) {
        uni.showToast({
          title: "查看消息详情",
          icon: "none"
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "消息中心")
      ]),
      vue.createElementVNode("view", { class: "content" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.messages, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "message-item",
              key: index,
              onClick: ($event) => $options.viewMessage(item)
            }, [
              vue.createElementVNode(
                "view",
                {
                  class: "message-icon",
                  style: vue.normalizeStyle({ backgroundColor: item.iconColor })
                },
                [
                  vue.createElementVNode(
                    "text",
                    { class: "icon-text" },
                    vue.toDisplayString(item.icon),
                    1
                    /* TEXT */
                  )
                ],
                4
                /* STYLE */
              ),
              vue.createElementVNode("view", { class: "message-info" }, [
                vue.createElementVNode("view", { class: "message-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "message-title" },
                    vue.toDisplayString(item.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "message-time" },
                    vue.toDisplayString(item.time),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "message-content" },
                  vue.toDisplayString(item.content),
                  1
                  /* TEXT */
                )
              ]),
              item.unread > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "unread-badge"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "badge-text" },
                  vue.toDisplayString(item.unread),
                  1
                  /* TEXT */
                )
              ])) : vue.createCommentVNode("v-if", true)
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $data.messages.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, [
          vue.createElementVNode("text", { class: "empty-icon" }, "📭"),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无消息")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesMessageMessage = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-4c1b26cf"], ["__file", "C:/Users/Administrator/Desktop/project1/project1.0/pages/message/message.vue"]]);
  const _sfc_main$2 = {
    name: "MinePage",
    data() {
      return {
        userInfo: {
          name: "美味餐厅",
          phone: "138****8888"
        },
        stats: {
          totalRevenue: "52,680",
          totalOrders: 1286,
          totalCustomers: 856
        },
        menuList: [
          { name: "我的收藏", icon: "⭐", path: "/pages/favorites/favorites" },
          { name: "优惠券", icon: "🎫", path: "/pages/coupons/coupons" },
          { name: "账户余额", icon: "💰", path: "/pages/balance/balance" },
          { name: "交易记录", icon: "📝", path: "/pages/transactions/transactions" }
        ],
        shopMenuList: [
          { name: "店铺设置", icon: "⚙️", path: "/pages/settings/settings" },
          { name: "营业时间", icon: "🕐", path: "/pages/hours/hours" },
          { name: "员工管理", icon: "👥", path: "/pages/staff/staff" },
          { name: "关于我们", icon: "ℹ️", path: "/pages/about/about" }
        ]
      };
    },
    methods: {
      editProfile() {
        uni.showToast({
          title: "编辑资料",
          icon: "none"
        });
      },
      goToPage(path) {
        uni.showToast({
          title: "功能开发中",
          icon: "none"
        });
      },
      logout() {
        uni.showModal({
          title: "提示",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              uni.showToast({
                title: "已退出登录",
                icon: "success"
              });
            }
          }
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 用户信息卡片 "),
      vue.createElementVNode("view", { class: "user-card" }, [
        vue.createElementVNode("view", { class: "user-avatar" }, [
          vue.createElementVNode("text", { class: "avatar-text" }, "👤")
        ]),
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode(
            "text",
            { class: "user-name" },
            vue.toDisplayString($data.userInfo.name),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "user-phone" },
            vue.toDisplayString($data.userInfo.phone),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", {
          class: "edit-btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.editProfile && $options.editProfile(...args))
        }, [
          vue.createElementVNode("text", { class: "edit-text" }, "编辑")
        ])
      ]),
      vue.createCommentVNode(" 数据统计 "),
      vue.createElementVNode("view", { class: "stats-card" }, [
        vue.createElementVNode("view", {
          class: "stat-item",
          onClick: _cache[1] || (_cache[1] = ($event) => $options.goToPage("revenue"))
        }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            "¥" + vue.toDisplayString($data.stats.totalRevenue),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "总营业额")
        ]),
        vue.createElementVNode("view", { class: "stat-divider" }),
        vue.createElementVNode("view", {
          class: "stat-item",
          onClick: _cache[2] || (_cache[2] = ($event) => $options.goToPage("orders"))
        }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.stats.totalOrders),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "总订单数")
        ]),
        vue.createElementVNode("view", { class: "stat-divider" }),
        vue.createElementVNode("view", {
          class: "stat-item",
          onClick: _cache[3] || (_cache[3] = ($event) => $options.goToPage("customers"))
        }, [
          vue.createElementVNode(
            "text",
            { class: "stat-value" },
            vue.toDisplayString($data.stats.totalCustomers),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "stat-label" }, "客户数")
        ])
      ]),
      vue.createCommentVNode(" 功能菜单 "),
      vue.createElementVNode("view", { class: "menu-section" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.menuList, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "menu-item",
              key: item.name,
              onClick: ($event) => $options.goToPage(item.path)
            }, [
              vue.createElementVNode("view", { class: "menu-left" }, [
                vue.createElementVNode(
                  "text",
                  { class: "menu-icon" },
                  vue.toDisplayString(item.icon),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "menu-name" },
                  vue.toDisplayString(item.name),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 店铺管理 "),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, [
          vue.createElementVNode("text", { class: "title-text" }, "店铺管理")
        ]),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.shopMenuList, (item) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              class: "menu-item",
              key: item.name,
              onClick: ($event) => $options.goToPage(item.path)
            }, [
              vue.createElementVNode("view", { class: "menu-left" }, [
                vue.createElementVNode(
                  "text",
                  { class: "menu-icon" },
                  vue.toDisplayString(item.icon),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "menu-name" },
                  vue.toDisplayString(item.name),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("text", { class: "menu-arrow" }, "›")
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 退出登录 "),
      vue.createElementVNode("view", {
        class: "logout-btn",
        onClick: _cache[4] || (_cache[4] = (...args) => $options.logout && $options.logout(...args))
      }, [
        vue.createElementVNode("text", { class: "logout-text" }, "退出登录")
      ])
    ]);
  }
  const PagesMineMine = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-7c2ebfa5"], ["__file", "C:/Users/Administrator/Desktop/project1/project1.0/pages/mine/mine.vue"]]);
  const _sfc_main$1 = {
    name: "DataAnalysis",
    data() {
      return {
        currentDateTab: "today",
        currentDateRange: "2023-11-15",
        rankingType: "hot",
        currentTab: "",
        // 当前不在底部导航栏中，所以为空
        coreData: {
          orderCount: 86,
          orderTrend: 12,
          revenue: "5,268",
          revenueTrend: 8,
          actualRevenue: "4,835",
          actualRevenueTrend: 7,
          avgPrice: "61.3",
          avgPriceTrend: 3
        },
        productRanking: [
          { name: "招牌汉堡套餐", sales: 156, amount: "35.00" },
          { name: "经典炸鸡桶", sales: 134, amount: "68.00" },
          { name: "芝士牛肉汉堡", sales: 98, amount: "28.00" },
          { name: "薯条（大份）", sales: 87, amount: "15.00" },
          { name: "可乐（大杯）", sales: 76, amount: "8.00" }
        ],
        ratingData: {
          overallScore: 4.8,
          starDistribution: [
            { star: 5, percentage: 78 },
            { star: 4, percentage: 15 },
            { star: 3, percentage: 5 },
            { star: 2, percentage: 1 },
            { star: 1, percentage: 1 }
          ],
          positiveKeywords: ["味道好", "配送快", "包装精美", "服务热情", "性价比高"],
          negativeKeywords: ["等待时间长", "分量不足", "包装破损"]
        }
      };
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      switchDateTab(tab) {
        this.currentDateTab = tab;
        formatAppLog("log", "at pages/analytics/analytics.vue:291", "切换日期标签:", tab);
      },
      switchRankingType(type) {
        this.rankingType = type;
        formatAppLog("log", "at pages/analytics/analytics.vue:295", "切换排行类型:", type);
      },
      switchTab(tab) {
        this.currentTab = tab;
        formatAppLog("log", "at pages/analytics/analytics.vue:299", "切换底部导航:", tab);
        switch (tab) {
          case "index":
            uni.switchTab({
              url: "/pages/index/index"
            });
            break;
          case "list":
            uni.switchTab({
              url: "/pages/list/list"
            });
            break;
          case "message":
            uni.switchTab({
              url: "/pages/message/message"
            });
            break;
          case "mine":
            uni.switchTab({
              url: "/pages/mine/mine"
            });
            break;
        }
      },
      changeTrendPeriod() {
        formatAppLog("log", "at pages/analytics/analytics.vue:326", "切换趋势周期");
      },
      viewAllRanking() {
        formatAppLog("log", "at pages/analytics/analytics.vue:329", "查看全部排行");
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "page-container" }, [
      vue.createCommentVNode(" 顶部导航栏 - 固定定位 "),
      vue.createElementVNode("view", { class: "nav-header fixed-header" }, [
        vue.createElementVNode("view", { class: "nav-left" }, [
          vue.createElementVNode("view", {
            class: "back-button",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            (vue.openBlock(), vue.createElementBlock("svg", {
              class: "back-icon",
              viewBox: "0 0 24 24",
              fill: "currentColor"
            }, [
              vue.createElementVNode("path", { d: "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" })
            ])),
            vue.createElementVNode("text", null, "返回")
          ])
        ]),
        vue.createElementVNode("view", { class: "nav-title" }, "数据分析"),
        vue.createElementVNode("view", { class: "nav-right" }, [
          vue.createCommentVNode(" 右侧空白区域 ")
        ])
      ]),
      vue.createCommentVNode(" 主要内容区域 - 可滚动 "),
      vue.createElementVNode("view", { class: "content-scroll" }, [
        vue.createCommentVNode(" 日期选择 "),
        vue.createElementVNode("view", { class: "date-selector" }, [
          vue.createElementVNode("view", { class: "date-tabs" }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["date-tab", { active: $data.currentDateTab === "today" }]),
                onClick: _cache[1] || (_cache[1] = ($event) => $options.switchDateTab("today"))
              },
              " 今日 ",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["date-tab", { active: $data.currentDateTab === "yesterday" }]),
                onClick: _cache[2] || (_cache[2] = ($event) => $options.switchDateTab("yesterday"))
              },
              " 昨日 ",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["date-tab", { active: $data.currentDateTab === "week" }]),
                onClick: _cache[3] || (_cache[3] = ($event) => $options.switchDateTab("week"))
              },
              " 本周 ",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["date-tab", { active: $data.currentDateTab === "month" }]),
                onClick: _cache[4] || (_cache[4] = ($event) => $options.switchDateTab("month"))
              },
              " 本月 ",
              2
              /* CLASS */
            )
          ]),
          vue.createElementVNode("view", { class: "date-range" }, [
            (vue.openBlock(), vue.createElementBlock("svg", {
              class: "date-icon",
              viewBox: "0 0 24 24",
              fill: "currentColor"
            }, [
              vue.createElementVNode("path", { d: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" })
            ])),
            vue.createElementVNode(
              "text",
              null,
              vue.toDisplayString($data.currentDateRange),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createCommentVNode(" 核心数据 "),
        vue.createElementVNode("view", { class: "core-data" }, [
          vue.createElementVNode("view", { class: "data-cards" }, [
            vue.createElementVNode("view", { class: "data-card" }, [
              (vue.openBlock(), vue.createElementBlock("svg", {
                class: "data-icon",
                viewBox: "0 0 24 24",
                fill: "currentColor"
              }, [
                vue.createElementVNode("path", { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" })
              ])),
              vue.createElementVNode("view", { class: "data-title" }, "订单量"),
              vue.createElementVNode(
                "view",
                { class: "data-value" },
                vue.toDisplayString($data.coreData.orderCount),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["data-compare", $data.coreData.orderTrend > 0 ? "compare-up" : "compare-down"])
                },
                [
                  (vue.openBlock(), vue.createElementBlock("svg", {
                    class: "trend-icon",
                    viewBox: "0 0 24 24",
                    fill: "currentColor"
                  }, [
                    $data.coreData.orderTrend > 0 ? (vue.openBlock(), vue.createElementBlock("path", {
                      key: 0,
                      d: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
                    })) : (vue.openBlock(), vue.createElementBlock("path", {
                      key: 1,
                      d: "M16 18l-2.29-2.29-4.88 4.88-4-4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"
                    }))
                  ])),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($data.coreData.orderTrend > 0 ? "+" : "") + vue.toDisplayString($data.coreData.orderTrend) + "% 较昨日",
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "data-card" }, [
              (vue.openBlock(), vue.createElementBlock("svg", {
                class: "data-icon",
                viewBox: "0 0 24 24",
                fill: "currentColor"
              }, [
                vue.createElementVNode("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H12.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.78-1.18 2.75-2.65 3.09z" })
              ])),
              vue.createElementVNode("view", { class: "data-title" }, "营业额"),
              vue.createElementVNode(
                "view",
                { class: "data-value" },
                "¥" + vue.toDisplayString($data.coreData.revenue),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["data-compare", $data.coreData.revenueTrend > 0 ? "compare-up" : "compare-down"])
                },
                [
                  (vue.openBlock(), vue.createElementBlock("svg", {
                    class: "trend-icon",
                    viewBox: "0 0 24 24",
                    fill: "currentColor"
                  }, [
                    $data.coreData.revenueTrend > 0 ? (vue.openBlock(), vue.createElementBlock("path", {
                      key: 0,
                      d: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
                    })) : (vue.openBlock(), vue.createElementBlock("path", {
                      key: 1,
                      d: "M16 18l-2.29-2.29-4.88 4.88-4-4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"
                    }))
                  ])),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($data.coreData.revenueTrend > 0 ? "+" : "") + vue.toDisplayString($data.coreData.revenueTrend) + "% 较昨日",
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "data-card" }, [
              (vue.openBlock(), vue.createElementBlock("svg", {
                class: "data-icon",
                viewBox: "0 0 24 24",
                fill: "currentColor"
              }, [
                vue.createElementVNode("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" })
              ])),
              vue.createElementVNode("view", { class: "data-title" }, "实收金额"),
              vue.createElementVNode(
                "view",
                { class: "data-value" },
                "¥" + vue.toDisplayString($data.coreData.actualRevenue),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["data-compare", $data.coreData.actualRevenueTrend > 0 ? "compare-up" : "compare-down"])
                },
                [
                  (vue.openBlock(), vue.createElementBlock("svg", {
                    class: "trend-icon",
                    viewBox: "0 0 24 24",
                    fill: "currentColor"
                  }, [
                    $data.coreData.actualRevenueTrend > 0 ? (vue.openBlock(), vue.createElementBlock("path", {
                      key: 0,
                      d: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
                    })) : (vue.openBlock(), vue.createElementBlock("path", {
                      key: 1,
                      d: "M16 18l-2.29-2.29-4.88 4.88-4-4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"
                    }))
                  ])),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($data.coreData.actualRevenueTrend > 0 ? "+" : "") + vue.toDisplayString($data.coreData.actualRevenueTrend) + "% 较昨日",
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ]),
            vue.createElementVNode("view", { class: "data-card" }, [
              (vue.openBlock(), vue.createElementBlock("svg", {
                class: "data-icon",
                viewBox: "0 0 24 24",
                fill: "currentColor"
              }, [
                vue.createElementVNode("path", { d: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" })
              ])),
              vue.createElementVNode("view", { class: "data-title" }, "单均价"),
              vue.createElementVNode(
                "view",
                { class: "data-value" },
                "¥" + vue.toDisplayString($data.coreData.avgPrice),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["data-compare", $data.coreData.avgPriceTrend > 0 ? "compare-up" : "compare-down"])
                },
                [
                  (vue.openBlock(), vue.createElementBlock("svg", {
                    class: "trend-icon",
                    viewBox: "0 0 24 24",
                    fill: "currentColor"
                  }, [
                    $data.coreData.avgPriceTrend > 0 ? (vue.openBlock(), vue.createElementBlock("path", {
                      key: 0,
                      d: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
                    })) : (vue.openBlock(), vue.createElementBlock("path", {
                      key: 1,
                      d: "M16 18l-2.29-2.29-4.88 4.88-4-4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"
                    }))
                  ])),
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString($data.coreData.avgPriceTrend > 0 ? "+" : "") + vue.toDisplayString($data.coreData.avgPriceTrend) + "% 较昨日",
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              )
            ])
          ])
        ]),
        vue.createCommentVNode(" 数据趋势图 "),
        vue.createElementVNode("view", { class: "trend-section" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("view", { class: "section-title" }, "经营趋势"),
            vue.createElementVNode("view", {
              class: "section-actions",
              onClick: _cache[5] || (_cache[5] = (...args) => $options.changeTrendPeriod && $options.changeTrendPeriod(...args))
            }, "近7天")
          ]),
          vue.createElementVNode("view", { class: "chart-container" }, [
            vue.createElementVNode("view", { class: "chart-placeholder" }, [
              (vue.openBlock(), vue.createElementBlock("svg", {
                class: "chart-main-icon",
                viewBox: "0 0 24 24",
                fill: "currentColor"
              }, [
                vue.createElementVNode("path", { d: "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" })
              ])),
              vue.createElementVNode("text", null, "营业额与订单量趋势图")
            ])
          ]),
          vue.createElementVNode("view", { class: "chart-legend" }, [
            vue.createElementVNode("view", { class: "legend-item" }, [
              vue.createElementVNode("view", { class: "legend-color color-1" }),
              vue.createElementVNode("text", null, "营业额")
            ]),
            vue.createElementVNode("view", { class: "legend-item" }, [
              vue.createElementVNode("view", { class: "legend-color color-2" }),
              vue.createElementVNode("text", null, "订单量")
            ])
          ])
        ]),
        vue.createCommentVNode(" 商品销量排行 "),
        vue.createElementVNode("view", { class: "sales-ranking" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode(
              "view",
              { class: "section-title" },
              vue.toDisplayString($data.rankingType === "hot" ? "热销商品" : "滞销商品") + "排行",
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", {
              class: "section-actions",
              onClick: _cache[6] || (_cache[6] = (...args) => $options.viewAllRanking && $options.viewAllRanking(...args))
            }, "查看更多")
          ]),
          vue.createElementVNode("view", { class: "ranking-tabs" }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["ranking-tab", { active: $data.rankingType === "hot" }]),
                onClick: _cache[7] || (_cache[7] = ($event) => $options.switchRankingType("hot"))
              },
              " 热销商品 ",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["ranking-tab", { active: $data.rankingType === "slow" }]),
                onClick: _cache[8] || (_cache[8] = ($event) => $options.switchRankingType("slow"))
              },
              " 滞销商品 ",
              2
              /* CLASS */
            )
          ]),
          vue.createElementVNode("view", { class: "product-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.productRanking, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "product-item",
                  key: index
                }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["product-rank", index < 3 ? "rank-" + (index + 1) : ""])
                    },
                    vue.toDisplayString(index + 1),
                    3
                    /* TEXT, CLASS */
                  ),
                  vue.createElementVNode("view", { class: "product-info" }, [
                    vue.createElementVNode(
                      "view",
                      { class: "product-name" },
                      vue.toDisplayString(item.name),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "product-sales" },
                      "销量: " + vue.toDisplayString(item.sales) + "份",
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "view",
                    { class: "product-amount" },
                    "¥" + vue.toDisplayString(item.amount),
                    1
                    /* TEXT */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createCommentVNode(" 评价分析 "),
        vue.createElementVNode("view", { class: "rating-analysis" }, [
          vue.createElementVNode("view", { class: "section-header" }, [
            vue.createElementVNode("view", { class: "section-title" }, "评价分析"),
            vue.createElementVNode("view", { class: "section-actions" }, "近30天")
          ]),
          vue.createElementVNode("view", { class: "rating-overview" }, [
            vue.createElementVNode("view", { class: "rating-score" }, [
              vue.createElementVNode(
                "view",
                { class: "score-value" },
                vue.toDisplayString($data.ratingData.overallScore),
                1
                /* TEXT */
              ),
              vue.createElementVNode("view", { class: "score-label" }, "综合评分")
            ]),
            vue.createElementVNode("view", { class: "rating-detail" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.ratingData.starDistribution, (item, idx) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "rating-bar",
                    key: idx
                  }, [
                    vue.createElementVNode(
                      "view",
                      { class: "bar-label" },
                      vue.toDisplayString(5 - idx) + "星",
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", { class: "bar-container" }, [
                      vue.createElementVNode(
                        "view",
                        {
                          class: "bar-fill",
                          style: vue.normalizeStyle({ width: item.percentage + "%" })
                        },
                        null,
                        4
                        /* STYLE */
                      )
                    ]),
                    vue.createElementVNode(
                      "view",
                      { class: "bar-count" },
                      vue.toDisplayString(item.percentage) + "%",
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode("view", { class: "keywords-section" }, [
            vue.createElementVNode("view", { class: "keywords-title" }, "好评关键词"),
            vue.createElementVNode("view", { class: "keywords-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.ratingData.positiveKeywords, (keyword, index) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      class: "keyword-item",
                      key: index
                    },
                    vue.toDisplayString(keyword),
                    1
                    /* TEXT */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode("view", { class: "keywords-section" }, [
            vue.createElementVNode("view", { class: "keywords-title" }, "差评关键词"),
            vue.createElementVNode("view", { class: "keywords-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.ratingData.negativeKeywords, (keyword, index) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      class: "keyword-item keyword-bad",
                      key: index
                    },
                    vue.toDisplayString(keyword),
                    1
                    /* TEXT */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])
        ]),
        vue.createCommentVNode(" 底部留白区域 "),
        vue.createElementVNode("view", { class: "bottom-space" })
      ]),
      vue.createCommentVNode(" 底部导航 - 固定在底部 "),
      vue.createElementVNode("view", { class: "custom-tab-bar" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentTab === "index" }]),
            onClick: _cache[9] || (_cache[9] = ($event) => $options.switchTab("index"))
          },
          [
            vue.createElementVNode("view", { class: "tab-icon" }, "🏠"),
            vue.createElementVNode("view", { class: "tab-text" }, "首页")
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentTab === "list" }]),
            onClick: _cache[10] || (_cache[10] = ($event) => $options.switchTab("list"))
          },
          [
            vue.createElementVNode("view", { class: "tab-icon" }, "📋"),
            vue.createElementVNode("view", { class: "tab-text" }, "订单")
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentTab === "message" }]),
            onClick: _cache[11] || (_cache[11] = ($event) => $options.switchTab("message"))
          },
          [
            vue.createElementVNode("view", { class: "tab-icon" }, "💬"),
            vue.createElementVNode("view", { class: "tab-text" }, "消息")
          ],
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["tab-item", { active: $data.currentTab === "mine" }]),
            onClick: _cache[12] || (_cache[12] = ($event) => $options.switchTab("mine"))
          },
          [
            vue.createElementVNode("view", { class: "tab-icon" }, "👤"),
            vue.createElementVNode("view", { class: "tab-text" }, "我的")
          ],
          2
          /* CLASS */
        )
      ])
    ]);
  }
  const PagesAnalyticsAnalytics = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-4339729b"], ["__file", "C:/Users/Administrator/Desktop/project1/project1.0/pages/analytics/analytics.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/list/list", PagesListList);
  __definePage("pages/message/message", PagesMessageMessage);
  __definePage("pages/mine/mine", PagesMineMine);
  __definePage("pages/analytics/analytics", PagesAnalyticsAnalytics);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/Administrator/Desktop/project1/project1.0/App.vue"]]);
  var define_process_env_UNI_STATISTICS_CONFIG_default = { enable: true };
  var define_process_env_UNI_STAT_TITLE_JSON_default = { "pages/index/index": "首页", "pages/list/list": "订单", "pages/message/message": "消息", "pages/mine/mine": "我的", "pages/analytics/analytics": "数据分析" };
  const sys = uni.getSystemInfoSync();
  const STAT_VERSION = "4.76";
  const STAT_URL = "https://tongji.dcloud.io/uni/stat";
  const STAT_H5_URL = "https://tongji.dcloud.io/uni/stat.gif";
  const PAGE_PVER_TIME = 1800;
  const APP_PVER_TIME = 300;
  const OPERATING_TIME = 10;
  const DIFF_TIME = 60 * 1e3 * 60 * 24;
  const appid = "__UNI__8D58A9A";
  const dbSet = (name, value) => {
    let data = uni.getStorageSync("$$STAT__DBDATA:" + appid) || {};
    if (!data) {
      data = {};
    }
    data[name] = value;
    uni.setStorageSync("$$STAT__DBDATA:" + appid, data);
  };
  const dbGet = (name) => {
    let data = uni.getStorageSync("$$STAT__DBDATA:" + appid) || {};
    if (!data[name]) {
      let dbdata = uni.getStorageSync("$$STAT__DBDATA:" + appid);
      if (!dbdata) {
        dbdata = {};
      }
      if (!dbdata[name]) {
        return void 0;
      }
      data[name] = dbdata[name];
    }
    return data[name];
  };
  const dbRemove = (name) => {
    let data = uni.getStorageSync("$$STAT__DBDATA:" + appid) || {};
    if (data[name]) {
      delete data[name];
      uni.setStorageSync("$$STAT__DBDATA:" + appid, data);
    } else {
      data = uni.getStorageSync("$$STAT__DBDATA:" + appid);
      if (data[name]) {
        delete data[name];
        uni.setStorageSync("$$STAT__DBDATA:" + appid, data);
      }
    }
  };
  const uniStatisticsConfig = define_process_env_UNI_STATISTICS_CONFIG_default;
  let statConfig = {
    appid: "__UNI__8D58A9A"
  };
  let titleJsons = {};
  titleJsons = define_process_env_UNI_STAT_TITLE_JSON_default;
  const UUID_KEY = "__DC_STAT_UUID";
  const UUID_VALUE = "__DC_UUID_VALUE";
  function getUuid() {
    let uuid = "";
    if (get_platform_name() === "n") {
      try {
        uuid = plus.runtime.getDCloudId();
      } catch (e) {
        uuid = "";
      }
      return uuid;
    }
    try {
      uuid = uni.getStorageSync(UUID_KEY);
    } catch (e) {
      uuid = UUID_VALUE;
    }
    if (!uuid) {
      uuid = Date.now() + "" + Math.floor(Math.random() * 1e7);
      try {
        uni.setStorageSync(UUID_KEY, uuid);
      } catch (e) {
        uni.setStorageSync(UUID_KEY, UUID_VALUE);
      }
    }
    return uuid;
  }
  const get_uuid = (statData2) => {
    return sys.deviceId || getUuid();
  };
  const get_odid = (statData2) => {
    let odid = "";
    if (get_platform_name() === "n") {
      try {
        odid = plus.device.uuid;
      } catch (e) {
        odid = "";
      }
      return odid;
    }
    return sys.deviceId || getUuid();
  };
  const stat_config = statConfig;
  const get_sgin = (statData2) => {
    let arr = Object.keys(statData2);
    let sortArr = arr.sort();
    let sgin = {};
    let sginStr = "";
    for (var i in sortArr) {
      sgin[sortArr[i]] = statData2[sortArr[i]];
      sginStr += sortArr[i] + "=" + statData2[sortArr[i]] + "&";
    }
    return {
      sign: "",
      options: sginStr.substr(0, sginStr.length - 1)
    };
  };
  const get_encodeURIComponent_options = (statData2) => {
    let data = {};
    for (let prop in statData2) {
      data[prop] = encodeURIComponent(statData2[prop]);
    }
    return data;
  };
  const get_platform_name = () => {
    const aliArr = ["y", "a", "p", "mp-ali"];
    const platformList = {
      app: "n",
      "app-plus": "n",
      "app-harmony": "n",
      "mp-harmony": "mhm",
      h5: "h5",
      "mp-weixin": "wx",
      [aliArr.reverse().join("")]: "ali",
      "mp-baidu": "bd",
      "mp-toutiao": "tt",
      "mp-qq": "qq",
      "quickapp-native": "qn",
      "mp-kuaishou": "ks",
      "mp-lark": "lark",
      "quickapp-webview": "qw",
      "mp-xhs": "xhs"
    };
    if (platformList["app"] === "ali") {
      if (my && my.env) {
        const clientName = my.env.clientName;
        if (clientName === "ap")
          return "ali";
        if (clientName === "dingtalk")
          return "dt";
      }
    }
    return platformList["app"] || "app";
  };
  const get_pack_name = () => {
    let packName = "";
    if (get_platform_name() === "wx" || get_platform_name() === "qq") {
      if (uni.canIUse("getAccountInfoSync")) {
        packName = uni.getAccountInfoSync().miniProgram.appId || "";
      }
    }
    if (get_platform_name() === "n")
      ;
    return packName;
  };
  const get_version = () => {
    return get_platform_name() === "n" ? plus.runtime.version : "";
  };
  const get_channel = () => {
    const platformName = get_platform_name();
    let channel = "";
    if (platformName === "n") {
      channel = plus.runtime.channel;
    }
    return channel;
  };
  const get_scene = (options) => {
    const platformName = get_platform_name();
    let scene = "";
    if (options) {
      return options;
    }
    if (platformName === "wx") {
      scene = uni.getLaunchOptionsSync().scene;
    }
    return scene;
  };
  const get_splicing = (data) => {
    let str = "";
    for (var i in data) {
      str += i + "=" + data[i] + "&";
    }
    return str.substr(0, str.length - 1);
  };
  const get_route = (pageVm) => {
    let _self = pageVm || get_page_vm();
    if (get_platform_name() === "bd") {
      let mp_route = _self.$mp && _self.$mp.page && _self.$mp.page.is;
      let scope_route = _self.$scope && _self.$scope.is;
      return mp_route || scope_route || "";
    } else {
      return _self.route || _self.$scope && _self.$scope.route || _self.$mp && _self.$mp.page.route;
    }
  };
  const get_page_route = (pageVm) => {
    let page = pageVm && (pageVm.$page || pageVm.$scope && pageVm.$scope.$page);
    let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
    if (!page)
      return lastPageRoute || "";
    return page.fullPath === "/" ? page.route : page.fullPath || page.route;
  };
  const get_page_vm = () => {
    let pages = getCurrentPages();
    let $page = pages[pages.length - 1];
    if (!$page)
      return null;
    return $page.$vm;
  };
  const get_page_types = (self) => {
    if (self.mpType === "page" || self.$mpType === "page" || self.$mp && self.$mp.mpType === "page" || self.$options.mpType === "page") {
      return "page";
    }
    if (self.mpType === "app" || self.$mpType === "app" || self.$mp && self.$mp.mpType === "app" || self.$options.mpType === "app") {
      return "app";
    }
    return null;
  };
  const handle_data = (statData2) => {
    let firstArr = [];
    let contentArr = [];
    let lastArr = [];
    for (let i in statData2) {
      const rd = statData2[i];
      rd.forEach((elm) => {
        let newData = "";
        {
          newData = get_splicing(elm);
        }
        if (i === 0) {
          firstArr.push(newData);
        } else if (i === 3) {
          lastArr.push(newData);
        } else {
          contentArr.push(newData);
        }
      });
    }
    firstArr.push(...contentArr, ...lastArr);
    return JSON.stringify(firstArr);
  };
  const calibration = (eventName, options) => {
    if (!eventName) {
      console.error(`uni.report Missing [eventName] parameter`);
      return true;
    }
    if (typeof eventName !== "string") {
      console.error(
        `uni.report [eventName] Parameter type error, it can only be of type String`
      );
      return true;
    }
    if (eventName.length > 255) {
      console.error(
        `uni.report [eventName] Parameter length cannot be greater than 255`
      );
      return true;
    }
    if (typeof options !== "string" && typeof options !== "object") {
      console.error(
        "uni.report [options] Parameter type error, Only supports String or Object type"
      );
      return true;
    }
    if (typeof options === "string" && options.length > 255) {
      console.error(
        `uni.report [options] Parameter length cannot be greater than 255`
      );
      return true;
    }
    if (eventName === "title" && typeof options !== "string") {
      console.error(
        `uni.report [eventName] When the parameter is title, the [options] parameter can only be of type String`
      );
      return true;
    }
  };
  const get_page_name = (routepath) => {
    return titleJsons && titleJsons[routepath] || "";
  };
  const Report_Data_Time = "Report_Data_Time";
  const Report_Status = "Report_Status";
  const is_report_data = () => {
    return new Promise((resolve, reject) => {
      let start_time = "";
      let end_time = (/* @__PURE__ */ new Date()).getTime();
      let diff_time = DIFF_TIME;
      let report_status = 1;
      try {
        start_time = uni.getStorageSync(Report_Data_Time);
        report_status = uni.getStorageSync(Report_Status);
      } catch (e) {
        start_time = "";
        report_status = 1;
      }
      if (report_status === "") {
        requestData(({ enable }) => {
          uni.setStorageSync(Report_Data_Time, end_time);
          uni.setStorageSync(Report_Status, enable);
          if (enable === 1) {
            resolve();
          }
        });
        return;
      }
      if (report_status === 1) {
        resolve();
      }
      if (!start_time) {
        uni.setStorageSync(Report_Data_Time, end_time);
        start_time = end_time;
      }
      if (end_time - start_time > diff_time) {
        requestData(({ enable }) => {
          uni.setStorageSync(Report_Data_Time, end_time);
          uni.setStorageSync(Report_Status, enable);
        });
      }
    });
  };
  const requestData = (done) => {
    const appid2 = "__UNI__8D58A9A";
    let formData = {
      usv: STAT_VERSION,
      conf: JSON.stringify({
        ak: appid2
      })
    };
    uni.request({
      url: STAT_URL,
      method: "GET",
      data: formData,
      success: (res) => {
        const { data } = res;
        if (data.ret === 0) {
          typeof done === "function" && done({
            enable: data.enable
          });
        }
      },
      fail: (e) => {
        let report_status_code = 1;
        try {
          report_status_code = uni.getStorageSync(Report_Status);
        } catch (e2) {
          report_status_code = 1;
        }
        if (report_status_code === "") {
          report_status_code = 1;
        }
        typeof done === "function" && done({
          enable: report_status_code
        });
      }
    });
  };
  const get_report_Interval = (defaultTime) => {
    let time = uniStatisticsConfig.reportInterval;
    if (Number(time) === 0)
      return 0;
    time = time || defaultTime;
    let reg = /(^[1-9]\d*$)/;
    if (!reg.test(time))
      return defaultTime;
    return Number(time);
  };
  const is_push_clientid = () => {
    if (uniStatisticsConfig.collectItems) {
      const ClientID = uniStatisticsConfig.collectItems.uniPushClientID;
      return typeof ClientID === "boolean" ? ClientID : false;
    }
    return false;
  };
  const is_page_report = () => {
    if (uniStatisticsConfig.collectItems) {
      const statPageLog = uniStatisticsConfig.collectItems.uniStatPageLog;
      if (statPageLog === void 0)
        return true;
      return typeof statPageLog === "boolean" ? statPageLog : true;
    }
    return true;
  };
  const FIRST_VISIT_TIME_KEY = "__first__visit__time";
  const LAST_VISIT_TIME_KEY = "__last__visit__time";
  const get_time = () => {
    return parseInt((/* @__PURE__ */ new Date()).getTime() / 1e3);
  };
  const get_first_visit_time = () => {
    const timeStorge = dbGet(FIRST_VISIT_TIME_KEY);
    let time = 0;
    if (timeStorge) {
      time = timeStorge;
    } else {
      time = get_time();
      dbSet(FIRST_VISIT_TIME_KEY, time);
      dbRemove(LAST_VISIT_TIME_KEY);
    }
    return time;
  };
  const get_last_visit_time = () => {
    const timeStorge = dbGet(LAST_VISIT_TIME_KEY);
    let time = 0;
    if (timeStorge) {
      time = timeStorge;
    }
    dbSet(LAST_VISIT_TIME_KEY, get_time());
    return time;
  };
  const PAGE_RESIDENCE_TIME = "__page__residence__time";
  let First_Page_Residence_Time = 0;
  let Last_Page_Residence_Time = 0;
  const set_page_residence_time = () => {
    First_Page_Residence_Time = get_time();
    dbSet(PAGE_RESIDENCE_TIME, First_Page_Residence_Time);
    return First_Page_Residence_Time;
  };
  const get_page_residence_time = () => {
    Last_Page_Residence_Time = get_time();
    First_Page_Residence_Time = dbGet(PAGE_RESIDENCE_TIME);
    return Last_Page_Residence_Time - First_Page_Residence_Time;
  };
  const TOTAL_VISIT_COUNT = "__total__visit__count";
  const get_total_visit_count = () => {
    const timeStorge = dbGet(TOTAL_VISIT_COUNT);
    let count = 1;
    if (timeStorge) {
      count = timeStorge;
      count++;
    }
    dbSet(TOTAL_VISIT_COUNT, count);
    return count;
  };
  const FIRST_TIME = "__first_time";
  const set_first_time = () => {
    let time = get_time();
    const timeStorge = dbSet(FIRST_TIME, time);
    return timeStorge;
  };
  const get_residence_time = (type) => {
    let residenceTime = 0;
    const first_time = dbGet(FIRST_TIME);
    const last_time = get_time();
    if (first_time !== 0) {
      residenceTime = last_time - first_time;
    }
    residenceTime = residenceTime < 1 ? 1 : residenceTime;
    if (type === "app") {
      let overtime = residenceTime > APP_PVER_TIME ? true : false;
      return {
        residenceTime,
        overtime
      };
    }
    if (type === "page") {
      let overtime = residenceTime > PAGE_PVER_TIME ? true : false;
      return {
        residenceTime,
        overtime
      };
    }
    return {
      residenceTime
    };
  };
  const eport_Interval = get_report_Interval(OPERATING_TIME);
  let statData = {
    uuid: get_uuid(),
    // 设备标识
    ak: stat_config.appid,
    // uni-app 应用 Appid
    p: "",
    // 手机系统，客户端平台
    ut: get_platform_name(),
    // 平台类型
    mpn: get_pack_name(),
    // 原生平台包名、小程序 appid
    usv: STAT_VERSION,
    // 统计 sdk 版本
    v: get_version(),
    // 应用版本，仅app
    ch: get_channel(),
    // 渠道信息
    cn: "",
    // 国家
    pn: "",
    // 省份
    ct: "",
    // 城市
    t: get_time(),
    // 上报数据时的时间戳
    tt: "",
    brand: sys.brand || "",
    // 手机品牌
    md: sys.model,
    // 手机型号
    sv: "",
    // 手机系统版本
    mpsdk: sys.SDKVersion || "",
    // x程序 sdk version
    mpv: sys.version || "",
    // 小程序平台版本 ，如微信、支付宝
    lang: sys.language,
    // 语言
    pr: sys.pixelRatio,
    // pixelRatio 设备像素比
    ww: sys.windowWidth,
    // windowWidth 可使用窗口宽度
    wh: sys.windowHeight,
    // windowHeight 可使用窗口高度
    sw: sys.screenWidth,
    // screenWidth 屏幕宽度
    sh: sys.screenHeight
    // screenHeight 屏幕高度
  };
  if (sys.platform) {
    switch (sys.platform) {
      case "android":
        statData.p = "a";
        break;
      case "ios":
        statData.p = "i";
        break;
      case "harmonyos":
        statData.p = "h";
        break;
    }
  }
  if (sys.system) {
    statData.sv = sys.system.replace(/(Android|iOS)\s/, "");
  }
  class Report {
    constructor() {
      this.self = "";
      this.__licationShow = false;
      this.__licationHide = false;
      this.statData = statData;
      this._navigationBarTitle = {
        config: "",
        page: "",
        report: "",
        lt: ""
      };
      this._query = {};
      let registerInterceptor = typeof uni.addInterceptor === "function";
      if (registerInterceptor) {
        this.addInterceptorInit();
        this.interceptLogin();
        this.interceptShare(true);
        this.interceptRequestPayment();
      }
    }
    addInterceptorInit() {
      let self = this;
      uni.addInterceptor("setNavigationBarTitle", {
        invoke(args) {
          self._navigationBarTitle.page = args.title;
        }
      });
    }
    interceptLogin() {
      let self = this;
      uni.addInterceptor("login", {
        complete() {
          self._login();
        }
      });
    }
    interceptShare(type) {
      let self = this;
      if (!type) {
        self._share();
        return;
      }
      uni.addInterceptor("share", {
        success() {
          self._share();
        },
        fail() {
          self._share();
        }
      });
    }
    interceptRequestPayment() {
      let self = this;
      uni.addInterceptor("requestPayment", {
        success() {
          self._payment("pay_success");
        },
        fail() {
          self._payment("pay_fail");
        }
      });
    }
    _login() {
      this.sendEventRequest(
        {
          key: "login"
        },
        0
      );
    }
    _share() {
      this.sendEventRequest(
        {
          key: "share"
        },
        0
      );
    }
    _payment(key) {
      this.sendEventRequest(
        {
          key
        },
        0
      );
    }
    /**
     * 进入应用触发
     */
    applicationShow() {
      if (this.__licationHide) {
        const time = get_residence_time("app");
        if (time.overtime) {
          let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
          let options = {
            path: lastPageRoute,
            scene: this.statData.sc,
            cst: 2
          };
          this.sendReportRequest(options);
        } else {
          const scene = get_scene();
          if (scene !== this.statData.sc) {
            let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
            let options = {
              path: lastPageRoute,
              scene,
              cst: 2
            };
            this.sendReportRequest(options);
          }
        }
        this.__licationHide = false;
      }
    }
    /**
     * 离开应用触发
     * @param {Object} self
     * @param {Object} type
     */
    applicationHide(self, type) {
      if (!self) {
        self = get_page_vm();
      }
      this.__licationHide = true;
      const time = get_residence_time();
      const route = get_page_route(self);
      uni.setStorageSync("_STAT_LAST_PAGE_ROUTE", route);
      this.sendHideRequest(
        {
          urlref: route,
          urlref_ts: time.residenceTime
        },
        type
      );
      set_first_time();
    }
    /**
     * 进入页面触发
     */
    pageShow(self) {
      this._navigationBarTitle = {
        config: "",
        page: "",
        report: "",
        lt: ""
      };
      const route = get_page_route(self);
      const routepath = get_route(self);
      this._navigationBarTitle.config = get_page_name(routepath);
      if (this.__licationShow) {
        set_first_time();
        uni.setStorageSync("_STAT_LAST_PAGE_ROUTE", route);
        this.__licationShow = false;
        return;
      }
      const time = get_residence_time("page");
      if (time.overtime) {
        let options = {
          path: route,
          scene: this.statData.sc,
          cst: 3
        };
        this.sendReportRequest(options);
      }
      set_first_time();
    }
    /**
     * 离开页面触发
     */
    pageHide(self) {
      if (!this.__licationHide) {
        const time = get_residence_time("page");
        let route = get_page_route(self);
        let lastPageRoute = uni.getStorageSync("_STAT_LAST_PAGE_ROUTE");
        if (!lastPageRoute) {
          lastPageRoute = route;
        }
        uni.setStorageSync("_STAT_LAST_PAGE_ROUTE", route);
        this.sendPageRequest({
          url: route,
          urlref: lastPageRoute,
          urlref_ts: time.residenceTime
        });
        return;
      }
    }
    /**
     * 发送请求,应用维度上报
     * @param {Object} options 页面信息
     * @param {Boolean} type 是否立即上报
     */
    sendReportRequest(options, type) {
      this._navigationBarTitle.lt = "1";
      this._navigationBarTitle.config = get_page_name(options.path);
      let is_opt = options.query && JSON.stringify(options.query) !== "{}";
      let query = is_opt ? "?" + JSON.stringify(options.query) : "";
      const last_time = get_last_visit_time();
      if (last_time !== 0 || !last_time) {
        const odid = get_odid();
        {
          this.statData.odid = odid;
        }
      }
      Object.assign(this.statData, {
        lt: "1",
        url: options.path + query || "",
        t: get_time(),
        sc: get_scene(options.scene),
        fvts: get_first_visit_time(),
        lvts: last_time,
        tvc: get_total_visit_count(),
        // create session type  上报类型 ，1 应用进入 2.后台30min进入 3.页面30min进入
        cst: options.cst || 1
      });
      if (get_platform_name() === "n") {
        this.getProperty(type);
      } else {
        this.getNetworkInfo(type);
      }
    }
    /**
     * 发送请求,页面维度上报
     * @param {Object} opt
     */
    sendPageRequest(opt) {
      let { url, urlref, urlref_ts } = opt;
      this._navigationBarTitle.lt = "11";
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "11",
        ut: this.statData.ut,
        url,
        tt: this.statData.tt,
        urlref,
        urlref_ts,
        ch: this.statData.ch,
        usv: this.statData.usv,
        t: get_time()
      };
      this.request(options);
    }
    /**
     * 进入后台上报数据
     * @param {Object} opt
     * @param {Object} type
     */
    sendHideRequest(opt, type) {
      let { urlref, urlref_ts } = opt;
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "3",
        ut: this.statData.ut,
        urlref,
        urlref_ts,
        ch: this.statData.ch,
        usv: this.statData.usv,
        t: get_time()
      };
      this.request(options, type);
    }
    /**
     * 自定义事件上报
     */
    sendEventRequest({ key = "", value = "" } = {}) {
      let routepath = "";
      try {
        routepath = get_route();
      } catch (error) {
        const launch_options = dbGet("__launch_options");
        routepath = launch_options.path;
      }
      this._navigationBarTitle.config = get_page_name(routepath);
      this._navigationBarTitle.lt = "21";
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "21",
        ut: this.statData.ut,
        url: routepath,
        ch: this.statData.ch,
        e_n: key,
        e_v: typeof value === "object" ? JSON.stringify(value) : value.toString(),
        usv: this.statData.usv,
        t: get_time()
      };
      this.request(options);
    }
    sendPushRequest(options, cid) {
      let time = get_time();
      const statData2 = {
        lt: "101",
        cid,
        t: time,
        ut: this.statData.ut
      };
      const stat_data = handle_data({
        101: [statData2]
      });
      let optionsData = {
        usv: STAT_VERSION,
        //统计 SDK 版本号
        t: time,
        //发送请求时的时间戮
        requests: stat_data
      };
      {
        if (statData2.ut === "h5") {
          this.imageRequest(optionsData);
          return;
        }
      }
      if (get_platform_name() === "n" && this.statData.p === "a") {
        setTimeout(() => {
          this.sendRequest(optionsData);
        }, 200);
        return;
      }
      this.sendRequest(optionsData);
    }
    /**
     * 获取wgt资源版本
     */
    getProperty(type) {
      plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
        this.statData.v = wgtinfo.version || "";
        this.getNetworkInfo(type);
      });
    }
    /**
     * 获取网络信息
     */
    getNetworkInfo(type) {
      uni.getNetworkType({
        success: (result) => {
          this.statData.net = result.networkType;
          this.getLocation(type);
        }
      });
    }
    /**
     * 获取位置信息
     */
    getLocation(type) {
      if (stat_config.getLocation) {
        uni.getLocation({
          type: "wgs84",
          geocode: true,
          success: (result) => {
            if (result.address) {
              this.statData.cn = result.address.country;
              this.statData.pn = result.address.province;
              this.statData.ct = result.address.city;
            }
            this.statData.lat = result.latitude;
            this.statData.lng = result.longitude;
            this.request(this.statData, type);
          }
        });
      } else {
        this.statData.lat = 0;
        this.statData.lng = 0;
        this.request(this.statData, type);
      }
    }
    /**
     * 发送请求
     * @param {Object} data 上报数据
     * @param {Object} type 类型
     */
    request(data, type) {
      let time = get_time();
      const title = this._navigationBarTitle;
      Object.assign(data, {
        ttn: title.page,
        ttpj: title.config,
        ttc: title.report
      });
      let uniStatData = dbGet("__UNI__STAT__DATA") || {};
      if (!uniStatData[data.lt]) {
        uniStatData[data.lt] = [];
      }
      uniStatData[data.lt].push(data);
      dbSet("__UNI__STAT__DATA", uniStatData);
      let page_residence_time = get_page_residence_time();
      if (page_residence_time < eport_Interval && !type)
        return;
      set_page_residence_time();
      const stat_data = handle_data(uniStatData);
      let optionsData = {
        usv: STAT_VERSION,
        //统计 SDK 版本号
        t: time,
        //发送请求时的时间戮
        requests: stat_data
      };
      dbRemove("__UNI__STAT__DATA");
      {
        if (data.ut === "h5") {
          this.imageRequest(optionsData);
          return;
        }
      }
      if (get_platform_name() === "n" && this.statData.p === "a") {
        setTimeout(() => {
          this.sendRequest(optionsData);
        }, 200);
        return;
      }
      this.sendRequest(optionsData);
    }
    getIsReportData() {
      return is_report_data();
    }
    /**
     * 数据上报
     * @param {Object} optionsData 需要上报的数据
     */
    sendRequest(optionsData) {
      {
        this.getIsReportData().then(() => {
          uni.request({
            url: STAT_URL,
            method: "POST",
            data: optionsData,
            success: () => {
            },
            fail: (e) => {
              if (++this._retry < 3) {
                setTimeout(() => {
                  this.sendRequest(optionsData);
                }, 1e3);
              }
            }
          });
        });
      }
    }
    /**
     * h5 请求
     */
    imageRequest(data) {
      this.getIsReportData().then(() => {
        let image = new Image();
        let options = get_sgin(get_encodeURIComponent_options(data)).options;
        image.src = STAT_H5_URL + "?" + options;
      });
    }
    sendEvent(key, value) {
      if (calibration(key, value))
        return;
      if (key === "title") {
        this._navigationBarTitle.report = value;
        return;
      }
      this.sendEventRequest(
        {
          key,
          value: typeof value === "object" ? JSON.stringify(value) : value
        },
        1
      );
    }
  }
  class Stat extends Report {
    static getInstance() {
      if (!uni.__stat_instance) {
        uni.__stat_instance = new Stat();
      }
      return uni.__stat_instance;
    }
    constructor() {
      super();
    }
    /**
     * 获取推送id
     */
    pushEvent(options) {
      const ClientID = is_push_clientid();
      if (uni.getPushClientId && ClientID) {
        uni.getPushClientId({
          success: (res) => {
            const cid = res.cid || false;
            if (cid) {
              this.sendPushRequest(options, cid);
            }
          }
        });
      }
    }
    /**
     * 进入应用
     * @param {Object} options 页面参数
     * @param {Object} self	当前页面实例
     */
    launch(options, self) {
      set_page_residence_time();
      this.__licationShow = true;
      dbSet("__launch_options", options);
      options.cst = 1;
      this.sendReportRequest(options, true);
    }
    load(options, self) {
      this.self = self;
      this._query = options;
    }
    appHide(self) {
      this.applicationHide(self, true);
    }
    appShow(self) {
      this.applicationShow(self);
    }
    show(self) {
      this.self = self;
      if (get_page_types(self) === "page") {
        const isPageReport = is_page_report();
        if (isPageReport) {
          this.pageShow(self);
        }
      }
      if (get_platform_name() === "h5" || get_platform_name() === "n") {
        if (get_page_types(self) === "app") {
          this.appShow();
        }
      }
    }
    hide(self) {
      this.self = self;
      if (get_page_types(self) === "page") {
        const isPageReport = is_page_report();
        if (isPageReport) {
          this.pageHide(self);
        }
      }
      if (get_platform_name() === "h5" || get_platform_name() === "n") {
        if (get_page_types(self) === "app") {
          this.appHide();
        }
      }
    }
    error(em) {
      let emVal = "";
      if (!em.message) {
        emVal = JSON.stringify(em);
      } else {
        emVal = em.stack;
      }
      let route = "";
      try {
        route = get_route();
      } catch (e) {
        route = "";
      }
      let options = {
        ak: this.statData.ak,
        uuid: this.statData.uuid,
        p: this.statData.p,
        lt: "31",
        url: route,
        ut: this.statData.ut,
        ch: this.statData.ch,
        mpsdk: this.statData.mpsdk,
        mpv: this.statData.mpv,
        v: this.statData.v,
        em: emVal,
        usv: this.statData.usv,
        t: parseInt((/* @__PURE__ */ new Date()).getTime() / 1e3)
      };
      this.request(options);
    }
  }
  Stat.getInstance();
  function main() {
    {
      {
        uni.report = function(type, options) {
        };
      }
    }
  }
  main();
  function createApp() {
    const app = vue.createVueApp(App);
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
