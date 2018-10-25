function hideDeviceTipLayer(){
    $('body').removeClass('devicetip-html-body');
    localStorage.setItem('devicetipFlag', true);
    deviceStatusVar.set(false);
}

Template.deviceStatusTip.events({
    'click .devicetip-layer': function(e) {
      e.preventDefault();
      e.stopPropagation();
      hideDeviceTipLayer();
    },
    'touchstart .devicetip-layer': function(e) {
      e.preventDefault();
      e.stopPropagation();
      hideDeviceTipLayer();
    },
  });