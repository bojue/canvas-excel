#!/bin/bash

# gh-pages 发布脚本
# 用于将项目发布到 GitHub Pages

set -e

echo "🚀 开始发布到 gh-pages..."

# 获取远程仓库地址
REMOTE_URL=$(git config --get remote.origin.url)

# 1. 构建项目
echo "📦 正在构建项目..."
npm run build

# 2. 进入构建输出目录
cd dist

# 3. 初始化 git 仓库（如果还没有的话）
if [ ! -d .git ]; then
  git init
  git checkout -b gh-pages
else
  git checkout gh-pages 2>/dev/null || git checkout -b gh-pages
fi

# 4. 设置远程仓库
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"

# 5. 添加所有文件
git add -A

# 6. 提交
echo "💾 提交更改..."
git commit -m "Deploy to gh-pages - $(date '+%Y-%m-%d %H:%M:%S')"

# 7. 强制推送到远程 gh-pages 分支
echo "📤 推送到 GitHub..."
git push -f origin gh-pages

# 8. 返回项目根目录
cd ..

echo "✅ 发布完成！"
echo "🌐 请在 GitHub 仓库设置中启用 GitHub Pages，选择 gh-pages 分支"
