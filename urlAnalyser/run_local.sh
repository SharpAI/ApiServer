#!/bin/bash
#HOTSHARE_WEB_HOST=http://192.168.1.73:9000 MONGO_URL=mongodb://127.0.0.1:3001/meteor npm start
MONGO_URL="mongodb://127.0.0.1:3001/meteor" HOTSHARE_WEB_HOST="http://127.0.0.1:9000" node main_cluster.js
