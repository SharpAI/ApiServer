$ docker build -t lambdazhang/raidcdn:workaipushnotification1.2.0 .

$ docker run -d --log-opt max-size=50m \
  -e SERVICE_NAME='workaiPushServer' \
  -e PRODUCTION=true \
  -e SERVICE_INDEX=0 \
  -e VIRTUAL_HOST=aipush.tiegushi.com \
  -e MONGO_URL=mongodb://workAIAdmin:weo23biHUI@aidb.tiegushi.com:27017/workai?replicaSet=workaioplog\&readPreference=primaryPreferred\&connectTimeoutMS=30000\&socketTimeoutMS=30000\&poolSize=20 \
  -e MONGO_OPLOG=mongodb://oplogger:J234sdfenvjfH@aidb.tiegushi.com:27017/local?authSource=admin \
  -d lambdazhang/raidcdn:workaihotSharePush1.2.0
