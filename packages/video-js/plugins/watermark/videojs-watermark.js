/**
 * videojs-watermark
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
  url: undefined,
  image: undefined
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
  var img = document.createElement('img');

  div.classList.add('vjs-watermark-content');
  div.classList.add('vjs-watermark-' + options.position);
  img.src = options.image;

  // if a url is provided make the image link to that URL.
  if (options.url) {
    var a = document.createElement('a');

    a.href = options.url;
    // if the user clicks the link pause and open a new window
    a.onclick = function (e) {
      e.preventDefault();
      player.pause();
      window.open(options.url);
    };
    a.appendChild(img);
    div.appendChild(a);
  } else {
    div.appendChild(img);
  }
  videoEl.appendChild(div);
};

/**
 * Fades the watermark image.
 *
 * @function fadeWatermark
 * @param    {Object} [options={
 *                  fadeTime:
 *                  'The number of milliseconds before the inital watermark fade out'}]
 */
var fadeWatermark = function fadeWatermark(options) {
  setTimeout(function () {
    return document.getElementsByClassName('vjs-watermark-content')[0].classList.add('vjs-watermark-fade');
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
  player.addClass('vjs-watermark');

  // if there is no image set just exit
  if (!options.image) {
    return;
  }
  setupWatermark(player, options);

  // Setup watermark autofade
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
 * @function watermark
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
var watermark = function watermark(options) {
  var _this = this;

  this.ready(function () {
    onPlayerReady(_this, _videoJs2['default'].mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
_videoJs2['default'].registerPlugin('watermark', watermark);

// Include the version number.
watermark.VERSION = '2.0.0';

exports['default'] = watermark;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});