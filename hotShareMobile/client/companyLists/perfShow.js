var getHourMinutesTime = function (minutes){
    return (Math.floor(minutes/60) + " h " + (minutes%60) + " min" );
}
var getHourMinutesTime2 = function (minutes){
    if(minutes > 0){
        return (minutes/60).toFixed(1)+" h";
    }
    return ''
}

// 图表 option 定义
var weeklyBarChartOption = {
    color: ['#009688'],
    backgroundColor: '#fff',
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        },
          formatter: function (params,ticket,callback) {
            var res = '日期 : ' + params[0].name
            for (var i = 0, l = params.length; i < l; i++) {
                res += '<br/>' + params[i].seriesName + ' : ' + getHourMinutesTime(params[i].value);
            }
            return res;
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '20px',
        containLabel: true,
    },
    xAxis : [
        {
            type : 'category',
            data : []
        }
    ],
    yAxis : [
        {
            type : 'value',
            axisLabel : {
              formatter: function (value) {
                  return parseInt(value/60) + ' h';
              }
          },  
          splitNumber:3
        }
    ],
    series : [
        {
            name:'平均上班时间',
            type:'bar',
            barWidth: '60%',
            data:[],
            label: {
              normal: {
                  show: true,
                  position: 'top',
                  formatter: function (params) {
                    return getHourMinutesTime2(params.data);
                  }
              }
          },
        }
    ]
};

var monthlyBarChartOption = {};
$.extend( true, monthlyBarChartOption, weeklyBarChartOption ,{
    series: [{
        barGap: 0,
        label: {
            normal: {
                show: false
            }
        }
    }]
});


// 填充最近一周周报数据
fillWeeklyData = function(){
  var group_id = Router.current().params._id;

  var dates = [];
  
  var datas = [];
  for(var i=7; i >0 ;i--){
    var now = new Date();
    now.setDate(now.getDate()-i);
    var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,0, 0, 0, 0);
    var ts = new Date(date)
    ts = ts.parseDate('MM-DD')
    dates.push(ts);
    var count = 0;
    var timeLen = 0;
    WorkStatus.find({group_id: group_id, date:date}, {sort:{date: -1}}).forEach(function(item){
      count += 1;
      var in_time = item.in_time || 0;
      var out_time = item.out_time || 0;
      var len = 0;
      if(in_time && out_time){
        len = parseInt(out_time - in_time);
      }
      if(len && len !== NaN && len > 0){
        timeLen += len;
      }
    });

    var data = 0;
    if(count > 0){
      data = parseInt(timeLen/count/1000/60);
    }
    datas.push(data);
  }

  weeklyBarChartOption.xAxis[0].data = dates;
  weeklyBarChartOption.series[0].data = datas;

  console.log(weeklyBarChartOption);
  weeklyBarChart.setOption(weeklyBarChartOption);
  weeklyBarChart.hideLoading();
}

// 填充最近一月月报数据
fillmonthlyData = function(){
  var group_id = Router.current().params._id;

  var dates = [];
  
  var datas = [];
  for(var i=30; i >0 ;i--){
    var now = new Date();
    now.setDate(now.getDate()-i);
    var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,0, 0, 0, 0);
    var ts = new Date(date)
    ts = ts.parseDate('MM-DD')
    dates.push(ts);

    var count = 0;
    var timeLen = 0;
    WorkStatus.find({group_id: group_id, date:date}, {sort:{date: -1}}).forEach(function(item){
      count += 1;
      var in_time = item.in_time || 0;
      var out_time = item.out_time || 0;
      var len = 0;
      if(in_time && out_time){
        len = parseInt(out_time - in_time);
      }
      if(len && len !== NaN  && len > 0){
        timeLen += len;
      }
    });

    var data = 0;
    if(count > 0){
      data = parseInt(timeLen/count/1000/60);
    }
    datas.push(data);
  }

  monthlyBarChartOption.xAxis[0].data = dates;
  monthlyBarChartOption.series[0].data = datas;

  console.log(monthlyBarChartOption);
  monthlyBarChart.setOption(monthlyBarChartOption);
  monthlyBarChart.hideLoading();
}

Template.perfShow.onRendered(function(){
  var chartLoadingOpt = {
    text: '加载中',
    color: '#37a7fe',
    textColor: '#37a7fe'
  };
  weeklyBarChart = echarts.init(document.getElementById('weeklyBarChart'));
  weeklyBarChart.showLoading(chartLoadingOpt);

  monthlyBarChart = echarts.init(document.getElementById('monthlyBarChart'));
  monthlyBarChart.showLoading(chartLoadingOpt);

  var group_id = Router.current().params._id;
  var dates = [];
  
  for(var i=30; i > 0 ;i--){
    var now = new Date();
    now.setDate(now.getDate()-i);
    var date = Date.UTC(now.getFullYear(),now.getMonth(), now.getDate() ,0, 0, 0, 0);
    dates.push(date);
  }
  Meteor.subscribe('groupWorkStatusHistory',group_id,dates,{
    onReady: function(){
      fillWeeklyData();
      fillmonthlyData();
    },
    onStop: function(){
      fillWeeklyData();
      fillmonthlyData();
    }
  });
  
});