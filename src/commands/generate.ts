import * as vscode from "vscode";
import { CancelError } from "../utils/cancel-error";
import { GENERATOR_OPTIONS, NubesGenProject } from "../utils/nubesgen";
import { getWorkspaceFolders, pickTargetFolder } from "../utils/workspace";

export async function generate() {
  try {
    const wsFolders = getWorkspaceFolders();
    const project = new NubesGenProject();

    project.name = await askName(project);
    project.region = await askRegion(project);
    project.components.hosting.type = await askHostingType(project);
    project.components.hosting.size = await askHostingSize(project);
    project.runtime = await askRuntime(project);
    project.components.database.type = await askDatabase(project);
    project.components.database.size = await askDatabaseSize(project);
    project.addons = await askAddons(project);
    project.gitops = await askGitops(project);

    const targetFolder = await pickTargetFolder(wsFolders);

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "NubesGen",
        cancellable: false,
      },
      (progress) => {
        progress.report({ increment: 0, message: "Generating files..." });
        return project.generateFiles(targetFolder);
      }
    );

    vscode.window.showInformationMessage(
      "NubesGen project generated successfully! in " + targetFolder
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

async function askRuntime(project: NubesGenProject) {
  const runtime = await vscode.window.showQuickPick(
    GENERATOR_OPTIONS.runtimes[project.components.hosting.type],
    { placeHolder: "Choose runtime" }
  );
  if (!runtime) {
    throw new CancelError();
  }
  return runtime.id;
}

async function askDatabase(project: NubesGenProject) {
  const db = await vscode.window.showQuickPick(GENERATOR_OPTIONS.databases, {
    placeHolder: "Choose database",
  });
  if (!db) {
    throw new CancelError();
  }
  return db.id;
}

async function askDatabaseSize(project: NubesGenProject) {
  const dbSize = await vscode.window.showQuickPick(
    GENERATOR_OPTIONS.databaseSizes[project.components.database.type],
    {
      placeHolder: "Choose database size",
    }
  );
  if (!dbSize) {
    throw new CancelError();
  }
  return dbSize.id;
}

async function askAddons(project: NubesGenProject) {
  const addons = await vscode.window.showQuickPick(GENERATOR_OPTIONS.addons, {
    placeHolder: "Choose add-ons",
    canPickMany: true,
  });
  if (!addons) {
    throw new CancelError();
  }
  return addons.map((a) => a.id);
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
