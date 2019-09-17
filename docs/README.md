---
title: 在 create-react-app 中使用 electron
sidebar: auto
---

## 简单上手

### 基础命令

```bash
# 查看文档
yarn doc

# electron 启动
yarn electron

# electron 打包
yarn dist

# react 启动
yarn start

# react 编译
yarn build
```

### 安装初始环境

**1. 生成并启动一个 react 项目：**

```bash
npx create-react-app my-app
cd my-app
yarn start
```

**2. 此时我们已经可以通过 `http://localhost:3000` 访问到，然后安装 `electron`：**

```pash
yarn add electron --dev
```

### electron 启动本地服务

**1. 在项目中添加 `main.js`，内容如下，主要配置 `mainWindow.loadURL`：**

```js
// 引入electron并创建一个Browserwindow
const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow

function createWindow () {
  //创建浏览器窗口,宽高自定义具体大小你开心就好
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // 加载应用-----  electron-quick-start编译后的文件
  // mainWindow.loadURL(url.format({
  //   pathname: path.join(__dirname, './build/index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))

  // 加载应用----适用于 本地服务或者
  mainWindow.loadURL('http://localhost:3000');
  
  // 打开开发者工具，默认不打开
  // mainWindow.webContents.openDevTools()

  // 关闭window时触发下列事件.
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', createWindow)

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
   // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow()
  }
})

// 你可以在这个脚本中续写或者使用require引入独立的js文件.   
```

**2. 在 `package.json` 中添加配置 `main` 和 `scripts`：**

```json
{
  "main": "main.js",
  "scripts": {
    "electron": "electron ."
  }
}
```

此时执行 `yarn electron` 即可启动一个 `electron` 程序 ^ _ ^ ^ _ ^ ^ _ ^

### electron 启动编译文件

**1. 在真正打包时，我们是需要将编译后的文件进行打包，将 `react` 项目编译到 `build` 文件夹：**

```bash
yarn build
```

**2. 修改 `main.js`，将 `http://localhost:3000` 重新指向编译后的文件，还是要修改 `mainWindow.loadURL`：**

```js
mainWindow.loadURL(url.format({
  pathname: path.join(__dirname, './build/index.html'),
  protocol: 'file:',
  slashes: true
}))
```

**3. 在 `package.json` 中设置 `homepage: "./"`，使打包后的文件中引用路径变为相对路径（`electron` 并不是启动一个服务，不识别绝对路径）：**

```json
{
  "homepage": "./"
}
```

### electron 打包编译文件

> 打包使用 `electron-builder`，较 `electron-packager` 有更丰富的的功能，支持更多的平台，同时也支持了自动更新，打出的包更为轻量，并且可以打包出不暴露源码的setup安装程序。

**1. `main.js` 改名 `electron.js` 放入 `public` 文件夹中编译，打包到 `build` 文件夹，`main.js` 和打包后的 `electron.js` 的 `pathname` 不一致，所以注意修改路径：**

```js
mainWindow.loadURL(url.format({
  pathname: path.join(__dirname, './build/index.html'),
  protocol: 'file:',
  slashes: true
}))
```

**2. 在 `package.json` 中设置 `builds`，增加 `scripts` 命令：**

```json
{
  "build": {
    "appId": "com.leon.my-app",
    "copyright": "LEON",
    "productName": "my-app",
    "mac": {
      "target": [
        "dmg",
        "zip"
      ]
    },
    "win": {
      "target": [
        "nsis",
        "zip"
      ]
    }
  },
  "scripts": {
    "dist": "electron-builder --mac"
  }
}
```

**3. 执行 `yarn dist`**

## 检测更新

### 基础配置

更新功能使用 `electron-builder` 和 `electron-updater` 配合来实现。

**1. 在 `package.json` 中添加**

```json
{
  "build": {
    "publish": [
      {
        "provider": "generic",
        "url": "http://192.168.0.226/electron/" // 更新服务器地址
      }
    ]
  }
}
```

**2. 将高版本的安装包和 `last.yml` （mac打包叫做 last-mac.yml）放入更新服务器**

**3. 在主进程中写入检测更新代码**

```js
// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle(){
  let message={
    error:'检查更新出错',
    checking:'正在检查更新……',
    updateAva:'检测到新版本，正在下载……',
    updateNotAva:'现在使用的就是最新版本，不用更新',
  };
  const os = require('os');
  sendUpdateMessage('正在检测')
  autoUpdater.setFeedURL('http://192.168.0.226/electron/'); // 更新服务器地址
  sendUpdateMessage('放最新版本文件的文件夹的服务器地址')
  autoUpdater.on('error', function(error){
    sendUpdateMessage(message.error)
  });
  autoUpdater.on('checking-for-update', function() {
    sendUpdateMessage(message.checking)
  });
  autoUpdater.on('update-available', function(info) {
    sendUpdateMessage(message.updateAva)
  });
  autoUpdater.on('update-not-available', function(info) {
      endUpdateMessage(message.updateNotAva)
  });
  
  // 更新下载进度事件
  autoUpdater.on('download-progress', function(progressObj) {
    mainWindow.webContents.send('downloadProgress', progressObj)
  })
  autoUpdater.on('update-downloaded',  function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    ipcMain.on('isUpdateNow', (e, arg) => {
      //some code here to handle event
      autoUpdater.quitAndInstall();
    })
    mainWindow.webContents.send('isUpdateNow')
  });
  
  //执行自动更新检查
  autoUpdater.checkForUpdates();
}

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(text){
  mainWindow.webContents.send('updateInfo', text)
  dialog.showMessageBox({
    type:'info',
    title: 'message',
    message: text,
  })
}
```

### 主进程和渲染进程之间的通信

比如，检测更新不是进入 APP 就自动更新，而是通过页面（渲染进程）里的按钮来发起监听，主进程监听到后再触发更新检测，监听的过程也就是通过通信来完成的。

```js
// 渲染进程发起监听
const { ipcRenderer } = require('electron')
ipcRenderer.send('getUpdate')

// 主进程接收监听
const { ipcMain } = require('electron')
ipcMain.on('getUpdate', () => {
  updateHandle()
})
```

但是这时监听是无法生效的，因为在 `react` 中无法使用 `NodeJS` 的 API，使用下面的方法解决此问题：

**1. 在 public 文件夹中添加 `preload.js`**

```js
global.electron = require('electron')
```

**2. 在 `index.html` 引入 `preload.js`**

```html
<script>import "./preload.js"</script>
```

**3. 在 `main.js` 中修改窗口创建 API**

```js
mainWindow = new BrowserWindow({
  width: 800, 
  height: 600,
  webPreferences: {
    javascript: true,
    plugins: true,
    nodeIntegration: false, // 不集成 Nodejs
    webSecurity: false,
    preload: path.join(__dirname, './public/preload.js') // 但预加载的 js 文件内仍可以使用 Nodejs 的 API
  }
})
```

**4. 此时就可以在 `react` 组件中使用 `electron` 了**

```js
window.electron.ipcRenderer.send('getUpdate')
```

## 报错

1. mac 平台打包 win 会报错：Error: Exit code: ENOENT. spawn prlctl ENOENT - bitbucket pipelines
    - https://github.com/electron-userland/electron-builder/issues/2238
    - https://www.electron.build/configuration/win#WindowsConfiguration-certificateSubjectName
    - https://github.com/electron-userland/electron-builder/issues/2354

2. mac 更新显示签名错误：electron Could not get code signature for running application
   - https://segmentfault.com/a/1190000012904543
   - https://segmentfault.com/a/1190000012902525
