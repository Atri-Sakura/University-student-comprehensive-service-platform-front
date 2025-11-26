# 骑手资质认证前后端对接文档

## 概述
本文档描述了骑手资质认证功能的前后端对接实现，包括API接口、前端页面集成和注意事项。

## 后端API接口

### 接口信息
- **路径**: `/rider/qualificationCertification/upload`
- **方法**: `POST`
- **类型**: `multipart/form-data`

### 原始后端接口参数
```java
@PostMapping("/upload")
public AjaxResult addIdCardFront(
    @RequestParam("frontFile") MultipartFile frontFile,
    @RequestParam("backFile") MultipartFile backFile,
    @RequestParam("idCardNumber") Long idCardNumber
)
```

## 前端实现

### 技术限制说明
由于uni-app的`uni.uploadFile`只支持单文件上传，而后端接口需要同时接收两个文件，前端采用了以下解决方案：

1. 正面文件通过`uni.uploadFile`正常上传
2. 反面文件转换为base64字符串，通过`formData`传递

### 前端发送的参数
```javascript
{
  frontFile: File,                    // 身份证正面文件
  idCardNumber: String,              // 身份证号码
  backFileBase64: String,            // 反面文件的base64数据
  backFileName: String               // 反面文件名
}
```

## 建议的后端修改

为了更好地支持前端的实现，建议后端控制器做如下修改：

```java
@PostMapping("/upload")
public AjaxResult addIdCardFront(
    @RequestParam("frontFile") MultipartFile frontFile,
    @RequestParam(value = "backFile", required = false) MultipartFile backFile,
    @RequestParam("idCardNumber") Long idCardNumber,
    @RequestParam(value = "backFileBase64", required = false) String backFileBase64,
    @RequestParam(value = "backFileName", required = false) String backFileName
) {
    Long riderBaseId = SecurityUtils.getRiderBaseId();
    if (riderBaseId == null) {
        return AjaxResult.error("请先登录");
    }
    
    // 处理反面文件
    MultipartFile actualBackFile = backFile;
    if (backFile == null && backFileBase64 != null) {
        // 将base64转换为MultipartFile
        actualBackFile = convertBase64ToMultipartFile(backFileBase64, backFileName);
    }
    
    int rows = riderQualificationCertificationService.upload(frontFile, actualBackFile, riderBaseId, idCardNumber);
    return rows > 0 ? AjaxResult.success("上传成功") : AjaxResult.error("上传失败");
}

private MultipartFile convertBase64ToMultipartFile(String base64Data, String fileName) {
    try {
        byte[] bytes = Base64.getDecoder().decode(base64Data);
        return new MockMultipartFile(
            "backFile",
            fileName,
            "image/jpeg",
            bytes
        );
    } catch (Exception e) {
        throw new RuntimeException("Base64转换失败", e);
    }
}
```

## 前端页面集成

### 页面路径
`/pages/certification/certification.vue`

### 主要功能
1. **身份证号码输入**: 18位身份证号码验证
2. **图片上传**: 支持相机拍照和相册选择
3. **图片预览**: 点击已上传图片可预览
4. **表单验证**: 确保所有必填项完整
5. **API集成**: 调用后端上传接口

### 使用的API函数
```javascript
import { uploadQualificationCertification } from '@/utils/api/index.js';

// 调用示例
const result = await uploadQualificationCertification(
    frontFilePath,    // 正面文件路径
    backFilePath,     // 反面文件路径
    idCardNumber      // 身份证号码
);
```

## 文件结构

```
rider/
├── pages/certification/
│   └── certification.vue          # 资质认证页面
├── utils/api/
│   ├── rider.js                   # 骑手相关API
│   └── index.js                   # API统一导出
└── docs/
    └── qualification-certification-integration.md  # 本文档
```

## 测试建议

1. **正常流程测试**
   - 输入有效的18位身份证号码
   - 上传清晰的身份证正反面照片
   - 验证提交成功

2. **异常情况测试**
   - 身份证号码格式错误
   - 图片文件过大
   - 网络异常情况
   - 未登录状态

3. **边界条件测试**
   - 最大文件大小限制
   - 特殊字符身份证号码
   - 图片格式兼容性

## 注意事项

1. **文件大小**: 建议限制单个图片文件大小不超过5MB
2. **图片格式**: 支持jpg、jpeg、png格式
3. **身份证号码**: 严格验证18位格式
4. **安全性**: 确保上传的图片进行安全检查
5. **用户体验**: 提供清晰的错误提示和加载状态

## 后续优化建议

1. **图片压缩**: 在上传前对图片进行压缩处理
2. **断点续传**: 支持大文件的断点续传
3. **OCR识别**: 自动识别身份证信息进行验证
4. **缓存机制**: 本地缓存已上传的图片，避免重复上传
