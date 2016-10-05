(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by simba on 10/5/16.
 */


// We use cryptographically strong PRNGs (crypto.getRandomBytes() on the server,
// window.crypto.getRandomValues() in the browser) when available. If these
// PRNGs fail, we fall back to the Alea PRNG, which is not cryptographically
// strong, and we seed it with various sources such as the date, Math.random,
// and window size on the client.  When using crypto.getRandomValues(), our
// primitive is hexString(), from which we construct fraction(). When using
// window.crypto.getRandomValues() or alea, the primitive is fraction and we use
// that to construct hex string.


// see http://baagoe.org/en/wiki/Better_random_numbers_for_javascript
// for a full discussion and Alea implementation.
var Alea = function () {
    function Mash() {
        var n = 0xefc8249d;

        var mash = function(data) {
            data = data.toString();
            for (var i = 0; i < data.length; i++) {
                n += data.charCodeAt(i);
                var h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000; // 2^32
            }
            return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
        };

        mash.version = 'Mash 0.9';
        return mash;
    }

    return (function (args) {
        var s0 = 0;
        var s1 = 0;
        var s2 = 0;
        var c = 1;

        if (args.length == 0) {
            args = [+new Date];
        }
        var mash = Mash();
        s0 = mash(' ');
        s1 = mash(' ');
        s2 = mash(' ');

        for (var i = 0; i < args.length; i++) {
            s0 -= mash(args[i]);
            if (s0 < 0) {
                s0 += 1;
            }
            s1 -= mash(args[i]);
            if (s1 < 0) {
                s1 += 1;
            }
            s2 -= mash(args[i]);
            if (s2 < 0) {
                s2 += 1;
            }
        }
        mash = null;

        var random = function() {
            var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
            s0 = s1;
            s1 = s2;
            return s2 = t - (c = t | 0);
        };
        random.uint32 = function() {
            return random() * 0x100000000; // 2^32
        };
        random.fract53 = function() {
            return random() +
                (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
        };
        random.version = 'Alea 0.9';
        random.args = args;
        return random;

    } (Array.prototype.slice.call(arguments)));
};

var UNMISTAKABLE_CHARS = "23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz";
var BASE64_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "0123456789-_";

// `type` is one of `RandomGenerator.Type` as defined below.
//
// options:
// - seeds: (required, only for RandomGenerator.Type.ALEA) an array
//   whose items will be `toString`ed and used as the seed to the Alea
//   algorithm
var RandomGenerator = function (type, options) {
    var self = this;
    self.type = type;

    if (!RandomGenerator.Type[type]) {
        throw new Error("Unknown random generator type: " + type);
    }

    if (type === RandomGenerator.Type.ALEA) {
        if (!options.seeds) {
            throw new Error("No seeds were provided for Alea PRNG");
        }
        self.alea = Alea.apply(null, options.seeds);
    }
};

// Types of PRNGs supported by the `RandomGenerator` class
RandomGenerator.Type = {
    // Use Node's built-in `crypto.getRandomBytes` (cryptographically
    // secure but not seedable, runs only on the server). Reverts to
    // `crypto.getPseudoRandomBytes` in the extremely uncommon case that
    // there isn't enough entropy yet
    NODE_CRYPTO: "NODE_CRYPTO",

    // Use non-IE browser's built-in `window.crypto.getRandomValues`
    // (cryptographically secure but not seedable, runs only in the
    // browser).
    BROWSER_CRYPTO: "BROWSER_CRYPTO",

    // Use the *fast*, seedaable and not cryptographically secure
    // Alea algorithm
    ALEA: "ALEA",
};

/**
 * @name Random.fraction
 * @summary Return a number between 0 and 1, like `Math.random`.
 * @locus Anywhere
 */
RandomGenerator.prototype.fraction = function () {
    var self = this;
    if (self.type === RandomGenerator.Type.ALEA) {
        return self.alea();
    } else if (self.type === RandomGenerator.Type.NODE_CRYPTO) {
        var numerator = parseInt(self.hexString(8), 16);
        return numerator * 2.3283064365386963e-10; // 2^-32
    } else if (self.type === RandomGenerator.Type.BROWSER_CRYPTO) {
        var array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] * 2.3283064365386963e-10; // 2^-32
    } else {
        throw new Error('Unknown random generator type: ' + self.type);
    }
};

/**
 * @name Random.hexString
 * @summary Return a random string of `n` hexadecimal digits.
 * @locus Anywhere
 * @param {Number} n Length of the string
 */
RandomGenerator.prototype.hexString = function (digits) {
    var self = this;
    if (self.type === RandomGenerator.Type.NODE_CRYPTO) {
        var numBytes = Math.ceil(digits / 2);
        var bytes;
        // Try to get cryptographically strong randomness. Fall back to
        // non-cryptographically strong if not available.
        try {
            bytes = nodeCrypto.randomBytes(numBytes);
        } catch (e) {
            // XXX should re-throw any error except insufficient entropy
            bytes = nodeCrypto.pseudoRandomBytes(numBytes);
        }
        var result = bytes.toString("hex");
        // If the number of digits is odd, we'll have generated an extra 4 bits
        // of randomness, so we need to trim the last digit.
        return result.substring(0, digits);
    } else {
        return this._randomString(digits, "0123456789abcdef");
    }
};

RandomGenerator.prototype._randomString = function (charsCount,
                                                    alphabet) {
    var self = this;
    var digits = [];
    for (var i = 0; i < charsCount; i++) {
        digits[i] = self.choice(alphabet);
    }
    return digits.join("");
};

/**
 * @name Random.id
 * @summary Return a unique identifier, such as `"Jjwjg6gouWLXhMGKW"`, that is
 * likely to be unique in the whole world.
 * @locus Anywhere
 * @param {Number} [n] Optional length of the identifier in characters
 *   (defaults to 17)
 */
RandomGenerator.prototype.id = function (charsCount) {
    var self = this;
    // 17 characters is around 96 bits of entropy, which is the amount of
    // state in the Alea PRNG.
    if (charsCount === undefined)
        charsCount = 17;

    return self._randomString(charsCount, UNMISTAKABLE_CHARS);
};

/**
 * @name Random.secret
 * @summary Return a random string of printable characters with 6 bits of
 * entropy per character. Use `Random.secret` for security-critical secrets
 * that are intended for machine, rather than human, consumption.
 * @locus Anywhere
 * @param {Number} [n] Optional length of the secret string (defaults to 43
 *   characters, or 256 bits of entropy)
 */
RandomGenerator.prototype.secret = function (charsCount) {
    var self = this;
    // Default to 256 bits of entropy, or 43 characters at 6 bits per
    // character.
    if (charsCount === undefined)
        charsCount = 43;
    return self._randomString(charsCount, BASE64_CHARS);
};

/**
 * @name Random.choice
 * @summary Return a random element of the given array or string.
 * @locus Anywhere
 * @param {Array|String} arrayOrString Array or string to choose from
 */
RandomGenerator.prototype.choice = function (arrayOrString) {
    var index = Math.floor(this.fraction() * arrayOrString.length);
    if (typeof arrayOrString === "string")
        return arrayOrString.substr(index, 1);
    else
        return arrayOrString[index];
};

// instantiate RNG.  Heuristically collect entropy from various sources when a
// cryptographic PRNG isn't available.

// client sources
var height = (typeof window !== 'undefined' && window.innerHeight) ||
    (typeof document !== 'undefined'
    && document.documentElement
    && document.documentElement.clientHeight) ||
    (typeof document !== 'undefined'
    && document.body
    && document.body.clientHeight) ||
    1;

var width = (typeof window !== 'undefined' && window.innerWidth) ||
    (typeof document !== 'undefined'
    && document.documentElement
    && document.documentElement.clientWidth) ||
    (typeof document !== 'undefined'
    && document.body
    && document.body.clientWidth) ||
    1;

var agent = (typeof navigator !== 'undefined' && navigator.userAgent) || "";

function createAleaGeneratorWithGeneratedSeed() {
    return new RandomGenerator(
        RandomGenerator.Type.ALEA,
        {seeds: [new Date, height, width, agent, Math.random()]});
};


if (typeof window !== "undefined" && window.crypto &&
    window.crypto.getRandomValues) {
    Random = new RandomGenerator(RandomGenerator.Type.BROWSER_CRYPTO);
} else {
    // On IE 10 and below, there's no browser crypto API
    // available. Fall back to Alea
    //
    // XXX looks like at the moment, we use Alea in IE 11 as well,
    // which has `window.msCrypto` instead of `window.crypto`.
    Random = createAleaGeneratorWithGeneratedSeed();
}

// Create a non-cryptographically secure PRNG with a given seed (using
// the Alea algorithm)
/*Random.createWithSeeds = function (...seeds) {
    if (seeds.length === 0) {
        throw new Error("No seeds were provided");
    }
    return new RandomGenerator(RandomGenerator.Type.ALEA, {seeds: seeds});
};*/

// Used like `Random`, but much faster and not cryptographically
// secure
Random.insecure = createAleaGeneratorWithGeneratedSeed();
},{}],2:[function(require,module,exports){
/**
 * Created by simba on 10/5/16.
 */
'use strict';


/**
 * SHA-256 hash function reference implementation.
 *
 * @namespace
 */
var Sha256 = {};


/**
 * Generates SHA-256 hash of string.
 *
 * @param   {string} msg - String to be hashed
 * @returns {string} Hash of msg as hex character string
 */
Sha256.hash = function(msg) {
    // convert string to UTF-8, as SHA only deals with byte-streams
    msg = msg.utf8Encode();

    // constants [§4.2.2]
    var K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2 ];
    // initial hash value [§5.3.1]
    var H = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19 ];

    // PREPROCESSING

    msg += String.fromCharCode(0x80);  // add trailing '1' bit (+ 0's padding) to string [§5.1.1]

    // convert string msg into 512-bit/16-integer blocks arrays of ints [§5.2.1]
    var l = msg.length/4 + 2; // length (in 32-bit integers) of msg + ‘1’ + appended length
    var N = Math.ceil(l/16);  // number of 16-integer-blocks required to hold 'l' ints
    var M = new Array(N);

    for (var i=0; i<N; i++) {
        M[i] = new Array(16);
        for (var j=0; j<16; j++) {  // encode 4 chars per integer, big-endian encoding
            M[i][j] = (msg.charCodeAt(i*64+j*4)<<24) | (msg.charCodeAt(i*64+j*4+1)<<16) |
                (msg.charCodeAt(i*64+j*4+2)<<8) | (msg.charCodeAt(i*64+j*4+3));
        } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // add length (in bits) into final pair of 32-bit integers (big-endian) [§5.1.1]
    // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
    M[N-1][14] = ((msg.length-1)*8) / Math.pow(2, 32); M[N-1][14] = Math.floor(M[N-1][14]);
    M[N-1][15] = ((msg.length-1)*8) & 0xffffffff;


    // HASH COMPUTATION [§6.1.2]

    var W = new Array(64); var a, b, c, d, e, f, g, h;
    for (var i=0; i<N; i++) {

        // 1 - prepare message schedule 'W'
        for (var t=0;  t<16; t++) W[t] = M[i][t];
        for (var t=16; t<64; t++) W[t] = (Sha256.σ1(W[t-2]) + W[t-7] + Sha256.σ0(W[t-15]) + W[t-16]) & 0xffffffff;

        // 2 - initialise working variables a, b, c, d, e, f, g, h with previous hash value
        a = H[0]; b = H[1]; c = H[2]; d = H[3]; e = H[4]; f = H[5]; g = H[6]; h = H[7];

        // 3 - main loop (note 'addition modulo 2^32')
        for (var t=0; t<64; t++) {
            var T1 = h + Sha256.Σ1(e) + Sha256.Ch(e, f, g) + K[t] + W[t];
            var T2 =     Sha256.Σ0(a) + Sha256.Maj(a, b, c);
            h = g;
            g = f;
            f = e;
            e = (d + T1) & 0xffffffff;
            d = c;
            c = b;
            b = a;
            a = (T1 + T2) & 0xffffffff;
        }
        // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
        H[0] = (H[0]+a) & 0xffffffff;
        H[1] = (H[1]+b) & 0xffffffff;
        H[2] = (H[2]+c) & 0xffffffff;
        H[3] = (H[3]+d) & 0xffffffff;
        H[4] = (H[4]+e) & 0xffffffff;
        H[5] = (H[5]+f) & 0xffffffff;
        H[6] = (H[6]+g) & 0xffffffff;
        H[7] = (H[7]+h) & 0xffffffff;
    }

    return Sha256.toHexStr(H[0]) + Sha256.toHexStr(H[1]) + Sha256.toHexStr(H[2]) + Sha256.toHexStr(H[3]) +
        Sha256.toHexStr(H[4]) + Sha256.toHexStr(H[5]) + Sha256.toHexStr(H[6]) + Sha256.toHexStr(H[7]);
};


/**
 * Rotates right (circular right shift) value x by n positions [§3.2.4].
 * @private
 */
Sha256.ROTR = function(n, x) {
    return (x >>> n) | (x << (32-n));
};

/**
 * Logical functions [§4.1.2].
 * @private
 */
Sha256.Σ0  = function(x) { return Sha256.ROTR(2,  x) ^ Sha256.ROTR(13, x) ^ Sha256.ROTR(22, x); };
Sha256.Σ1  = function(x) { return Sha256.ROTR(6,  x) ^ Sha256.ROTR(11, x) ^ Sha256.ROTR(25, x); };
Sha256.σ0  = function(x) { return Sha256.ROTR(7,  x) ^ Sha256.ROTR(18, x) ^ (x>>>3);  };
Sha256.σ1  = function(x) { return Sha256.ROTR(17, x) ^ Sha256.ROTR(19, x) ^ (x>>>10); };
Sha256.Ch  = function(x, y, z) { return (x & y) ^ (~x & z); };
Sha256.Maj = function(x, y, z) { return (x & y) ^ (x & z) ^ (y & z); };


/**
 * Hexadecimal representation of a number.
 * @private
 */
Sha256.toHexStr = function(n) {
    // note can't use toString(16) as it is implementation-dependant,
    // and in IE returns signed numbers when used on full words
    var s='', v;
    for (var i=7; i>=0; i--) { v = (n>>>(i*4)) & 0xf; s += v.toString(16); }
    return s;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** Extend String object with method to encode multi-byte string to utf8
 *  - monsur.hossa.in/2012/07/20/utf-8-in-javascript.html */
if (typeof String.prototype.utf8Encode == 'undefined') {
    String.prototype.utf8Encode = function() {
        return unescape( encodeURIComponent( this ) );
    };
}

/** Extend String object with method to decode utf8 string to multi-byte */
if (typeof String.prototype.utf8Decode == 'undefined') {
    String.prototype.utf8Decode = function() {
        try {
            return decodeURIComponent( escape( this ) );
        } catch (e) {
            return this; // invalid UTF-8? return as-is
        }
    };
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = Sha256; // CommonJs export
},{}],3:[function(require,module,exports){
var appUtils = window.appUtils || {};
appUtils.ddp = require("ddp.js").default;
//window.appUtils = appUtils;

var Sha256 = require('./libs/sha256');
require('./libs/random');

var uuid = function () {
    var HEX_DIGITS = "0123456789abcdef";
    var s = [];
    for (var i = 0; i < 36; i++) {
        s[i] = Random.choice(HEX_DIGITS);
    }
    s[14] = "4";
    s[19] = HEX_DIGITS.substr((parseInt(s[19],16) & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
};

const options = {
    endpoint: ddpUrl, //"ws://localhost:5000/websocket",
    SocketConstructor: WebSocket
};
const ddp = new appUtils.ddp(options);

var method_callback = {};
window.ddp_connected = false;
window.CallMethod = function(method,param,callback){
    if(ddp){
        var methodId = ddp.method(method, param);
        method_callback[methodId] = callback;
    }
};
window.Subscribe = function(collection,param,callback){
    if(ddp){
        document.removeEventListener(collection,callback);
        if(callback){
            document.addEventListener(collection,callback,false);
        }
        if(param){
            var subId = ddp.sub(collection,param);
        } else {
            var subId = ddp.sub(collection,[]);
        }
        return subId
    }
    return -1;
};
window.SubToCol = function(subName,collection,param,callback){
    if(ddp){
        document.removeEventListener(collection,callback);
        if(callback){
            document.addEventListener(collection,callback,false);
        }
        if(param){
            var subId = ddp.sub(subName,param);
        } else {
            var subId = ddp.sub(subName,[]);
        }
        return subId
    }
    return -1;
};
window.LoginWithEmail = function(email,password,callback){
    CallMethod("login", [{
        user: {
            email: email
        },
        password: {
            digest: Sha256.hash(password),
            algorithm:"sha-256"
        }
    }],callback);
};


/*
 * Login sequence:
 * 1. Create User if not token/username saved
 * 2. Login with username if no token saved, or token expired
 * 3. Login with Token
 *
 * Protocol Buffer:
 *
 * 1. Create User: ["{\"msg\":\"method\",\"method\":\"createUser\",\"params\":[{\"username\":\"194c4aeb-1b5c-48b6-8c68-1c9a9de64004\",\"password\":{\"digest\":\"8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92\",\"algorithm\":\"sha-256\"},\"profile\":{\"fullname\":\"匿名\",\"icon\":\"/userPicture.png\",\"anonymous\":true,\"browser\":true}}],\"id\":\"1\"}"]
 * 2. Login with username: ["{\"msg\":\"method\",\"method\":\"login\",\"params\":[{\"username\":\"194c4aeb-1b5c-48b6-8c68-1c9a9de64004\",\"password\":{\"digest\":\"8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92\",\"algorithm\":\"sha-256\"}}],\"id\":\"1\"}"]
 * 3. Login with token: ["{\"msg\":\"method\",\"method\":\"login\",\"params\":[{\"resume\":\"HKCS60-5A5xVT7LbpisufeSQSG_Dl1tfK3E-10M3oRK\"}],\"id\":\"1\"}"]
 */
function createNewAutoUser(username,callback){
    CallMethod("createUser", [{
        username:username,
        password:{
            digest:"8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
            algorithm:"sha-256"},
        profile:{
            fullname:"匿名",
            icon:"/userPicture.png"
            ,anonymous:true,
            browser:true
        }
    }],callback);
}
function loginErrorHandle(callback){
    localStorage.clear('savedUsername');
    localStorage.clear('loginToken');
    localStorage.clear('loginTokenExpires');
    setTimeout(function(){
        autoLogin(callback);
    },5000);
}
function loginHandle(type,result,callback){
    console.log('type: '+type+' result:'+result)
    if(type ==='result' && result && result.token && result.tokenExpires && result.tokenExpires.$date ){
        /*
         id:"LApaRD39Ziz2EcpTm"
         token:"eXoFSIulKAjjezmQ8weQuwhqVqYhY7MFBWj02nzit-z"
         tokenExpires:{$date: 1483485599652}
         */
        console.log('login success');
        localStorage.setItem('loginToken',result.token);
        localStorage.setItem('loginTokenExpires',result.tokenExpires.$date);
        if(callback){
            callback(type,result);
        }
    } else {
        console.log('login Not Success, need retry.');
        loginErrorHandle(callback);
    }
}
window.autoLogin = function(callback){
    var loginToken = localStorage.getItem('loginToken');
    var loginTokenExpires = localStorage.getItem('loginTokenExpires');
    if(loginToken && loginToken !=='' && (loginTokenExpires - new Date())>10000){
        CallMethod("login", [{
            resume: loginToken
        }],function(type,result){
            loginHandle(type,result,callback)
        });
        return
    }
    var savedUsername = localStorage.getItem('savedUsername');
    if(savedUsername && savedUsername !== ''){
        CallMethod("login", [{
            user:{
                username:savedUsername
            },
            password: {
                digest: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
                algorithm:"sha-256"
            }
        }],function(type,result){
            loginHandle(type,result,callback)
        });
        return
    }
    var randomUsername=uuid();
    localStorage.setItem('savedUsername',randomUsername);
    createNewAutoUser(randomUsername,function(type,result){
        loginHandle(type,result,callback)
    });
};

ddp.on("connected", function(){
    console.log("Connected");
    window.ddp_connected = true;
    var event = new Event('ddpConnected');
    document.dispatchEvent(event);
});

ddp.on("result", function(message){
    if (method_callback[message.id] && typeof method_callback[message.id] === 'function' ){
        if(message.result){
            method_callback[message.id]("result",message.result);
        } else if(message.error){
            method_callback[message.id]("error",message.error);
        }
        //delete method_callback[message.id];
    }
});
ddp.on("updated", function(message){
    if (method_callback[message.id] && typeof method_callback[message.id] === 'function' ){
        method_callback[message.id]("updated",message);
        //delete method_callback[message.id];
    }
});
ddp.on("ready",function(message){
    //console.log('ready: '+ JSON.stringify( message));
    var event = new CustomEvent('subReady', { 'detail': message });
    document.dispatchEvent(event);
});
ddp.on("added", function(message){
    //console.log('collection:', JSON.stringify(message.collection));
    var event = new CustomEvent(message.collection, { 'detail': message });
    document.dispatchEvent(event);
});

ddp.on("changed", function(message){
    //console.log('collection:', JSON.stringify(message.collection));
    var event = new CustomEvent(message.collection, { 'detail': message });
    document.dispatchEvent(event);
});
ddp.on("removed", function(message){
    var event = new CustomEvent(message.collection, { 'detail': message });
    document.dispatchEvent(event);
});

},{"./libs/random":1,"./libs/sha256":2,"ddp.js":4}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _wolfy87Eventemitter = require("wolfy87-eventemitter");

var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

var _queue = require("./queue");

var _queue2 = _interopRequireDefault(_queue);

var _socket = require("./socket");

var _socket2 = _interopRequireDefault(_socket);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DDP_VERSION = "1";
var PUBLIC_EVENTS = [
// Subscription messages
"ready", "nosub", "added", "changed", "removed",
// Method messages
"result", "updated",
// Error messages
"error"];
var DEFAULT_RECONNECT_INTERVAL = 10000;

var DDP = function (_EventEmitter) {
    _inherits(DDP, _EventEmitter);

    _createClass(DDP, [{
        key: "emit",
        value: function emit() {
            var _get2;

            setTimeout((_get2 = _get(Object.getPrototypeOf(DDP.prototype), "emit", this)).bind.apply(_get2, [this].concat(Array.prototype.slice.call(arguments))), 0);
        }
    }]);

    function DDP(options) {
        _classCallCheck(this, DDP);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DDP).call(this));

        _this.status = "disconnected";

        // Default `autoConnect` and `autoReconnect` to true
        _this.autoConnect = options.autoConnect !== false;
        _this.autoReconnect = options.autoReconnect !== false;
        _this.reconnectInterval = options.reconnectInterval || DEFAULT_RECONNECT_INTERVAL;

        _this.messageQueue = new _queue2.default(function (message) {
            if (_this.status === "connected") {
                _this.socket.send(message);
                return true;
            } else {
                return false;
            }
        });

        _this.socket = new _socket2.default(options.SocketConstructor, options.endpoint);

        _this.socket.on("open", function () {
            // When the socket opens, send the `connect` message
            // to establish the DDP connection
            _this.socket.send({
                msg: "connect",
                version: DDP_VERSION,
                support: [DDP_VERSION]
            });
        });

        _this.socket.on("close", function () {
            _this.status = "disconnected";
            _this.messageQueue.empty();
            _this.emit("disconnected");
            if (_this.autoReconnect) {
                // Schedule a reconnection
                setTimeout(_this.socket.open.bind(_this.socket), _this.reconnectInterval);
            }
        });

        _this.socket.on("message:in", function (message) {
            if (message.msg === "connected") {
                _this.status = "connected";
                _this.messageQueue.process();
                _this.emit("connected");
            } else if (message.msg === "ping") {
                // Reply with a `pong` message to prevent the server from
                // closing the connection
                _this.socket.send({ msg: "pong", id: message.id });
            } else if ((0, _utils.contains)(PUBLIC_EVENTS, message.msg)) {
                _this.emit(message.msg, message);
            }
        });

        if (_this.autoConnect) {
            _this.connect();
        }

        return _this;
    }

    _createClass(DDP, [{
        key: "connect",
        value: function connect() {
            this.socket.open();
        }
    }, {
        key: "disconnect",
        value: function disconnect() {
            /*
            *   If `disconnect` is called, the caller likely doesn't want the
            *   the instance to try to auto-reconnect. Therefore we set the
            *   `autoReconnect` flag to false.
            */
            this.autoReconnect = false;
            this.socket.close();
        }
    }, {
        key: "method",
        value: function method(name, params) {
            var id = (0, _utils.uniqueId)();
            this.messageQueue.push({
                msg: "method",
                id: id,
                method: name,
                params: params
            });
            return id;
        }
    }, {
        key: "sub",
        value: function sub(name, params) {
            var id = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            id || (id = (0, _utils.uniqueId)());
            this.messageQueue.push({
                msg: "sub",
                id: id,
                name: name,
                params: params
            });
            return id;
        }
    }, {
        key: "unsub",
        value: function unsub(id) {
            this.messageQueue.push({
                msg: "unsub",
                id: id
            });
            return id;
        }
    }]);

    return DDP;
}(_wolfy87Eventemitter2.default);

exports.default = DDP;
},{"./queue":5,"./socket":6,"./utils":7,"wolfy87-eventemitter":8}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Queue = function () {

    /*
    *   As the name implies, `consumer` is the (sole) consumer of the queue.
    *   It gets called with each element of the queue and its return value
    *   serves as a ack, determining whether the element is removed or not from
    *   the queue, allowing then subsequent elements to be processed.
    */

    function Queue(consumer) {
        _classCallCheck(this, Queue);

        this.consumer = consumer;
        this.queue = [];
    }

    _createClass(Queue, [{
        key: "push",
        value: function push(element) {
            this.queue.push(element);
            this.process();
        }
    }, {
        key: "process",
        value: function process() {
            if (this.queue.length !== 0) {
                var ack = this.consumer(this.queue[0]);
                if (ack) {
                    this.queue.shift();
                    this.process();
                }
            }
        }
    }, {
        key: "empty",
        value: function empty() {
            this.queue = [];
        }
    }]);

    return Queue;
}();

exports.default = Queue;
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _wolfy87Eventemitter = require("wolfy87-eventemitter");

var _wolfy87Eventemitter2 = _interopRequireDefault(_wolfy87Eventemitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Socket = function (_EventEmitter) {
    _inherits(Socket, _EventEmitter);

    function Socket(SocketConstructor, endpoint) {
        _classCallCheck(this, Socket);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Socket).call(this));

        _this.SocketConstructor = SocketConstructor;
        _this.endpoint = endpoint;
        _this.rawSocket = null;
        return _this;
    }

    _createClass(Socket, [{
        key: "send",
        value: function send(object) {
            var message = JSON.stringify(object);
            this.rawSocket.send(message);
            // Emit a copy of the object, as the listener might mutate it.
            this.emit("message:out", JSON.parse(message));
        }
    }, {
        key: "open",
        value: function open() {
            var _this2 = this;

            /*
            *   Makes `open` a no-op if there's already a `rawSocket`. This avoids
            *   memory / socket leaks if `open` is called twice (e.g. by a user
            *   calling `ddp.connect` twice) without properly disposing of the
            *   socket connection. `rawSocket` gets automatically set to `null` only
            *   when it goes into a closed or error state. This way `rawSocket` is
            *   disposed of correctly: the socket connection is closed, and the
            *   object can be garbage collected.
            */
            if (this.rawSocket) {
                return;
            }
            this.rawSocket = new this.SocketConstructor(this.endpoint);

            /*
            *   Calls to `onopen` and `onclose` directly trigger the `open` and
            *   `close` events on the `Socket` instance.
            */
            this.rawSocket.onopen = function () {
                return _this2.emit("open");
            };
            this.rawSocket.onclose = function () {
                _this2.rawSocket = null;
                _this2.emit("close");
            };
            /*
            *   Calls to `onerror` trigger the `close` event on the `Socket`
            *   instance, and cause the `rawSocket` object to be disposed of.
            *   Since it's not clear what conditions could cause the error and if
            *   it's possible to recover from it, we prefer to always close the
            *   connection (if it isn't already) and dispose of the socket object.
            */
            this.rawSocket.onerror = function () {
                // It's not clear what the socket lifecycle is when errors occurr.
                // Hence, to avoid the `close` event to be emitted twice, before
                // manually closing the socket we de-register the `onclose`
                // callback.
                delete _this2.rawSocket.onclose;
                // Safe to perform even if the socket is already closed
                _this2.rawSocket.close();
                _this2.rawSocket = null;
                _this2.emit("close");
            };
            /*
            *   Calls to `onmessage` trigger a `message:in` event on the `Socket`
            *   instance only once the message (first parameter to `onmessage`) has
            *   been successfully parsed into a javascript object.
            */
            this.rawSocket.onmessage = function (message) {
                var object;
                try {
                    object = JSON.parse(message.data);
                } catch (ignore) {
                    // Simply ignore the malformed message and return
                    return;
                }
                // Outside the try-catch block as it must only catch JSON parsing
                // errors, not errors that may occur inside a "message:in" event
                // handler
                _this2.emit("message:in", object);
            };
        }
    }, {
        key: "close",
        value: function close() {
            /*
            *   Avoid throwing an error if `rawSocket === null`
            */
            if (this.rawSocket) {
                this.rawSocket.close();
            }
        }
    }]);

    return Socket;
}(_wolfy87Eventemitter2.default);

