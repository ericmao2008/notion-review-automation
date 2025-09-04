#!/bin/bash

# 推送代码到 GitHub 的脚本
# 使用方法: ./push-to-github.sh

echo "🚀 推送代码到 GitHub..."
echo ""

# 检查远程仓库是否已设置
if ! git remote get-url origin >/dev/null 2>&1; then
    echo "❌ 远程仓库未设置，正在设置..."
    git remote add origin https://github.com/ericmao2008/notion-review-automation.git
fi

# 推送代码
echo "📤 推送代码到 GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码已成功推送到 GitHub!"
    echo ""
    echo "🔗 仓库地址: https://github.com/ericmao2008/notion-review-automation"
    echo ""
    echo "📋 接下来需要完成的步骤："
    echo ""
    echo "1. 🔑 创建 Organization 级别的 Notion 集成："
    echo "   - 访问 https://www.notion.so/my-integrations"
    echo "   - 创建 Organization 级别的集成"
    echo "   - 获取集成 token（以 secret_ 开头）"
    echo ""
    echo "2. 🔑 在 GitHub 仓库中设置 Secrets："
    echo "   - 进入 https://github.com/ericmao2008/notion-review-automation/settings/secrets/actions"
    echo "   - 添加 NOTION_TOKEN (你的 Notion 集成 token)"
    echo "   - 添加 NOTION_DATABASE_ID (你的数据库 ID)"
    echo ""
    echo "3. 🔗 在 Notion 中分享数据库给集成："
    echo "   - 打开数据库 → Share → Invite"
    echo "   - 搜索 'Review Automation' 集成"
    echo "   - 给予 'Can edit' 权限"
    echo ""
    echo "4. 📅 创建 Notion Calendar 视图："
    echo "   - Add a view → Calendar"
    echo "   - 选择 'Calendar Date' 作为主日期字段"
    echo ""
    echo "5. 🧪 测试部署："
    echo "   - 进入 https://github.com/ericmao2008/notion-review-automation/actions"
    echo "   - 手动触发 'Notion Review Automation' 工作流"
    echo ""
    echo "📖 详细说明请查看："
    echo "   - ORGANIZATION_SETUP.md (Organization 集成快速设置)"
    echo "   - DEPLOYMENT.md (完整部署指南)"
    echo ""
    echo "🎉 部署准备完成！"
else
    echo ""
    echo "❌ 推送失败！"
    echo ""
    echo "请确保："
    echo "1. 已在 GitHub 上创建仓库: https://github.com/ericmao2008/notion-review-automation"
    echo "2. 有推送权限"
    echo "3. 网络连接正常"
    echo ""
    echo "如果仓库不存在，请先访问 https://github.com/new 创建仓库"
fi
