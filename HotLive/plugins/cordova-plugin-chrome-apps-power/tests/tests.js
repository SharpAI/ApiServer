// Copyright (c) 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

exports.defineManualTests = function(rootEl, addButton) {
  addButton('Request "System" Keep-Awake', function() {
    chrome.power.requestKeepAwake('system');
    console.log('Requested "System" keep-awake.');
  });

  addButton('Request "Display" Keep-Awake', function() {
    chrome.power.requestKeepAwake('display');
    console.log('Requested "Display" keep-awake.');
  });

  addButton('Release Keep-Awake', function() {
    chrome.power.releaseKeepAwake();
    console.log('Released keep-awake.');
  });
};
