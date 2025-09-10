const os = require("os");
const findPort = require("./findPort");
const { workspace, window, Uri  } = require("vscode");
const proxy = require("./proxy");
const prepareProxy = require("./prepareProxy");
const fs = require("fs");
const path = require("path");
let server;

const startProxy = (resolve, proxyrc) =>
  findPort().then((port) => {
    let proxyrcPort = proxyrc.port || port;
    proxyrc.port = proxyrcPort;
    if (proxyrc.proxy) {
      proxyrc.proxy = prepareProxy(proxyrc.proxy, "public");
    }
    server = proxy(proxyrc);
    return resolve({ server, port:proxyrcPort });
  });

module.exports = {
  start: function start() {
    return new Promise((resolve) => {
      workspace.findFiles("**/.proxyrc.js").then(async (files) => {
        if (files && files.length) {
          let filePath = files[0].path;
          if (os.type() === "Windows_NT") {
            filePath = filePath.substr(1);
          }
          delete require.cache[require.resolve(filePath)];
          let proxyrc = require(filePath);
          return startProxy(resolve, proxyrc);
        }else{
          // 没有找到，提示是否创建
          const answer = await window.showInformationMessage(
            "未找到 .proxyrc.js 配置文件，是否在项目根目录创建？",
            "是",
            "否"
          );

          if (answer === "是") {
            const rootPath = workspace.workspaceFolders?.[0]?.uri?.fsPath;
            if (!rootPath) {
              window.showErrorMessage("未检测到工作区目录，无法创建 .proxyrc.js");
              return startProxy(resolve, {});
            }

            const filePath = path.join(rootPath, ".proxyrc.js");
            const template = `module.exports = {
                port: 8088,
                proxy: {
                  "/gateway/": {
                    target: "https://www.baidu.com",
                    pathRewrite: { "^/gateway/": "" },
                    changeOrigin: true
                  },
                  "/api": {
                    target: "https://www.qq.com",
                    changeOrigin: true
                  }
                }
              };`;

            fs.writeFileSync(filePath, template, "utf8");
            window.showInformationMessage(".proxyrc.js 已创建");

            delete require.cache[require.resolve(filePath)];
            let proxyrc = require(filePath);
            return startProxy(resolve, proxyrc);
          }
        }
        return startProxy(resolve, {});
      });
    });
  },
  stop: function stop() {
    return new Promise((resolve) => {
      server && server.kill();
      return resolve();
    });
  }
};
