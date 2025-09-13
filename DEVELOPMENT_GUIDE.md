# Scratch 2.0 二次开发指南

## 📚 项目概述

这是 **easy-scratch2** 项目 - 一个封装好的 Scratch 2.0 编辑器，让您可以通过简单的 JavaScript 轻松集成和扩展 Scratch 功能。

### 技术栈
- **ActionScript 3** - 核心编程语言
- **Adobe Flex SDK 4.6** - UI 框架
- **Flash Player 11.6+** - 运行环境
- **JavaScript** - 前端集成

## 🚀 快速开始

### 1. 环境准备

#### 必需工具
- **Adobe Flex SDK 4.6.0**
  - 下载地址：https://www.adobe.com/devnet/flex/flex-sdk-download.html
  - 配置 FLEX_HOME 环境变量

- **Java JDK** (用于 Flex 编译器)
- **Flash Player Debugger** (用于调试)
  - 下载地址：https://www.adobe.com/support/flashplayer/debug_downloads.html

### 2. 编译项目

```bash
# 使用 Ant 构建
ant compile-11.6

# 或使用 Gradle
gradle build
```

编译后的文件将生成在 `bin-debug` 目录：
- `scratch2.swf` - Scratch 主程序
- `scratch2.html` - 示例页面

## 🏗️ 项目结构详解

```
src/
├── Scratch.as           # 🎯 主程序入口 - 应用程序初始化和管理
├── Specs.as            # 📦 积木定义 - 所有积木块的配置
├── scratch2.mxml       # 🎨 UI 布局文件
├── CSS.as              # 🎨 全局样式定义
│
├── blocks/             # 积木系统
│   ├── Block.as        # 积木基类
│   ├── BlockArg.as     # 积木参数
│   └── BlockMenus.as   # 积木菜单
│
├── interpreter/        # 解释器
│   ├── Interpreter.as  # 积木解释执行器
│   └── Primitives.as   # 原语实现
│
├── scratch/           # 核心功能
│   ├── ScratchStage.as # 舞台实现
│   ├── ScratchSprite.as # 角色实现
│   └── ScratchRuntime.as # 运行时管理
│
├── extensions/        # 扩展系统
│   ├── ExtensionManager.as # 扩展管理器
│   └── ExtensionDevManager.as # 开发模式管理
│
└── ui/               # UI 组件
    ├── parts/        # UI 部件
    └── media/        # 媒体处理
```

## 💡 核心功能解析

### 1. 主程序初始化流程 (Scratch.as)

```actionscript
// 版本号定义
public static const versionString:String = 'v461.2';

// 初始化流程
protected function initialize():void {
    checkFlashVersion();      // 检查 Flash 版本
    initServer();             // 初始化服务器连接
    initInterpreter();        // 初始化解释器
    initRuntime();           // 初始化运行时
    initExtensionManager();  // 初始化扩展管理器
}
```

### 2. 积木系统 (Specs.as)

#### 积木分类
```actionscript
public static const categories:Array = [
    [1,  "Motion",     0x4a6cd4],  // 运动
    [2,  "Looks",      0x8a55d7],  // 外观
    [3,  "Sound",      0xbb42c3],  // 声音
    [4,  "Pen",        0x0e9a6c],  // 画笔
    [5,  "Events",     0xc88330],  // 事件
    [6,  "Control",    0xe1a91a],  // 控制
    [7,  "Sensing",    0x2ca5e2],  // 侦测
    [8,  "Operators",  0x5cb712],  // 运算
    [9,  "Data",       0xEE7D16],  // 数据
    [10, "More Blocks",0x632D99],  // 更多积木
];
```

#### 添加自定义积木示例
```actionscript
// 在 Specs.as 的 commands 数组中添加
["我的积木 %n", " ", 1, "myCustomBlock:", 10],
// 格式：[积木文本, 类型, 分类ID, 操作码, 默认参数...]
```

### 3. JavaScript 交互

#### AS3 -> JavaScript
```actionscript
// Scratch.as 中的方法
public function externalCall(functionName:String, callback:Function = null, ...args):void {
    var retVal:* = ExternalInterface.call.apply(ExternalInterface, args);
    if (callback != null) callback(retVal);
}

// 使用示例
externalCall("getProjectData", null, projectName(), zipData);
```

