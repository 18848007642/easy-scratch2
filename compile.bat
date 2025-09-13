@echo off
echo ========================================
echo    丝路智星 - 项目编译脚本
echo ========================================
echo.

REM 检查 Flex SDK 环境
if not defined FLEX_HOME (
    echo [!] 未找到 FLEX_HOME 环境变量
    echo.
    echo 正在尝试使用本地 Flex SDK...
    if exist "flex-sdk" (
        set FLEX_HOME=%cd%\flex-sdk
        echo [✓] 找到本地 Flex SDK
    ) else (
        echo [X] 未找到 Flex SDK
        echo.
        echo 请先下载 Flex SDK：
        echo 1. 访问 https://flex.apache.org/download-archive.html
        echo 2. 下载 Apache Flex SDK 4.6.0
        echo 3. 解压到当前目录的 flex-sdk 文件夹
        echo.
        pause
        exit /b 1
    )
)

echo [*] FLEX_HOME: %FLEX_HOME%
echo.

REM 创建输出目录
if not exist "bin-debug" (
    echo [*] 创建 bin-debug 目录...
    mkdir bin-debug
)

REM 复制资源文件
echo [*] 复制资源文件...
if exist "html-template" (
    xcopy /E /Y /Q "html-template\*" "bin-debug\" >nul 2>&1
)

REM 编译主程序
echo [*] 开始编译丝路智星...
echo.

set MXMLC=%FLEX_HOME%\bin\mxmlc.bat
if not exist "%MXMLC%" (
    set MXMLC=%FLEX_HOME%\bin\mxmlc
)

REM 编译命令
"%MXMLC%" ^
    -load-config+=build.xml ^
    -source-path+=src ^
    -library-path+=libs ^
    -static-link-runtime-shared-libraries=true ^
    -target-player=11.6 ^
    -swf-version=19 ^
    -default-size 800 600 ^
    -default-background-color=0xFFFFFF ^
    -define=SCRATCH::allow3d,true ^
    -define=SCRATCH::revision,"'SilkRoadStar-1.0.0'" ^
    -output=bin-debug/silkroadstar.swf ^
    src/Scratch.as

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [✓] 编译成功！
    echo.
    echo 输出文件：
    echo - bin-debug\silkroadstar.swf
    echo.
    echo 您可以：
    echo 1. 使用 Flash Player 打开 SWF 文件
    echo 2. 在浏览器中打开 silkroadstar.html
    echo 3. 运行 run.bat 快速启动
    echo.
) else (
    echo.
    echo [X] 编译失败！
    echo.
    echo 可能的原因：
    echo 1. Flex SDK 未正确安装
    echo 2. 源代码有语法错误
    echo 3. 缺少必要的库文件
    echo.
    echo 请检查错误信息并重试。
)

pause
