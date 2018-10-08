GetDataBox = function() {
  var isHours = true;
  if(!document.getElementById("chart-box-download") || !document.getElementById("chart-box-upload"))
    return;
  var timeLine = 'd';
  var boxChart = echarts.init(document.getElementById("chart-box-download"),'macarons');
  var boxChart2 = echarts.init(document.getElementById("chart-box-upload"),'macarons');
  var boxLoading = {
    text: 'loading...',
    effect: "bubble",
    textStyle: {
      fontSize:20
    }
  };
  boxChart.showLoading(boxLoading);
  boxChart2.showLoading(boxLoading);
  var totalcdn = 0;
  var totalraid = 0;
  
  Meteor.call('getBoxData', Meteor.userId(), $('.box-chart-time.btn-primary').attr('id'),function(err, data) {
    if(err) throw err;

    if(!Session.get('currentPage') || Session.get('currentPage') != 'box')
        return;
    var options = {
      title: {
        text: 'Download Traffic'
      },
      backgroundColor: "#ffffff",
      color: ['#008000', '#3ca2e0'],
      symbolList: ['circle'],
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {

          var cdn_downloaded = bytesToSize(params[0].data);
          var p2p_downloaded = bytesToSize(params[1].data);
          var spanStyle = " display:inline-block;height: 10px;width:10px; border-radius:5px; margin-right:5px;";
          var result = '<div style="text-align:justify;">' +
            '<h4>' + params[0].name + "：</h4>" +
            '<p><span style="background-color:#008000; ' + spanStyle + '"></span>' + params[0].seriesName + "：" + cdn_downloaded + "</p>" +
            '<p><span style="background-color:#3ca2e0; ' + spanStyle + '"></span>' + params[1].seriesName + "：" + p2p_downloaded + "</p>";
          return result;
        }
      },
      legend: {
        y: '10px',
        data: ['CDN Download', 'Raid Download']
      },
      grid: {
        x: '60px',
        x2: '100px',
        y: '60px',
        y2: '60px'
      },
      toolbox: {
        show: true,
        bottom: 0
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: []
      },
      yAxis: {
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: function (value, index) {
            return bytesToSize(value);
          }
        }
      },
      series: [
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
          name: 'Download Traffic',
          type: 'pie',
          tooltip: {
            trigger: 'item',
            formatter: function (params, ticket) {
              if (params.name == 'CDN') {
                return "Download Traffic<br/> CDN:" + bytesToSize(params.value) + " [" + params.percent + "%]"
              }
              if (params.name == 'RAID') {
                return "Download Traffic<br/> RAID:" + bytesToSize(params.value) + " [" + params.percent + "%]"
              }
            }
          },
          center: [160, 130],
          radius: [0, 50],
          itemStyle: {
            normal: {
              labelLine: {
                length: 20
              }
            }
          },
          data: []
        }
      ]
    };
    var options2 = {
      title: {
        text: 'Upload Traffic'
      },
      backgroundColor: "#ffffff",
      color: ['#ff5722'],
      symbolList: ['circle'],
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          var upload_speed = bytesToSize(params[0].data);
          var spanStyle = " display:inline-block;height: 10px;width:10px; border-radius:5px; margin-right:5px;";
          var result = '<div style="text-align:justify;">' +
            '<h4>' + params[0].name + "：</h4>" +
            '<p><span style="background-color:#ff5722; ' + spanStyle + '"></span>' + params[0].seriesName + "：" + upload_speed + "</p>";
          return result;
        }
      },
      legend: {
        y: '10px',
        data: ['Upload']
      },
      grid: {
        x: '60px',
        x2: '100px',
        y: '60px',
        y2: '60px'
      },
      toolbox: {
        show: true,
        bottom: 0
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: []
      },
      yAxis: {
        type: 'value',
        position: 'right',
        axisLabel: {
          formatter: function (value, index) {
            return bytesToSize(value);
          }
        }
      },
      series: [
        {
          name: 'Upload',
          type: 'line',
          smooth: true,
          data: []
        }
      ]
    };
    if(data){
      if($('.box-chart-time.btn-primary').attr('id') == 'd'){
        _.each(data, function(item,index) {
          var hour = new Date(item.hour).getHours();
          if(hour < 10){
            hour = '0'+hour;
          }
          var ts = hour + ":00";
          options.xAxis.data.push(ts);
          options2.xAxis.data.push(ts);
          options.series[0].data.push((item.hour_cdn_downloaded)>=0?Math.ceil(item.hour_cdn_downloaded):0)
          options.series[1].data.push((item.hour_p2p_downloaded)>=0?Math.ceil(item.hour_p2p_downloaded):0)
          options2.series[0].data.push((item.hour_uploaded)>=0?Math.ceil(item.hour_uploaded):0)

          // totalcdn
          totalcdn += item.hour_cdn_downloaded;
          totalraid += item.hour_p2p_downloaded;
        });
      } else if($('.box-chart-time.btn-primary').attr('id') == 'm'){
        _.each(data, function(item,index) {
          var date = item.time;
          var ts = date.getFullYear()+"/"+(Number(date.getMonth())+1)+"/"+date.getDate();
          options.xAxis.data.push(ts);
          options2.xAxis.data.push(ts);
          options.series[0].data.push((item.hour_cdn_downloaded)>=0?Math.ceil(item.hour_cdn_downloaded):0)
          options.series[1].data.push((item.hour_p2p_downloaded)>=0?Math.ceil(item.hour_p2p_downloaded):0)
          options2.series[0].data.push((item.hour_uploaded)>=0?Math.ceil(item.hour_uploaded):0)

          // totalcdn
          totalcdn += item.hour_cdn_downloaded;
          totalraid += item.hour_p2p_downloaded;
        });
      } else {
        _.each(data, function(item,index) {
          var date = item.time;
          var ts = date.getHours() + ":" + date.getMinutes();
          options.xAxis.data.push(ts);
          options2.xAxis.data.push(ts);
          options.series[0].data.push((item.cdn_downloaded)>=0?Math.ceil(item.cdn_downloaded):0)
          options.series[1].data.push((item.p2p_downloaded)>=0?Math.ceil(item.p2p_downloaded):0)
          options2.series[0].data.push((item.uploaded)>=0?Math.ceil(item.uploaded):0)// totalcdn
          totalcdn += item.cdn_downloaded;
          totalraid += item.p2p_downloaded;
        });
        
      }
      options.series[2].data.push({name:'CDN',value: totalcdn});
      options.series[2].data.push({name: 'RAID', value: totalraid});
    }
    boxChart.hideLoading();
    boxChart2.hideLoading();
    boxChart.setOption(options);
    boxChart2.setOption(options2);
    boxChart.connect(boxChart2);
    boxChart2.connect(boxChart);
  });
};

