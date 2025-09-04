# Notion Review Automation

自动化脚本：当用户在 Notion 数据库中更新各阶段分数（如 #D1 Score）且分数 ≥ 70 时，自动推进 Review Stage 到下一阶段，并计算写回 Next Review Date（真实 Date 属性），同时同步到 Calendar Date（真实 Date 属性，Notion Calendar 的主日期字段）。

## 功能特性

- ✅ 自动初始化新条目为 D1 阶段
- ✅ 基于分数阈值（≥70）自动推进复习阶段
- ✅ 自动计算并写入 Next Review Date
- ✅ 同步 Calendar Date 用于 Notion Calendar 视图
- ✅ 支持 Australia/Brisbane 时区
- ✅ 幂等性保证（重复运行不会误推进）
- ✅ 详细的日志输出和错误处理
- ✅ GitHub Actions 定时执行和手动触发

## 技术栈

- **语言**: Node.js (ESM)
- **依赖**: @notionhq/client, luxon
- **运行**: GitHub Actions
- **时区**: Australia/Brisbane (默认 09:00)

## 快速开始

### 1. 创建 Notion 集成

#### 个人集成（推荐用于个人项目）
1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 点击 "New integration"
3. 填写集成信息：
   - Name: `Review Automation`
   - Associated workspace: 选择你的工作区
4. 点击 "Submit"
5. 复制生成的 **Internal Integration Token**（以 `secret_` 开头）

#### Organization 集成（推荐用于团队项目）
1. 访问 [Notion Integrations](https://www.notion.so/my-integrations)
2. 确保在 Organization 级别创建集成
3. 点击 "New integration"
4. 填写集成信息：
   - Name: `Review Automation`
   - Associated workspace: 选择你的 Organization 工作区
   - Description: `Automated review stage progression for spaced repetition learning`
5. 配置权限：确保勾选 "Read content" 和 "Update content"
6. 点击 "Submit"
7. 复制生成的 **Internal Integration Token**（以 `secret_` 开头）

**Organization 集成的优势：**
- ✅ 统一管理，团队成员共享使用
- ✅ 更好的权限控制和安全性
- ✅ 便于团队协作和部署

### 2. 分享数据库给集成

1. 打开你的 Notion 数据库
2. 点击右上角的 "Share" 按钮
3. 点击 "Invite" 并搜索你的集成名称
4. 选择集成并给予 "Can edit" 权限
5. 复制数据库 URL 中的 Database ID（32位字符串）

### 3. 配置 GitHub Secrets

在你的 GitHub 仓库中设置以下 Secrets：

1. 进入仓库 → Settings → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下两个 secrets：

```
NOTION_TOKEN = secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. 设置 Notion Calendar 视图

1. 在数据库中创建新的 Calendar 视图
2. 在 "By date" 设置中选择 **Calendar Date** 作为主日期字段
3. 这样 Calendar 视图就能正确显示下次复习日期

## 数据库字段要求

### 必备属性（严格按名称）

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

### 可选属性

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `Last Review Date` | Date | 最后复习日期（脚本写入） |

## 业务规则

### 初始化规则
- 如果 `Review Stage` 为空：自动设为 D1
- `Next Review Date` = `Date` + 1天
- `Calendar Date` = `Next Review Date`
- 如果存在 `Last Review Date` 字段，写入今天

### 推进规则
- 当前阶段分数 ≥ 70 才推进到下一阶段
- 推进映射：
  - D1 → D3（看 #D1 Score，+3天）
  - D3 → D7（看 #D3 Score，+7天）
  - D7 → D14（看 #D7 Score，+14天）
  - D14 → D30（看 #D14 Score，+30天）
  - D30：终点，不再推进

### 时间设置
- 时区：Australia/Brisbane
- 默认时间：09:00
- 可通过修改脚本中的 `DEFAULT_HOUR` 常量调整

## 本地运行

### 安装依赖

```bash
npm install
```

### 设置环境变量

```bash
export NOTION_TOKEN="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
export NOTION_DATABASE_ID="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 运行脚本

```bash
npm run run
```

## GitHub Actions

### 定时执行
- 每天澳大利亚布里斯班时间 09:00 自动运行
- 对应 UTC 时间 23:00

### 手动触发
1. 进入仓库的 Actions 页面
2. 选择 "Notion Review Automation" 工作流
3. 点击 "Run workflow"
4. 可选择填写触发原因

## 配置选项

在 `scripts/notion-review.js` 中可以修改以下常量：

```javascript
const TZ = "Australia/Brisbane";        // 时区
const DEFAULT_HOUR = 9;                 // 默认小时
const FIELDS = { ... };                 // 字段映射
const RULES = { ... };                  // 推进规则
```

## 测试用例

### 1. 初始化测试
- 创建只有 `Date=2025-09-01 09:00` 的页面
- 运行脚本后应自动设为 D1 阶段，Next Review Date = 2025-09-02 09:00

### 2. 推进测试
- 设置 `#D1 Score=70`，保持 `Review Stage=D1`
- 运行脚本后应推进到 D3 阶段，Next Review Date = Date + 3天

### 3. 分数不足测试
- 设置 `#D3 Score=69`，保持 `Review Stage=D3`
- 运行脚本后阶段应保持不变

### 4. 幂等性测试
- 重复运行多次，已推进的阶段不应再次推进

## 故障排除

### 常见问题

1. **权限错误**
   - 确保集成有数据库的编辑权限
   - 检查 NOTION_TOKEN 是否正确

2. **字段名错误**
   - 检查数据库字段名是否与脚本中的 `FIELDS` 常量完全匹配
   - 注意大小写和特殊字符

3. **时区问题**
   - 脚本使用 Australia/Brisbane 时区
   - 如需修改，更改 `TZ` 常量

4. **Calendar 视图不显示**
   - 确保 Calendar 视图的 "By date" 设置选择了 `Calendar Date` 字段
   - 不是 `Next Review Date` 或其他字段

5. **GitHub Actions 失败**
   - 检查 Secrets 是否正确设置
   - 查看 Actions 日志了解具体错误

### 日志说明

脚本会输出详细的日志：
- ✅ 成功操作（初始化、推进、同步）
- ⏭️ 跳过的页面（缺少必要字段）
- ⏸️ 无变化的页面
- ❌ 错误信息

## 开发说明

### 项目结构

```
├── scripts/
│   └── notion-review.js      # 主脚本
├── .github/
│   └── workflows/
│       └── review-cron.yml   # GitHub Actions 工作流
├── package.json              # 项目配置
└── README.md                 # 说明文档
```

### 主要函数

- `iterateDatabase()`: 分页遍历数据库
- `processPage()`: 处理单个页面
- `toLocalDateISO()`: 日期计算和时区转换
- `updatePage()`: 更新页面属性

## 许可证

MIT License
