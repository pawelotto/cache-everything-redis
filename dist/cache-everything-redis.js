"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const hash = require("object-hash");
const pako = require("pako");
const CachemanRedis = require("cacheman-redis");
/**
 * Run any async function through a Redis cache.
 * Arguments of the function will be hashed as object to serve as Redis key
 *
 * Function will attempt to retrieve item from Redis based on function arguments
 * and when entry is not found it will return your original input uncached and untouched and save results in cache
 * so that second run of the same command is already cached.
 *
 * @param functionToCache Non-cached function you wish to cache with this splendid module
 * @param redisClientOpts Object of valid redisClient options. Please check Redis client documentation. Use Unix sockets if possible for top performance
 * @param ttl TimeToLive for cache entries if they are going to be saved
 * @param prefix  To avoid key collisions provide a prefix. If no prefix is specified then the cached's function name will be used as prefix
 */
function cache(functionToCache, redisClientOpts, ttl, prefix) {
    const opts = Object.assign({}, redisClientOpts, { prefix: redisClientOpts.prefix + (prefix ? prefix : functionToCache.name) + ":" });
    const cache = new CachemanRedis(opts);
    return function (...args) {
        /** Execute cached function */
        return new Promise((resolve, reject) => {
            try {
                const hasher = hash.sha1;
                const key = [...args].reduce((prev, curr) => prev + curr);
                cache.get(hasher(key), function (err, val) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err)
                            reject(err);
                        if (val) {
                            try {
                                resolve(JSON.parse(pako.inflate(val, { to: "string" })));
                            }
                            catch (err) {
                                console.error(err);
                            }
                        }
                        else {
                            try {
                                // Attempt to store item in redis cache
                                const funcRes = yield functionToCache(...args);
                                if (funcRes) {
                                    const deflated = pako.deflate(JSON.stringify(funcRes), { to: "string" });
                                    cache.set(hasher(key), deflated, ttl, function (err, res) {
                                        if (err)
                                            console.error(err);
                                        resolve(funcRes);
                                    });
                                }
                                else {
                                    resolve(funcRes);
                                }
                            }
                            catch (err) {
                                console.error(err);
                            }
                        }
                    });
                });
            }
            catch (err) {
                console.error(err);
            }
        });
    };
}
exports.cache = cache;
//# sourceMappingURL=cache-everything-redis.js.map