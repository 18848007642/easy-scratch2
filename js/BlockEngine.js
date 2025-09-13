/**
 * 丝路智星 - 积木编程引擎
 * 负责积木的创建、拖拽、连接和代码生成
 */

class BlockEngine {
    constructor(container) {
        this.container = container;
        this.blocks = [];
        this.connections = [];
        this.selectedBlock = null;
        this.draggedBlock = null;
        this.blockIdCounter = 0;
        this.snapDistance = 20;
        
        // 积木类型定义
        this.blockTypes = {
            // 事件积木
            events: {
                whenFlagClicked: {
                    text: '当🚩被点击',
                    color: '#FFAB19',
                    type: 'hat',
                    code: 'whenFlagClicked()'
                },
                whenKeyPressed: {
                    text: '当按下 [KEY]',
                    color: '#FFAB19',
                    type: 'hat',
                    params: ['space'],
                    code: 'whenKeyPressed("{0}")'
                },
                whenSpriteClicked: {
                    text: '当角色被点击',
                    color: '#FFAB19',
                    type: 'hat',
                    code: 'whenSpriteClicked()'
                }
            },
            
            // 运动积木
            motion: {
                move: {
                    text: '移动 [STEPS] 步',
                    color: '#4C97FF',
                    type: 'command',
                    params: [10],
                    code: 'move({0})'
                },
                turnRight: {
                    text: '右转 [DEGREES] 度',
                    color: '#4C97FF',
                    type: 'command',
                    params: [15],
                    code: 'turnRight({0})'
                },
                turnLeft: {
                    text: '左转 [DEGREES] 度',
                    color: '#4C97FF',
                    type: 'command',
                    params: [15],
                    code: 'turnLeft({0})'
                },
                goTo: {
                    text: '移到 x:[X] y:[Y]',
                    color: '#4C97FF',
                    type: 'command',
                    params: [0, 0],
                    code: 'goTo({0}, {1})'
                },
                glide: {
                    text: '在 [SECS] 秒内滑行到 x:[X] y:[Y]',
                    color: '#4C97FF',
                    type: 'command',
                    params: [1, 0, 0],
                    code: 'glide({0}, {1}, {2})'
                },
                setX: {
                    text: '将x坐标设为 [X]',
                    color: '#4C97FF',
                    type: 'command',
                    params: [0],
                    code: 'setX({0})'
                },
                setY: {
                    text: '将y坐标设为 [Y]',
                    color: '#4C97FF',
                    type: 'command',
                    params: [0],
                    code: 'setY({0})'
                },
                changeX: {
                    text: '将x坐标增加 [DX]',
                    color: '#4C97FF',
                    type: 'command',
                    params: [10],
                    code: 'changeX({0})'
                },
                changeY: {
                    text: '将y坐标增加 [DY]',
                    color: '#4C97FF',
                    type: 'command',
                    params: [10],
                    code: 'changeY({0})'
                }
            },
            
            // 外观积木
            looks: {
                say: {
                    text: '说 [TEXT]',
                    color: '#9966FF',
                    type: 'command',
                    params: ['你好！'],
                    code: 'say("{0}")'
                },
                sayForSecs: {
                    text: '说 [TEXT] [SECS] 秒',
                    color: '#9966FF',
                    type: 'command',
                    params: ['你好！', 2],
                    code: 'sayForSecs("{0}", {1})'
                },
                think: {
                    text: '思考 [TEXT]',
                    color: '#9966FF',
                    type: 'command',
                    params: ['嗯...'],
                    code: 'think("{0}")'
                },
                show: {
                    text: '显示',
                    color: '#9966FF',
                    type: 'command',
                    code: 'show()'
                },
                hide: {
                    text: '隐藏',
                    color: '#9966FF',
                    type: 'command',
                    code: 'hide()'
                },
                switchCostume: {
                    text: '换成 [COSTUME] 造型',
                    color: '#9966FF',
                    type: 'command',
                    params: ['造型1'],
                    code: 'switchCostume("{0}")'
                },
                changeSize: {
                    text: '将大小增加 [SIZE]',
                    color: '#9966FF',
                    type: 'command',
                    params: [10],
                    code: 'changeSize({0})'
                },
                setSize: {
                    text: '将大小设为 [SIZE] %',
                    color: '#9966FF',
                    type: 'command',
                    params: [100],
                    code: 'setSize({0})'
                }
            },
            
            // 声音积木
            sound: {
                playSound: {
                    text: '播放声音 [SOUND]',
                    color: '#CF63CF',
                    type: 'command',
                    params: ['喵'],
                    code: 'playSound("{0}")'
                },
                playSoundUntilDone: {
                    text: '播放声音 [SOUND] 直到播放完毕',
                    color: '#CF63CF',
                    type: 'command',
                    params: ['喵'],
                    code: 'playSoundUntilDone("{0}")'
                },
                stopAllSounds: {
                    text: '停止所有声音',
                    color: '#CF63CF',
                    type: 'command',
                    code: 'stopAllSounds()'
                },
                changeVolume: {
                    text: '将音量增加 [VOLUME]',
                    color: '#CF63CF',
                    type: 'command',
                    params: [10],
                    code: 'changeVolume({0})'
                },
                setVolume: {
                    text: '将音量设为 [VOLUME] %',
                    color: '#CF63CF',
                    type: 'command',
                    params: [100],
                    code: 'setVolume({0})'
                }
            },
            
            // 控制积木
            control: {
                wait: {
                    text: '等待 [SECS] 秒',
                    color: '#FFAB19',
                    type: 'command',
                    params: [1],
                    code: 'wait({0})'
                },
                repeat: {
                    text: '重复 [TIMES] 次',
                    color: '#FFAB19',
                    type: 'c-block',
                    params: [10],
                    code: 'repeat({0}) {\n{body}\n}'
                },
                forever: {
                    text: '重复执行',
                    color: '#FFAB19',
                    type: 'c-block',
                    code: 'forever() {\n{body}\n}'
                },
                if: {
                    text: '如果 [CONDITION] 那么',
                    color: '#FFAB19',
                    type: 'c-block',
                    params: [true],
                    code: 'if ({0}) {\n{body}\n}'
                },
                ifElse: {
                    text: '如果 [CONDITION] 那么... 否则...',
                    color: '#FFAB19',
                    type: 'c-block-else',
                    params: [true],
                    code: 'if ({0}) {\n{body1}\n} else {\n{body2}\n}'
                },
                waitUntil: {
                    text: '等待直到 [CONDITION]',
                    color: '#FFAB19',
                    type: 'command',
                    params: [true],
                    code: 'waitUntil({0})'
                },
                stop: {
                    text: '停止 [TARGET]',
                    color: '#FFAB19',
                    type: 'cap',
                    params: ['全部'],
                    code: 'stop("{0}")'
                }
            },
            
            // 侦测积木
            sensing: {
                touching: {
                    text: '碰到 [OBJECT] ?',
                    color: '#5CB1D6',
                    type: 'boolean',
                    params: ['鼠标指针'],
                    code: 'touching("{0}")'
                },
                touchingColor: {
                    text: '碰到颜色 [COLOR] ?',
                    color: '#5CB1D6',
                    type: 'boolean',
                    params: ['#000000'],
                    code: 'touchingColor("{0}")'
                },
                distanceTo: {
                    text: '到 [OBJECT] 的距离',
                    color: '#5CB1D6',
                    type: 'reporter',
                    params: ['鼠标指针'],
                    code: 'distanceTo("{0}")'
                },
                ask: {
                    text: '询问 [QUESTION] 并等待',
                    color: '#5CB1D6',
                    type: 'command',
                    params: ['你叫什么名字？'],
                    code: 'ask("{0}")'
                },
                answer: {
                    text: '回答',
                    color: '#5CB1D6',
                    type: 'reporter',
                    code: 'answer()'
                },
                keyPressed: {
                    text: '按下了 [KEY] 键?',
                    color: '#5CB1D6',
                    type: 'boolean',
                    params: ['space'],
                    code: 'keyPressed("{0}")'
                },
                mouseDown: {
                    text: '按下鼠标?',
                    color: '#5CB1D6',
                    type: 'boolean',
                    code: 'mouseDown()'
                },
                mouseX: {
                    text: '鼠标的x坐标',
                    color: '#5CB1D6',
                    type: 'reporter',
                    code: 'mouseX()'
                },
                mouseY: {
                    text: '鼠标的y坐标',
                    color: '#5CB1D6',
                    type: 'reporter',
                    code: 'mouseY()'
                }
            },
            
            // 运算积木
            operators: {
                add: {
                    text: '[A] + [B]',
                    color: '#59C059',
                    type: 'reporter',
                    params: [0, 0],
                    code: '({0} + {1})'
                },
                subtract: {
                    text: '[A] - [B]',
                    color: '#59C059',
                    type: 'reporter',
                    params: [0, 0],
                    code: '({0} - {1})'
                },
                multiply: {
                    text: '[A] * [B]',
                    color: '#59C059',
                    type: 'reporter',
                    params: [0, 0],
                    code: '({0} * {1})'
                },
                divide: {
                    text: '[A] / [B]',
                    color: '#59C059',
                    type: 'reporter',
                    params: [0, 0],
                    code: '({0} / {1})'
                },
                random: {
                    text: '在 [FROM] 和 [TO] 之间取随机数',
                    color: '#59C059',
                    type: 'reporter',
                    params: [1, 10],
                    code: 'random({0}, {1})'
                },
                greater: {
                    text: '[A] > [B]',
                    color: '#59C059',
                    type: 'boolean',
                    params: [0, 0],
                    code: '({0} > {1})'
                },
                less: {
                    text: '[A] < [B]',
                    color: '#59C059',
                    type: 'boolean',
                    params: [0, 0],
                    code: '({0} < {1})'
                },
                equal: {
                    text: '[A] = [B]',
                    color: '#59C059',
                    type: 'boolean',
                    params: [0, 0],
                    code: '({0} === {1})'
                },
                and: {
                    text: '[A] 与 [B]',
                    color: '#59C059',
                    type: 'boolean',
                    params: [true, true],
                    code: '({0} && {1})'
                },
                or: {
                    text: '[A] 或 [B]',
                    color: '#59C059',
                    type: 'boolean',
                    params: [true, false],
                    code: '({0} || {1})'
                },
                not: {
                    text: '不成立 [BOOL]',
                    color: '#59C059',
                    type: 'boolean',
                    params: [true],
                    code: '!({0})'
                }
            },
            
            // 变量积木
            variables: {
                setVariable: {
                    text: '将 [VAR] 设为 [VALUE]',
                    color: '#FF8C1A',
                    type: 'command',
                    params: ['变量', 0],
                    code: '{0} = {1}'
                },
                changeVariable: {
                    text: '将 [VAR] 增加 [VALUE]',
                    color: '#FF8C1A',
                    type: 'command',
                    params: ['变量', 1],
                    code: '{0} += {1}'
                },
                showVariable: {
                    text: '显示变量 [VAR]',
                    color: '#FF8C1A',
                    type: 'command',
                    params: ['变量'],
                    code: 'showVariable("{0}")'
                },
                hideVariable: {
                    text: '隐藏变量 [VAR]',
                    color: '#FF8C1A',
                    type: 'command',
                    params: ['变量'],
                    code: 'hideVariable("{0}")'
                }
            }
        };
        
        this.init();
    }
    
