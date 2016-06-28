var request=require('request')
var cheerio = require('cheerio')

request('http://192.168.99.100:5000/'+'https://mp.weixin.qq.com/s?__biz=MzA4ODc2MjQ4Ng==&mid=2661188553&idx=1&sn=98d13920a5455ee49efa411d8cacb172&scene=0&key=77421cf58af4a653228c3c9fbfba94099c44a0db67cd05ab7d1b7ac46ee84727119799dfa3871b82716bcb22c658feb3&ascene=0&uin=Mjk1NjAwMzc4MA%3D%3D&devicetype=iMac+MacBookPro9%2C2+OSX+OSX+10.11.6+build(15G7a)&version=11020201&pass_ticket=tLeKE5qjRcMrHqEYM53ZAJZwkW6aaRslwavnPwYAiFZxs6SNHqURWGsFYLtdwuZT', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body) // Show the HTML for the Google homepage.
    var $=cheerio.load(body)
  }
})

