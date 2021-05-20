import * as vscode from "vscode";


interface ExtensionInputBoxOptions extends vscode.InputBoxOptions {
    onTextChangedUpdatePrompt?: (value: string) => Promise<string | undefined>;
}

export async function showInputBoxExtension(options: ExtensionInputBoxOptions) {
    var current: vscode.QuickInput;
    const disposables: vscode.Disposable[] = [];
    try {
        return await new Promise<string>((resolve, reject) => {
            const input = vscode.window.createInputBox();
            input.value = options.value || '';
            input.prompt = options.prompt;
            let validating = options.validateInput && options.validateInput('');
            disposables.push(
                input.onDidAccept(async () => {
                    const value = input.value;
                    input.enabled = false;
                    input.busy = true;
                    if (!(options.validateInput && await options.validateInput(value))) {
                        resolve(value);
                    }
                    input.enabled = true;
                    input.busy = false;
                }),
                input.onDidChangeValue(async text => {
                    const newPrompt = options.onTextChangedUpdatePrompt && await options.onTextChangedUpdatePrompt(text);
                    if (newPrompt) {
                        input.prompt = newPrompt;
                    }
                    const current = options.validateInput && options.validateInput(text);
                    validating = current;
                    const validationMessage = await current;
                    if (current === validating) {
                        input.validationMessage = validationMessage ?? '';
                    }
                })
            );
            if (current) {
                current.dispose();
            }
            current = input;
            current.show();
        });
    } finally {
        disposables.forEach(d => d.dispose());
    }
}