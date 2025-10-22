# 商品管理前后端接口文档

## 一、配置后端地址

### 1. 修改配置文件
打开 `utils/request.js` 文件，修改 `BASE_URL` 为你的后端地址：

```javascript
const BASE_URL = 'http://localhost:8080'; // 修改为你的实际后端地址
// 例如：'http://192.168.1.100:8080' 或 'https://api.yourdomain.com'
```

### 2. 跨域配置
如果是开发环境，可以在 `manifest.json` 中配置代理：

```json
{
  "h5": {
    "devServer": {
      "proxy": {
        "/api": {
          "target": "http://localhost:8080",
          "changeOrigin": true,
          "secure": false
        }
      }
    }
  }
}
```

## 二、后端需要提供的API接口（RuoYi框架标准）

### 1. 获取商品列表
**接口地址：** `GET /api/product/list`

**请求参数：**
```json
{
  "pageNum": 1,      // 页码
  "pageSize": 10,    // 每页数量
  "name": "",        // 商品名称（可选）
  "status": ""       // 商品状态（可选）
}
```

**返回格式：**
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "total": 100,
    "rows": [
      {
        "id": 1,
        "name": "招牌汉堡",
        "description": "精选牛肉饼，搭配新鲜蔬菜",
        "price": "32.00",
        "stock": 42,
        "sales": 128,
        "status": "销售中",
        "imageUrl": "http://localhost:8080/upload/product/xxx.jpg",
        "createTime": "2024-01-01 10:00:00"
      }
    ]
  }
}
```

### 2. 获取商品详情
**接口地址：** `GET /api/product/{id}`

**返回格式：**
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "id": 1,
    "name": "招牌汉堡",
    "description": "精选牛肉饼",
    "price": "32.00",
    "stock": 42,
    "sales": 128,
    "status": "销售中",
    "imageUrl": "http://localhost:8080/upload/product/xxx.jpg"
  }
}
```

### 3. 添加商品
**接口地址：** `POST /api/product`

**请求体：**
```json
{
  "name": "新商品",
  "description": "商品描述",
  "price": "99.00",
  "stock": 100,
  "status": "销售中",
  "imageUrl": "http://localhost:8080/upload/product/xxx.jpg"
}
```

**返回格式：**
```json
{
  "code": 200,
  "msg": "添加成功",
  "data": {
    "id": 10
  }
}
```

### 4. 更新商品
**接口地址：** `PUT /api/product`

**请求体：**
```json
{
  "id": 1,
  "name": "更新后的商品名",
  "description": "更新后的描述",
  "price": "99.00",
  "stock": 100,
  "status": "销售中",
  "imageUrl": "http://localhost:8080/upload/product/xxx.jpg"
}
```

**返回格式：**
```json
{
  "code": 200,
  "msg": "更新成功"
}
```

### 5. 删除商品
**接口地址：** `DELETE /api/product/{id}`

**返回格式：**
```json
{
  "code": 200,
  "msg": "删除成功"
}
```

### 6. 文件上传
**接口地址：** `POST /common/upload`

**请求类型：** `multipart/form-data`

**返回格式：**
```json
{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "fileName": "xxx.jpg",
    "url": "http://localhost:8080/upload/2024/01/01/xxx.jpg"
  }
}
```

## 三、RuoYi框架后端实现示例

### 1. Controller层（ProductController.java）

```java
package com.ruoyi.web.controller.api;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.system.domain.Product;
import com.ruoyi.system.service.IProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 商品管理Controller
 */
@RestController
@RequestMapping("/api/product")
public class ProductController extends BaseController {
    
    @Autowired
    private IProductService productService;

    /**
     * 查询商品列表
     */
    @GetMapping("/list")
    public TableDataInfo list(Product product) {
        startPage();
        List<Product> list = productService.selectProductList(product);
        return getDataTable(list);
    }

    /**
     * 获取商品详细信息
     */
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable("id") Long id) {
        return success(productService.selectProductById(id));
    }

    /**
     * 新增商品
     */
    @PostMapping
    public AjaxResult add(@RequestBody Product product) {
        return toAjax(productService.insertProduct(product));
    }

    /**
     * 修改商品
     */
    @PutMapping
    public AjaxResult edit(@RequestBody Product product) {
        return toAjax(productService.updateProduct(product));
    }

    /**
     * 删除商品
     */
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        return toAjax(productService.deleteProductById(id));
    }
}
```

### 2. 实体类（Product.java）

```java
package com.ruoyi.system.domain;

import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 商品对象 product
 */
public class Product extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 商品ID */
    private Long id;

    /** 商品名称 */
    private String name;

    /** 商品描述 */
    private String description;

    /** 商品价格 */
    private String price;

    /** 库存数量 */
    private Integer stock;

    /** 销售数量 */
    private Integer sales;

    /** 商品状态 */
    private String status;

    /** 商品图片URL */
    private String imageUrl;

    // Getter和Setter方法...
}
```

### 3. 数据库表结构（MySQL）

```sql
CREATE TABLE `product` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `description` varchar(500) DEFAULT NULL COMMENT '商品描述',
  `price` decimal(10,2) NOT NULL COMMENT '商品价格',
  `stock` int(11) DEFAULT '0' COMMENT '库存数量',
  `sales` int(11) DEFAULT '0' COMMENT '销售数量',
  `status` varchar(20) DEFAULT '销售中' COMMENT '商品状态',
  `image_url` varchar(500) DEFAULT NULL COMMENT '商品图片URL',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品信息表';
```

## 四、测试步骤

### 1. 启动后端服务
确保RuoYi后端项目已启动，访问 `http://localhost:8080`

### 2. 测试接口
使用Postman或其他工具测试API接口是否正常

### 3. 配置前端
修改 `utils/request.js` 中的 `BASE_URL`

### 4. 运行前端项目
```bash
npm run dev:mp-weixin  # 微信小程序
npm run dev:h5         # H5
```

### 5. 测试功能
- 测试商品列表加载
- 测试添加商品
- 测试编辑商品
- 测试删除商品
- 测试图片上传
- 测试筛选功能

## 五、常见问题

### 1. 跨域问题
**解决方案：** 在RuoYi后端添加CORS配置

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### 2. Token认证问题
确保每次请求都携带token，token存储在本地存储中：
```javascript
uni.setStorageSync('token', 'your_token_here');
```

### 3. 图片显示问题
- 确保图片URL是完整的HTTP地址
- 检查图片服务器是否允许跨域访问
- 配置静态资源访问路径

## 六、调试技巧

### 1. 查看网络请求
在浏览器开发者工具的Network标签中查看请求和响应

### 2. 查看控制台日志
所有错误都会在console中输出

### 3. 使用模拟数据
如果后端未开发完成，前端会自动使用本地模拟数据

## 七、联系方式

如有问题，请查看：
- RuoYi官方文档：http://doc.ruoyi.vip/
- uni-app官方文档：https://uniapp.dcloud.net.cn/

