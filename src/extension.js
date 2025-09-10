const { commands } = require("vscode");
const app = require("./app");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    commands.registerCommand("extension.proxyServer.start", async (fileUri) => {
      app.Golive(fileUri ? fileUri.fsPath : null);
    })
  );
  context.subscriptions.push(
    commands.registerCommand("extension.proxyServer.stop", () => {
      app.GoOffline();
    })
  );
  context.subscriptions.push(app);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
