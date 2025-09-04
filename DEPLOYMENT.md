# 🚀 部署指南

## 当前状态
✅ 项目代码已准备完成  
✅ Git仓库已初始化并提交  
🔄 需要完成以下步骤进行部署

---

## 第二步：创建 GitHub 仓库

### 2.1 在 GitHub 上创建新仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `notion-review-automation`
   - **Description**: `Automated Notion review stage progression with GitHub Actions`
   - **Visibility**: Private（推荐）或 Public
   - **不要**勾选 "Add a README file"（我们已经有了）
3. 点击 "Create repository"

### 2.2 推送代码到 GitHub

在终端中运行以下命令（替换 `YOUR_USERNAME` 为你的GitHub用户名）：

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/notion-review-automation.git

# 推送代码
git branch -M main
git push -u origin main
```

---

## 第三步：配置 GitHub Secrets

### 3.1 获取 Notion 数据库 ID

1. 打开你的 Notion 数据库
2. 复制浏览器地址栏中的 URL
3. 数据库 ID 是 URL 中 `notion.so/` 后面、`?` 前面的32位字符串
   - 例如：`https://www.notion.so/workspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
   - 数据库 ID 就是：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 3.2 在 GitHub 中设置 Secrets

1. 进入你的 GitHub 仓库
2. 点击 **Settings** 标签
3. 在左侧菜单中点击 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**
5. 添加以下两个 secrets：

**Secret 1:**
- **Name**: `NOTION_TOKEN`
- **Value**: 你的 Notion 集成 token（以 `secret_` 开头）

**Secret 2:**
- **Name**: `NOTION_DATABASE_ID`
- **Value**: 你的 Notion 数据库 ID（32位字符串）

---

## 第四步：配置 Notion 数据库

### 4.1 分享数据库给集成

1. 打开你的 Notion 数据库
2. 点击右上角的 **Share** 按钮
3. 点击 **Invite**
4. 搜索你的集成名称：`Review Automation`
5. 选择集成并给予 **Can edit** 权限
6. 点击 **Invite**

### 4.2 验证数据库字段

确保你的数据库包含以下字段（名称必须完全匹配）：

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

### 4.3 创建 Calendar 视图

1. 在数据库页面点击 **Add a view** → **Calendar**
2. 给视图命名：`Review Calendar`
3. 在 **By date** 设置中选择 **Calendar Date** 作为主日期字段
4. 保存视图

---

## 第五步：测试部署

### 5.1 手动触发 GitHub Actions

1. 进入你的 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择 **Notion Review Automation** 工作流
4. 点击 **Run workflow**
5. 选择 **main** 分支
6. 在 **Reason for manual run** 中输入：`Initial deployment test`
7. 点击 **Run workflow**

### 5.2 检查运行结果

1. 点击运行的工作流查看日志
2. 应该看到类似以下的输出：
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

## 第六步：设置定时执行

### 6.1 验证定时设置

GitHub Actions 已配置为每天澳大利亚布里斯班时间 09:00 自动运行（UTC 23:00）。

### 6.2 监控执行

- 每天检查 Actions 页面确保工作流正常运行
- 如有错误，查看日志并排查问题

---

## 故障排除

### 常见问题

1. **权限错误**
   - 确保集成有数据库的编辑权限
   - 检查 NOTION_TOKEN 是否正确

2. **字段名错误**
   - 检查数据库字段名是否与脚本中的完全匹配
   - 注意大小写和特殊字符

3. **GitHub Actions 失败**
   - 检查 Secrets 是否正确设置
   - 查看 Actions 日志了解具体错误

4. **Calendar 视图不显示**
   - 确保 Calendar 视图的 "By date" 设置选择了 `Calendar Date` 字段

### 获取帮助

如果遇到问题，请：
1. 查看 GitHub Actions 的详细日志
2. 检查 Notion 数据库的字段设置
3. 确认集成权限配置
4. 参考 README.md 中的故障排除部分

---

## 部署完成检查清单

- [ ] GitHub 仓库已创建并推送代码
- [ ] GitHub Secrets 已配置（NOTION_TOKEN, NOTION_DATABASE_ID）
- [ ] Notion 集成已创建并获取 token
- [ ] 数据库已分享给集成并设置权限
- [ ] 数据库字段名称正确匹配
- [ ] Calendar 视图已创建并选择 Calendar Date 字段
- [ ] 手动触发 GitHub Actions 测试成功
- [ ] 验证 Notion 数据库中的数据处理正确

🎉 **恭喜！部署完成！**
