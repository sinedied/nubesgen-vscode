import * as vscode from "vscode";
import { CancelError } from "../utils/cancel-error";
import { GENERATOR_OPTIONS, NubesGenProject } from "../utils/nubesgen";

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

    const region = await vscode.window.showQuickPick(
      GENERATOR_OPTIONS.regions,
      { placeHolder: "Choose deployment region" }
    );
    if (!region) {
      throw new CancelError();
    }
    project.region = region.id;

    const hostingType = await vscode.window.showQuickPick(
      GENERATOR_OPTIONS.hostingTypes,
      { placeHolder: "Choose application hosting type" }
    );
    if (!hostingType) {
      throw new CancelError();
    }
    project.components.frontApp.type = hostingType.id;

    const hostingSize = await vscode.window.showQuickPick(
      GENERATOR_OPTIONS.hostingSizes[hostingType.id],
      { placeHolder: "Choose app size" }
    );
    if (!hostingSize) {
      throw new CancelError();
    }
    project.components.frontApp.size = hostingSize.id;

    // TODO: DB, addons

    const gitops = await vscode.window.showQuickPick(
      [
        {
          id: true,
          label: "Yes",
          detail: "Deploy your infrastructure and code with GitHub Actions",
        },
        { id: false, label: "No", detail: "Deploy manually" },
      ],
      { placeHolder: "Add GitOps?" }
    );
    if (gitops === undefined) {
      throw new CancelError();
    }
    project.gitops = gitops.id;

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "NubesGen",
        cancellable: false,
      },
      (progress) => {
        progress.report({ increment: 0, message: "Generating files..." });
        return project.generateFiles(vscode.workspace.rootPath as string);
      }
    );

    vscode.window.showInformationMessage(
      "NubesGen project generated successfully!"
    );
  } catch (err) {
    if (!err || err instanceof CancelError) {
      return;
    }
    vscode.window.showErrorMessage(err.message || err);
  }
}
