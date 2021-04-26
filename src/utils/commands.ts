import * as vscode from "vscode";
import { extension } from "../variables";

export function registerCommand(commandId: string, handler: Function) {
  extension.context.subscriptions.push(
    vscode.commands.registerCommand(commandId, () => handler())
  );
}
