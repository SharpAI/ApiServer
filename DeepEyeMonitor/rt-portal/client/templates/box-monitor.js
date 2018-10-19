GetDataBoxMonitor = function() {
  var isHours = true;
  if(!document.getElementById("box-traffic") || !document.getElementById("box-traffic2") || !document.getElementById("box-traffic3"))
    return;
  var options = {};
  var boxTrafficChart = echarts.init(document.getElementById("box-traffic"),'macarons');
  var boxTrafficChart2 = echarts.init(document.getElementById("box-traffic2"),'macarons');
  var boxTrafficChart3 = echarts.init(document.getElementById("box-traffic3"),'macarons');
  var timeLine = 'd';
  var totalcdn = 0;
  var totalraid = 0;
  boxTrafficChart.showLoading({
    text: 'loading...',
    effect: "bubble",
    textStyle: {
      fontSize:20
    }
  });
  boxTrafficChart2.showLoading({
    text: 'loading...',
    effect: "bubble",
    textStyle: {
      fontSize:20
    }
  });
  boxTrafficChart3.showLoading({
    text: 'loading...',
    effect: "bubble",
    textStyle: {
      fontSize:20
    }
  });
  Meteor.call('getBoxMonitorTrafficData', Session.get('monitorBoxId'), $('.box-traffic-time.btn-primary').attr('id'),function(err, data) {
    if(err) throw err;
    if(!Session.get('currentPage') || Session.get('currentPage') != 'box-monitors-alive-traffic')
        return;
    var options = {
      title: {
        text: 'Traffic (sum)'
      },
      backgroundColor: "#ffffff",
      color:['#008000','#3ca2e0','#ff5722'],
      symbolList: ['circle'],
      tooltip:{
        trigger: 'axis',
        formatter: function(params) {
          
          var cdn_speed = bytesToSize(params[0].data);
          var p2p_speed = bytesToSize(params[1].data);
          var upload_speed = bytesToSize(params[2].data);
          var spanStyle = " display:inline-block;height: 10px;width:10px; border-radius:5px; margin-right:5px;";
          var result = '<div style="text-align:justify;">'+
                       '<h4>'+params[0].name+"：</h4>"+
                       '<p><span style="background-color:#008000; '+spanStyle+'"></span>'+params[0].seriesName+"："+cdn_speed+"</p>"+
                       '<p><span style="background-color:#3ca2e0; '+spanStyle+'"></span>'+params[1].seriesName+"："+p2p_speed+"</p>"+
                       '<p><span style="background-color:#ff5722; '+spanStyle+'"></span>'+params[2].seriesName+"："+upload_speed+"</p>";
          return result;
        }
      },
      legend:{
        y: '10px',
        data:['CDN Download','Raid Download','Upload']
      },
      grid: {
        x: '60px',
        x2: '100px',
        y: '60px',
        y2: '60px'
      },
      toolbox:{
        show: true,
        bottom: 0
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data:[]
      },
      yAxis:{
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: function(value,index) {
            return bytesToSize(value);
          }
        }
      },
      dataZoom : {
        show : !isHours,
        realtime : true,
        start : function(){
          var date = new Date();
          return Math(date.getMinutes())/60
        },
        end : 100
      },
      series:[
        {
          name: 'CDN Download',
          type: 'line',
          smooth: true,
          data: []
        },
        {
          name: 'Raid Download',
          type: 'line',
          smooth: true,
          data: []
        },
        {
          name: 'Upload',
          type: 'line',
          smooth: true,
          data: []
        },
         {
            name:'Download Traffic',
            type:'pie',
            tooltip : {
                trigger: 'item',
                formatter: function(params, ticket){
                  if(params.name == 'CDN'){
                    return "Download Traffic<br/> CDN:"+bytesToSize(params.value) + " ["+params.percent + "%]"
                  }
                  if(params.name == 'RAID'){
                    return "Download Traffic<br/> RAID:"+bytesToSize(params.value) + " ["+params.percent + "%]"
                  }
                }
            },
            center: [160,80],
            radius : [0, 30],
            itemStyle :　{
                normal : {
                    labelLine : {
                        length : 20
                    }
                }
            },
            data:[]
        }
      ]
    }
    var options2 = {
      title: {
        text: 'Traffic Download (avg)'
      },
      backgroundColor: "#ffffff",
      color:['#008000','#3ca2e0'],
      symbolList: ['circle'],
      tooltip:{
        trigger: 'axis',
        formatter: function(params) {
          
          var cdn_speed = bytesToSize(params[0].data) + '/s';
          var p2p_speed = bytesToSize(params[1].data) + '/s';
          var spanStyle = " display:inline-block;height: 10px;width:10px; border-radius:5px; margin-right:5px;";
          var result = '<div style="text-align:justify;">'+
                       '<h4>'+params[0].name+"：</h4>"+
                       '<p><span style="background-color:#008000; '+spanStyle+'"></span>'+params[0].seriesName+"："+cdn_speed+"</p>"+
                       '<p><span style="background-color:#3ca2e0; '+spanStyle+'"></span>'+params[1].seriesName+"："+p2p_speed+"</p>";
          return result;
        }
      },
      legend:{
        y: '10px',
        data:['CDN Download','Raid Download']
      },
      grid: {
        x: '60px',
        x2: '100px',
        y: '60px',
        y2: '60px'
      },
      toolbox:{
        show: true,
        bottom: 0
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data:[]
      },
      yAxis:{
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: function(value,index) {
            return bytesToSize(value) +' /s';
          }
        }
      },
      dataZoom : {
        show : !isHours,
        realtime : true,
        start : function(){
          var date = new Date();
          return Math(date.getMinutes())/60
        },
        end : 100
      },
      series:[
        {
          name: 'CDN Download',
          type: 'line',
          smooth: true,
          data: []
        },
        {
          name: 'Raid Download',
          type: 'line',
          smooth: true,
          data: []
        }
      ]
    };

    var options3 = {
      title: {
        text: 'Traffic Total Download and Total Upload (avg)'
      },
      backgroundColor: "#ffffff",
      color:['#008000','#ff5722'],
      symbolList: ['circle'],
      tooltip:{
        trigger: 'axis',
        formatter: function(params) {      
          var download_speed = bytesToSize(params[0].data) + '/s';
          var upload_speed = bytesToSize(params[1].data) + '/s';
          var spanStyle = " display:inline-block;height: 10px;width:10px; border-radius:5px; margin-right:5px;";
          var result = '<div style="text-align:justify;">'+
                       '<h4>'+params[0].name+"：</h4>"+
                       '<p><span style="background-color:#008000; '+spanStyle+'"></span>'+params[0].seriesName+"："+download_speed+"</p>"+
                       '<p><span style="background-color:#ff5722; '+spanStyle+'"></span>'+params[1].seriesName+"："+upload_speed+"</p>";
          return result;
        }
      },
      legend:{
        y: '10px',
        data:['Download','Upload']
      },
      grid: {
        x: '60px',
        x2: '100px',
        y: '60px',
        y2: '60px'
      },
      toolbox:{
        show: true,
        bottom: 0
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data:[]
      },
      yAxis:{
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: function(value,index) {
            return bytesToSize(value) +' /s';
          }
        }
      },
      dataZoom : {
        show : !isHours,
        realtime : true,
        start : function(){
          var date = new Date();
          return Math(date.getMinutes())/60
        },
        end : 100
      },
      series:[
        {
          name: 'Download',
          type: 'line',
          smooth: true,
          data: []
        },
        {
          name: 'Upload',
          type: 'line',
          smooth: true,
          data: []
        }
      ]
    }

    if(data){
      if($('.box-traffic-time.btn-primary').attr('id') == 'd'){
        _.each(data, function(item,index) {
          var hour = new Date(item.hour).getHours();
          var cdn_samples = 0;
          var p2p_samples = 0;
          var download_samples = 0;
          var upload_samples = 0;
          if(hour < 10){
            hour = '0'+hour;
          }
          var ts = hour + ":00";
          options.xAxis.data.push(ts);
          options2.xAxis.data.push(ts);
          options3.xAxis.data.push(ts);

          // total
          options.series[0].data.push((item.hour_cdn_downloaded)>=0?Math.ceil(item.hour_cdn_downloaded):0)
          options.series[1].data.push((item.hour_p2p_downloaded)>=0?Math.ceil(item.hour_p2p_downloaded):0)
          options.series[2].data.push((item.hour_uploaded)>=0?Math.ceil(item.hour_uploaded):0)
          // svm
          options2.series[0].data.push((item.hour_cdn_downloaded)>=0?Math.ceil(item.hour_cdn_downloaded/(item.samples*60)):0)
          options2.series[1].data.push((item.hour_p2p_downloaded)>=0?Math.ceil(item.hour_p2p_downloaded/(item.samples*60)):0)

          options3.series[0].data.push((item.hour_cdn_downloaded >=0 && item.hour_p2p_downloaded >=0)?Math.ceil((item.hour_cdn_downloaded + item.hour_p2p_downloaded)/(item.samples*60)):0)
          options3.series[1].data.push((item.hour_uploaded)>=0?Math.ceil(item.hour_uploaded/(item.samples*60)):0)

          // totalcdn
          totalcdn += (item.hour_cdn_downloaded)>=0?Math.ceil(item.hour_cdn_downloaded):0;
          totalraid += (item.hour_p2p_downloaded)>=0?Math.ceil(item.hour_p2p_downloaded):0;
        });
      } else if($('.box-traffic-time.btn-primary').attr('id') == 'm'){
        _.each(data, function(item,index) {
          var date = item.time;
          var ts = date.getFullYear()+"/"+(Number(date.getMonth())+1)+"/"+date.getDate();
          options.xAxis.data.push(ts);
          options2.xAxis.data.push(ts);
          options3.xAxis.data.push(ts);

          options.series[0].data.push((item.hour_cdn_downloaded)>=0?Math.ceil(item.hour_cdn_downloaded):0)
          options.series[1].data.push((item.hour_p2p_downloaded)>=0?Math.ceil(item.hour_p2p_downloaded):0)
          options.series[2].data.push((item.hour_uploaded)>=0?Math.ceil(item.hour_uploaded):0)
          // svm
          options2.series[0].data.push((item.hour_cdn_downloaded)>=0?Math.ceil(item.hour_cdn_downloaded/(item.samples*60)):0)
          options2.series[1].data.push((item.hour_p2p_downloaded)>=0?Math.ceil(item.hour_p2p_downloaded/(item.samples*60)):0)

          options3.series[0].data.push((item.hour_cdn_downloaded >=0 && item.hour_p2p_downloaded >= 0)?Math.ceil((item.hour_cdn_downloaded + item.hour_p2p_downloaded)/(item.samples*60)):0)
          options3.series[1].data.push((item.hour_uploaded)>=0?Math.ceil(item.hour_uploaded/(item.samples*60)):0)

          // totalcdn
          totalcdn += item.hour_cdn_downloaded;
          totalraid += item.hour_p2p_downloaded;
        });
      } else {
        _.each(data, function(item,index) {
          var ts = item.time.getHours()+":"+item.time.getMinutes();
          options.xAxis.data.push(ts);
          options2.xAxis.data.push(ts);
          options3.xAxis.data.push(ts);

          options.series[0].data.push((item.cdn_downloaded)>=0?Math.ceil(item.cdn_downloaded):0)
          options.series[1].data.push((item.p2p_downloaded)>=0?Math.ceil(item.p2p_downloaded):0)
          options.series[2].data.push((item.uploaded)>=0?Math.ceil(item.uploaded):0)// totalcdn

          // svm
          options2.series[1].data.push((item.p2p_downloaded)>=0?Math.ceil(item.p2p_downloaded/(item.perMinSamples*60)):0)
          options2.series[0].data.push((item.cdn_downloaded)>=0?Math.ceil(item.cdn_downloaded/(item.perMinSamples*60)):0)

          options3.series[0].data.push((item.cdn_downloaded >=0 && item.p2p_downloaded >= 0)?Math.ceil((item.cdn_downloaded + item.p2p_downloaded)/(item.perMinSamples*60)):0)
          options3.series[1].data.push((item.uploaded)>=0?Math.ceil(item.uploaded/(item.perMinSamples*60)):0)
          totalcdn += item.cdn_downloaded;
          totalraid += item.p2p_downloaded;
        });
        
      }
      options.series[3].data.push({name:'CDN',value: totalcdn});
      options.series[3].data.push({name: 'RAID', value: totalraid});
    }
    // console.table(options2)
    boxTrafficChart.hideLoading();
    boxTrafficChart2.hideLoading();
    boxTrafficChart3.hideLoading();

    boxTrafficChart.setOption(options);
    boxTrafficChart2.setOption(options2);
    boxTrafficChart3.setOption(options3);

    boxTrafficChart.connect([boxTrafficChart2,boxTrafficChart3]);
    boxTrafficChart2.connect([boxTrafficChart,boxTrafficChart3]);
    boxTrafficChart3.connect([boxTrafficChart,boxTrafficChart2]);
  });
};

