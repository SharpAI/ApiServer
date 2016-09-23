var ip2loc = require("ip2location-nodejs");
// var ip2loc = require("./ip2location.js");

// ip2loc.IP2Location_init("/root/testnodejs/db24.BIN");
ip2loc.IP2Location_init("./IP2LOCATION-LITE-DB11.BIN");

var testip = ['8.8.8.8', '2404:6800:4001:c01::67', '2001:0200:0102:0000:0000:0000:0000:0000', '2001:0200:0135:0000:0000:0000:0000:0000', '2001:0200:017A:0000:0000:0000:0000:0000', '2404:6800:4001:c01::93', '::FFFF:8.8.8.8', '0000:0000:0000:0000:0000:FFFF:8.8.8.8', '::8.8.8.8.8'];
// testip = ['8.8.8.8', '2404:6800:4001:c01::93'];

for (var x = 0; x < testip.length; x++) {
	var country = ip2loc.IP2Location_get_country_long(testip[x]);
	var city = ip2loc.IP2Location_get_city(testip[x]);
	console.log( testip[x] +': '+country+'/'+city);
	// console.log(result);
	console.log("--------------------------------------------------------------");
}


var restify = require('restify');

/*request('http://www.google.com', function (error, response, body) {
 if (!error && response.statusCode == 200) {
 console.log(body) // Show the HTML for the Google homepage.
 }
 })*/

var server = restify.createServer({
	name: 'Location Server',
	version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS({
	// Defaults to ['*'].
	//origins: ['https://foo.com', 'http://bar.com', 'http://baz.com:8081'],
	origins: ['*'],
	// Defaults to false.
	credentials: false

}));

server.get('/echo/:name', function (req, res, next) {
	setTimeout(function(){
		res.send({test:req.params.name});
		return next();
	})
});
server.get('/ip/:ip', function (req, res, next) {
	var ip = req.params.ip;
	var country = ip2loc.IP2Location_get_country_long(ip);
	var city = ip2loc.IP2Location_get_city(ip);
	var result =''
	if(country && country !== '?'){
		result += country;
	} else if(city && city !=='?'){
		result += city;
		res.send({location:result});
		return next();
	}
	if(city && city !=='?') {
		result += ', ' + city;
		res.send({location: result});
		return next();
	}

	res.send({});
	return next();
});

server.listen(8080, function () {
	console.log('%s listening at %s', server.name, server.url);
});