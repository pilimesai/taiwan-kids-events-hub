import { execSync } from 'child_process';

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return null;
  }
}

export function autoCommitAndPush() {
  console.log('🔍 正在檢查本地是否有尚未上傳的更動...');
  const status = run('git status --porcelain');

  if (!status) {
    console.log('✅ 目前沒有任何未儲存的變更，已是最新狀態！');
    return;
  }

  console.log('📦 偵測到以下更動，準備自動上傳至 GitHub：');
  console.log(status);

  try {
    // 1. 加入所有更動
    execSync('git add -A', { stdio: 'inherit' });

    // 2. 自動產生提交訊息
    const now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const commitMsg = `update: 自動同步最新親子活動與網站更新 (${now})`;
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });

    // 3. 先同步遠端可能由 GitHub Actions 產生的自動資料更新
    console.log('🔄 檢查並拉取遠端最新變更 (git pull --rebase)...');
    execSync('git pull --rebase origin main', { stdio: 'inherit' });

    // 4. 上傳至 GitHub
    console.log('🚀 正在推送至 GitHub 遠端儲存庫 (origin/main)...');
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('🎉 成功上傳至 GitHub！GitHub Actions 將自動為您更新部署線上網站！');
  } catch (err) {
    console.error('❌ 上傳至 GitHub 失敗：', err.message);
  }
}

autoCommitAndPush();
