import * as hash from 'object-hash'
import * as pako from 'pako'
import * as CachemanRedis from 'cacheman-redis'
import { ClientOpts as RedisClientOpts } from 'redis'

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
export function cache(functionToCache: Function, redisClientOpts: RedisClientOpts, ttl: number, prefix?: string) {
  const opts = Object.assign({}, redisClientOpts, { prefix: redisClientOpts.prefix + (prefix ? prefix : functionToCache.name) + ":" })
  const cache = new CachemanRedis(opts)

  return function(...args) {
    /** Execute cached function */
    return new Promise((resolve, reject) => {
      try {
        const hasher = hash.sha1
        const key = [ ...args ].reduce((prev, curr) => prev + curr)
        cache.get(hasher(key), async function(err, val) {
          if (err) reject(err)
          if (val) {
            try {
              resolve(JSON.parse(pako.inflate(val, { to: "string" })))
            } catch (err) {
              console.error(err)
            }
          }
          else {
            try {
              // Attempt to store item in redis cache
              const funcRes = await functionToCache(...args)
              if (funcRes) {
                const deflated = pako.deflate(JSON.stringify(funcRes), { to: "string" })
                cache.set(hasher(key), deflated, ttl, function(err, res) {
                  if (err) console.error(err)
                  resolve(funcRes)
                })
              } else {
                resolve(funcRes)
              }
            } catch (err) {
              console.error(err)
            }
          }
        })
      } catch (err) {
        console.error(err)
      }
    })
  }
}