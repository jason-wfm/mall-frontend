#!/usr/bin/env bash
set -e
npm run build
cd admin
touch .nojekyll
git init
git add -A
git commit -m 'deploy'
git push -f "https://${access_token}@gitee.com/wechuangteam/mall-backend.git" master:gh-pages
start "https://gitee.com/wechuangteam/mall-backend"
cd -
exec /bin/bash
