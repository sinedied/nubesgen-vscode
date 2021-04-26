import * as vscode from "vscode";
import { CancelError } from "../utils/cancel-error";
import { GENERATOR_OPTIONS, NubesGenProject } from "../utils/nubesgen";
import { getWorkspaceFolders, pickTargetFolder } from "../utils/workspace";

export async function setupGitOps() {
  try {
    const wsFolders = getWorkspaceFolders();
    // const region = await askRegion(project);
    const targetFolder = await pickTargetFolder(wsFolders);

    const terminal = vscode.window.createTerminal({
      name: "GitOps Setup",
      cwd: targetFolder,
    });
    terminal.show();
    terminal.sendText(
      'bash -c "$(curl -fsSL https://nubesgen.com/gitops/setup.sh)"'
    );
    // terminal.dispose();
  } catch (err) {
    if (!err || err instanceof CancelError) {
      return;
    }
    vscode.window.showErrorMessage(err.message || err);
  }
}

async function askRegion(project: NubesGenProject) {
  const region = await vscode.window.showQuickPick(GENERATOR_OPTIONS.regions, {
    placeHolder: "Choose region",
  });
  if (!region) {
    throw new CancelError();
  }
  return region.id;
}
