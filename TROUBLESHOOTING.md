# 🔧 故障排除指南

## 问题：Notion 文件字段没有更新

### 可能的原因和解决方案

#### 1. 环境变量问题

**症状**：脚本运行但显示 "No changes: 1"

**检查步骤**：
```bash
# 检查环境变量
echo $NOTION_TOKEN
echo $NOTION_DATABASE_ID

# 如果为空，需要设置环境变量
export NOTION_TOKEN="your_token_here"
export NOTION_DATABASE_ID="your_database_id_here"
```

**解决方案**：
1. 创建 `.env` 文件：
   ```bash
   cp config.example .env
   # 编辑 .env 文件，填入实际的 token 和数据库 ID
   ```

2. 使用本地开发模式：
   ```bash
   npm run dev
   ```

#### 2. 数据库字段名称不匹配

**症状**：脚本运行但无法找到字段

**检查步骤**：
```bash
# 运行诊断脚本
node debug-notion.js
```

**解决方案**：
1. 确保数据库字段名称完全匹配：
   - `Date` (不是 `date` 或 `DATE`)
   - `Review Stage` (不是 `review_stage` 或 `ReviewStage`)
   - `#D1 Score` (包含 # 号)
   - `#D3 Score`
   - `#D7 Score`
   - `#D14 Score`
   - `Next Review Date`
   - `Calendar Date`

2. 如果字段名不同，修改脚本中的 `FIELDS` 常量

#### 3. 页面状态检查

**可能的情况**：

1. **页面已正确配置**：
   - Review Stage 已设置且分数 < 70
   - 页面处于 D30 阶段（最终阶段）

2. **缺少 Date 字段**：
   - 页面没有 `Date` 字段
   - 脚本会跳过该页面

3. **分数字段为空**：
   - 分数字段存在但值为空
   - 脚本不会推进阶段

#### 4. 权限问题

**症状**：连接错误或权限被拒绝

**检查步骤**：
1. 确认 Notion 集成有数据库的编辑权限
2. 确认数据库已分享给集成
3. 检查集成 token 是否有效

### 诊断步骤

#### 步骤 1：检查环境变量
```bash
# 设置环境变量（替换为实际值）
export NOTION_TOKEN="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 运行诊断脚本
node debug-notion.js
```

#### 步骤 2：检查数据库结构
诊断脚本会显示：
- 数据库是否存在
- 字段名称是否正确
- 页面数据内容

#### 步骤 3：测试特定页面
```bash
# 运行试运行模式查看会执行什么操作
npm run dry-run

# 运行调试模式查看详细信息
npm run debug
```

#### 步骤 4：创建测试数据
在 Notion 中创建一个测试页面：
1. 只有 `Date` 字段（如：2025-01-15）
2. 其他字段为空
3. 运行脚本，应该自动初始化为 D1 阶段

### 常见问题解决

#### 问题 1：字段名称不匹配
**错误**：`Property 'Date' not found`

**解决**：检查数据库中的实际字段名称，更新脚本中的 `FIELDS` 常量

#### 问题 2：权限不足
**错误**：`Unauthorized` 或 `Forbidden`

**解决**：
1. 检查集成权限设置
2. 确认数据库已分享给集成
3. 重新生成集成 token

#### 问题 3：数据库 ID 错误
**错误**：`Database not found`

**解决**：
1. 从数据库 URL 中提取正确的 ID
2. 确保 ID 是 32 位字符串

#### 问题 4：页面没有更新
**可能原因**：
1. 页面已经处于正确状态
2. 分数未达到推进阈值（< 70）
3. 缺少必要的字段

**解决**：
1. 检查页面当前状态
2. 设置分数 ≥ 70 测试推进功能
3. 确保所有必需字段存在

### 测试用例

#### 测试 1：初始化新页面
1. 创建只有 `Date` 字段的页面
2. 运行脚本
3. 应该自动设置 Review Stage = D1

#### 测试 2：推进阶段
1. 设置 `#D1 Score = 70`
2. 运行脚本
3. 应该推进到 D3 阶段

#### 测试 3：试运行模式
```bash
npm run dry-run
```
应该显示会执行的操作但不实际更新

### 获取帮助

如果问题仍然存在：

1. **查看详细日志**：
   ```bash
   npm run debug
   ```

2. **检查 GitHub Actions 日志**：
   - 访问 GitHub Actions 页面
   - 查看工作流执行日志

3. **验证 Notion 集成**：
   - 检查集成权限
   - 确认数据库分享设置

4. **联系支持**：
   - 提供错误日志
   - 说明具体问题
   - 包含数据库结构信息