#### JavaScript -> AS3
```actionscript
// 注册可供 JS 调用的方法
addExternalCallback("loadProjectByUrl", loadProjectByUrl);
addExternalCallback("getProjectData", getProjectData);
```

## 🔧 二次开发示例

### 1. 添加自定义积木

**步骤 1：在 Specs.as 中定义积木**
```actionscript
// 在 commands 数组中添加
["发送HTTP请求 %s", " ", 20, "httpRequest:", "http://example.com"],
```

**步骤 2：在 Primitives.as 中实现功能**
```actionscript
private function primHttpRequest(url:String):void {
    var loader:URLLoader = new URLLoader();
    loader.load(new URLRequest(url));
}
```

### 2. 与前端页面交互

**HTML 页面 (scratch.js)**
```javascript
// 初始化配置
var flashvars = {
    extensionDevMode: 'true',
    autostart: 'false',
    urlOverrides: {
        internalAPI: "internalapi/",
        upload: "project/"
    }
};

// 加载项目
window.scratch.loadProjectByUrl('projects/demo.sb2', 'Demo Project');

// 获取项目数据
window.scratch.getProjectData();

// 监听回调
window.scratchCallback = {
    projectDataReady: function(data) {
        console.log('项目数据:', data);
    }
};
```

### 3. 自定义 UI 主题

**修改 CSS.as**
```actionscript
public static function backgroundColor():uint { 
    return 0x383838;  // 修改背景色
}

public static function topBarColor():uint { 
    return 0x9C9EA2;  // 修改顶栏颜色
}
```

## 📡 API 参考

### JavaScript API

| 方法 | 描述 | 参数 |
|------|------|------|
| `loadProjectByUrl(url, name)` | 通过URL加载项目 | url: 项目地址, name: 项目名称 |
| `loadProjectById(url, uuid)` | 通过UUID加载项目 | url: 地址, uuid: 项目ID |
| `getProjectData()` | 获取项目数据 | 返回 Base64 编码 |
| `uploadProject()` | 上传项目 | - |
| `setEditMode(mode)` | 设置编辑模式 | mode: true/false |

### ActionScript 扩展点

| 类 | 用途 | 主要方法 |
|-----|------|----------|
| `Block` | 积木基类 | `setSpec()`, `evaluate()` |
| `Interpreter` | 解释器 | `doYield()`, `primWait()` |
| `ExtensionManager` | 扩展管理 | `loadRawExtension()` |

## 🐛 调试技巧

### 1. 使用 Flash Debugger

1. 安装 Flash Player Debugger
2. 在 Firefox 中安装 Flash Debugger 扩展
3. 打开 F12 开发者工具查看日志

### 2. AS3 日志输出

```actionscript
// 在 Scratch.as 中
import logging.Log;
public var logger:Log = new Log(16);

// 输出日志
logger.log(LogLevel.INFO, "调试信息");
```

### 3. JavaScript 控制台

AS3 错误会自动输出到浏览器控制台：
```javascript
console.log("Scratch 已加载");
```

## 📦 打包发布

### Web 版本
1. 编译生成 SWF 文件
2. 配置 HTML 页面和 JS 文件
3. 部署到支持 Flash 的服务器

### 桌面版本 (AIR)
```bash
# 创建 AIR 应用描述文件
adt -package -storetype pkcs12 -keystore cert.p12 scratch.air application.xml scratch.swf
```

## 🔗 资源链接

- [官方文档](https://www.213.name/archives/1033) - 开发环境搭建
- [打包 AIR 应用](https://www.213.name/archives/1756)
- [原版 Scratch](https://github.com/LLK/scratch-flash)

## ⚠️ 注意事项

1. **Flash 支持问题**
   - Chrome 已禁用 Flash，建议使用 Firefox 或 IE/Edge
   - 或使用独立的 Flash Player 调试器

2. **编码问题**
   - 源代码使用 UTF-8 编码
   - 中文注释可能显示乱码，不影响功能

3. **版权声明**
   - 基于 MIT Scratch 2.0 开源项目
   - 遵循 GPL-2.0 许可证

## 💬 获取帮助

- 提交 Issue: https://github.com/18848007642/easy-scratch2/issues
- 查看 Wiki: https://github.com/18848007642/easy-scratch2/wiki

---

*Happy Coding! 🎯*