Template.box.rendered = function() {
  // document.getElementById('chartTitle').innerHTML="Loading data from server"
  Session.set('noTrafficData','loading')
  var boxChartContainer = document.getElementById("chart-id-box");
  $("#chart-box-download,#chart-box-upload").css({
    width: Math.floor($(window).width()*0.75)  + 'px',
    height: Math.floor($(window).height()*0.40)  + 'px'
  });
  window.onresize = function(){
    $("#chart-box-download,#chart-box-upload").css({
      width: Math.floor($(window).width()*0.75)  + 'px',
      height: Math.floor($(window).height()*0.40)  + 'px'
    });
  }
  GetDataBox();
  if($('.box-chart-time.btn-primary').attr('id') === 'h'){
   boxDataInterval =  setInterval(GetDataBox, 60* 1000);
  }
};

Template.box.events({
  'click .box-chart-time': function(e){
    $('.box-chart-time').removeClass('btn-primary');
    $(e.currentTarget).addClass('btn-primary');
    GetDataBox();
    if($('.box-chart-time.btn-primary').attr('id') === 'h'){
      boxDataInterval = window.setInterval(GetDataBox, 60* 1000);
    } else {
      boxDataInterval = window.clearInterval(boxDataInterval);
    }
  }
});

Template.box.onDestroyed(function (){
  boxDataInterval = window.clearInterval(boxDataInterval);
});

