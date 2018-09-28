```
$ ./build_bundle.sh
$ docker build -t lambdazhang/raidcdn:TimeAlbumEmail-0927 .

$ docker run --name TimeAlbumEmail \
  -e VIRTUAL_HOST=timealbumemail.tiegushi.com \
  -e SERVER_DOMAIN_NAME=timealbumemail.tiegushi.com \
  -e ROOT_URL=http://timealbumemail.tiegushi.com \
  -e MONGO_URL=mongodb://workAIAdmin:weo23biHUI@aidb.tiegushi.com:27017/workai?replicaSet=workaioplog\&readPreference=primaryPreferred\&connectTimeoutMS=30000\&socketTimeoutMS=30000\&poolSize=20 \
  --log-opt max-size=500m \
  -d lambdazhang/raidcdn:TimeAlbumEmail-0927
```
