# 🚀 如何运行 Scratch 2.0 界面

## ⚠️ 当前状态
项目尚未编译，需要先编译生成 SWF 文件才能运行。

## 🛠️ 方法一：编译并运行（推荐）

### 步骤 1：安装 Adobe Flex SDK
1. 下载 Flex SDK 4.6.0
   - 下载地址：https://flex.apache.org/download-archive.html
   - 选择 `Apache Flex SDK 4.6.0`

2. 解压到本地（如 `C:\flex_sdk_4.6`）

3. 设置环境变量：
```powershell
# 在 PowerShell 中临时设置
$env:FLEX_HOME = "C:\flex_sdk_4.6"
$env:PATH = "$env:FLEX_HOME\bin;$env:PATH"

# 或永久设置（需要管理员权限）
[Environment]::SetEnvironmentVariable("FLEX_HOME", "C:\flex_sdk_4.6", "User")
```

### 步骤 2：编译项目
```powershell
# 在项目根目录运行
mxmlc -load-config+=build.xml src/Scratch.as -output bin-debug/scratch2.swf
```

### 步骤 3：运行编译后的文件
编译成功后，可以通过以下方式运行：

#### 选项 A：使用浏览器（需要支持 Flash）
1. 创建 HTML 文件来加载 SWF
2. 使用支持 Flash 的浏览器打开

#### 选项 B：使用独立 Flash Player
1. 下载 Flash Player Projector（独立播放器）
2. 直接打开 `bin-debug/scratch2.swf`

---

## 💡 方法二：使用独立 Flash Player（最简单）

### 1. 下载 Flash Player Projector
Flash Player 独立播放器（不需要浏览器）：
- **下载地址**: https://www.adobe.com/support/flashplayer/debug_downloads.html
- 选择 "Download the Flash Player projector"
- Windows 版本：`flashplayer_32_sa.exe`

### 2. 运行方式
```powershell
# 如果已有编译好的 SWF 文件
flashplayer_32_sa.exe bin-debug/scratch2.swf

# 或双击 flashplayer_32_sa.exe，然后选择 文件 > 打开，选择 SWF 文件
```

---

## 🌐 方法三：使用支持 Flash 的浏览器

### 支持的浏览器：
1. **Firefox ESR**（推荐）
   - 下载旧版 Firefox ESR
   - 安装 Flash Player NPAPI 插件

2. **Internet Explorer 11**
   - Windows 自带
   - 需要启用 Flash Player

3. **旧版 Chrome**（不推荐）
   - Chrome 87 及以下版本
   - 需要手动启用 Flash

### 创建测试 HTML 文件
创建 `test.html`：
```html
<!DOCTYPE html>
<html>
<head>
    <title>Scratch 2.0</title>
</head>
<body>
    <embed src="bin-debug/scratch2.swf" 
           width="800" 
           height="600" 
           type="application/x-shockwave-flash">
</body>
</html>
```

---

## 🐧 方法四：使用 Ruffle（Flash 模拟器）

Ruffle 是一个用 Rust 编写的 Flash Player 模拟器：

### 安装 Ruffle
```powershell
# 下载 Ruffle
Invoke-WebRequest -Uri "https://github.com/ruffle-rs/ruffle/releases/latest/download/ruffle-nightly-windows-x86_64.zip" -OutFile "ruffle.zip"

# 解压
Expand-Archive -Path "ruffle.zip" -DestinationPath "ruffle"

# 运行
.\ruffle\ruffle.exe bin-debug\scratch2.swf
```

⚠️ **注意**：Ruffle 可能不完全支持所有 Flash 功能，特别是 ActionScript 3 的高级特性。

---

## 📝 快速测试脚本

创建 `run.ps1`：
```powershell
# 检查是否有编译好的文件
if (Test-Path "bin-debug/scratch2.swf") {
    Write-Host "找到编译文件，正在启动..." -ForegroundColor Green
    
    # 尝试使用 Flash Player Projector
    if (Test-Path "flashplayer_32_sa.exe") {
        Start-Process "flashplayer_32_sa.exe" -ArgumentList "bin-debug/scratch2.swf"
    } else {
        Write-Host "请下载 Flash Player Projector" -ForegroundColor Yellow
        Start-Process "https://www.adobe.com/support/flashplayer/debug_downloads.html"
    }
} else {
    Write-Host "未找到编译文件，请先编译项目" -ForegroundColor Red
    Write-Host "运行: mxmlc src/Scratch.as -output bin-debug/scratch2.swf"
}
```

---

## ⚡ 推荐方案

### 对于开发测试：
1. **下载 Flash Player Projector**（最简单）
2. 编译项目生成 SWF
3. 直接用 Projector 打开 SWF 文件

### 对于生产部署：
1. 考虑迁移到 Scratch 3.0（基于 HTML5）
2. 或使用 Ruffle 等 Flash 模拟器
3. 或打包成 AIR 桌面应用

---

## 🆘 常见问题

### Q: 编译失败怎么办？
A: 检查 Flex SDK 是否正确安装，FLEX_HOME 环境变量是否设置

### Q: Flash Player 安全警告？
A: 添加项目目录到 Flash Player 信任目录

### Q: 浏览器不支持 Flash？
A: 使用独立的 Flash Player Projector 或考虑升级到 Scratch 3.0

---

需要更多帮助？查看 `DEVELOPMENT_GUIDE.md`
