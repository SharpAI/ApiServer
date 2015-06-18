# Meteor settings to compile app with
METEOR_SETTINGS=;
USE_SETTINGS=false;

# Local IP for deploying server for debugging
SERVER_IP=`ifconfig  | grep inet | grep -v inet6 | tail -n1 | awk '{print $2}'`;
USE_LOCAL=true;

DEBUG_MODE=true;

function usage
{
  echo "Usage: build-android.sh [args]";

  echo "";
  echo "With no arguments, 'build-android.sh' will build the meteor project";
  echo "and run a local meteor server to debug the application locally.";

  echo "";
  echo "Options:";
  echo "    -m | --meteor-settings    Use a specified meteor settings.json."
  echo "    -r | --release            Build cordova application in release mode."
  echo "    -s | --server             Use a specified (non-local) server."
}

# Parse arguments
while [ "$1" != "" ]; do
    case $1 in
        -r | --release )          shift
                                  DEBUG_MODE=false
                                  ;;
        -s | --server )           shift
                                  SERVER_IP=$1
                                  USE_LOCAL=false
                                  ;;
        -m | --meteor-settings )  shift
                                  METEOR_SETTINGS=$1
                                  USE_SETTINGS=true
                                  ;;
        -h | --help )             usage
                                  exit
    esac
    shift
done

# Move to meteor project's root directory
cd ../;

# Build meteor project with proper settings
if [ "$USE_LOCAL" = true ]; then
  if [ "$USE_SETTINGS" = true ]; then
    meteor build .build --server $SERVER_IP:3000 --mobile-settings $METEOR_SETTINGS $METEOR_OPTIONS;
  else
    meteor build .build --server $SERVER_IP:3000 $METEOR_OPTIONS;
  fi
else
  if [ "$USE_SETTINGS" = true ]; then
    meteor build .build --server $SERVER_IP --mobile-settings $METEOR_SETTINGS $METEOR_OPTIONS;
  else
    meteor build .build --server $SERVER_IP $METEOR_OPTIONS;
  fi
fi

cd "${ROOT}"
