#!/bin/bash

node main_cluster.js
#SERVER_IN_CN=1 isClient=1 node main_cluster.js

#Local
#SERVER_IN_CN=1 isClient=1 MONGO_URL="mongodb://127.0.0.1:3001/meteor" HOTSHARE_WEB_HOST="http://127.0.0.1:9000" node main_cluster