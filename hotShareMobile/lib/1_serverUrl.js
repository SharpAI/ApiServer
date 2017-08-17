//server_domain_name = "workaicdn.tiegushi.com";
//测试版
server_domain_name = "testworkai.tiegushi.com";
if (withZhiFaCDN) {
  server_domain_name = "cdcdn.tiegushi.com:8080";
}
chat_server_url = 'chat.tiegushi.com';
//import_server_url = 'urlanalyser.tiegushi.com';
import_server_url = 'http://urlanalyser.tiegushi.com:8080/import';
import_cancel_url = 'http://urlanalyser.tiegushi.com:8080/import-cancel';
IMPORT_SERVER_PORT = 8080;
rest_api_url = "http://"+server_domain_name;
version_host_url = 'http://data.tiegushi.com/versions/workaiversion.json?t='+(Date.now());