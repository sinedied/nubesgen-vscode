import * as vscode from 'vscode';
import { generate } from './commands/generate';
import { setupGitOps } from './commands/gitops';
import { registerCommand } from './utils/commands';
import { extension } from './variables';

export function activate(context: vscode.ExtensionContext) {
	// extension.context = context;

	// registerCommand('nubesGen.generate', generate);
	// registerCommand('nubesGen.setupGitOps', setupGitOps);

	context.subscriptions.push(
    vscode.commands.registerCommand('nubesGen.generate', () => generate())
  );
	context.subscriptions.push(
    vscode.commands.registerCommand('nubesGen.setupGitOps', () => setupGitOps())
  );

	context.subscriptions.push(
    vscode.commands.registerCommand('nubesGen.test', () => {
			vscode.window.showInformationMessage('hello');
		}
		)
  );
}
