# proxy README

开启本地文件预览/代理服务器

## Features

支持 proxy 代理转发，兼容 `webpack devServer` 配置
支持访问静态文件
动态智能端口，不需要指定 port，插件会自动分配

## Requirements

代理转发 proxy，需要在项目根目录增加 `.proxyrc.js` 配置文件，写入需要的配置信息。（非必选）
如果首次启动会有提示是否自动添加，如果添加了，可直接修改文件内容添加反向代理逻辑。

例如：

```javascript
module.exports = {
  //设置代理服务器端口，默认5766，如果不指定自动找一个不占用随机端口
  port: 5766,
  //设置全局跨域，如果不设置不支持全局跨域
  global:{
    response:(req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    }
  },
  proxy: {
    "/gateway/": {
      target: "http://www.xxx.com",
      pathRewrite: { "^/gateway/": "" },
      changeOrigin: true
    },
    "/api": {
      target: "http://api.xxx.com",
      changeOrigin: true
    },
    "/": { //如果设置/则按/设置转发，不设置则默认是列表文件页面
      target: "http://api11.xxx.com",
      changeOrigin: true
    }
  }
};
```
安装包proxy-0.1.4.vsix，直接在vs插件本地安装即可。
打开和关闭代理，点击右下角Proxy按钮即可。或者使用ctrl+shift+p，输入proxy，选择proxy server start/stop即可。
![alt text](1.png)

## 调试方法
.vscode/lauch.json文件中添加配置，启动调试即可。
```json
{
	"version": "0.2.0",
	"configurations": [
		{
			"name": "Run Extension",
			"type": "extensionHost",
			"request": "launch",
			"args": [
				"--extensionDevelopmentPath=${workspaceFolder}"
			]
		}
	]
}
然后 shif+alt+f9打开Run and Debug，选择Run Extension即可,此时会打开一个新的窗口，可以下断点调试了。

```

## 打包方法
打包方法：
1、执行npm install vsce -g --save vsce，安装vsce命令。
2、修改工程中的错误，有任何错误都不能完成打包(将Blob类型改成any)。
3、删除node_modules文件夹，执行npm install
4、执行vsce package
5、根目录会生成一个proxy-version.vsix文件，直接到extensions右侧... Install from VSIX安装即可。