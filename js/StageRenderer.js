/**
 * 丝路智星 - 舞台渲染引擎
 * 负责精灵的显示、动画和交互
 */

class StageRenderer {
    constructor(container, mediaLibrary) {
        this.container = container;
        this.mediaLibrary = mediaLibrary;
        this.width = 480;
        this.height = 360;
        this.sprites = [];
        this.backdrops = [];
        this.currentBackdrop = 0;
        this.isRunning = false;
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        // 创建Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
        `;
        this.container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // 绑定事件
        this.bindEvents();
        
        // 开始渲染循环
        this.startRenderLoop();
    }
    
    bindEvents() {
        // 鼠标事件
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    /**
     * 创建精灵
     */
    createSprite(options = {}) {
        const sprite = {
            id: options.id || `sprite_${Date.now()}`,
            name: options.name || '精灵',
            x: options.x || 0,
            y: options.y || 0,
            direction: options.direction || 90,
            size: options.size || 100,
            visible: options.visible !== false,
            costumes: options.costumes || [],
            currentCostume: 0,
            sounds: options.sounds || [],
            sayText: '',
            sayEndTime: 0,
            thinkText: '',
            thinkEndTime: 0,
            effects: {
                color: 0,
                fisheye: 0,
                whirl: 0,
                pixelate: 0,
                mosaic: 0,
                brightness: 0,
                ghost: 0
            },
            layer: this.sprites.length,
            draggable: options.draggable || false,
            variables: {},
            lists: {},
            
            // 运动相关
            velocity: { x: 0, y: 0 },
            rotationSpeed: 0,
            
            // 碰撞检测
            boundingBox: null,
            
            // 自定义数据
            customData: options.customData || {}
        };
        
        // 加载造型
        if (options.costumeUrl) {
            this.loadCostume(sprite, options.costumeUrl);
        } else if (options.md5) {
            // 从素材库加载
            const url = this.mediaLibrary.getAssetUrl(options.md5);
            this.loadCostume(sprite, url);
        }
        
        this.sprites.push(sprite);
        return sprite;
    }
    
    /**
     * 加载造型
     */
    async loadCostume(sprite, url, name = '造型1') {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const costume = {
                    name: name,
                    image: img,
                    width: img.width,
                    height: img.height,
                    centerX: img.width / 2,
                    centerY: img.height / 2
                };
                
                sprite.costumes.push(costume);
                
                // 更新边界框
                this.updateBoundingBox(sprite);
                
                resolve(costume);
            };
            
            img.onerror = () => {
                console.error(`Failed to load costume: ${url}`);
                reject(new Error(`Failed to load costume: ${url}`));
            };
            
            img.src = url;
        });
    }
    
    /**
     * 从素材库添加精灵
     */
    async addSpriteFromLibrary(spriteData) {
        const sprite = this.createSprite({
            name: spriteData.name,
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100
        });
        
        // 加载所有造型
        if (spriteData.costumes && spriteData.costumes.length > 0) {
            for (const costume of spriteData.costumes) {
                const url = this.mediaLibrary.getAssetUrl(costume.md5);
                await this.loadCostume(sprite, url, costume.name);
            }
        } else if (spriteData.md5) {
            const url = this.mediaLibrary.getAssetUrl(spriteData.md5);
            await this.loadCostume(sprite, url, spriteData.name);
        }
        
        return sprite;
    }
    
    /**
     * 设置背景
     */
    async setBackdrop(backdropData) {
        const backdrop = {
            name: backdropData.name,
            image: null
        };
        
        const url = this.mediaLibrary.getAssetUrl(backdropData.md5);
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                backdrop.image = img;
                this.backdrops.push(backdrop);
                this.currentBackdrop = this.backdrops.length - 1;
                resolve(backdrop);
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load backdrop: ${url}`));
            };
            
            img.src = url;
        });
    }
    
    /**
     * 更新边界框
     */
    updateBoundingBox(sprite) {
        if (!sprite.costumes[sprite.currentCostume]) return;
        
        const costume = sprite.costumes[sprite.currentCostume];
        const scale = sprite.size / 100;
        const width = costume.width * scale;
        const height = costume.height * scale;
        
        sprite.boundingBox = {
            left: sprite.x - width / 2,
            right: sprite.x + width / 2,
            top: sprite.y - height / 2,
            bottom: sprite.y + height / 2
        };
    }
    
    /**
     * 渲染循环
     */
    startRenderLoop() {
        const render = () => {
            this.render();
            this.animationFrame = requestAnimationFrame(render);
        };
        render();
    }
    
    /**
     * 停止渲染
     */
    stopRenderLoop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    /**
     * 渲染场景
     */
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制背景
        this.renderBackdrop();
        
        // 按层级排序精灵
        const sortedSprites = [...this.sprites].sort((a, b) => a.layer - b.layer);
        
        // 绘制精灵
        sortedSprites.forEach(sprite => {
            if (sprite.visible) {
                this.renderSprite(sprite);
            }
        });
        
        // 绘制说话/思考气泡
        sortedSprites.forEach(sprite => {
            if (sprite.visible) {
                this.renderSpeechBubble(sprite);
            }
        });
    }
    
    /**
     * 渲染背景
     */
    renderBackdrop() {
        if (this.backdrops[this.currentBackdrop]?.image) {
            const backdrop = this.backdrops[this.currentBackdrop];
            this.ctx.drawImage(backdrop.image, 0, 0, this.width, this.height);
        } else {
            // 默认背景
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    /**
     * 渲染精灵
     */
    renderSprite(sprite) {
        if (!sprite.costumes[sprite.currentCostume]) return;
        
        const costume = sprite.costumes[sprite.currentCostume];
        const scale = sprite.size / 100;
        
        this.ctx.save();
        
        // 转换坐标系（Scratch坐标系：中心为原点，Y轴向上）
        this.ctx.translate(this.width / 2 + sprite.x, this.height / 2 - sprite.y);
        
        // 旋转
        this.ctx.rotate((sprite.direction - 90) * Math.PI / 180);
        
        // 缩放
        this.ctx.scale(scale, scale);
        
        // 应用特效
        this.applyEffects(sprite);
        
        // 绘制造型
        this.ctx.drawImage(
            costume.image,
            -costume.centerX,
            -costume.centerY,
            costume.width,
            costume.height
        );
        
        this.ctx.restore();
    }
    
    /**
     * 应用特效
     */
    applyEffects(sprite) {
        // 透明度效果
        if (sprite.effects.ghost !== 0) {
            this.ctx.globalAlpha = 1 - (sprite.effects.ghost / 100);
        }
        
        // 亮度效果
        if (sprite.effects.brightness !== 0) {
            const brightness = sprite.effects.brightness / 100;
            this.ctx.filter = `brightness(${1 + brightness})`;
        }
        
        // 颜色效果
        if (sprite.effects.color !== 0) {
            const hue = sprite.effects.color * 3.6; // 0-100 转换为 0-360度
            this.ctx.filter += ` hue-rotate(${hue}deg)`;
        }
    }
    
    /**
     * 渲染说话气泡
     */
    renderSpeechBubble(sprite) {
        const now = Date.now();
        
        if (sprite.sayText && (sprite.sayEndTime === 0 || now < sprite.sayEndTime)) {
            this.drawBubble(sprite, sprite.sayText, 'say');
        } else if (sprite.thinkText && (sprite.thinkEndTime === 0 || now < sprite.thinkEndTime)) {
            this.drawBubble(sprite, sprite.thinkText, 'think');
        }
    }
    
    /**
     * 绘制气泡
     */
    drawBubble(sprite, text, type) {
        const x = this.width / 2 + sprite.x;
        const y = this.height / 2 - sprite.y - 50;
        
        this.ctx.save();
        
        // 测量文本
        this.ctx.font = '14px Arial';
        const metrics = this.ctx.measureText(text);
        const width = metrics.width + 20;
        const height = 30;
        
        // 绘制气泡背景
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        
        // 圆角矩形
        this.roundRect(x - width / 2, y - height, width, height, 10);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 绘制尾巴
        if (type === 'say') {
            // 说话气泡的尾巴
            this.ctx.beginPath();
            this.ctx.moveTo(x - 10, y);
            this.ctx.lineTo(x, y + 10);
            this.ctx.lineTo(x + 10, y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        } else {
            // 思考气泡的圆点
            for (let i = 0; i < 3; i++) {
                const r = 3 - i;
                const offsetY = 10 + i * 8;
                this.ctx.beginPath();
                this.ctx.arc(x, y + offsetY, r, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
        
        // 绘制文本
        this.ctx.fillStyle = '#333';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y - height / 2);
        
        this.ctx.restore();
    }
    
    /**
     * 绘制圆角矩形
     */
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    /**
     * 精灵API - 移动
     */
    moveSprite(sprite, steps) {
        const radians = (sprite.direction - 90) * Math.PI / 180;
        sprite.x += steps * Math.cos(radians);
        sprite.y += steps * Math.sin(radians);
        this.updateBoundingBox(sprite);
    }
    
    /**
     * 精灵API - 转向
     */
    turnSprite(sprite, degrees) {
        sprite.direction += degrees;
        sprite.direction = sprite.direction % 360;
        if (sprite.direction < 0) sprite.direction += 360;
    }
    
    /**
     * 精灵API - 移到
     */
    goToSprite(sprite, x, y) {
        sprite.x = x;
        sprite.y = y;
        this.updateBoundingBox(sprite);
    }
    
    /**
     * 精灵API - 滑行
     */
    async glideSprite(sprite, x, y, seconds) {
        const startX = sprite.x;
        const startY = sprite.y;
        const dx = x - startX;
        const dy = y - startY;
        const startTime = Date.now();
        const duration = seconds * 1000;
        
        return new Promise(resolve => {
            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                sprite.x = startX + dx * progress;
                sprite.y = startY + dy * progress;
                this.updateBoundingBox(sprite);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            animate();
        });
    }
    
    /**
     * 精灵API - 说话
     */
    saySprite(sprite, text, seconds = 0) {
        sprite.sayText = text;
        sprite.sayEndTime = seconds > 0 ? Date.now() + seconds * 1000 : 0;
        sprite.thinkText = '';
    }
    
    /**
     * 精灵API - 思考
     */
    thinkSprite(sprite, text, seconds = 0) {
        sprite.thinkText = text;
        sprite.thinkEndTime = seconds > 0 ? Date.now() + seconds * 1000 : 0;
        sprite.sayText = '';
    }
    
    /**
     * 精灵API - 显示/隐藏
     */
    showSprite(sprite) {
        sprite.visible = true;
    }
    
    hideSprite(sprite) {
        sprite.visible = false;
    }
    
    /**
     * 精灵API - 改变大小
     */
    changeSizeSprite(sprite, change) {
        sprite.size += change;
        sprite.size = Math.max(1, Math.min(500, sprite.size));
        this.updateBoundingBox(sprite);
    }
    
    setSizeSprite(sprite, size) {
        sprite.size = Math.max(1, Math.min(500, size));
        this.updateBoundingBox(sprite);
    }
    
    /**
     * 精灵API - 改变造型
     */
    switchCostumeSprite(sprite, costume) {
        if (typeof costume === 'number') {
            sprite.currentCostume = costume % sprite.costumes.length;
        } else {
            const index = sprite.costumes.findIndex(c => c.name === costume);
            if (index >= 0) {
                sprite.currentCostume = index;
            }
        }
        this.updateBoundingBox(sprite);
    }
    
    nextCostumeSprite(sprite) {
        sprite.currentCostume = (sprite.currentCostume + 1) % sprite.costumes.length;
        this.updateBoundingBox(sprite);
    }
    
    /**
     * 精灵API - 特效
     */
    setEffectSprite(sprite, effect, value) {
        if (sprite.effects.hasOwnProperty(effect)) {
            sprite.effects[effect] = value;
        }
    }
    
    changeEffectSprite(sprite, effect, change) {
        if (sprite.effects.hasOwnProperty(effect)) {
            sprite.effects[effect] += change;
        }
    }
    
    clearEffectsSprite(sprite) {
        Object.keys(sprite.effects).forEach(effect => {
            sprite.effects[effect] = 0;
        });
    }
    
    /**
     * 碰撞检测
     */
    isTouchingSprite(sprite1, sprite2) {
        if (!sprite1.boundingBox || !sprite2.boundingBox) return false;
        
        return !(sprite1.boundingBox.right < sprite2.boundingBox.left ||
                 sprite1.boundingBox.left > sprite2.boundingBox.right ||
                 sprite1.boundingBox.bottom < sprite2.boundingBox.top ||
                 sprite1.boundingBox.top > sprite2.boundingBox.bottom);
    }
    
    isTouchingEdge(sprite) {
        if (!sprite.boundingBox) return false;
        
        return sprite.boundingBox.left < -this.width / 2 ||
               sprite.boundingBox.right > this.width / 2 ||
               sprite.boundingBox.top < -this.height / 2 ||
               sprite.boundingBox.bottom > this.height / 2;
    }
    
    /**
     * 获取鼠标位置（Scratch坐标系）
     */
    getMousePosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 转换为Scratch坐标系
        return {
            x: (x / rect.width) * this.width - this.width / 2,
            y: this.height / 2 - (y / rect.height) * this.height
        };
    }
    
    /**
     * 处理点击事件
     */
    handleClick(e) {
        const pos = this.getMousePosition(e);
        
        // 检查点击了哪个精灵
        for (let i = this.sprites.length - 1; i >= 0; i--) {
            const sprite = this.sprites[i];
            if (!sprite.visible) continue;
            
            const dx = pos.x - sprite.x;
            const dy = pos.y - sprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < sprite.size / 2) {
                // 触发精灵点击事件
                this.onSpriteClick?.(sprite);
                break;
            }
        }
    }
    
    /**
     * 处理鼠标移动
     */
    handleMouseMove(e) {
        this.mousePosition = this.getMousePosition(e);
    }
    
    /**
     * 处理键盘按下
     */
    handleKeyDown(e) {
        this.onKeyDown?.(e.key);
    }
    
    /**
     * 处理键盘释放
     */
    handleKeyUp(e) {
        this.onKeyUp?.(e.key);
    }
    
    /**
     * 清空舞台
     */
    clear() {
        this.sprites = [];
        this.backdrops = [];
        this.currentBackdrop = 0;
    }
    
    /**
     * 重置舞台
     */
    reset() {
        this.sprites.forEach(sprite => {
            sprite.x = 0;
            sprite.y = 0;
            sprite.direction = 90;
            sprite.size = 100;
            sprite.visible = true;
            sprite.currentCostume = 0;
            sprite.sayText = '';
            sprite.thinkText = '';
            this.clearEffectsSprite(sprite);
        });
    }
}

// 导出为全局变量
window.StageRenderer = StageRenderer;
