var Nightmare = require('nightmare');
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var path = require('path');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

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
      var nightmare = Nightmare({ show: true , openDevTools: true/*, webPreferences: {
       nodeIntegration: true
       }*/})
      nightmare
          .goto(req.params.url)
          .inject('js','bundle.js')
          .wait('#detected_json_from_gushitie')
          .evaluate(function () {
            return window.detected_json_from_gushitie
          })
          .end()
          .then(function (result) {
            console.log(result)
            if(!req.state){
              req.state = true
              res.json({status:'ok',json:result});
            }
          })
          .catch(function (error) {
            console.error('Search failed:', error);
          })
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
