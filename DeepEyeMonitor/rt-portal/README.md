## build
```
$ ./build_bundle.sh
$ docker build -t lambdazhang/raidcnd:rt-portal-sharpai1017 .
$ docker push lambdazhang/raidcnd:rt-portal-sharpai1017
```

## run
```
$ docker run -d \
-e ROOT_URL="http://sharpai.monitor.tiegushi.com" \
-e VIRTUAL_HOST="sharpai.monitor.tiegushi.com" \
-e MONGO_URL=mongodb://workAIAdmin:weo23biHUI@aidb.tiegushi.com:27017/workai \
-e LISTEN_ON_REMOTE_DB=1 \
lambdazhang/raidcnd:rt-portal-sharpai1017
```
