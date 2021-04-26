import * as vscode from "vscode";
import { CancelError } from "../utils/cancel-error";
import { GENERATOR_OPTIONS, NubesGenProject } from "../utils/nubesgen";
import { getWorkspaceFolders, pickTargetFolder } from "../utils/workspace";

export async function setupGitOps() {
  try {
    const wsFolders = getWorkspaceFolders();

    // const region = await askRegion(project);


    const targetFolder = await pickTargetFolder(wsFolders);

    // await vscode.window.withProgress(
    //   {
    //     location: vscode.ProgressLocation.Notification,
    //     title: "NubesGen",
    //     cancellable: false,
    //   },
    //   (progress) => {
    //     progress.report({ increment: 0, message: "Generating files..." });
    //     return project.generateFiles(targetFolder);
    //   }
    // );

    // vscode.window.showInformationMessage(
    //   "NubesGen project generated successfully! in "
    // );
  } catch (err) {
    if (!err || err instanceof CancelError) {
      return;
    }
    vscode.window.showErrorMessage(err.message || err);
  }
}

async function askRegion(project: NubesGenProject) {
  const region = await vscode.window.showQuickPick(GENERATOR_OPTIONS.regions, {
    placeHolder: "Choose deployment region",
  });
  if (!region) {
    throw new CancelError();
  }
  return region.id;
}
