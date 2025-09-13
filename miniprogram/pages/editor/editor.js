// 丝路智星 - 积木编程编辑器
Page({
  data: {
    // Blockly工作区配置
    workspace: null,
    code: '',
    isRunning: false,
    output: [],
    
    // 项目信息
    projectName: '未命名项目',
    projectId: '',
    lastSaved: null,
    
    // 积木分类
    categories: [
      { name: '运动', color: '#4a6cd4', blocks: [] },
      { name: '外观', color: '#8a55d7', blocks: [] },
      { name: '声音', color: '#bb42c3', blocks: [] },
      { name: '事件', color: '#c88330', blocks: [] },
      { name: '控制', color: '#e1a91a', blocks: [] },
      { name: '侦测', color: '#2ca5e2', blocks: [] },
      { name: '运算', color: '#5cb712', blocks: [] },
      { name: '变量', color: '#EE7D16', blocks: [] }
    ],
    
    // 精灵和舞台
    sprites: [
      { id: 'sprite1', name: '小猫', x: 0, y: 0, direction: 90, visible: true }
    ],
    selectedSprite: 'sprite1',
    stageWidth: 480,
    stageHeight: 360
  },

  onLoad(options) {
    // 初始化编辑器
    this.initBlockly();
    
    // 加载项目
    if (options.projectId) {
      this.loadProject(options.projectId);
    } else {
      this.createNewProject();
    }
    
    // 设置自动保存
    this.startAutoSave();
  },

  // 初始化Blockly
  initBlockly() {
    // 在实际实现中，这里会初始化Blockly工作区
    // 由于小程序环境限制，可能需要使用WebView或自定义实现
    console.log('初始化积木编程环境');
    
    // 模拟创建工作区
    this.setData({
      workspace: {
        blocks: [],
        variables: []
      }
    });
  },

  // 创建新项目
  createNewProject() {
    const projectId = 'proj_' + Date.now();
    this.setData({
      projectId: projectId,
      projectName: '未命名项目',
      code: '',
      output: []
    });
    
    // 保存到本地存储
    wx.setStorageSync('currentProject', {
      id: projectId,
      name: this.data.projectName,
      created: new Date().toISOString()
    });
  },

  // 加载项目
  loadProject(projectId) {
    wx.showLoading({ title: '加载中...' });
    
    // 从云端或本地加载项目
    wx.cloud.callFunction({
      name: 'loadProject',
      data: { projectId: projectId }
    }).then(res => {
      if (res.result.success) {
        this.setData({
          projectId: projectId,
          projectName: res.result.project.name,
          code: res.result.project.code,
          sprites: res.result.project.sprites || this.data.sprites
        });
        
        // 恢复工作区
        this.restoreWorkspace(res.result.project.workspace);
      }
      wx.hideLoading();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    });
  },

  // 运行代码
  runCode() {
    if (this.data.isRunning) {
      this.stopCode();
      return;
    }
    
    this.setData({ 
      isRunning: true,
      output: []
    });
    
    // 生成代码
    const code = this.generateCode();
    
    // 创建虚拟机执行代码
    this.executeCode(code);
  },

  // 生成代码
  generateCode() {
    // 从积木生成JavaScript代码
    let code = '// 丝路智星自动生成代码\n';
    
    // 遍历所有积木块生成代码
    if (this.data.workspace && this.data.workspace.blocks) {
      this.data.workspace.blocks.forEach(block => {
        code += this.blockToCode(block) + '\n';
      });
    }
    
    this.setData({ code: code });
    return code;
  },

  // 积木转代码
  blockToCode(block) {
    // 根据积木类型生成对应代码
    switch(block.type) {
      case 'move':
        return `sprite.move(${block.value});`;
      case 'turn':
        return `sprite.turn(${block.value});`;
      case 'say':
        return `sprite.say("${block.value}");`;
      case 'wait':
        return `await wait(${block.value});`;
      case 'repeat':
        return `for(let i = 0; i < ${block.value}; i++) {\n${block.innerCode}\n}`;
      default:
        return `// ${block.type}`;
    }
  },

  // 执行代码
  executeCode(code) {
    try {
      // 创建安全的执行环境
      const sandbox = this.createSandbox();
      
      // 执行代码
      const func = new Function('sprite', 'wait', 'console', code);
      func(sandbox.sprite, sandbox.wait, sandbox.console);
      
      this.addOutput('✅ 代码执行成功');
    } catch (error) {
      this.addOutput('❌ 错误: ' + error.message);
      this.setData({ isRunning: false });
    }
  },

  // 创建沙盒环境
  createSandbox() {
    const that = this;
    return {
      sprite: {
        move: (steps) => {
          const sprite = that.data.sprites[0];
          sprite.x += steps * Math.cos(sprite.direction * Math.PI / 180);
          sprite.y += steps * Math.sin(sprite.direction * Math.PI / 180);
          that.setData({ sprites: that.data.sprites });
          that.addOutput(`🚶 移动 ${steps} 步`);
        },
        turn: (degrees) => {
          const sprite = that.data.sprites[0];
          sprite.direction += degrees;
          that.setData({ sprites: that.data.sprites });
          that.addOutput(`🔄 旋转 ${degrees} 度`);
        },
        say: (text) => {
          that.addOutput(`💬 说: ${text}`);
        }
      },
      wait: (seconds) => {
        return new Promise(resolve => {
          setTimeout(resolve, seconds * 1000);
        });
      },
      console: {
        log: (msg) => that.addOutput(msg)
      }
    };
  },

  // 停止代码
  stopCode() {
    this.setData({ isRunning: false });
    this.addOutput('⏹️ 程序已停止');
  },

  // 添加输出
  addOutput(message) {
    const output = this.data.output;
    output.push({
      time: new Date().toLocaleTimeString(),
      message: message
    });
    this.setData({ output: output });
  },

  // 保存项目
  saveProject() {
    wx.showLoading({ title: '保存中...' });
    
    const projectData = {
      id: this.data.projectId,
      name: this.data.projectName,
      code: this.data.code,
      workspace: this.data.workspace,
      sprites: this.data.sprites,
      updated: new Date().toISOString()
    };
    
    // 保存到云端
    wx.cloud.callFunction({
      name: 'saveProject',
      data: projectData
    }).then(res => {
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      this.setData({ lastSaved: new Date() });
    }).catch(err => {
      wx.hideLoading();
      // 保存到本地作为备份
      wx.setStorageSync(`project_${this.data.projectId}`, projectData);
      wx.showToast({
        title: '已保存到本地',
        icon: 'success'
      });
    });
  },

  // 自动保存
  startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      if (this.data.workspace && this.data.projectId) {
        this.saveProject();
      }
    }, 30000); // 每30秒自动保存
  },

  // 分享项目
  shareProject() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 页面分享配置
  onShareAppMessage() {
    return {
      title: `来看看我的作品：${this.data.projectName}`,
      path: `/pages/project-detail/project-detail?id=${this.data.projectId}`,
      imageUrl: '/assets/share-cover.png'
    };
  },

  // 导出项目
  exportProject() {
    const projectData = {
      name: this.data.projectName,
      code: this.data.code,
      sprites: this.data.sprites,
      exported: new Date().toISOString()
    };
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: JSON.stringify(projectData),
      success: () => {
        wx.showToast({
          title: '项目已复制',
          icon: 'success'
        });
      }
    });
  },

  // 页面卸载
  onUnload() {
    // 清理定时器
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    // 最后保存
    this.saveProject();
  }
});
