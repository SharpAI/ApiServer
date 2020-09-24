/**
 * videojs-titlebar
 * @version 2.0.0
 * @copyright 2017 Brooks Lyrette <brooks@dotsub.com>
 * @license Apache-2.0
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.videojsWatermark = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

// Default options for the plugin.
var defaults = {
  position: 'top-right',
  fadeTime: 3000,
  title: undefined,
  backButton: undefined,
  rightButtons: undefined
};

/**
 * Sets up the div, img and optional a tags for the plugin.
 *
 * @function setupWatermark
 * @param    {Player} player
 * @param    {Object} [options={}]
 */
var setupWatermark = function setupWatermark(player, options) {
  // Add a div and img tag
  var videoEl = player.el();
  var div = document.createElement('div');
  var title = document.createElement('h1');
  var backBtn = document.createElement('button');

  div.classList.add('vjs-titlebar-content');

  backBtn.classList.add('vjs-titlebar-back');
  backBtn.innerHTML = '<i class="fa fa-angle-left fa-fw"></i>';
  
  title.classList.add('vjs-titlebar-title');
  title.innerText = options.title;

  // back button click event
  backBtn.onclick = function (e) {
    e.preventDefault();
    player.pause();
    options.backButton.callback && options.backButton.callback(player);
  };

  div.appendChild(backBtn);
  div.appendChild(title);

  if(options.rightButtons && options.rightButtons.length > 0) {
    var buttons = document.createElement('div');
    buttons.classList.add('vjs-titlebar-rightbuttons');

    options.rightButtons.forEach( function(item) {
      var btn = document.createElement('button');
      btn.classList.add('vjs-titlebar-right-btn');
      btn.innerHTML = '<i class="'+item.icon+'"></i>';
      btn.setAttribute('title',item.title);
      btn.onclick = function(e){
        e.preventDefault();
        player.pause();
        item.callback && item.callback(player);
      }
      buttons.appendChild(btn);
    });

    div.appendChild(buttons);
  }
  videoEl.appendChild(div);
};

/**
 * Fades the titlebar image.
 *
 * @function fadeWatermark
 * @param    {Object} [options={
 *                  fadeTime:
 *                  'The number of milliseconds before the inital titlebar fade out'}]
 */
var fadeWatermark = function fadeWatermark(options) {
  setTimeout(function () {
    return document.getElementsByClassName('vjs-titlebar-content')[0].classList.add('vjs-titlebar-fade');
  }, options.fadeTime);
};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 * @param    {Object} [options={}]
 */
var onPlayerReady = function onPlayerReady(player, options) {
  player.addClass('vjs-titlebar');

  // if there is no image set just exit
  setupWatermark(player, options);

  // Setup titlebar autofade
  if (options.fadeTime === null) {
    return;
  }

  player.on('play', function () {
    return fadeWatermark(options);
  });
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function titlebar
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
var titlebar = function titlebar(options) {
  var _this = this;

  this.ready(function () {
    onPlayerReady(_this, _videoJs2['default'].mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
_videoJs2['default'].registerPlugin('titlebar', titlebar);

// Include the version number.
titlebar.VERSION = '2.0.0';

exports['default'] = titlebar;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});