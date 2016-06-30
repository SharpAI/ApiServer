const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// Module to ipc message to main window.
const ipcMain = electron.ipcMain;

const path = require('path')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let workerId = process.env.ELECTRON_WORKER_ID; // worker id useful for logging

function createWindow () {
    // Create the browser window.
    if(!mainWindow){
        mainWindow = new BrowserWindow({width: 800, height: 600,
            "webPreferences": {
                "webSecurity": false,
                "preload": path.resolve(path.join(__dirname, 'inspector.js')),
                "nodeIntegration": true,
            },
            show: true})

        // and load the index.html of the app.
        // mainWindow.loadURL(`file://${__dirname}/index.html`)

        //mainWindow.loadURL('https://mp.weixin.qq.com/s?__biz=MzA4ODc2MjQ4Ng==&mid=2661188553&idx=1&sn=98d13920a5455ee49efa411d8cacb172&scene=0&key=77421cf58af4a653228c3c9fbfba94099c44a0db67cd05ab7d1b7ac46ee84727119799dfa3871b82716bcb22c658feb3&ascene=0&uin=Mjk1NjAwMzc4MA%3D%3D&devicetype=iMac+MacBookPro9%2C2+OSX+OSX+10.11.6+build(15G7a)&version=11020201&pass_ticket=tLeKE5qjRcMrHqEYM53ZAJZwkW6aaRslwavnPwYAiFZxs6SNHqURWGsFYLtdwuZT')
        // Open the DevTools.
        mainWindow.webContents.openDevTools()

        // Emitted when the window is closed.
        mainWindow.on('closed', function () {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = null
            setTimeout(createWindow,2000)
            //createWindow()
        })
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.on('ready', createWindow)
// first you will need to listen the `message` event in the process object
app.on('ready', function() {
    createWindow()
    // first you will need to listen the `message` event in the process object
    process.on('message', function(data) {
        if (!data) {
            return;
        }

        // `electron-workers` will try to verify is your worker is alive sending you a `ping` event
        if (data.workerEvent === 'ping') {
            // responding the ping call.. this will notify `electron-workers` that your process is alive
            process.send({ workerEvent: 'pong' });
        } else if (data.workerEvent === 'task') { // when a new task is executed, you will recive a `task` event
            if(!mainWindow){
                createWindow()
            }
            mainWindow.loadURL(data.payload.url);

            console.log(data); //data -> { workerEvent: 'task', taskId: '....', payload: <whatever you have passed to `.execute`> }

            console.log(data.payload.url); // -> someData

            // you can do whatever you want here..
            ipcMain.on('analyse-done', (event, arg) => {
                console.log(arg);  // prints "ping"
                //event.sender.send('asynchronous-reply', 'pong');
                process.send({
                    workerEvent: 'taskResponse',
                    taskId: data.taskId,
                    response: {
                        value: arg
                    }
                });
                mainWindow.close();
            });

        }
    });
});

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
