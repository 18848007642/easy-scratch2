# 📸 如何添加丝路智星Logo到项目

## 步骤 1：保存Logo图片

将您的Logo图片保存到以下位置：
```
assets/images/logo.png
```

## 步骤 2：支持的格式

- **推荐格式**: PNG（支持透明背景）
- **推荐尺寸**: 400x160px 或更高
- **文件大小**: 建议小于 500KB

## 步骤 3：添加Logo到不同位置

### 1. 在网页中使用Logo

编辑 `silkroadstar.html`，找到第245行，取消注释并启用Logo：

```html
<!-- 将这行 -->
<!-- <img src="assets/images/logo.png" alt="丝路智星" class="logo-img"> -->

<!-- 改为 -->
<img src="assets/images/logo.png" alt="丝路智星" class="logo-img">
```

### 2. 在README中显示Logo

编辑 `README.md`，在顶部添加：

```markdown
<div align="center">
  <img src="assets/images/logo.png" alt="丝路智星" width="300"/>
</div>
```

### 3. 在Flash应用中使用Logo

需要将Logo嵌入到ActionScript代码中：

1. 将Logo转换为SWC库文件
2. 在 `src/assets/Resources.as` 中导入
3. 在界面中调用显示

## 步骤 4：创建不同版本

建议创建以下版本：

```
assets/images/
├── logo.png          # 主Logo（透明背景）
├── logo-white.png    # 白色背景版本
├── logo-dark.png     # 深色模式版本
├── logo-icon.png     # 仅图标（用于favicon）
└── logo-banner.png   # 横幅版本（用于GitHub）
```

## 步骤 5：提交到GitHub

```bash
# 添加Logo文件
git add assets/images/

# 提交更改
git commit -m "🎨 添加丝路智星Logo"

# 推送到GitHub
git push origin master
```

## 🎨 Logo设计规范

### 颜色值
- **主蓝色**: #3B82F6
- **橙色飘带**: #FB923C
- **金色高光**: #FCD34D

### 字体
- 中文：思源黑体 Bold
- 英文：Helvetica Neue Medium

### 使用注意
- ✅ 保持Logo比例
- ✅ 在浅色背景上使用原版
- ✅ 在深色背景上使用白色版本
- ❌ 不要拉伸变形
- ❌ 不要改变颜色
- ❌ 不要添加额外效果

---

需要帮助？查看 `assets/images/logo_info.md` 获取更多信息。