exports.default = Socket;
},{"wolfy87-eventemitter":8}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.uniqueId = uniqueId;
exports.contains = contains;
var i = 0;
function uniqueId() {
    return (i++).toString();
}

function contains(array, element) {
    return array.indexOf(element) !== -1;
}
},{}],8:[function(require,module,exports){
/*!
 * EventEmitter v4.2.11 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */

;(function () {
    'use strict';

    /**
     * Class for managing events.
     * Can be extended to provide event functionality in other classes.
     *
     * @class EventEmitter Manages event registering and emitting.
     */
    function EventEmitter() {}

    // Shortcuts to improve speed and size
    var proto = EventEmitter.prototype;
    var exports = this;
    var originalGlobalValue = exports.EventEmitter;

    /**
     * Finds the index of the listener for the event in its storage array.
     *
     * @param {Function[]} listeners Array of listeners to search through.
     * @param {Function} listener Method to look for.
     * @return {Number} Index of the specified listener, -1 if not found
     * @api private
     */
    function indexOfListener(listeners, listener) {
        var i = listeners.length;
        while (i--) {
            if (listeners[i].listener === listener) {
                return i;
            }
        }

        return -1;
    }

    /**
     * Alias a method while keeping the context correct, to allow for overwriting of target method.
     *
     * @param {String} name The name of the target method.
     * @return {Function} The aliased method
     * @api private
     */
    function alias(name) {
        return function aliasClosure() {
            return this[name].apply(this, arguments);
        };
    }

    /**
     * Returns the listener array for the specified event.
     * Will initialise the event object and listener arrays if required.
     * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
     * Each property in the object response is an array of listener functions.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Function[]|Object} All listener functions for the event.
     */
    proto.getListeners = function getListeners(evt) {
        var events = this._getEvents();
        var response;
        var key;

        // Return a concatenated array of all matching events if
        // the selector is a regular expression.
        if (evt instanceof RegExp) {
            response = {};
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    response[key] = events[key];
                }
            }
        }
        else {
            response = events[evt] || (events[evt] = []);
        }

        return response;
    };

    /**
     * Takes a list of listener objects and flattens it into a list of listener functions.
     *
     * @param {Object[]} listeners Raw listener objects.
     * @return {Function[]} Just the listener functions.
     */
    proto.flattenListeners = function flattenListeners(listeners) {
        var flatListeners = [];
        var i;

        for (i = 0; i < listeners.length; i += 1) {
            flatListeners.push(listeners[i].listener);
        }

        return flatListeners;
    };

    /**
     * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
     *
     * @param {String|RegExp} evt Name of the event to return the listeners from.
     * @return {Object} All listener functions for an event in an object.
     */
    proto.getListenersAsObject = function getListenersAsObject(evt) {
        var listeners = this.getListeners(evt);
        var response;

        if (listeners instanceof Array) {
            response = {};
            response[evt] = listeners;
        }

        return response || listeners;
    };

    /**
     * Adds a listener function to the specified event.
     * The listener will not be added if it is a duplicate.
     * If the listener returns true then it will be removed after it is called.
     * If you pass a regular expression as the event name then the listener will be added to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListener = function addListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var listenerIsWrapped = typeof listener === 'object';
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
                listeners[key].push(listenerIsWrapped ? listener : {
                    listener: listener,
                    once: false
                });
            }
        }

        return this;
    };

    /**
     * Alias of addListener
     */
    proto.on = alias('addListener');

    /**
     * Semi-alias of addListener. It will add a listener that will be
     * automatically removed after its first execution.
     *
     * @param {String|RegExp} evt Name of the event to attach the listener to.
     * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addOnceListener = function addOnceListener(evt, listener) {
        return this.addListener(evt, {
            listener: listener,
            once: true
        });
    };

    /**
     * Alias of addOnceListener.
     */
    proto.once = alias('addOnceListener');

    /**
     * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
     * You need to tell it what event names should be matched by a regex.
     *
     * @param {String} evt Name of the event to create.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvent = function defineEvent(evt) {
        this.getListeners(evt);
        return this;
    };

    /**
     * Uses defineEvent to define multiple events.
     *
     * @param {String[]} evts An array of event names to define.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.defineEvents = function defineEvents(evts) {
        for (var i = 0; i < evts.length; i += 1) {
            this.defineEvent(evts[i]);
        }
        return this;
    };

    /**
     * Removes a listener function from the specified event.
     * When passed a regular expression as the event name, it will remove the listener from all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to remove the listener from.
     * @param {Function} listener Method to remove from the event.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListener = function removeListener(evt, listener) {
        var listeners = this.getListenersAsObject(evt);
        var index;
        var key;

        for (key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                index = indexOfListener(listeners[key], listener);

                if (index !== -1) {
                    listeners[key].splice(index, 1);
                }
            }
        }

        return this;
    };

    /**
     * Alias of removeListener
     */
    proto.off = alias('removeListener');

    /**
     * Adds listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
     * You can also pass it a regular expression to add the array of listeners to all events that match it.
     * Yeah, this function does quite a bit. That's probably a bad thing.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.addListeners = function addListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(false, evt, listeners);
    };

    /**
     * Removes listeners in bulk using the manipulateListeners method.
     * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be removed.
     * You can also pass it a regular expression to remove the listeners from all events that match it.
     *
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeListeners = function removeListeners(evt, listeners) {
        // Pass through to manipulateListeners
        return this.manipulateListeners(true, evt, listeners);
    };

    /**
     * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
     * The first argument will determine if the listeners are removed (true) or added (false).
     * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
     * You can also pass it an event name and an array of listeners to be added/removed.
     * You can also pass it a regular expression to manipulate the listeners of all events that match it.
     *
     * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
     * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
     * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
        var i;
        var value;
        var single = remove ? this.removeListener : this.addListener;
        var multiple = remove ? this.removeListeners : this.addListeners;

        // If evt is an object then pass each of its properties to this method
        if (typeof evt === 'object' && !(evt instanceof RegExp)) {
            for (i in evt) {
                if (evt.hasOwnProperty(i) && (value = evt[i])) {
                    // Pass the single listener straight through to the singular method
                    if (typeof value === 'function') {
                        single.call(this, i, value);
                    }
                    else {
                        // Otherwise pass back to the multiple function
                        multiple.call(this, i, value);
                    }
                }
            }
        }
        else {
            // So evt must be a string
            // And listeners must be an array of listeners
            // Loop over it and pass each one to the multiple method
            i = listeners.length;
            while (i--) {
                single.call(this, evt, listeners[i]);
            }
        }

        return this;
    };

    /**
     * Removes all listeners from a specified event.
     * If you do not specify an event then all listeners will be removed.
     * That means every event will be emptied.
     * You can also pass a regex to remove all events that match it.
     *
     * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.removeEvent = function removeEvent(evt) {
        var type = typeof evt;
        var events = this._getEvents();
        var key;

        // Remove different things depending on the state of evt
        if (type === 'string') {
            // Remove all listeners for the specified event
            delete events[evt];
        }
        else if (evt instanceof RegExp) {
            // Remove all events matching the regex.
            for (key in events) {
                if (events.hasOwnProperty(key) && evt.test(key)) {
                    delete events[key];
                }
            }
        }
        else {
            // Remove all listeners in all events
            delete this._events;
        }

        return this;
    };

    /**
     * Alias of removeEvent.
     *
     * Added to mirror the node API.
     */
    proto.removeAllListeners = alias('removeEvent');

    /**
     * Emits an event of your choice.
     * When emitted, every listener attached to that event will be executed.
     * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
     * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
     * So they will not arrive within the array on the other side, they will be separate.
     * You can also pass a regular expression to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {Array} [args] Optional array of arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emitEvent = function emitEvent(evt, args) {
        var listenersMap = this.getListenersAsObject(evt);
        var listeners;
        var listener;
        var i;
        var key;
        var response;

        for (key in listenersMap) {
            if (listenersMap.hasOwnProperty(key)) {
                listeners = listenersMap[key].slice(0);
                i = listeners.length;

                while (i--) {
                    // If the listener returns true then it shall be removed from the event
                    // The function is executed either with a basic call or an apply if there is an args array
                    listener = listeners[i];

                    if (listener.once === true) {
                        this.removeListener(evt, listener.listener);
                    }

                    response = listener.listener.apply(this, args || []);

                    if (response === this._getOnceReturnValue()) {
                        this.removeListener(evt, listener.listener);
                    }
                }
            }
        }

        return this;
    };

    /**
     * Alias of emitEvent
     */
    proto.trigger = alias('emitEvent');

    /**
     * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
     * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
     *
     * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
     * @param {...*} Optional additional arguments to be passed to each listener.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.emit = function emit(evt) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(evt, args);
    };

    /**
     * Sets the current value to check against when executing listeners. If a
     * listeners return value matches the one set here then it will be removed
     * after execution. This value defaults to true.
     *
     * @param {*} value The new value to check for when executing listeners.
     * @return {Object} Current instance of EventEmitter for chaining.
     */
    proto.setOnceReturnValue = function setOnceReturnValue(value) {
        this._onceReturnValue = value;
        return this;
    };

    /**
     * Fetches the current value to check against when executing listeners. If
     * the listeners return value matches this one then it should be removed
     * automatically. It will return true by default.
     *
     * @return {*|Boolean} The current value to check for or the default, true.
     * @api private
     */
    proto._getOnceReturnValue = function _getOnceReturnValue() {
        if (this.hasOwnProperty('_onceReturnValue')) {
            return this._onceReturnValue;
        }
        else {
            return true;
        }
    };

    /**
     * Fetches the events object and creates one if required.
     *
     * @return {Object} The events storage object.
     * @api private
     */
    proto._getEvents = function _getEvents() {
        return this._events || (this._events = {});
    };

    /**
     * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
     *
     * @return {Function} Non conflicting EventEmitter class.
     */
    EventEmitter.noConflict = function noConflict() {
        exports.EventEmitter = originalGlobalValue;
        return EventEmitter;
    };

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports){
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));

},{}]},{},[3]);
