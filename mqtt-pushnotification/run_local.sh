#!/bin/bash
SERVICE_NAME='MQTT_Notification_hotshare' \
PRODUCTION='true' \
SERVICE_INDEX=0 \
DEBUG_MESSAGE=1 ALLOW_GROUP_NOTIFICATION=0 PROJECT_NAME='t' MQTT_URL='ws://tmq.tiegushi.com:80' MONGO_URL='mongodb://hotShareAdmin:aei_19056@db1.tiegushi.com:27017,db2.tiegushi.com:27017/hotShare?replicaSet=hotShare&readPreference=primaryPreferred&connectTimeoutMS=30000&socketTimeoutMS=30000&poolSize=20' node main.js
