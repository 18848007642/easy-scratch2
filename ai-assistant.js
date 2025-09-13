/**
 * 丝路智星 AI 编程助手
 * 集成多个大模型API
 */

class SilkRoadStarAI {
    constructor() {
        this.apiEndpoints = {
            // 可配置多个AI服务提供商
            openai: {
                url: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-3.5-turbo',
                apiKey: '' // 需要配置
            },
            baidu: {
                url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat',
                model: 'ernie-bot',
                apiKey: '',
                secretKey: ''
            },
            local: {
                url: 'http://localhost:8000/api/chat', // 本地部署的模型
                model: 'local-llm'
            }
        };
        
        this.currentProvider = 'local';
        this.conversationHistory = [];
        this.maxHistoryLength = 10;
    }
    
    /**
     * 初始化AI助手
     */
    async initialize() {
        // 检查可用的AI服务
        this.checkAvailableServices();
        
        // 加载用户偏好设置
        this.loadUserPreferences();
        
        // 初始化UI组件
        this.initializeUI();
        
        console.log('🤖 AI助手初始化完成');
    }
    
    /**
     * 发送消息到AI
     */
    async sendMessage(message, context = {}) {
        try {
            // 添加到对话历史
            this.conversationHistory.push({
                role: 'user',
                content: message,
                timestamp: Date.now()
            });
            
            // 构建完整的提示词
            const prompt = this.buildPrompt(message, context);
            
            // 调用AI服务
            const response = await this.callAIService(prompt);
            
            // 添加响应到历史
            this.conversationHistory.push({
                role: 'assistant',
                content: response,
                timestamp: Date.now()
            });
            
            // 保持历史记录在限制内
            if (this.conversationHistory.length > this.maxHistoryLength * 2) {
                this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
            }
            
            return response;
        } catch (error) {
            console.error('AI服务调用失败:', error);
            return this.getFallbackResponse(message);
        }
    }
    
    /**
     * 构建提示词
     */
    buildPrompt(message, context) {
        let prompt = `你是丝路智星编程教育平台的AI助手。你需要帮助青少年学习编程。\n\n`;
        
        // 添加上下文信息
        if (context.currentProject) {
            prompt += `当前项目: ${context.currentProject}\n`;
        }
        if (context.currentLesson) {
            prompt += `当前课程: ${context.currentLesson}\n`;
        }
        if (context.userLevel) {
            prompt += `用户等级: ${context.userLevel}\n`;
        }
        
        // 添加历史对话
        const recentHistory = this.conversationHistory.slice(-4);
        if (recentHistory.length > 0) {
            prompt += '\n最近对话:\n';
            recentHistory.forEach(msg => {
                prompt += `${msg.role}: ${msg.content}\n`;
            });
        }
        
        prompt += `\n用户问题: ${message}\n`;
        prompt += `\n请用简单易懂的语言回答，适合青少年理解。如果涉及编程，请给出Scratch积木块的例子。`;
        
        return prompt;
    }
    
    /**
     * 调用AI服务
     */
    async callAIService(prompt) {
        const provider = this.apiEndpoints[this.currentProvider];
        
        if (this.currentProvider === 'openai') {
            return this.callOpenAI(prompt, provider);
        } else if (this.currentProvider === 'baidu') {
            return this.callBaiduAI(prompt, provider);
        } else {
            return this.callLocalAI(prompt, provider);
        }
    }
    