    init() {
        // 创建工作区
        this.workspace = document.createElement('div');
        this.workspace.className = 'block-workspace';
        this.workspace.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            overflow: auto;
        `;
        this.container.appendChild(this.workspace);
        
        // 绑定事件
        this.bindEvents();
    }
    
    bindEvents() {
        // 工作区事件
        this.workspace.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.workspace.addEventListener('drop', (e) => this.handleDrop(e));
        this.workspace.addEventListener('click', (e) => this.handleClick(e));
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    /**
     * 创建积木
     */
    createBlock(category, type, x = 100, y = 100) {
        const blockDef = this.blockTypes[category]?.[type];
        if (!blockDef) {
            console.error(`未知的积木类型: ${category}.${type}`);
            return null;
        }
        
        const block = {
            id: `block_${this.blockIdCounter++}`,
            category: category,
            type: type,
            definition: blockDef,
            x: x,
            y: y,
            params: blockDef.params ? [...blockDef.params] : [],
            innerBlocks: blockDef.type === 'c-block' || blockDef.type === 'c-block-else' ? [] : null,
            nextBlock: null,
            parentBlock: null
        };
        
        // 创建DOM元素
        block.element = this.createBlockElement(block);
        this.workspace.appendChild(block.element);
        
        // 添加到积木列表
        this.blocks.push(block);
        
        // 使积木可拖拽
        this.makeBlockDraggable(block);
        
        return block;
    }
    
    /**
     * 创建积木DOM元素
     */
    createBlockElement(block) {
        const elem = document.createElement('div');
        elem.className = `block block-${block.definition.type}`;
        elem.id = block.id;
        elem.style.cssText = `
            position: absolute;
            left: ${block.x}px;
            top: ${block.y}px;
            background: ${block.definition.color};
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: move;
            user-select: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            font-size: 14px;
            min-width: 120px;
            z-index: ${this.blocks.length};
        `;
        
        // 创建积木内容
        const content = this.createBlockContent(block);
        elem.appendChild(content);
        
        // 特殊类型积木的样式
        if (block.definition.type === 'hat') {
            elem.style.borderTopLeftRadius = '20px';
            elem.style.borderTopRightRadius = '20px';
        } else if (block.definition.type === 'cap') {
            elem.style.borderBottomLeftRadius = '20px';
            elem.style.borderBottomRightRadius = '20px';
        } else if (block.definition.type === 'c-block' || block.definition.type === 'c-block-else') {
            elem.style.paddingBottom = '40px';
            
            // 创建内部插槽
            const slot = document.createElement('div');
            slot.className = 'block-slot';
            slot.style.cssText = `
                position: absolute;
                left: 20px;
                top: 36px;
                right: 8px;
                bottom: 8px;
                background: rgba(255,255,255,0.2);
                border-radius: 4px;
                min-height: 25px;
            `;
            elem.appendChild(slot);
        } else if (block.definition.type === 'boolean') {
            elem.style.borderRadius = '20px';
        } else if (block.definition.type === 'reporter') {
            elem.style.borderRadius = '15px';
        }
        
        return elem;
    }
    
    /**
     * 创建积木内容
     */
    createBlockContent(block) {
        const content = document.createElement('div');
        content.className = 'block-content';
        
        // 解析文本和参数
        let text = block.definition.text;
        let paramIndex = 0;
        
        // 替换参数占位符
        text = text.replace(/\[([^\]]+)\]/g, (match, paramName) => {
            if (block.params && paramIndex < block.params.length) {
                const value = block.params[paramIndex];
                const input = `<input type="text" value="${value}" data-param="${paramIndex}" 
                    style="background: rgba(255,255,255,0.3); border: none; 
                    border-radius: 4px; padding: 2px 4px; width: 60px; 
                    color: white; text-align: center;">`;
                paramIndex++;
                return input;
            }
            return match;
        });
        
        content.innerHTML = text;
        
        // 绑定输入框事件
        content.querySelectorAll('input').forEach(input => {
            input.addEventListener('click', (e) => e.stopPropagation());
            input.addEventListener('change', (e) => {
                const paramIdx = parseInt(e.target.dataset.param);
                block.params[paramIdx] = e.target.value;
            });
        });
        
        return content;
    }
    
    /**
     * 使积木可拖拽
     */
    makeBlockDraggable(block) {
        let isDragging = false;
        let startX, startY, offsetX, offsetY;
        
        block.element.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            offsetX = block.x;
            offsetY = block.y;
            
            this.draggedBlock = block;
            block.element.style.zIndex = 1000;
            block.element.style.opacity = '0.8';
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging || this.draggedBlock !== block) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            block.x = offsetX + dx;
            block.y = offsetY + dy;
            
            block.element.style.left = block.x + 'px';
            block.element.style.top = block.y + 'px';
            
            // 检测吸附
            this.checkSnapping(block);
        });
        
        document.addEventListener('mouseup', () => {
            if (!isDragging || this.draggedBlock !== block) return;
            
            isDragging = false;
            block.element.style.opacity = '1';
            
            // 尝试连接积木
            this.tryConnectBlocks(block);
            
            this.draggedBlock = null;
        });
    }
    
    /**
     * 检测积木吸附
     */
    checkSnapping(draggedBlock) {
        this.blocks.forEach(block => {
            if (block === draggedBlock) return;
            
            const dx = Math.abs(draggedBlock.x - block.x);
            const dy = Math.abs(draggedBlock.y - (block.y + block.element.offsetHeight));
            
            if (dx < this.snapDistance && dy < this.snapDistance) {
                // 显示吸附提示
                block.element.style.borderBottom = '2px solid yellow';
            } else {
                block.element.style.borderBottom = '';
            }
        });
    }
    
    /**
     * 尝试连接积木
     */
    tryConnectBlocks(draggedBlock) {
        let connected = false;
        
        this.blocks.forEach(block => {
            if (block === draggedBlock) return;
            
            const dx = Math.abs(draggedBlock.x - block.x);
            const dy = Math.abs(draggedBlock.y - (block.y + block.element.offsetHeight));
            
            if (dx < this.snapDistance && dy < this.snapDistance) {
                // 连接积木
                draggedBlock.x = block.x;
                draggedBlock.y = block.y + block.element.offsetHeight + 2;
                draggedBlock.element.style.left = draggedBlock.x + 'px';
                draggedBlock.element.style.top = draggedBlock.y + 'px';
                
                // 更新连接关系
                block.nextBlock = draggedBlock;
                draggedBlock.parentBlock = block;
                
                connected = true;
            }
            
            block.element.style.borderBottom = '';
        });
        
        return connected;
    }
    
    /**
     * 生成代码
     */
    generateCode() {
        let code = '// 丝路智星自动生成代码\n\n';
        
        // 找到所有顶层积木（没有父积木的）
        const topBlocks = this.blocks.filter(block => !block.parentBlock);
        
        topBlocks.forEach(block => {
            code += this.generateBlockCode(block) + '\n\n';
        });
        
        return code;
    }
    
    /**
     * 生成单个积木的代码
     */
    generateBlockCode(block, indent = '') {
        if (!block) return '';
        
        let code = block.definition.code;
        
        // 替换参数
        if (block.params) {
            block.params.forEach((param, index) => {
                code = code.replace(`{${index}}`, param);
            });
        }
        
        // 处理C型积木
        if (block.definition.type === 'c-block') {
            let bodyCode = '';
            if (block.innerBlocks && block.innerBlocks.length > 0) {
                block.innerBlocks.forEach(innerBlock => {
                    bodyCode += indent + '  ' + this.generateBlockCode(innerBlock, indent + '  ') + '\n';
                });
            }
            code = code.replace('{body}', bodyCode);
        }
        
        // 添加缩进
        code = indent + code;
        
        // 处理下一个积木
        if (block.nextBlock) {
            code += '\n' + this.generateBlockCode(block.nextBlock, indent);
        }
        
        return code;
    }
    
    /**
     * 清空工作区
     */
    clearWorkspace() {
        this.blocks.forEach(block => {
            block.element.remove();
        });
        this.blocks = [];
        this.connections = [];
        this.blockIdCounter = 0;
    }
    
    /**
     * 删除选中的积木
     */
    deleteSelectedBlock() {
        if (!this.selectedBlock) return;
        
        // 移除DOM元素
        this.selectedBlock.element.remove();
        
        // 更新连接关系
        if (this.selectedBlock.parentBlock) {
            this.selectedBlock.parentBlock.nextBlock = this.selectedBlock.nextBlock;
        }
        if (this.selectedBlock.nextBlock) {
            this.selectedBlock.nextBlock.parentBlock = this.selectedBlock.parentBlock;
        }
        
        // 从列表中移除
        const index = this.blocks.indexOf(this.selectedBlock);
        if (index > -1) {
            this.blocks.splice(index, 1);
        }
        
        this.selectedBlock = null;
    }
    
    /**
     * 处理点击事件
     */
    handleClick(e) {
        // 取消之前的选中
        if (this.selectedBlock) {
            this.selectedBlock.element.style.border = '';
        }
        
        // 查找点击的积木
        const blockElem = e.target.closest('.block');
        if (blockElem) {
            const block = this.blocks.find(b => b.id === blockElem.id);
            if (block) {
                this.selectedBlock = block;
                block.element.style.border = '2px solid yellow';
            }
        } else {
            this.selectedBlock = null;
        }
    }
    
    /**
     * 处理键盘事件
     */
    handleKeyDown(e) {
        if (e.key === 'Delete' && this.selectedBlock) {
            this.deleteSelectedBlock();
        }
    }
    
    /**
     * 处理拖拽
     */
    handleDragOver(e) {
        e.preventDefault();
    }
    
    handleDrop(e) {
        e.preventDefault();
        
        // 获取拖拽的数据
        const data = e.dataTransfer.getData('block');
        if (data) {
            const blockInfo = JSON.parse(data);
            const rect = this.workspace.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.createBlock(blockInfo.category, blockInfo.type, x, y);
        }
    }
    
    /**
     * 运行代码
     */
    runCode() {
        const code = this.generateCode();
        console.log('生成的代码：\n', code);
        
        // 创建执行环境
        try {
            const func = new Function('sprite', 'console', code);
            const sprite = this.createSpriteAPI();
            func(sprite, console);
        } catch (error) {
            console.error('代码执行错误：', error);
        }
    }
    
    /**
     * 创建精灵API
     */
    createSpriteAPI() {
        return {
            move: (steps) => console.log(`移动 ${steps} 步`),
            turnRight: (degrees) => console.log(`右转 ${degrees} 度`),
            turnLeft: (degrees) => console.log(`左转 ${degrees} 度`),
            goTo: (x, y) => console.log(`移到 x:${x} y:${y}`),
            say: (text) => console.log(`说: ${text}`),
            wait: (secs) => console.log(`等待 ${secs} 秒`),
            show: () => console.log('显示'),
            hide: () => console.log('隐藏'),
            playSound: (sound) => console.log(`播放声音: ${sound}`)
        };
    }
}

// 导出为全局变量
window.BlockEngine = BlockEngine;
