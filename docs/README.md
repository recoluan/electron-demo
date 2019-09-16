---
sidebar: auto
---

# 在 create-react-app 中使用 electron

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

## 报错

1. https://github.com/electron-userland/electron-builder/issues/2238
   - 解决：https://www.electron.build/configuration/win#WindowsConfiguration-certificateSubjectName
