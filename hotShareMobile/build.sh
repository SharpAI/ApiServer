#!/bin/bash
rm -rf ~/build-hot-share
rm -rf .meteor/local/cordova-build
rm -rf .meteor/local/build
rm -rf .meteor/local/bundler-cache
rm -rf .meteor/local/plugin-cache
meteor build ~/build-hot-share --server=http://host1.tiegushi.com
