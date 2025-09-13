/*
 * 丝路智星教育功能模块
 * Education Module for SilkRoadStar
 * Copyright (C) 2024 丝路智星科技
 */

package education {
    
import flash.events.EventDispatcher;
import flash.utils.Dictionary;
import by.blooddy.crypto.serialization.JSON;

public class EducationModule extends EventDispatcher {
    
    // 单例模式
    private static var _instance:EducationModule;
    
    // 学习进度数据
    private var progressData:Dictionary;
    
    // 课程数据
    private var courseData:Object;
    
    // 用户数据
    private var userData:Object;
    
    // 成就系统
    private var achievements:Array;
    
    public function EducationModule() {
        if (_instance) {
            throw new Error("EducationModule 是单例类，请使用 getInstance()");
        }
        initialize();
    }
    
    public static function getInstance():EducationModule {
        if (!_instance) {
            _instance = new EducationModule();
        }
        return _instance;
    }
    
    private function initialize():void {
        progressData = new Dictionary();
        achievements = [];
        
        // 初始化用户数据
        userData = {
            userId: "",
            userName: "小创客",
            level: 1,
            exp: 0,
            totalProjects: 0,
            completedCourses: [],
            badges: []
        };
        
        // 初始化课程结构
        courseData = {
            currentCourse: null,
            currentLesson: null,
            courseHistory: []
        };
    }
    
    // ==================== 学习进度管理 ====================
    
    /**
     * 保存项目进度
     */
    public function saveProgress(projectId:String, data:Object):void {
        progressData[projectId] = {
            timestamp: new Date().time,
            progress: data.progress || 0,
            code: data.code || "",
            status: data.status || "in_progress"
        };
        
        // 触发进度保存事件
        dispatchEvent(new EducationEvent(EducationEvent.PROGRESS_SAVED, projectId));
    }
    
    /**
     * 获取项目进度
     */
    public function getProgress(projectId:String):Object {
        return progressData[projectId] || null;
    }
    
    /**
     * 完成项目
     */
    public function completeProject(projectId:String, score:Number = 100):void {
        var progress:Object = progressData[projectId] || {};
        progress.status = "completed";
        progress.score = score;
        progress.completedTime = new Date().time;
        progressData[projectId] = progress;
        
        // 更新用户数据
        userData.totalProjects++;
        userData.exp += calculateExp(score);
        
        // 检查是否升级
        checkLevelUp();
        
        // 检查成就
        checkAchievements(projectId, score);
        
        dispatchEvent(new EducationEvent(EducationEvent.PROJECT_COMPLETED, projectId));
    }
    
    // ==================== 课程管理 ====================
    
    /**
     * 开始新课程
     */
    public function startCourse(courseId:String):void {
        courseData.currentCourse = courseId;
        courseData.startTime = new Date().time;
        
        dispatchEvent(new EducationEvent(EducationEvent.COURSE_STARTED, courseId));
    }
    
    /**
     * 完成课程
     */
    public function completeCourse(courseId:String):void {
        if (userData.completedCourses.indexOf(courseId) == -1) {
            userData.completedCourses.push(courseId);
        }
        
        courseData.courseHistory.push({
            courseId: courseId,
            completedTime: new Date().time,
            duration: new Date().time - courseData.startTime
        });
        
        // 奖励经验值
        userData.exp += 500;
        checkLevelUp();
        
        dispatchEvent(new EducationEvent(EducationEvent.COURSE_COMPLETED, courseId));
    }
    
    /**
     * 获取下一个推荐课程
     */
    public function getNextCourse():String {
        // 基于用户等级和已完成课程推荐
        var level:int = userData.level;
        
        if (level <= 2) return "L1-0" + (userData.completedCourses.length + 1);
        if (level <= 5) return "L2-0" + ((userData.completedCourses.length % 4) + 1);
        if (level <= 8) return "L3-0" + ((userData.completedCourses.length % 4) + 1);
        
        return "L4-0" + ((userData.completedCourses.length % 4) + 1);
    }
    
    // ==================== 成就系统 ====================
    
    /**
     * 检查成就解锁
     */
    private function checkAchievements(projectId:String, score:Number):void {
        // 首个项目成就
        if (userData.totalProjects == 1) {
            unlockAchievement("first_project", "初露锋芒", "完成第一个项目");
        }
        
        // 完美分数成就
        if (score == 100) {
            unlockAchievement("perfect_score", "完美主义", "获得满分评价");
        }
        
        // 项目数量成就
        if (userData.totalProjects == 10) {
            unlockAchievement("10_projects", "小有成就", "完成10个项目");
        }
        
        if (userData.totalProjects == 50) {
            unlockAchievement("50_projects", "编程达人", "完成50个项目");
        }
        
        if (userData.totalProjects == 100) {
            unlockAchievement("100_projects", "编程大师", "完成100个项目");
        }
    }
    
    /**
     * 解锁成就
     */
    private function unlockAchievement(id:String, name:String, description:String):void {
        var achievement:Object = {
            id: id,
            name: name,
            description: description,
            unlockedTime: new Date().time
        };
        
        achievements.push(achievement);
        userData.badges.push(id);
        
        dispatchEvent(new EducationEvent(EducationEvent.ACHIEVEMENT_UNLOCKED, achievement));
    }
    
    // ==================== 等级系统 ====================
    
    /**
     * 计算获得的经验值
     */
    private function calculateExp(score:Number):Number {
        return Math.floor(score * 10 * (1 + userData.level * 0.1));
    }
    
    /**
     * 检查是否升级
     */
    private function checkLevelUp():void {
        var requiredExp:Number = getRequiredExp(userData.level);
        
        while (userData.exp >= requiredExp) {
            userData.exp -= requiredExp;
            userData.level++;
            
            dispatchEvent(new EducationEvent(EducationEvent.LEVEL_UP, {
                newLevel: userData.level,
                rewards: getLevelRewards(userData.level)
            }));
            
            requiredExp = getRequiredExp(userData.level);
        }
    }
    
    /**
     * 获取升级所需经验值
     */
    private function getRequiredExp(level:int):Number {
        return 1000 * level * (1 + level * 0.5);
    }
    
    /**
     * 获取等级奖励
     */
    private function getLevelRewards(level:int):Array {
        var rewards:Array = [];
        
        // 每5级解锁新功能
        if (level % 5 == 0) {
            rewards.push({
                type: "feature",
                name: "新功能解锁",
                description: "解锁高级积木块"
            });
        }
        
        // 每10级获得称号
        if (level % 10 == 0) {
            rewards.push({
                type: "title",
                name: getTitleByLevel(level),
                description: "获得新称号"
            });
        }
        
        return rewards;
    }
    
    /**
     * 根据等级获取称号
     */
    private function getTitleByLevel(level:int):String {
        if (level < 10) return "编程新手";
        if (level < 20) return "编程学徒";
        if (level < 30) return "编程达人";
        if (level < 40) return "编程专家";
        if (level < 50) return "编程大师";
        return "编程宗师";
    }
    
    // ==================== 数据导出 ====================
    
    /**
     * 导出学习报告
     */
    public function exportReport():Object {
        return {
            user: userData,
            progress: dictionaryToObject(progressData),
            courses: courseData,
            achievements: achievements,
            statistics: {
                totalTime: calculateTotalTime(),
                averageScore: calculateAverageScore(),
                completionRate: calculateCompletionRate()
            }
        };
    }
    
    /**
     * 计算总学习时间
     */
    private function calculateTotalTime():Number {
        var total:Number = 0;
        for each (var course:Object in courseData.courseHistory) {
            total += course.duration;
        }
        return total;
    }
    
    /**
     * 计算平均分数
     */
    private function calculateAverageScore():Number {
        var total:Number = 0;
        var count:int = 0;
        
        for each (var progress:Object in progressData) {
            if (progress.score) {
                total += progress.score;
                count++;
            }
        }
        
        return count > 0 ? total / count : 0;
    }
    
    /**
     * 计算完成率
     */
    private function calculateCompletionRate():Number {
        var completed:int = 0;
        var total:int = 0;
        
        for each (var progress:Object in progressData) {
            total++;
            if (progress.status == "completed") {
                completed++;
            }
        }
        
        return total > 0 ? (completed / total) * 100 : 0;
    }
    
    /**
     * Dictionary转Object
     */
    private function dictionaryToObject(dict:Dictionary):Object {
        var obj:Object = {};
        for (var key:* in dict) {
            obj[key] = dict[key];
        }
        return obj;
    }
    
    // ==================== Getters ====================
    
    public function get currentLevel():int {
        return userData.level;
    }
    
    public function get currentExp():Number {
        return userData.exp;
    }
    
    public function get totalProjects():int {
        return userData.totalProjects;
    }
    
    public function get userBadges():Array {
        return userData.badges;
    }
}

}

// 教育事件类
package education {
    
import flash.events.Event;

public class EducationEvent extends Event {
    
    public static const PROGRESS_SAVED:String = "progressSaved";
    public static const PROJECT_COMPLETED:String = "projectCompleted";
    public static const COURSE_STARTED:String = "courseStarted";
    public static const COURSE_COMPLETED:String = "courseCompleted";
    public static const ACHIEVEMENT_UNLOCKED:String = "achievementUnlocked";
    public static const LEVEL_UP:String = "levelUp";
    
    public var data:*;
    
    public function EducationEvent(type:String, data:* = null) {
        super(type);
        this.data = data;
    }
    
    override public function clone():Event {
        return new EducationEvent(type, data);
    }
}

}