Template.boxMonitorTraffic.rendered = function() {
  Session.set('noTrafficData','loading')
  $(".box-traffic-chart").css({
    width: Math.floor($(window).width()*0.75)  + 'px',
    height: Math.floor($(window).height()*0.30)  + 'px'
  });
  window.onresize = function(){
    $(".box-traffic-chart").css({
      width: Math.floor($(window).width()*0.75)  + 'px',
      height: Math.floor($(window).height()*0.30)  + 'px'
    });
  }
  GetDataBoxMonitor();
  if($('.box-traffic-time.btn-primary').attr('id') === 'h'){
    boxMonitorChartInterval = window.setInterval(GetDataBoxMonitor, 60*1000);
  }
};

Template.boxMonitorTraffic.events({
  'click .box-traffic-time': function(e){
    $('.box-traffic-time').removeClass('btn-primary');
    $(e.currentTarget).addClass('btn-primary');
    GetDataBoxMonitor();
    if($('.box-traffic-time.btn-primary').attr('id') === 'h'){
      boxMonitorChartInterval = window.setInterval(GetDataBoxMonitor, 60*1000);
    } else {
      boxMonitorChartInterval =  window.clearInterval(boxMonitorChartInterval);
    }
  }
});

Template.boxMonitorTraffic.onDestroyed(function() {
  boxMonitorChartInterval = window.clearInterval(boxMonitorChartInterval);
});

