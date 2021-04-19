import * as vscode from "vscode";
import { CancelError } from "../utils/cancel-error";
import { GENERATOR_OPTIONS, NubesGenProject } from "../utils/nubesgen";

export async function generate() {
  const wsFolders = vscode.workspace.workspaceFolders;
  if (!wsFolders) {
    vscode.window.showErrorMessage("Please open a workspace directory first.");
    return;
  }

  const project = new NubesGenProject();

  try {
    project.name = await askName(project);
    project.region = await askRegion(project);
    project.components.hosting.type = await askHostingType(project);
    project.components.hosting.size = await askHostingSize(project);

    // TODO: DB, addons

    project.gitops = await askGitops(project);

    // TODO fix
    const targetDir: string =
      wsFolders.length > 1 ? await askFolder(wsFolders) : wsFolders[0].name;

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
      "NubesGen project generated successfully! in "
    );
  } catch (err) {
    if (!err || err instanceof CancelError) {
      return;
    }
    vscode.window.showErrorMessage(err.message || err);
  }
}

async function askName(project: NubesGenProject) {
  const name = await vscode.window.showInputBox({
    prompt: "Enter project name",
  });
  if (!name) {
    throw new CancelError();
  }
  return name;
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

async function askHostingType(project: NubesGenProject) {
  const hostingType = await vscode.window.showQuickPick(
    GENERATOR_OPTIONS.hostingTypes,
    { placeHolder: "Choose application hosting type" }
  );
  if (!hostingType) {
    throw new CancelError();
  }
  return hostingType.id;
}

async function askHostingSize(project: NubesGenProject) {
  const hostingSize = await vscode.window.showQuickPick(
    GENERATOR_OPTIONS.hostingSizes[project.components.hosting.type],
    { placeHolder: "Choose app size" }
  );
  if (!hostingSize) {
    throw new CancelError();
  }
  return hostingSize.id;
}

async function askGitops(project: NubesGenProject) {
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
  return gitops.id;
}

async function askFolder(wsFolders: readonly vscode.WorkspaceFolder[]) {

  // TODO: filter !file:// & rm file://

  const folder = await vscode.window.showQuickPick(
    wsFolders.map((wsFolder) => wsFolder.name),
    { placeHolder: "Choose target workspace" }
  );
  if (!folder) {
    throw new CancelError();
  }
  return folder;
}
