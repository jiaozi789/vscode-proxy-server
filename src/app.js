const { window, workspace } = require("vscode");
const address = require("address");
const open = require("open");
const Statusbar = require("./Statusbar");
const server = require("./server");
const localIp = address.ip();
let IsStaging = false;
let IsServerRunning = false;
let runningPort;

function Golive(filePath) {
  if (IsStaging) {
    return;
  }
  if (IsServerRunning) {
    showPopUpMsg(`Server is already running`);
    return;
  }
  IsStaging = true;
  server.start().then((ser) => {
    IsStaging = false;
    runningPort = ser.port;
    IsServerRunning = true;
    Statusbar.Offline(runningPort);
    openBrowser(runningPort, filePath);
  });
  Statusbar.Working("Starting...");
}

function GoOffline() {
  if (IsStaging) {
    return;
  }
  if (!IsServerRunning) {
    showPopUpMsg(`Server is not already running`);
    return;
  }
  server.stop().then(() => {
    IsServerRunning = false;
    Statusbar.Live();
  });
  showPopUpMsg("Server is now offline.");
  Statusbar.Working("Disposing...");
}

Statusbar.Init();

function showPopUpMsg(msg, isErrorMsg, isWarning) {
  if (isErrorMsg) {
    window.showErrorMessage(msg);
  } else if (isWarning) {
    const donotShowMsg = "I understand, Don't show again";
    window.showWarningMessage(msg, donotShowMsg).then((choise) => {
      if (choise && choise === donotShowMsg) {
        // Config.setDonotVerifyTags(true, true);
      }
    });
  } else {
    const donotShowMsg = "Don't show again";
    window.showInformationMessage(msg, donotShowMsg).then((choice) => {
      if (choice && choice === donotShowMsg) {
        // Config.setDonotShowInfoMsg(true, true);
      }
    });
  }
}

function openBrowser(port, path) {
  if (!path && window.activeTextEditor) {
    path = window.activeTextEditor.document.fileName.replace(
      workspace.rootPath,
      ""
    );
  }
  const host = localIp;
  const protocol = "http";
  if (path.startsWith("\\") || path.startsWith("/")) {
    path = path.substring(1, path.length);
  }
  path = path.replace(/\\/gi, "/");
  try {
    open(`${protocol}://${host}:${port}/${path}`);
  } catch (error) {
    showPopUpMsg(
      `Server is started at ${runningPort} but failed to open browser. Try to change the CustomBrowser settings.`,
      true
    );
    console.log("\n\nError Log to open Browser : ", error);
    console.log("\n\n");
  }
}

module.exports = {
  Golive,
  GoOffline
};
