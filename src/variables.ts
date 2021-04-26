import { ExtensionContext } from "vscode";

// Namespace for common variables used throughout the extension.
// Initializion takes place in the activate() method of extension.ts
export namespace extension {
  export let context: ExtensionContext;
}
