@echo off
echo ========================================
echo     Scratch 2.0 启动器
echo ========================================
echo.

if exist "bin-debug\scratch2.swf" (
    echo [✓] 找到编译文件 bin-debug\scratch2.swf
    echo [*] 正在启动 Scratch 2.0...
    start flashplayer.exe "bin-debug\scratch2.swf"
) else (
    echo [X] 未找到编译文件！
    echo.
    echo 项目需要先编译才能运行。
    echo.
    echo 请按以下步骤操作：
    echo 1. 安装 Adobe Flex SDK 4.6
    echo 2. 运行编译命令
    echo.
    pause
)
