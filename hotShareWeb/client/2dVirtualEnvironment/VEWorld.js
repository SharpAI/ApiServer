Template.VEWorld.onRendered(function() {

var color = ['#a6c84c', '#ffa022', '#46bee9'];
var series =  [
        {
            name: 'Top5',
            type: 'map',
            mapType: 'world',
            data:[],
            markPoint : {
                symbol:'emptyCircle',
                symbolSize : function (v){
                    return 10
                },
                effect : {
                    show: true,
                    shadowBlur : 0
                },
                itemStyle:{
                    normal:{
                        label:{show:false}
                    }
                },
                data : [
                    {
                        name: "China", 
                        value: [
                            28, 
                            84,
                            98
                        ]
                    }
                ]
            }
        }
    ];


var latlong = {};
latlong.KM = {'latitude':25.07197, 'longitude':102.679003}; // 102.679003,25.07197
latlong.SH = {'latitude':31.23667, 'longitude':121.477664}; // 121.477664,31.23667
latlong.LA = {'latitude':33.978945, 'longitude':-117.643241}; //-117.643241,33.978945

var mapData = [
{'code':'KM' , 'name':'昆明办公室', 'value':8, 'color':'#eea638'},
{'code':'SH' , 'name':'上海办公室', 'value':40, 'color':'#eea638'},
{'code':'LA' , 'name':'SWLAB', 'value':12, 'color':'#a7a737'}];

var max = -Infinity;
var min = Infinity;
mapData.forEach(function (itemOpt) {
    if (itemOpt.value > max) {
        max = itemOpt.value;
    }
    if (itemOpt.value < min) {
        min = itemOpt.value;
    }
});

option = {
    backgroundColor: '#404a59',
    title : {
        text: '昆明讯动科技',
        left: 'center',
        top: 'top',
        textStyle: {
            color: '#fff'
        }
    },
    tooltip : {
        trigger: 'item',
        formatter : function (params) {
            var value = (params.value + '').split(',');
            // value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,')
            //         + '.' + value[1];
            value = value[2] + '(人) 在线';
            return  params.name + ' : <br/>' + value;
        }
    },
    visualMap: {
        show: false,
        min: 0,
        max: max,
        inRange: {
            symbolSize: [10, 20]
        }
    },
    geo: {
        name: 'World Population (2010)',
        type: 'map',
        map: 'world',
        roam: true,
        zoom:1.2,
        label: {
            emphasis: {
                show: false
            }
        },
        itemStyle: {
            normal: {
                areaColor: '#323c48',
                borderColor: '#111'
            },
            emphasis: {
                areaColor: '#2a333d'
            }
        }
    },
    series : [
        {
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: mapData.map(function (itemOpt) {
                return {
                    name: itemOpt.name,
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    value: [
                        latlong[itemOpt.code].longitude,
                        latlong[itemOpt.code].latitude,
                        itemOpt.value
                    ],
                    label: {
                        emphasis: {
                            position: 'right',
                            show: true
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: itemOpt.color
                        }
                    }
                };
            })
        }
    ]
};

themap = echarts.init(document.getElementById('VEWorld'))

themap.setOption(option);
})