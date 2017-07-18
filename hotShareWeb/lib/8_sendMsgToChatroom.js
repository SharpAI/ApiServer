if(Meteor.isServer){
  Meteor.startup(function(){
  var allPerson=[
  {
      //lambda
      "id": "897423",
      "name": "lambda",
      "imgurl":[
      "http://onm4mnb4w.bkt.clouddn.com/b50cf316-2b02-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/e07ff9a8-2b02-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/fba20d86-2b05-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/16e5888e-2b06-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/b6f34158-2b11-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/b644cebe-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/f402621c-2bf3-11e7-a7cc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/c0313062-2bf3-11e7-a7cc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/c2bca06e-2bf3-11e7-a7cc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/b3666432-2b18-11e7-9bfc-d065caa81a04"]
      },
      {
      //zxs
      "id": "67124",
      "name": "zxs",
      "imgurl":[
      "http://onm4mnb4w.bkt.clouddn.com/7818661a-2b03-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/fc9f9876-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/fbd0df22-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/fd6ced4e-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/10b2dd0a-2b19-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/fc9f9876-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/ffd65534-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/ff02a5ea-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/56f1df92-2bf4-11e7-a7cc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/fe34e632-2b18-11e7-9bfc-d065caa81a04"]
      },
      {
      //lfw
      "id": "906765",
      "name": "lfw",
      "imgurl":[
      "http://onm4mnb4w.bkt.clouddn.com/3df82d2c-2b11-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/3fb92fd0-2b11-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/4624b98e-2b11-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/ab16d0fa-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/27dea1e2-2bc0-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/28bcf1e0-2bc0-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/298ac61a-2bc0-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/2a42d26e-2bc0-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/2bc36a68-2bc0-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/ab16d0fa-2b18-11e7-9bfc-d065caa81a04"]
      },
      {
      //zj
      "id": "12967",
      "name": "zj",
      "imgurl":[
      "http://onm4mnb4w.bkt.clouddn.com/8855772a-2b0d-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/ad3d6c28-2b0d-11e7-9bfc-d065caa81a04"]
      },
      {
      //gfb
      "id": "902834",
      "name": "gfb",
      "imgurl":[
      "http://onm4mnb4w.bkt.clouddn.com/618de51a-2b11-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/667917ac-2b11-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/6e4c35ea-2b11-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/6d6a5e40-2b11-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/6c8a9a08-2b11-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/dee2ea22-2bbd-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/ecef1fb4-2bbd-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/3a8418ec-2bbe-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/ecef1fb4-2bbd-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/5cfde7b8-2bbe-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/8e4f83f6-2b11-11e7-9bfc-d065caa81a04"]
      },
      {
      //srp
      "id": "63276",
      "name": "srp",
      "imgurl":[
      "http://workaiossqn.tiegushi.com/00b3c326-15eb-11e7-8cfb-0242ac11000a",
      "http://onm4mnb4w.bkt.clouddn.com/6fb1b2f6-2b12-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/da577630-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/e1d96328-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/e2e26e22-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/e07c37d0-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/e1293df4-2b18-11e7-9bfc-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/cd02e6c8-2bbc-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/cfd83eb6-2bbc-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/c3f38d76-2bbc-11e7-bd74-d065caa81a04",
      "http://onm4mnb4w.bkt.clouddn.com/da577630-2b18-11e7-9bfc-d065caa81a04"]
      }
  ]

  function getRandom1000() {
      var ret = Math.ceil(1000*Math.random())
      return ret;
  }

  function initPeopleInOut(uuidIn, uuidOut) {
      var timeLine=[];
      var duration=(60*60); //1hour

      for(var i=0; i<duration; i++) {
          timeLine.push({id: i, people: [], sent: false})
      }

      minInOut=30;  //30s
      maxInOut=600; //600s
      minDuration=10;
      maxDuration=600;

      for(var k=0; k<allPerson.length; k++) {
          for(var i=0; i<timeLine.length;) {
              var random = getRandom1000();
              var nextOut = (i + random % maxInOut) % (timeLine.length);
              var skip = (random % maxDuration);

              if (i!=0 && ((nextOut - i) >= minDuration)) {
                  var imgurl = allPerson[k].imgurl;
                  var len = imgurl.length;
                  var urlIn = imgurl[random % len];
                  var urlOut = imgurl[(random + 1) % len];
                  var accuracy = 0.85 + (random/1000) % 0.12
                  var fuzziness = 5 + random%5

                  accuracy = accuracy.toFixed(2)
                  timeLine[i].people.push({id: allPerson[k].id, uuid: uuidIn, imgurl: urlIn, accuracy: accuracy, fuzziness: fuzziness});
                  timeLine[nextOut].people.push({id: allPerson[k].id, uuid: uuidOut, imgurl: urlOut, accuracy: accuracy, fuzziness: fuzziness});
              }
              i = nextOut + skip;
          }
      }
      return timeLine;
  }

  function sendMessage2Group(idx, timeline) {
      if(idx >= timeline.length)
          return;

      item = timeline[idx];
      if(item && item.people && item.people.length && item.people.length >0 && item.sent == false) {
          var people = item.people;
          //console.log('>>> ' + idx + ' ' + JSON.stringify(item.people));
          for(var i=0; i<people.length; i++) {
              var id = people[i].id;
              var uuid = people[i].uuid;
              var img_url = people[i].imgurl;
              var accuracy = people[i].accuracy;
              var fuzziness = people[i].fuzziness;
              insert_msg2forTest(id, img_url, uuid, accuracy, fuzziness);
          }
          item.sent = true;
      }
  }

  var idx = 0;
  var timeline = [];
  var speed=1;

  onSomeOneregistered_forTest = function() {
      if (speed = 1)
          speed = 20;
  }

  /*
  if(process.env.SEND_TEST_MESSAGE){
      Meteor.setInterval(function(){
          if(process.env.RESPECT_WORKING_HOUR){
              var d = new Date();
              var n = d.getHours();
              var day = d.getDay();
              if (n<20 && n>7 && day !== 6 && day !==0){
                  //console.log('Working hour')
              } else {
                  //console.log('Not working hour')
                  return;
              }
          }
          if (!timeline || idx >= timeline.length) {
              var uuidIn = 'ZTEBA510'
              var uuidOut = '7249c9d4'
              timeline = [];
              timeline = initPeopleInOut(uuidIn, uuidOut);
              idx = 0;
          }

          for(var i=0; i< speed; i++) {
              sendMessage2Group(idx, timeline);
              idx++;
          }
          speed = (speed <=1)? 1:(speed -1);
      }, 1000*60); // 10 分钟
  }*/
  });
}

