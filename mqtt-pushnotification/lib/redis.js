var redis = require('redis'),
    RDS_timeout = 600,
    RDS_debug = false,
    RDS_PORT = 6379,
    RDS_HOST = 'rds.tiegushi.com' || process.env.REDIS_HOST,
    RDS_PWD = process.env.REDIS_PASSWORD,
    RDS_OPTS = {},
    redisClient = null;

module.exports = RedisClient
function RedisClient(){
}
RedisClient.redisClientInit = redisClientInit;
RedisClient.redisUpdateKey= redisUpdateKey;

function redisClientInit() {
    redisClient = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS);
    var client = redisClient;

    client.auth(RDS_PWD,function(){
        console.log('lib/redis.js: authenticate success !');
    });
    client.on('connect',function(){
        console.log('lib/redis.js: connected to redis success');
    });
    client.on('ready',function(err){
        console.log('lib/redis.js: redis client ready');
    });
    client.on("error", function (err) {
        console.log('lib/redis.js: Error=' + err);
    });
}

function redisUpdateKey(key_str, cb) {
    client = redisClient;

    if(!client || client.connected == false)
        return cb && cb(0);

    client.get(key_str, function (err, reply) {
        if(reply) {
            client.ttl(key_str, function(err, ttl) {
                RDS_debug && console.log('lib/redis.js: key=' + key_str + ' TTL=' + ttl);
                if(ttl < 1) {
                    client.set(key_str, 'workaiGroupMessage', redis.print);
                    client.expire(key_str, RDS_timeout);
                    cb && cb(0);
                }
                else
                    cb && cb(ttl);
            });
        } else {
            RDS_debug && console.log('lib/redis.js: new a redis key ' + key_str);
            client.set(key_str, 'workaiGroupMessage', redis.print);
            client.expire(key_str, RDS_timeout);
            cb && cb(0);
        }
    });
}
