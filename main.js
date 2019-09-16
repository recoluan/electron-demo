// 注意这个autoUpdater不是electron中的autoUpdater
const { autoUpdater }  = require("electron-updater")
// 引入electron并创建一个Browserwindow
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow

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

function createWindow () {
  //创建浏览器窗口,宽高自定义具体大小你开心就好
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // 加载应用-----  electron-quick-start中默认的加载入口
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  // 加载应用----适用于 react 项目
  // mainWindow.loadURL('./build/index.html');
  
  // 打开开发者工具，默认不打开
  // mainWindow.webContents.openDevTools()

  updateHandle()

  // 关闭window时触发下列事件.
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

// 你可以在这个脚本中续写或者使用require引入独立的js文件.   

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
  autoUpdater.setFeedURL('http://192.168.0.226/electron/');
  // sendUpdateMessage('放最新版本文件的文件夹的服务器地址')
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
      sendUpdateMessage(message.updateNotAva)
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
// mainWindow = new BrowserWindow()
function sendUpdateMessage(text){
  mainWindow.webContents.send('message', text)
}