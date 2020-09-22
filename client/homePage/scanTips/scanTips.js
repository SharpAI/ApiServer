maskDescription = new ReactiveVar({
  maskEllipse: true,
  cx: '100%',
  cy: '0%',
  rx: '20',
  ry: '20',
  trsx: -25,
  trsy: 20,
  scantipContainerStyle: "position: absolute; top: 10px; right: 50px;",
  iconClass: 'fa fa-3x fa-hand-o-right',
  iconStyle: 'display: block;',
  spanStyle: 'display: block; position: relative; left: -10px;',
  spanContent: '点击加号'
});
currentTip = 'timeLineTab';

Template.scanTipHintTemplate.rendered = function () {
  $('body').addClass('scantip-html-body');
};

Template.scanTipHintTemplate.helpers({
  maskDesc: function() {
    return maskDescription.get();
  }
});

function hideScanTipLayer(){
  $('body').removeClass('scantip-html-body');
  showScanTipHint.set(false);
  if (currentTip == 'timeLineTab') {
    maskDescription.set({
      maskEllipse: false,
      x: '58%',
      y: '100%',
      width: '50',
      height: '50',
      trsx: 0,
      trsy: -50,
      scantipContainerStyle: "position: absolute; bottom: 0px; width: 100%; height: 150px;",
      iconClass: 'fa fa-3x fa-hand-o-down',
      iconStyle: 'display: block; position: absolute; bottom: 60px; left: 59%;',
      spanStyle: 'display: block; font-size: 18px; white-space: nowrap; position: absolute; bottom: 110px; left: 59%; transform: translateX(-50%);',
      spanContent: '点击消息查看识别动态'
    });
    currentTip = 'messageTab';
    showScanTipHint.set(true);
  }
  else if (currentTip == 'messageTab') {
    maskDescription.set({
      maskEllipse: true,
      cx: '100%',
      cy: '0%',
      rx: '20',
      ry: '20',
      trsx: -25,
      trsy: 20,
      scantipContainerStyle: "position: absolute; top: 0px; width: 100%; height: 150px;",
      iconClass: 'fa fa-3x fa-hand-o-right',
      iconStyle: 'display: block; position: absolute; right: 60px; top: 5px;',
      spanStyle: 'display: block; font-size: 18px; text-align: right; position: absolute; top: 10px; right: 120px;',
      spanContent: '点击加号'
    });
    currentTip = 'plusMark';
    showScanTipHint.set(true);
  }
  else if (currentTip == 'plusMark') {
    localStorage.setItem('scantipFlag',true);
  } 
  else if (currentTip == 'createCompanyMenu') {
    maskDescription.set({
      maskEllipse: false,
      x: '100%',
      y: '0%',
      width: '180',
      height: '40',
      trsx: -190,
      trsy: 225,
      scantipContainerStyle: "position: absolute; top: 225px; width: 100%; height: 150px;",
      iconClass: 'fa fa-3x fa-hand-o-up',
      iconStyle: 'display: block; position: absolute; top: 50px; right: 100px;',
      spanStyle: 'display: block; font-size: 18px; position: absolute; top: 5px; right: 200px;',
      spanContent: '点击此处扫码添加脸脸盒'
    });
    currentTip = 'scanFaceBox';
    showScanTipHint.set(true);
  }
  else if (currentTip == 'scanFaceBox') {
    localStorage.setItem('createCompanyFlag',true);
  }
}

Template.scanTipHintTemplate.events({
  'click .scantip-layer': function(e) {
    e.preventDefault();
    e.stopPropagation();
    hideScanTipLayer();
  },
  'touchstart .scantip-layer': function(e) {
    e.preventDefault();
    e.stopPropagation();
    hideScanTipLayer();
  },
});
