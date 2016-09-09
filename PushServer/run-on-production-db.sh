#!/bin/bash
MONGO_URL=mongodb://hotShareAdmin:aei_19056@host1.tiegushi.com:27017/hotShare MONGO_OPLOG_URL=mongodb://oplogger:PasswordForOplogger@host1.tiegushi.com:27017/local?authSource=admin meteor run --port=4000 $1
