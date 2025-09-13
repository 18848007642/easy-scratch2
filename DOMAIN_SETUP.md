# 域名配置说明 - silkroadstar.cn

## 🌐 DNS配置步骤

### 方法1：使用CNAME记录（推荐）
在您的域名服务商DNS管理面板中添加：

```
类型: CNAME
主机记录: @  (或者 www)
记录值: 18848007642.github.io
TTL: 10分钟
```

如果要同时支持www访问：
```
类型: CNAME
主机记录: www
记录值: 18848007642.github.io
TTL: 10分钟
```

### 方法2：使用A记录
如果您的DNS服务商不支持根域名CNAME，使用以下A记录：

```
类型: A
主机记录: @
记录值: 185.199.108.153
TTL: 10分钟
```

```
类型: A
主机记录: @
记录值: 185.199.109.153
TTL: 10分钟
```

```
类型: A
主机记录: @
记录值: 185.199.110.153
TTL: 10分钟
```

```
类型: A
主机记录: @
记录值: 185.199.111.153
TTL: 10分钟
```

## ✅ GitHub Pages设置

1. 访问: https://github.com/18848007642/easy-scratch2/settings/pages
2. 在"Source"部分确认：
   - Source: Deploy from a branch
   - Branch: master
   - Folder: /docs
3. 在"Custom domain"部分：
   - 输入: silkroadstar.cn
   - 点击 Save
4. 等待DNS检查完成（可能需要几分钟到24小时）
5. 勾选"Enforce HTTPS"（DNS生效后）

## 🔍 验证步骤

### 1. 检查DNS是否生效
```bash
# Windows命令提示符或PowerShell
nslookup silkroadstar.cn

# 或使用ping
ping silkroadstar.cn
```

### 2. 检查CNAME文件
确保 `/docs/CNAME` 文件内容为：
```
silkroadstar.cn
```

### 3. 测试访问
DNS生效后，尝试访问以下链接：
- http://silkroadstar.cn
- https://silkroadstar.cn
- http://www.silkroadstar.cn (如果配置了www)

## ⚠️ 常见问题

### 问题1：显示404错误
**解决方案**：
- 确认DNS已经生效（可能需要等待几小时）
- 检查GitHub Pages设置是否正确
- 确认CNAME文件存在且内容正确

### 问题2：显示"GitHub Pages site here"
**解决方案**：
- 等待GitHub Pages部署完成（通常需要10分钟）
- 检查是否有构建错误

### 问题3：HTTPS不工作
**解决方案**：
- 等待DNS完全生效后再启用HTTPS
- 在GitHub Pages设置中勾选"Enforce HTTPS"

## 📞 技术支持

如果遇到问题，可以：
1. 查看GitHub Pages构建状态：https://github.com/18848007642/easy-scratch2/actions
2. 查看GitHub状态：https://www.githubstatus.com/
3. 联系域名服务商技术支持

## 🎉 成功标志

当您看到以下情况时，说明配置成功：
- 访问 https://silkroadstar.cn 能看到网站
- GitHub Pages设置显示绿色勾号 "✓ Your site is published at https://silkroadstar.cn"
- HTTPS证书自动生效

---

配置完成后，您的丝路智星编程平台将通过 silkroadstar.cn 域名访问！
