const express = require("express");
const httpProxyMiddleware = require("http-proxy-middleware");
const { workspace } = require("vscode");
const serveIndex = require("serve-index");
const compress = require("compression");
const killable = require("killable");

module.exports = function (settings) {
  function setupProxyFeature() {
    if (settings.proxy && !Array.isArray(settings.proxy)) {
      if (Object.prototype.hasOwnProperty.call(settings.proxy, "target")) {
        settings.proxy = [settings.proxy];
      } else {
        settings.proxy = Object.keys(settings.proxy).map((context) => {
          let proxyOptions;
          // For backwards compatibility reasons.
          const correctedContext = context
            .replace(/^\*$/, "**")
            .replace(/\/\*$/, "");

          if (typeof settings.proxy[context] === "string") {
            proxyOptions = {
              context: correctedContext,
              target: settings.proxy[context]
            };
          } else {
            proxyOptions = Object.assign({}, settings.proxy[context]);
            proxyOptions.context = correctedContext;
          }
          proxyOptions.logLevel = proxyOptions.logLevel || "warn";
          return proxyOptions;
        });
      }
    }

    const getProxyMiddleware = (proxyConfig) => {
      const context = proxyConfig.context || proxyConfig.path;
      // It is possible to use the `bypass` method without a `target`.
      // However, the proxy middleware has no use in this case, and will fail to instantiate.
      if (proxyConfig.target) {
        return httpProxyMiddleware(context, proxyConfig);
      }
    };

    settings.proxy &&
      settings.proxy.forEach((proxyConfigOrCallback) => {
        let proxyConfig;
        let proxyMiddleware;

        if (typeof proxyConfigOrCallback === "function") {
          proxyConfig = proxyConfigOrCallback();
        } else {
          proxyConfig = proxyConfigOrCallback;
        }
        proxyMiddleware = getProxyMiddleware(proxyConfig);
        // if (proxyConfig.ws) {
        //   this.websocketProxies.push(proxyMiddleware);
        // }
        app.use((req, res, next) => {
          if (typeof proxyConfigOrCallback === "function") {
            const newProxyConfig = proxyConfigOrCallback();

            if (newProxyConfig !== proxyConfig) {
              proxyConfig = newProxyConfig;
              proxyMiddleware = getProxyMiddleware(proxyConfig);
            }
          }
          // - Check if we have a bypass function defined
          // - In case the bypass function is defined we'll retrieve the
          // bypassUrl from it otherwise byPassUrl would be null
          const isByPassFuncDefined = typeof proxyConfig.bypass === "function";
          const bypassUrl = isByPassFuncDefined
            ? proxyConfig.bypass(req, res, proxyConfig)
            : null;

          if (typeof bypassUrl === "boolean") {
            // skip the proxy
            req.url = null;
            next();
          } else if (typeof bypassUrl === "string") {
            // byPass to that url
            req.url = bypassUrl;
            next();
          } else if (proxyMiddleware) {
            return proxyMiddleware(req, res, next);
          } else {
            next();
          }
        });
      });
  }
  const app = express();
  if(settings.global && settings.global.response){
    app.use(settings.global.response);
  }
  const contentBase = workspace.workspaceFolders[0].uri.fsPath;
  if(!('/' in settings.oriProxy)){
    app.get("*", express.static(contentBase));
    app.get("*", serveIndex(contentBase));
  }
  setupProxyFeature();
  app.use(compress());
  return killable(app.listen(settings.port));
};
