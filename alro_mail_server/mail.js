var Imap = require('imap')
var MailParser = require('mailparser').MailParser
var fs = require("fs")
var cheerio = require('cheerio')
var puppeteer = require('puppeteer');

var imap = new Imap({
  user: "sharpai20181@gmail.com", //'sharpai20182@gmail.com', //"sharpai20181@gmail.com",
  password: "vEd-Psv-Y8F-YwN", //'Bxrx8601', //"vEd-Psv-Y8F-YwN"
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  keepalive: true,
  tlsOptions: { rejectUnauthorized: false }
});


var socket = require('socket.io-client')('http://localhost:3000');
socket.on('connect', function(){
    console.log("connect")
});

socket.on('message', function (message) {
	console.log("message:", message)				
});

socket.on('event', function(data){});
socket.on('disconnect', function(){
     console.log("disconnect")
});

function postMessage(message){
	if (socket) {
		socket.emit('message', message);
    }
}



//var browser
//var page


(async () => {
    
})();

async function asyncCall(url, msg, cb) {
    var browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox']});
    var page = await browser.newPage();
    await page.goto(url);

    const aHandle = await page.evaluateHandle(() => document.body);
    const resultHandle = await page.evaluateHandle(body => body.innerHTML, aHandle);
    
    const $ = cheerio.load(await resultHandle.jsonValue())
    var ls = $('video').find('source').get()
    for (i in ls) {
        if (ls[i].attribs.src){
            var video_src = ls[i].attribs.src
            console.log(video_src)
            postMessage(video_src)
            if (cb){
                cb(video_src, msg)    
            }
            break;
        }
    }
    
    await browser.close();
}


imap.on('ready', function() {
    console.log('Connection ready');
    imap.openBox('INBOX', false, function(err, box) {
        console.log('Got inbox', box.messages.total);
    });
});


imap.on('mail', function(mail) {
    console.log('New mail', mail);
    imap.search([ 'UNSEEN', ['SINCE', 'March 22, 2018'] ], function(err, results) {
        if (err) throw err;
        try {
            var fetch = imap.fetch(results, { bodies: '', struct: true });
        } catch(error) {
            //fetch throws an exception if no errors are found
            console.log('no messages were found meeting search criteria');
            
            //imap.end();
            return
            //process.exit();
        }
        fetch.on('message', function(msg, seqno) {
            
            var prefix = '(#' + seqno + ') ';
            var buffer = '';
            var mailParser = new MailParser({ streamAttachments: true });
            
            msg.once('attributes', function (attrs) {
                console.log("attributes", attrs.uid)
                var uid = attrs.uid
                
                mailParser.on('data', function(data) {
                    if(data.type === 'text'){
                        const $ = cheerio.load(data.html)
                        
                        var ls = $('p').find('a').get()
                        for (i in ls) {
                            if (ls[i].attribs.href){
                                var href = ls[i].attribs.href
                                console.log(href)
                                asyncCall(href, uid, function(url, uid){
                                    console.log("cb", url,  uid)
                                    
                                    imap.addFlags(uid, ['\\Seen'], function (err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log("Marked as read!", uid)
                                        }
                                    });    
                                })
                                break;
                            }
                        }
                    }
                });
            })
            
            mailParser.on('headers', function(headers){
                console.log(prefix +headers.get('date') +  headers.get('subject'));
            });
            
            mailParser.on('end', function(mail_object) {
              //console.log('in mailParser::end');
            });
            //console.log('Message ' + prefix);
            msg.on('body', function(stream, info) {
              stream.on('data', function(chunk) {
                //build buffer with all the pieces of the mail message
                buffer += chunk.toString('utf8');
              });
              stream.once('end', function() {
                //send the entire mail message to mailParser
                //console.log(prefix + " writing buffer to mailParser");
                mailParser.write(buffer); 
              });
            });
            msg.once('end', function() {
              //console.log(prefix + 'Finished, calling mailParser');
              mailParser.end();
            });
            
            
        })
        
        fetch.once('error', function(err) {
            console.log('Fetch error: ' + err);
        });
        
        fetch.once('end', function() {
            console.log('Done fetching all messages!');
            //imap.end();
        });
    
    })
});


imap.on('error', function(err) {
  console.log(err);
});

imap.on('end', function() {
  console.log('Connection ended');
});


imap.on('close', function() {
  console.log('Connection close');
  setTimeout(function() {
    console.log('Connection reconnect2');
    imap.connect();    
  }, 10000);
});
imap.connect();
