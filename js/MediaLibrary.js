/**
 * 丝路智星 - 媒体素材库管理器
 * 负责加载和管理Scratch素材库（精灵、造型、背景、声音）
 */

class MediaLibrary {
    constructor() {
        this.libraries = {
            sprites: null,
            costumes: null,
            backdrops: null,
            sounds: null
        };
        
        this.libraryPaths = {
            // Scratch 2 素材库
            sprites2: 'assets/libraries/spriteLibrary.json',
            costumes2: 'assets/libraries/costumeLibrary.json',
            backdrops2: 'assets/libraries/backdropLibrary.json',
            sounds2: 'assets/libraries/soundLibrary.json',
            
            // Scratch 3 素材库
            sprites3: 'assets/libraries/sprites.json',
            costumes3: 'assets/libraries/costumes.json',
            backdrops3: 'assets/libraries/backdrops.json',
            sounds3: 'assets/libraries/sounds.json'
        };
        
        this.thumbnailPath = 'assets/thumbnails/';
        this.cdnBaseUrl = 'https://cdn.assets.scratch.mit.edu/internalapi/asset/';
        this.scratch3CdnUrl = 'https://cdn.assets.scratch.mit.edu/';
        
        this.loaded = false;
        this.version = 2; // 默认使用Scratch 2素材
    }
    
    /**
     * 初始化媒体库
     */
    async init(version = 2) {
        this.version = version;
        console.log(`初始化Scratch ${version}素材库...`);
        
        try {
            await this.loadLibraries();
            this.loaded = true;
            console.log('素材库加载完成！');
            return true;
        } catch (error) {
            console.error('素材库加载失败：', error);
            return false;
        }
    }
    
    /**
     * 加载所有素材库
     */
    async loadLibraries() {
        const suffix = this.version === 3 ? '3' : '2';
        
        const loadPromises = [
            this.loadLibrary('sprites', this.libraryPaths[`sprites${suffix}`]),
            this.loadLibrary('costumes', this.libraryPaths[`costumes${suffix}`]),
            this.loadLibrary('backdrops', this.libraryPaths[`backdrops${suffix}`]),
            this.loadLibrary('sounds', this.libraryPaths[`sounds${suffix}`])
        ];
        
        await Promise.all(loadPromises);
    }
    