    /**
     * 调用OpenAI
     */
    async callOpenAI(prompt, config) {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    {
                        role: 'system',
                        content: '你是一个友好的编程教育助手'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    /**
     * 调用本地AI模型
     */
    async callLocalAI(prompt, config) {
        // 本地模型接口（示例）
        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    max_length: 500,
                    temperature: 0.7
                })
            });
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            // 如果本地模型不可用，使用规则引擎
            return this.ruleBasedResponse(prompt);
        }
    }
    
    /**
     * 基于规则的响应（备用方案）
     */
    ruleBasedResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // 编程概念解释
        if (lowerMessage.includes('什么是') || lowerMessage.includes('如何')) {
            if (lowerMessage.includes('变量')) {
                return '变量就像一个盒子，可以存放数据。在Scratch中，你可以创建变量来存储分数、生命值等信息。使用"数据"分类下的"建立一个变量"积木块来创建变量。';
            }
            if (lowerMessage.includes('循环')) {
                return '循环让代码重复执行。在Scratch中，使用"控制"分类下的"重复"积木块。比如"重复10次"可以让里面的积木执行10次。';
            }
            if (lowerMessage.includes('条件')) {
                return '条件判断让程序做选择。使用"如果...那么"积木块，当条件满足时执行特定代码。比如"如果按下空格键，那么让角色跳跃"。';
            }
        }
        
        // 项目建议
        if (lowerMessage.includes('做什么') || lowerMessage.includes('项目')) {
            const projects = [
                '制作一个接球游戏：控制挡板接住掉落的球',
                '创建一个音乐播放器：点击不同按钮播放不同音符',
                '设计一个迷宫游戏：控制角色走出迷宫',
                '制作一个绘画程序：用鼠标绘制图案',
                '创建一个计算器：实现简单的加减乘除'
            ];
            return `推荐项目：${projects[Math.floor(Math.random() * projects.length)]}。需要帮助可以问我具体步骤！`;
        }
        
        // 错误帮助
        if (lowerMessage.includes('错误') || lowerMessage.includes('不工作')) {
            return '遇到问题了？让我帮你检查：\n1. 确认积木块连接正确\n2. 检查变量名是否拼写正确\n3. 查看是否有无限循环\n4. 试试点击绿旗重新运行\n描述具体问题，我可以给出更准确的帮助！';
        }
        
        // 鼓励
        if (lowerMessage.includes('难') || lowerMessage.includes('不会')) {
            return '编程确实需要练习，但你一定可以的！让我们一步步来。先从简单的开始，比如让角色移动。有什么具体不懂的地方吗？';
        }
        
        // 默认响应
        return '我是丝路智星AI助手！你可以问我：\n• 编程概念（如：什么是循环？）\n• 项目建议（如：我能做什么项目？）\n• 错误帮助（如：我的代码不工作）\n• 具体操作（如：如何让角色跳跃？）';
    }
    
    /**
     * 获取备用响应
     */
    getFallbackResponse(message) {
        return this.ruleBasedResponse(message);
    }
    
    /**
     * 代码分析功能
     */
    async analyzeCode(scratchCode) {
        const analysis = {
            complexity: this.calculateComplexity(scratchCode),
            suggestions: [],
            bugs: [],
            optimizations: []
        };
        
        // 分析代码结构
        if (scratchCode.includes('forever')) {
            analysis.suggestions.push('注意：永久循环可能导致程序无法停止');
        }
        
        if (!scratchCode.includes('when green flag clicked')) {
            analysis.suggestions.push('建议：添加"当绿旗被点击"事件来启动程序');
        }
        
        return analysis;
    }
    
    /**
     * 计算代码复杂度
     */
    calculateComplexity(code) {
        let complexity = 1;
        
        // 计算循环
        complexity += (code.match(/repeat|forever/g) || []).length * 2;
        
        // 计算条件
        complexity += (code.match(/if/g) || []).length * 1.5;
        
        // 计算变量
        complexity += (code.match(/variable/g) || []).length;
        
        return Math.min(10, complexity);
    }
    
    /**
     * 生成代码建议
     */
    async generateCodeSuggestion(context) {
        const suggestions = [];
        
        if (context.projectType === 'game') {
            suggestions.push({
                title: '添加计分系统',
                code: '创建变量"分数"\n当绿旗被点击\n将分数设为0\n重复执行\n  如果碰到金币\n    分数增加1'
            });
        }
        
        if (context.projectType === 'animation') {
            suggestions.push({
                title: '添加动画效果',
                code: '重复10次\n  将大小增加10\n  等待0.1秒\n结束\n重复10次\n  将大小减少10\n  等待0.1秒'
            });
        }
        
        return suggestions;
    }
    
    /**
     * 初始化UI组件
     */
    initializeUI() {
        // 创建AI助手聊天窗口
        const chatWindow = document.createElement('div');
        chatWindow.id = 'ai-assistant-chat';
        chatWindow.className = 'ai-chat-window';
        chatWindow.innerHTML = `
            <div class="ai-chat-header">
                <span>🤖 AI编程助手</span>
                <button onclick="toggleAIChat()">×</button>
            </div>
            <div class="ai-chat-messages" id="ai-messages"></div>
            <div class="ai-chat-input">
                <input type="text" id="ai-input" placeholder="问我任何编程问题...">
                <button onclick="sendToAI()">发送</button>
            </div>
        `;
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .ai-chat-window {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                height: 450px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                z-index: 1000;
            }
            
            .ai-chat-header {
                padding: 15px;
                background: linear-gradient(135deg, #3B82F6 0%, #1E5A8E 100%);
                color: white;
                border-radius: 15px 15px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
            }
            
            .ai-chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
            }
            
            .ai-message {
                margin-bottom: 15px;
                padding: 10px;
                border-radius: 10px;
                max-width: 80%;
            }
            
            .ai-message.user {
                background: #E3F2FD;
                margin-left: auto;
                text-align: right;
            }
            
            .ai-message.assistant {
                background: #F5F5F5;
            }
            
            .ai-chat-input {
                padding: 15px;
                border-top: 1px solid #E0E0E0;
                display: flex;
                gap: 10px;
            }
            
            .ai-chat-input input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #DDD;
                border-radius: 20px;
                outline: none;
            }
            
            .ai-chat-input button {
                padding: 8px 20px;
                background: #3B82F6;
                color: white;
                border: none;
                border-radius: 20px;
                cursor: pointer;
            }
        `;
        
        // 添加到页面
        if (typeof document !== 'undefined') {
            document.head.appendChild(style);
            // document.body.appendChild(chatWindow);
        }
    }
    
    /**
     * 检查可用服务
     */
    async checkAvailableServices() {
        for (const [provider, config] of Object.entries(this.apiEndpoints)) {
            try {
                // 简单的连通性检查
                if (config.url.startsWith('http://localhost')) {
                    const response = await fetch(config.url + '/health', {
                        method: 'GET',
                        mode: 'no-cors'
                    }).catch(() => null);
                    
                    if (response) {
                        console.log(`✅ ${provider} 服务可用`);
                    }
                }
            } catch (error) {
                console.log(`❌ ${provider} 服务不可用`);
            }
        }
    }
    
    /**
     * 加载用户偏好
     */
    loadUserPreferences() {
        const prefs = localStorage.getItem('ai-preferences');
        if (prefs) {
            const preferences = JSON.parse(prefs);
            this.currentProvider = preferences.provider || 'local';
            this.maxHistoryLength = preferences.historyLength || 10;
        }
    }
}

// 创建全局实例
const silkRoadAI = new SilkRoadStarAI();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SilkRoadStarAI;
}
