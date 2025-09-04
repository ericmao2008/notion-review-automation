# 🏢 组织级授权配置指南

## 背景说明

我们已经在组织 `ericmao2008` 的 **Secrets & Variables** 中配置了全部所需的密钥。所有仓库（业务仓、infra-ci、shared-core）都应该统一继承组织级 Secrets，不需要再配置本地 `.env` 文件，也不需要在每个仓库里单独重复添加 Secrets。

---

## 🔑 已配置的组织级 Secrets

### Secrets（敏感信息）
- `NOTION_TOKEN` - Notion 集成 Token
- `NOTION_DB_SIXMIN` - Notion 数据库 ID（6分钟英语项目）
- `DATABASE_ID` - 通用数据库 ID（备用）
- `OPENAI_API_KEY` - OpenAI API 密钥

### Variables（非敏感配置）
- `YTDLP_PATH` - yt-dlp 路径（默认：`/usr/local/bin/yt-dlp`）
- `WHISPER_MODEL` - Whisper 模型（默认：`large-v3`）
- `WHISPER_LANG` - Whisper 语言（默认：`en`）
- `LOG_LEVEL` - 日志级别（默认：`info`）
- `DRY_RUN` - 试运行模式（默认：`0`）

---

## 📋 配置要求

### 1. 业务仓库配置

在业务仓库的 GitHub Actions 工作流中，直接使用组织级 Secrets：

**示例：**
```yaml
name: Notion Review Automation

on:
  workflow_dispatch:
  schedule:
    - cron: '0 23 * * *'

jobs:
  review-automation:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run Notion Review Automation
      env:
        NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
        NOTION_DATABASE_ID: ${{ secrets.NOTION_DB_SIXMIN || secrets.DATABASE_ID }}
      run: npm run run
```

### 2. 可复用工作流配置

在 `infra-ci/.github/workflows/node-reusable.yml` 中，统一映射组织 Secrets/Variables：

```yaml
name: Reusable Node.js Workflow

on:
  workflow_call:
    inputs:
      run:
        required: true
        type: string
      node-version:
        required: false
        type: string
        default: '20'
    secrets: inherit  # 🔑 继承组织级 Secrets

jobs:
  node-job:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run command
      env:
        NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
        DATABASE_ID: ${{ secrets.NOTION_DB_SIXMIN || secrets.DATABASE_ID }}
        OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        YTDLP_PATH: ${{ vars.YTDLP_PATH || '/usr/local/bin/yt-dlp' }}
        WHISPER_MODEL: ${{ vars.WHISPER_MODEL || 'large-v3' }}
        WHISPER_LANG: ${{ vars.WHISPER_LANG || 'en' }}
        LOG_LEVEL: ${{ vars.LOG_LEVEL || 'info' }}
        DRY_RUN: ${{ vars.DRY_RUN || '0' }}
      run: ${{ inputs.run }}
```

### 3. 调用可复用工作流

在业务仓库中调用可复用工作流：

```yaml
name: Business Workflow

on:
  workflow_dispatch:

jobs:
  call-reusable:
    uses: ericmao2008/infra-ci/.github/workflows/node-reusable.yml@main
    with:
      run: "npm run run"
      node-version: "20"
    secrets: inherit  # 🔑 继承组织级 Secrets
```

---

## 🚫 避免的配置

### ❌ 不要这样做

1. **不要在仓库级别重复配置 Secrets**
2. **不要使用本地 .env 文件**
3. **不要在代码中硬编码密钥**
4. **不要在每个仓库中单独添加相同的 Secrets**

### ❌ 错误示例

```yaml
# ❌ 错误：重复配置仓库级 Secrets
secrets:
  NOTION_TOKEN:
    description: 'Notion token'
    required: true
  DATABASE_ID:
    description: 'Database ID'
    required: true

# ❌ 错误：使用本地 .env 文件
- name: Load environment
  run: |
    echo "NOTION_TOKEN=${{ secrets.NOTION_TOKEN }}" >> $GITHUB_ENV
    echo "DATABASE_ID=${{ secrets.DATABASE_ID }}" >> $GITHUB_ENV
```

