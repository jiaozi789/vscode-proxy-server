# proxy README

开启本地文件预览/代理服务器

## Features

支持 proxy 代理转发，兼容 `webpack devServer` 配置
支持访问静态文件
动态智能端口，不需要指定 port，插件会自动分配

## Requirements

代理转发 proxy，需要在项目根目录增加 `.proxyrc.js` 配置文件，写入需要的配置信息。（非必选）

例如：

```javascript
module.exports = {
  proxy: {
    "/gateway/": {
      target: "http://www.xxx.com",
      pathRewrite: { "^/gateway/": "" },
      changeOrigin: true
    },
    "/api": {
      target: "http://api.xxx.com",
      changeOrigin: true
    }
  }
};
```
