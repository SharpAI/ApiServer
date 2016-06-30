/**
 * Created by simba on 6/29/16.
 */
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var electron = require('electron')
// Module to create native browser window.
var BrowserWindow = electron.BrowserWindow
// Module to ipc message to main window.
var ipcMain = electron.ipcMain;

var path = require('path')

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow=null

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
var url='https://mp.weixin.qq.com/s?__biz=MzA4ODc2MjQ4Ng==&mid=2661188553&idx=1&sn=98d13920a5455ee49efa411d8cacb172&scene=0&key=77421cf58af4a653228c3c9fbfba94099c44a0db67cd05ab7d1b7ac46ee84727119799dfa3871b82716bcb22c658feb3&ascene=0&uin=Mjk1NjAwMzc4MA%3D%3D&devicetype=iMac+MacBookPro9%2C2+OSX+OSX+10.11.6+build(15G7a)&version=11020201&pass_ticket=tLeKE5qjRcMrHqEYM53ZAJZwkW6aaRslwavnPwYAiFZxs6SNHqURWGsFYLtdwuZT'

electron.app.on('ready',function(){
    createWindow();
    mainWindow.loadURL(url);

// you can do whatever you want here..
    ipcMain.once('analyse-done', function (event, arg) {
        console.log(arg);
    });
});
// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});

// more routes for our API will happen here
router.route('/:url')
    // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
    .get(function(req, res) {
        console.log(req.params.url);
        /*if (err)
         res.send(err);*/
        mainWindow.loadURL(req.params.url);
        mainWindow.webContents.on('dom-ready', function (e) {
            var interval=setInterval(function(){
                try{
                    mainWindow.webContents.executeJavaScript('(' + (function () {
                            try {
                                return window.detected_json_from_gushitie;
                            } catch(error){
                                return;
                            }
                        }).toString() + ')()',function(result){
                        //console.log(result)
                        if(result){
                            clearInterval(interval);
                            interval=null;
                            if(!req.state){
                                req.state = true
                                res.json({status:'ok',json:result});
                            }
                        }
                    })
                } catch (err){
                    clearInterval(interval)
                    res.json({status:'error'});
                }
            },1000);
        });
         // you can do whatever you want here..
        /*ipcMain.once('analyse-done', function(event, arg) {
            console.log(arg);
        });*/
    });
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/import', router);

// START THE SERVER
// =============================================================================
app.listen(port);

console.log('Magic happens on port ' + port);
// `electronWorkers` will send your data in a POST request to your electron script

