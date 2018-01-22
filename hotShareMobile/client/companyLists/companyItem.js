
var options = {
  title : {
      show: false,
  },
  grid:{
      left:40,right:10,top:10,bottom:30
  },
  tooltip : {
      trigger: 'axis',
      formatter: function (params,ticket,callback) {
          var res = '时间 : ' + params[0].name;
          for (var i = 0, l = params.length; i < l; i++) {
              // res += '<br/>' + params[i].seriesName + ' : ' + getHourMinutesTime(params[i].value);
              res += '<br/>' + params[i].seriesName + ' : ' + params[i].value;
          }
          return res;
      }
  },
  color: ['#3398DB','#FF5722'],
  legend: {
      x: 'center',
      y: 'top',
      data:[]
  },
  toolbox: {
      show : false,
  },
  calculable : true,
  xAxis : [
      {
          type : 'category',
          boundaryGap : false,
          data:[]
      }
  ],
  yAxis : [
      {
          type : 'value',
          axisLabel : {
              formatter: function (value) {
                  return parseInt(value) + ' h';
              }
          }, 
          splitNumber:3
      }
  ],
  series : []
};


var fillChartData = function(group_id) {
  console.log(group_id);

  var group = SimpleChat.Groups.findOne({_id: group_id});
  var time_offset = 8;
  if (group && group.offsetTimeZone) {
    time_offset = group.offsetTimeZone;
  }

  var now = new Date();
  var displayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,  0, 0, 0, 0);

  // var date = displayDate.get();

  options.legend.data=['时间'];
  options.xAxis[0].data = [];
  options.series[0] = {
    type: 'bar',
    data:[]
  };
  options.series[1] = {
    type:'line',
    smooth:true,
    data:[]
  };

  for(var i = 0; i < 30 ; i++){
    var d = date - (i * 24 * 60 * 60 * 1000);

    var status = WorkStatus.find({group_id: group_id, date:d}).fetch();
    console.log(status)
    var counts = status.length;

    var timeLen = 0;
    status.forEach(function(item) {
      var in_time = item.in_time;
      var out_time = item.out_time;

      if(!out_time) {
        out_time = d + 12 * 60 * 60 * 1000; // TODO: time_offset
      }
      if(in_time && out_time ){
        var diff = out_time - in_time;
        timeLen += diff;
      }
    });

    if(counts > 0){
      timeLen = timeLen / counts;
    }
    
    var ts = new Date(d).parseDate('MM-DD'); // TODO: time_offset
    timeLen = timeLen / (60 * 60 * 1000);
    timeLen = timeLen.toFixed(2);
    options.xAxis[0].data.push(ts);
    options.series[0].data.push(timeLen);
    options.series[1].data.push(timeLen);
  };

  console.log(options);
  var chartLine = echarts.init(document.getElementById('lineChart-'+group_id));
  chartLine.setOption(options);
};

Template.companyItem.onRendered(function () {
  console.log(this.data)
  // initChart();
  fillChartData(this.data.group_id);
});

