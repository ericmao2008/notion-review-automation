#!/bin/bash

# Notion Review Automation 部署脚本
# 使用方法: ./deploy.sh YOUR_GITHUB_USERNAME

set -e

GITHUB_USERNAME=$1

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ 请提供 GitHub 用户名"
    echo "使用方法: ./deploy.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

echo "🚀 开始部署 Notion Review Automation..."
echo "GitHub 用户名: $GITHUB_USERNAME"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查 Git 状态
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Git 工作区干净"
else
    echo "⚠️  检测到未提交的更改，正在提交..."
    git add .
    git commit -m "Update deployment files"
fi

# 设置远程仓库
echo "🔗 设置 GitHub 远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USERNAME/notion-review-automation.git"

# 推送代码
echo "📤 推送代码到 GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ 代码已成功推送到 GitHub!"
echo ""
echo "📋 接下来需要手动完成的步骤："
echo ""
echo "1. 🔑 在 GitHub 仓库中设置 Secrets："
echo "   - 进入仓库 Settings → Secrets and variables → Actions"
echo "   - 添加 NOTION_TOKEN (你的 Notion 集成 token)"
echo "   - 添加 NOTION_DATABASE_ID (你的数据库 ID)"
echo ""
echo "2. 🔗 在 Notion 中分享数据库给集成："
echo "   - 打开数据库 → Share → Invite"
echo "   - 搜索 'Review Automation' 集成"
echo "   - 给予 'Can edit' 权限"
echo ""
echo "3. 📅 创建 Notion Calendar 视图："
echo "   - Add a view → Calendar"
echo "   - 选择 'Calendar Date' 作为主日期字段"
echo ""
echo "4. 🧪 测试部署："
echo "   - 进入 GitHub Actions 页面"
echo "   - 手动触发 'Notion Review Automation' 工作流"
echo ""
echo "📖 详细说明请查看 DEPLOYMENT.md 文件"
echo ""
echo "🎉 部署脚本执行完成！"
