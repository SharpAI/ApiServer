#!/bin/bash
rm -rf ~/build-hot-share
rm -rf .meteor/local/cordova-build
rm -rf .meteor/local/build
meteor build ~/build-hot-share --server=http://120.24.244.253
