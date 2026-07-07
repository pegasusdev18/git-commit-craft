import fs from 'fs';
import path from 'path';
import os from 'os';
import inquirer from 'inquirer';

const CONFIG_DIRECTORY = path.join(os.homedir(), '.git-commit-craft');
const CONFIG_FILE_PATH = path.join(CONFIG_DIRECTORY, 'config.json');

function readConfigFile() {
  if (!fs.existsSync(CONFIG_FILE_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function writeConfigFile(config) {
  if (!fs.existsSync(CONFIG_DIRECTORY)) {
    fs.mkdirSync(CONFIG_DIRECTORY, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export function getStoredApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const config = readConfigFile();
  return config.geminiApiKey || null;
}

export function saveApiKey(apiKey) {
  const config = readConfigFile();
  config.geminiApiKey = apiKey;
  writeConfigFile(config);
}

export async function ensureApiKey() {
  const existingKey = getStoredApiKey();
  if (existingKey) return existingKey;

  const answers = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Enter your Gemini API key (free at https://aistudio.google.com/app/apikey):',
      mask: '*',
      validate: value => value.trim().length > 0 || 'API key cannot be empty'
    }
  ]);

  const trimmedKey = answers.apiKey.trim();
  saveApiKey(trimmedKey);
  return trimmedKey;
}
