#!/bin/bash
docker run --rm -it -e APP_SERVER=http://workaihost.tiegushi.com -e KEYSTORE_ALIAS="wifi whiteboard" -e KEYSTORE_KEYPASS=actiontec -e KEYSTORE_STOREPASS=android -v $(pwd)/keystore:/keys/keystore:ro -v $(pwd):/app -v $(pwd):/build agmangas/meteor-android-build