Template.boxMonitorTraffic.helpers({
  boxInfo: function() {
    if(Session.get("monitorBoxComment")){
      return Session.get("monitorBoxComment") + " ["+Session.get("monitorBoxId")+"]";
    } else {
      return "["+Session.get("monitorBoxId")+"]";
    }
  }
});


Template.boxMonitorsAlive.events({
  'click .check-out': function (e) {
     Router.go('/dashboard/box-monitors/traffic')
    Session.set('monitorBoxId',e.currentTarget.id)
  }
});

Template.boxMonitorsAlive.helpers({
    calcDiffTime:function(updatedBy){
      var now = new moment(new Date())
      var then = new Date(updatedBy)
      return moment.duration(now.diff(then)).humanize()
    },
    getAddressFromIP:function(ip){
      if(this.location){
        return this.location
      }
      console.log(this)
      if(ip && ip != ''){
        var session_str='userLocation_'+ip
        var self=this
        //Session.set(session_str, '');
        Meteor.defer(function(){
          var url = "http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js&ip=" + ip;
          $.getScript(url, function(data, textStatus, jqxhr) {
            var address;
            console.log('status is ' + textStatus);
            address = '';
            if (textStatus === 'success' && remote_ip_info && remote_ip_info.ret === 1) {
              console.log('Remote IP Info is ' + JSON.stringify(remote_ip_info));
              if (remote_ip_info.country && remote_ip_info.country !== '' && remote_ip_info.country !== '中国') {
                address += remote_ip_info.country;
                address += ' ';
              }
              if (remote_ip_info.province && remote_ip_info.province !== '') {
                address += remote_ip_info.province;
                address += ' ';
              }
              if (remote_ip_info.city && remote_ip_info.city !== '' && remote_ip_info.city !== remote_ip_info.province) {
                address += remote_ip_info.city;
                console.log('Address is ' + address+' session_str is '+session_str);
              }
              if (address !== '') {
                Session.set(session_str, address);
              } else {
                address = '未知'
                Session.set(session_str, '未知');
              }
              console.log(peerCollection.findOne({_id:self._id}))
              peerCollection.update({_id:self._id},{$set:{location:address}})
            }
          });
        })
        return Session.get(session_str)
      }
    },
    totalClient: function(){
      return peerCollection.find().count();
    },
    counter: function () {
      return Session.get('counter');
    },
    peersInfo: function(){
      var limit = 10;
      var page = Session.get('boxMonitorPage');
      return peerCollection.find({},{limit:limit, skip:(page-1)*limit});
    },
    inactivePeersInfo: function(){
      var limit = 10;
      var page = Session.get('boxMonitorPage');
      return inactiveClientCollection.find({},{limit:limit, skip:(page-1)*limit});
    },
    totalInactiveClient: function(){
      return inactiveClientCollection.find().count();
    },
    ceil: function(num){
      return Math.ceil(num/4)
    },
    bytesToSize: function(bytes) {
      var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      if (bytes == 0) return '0 B';
      if(typeof bytes === 'number'){
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
        if (i == 0) return bytes + ' ' + sizes[i];
        return (bytes / Math.pow(1000, i)).toFixed(1) + ' ' + sizes[i];
      } else {
        return 'N/A'
      }
    },
    bytesToSizePerSeconds: function(bytes){
      var sizes = ['B/S', 'KB/S', 'MB/S', 'GB/S', 'TB/S'];
      if (bytes == 0) return '0 B/S';
      if(typeof bytes === 'number'){
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
        if (i == 0) return bytes + ' ' + sizes[i];
        return (bytes / Math.pow(1000, i)).toFixed(1) + ' ' + sizes[i];
      } else {
        return 'N/A'
      }
    },
    isAliveBoxMonitorTab: function() {
      return Session.equals('currBoxMonitorTab', 'alive')
    },
    currPage: function() {
      return Session.get('boxMonitorPage');
    },
    isBoxConfiging: function(clientID){
      var res = peerCollection.findOne({clientID: clientID});
      if (res && res.boxCfgServer && res.boxCfgServer.status && res.boxCfgServer.status == 'waiting') {
        return false;
      }else {
        return true;
      }
    },
    notAllowConfigBox: function(){
      return Session.get('currentConfigBoxInfo') && Session.get('currentConfigBoxInfo').status && Session.get('currentConfigBoxInfo').status == 'waiting'?true:false;
    },
    isboxConfigOEnable: function(){
      return Session.get('currentConfigBoxInfo') && Session.get('currentConfigBoxInfo').isEnable?Session.get('currentConfigBoxInfo').isEnable:true;
    },
    currBoxNameing: function(){
      var comment = '';
      if(Session.get('monitorBoxComment')){
        comment = Session.get('monitorBoxComment')
      }
      return comment+' [ '+Session.get('monitorBoxId')+' ] ';
    },
    CurrDownConfig: function(){
      var kbitArr = [300,500,700,900];
      var mbitArr = [1,3,5,7,9];
      var configOption = '';
      for(var i =0 ;i< kbitArr.length;i++ ){
        if(Session.get('currentConfigBoxInfo') && Session.get('currentConfigBoxInfo').download_limit == 1024*kbitArr[i]){
          configOption += '<option value="'+1024*kbitArr[i]+'" selected>'+kbitArr[i]+" KB/s</option>";
        } else {
          configOption += '<option value="'+1024*kbitArr[i]+'">'+kbitArr[i]+" KB/s</option>";
        }
      }
      for(var i =0 ;i< mbitArr.length;i++ ){
        if(Session.get('currentConfigBoxInfo') && Session.get('currentConfigBoxInfo').download_limit == 1048576*mbitArr[i]){
          configOption += '<option value="'+1048576*mbitArr[i]+'" selected>'+mbitArr[i]+" MB/s</option>";
        } else {
          configOption += '<option value="'+1048576*mbitArr[i]+'">'+mbitArr[i]+" MB/s</option>";
        }
      }
      return configOption;
    },
    CurrUpConfig: function(){
      var kbitArr = [100,300,500,700,900];
      var mbitArr = [1,3,5,7,9];
      var configOption = '';
      for(var i =0 ;i< kbitArr.length;i++ ){
        if(Session.get('currentConfigBoxInfo') && Session.get('currentConfigBoxInfo').upload_limit == 1024*kbitArr[i]){
          configOption += '<option value="'+1024*kbitArr[i]+'" selected>'+kbitArr[i]+" KB/s</option>";
        } else {
          configOption += '<option value="'+1024*kbitArr[i]+'">'+kbitArr[i]+"KB/s</option>";
        }
      }
      for(var i =0 ;i< mbitArr.length;i++ ){
        if(Session.get('currentConfigBoxInfo') && Session.get('currentConfigBoxInfo').upload_limit == 1048576*mbitArr[i]){
          configOption += '<option value="'+1048576*mbitArr[i]+'" selected>'+mbitArr[i]+" MB/s</option>";
        } else {
          configOption += '<option value="'+1048576*mbitArr[i]+'">'+mbitArr[i]+" MB/s</option>";
        }
      }
      return configOption;
    },
    osInfoPercent: function (res) {
      if (res == false) {
        return '0%';
      } else {
        return (res * 100).toFixed(1) + '%';
      }
    },
    osInfoBlank: function (res){
      if(res == false) {
        return '0';
      } else {
        return (res/1000).toFixed(2) + '℃';
      }
    },
    osInfoTime: function (res) {
      if (res == false) {
        return '0';
      } else {
        var min = Math.floor(res % 3600);
        return Math.floor(res/3600) + "h" + Math.floor(min / 60) + "m";
      }
    },
    cfgInfo: function (res) {
      if (res == false) {
        return "否";
      } else {
        return "是";
      }
    },
    isChecked: function(){
      var uuid = Session.get('monitorBoxId');
      var res = Devices.findOne({uuid: uuid});
      if(res && res.autoUpdate){
        return 'checked'
      } else {
        return ''
      }
    },
    verInfo: function () {
      var cid = Session.get('monitorBoxId');
      var res = peerCollection.findOne({clientID: cid});
      var str = '';
      if (res && res.version && res.version.v2 && res.version.v2 != 'unknown') {
        for (const key in res.version.v2) {
          if (res.version.v2.hasOwnProperty(key)) {
            str += '<tr>'
                + '<td style="text-align:right;">' + key + '：</td>'
                + '<td style="text-align:left;">' + res.version.v2[key] + '</td>'
                + '</td>'
          }
        }
      } else {
        str = 'unknown'
      }
      return str;
    }
  });
