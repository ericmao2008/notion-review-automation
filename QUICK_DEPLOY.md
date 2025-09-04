# 🚀 快速部署指南 - ericmao2008

## 当前状态
✅ 项目代码已准备完成  
✅ Git仓库已初始化并提交  
✅ 远程仓库已配置  
🔄 需要完成以下步骤进行部署

---

## 第一步：创建 GitHub 仓库

### 1.1 在 GitHub 上创建新仓库

1. **访问创建页面**：
   ```
   https://github.com/new
   ```

2. **填写仓库信息**：
   - **Repository name**: `notion-review-automation`
   - **Description**: `Automated Notion review stage progression with GitHub Actions`
   - **Visibility**: **Private（强烈推荐）**
     - ✅ Private 仓库更安全，保护您的 Notion token
     - ✅ 与 Notion Organization 集成权限无关
     - ✅ 只有您和授权用户可以访问代码
   - **不要**勾选任何初始化选项（README、.gitignore、license）

3. **点击 "Create repository"**

### 1.2 推送代码

创建仓库后，运行推送脚本：

```bash
./push-to-github.sh
```

---

## 第二步：设置 Organization 级别的 Notion 集成

### 2.1 创建 Organization 集成

1. **访问集成管理**：
   ```
   https://www.notion.so/my-integrations
   ```

2. **确保在 Organization 级别**：
   - 页面顶部显示你的 Organization 名称
   - 如果显示个人工作区，请切换到 Organization

3. **创建新集成**：
   - 点击 "New integration"
   - 填写信息：
     ```
     Name: Review Automation
     Associated workspace: [你的 Organization 名称]
     Description: Automated review stage progression for spaced repetition learning
     ```

4. **配置权限**：
   - ✅ Read content
   - ✅ Update content

5. **获取 Token**：
   - 复制生成的 token（以 `secret_` 开头）
   - 保存到安全的地方

### 2.2 分享数据库给集成

1. **打开目标数据库**
2. **分享给集成**：
   - 点击右上角 "Share" 按钮
   - 点击 "Invite"
   - 搜索 "Review Automation"
   - 选择你的 Organization 集成
   - 给予 "Can edit" 权限

### 2.3 获取数据库 ID

1. **复制数据库 URL**
2. **提取数据库 ID**：
   - URL 格式：`https://www.notion.so/workspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
   - 数据库 ID 是 `notion.so/workspace/` 后面的32位字符串

---

## 第三步：配置 GitHub Secrets

### 3.1 进入仓库设置

访问：https://github.com/ericmao2008/notion-review-automation/settings/secrets/actions

### 3.2 添加 Secrets

点击 "New repository secret"，添加以下两个 secrets：

**Secret 1:**
```
Name: NOTION_TOKEN
Value: secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Secret 2:**
```
Name: NOTION_DATABASE_ID
Value: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 第四步：配置 Notion 数据库

### 4.1 验证数据库字段

确保数据库包含以下字段（名称必须完全匹配）：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Date` | Date | 首学日期，基准日期 |
| `Review Stage` | Select | 复习阶段：D1/D3/D7/D14/D30 |
| `#D1 Score` | Number | D1阶段分数 |
| `#D3 Score` | Number | D3阶段分数 |
| `#D7 Score` | Number | D7阶段分数 |
| `#D14 Score` | Number | D14阶段分数 |
| `Next Review Date` | Date | 下次复习日期（脚本写入） |
| `Calendar Date` | Date | 日历日期（脚本同步） |
| `Last Review Date` | Date | 最后复习日期（可选） |

### 4.2 创建 Calendar 视图

1. 在数据库页面点击 **Add a view** → **Calendar**
2. 给视图命名：`Review Calendar`
3. 在 **By date** 设置中选择 **Calendar Date** 作为主日期字段
4. 保存视图

---

## 第五步：测试部署

### 5.1 手动触发 GitHub Actions

1. **进入 Actions 页面**：
   ```
   https://github.com/ericmao2008/notion-review-automation/actions
   ```

2. **手动触发工作流**：
   - 选择 "Notion Review Automation" 工作流
   - 点击 "Run workflow"
   - 选择 "main" 分支
   - 在 "Reason for manual run" 中输入：`Initial deployment test`
   - 点击 "Run workflow"

### 5.2 检查运行结果

应该看到类似以下的输出：
```
🚀 Starting Notion Review Automation...
📅 Timezone: Australia/Brisbane
⏰ Default hour: 9:00

📊 Summary:
   Total pages processed: X
   Pages updated: Y
   Pages skipped: Z
   Errors: 0

✅ Automation completed successfully!
```

### 5.3 验证 Notion 数据库

1. 检查数据库中的页面是否被正确处理
2. 新页面应该自动初始化为 D1 阶段
3. 分数 ≥ 70 的页面应该推进到下一阶段
4. Calendar 视图应该显示正确的复习日期

---

## 快速命令参考

### 推送代码到 GitHub
```bash
./push-to-github.sh
```

### 本地测试（需要 .env 文件）
```bash
# 复制配置模板
cp config.example .env

# 编辑 .env 文件，填入实际的 token 和数据库 ID
# 然后运行
npm run dev
```

### 查看项目文档
```bash
cat ORGANIZATION_SETUP.md    # Organization 集成快速设置
cat DEPLOYMENT.md            # 完整部署指南
cat README.md                # 项目总览
```

---

## 部署完成检查清单

- [ ] GitHub 仓库已创建：https://github.com/ericmao2008/notion-review-automation
- [ ] 代码已推送到 GitHub
- [ ] Organization 级别的 Notion 集成已创建
- [ ] 集成 token 已获取并保存
- [ ] 数据库已分享给 Organization 集成
- [ ] GitHub Secrets 已配置（NOTION_TOKEN, NOTION_DATABASE_ID）
- [ ] 数据库字段名称正确匹配
- [ ] Calendar 视图已创建并选择 Calendar Date 字段
- [ ] 手动触发 GitHub Actions 测试成功
- [ ] 验证 Notion 数据库中的数据处理正确

---

## 相关链接

- **GitHub 仓库**: https://github.com/ericmao2008/notion-review-automation
- **GitHub Actions**: https://github.com/ericmao2008/notion-review-automation/actions
- **仓库设置**: https://github.com/ericmao2008/notion-review-automation/settings
- **Secrets 配置**: https://github.com/ericmao2008/notion-review-automation/settings/secrets/actions
- **Notion 集成**: https://www.notion.so/my-integrations

---

## 故障排除

如果遇到问题，请：

1. **检查 GitHub Actions 日志**：查看详细的错误信息
2. **验证 Notion 集成权限**：确保集成有数据库的编辑权限
3. **检查字段名称**：确保数据库字段名与脚本中的完全匹配
4. **查看详细文档**：参考 `DEPLOYMENT.md` 和 `ORGANIZATION_SETUP.md`

🎉 **部署完成后，您的 Notion 自动化系统将每天自动运行，推进复习阶段！**
