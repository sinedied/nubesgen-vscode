import * as vscode from 'vscode';
import { generate } from './commands/generate';
import { setupGitOps } from './commands/gitops';
import { registerCommand } from './utils/commands';
import { extension } from './variables';

export function activate(context: vscode.ExtensionContext) {
	extension.context = context;

	registerCommand('nubesGen.generate', generate);
	registerCommand('nubesGen.setupGitOps', setupGitOps);
}
