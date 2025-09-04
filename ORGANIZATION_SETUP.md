# 🏢 Organization 集成快速设置指南

## 为什么选择 Organization 集成？

- ✅ **统一管理**: 整个团队使用同一个集成，便于管理
- ✅ **权限控制**: 通过 Organization 级别统一控制访问权限
- ✅ **安全可靠**: 集成 token 由管理员统一管理，更安全
- ✅ **团队协作**: 团队成员可以共享使用，无需各自创建集成
- ✅ **部署简单**: 一次设置，全团队受益

---

## 快速设置步骤

### 1. 创建 Organization 集成

1. **访问集成管理页面**
   ```
   https://www.notion.so/my-integrations
   ```

2. **确保在 Organization 级别**
   - 页面顶部应该显示你的 Organization 名称
   - 如果显示个人工作区，请切换到 Organization

3. **创建新集成**
   - 点击 "New integration"
   - 填写信息：
     ```
     Name: Review Automation
     Associated workspace: [你的 Organization 名称]
     Description: Automated review stage progression for spaced repetition learning
     ```

4. **配置权限**
   - ✅ Read content
   - ✅ Update content
   - ❌ Insert content (通常不需要)
   - ❌ User information (根据需要选择)

5. **获取 Token**
   - 复制生成的 token（以 `secret_` 开头）
   - 保存到安全的地方

### 2. 分享数据库给集成

1. **打开目标数据库**
   - 进入你要自动化的 Notion 数据库

2. **分享给集成**
   - 点击右上角 "Share" 按钮
   - 点击 "Invite"
   - 搜索 "Review Automation"
   - 选择你的 Organization 集成
   - 给予 "Can edit" 权限
   - 点击 "Invite"

### 3. 获取数据库 ID

1. **复制数据库 URL**
   - 从浏览器地址栏复制数据库 URL

2. **提取数据库 ID**
   - URL 格式：`https://www.notion.so/workspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
   - 数据库 ID 是 `notion.so/workspace/` 后面的32位字符串
   - 例如：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. 配置 GitHub Secrets

1. **进入 GitHub 仓库设置**
   - 进入你的 GitHub 仓库
   - 点击 "Settings" 标签

2. **添加 Secrets**
   - 左侧菜单：Secrets and variables → Actions
   - 点击 "New repository secret"
   - 添加两个 secrets：

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

## Organization 集成的特殊优势

### 团队协作
- 👥 **共享使用**: 团队成员无需各自创建集成
- 🔄 **统一管理**: 管理员统一管理集成权限
- 📊 **数据隔离**: 通过数据库分享权限控制访问范围

### 安全控制
- 🔐 **集中管理**: 集成 token 由管理员统一管理
- 📋 **权限审查**: 可以统一审查和调整集成权限
- 🔄 **Token 轮换**: 需要时可以统一更新 token

### 部署便利
- 🚀 **一次设置**: 设置一次，全团队受益
- 📈 **扩展容易**: 新增数据库只需分享给现有集成
- 🛠️ **维护简单**: 统一的集成管理，维护更简单

---

## 多数据库支持

如果你的 Organization 有多个学习数据库：

### 方案一：共享集成（推荐）
- 使用同一个 Organization 集成
- 将所有数据库分享给该集成
- 为每个数据库配置相同的字段结构
- 在 GitHub Actions 中配置多个数据库 ID

### 方案二：专用集成
- 为每个数据库创建专用集成
- 在 GitHub Actions 中配置多个 token
- 更细粒度的权限控制

---

## 故障排除

### 常见问题

1. **无法创建 Organization 集成**
   - 确认你有 Organization 管理员权限
   - 检查是否在正确的 Organization 工作区

2. **集成无法访问数据库**
   - 确认数据库已分享给 Organization 集成
   - 检查集成的权限设置

3. **团队成员无法使用**
   - 确认集成是在 Organization 级别创建的
   - 检查数据库的分享权限设置

### 权限检查清单

- [ ] 你是 Organization 管理员或有创建集成的权限
- [ ] 集成是在 Organization 级别创建的
- [ ] 集成有 "Read content" 和 "Update content" 权限
- [ ] 数据库已分享给 Organization 集成
- [ ] 数据库的分享权限设置为 "Can edit"
- [ ] GitHub Secrets 已正确配置

---

## 最佳实践

### 安全建议
1. **最小权限原则**: 只给集成必要的权限
2. **定期审查**: 定期检查集成的访问权限
3. **Token 保护**: 妥善保管集成 token，不要泄露

### 团队协作
1. **统一标准**: 团队使用统一的数据库字段结构
2. **文档共享**: 共享部署文档和配置说明
3. **权限管理**: 明确谁可以管理集成和数据库权限

### 监控维护
1. **日志监控**: 定期检查 GitHub Actions 的执行日志
2. **错误处理**: 及时处理自动化过程中的错误
3. **性能优化**: 根据使用情况调整自动化频率

---

## 下一步

完成 Organization 集成设置后，请：

1. 📖 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解完整部署流程
2. 🚀 运行 `./deploy.sh YOUR_GITHUB_USERNAME` 开始部署
3. 🧪 测试自动化功能是否正常工作
4. 📊 监控 GitHub Actions 的执行情况

🎉 **Organization 集成设置完成！**
