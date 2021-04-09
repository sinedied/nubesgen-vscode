import * as vscode from "vscode";
import { CancelError } from "../utils/cancel-error";
import { NubesGenProject } from "../utils/nubesgen";

export async function generate() {
  const project = new NubesGenProject();

  try {
    const name = await vscode.window.showInputBox({
      prompt: "Enter project name",
    });
    if (!name) {
      throw new CancelError();
    }
    project.name = name;




    
  } catch (err) {
    if (!err || err instanceof CancelError) {
      return;
    }
    vscode.window.showErrorMessage(err.message || err);
  }

  // Display a message box to the user
  // vscode.window.showInformationMessage('Hello World from NubesGen-vscode!');
}
