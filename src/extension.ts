import * as vscode from 'vscode';
import { generate } from './commands/generate';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const cwd = vscode.workspace.workspaceFolders;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "nubesgen-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('nubesgen-vscode.generate', () => {
		if (!cwd) {
			vscode.window.showErrorMessage('Please open a workspace directory first.');
			return;
		}

		generate();
	});

	context.subscriptions.push(disposable);
}
