/**
 * Created by simba on 6/28/16.
 */
var electronWorkers = require('electron-workers')({
    connectionMode: 'ipc',
    pathToScript: 'worker.js',
    timeout: 15000,
    numberOfWorkers: 5
});
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router


electronWorkers.start(function(startErr) {
    if (startErr) {
        return console.error(startErr);
    }

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

            electronWorkers.execute({ url: req.params.url}, function(err, data) {
                if (err) {
                    res.json({status:'error'});
                    return console.error(err);
                }

                console.log(JSON.stringify(data)); // { value: 'someData' }
                //electronWorkers.kill(); // kill all workers explicitly
                res.json({status:'ok',json:data});
            });
        });
    // REGISTER OUR ROUTES -------------------------------
    // all of our routes will be prefixed with /api
    app.use('/import', router);

    // START THE SERVER
    // =============================================================================
    app.listen(port);

    console.log('Magic happens on port ' + port);
    let url='https://mp.weixin.qq.com/s?__biz=MzA4ODc2MjQ4Ng==&mid=2661188553&idx=1&sn=98d13920a5455ee49efa411d8cacb172&scene=0&key=77421cf58af4a653228c3c9fbfba94099c44a0db67cd05ab7d1b7ac46ee84727119799dfa3871b82716bcb22c658feb3&ascene=0&uin=Mjk1NjAwMzc4MA%3D%3D&devicetype=iMac+MacBookPro9%2C2+OSX+OSX+10.11.6+build(15G7a)&version=11020201&pass_ticket=tLeKE5qjRcMrHqEYM53ZAJZwkW6aaRslwavnPwYAiFZxs6SNHqURWGsFYLtdwuZT'
    // `electronWorkers` will send your data in a POST request to your electron script
    electronWorkers.execute({ url: url}, function(err, data) {
        if (err) {
            return console.error(err);
        }

        console.log(JSON.stringify(data)); // { value: 'someData' }
        //electronWorkers.kill(); // kill all workers explicitly
    });
});