Template.boxMonitorsAlive.rendered = function(){
  Session.set('currBoxMonitorTab', 'alive');
  Session.set('boxMonitorPage',1);
}
Template.boxMonitorsAlive.events({
  'click .box-monitor-status': function(e){
    Session.set('boxMonitorPage',1);
    $('.box-monitor-status').removeClass('btn-primary');
    $(e.currentTarget).addClass('btn-primary')
    Session.set('currBoxMonitorTab', e.currentTarget.id)
  },
  'click #prev': function(){
    var page = Session.get('boxMonitorPage');
    if(page > 1){
      page--;
    }
    Session.set('boxMonitorPage',page);
  },
  'click #next': function(){
    var page = Session.get('boxMonitorPage');
    if(page * 10 < Template.boxMonitorsAlive.__helpers.get('totalClient')() && Session.equals('currBoxMonitorTab', 'alive')){
      page++;
      Session.set('boxMonitorPage',page);
    }
    if(page * 10 < Template.boxMonitorsAlive.__helpers.get('totalInactiveClient')() && Session.equals('currBoxMonitorTab', 'inactive')){
      page++;
      Session.set('boxMonitorPage',page);
    }
  },
  // box Config
  'click .box-config, click .check-out': function (e) {
    Session.set("monitorBoxId", e.currentTarget.id);
    var doc = peerCollection.findOne({clientID: e.currentTarget.id}) || inactiveClientCollection.findOne({clientID: e.currentTarget.id});
    Session.set('monitorBoxComment', doc.comment);
    Session.set('currentConfigBoxInfo',doc.boxCfgServer);
    Meteor.subscribe('devices-by-uuid', e.currentTarget.id, function() {
  });
  },
  'click #saveBoxConfig': function(e,t){
    var enable = $("input[name=boxEnable]:checked").val();
    // var download_limit = $("#download-speed").find("option:selected").val();
    // var upload_limit = $("#upload-speed").find("option:selected").val();
    if(enable === 'true'){
      enable = true;
    } else {
      enable = false;
    }
    // Meteor.call('setBoxConfig',{
    //   clientID: Session.get('monitorBoxId'),
    //   autoUpdate: enable,
    //   // upload_limit: upload_limit,
    //   // download_limit: download_limit,
    //   status: 'waiting'
    // });
    $("#boxConfigModal").modal('hide');
  },
  'click #switch_update': function(e,t){
    var res = Devices.findOne({uuid: Session.get('monitorBoxId')})
    if(res && res.autoUpdate){
        Devices.update({_id:res._id},{$set:{autoUpdate:false}})
    } else {
      Devices.update({_id:res._id},{$set:{autoUpdate:true}})
    }
    return;
  },
  'click .box-ver': function(e) {
    var cid = $(e.currentTarget).data('id');
    Session.set("monitorBoxId",cid);
  },
  // ,
  // 'click .update-config, click .check-out': function (e) {
  //   var doc = peerCollection.findOne({clientID: e.currentTarget.id}) || inactiveClientCollection.findOne({clientID: e.currentTarget.id});
  //   // Session.set('monitorBoxComment', doc.comment);
  //   // Session.set('currentConfigBoxInfo',doc.boxCfgServer);
  // }
});
