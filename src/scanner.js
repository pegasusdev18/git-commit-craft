import fs from 'fs';
import path from 'path';

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  'out',
  '.vscode',
  '.idea'
]);

const LANGUAGE_EXTENSION_MAP = {
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.py': 'Python',
  '.go': 'Go',
  '.rs': 'Rust',
  '.java': 'Java',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.c': 'C',
  '.cpp': 'C++',
  '.cs': 'C#',
  '.swift': 'Swift',
  '.kt': 'Kotlin'
};

function buildDirectoryTree(rootDir, currentDir = rootDir, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) return [];
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  let lines = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;

    const indent = '  '.repeat(depth);

    if (entry.isDirectory()) {
      lines.push(`${indent}${entry.name}/`);
      lines = lines.concat(buildDirectoryTree(rootDir, path.join(currentDir, entry.name), depth + 1, maxDepth));
    } else {
      lines.push(`${indent}${entry.name}`);
    }
  }

  return lines;
}

function countLanguageOccurrences(rootDir, currentDir = rootDir, depth = 0, maxDepth = 4, counts = {}) {
  if (depth > maxDepth) return counts;
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;

    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      countLanguageOccurrences(rootDir, fullPath, depth + 1, maxDepth, counts);
    } else {
      const extension = path.extname(entry.name);
      const language = LANGUAGE_EXTENSION_MAP[extension];
      if (language) counts[language] = (counts[language] || 0) + 1;
    }
  }

  return counts;
}

function detectMainLanguage(rootDir) {
  const counts = countLanguageOccurrences(rootDir);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : 'Unknown';
}

function readPackageJsonSafely(rootDir) {
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  } catch {
    return null;
  }
}

export function scanProjectStructure(rootDir = process.cwd()) {
  const fileTree = buildDirectoryTree(rootDir).join('\n');
  const packageJson = readPackageJsonSafely(rootDir);
  const mainLanguage = detectMainLanguage(rootDir);
  const readmeExists = fs.existsSync(path.join(rootDir, 'README.md'));

  return { fileTree, packageJson, mainLanguage, readmeExists };
}
