import { execSync, execFileSync } from 'child_process';

export function isGitRepository() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function getStagedDiff() {
  try {
    return execSync('git diff --cached', { maxBuffer: 1024 * 1024 * 20 }).toString();
  } catch {
    return '';
  }
}

export function getUnstagedDiff() {
  try {
    return execSync('git diff', { maxBuffer: 1024 * 1024 * 20 }).toString();
  } catch {
    return '';
  }
}

export function commitWithMessage(message) {
  execFileSync('git', ['commit', '-m', message], { stdio: 'inherit' });
}
