import chalk from 'chalk';

function getTerminalWidth() {
  const columns = process.stdout.columns || 80;
  return Math.max(60, Math.min(columns, 100));
}

function wrapLine(line, maxWidth) {
  if (line.length <= maxWidth) return [line];

  const words = line.split(' ');
  const wrapped = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxWidth) {
      wrapped.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }

  if (current) wrapped.push(current);
  return wrapped;
}

export function renderBox(title, content) {
  const width = getTerminalWidth();
  const horizontalLine = '─'.repeat(width - 2);
  const topBorder = chalk.cyan(`┌${horizontalLine}┐`);
  const bottomBorder = chalk.cyan(`└${horizontalLine}┘`);
  const separator = chalk.cyan(`├${horizontalLine}┤`);

  const titlePadding = ' '.repeat(Math.max(width - 4 - title.length, 0));
  const titleLine = chalk.cyan('│ ') + chalk.bold.white(title) + titlePadding + chalk.cyan(' │');

  const contentLines = content.split('\n').flatMap(line => wrapLine(line, width - 4));
  const bodyLines = contentLines.map(line => {
    const padding = ' '.repeat(Math.max(width - 4 - line.length, 0));
    return chalk.cyan('│ ') + chalk.white(line) + padding + chalk.cyan(' │');
  });

  console.log([topBorder, titleLine, separator, ...bodyLines, bottomBorder].join('\n'));
}

export function printSuccess(message) {
  console.log(chalk.green.bold('✔ ') + chalk.green(message));
}

export function printError(message) {
  console.log(chalk.red.bold('✖ ') + chalk.red(message));
}

export function printInfo(message) {
  console.log(chalk.blue.bold('ℹ ') + chalk.blue(message));
}

export function printWarning(message) {
  console.log(chalk.yellow.bold('⚠ ') + chalk.yellow(message));
}
