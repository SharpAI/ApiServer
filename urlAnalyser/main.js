const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600,
        "webPreferences": {
            "webSecurity": false,
            "preload": path.resolve(path.join(__dirname, 'inspector.js')),
            "nodeIntegration": true,
        },
        show: true})

    // and load the index.html of the app.
    // mainWindow.loadURL(`file://${__dirname}/index.html`)

    mainWindow.loadURL('https://mp.weixin.qq.com/s?__biz=MzA4ODc2MjQ4Ng==&mid=2661188553&idx=1&sn=98d13920a5455ee49efa411d8cacb172&scene=0&key=77421cf58af4a653228c3c9fbfba94099c44a0db67cd05ab7d1b7ac46ee84727119799dfa3871b82716bcb22c658feb3&ascene=0&uin=Mjk1NjAwMzc4MA%3D%3D&devicetype=iMac+MacBookPro9%2C2+OSX+OSX+10.11.6+build(15G7a)&version=11020201&pass_ticket=tLeKE5qjRcMrHqEYM53ZAJZwkW6aaRslwavnPwYAiFZxs6SNHqURWGsFYLtdwuZT')
    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
