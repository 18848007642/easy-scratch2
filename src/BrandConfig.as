/*
 * 丝路智星品牌配置
 * SilkRoadStar Brand Configuration
 * Copyright (C) 2024 丝路智星
 */

package {

public class BrandConfig {
    
    // 品牌基本信息
    public static const BRAND_NAME_CN:String = "丝路智星";
    public static const BRAND_NAME_EN:String = "SilkRoadStar";
    public static const BRAND_SLOGAN:String = "编程启蒙，智创未来";
    public static const VERSION:String = "1.0.0";
    public static const BUILD_DATE:String = "2024.12";
    
    // 公司信息
    public static const COMPANY_NAME:String = "丝路智星科技";
    public static const COMPANY_WEBSITE:String = "https://silkroadstar.com";
    public static const SUPPORT_EMAIL:String = "support@silkroadstar.com";
    
    // 版权信息
    public static const COPYRIGHT:String = "© 2024 丝路智星科技 版权所有";
    public static const COPYRIGHT_EN:String = "© 2024 SilkRoadStar Technology. All rights reserved.";
    
    // 窗口标题
    public static function getWindowTitle():String {
        return BRAND_NAME_CN + " - " + BRAND_SLOGAN;
    }
    
    // 关于信息
    public static function getAboutText():String {
        return BRAND_NAME_CN + " " + VERSION + "\n" +
               "基于 Scratch 2.0 开源项目\n" +
               BRAND_SLOGAN + "\n\n" +
               COPYRIGHT;
    }
    
    // 积木分类自定义名称（可选）
    public static const BLOCK_CATEGORIES:Object = {
        "Motion": "运动",
        "Looks": "外观",
        "Sound": "声音",
        "Pen": "画笔",
        "Events": "事件",
        "Control": "控制",
        "Sensing": "侦测",
        "Operators": "运算",
        "Data": "数据",
        "More Blocks": "更多积木"
    };
    
    // 丝路智星特色功能
    public static const FEATURES:Array = [
        "AI 智能编程助手",
        "丝路文化主题素材库",
        "多语言支持（中文/英文/阿拉伯文）",
        "云端项目存储",
        "家长监控模式"
    ];
    
    // 主题配置
    public static const THEME:Object = {
        primaryColor: 0x1E5A8E,    // 主色：智慧蓝
        secondaryColor: 0xD4AF37,  // 辅色：丝路金
        accentColor: 0xFF6B35,     // 强调色：活力橙
        bgColor: 0xF5F5F5,         // 背景色：柔和灰
        textColor: 0x333333        // 文字色：深灰
    };
}

}
