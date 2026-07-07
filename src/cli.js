#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { isGitRepository, getStagedDiff, getUnstagedDiff, commitWithMessage } from './git.js';
import { generateCommitMessage, generateReadmeContent } from './ai.js';
import { scanProjectStructure } from './scanner.js';
import { renderBox, printSuccess, printError, printInfo, printWarning } from './ui.js';

const program = new Command();

program
  .name('git-commit-craft')
  .description('AI powered Conventional Commit message and README.md generator')
  .version('1.0.0');

program
  .command('craft-commit')
  .description('Generate a Conventional Commit message from staged changes using AI')
  .action(runCraftCommit);

program
  .command('craft-readme')
  .description('Generate a professional README.md file using AI')
  .action(runCraftReadme);

program.parse(process.argv);

async function generateCommitMessageWithSpinner(diff) {
  const spinner = ora('Analyzing changes with AI...').start();
  try {
    const message = await generateCommitMessage(diff);
    spinner.succeed('Commit message generated.');
    return message;
  } catch (error) {
    spinner.fail('Failed to generate commit message.');
    printError(error.message);
    process.exit(1);
  }
}

async function runCraftCommit() {
  if (!isGitRepository()) {
    printError('This directory is not a git repository.');
    process.exit(1);
  }

  let diff = getStagedDiff();

  if (!diff.trim()) {
    printWarning('No staged changes found.');

    const { useUnstaged } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useUnstaged',
        message: 'Do you want to analyze unstaged changes instead?',
        default: true
      }
    ]);

    if (useUnstaged) {
      diff = getUnstagedDiff();
    }

    if (!diff.trim()) {
      printError('No changes detected to generate a commit message from.');
      process.exit(1);
    }
  }

  let commitMessage = await generateCommitMessageWithSpinner(diff);
  let shouldContinue = true;

  while (shouldContinue) {
    console.log('');
    renderBox('Generated Commit Message', commitMessage);
    console.log('');

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Do you want to commit with this message?',
        choices: [
          { name: 'Yes, commit now', value: 'yes' },
          { name: 'Edit message', value: 'edit' },
          { name: 'Regenerate message', value: 'regenerate' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }
    ]);

    if (action === 'yes') {
      commitWithMessage(commitMessage);
      printSuccess('Commit created successfully.');
      shouldContinue = false;
    } else if (action === 'edit') {
      const { editedMessage } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'editedMessage',
          message: 'Edit your commit message',
          default: commitMessage
        }
      ]);

      commitMessage = editedMessage.trim();

      const { confirmCommit } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmCommit',
          message: 'Commit with this edited message?',
          default: true
        }
      ]);

      if (confirmCommit) {
        commitWithMessage(commitMessage);
        printSuccess('Commit created successfully.');
        shouldContinue = false;
      }
    } else if (action === 'regenerate') {
      commitMessage = await generateCommitMessageWithSpinner(diff);
    } else {
      printInfo('Commit cancelled.');
      shouldContinue = false;
    }
  }
}

async function runCraftReadme() {
  const readmePath = path.join(process.cwd(), 'README.md');

  if (fs.existsSync(readmePath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'README.md already exists. Do you want to overwrite it?',
        default: false
      }
    ]);

    if (!overwrite) {
      printInfo('Operation cancelled.');
      return;
    }
  }

  const scanSpinner = ora('Scanning project structure...').start();
  const metadata = scanProjectStructure(process.cwd());
  scanSpinner.succeed('Project structure scanned.');

  const generationSpinner = ora('Generating README.md with AI...').start();
  try {
    const readmeContent = await generateReadmeContent(metadata);
    fs.writeFileSync(readmePath, readmeContent, 'utf-8');
    generationSpinner.succeed('README.md generated successfully.');
    printSuccess(`Saved to ${readmePath}`);
  } catch (error) {
    generationSpinner.fail('Failed to generate README.md');
    printError(error.message);
    process.exit(1);
  }
}
