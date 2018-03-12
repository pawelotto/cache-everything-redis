import { ClientOpts as RedisClientOpts } from 'redis';
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
export declare function cache(functionToCache: Function, redisClientOpts: RedisClientOpts, ttl: number, prefix?: string): (...args: any[]) => Promise<{}>;
