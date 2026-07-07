import { GoogleGenerativeAI } from '@google/generative-ai';
import { ensureApiKey } from './config.js';

const GEMINI_MODEL_NAME = 'gemini-1.5-flash';

const COMMIT_SYSTEM_INSTRUCTION = `
You are a Senior Software Engineer generating Conventional Commit messages strictly following the Conventional Commits v1.0.0 specification.

Rules:
1. Carefully analyze the provided git diff.
2. Output ONLY the raw commit message text. No markdown code fences, no explanations, no surrounding quotes.
3. Structure the message exactly as follows:
Header: <type>(<scope>): <short imperative summary, lowercase, max 72 characters, no trailing period>
Blank line
Body (only include if the change is non-trivial): bullet points starting with "-" describing what changed and why.
Blank line
Footer (only include if relevant): BREAKING CHANGE: <description>, or Closes #<issue-number>.
4. Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore.
5. Infer the most accurate scope from the affected module, directory, or feature. Omit the scope parentheses entirely if no clear scope exists.
6. Never fabricate issue numbers or breaking changes that are not evident from the diff.
7. Be concise, precise, and strictly professional in tone.
`;

const README_SYSTEM_INSTRUCTION = `
You are a Senior Technical Writer and Software Architect generating a modern, industry-standard README.md file in raw Markdown.

Rules:
1. Output ONLY the raw Markdown content of the README.md file. No explanations, no surrounding code fences wrapping the entire output.
2. Include the following sections when relevant to the provided metadata: a Project Title with a fitting emoji, a short tagline description, badge placeholders using shields.io syntax (build, license, version, primary language), a Table of Contents, a Features section with emoji bullet points, a Tech Stack section, a Project Structure section showing a directory tree inside a fenced code block, an Installation and Quick Start section with copy-paste ready shell commands, a Usage or API Reference section with realistic examples based strictly on the provided metadata, a Configuration section if environment variables or config files are relevant, a Contributing section, and a License section.
3. Infer the project name, purpose, and tech stack strictly from the provided metadata: package.json contents, the detected main language, and the file tree. Never invent dependencies, scripts, or features that are not present in the metadata.
4. Use correct GitHub-flavored Markdown, including properly labeled fenced code blocks.
5. Keep the tone professional, clear, and welcoming to new contributors.
`;

function stripCodeFences(text) {
  const fencePattern = /^```(?:\w+)?\n([\s\S]*?)\n```$/;
  const trimmed = text.trim();
  const match = trimmed.match(fencePattern);
  return match ? match[1].trim() : trimmed;
}

function createGenerativeModel(apiKey, systemInstruction) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME, systemInstruction });
}

export async function generateCommitMessage(diffContent) {
  const apiKey = await ensureApiKey();
  const model = createGenerativeModel(apiKey, COMMIT_SYSTEM_INSTRUCTION);

  try {
    const result = await model.generateContent(
      `Generate a Conventional Commit message for the following git diff:\n\n${diffContent}`
    );
    const text = result.response.text();
    return stripCodeFences(text);
  } catch (error) {
    throw new Error(`Failed to generate commit message: ${error.message}`);
  }
}

function buildReadmePrompt(metadata) {
  const { fileTree, packageJson, mainLanguage } = metadata;
  const packageInfo = packageJson ? JSON.stringify(packageJson, null, 2) : 'No package.json found in this project';

  return `Project metadata:

Main detected language: ${mainLanguage}

Directory structure:
${fileTree}

package.json contents:
${packageInfo}

Generate the complete README.md content now.`;
}

export async function generateReadmeContent(projectMetadata) {
  const apiKey = await ensureApiKey();
  const model = createGenerativeModel(apiKey, README_SYSTEM_INSTRUCTION);
  const prompt = buildReadmePrompt(projectMetadata);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return stripCodeFences(text);
  } catch (error) {
    throw new Error(`Failed to generate README content: ${error.message}`);
  }
}