---

## ✅ 正确的配置模式

### 1. 直接使用模式

```yaml
jobs:
  my-job:
    runs-on: ubuntu-latest
    
    steps:
    - name: Run script
      env:
        NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
        DATABASE_ID: ${{ secrets.NOTION_DB_SIXMIN || secrets.DATABASE_ID }}
      run: npm run run
```

### 2. 可复用工作流模式

```yaml
# 定义可复用工作流
on:
  workflow_call:
    secrets: inherit  # 🔑 继承组织级 Secrets

# 调用可复用工作流
jobs:
  call-workflow:
    uses: ericmao2008/infra-ci/.github/workflows/node-reusable.yml@main
    secrets: inherit  # 🔑 继承组织级 Secrets
```

### 3. 环境变量映射模式

```yaml
env:
  # 直接映射组织级 Secrets
  NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
  DATABASE_ID: ${{ secrets.NOTION_DB_SIXMIN || secrets.DATABASE_ID }}
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  
  # 映射组织级 Variables（带默认值）
  YTDLP_PATH: ${{ vars.YTDLP_PATH || '/usr/local/bin/yt-dlp' }}
  WHISPER_MODEL: ${{ vars.WHISPER_MODEL || 'large-v3' }}
  WHISPER_LANG: ${{ vars.WHISPER_LANG || 'en' }}
  LOG_LEVEL: ${{ vars.LOG_LEVEL || 'info' }}
  DRY_RUN: ${{ vars.DRY_RUN || '0' }}
```

---

## 🔧 实际应用示例

### 当前项目（Notion Review Automation）

```yaml
name: Notion Review Automation

on:
  workflow_dispatch:
  schedule:
    - cron: '0 23 * * *'

jobs:
  review-automation:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run Notion Review Automation
      env:
        NOTION_TOKEN: ${{ secrets.NOTION_TOKEN }}
        NOTION_DATABASE_ID: ${{ secrets.NOTION_DB_SIXMIN || secrets.DATABASE_ID }}
        LOG_LEVEL: ${{ vars.LOG_LEVEL || 'info' }}
        DRY_RUN: ${{ vars.DRY_RUN || '0' }}
      run: npm run run
```

### 6分钟英语项目

```yaml
name: 6-Minute English Processing

on:
  workflow_dispatch:

jobs:
  process-audio:
    uses: ericmao2008/infra-ci/.github/workflows/node-reusable.yml@main
    with:
      run: "npm run process"
      node-version: "20"
    secrets: inherit  # 🔑 继承组织级 Secrets
```

---

## 📋 检查清单

### 配置验证
- [ ] 组织级 Secrets 已配置（NOTION_TOKEN, NOTION_DB_SIXMIN, OPENAI_API_KEY）
- [ ] 组织级 Variables 已配置（YTDLP_PATH, WHISPER_MODEL, 等）
- [ ] 工作流中使用 `secrets: inherit`
- [ ] 环境变量正确映射组织级 Secrets/Variables
- [ ] 没有使用本地 .env 文件
- [ ] 没有在仓库级别重复配置 Secrets

### 功能验证
- [ ] 工作流可以正常访问组织级 Secrets
- [ ] 环境变量正确传递到脚本
- [ ] 可复用工作流正常调用
- [ ] 所有仓库统一使用组织级配置

---

## 🎯 总结

### 关键要点
1. **统一管理**：所有密钥在组织级别统一管理
2. **直接使用**：在业务仓库中直接使用组织级 Secrets
3. **避免重复**：不在仓库级别重复配置相同的 Secrets
4. **环境映射**：正确映射组织级 Secrets 和 Variables 到环境变量

### 最佳实践
- ✅ 在业务仓库中直接使用 `${{ secrets.SECRET_NAME }}`
- ✅ 在可复用工作流中使用 `secrets: inherit`
- ✅ 在可复用工作流中统一映射环境变量
- ✅ 使用默认值处理可选的 Variables
- ✅ 避免本地 .env 文件和硬编码密钥

**所有仓库都应该遵循这个统一的授权模式！** 🎉