    /**
     * 加载单个素材库
     */
    async loadLibrary(type, path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load ${type} library`);
            }
            
            const data = await response.json();
            this.libraries[type] = this.processLibraryData(type, data);
            console.log(`${type}库加载成功，共${this.libraries[type].length}个素材`);
        } catch (error) {
            console.error(`加载${type}库失败：`, error);
            // 使用空数组作为后备
            this.libraries[type] = [];
        }
    }
    
    /**
     * 处理素材库数据
     */
    processLibraryData(type, data) {
        if (this.version === 2) {
            // Scratch 2 格式
            return Array.isArray(data) ? data : [];
        } else {
            // Scratch 3 格式
            return Array.isArray(data) ? data.map(item => this.convertScratch3Item(type, item)) : [];
        }
    }
    
    /**
     * 转换Scratch 3素材格式
     */
    convertScratch3Item(type, item) {
        const converted = {
            name: item.name || 'Unnamed',
            md5: item.md5ext || item.md5,
            type: type,
            tags: item.tags || [],
            info: item.info || []
        };
        
        if (type === 'sprites') {
            converted.json = item.json;
            converted.costumes = item.costumes || [];
            converted.sounds = item.sounds || [];
        }
        
        if (type === 'sounds') {
            converted.duration = item.duration;
            converted.format = item.format || 'wav';
            converted.rate = item.rate;
            converted.sampleCount = item.sampleCount;
        }
        
        if (type === 'costumes' || type === 'backdrops') {
            converted.width = item.width || item.info?.[0];
            converted.height = item.height || item.info?.[1];
            converted.format = item.dataFormat || 'png';
            converted.rotationCenterX = item.rotationCenterX || item.info?.[2];
            converted.rotationCenterY = item.rotationCenterY || item.info?.[3];
        }
        
        return converted;
    }
    
    /**
     * 获取精灵列表
     */
    getSprites() {
        return this.libraries.sprites || [];
    }
    
    /**
     * 获取造型列表
     */
    getCostumes() {
        return this.libraries.costumes || [];
    }
    
    /**
     * 获取背景列表
     */
    getBackdrops() {
        return this.libraries.backdrops || [];
    }
    
    /**
     * 获取声音列表
     */
    getSounds() {
        return this.libraries.sounds || [];
    }
    
    /**
     * 搜索素材
     */
    searchAssets(query, type = 'all') {
        const results = [];
        const searchQuery = query.toLowerCase();
        
        const searchInLibrary = (library, libraryType) => {
            if (!library) return;
            
            library.forEach(item => {
                if (item.name && item.name.toLowerCase().includes(searchQuery)) {
                    results.push({
                        ...item,
                        type: libraryType
                    });
                }
                
                // 搜索标签
                if (item.tags && Array.isArray(item.tags)) {
                    const hasMatchingTag = item.tags.some(tag => 
                        tag.toLowerCase().includes(searchQuery)
                    );
                    if (hasMatchingTag) {
                        results.push({
                            ...item,
                            type: libraryType
                        });
                    }
                }
            });
        };
        
        if (type === 'all' || type === 'sprites') {
            searchInLibrary(this.libraries.sprites, 'sprite');
        }
        if (type === 'all' || type === 'costumes') {
            searchInLibrary(this.libraries.costumes, 'costume');
        }
        if (type === 'all' || type === 'backdrops') {
            searchInLibrary(this.libraries.backdrops, 'backdrop');
        }
        if (type === 'all' || type === 'sounds') {
            searchInLibrary(this.libraries.sounds, 'sound');
        }
        
        // 去重
        const uniqueResults = [];
        const seen = new Set();
        results.forEach(item => {
            const key = `${item.type}-${item.md5}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueResults.push(item);
            }
        });
        
        return uniqueResults;
    }
    
    /**
     * 获取素材的URL
     */
    getAssetUrl(md5, type = 'image') {
        if (this.version === 2) {
            // Scratch 2 URL格式
            return `${this.cdnBaseUrl}${md5}`;
        } else {
            // Scratch 3 URL格式
            return `${this.scratch3CdnUrl}${md5}`;
        }
    }
    
    /**
     * 获取缩略图URL
     */
    getThumbnailUrl(md5) {
        // 尝试本地缩略图
        const localThumb = `${this.thumbnailPath}${md5}`;
        // 如果本地没有，使用CDN
        return localThumb;
    }
    
    /**
     * 按标签获取素材
     */
    getAssetsByTag(tag, type = 'all') {
        const results = [];
        
        const filterByTag = (library, libraryType) => {
            if (!library) return;
            
            library.forEach(item => {
                if (item.tags && item.tags.includes(tag)) {
                    results.push({
                        ...item,
                        type: libraryType
                    });
                }
            });
        };
        
        if (type === 'all' || type === 'sprites') {
            filterByTag(this.libraries.sprites, 'sprite');
        }
        if (type === 'all' || type === 'costumes') {
            filterByTag(this.libraries.costumes, 'costume');
        }
        if (type === 'all' || type === 'backdrops') {
            filterByTag(this.libraries.backdrops, 'backdrop');
        }
        if (type === 'all' || type === 'sounds') {
            filterByTag(this.libraries.sounds, 'sound');
        }
        
        return results;
    }
    
    /**
     * 获取所有标签
     */
    getAllTags() {
        const tags = new Set();
        
        Object.values(this.libraries).forEach(library => {
            if (!library) return;
            
            library.forEach(item => {
                if (item.tags && Array.isArray(item.tags)) {
                    item.tags.forEach(tag => tags.add(tag));
                }
            });
        });
        
        return Array.from(tags).sort();
    }
    
    /**
     * 创建素材选择器UI
     */
    createAssetPicker(container, options = {}) {
        const {
            type = 'all',
            onSelect = null,
            showSearch = true,
            showTags = true
        } = options;
        
        // 创建UI元素
        const picker = document.createElement('div');
        picker.className = 'media-picker';
        
        // 搜索栏
        if (showSearch) {
            const searchBar = document.createElement('div');
            searchBar.className = 'search-bar';
            searchBar.innerHTML = `
                <input type="text" placeholder="搜索素材..." class="search-input">
                <button class="search-btn">搜索</button>
            `;
            picker.appendChild(searchBar);
        }
        
        // 标签过滤
        if (showTags) {
            const tagFilter = document.createElement('div');
            tagFilter.className = 'tag-filter';
            const tags = this.getAllTags();
            tags.forEach(tag => {
                const tagBtn = document.createElement('button');
                tagBtn.className = 'tag-btn';
                tagBtn.textContent = tag;
                tagBtn.onclick = () => this.filterByTag(tag, type);
                tagFilter.appendChild(tagBtn);
            });
            picker.appendChild(tagFilter);
        }
        
        // 素材网格
        const grid = document.createElement('div');
        grid.className = 'asset-grid';
        picker.appendChild(grid);
        
        // 显示素材
        this.displayAssets(grid, type, onSelect);
        
        container.appendChild(picker);
        
        return picker;
    }
    
    /**
     * 显示素材
     */
    displayAssets(container, type, onSelect) {
        container.innerHTML = '';
        
        let assets = [];
        if (type === 'all' || type === 'sprites') {
            assets = assets.concat(this.getSprites().map(a => ({...a, type: 'sprite'})));
        }
        if (type === 'all' || type === 'costumes') {
            assets = assets.concat(this.getCostumes().map(a => ({...a, type: 'costume'})));
        }
        if (type === 'all' || type === 'backdrops') {
            assets = assets.concat(this.getBackdrops().map(a => ({...a, type: 'backdrop'})));
        }
        if (type === 'all' || type === 'sounds') {
            assets = assets.concat(this.getSounds().map(a => ({...a, type: 'sound'})));
        }
        
        assets.forEach(asset => {
            const item = document.createElement('div');
            item.className = 'asset-item';
            
            // 缩略图或图标
            const thumb = document.createElement('div');
            thumb.className = 'asset-thumb';
            
            if (asset.type === 'sound') {
                thumb.innerHTML = '🎵';
            } else {
                const img = document.createElement('img');
                img.src = this.getThumbnailUrl(asset.md5);
                img.onerror = () => {
                    img.src = this.getAssetUrl(asset.md5);
                };
                thumb.appendChild(img);
            }
            
            item.appendChild(thumb);
            
            // 名称
            const name = document.createElement('div');
            name.className = 'asset-name';
            name.textContent = asset.name;
            item.appendChild(name);
            
            // 点击事件
            item.onclick = () => {
                if (onSelect) {
                    onSelect(asset);
                }
            };
            
            container.appendChild(item);
        });
    }
}

// 导出为全局变量
window.MediaLibrary = MediaLibrary;
