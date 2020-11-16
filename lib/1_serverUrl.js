server_domain_name = (typeof process !== "undefined" && process !== null ? process.env.SERVER_DOMAIN_NAME : void 0) || "workaicdn.tiegushi.com";
//测试版
//server_domain_name = "testworkai.tiegushi.com";
if (withZhiFaCDN) {
  server_domain_name = "cdcdn.tiegushi.com:8080";
}
chat_server_url = 'chat.tiegushi.com';
sign_server_url = 'http://sign.tiegushi.com:8080/sign/';
import_server_url = 'http://urlanalyser.tiegushi.com:8080/import';
import_cancel_url = 'http://urlanalyser.tiegushi.com:8080/import-cancel';
ddp_alter_url = (typeof process !== "undefined" && process !== null ? process.env.DDP_ALTER_URL : void 0) || 'ws://localhost:5000/websocket';
// import_server_url = 'http://192.168.1.84:8080/import';
// import_cancel_url = 'http://192.168.1.84:8080/import-cancel';
server_url = (typeof process !== "undefined" && process !== null ? "http://"+process.env.SERVER_DOMAIN_NAME : void 0) || Meteor.getRootUrl();
rest_api_url = server_url;
version_host_url = 'http://data.tiegushi.com/versions/workaiversion.json?t='+(Date.now());
deepVideoServer = 'http://192.168.0.117:8000';
review_post_url = server_url + '/restapi/postInsertHook/';
//review_post_url = 'http://192.168.1.65:5000/restapi/postInsertHook/';


if(Meteor.isServer){
  var mqttHost=process.env.MQTT_BROKER_ADDRESS ? process.env.MQTT_BROKER_ADDRESS:"mqttserver";
  var mqttPort=process.env.MQTT_BROKER_PORT ? process.env.MQTT_BROKER_PORT :"1883";
  mqttURL = 'mqtt://'+mqttHost+':'+mqttPort
}
