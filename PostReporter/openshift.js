/**
 * Created by simba on 9/6/16.
 */



if(process.env.OPENSHIFT_NODEJS_IP){
    var http = require('http');
    var ipaddress = process.env.OPENSHIFT_NODEJS_IP;
    var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;
    http.createServer(function(request, response) {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("<!DOCTYPE \"html\">");
        response.write("<html>");
        response.write("<head>");
        response.write("<title>Hello World Page</title>");
        response.write("</head>");
        response.write("<body>");
        response.write("Hello World!");
        response.write("</body>");
        response.write("</html>");
        response.end();
    }).listen(port,ipaddress);
}