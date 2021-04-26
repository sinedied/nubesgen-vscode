import * as vscode from "vscode";
import { CancelError } from "../utils/cancel-error";

export function getWorkspaceFolders() {
  const wsFolders = vscode.workspace.workspaceFolders;
  if (!wsFolders) {
    vscode.window.showErrorMessage("Please open a workspace directory first.");
    throw new CancelError();
  }
  return wsFolders;
}

export async function pickTargetFolder(
  wsFolders: readonly vscode.WorkspaceFolder[]
): Promise<string> {
  const folderPaths = workspaceFoldersToPaths(wsFolders);
  return folderPaths.length > 1 ? await askFolder(folderPaths) : folderPaths[0];
}

export function workspaceFoldersToPaths(
  wsFolders: readonly vscode.WorkspaceFolder[]
): string[] {
  return wsFolders
    .filter((folder) => folder.uri.scheme === "file")
    .map((folder) => folder.uri.fsPath);
}

async function askFolder(folders: string[]) {
  const folder = await vscode.window.showQuickPick(folders, {
    placeHolder: "Choose target workspace",
  });
  if (!folder) {
    throw new CancelError();
  }
  return folder;
}
