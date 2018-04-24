workai:
docker run --log-opt max-size=50m -e SERVICE_NAME=MQTT_Notification_Woekai -e PRODUCTION=true -e SERVICE_INDEX=0 -e DEBUG_MESSAGE=1 -e ALLOW_GROUP_NOTIFICATION=1 -e SERVER_URL=http://workaihost.tiegushi.com/ -e REDIS_PASSWORD='87302aKecatcp' -e REDIS_HOST='rds.tiegushi.com' -e MQTT_URL='ws://mq.tiegushi.com:80' -e MONGO_URL=mongodb://workAIAdmin:weo23biHUI@aidb.tiegushi.com:27017/workai?replicaSet=workaioplog\&readPreference=primaryPreferred\&connectTimeoutMS=30000\&socketTimeoutMS=30000\&poolSize=20 --restart=always --name='workai_mq_push' -t lambdazhang/raidcdn:workai-mq-push-1.0.0



gutshitie:
docker run --log-opt max-size=50m -e SERVICE_NAME=MQTT_Notification_Woekai -e PRODUCTION=true -e SERVICE_INDEX=0 --env DEBUG_MESSAGE=1 --env ALLOW_GROUP_NOTIFICATION=0 --env PROJECT_NAME='t' --env MQTT_URL='ws://tmq.tiegushi.com:80' --env MONGO_URL='mongodb://hotShareAdmin:aei_19056@db1.tiegushi.com:27017,db2.tiegushi.com:27017/hotShare?replicaSet=hotShare&readPreference=primaryPreferred&connectTimeoutMS=30000&socketTimeoutMS=30000&poolSize=20' -t --restart=always --name='hotshare_mq_push' lambdazhang/raidcdn:mq-push-1.0.6
