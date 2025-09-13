# 丝路智星桌面快捷方式创建脚本

Write-Host "创建丝路智星桌面快捷方式..." -ForegroundColor Cyan

# 获取桌面路径
$desktop = [Environment]::GetFolderPath("Desktop")
$projectPath = Get-Location

# 创建主程序快捷方式
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$desktop\丝路智星编程平台.lnk")
$Shortcut.TargetPath = "$projectPath\flashplayer.exe"
$Shortcut.Arguments = "$projectPath\bin-debug\silkroadstar.swf"
$Shortcut.WorkingDirectory = $projectPath
$Shortcut.IconLocation = "$projectPath\assets\images\icon.ico"
$Shortcut.Description = "丝路智星 - 青少年编程教育平台"
$Shortcut.Save()

# 创建在线版快捷方式
$OnlineShortcut = $WshShell.CreateShortcut("$desktop\丝路智星在线版.url")
$OnlineShortcut.TargetPath = "https://18848007642.github.io/easy-scratch2/"
$OnlineShortcut.Save()

# 创建项目文件夹快捷方式
$FolderShortcut = $WshShell.CreateShortcut("$desktop\丝路智星项目文件夹.lnk")
$FolderShortcut.TargetPath = $projectPath
$FolderShortcut.IconLocation = "C:\Windows\System32\shell32.dll,3"
$FolderShortcut.Save()

Write-Host "✅ 桌面快捷方式创建完成！" -ForegroundColor Green
Write-Host "  - 丝路智星编程平台.lnk" -ForegroundColor Yellow
Write-Host "  - 丝路智星在线版.url" -ForegroundColor Yellow
Write-Host "  - 丝路智星项目文件夹.lnk" -ForegroundColor Yellow
