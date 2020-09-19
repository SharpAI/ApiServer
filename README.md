# Get started [![Build Status](https://travis-ci.org/SharpAI/ApiServer.svg?branch=master)](https://travis-ci.org/SharpAI/ApiServer)

## [Install Meteor(Offical)](https://www.meteor.com/install)
### Windows
```
choco install meteor
```
### OSX/Linux
```
curl https://install.meteor.com/ | sh
```
## Start API Server
```
git clone https://github.com/SharpAI/ApiServer
cd ApiServer
meteor run
```
## Test REST API

### Register New User
```
curl -X POST -H "Content-type: application/json" http://localhost:3000/api/v1/sign-up -d '{"username": "test11", "email": "xxxx@xxx.xx", "password": "xxxxxx"}'
{
  "success": true
}
```
### Get Token
```
curl -X POST http://localhost:3000/api/v1/login/ -d "username=test11&password=xxxxxx"
{
  "status": "success",
  "data": {
    "authToken": "mGRTZ_aNbL2EAobchvLmmlLmbn2e5EXdj8WR8DmSZw0",
    "userId": "s9pxAWqwHzLaBKP5w"
  }
}
```
### Delete Token
```
curl -X POST -H "X-Auth-Token: mGRTZ_aNbL2EAobchvLmmlLmbn2e5EXdj8WR8DmSZw0" -H "X-User-Id: s9pxAWqwHzLaBKP5w" http://localhost:3000/api/v1/logout
{
  "status": "success",
  "data": {
    "message": "You've been logged out!"
  }
}
```

# [Full API Document](API.md)
